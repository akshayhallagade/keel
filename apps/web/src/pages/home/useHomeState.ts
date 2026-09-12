import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@keel/types'
import type { ConfirmDeleteState, Screen } from './types'
import { prefersReducedMotion } from '../../lib/motion'
import { useTodos } from './state/useTodos'
import { useRoutines } from './state/useRoutines'
import { useProjects } from './state/useProjects'
import { useAlarms } from './state/useAlarms'
import { useHobbies } from './state/useHobbies'
import { useSettings } from './state/useSettings'
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

  /// Appearance, profile and preferences all come from the signed-in user and
  /// save back to the API. They used to sit in localStorage and in hardcoded
  /// defaults, which meant they were per-browser at best and forgotten at worst.
  const settings = useSettings(user)

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
    // The figures are the content; counting up to them is the flourish. Jump
    // straight to the real numbers rather than animating a frame at a time.
    if (prefersReducedMotion()) {
      setCountProg(1)
      return
    }
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

  const todos = useTodos(settings.weekStart)
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
    splash,
    countProg,
    // appearance, profile and preferences
    ...settings,
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
