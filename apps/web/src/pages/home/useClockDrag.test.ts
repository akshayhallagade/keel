import { describe, expect, it } from 'vitest'

import { handValueAt } from './useClockDrag'

/// A 260-unit clock face rendered at 260px, so screen and viewBox units line up
/// and the expected values can be reasoned about directly.
const rect = { left: 0, top: 0, width: 260 }
const CENTRE = 130

/** A point on the face at `deg` clockwise from 12 o'clock. */
function at(deg: number, radius = 100) {
  const rad = (deg * Math.PI) / 180
  return {
    clientX: CENTRE + Math.sin(rad) * radius,
    clientY: CENTRE - Math.cos(rad) * radius,
  }
}

describe('handValueAt — minute hand', () => {
  it.each([
    [0, 0],
    [90, 15],
    [180, 30],
    [270, 45],
  ])('reads %i° as minute %i', (deg, expected) => {
    expect(handValueAt('minute', at(deg), rect, 260)).toBe(expected)
  })

  // Just short of a full turn must land back on 0, not on 60.
  it('wraps past 12 back to 0 rather than reporting 60', () => {
    expect(handValueAt('minute', at(359), rect, 260)).toBe(0)
  })
})

describe('handValueAt — hour hand', () => {
  it.each([
    [0, 12],
    [30, 1],
    [90, 3],
    [180, 6],
    [270, 9],
  ])('reads %i° as hour %i', (deg, expected) => {
    expect(handValueAt('hour', at(deg), rect, 260)).toBe(expected)
  })

  // The hour hand has no zero: straight up is 12, and so is anything that
  // rounds back onto it.
  it('never returns hour 0', () => {
    for (let deg = 0; deg < 360; deg++) {
      const h = handValueAt('hour', at(deg), rect, 260)
      expect(h).toBeGreaterThanOrEqual(1)
      expect(h).toBeLessThanOrEqual(12)
    }
  })
})

describe('handValueAt — scaling', () => {
  // The tile clocks use a 110 viewBox drawn at whatever width the grid gives
  // them; the reading must not depend on the rendered size.
  it('gives the same reading for a face scaled down', () => {
    const small = { left: 0, top: 0, width: 55 }
    const point = { clientX: 27.5 + 20, clientY: 27.5 }
    expect(handValueAt('hour', point, small, 110)).toBe(3)
    expect(handValueAt('minute', point, small, 110)).toBe(15)
  })

  it('is unaffected by where the element sits on the page', () => {
    const offset = { left: 400, top: 250, width: 260 }
    const point = { clientX: 400 + CENTRE, clientY: 250 + CENTRE - 100 }
    expect(handValueAt('hour', point, offset, 260)).toBe(12)
  })
})
