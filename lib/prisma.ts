import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const FALLBACK_TURSO_URL = "libsql://biobytes-tejas-vishwa.aws-ap-south-1.turso.io"
const FALLBACK_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkT1NRT1pKOEVmR1pETXA3cHhTemZnIiwib3JnX2lkIjoxMDAwMjE2ODM3fQ.3bcCRpUmkddyZnr87dduNRl3v33J3M96gIXbpPZ6jTd-kRhExPKVongsL4FbwJ8B-JagMI3Gl37C88VfnR7xBQ"

function getDatabaseUrl(): string {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  if (!url || url === 'undefined' || url.trim() === '') {
    return FALLBACK_TURSO_URL
  }
  return url
}

function getAuthToken(): string {
  const token = process.env.TURSO_AUTH_TOKEN
  if (!token || token === 'undefined' || token.trim() === '') {
    return FALLBACK_TURSO_TOKEN
  }
  return token
}

const dbUrl = getDatabaseUrl()
const authToken = getAuthToken()

const libsql = createClient({
  url: dbUrl,
  authToken: authToken,
})

// Cast libsql to any to satisfy TypeScript strict signature between @libsql/client and @prisma/adapter-libsql
const adapter = new PrismaLibSQL(libsql as any)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
