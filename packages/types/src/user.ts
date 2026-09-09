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
  theme: string
  weekStart: string
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
