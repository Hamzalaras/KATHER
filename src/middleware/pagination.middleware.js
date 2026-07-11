import { ValidationError } from '../utils/errors/index.js';
import { MAX_LIMIT } from '../constants/pagination.js';

export const defineOffset = () => {
    return (req, res, next) => {
        const raw = req.query.offset;
        if (raw == null) {
            res.locals.rawParams = { ...res.locals.rawParams, offset: 0 };
            res.locals.dbParams = { ...res.locals.dbParams, offset: 0 };
            return next();
        }

        const parsed = Number(raw);
        if (!Number.isInteger(parsed)) {
            throw new ValidationError('Offset must be an integer', 'INVALID_OFFSET');
        }
        if (parsed < 0) {
            throw new ValidationError('Offset must be a non-negative integer', 'INVALID_OFFSET');
        }

        res.locals.rawParams = { ...res.locals.rawParams, offset: parsed };
        res.locals.dbParams = { ...res.locals.dbParams, offset: parsed };
        next();
    };
};



export const defineLimit = (maxLimit = MAX_LIMIT) => {
    return (req, res, next) => {
        const raw = req.query.limit;
        
        if (raw == null) {
            res.locals.rawParams = { ...res.locals.rawParams, limit: maxLimit };
            res.locals.dbParams = { ...res.locals.dbParams, limit: maxLimit };
            return next();
        }

        const parsed = Number(raw);
        if (!Number.isInteger(parsed)) {
            throw new ValidationError('Limit must be an integer', 'INVALID_LIMIT');
        }

        if (parsed < 1 || parsed > maxLimit) {
            throw new ValidationError('Limit is out of range', 'LIMIT_OUT_OF_RANGE');
        }

        res.locals.rawParams = { ...res.locals.rawParams, limit: parsed };
        res.locals.dbParams = { ...res.locals.dbParams, limit: parsed };
        next();
    };
};

