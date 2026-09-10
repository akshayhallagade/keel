import { useCallback, useState } from 'react'
import { SEED_ROUTINES } from '../seedData'
import type {
  ConfirmDeleteState,
  Routine,
  RoutinePanelState,
  RoutinePeriod,
} from '../types'
import { parseRTime, rMM } from './helpers'

const EMPTY_WEEK = () => [false, false, false, false, false, false, false]

export function useRoutines(askDelete: (target: ConfirmDeleteState) => void) {
  const [routines, setRoutines] = useState<Routine[]>(SEED_ROUTINES)
  const [routineDrafts, setRoutineDrafts] = useState<Record<string, string>>({
    'WAKE UP': '',
    MORNING: '',
    AFTERNOON: '',
    EVENING: '',
    BEDTIME: '',
  })
  const [routinesView, setRoutinesView] = useState<'grouped' | 'flat'>(
    'grouped',
  )
  const [rPanel, setRPanelState] = useState<RoutinePanelState | null>(null)

  const setRPanel = useCallback((patch: Partial<RoutinePanelState>) => {
    setRPanelState((s) => (s ? { ...s, ...patch } : s))
  }, [])

  /// Like mkRow: the routine's data and its actions, no CSS. Whether it reads
  /// as done, missed or on a streak is decided by RoutineRow's classes.
  const mkRoutine = useCallback(
    (r: Routine) => ({
      name: r.name,
      period: r.period,
      done: !!r.done,
      /// Only meaningful when not done — a completed routine is not missed.
      missed: !r.done && !!r.missed,
      time: r.time || '',
      streak: r.streak,
      week: r.week || [],
      del: () => askDelete({ kind: 'routine', name: r.name }),
      edit: () => {
        const parsed = parseRTime(r.time) || {
          hour: r.period === 'EVENING' ? 8 : 7,
          minIdx: 0,
          ampm: (r.period === 'EVENING' ? 'PM' : 'AM') as 'AM' | 'PM',
        }
        setRPanelState({
          orig: r.name,
          name: r.name,
          time: r.time || '',
          period: r.period,
          timeSet: !!(r.time && r.time.trim()),
          hour: parsed.hour,
          minIdx: parsed.minIdx,
          ampm: parsed.ampm,
        })
      },
      toggle: () =>
        setRoutines((s) =>
          s.map((x) => (x.name === r.name ? { ...x, done: !x.done } : x)),
        ),
    }),
    [askDelete],
  )

  const setRDraft = (type: string, val: string) =>
    setRoutineDrafts((s) => ({ ...s, [type]: val }))

  const addRoutine = (period: RoutinePeriod, name: string) => {
    const n = (name || '').trim()
    if (!n) return
    setRoutines((s) => [
      ...s,
      { name: n, period, time: '', done: false, streak: 0, week: EMPTY_WEEK() },
    ])
    setRoutineDrafts((s) => ({ ...s, [period]: '' }))
  }

  const saveRoutine = () => {
    const rp = rPanel
    if (!rp || !rp.name.trim()) return
    const name = rp.name.trim()
    const timeStr = rp.timeSet
      ? rp.hour + ':' + rMM(rp.minIdx) + ' ' + rp.ampm
      : ''
    setRoutines((s) =>
      rp.orig
        ? s.map((x) =>
            x.name === rp.orig
              ? { ...x, name, time: timeStr, period: rp.period }
              : x,
          )
        : [
            ...s,
            {
              name,
              time: timeStr,
              period: rp.period || 'MORNING',
              done: false,
              streak: 0,
              week: EMPTY_WEEK(),
            },
          ],
    )
    setRPanelState(null)
  }

  return {
    routines,
    setRoutines,
    routinesDone: routines.filter((r) => r.done).length,
    routinesTotal: routines.length,
    mkRoutine,
    routineDrafts,
    setRDraft,
    addRoutine,
    routinesView,
    setRoutinesView,
    rPanel,
    setRPanel,
    setRPanelState,
    saveRoutine,
  }
}
