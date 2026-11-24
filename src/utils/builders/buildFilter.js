
export const buildCommuneFilters = (dbParams = {}) => {
    const { era_id, country_id, quafia_id, sea_id, topic_id, sort, q, meta, gender } = dbParams;
    return { era_id, country_id, quafia_id, sea_id, topic_id, sort, q, meta, gender };
};

export const buildPoemFilters = (dbParams = {}) => ({
    ...buildCommuneFilters(dbParams),
    poet_id: dbParams.poet_id,
    poem_type_id: dbParams.poem_type_id,
    has_audio: dbParams.has_audio,
    has_explanation: dbParams.has_explanation,
});

export const buildLineFilters = (dbParams = {}) => ({
    ...buildPoemFilters(dbParams),
    poem_id: dbParams.poem_id,
    line_type: dbParams.line_type,
});

export const buildCommuneRawFilters = (rawParams = {}) => {
    const { era, country, quafia, sea, topic, sort, q, meta, gender } = rawParams;
    return { era, country, quafia, sea, topic, sort, q, meta, gender };
};

export const buildPoemRawFilters = (rawParams = {}) => ({
    ...buildCommuneRawFilters(rawParams),
    poet: rawParams.poet,
    poemType: rawParams.poemType,
    hasAudio: rawParams.hasAudio,
    hasExplanation: rawParams.hasExplanation,
});

export const buildLineRawFilters = (rawParams = {}) => ({
    ...buildPoemRawFilters(rawParams),
    poem: rawParams.poem,
    lineType: rawParams.lineType,
});