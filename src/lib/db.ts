// @polsia:framework-owned — DO NOT EDIT.
// Code installed by polsia/template-next. Server-only PrismaClient singleton.
//
// Marketing-only deploys may omit DATABASE_URL. The client is created lazily so
// importing this module (or compiling auth/admin routes) does not crash boot or
// `next build` when Postgres is not configured. Callers that need the DB should
// check isDatabaseConfigured() first; otherwise the first query throws.
import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is not configured');
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazily-initialized Prisma singleton. Accessing any property constructs the
 * real client (and requires DATABASE_URL). Prefer dynamic import from routes
 * that already gate on isDatabaseConfigured().
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
