import type {
  Alarm,
  Hobby,
  HobbyTry,
  Profile,
  Project,
  Routine,
  Todo,
} from './types'

export const SEED_TODOS: Todo[] = [
  {
    text: 'Finish quarterly budget review',
    tag: 'FINANCE',
    due: 'DUE TODAY',
    star: true,
    group: 'TODAY',
  },
  {
    text: 'Sketch app onboarding flow',
    tag: 'SIDE PROJECT',
    due: 'DUE TODAY',
    star: true,
    group: 'TODAY',
  },
  {
    text: 'Renew gym membership',
    tag: 'HEALTH',
    due: 'OVERDUE 2D · MONTHLY',
    star: false,
    group: 'TODAY',
  },
  {
    text: 'Order "Deep Work" from wishlist',
    tag: 'WISHLIST',
    due: 'FRI',
    star: false,
    group: 'THIS WEEK',
  },
  {
    text: 'Call plumber about kitchen tap',
    tag: 'HOME',
    due: 'TUE 5:00 PM',
    star: false,
    group: 'THIS WEEK',
  },
  {
    text: 'Update resume PDF',
    tag: 'CAREER',
    due: 'SAT',
    star: false,
    group: 'THIS WEEK',
  },
  {
    text: 'Learn film photography basics',
    tag: 'HOBBY',
    due: '',
    star: false,
    group: 'SOMEDAY',
  },
  {
    text: 'Plan Goa trip with friends',
    tag: 'LIFE',
    due: '',
    star: false,
    group: 'SOMEDAY',
  },
]

export const SEED_DONE = [
  { text: 'Pay electricity bill' },
  { text: 'Reply to landlord' },
  { text: 'Book dentist slot' },
]

export const SEED_ROUTINES: Routine[] = [
  {
    name: 'Meditate 10 min',
    period: 'MORNING',
    time: '6:30 AM',
    done: true,
    streak: 24,
    week: [true, true, true, false, true, true, true],
  },
  {
    name: 'Journal entry',
    period: 'MORNING',
    time: '7:00 AM',
    done: true,
    streak: 12,
    week: [true, false, true, true, true, false, true],
  },
  {
    name: 'Read 20 pages',
    period: 'MORNING',
    time: '8:00 AM',
    done: false,
    missed: true,
    streak: 0,
    week: [true, true, false, false, true, false, false],
  },
  {
    name: 'Plan tomorrow’s top 3',
    period: 'EVENING',
    time: '9:30 PM',
    done: false,
    streak: 8,
    week: [true, true, true, true, true, true, false],
  },
  {
    name: 'No screens after 10:30',
    period: 'EVENING',
    time: '10:30 PM',
    done: false,
    streak: 3,
    week: [false, true, true, false, true, true, false],
  },
]

export const SEED_ALARMS: Alarm[] = [
  { time: '6:00', ampm: 'AM', label: 'Wake up', days: 'EVERY DAY', on: true },
  {
    time: '6:25',
    ampm: 'AM',
    label: 'Meditation',
    days: 'MON – FRI · LINKED TO ROUTINE',
    on: true,
  },
  {
    time: '4:15',
    ampm: 'PM',
    label: 'Gym time',
    days: 'MON · WED · SAT',
    on: true,
  },
  {
    time: '10:30',
    ampm: 'PM',
    label: 'Wind down — screens off',
    days: 'EVERY DAY · LINKED TO ROUTINE',
    on: false,
  },
]

export const SEED_HOBBIES: Hobby[] = [
  {
    name: 'Film photography',
    meta: 'LAST SESSION THU · DEVELOPED FIRST ROLL',
    sessions: 12,
  },
  {
    name: 'Guitar',
    meta: 'LAST SESSION YESTERDAY · BARRE CHORDS',
    sessions: 9,
  },
  {
    name: 'Cooking',
    meta: 'LAST SESSION SUN · MISO RAMEN FROM SCRATCH',
    sessions: 7,
  },
  {
    name: 'Sketching',
    meta: 'LAST SESSION 3 WEEKS AGO · ',
    quiet: true,
    sessions: 3,
  },
]

export const SEED_HOBBY_TRY: HobbyTry[] = [
  { name: 'Pottery — weekend class' },
  { name: 'Bouldering' },
]

export const SEED_PROJECTS: Project[] = [
  {
    name: 'Personal finance cleanup',
    tag: 'FINANCE',
    paused: false,
    pinned: true,
    tasks: [
      { text: 'Cancel unused subscriptions', done: true },
      { text: 'Move savings to high-yield account', done: true },
      { text: 'Set up autopay for all bills', done: true },
      { text: 'Consolidate old fixed deposits', done: false },
      { text: 'Review insurance coverage', done: false },
    ],
  },
  {
    name: 'Productivity app (this one)',
    tag: 'BUILD',
    paused: false,
    tasks: [
      { text: 'Define core screens', done: true },
      { text: 'Sketch onboarding flow', done: false },
      { text: 'Build routines page', done: false },
      { text: 'Wire up projects page', done: false },
    ],
  },
  {
    name: 'Half-marathon training',
    tag: 'HEALTH',
    paused: false,
    pinned: true,
    tasks: [
      { text: 'Base-building weeks 1–4', done: true },
      { text: 'Tempo run block', done: true },
      { text: 'Long run — 12 km Sunday', done: false },
      { text: 'Taper week', done: false },
    ],
  },
  {
    name: 'Home office refresh',
    tag: 'HOME',
    paused: false,
    tasks: [
      { text: 'Declutter desk', done: true },
      { text: 'Order desk lamp', done: false },
      { text: 'New ergonomic chair', done: false },
      { text: 'Cable management', done: false },
    ],
  },
  {
    name: 'Photography portfolio site',
    tag: 'HOBBY',
    paused: true,
    tasks: [
      { text: 'Pick 20 best shots', done: true },
      { text: 'Choose a template', done: false },
      { text: 'Write about page', done: false },
    ],
  },
]

export const SEED_PROFILE: Profile = {
  name: 'Arjun Rao',
  email: 'arjun@gmail.com',
}

export const ACCENTS = [
  { name: 'TERRACOTTA', hex: '#C64F3B' },
  { name: 'OCHRE', hex: '#C0913C' },
  { name: 'SAGE', hex: '#5B7B4F' },
  { name: 'SLATE', hex: '#5A6E8C' },
]

export const ROUTINE_TYPES = [
  'WAKE UP',
  'MORNING',
  'AFTERNOON',
  'EVENING',
  'BEDTIME',
] as const

export const DOT_COLORS: Record<string, string> = {
  FINANCE: 'var(--accent)',
  'SIDE PROJECT': 'var(--accent)',
  HEALTH: '#5B7B4F',
  WISHLIST: '#C0913C',
  HOME: '#C0913C',
  CAREER: '#5A6E8C',
  HOBBY: '#5A6E8C',
  LIFE: '#5A6E8C',
  PROJECTS: '#5A6E8C',
  INBOX: '#B8AF9F',
}

export const SPEND_DOTS: Record<string, string> = {
  GROCERIES: '#5B7B4F',
  'EATING OUT': '#C0913C',
  TRANSPORT: '#5A6E8C',
  HOBBIES: 'var(--accent)',
  OTHER: '#B8AF9F',
}
