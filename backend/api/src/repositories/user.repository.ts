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

  /**
   * Closes an account and tombstones everything it owns, in one transaction.
   *
   * `onDelete: Cascade` does not cover this. A soft delete is an UPDATE, and a
   * cascade only fires on a real DELETE — so without this, closing an account
   * left every one of its todos live and undeleted, owned by a user the app
   * can no longer see. The cascade stays on the relation as a backstop for a
   * genuine hard delete.
   *
   * One `updateMany` per domain. Add a line here when a table is added, the
   * same way `User` gains a back-relation for it.
   *
   * All rows share one timestamp, so "everything that went when this account
   * closed" is a single value to query by rather than a range.
   */
  closeAccount: (id: string) => {
    const closedAt = new Date()
    return prisma.$transaction([
      prisma.todo.updateMany({
        where: { userId: id, deletedAt: null },
        data: { deletedAt: closedAt },
      }),
      prisma.user.update({ where: { id }, data: { deletedAt: closedAt } }),
    ])
  },
}
