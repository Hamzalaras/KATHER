import { getLineCollection, getLineDetail as getLineDetailService, getRandomLine } from '../services/line.services.js';
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

const buildLineFilters = (locals) => ({
    poemId: locals.poemId,
    poetId: locals.poetId,
    era: locals.era,
    country: locals.country,
    gender: locals.gender,
    quafia: locals.quafia,
    sea: locals.sea,
    topic: locals.topic,
    lineType: locals.lineType,
    q: locals.q,
    meta: locals.meta,
});

export const getLineList = async (req, res) => {

    const { limit, offset } = res.locals;
    const filters = buildLineFilters(res.locals);
    const result = await getLineCollection({ ...filters, offset, limit });
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


export const getLineDetail = async (req, res) => {

    const { id } = res.locals;
    const result = await getLineDetailService(id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.LINE, ERROR_CODES.LINE_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${id}`,
            poem: `${V1_RESOURCE_PATHS.POEMS}/${result.poem.id}`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet.id}`,
            random: `${req.baseUrl}/random`,
        },
    });

};

export const getRandomLineEndpoint = async (req, res) => {
    const filters = buildLineFilters(res.locals);
    const result = await getRandomLine(filters);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.LINE_NO_MATCH, ERROR_CODES.LINE_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/random${buildQuery(filters)}`,
            line: `${req.baseUrl}/${result.id}`,
            poem: `${V1_RESOURCE_PATHS.POEMS}/${result.poem.id}`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet.id}`,
        },
    });

};
