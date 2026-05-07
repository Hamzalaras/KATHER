import { redisClient } from './redisClient.js';
import { prismaClient } from '../../database/prismaClient.js';
import { ValidationError } from '../errors/index.js';
import { cacheHits, cacheMisses } from '../../services/metrics.service.js';
import stringify from 'fast-stable-stringify';
import { DEFAULT_COUNT_TTL_SECONDS } from '../../constants/cache.js';
import { ENTITY_KEYS } from '../../constants/domain.js';

const VALID_TABLES = new Set([ENTITY_KEYS.POETS, ENTITY_KEYS.POEMS, ENTITY_KEYS.POEMS_LINES]);

const inFlight = new Map();

export const getCachedCount = async (table, ttl = DEFAULT_COUNT_TTL_SECONDS, where = {}) => {
    if (!VALID_TABLES.has(table)) {
        throw new ValidationError(`Invalid count table: ${table}`, {
            errorCode: 'INVALID_COUNT_TABLE',
        });
    }

    const key = `count:${table}:${stringify(where)}`;

    try {
        const cached = await redisClient.get(key);
        if (cached !== null) {
            cacheHits.inc({ cache: table });
            return parseInt(cached, 10);
        }
        cacheMisses.inc({ cache: table });
    } catch (err) {
        cacheMisses.inc({ cache: table });
    }

    if (inFlight.has(key)) {
        return inFlight.get(key);
    }

    const dbQuery = prismaClient[table]
        .count({ where })
        .then(async (count) => {
            try {
                await redisClient.set(key, count, 'EX', ttl);
            } catch (err) {
                // Cache writes are best-effort; the DB result is still returned.
            }
            return count;
        })
        .finally(() => {
            inFlight.delete(key);
        });

    inFlight.set(key, dbQuery);
    return dbQuery;
};