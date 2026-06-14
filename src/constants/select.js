

export const POET_BASE_SELECT = {
    id: true,
    engName: true,
    arabName: true,
    engEra: true,
    arabEra: true,
    engCountry: true,
    arabCountry: true,
    gender: true,
    created_at: true,
    _count: {
        select: {
            Poems: true,
        },
    },
};

export const POEM_BASE_SELECT = {
    id: true,
    name: true,
    engTopic: true,
    arabTopic: true,
    type: true,
    engSea: true,
    arabSea: true,
    quafia: true,
    order: true,
    created_at: true,
    poetId: true,
    _count: {
        select: {
            PoemsLines: true,
        },
    },
};

export const POEM_SELECT = {
    ...POEM_BASE_SELECT,
    Poets: {
        select: POET_BASE_SELECT,
    },
};

export const LINE_BASE_SELECT = {
    id: true,
    content: true,
    contentNoDiacritics: true,
    type: true,
    order: true,
    created_at: true,
};