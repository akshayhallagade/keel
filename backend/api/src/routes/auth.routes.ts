import { Router } from 'express'
import { signup, login, checkEmail } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'

export const authRoutes = Router()

authRoutes.use(authLimiter)
authRoutes.post('/check-email', checkEmail)
authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
