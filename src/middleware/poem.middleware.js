import { ValidationError } from '../utils/errors/index.js';
import { POEM_TYPE_MAX_LENGTH } from '../constants/validation.js';

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