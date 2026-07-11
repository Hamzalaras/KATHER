import { getPoetsList as getPoetsListServices, 
         getPoetPoems as getPoetPoemsServices,
         getPoetStats as getPoetStatsServices,
         getPoetById as getPoetByIdServices,
         getRandomPoet as getRandomPoetServices,
         getPoetLines as getPoetLinesServices,
        } from '../services/poet.service.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS } from '../constants/http.js';
import { buildQuery } from '../utils/builders/buildMeta.js';
import { buildCommuneFilters, buildPoemFilters, buildCommuneRawFilters, buildPoemRawFilters } from '../utils/builders/buildFilter.js';

export const getPoetsList = async (req, res) => {
    const { limit, offset } = res.locals.dbParams;
    const dbFilters = buildCommuneFilters(res.locals.dbParams);
    const rawFilters = buildCommuneRawFilters(res.locals.rawParams);
    const result = await getPoetsListServices({ ...dbFilters, limit, offset });
    const nextOffset = offset + limit;
    const prevOffset = Math.max(offset - limit, 0);

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result.data,
        pagination: result.pagination,
        links: {
            self: `${req.baseUrl}${buildQuery({ ...rawFilters, limit, offset })}`,
            next: result.pagination.has_more ? `${req.baseUrl}${buildQuery({ ...rawFilters, limit, offset: nextOffset })}` : null,
            prev: offset > 0 ? `${req.baseUrl}${buildQuery({ ...rawFilters, limit, offset: prevOffset })}` : null,
            random: `${req.baseUrl}/random`,
        },
        meta: {
            filters: {
                ...rawFilters,
            },
        },
    });
};

export const getPoetById = async (req, res) => {
    const { poet_id } = res.locals.dbParams;
    const result = await getPoetByIdServices(poet_id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${poet_id}`,
            poems: `${req.baseUrl}/${poet_id}/poems`,
            lines: `${req.baseUrl}/${poet_id}/lines`,
            stats: `${req.baseUrl}/${poet_id}/stats`,
            random: `${req.baseUrl}/random`,
        },
    });
};

export const getPoetPoems = async (req, res) => {
    const { poet_id, offset, limit } = res.locals.dbParams;
    const poemDbFilters = buildPoemFilters(res.locals.dbParams);
    const poemRawFilters = buildPoemRawFilters(res.locals.rawParams);

    const result = await getPoetPoemsServices({ offset, limit, ...poemDbFilters });
    const nextOffset = offset + limit;
    const prevOffset = Math.max(offset - limit, 0);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        poet: result.poet,
        data: result.data,
        pagination: result.pagination,
        links: {
            self: `${req.baseUrl}/${poet_id}/poems${buildQuery({ limit, offset, ...poemRawFilters })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${poet_id}/poems${buildQuery({ limit, offset: nextOffset, ...poemRawFilters })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${poet_id}/poems${buildQuery({ limit, offset: prevOffset, ...poemRawFilters })}` : null,
            poet: `${req.baseUrl}/${poet_id}`,
        },
        meta: {
            filters: {
                ...poemRawFilters,
                poet_id: undefined,
            },
        },
    });
};

export const getPoetStats = async (req, res) => {
    const { poet_id } = res.locals.dbParams;
    const result = await getPoetStatsServices(poet_id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${poet_id}/stats`,
            poet: `${req.baseUrl}/${poet_id}`,
            poems: `${req.baseUrl}/${poet_id}/poems`,
            lines: `${req.baseUrl}/${poet_id}/lines`,
        },
    });
};

export const getRandomPoet = async (req, res) => {
    const dbFilters = buildCommuneFilters(res.locals.dbParams);
    const rawFilters = buildCommuneRawFilters(res.locals.rawParams);
    const result = await getRandomPoetServices(dbFilters);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET_NO_MATCH, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/random`,
            poet: `${req.baseUrl}/${result.id}`,
            poems: `${req.baseUrl}/${result.id}/poems`,
            lines: `${req.baseUrl}/${result.id}/lines`,
            stats: `${req.baseUrl}/${result.id}/stats`,
        },
        meta: {
            filters: {
                ...rawFilters,
            },
        },
    });
};

export const getPoetLines = async (req, res) => {
    const { poet_id, line_type, sort, q, limit, offset } = res.locals.dbParams; 
    const result = await getPoetLinesServices({ poet_id, line_type, sort, q, limit, offset });
    const nextOffset = offset + limit;
    const prevOffset = Math.max(offset - limit, 0);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        poet: result.poet,
        data: result.data,
        pagination: result.pagination,
        links: {
            self: `${req.baseUrl}/${poet_id}/lines${buildQuery({ limit, offset, sort, lineType: line_type, sort, q })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${poet_id}/lines${buildQuery({ limit, offset: nextOffset, sort, lineType: line_type, sort, q })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${poet_id}/lines${buildQuery({ limit, offset: prevOffset, sort, lineType: line_type, sort, q })}` : null,
            poet: `${req.baseUrl}/${poet_id}`,
        },
        meta: {
            filters: {
                lineType: line_type,
                sort,
                q,
            },
        },
    });
};