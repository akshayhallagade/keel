import type { LoginInput, SignupInput } from '@keel/validation'
import type { AuthSession } from '@keel/types'
import { apiFetch, setAccessToken, clearAccessToken } from './client'

export async function signup(input: SignupInput) {
  const session = await apiFetch<AuthSession>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAccessToken(session.accessToken)
  return session
}

export async function login(input: LoginInput) {
  const session = await apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAccessToken(session.accessToken)
  return session
}

export function logout() {
  clearAccessToken()
}
