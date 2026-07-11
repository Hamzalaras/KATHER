import {
    getPoemsList as getPoemListServices,
    getPoemWithLines,
    getPoemContext as getPoemContextServices,
    getRandomPoem as getRandomPoemServices,
} from '../services/poem.service.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS, V1_RESOURCE_PATHS } from '../constants/http.js';
import { buildQuery } from '../utils/builders/buildMeta.js';
import { buildPoemFilters, buildLineFilters, buildPoemRawFilters, buildLineRawFilters } from '../utils/builders/buildFilter.js';

export const getPoemList = async (req, res) => {
    const { limit, offset } = res.locals.dbParams;
    const dbFilters = buildPoemFilters(res.locals.dbParams);
    const rawFilters = buildPoemRawFilters(res.locals.rawParams);
    const result = await getPoemListServices({ ...dbFilters, limit, offset });
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
            random: `${req.baseUrl}/random${buildQuery(rawFilters)}`,
        },
        meta: {
            filters: {
                ...rawFilters,
            },
        },
    });
};

export const getPoemById = async (req, res) => {
    const { poem_id, limit, offset } = res.locals.dbParams;
    const lineDbFilters = buildLineFilters(res.locals.dbParams);
    const lineRawFilters = buildLineRawFilters(res.locals.rawParams);
    const result = await getPoemWithLines({ limit, offset, ...lineDbFilters });

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
            self: `${req.baseUrl}/${poem_id}${buildQuery({ limit, offset, ...lineRawFilters })}`,
            lines: `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset, ...lineRawFilters })}`,
            context: `${req.baseUrl}/${poem_id}/context`,
            random: `${req.baseUrl}/random`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet_id}`,
        },
        meta: {
            filters: {
                ...lineRawFilters,
                poem_id: undefined,
            },
        },
    });
};

export const getPoemLines = async (req, res) => {
    const { poem_id, limit, offset } = res.locals.dbParams;    
    const lineDbFilters = buildLineFilters(res.locals.dbParams);
    const lineRawFilters = buildLineRawFilters(res.locals.rawParams);
    const result = await getPoemWithLines({ limit, offset, ...lineDbFilters });
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
            self: `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset, ...lineRawFilters })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset: nextOffset, ...lineRawFilters })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${poem_id}/lines${buildQuery({ limit, offset: prevOffset, ...lineRawFilters })}` : null,
            poem: `${req.baseUrl}/${poem_id}`,
            context: `${req.baseUrl}/${poem_id}/context`,
        },
        meta: {
            filters: {
                ...lineRawFilters,
            },
        },
    });
};

export const getPoemContext = async (req, res) => {
    const { poem_id } = res.locals.dbParams;
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
    const { limit } = res.locals.dbParams;
    const dbFilters = buildPoemFilters(res.locals.dbParams);
    const rawFilters = buildPoemRawFilters(res.locals.rawParams);
    const result = await getRandomPoemServices({ ...dbFilters, limit });

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
            self: `${req.baseUrl}/random${buildQuery(rawFilters)}`,
            poem: `${req.baseUrl}/${result.poem.id}`,
            lines: `${req.baseUrl}/${result.poem.id}/lines`,
            context: `${req.baseUrl}/${result.poem.id}/context`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet_id}`,
        },
        meta: {
            filters: {
                ...rawFilters,
            }, 
        },
    });
};