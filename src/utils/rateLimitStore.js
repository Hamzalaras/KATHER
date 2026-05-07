import { MemoryStore } from 'express-rate-limit';

const DEFAULT_PREFIX = 'rate-limit';
const INCREMENT_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return { current, ttl }
`;

export class RedisBackedRateLimitStore {
  constructor(redisClient, { prefix = DEFAULT_PREFIX } = {}) {
    this.redisClient = redisClient;
    this.prefix = prefix;
    this.windowMs = 0;
    this.fallbackStore = new MemoryStore();
    this.usingFallbackStore = false;
    this.warnedOnce = false;
  }

  init(options) {
    this.windowMs = options.windowMs;
    this.fallbackStore.init(options);
  }

  async increment(key) {
    if (this.usingFallbackStore) {
      return this.fallbackStore.increment(key);
    }

    try {
      const [totalHits, ttlMs] = await this.redisClient.eval(
        INCREMENT_SCRIPT,
        1,
        this.getRedisKey(key),
        String(this.windowMs),
      );

      const remainingTtlMs = Number(ttlMs);
      return {
        totalHits: Number(totalHits),
        resetTime: remainingTtlMs > 0 ? new Date(Date.now() + remainingTtlMs) : undefined,
      };
    } catch (error) {
      this.switchToFallback(error);
      return this.fallbackStore.increment(key);
    }
  }

  async decrement(key) {
    if (this.usingFallbackStore) {
      return this.fallbackStore.decrement(key);
    }

    try {
      await this.redisClient.decr(this.getRedisKey(key));
    } catch (error) {
      this.switchToFallback(error);
      return this.fallbackStore.decrement(key);
    }
  }

  async resetKey(key) {
    if (this.usingFallbackStore) {
      return this.fallbackStore.resetKey(key);
    }

    try {
      await this.redisClient.del(this.getRedisKey(key));
    } catch (error) {
      this.switchToFallback(error);
      return this.fallbackStore.resetKey(key);
    }
  }

  async resetAll() {
    if (this.usingFallbackStore) {
      return this.fallbackStore.resetAll();
    }

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', `${this.prefix}:*`, 'COUNT', 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.switchToFallback(error);
      return this.fallbackStore.resetAll();
    }
  }

  getRedisKey(key) {
    return `${this.prefix}:${key}`;
  }

  switchToFallback(error) {
    if (!this.warnedOnce) {
      this.warnedOnce = true;
      console.warn('Redis-backed rate limiting is unavailable; falling back to in-memory limits.', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.usingFallbackStore = true;
  }
}