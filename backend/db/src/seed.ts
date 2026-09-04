import { prisma } from './client'

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@keel.app' },
    update: {},
    create: {
      email: 'demo@keel.app',
      name: 'Demo User',
      passwordHash: 'replace-with-real-hash',
    },
  })

  const workTag = await prisma.tag.upsert({
    where: { userId_name: { userId: user.id, name: 'work' } },
    update: {},
    create: { userId: user.id, name: 'work' },
  })
  const lifeTag = await prisma.tag.upsert({
    where: { userId_name: { userId: user.id, name: 'life' } },
    update: {},
    create: { userId: user.id, name: 'life' },
  })

  await prisma.todo.createMany({
    data: [
      {
        userId: user.id,
        text: 'Write project brief',
        tagId: workTag.id,
        group: 'TODAY',
        starred: true,
      },
      {
        userId: user.id,
        text: 'Book dentist appointment',
        tagId: lifeTag.id,
        group: 'THIS_WEEK',
      },
    ],
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
