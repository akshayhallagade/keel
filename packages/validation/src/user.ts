import { z } from 'zod'
import { THEMES, WEEK_STARTS } from '@keel/types'

const answer = z.string().trim().min(1).max(120)

/// The allowed values live in @keel/types, which has no dependencies, so the
/// list is written once and both the TypeScript type and this runtime check
/// derive from it.

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
    theme: z.enum(THEMES),
    weekStart: z.enum(WEEK_STARTS),
    prefQuote: z.boolean(),
    prefDigest: z.boolean(),
    prefAlerts: z.boolean(),
    prefSip: z.boolean(),
  })
  .partial()

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
