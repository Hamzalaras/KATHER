import { getPoetsList as getPoetsListServices, 
         getPoetPoems as getPoetPoemsServices,
         getPoetStats as getPoetStatsServices,
         getPoetById as getPoetByIdServices,
         getRandomPoet as getRandomPoetServices,
         getPoetLines as getPoetLinesServices,
        } from '../services/poet.services.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS } from '../constants/http.js';
import { buildQuery } from '../utils/builders/buildMeta.js';
import { buildCommuneFilters, buildPoemFilters } from '../utils/builders/buildFilter.js';

export const getPoetsList = async (req, res) => {
    const { limit, offset } = res.locals;
    const filters = buildCommuneFilters(res.locals)
    const result = await getPoetsListServices({ ...filters, limit, offset });
    const nextOffset = offset + limit;
    const prevOffset = Math.max(offset - limit, 0);

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result.data,
        pagination: result.pagination,
        links: {
            self: `${req.baseUrl}${buildQuery({ ...filters, limit, offset })}`,
            next: result.pagination.has_more ? `${req.baseUrl}${buildQuery({ ...filters, limit, offset: nextOffset })}` : null,
            prev: offset > 0 ? `${req.baseUrl}${buildQuery({ ...filters, limit, offset: prevOffset })}` : null,
            random: `${req.baseUrl}/random`,
        },
        meta: {
            filters: {
                ...filters,
            },
        },
    });
};

export const getPoetById = async (req, res) => {
    const { poet_id } = res.locals;
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
            stats: `${req.baseUrl}/${poet_id}/stats`,
            random: `${req.baseUrl}/random`,
        },
    });
};

export const getPoetPoems = async (req, res) => {
    const { poet_id, offset, limit } = res.locals;
    const poemFilters = buildPoemFilters(res.locals);

    const result = await getPoetPoemsServices({ offset, limit, ...poemFilters });
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
            self: `${req.baseUrl}/${poet_id}/poems${buildQuery({ limit, offset, ...poemFilters })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${poet_id}/poems${buildQuery({ limit, offset: nextOffset, ...poemFilters })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${poet_id}/poems${buildQuery({ limit, offset: prevOffset, ...poemFilters })}` : null,
            poet: `${req.baseUrl}/${poet_id}`,
        },
        meta: {
            filters: {
                ...poemFilters
            },
        },
    });
};

export const getPoetStats = async (req, res) => {
    const { poet_id } = res.locals;
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
        },
    });
};

export const getRandomPoet = async (req, res) => {
    const filters = buildCommuneFilters(res.locals);
    const result = await getRandomPoetServices(filters);

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
            stats: `${req.baseUrl}/${result.id}/stats`,
        },
        meta: {
            filters: {
                ...filters,
            },
        },
    });
};

export const getPoetLines = async (req, res) => {
    const { poet_id, line_type, sort, q, limit, offset } = res.locals; 
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
            self: `${req.baseUrl}/${poet_id}/lines${buildQuery({ limit, offset, sort, line_type, sort, q })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${poet_id}/lines${buildQuery({ limit, offset: nextOffset, sort, line_type, sort, q })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${poet_id}/lines${buildQuery({ limit, offset: prevOffset, sort, line_type, sort, q })}` : null,
            poet: `${req.baseUrl}/${poet_id}`,
        },
        meta: {
            filters: {
                line_type, sort, q,
            },
        },
    });
};