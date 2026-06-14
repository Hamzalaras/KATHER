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
    poems: {
        select: POEM_SELECT,
    },
};

const mapPoemLine = (line) => ({
    ...mapPoemLineBase(line),
    poem: mapPoem(line.poems),
});

const buildLineWhere = ({ poem_id, poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, line_type, q }) => ({
        ...(line_type !== undefined && { line_type }),
        ...((poem_id !== undefined || quafia_id !== undefined || sea_id !== undefined || topic_id !== undefined) && {
            poems: {
                ...(poem_id !== undefined && { id: poem_id }),
                ...(quafia_id !== undefined && { quafia_id }),
                ...(sea_id !== undefined && { sea_id }),
                ...(topic_id !== undefined && { topic_id }),
            }
        }),
        ...((poet_id !== undefined || era_id !== undefined || country_id !== undefined || gender !== undefined) && {    
            poets : {
                        ...(poet_id !== undefined && { id: poet_id }),
                        ...(era_id !== undefined && { era_id }),
                        ...(country_id !== undefined && { country_id }),
                        ...(gender !== undefined && { gender }),
            },
        }),
        ...(q && {
            OR: [
                (hasDiacritics(q) ? { content: { contains: q, mode: 'insensitive' } } :
                                    { content_nd: { contains: q, mode: 'insensitive' } }
                                ),
                { poems: { name: { contains: q, mode: 'insensitive' } } },
                { poets: { name_en: { contains: q, mode: 'insensitive' } }  },
                { poets: { name_ar: { contains: q, mode: 'insensitive' } }  },
            ],
        }),
});

export const getLinesList = async ({ limit, offset, meta, q, sort, ...filters }) => {
    const where = buildLineWhere({ q, ...filters });

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

export const getLineById = async (line_id) => {
    const line = await prismaClient.poemsLines.findUnique({
        where: { id: line_id },
        select: LINE_SELECT,
    });
    return line ? mapPoemLine(line) : null;
};

export const getRandomLine = async (filters) => {

    const where = buildLineWhere(filters);
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

