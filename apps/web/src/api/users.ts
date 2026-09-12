import type { UpdateProfileInput } from '@keel/validation'
import type { User } from '@keel/types'
import { apiFetch } from './client'

export const getMe = () => apiFetch<User>('/users/me')

export const updateMe = (input: UpdateProfileInput) =>
  apiFetch<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

/// Closes the account and tombstones everything it owns. The server answers 204
/// with no body, and the caller's token stops working immediately.
export const deleteMe = () => apiFetch<null>('/users/me', { method: 'DELETE' })
