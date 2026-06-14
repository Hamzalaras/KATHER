import { catalogSources } from '../../src/services/catalog.services.js';

export const insert = async (prisma) => {
    let totalInserted = 0;

    for (const [key, source] of Object.entries(catalogSources)) {
        try {
            const toInsert = source.map(meta => ({
                id: meta.id,
                name_en: meta.name_en,
                name_ar: meta.name_ar,
                aliases: meta.aliases,
            }));
    
            const result = await prisma[key].createMany({
                data: toInsert,
            });

            totalInserted += result.count;
            console.log(`${key}: inserted ${result.count} / ${source.length}`);
        } catch (error) {
            console.log(`Error in file ${key}:`, error.message);
            throw error;
        }
    }

    console.log(`\nMeta: ${totalInserted} total inserted\n`);
    return totalInserted;
};
