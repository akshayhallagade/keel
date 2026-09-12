import type { Todo as DbTodo } from '@keel/db'
import type { Todo } from '@keel/types'

/// The one place that decides what a todo looks like on the wire, in the same
/// spirit as toPublicUser: fields are listed, so `userId` and `deletedAt` are
/// dropped by construction rather than by remembering to.
///
/// Dates go out as ISO strings — JSON has no date type, and an ISO instant is
/// unambiguous about the zone, which "9 MAR" is not.
export const toPublicTodo = (todo: DbTodo): Todo => ({
  id: todo.id,
  text: todo.text,
  area: todo.area,
  dueAt: todo.dueAt?.toISOString() ?? null,
  starred: todo.starred,
  completedAt: todo.completedAt?.toISOString() ?? null,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString(),
})
