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

export const buildPoemWhere = ({ poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, poem_type_id, q, has_audio, has_explanation }) => {
    const poetsFilter = pruneUndefined({ era_id, country_id, gender });

    return {
        ...pruneUndefined({ poet_id, quafia_id, sea_id, topic_id, poem_type_id }),
        ...(poetsFilter && { poets: poetsFilter }),
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
        ...(has_audio !== undefined && {
            poemAudio: has_audio ? { isNot: null } : { is: null },
        }),
        ...(has_explanation !== undefined && {
            poemExplanations: has_explanation ? { isNot: null } : { is: null },
        }),
    };
};

export const buildLineWhere = ({ poem_id, poet_id, era_id, country_id, gender, quafia_id, sea_id, topic_id, poem_type_id, line_type, q, has_audio, has_explanation }) => {
    const poemsFilter = pruneUndefined({
        id: poem_id, quafia_id, sea_id, topic_id, poem_type_id,
        ...(has_audio !== undefined && {
            poemAudio: has_audio ? { isNot: null } : { is: null },
        }),
        ...(has_explanation !== undefined && {
            poemExplanations: has_explanation ? { isNot: null } : { is: null },
        }),
    });
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