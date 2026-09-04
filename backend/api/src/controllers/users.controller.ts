import { usersService } from '../services/users.service'
import { asyncHandler } from '../lib/asyncHandler'

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getById(req.userId!)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res
    .status(200)
    .json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })
})
