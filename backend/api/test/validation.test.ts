import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  signupSchema,
  updateProfileSchema,
} from '@keel/validation'

// The route tests in routes.test.ts already cover the ordinary accept/reject cases
// through real HTTP. What is left here are the schema quirks that are easy to change
// by accident and expensive to notice: what gets silently dropped, and which rule is
// deliberately looser than it looks.

describe('signupSchema', () => {
  it('trims and lowercases the email so one address cannot become two accounts', () => {
    const parsed = signupSchema.parse({
      email: '  Demo@Keel.APP  ',
      password: 'password123',
      name: '  Demo  ',
    })

    expect(parsed.email).toBe('demo@keel.app')
    expect(parsed.name).toBe('Demo')
  })

  it('counts length after trimming, so spaces cannot pad a blank name', () => {
    expect(
      signupSchema.safeParse({
        email: 'demo@keel.app',
        password: 'password123',
        name: '     ',
      }).success,
    ).toBe(false)
  })
})

describe('loginSchema', () => {
  // Deliberately min(1), not min(8). Signup enforces the 8-character rule; if login
  // enforced it too, anyone who registered under an older, shorter rule would be
  // locked out of their own account with no way back in.
  it('accepts a password shorter than the signup minimum', () => {
    expect(
      loginSchema.safeParse({ email: 'demo@keel.app', password: 'old' })
        .success,
    ).toBe(true)
  })

  it('still requires some password', () => {
    expect(
      loginSchema.safeParse({ email: 'demo@keel.app', password: '' }).success,
    ).toBe(false)
  })
})

describe('updateProfileSchema', () => {
  it('accepts an empty patch, since callers send only what changed', () => {
    expect(updateProfileSchema.parse({})).toEqual({})
  })

  // The guard against mass assignment: the schema is the allowlist, so a column that
  // is not listed cannot be written no matter what the client puts in the body.
  it('drops fields that are not part of the allowlist', () => {
    const parsed = updateProfileSchema.parse({
      theme: 'dark',
      onboardedAt: '2020-01-01T00:00:00Z',
      passwordHash: 'injected',
      email: 'attacker@example.com',
      id: 'someone-else',
    })

    expect(parsed).toEqual({ theme: 'dark' })
  })

  it('trims answers before they reach the database', () => {
    expect(updateProfileSchema.parse({ occupation: '  Student  ' })).toEqual({
      occupation: 'Student',
    })
  })

  // completeOnboarding is z.literal(true) — a client that sends `false` to mean
  // "not yet" gets a 400, not a no-op. Omitting the field is the way to say that.
  it('rejects completeOnboarding: false rather than treating it as a no-op', () => {
    expect(
      updateProfileSchema.safeParse({ completeOnboarding: false }).success,
    ).toBe(false)
    expect(updateProfileSchema.safeParse({}).success).toBe(true)
  })
})
