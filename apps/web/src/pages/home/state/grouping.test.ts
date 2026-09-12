import { describe, expect, it } from 'vitest'

import { dayToInstant, groupFor, startOfWeek } from './helpers'

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
