import { PrismaClient } from './generated/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });


process.on('beforeExit', async () => {
    await prismaClient.$disconnect();
});
