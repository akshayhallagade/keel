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
  HEALTH: 'var(--positive)',
  WISHLIST: 'var(--warn)',
  HOME: 'var(--warn)',
  CAREER: 'var(--info)',
  HOBBY: 'var(--info)',
  LIFE: 'var(--info)',
  PROJECTS: 'var(--info)',
  INBOX: 'var(--check-border)',
}

export const SPEND_DOTS: Record<string, string> = {
  GROCERIES: 'var(--positive)',
  'EATING OUT': 'var(--warn)',
  TRANSPORT: 'var(--info)',
  HOBBIES: 'var(--accent)',
  OTHER: 'var(--check-border)',
}

/* ------------------------------------------------------------------------
 * Placeholder content for the screens that have no API behind them yet.
 *
 * It used to live as `const X = [...]` at the top of Life.tsx, Money.tsx and
 * Time.tsx. Gathering it here means the screens contain only rendering, and
 * when each feature gets a real endpoint the fake rows are deleted from one
 * file instead of hunted through four.
 * --------------------------------------------------------------------- */

export const SEED_GOALS = [
  {
    name: 'Read 24 books',
    status: 'AHEAD',
    color: 'var(--positive)',
    pct: 58,
    meta: '14 OF 24 · PACE NEEDS 12.4',
    next: 'Next: finish "Deep Work" — 38% left',
  },
  {
    name: 'Run a half-marathon',
    status: 'ON TRACK',
    color: 'var(--warn)',
    pct: 45,
    meta: 'WEEK 9 OF 20 · RACE NOV 15',
    next: 'Next: 12 km long run — Sunday',
  },
  {
    name: '₹3L emergency fund',
    status: 'ON TRACK',
    color: 'var(--warn)',
    pct: 70,
    meta: '₹2,10,000 OF ₹3,00,000',
    next: 'Next: ₹15,000 auto-transfer on the 1st',
  },
  {
    name: 'Ship the side project',
    status: 'BEHIND',
    color: 'var(--accent)',
    pct: 25,
    meta: '2 OF 8 MILESTONES · TARGET OCT',
    next: 'Next: sketch onboarding flow — in Top 3 today',
  },
]

export const SEED_READING_NOW = [
  { name: 'Deep Work', pct: 62, meta: 'CAL NEWPORT · STARTED JUN 21' },
  {
    name: 'The Almanack of Naval Ravikant',
    pct: 18,
    meta: 'ERIC JORGENSON · STARTED JUL 02',
  },
]

export const SEED_TO_READ = [
  { name: 'Thinking in Systems', author: 'DONELLA MEADOWS' },
  { name: 'Four Thousand Weeks', author: 'OLIVER BURKEMAN' },
  { name: 'The Psychology of Money', author: 'MORGAN HOUSEL · ON WISHLIST' },
]

export const SEED_FINISHED_BOOKS = [
  { name: 'Atomic Habits', month: 'JUN' },
  { name: 'Show Your Work!', month: 'JUN' },
  { name: 'The Pathless Path', month: 'MAY' },
]

export const SEED_QUOTES = [
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'JAMES CLEAR',
    saved: 'JUN 2026',
  },
  {
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'MARCUS AURELIUS',
    saved: 'FEB 2026',
  },
  {
    text: 'How we spend our days is, of course, how we spend our lives.',
    author: 'ANNIE DILLARD',
    saved: 'JAN 2026',
  },
  {
    text: 'Simplicity is a great virtue but it requires hard work to achieve it.',
    author: 'EDSGER DIJKSTRA',
    saved: 'APR 2026',
  },
]

export const SEED_READY_TO_BUY = [
  {
    name: '"Deep Work" — hardcover',
    meta: 'BOOKS · ADDED 41 DAYS AGO',
    price: '₹499',
  },
  {
    name: 'Running shoes — Pegasus',
    meta: 'HEALTH · ADDED 35 DAYS AGO · NEEDED FOR RACE',
    price: '₹9,800',
  },
]

export const SEED_COOLING = [
  {
    name: '35mm film camera — used',
    meta: 'HOBBY · 12 OF 30 DAYS',
    pct: 40,
    price: '₹18,500',
  },
  {
    name: 'Ergonomic chair',
    meta: 'HOME · 22 OF 30 DAYS · IN HOME OFFICE PROJECT',
    pct: 73,
    price: '₹32,000',
  },
  {
    name: 'Mechanical keyboard',
    meta: 'WANT · 4 OF 30 DAYS',
    pct: 13,
    price: '₹12,500',
  },
  {
    name: 'Noise-cancelling headphones',
    meta: 'WANT · 9 OF 30 DAYS',
    pct: 30,
    price: '₹22,900',
  },
]

export const SEED_DROPPED = [
  { name: 'Smart watch', price: '₹24,000' },
  { name: 'Third pair of sneakers', price: '₹7,200' },
  { name: 'Tablet stand', price: '₹2,400' },
]

export const SEED_SPEND = [
  {
    name: 'Blinkit — groceries',
    dot: 'var(--positive)',
    cat: 'GROCERIES',
    price: '₹1,240',
    when: 'TODAY',
  },
  {
    name: 'Uber — office to home',
    dot: 'var(--info)',
    cat: 'TRANSPORT',
    price: '₹310',
    when: 'TODAY',
  },
  {
    name: 'Dinner — Mahesh Lunch Home',
    dot: 'var(--warn)',
    cat: 'EATING OUT',
    price: '₹1,860',
    when: 'FRI',
  },
  {
    name: 'Netflix',
    dot: 'var(--check-border)',
    cat: 'SUBSCRIPTIONS · MONTHLY',
    price: '₹649',
    when: 'FRI',
  },
  {
    name: 'Film rolls — 2× Kodak Gold',
    dot: 'var(--accent)',
    cat: 'HOBBIES',
    price: '₹1,100',
    when: 'THU',
  },
  {
    name: 'Rent',
    dot: 'var(--ink)',
    cat: 'FIXED · AUTOPAY',
    price: '₹28,000',
    when: 'JUL 1',
  },
]

export const SEED_ENVELOPES = [
  {
    name: 'Fixed — rent, utilities, wifi',
    spent: '₹31,400',
    budget: '₹32,000',
    pct: 98,
    color: 'var(--ink)',
    note: '98% · ALL PAID FOR JULY',
    noteColor: 'var(--muted)',
  },
  {
    name: 'Groceries',
    spent: '₹4,320',
    budget: '₹12,000',
    pct: 36,
    color: 'var(--positive)',
    note: '36% · ON PACE',
    noteColor: 'var(--positive)',
  },
  {
    name: 'Eating out',
    spent: '₹3,180',
    budget: '₹6,000',
    pct: 53,
    color: 'var(--accent)',
    note: '53% BY DAY 5 · RUNNING HOT',
    noteColor: 'var(--accent)',
  },
  {
    name: 'Transport',
    spent: '₹1,530',
    budget: '₹5,000',
    pct: 31,
    color: 'var(--info)',
    note: '31% · ON PACE',
    noteColor: 'var(--positive)',
  },
  {
    name: 'Hobbies & books',
    spent: '₹1,100',
    budget: '₹4,000',
    pct: 28,
    color: 'var(--warn)',
    note: '28% · ON PACE',
    noteColor: 'var(--positive)',
  },
  {
    name: 'Everything else',
    spent: '₹650',
    budget: '₹16,000',
    pct: 4,
    color: 'var(--check-border)',
    note: '4% · BUFFER INTACT',
    noteColor: 'var(--muted)',
  },
]

export const SEED_REMINDERS = {
  today: [
    {
      when: '4:15 PM',
      name: 'Leave for the gym',
      meta: '15 MIN BEFORE · PULL DAY',
    },
    {
      when: '9:30 PM',
      name: 'Plan tomorrow’s Top 3',
      meta: 'LINKED TO EVENING ROUTINE',
    },
  ],
  upcoming: [
    {
      when: 'SUN 8AM',
      name: 'Credit card autopay executes',
      meta: '₹23,410 · CHECK BALANCE FIRST',
    },
    {
      when: 'TUE 4PM',
      name: 'Plumber arrives — kitchen tap',
      meta: 'LINKED TO TODO',
    },
  ],
  recurring: [
    {
      when: '4TH',
      name: 'SIP executes tomorrow',
      meta: 'MONTHLY · DAY BEFORE THE 5TH',
    },
    {
      when: 'MON 9AM',
      name: 'Weekly review — clear inbox',
      meta: 'EVERY MONDAY',
    },
    {
      when: '28TH',
      name: 'Renew gym membership',
      meta: 'MONTHLY · CURRENTLY OVERDUE',
    },
  ],
}
