import { PrismaClient } from '@prisma/client'

// Singleton PrismaClient. In dev, Next.js/ts-node-dev hot-reload would otherwise
// spawn a new client (and connection pool) on every reload; cache it on globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-export the generated Prisma types/namespace so consumers import from
// '@knowmind/db' rather than reaching into '@prisma/client' directly.
export * from '@prisma/client'
export { hashPassword, verifyPassword } from './password'
