import { prismaClient } from '../database/prismaClient.js';
import { getCachedCount } from '../utils/cache/count.js';
import { randomSkip } from '../utils/randomSkip.js';
import { isValidLabel } from '../utils/isValidLabel.js';
import { ValidationError } from '../utils/errors/ApiError.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';

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

const poemInLineSelect = {
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

const lineSummarySelect = {
    id: true,
    content: true,
    type: true,
    order: true,
    created_at: true,
    poemId: true,
    Poems: {
        select: poemInLineSelect,
    },
};


const sanitizeLabel = (value) => (isValidLabel(value) ? value : null);

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


const mapPoemInLine = (poem) => ({
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


const mapLineDetail = (line) => ({
    id: line.id,
    content: line.content,
    type: line.type,
    order: line.order,
    created_at: line.created_at,
    poemId: line.poemId,
    poem: mapPoemInLine(line.Poems),
});



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

const buildLineWhere = ({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q }) => {
    const where = {
        ...(poemId && { poemId }),
        ...(lineType && { type: lineType }),
        ...((poetId || era || country || gender || quafia || sea || topic) && {
            Poems: {
                ...(poetId && { poetId }),
                ...(quafia && { quafia }),
                ...(sea && { engSea: sea }),
                ...(topic && { engTopic: topic }),
                ...((era || country || gender) && {
                    Poets: {
                        ...(era && { engEra: era }),
                        ...(country && { engCountry: country }),
                        ...(gender && { gender }),
                    },
                }),
            },
        }),
        ...(q && {
            OR: [
                { content: { contains: q, mode: 'insensitive' } },
                { Poems: { name: { contains: q, mode: 'insensitive' } } },
                { Poems: { Poets: { engName: { contains: q, mode: 'insensitive' } } } },
                { Poems: { Poets: { arabName: { contains: q, mode: 'insensitive' } } } },
            ],
        }),
    };
    return where;
};



const selectLineById = async (lineId) => prismaClient.poemsLines.findUnique({
    where: {
        id: lineId,
    },
    select: lineSummarySelect,
});


export const getLineCollection = async ({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q, limit, offset, meta }) => {
    const where = buildLineWhere({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q });

    const shouldRunCount = !q || meta;
    const total = shouldRunCount ? await getCachedCount(ENTITY_KEYS.POEMS_LINES, DEFAULT_COUNT_TTL_SECONDS, where) : null;

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError('Offset is out of range', 'OFFSET_OUT_OF_RANGE');
    }

    const fetchLimit = shouldRunCount ? limit : limit + 1;
    const data = total === 0 ? [] : await prismaClient.poemsLines.findMany({
        where,
        orderBy: [
            { poemId: 'asc' },
            { order: 'asc' },
            { id: 'asc' },
        ],
        skip: offset,
        take: fetchLimit,
        select: lineSummarySelect,
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
        data: resultData.map(mapLineDetail),
        pagination,
        filters: {
            poemId,
            poetId,
            era,
            country,
            gender,
            quafia,
            sea,
            topic,
            lineType,
            q,
        },
    };
};

export const getLineDetail = async (lineId) => {
    const line = await selectLineById(lineId);
    return line ? mapLineDetail(line) : null;

};


export const getRandomLine = async ({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q }) => {

    const where = buildLineWhere({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q });
    const total = await getCachedCount(ENTITY_KEYS.POEMS_LINES, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const line = await prismaClient.poemsLines.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: {
            id: 'asc',
        },
        select: lineSummarySelect,
    });

    return line ? mapLineDetail(line) : null;

};

