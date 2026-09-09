import { signupSchema, loginSchema, checkEmailSchema } from '@keel/validation'
import { authService } from '../services/auth.service'
import { asyncHandler } from '../lib/asyncHandler'
import { toPublicUser } from '../lib/publicUser'

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

/// Tells the login screen whether to ask for a password or for signup details.
/// This does leak whether an address is registered — the auth rate limiter is
/// what keeps it from becoming a bulk account-enumeration tool.
export const checkEmail = asyncHandler(async (req, res) => {
  const { email } = checkEmailSchema.parse(req.body)
  res.status(200).json({ exists: await authService.emailExists(email) })
})
