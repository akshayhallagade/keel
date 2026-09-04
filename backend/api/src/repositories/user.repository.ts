import { prisma } from '@keel/db'

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  create: (data: { email: string; name: string; passwordHash: string }) =>
    prisma.user.create({ data }),
}
