import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:dev.db',
  },
})
