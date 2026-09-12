import { describe, expect, it } from 'vitest'

import { parseQuickAdd } from './parseQuickAdd'
import { fmtTime, instantToDay } from './helpers'

/// Wednesday 11 March 2026, mid-afternoon.
const WED = new Date(2026, 2, 11, 14, 30)

const parse = (input: string) => {
  const r = parseQuickAdd(input, WED)
  return {
    text: r.text,
    area: r.area,
    day: r.dueAt ? instantToDay(r.dueAt) : null,
    time: r.dueAt ? fmtTime(r.dueAt) : null,
  }
}

describe('parseQuickAdd', () => {
  it('parses the example in the placeholder', () => {
    // This is the line printed in the add box. It has to actually work.
    expect(parse('call plumber tue 5pm #home')).toEqual({
      text: 'call plumber',
      area: 'HOME',
      day: '2026-03-17', // the coming Tuesday
      time: '5:00PM',
    })
  })

  it('leaves plain text completely alone', () => {
    expect(parse('buy milk')).toEqual({
      text: 'buy milk',
      area: 'INBOX',
      day: null,
      time: null,
    })
  })
})

describe('parseQuickAdd: areas', () => {
  it('takes #tag as the area and removes it', () => {
    const r = parse('pay rent #finance')
    expect(r.text).toBe('pay rent')
    expect(r.area).toBe('FINANCE')
  })

  it('reads a tag written mid-sentence', () => {
    expect(parse('pay #finance rent').text).toBe('pay rent')
  })

  it('lets a second tag correct the first', () => {
    expect(parse('pay rent #home #finance').area).toBe('FINANCE')
  })

  it('defaults to INBOX', () => {
    expect(parse('think about it').area).toBe('INBOX')
  })
})

describe('parseQuickAdd: days', () => {
  it.each([
    ['today', '2026-03-11'],
    ['tomorrow', '2026-03-12'],
    ['tmrw', '2026-03-12'],
    ['thu', '2026-03-12'],
    ['thursday', '2026-03-12'],
    ['sat', '2026-03-14'],
    ['mon', '2026-03-16'], // next week, since Monday has gone
  ])('reads "%s" as %s', (word, day) => {
    const r = parse(`ring mum ${word}`)
    expect(r.day).toBe(day)
    expect(r.text).toBe('ring mum')
  })

  // Said on a Wednesday, "wed" means today, not a week away.
  it('counts today as the coming weekday', () => {
    expect(parse('ring mum wed').day).toBe('2026-03-11')
  })

  it('pushes "next" forward a week', () => {
    expect(parse('ring mum next wed').day).toBe('2026-03-18')
    expect(parse('ring mum next thu').day).toBe('2026-03-19')
  })

  it('swallows the word in front of the date', () => {
    expect(parse('ring mum on thursday').text).toBe('ring mum')
    expect(parse('file taxes by friday').text).toBe('file taxes')
  })

  it('matches the long name whole, not as a short one', () => {
    // "tuesday" must not be read as "tue" with "sday" left in the title.
    expect(parse('ring mum tuesday').text).toBe('ring mum')
  })
})

describe('parseQuickAdd: times', () => {
  it.each([
    ['5pm', '5:00PM'],
    ['5 pm', '5:00PM'],
    ['5:30pm', '5:30PM'],
    ['5.30pm', '5:30PM'],
    ['9am', '9:00AM'],
    ['17:30', '5:30PM'],
    ['12pm', '12:00PM'],
    ['12am', '12:00AM'],
  ])('reads "%s" as %s', (word, time) => {
    const r = parse(`standup ${word}`)
    expect(r.time).toBe(time)
    expect(r.text).toBe('standup')
  })

  it('puts a bare time on today', () => {
    expect(parse('standup 9am').day).toBe('2026-03-11')
  })

  it('swallows "at"', () => {
    expect(parse('standup at 9am').text).toBe('standup')
  })

  it('combines a day and a time', () => {
    const r = parse('dentist fri 3:15pm')
    expect(r.day).toBe('2026-03-13')
    expect(r.time).toBe('3:15PM')
    expect(r.text).toBe('dentist')
  })

  it('reads "tonight" as this evening', () => {
    const r = parse('take the bins out tonight')
    expect(r.day).toBe('2026-03-11')
    expect(r.time).toBe('8:00PM')
  })

  it('lets an explicit time beat tonight’s default', () => {
    expect(parse('bins tonight 11pm').time).toBe('11:00PM')
  })
})

/**
 * The parser edits what the user typed, so being wrong is expensive — a word
 * eaten here is gone from the todo. These are the cases it must refuse.
 */
describe('parseQuickAdd: things it must not touch', () => {
  it.each([
    ['buy 2 apples', 'a bare number is not a time'],
    ['read 4 chapters', 'nor is this one'],
    ['book table for 8', 'nor at the end'],
    ['satisfy the auditor', '"sat" inside a word is not Saturday'],
    ['monitor the build', '"mon" inside a word is not Monday'],
    ['frida kahlo book', '"fri" inside a word is not Friday'],
    ['pay in may', 'months are ordinary words, so they are not parsed'],
    ['march to the office', 'same for march'],
  ])('leaves "%s" alone (%s)', (input) => {
    const r = parse(input)
    expect(r.text).toBe(input)
    expect(r.day).toBeNull()
  })

  it('ignores an impossible clock time', () => {
    // 25:00 is not a time; it stays in the title rather than being mangled.
    expect(parse('run 25:00').text).toBe('run 25:00')
    expect(parse('sprint 13pm').text).toBe('sprint 13pm')
  })

  it('never returns a title that is only whitespace', () => {
    expect(parse('  tomorrow  ').text).toBe('')
  })

  it('collapses the gap left where it cut something out', () => {
    expect(parse('ring the vet tomorrow about food').text).toBe(
      'ring the vet about food',
    )
  })
})
