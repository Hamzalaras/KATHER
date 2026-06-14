

export const mapPoetBase = (poet) => ({
    id: poet.id,
    name_en: poet.name_en,
    name_ar: poet.name_ar,
    era: (poet.eras && {
        id: poet.eras.id,
        name_en: poet.eras.name_en,
        name_ar: poet.eras.name_ar,
    }),
    country: (poet.countries && {
        id: poet.countries.id,
        name_en: poet.countries.name_en,
        name_ar: poet.countries.name_ar,
    }),
    gender: poet.gender,
    created_at: poet.created_at,
    poem_count: poet._count.poems,
});

export const mapPoemBase = (poem) => ({
    id: poem.id,
    name: poem.name,
    poet_id: poem.poet_id,
    topic: (poem.topics && {
        id: poem.topics.id,
        name_en: poem.topics.name_en,
        name_ar: poem.topics.name_ar,
    }),
    type: (poem.poemsTypes && {
        id: poem.poemsTypes.id,
        name_en: poem.poemsTypes.name_en,
        name_ar: poem.poemsTypes.name_ar,
    }),
    sea: (poem.seas && {
        id: poem.seas.id,
        name_en: poem.seas.name_en,
        name_ar: poem.seas.name_ar,
    }),
    quafia: (poem.quawafi && {
        id: poem.quawafi.id,
        name_en: poem.quawafi.name_en,
        name_ar: poem.quawafi.name_ar,
    }),
    order: poem.order,
    created_at: poem.created_at,
    line_count: poem._count.poemsLines,
});

export const mapPoem = (poem) => ({
    ...mapPoemBase(poem),
    poet: mapPoetBase(poem.poets),
});

export const mapPoemLineBase = (line) => ({
    id: line.id,
    content: line.content,
    content_nd: line.content_nd,
    line_type: line.line_type,
    order: line.order,
    created_at: line.created_at,
});