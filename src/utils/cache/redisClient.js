import Redis from 'ioredis';
import { REDIS_DEFAULT_HOST, REDIS_DEFAULT_PORT } from '../../constants/cache.js';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || REDIS_DEFAULT_HOST,
  port: process.env.REDIS_PORT || REDIS_DEFAULT_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});

redisClient.on('error', () => {
  // just ignore it mate,
});

