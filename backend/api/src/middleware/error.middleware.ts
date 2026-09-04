import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AuthError } from '../services/auth.service'
import { logger } from '../lib/logger'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request', details: err.issues })
    return
  }

  if (err instanceof AuthError) {
    res.status(401).json({ error: err.message })
    return
  }

  logger.error('Unhandled error', { err })
  res.status(500).json({ error: 'Internal server error' })
}
