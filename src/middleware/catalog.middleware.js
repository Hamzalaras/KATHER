import { resolveCatalogValue } from '../utils/catalogData.js';
import { ValidationError } from '../utils/errors/index.js';
import { CATALOG_GROUPS } from '../constants/catalog.js';
import { GENDERS, LINE_TYPE_MAX, LINE_TYPE_MIN } from '../constants/domain.js';

export const defineEra = () => {
    return (req, res, next) => {
        const raw = req.query.era ?? null;

        if (raw === null) {
            res.locals.era = null;
            return next();
        }

        const resolved = resolveCatalogValue(CATALOG_GROUPS.ERAS, raw);
        if (!resolved) {
            throw new ValidationError('Invalid era value', 'INVALID_ERA');
        }

        res.locals.era = resolved;
        next();
    }
}

export const defineCountry = () => {
    return (req, res, next) => {
        const raw = req.query.country ?? null;

        if (raw === null) {
            res.locals.country = null;
            return next();
        }

        const resolved = resolveCatalogValue(CATALOG_GROUPS.COUNTRIES, raw);
        if (!resolved) {
            throw new ValidationError('Invalid country value', 'INVALID_COUNTRY');
        }

        res.locals.country = resolved;
        next();
    }
}

export const defineTopic = () => {
    return (req, res, next) => {
        const raw = req.query.topic ?? null;

        if (raw === null) {
            res.locals.topic = null;
            return next();
        }

        const resolved = resolveCatalogValue(CATALOG_GROUPS.TOPICS, raw);
        if (!resolved) {
            throw new ValidationError('Invalid topic value', 'INVALID_TOPIC');
        }

        res.locals.topic = resolved;
        next();
    }
}

export const defineQuafia = () => {
    return (req, res, next) => {
        const raw = req.query.quafia ?? null;

        if (raw === null) {
            res.locals.quafia = null;
            return next();
        }

        const resolved = resolveCatalogValue(CATALOG_GROUPS.QUAWAFI, raw);
        if (!resolved) {
            throw new ValidationError('Invalid quafia value', 'INVALID_QUAFIA');
        }

        res.locals.quafia = resolved;
        next();
    }   
}

export const defineSea = () => {
    return (req, res, next) => {
        const raw = req.query.sea ?? null;

        if (raw === null) {
            res.locals.sea = null;
            return next();
        }
        const resolved = resolveCatalogValue(CATALOG_GROUPS.SEAS, raw);
        if (!resolved) {
            throw new ValidationError('Invalid sea value', 'INVALID_SEA');
        }

        res.locals.sea = resolved;
        next();
    }
}

export const defineGender = () => {
    return (req, res, next) => {
        const raw = req.query.gender ?? null;

        if (raw === null) {
            res.locals.gender = null;
            return next();
        }

        if (!GENDERS.includes(raw)) {
            throw new ValidationError('Invalid gender value', 'INVALID_GENDER');
        }

        res.locals.gender = raw;
        next();
    }
}


export const defineLineType = () => {
    return (req, res, next) => {
        const raw = req.query.lineType ?? null;

        if (raw === null) {
            res.locals.lineType = null;
            return next();
        }
        const parsed = Number(raw);
        if (!Number.isInteger(parsed) || parsed < LINE_TYPE_MIN || parsed > LINE_TYPE_MAX) {
            throw new ValidationError('Invalid line type value', 'INVALID_LINE_TYPE');
        }

        res.locals.lineType = parsed;
        next();
    }
}