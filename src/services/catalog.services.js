import { getCatalogCollection, getCatalogCounts, getCatalogGroup } from '../utils/catalogData.js';
import { CATALOG_GROUPS } from '../constants/catalog.js';


export const getErasInfo = () => {
    return getCatalogGroup(CATALOG_GROUPS.ERAS);
}

export const getCountriesInfo = () => {
    return getCatalogGroup(CATALOG_GROUPS.COUNTRIES);
}

export const getQuawafiInfo = () => {
    return getCatalogGroup(CATALOG_GROUPS.QUAWAFI);
}

export const getSeasInfo = () => {
    return getCatalogGroup(CATALOG_GROUPS.SEAS);
}

export const getTopicsInfo = () => {
    return getCatalogGroup(CATALOG_GROUPS.TOPICS);
}

export const getCatalogInfo = () => {
    return getCatalogCollection();
}

export const getCatalogCountsInfo = () => {
    return getCatalogCounts();
}

