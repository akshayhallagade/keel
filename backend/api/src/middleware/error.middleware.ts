import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../lib/httpError'
import { logger } from '../lib/logger'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // A schema rejected the body: the client sent something malformed.
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request', details: err.issues })
    return
  }

  // A service classified this itself and said which status it deserves.
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  // Anything else is unclassified, which means it is a bug. Log the detail,
  // tell the client nothing — stack traces and driver messages leak internals.
  logger.error('Unhandled error', { err })
  res.status(500).json({ error: 'Internal server error' })
}
