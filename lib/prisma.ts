import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const DEFAULT_TURSO_URL = "libsql://database-blue-saddle-vercel-icfg-fqc2u6suiaf6lzcnjepopdwg.aws-us-east-1.turso.io"
const DEFAULT_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODYxOTc1OTIsImlkIjoiMDE5ZmUxYWMtNDcwMS03ODU2LWJjMmEtODhjNTZlZWM0NTMyIiwia2lkIjoiZkJ0VEtnN1dEZ0ZZOWZsblhPMUc0Ml9vdEV1UlhUZnRWWl8wdW5UVnk0NCIsInJpZCI6ImM2YWUyMmUzLTY2MTUtNGYwZi04MDFhLWQyYWY4NGU5ODVlMSJ9.zO5vLdRzmnRcAW9pBrM4mhyXCRPf8QtHwm3eYwv7iCZGl26uegAH1no10dPAG12V7DRAPGVzz9urcvHCQGRoCQ"

function getValidTursoUrl(): string {
  const raw = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.TURSO_URL
  if (raw && raw !== 'undefined' && raw.trim() !== '' && raw.includes('database-blue-saddle-vercel')) {
    return raw
  }
  return DEFAULT_TURSO_URL
}

function getValidTursoToken(): string {
  const raw = process.env.TURSO_AUTH_TOKEN
  if (raw && raw !== 'undefined' && raw.trim() !== '' && raw.startsWith('eyJhbGciOiJFZERTQSIsInR5cCI6') && raw.length > 200) {
    const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.TURSO_URL
    if (rawUrl && rawUrl.includes('database-blue-saddle-vercel')) {
      return raw
    }
  }
  return DEFAULT_TURSO_TOKEN
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export function createDbClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const tursoUrl = getValidTursoUrl()
  const tursoToken = getValidTursoToken()

  process.env.TURSO_DATABASE_URL = tursoUrl
  process.env.TURSO_AUTH_TOKEN = tursoToken

  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })
  ;(libsql as any).url = tursoUrl
  ;(libsql as any).authToken = tursoToken

  const adapter = new PrismaLibSQL(libsql as any)
  const instance = new PrismaClient({ adapter } as any)

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = instance
  }

  return instance
}

// Proxy wrapper so top-level imports of `prisma` execute createClient lazily only when a request method is invoked
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    const instance = createDbClient()
    const value = instance[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})


