import { prismaClient } from '../database/prismaClient.js';
import { getCachedCount } from '../utils/cache/count.js';
import { randomSkip } from '../utils/randomSkip.js';
import { isValidLabel } from '../utils/isValidLabel.js';
import { ValidationError } from '../utils/errors/ApiError.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS, RELATED_ITEMS_LIMIT } from '../constants/domain.js';

const poetSummarySelect = {
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
    Poets: {
        select: poetSummarySelect,
    },
    _count: {
        select: {
            PoemsLines: true,
        },
    },
};

const poemLineSelect = {
    id: true,
    content: true,
    type: true,
    order: true,
};

const sanitizeLabel = (value) => (isValidLabel(value) ? value : null);

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

const mapPoemSummary = (poem) => ({
    id: poem.id,
    name: poem.name,
    engTopic: sanitizeLabel(poem.engTopic),
    arabTopic: sanitizeLabel(poem.arabTopic),
    type: sanitizeLabel(poem.type),
    engSea: sanitizeLabel(poem.engSea),
    arabSea: sanitizeLabel(poem.arabSea),
    quafia: sanitizeLabel(poem.quafia),
    order: poem.order,
    created_at: poem.created_at,
    poetId: poem.poetId,
    line_count: poem._count.PoemsLines,
    poet: mapPoetSummary(poem.Poets),
});

const mapPoemLine = (line) => ({
    id: line.id,
    content: line.content,
    type: line.type,
    order: line.order,
});

const buildPoemWhere = ({ poetId, era, country, gender, quafia, sea, topic, type, q }) => {
    const where = {
        ...(poetId && { poetId }),
        ...(quafia && { quafia }),
        ...(sea && { engSea: sea }),
        ...(topic && { engTopic: topic }),
        ...(type && { type }),
        ...((era || country || gender) && {
        Poets: {
            ...(era && { engEra: era }),
            ...(country && { engCountry: country }),
            ...(gender && { gender }),
        },
        }),
        ...(q && {
        OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { Poets: { engName: { contains: q, mode: 'insensitive' } } },
            { Poets: { arabName: { contains: q, mode: 'insensitive' } } },
        ],
        }),
    };
    return where;
};


const selectPoemById = async (poemId) => prismaClient.poems.findUnique({
    where: {
        id: poemId,
    },
    select: poemSummarySelect,
});




export const getPoemCollection = async ({ poetId, era, country, gender, quafia, sea, topic, type, q, limit, offset, meta }) => {
    const where = buildPoemWhere({ poetId, era, country, gender, quafia, sea, topic, type, q });

    const shouldRunCount = !q || meta;
    const total = shouldRunCount ? await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, where) : null;

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError('Offset exceeds total number of poems', 'OFFSET_EXCEEDS_TOTAL');
    }

    const fetchLimit = shouldRunCount ? limit : limit + 1;
    const data = total === 0 ? [] : await prismaClient.poems.findMany({
        where,
        orderBy: [
            { order: 'asc' },
            { id: 'asc' },
        ],
        skip: offset,
        take: fetchLimit,
        select: poemSummarySelect,
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
        data: resultData.map(mapPoemSummary),
        pagination,
        filters: {
            poetId,
            era,
            country,
            gender,
            quafia,
            sea,
            topic,
            type,
            q,
        },
    };
};


export const getPoemProfile = async (poemId) => {
    const poem = await selectPoemById(poemId);

    return poem ? mapPoemSummary(poem) : null;
};

export const getPoemDetail = async ({ poemId, limit, offset }) => {
    const poem = await selectPoemById(poemId);

    if (!poem) return null;

    const totalLines = poem._count.PoemsLines;

    if (totalLines > 0 && offset >= totalLines) {
        throw new ValidationError('Offset exceeds total number of lines', 'OFFSET_EXCEEDS_TOTAL');
    }

    const lines = totalLines === 0 ? [] : await prismaClient.poemsLines.findMany({
        where: {
            poemId,
        },
        orderBy: [
            { order: 'asc' },
            { id: 'asc' },
        ],
        skip: offset,
        take: limit,
        select: poemLineSelect,
    });

    return {
        poem: mapPoemSummary(poem),
        lines: lines.map(mapPoemLine),
        pagination: buildPagination(offset, limit, totalLines),
    };

};


export const getPoemContext = async (poemId) => {

    const poem = await selectPoemById(poemId);

    if (!poem) return null;

    const relatedWhere = {
        id: {
            not: poemId,
        },
    };

    const [previous, next, relatedByPoet, relatedByTopic, relatedBySea] = await Promise.all([
        prismaClient.poems.findFirst({
            where: {
                poetId: poem.poetId,
                order: {
                    lt: poem.order,
                },
                ...relatedWhere,
            },
            orderBy: [
                { order: 'desc' },
                { id: 'desc' },
            ],
            select: poemSummarySelect,
        }),

        prismaClient.poems.findFirst({
            where: {
                poetId: poem.poetId,
                order: {
                    gt: poem.order,
                },
                ...relatedWhere,
            },
            orderBy: [
                { order: 'asc' },
                { id: 'asc' },
            ],
            select: poemSummarySelect,
        }),
        prismaClient.poems.findMany({
            where: {
                poetId: poem.poetId,
                ...relatedWhere,
            },
            orderBy: [
                { order: 'asc' },
                { id: 'asc' },
            ],
            take: RELATED_ITEMS_LIMIT,
            select: poemSummarySelect,
        }),
        prismaClient.poems.findMany({
            where: {
                ...relatedWhere,
                OR: [
                    { engTopic: poem.engTopic },
                    { arabTopic: poem.arabTopic },
                ],
            },
            orderBy: [
                { order: 'asc' },
                { id: 'asc' },
            ],
            take: RELATED_ITEMS_LIMIT,
            select: poemSummarySelect,
        }),
        prismaClient.poems.findMany({
            where: {
                ...relatedWhere,
                OR: [
                    { engSea: poem.engSea },
                    { arabSea: poem.arabSea },
                ],
            },
            orderBy: [
                { order: 'asc' },
                { id: 'asc' },
            ],
            take: RELATED_ITEMS_LIMIT,
            select: poemSummarySelect,
        }),
    ]);

    return {
        poem: mapPoemSummary(poem),
        poet: mapPoetSummary(poem.Poets),
        previous: previous ? mapPoemSummary(previous) : null,
        next: next ? mapPoemSummary(next) : null,
        related_by_poet: relatedByPoet.map(mapPoemSummary),
        related_by_topic: relatedByTopic.map(mapPoemSummary),
        related_by_sea: relatedBySea.map(mapPoemSummary),
    };

};

export const getRandomPoem = async ({ poetId, era, country, gender, quafia, sea, topic, type, q }) => {

    const where = buildPoemWhere({ poetId, era, country, gender, quafia, sea, topic, type, q });
    const total = await getCachedCount(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const poem = await prismaClient.poems.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: {
            id: 'asc',
        },
        select: poemSummarySelect,
    });

    return poem ? mapPoemSummary(poem) : null;

};
