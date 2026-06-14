import { getPoetsList as getPoetsListServices, 
         getPoetPoems as getPoetPoemsServices,
         getPoetStats as getPoetStatsServices,
         getPoetById as getPoetByIdServices,
         getRandomPoet as getRandomPoetServices,
        } from '../services/poet.services.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS } from '../constants/http.js';
import { buildQuery, buildCommuneFilters } from '../utils/builders.js';

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
    const { id } = res.locals;
    const result = await getPoetByIdServices(id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${id}`,
            poems: `${req.baseUrl}/${id}/poems`,
            stats: `${req.baseUrl}/${id}/stats`,
            random: `${req.baseUrl}/random`,
        },
    });
};

export const getPoetPoems = async (req, res) => {
    const { id, offset, limit, sort } = res.locals;
    const result = await getPoetPoemsServices({ poet_id: id, offset, limit, sort });
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
            self: `${req.baseUrl}/${id}/poems${buildQuery({ limit, offset, sort })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${id}/poems${buildQuery({ limit, offset: nextOffset, sort })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${id}/poems${buildQuery({ limit, offset: prevOffset, sort })}` : null,
            poet: `${req.baseUrl}/${id}`,
        },
        filters: {
            sort,
        },
    });
};

export const getPoetStats = async (req, res) => {
    const { id } = res.locals;
    const result = await getPoetStatsServices(id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POET, ERROR_CODES.POET_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${id}/stats`,
            poet: `${req.baseUrl}/${id}`,
            poems: `${req.baseUrl}/${id}/poems`,
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