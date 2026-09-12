import { z } from 'zod'

/// The column is VARCHAR(500); rejecting here gives a 400 with a clear message
/// instead of a 500 from the driver.
const text = z.string().trim().min(1).max(500)
const area = z.string().trim().min(1).max(40).toUpperCase()

/// An instant, accepted as an ISO string and handed on as a Date.
/// `null` is meaningful and distinct from absent: null clears the date,
/// leaving the field out keeps whatever is stored.
const dueAt = z.iso.datetime({ offset: true }).nullable()

export const createTodoSchema = z.object({
  text,
  area: area.default('INBOX'),
  dueAt: dueAt.optional(),
  starred: z.boolean().default(false),
})

/// Every field optional — the client sends only what changed.
/// `completed` is a flag rather than a timestamp: the server decides *when*
/// something was completed, so a client cannot backdate its own streaks.
export const updateTodoSchema = z
  .object({
    text,
    area,
    dueAt,
    starred: z.boolean(),
    completed: z.boolean(),
  })
  .partial()

/// Filters for the list endpoint. All optional; absent means "no filter".
///
/// There is no bucket filter: Today / This week / Someday depend on the
/// reader's clock and their chosen first day of the week, so they are worked
/// out client-side from `dueAt` rather than asked of the database.
export const listTodosSchema = z.object({
  /// "true" / "false" as query strings, since these arrive in the URL.
  completed: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type ListTodosInput = z.infer<typeof listTodosSchema>
