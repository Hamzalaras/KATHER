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

const buildPoemWhere = ({ poetId, era, country, gender, quafia, sea, topic, type, q }) => ({
        ...(poetId !== undefined && { poetId }),
        ...(quafia !== undefined && { quafia }),
        ...(sea !== undefined && { engSea: sea }),
        ...(topic !== undefined && { engTopic: topic }),
        ...(type !== undefined && { type }),
        ...((era !== undefined || country !== undefined || gender !== undefined) && {
            Poets: {
                    ...(era !== undefined && { engEra: era }),
                    ...(country !== undefined && { engCountry: country }),
                    ...(gender !== undefined && { gender }),
                },
            }),
            ...(q && {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { Poets: { engName: { contains: q, mode: 'insensitive' } } },
                { Poets: { arabName: { contains: q, mode: 'insensitive' } } },
            ],
        }),
});

export const getPoemsList = async ({ poetId, era, country, gender, quafia, sea, topic, type, q, limit, offset, meta, sort }) => {
    const where = buildPoemWhere({ poetId, era, country, gender, quafia, sea, topic, type, q });

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

const getPoemById = async (poemId) => {
    const poem = await prismaClient.poems.findUnique({
        where: { id: poemId },
        select: POEM_SELECT,
    });

    return poem ? mapPoem(poem) : null;
};

export const getPoemWithLines = async ({ poemId, limit, offset, sort }) => {
    const poem = await getPoemById(poemId);

    if (!poem) return null;

    const totalLines = poem.line_count;

    if (totalLines > 0 && offset >= totalLines) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const lines = totalLines === 0 ? [] : await prismaClient.poemsLines.findMany({
        where: {
            poemId,
        },
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


export const getPoemContext = async (poemId) => {

    const poem = await getPoemById(poemId);

    if (!poem) return null;

    const relatedWhere = {
        id: {
            not: poemId,
        },
    };

    const previousPromise = prismaClient.poems.findFirst({
        where: {
            poetId: poem.poetId,
            order: { lt: poem.order },
            ...relatedWhere,
        },
        orderBy: [POEMS_SORT.get('-order'), POEMS_SORT.get('-id')],
        select: POEM_BASE_SELECT,
    });

    const nextPromise = prismaClient.poems.findFirst({
        where: {
            poetId: poem.poetId,
            order: { gt: poem.order },
            ...relatedWhere,
        },
        orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
        select: POEM_BASE_SELECT,
    });

    const relatedByPoetPromise = prismaClient.poems.findMany({
        where: {
            poetId: poem.poetId,
            ...relatedWhere,
        },
        orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
        take: RELATED_ITEMS_LIMIT,
        select:POEM_BASE_SELECT,
    });

    const relatedByTopicPromise = poem.engTopic || poem.arabTopic ? 
        prismaClient.poems.findMany({
            where: {
                ...relatedWhere,
                ...(poem.engTopic && { engTopic: poem.engTopic }),
            },
            orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
            take: RELATED_ITEMS_LIMIT,
            select: {
                ...POEM_SELECT,
                engTopic: false,
                arabTopic: false,
            },
        }) :
        Promise.resolve([]);

    const relatedBySeaPromise = poem.engSea || poem.arabSea ? 
        prismaClient.poems.findMany({
            where: {
                ...relatedWhere,
                ...(poem.engSea && { engSea: poem.engSea }),
            },
            orderBy: [POEMS_SORT.get('order'), POEMS_SORT.get('id')],
            take: RELATED_ITEMS_LIMIT,
            select: {
                ...POEM_SELECT,
                engSea: false,
                arabSea: false,
            },
        }) :
        Promise.resolve([]);

    const [previous, next, relatedByPoet, relatedByTopic, relatedBySea] = await Promise.all([
        previousPromise, nextPromise, relatedByPoetPromise, relatedByTopicPromise, relatedBySeaPromise,
    ]);
    console.log(relatedByPoet)
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

export const getRandomPoem = async ({ poetId, era, country, gender, quafia, sea, topic, type, q, limit }) => {

    const where = buildPoemWhere({ poetId, era, country, gender, quafia, sea, topic, type, q });
    const total = await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const poem = await prismaClient.poems.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: POEMS_SORT.get('id'),
        select: {
            ...POEM_SELECT,
            PoemsLines: {
                select: LINE_BASE_SELECT,
                take: limit,
            },
        },
    });

    return poem ? {
        poem: mapPoem(poem),
        lines: poem.PoemsLines.map(mapPoemLineBase),
    } : null;
};
