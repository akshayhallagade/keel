import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

vi.mock('../src/repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findAuthState: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    touchLastLogin: vi.fn(),
  },
}))

// The real limiter allows 10 /auth requests per IP per 15 minutes. Every test here
// comes from 127.0.0.1, so without this the eleventh assertion would start failing
// with 429s that have nothing to do with what is being tested.
vi.mock('../src/middleware/rateLimit.middleware', () => ({
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import { createApp } from '../src/app'
import { userRepository } from '../src/repositories/user.repository'
import { hashPassword } from '../src/lib/hash'
import { signAccessToken } from '../src/lib/jwt'

let server: Server
let base: string

/// One real bcrypt hash, computed once. bcrypt is deliberately slow and there is no
/// reason to pay for it in every login test.
let knownHash: string

beforeAll(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  knownHash = await hashPassword('correct-horse')
})

afterAll(() => new Promise((resolve) => server.close(() => resolve(null))))

beforeEach(() => vi.clearAllMocks())

type Options = { token?: string; body?: unknown; method?: string }

async function call(path: string, { token, body, method }: Options = {}) {
  const res = await fetch(base + path, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, body: await res.json() }
}

/// A full database row. Written out in full rather than partially cast, so a column
/// added to the schema and forgotten in toPublicUser shows up here.
function dbUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    email: 'demo@keel.app',
    passwordHash: knownHash,
    name: 'Demo',
    occupation: null,
    livingSituation: null,
    moneyHabits: null,
    investing: null,
    organization: null,
    hobbyInterest: null,
    reminderStyle: null,
    primaryGoal: null,
    onboardedAt: null,
    timezone: 'Asia/Kolkata',
    emailVerifiedAt: null,
    lastLoginAt: null,
    passwordChangedAt: new Date('2026-01-01T00:00:00Z'),
    accent: '#C64F3B',
    theme: 'light',
    weekStart: 'MON',
    prefQuote: true,
    prefDigest: true,
    prefAlerts: true,
    prefSip: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as never
}

describe('GET /health', () => {
  it('reports ok without any auth', async () => {
    expect(await call('/health')).toEqual({
      status: 200,
      body: { status: 'ok' },
    })
  })
})

describe('POST /auth/signup', () => {
  it('creates the account and returns a usable session', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(userRepository.create).mockResolvedValue(dbUser())

    const res = await call('/auth/signup', {
      body: { email: 'demo@keel.app', password: 'password123', name: 'Demo' },
    })

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.user.email).toBe('demo@keel.app')
    // A fresh account must route to onboarding, not home.
    expect(res.body.user.onboardedAt).toBeNull()
  })

  it('stores the password as a hash, never the plaintext', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(userRepository.create).mockResolvedValue(dbUser())

    await call('/auth/signup', {
      body: { email: 'demo@keel.app', password: 'password123', name: 'Demo' },
    })

    const { passwordHash } = vi.mocked(userRepository.create).mock.calls[0][0]
    expect(passwordHash).not.toBe('password123')
    expect(passwordHash).toMatch(/^\$2[aby]\$/)
  })

  it('normalises the email before it reaches the database', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(userRepository.create).mockResolvedValue(dbUser())

    await call('/auth/signup', {
      body: {
        email: '  Demo@Keel.app ',
        password: 'password123',
        name: 'Demo',
      },
    })

    expect(vi.mocked(userRepository.create).mock.calls[0][0].email).toBe(
      'demo@keel.app',
    )
  })

  it('refuses an email that is already registered', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(dbUser())

    const res = await call('/auth/signup', {
      body: { email: 'demo@keel.app', password: 'password123', name: 'Demo' },
    })

    // 409, not 401: nothing is wrong with who they are, the address is taken.
    // A 401 here would tell the client to go and re-authenticate, which cannot
    // help.
    expect(res.status).toBe(409)
    expect(userRepository.create).not.toHaveBeenCalled()
  })

  it.each([
    ['a password under 8 characters', { password: 'short' }],
    ['a malformed email', { email: 'not-an-email' }],
    ['a blank name', { name: '   ' }],
  ])(
    'rejects %s with 400 and never touches the database',
    async (_label, patch) => {
      const res = await call('/auth/signup', {
        body: {
          email: 'demo@keel.app',
          password: 'password123',
          name: 'Demo',
          ...patch,
        },
      })

      expect(res.status).toBe(400)
      expect(userRepository.create).not.toHaveBeenCalled()
    },
  )
})

describe('POST /auth/login', () => {
  it('returns a session for the right password', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(dbUser())
    vi.mocked(userRepository.touchLastLogin).mockResolvedValue(dbUser())

    const res = await call('/auth/login', {
      body: { email: 'demo@keel.app', password: 'correct-horse' },
    })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(userRepository.touchLastLogin).toHaveBeenCalledWith('u1')
  })

  // The two failures must be indistinguishable from outside, or /auth/login becomes
  // an account-enumeration endpoint on its own.
  it('gives the same 401 for a wrong password and an unknown address', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(dbUser())
    const wrongPassword = await call('/auth/login', {
      body: { email: 'demo@keel.app', password: 'nope-not-it' },
    })

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    const unknownEmail = await call('/auth/login', {
      body: { email: 'nobody@keel.app', password: 'nope-not-it' },
    })

    expect(wrongPassword.status).toBe(401)
    expect(unknownEmail).toEqual(wrongPassword)
  })

  it('does not record a login when the password is wrong', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(dbUser())

    await call('/auth/login', {
      body: { email: 'demo@keel.app', password: 'nope-not-it' },
    })

    expect(userRepository.touchLastLogin).not.toHaveBeenCalled()
  })
})

describe('GET /users/me', () => {
  it('returns the profile for a valid token', async () => {
    vi.mocked(userRepository.findAuthState).mockResolvedValue(dbUser())
    vi.mocked(userRepository.findById).mockResolvedValue(dbUser())

    const res = await call('/users/me', { token: signAccessToken('u1') })

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('demo@keel.app')
  })

  // toPublicUser is the only thing standing between the hash and the wire.
  it('never leaks the password hash or internal auth timestamps', async () => {
    vi.mocked(userRepository.findAuthState).mockResolvedValue(dbUser())
    vi.mocked(userRepository.findById).mockResolvedValue(dbUser())

    const res = await call('/users/me', { token: signAccessToken('u1') })

    expect(Object.keys(res.body)).not.toContain('passwordHash')
    expect(Object.keys(res.body)).not.toContain('passwordChangedAt')
    expect(Object.keys(res.body)).not.toContain('emailVerifiedAt')
  })

  it('rejects a request with no Authorization header', async () => {
    const res = await call('/users/me')

    expect(res.status).toBe(401)
    expect(userRepository.findById).not.toHaveBeenCalled()
  })

  it('rejects a token that is not a JWT', async () => {
    const res = await call('/users/me', { token: 'garbage' })

    expect(res.status).toBe(401)
    expect(userRepository.findById).not.toHaveBeenCalled()
  })

  it('rejects a JWT whose signature does not match', async () => {
    const forged = signAccessToken('u1').slice(0, -4) + 'aaaa'

    const res = await call('/users/me', { token: forged })

    expect(res.status).toBe(401)
    expect(userRepository.findById).not.toHaveBeenCalled()
  })

  it('rejects a token issued before the password was changed', async () => {
    const token = signAccessToken('u1')
    vi.mocked(userRepository.findAuthState).mockResolvedValue(
      dbUser({ passwordChangedAt: new Date(Date.now() + 60_000) }),
    )

    const res = await call('/users/me', { token })

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/password changed/i)
  })

  it('rejects a token for a user that no longer exists', async () => {
    vi.mocked(userRepository.findAuthState).mockResolvedValue(null)

    const res = await call('/users/me', { token: signAccessToken('u1') })

    expect(res.status).toBe(401)
  })
})

describe('PATCH /users/me', () => {
  beforeEach(() => {
    vi.mocked(userRepository.findAuthState).mockResolvedValue(dbUser())
    vi.mocked(userRepository.update).mockResolvedValue(dbUser())
  })

  it('saves onboarding answers and stamps onboardedAt server-side', async () => {
    const res = await call('/users/me', {
      method: 'PATCH',
      token: signAccessToken('u1'),
      body: {
        occupation: 'Student',
        primaryGoal: 'Get my finances in order',
        completeOnboarding: true,
      },
    })

    expect(res.status).toBe(200)
    const [id, data] = vi.mocked(userRepository.update).mock.calls[0]
    expect(id).toBe('u1')
    expect(data.occupation).toBe('Student')
    expect(data.onboardedAt).toBeInstanceOf(Date)
    // completeOnboarding is a control flag, not a column.
    expect(data).not.toHaveProperty('completeOnboarding')
  })

  it('leaves onboardedAt alone on an ordinary preference edit', async () => {
    await call('/users/me', {
      method: 'PATCH',
      token: signAccessToken('u1'),
      body: { theme: 'dark' },
    })

    const [, data] = vi.mocked(userRepository.update).mock.calls[0]
    expect(data).toEqual({ theme: 'dark' })
  })

  // A week does not only start on Monday or Sunday: Saturday is the norm across
  // much of the Middle East and North Africa. All seven are accepted.
  it.each(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])(
    'accepts %s as a week start',
    async (weekStart) => {
      const res = await call('/users/me', {
        method: 'PATCH',
        token: signAccessToken('u1'),
        body: { weekStart },
      })

      expect(res.status).toBe(200)
      const [, data] = vi.mocked(userRepository.update).mock.calls[0]
      expect(data).toEqual({ weekStart })
    },
  )

  it.each([
    ['an accent that is not a hex colour', { accent: 'red' }],
    ['an unknown theme', { theme: 'sepia' }],
    ['a week start that is not a day', { weekStart: 'FUNDAY' }],
    ['a lowercase week start', { weekStart: 'wed' }],
    ['an answer past the length cap', { occupation: 'x'.repeat(121) }],
    ['a name past the length cap', { name: 'x'.repeat(81) }],
  ])('rejects %s with 400', async (_label, patch) => {
    const res = await call('/users/me', {
      method: 'PATCH',
      token: signAccessToken('u1'),
      body: patch,
    })

    expect(res.status).toBe(400)
    expect(userRepository.update).not.toHaveBeenCalled()
  })

  // updateProfileSchema is the allowlist. Anything outside it must be dropped before
  // it reaches the repository, or this endpoint lets a client rewrite its own email,
  // password hash or onboarding state.
  it('drops columns the client is not allowed to set', async () => {
    await call('/users/me', {
      method: 'PATCH',
      token: signAccessToken('u1'),
      body: {
        theme: 'dark',
        email: 'attacker@example.com',
        passwordHash: 'injected',
        onboardedAt: '2020-01-01T00:00:00Z',
        id: 'someone-else',
      },
    })

    const [id, data] = vi.mocked(userRepository.update).mock.calls[0]
    expect(id).toBe('u1')
    expect(data).toEqual({ theme: 'dark' })
  })

  it('requires a token', async () => {
    const res = await call('/users/me', {
      method: 'PATCH',
      body: { theme: 'dark' },
    })

    expect(res.status).toBe(401)
    expect(userRepository.update).not.toHaveBeenCalled()
  })
})
