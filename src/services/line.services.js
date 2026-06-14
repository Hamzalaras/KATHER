import { prismaClient } from '../database/prismaClient.js';
import { getCachedCount } from '../utils/cache/count.js';
import { randomSkip } from '../utils/randomSkip.js';
import { hasDiacritics } from '../utils/diacritics.js';
import { ValidationError } from '../utils/errors/ApiError.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';
import { LINES_SORT } from '../constants/sort.js';
import { POEM_SELECT, LINE_BASE_SELECT } from '../constants/select.js';
import { mapPoem, mapPoemLineBase } from '../utils/mappers.js';
import { buildPagination } from '../utils/builders.js';
import { ERROR_CODES, NOT_FOUND_MESSAGES } from '../constants/errors.js';

const LINE_SELECT = {
    ...LINE_BASE_SELECT,
    Poems: {
        select: POEM_SELECT,
    },
};

const mapPoemLine = (line) => ({
    ...mapPoemLineBase(line),
    poem: mapPoem(line.Poems),
});

const buildLineWhere = ({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q }) => ({
        ...(poemId !== undefined && { poemId }),
        ...(lineType !== undefined && { type: lineType }),
        ...((poetId !== undefined || era !== undefined || country !== undefined || gender !== undefined || quafia !== undefined || sea !== undefined || topic !== undefined) && {
            Poems: {
                ...(poetId !== undefined && { poetId }),
                ...(quafia !== undefined && { quafia }),
                ...(sea !== undefined && { engSea: sea }),
                ...(topic !== undefined && { engTopic: topic }),
                ...((era !== undefined || country !== undefined || gender !== undefined) && {
                    Poets: {
                        ...(era !== undefined && { engEra: era }),
                        ...(country !== undefined && { engCountry: country }),
                        ...(gender !== undefined && { gender }),
                    },
                }),
            },
        }),
        ...(q && {
            OR: [
                (hasDiacritics(q) ? { content: { contains: q, mode: 'insensitive' } } :
                                    { contentNoDiacritics: { contains: q, mode: 'insensitive' } }
                                ),
                { Poems: { name: { contains: q, mode: 'insensitive' } } },
                { Poems: { Poets: { engName: { contains: q, mode: 'insensitive' } } } },
                { Poems: { Poets: { arabName: { contains: q, mode: 'insensitive' } } } },
            ],
        }),
});

export const getLinesList = async ({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q, limit, offset, meta, sort }) => {
    const where = buildLineWhere({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q });

    const shouldRunCount = !q || meta;
    const total = shouldRunCount ? await getCachedCount(ENTITY_KEYS.POEMS_LINES, DEFAULT_COUNT_TTL_SECONDS, where) : null;

    if (total !== null && total > 0 && offset >= total) {
        throw new ValidationError(NOT_FOUND_MESSAGES.OFFSET_NOT_FOUND, ERROR_CODES.OFFSET_EXCEEDS_TOTAL);
    }

    const fetchLimit = shouldRunCount ? limit : limit + 1;
    const data = total === 0 ? [] : await prismaClient.poemsLines.findMany({
        where,
        orderBy: LINES_SORT.get(sort) ?? LINES_SORT.get('poem_id'),
        skip: offset,
        take: fetchLimit,
        select: LINE_SELECT,
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
        data: resultData.map(mapPoemLine),
        pagination,
    };
};

export const getLineById = async (lineId) => {
    const line = await prismaClient.poemsLines.findUnique({
        where: { id: lineId },
        select: LINE_SELECT,
    });
    return line ? mapPoemLine(line) : null;
};

export const getRandomLine = async ({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q }) => {

    const where = buildLineWhere({ poemId, poetId, era, country, gender, quafia, sea, topic, lineType, q });
    const total = await getCachedCount(ENTITY_KEYS.POEMS_LINES, DEFAULT_COUNT_TTL_SECONDS, where);

    if (total === 0) return null;

    const line = await prismaClient.poemsLines.findFirst({
        where,
        skip: randomSkip(total),
        orderBy: LINES_SORT.get('id'),
        select: LINE_SELECT,
    });

    return line ? mapPoemLine(line) : null;

};

