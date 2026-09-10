import { Router } from 'express'
import {
  createTodo,
  deleteTodo,
  listTodos,
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
