/// Which list a todo sits in on the Todos screen. Separate from `dueAt` on
/// purpose — see docs/decisions.md.
export type TodoBucket = 'TODAY' | 'THIS_WEEK' | 'SOMEDAY'

/**
 * A todo as it crosses the wire.
 *
 * Dates are ISO strings because JSON has no date type. The client turns them
 * back into `Date` objects; nothing formats them into prose before sending.
 */
export interface Todo {
  id: string
  text: string
  area: string
  bucket: TodoBucket

  /// ISO instant, or null for no date at all.
  dueAt: string | null
  starred: boolean
  /// ISO instant when it was ticked off, or null while it is still open.
  completedAt: string | null

  createdAt: string
  updatedAt: string
}
