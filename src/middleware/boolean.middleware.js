import { SET_VALUES, UNSET_VALUES } from '../constants/domain.js';
import { ValidationError } from '../utils/errors/ApiError.js';

export const defineBoolean = ({ QUERY_KEY, LOCAL_KEY, ERROR_KEY }) => {
    return (req, res, next) => {
        const raw = req.query[QUERY_KEY];

        if (raw == null) return next();

        const parsed = String(raw).trim().toLowerCase();

        if (UNSET_VALUES.has(parsed)) {
            res.locals.rawParams = { ...res.locals.rawParams, [QUERY_KEY]: null };
            res.locals.dbParams = { ...res.locals.dbParams, [LOCAL_KEY]: null };
            return next();
        }

        if (!SET_VALUES.has(parsed)) {
            throw new ValidationError(`Invalid ${QUERY_KEY} value`, `INVALID_${ERROR_KEY}`);
        }

        res.locals.rawParams = { ...res.locals.rawParams, [QUERY_KEY]: parsed };
        res.locals.dbParams = { ...res.locals.dbParams, [LOCAL_KEY]: parsed };
        next();
    };
};