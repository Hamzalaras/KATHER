

export const mapPoetBase = (poet) => ({
    id: poet.id,
    engName: poet.engName,
    arabName: poet.arabName,
    engEra: poet.engEra,
    arabEra: poet.arabEra,
    engCountry: poet.engCountry,
    arabCountry: poet.arabCountry,
    gender: poet.gender,
    created_at: poet.created_at,
    poem_count: poet._count.Poems,
});

export const mapPoemBase = (poem) => ({
    id: poem.id,
    name: poem.name,
    engTopic: poem.engTopic,
    arabTopic: poem.arabTopic,
    type: poem.type,
    engSea: poem.engSea,
    arabSea: poem.arabSea,
    quafia: poem.quafia,
    order: poem.order,
    created_at: poem.created_at,
    poetId: poem.poetId,
    line_count: poem._count.PoemsLines,
});

export const mapPoem = (poem) => ({
    ...mapPoemBase(poem),
    poet: mapPoetBase(poem.Poets),
});

export const mapPoemLineBase = (line) => ({
    id: line.id,
    content: line.content,
    contentNoDiacritics: line.contentNoDiacritics,
    type: line.type,
    order: line.order,
    created_at: line.created_at,
});