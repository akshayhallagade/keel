import { dayTimeToInstant, isoOf, pad2 } from './helpers'

/**
 * Pulls a date, a time and an area out of what was typed in the quick-add box.
 *
 *   "call plumber tue 5pm #home"
 *     -> { text: 'call plumber', area: 'HOME', dueAt: <Tuesday 17:00> }
 *
 * The box has always *claimed* to do this — it is written in the placeholder —
 * while only ever understanding "#home". Everything else became part of the
 * todo's title and stayed there.
 *
 * Deliberately conservative. It only recognises things that cannot plausibly be
 * part of a title: weekday names, today/tomorrow/tonight, and clock times. It
 * does not try months ("may" and "march" are ordinary words), bare numbers
 * ("buy 2 apples"), or anything vaguer. A parser that guesses wrong silently
 * edits what you wrote, which is worse than not parsing at all.
 */

export interface QuickAdd {
  text: string
  area: string
  /// ISO instant, or null when nothing in the text named a day or a time.
  dueAt: string | null
}

/// JavaScript's day numbering, matching `Date.getDay()`.
const WEEKDAYS: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
}

/// Order does not matter here. The `\b` that closes the pattern below is what
/// keeps "tuesday" from matching as "tue" with "sday" left in the title: the
/// regex tries "tue", finds no word boundary after it, and backtracks until the
/// whole word fits.
const WEEKDAY_NAMES = Object.keys(WEEKDAYS)

/// A leading "on"/"by"/"at" is swallowed with the date so "call them on tue"
/// does not leave "call them on".
const PREFIX = String.raw`(?:\b(?:on|by|at|due)\s+)?`

const NEXT_WEEKDAY = new RegExp(
  `${PREFIX}\\b(next\\s+)?(${WEEKDAY_NAMES.join('|')})\\b`,
  'i',
)
const RELATIVE = new RegExp(
  `${PREFIX}\\b(today|tonight|tomorrow|tmrw|tmw)\\b`,
  'i',
)
/// "5pm", "5.30pm", "5:30 pm", or 24-hour "17:30". Bare "5" is not a time.
const CLOCK = new RegExp(
  `${PREFIX}\\b(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm)\\b|${PREFIX}\\b(\\d{1,2}):(\\d{2})\\b`,
  'i',
)
const AREA = /#(\w+)/g

/// What "tonight" means when no clock time was given.
const TONIGHT_HOUR = 20

/// Cut a matched span out and remember nothing of it.
const cut = (s: string, m: RegExpMatchArray) =>
  s.slice(0, m.index) + s.slice(m.index! + m[0].length)

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim()

export function parseQuickAdd(input: string, now: Date = new Date()): QuickAdd {
  let rest = input

  // --- Area ----------------------------------------------------------------
  // Every #tag is removed; the last one wins, the way a correction usually
  // means "no, this one".
  let area = ''
  for (const m of input.matchAll(AREA)) area = m[1].toUpperCase()
  rest = rest.replace(AREA, '')

  // --- Day -----------------------------------------------------------------
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let hasDay = false

  const relative = rest.match(RELATIVE)
  const weekday = rest.match(NEXT_WEEKDAY)

  if (relative) {
    const word = relative[1].toLowerCase()
    if (word.startsWith('tm') || word === 'tomorrow')
      target.setDate(target.getDate() + 1)
    hasDay = true
    rest = cut(rest, relative)
  } else if (weekday) {
    // The coming one, counting today. "next tue" means the week after that.
    const ahead = (WEEKDAYS[weekday[2].toLowerCase()] - target.getDay() + 7) % 7
    target.setDate(target.getDate() + ahead + (weekday[1] ? 7 : 0))
    hasDay = true
    rest = cut(rest, weekday)
  }

  // --- Time ----------------------------------------------------------------
  let time = ''
  const clock = rest.match(CLOCK)
  if (clock) {
    // Two alternatives in one pattern, so only one set of groups is filled.
    const [h, min, meridiem] = clock[3]
      ? [+clock[1], +(clock[2] ?? 0), clock[3].toLowerCase()]
      : [+clock[4], +clock[5], '']

    const valid = meridiem ? h >= 1 && h <= 12 : h <= 23
    if (valid && min <= 59) {
      const hour24 = meridiem ? (h % 12) + (meridiem === 'pm' ? 12 : 0) : h
      time = `${pad2(hour24)}:${pad2(min)}`
      rest = cut(rest, clock)
    }
  }

  // "tonight" on its own means the evening, not midnight.
  if (!time && relative?.[1].toLowerCase() === 'tonight') {
    time = `${pad2(TONIGHT_HOUR)}:00`
  }

  const text = tidy(rest)

  return {
    text,
    area: area || 'INBOX',
    // A time with no day means today — "5pm" said out loud never means a
    // different date.
    dueAt:
      hasDay || time
        ? dayTimeToInstant(
            isoOf(target.getFullYear(), target.getMonth(), target.getDate()),
            time,
          )
        : null,
  }
}
