import type {
  CreateTodoInput,
  ListTodosInput,
  UpdateTodoInput,
} from '@keel/validation'
import { todoRepository } from '../repositories/todo.repository'
import { ConflictError, NotFoundError } from '../lib/httpError'

/// The Today screen shows three starred todos and slices the rest away. Without
/// a limit here, starring a fourth appeared to work and then it simply never
/// showed up — the screen promised "Top 3" and quietly broke it.
export const MAX_STARRED = 3

const TOP_3_FULL = `Top ${MAX_STARRED} is full. Unstar something first.`

export const todoService = {
  list: (userId: string, filters: ListTodosInput) =>
    todoRepository.list(userId, filters),

  /**
   * Refuses to star more than MAX_STARRED at once.
   *
   * `exceptId` leaves the todo being edited out of the count, so re-saving one
   * that is already starred does not count itself and trip the limit.
   *
   * Counting then writing is not atomic, so two requests racing could land a
   * fourth star. That is deliberate: the alternative is locking rows on every
   * edit, and the cost of being briefly wrong here is one extra item on a list
   * the user is looking at. Reach for a lock if this ever guards something
   * that matters.
   */
  async assertCanStar(userId: string, exceptId?: string) {
    const starred = await todoRepository.countStarred(userId, exceptId)
    if (starred >= MAX_STARRED) throw new ConflictError(TOP_3_FULL)
  },

  async create(userId: string, input: CreateTodoInput) {
    if (input.starred) await this.assertCanStar(userId)

    return todoRepository.create(userId, {
      text: input.text,
      area: input.area,
      starred: input.starred,
      // The schema hands over an ISO string; the column wants an instant.
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    })
  },

  async update(userId: string, id: string, input: UpdateTodoInput) {
    const { completed, dueAt, ...rest } = input

    if (input.starred) await this.assertCanStar(userId, id)

    const todo = await todoRepository.update(userId, id, {
      ...rest,
      // Absent means "leave it alone"; explicit null means "clear the date".
      ...(dueAt === undefined ? {} : { dueAt: dueAt ? new Date(dueAt) : null }),
      // The client sends a flag, the server stamps the time. A client cannot
      // decide *when* it finished something.
      ...(completed === undefined
        ? {}
        : { completedAt: completed ? new Date() : null }),
    })

    if (!todo) throw new NotFoundError('Todo not found')
    return todo
  },

  async remove(userId: string, id: string) {
    const deleted = await todoRepository.softDelete(userId, id)
    if (!deleted) throw new NotFoundError('Todo not found')
  },
}
