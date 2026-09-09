import type { UpdateProfileInput } from '@keel/validation'
import type { User } from '@keel/types'
import { apiFetch } from './client'

export const getMe = () => apiFetch<User>('/users/me')

export const updateMe = (input: UpdateProfileInput) =>
  apiFetch<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
