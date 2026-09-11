import type { LoginInput, SignupInput } from '@keel/validation'
import type { AuthSession } from '@keel/types'
import { apiFetch, setAccessToken, clearAccessToken } from './client'

export async function checkEmail(email: string) {
  const { exists } = await apiFetch<{ exists: boolean }>('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  return exists
}

/// Signing up always remembers: someone who just created an account did not
/// wander onto a shared machine by accident, and being logged out on the next
/// browser restart would be a strange welcome.
export async function signup(input: SignupInput) {
  const session = await apiFetch<AuthSession>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAccessToken(session.accessToken, true)
  return session
}

/// `remember` comes from the checkbox on the sign-in screen. False keeps the
/// session in sessionStorage, so it ends when the tab does.
export async function login(input: LoginInput, remember = false) {
  const session = await apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAccessToken(session.accessToken, remember)
  return session
}

export function logout() {
  clearAccessToken()
}
