import { getLinesList as getLineListServices,
         getLineById as getLineByIdServices,
         getRandomLine as getRandomLineServices,
        } from '../services/line.service.js';
import { NotFoundError } from '../utils/errors/index.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { RESPONSE_STATUS, V1_RESOURCE_PATHS } from '../constants/http.js';
import { buildQuery } from '../utils/builders/buildMeta.js';
import { buildLineFilters, buildLineRawFilters } from '../utils/builders/buildFilter.js';

export const getLineList = async (req, res) => {

    const { limit, offset } = res.locals.dbParams;
    const dbFilters = buildLineFilters(res.locals.dbParams);
    const rawFilters = buildLineRawFilters(res.locals.rawParams);
    const result = await getLineListServices({ ...dbFilters, offset, limit });
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


export const getLineById = async (req, res) => {

    const { line_id } = res.locals.dbParams;
    const result = await getLineByIdServices(line_id);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.LINE, ERROR_CODES.LINE_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/${line_id}`,
            poem: `${V1_RESOURCE_PATHS.POEMS}/${result.poem.id}`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet.id}`,
            random: `${req.baseUrl}/random`,
        },
    });

};

export const getRandomLine = async (req, res) => {
    const dbFilters = buildLineFilters(res.locals.dbParams);
    const rawFilters = buildLineRawFilters(res.locals.rawParams);
    const result = await getRandomLineServices(dbFilters);

    if (!result) {
        throw new NotFoundError(NOT_FOUND_MESSAGES.LINE_NO_MATCH, ERROR_CODES.LINE_NOT_FOUND);
    }

    res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
        links: {
            self: `${req.baseUrl}/random${buildQuery(rawFilters)}`,
            line: `${req.baseUrl}/${result.id}`,
            poem: `${V1_RESOURCE_PATHS.POEMS}/${result.poem.id}`,
            poet: `${V1_RESOURCE_PATHS.POETS}/${result.poem.poet.id}`,
        },
        meta: {
            filters: {
                ...rawFilters,
            },
        },
    });

};
