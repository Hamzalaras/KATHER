import { ValidationError } from '../utils/errors/index.js';
import { POEM_SEARCH_QUERY_MAX_LENGTH, POEM_TYPE_MAX_LENGTH } from '../constants/validation.js';

export const definePoetId = () => {
    return (req, res, next) => {
        const raw = req.query.poetId ?? null;

        if (raw === null) {
            res.locals.poetId = null;
            return next();
        }

        const parsed = Number(raw);

        if (!Number.isInteger(parsed) || parsed < 1) {
            throw new ValidationError('Poet id must be a positive integer', 'INVALID_POET_ID');
        }

        res.locals.poetId = parsed;
        next();
    };
};

export const definePoemType = () => {
    return (req, res, next) => {
        const raw = req.query.type ?? null;

        if (raw === null) {
            res.locals.type = null;
            return next();
        }

        const value = String(raw).trim();

        if (value.length === 0 || value.length > POEM_TYPE_MAX_LENGTH) {
            throw new ValidationError(`Poem type must be between 1 and ${POEM_TYPE_MAX_LENGTH} characters`, 'INVALID_POEM_TYPE');
        }

        res.locals.type = value;
        next();
    };
};

export const defineSearchQuery = () => {
    return (req, res, next) => {
        const raw = req.query.q ?? null;

        if (raw === null) {
            res.locals.q = null;
            return next();
        }

        const value = String(raw).trim();

        if (value.length === 0 || value.length > POEM_SEARCH_QUERY_MAX_LENGTH) {
            throw new ValidationError(`Search query must be between 1 and ${POEM_SEARCH_QUERY_MAX_LENGTH} characters`, 'INVALID_SEARCH_QUERY');
        }

        res.locals.q = value;
        next();
    };
};