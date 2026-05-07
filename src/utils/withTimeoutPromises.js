
import { HEALTHCHECK_TIMEOUT_MS } from '../constants/system.js';

export const withTimeout = async (promise, timeoutMs = HEALTHCHECK_TIMEOUT_MS) => {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
};