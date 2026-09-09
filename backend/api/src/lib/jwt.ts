import jwt from 'jsonwebtoken'
import { env } from '../config/env'

const EXPIRES_IN = '7d'

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: EXPIRES_IN })

/// `iat` (issued-at, in whole seconds) is added by jsonwebtoken automatically and is
/// what requireAuth compares against the user's passwordChangedAt.
export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as { sub: string; iat: number }
