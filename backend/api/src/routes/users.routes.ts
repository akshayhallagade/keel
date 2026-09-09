import { Router } from 'express'
import { getMe, updateMe } from '../controllers/users.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const usersRoutes = Router()

usersRoutes.get('/me', requireAuth, getMe)
usersRoutes.patch('/me', requireAuth, updateMe)
