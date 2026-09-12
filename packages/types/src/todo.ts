/**
 * A todo as it crosses the wire.
 *
 * Dates are ISO strings because JSON has no date type. The client turns them
 * back into `Date` objects; nothing formats them into prose before sending.
 *
 * There is no `bucket` field. Which list a todo belongs in — Today, This week,
 * Someday — is a question about the present, so it is worked out from `dueAt`
 * when the list is drawn rather than stored. A stored answer is only true on
 * the day it was written.
 */
export interface Todo {
  id: string
  text: string
  area: string

  /// ISO instant, or null for no date at all.
  dueAt: string | null
  starred: boolean
  /// ISO instant when it was ticked off, or null while it is still open.
  completedAt: string | null

  createdAt: string
  updatedAt: string
}
