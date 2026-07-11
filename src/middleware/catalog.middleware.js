import { resolveCatalogValue } from '../utils/catalogData.js';
import { ValidationError } from '../utils/errors/index.js';
import { CATALOG_GROUPS } from '../constants/catalog.js';
import { GENDERS, LINE_TYPE_VALUES, UNSET_VALUES } from '../constants/domain.js';

const createCatalogMiddleware = (queryKey, localsKey, catalogGroup, errorKey) => {
    return () => (req, res, next) => {
        const raw = req.query[queryKey];

        if (raw == null) return next();

        const value = String(raw).trim().toLowerCase();
        if (UNSET_VALUES.has(value)) {
            res.locals.rawParams = { ...res.locals.rawParams, [queryKey]: null };
            res.locals.dbParams = { ...res.locals.dbParams, [localsKey]: null };
            return next();
        }

        const resolved = resolveCatalogValue(catalogGroup, raw);
        if (!resolved) {
            throw new ValidationError(`Invalid ${queryKey} value`, `INVALID_${errorKey}`);
        }

        res.locals.rawParams = { ...res.locals.rawParams, [queryKey]: resolved };
        res.locals.dbParams = { ...res.locals.dbParams, [localsKey]: resolved };
        next();
    };
};

export const defineEra = createCatalogMiddleware('era', 'era_id', CATALOG_GROUPS.ERAS, 'ERA');
export const defineCountry = createCatalogMiddleware('country', 'country_id', CATALOG_GROUPS.COUNTRIES, 'COUNTRY');
export const defineTopic = createCatalogMiddleware('topic', 'topic_id', CATALOG_GROUPS.TOPICS, 'TOPIC');
export const defineQuafia = createCatalogMiddleware('quafia', 'quafia_id',CATALOG_GROUPS.QUAWAFI, 'QUAFIA');
export const defineSea = createCatalogMiddleware('sea', 'sea_id', CATALOG_GROUPS.SEAS, 'SEA');
export const definePoemType = createCatalogMiddleware('poemType', 'poem_type_id', CATALOG_GROUPS.POEMS_TYPES, 'POEM_TYPE');


export const defineGender = () => {
    return (req, res, next) => {
        const raw = req.query.gender;

        if (raw == null) return next();

        const value = String(raw).trim().toLowerCase();
        if (UNSET_VALUES.has(value)) { 
            res.locals.rawParams = { ...res.locals.rawParams, gender: null };
            res.locals.dbParams = { ...res.locals.dbParams, gender: null };
            return next();
        }

        if (!GENDERS.has(value)) {
            throw new ValidationError('Invalid gender value', 'INVALID_GENDER');
        }

        res.locals.rawParams = { ...res.locals.rawParams, gender: value };
        res.locals.dbParams = { ...res.locals.dbParams, gender: value };
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

        res.locals.rawParams = { ...res.locals.rawParams, lineType: parsed };
        res.locals.dbParams = { ...res.locals.dbParams, line_type: parsed };
        next();
    };
};