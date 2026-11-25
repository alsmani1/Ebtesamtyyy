import { PrismaClient } from '@prisma/client';

if(process.env.VITEST && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('ebtesamty_ux_verification'))throw new Error('Database tests require the isolated verification database. Run npm run test:isolated.');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
