import type { PrismaConfig } from 'prisma'

export default {
  earlyAccess: true,
  seed: {
    run: 'npx tsx prisma/seed.ts',
  },
} satisfies PrismaConfig
