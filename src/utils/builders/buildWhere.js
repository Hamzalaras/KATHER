import { hasDiacritics } from '../diacritics.js';

const pruneUndefined = (obj) => {
    const cleaned = Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
    return Object.keys(cleaned).length ? cleaned : null;
};

export const buildPoetWhere = ({ era_id, country_id, gender, q, meta }) => ({
    ...pruneUndefined({ era_id, country_id, gender }),
    ...(q && {
        OR: [
            { name_en: { contains: q, mode: 'insensitive' } },
            { name_ar: { contains: q, mode: 'insensitive' } },
            ...(meta ? [{ bio: { contains: q, mode: 'insensitive' } }] : []),
        ],
    }),
});

export const buildPoemWhere = ({ poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, poem_type_id, q }) => {
    const poetsFilter = pruneUndefined({ era_id, country_id, gender });

    return {
        ...pruneUndefined({ poet_id, quafia_id, sea_id, topic_id, poem_type_id }),
        ...(poetsFilter && { poets: poetsFilter }),
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
    };
};

export const buildLineWhere = ({ poem_id, poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, poem_type_id, line_type, q }) => {
    const poemsFilter = pruneUndefined({ id: poem_id, quafia_id, sea_id, topic_id, poem_type_id });
    const poetsFilter = pruneUndefined({ id: poet_id, era_id, country_id, gender });

    return {
        ...pruneUndefined({ line_type }),
        ...(poemsFilter && { poems: poemsFilter }),
        ...(poetsFilter && { poets: poetsFilter }),
        ...(q &&
            (hasDiacritics(q) ?
                { content: { contains: q, mode: 'insensitive' } } :
                { content_nd: { contains: q, mode: 'insensitive' } }
            )
        ),
    };
};