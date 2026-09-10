import type { SignupInput, LoginInput } from '@keel/validation'
import { userRepository } from '../repositories/user.repository'
import { hashPassword, verifyPassword } from '../lib/hash'
import { signAccessToken } from '../lib/jwt'
import { AuthError, ConflictError } from '../lib/httpError'

export const authService = {
  async signup(input: SignupInput) {
    const existing = await userRepository.findByEmail(input.email)
    // 409, not 401: nothing is wrong with who they are, the address is taken.
    if (existing)
      throw new ConflictError('An account with this email already exists')

    const passwordHash = await hashPassword(input.password)
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    })

    return { user, accessToken: signAccessToken(user.id) }
  },

  async emailExists(email: string) {
    return (await userRepository.findByEmail(email)) !== null
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email)
    if (!user) throw new AuthError('Invalid email or password')

    const valid = await verifyPassword(input.password, user.passwordHash)
    if (!valid) throw new AuthError('Invalid email or password')

    await userRepository.touchLastLogin(user.id)

    return { user, accessToken: signAccessToken(user.id) }
  },
}
