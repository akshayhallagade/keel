import { useEffect, useRef } from 'react'

export type Hand = 'hour' | 'minute'

/**
 * Pointer position over a square clock face → the value that hand should take.
 *
 * 12 o'clock is 0° and the angle grows clockwise, which is what `atan2(x, -y)`
 * gives. `viewBox` is the SVG's own coordinate size (260 for the big editor
 * clock, 110 for a tile), so the same maths works at any rendered size.
 */
export function handValueAt(
  hand: Hand,
  point: { clientX: number; clientY: number },
  rect: { left: number; top: number; width: number },
  viewBox: number,
): number {
  const scale = viewBox / rect.width
  const centre = viewBox / 2
  const px = (point.clientX - rect.left) * scale - centre
  const py = (point.clientY - rect.top) * scale - centre

  let deg = (Math.atan2(px, -py) * 180) / Math.PI
  if (deg < 0) deg += 360

  if (hand === 'minute') return Math.round(deg / 6) % 60
  // %12 sends a rounded 12 back to 0, and the clock face calls that hour 12.
  const h = Math.round(deg / 30) % 12
  return h === 0 ? 12 : h
}

/**
 * Drags a clock hand. Idle until `hand` is non-null, then follows the pointer
 * until it is released.
 *
 * The editor clock and the alarm tiles each had their own copy of this effect,
 * identical apart from the element id and the viewBox size.
 */
export function useClockDrag(
  hand: Hand | null,
  svgId: string | null,
  viewBox: number,
  onValue: (hand: Hand, value: number) => void,
  onEnd: () => void,
) {
  // Held in a ref so callers can pass inline arrows without the listener effect
  // below tearing down and re-subscribing on every render mid-drag. Written in
  // an effect rather than during render, which React does not allow.
  const handlers = useRef({ onValue, onEnd })
  useEffect(() => {
    handlers.current = { onValue, onEnd }
  })

  useEffect(() => {
    if (!hand || !svgId) return

    const onMove = (ev: PointerEvent) => {
      const svg = document.getElementById(svgId)
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      if (!rect.width) return
      handlers.current.onValue(hand, handValueAt(hand, ev, rect, viewBox))
    }
    const onUp = () => handlers.current.onEnd()

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [hand, svgId, viewBox])
}
