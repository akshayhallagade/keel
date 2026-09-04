const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const ACCESS_TOKEN_KEY = 'keel.accessToken'

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const setAccessToken = (token: string) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
export const clearAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY)

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
