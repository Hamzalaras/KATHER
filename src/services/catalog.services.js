import eras from '../meta/countries.json' with { type: 'json' };
import countries from '../meta/countries.json' with { type: 'json' };
import quawafi from '../meta/quawafi.json' with { type: 'json' };
import seas from '../meta/seas.json' with { type: 'json' };
import topics from '../meta/topics.json' with { type: 'json' };
import poemsTypes from '../meta/poemsTypes.json' with { type: 'json' };
import { CATALOG_GROUPS } from '../constants/catalog.js';
import { V1_RESOURCE_PATHS } from '../constants/http.js';

const catalogSources = {
    [CATALOG_GROUPS.ERAS]: eras,
    [CATALOG_GROUPS.COUNTRIES]: countries,
    [CATALOG_GROUPS.QUAWAFI]: quawafi,
    [CATALOG_GROUPS.SEAS]: seas,
    [CATALOG_GROUPS.TOPICS]: topics,
    [CATALOG_GROUPS.POEMS_TYPES]: poemsTypes,
};

export const getErasInfo = () => catalogSources[CATALOG_GROUPS.ERAS] ?? [];

export const getCountriesInfo = () => catalogSources[CATALOG_GROUPS.COUNTRIES] ?? [];

export const getQuawafiInfo = () => catalogSources[CATALOG_GROUPS.QUAWAFI] ?? [];

export const getSeasInfo = () => catalogSources[CATALOG_GROUPS.SEAS] ?? [];

export const getTopicsInfo = () => catalogSources[CATALOG_GROUPS.TOPICS] ?? [];

export const getPoemsTypesInfo = () => catalogSources[CATALOG_GROUPS.POEMS_TYPES] ?? [];

export const getCatalogInfo = () => Object.keys(catalogSources).map(source => [source, catalogSources[source] ?? []]);

export const getCatalogCountsInfo = () => Object.keys(catalogSources).map(source => [source, (catalogSources[source] ?? [])]);

export const catalogRouteLinks = {
    self: V1_RESOURCE_PATHS.CATALOG,
    eras: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.ERAS}`,
    countries: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.COUNTRIES}`,
    quawafi: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.QUAWAFI}`,
    seas: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.SEAS}`,
    topics: `${V1_RESOURCE_PATHS.CATALOG}/${CATALOG_GROUPS.TOPICS}`,
};