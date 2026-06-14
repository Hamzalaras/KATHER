import { prismaClient } from '../database/prismaClient.js';
import { getCachedCount } from '../utils/cache/count.js';
import { randomSkip } from '../utils/randomSkip.js';
import { ValidationError } from '../utils/errors/ApiError.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS, RELATED_ITEMS_LIMIT } from '../constants/domain.js';
import { LINES_SORT, POEMS_SORT } from '../constants/sort.js';
import { POEM_SELECT, LINE_BASE_SELECT, POEM_BASE_SELECT } from '../constants/select.js';
import { mapPoem, mapPoemBase, mapPoemLineBase } from '../utils/mappers.js';
import { buildPagination } from '../utils/builders.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';

const buildPoemWhere = ({ poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, poem_type_id, q }) => ({
        ...(poet_id !== undefined && { poet_id }),
        ...(quafia_id !== undefined && { quafia_id }),
        ...(sea_id !== undefined && { sea_id }),
        ...(topic_id !== undefined && { topic_id }),
        ...(poem_type_id !== undefined && { poemType_id }),
        ...((era_id !== undefined || country_id !== undefined || gender !== undefined) && {
            poets: {
                    ...(era_id !== undefined && { era_id }),
                    ...(country_id !== undefined && { country_id }),
                    ...(gender !== undefined && { gender }),
                },
            }),
            ...(q && {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { poets: { name_en: { contains: q, mode: 'insensitive' } } },
                { poets: { name_en: { contains: q, mode: 'insensitive' } } },
            ],
        }),
});

export const getPoemsList = async ({ q, limit, offset, meta, sort, ...filters }) => {
    const where = buildPoemWhere({ ...filters, q });

    const shouldRunCount = !q || meta;
    const total = shouldRunCount ? await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, where) : null;

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const fetchLimit = shouldRunCount ? limit : limit + 1;
    const data = total === 0 ? [] : await prismaClient.poems.findMany({
        where,
        orderBy: POEMS_SORT.get(sort) ?? POEMS_SORT.get('poet_id'),
        skip: offset,
        take: fetchLimit,
        select: POEM_SELECT,
    });

    let hasMore = null;
    let resultData = data;
    if (!shouldRunCount && data.length > limit) {
        hasMore = true;
        resultData = data.slice(0, limit);
    } else if (!shouldRunCount) {
        hasMore = false;
    }

    const pagination = buildPagination(offset, limit, total);
    if (!shouldRunCount) {
        pagination.has_more = hasMore;
    }

    return {
        data: resultData.map(mapPoem),
        pagination,
    };
};

const getPoemById = async (poem_id) => {
    const poem = await prismaClient.poems.findUnique({
        where: { id: poem_id },
        select: POEM_SELECT,
    });

    return poem ? mapPoem(poem) : null;
};

export const getPoemWithLines = async ({ poem_id, limit, offset, sort }) => {
    const poem = await getPoemById(poem_id);

    if (!poem) return null;

    const totalLines = poem.line_count;

    if (totalLines > 0 && offset >= totalLines) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const lines = totalLines === 0 ? [] : await prismaClient.poemsLines.findMany({
        where: { poem_id },
        orderBy: LINES_SORT.get(sort) ?? LINES_SORT.get('order'),
        skip: offset,
        take: limit,
        select: LINE_BASE_SELECT,
    });

    return {
        poem,
        lines: lines.map(mapPoemLineBase),
        pagination: buildPagination(offset, limit, totalLines),
    };

};


export const getPoemContext = async (poem_id) => {

    const poem = await getPoemById(poem_id);

    if (!poem) return null;

    const relatedWhere = {
        id: { not: poem_id },
    };

    const previousPromise = prismaClient.poems.findFirst({
        where: {
            poet_id: poem.poet_id,
            order: { lt: poem.order },
            ...relatedWhere,
        },
        orderBy: [POEMS_SORT.get('-order'), POEMS_SORT.get('-id')],
        select: POEM_BASE_SELECT,
    });

    const nextPromise = prismaClient.poems.findFirst({
        where: {
            poet_id: poem.poet_id,
            order: { gt: poem.order },
            ...relatedWhere,
        },
        orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
        select: POEM_BASE_SELECT,
    });

    const relatedByPoetPromise = prismaClient.poems.findMany({
        where: {
            poet_id: poem.poet_id,
            ...relatedWhere,
        },
        orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
        take: RELATED_ITEMS_LIMIT,
        select:POEM_BASE_SELECT,
    });

    const relatedByTopicPromise = poem.topic != null ? 
        prismaClient.poems.findMany({
            where: {
                ...relatedWhere,
                topic_id: poem.topic.id,
            },
            orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
            take: RELATED_ITEMS_LIMIT,
            select: {
                ...POEM_SELECT,
                topics: false,
            },
        }) :
        Promise.resolve([]);

    const relatedBySeaPromise = poem.sea != null ? 
        prismaClient.poems.findMany({
            where: {
                ...relatedWhere,
                sea_id: poem.sea.id,
            },
            orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
            take: RELATED_ITEMS_LIMIT,
            select: {
                ...POEM_SELECT,
                seas: false,
            },
        }) :
        Promise.resolve([]);

    const [previous, next, relatedByPoet, relatedByTopic, relatedBySea] = await Promise.all([
        previousPromise, nextPromise, relatedByPoetPromise, relatedByTopicPromise, relatedBySeaPromise,
    ]);

    return {
        poem: { ...poem, poet: undefined },
        poet: poem.poet,
        previous: previous ? mapPoemBase(previous) : null,
        next: next ? mapPoemBase(next) : null,
        related_by_poet: relatedByPoet.map(mapPoemBase),
        related_by_topic: relatedByTopic.map(mapPoem),
        related_by_sea: relatedBySea.map(mapPoem),
    };

};

export const getRandomPoem = async ({ limit, ...filters }) => {

    const where = buildPoemWhere(filters);
    const total = await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const poem = await prismaClient.poems.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: POEMS_SORT.get('id'),
        select: {
            ...POEM_SELECT,
            poemsLines: {
                select: LINE_BASE_SELECT,
                take: limit,
            },
        },
    });
    if (!poem) return null;

    return {
        poem: mapPoem(poem),
        lines: poem.poemsLines.map(mapPoemLineBase),
    };
};
