import { getPoetCollection, getPoetProfile, getPoetPoems as fetchPoetPoems, getPoetStats as fetchPoetStats, getRandomPoet } from '../services/poet.services.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS } from '../constants/http.js';

const buildQuery = (query = {}) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        params.set(key, String(value));
    }

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
};

export const listPoets = async (req, res) => {
    const { era, country, gender, q, sort, limit, offset, meta } = res.locals;
    const result = await getPoetCollection({ era, country, gender, q, sort, limit, offset, meta });
    const nextOffset = offset + limit;
    const prevOffset = Math.max(offset - limit, 0);

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result.data,
        pagination: result.pagination,
        links: {
            self: `${req.baseUrl}${buildQuery({ era, country, gender, q, sort, limit, offset, meta })}`,
            next: result.pagination.has_more ? `${req.baseUrl}${buildQuery({ era, country, gender, q, sort, limit, offset: nextOffset, meta })}` : null,
            prev: offset > 0 ? `${req.baseUrl}${buildQuery({ era, country, gender, q, sort, limit, offset: prevOffset, meta })}` : null,
            random: `${req.baseUrl}/random`,
        },
        meta: {
            filters: result.filters,
        },
    });
};

export const getPoetById = async (req, res) => {
    const { id } = res.locals;
    const result = await getPoetProfile(id);

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
    const { id, offset, limit } = res.locals;
    const result = await fetchPoetPoems({ poetId: id, offset, limit });
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
            self: `${req.baseUrl}/${id}/poems${buildQuery({ limit, offset })}`,
            next: result.pagination.has_more ? `${req.baseUrl}/${id}/poems${buildQuery({ limit, offset: nextOffset })}` : null,
            prev: offset > 0 ? `${req.baseUrl}/${id}/poems${buildQuery({ limit, offset: prevOffset })}` : null,
            poet: `${req.baseUrl}/${id}`,
        },
    });
};

export const getPoetStats = async (req, res) => {
    const { id } = res.locals;
    const result = await fetchPoetStats(id);

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

export const getRandomPoetEndpoint = async (req, res) => {
    const { era, country, gender, q } = res.locals;
    const result = await getRandomPoet({ era, country, gender, q });

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
    });
};