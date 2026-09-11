import { prisma, type Prisma } from '@keel/db'

/**
 * Every lookup excludes closed accounts (`deletedAt: null`).
 *
 * That is what makes the soft delete mean anything: without it, a closed
 * account could still sign in and still be found by `requireAuth`, and the
 * column would be decoration.
 *
 * `findFirst` rather than `findUnique` because findUnique only accepts unique
 * fields in its where clause, and `deletedAt` is not one.
 */
export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findFirst({ where: { email, deletedAt: null } }),

  findById: (id: string) =>
    prisma.user.findFirst({ where: { id, deletedAt: null } }),

  /// Only the fields requireAuth needs, so the per-request auth check stays a
  /// narrow read rather than pulling the whole row.
  findAuthState: (id: string) =>
    prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, passwordChangedAt: true },
    }),

  create: (data: { email: string; name: string; passwordHash: string }) =>
    prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),

  touchLastLogin: (id: string) =>
    prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
}
