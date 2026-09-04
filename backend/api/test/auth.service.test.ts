import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../src/repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}))

import { authService, AuthError } from '../src/services/auth.service'
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
    ).rejects.toBeInstanceOf(AuthError)
  })
})
