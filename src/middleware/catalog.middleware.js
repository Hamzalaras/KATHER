import { resolveCatalogValue } from '../utils/catalogData.js';
import { ValidationError } from '../utils/errors/index.js';
import { CATALOG_GROUPS } from '../constants/catalog.js';
import { GENDERS, LINE_TYPE_VALUES, UNSET_VALUES } from '../constants/domain.js';

const createCatalogMiddleware = (queryKey, catalogGroup, errorKey) => {
    return () => (req, res, next) => {
        const raw = req.query[queryKey];

        if (raw == null) return next();

        const value = String(raw).trim().toLowerCase();
        if (UNSET_VALUES.has(value)) {
            res.locals[queryKey] = null;
            return next();
        }

        const resolved = resolveCatalogValue(catalogGroup, raw);
        if (!resolved) {
            throw new ValidationError(`Invalid ${queryKey} value`, `INVALID_${errorKey}`);
        }

        res.locals[queryKey] = resolved;
        next();
    };
};

export const defineEra = createCatalogMiddleware('era', CATALOG_GROUPS.ERAS, 'ERA');
export const defineCountry = createCatalogMiddleware('country', CATALOG_GROUPS.COUNTRIES, 'COUNTRY');
export const defineTopic = createCatalogMiddleware('topic', CATALOG_GROUPS.TOPICS, 'TOPIC');
export const defineQuafia = createCatalogMiddleware('quafia', CATALOG_GROUPS.QUAWAFI, 'QUAFIA');
export const defineSea = createCatalogMiddleware('sea', CATALOG_GROUPS.SEAS, 'SEA');
export const definePoemType = createCatalogMiddleware('type',  CATALOG_GROUPS.POEMS_TYPES, 'POEM_TYPE');


export const defineGender = () => {
    return (req, res, next) => {
        const raw = req.query.gender;

        if (raw == null) return next();

        const value = String(raw).trim().toLowerCase();
        if (UNSET_VALUES.has(value)) { 
            res.locals.gender = null;
            return next();
        }

        if (!GENDERS.has(value)) {
            throw new ValidationError('Invalid gender value', 'INVALID_GENDER');
        }

        res.locals.gender = value;
        next();
    };
};

export const defineLineType = () => {
    return (req, res, next) => {
        const raw = req.query.lineType;

        if (raw == null) return next();

        const parsed = Number(raw);
        if (!Number.isInteger(parsed)) {
            throw new ValidationError('Line type must be an integer', 'INVALID_LINE_TYPE');
        }

        if (!LINE_TYPE_VALUES.has(parsed)) {
            throw new ValidationError('Invalid line type value', 'INVALID_LINE_TYPE_VALUE');
        }

        res.locals.lineType = parsed;
        next();
    };
};