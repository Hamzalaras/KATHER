import { prismaClient } from '../database/prismaClient.js';
import { getCachedCount } from '../utils/cache/count.js';
import { randomSkip } from '../utils/randomSkip.js';
import { isValidLabel } from '../utils/isValidLabel.js';
import { ValidationError } from '../utils/errors/ApiError.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS, RELATED_ITEMS_LIMIT } from '../constants/domain.js';

const poetBaseSelect = {
    id: true,
    engName: true,
    arabName: true,
    engEra: true,
    arabEra: true,
    engCountry: true,
    arabCountry: true,
    gender: true,
    created_at: true,
    _count: {
        select: {
            Poems: true,
        },
    },
};

const poetProfileSelect = {
    ...poetBaseSelect,
    bio: true,
};

const poemSummarySelect = {
    id: true,
    name: true,
    engTopic: true,
    arabTopic: true,
    type: true,
    engSea: true,
    arabSea: true,
    quafia: true,
    order: true,
    created_at: true,
    poetId: true,
    _count: {
        select: {
            PoemsLines: true,
        },
    },
};

const buildPoetWhere = ({ era, country, gender, q }) => ({
    ...(era && { engEra: era }),
    ...(country && { engCountry: country }),
    ...(gender && { gender }),
    ...(q && {
        OR: [
            { engName: { contains: q, mode: 'insensitive' } },
            { arabName: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
        ],
    }),
});

const resolvePoetOrderBy = (sort) => {
    switch (sort) {
        case '-name': return { engName: 'desc' };
        case 'arab_name': return { arabName: 'asc' };
        case '-arab_name': return { arabName: 'desc' };
        case 'created_at': return { created_at: 'asc' };
        case '-created_at': return { created_at: 'desc' };
        case 'id': return { id: 'asc' };
        case '-id': return { id: 'desc' };
        case 'name':
        default: return { engName: 'asc' };
    }
};

const buildPagination = (offset, limit, total) => {
    const page = Math.floor(offset / limit) + 1;

    if (total === null) {
        return { offset, page, limit, has_more: null }; 
    }

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const hasMore = total > 0 && (offset + limit) < total;

    return {
        offset,
        page,
        limit,
        total,
        total_pages: totalPages,
        has_more: hasMore,
    };
};

const mapPoetSummary = (poet) => ({
    id: poet.id,
    engName: poet.engName,
    arabName: poet.arabName,
    engEra: poet.engEra,
    arabEra: poet.arabEra,
    engCountry: poet.engCountry,
    arabCountry: poet.arabCountry,
    gender: poet.gender,
    created_at: poet.created_at,
    poem_count: poet._count.Poems,
});

const mapPoetProfile = (poet) => ({
    id: poet.id,
    engName: poet.engName,
    arabName: poet.arabName,
    bio: poet.bio,
    engEra: poet.engEra,
    arabEra: poet.arabEra,
    engCountry: poet.engCountry,
    arabCountry: poet.arabCountry,
    gender: poet.gender,
    created_at: poet.created_at,
    poem_count: poet._count.Poems,
});

const mapPoemSummary = (poem) => ({
    id: poem.id,
    name: poem.name,
    engTopic: poem.engTopic,
    arabTopic: poem.arabTopic,
    type: poem.type,
    engSea: poem.engSea,
    arabSea: poem.arabSea,
    quafia: poem.quafia,
    order: poem.order,
    created_at: poem.created_at,
    poetId: poem.poetId,
    line_count: poem._count.PoemsLines,
});

export const getPoetCollection = async ({ era, country, gender, q, sort, limit, offset, meta }) => {
    const where = buildPoetWhere({ era, country, gender, q });

    const shouldRunCount = !q || meta;
    const total = shouldRunCount ? await getCachedCount(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS, where) : null;

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError('Offset exceeds total number of poets', 'OFFSET_OUT_OF_RANGE');
    }

    const fetchLimit = shouldRunCount ? limit : limit + 1;
    const data = total === 0 ? [] : await prismaClient.poets.findMany({
        where,
        orderBy: resolvePoetOrderBy(sort),
        skip: offset,
        take: fetchLimit,
        select: poetBaseSelect,
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
        data: resultData.map(mapPoetSummary),
        pagination,
        filters: { era, country, gender, q, sort },
    };
};

export const getPoetProfile = async (poetId) => {
    const poet = await prismaClient.poets.findUnique({
        where: { id: poetId },
        select: poetProfileSelect,
    });

    return poet ? mapPoetProfile(poet) : null;
};

export const getPoetPoems = async ({ poetId, offset, limit }) => {

    const poet = await prismaClient.poets.findUnique({
        where: { id: poetId },
        select: poetBaseSelect,
    });

    if (!poet) return null;

    const total = await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, { poetId });

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError('Offset exceeds total number of poems for this poet', 'OFFSET_OUT_OF_RANGE');
    }

    const data = total === 0 ? [] : await prismaClient.poems.findMany({
        where: { poetId },
        orderBy: { order: 'asc' },
        skip: offset,
        take: limit,
        select: poemSummarySelect,
    });

    return {
        poet: mapPoetSummary(poet),
        data: data.map(mapPoemSummary),
        pagination: buildPagination(offset, limit, total),
    };
};

export const getPoetStats = async (poetId) => {
    const poet = await prismaClient.poets.findUnique({
        where: { id: poetId },
        select: poetBaseSelect,
    });

    if (!poet) return null;

    const [linesCount, topics, seas] = await Promise.all([
        prismaClient.poemsLines.count({ where: { Poems: { poetId } } }),
        prismaClient.poems.groupBy({
            by: ['engTopic', 'arabTopic'],
            where: { poetId },
            _count: { engTopic: true },
            orderBy: { _count: { engTopic: 'desc' } },
            take: RELATED_ITEMS_LIMIT,
        }),
        prismaClient.poems.groupBy({
            by: ['engSea', 'arabSea'],
            where: { poetId },
            _count: { engSea: true },
            orderBy: { _count: { engSea: 'desc' } },
            take: RELATED_ITEMS_LIMIT,
        }),
    ]);



    const filteredTopics = topics
        .filter(t => isValidLabel(t.engTopic) || isValidLabel(t.arabTopic))
        .map(topic => ({
            engTopic: isValidLabel(topic.engTopic) ? topic.engTopic : null,
            arabTopic: isValidLabel(topic.arabTopic) ? topic.arabTopic : null,
            count: topic._count.engTopic,
        }));

    const filteredSeas = seas
        .filter(s => isValidLabel(s.engSea) || isValidLabel(s.arabSea))
        .map(sea => ({
            engSea: isValidLabel(sea.engSea) ? sea.engSea : null,
            arabSea: isValidLabel(sea.arabSea) ? sea.arabSea : null,
            count: sea._count.engSea,
        }));

    return {
        poet: mapPoetSummary(poet),
        poems_count: poet._count.Poems,
        lines_count: linesCount,
        top_topics: filteredTopics,
        top_seas: filteredSeas,
    };
};

export const getRandomPoet = async ({ era, country, gender, q }) => {
    const where = buildPoetWhere({ era, country, gender, q });
    const total = await getCachedCount(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const poet = await prismaClient.poets.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: { id: 'asc' },
        select: poetProfileSelect,
    });

    return poet ? mapPoetProfile(poet) : null;
};