import { ValidationError } from '../utils/errors/index.js';

export const defineMeta = () => {
    return (req, res, next) => {
        const meta = req.query.meta ?? null;

        if (meta === null) {
            res.locals.meta = null;
            return next();
        }

        if (meta.toLowerCase() !== 'full') {
            throw new ValidationError('Invalid meta value', 'INVALID_META');
        }

        res.locals.meta = 'full';
        next();
    }
};

export const defineSearchQuery = (SEARCH_QUERY_MAX_LENGTH) => {
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

        if (value.length > SEARCH_QUERY_MAX_LENGTH) {
            throw new ValidationError('Search query is too long', 'SEARCH_QUERY_TOO_LONG');
        }

        res.locals.q = value;
        next();
    };
};

export const defineSort = (SORT_MAP) => {
    return (req, res, next) => {
        const raw = req.query.sort ?? null;

        if (raw === null) {
            res.locals.sort = null;
            return next();
        }

        if (!SORT_MAP.has(raw)) {
            throw new ValidationError('Invalid sort value', 'INVALID_SORT');
        }

        res.locals.sort = raw;
        next();
    };
};