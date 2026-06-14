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
import { catalogSources } from './catalog.services.js';
import { CATALOG_GROUPS } from '../constants/catalog.js';

const POET_SELECT = {
    ...POET_BASE_SELECT,
    bio: true,
};

const buildPoetWhere = ({ era_id, country_id, gender, q }) => ({
    ...(era_id !== undefined && { era_id }),
    ...(country_id !== undefined && { country_id }),
    ...(gender !== undefined && { gender }),
    ...(q && {
        OR: [
            { name_en: { contains: q, mode: 'insensitive' } },
            { name_ar: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
        ],
    }),
});

const mapPoet = (poet) => ({
    ...mapPoetBase(poet),
    bio: poet.bio,
});

export const getPoetsList = async ({ era_id, country_id, gender, q, sort, limit, offset, meta }) => {
    const where = buildPoetWhere({ era_id, country_id, gender, q });
    console.log(sort)
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

export const getPoetById = async (poet_id) => {
    const poet = await prismaClient.poets.findUnique({
        where: { id: poet_id },
        select: POET_SELECT,
    });

    return poet ? mapPoet(poet) : null;
};

export const getPoetPoems = async ({ poet_id, offset, limit, sort }) => {

    const poet = await prismaClient.poets.findUnique({
        where: { id: poet_id },
        select: POET_BASE_SELECT,
    });

    if (!poet) return null;

    const total = await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, { poet_id });

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const data = total === 0 ? [] : await prismaClient.poems.findMany({
        where: { poet_id },
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

export const getPoetStats = async (poet_id) => {
    const poet = await prismaClient.poets.findUnique({
        where: { id: poet_id },
        select: POET_SELECT,
    });

    if (!poet) return null;

    const lineCountPromise = prismaClient.poemsLines.count({ where: { poet_id } });
    
    const topTopicsPromise = prismaClient.poems.groupBy({
        by: ['topic_id'],
        where: {
            poet_id,
            topic_id: { not: null },
        },
        _count: { topic_id: true },
        orderBy: { _count: { topic_id: 'desc' } },
        take: RELATED_ITEMS_LIMIT,
    });

    const topSeasPromise = prismaClient.poems.groupBy({
        by: ['sea_id'],
        where: { 
            poet_id,
            sea_id: { not: null },
        },
        _count: { sea_id: true },
        orderBy: { _count: { sea_id: 'desc' } },
        take: RELATED_ITEMS_LIMIT,
    });

    const [linesCount, topTopics, topSeas] = await Promise.all([
        lineCountPromise, topTopicsPromise, topSeasPromise
    ]);

    const [filteredTopTopics, filteredTopSeas] = 
        [
            topTopics.map(topic => {
                const { name_en, name_ar } = catalogSources[CATALOG_GROUPS.TOPICS].find(t => t.id === topic.topic_id);
                return { name_en, name_ar, poem_count: topic._count.topic_id };
            }),
            topSeas.map(sea => {
                const { name_en, name_ar } = catalogSources[CATALOG_GROUPS.SEAS].find(s => s.id === sea.sea_id);
                return { name_en, name_ar, poem_count: sea._count.sea_id };
            }),
        ];


    return {
        poet: mapPoetBase(poet),
        poems_count: poet._count.poems,
        lines_count: linesCount,
        top_topics: filteredTopTopics,
        top_seas: filteredTopSeas,
    };
};

export const getRandomPoet = async ({ era_id, country_id, gender, q }) => {
    const where = buildPoetWhere({ era_id, country_id, gender, q });
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