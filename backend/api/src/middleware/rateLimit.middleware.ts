import rateLimit from 'express-rate-limit'

/// Guards /auth against password guessing. Each bcrypt verify burns CPU, so an
/// unthrottled login endpoint is both a credential-stuffing hole and a cheap DoS.
/// Limits by IP, not by account, so nobody can lock a stranger out of their own login.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
})
