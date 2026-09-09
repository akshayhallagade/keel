import { prisma, type Prisma } from '@keel/db'

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  /// Only the fields requireAuth needs, so the per-request auth check stays a
  /// narrow read rather than pulling the whole row.
  findAuthState: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: { id: true, passwordChangedAt: true },
    }),

  create: (data: { email: string; name: string; passwordHash: string }) =>
    prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),

  touchLastLogin: (id: string) =>
    prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
}
