import { prisma, type Prisma } from '@keel/db'

/**
 * Every function here takes `userId` first and puts it in the `where` clause.
 *
 * That is the whole ownership rule: there is no way to read or write a todo
 * without naming who it belongs to, so "forgot to filter by user" cannot
 * happen by omission — it would not compile.
 *
 * Soft-deleted rows are excluded everywhere. `deletedAt: null` is part of
 * every lookup, not something callers remember to add.
 */
export const todoRepository = {
  list: (userId: string, filters: { bucket?: string; completed?: boolean }) =>
    prisma.todo.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(filters.bucket ? { bucket: filters.bucket as never } : {}),
        // `completed: false` means "still open", which is completedAt IS NULL.
        ...(filters.completed === undefined
          ? {}
          : { completedAt: filters.completed ? { not: null } : null }),
      },
      orderBy: { createdAt: 'desc' },
    }),

  /// Returns null when the id does not exist *or* belongs to someone else.
  /// The caller cannot tell those apart, which is the point.
  findById: (userId: string, id: string) =>
    prisma.todo.findFirst({ where: { id, userId, deletedAt: null } }),

  /// How many todos are currently starred. Open ones only — a completed todo
  /// has left the Top 3 whether or not its star is still set.
  countStarred: (userId: string, exceptId?: string) =>
    prisma.todo.count({
      where: {
        userId,
        deletedAt: null,
        completedAt: null,
        starred: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    }),

  create: (userId: string, data: Omit<Prisma.TodoCreateInput, 'user'>) =>
    prisma.todo.create({
      data: { ...data, user: { connect: { id: userId } } },
    }),

  /// Scoped with updateMany rather than update: `update` matches on the primary
  /// key alone, so it would happily edit another user's row. updateMany takes a
  /// full where clause, and reports 0 rows when nothing matched.
  update: async (userId: string, id: string, data: Prisma.TodoUpdateInput) => {
    const { count } = await prisma.todo.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    })
    if (count === 0) return null
    return prisma.todo.findUnique({ where: { id } })
  },

  /// Soft delete. Returns false when nothing matched, so the service can 404.
  softDelete: async (userId: string, id: string) => {
    const { count } = await prisma.todo.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    return count > 0
  },
}
