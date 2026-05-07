import { getCatalogCountsInfo, getCatalogInfo, getCountriesInfo, getErasInfo, getQuawafiInfo, getSeasInfo, getTopicsInfo } from '../services/catalog.services.js';
import { catalogRouteLinks } from '../utils/catalogData.js';
import { CATALOG_CACHE_CONTROL_HEADER } from '../constants/cache.js';
import { CATALOG_GROUPS } from '../constants/catalog.js';
import { RESPONSE_STATUS } from '../constants/http.js';


const setCatalogHeaders = (res) => {
    res.setHeader('Cache-Control', CATALOG_CACHE_CONTROL_HEADER);
};

const buildCollectionResponse = (collectionName, data) => ({
    status: RESPONSE_STATUS.SUCCESS,
    data,
    meta: {
        collection: collectionName,
        count: Array.isArray(data) ? data.length : 0,
    },
    links: {
        self: `${catalogRouteLinks.self}/${collectionName}`,
        collection: catalogRouteLinks.self,
    },
});

export const getCatalog = (req, res) => {
    setCatalogHeaders(res);

    return res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: getCatalogInfo(),
        meta: {
            collections: 5,
            counts: getCatalogCountsInfo(),
        },
        links: {
            self: catalogRouteLinks.self,
            eras: `${catalogRouteLinks.eras}`,
            countries: `${catalogRouteLinks.countries}`,
            quawafi: `${catalogRouteLinks.quawafi}`,
            seas: `${catalogRouteLinks.seas}`,
            topics: `${catalogRouteLinks.topics}`,
        },
    });
}

export const getEras = (req, res) => {
    setCatalogHeaders(res);
    return res.json(buildCollectionResponse(CATALOG_GROUPS.ERAS, getErasInfo()));
}

export const getCountries = (req, res) => {
    setCatalogHeaders(res);
    return res.json(buildCollectionResponse(CATALOG_GROUPS.COUNTRIES, getCountriesInfo()));
}

export const getQuawafi = (req, res) => {
    setCatalogHeaders(res);
    return res.json(buildCollectionResponse(CATALOG_GROUPS.QUAWAFI, getQuawafiInfo()));
}

export const getSeas = (req, res) => {
    setCatalogHeaders(res);
    return res.json(buildCollectionResponse(CATALOG_GROUPS.SEAS, getSeasInfo()));
}

export const getTopics = (req, res) => {
    setCatalogHeaders(res);
    return res.json(buildCollectionResponse(CATALOG_GROUPS.TOPICS, getTopicsInfo()));
}