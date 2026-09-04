import { signupSchema, loginSchema } from '@keel/validation'
import { authService } from '../services/auth.service'
import { asyncHandler } from '../lib/asyncHandler'

export const signup = asyncHandler(async (req, res) => {
  const input = signupSchema.parse(req.body)
  const { user, accessToken } = await authService.signup(input)
  res.status(201).json({ user: toPublicUser(user), accessToken })
})

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body)
  const { user, accessToken } = await authService.login(input)
  res.status(200).json({ user: toPublicUser(user), accessToken })
})

function toPublicUser(user: {
  id: string
  email: string
  name: string
  createdAt: Date
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }
}
