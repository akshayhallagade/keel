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
