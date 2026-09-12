import type { User } from '@keel/types'

/**
 * The onboarding questions, and which user column each answer lands in.
 *
 * Shared rather than private to Onboarding.tsx, because Settings asks the same
 * questions again. The onboarding screen ends with "YOU CAN CHANGE ALL OF THIS
 * LATER IN SETTINGS" and for a while that was simply untrue — the answers were
 * saved and then unreachable.
 *
 * Answers are stored as the option text itself, not an id, matching the free
 * text columns. Those are free text because these lists are product copy and
 * change more often than a migration is worth. See docs/decisions.md.
 */
export interface Question {
  id: string
  kicker: string
  headline: string
  /// Short form for the Settings list, where the full headline is too long to
  /// sit above a row of chips.
  label: string
  sub: string
  options: string[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'role',
    kicker: 'ABOUT YOU',
    headline: 'What best describes you right now?',
    label: 'What you do',
    sub: 'Keel bends around your life, not the other way around.',
    options: [
      'Working professional',
      'Student',
      'Homemaker',
      'Freelancer / self-employed',
      'Retired',
      'Between jobs',
    ],
  },
  {
    id: 'living',
    kicker: 'ABOUT YOU',
    headline: 'What’s your living situation?',
    label: 'Living situation',
    sub: 'This helps us suggest the right routines and shared expenses.',
    options: [
      'Living alone',
      'With family',
      'With roommates',
      'With partner / spouse',
    ],
  },
  {
    id: 'money',
    kicker: 'MONEY',
    headline: 'How would you describe your money habits?',
    label: 'Money habits',
    sub: 'No judgment — we’ll match the level of detail to you.',
    options: [
      'I track every rupee',
      'I check in occasionally',
      'I just want a big-picture view',
      'I’m just getting started with tracking',
    ],
  },
  {
    id: 'invest',
    kicker: 'MONEY',
    headline: 'Do you invest currently?',
    label: 'Investing',
    sub: 'We’ll shape the money view around where you are today.',
    options: [
      'Yes, actively (stocks, mutual funds, etc.)',
      'Just PF / basic savings',
      'Not yet, but interested',
      'Not something I track',
    ],
  },
  {
    id: 'organized',
    kicker: 'ROUTINES & TASKS',
    headline: 'How organized do you feel about your routines and tasks?',
    label: 'How organised you feel',
    sub: 'Honest answers make better defaults.',
    options: [
      'Pretty on top of things',
      'Somewhere in between',
      'Honestly, kind of scattered',
      'Just want to start fresh',
    ],
  },
  {
    id: 'hobbies',
    kicker: 'INTERESTS',
    headline: 'What kind of hobbies or interests do you want to track?',
    label: 'Hobbies to track',
    sub: 'Keel can hold the fun parts of life too.',
    options: [
      'Reading',
      'Fitness / wellness',
      'Creative pursuits',
      'Multiple things',
      'Not really into hobby-tracking',
    ],
  },
  {
    id: 'reminders',
    kicker: 'NOTIFICATIONS',
    headline: 'How do you like to be reminded of things?',
    label: 'How to remind you',
    sub: 'We default to quiet. You choose how quiet.',
    options: [
      'Frequent nudges',
      'One daily summary',
      'Only when something’s urgent',
      'I’ll check the app myself',
    ],
  },
  {
    id: 'goal',
    kicker: 'YOUR GOAL',
    headline: 'What’s your biggest goal with Keel right now?',
    label: 'Your main goal',
    sub: 'One thing to point the keel at — you can change it anytime.',
    options: [
      'Get my finances in order',
      'Stay on top of daily life',
      'Build better habits',
      'Just explore and see what fits',
    ],
  },
]

/**
 * The eight columns an onboarding answer can land in.
 *
 * Named explicitly rather than `keyof UpdateProfileInput`, which also covers
 * `completeOnboarding` — a control flag, not a column — along with every
 * appearance setting. Being exact is what lets an answer be read back off a
 * `User` without a cast.
 */
export type AnswerField =
  | 'occupation'
  | 'livingSituation'
  | 'moneyHabits'
  | 'investing'
  | 'organization'
  | 'hobbyInterest'
  | 'reminderStyle'
  | 'primaryGoal'

/// Question ids in QUESTIONS map to the user columns the API expects.
export const FIELD_FOR_QUESTION: Record<string, AnswerField> = {
  role: 'occupation',
  living: 'livingSituation',
  money: 'moneyHabits',
  invest: 'investing',
  organized: 'organization',
  hobbies: 'hobbyInterest',
  reminders: 'reminderStyle',
  goal: 'primaryGoal',
}

/// The saved user, read back as answers keyed by question id. Unanswered
/// questions — anything skipped during onboarding — come back as ''.
export const answersFromUser = (user: User): Record<string, string> =>
  Object.fromEntries(
    QUESTIONS.map((q) => [q.id, user[FIELD_FOR_QUESTION[q.id]] ?? '']),
  )
