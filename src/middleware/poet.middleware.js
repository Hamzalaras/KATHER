import { ValidationError } from '../utils/errors/index.js';
import { POET_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';

export const defineSearchQuery = () => {
    return (req, res, next) => {
        const raw = req.query.q ?? null;

        if (raw === null) {
            res.locals.q = null;
            return next();
        }

        const value = String(raw).trim();

        if (value.length === 0) {
            res.locals.q = null;
            return next();
        }

        if (value.length > POET_SEARCH_QUERY_MAX_LENGTH) {
            throw new ValidationError('Search query is too long', 'SEARCH_QUERY_TOO_LONG');
        }

        res.locals.q = value;
        next();
    };
};

export const defineSort = () => {
    return (req, res, next) => {
        const raw = req.query.sort ?? null;

        if (raw === null) {
            res.locals.sort = 'name';
            return next();
        }

        const allowed = new Set([
            'name', '-name',
            'arab_name', '-arab_name',
            'created_at', '-created_at',
            'id', '-id',
        ]);

        if (!allowed.has(raw)) {
            throw new ValidationError('Invalid sort value', 'INVALID_SORT');
        }

        res.locals.sort = raw;
        next();
    };
};