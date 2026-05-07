import { getDirJsons, getContentOfJsonFile } from './accessFiles.js';

export const insert = async (prisma) => {
    const files = await getDirJsons('../../seedData/poems');
    let totalInserted = 0;

    for (const file of files) {
        try {
            const poems = await getContentOfJsonFile(`../../seedData/poems/${file}`);
            const toInsert = poems.map(poem => ({
                id: poem.id,
                name: poem.name,
                engTopic: poem.engTopic,
                arabTopic: poem.arabTopic,
                type: (poem.type ?? 'غير محددة بعد'),
                engSea: poem.engSea,
                arabSea: poem.arabSea,
                quafia: poem.quafia,
                order: poem.order,
                poetId: poem.poetId,
            }));

            const result = await prisma.poems.createMany({
                data: toInsert,
                skipDuplicates: true,
            });
            
            totalInserted += result.count;
            console.log(`${file}: inserted ${result.count}/${poems.length}`);
        } catch (error) {
            console.error(`Error in ${file}:`, error.message);
            throw error;
        }
    }

    console.log(`\nPoems: ${totalInserted} total inserted\n`);
    return totalInserted;
};
