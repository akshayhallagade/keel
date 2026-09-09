import type { UpdateProfileInput } from '@keel/validation'
import { userRepository } from '../repositories/user.repository'

export const usersService = {
  getById: (id: string) => userRepository.findById(id),

  update: (id: string, input: UpdateProfileInput) => {
    const { completeOnboarding, ...fields } = input
    return userRepository.update(id, {
      ...fields,
      // Stamped server-side rather than trusting a client date, and only on the
      // first completion so re-answering later does not move the timestamp.
      ...(completeOnboarding ? { onboardedAt: new Date() } : {}),
    })
  },
}
