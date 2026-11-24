import { ValidationError } from '../utils/errors/index.js';

export const defineSearchQuery = (SEARCH_QUERY_MAX_LENGTH) => {
    return (req, res, next) => {
        const raw = req.query.q;

        if (raw == null) return next();

        const value = String(raw).trim();
        if (!value.length) return next();

        if (value.length > SEARCH_QUERY_MAX_LENGTH) {
            throw new ValidationError('Search query is too long', 'SEARCH_QUERY_TOO_LONG');
        }

        res.locals.rawParams = { ...res.locals.rawParams, q: raw };
        res.locals.dbParams = { ...res.locals.dbParams, q: raw };
        next();
    };
};

export const defineSort = (SORT_MAP) => {
    return (req, res, next) => {
        const raw = req.query.sort;

        if (raw == null) return next();

        const value = String(raw).trim().toLocaleLowerCase();
        if (!SORT_MAP.has(value)) {
            throw new ValidationError('Invalid sort value', 'INVALID_SORT');
        }

        res.locals.rawParams = { ...res.locals.rawParams, sort: raw };
        res.locals.dbParams = { ...res.locals.dbParams, sort: raw };
        next();
    };
};