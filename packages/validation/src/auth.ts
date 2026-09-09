import { z } from 'zod'

// Trim and lowercase before validating: email is case-insensitive in practice, but a
// Postgres unique index is not, so "Demo@keel.app" and "demo@keel.app" would otherwise
// become two separate accounts. Normalising here covers signup and login identically.
const email = z.string().trim().toLowerCase().pipe(z.string().email())

export const signupSchema = z.object({
  email,
  password: z.string().min(8),
  name: z.string().trim().min(1),
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
})

export const checkEmailSchema = z.object({ email })

export type CheckEmailInput = z.infer<typeof checkEmailSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
