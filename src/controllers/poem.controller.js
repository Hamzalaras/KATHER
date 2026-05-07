import {
    getPoemCollection,
    getPoemDetail,
    getPoemContext as fetchPoemContext,
    getRandomPoem,
} from '../services/poem.services.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS, V1_RESOURCE_PATHS } from '../constants/http.js';

const buildQuery = (query = {}) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        params.set(key, String(value));
    }

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
};

const buildPoemFilters = (locals) => ({
    poetId: locals.poetId,
    era: locals.era,
    country: locals.country,
    gender: locals.gender,
    quafia: locals.quafia,
    sea: locals.sea,
    topic: locals.topic,
    type: locals.type,
    q: locals.q,
    meta: locals.meta,
});

export const getPoemList = async (req, res) => {
    const { limit, offset, meta } = res.locals;
    const filters = buildPoemFilters(res.locals);
    const result = await getPoemCollection({ ...filters, limit, offset, meta });
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
            filters: result.filters,
        },
    });
};

export const getPoemById = async (req, res) => {
    const { id, limit, offset } = res.locals;
    const result = await getPoemDetail({ poemId: id, limit, offset });

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
    });
};

export const getPoemLines = async (req, res) => {
    const { id, limit, offset } = res.locals;
    const result = await getPoemDetail({ poemId: id, limit, offset });
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
            self: `${req.baseUrl}/${id}/lines${buildQuery({ limit, offset })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${id}/lines${buildQuery({ limit, offset: nextOffset })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${id}/lines${buildQuery({ limit, offset: prevOffset })}` : null,
            poem: `${req.baseUrl}/${id}`,
            context: `${req.baseUrl}/${id}/context`,
        },
    });
};

export const getPoemContext = async (req, res) => {
    const { id } = res.locals;
    const result = await fetchPoemContext(id);

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
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet.id}`,
            random: `${req.baseUrl}/random`,
        },
    });
};

export const getRandomPoemEndpoint = async (req, res) => {
    const filters = buildPoemFilters(res.locals);
    const result = await getRandomPoem(filters);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.POEM_NO_MATCH, ERROR_CODES.POEM_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/random${buildQuery(filters)}`,
            poem: `${req.baseUrl}/${result.id}`,
            lines: `${req.baseUrl}/${result.id}/lines`,
            context: `${req.baseUrl}/${result.id}/context`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poet.id}`,
        },
    });
};