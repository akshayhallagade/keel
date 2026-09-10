import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@keel/types'
import type { ConfirmDeleteState, Prefs, Profile, Screen } from './types'
import { useTodos } from './state/useTodos'
import { useRoutines } from './state/useRoutines'
import { useProjects } from './state/useProjects'
import { useAlarms } from './state/useAlarms'
import { useHobbies } from './state/useHobbies'
import { useCreatePanel } from './state/useCreatePanel'

/// How long the splash sits before the app appears. Matches the splashOut
/// animation delay in Home.css.
const SPLASH_MS = 3100
/// Duration of the count-up that runs when a screen is opened.
const COUNT_MS = 900

/**
 * Assembles the home screen's state from one hook per domain.
 *
 * This used to be a single 1,000-line function holding sixty-odd useState
 * calls. The split is for reading and testing, not for rendering: screens
 * still take the whole `vm`, so they still re-render together. Narrowing that
 * means context or per-screen selectors, which is not worth doing until the
 * app is big enough for it to show.
 */
export function useHomeState(user: User, onSignOut: () => void) {
  const [screen, setScreen] = useState<Screen>('today')
  const [splash, setSplash] = useState(true)
  const [countProg, setCountProg] = useState(1)

  const [accent, setAccentState] = useState(
    () => localStorage.getItem('msb-accent') || '#C64F3B',
  )
  const [mode, setModeState] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('msb-mode') === 'dark' ? 'dark' : 'light',
  )
  const [profile, setProfile] = useState<Profile>({
    name: user.name,
    email: user.email,
  })
  const [prefs, setPrefs] = useState<Prefs>({
    quote: true,
    digest: true,
    alerts: true,
    sip: false,
  })
  const [weekStart, setWeekStart] = useState('MON')

  /// Deleting is the one action shared across domains — a project and a
  /// routine both route through the same confirm modal — so the pending
  /// target lives here rather than in either hook.
  const [confirmDel, setConfirmDel] = useState<ConfirmDeleteState | null>(null)
  const askDelete = useCallback(
    (target: ConfirmDeleteState) => setConfirmDel(target),
    [],
  )

  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const cntRafRef = useRef(0)

  const startCount = useCallback(() => {
    cancelAnimationFrame(cntRafRef.current)
    const t0 = performance.now()
    const step = (t: number) => {
      const pr = Math.min(1, (t - t0) / COUNT_MS)
      // Ease-out cubic, so the numbers decelerate into place.
      setCountProg(1 - Math.pow(1 - pr, 3))
      if (pr < 1) cntRafRef.current = requestAnimationFrame(step)
    }
    cntRafRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    splashTimerRef.current = setTimeout(() => {
      setSplash(false)
      startCount()
    }, SPLASH_MS)
    return () => {
      clearTimeout(splashTimerRef.current)
      cancelAnimationFrame(cntRafRef.current)
    }
  }, [startCount])

  const go = useCallback(
    (key: Screen) => {
      setScreen(key)
      startCount()
    },
    [startCount],
  )

  const setAccent = useCallback((hex: string) => {
    localStorage.setItem('msb-accent', hex)
    setAccentState(hex)
  }, [])

  const setMode = useCallback((m: 'light' | 'dark') => {
    localStorage.setItem('msb-mode', m)
    setModeState(m)
  }, [])

  const todos = useTodos()
  const routines = useRoutines(askDelete)
  const projects = useProjects(askDelete, go)
  const alarms = useAlarms()
  const hobbies = useHobbies()

  // useState setters are stable, so destructuring one out gives useCreatePanel
  // a callback identity that does not change on every render.
  const { setAlarms } = alarms
  const createPanel = useCreatePanel(
    useCallback((a) => setAlarms((s) => [...s, a]), [setAlarms]),
  )

  const doDelete = () => {
    if (!confirmDel) return
    if (confirmDel.kind === 'project')
      projects.setProjects((s) => s.filter((x) => x.name !== confirmDel.name))
    else
      routines.setRoutines((s) => s.filter((x) => x.name !== confirmDel.name))
    setConfirmDel(null)
  }

  return {
    // shell
    screen,
    setScreen,
    go,
    onSignOut,
    accent,
    setAccent,
    mode,
    setMode,
    splash,
    countProg,
    profile,
    setProfile,
    prefs,
    setPrefs,
    weekStart,
    setWeekStart,
    // shared delete confirmation
    confirmDel,
    setConfirmDel,
    doDelete,
    // domains
    ...todos,
    ...routines,
    ...projects,
    ...alarms,
    ...hobbies,
    ...createPanel,
  }
}

export type HomeState = ReturnType<typeof useHomeState>
