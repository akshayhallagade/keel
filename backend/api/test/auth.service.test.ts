import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../src/repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}))

import { signupSchema } from '@keel/validation'

import { authService } from '../src/services/auth.service'
import { ConflictError } from '../src/lib/httpError'
import { userRepository } from '../src/repositories/user.repository'

describe('authService.signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects signup when the email is already registered', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: '1',
      email: 'demo@keel.app',
      name: 'Demo',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(
      authService.signup({
        email: 'demo@keel.app',
        password: 'password123',
        name: 'Demo',
      }),
    ).rejects.toBeInstanceOf(ConflictError)
  })
})

describe('email normalisation', () => {
  it('lowercases and trims so casing cannot create a duplicate account', () => {
    const parsed = signupSchema.parse({
      email: '  Demo@Keel.App ',
      password: 'password123',
      name: 'Demo',
    })
    expect(parsed.email).toBe('demo@keel.app')
  })
})
