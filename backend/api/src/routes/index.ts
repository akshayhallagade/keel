import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { usersRoutes } from './users.routes'
import { todoRoutes } from './todos.routes'

export const routes = Router()

routes.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))
routes.use('/auth', authRoutes)
routes.use('/users', usersRoutes)
routes.use('/todos', todoRoutes)
