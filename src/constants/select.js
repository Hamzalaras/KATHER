
const META_SELECT = {
    id: true,
    name_en: true,
    name_ar: true,
};

export const POET_BASE_SELECT = {
    id: true,
    name_en: true,
    name_ar: true,
    eras: { select: META_SELECT },
    countries: { select: META_SELECT },
    gender: true,
    created_at: true,
    _count: {
        select: {
            poems: true,
        },
    },
};

export const POEM_BASE_SELECT = {
    id: true,
    name: true,
    poet_id: true,
    topics: { select: META_SELECT },
    poemsTypes: { select: META_SELECT },
    seas: { select: META_SELECT },
    quawafi: { select: META_SELECT },
    order: true,
    created_at: true,
    _count: {
        select: {
            poemsLines: true,
        },
    },
};

export const POEM_SELECT = {
    ...POEM_BASE_SELECT,
    poets: {
        select: POET_BASE_SELECT,
    },
};

export const LINE_BASE_SELECT = {
    id: true,
    content: true,
    content_nd: true,
    line_type: true,
    order: true,
    created_at: true,
};