import { Router } from 'express'
import {
  createTodo,
  deleteTodo,
  listTodos,
  restoreTodo,
  updateTodo,
} from '../controllers/todos.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const todoRoutes = Router()

/// Applied to the whole router rather than per route: a new endpoint added
/// below is protected by default, instead of being protected only if whoever
/// added it remembered.
todoRoutes.use(requireAuth)

todoRoutes.get('/', listTodos)
todoRoutes.post('/', createTodo)
todoRoutes.patch('/:id', updateTodo)
todoRoutes.delete('/:id', deleteTodo)

/// Undo. POST rather than PATCH because it is an action on the todo, not a
/// field the client gets to set — 'deleted' is not something a client writes.
todoRoutes.post('/:id/restore', restoreTodo)
