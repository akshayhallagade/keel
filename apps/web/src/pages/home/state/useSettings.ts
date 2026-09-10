import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@keel/types'
import type { UpdateProfileInput } from '@keel/validation'
import { updateMe } from '../../../api/users'
import type { Prefs, Profile } from '../types'

/// Changes are held this long before being sent. Dragging across the accent
/// swatches or flipping several toggles is one request, not six.
const SAVE_DEBOUNCE_MS = 600

/**
 * Appearance, profile and preferences — the things the Settings screen edits.
 *
 * Every value starts from the signed-in user rather than a hardcoded default,
 * and every change is written back to `PATCH /users/me`. Before this, the
 * columns existed and the endpoint existed but the screen called neither, so
 * every setting was forgotten on refresh.
 *
 * Edits apply locally at once and save in the background: waiting for a round
 * trip to recolour a button would feel broken. If the save fails, `saveError`
 * says so — the screen is then showing something the server does not have.
 */
export function useSettings(user: User) {
  const [accent, setAccentState] = useState(user.accent)
  const [mode, setModeState] = useState<'light' | 'dark'>(
    user.theme === 'dark' ? 'dark' : 'light',
  )
  const [profile, setProfileState] = useState<Profile>({
    name: user.name,
    email: user.email,
  })
  const [prefs, setPrefsState] = useState<Prefs>({
    quote: user.prefQuote,
    digest: user.prefDigest,
    alerts: user.prefAlerts,
    sip: user.prefSip,
  })
  const [weekStart, setWeekStartState] = useState(user.weekStart)
  const [saveError, setSaveError] = useState('')

  // Everything changed since the last send, merged. A later edit to the same
  // field replaces the earlier one, so only the final value is sent.
  const pendingRef = useRef<UpdateProfileInput>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flush = useCallback(() => {
    const patch = pendingRef.current
    pendingRef.current = {}
    if (Object.keys(patch).length === 0) return

    updateMe(patch)
      .then(() => setSaveError(''))
      .catch(() =>
        setSaveError('Could not save your settings. Check your connection.'),
      )
  }, [])

  const queue = useCallback(
    (patch: UpdateProfileInput) => {
      pendingRef.current = { ...pendingRef.current, ...patch }
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS)
    },
    [flush],
  )

  // Send whatever is still waiting if the component goes away, or the last
  // change made before navigating is silently dropped.
  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
      flush()
    },
    [flush],
  )

  const setAccent = useCallback(
    (hex: string) => {
      setAccentState(hex)
      queue({ accent: hex })
    },
    [queue],
  )

  const setMode = useCallback(
    (m: 'light' | 'dark') => {
      setModeState(m)
      queue({ theme: m })
    },
    [queue],
  )

  const setWeekStart = useCallback(
    (w: string) => {
      setWeekStartState(w)
      // The column only accepts these two; anything else is a caller bug.
      if (w === 'MON' || w === 'SUN') queue({ weekStart: w })
    },
    [queue],
  )

  /// Name is editable. Email is not — changing it has to go through a
  /// verification flow that does not exist yet, and updateProfileSchema
  /// deliberately refuses it.
  const setProfile = useCallback(
    (update: (p: Profile) => Profile) => {
      setProfileState((prev) => {
        const next = update(prev)
        if (next.name !== prev.name) queue({ name: next.name })
        return next
      })
    },
    [queue],
  )

  const setPrefs = useCallback(
    (update: (p: Prefs) => Prefs) => {
      setPrefsState((prev) => {
        const next = update(prev)
        queue({
          prefQuote: next.quote,
          prefDigest: next.digest,
          prefAlerts: next.alerts,
          prefSip: next.sip,
        })
        return next
      })
    },
    [queue],
  )

  return {
    accent,
    setAccent,
    mode,
    setMode,
    profile,
    setProfile,
    prefs,
    setPrefs,
    weekStart,
    setWeekStart,
    settingsError: saveError,
  }
}
