import { getDirJsons, getContentOfJsonFile } from './accessFiles.js';

export const insert = async (prisma) => {
    const files = await getDirJsons('../../seedData/explanations');
    let totalInserted = 0;

    for (const file of files) {
        try {
            const explanations = await getContentOfJsonFile(`../../seedData/explanations/${file}`);
            const toInsert = explanations.map(explanation => ({
                poem_id: explanation.poemId,
                general_idea: explanation.general_idea,
                themes: explanation.themes,
                styles: explanation.styles,
                summary: explanation.summary,
                raw_text: explanation.rawText,
            }));

            const result = await prisma.poemExplanations.createMany({
                data: toInsert,
                skipDuplicates: true,
            });

            totalInserted += result.count;
            console.log(`${file}: inserted ${result.count}/${explanations.length}`);
        } catch (error) {
            console.error(`Error in ${file}:`, error.message);
            throw error;
        }
    }

    console.log(`\Explanations: ${totalInserted} total inserted\n`);
    return totalInserted;
};
