import { hasDiacritics } from '../diacritics.js';

export const buildPoetWhere = ({ era_id, country_id, gender, q }) => ({
    ...(era_id !== undefined && { era_id }),
    ...(country_id !== undefined && { country_id }),
    ...(gender !== undefined && { gender }),
    ...(q && {
        OR: [
            { name_en: { contains: q, mode: 'insensitive' } },
            { name_ar: { contains: q, mode: 'insensitive' } },
            // suspended for now because it creates a lot of noise in the results, until we find a better way to handle it
            // { bio: { contains: q, mode: 'insensitive' } },
        ],
    }),
});

export const buildPoemWhere = ({ poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, poem_type_id, q }) => ({
        ...(poet_id !== undefined && { poet_id }),
        ...(quafia_id !== undefined && { quafia_id }),
        ...(sea_id !== undefined && { sea_id }),
        ...(topic_id !== undefined && { topic_id }),
        ...(poem_type_id !== undefined && { poem_type_id }),
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
                { poets: { name_ar: { contains: q, mode: 'insensitive' } } },
            ],
        }),
});

export const buildLineWhere = ({ poem_id, poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, line_type, q }) => ({
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