import type { Todo } from '@keel/types'
import type { CreateTodoInput, UpdateTodoInput } from '@keel/validation'
import { apiFetch } from './client'

export const listTodos = () => apiFetch<Todo[]>('/todos')

export const createTodo = (input: CreateTodoInput) =>
  apiFetch<Todo>('/todos', { method: 'POST', body: JSON.stringify(input) })

export const updateTodo = (id: string, input: UpdateTodoInput) =>
  apiFetch<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

/// The server answers 204 with no body, which apiFetch turns into null.
export const deleteTodo = (id: string) =>
  apiFetch<null>(`/todos/${id}`, { method: 'DELETE' })
