/// Every day, in ISO-8601 order. Mirrors the WeekStart enum in the schema.
/// Not just Monday and Sunday: Monday is ISO and most of Europe and Asia,
/// Sunday is the US, Canada and Japan, and Saturday is the norm across much of
/// the Middle East and North Africa.
export const WEEK_STARTS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const
export type WeekStart = (typeof WEEK_STARTS)[number]

export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export interface User {
  id: string
  email: string
  name: string

  // Onboarding answers — null until the user finishes onboarding.
  occupation: string | null
  livingSituation: string | null
  moneyHabits: string | null
  investing: string | null
  organization: string | null
  hobbyInterest: string | null
  reminderStyle: string | null
  primaryGoal: string | null

  /// Null means onboarding is unfinished; the app routes on this.
  onboardedAt: string | null

  timezone: string

  accent: string
  /// Narrow, not `string`: these mirror database enums, so a typo is a compile
  /// error at every call site rather than a value the column will reject at
  /// runtime.
  theme: Theme
  weekStart: WeekStart
  prefQuote: boolean
  prefDigest: boolean
  prefAlerts: boolean
  prefSip: boolean

  createdAt: string
}

export interface AuthSession {
  accessToken: string
  user: User
}
