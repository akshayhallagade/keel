import { prisma } from './client'

// bcrypt hash of "password123" — precomputed so @keel/db needs no bcrypt dependency.
const DEMO_PASSWORD_HASH =
  '$2a$10$NwU1pw0AijSpK1GLBVOE1eQ5D3KeJ2O3eI/dk/6/te/Vw2to8P2HW'

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@keel.app' },
    update: {},
    create: {
      email: 'demo@keel.app',
      name: 'Demo User',
      passwordHash: DEMO_PASSWORD_HASH,
    },
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
