import { getDirJsons, getContentOfJsonFile } from './accessFiles.js';

export const insert = async (prisma) => {
    const files = await getDirJsons('../../seedData/poemsAudio');
    let totalInserted = 0;

    for (const file of files) {
        try {
            const audios = await getContentOfJsonFile(`../../seedData/poemsAudio/${file}`);
            const toInsert = audios.map(audio => ({
                poem_id: audio.poem_id,
                audio_url: audio.audio_url,
                duration: audio.duration,
            }));

            const result = await prisma.poemAudio.createMany({
                data: toInsert,
                skipDuplicates: true,
            });

            totalInserted += result.count;
            console.log(`${file}: inserted ${result.count}/${audios.length}`);
        } catch (error) {
            console.error(`Error in ${file}:`, error.message);
            throw error;
        }
    }

    console.log(`\nAudios: ${totalInserted} total inserted\n`);
    return totalInserted;
};
