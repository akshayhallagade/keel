import { updateProfileSchema } from '@keel/validation'
import { usersService } from '../services/users.service'
import { asyncHandler } from '../lib/asyncHandler'
import { toPublicUser } from '../lib/publicUser'

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getById(req.userId!)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.status(200).json(toPublicUser(user))
})

export const updateMe = asyncHandler(async (req, res) => {
  const input = updateProfileSchema.parse(req.body)
  const user = await usersService.update(req.userId!, input)
  res.status(200).json(toPublicUser(user))
})
