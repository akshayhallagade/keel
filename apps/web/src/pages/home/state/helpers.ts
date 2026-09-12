import type { WeekStart } from '@keel/types'

/// Date, time and money formatting shared by the home screens.
/// Pure functions only — nothing here touches React.

/// Locale pinned to 'en': these are display strings in a fixed English design,
/// not something that should follow the visitor's browser language.
const shortMonth = new Intl.DateTimeFormat('en', { month: 'short' })
const longMonth = new Intl.DateTimeFormat('en', { month: 'long' })

export const monthShort = (d: Date) => shortMonth.format(d).toUpperCase()
export const monthLong = (d: Date) => longMonth.format(d).toUpperCase()

/// The minutes the routine picker offers.
export const R_MINS = [0, 15, 30, 45]

export const isISO = (s: string | undefined) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s || '')

export const fmtDue = (s: string) => {
  if (!isISO(s)) return s || ''
  // Parsed field by field on purpose: `new Date('2026-01-01')` is read as UTC
  // midnight and renders as the previous day for anyone behind UTC.
  const d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
  return d.getDate() + ' ' + monthShort(d)
}

export const parseInr = (v: string) => {
  const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? '₹—' : '₹' + n.toLocaleString('en-IN')
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const isoOf = (y: number, m: number, d: number) =>
  `${y}-${pad2(m + 1)}-${pad2(d)}`

/* ---------------------------------------------------------------------------
 * Days versus instants.
 *
 * The calendar in the todo panel picks a *day* ("the 9th"). The API stores an
 * *instant* ("2026-03-09T00:00:00+05:30"). These two convert between them.
 *
 * Local midnight is the anchor, not UTC midnight: someone in Kolkata picking
 * the 9th means their 9th. Anchoring to UTC would store 2026-03-09T00:00Z,
 * which is 5:30am on the 9th for them — still fine — but for anyone west of
 * UTC it reads back as the 8th.
 * ------------------------------------------------------------------------ */

/// "2026-03-09" + "17:30" → the ISO instant of that local moment.
/// A blank time means local midnight, which is how "a day, no particular time"
/// is stored.
export const dayTimeToInstant = (day: string, time = '') => {
  const [y, m, d] = day.split('-').map(Number)
  const [h, min] = time ? time.split(':').map(Number) : [0, 0]
  return new Date(y, m - 1, d, h, min).toISOString()
}

/// "2026-03-09" → the ISO instant of local midnight that day.
export const dayToInstant = (day: string) => dayTimeToInstant(day)

/// An ISO instant → the "YYYY-MM-DD" day it falls on, in local time.
export const instantToDay = (iso: string) => {
  const d = new Date(iso)
  return isoOf(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Does this due date name a time of day, or just a day?
 *
 * Local midnight means "just a day" — that is exactly what `dayTimeToInstant`
 * writes when no time was picked. So the answer is "it is not local midnight".
 *
 * The cost is that a todo genuinely due at 00:00 reads as having no time. That
 * is worth one fewer column: nobody picks midnight, and the two cases look the
 * same to the person reading the row anyway.
 */
export const instantHasTime = (iso: string) => {
  const d = new Date(iso)
  return d.getHours() !== 0 || d.getMinutes() !== 0
}

/// An ISO instant → "17:30" local, which is what `<input type="time">` wants.
/// Empty when the todo has no time of day.
export const instantToTime = (iso: string) => {
  const d = new Date(iso)
  return instantHasTime(iso)
    ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    : ''
}

/// Today as a "YYYY-MM-DD" day string, in local time.
export const todayDay = (now: Date = new Date()) =>
  isoOf(now.getFullYear(), now.getMonth(), now.getDate())

/// "5:30PM". Compact on purpose — it sits on a row next to the date.
export const fmtTime = (iso: string) => {
  const d = new Date(iso)
  const h = d.getHours()
  return `${h % 12 || 12}:${pad2(d.getMinutes())}${h < 12 ? 'AM' : 'PM'}`
}

/// What a due date reads as on a row: "9 MAR", or "9 MAR · 5:30PM" when a time
/// was picked, or nothing when there is no date at all.
export const fmtDueAt = (iso: string | null) => {
  if (!iso) return ''
  const day = fmtDue(instantToDay(iso))
  return instantHasTime(iso) ? `${day} · ${fmtTime(iso)}` : day
}

/* ---------------------------------------------------------------------------
 * Which list a todo belongs in.
 *
 * Worked out from its due date every time the screen draws, never stored. "Is
 * this for today?" is a question about *now*: a stored answer is only true on
 * the day it was written, and something filed under Today on Monday was still
 * sitting under Today on Wednesday.
 * ------------------------------------------------------------------------ */

export type TodoGroup = 'TODAY' | 'THIS_WEEK' | 'SOMEDAY'

/// JavaScript's day numbering, which `Date.getDay()` returns.
const DAY_INDEX: Record<WeekStart, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

/// Local midnight at the start of the day `d` falls in.
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())

/// Local midnight at the start of the week `now` falls in, counting the week as
/// beginning on the user's chosen day.
export const startOfWeek = (now: Date, weekStart: WeekStart) => {
  const today = startOfDay(now)
  // How many days back the most recent `weekStart` is. The +7 and %7 keep it
  // positive when the week's first day is later in JavaScript's numbering than
  // today is — a Monday-start week looked at on a Sunday, for instance.
  const back = (today.getDay() - DAY_INDEX[weekStart] + 7) % 7
  today.setDate(today.getDate() - back)
  return today
}

/**
 * Which of the three lists a todo belongs in right now.
 *
 * - no due date            -> Someday
 * - due today, or overdue  -> Today. An overdue thing is today's problem, not
 *                             history, so it stays in front of the user.
 * - due later this week    -> This week, where the week starts on the day the
 *                             user picked in Settings
 * - anything further out   -> Someday
 *
 * `now` is injectable so this can be tested without waiting for Tuesday.
 */
export function groupFor(
  dueAt: string | null,
  weekStart: WeekStart,
  now: Date = new Date(),
): TodoGroup {
  if (!dueAt) return 'SOMEDAY'

  const due = new Date(dueAt)
  if (Number.isNaN(due.getTime())) return 'SOMEDAY'

  // Compared by day, not by instant: a todo due at 9am today is still "today"
  // at 6pm, and one due at 11pm today is not "tomorrow".
  const dueDay = startOfDay(due)
  const today = startOfDay(now)
  if (dueDay <= today) return 'TODAY'

  const weekEnds = startOfWeek(now, weekStart)
  weekEnds.setDate(weekEnds.getDate() + 7)
  return dueDay < weekEnds ? 'THIS_WEEK' : 'SOMEDAY'
}

/// The three section headings on the Todos screen, in the order they stack.
const SECTIONS = ['TODAY', 'THIS WEEK', 'SOMEDAY']

/**
 * Which sections a Todos tab shows.
 *
 * "THIS WEEK" shows TODAY as well, because today is part of this week.
 * `groupFor` gives a todo exactly one group, and Today claims anything due
 * today or earlier — so without this, clicking THIS WEEK hid today's work and
 * answered a question nobody asked.
 *
 * The sections stay exclusive. Showing two of them stacked lists nothing twice;
 * merging them into one list would.
 */
export const sectionsFor = (filter: string) => {
  if (filter === 'ALL') return SECTIONS
  if (filter === 'THIS WEEK') return ['TODAY', 'THIS WEEK']
  return [filter]
}

/**
 * How many whole days late a todo is. 0 when it is not late.
 *
 * Counted in days, not hours: something due yesterday at 9am reads "1D" all
 * through today rather than creeping to "2D" by the evening.
 *
 * The division rounds rather than truncates because a local day is not always
 * 24 hours — the clocks going forward makes one 23 hours long, and `Math.floor`
 * would call that zero days and quietly stop showing the label.
 */
export const overdueDays = (dueAt: string | null, now: Date = new Date()) => {
  if (!dueAt) return 0
  const due = new Date(dueAt)
  if (Number.isNaN(due.getTime())) return 0

  const diff = startOfDay(now).getTime() - startOfDay(due).getTime()
  return diff <= 0 ? 0 : Math.round(diff / 86_400_000)
}

/// Was this completed today? What "DONE TODAY" on the Todos rail actually means.
export const isToday = (iso: string | null, now: Date = new Date()) =>
  !!iso && instantToDay(iso) === todayDay(now)

export const rMM = (idx: number) => pad2(R_MINS[idx])

export const parseRTime = (str: string) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((str || '').trim())
  if (!m) return null
  const hour = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const idx = R_MINS.reduce(
    (best, v, i) =>
      Math.abs(v - min) < Math.abs(R_MINS[best] - min) ? i : best,
    0,
  )
  return { hour, minIdx: idx, ampm: m[3].toUpperCase() as 'AM' | 'PM' }
}

/// Up to two letters for the avatar. Falls back to ME when a name is blank or
/// has nothing alphabetic in it, so the circle is never empty.
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ME'
