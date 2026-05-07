
import { ValidationError } from '../utils/errors/index.js';

export const defineMeta = () => (req, res, next) => {
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
};