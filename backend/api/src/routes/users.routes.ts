import { Router } from 'express'
import { getMe } from '../controllers/users.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const usersRoutes = Router()

usersRoutes.get('/me', requireAuth, getMe)
