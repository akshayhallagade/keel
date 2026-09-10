import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { prisma } from '@keel/db'
import { createApp } from '../src/app'
import { hashPassword } from '../src/lib/hash'
import { signAccessToken } from '../src/lib/jwt'

/**
 * These hit a real database rather than a mocked repository, because what they
 * check is exactly what a mock cannot: that one user's token cannot reach
 * another user's rows. A mock will agree to anything you tell it.
 */

let server: Server
let base: string

let alice: string
let bob: string
let aliceToken: string
let bobToken: string

beforeAll(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  const passwordHash = await hashPassword('password123')
  const a = await prisma.user.upsert({
    where: { email: 'alice@test.keel' },
    update: {},
    create: { email: 'alice@test.keel', name: 'Alice', passwordHash },
  })
  const b = await prisma.user.upsert({
    where: { email: 'bob@test.keel' },
    update: {},
    create: { email: 'bob@test.keel', name: 'Bob', passwordHash },
  })
  alice = a.id
  bob = b.id
  aliceToken = signAccessToken(alice)
  bobToken = signAccessToken(bob)
})

afterAll(async () => {
  await prisma.todo.deleteMany({ where: { userId: { in: [alice, bob] } } })
  await prisma.user.deleteMany({ where: { id: { in: [alice, bob] } } })
  await prisma.$disconnect()
  await new Promise((resolve) => server.close(() => resolve(null)))
})

beforeEach(async () => {
  await prisma.todo.deleteMany({ where: { userId: { in: [alice, bob] } } })
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

const makeTodo = (token: string, body: Record<string, unknown> = {}) =>
  call('/todos', { token, body: { text: 'Call the plumber', ...body } })

describe('POST /todos', () => {
  it('creates a todo and returns it with an id', async () => {
    const res = await makeTodo(aliceToken)

    expect(res.status).toBe(201)
    expect(res.body.id).toEqual(expect.any(String))
    expect(res.body.text).toBe('Call the plumber')
    // Defaults, so the client can send only the text.
    expect(res.body.area).toBe('INBOX')
    expect(res.body.bucket).toBe('TODAY')
    expect(res.body.completedAt).toBeNull()
  })

  it('stores a due date as an instant, not the string it was given', async () => {
    const res = await makeTodo(aliceToken, {
      dueAt: '2026-03-09T18:30:00.000Z',
    })

    expect(res.status).toBe(201)
    expect(res.body.dueAt).toBe('2026-03-09T18:30:00.000Z')

    const row = await prisma.todo.findUnique({ where: { id: res.body.id } })
    expect(row?.dueAt).toBeInstanceOf(Date)
  })

  it('uppercases the area so chips match whatever case was typed', async () => {
    const res = await makeTodo(aliceToken, { area: 'home' })
    expect(res.body.area).toBe('HOME')
  })

  it.each([
    ['blank text', { text: '   ' }],
    ['text past the column limit', { text: 'x'.repeat(501) }],
    ['an unknown bucket', { bucket: 'WHENEVER' }],
    ['a due date that is not a date', { dueAt: 'next tuesday' }],
  ])('rejects %s with 400', async (_label, patch) => {
    const res = await makeTodo(aliceToken, patch)
    expect(res.status).toBe(400)
  })

  it('requires a token', async () => {
    const res = await call('/todos', { body: { text: 'No token' } })
    expect(res.status).toBe(401)
  })
})

describe('GET /todos', () => {
  it('returns only the calling user’s todos', async () => {
    await makeTodo(aliceToken, { text: 'Alice task' })
    await makeTodo(bobToken, { text: 'Bob task' })

    const res = await call('/todos', { token: aliceToken })

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].text).toBe('Alice task')
  })

  it('never leaks userId or deletedAt', async () => {
    await makeTodo(aliceToken)
    const res = await call('/todos', { token: aliceToken })

    expect(Object.keys(res.body[0])).not.toContain('userId')
    expect(Object.keys(res.body[0])).not.toContain('deletedAt')
  })

  it('filters by bucket', async () => {
    await makeTodo(aliceToken, { text: 'Today', bucket: 'TODAY' })
    await makeTodo(aliceToken, { text: 'Someday', bucket: 'SOMEDAY' })

    const res = await call('/todos?bucket=SOMEDAY', { token: aliceToken })

    expect(res.body).toHaveLength(1)
    expect(res.body[0].text).toBe('Someday')
  })

  it('filters open from completed', async () => {
    const open = await makeTodo(aliceToken, { text: 'Still open' })
    const done = await makeTodo(aliceToken, { text: 'Finished' })
    await call(`/todos/${done.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { completed: true },
    })

    const openRes = await call('/todos?completed=false', { token: aliceToken })
    const doneRes = await call('/todos?completed=true', { token: aliceToken })

    expect(openRes.body.map((t: { id: string }) => t.id)).toEqual([
      open.body.id,
    ])
    expect(doneRes.body.map((t: { id: string }) => t.id)).toEqual([
      done.body.id,
    ])
  })
})

describe('PATCH /todos/:id', () => {
  it('updates only what was sent', async () => {
    const created = await makeTodo(aliceToken, { area: 'HOME' })

    const res = await call(`/todos/${created.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { text: 'Call the electrician' },
    })

    expect(res.status).toBe(200)
    expect(res.body.text).toBe('Call the electrician')
    expect(res.body.area).toBe('HOME')
  })

  // The client says "done"; the server decides when. Otherwise a client could
  // backdate its own history.
  it('stamps completedAt itself when told completed: true', async () => {
    const created = await makeTodo(aliceToken)
    const before = Date.now()

    const res = await call(`/todos/${created.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { completed: true },
    })

    expect(res.body.completedAt).toEqual(expect.any(String))
    expect(new Date(res.body.completedAt).getTime()).toBeGreaterThanOrEqual(
      before - 1000,
    )
  })

  it('clears completedAt when un-completed', async () => {
    const created = await makeTodo(aliceToken)
    await call(`/todos/${created.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { completed: true },
    })

    const res = await call(`/todos/${created.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { completed: false },
    })

    expect(res.body.completedAt).toBeNull()
  })

  // Absent and null mean different things: leave it alone versus clear it.
  it('distinguishes an absent dueAt from an explicit null', async () => {
    const created = await makeTodo(aliceToken, {
      dueAt: '2026-03-09T18:30:00.000Z',
    })

    const untouched = await call(`/todos/${created.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { text: 'Renamed' },
    })
    expect(untouched.body.dueAt).toBe('2026-03-09T18:30:00.000Z')

    const cleared = await call(`/todos/${created.body.id}`, {
      method: 'PATCH',
      token: aliceToken,
      body: { dueAt: null },
    })
    expect(cleared.body.dueAt).toBeNull()
  })

  // The one that matters most.
  it('will not let one user edit another user’s todo', async () => {
    const aliceTodo = await makeTodo(aliceToken, { text: 'Alice private' })

    const res = await call(`/todos/${aliceTodo.body.id}`, {
      method: 'PATCH',
      token: bobToken,
      body: { text: 'Bob was here' },
    })

    // 404, not 403: a 403 would confirm the row exists.
    expect(res.status).toBe(404)

    const row = await prisma.todo.findUnique({
      where: { id: aliceTodo.body.id },
    })
    expect(row?.text).toBe('Alice private')
  })
})

describe('DELETE /todos/:id', () => {
  it('soft deletes — the row stays, with deletedAt set', async () => {
    const created = await makeTodo(aliceToken)

    const res = await call(`/todos/${created.body.id}`, {
      method: 'DELETE',
      token: aliceToken,
    })
    expect(res.status).toBe(204)

    const row = await prisma.todo.findUnique({ where: { id: created.body.id } })
    expect(row).not.toBeNull()
    expect(row?.deletedAt).toBeInstanceOf(Date)

    const list = await call('/todos', { token: aliceToken })
    expect(list.body).toHaveLength(0)
  })

  it('will not let one user delete another user’s todo', async () => {
    const aliceTodo = await makeTodo(aliceToken)

    const res = await call(`/todos/${aliceTodo.body.id}`, {
      method: 'DELETE',
      token: bobToken,
    })

    expect(res.status).toBe(404)
    const row = await prisma.todo.findUnique({
      where: { id: aliceTodo.body.id },
    })
    expect(row?.deletedAt).toBeNull()
  })

  it('404s on an id that does not exist', async () => {
    const res = await call('/todos/does-not-exist', {
      method: 'DELETE',
      token: aliceToken,
    })
    expect(res.status).toBe(404)
  })
})
