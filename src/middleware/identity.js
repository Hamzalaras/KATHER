import { getCachedCount } from '../utils/cache/count.js';
import { ValidationError } from '../utils/errors/index.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';

export const defineId = (countKey, ttl = DEFAULT_COUNT_TTL_SECONDS) => {
    return (req, res, next) => {
        const raw = req.params.id ?? null;

        if (raw === null) {
            res.locals.id = null;
            return next();
        }

        const parsed = Number(raw);

        if (!Number.isInteger(parsed)) {
            throw new ValidationError('Id must be an integer', 'INVALID_ID');
        }

        if (parsed < 1) {
            throw new ValidationError('Id is out of range', 'ID_OUT_OF_RANGE');
        }

        res.locals.id = parsed;
        next();
    };
};