import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const FALLBACK_TURSO_URL = "libsql://biobytes-tejas-vishwa.aws-ap-south-1.turso.io"
const FALLBACK_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkT1NRT1pKOEVmR1pETXA3cHhTemZnIiwib3JnX2lkIjoxMDAwMjE2ODM3fQ.3bcCRpUmkddyZnr87dduNRl3v33J3M96gIXbpPZ6jTd-kRhExPKVongsL4FbwJ8B-JagMI3Gl37C88VfnR7xBQ"

// Set process.env defaults IMMEDIATELY so Prisma engine's env("DATABASE_URL") reader never sees undefined
if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'undefined' || !process.env.DATABASE_URL.includes('libsql://')) {
  process.env.DATABASE_URL = FALLBACK_TURSO_URL
}
if (!process.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL === 'undefined' || !process.env.TURSO_DATABASE_URL.includes('libsql://')) {
  process.env.TURSO_DATABASE_URL = FALLBACK_TURSO_URL
}
if (!process.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN === 'undefined' || process.env.TURSO_AUTH_TOKEN.length < 10) {
  process.env.TURSO_AUTH_TOKEN = FALLBACK_TURSO_TOKEN
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Cast libsql to any to satisfy TypeScript strict signature between @libsql/client and @prisma/adapter-libsql
const adapter = new PrismaLibSQL(libsql as any)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
