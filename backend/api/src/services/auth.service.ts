import type { SignupInput, LoginInput } from '@keel/validation'
import { userRepository } from '../repositories/user.repository'
import { hashPassword, verifyPassword } from '../lib/hash'
import { signAccessToken } from '../lib/jwt'

export class AuthError extends Error {}

export const authService = {
  async signup(input: SignupInput) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing)
      throw new AuthError('An account with this email already exists')

    const passwordHash = await hashPassword(input.password)
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    })

    return { user, accessToken: signAccessToken(user.id) }
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email)
    if (!user) throw new AuthError('Invalid email or password')

    const valid = await verifyPassword(input.password, user.passwordHash)
    if (!valid) throw new AuthError('Invalid email or password')

    return { user, accessToken: signAccessToken(user.id) }
  },
}
