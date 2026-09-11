const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const ACCESS_TOKEN_KEY = 'keel.accessToken'

/**
 * Where the token lives decides how long the session lasts, and that is what
 * the "Remember me" box on the sign-in screen chooses.
 *
 * - remembered  -> localStorage, survives closing the browser
 * - not         -> sessionStorage, gone when the tab closes
 *
 * The box previously set a piece of React state that nothing read, so it did
 * nothing at all — every session was remembered whether or not it was ticked,
 * which is the wrong default on a shared computer.
 */
export const getAccessToken = () =>
  // sessionStorage first: a session token is the more recent intent, and
  // clearing below means both are never set at once anyway.
  sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
  localStorage.getItem(ACCESS_TOKEN_KEY)

export const setAccessToken = (token: string, remember = false) => {
  // Always clear both, so switching between remembered and not cannot leave a
  // stale token behind in the other store.
  clearAccessToken()
  const store = remember ? localStorage : sessionStorage
  store.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? res.statusText)
  }

  return body as T
}
