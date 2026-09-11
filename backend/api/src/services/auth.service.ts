import type { SignupInput, LoginInput } from '@keel/validation'
import { userRepository } from '../repositories/user.repository'
import { hashPassword, verifyPassword } from '../lib/hash'
import { signAccessToken } from '../lib/jwt'
import { Prisma } from '@keel/db'
import { AuthError, ConflictError } from '../lib/httpError'

/// Postgres' unique-violation code, as Prisma reports it.
const UNIQUE_VIOLATION = 'P2002'

const isDuplicateEmail = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError &&
  err.code === UNIQUE_VIOLATION

export const authService = {
  async signup(input: SignupInput) {
    const existing = await userRepository.findByEmail(input.email)
    // 409, not 401: nothing is wrong with who they are, the address is taken.
    if (existing)
      throw new ConflictError('An account with this email already exists')

    const passwordHash = await hashPassword(input.password)

    try {
      const user = await userRepository.create({
        email: input.email,
        name: input.name,
        passwordHash,
      })
      return { user, accessToken: signAccessToken(user.id) }
    } catch (err) {
      // The check above is not atomic with the insert, so the index is the
      // real arbiter. Two simultaneous signups for one address both pass the
      // check and one lands here — previously as an unhandled 500.
      //
      // A closed account reaches this too: findByEmail skips soft-deleted
      // rows, but their email still occupies the unique index.
      if (isDuplicateEmail(err))
        throw new ConflictError('An account with this email already exists')
      throw err
    }
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
