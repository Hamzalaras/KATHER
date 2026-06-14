import { prismaClient } from '../database/prismaClient.js';
import { getCachedCount } from '../utils/cache/count.js';
import { randomSkip } from '../utils/randomSkip.js';
import { ValidationError } from '../utils/errors/ApiError.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS, RELATED_ITEMS_LIMIT } from '../constants/domain.js';
import { POEMS_SORT, POETS_SORT } from '../constants/sort.js';
import { POET_BASE_SELECT, POEM_BASE_SELECT } from '../constants/select.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';
import { buildPagination } from '../utils/builders.js';
import { mapPoetBase, mapPoemBase } from '../utils/mappers.js';

const POET_SELECT = {
    ...POET_BASE_SELECT,
    bio: true,
};

const buildPoetWhere = ({ era, country, gender, q }) => ({
    ...(era !== undefined && { engEra: era }),
    ...(country !== undefined && { engCountry: country }),
    ...(gender !== undefined && { gender }),
    ...(q && {
        OR: [
            { engName: { contains: q, mode: 'insensitive' } },
            { arabName: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
        ],
    }),
});

const mapPoet = (poet) => ({
    ...mapPoetBase(poet),
    bio: poet.bio,
});

export const getPoetsList = async ({ era, country, gender, q, sort, limit, offset, meta }) => {
    const where = buildPoetWhere({ era, country, gender, q });

    const shouldRunCount = !q || meta;
    const total = shouldRunCount ? await getCachedCount(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS, where) : null;

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const fetchLimit = shouldRunCount ? limit : limit + 1;
    const data = total === 0 ? [] : await prismaClient.poets.findMany({
        where,
        orderBy: POETS_SORT.get(sort) ?? POETS_SORT.get('eng_name'),
        skip: offset,
        take: fetchLimit,
        select: POET_BASE_SELECT,
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
        data: resultData.map(mapPoetBase),
        pagination,
    };
};

export const getPoetById = async (poetId) => {
    const poet = await prismaClient.poets.findUnique({
        where: { id: poetId },
        select: {
            ...POET_BASE_SELECT,
            bio: true,
        },
    });

    return poet ? mapPoet(poet) : null;
};

export const getPoetPoems = async ({ poetId, offset, limit, sort }) => {

    const poet = await prismaClient.poets.findUnique({
        where: { id: poetId },
        select: POET_BASE_SELECT,
    });

    if (!poet) return null;

    const total = await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, { poetId });

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const data = total === 0 ? [] : await prismaClient.poems.findMany({
        where: { poetId },
        orderBy: POEMS_SORT.get(sort) ?? POEMS_SORT.get('order'),
        skip: offset,
        take: limit,
        select: POEM_BASE_SELECT,
    });

    return {
        poet: mapPoetBase(poet),
        data: data.map(mapPoemBase),
        pagination: buildPagination(offset, limit, total),
    };
};

export const getPoetStats = async (poetId) => {
    const poet = await prismaClient.poets.findUnique({
        where: { id: poetId },
        select: POET_SELECT,
    });

    if (!poet) return null;

    const lineCountPromise = prismaClient.poemsLines.count({ where: { Poems: { poetId } } });
    
    const topTopicsPromise = prismaClient.poems.groupBy({
        by: ['engTopic', 'arabTopic'],
        where: {
            poetId,
            engTopic: { not: null },
        },
        _count: { engTopic: true },
        orderBy: { _count: { engTopic: 'desc' } },
        take: RELATED_ITEMS_LIMIT,
    });

    const topSeasPromise = prismaClient.poems.groupBy({
        by: ['engSea', 'arabSea'],
        where: { 
            poetId,
            engSea: { not: null },
        },
        _count: { engSea: true },
        orderBy: { _count: { engSea: 'desc' } },
        take: RELATED_ITEMS_LIMIT,
    });

    const [linesCount, topTopics, topSeas] = await Promise.all([
        lineCountPromise, topTopicsPromise, topSeasPromise
    ]);

    const [filteredTopTopics, filteredTopSeas] = 
        [
            topTopics.map(topic => ({
                    engTopic: topic.engTopic,
                    arabTopic: topic.arabTopic,
                    count: topic._count.engTopic,
                })),
            topSeas.map(sea => ({
                    engSea: sea.engSea,
                    arabSea: sea.arabSea,
                    count: sea._count.engSea,
                })),
        ];


    return {
        poet: mapPoetBase(poet),
        poems_count: poet._count.Poems,
        lines_count: linesCount,
        top_topics: filteredTopTopics,
        top_seas: filteredTopSeas,
    };
};

export const getRandomPoet = async ({ era, country, gender, q }) => {
    const where = buildPoetWhere({ era, country, gender, q });
    const total = await getCachedCount(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const poet = await prismaClient.poets.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: POETS_SORT.get('id'),
        select: POET_SELECT,
    });

    return poet ? mapPoet(poet) : null;
};