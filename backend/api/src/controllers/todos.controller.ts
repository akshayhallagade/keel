import {
  createTodoSchema,
  listTodosSchema,
  updateTodoSchema,
} from '@keel/validation'
import { todoService } from '../services/todo.service'
import { asyncHandler } from '../lib/asyncHandler'
import { toPublicTodo } from '../lib/publicTodo'

/// requireAuth has run on every route here, so req.userId is always set.
/// The `!` is that guarantee, not a hope.

export const listTodos = asyncHandler(async (req, res) => {
  const filters = listTodosSchema.parse(req.query)
  const todos = await todoService.list(req.userId!, filters)
  res.status(200).json(todos.map(toPublicTodo))
})

export const createTodo = asyncHandler(async (req, res) => {
  const input = createTodoSchema.parse(req.body)
  const todo = await todoService.create(req.userId!, input)
  res.status(201).json(toPublicTodo(todo))
})

export const updateTodo = asyncHandler(async (req, res) => {
  const input = updateTodoSchema.parse(req.body)
  const todo = await todoService.update(req.userId!, req.params.id, input)
  res.status(200).json(toPublicTodo(todo))
})

export const deleteTodo = asyncHandler(async (req, res) => {
  await todoService.remove(req.userId!, req.params.id)
  // 204: it worked and there is nothing to say.
  res.status(204).end()
})

export const restoreTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.restore(req.userId!, req.params.id)
  res.status(200).json(toPublicTodo(todo))
})
