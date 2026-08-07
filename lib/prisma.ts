import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function getDatabaseUrl(): string {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  if (!url || url === 'undefined' || url.trim() === '') {
    return 'libsql://biobytes-tejas-vishwa.aws-ap-south-1.turso.io'
  }
  return url
}

function getAuthToken(): string | undefined {
  const token = process.env.TURSO_AUTH_TOKEN
  if (!token || token === 'undefined' || token.trim() === '') {
    return undefined
  }
  return token
}

const dbUrl = getDatabaseUrl()
const authToken = getAuthToken()

const libsql = createClient({
  url: dbUrl,
  ...(authToken ? { authToken } : {}),
})

const adapter = new PrismaLibSQL(libsql as any)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
