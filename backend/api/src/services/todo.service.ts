import type {
  CreateTodoInput,
  ListTodosInput,
  UpdateTodoInput,
} from '@keel/validation'
import { todoRepository } from '../repositories/todo.repository'
import { NotFoundError } from '../lib/httpError'

export const todoService = {
  list: (userId: string, filters: ListTodosInput) =>
    todoRepository.list(userId, filters),

  create: (userId: string, input: CreateTodoInput) =>
    todoRepository.create(userId, {
      text: input.text,
      area: input.area,
      bucket: input.bucket,
      starred: input.starred,
      // The schema hands over an ISO string; the column wants an instant.
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    }),

  async update(userId: string, id: string, input: UpdateTodoInput) {
    const { completed, dueAt, ...rest } = input

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
