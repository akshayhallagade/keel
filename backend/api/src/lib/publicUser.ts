import type { User as DbUser } from '@keel/db'
import type { User } from '@keel/types'

/// Single place that decides what leaves the server. passwordHash and the
/// internal auth timestamps are dropped by construction, not by remembering to.
export const toPublicUser = (user: DbUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,

  occupation: user.occupation,
  livingSituation: user.livingSituation,
  moneyHabits: user.moneyHabits,
  investing: user.investing,
  organization: user.organization,
  hobbyInterest: user.hobbyInterest,
  reminderStyle: user.reminderStyle,
  primaryGoal: user.primaryGoal,

  onboardedAt: user.onboardedAt?.toISOString() ?? null,
  timezone: user.timezone,

  accent: user.accent,
  theme: user.theme,
  weekStart: user.weekStart,
  prefQuote: user.prefQuote,
  prefDigest: user.prefDigest,
  prefAlerts: user.prefAlerts,
  prefSip: user.prefSip,

  createdAt: user.createdAt.toISOString(),
})
