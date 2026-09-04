import jwt from 'jsonwebtoken'
import { env } from '../config/env'

const EXPIRES_IN = '7d'

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: EXPIRES_IN })

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as { sub: string }
