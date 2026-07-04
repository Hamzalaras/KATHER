
export const buildCommuneFilters = (locals) => {
    const { 
        era_id, country_id, quafia_id, sea_id,
        topic_id, sort, q, meta, gender,
    } = locals;
    return { 
        era_id, country_id, quafia_id, sea_id,
        topic_id, sort, q, meta, gender,
    };
};

export const buildPoemFilters = (locals) => ({
    ...buildCommuneFilters(locals),
    poet_id: locals.poet_id,
    poem_type_id: locals.poem_type_id,
});

export const buildLineFilters = (locals) => ({
    ...buildPoemFilters(locals),
    poem_id: locals.poem_id,
    line_type: locals.line_type,
});