import { ValidationError } from '../utils/errors/index.js';

export const defineId = (queryKey, localsKey, required = false) => {
    return (req, res, next) => {
        const raw = required ? req.params.id : req.query[queryKey];
        
        if (raw == null) {
            if (required) throw new ValidationError('Id must be specified', 'ABSENT_ID');
            else return next();
        }

        const parsed = Number(raw);

        if (!Number.isInteger(parsed)) {
            throw new ValidationError('Id must be an integer', 'INVALID_ID');
        }

        if (parsed < 1) {
            throw new ValidationError('Id is out of range', 'ID_OUT_OF_RANGE');
        }

        res.locals.rawParams = { ...res.locals.rawParams, [queryKey]: parsed };
        res.locals.dbParams = { ...res.locals.dbParams, [localsKey]: parsed };
        next();
    };
};