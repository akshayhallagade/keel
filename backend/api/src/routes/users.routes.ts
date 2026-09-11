import { Router } from 'express'
import { deleteMe, getMe, updateMe } from '../controllers/users.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const usersRoutes = Router()

/// Applied to the router rather than per route, so an endpoint added below is
/// protected by default instead of only if whoever added it remembered.
usersRoutes.use(requireAuth)

usersRoutes.get('/me', getMe)
usersRoutes.patch('/me', updateMe)
usersRoutes.delete('/me', deleteMe)
