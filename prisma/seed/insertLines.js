import { getDirJsons, getContentOfJsonFile } from './accessFiles.js';

const LINE_CHUNK_SIZE = 5000;

const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const sortFiles = (files) => {
    return files.sort((a, b) => {
        if (a.startsWith('female') && b.startsWith('male')) return -1;
        if (a.startsWith('male') && b.startsWith('female')) return 1;

        const aNum = a.slice(a.indexOf('s') + 1, -5).split('_').map(Number);
        const bNum = b.slice(b.indexOf('s') + 1, -5).split('_').map(Number);

        for (let i = 0; i < 3; i++) {
            if (aNum[i] !== bNum[i]) return aNum[i] - bNum[i];
        }
        return 0;
    });
};

export const insert = async (prisma) => {
    const files = await getDirJsons('../../seedData/poemsLines');
    const orderedFiles = sortFiles(files);
    let totalInserted = 0;

    for (const file of orderedFiles) {
        try {
            const lines = await getContentOfJsonFile(`../../seedData/poemsLines/${file}`);
            const toInsert = lines.map(line => ({
                content: line.content,
                type: line.type,
                order: line.order,
                poemId: line.poemId,
            }));

            const chunks = chunkArray(toInsert, LINE_CHUNK_SIZE);
            let fileInserted = 0;

            for (const chunk of chunks) {
                const result = await prisma.poemsLines.createMany({
                    data: chunk,
                    skipDuplicates: true,
                });
                fileInserted += result.count;
                
                if (global.gc) global.gc();
            }

            totalInserted += fileInserted;
            console.log(`${file}: inserted ${fileInserted}/${lines.length}`);
        } catch (error) {
            console.error(`Error in ${file}:`, error.message);
            throw error;
        }
    }

    console.log(`\nPoemsLines: ${totalInserted} total inserted\n`);
    return totalInserted;
};