import eras from '../meta/eras.json' with { type: 'json' };
import countries from '../meta/countries.json' with { type: 'json' };
import quawafi from '../meta/quawafi.json' with { type: 'json' };
import seas from '../meta/seas.json' with { type: 'json' };
import topics from '../meta/topics.json' with { type: 'json' };
import poemsTypes from '../meta/poemsTypes.json' with { type: 'json' };
import { CATALOG_GROUPS } from '../constants/catalog.js';

const normalizeLookupValue = (value) => String(value).trim().toLowerCase();
const buildLookup = (collection) => {
    const lookup = new Map();

    for (const item of collection) {
        const candidateValues = [item.name_ar, item.name_en, ...(item.aliases ?? [])];

        for (const candidate of candidateValues) {
            lookup.set(normalizeLookupValue(candidate), item.name_ar);
        }
    }

    return lookup;
};

const catalogLookups = {
    [CATALOG_GROUPS.ERAS]: buildLookup(eras),
    [CATALOG_GROUPS.COUNTRIES]: buildLookup(countries),
    [CATALOG_GROUPS.QUAWAFI]: buildLookup(quawafi),
    [CATALOG_GROUPS.SEAS]: buildLookup(seas),
    [CATALOG_GROUPS.TOPICS]: buildLookup(topics),
    [CATALOG_GROUPS.POEMS_TYPES]: buildLookup(poemsTypes),
};

export const resolveCatalogValue = (groupName, rawValue) => {
    if (rawValue === null || rawValue === undefined) return null;

    const lookup = catalogLookups[groupName];
    if (!lookup) return null;

    return lookup.get(normalizeLookupValue(rawValue)) ?? null;
};
