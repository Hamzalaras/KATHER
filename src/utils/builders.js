

export const buildPagination = (offset, limit, total) => {
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

export const buildQuery = (query = {}) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        params.set(key, String(value));
    }

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
};

export const buildCommuneFilters = (locals) => ({
    era: locals.era,
    country: locals.country,
    gender: locals.gender,
    quafia: locals.quafia,
    sea: locals.sea,
    topic: locals.topic,
    sort: locals.topic,
    q: locals.q,
    meta: locals.meta,
});