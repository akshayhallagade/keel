import { describe, expect, it } from 'vitest'

import { fmtDue, isISO, isoOf, parseInr, parseRTime } from './useHomeState'

describe('isISO', () => {
  it('accepts a full yyyy-mm-dd date', () => {
    expect(isISO('2026-03-09')).toBe(true)
  })

  it.each(['2026-3-9', '09-03-2026', 'tomorrow', '', undefined])(
    'rejects %p',
    (input) => {
      expect(isISO(input)).toBe(false)
    },
  )
})

describe('fmtDue', () => {
  it('formats an ISO date as day + short month', () => {
    expect(fmtDue('2026-03-09')).toBe('9 MAR')
  })

  // The reason this parses the string by hand instead of `new Date(iso)`: the built-in
  // parser reads a bare yyyy-mm-dd as UTC midnight, which renders as the *previous* day
  // for anyone behind UTC. These two dates are where that bug would show up first.
  it('does not shift the day across a month or year boundary', () => {
    expect(fmtDue('2026-01-01')).toBe('1 JAN')
    expect(fmtDue('2025-12-31')).toBe('31 DEC')
  })

  it('passes non-ISO text straight through', () => {
    expect(fmtDue('someday')).toBe('someday')
    expect(fmtDue('')).toBe('')
  })
})

describe('parseInr', () => {
  it('groups in the Indian lakh/crore style, not thousands', () => {
    expect(parseInr('1234567')).toBe('₹12,34,567')
  })

  it('strips currency symbols, separators and stray text', () => {
    expect(parseInr('₹1,299')).toBe('₹1,299')
    expect(parseInr('2499 per month')).toBe('₹2,499')
  })

  it('returns the em-dash placeholder when there is no number at all', () => {
    expect(parseInr('')).toBe('₹—')
    expect(parseInr('free')).toBe('₹—')
  })

  // Everything non-numeric is stripped before parsing, so a minus sign or a decimal
  // point is dropped rather than honoured. Worth knowing before this is reused for
  // anything that can legitimately be negative.
  it('ignores sign and decimals', () => {
    expect(parseInr('-500')).toBe('₹500')
    expect(parseInr('99.99')).toBe('₹9,999')
  })
})

describe('isoOf', () => {
  it('takes a 0-indexed month and emits a 1-indexed, zero-padded date', () => {
    expect(isoOf(2026, 0, 5)).toBe('2026-01-05')
    expect(isoOf(2026, 11, 31)).toBe('2026-12-31')
  })

  it('round-trips through fmtDue without losing a day', () => {
    expect(fmtDue(isoOf(2026, 2, 9))).toBe('9 MAR')
  })
})

describe('parseRTime', () => {
  it('reads hour, minute and meridiem', () => {
    expect(parseRTime('7:30 AM')).toEqual({ hour: 7, minIdx: 2, ampm: 'AM' })
  })

  it('normalises lowercase meridiem and surrounding space', () => {
    expect(parseRTime('  9:00 pm  ')).toEqual({
      hour: 9,
      minIdx: 0,
      ampm: 'PM',
    })
  })

  // The picker only offers :00 :15 :30 :45, so an arbitrary minute snaps to the
  // nearest slot. On an exact tie the earlier slot wins.
  it('snaps an off-grid minute to the nearest quarter hour', () => {
    expect(parseRTime('6:07 AM')?.minIdx).toBe(0)
    expect(parseRTime('6:08 AM')?.minIdx).toBe(1)
    expect(parseRTime('6:52 AM')?.minIdx).toBe(3)
  })

  it.each(['noon', '7.30 AM', '7:30', '', '7:5 AM'])(
    'returns null for %p so the caller can fall back',
    (input) => {
      expect(parseRTime(input)).toBeNull()
    },
  )
})
