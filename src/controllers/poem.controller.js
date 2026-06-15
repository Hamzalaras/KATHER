import {
    getPoemsList as getPoemListServices,
    getPoemWithLines,
    getPoemContext as getPoemContextServices,
    getRandomPoem as getRandomPoemServices,
} from '../services/poem.services.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS, V1_RESOURCE_PATHS } from '../constants/http.js';
import { buildQuery } from '../utils/builders/buildMeta.js';
import { buildPoemFilters, buildLineFilters } from '../utils/builders/buildFilter.js';

export const getPoemList = async (req, res) => {
    const { limit, offset } = res.locals;
    const filters = buildPoemFilters(res.locals);
    const result = await getPoemListServices({ ...filters, limit, offset });
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
            random: `${req.baseUrl}/random${buildQuery(filters)}`,
        },
        meta: {
            filters: {
                ...filters,
            },
        },
    });
};

export const getPoemById = async (req, res) => {
    const { poem_id, limit, offset } = res.locals;
    const lineFilters = buildLineFilters(res.locals);
    const result = await getPoemWithLines({ limit, offset, ...lineFilters });

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POEM, ERROR_CODES.POEM_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: {
            poem: result.poem,
            lines: result.lines,
            pagination: result.pagination,
        },
        links: {
            self: `${req.baseUrl}/${poem_id}${buildQuery({ limit, offset, ...lineFilters })}`,
            lines: `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset, ...lineFilters })}`,
            context: `${req.baseUrl}/${poem_id}/context`,
            random: `${req.baseUrl}/random`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet_id}`,
        },
        meta: {
            filters: {
                ...lineFilters,
            },
        },
    });
};

export const getPoemLines = async (req, res) => {
    const { poem_id, limit, offset } = res.locals;    
    const lineFilters = buildLineFilters(res.locals);
    const result = await getPoemWithLines({ limit, offset, ...lineFilters });
    const nextOffset = offset + limit;
    const prevOffset = Math.max(offset - limit, 0);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POEM, ERROR_CODES.POEM_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        poem: result.poem,
        data: result.lines,
        pagination: result.pagination,
        links: {
            self: `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset, ...lineFilters })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset: nextOffset, ...lineFilters })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset: prevOffset, ...lineFilters })}` : null,
            poem: `${req.baseUrl}/${poem_id}`,
            context: `${req.baseUrl}/${poem_id}/context`,
        },
        meta: {
            filters: {
                ...lineFilters,
            },
        },
    });
};

export const getPoemContext = async (req, res) => {
    const { poem_id } = res.locals;
    const result = await getPoemContextServices(poem_id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POEM, ERROR_CODES.POEM_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${poem_id}/context`,
            poem: `${req.baseUrl}/${poem_id}`,
            lines: `${req.baseUrl}/${poem_id}/lines`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poet.id}`,
            random: `${req.baseUrl}/random`,
        },
    });
};

export const getRandomPoem = async (req, res) => {
    const { limit } = res.locals;
    const filters = buildPoemFilters(res.locals);
    const result = await getRandomPoemServices({ ...filters, limit });

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POEM_NO_MATCH, ERROR_CODES.POEM_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: {
            poem: result.poem,
            lines: result.lines,
        },
        links: {
            self: `${req.baseUrl}/random${buildQuery(filters)}`,
            poem: `${req.baseUrl}/${result.poem.id}`,
            lines: `${req.baseUrl}/${result.poem.id}/lines`,
            context: `${req.baseUrl}/${result.poem.id}/context`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet_id}`,
        },
        meta: {
            filters: {
                ...filters,
            }, 
        },
    });
};