import { getDirJsons, getContentOfJsonFile } from './accessFiles.js';
import { stripDiacritics } from '../../src/utils/diacritics.js';

export const insert = async (prisma) => {
    const files = await getDirJsons('../../seedData/poems');
    let totalInserted = 0;

    for (const file of files) {
        try {
            const poems = await getContentOfJsonFile(`../../seedData/poems/${file}`);
            const toInsert = poems.map(poem => ({
                id: poem.id,
                name: stripDiacritics(poem.name),
                poet_id: poem.poet_id,
                topic_id: poem.topic_id,
                poem_type_id: poem.type_id,
                sea_id: poem.sea_id,
                quafia_id: poem.quafia_id,
                order: poem.order,
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
