import { ValidationError } from '../utils/errors/index.js';
import { MAX_LIMIT } from '../constants/pagination.js';

export const defineOffset = () => {
    return (req, res, next) => {
        const raw = req.query.offset ?? null;
        if (raw === null) {
            res.locals.offset = 0;
            return next();
        }

        const parsed = Number(raw);
        if (!Number.isInteger(parsed)) {
            throw new ValidationError('Offset must be an integer', 'INVALID_OFFSET');
        }
        if (parsed < 0) {
            throw new ValidationError('Offset must be a non-negative integer', 'INVALID_OFFSET');
        }

        res.locals.offset = parsed;
        next();
    };
};



export const defineLimit = (maxLimit = MAX_LIMIT) => {
    return (req, res, next) => {
        const raw = req.query.limit ?? null;
        if (raw === null) {
            res.locals.limit = maxLimit;
            return next();
        }
        const parsed = Number(raw);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxLimit) {
            throw new ValidationError(`Limit must be between 1 and ${maxLimit}`, 'INVALID_LIMIT');
        }

        res.locals.limit = parsed;
        next();
    };
}

