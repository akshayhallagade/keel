import { z } from 'zod'

const answer = z.string().trim().min(1).max(120)

/// Every field optional: the same endpoint takes onboarding answers and later
/// preference edits, so callers send only what changed.
export const updateProfileSchema = z
  .object({
    // Matches NAME_MAX in auth.ts and the VarChar(80) on the column.
    name: z.string().trim().min(1).max(80),

    occupation: answer,
    livingSituation: answer,
    moneyHabits: answer,
    investing: answer,
    organization: answer,
    hobbyInterest: answer,
    reminderStyle: answer,
    primaryGoal: answer,

    /// Sent once, when the user finishes the onboarding questions.
    completeOnboarding: z.literal(true),

    timezone: z.string().trim().min(1).max(64),

    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a hex colour'),
    theme: z.enum(['light', 'dark']),
    weekStart: z.enum(['MON', 'SUN']),
    prefQuote: z.boolean(),
    prefDigest: z.boolean(),
    prefAlerts: z.boolean(),
    prefSip: z.boolean(),
  })
  .partial()

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
