import { getDirJsons, getContentOfJsonFile } from './accessFiles.js';
import { stripDiacritics } from '../../src/utils/diacritics.js';

export const insert = async (prisma) => {
    const files = await getDirJsons('../../seedData/poets');
    let totalInserted = 0;

    for (const file of files) {
        try {
            const poets = await getContentOfJsonFile(`../../seedData/poets/${file}`);
            const toInsert = poets.map(poet => ({
                id: poet.id,
                name_en: poet.name_en,
                name_ar: stripDiacritics(poet.name_ar),
                bio: stripDiacritics(poet.bio),
                era_id: poet.era_id,
                country_id: poet.country_id,
                gender: poet.gender,
            }));

            const result = await prisma.poets.createMany({
                data: toInsert,
                skipDuplicates: true,
            });
            
            totalInserted += result.count;
            console.log(`${file}: inserted ${result.count}/${poets.length}`);
        } catch (error) {
            console.error(`Error in ${file}:`, error.message);
            throw error;
        }
    }

    console.log(`\nPoets: ${totalInserted} total inserted\n`);
    return totalInserted;
};