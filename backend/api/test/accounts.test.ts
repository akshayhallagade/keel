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

import { prisma } from '@keel/db'
import { createApp } from '../src/app'
import { signAccessToken } from '../src/lib/jwt'

// The real limiter allows 10 /auth requests per IP per 15 minutes, and every
// request here comes from 127.0.0.1.
vi.mock('../src/middleware/rateLimit.middleware', () => ({
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

/**
 * Account-level guarantees that only a real database can show: the
 * case-insensitive email index, and that a closed account is actually shut out
 * rather than just flagged.
 */

let server: Server
let base: string

const EMAILS = ['case@test.keel', 'closed@test.keel', 'race@test.keel']

beforeAll(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: EMAILS } } })
  await prisma.$disconnect()
  await new Promise((resolve) => server.close(() => resolve(null)))
})

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: { in: EMAILS } } })
})

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
  return {
    status: res.status,
    body: res.status === 204 ? null : await res.json(),
  }
}

const signup = (email: string, password = 'password123') =>
  call('/auth/signup', { body: { email, password, name: 'Tester' } })

describe('email is case-insensitive in the database', () => {
  // citext, so this holds even for a write that skips the zod schema.
  it('refuses a second account differing only by case', async () => {
    const first = await signup('case@test.keel')
    expect(first.status).toBe(201)

    const second = await signup('CASE@TEST.KEEL')
    expect(second.status).toBe(409)
  })

  it('signs in regardless of how the address is typed', async () => {
    await signup('case@test.keel')

    const res = await call('/auth/login', {
      body: { email: 'Case@Test.Keel', password: 'password123' },
    })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toEqual(expect.any(String))
  })
})

describe('password length', () => {
  // bcrypt hashes only the first 72 bytes and discards the rest, so without a
  // cap two different long passwords can open the same account.
  it('refuses a password longer than bcrypt actually reads', async () => {
    const res = await signup('race@test.keel', 'a'.repeat(73))

    expect(res.status).toBe(400)
  })

  it('accepts one exactly at the limit', async () => {
    const res = await signup('race@test.keel', 'a'.repeat(72))

    expect(res.status).toBe(201)
  })
})

describe('a closed account', () => {
  async function closeAccount(email: string) {
    const created = await signup(email)
    const { id } = await prisma.user.findFirstOrThrow({ where: { email } })
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { id, token: created.body.accessToken }
  }

  it('cannot sign in', async () => {
    await closeAccount('closed@test.keel')

    const res = await call('/auth/login', {
      body: { email: 'closed@test.keel', password: 'password123' },
    })

    // Same answer as a wrong password: the closure is not announced.
    expect(res.status).toBe(401)
  })

  // The token it was holding was valid a moment ago. requireAuth reads the
  // account on every request precisely so this stops working immediately.
  it('cannot use a token it already had', async () => {
    const { token } = await closeAccount('closed@test.keel')

    const res = await call('/users/me', { token })

    expect(res.status).toBe(401)
  })

  it('is invisible to check-email', async () => {
    await closeAccount('closed@test.keel')

    const res = await call('/auth/check-email', {
      body: { email: 'closed@test.keel' },
    })

    expect(res.body.exists).toBe(false)
  })

  // findByEmail skips soft-deleted rows, so the pre-check passes — but the
  // address still occupies the unique index. That collision used to surface
  // as an unhandled 500.
  it('still blocks its address from being re-registered, with 409', async () => {
    await closeAccount('closed@test.keel')

    const res = await signup('closed@test.keel')

    expect(res.status).toBe(409)
  })
})

describe('concurrent signups for one address', () => {
  // The existence check and the insert are not atomic, so the index is the
  // real arbiter. The loser must get a 409, not a 500.
  it('lets exactly one win and answers the other with 409', async () => {
    const results = await Promise.all([
      signup('race@test.keel'),
      signup('race@test.keel'),
      signup('race@test.keel'),
    ])

    const statuses = results.map((r) => r.status).sort()
    expect(statuses.filter((s) => s === 201)).toHaveLength(1)
    expect(statuses.filter((s) => s === 409)).toHaveLength(2)
    expect(statuses).not.toContain(500)
  })
})

describe('DELETE /users/me', () => {
  // onDelete: Cascade does not cover this. A soft delete is an UPDATE and a
  // cascade only fires on a real DELETE, so closing an account used to leave
  // every one of its todos live under an owner the app could no longer see.
  it('tombstones the account and everything it owns', async () => {
    const created = await signup('closed@test.keel')
    const token = created.body.accessToken
    const { id } = await prisma.user.findFirstOrThrow({
      where: { email: 'closed@test.keel' },
    })

    await call('/todos', { token, body: { text: 'one' } })
    await call('/todos', { token, body: { text: 'two' } })
    expect(await prisma.todo.count({ where: { userId: id } })).toBe(2)

    const res = await call('/users/me', { method: 'DELETE', token })
    expect(res.status).toBe(204)

    // Nothing removed — every row is still there, all of it tombstoned.
    const todos = await prisma.todo.findMany({ where: { userId: id } })
    expect(todos).toHaveLength(2)
    expect(todos.every((t) => t.deletedAt !== null)).toBe(true)

    const user = await prisma.user.findUnique({ where: { id } })
    expect(user?.deletedAt).toBeInstanceOf(Date)
  })

  it('stamps the account and its rows at the same instant', async () => {
    const created = await signup('closed@test.keel')
    const token = created.body.accessToken
    await call('/todos', { token, body: { text: 'one' } })

    await call('/users/me', { method: 'DELETE', token })

    const { id, deletedAt } = await prisma.user.findFirstOrThrow({
      where: { email: 'closed@test.keel' },
    })
    const todo = await prisma.todo.findFirstOrThrow({ where: { userId: id } })
    expect(todo.deletedAt?.getTime()).toBe(deletedAt?.getTime())
  })

  it('kills the token that made the request', async () => {
    const created = await signup('closed@test.keel')
    const token = created.body.accessToken

    await call('/users/me', { method: 'DELETE', token })

    expect((await call('/users/me', { token })).status).toBe(401)
    expect((await call('/todos', { token })).status).toBe(401)
  })

  it('requires a token', async () => {
    expect((await call('/users/me', { method: 'DELETE' })).status).toBe(401)
  })

  it('leaves other accounts alone', async () => {
    const keep = await signup('case@test.keel')
    await call('/todos', {
      token: keep.body.accessToken,
      body: { text: 'mine' },
    })

    const doomed = await signup('closed@test.keel')
    await call('/users/me', {
      method: 'DELETE',
      token: doomed.body.accessToken,
    })

    const res = await call('/todos', { token: keep.body.accessToken })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('soft delete keeps the row', () => {
  it('sets deletedAt rather than removing the user', async () => {
    await signup('closed@test.keel')
    const { id } = await prisma.user.findFirstOrThrow({
      where: { email: 'closed@test.keel' },
    })
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })

    // Gone as far as the app is concerned, still there in the table.
    const raw = await prisma.user.findUnique({ where: { id } })
    expect(raw).not.toBeNull()
    expect(raw?.deletedAt).toBeInstanceOf(Date)

    // And its todos were not cascaded away.
    const token = signAccessToken(id)
    const res = await call('/users/me', { token })
    expect(res.status).toBe(401)
  })
})
