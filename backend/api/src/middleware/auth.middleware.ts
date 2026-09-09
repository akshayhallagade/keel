import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import { userRepository } from '../repositories/user.repository'

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : undefined

  if (!token) {
    res.status(401).json({ error: 'Missing access token' })
    return
  }

  let userId: string
  let issuedAt: number
  try {
    const payload = verifyAccessToken(token)
    userId = payload.sub
    issuedAt = payload.iat
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' })
    return
  }

  // ponytail: one extra read per authenticated request buys password-change
  // revocation on stateless JWTs. Cache or move to short-lived tokens + refresh
  // if this read ever shows up in latency.
  const user = await userRepository.findAuthState(userId)
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired access token' })
    return
  }

  // Both sides in whole seconds: jwt `iat` is floored, so comparing against a
  // millisecond timestamp would reject a token issued in the same second it was set.
  const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000)
  if (issuedAt < changedAt) {
    res.status(401).json({ error: 'Password changed. Please sign in again.' })
    return
  }

  req.userId = userId
  next()
}
