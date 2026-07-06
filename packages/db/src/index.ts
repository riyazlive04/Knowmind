import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Neon's serverless driver needs a WebSocket implementation in Node (Node < 22
// has no global WebSocket). This is a no-op cost on Vercel's Node runtime.
neonConfig.webSocketConstructor = ws

// Singleton PrismaClient backed by the Neon driver adapter. Using the adapter
// (with the queryCompiler preview) means Prisma ships no native query engine —
// nothing platform-specific to bundle into serverless functions.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-export the generated Prisma types/namespace so consumers import from
// '@knowmind/db' rather than reaching into '@prisma/client' directly.
export * from '@prisma/client'
export { hashPassword, verifyPassword } from './password'
