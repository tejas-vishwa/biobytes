import type { PrismaConfig } from 'prisma'

export default {
  seed: {
    run: 'npx tsx prisma/seed.ts',
  },
} satisfies PrismaConfig
