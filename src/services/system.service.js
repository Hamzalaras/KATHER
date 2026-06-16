import { withTimeout } from '../utils/withTimeoutPromises.js';
import { prismaClient } from '../database/prismaClient.js';
import { redisClient } from '../utils/cache/redisClient.js';
import { HEALTHCHECK_TIMEOUT_MS } from '../constants/system.js';



const checkDatabase = async () => {
    const startedAt = Date.now();
    await withTimeout(prismaClient.$queryRaw`SELECT 1`, HEALTHCHECK_TIMEOUT_MS);
    return { status: 'ok', latencyMs: Date.now() - startedAt };
};

const checkRedis = async () => {
    const startedAt = Date.now();
    await withTimeout(redisClient.ping(), HEALTHCHECK_TIMEOUT_MS);
    return { status: 'ok', latencyMs: Date.now() - startedAt };
};



export const getReadinessStatus = async () => {
    const checks = {
        database: { status: 'unknown' },
        redis: { status: 'unknown' },
    };

    let httpStatus = 200;

    try {
        checks.database = await checkDatabase();
    } catch (err) {
        checks.database = { status: 'down', error: err.message };
        httpStatus = 503;
    }

    try {
        checks.redis = await checkRedis();
    } catch (err) {
        checks.redis = { status: 'down', error: err.message };
        httpStatus = 503;
    }

    return { httpStatus, checks };
};