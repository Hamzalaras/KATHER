import eras from '../meta/eras.json' with { type: 'json' };
import countries from '../meta/countries.json' with { type: 'json' };
import quawafi from '../meta/quawafi.json' with { type: 'json' };
import seas from '../meta/seas.json' with { type: 'json' };
import topics from '../meta/topics.json' with { type: 'json' };
import { CATALOG_GROUPS } from '../constants/catalog.js';
import { V1_RESOURCE_PATHS } from '../constants/http.js';

const catalogSources = {
    [CATALOG_GROUPS.ERAS]: eras,
    [CATALOG_GROUPS.COUNTRIES]: countries,
    [CATALOG_GROUPS.QUAWAFI]: quawafi,
    [CATALOG_GROUPS.SEAS]: seas,
    [CATALOG_GROUPS.TOPICS]: topics,
};

const normalizeLookupValue = (value) => String(value).trim().toLowerCase();

const stripInternalValue = ({ value, ...publicItem }) => publicItem;

const buildLookup = (collection) => {
    const lookup = new Map();

    for (const item of collection) {
        const candidateValues = [item.id, item.value, item.labelAr, ...(item.aliases ?? [])];

        for (const candidate of candidateValues) {
            lookup.set(normalizeLookupValue(candidate), item.value);
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
};

export const catalogRouteLinks = {
    self: V1_RESOURCE_PATHS.CATALOG,
    eras: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.ERAS}`,
    countries: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.COUNTRIES}`,
    quawafi: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.QUAWAFI}`,
    seas: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.SEAS}`,
    topics: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.TOPICS}`,
};

export const getCatalogGroup = (groupName) => (catalogSources[groupName] ?? []).map(stripInternalValue);

export const getCatalogCollection = () => Object.fromEntries(
    Object.keys(catalogSources).map(s => [s, getCatalogGroup(s)])
);



export const getCatalogCounts = () => Object.fromEntries(
    Object.keys(catalogSources).map(s => [s, catalogSources[s].length])
);

export const resolveCatalogValue = (groupName, rawValue) => {
    if (rawValue === null || rawValue === undefined) return null;

    const lookup = catalogLookups[groupName];
    if (!lookup) return null;

    return lookup.get(normalizeLookupValue(rawValue)) ?? null;
};
