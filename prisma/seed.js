import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

import { insert as insertMeta } from './seed/insertMeta.js';
import { insert as insertPoets } from './seed/insertPoets.js';
import { insert as insertPoems } from './seed/insertPoems.js';
import { insert as insertLines } from './seed/insertLines.js';

const main = async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('\n=== Starting database seed ===\n');

        console.log('1  Seeding MetaData...');
        const metaCount = await insertMeta(prisma);

        console.log('2  Seeding Poets...');
        const poetsCount = await insertPoets(prisma);

        console.log('3  Seeding Poems...');
        const poemsCount = await insertPoems(prisma);

        console.log('4  Seeding PoemsLines...');
        const linesCount = await insertLines(prisma);

        console.log('=== Seed complete ===');
        console.log(`Summary:\n Meta: ${metaCount}\n Poets: ${poetsCount}\n Poems: ${poemsCount}\n Lines: ${linesCount}\n`);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

await main();