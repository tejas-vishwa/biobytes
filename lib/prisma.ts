import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Cast libsql to any to satisfy TypeScript strict signature between @libsql/client and @prisma/adapter-libsql
const adapter = new PrismaLibSQL(libsql as any)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
