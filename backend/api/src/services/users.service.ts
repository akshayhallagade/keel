import { userRepository } from '../repositories/user.repository'

export const usersService = {
  getById: (id: string) => userRepository.findById(id),
}
