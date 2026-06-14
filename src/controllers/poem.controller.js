import {
    getPoemsList as getPoemListServices,
    getPoemWithLines,
    getPoemContext as getPoemContextServices,
    getRandomPoem as getRandomPoemServices,
} from '../services/poem.services.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS, V1_RESOURCE_PATHS } from '../constants/http.js';
import { buildQuery, buildCommuneFilters } from '../utils/builders.js';

const buildPoemFilters = (locals) => ({
    ...buildCommuneFilters(locals),
    poetId: locals.poetId,
    type: locals.type,
});

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
    const { sort, id, limit, offset } = res.locals;
    const result = await getPoemWithLines({ poemId: id, sort, limit, offset });

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
            self: `${req.baseUrl}/${id}${buildQuery({ limit, offset })}`,
            lines: `${req.baseUrl}/${id}/lines${buildQuery({ limit, offset })}`,
            context: `${req.baseUrl}/${id}/context`,
            random: `${req.baseUrl}/random`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poetId}`,
        },
        meta: {
            filters: {
                sort,
            },
        },
    });
};

export const getPoemLines = async (req, res) => {
    const { id, limit, offset, sort } = res.locals;
    const result = await getPoemWithLines({ poemId: id, limit, offset, sort });
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
            self: `${req.baseUrl}/${id}/lines${buildQuery({ sort, limit, offset })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${id}/lines${buildQuery({ sort, limit, offset: nextOffset })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${id}/lines${buildQuery({ sort, limit, offset: prevOffset })}` : null,
            poem: `${req.baseUrl}/${id}`,
            context: `${req.baseUrl}/${id}/context`,
        },
        meta: {
            filters: {
                sort,
            },
        },
    });
};

export const getPoemContext = async (req, res) => {
    const { id } = res.locals;
    const result = await getPoemContextServices(id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POEM, ERROR_CODES.POEM_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${id}/context`,
            poem: `${req.baseUrl}/${id}`,
            lines: `${req.baseUrl}/${id}/lines`,
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
            poem: `${req.baseUrl}/${result.id}`,
            lines: `${req.baseUrl}/${result.id}/lines`,
            context: `${req.baseUrl}/${result.id}/context`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poet.id}`,
        },
        meta: {
            filters: {
                ...filters,
            }, 
        },
    });
};