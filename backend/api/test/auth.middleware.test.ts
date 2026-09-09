import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../src/repositories/user.repository', () => ({
  userRepository: { findAuthState: vi.fn() },
}))

import { requireAuth } from '../src/middleware/auth.middleware'
import { userRepository } from '../src/repositories/user.repository'
import { signAccessToken, verifyAccessToken } from '../src/lib/jwt'

function run(token: string) {
  const req = {
    headers: { authorization: `Bearer ${token}` },
  } as never as Parameters<typeof requireAuth>[0]
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as never as Parameters<typeof requireAuth>[1]
  const next = vi.fn()
  return { promise: requireAuth(req, res, next), req, res, next }
}

describe('requireAuth password-change revocation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('accepts a token issued in the same second the password changed', async () => {
    const token = signAccessToken('u1')
    const { iat } = verifyAccessToken(token)
    // Same second, but 999ms in — a millisecond comparison would wrongly reject this
    // and log out every user immediately after signup.
    vi.mocked(userRepository.findAuthState).mockResolvedValue({
      id: 'u1',
      passwordChangedAt: new Date(iat * 1000 + 999),
    })

    const { promise, res, next } = run(token)
    await promise

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('rejects a token issued before the password changed', async () => {
    const token = signAccessToken('u1')
    const { iat } = verifyAccessToken(token)
    vi.mocked(userRepository.findAuthState).mockResolvedValue({
      id: 'u1',
      passwordChangedAt: new Date((iat + 10) * 1000),
    })

    const { promise, res, next } = run(token)
    await promise

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
