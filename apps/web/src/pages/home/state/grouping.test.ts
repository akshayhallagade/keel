import { describe, expect, it } from 'vitest'

import {
  dayTimeToInstant,
  dayToInstant,
  fmtDueAt,
  groupFor,
  instantHasTime,
  instantToDay,
  instantToTime,
  isToday,
  overdueDays,
  sectionsFor,
  startOfWeek,
} from './helpers'

/// A Wednesday, so there are days on both sides of it inside any week.
const WEDNESDAY = new Date(2026, 2, 11, 14, 30) // 11 March 2026, 2:30pm local

/// The instant stored for a given local day, the way the calendar picker does.
const day = (y: number, m: number, d: number) =>
  dayToInstant(
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  )

describe('groupFor', () => {
  it('puts a todo with no date in Someday', () => {
    expect(groupFor(null, 'MON', WEDNESDAY)).toBe('SOMEDAY')
  })

  it('puts today in Today', () => {
    expect(groupFor(day(2026, 3, 11), 'MON', WEDNESDAY)).toBe('TODAY')
  })

  // An overdue todo is today's problem, not history. Dropping it out of Today
  // would hide the thing most needing attention.
  it('puts an overdue todo in Today', () => {
    expect(groupFor(day(2026, 3, 9), 'MON', WEDNESDAY)).toBe('TODAY')
    expect(groupFor(day(2025, 12, 1), 'MON', WEDNESDAY)).toBe('TODAY')
  })

  // Compared by day, not by instant: something due at 9am is still "today" when
  // you look at 2:30pm.
  it('counts the whole day as today, not the moment', () => {
    const nineAm = new Date(2026, 2, 11, 9, 0).toISOString()
    const elevenPm = new Date(2026, 2, 11, 23, 0).toISOString()

    expect(groupFor(nineAm, 'MON', WEDNESDAY)).toBe('TODAY')
    expect(groupFor(elevenPm, 'MON', WEDNESDAY)).toBe('TODAY')
  })

  it('puts the rest of this week in This week', () => {
    // Thursday and Sunday, still inside a Monday-start week.
    expect(groupFor(day(2026, 3, 12), 'MON', WEDNESDAY)).toBe('THIS_WEEK')
    expect(groupFor(day(2026, 3, 15), 'MON', WEDNESDAY)).toBe('THIS_WEEK')
  })

  it('puts anything past this week in Someday', () => {
    // The following Monday, and a date months out.
    expect(groupFor(day(2026, 3, 16), 'MON', WEDNESDAY)).toBe('SOMEDAY')
    expect(groupFor(day(2026, 8, 1), 'MON', WEDNESDAY)).toBe('SOMEDAY')
  })

  /**
   * The point of the whole change: the same todo moves between lists as the
   * days pass, because the answer is worked out rather than stored.
   *
   * With a stored bucket, a todo filed under Today on Monday was still under
   * Today on Wednesday.
   */
  it('moves a todo between lists as time passes, without the todo changing', () => {
    const dueThursday = day(2026, 3, 12)

    const monday = new Date(2026, 2, 9, 9, 0)
    const thursday = new Date(2026, 2, 12, 9, 0)
    const friday = new Date(2026, 2, 13, 9, 0)

    expect(groupFor(dueThursday, 'MON', monday)).toBe('THIS_WEEK')
    expect(groupFor(dueThursday, 'MON', thursday)).toBe('TODAY')
    // Past its date, so still in front of the user rather than filed away.
    expect(groupFor(dueThursday, 'MON', friday)).toBe('TODAY')
  })

  it('ignores an unparseable date rather than throwing', () => {
    expect(groupFor('not a date', 'MON', WEDNESDAY)).toBe('SOMEDAY')
  })
})

describe('groupFor respects the chosen first day of the week', () => {
  // Sunday 15 March 2026. In a Monday-start week that is still "this week"
  // from Wednesday; in a Sunday-start week it has already rolled over.
  const sunday = day(2026, 3, 15)

  it('treats Sunday as this week when the week starts Monday', () => {
    expect(groupFor(sunday, 'MON', WEDNESDAY)).toBe('THIS_WEEK')
  })

  it('treats the same Sunday as beyond this week when the week starts Sunday', () => {
    // A Sunday-start week containing Wednesday 11th began Sunday the 8th and
    // ends Saturday the 14th, so the 15th is the next week.
    expect(groupFor(sunday, 'SUN', WEDNESDAY)).toBe('SOMEDAY')
  })

  // Saturday-start weeks are the norm across much of the Middle East.
  it('handles a Saturday-start week', () => {
    // That week runs Sat 7th to Fri 13th, so Saturday the 14th falls outside.
    expect(groupFor(day(2026, 3, 13), 'SAT', WEDNESDAY)).toBe('THIS_WEEK')
    expect(groupFor(day(2026, 3, 14), 'SAT', WEDNESDAY)).toBe('SOMEDAY')
  })
})

describe('startOfWeek', () => {
  it.each([
    ['MON', 9], // Monday 9 March
    ['TUE', 10],
    ['WED', 11], // today itself
    ['THU', 5], // last Thursday, since this Thursday has not happened
    ['FRI', 6],
    ['SAT', 7],
    ['SUN', 8],
  ] as const)(
    'a %s-start week containing Wed 11th begins on the %ith',
    (weekStart, date) => {
      const start = startOfWeek(WEDNESDAY, weekStart)
      expect(start.getDate()).toBe(date)
      expect(start.getMonth()).toBe(2)
    },
  )

  it('returns local midnight, not the current time', () => {
    const start = startOfWeek(WEDNESDAY, 'MON')
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
  })
})

describe('overdueDays', () => {
  it('is 0 for a todo that is not late', () => {
    expect(overdueDays(day(2026, 3, 11), WEDNESDAY)).toBe(0) // today
    expect(overdueDays(day(2026, 3, 12), WEDNESDAY)).toBe(0) // tomorrow
    expect(overdueDays(null, WEDNESDAY)).toBe(0) // no date at all
  })

  it('counts whole days late', () => {
    expect(overdueDays(day(2026, 3, 10), WEDNESDAY)).toBe(1)
    expect(overdueDays(day(2026, 3, 4), WEDNESDAY)).toBe(7)
  })

  // Otherwise the label creeps up during the day: "1D" in the morning and "2D"
  // by the evening, for a todo nobody touched.
  it('does not change as the day goes on', () => {
    const due = day(2026, 3, 10)
    const morning = new Date(2026, 2, 11, 6, 0)
    const midnightish = new Date(2026, 2, 11, 23, 59)

    expect(overdueDays(due, morning)).toBe(1)
    expect(overdueDays(due, midnightish)).toBe(1)
  })

  // A todo due at 11pm yesterday is one day late, not two, even though the gap
  // in hours is under 24.
  it('counts days, not 24-hour blocks', () => {
    const lateYesterday = new Date(2026, 2, 10, 23, 0).toISOString()
    const earlyToday = new Date(2026, 2, 11, 1, 0)
    expect(overdueDays(lateYesterday, earlyToday)).toBe(1)
  })

  it('ignores an unparseable date', () => {
    expect(overdueDays('not a date', WEDNESDAY)).toBe(0)
  })
})

describe('due dates that carry a time', () => {
  it('treats local midnight as "no time given"', () => {
    // This is exactly what the calendar writes when you pick a day only.
    expect(instantHasTime(day(2026, 3, 11))).toBe(false)
    expect(fmtDueAt(day(2026, 3, 11))).toBe('11 MAR')
    expect(instantToTime(day(2026, 3, 11))).toBe('')
  })

  it('shows the time when there is one', () => {
    const at1730 = dayTimeToInstant('2026-03-11', '17:30')
    expect(instantHasTime(at1730)).toBe(true)
    expect(fmtDueAt(at1730)).toBe('11 MAR · 5:30PM')
    expect(instantToTime(at1730)).toBe('17:30')
  })

  it('survives a round trip through the time field', () => {
    const stored = dayTimeToInstant('2026-03-11', '09:05')
    expect(instantToDay(stored)).toBe('2026-03-11')
    expect(instantToTime(stored)).toBe('09:05')
  })

  it('says nothing at all when there is no date', () => {
    expect(fmtDueAt(null)).toBe('')
  })

  // A due time must not shunt a todo into the next day's list.
  it('keeps a late-evening todo in Today', () => {
    const at2330 = dayTimeToInstant('2026-03-11', '23:30')
    expect(groupFor(at2330, 'MON', WEDNESDAY)).toBe('TODAY')
  })
})

describe('isToday', () => {
  it('is true only for an instant falling on today', () => {
    expect(isToday(day(2026, 3, 11), WEDNESDAY)).toBe(true)
    expect(isToday(day(2026, 3, 10), WEDNESDAY)).toBe(false)
    expect(isToday(null, WEDNESDAY)).toBe(false)
  })

  it('covers the whole day, not the last 24 hours', () => {
    const justAfterMidnight = new Date(2026, 2, 11, 0, 1).toISOString()
    const lateEvening = new Date(2026, 2, 11, 23, 59).toISOString()
    expect(isToday(justAfterMidnight, WEDNESDAY)).toBe(true)
    expect(isToday(lateEvening, WEDNESDAY)).toBe(true)
  })
})

describe('sectionsFor: which sections a Todos tab shows', () => {
  /**
   * The bug this exists to stop coming back: a todo due today sits in the TODAY
   * section, because `groupFor` gives each todo exactly one group and Today
   * claims anything due today or earlier. Clicking THIS WEEK used to show only
   * the remainder, so today's work vanished from a tab whose label says it
   * covers this week.
   */
  it('shows today’s todos under the THIS WEEK tab', () => {
    expect(sectionsFor('THIS WEEK')).toEqual(['TODAY', 'THIS WEEK'])
  })

  it('shows everything under ALL', () => {
    expect(sectionsFor('ALL')).toEqual(['TODAY', 'THIS WEEK', 'SOMEDAY'])
  })

  it('shows one section for the other tabs', () => {
    expect(sectionsFor('TODAY')).toEqual(['TODAY'])
    expect(sectionsFor('SOMEDAY')).toEqual(['SOMEDAY'])
  })

  // Two sections stacked, never one merged list — a todo appearing twice on one
  // screen would also make the heading counts add up to more than you own.
  it('never repeats a section', () => {
    for (const filter of ['ALL', 'TODAY', 'THIS WEEK', 'SOMEDAY']) {
      const sections = sectionsFor(filter)
      expect(new Set(sections).size).toBe(sections.length)
    }
  })
})
