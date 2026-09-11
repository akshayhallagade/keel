import { beforeEach, describe, expect, it } from 'vitest'

import { clearAccessToken, getAccessToken, setAccessToken } from './client'

const KEY = 'keel.accessToken'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

/**
 * Where the token is kept is the whole meaning of the "Remember me" box.
 *
 * Before this, the box set a piece of React state nothing read and every
 * session went to localStorage regardless — so "remember me" was always on,
 * which is exactly the wrong default on a shared computer.
 */
describe('access token storage', () => {
  it('remembers across browser restarts when asked', () => {
    setAccessToken('tok', true)

    // localStorage is what survives the browser closing.
    expect(localStorage.getItem(KEY)).toBe('tok')
    expect(sessionStorage.getItem(KEY)).toBeNull()
  })

  it('keeps the session to the tab when not asked', () => {
    setAccessToken('tok', false)

    expect(sessionStorage.getItem(KEY)).toBe('tok')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  // The safer of the two: a caller that forgets the argument gets the
  // shorter-lived session, not the stickier one.
  it('defaults to the session, not to remembering', () => {
    setAccessToken('tok')

    expect(sessionStorage.getItem(KEY)).toBe('tok')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('reads back whichever store holds it', () => {
    setAccessToken('remembered', true)
    expect(getAccessToken()).toBe('remembered')

    clearAccessToken()
    setAccessToken('session-only', false)
    expect(getAccessToken()).toBe('session-only')
  })

  it('returns null when there is nothing stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  // Signing in remembered and then not — or the reverse — must not leave the
  // old token behind in the other store, still valid and still findable.
  it('leaves no stale token when the choice changes', () => {
    setAccessToken('old', true)
    setAccessToken('new', false)

    expect(localStorage.getItem(KEY)).toBeNull()
    expect(sessionStorage.getItem(KEY)).toBe('new')
    expect(getAccessToken()).toBe('new')

    setAccessToken('newer', true)
    expect(sessionStorage.getItem(KEY)).toBeNull()
    expect(localStorage.getItem(KEY)).toBe('newer')
  })

  it('signing out clears both stores', () => {
    // Both populated directly, so clearing cannot pass by only handling one.
    localStorage.setItem(KEY, 'a')
    sessionStorage.setItem(KEY, 'b')

    clearAccessToken()

    expect(localStorage.getItem(KEY)).toBeNull()
    expect(sessionStorage.getItem(KEY)).toBeNull()
    expect(getAccessToken()).toBeNull()
  })
})
