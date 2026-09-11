import { z } from 'zod'

/// RFC 5321's limit on a whole address. Without a cap the column is unbounded
/// text and the only ceiling is express's 100kb body limit — which would let
/// someone register a 100KB email address.
const EMAIL_MAX = 254

/// bcrypt hashes at most the first 72 bytes and silently discards the rest, so
/// two passwords sharing their first 72 bytes are the same password to it.
/// Capping here does not change what bcrypt does — it stops the form implying
/// that anything past 72 was counted.
const PASSWORD_MAX = 72

const NAME_MAX = 80

// Trim and lowercase before validating: email is case-insensitive in practice, but a
// Postgres unique index is not, so "Demo@keel.app" and "demo@keel.app" would otherwise
// become two separate accounts. Normalising here covers signup and login identically.
// The column is citext as well, so this holds even for writes that skip zod.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().email().max(EMAIL_MAX))

export const signupSchema = z.object({
  email,
  password: z.string().min(8).max(PASSWORD_MAX),
  name: z.string().trim().min(1).max(NAME_MAX),
})

export const loginSchema = z.object({
  email,
  // Only a presence check. An existing password set before the cap existed
  // must still be able to sign in; bcrypt will compare its first 72 bytes.
  password: z.string().min(1),
})

export const checkEmailSchema = z.object({ email })

export type CheckEmailInput = z.infer<typeof checkEmailSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
