import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@keel/types'

import { useSettings } from './useSettings'

const updateMe = vi.hoisted(() => vi.fn())
vi.mock('../../../api/users', () => ({ updateMe }))

/// A signed-in user whose saved settings are all different from the old
/// hardcoded defaults, so a test fails if the hook ignores them.
const user = {
  id: 'u1',
  email: 'demo@keel.app',
  name: 'Demo User',
  accent: '#5B7B4F',
  theme: 'dark',
  weekStart: 'SUN',
  prefQuote: false,
  prefDigest: false,
  prefAlerts: false,
  prefSip: true,
  onboardedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'Asia/Kolkata',
  createdAt: '2026-01-01T00:00:00.000Z',
} as User

beforeEach(() => {
  vi.useFakeTimers()
  updateMe.mockReset()
  updateMe.mockResolvedValue(user)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSettings', () => {
  // The whole point of the change: these used to come from localStorage and
  // from hardcoded `true`s, so a signed-in user's saved settings were ignored.
  it('starts from the signed-in user, not from defaults', () => {
    const { result } = renderHook(() => useSettings(user))

    expect(result.current.accent).toBe('#5B7B4F')
    expect(result.current.mode).toBe('dark')
    expect(result.current.weekStart).toBe('SUN')
    expect(result.current.prefs).toEqual({
      quote: false,
      digest: false,
      alerts: false,
      sip: true,
    })
  })

  it('applies a change locally before anything is sent', () => {
    const { result } = renderHook(() => useSettings(user))

    act(() => result.current.setAccent('#C64F3B'))

    expect(result.current.accent).toBe('#C64F3B')
    expect(updateMe).not.toHaveBeenCalled()
  })

  // Dragging across the accent swatches fires a change per swatch. Sending one
  // request each would be six round trips for one decision.
  it('sends one request for a burst of changes, with the last value', () => {
    const { result } = renderHook(() => useSettings(user))

    act(() => {
      result.current.setAccent('#C64F3B')
      result.current.setAccent('#C0913C')
      result.current.setAccent('#5A6E8C')
    })
    act(() => void vi.advanceTimersByTime(600))

    expect(updateMe).toHaveBeenCalledTimes(1)
    expect(updateMe).toHaveBeenCalledWith({ accent: '#5A6E8C' })
  })

  it('merges changes to different settings into one request', () => {
    const { result } = renderHook(() => useSettings(user))

    act(() => {
      result.current.setAccent('#C64F3B')
      result.current.setMode('light')
      result.current.setWeekStart('MON')
    })
    act(() => void vi.advanceTimersByTime(600))

    expect(updateMe).toHaveBeenCalledTimes(1)
    expect(updateMe).toHaveBeenCalledWith({
      accent: '#C64F3B',
      theme: 'light',
      weekStart: 'MON',
    })
  })

  it('sends all four preference flags together', () => {
    const { result } = renderHook(() => useSettings(user))

    act(() => result.current.setPrefs((p) => ({ ...p, quote: true })))
    act(() => void vi.advanceTimersByTime(600))

    expect(updateMe).toHaveBeenCalledWith({
      prefQuote: true,
      prefDigest: false,
      prefAlerts: false,
      prefSip: true,
    })
  })

  // Email is not in updateProfileSchema — the API refuses it — so it must never
  // end up in a request even if something calls setProfile with a new one.
  it('saves a changed name and never sends the email', () => {
    const { result } = renderHook(() => useSettings(user))

    act(() =>
      result.current.setProfile((p) => ({
        ...p,
        name: 'Renamed',
        email: 'attacker@example.com',
      })),
    )
    act(() => void vi.advanceTimersByTime(600))

    expect(updateMe).toHaveBeenCalledWith({ name: 'Renamed' })
  })

  // Navigating away right after a change must not silently drop it.
  it('flushes anything still pending on unmount', () => {
    const { result, unmount } = renderHook(() => useSettings(user))

    act(() => result.current.setAccent('#C64F3B'))
    expect(updateMe).not.toHaveBeenCalled()

    unmount()

    expect(updateMe).toHaveBeenCalledWith({ accent: '#C64F3B' })
  })

  it('reports a failed save', async () => {
    updateMe.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useSettings(user))

    act(() => result.current.setAccent('#C64F3B'))
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current.settingsError).toMatch(/could not save/i)
  })
})
