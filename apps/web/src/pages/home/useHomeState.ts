import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@keel/types'
import {
  DOT_COLORS,
  SEED_ALARMS,
  SEED_DONE,
  SEED_HOBBIES,
  SEED_HOBBY_TRY,
  SEED_PROJECTS,
  SEED_ROUTINES,
  SEED_TODOS,
  SPEND_DOTS,
} from './seedData'
import type {
  Alarm,
  AlarmDraft,
  ConfirmDeleteState,
  CreatePanelState,
  CreatePanelType,
  HobbyPanelState,
  Profile,
  Project,
  ProjectPanelState,
  Prefs,
  Routine,
  RoutinePanelState,
  RoutinePeriod,
  Screen,
  Todo,
  TodoGroup,
  TodoPanelState,
} from './types'

/// Locale pinned to 'en': these are display strings in a fixed English design,
/// not something that should follow the visitor's browser language.
const shortMonth = new Intl.DateTimeFormat('en', { month: 'short' })
const longMonth = new Intl.DateTimeFormat('en', { month: 'long' })

export const monthShort = (d: Date) => shortMonth.format(d).toUpperCase()
export const monthLong = (d: Date) => longMonth.format(d).toUpperCase()

const R_MINS = [0, 15, 30, 45]

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
const pad2 = (n: number) => String(n).padStart(2, '0')
export const isoOf = (y: number, m: number, d: number) =>
  `${y}-${pad2(m + 1)}-${pad2(d)}`
const rMM = (idx: number) => {
  const v = R_MINS[idx]
  return v < 10 ? '0' + v : String(v)
}
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

export function useHomeState(user: User, onSignOut: () => void) {
  const [screen, setScreen] = useState<Screen>('today')
  const [draft, setDraft] = useState('')
  const [todoPanel, setTodoPanel] = useState<TodoPanelState | null>(null)
  const [filter, setFilter] = useState('ALL')
  const [animFlip, setAnimFlip] = useState(false)
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [projTaskDraft, setProjTaskDraft] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({})
  const [splash, setSplash] = useState(true)
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
  const [todos, setTodos] = useState<Todo[]>(SEED_TODOS)
  const [done, setDone] = useState(SEED_DONE)
  const [routines, setRoutines] = useState<Routine[]>(SEED_ROUTINES)
  const [routineDrafts, setRoutineDrafts] = useState<Record<string, string>>({
    'WAKE UP': '',
    MORNING: '',
    AFTERNOON: '',
    EVENING: '',
    BEDTIME: '',
  })
  const [hoverRoutine, setHoverRoutine] = useState<string | null>(null)
  const [projectDraft, setProjectDraft] = useState('')
  const [routinesView, setRoutinesView] = useState<'grouped' | 'flat'>(
    'grouped',
  )
  const [alarmView, setAlarmView] = useState<'list' | 'dial'>('list')
  const [editingAlarmIdx, setEditingAlarmIdx] = useState<number | null>(null)
  const [alarmDraft, setAlarmDraft] = useState<AlarmDraft | null>(null)
  const [dragHand, setDragHand] = useState<'hour' | 'minute' | null>(null)
  const [dragTileHand, setDragTileHand] = useState<'hour' | 'minute' | null>(
    null,
  )
  const [dragTileIdx, setDragTileIdx] = useState<number | null>(null)
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS)
  const [rPanel, setRPanelState] = useState<RoutinePanelState | null>(null)
  const [confirmDel, setConfirmDel] = useState<ConfirmDeleteState | null>(null)
  const [projPanel, setProjPanelState] = useState<ProjectPanelState | null>(
    null,
  )
  const [hobbies, setHobbies] = useState(SEED_HOBBIES)
  const [hobbyTry, setHobbyTry] = useState(SEED_HOBBY_TRY)
  const [hobbyDraft, setHobbyDraft] = useState('')
  const [hPanel, setHPanelState] = useState<HobbyPanelState | null>(null)
  const [hoverHobby, setHoverHobby] = useState<string | null>(null)
  const [cPanel, setCPanelState] = useState<CreatePanelState | null>(null)
  const [newGoals, setNewGoals] = useState<{ name: string; target: string }[]>(
    [],
  )
  const [newBooks, setNewBooks] = useState<{ name: string; author: string }[]>(
    [],
  )
  const [newReading, setNewReading] = useState<
    { name: string; author: string }[]
  >([])
  const [newQuotes, setNewQuotes] = useState<
    { text: string; author: string }[]
  >([])
  const [newWish, setNewWish] = useState<
    { name: string; price: string; cat: string | null }[]
  >([])
  const [newSpend, setNewSpend] = useState<
    { name: string; price: string; cat: string | null; dot: string }[]
  >([])
  const [newRems, setNewRems] = useState<
    { name: string; when: string; bucket: string | null }[]
  >([])
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS)
  const [countProg, setCountProg] = useState(1)

  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const cntRafRef = useRef(0)

  const startCount = useCallback(() => {
    cancelAnimationFrame(cntRafRef.current)
    const t0 = performance.now()
    const dur = 900
    const step = (t: number) => {
      const pr = Math.min(1, (t - t0) / dur)
      setCountProg(1 - Math.pow(1 - pr, 3))
      if (pr < 1) cntRafRef.current = requestAnimationFrame(step)
    }
    cntRafRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    splashTimerRef.current = setTimeout(() => {
      setSplash(false)
      startCount()
    }, 3100)
    return () => {
      clearTimeout(splashTimerRef.current)
      cancelAnimationFrame(cntRafRef.current)
    }
  }, [startCount])

  useEffect(() => {
    if (!dragHand) return
    const onMove = (ev: PointerEvent) => {
      const svg = document.getElementById('alarm-edit-clock')
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const scale = 260 / rect.width
      const cx = 130,
        cy = 130
      const px = (ev.clientX - rect.left) * scale - cx
      const py = (ev.clientY - rect.top) * scale - cy
      let deg = (Math.atan2(px, -py) * 180) / Math.PI
      if (deg < 0) deg += 360
      if (dragHand === 'minute') {
        setAlarmDraft((d) => (d ? { ...d, m: Math.round(deg / 6) % 60 } : d))
      } else {
        setAlarmDraft((d) => {
          if (!d) return d
          let hh = Math.round(deg / 30) % 12
          if (hh === 0) hh = 12
          return { ...d, h: hh }
        })
      }
    }
    const onUp = () => setDragHand(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragHand])

  useEffect(() => {
    if (!dragTileHand || dragTileIdx === null) return
    const idx = dragTileIdx
    const onMove = (ev: PointerEvent) => {
      const svg = document.getElementById('alarm-tile-clock-' + idx)
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const scale = 110 / rect.width
      const cx = 55,
        cy = 55
      const px = (ev.clientX - rect.left) * scale - cx
      const py = (ev.clientY - rect.top) * scale - cy
      let deg = (Math.atan2(px, -py) * 180) / Math.PI
      if (deg < 0) deg += 360
      const hand = dragTileHand
      setAlarms((s) =>
        s.map((a, ai) => {
          if (ai !== idx) return a
          const [h0, m0] = a.time.split(':').map(Number)
          let h = h0,
            m = m0
          if (hand === 'minute') m = Math.round(deg / 6) % 60
          else {
            const hh = Math.round(deg / 30) % 12
            h = hh === 0 ? 12 : hh
          }
          return { ...a, time: h + ':' + String(m).padStart(2, '0') }
        }),
      )
    }
    const onUp = () => {
      setDragTileHand(null)
      setDragTileIdx(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragTileHand, dragTileIdx])

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

  const setPanel = useCallback((patch: Partial<TodoPanelState>) => {
    setTodoPanel((s) => (s ? { ...s, ...patch } : s))
  }, [])
  const setRPanel = useCallback((patch: Partial<RoutinePanelState>) => {
    setRPanelState((s) => (s ? { ...s, ...patch } : s))
  }, [])
  const setProjPanel = useCallback((patch: Partial<ProjectPanelState>) => {
    setProjPanelState((s) => (s ? { ...s, ...patch } : s))
  }, [])

  const mkRow = useCallback(
    (t: Todo, idx: number) => {
      const i = todos.indexOf(t)
      const c = !!t.completing
      const hov = hoverRow === i
      return {
        text: t.text,
        tag: t.tag,
        due: fmtDue(t.due),
        starGlyph: t.star ? '★' : '☆',
        starColor: t.star ? 'var(--accent)' : 'var(--check-border)',
        starOpacity: t.star || hov ? 1 : 0,
        editOpacity: hov ? 1 : 0,
        starToggle: () =>
          setTodos((s) =>
            s.map((x) =>
              x.text === t.text && x.group === t.group
                ? { ...x, star: !x.star }
                : x,
            ),
          ),
        onEnter: () => setHoverRow(i),
        onLeave: () => setHoverRow(null),
        dotColor: DOT_COLORS[t.tag] || 'var(--check-border)',
        check: c ? '✓' : '',
        boxBorder: c ? 'var(--ink)' : 'var(--check-border)',
        boxBg: c ? 'var(--ink)' : 'transparent',
        textColor: c ? 'var(--muted)' : 'var(--ink)',
        deco: c ? 'line-through' : 'none',
        opacity: c ? 0.35 : 1,
        shift: c ? 'translateX(6px)' : 'none',
        delay: (idx || 0) * 0.05 + 's',
        tickAnim: c ? 'tickIn .3s cubic-bezier(.34,1.56,.64,1) both' : 'none',
        toggle: () => {
          if (t.completing) return
          setTodos((s) =>
            s.map((x) =>
              x.text === t.text && x.group === t.group
                ? { ...x, completing: true }
                : x,
            ),
          )
          setTimeout(() => {
            setTodos((s) =>
              s.filter((x) => !(x.text === t.text && x.group === t.group)),
            )
            setDone((s) => [{ text: t.text }, ...s])
          }, 700)
        },
        edit: () =>
          setTodoPanel({
            index: i,
            text: t.text,
            tag: t.tag,
            due: t.due || '',
            star: !!t.star,
            group: t.group,
          }),
      }
    },
    [todos, hoverRow],
  )

  const todayList = todos.filter((t) => t.group === 'TODAY')
  const weekList = todos.filter((t) => t.group === 'THIS WEEK')
  const somedayList = todos.filter((t) => t.group === 'SOMEDAY')
  const starred = todos.filter((t) => t.star)

  const now = new Date()
  const todayISO = isoOf(now.getFullYear(), now.getMonth(), now.getDate())
  let baseY: number, baseM: number
  if (todoPanel && isISO(todoPanel.due)) {
    baseY = +todoPanel.due.slice(0, 4)
    baseM = +todoPanel.due.slice(5, 7) - 1
  } else {
    baseY = now.getFullYear()
    baseM = now.getMonth()
  }
  const calShift = (todoPanel && todoPanel.calShift) || 0
  const dm = new Date(baseY, baseM + calShift, 1)
  const dY = dm.getFullYear()
  const dMo = dm.getMonth()
  const firstDow = new Date(dY, dMo, 1).getDay()
  const daysIn = new Date(dY, dMo + 1, 0).getDate()
  const calCells: {
    day: string
    pick: () => void
    bg: string
    color: string
    weight: number
    ring: string
  }[] = []
  for (let k = 0; k < firstDow; k++) {
    calCells.push({
      day: '',
      pick: () => {},
      bg: 'transparent',
      color: 'transparent',
      weight: 400,
      ring: '1px solid transparent',
    })
  }
  for (let d = 1; d <= daysIn; d++) {
    const iso = isoOf(dY, dMo, d)
    const sel = todoPanel && todoPanel.due === iso
    const isTodayCell = iso === todayISO
    calCells.push({
      day: String(d),
      pick: () => setPanel({ due: iso }),
      bg: sel ? 'var(--accent)' : 'transparent',
      color: sel ? 'var(--paper)' : isTodayCell ? 'var(--accent)' : '#3D382F',
      weight: sel || isTodayCell ? 600 : 400,
      ring:
        isTodayCell && !sel
          ? '1px solid var(--accent)'
          : '1px solid transparent',
    })
  }
  const cal = {
    label: monthLong(dm) + ' ' + dY,
    prev: () => setPanel({ calShift: calShift - 1 }),
    next: () => setPanel({ calShift: calShift + 1 }),
    cells: calCells,
  }

  const areas = ['FINANCE', 'HOME', 'HEALTH', 'PROJECTS', 'INBOX']
  const areaChips = areas.map((name) => {
    const sel = todoPanel && todoPanel.tag === name
    return {
      name,
      border: sel ? accent : 'var(--line)',
      color: sel ? 'var(--paper)' : 'var(--text-2)',
      bg: sel ? accent : 'var(--input-bg)',
      pick: () => setPanel({ tag: name }),
    }
  })

  const savePanel = () => {
    if (!todoPanel || !todoPanel.text.trim()) return
    const item: Todo = {
      text: todoPanel.text.trim(),
      tag: todoPanel.tag,
      due: todoPanel.due.trim() || 'DUE TODAY',
      star: todoPanel.star,
      group: todoPanel.group || 'TODAY',
    }
    setTodos((s) =>
      todoPanel.index >= 0
        ? s.map((t, j) => (j === todoPanel.index ? item : t))
        : [item, ...s],
    )
    setTodoPanel(null)
  }

  const openCreateTodo = () => {
    setTodoPanel({
      index: -1,
      text: draft.trim(),
      tag: 'INBOX',
      due: '',
      star: false,
      group: 'TODAY',
    })
    setDraft('')
  }

  const onDraftChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft(e.target.value)
  const onDraftKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    let text = draft.trim()
    if (!text) return
    let tag = 'INBOX'
    const m = text.match(/#(\w+)\s*$/)
    if (m) {
      tag = m[1].toUpperCase()
      text = text.slice(0, m.index).trim()
    }
    setTodos((s) => [
      { text, tag, due: 'DUE TODAY', star: false, group: 'TODAY' as TodoGroup },
      ...s,
    ])
    setDraft('')
  }

  const mkRoutine = useCallback(
    (r: Routine) => {
      const on = !!r.done
      return {
        name: r.name,
        check: on ? '✓' : '',
        boxBorder: on ? 'var(--ink)' : 'var(--check-border)',
        boxBg: on ? 'var(--ink)' : 'transparent',
        color: on ? 'var(--muted)' : r.missed ? accent : 'var(--ink)',
        deco: on ? 'line-through' : 'none',
        suffix: !on && r.missed ? '· △ MISSED' : '',
        time: r.time || '',
        streakLabel: r.streak > 0 ? String(r.streak) : '—',
        streakColor: r.streak > 0 ? 'var(--positive)' : 'var(--check-border)',
        weekDots: (r.week || []).map((v) => ({
          bg: v ? accent : 'var(--line)',
        })),
        tickAnim: on ? 'tickIn .3s cubic-bezier(.34,1.56,.64,1) both' : 'none',
        delOpacity: hoverRoutine === r.name ? 1 : 0,
        onEnter: () => setHoverRoutine(r.name),
        onLeave: () => setHoverRoutine(null),
        del: () => setConfirmDel({ kind: 'routine', name: r.name }),
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
      }
    },
    [accent, hoverRoutine],
  )

  const setRDraft = (type: string, val: string) =>
    setRoutineDrafts((s) => ({ ...s, [type]: val }))
  const addRoutine = (period: RoutinePeriod, name: string) => {
    const n = (name || '').trim()
    if (!n) return
    setRoutines((s) => [
      ...s,
      {
        name: n,
        period,
        time: '',
        done: false,
        streak: 0,
        week: [false, false, false, false, false, false, false],
      },
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
              week: [false, false, false, false, false, false, false],
            },
          ],
    )
    setRPanelState(null)
  }

  const mkProject = useCallback(
    (p: Project) => {
      const total = p.tasks.length
      const doneN = p.tasks.filter((t) => t.done).length
      const openN = total - doneN
      const pct = total ? Math.round((doneN / total) * 100) : 0
      const next = p.tasks.find((t) => !t.done)
      const setDoneFirst = () =>
        setProjects((s) =>
          s.map((x) => {
            if (x.name !== p.name) return x
            const idx = x.tasks.findIndex((t) => !t.done)
            if (idx < 0) return x
            return {
              ...x,
              tasks: x.tasks.map((t, i) =>
                i === idx ? { ...t, done: true } : t,
              ),
            }
          }),
        )
      return {
        name: p.name,
        tag: p.tag,
        pct: pct + '%',
        meta:
          pct + '% · ' + openN + (openN === 1 ? ' TASK OPEN' : ' TASKS OPEN'),
        nextLabel: next ? 'Next: ' + next.text : 'All tasks complete',
        nextBoxBorder: next ? 'var(--check-border)' : 'var(--ink)',
        nextBoxBg: next ? 'transparent' : 'var(--ink)',
        nextCheck: next ? '' : '✓',
        nextColor: next ? 'var(--ink)' : 'var(--muted)',
        nextDeco: next ? 'none' : 'line-through',
        completeNext: setDoneFirst,
        pauseLabel: p.paused ? 'RESUME' : 'PAUSE',
        togglePause: () =>
          setProjects((s) =>
            s.map((x) => (x.name === p.name ? { ...x, paused: !x.paused } : x)),
          ),
        edit: () =>
          setProjPanelState({ orig: p.name, name: p.name, tag: p.tag }),
        del: () => setConfirmDel({ kind: 'project', name: p.name }),
        view: () => {
          setScreen('projectDetail')
          setOpenProject(p.name)
          setProjTaskDraft('')
        },
        openCount: openN,
        expanded: !!expandedProjects[p.name],
        chevron: expandedProjects[p.name] ? '▴' : '▾',
        toggleExpand: () =>
          setExpandedProjects((s) => ({ ...s, [p.name]: !s[p.name] })),
        openTasks: p.tasks
          .map((t, i) => ({ t, i }))
          .filter((x) => !x.t.done)
          .map((x) => ({
            text: x.t.text,
            toggle: () =>
              setProjects((s) =>
                s.map((px) =>
                  px.name === p.name
                    ? {
                        ...px,
                        tasks: px.tasks.map((tt, ii) =>
                          ii === x.i ? { ...tt, done: true } : tt,
                        ),
                      }
                    : px,
                ),
              ),
          })),
        pinLabel: p.pinned ? 'UNPIN' : 'PIN',
        togglePin: () =>
          setProjects((s) => {
            const isPinned = s.find((x) => x.name === p.name)?.pinned
            if (!isPinned && s.filter((x) => x.pinned).length >= 3) return s
            return s.map((x) =>
              x.name === p.name ? { ...x, pinned: !x.pinned } : x,
            )
          }),
      }
    },
    [expandedProjects],
  )

  const activeProjects = projects.filter((p) => !p.paused).map(mkProject)
  const pausedProjects = projects.filter((p) => p.paused).map(mkProject)
  const pinnedList = projects.filter((p) => p.pinned && !p.paused).slice(0, 3)
  const pinnedProjects = pinnedList.map((p) => {
    const total = p.tasks.length
    const doneN = p.tasks.filter((t) => t.done).length
    const next = p.tasks.find((t) => !t.done)
    return {
      ...mkProject(p),
      done: doneN,
      total,
      pctNum: (total ? Math.round((doneN / total) * 100) : 0) + '%',
      next: next ? next.text : 'All tasks complete',
      slotId: 'pinned-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }
  })
  const unpinnedActive = projects
    .filter((p) => !p.paused && !p.pinned)
    .map(mkProject)

  const addProject = () => {
    const n = projectDraft.trim()
    if (!n) return
    setProjects((s) => [
      ...s,
      {
        name: n,
        tag: 'PROJECT',
        paused: false,
        tasks: [{ text: 'Define scope', done: false }],
      },
    ])
    setProjectDraft('')
  }

  const saveProject = () => {
    const pp = projPanel
    if (!pp || !pp.name.trim()) return
    setProjects((s) =>
      s.map((x) =>
        x.name === pp.orig
          ? {
              ...x,
              name: pp.name.trim(),
              tag: (pp.tag || '').trim().toUpperCase() || x.tag,
            }
          : x,
      ),
    )
    setProjPanelState(null)
  }

  const doDelete = () => {
    const cd = confirmDel
    if (!cd) return
    if (cd.kind === 'project')
      setProjects((s) => s.filter((x) => x.name !== cd.name))
    else setRoutines((s) => s.filter((x) => x.name !== cd.name))
    setConfirmDel(null)
  }

  const routinesDone = routines.filter((r) => r.done).length
  const routinesTotal = routines.length

  const openC = (type: CreatePanelType) => () =>
    setCPanelState({
      type,
      vals: {},
      chip: (CREATE_CHIP_OPTS[type] || [null])[0],
    })

  const cCfgs = CREATE_CFGS
  const cCfg = cPanel ? cCfgs[cPanel.type] : null

  const saveC = () => {
    const p = cPanel
    if (!p) return
    const v = (k: string) => (p.vals[k] || '').trim()
    if (!v('name') && !v('text')) return
    const t = p.type
    if (t === 'goal')
      setNewGoals((s) => [
        ...s,
        { name: v('name'), target: v('target') || 'define the first step' },
      ])
    else if (t === 'book')
      setNewBooks((s) => [
        ...s,
        { name: v('name'), author: (v('author') || 'UNKNOWN').toUpperCase() },
      ])
    else if (t === 'quote')
      setNewQuotes((s) => [
        ...s,
        { text: v('text'), author: (v('author') || 'UNKNOWN').toUpperCase() },
      ])
    else if (t === 'wish')
      setNewWish((s) => [
        ...s,
        { name: v('name'), price: parseInr(v('price')), cat: p.chip },
      ])
    else if (t === 'spend')
      setNewSpend((s) => [
        {
          name: v('name'),
          price: parseInr(v('price')),
          cat: p.chip,
          dot: SPEND_DOTS[p.chip || ''] || 'var(--check-border)',
        },
        ...s,
      ])
    else if (t === 'alarm')
      setAlarms((s) => [
        ...s,
        {
          time: v('time') || '7:00',
          ampm: (p.chip as 'AM' | 'PM') || 'AM',
          label: v('name'),
          days: (v('days') || 'ONCE').toUpperCase(),
          on: true,
        },
      ])
    else if (t === 'rem')
      setNewRems((s) => [
        ...s,
        {
          name: v('name'),
          when: (v('when') || 'SOON').toUpperCase(),
          bucket: p.chip,
        },
      ])
    setCPanelState(null)
  }

  return {
    // core
    screen,
    go,
    onSignOut,
    accent,
    setAccent,
    mode,
    setMode,
    splash,
    countProg,
    // sidebar/profile
    profile,
    setProfile,
    // todos
    todos,
    done,
    draft,
    onDraftChange,
    onDraftKey,
    filter,
    setFilter,
    animFlip,
    setAnimFlip,
    mkRow,
    todayList,
    weekList,
    somedayList,
    starred,
    todoPanel,
    setTodoPanel,
    savePanel,
    setPanel,
    cal,
    areaChips,
    openCreateTodo,
    // routines
    routines,
    routinesDone,
    routinesTotal,
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
    // projects
    projects,
    activeProjects,
    pausedProjects,
    pinnedProjects,
    unpinnedActive,
    projectDraft,
    setProjectDraft,
    addProject,
    openProject,
    setOpenProject,
    projTaskDraft,
    setProjTaskDraft,
    setProjects,
    projPanel,
    setProjPanel,
    setProjPanelState,
    saveProject,
    setScreen,
    confirmDel,
    setConfirmDel,
    doDelete,
    // hobbies
    hobbies,
    setHobbies,
    hobbyTry,
    setHobbyTry,
    hobbyDraft,
    setHobbyDraft,
    hPanel,
    setHPanelState,
    hoverHobby,
    setHoverHobby,
    // create panel
    cPanel,
    setCPanelState,
    cCfg,
    openC,
    saveC,
    newGoals,
    newBooks: newBooks.map((b, i) => ({
      ...b,
      start: () => {
        setNewBooks((s) => s.filter((_, xi) => xi !== i))
        setNewReading((s) => [...s, b])
      },
    })),
    newReading,
    setNewReading,
    newQuotes,
    newWish,
    newSpend,
    newRems,
    // alarms
    alarms,
    setAlarms,
    alarmView,
    setAlarmView,
    editingAlarmIdx,
    setEditingAlarmIdx,
    alarmDraft,
    setAlarmDraft,
    setDragHand,
    setDragTileHand,
    setDragTileIdx,
    // settings
    prefs,
    setPrefs,
    weekStart,
    setWeekStart,
  }
}

const CREATE_CFGS: Record<
  CreatePanelType,
  {
    title: string
    save: string
    fields: [string, string, string][]
    chips?: { label: string; opts: string[] }
  }
> = {
  goal: {
    title: 'NEW GOAL',
    save: 'SET GOAL',
    fields: [
      ['name', 'GOAL', 'e.g. Learn Spanish'],
      ['target', 'FIRST STEP', 'e.g. Book 10 lessons'],
    ],
  },
  book: {
    title: 'NEW BOOK',
    save: 'ADD BOOK',
    fields: [
      ['name', 'TITLE', 'e.g. Thinking, Fast and Slow'],
      ['author', 'AUTHOR', 'e.g. Daniel Kahneman'],
    ],
  },
  quote: {
    title: 'SAVE QUOTE',
    save: 'SAVE QUOTE',
    fields: [
      ['text', 'QUOTE', 'The words worth keeping'],
      ['author', 'WHO SAID IT', 'e.g. Seneca'],
    ],
  },
  wish: {
    title: 'ADD TO WISHLIST',
    save: 'START THE CLOCK',
    fields: [
      ['name', 'ITEM', 'e.g. Espresso machine'],
      ['price', 'PRICE (₹)', 'e.g. 14500'],
    ],
    chips: {
      label: 'CATEGORY',
      opts: ['WANT', 'HOBBY', 'HOME', 'BOOKS', 'HEALTH'],
    },
  },
  spend: {
    title: 'LOG EXPENSE',
    save: 'LOG IT',
    fields: [
      ['name', 'WHAT', 'e.g. Chai + samosa'],
      ['price', 'AMOUNT (₹)', 'e.g. 120'],
    ],
    chips: {
      label: 'CATEGORY',
      opts: ['GROCERIES', 'EATING OUT', 'TRANSPORT', 'HOBBIES', 'OTHER'],
    },
  },
  alarm: {
    title: 'NEW ALARM',
    save: 'ADD ALARM',
    fields: [
      ['time', 'TIME', 'e.g. 6:30'],
      ['name', 'LABEL', 'e.g. Morning run'],
      ['days', 'REPEATS', 'e.g. MON – FRI'],
    ],
    chips: { label: 'AM / PM', opts: ['AM', 'PM'] },
  },
  rem: {
    title: 'NEW REMINDER',
    save: 'SET REMINDER',
    fields: [
      ['name', 'REMIND ME TO', 'e.g. Call the dentist'],
      ['when', 'WHEN', 'e.g. TUE 4PM'],
    ],
    chips: { label: 'BUCKET', opts: ['TODAY', 'UPCOMING', 'RECURRING'] },
  },
}

const CREATE_CHIP_OPTS: Partial<Record<CreatePanelType, (string | null)[]>> =
  Object.fromEntries(
    Object.entries(CREATE_CFGS).map(([k, v]) => [
      k,
      v.chips ? v.chips.opts : [null],
    ]),
  )

export type HomeState = ReturnType<typeof useHomeState>
