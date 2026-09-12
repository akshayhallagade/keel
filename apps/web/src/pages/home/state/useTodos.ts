import { useCallback, useEffect, useRef, useState } from 'react'
import type { Todo, WeekStart } from '@keel/types'
import { areaColor } from '../seedData'
import type { TodoPanelState } from '../types'
import * as api from '../../../api/todos'
import { ApiError } from '../../../api/client'
import { parseQuickAdd } from './parseQuickAdd'
import {
  dayTimeToInstant,
  dayToInstant,
  groupFor,
  type TodoGroup,
  fmtDueAt,
  instantToDay,
  instantToTime,
  isISO,
  isoOf,
  isToday,
  monthLong,
  overdueDays,
  todayDay,
} from './helpers'

const AREAS = ['FINANCE', 'HOME', 'HEALTH', 'PROJECTS', 'INBOX']

/// How long the "deleted — undo" bar stays up. Long enough to notice and reach,
/// short enough that it is gone before it becomes clutter.
const UNDO_MS = 8000

/// How long a row stays on screen after being ticked, before it moves to Done.
/// Matches the opacity transition on .hs-row in Home.css.
const COMPLETE_MS = 700

/**
 * Todos, backed by the API.
 *
 * Changes are applied locally first and sent in the background, so ticking a
 * box is instant. If the request fails the local change is rolled back and
 * `todosError` says so — the alternative is a screen quietly disagreeing with
 * the server.
 *
 * `weekStart` decides where the "this week" boundary falls, so the three lists
 * follow the user's own idea of when a week begins.
 */
export function useTodos(weekStart: WeekStart) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [todosError, setTodosError] = useState('')

  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [animFlip, setAnimFlip] = useState(false)
  const [todoPanel, setTodoPanel] = useState<TodoPanelState | null>(null)

  /// The todo the undo bar is currently offering to bring back, if any.
  const [undoable, setUndoable] = useState<Todo | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /// Ids mid-tick. Purely visual, and deliberately not on the record: the row
  /// is fading out locally while the request is in flight.
  const [completing, setCompleting] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    api
      .listTodos()
      .then((list) => {
        if (!cancelled) setTodos(list)
      })
      .catch(() => {
        if (!cancelled) setTodosError('Could not load your todos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fail = useCallback((message: string) => setTodosError(message), [])

  /// Replace one todo in place, by id.
  const put = useCallback(
    (updated: Todo) =>
      setTodos((s) => s.map((t) => (t.id === updated.id ? updated : t))),
    [],
  )

  const setPanel = useCallback((patch: Partial<TodoPanelState>) => {
    setTodoPanel((s) => (s ? { ...s, ...patch } : s))
  }, [])

  // --- Mutations -----------------------------------------------------------

  /// Typing into the quick-add box means "today" — that is what the box is
  /// for — so anything the text did not date itself gets today's date. Without
  /// one it would have no due date and land in Someday, which is not what
  /// anyone typing into a todo list means.
  const add = useCallback(
    (input: { text: string; area: string; dueAt: string | null }) =>
      api
        .createTodo({
          text: input.text,
          area: input.area,
          dueAt: input.dueAt ?? dayToInstant(todayDay()),
          starred: false,
        })
        // Newest first, matching the server's ordering.
        .then((created) => setTodos((s) => [created, ...s]))
        .catch(() => fail('Could not add that todo.')),
    [fail],
  )

  const toggleStar = useCallback(
    (todo: Todo) => {
      const next = { ...todo, starred: !todo.starred }
      put(next)
      api
        .updateTodo(todo.id, { starred: next.starred })
        .then(put)
        .catch((err) => {
          put(todo)
          // A full Top 3 comes back as a 409 with a message written for the
          // person reading it. Anything else gets the generic line — an
          // ApiError's message is only meant for humans when we chose it.
          fail(
            err instanceof ApiError && err.status === 409
              ? err.message
              : 'Could not update that todo.',
          )
        })
    },
    [put, fail],
  )

  const complete = useCallback(
    (todo: Todo) => {
      if (completing.has(todo.id)) return
      setCompleting((s) => new Set(s).add(todo.id))

      const stopAnimating = () =>
        setCompleting((s) => {
          const next = new Set(s)
          next.delete(todo.id)
          return next
        })

      api
        .updateTodo(todo.id, { completed: true })
        .then((updated) => {
          // Let the row finish fading before it moves to the Done list.
          setTimeout(() => {
            put(updated)
            stopAnimating()
          }, COMPLETE_MS)
        })
        .catch(() => {
          stopAnimating()
          fail('Could not complete that todo.')
        })
    },
    [completing, put, fail],
  )

  /// Un-ticking something from the Done tab. No fade — it is going back to a
  /// list the user is not looking at, so there is nothing to watch leave.
  const uncomplete = useCallback(
    (todo: Todo) => {
      put({ ...todo, completedAt: null })
      api
        .updateTodo(todo.id, { completed: false })
        .then(put)
        .catch(() => {
          put(todo)
          fail('Could not reopen that todo.')
        })
    },
    [put, fail],
  )

  /// Deleting is soft on the server — the row keeps existing with `deletedAt`
  /// set — so for UNDO_MS we offer it back rather than making the user retype
  /// something they deleted by accident.
  const remove = useCallback(
    (todo: Todo) => {
      setTodos((s) => s.filter((t) => t.id !== todo.id))

      api
        .deleteTodo(todo.id)
        .then(() => {
          if (undoTimer.current) clearTimeout(undoTimer.current)
          setUndoable(todo)
          undoTimer.current = setTimeout(() => setUndoable(null), UNDO_MS)
        })
        .catch(() => {
          // It is still on the server, so put it back on screen.
          setTodos((s) => [todo, ...s])
          fail('Could not delete that todo.')
        })
    },
    [fail],
  )

  const undoDelete = useCallback(() => {
    const todo = undoable
    if (!todo) return

    setUndoable(null)
    if (undoTimer.current) clearTimeout(undoTimer.current)

    api
      .restoreTodo(todo.id)
      // The server hands back the real row, which may have moved on since we
      // last saw it — use that rather than the copy we were holding.
      .then((restored) => setTodos((s) => [restored, ...s]))
      .catch(() => fail('Could not bring that todo back.'))
  }, [undoable, fail])

  /// A pending timer outlives the screen otherwise, and fires setState on a
  /// hook that is gone.
  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current)
    },
    [],
  )

  // --- Row model -----------------------------------------------------------

  /// What a todo row needs: its data, and what its three buttons do. Nothing
  /// about how it looks — TodoRow and Home.css own that.
  const mkRow = useCallback(
    (t: Todo, idx: number) => {
      const late = overdueDays(t.dueAt)
      return {
        id: t.id,
        text: t.text,
        tag: t.area,
        due: fmtDueAt(t.dueAt),
        /// Days late, 0 when it is not. The row draws the date in the warning
        /// colour and adds "OVERDUE 3D" when this is set — `groupFor` already
        /// keeps overdue todos in Today, but nothing said they were late.
        overdue: late,
        overdueLabel: late ? `OVERDUE ${late}D` : '',
        star: t.starred,
        done: !!t.completedAt,
        completing: completing.has(t.id),
        dotColor: areaColor(t.area),
        /// Position in its own list, used only to stagger the entrance.
        index: idx || 0,
        starToggle: () => toggleStar(t),
        toggle: () => (t.completedAt ? uncomplete(t) : complete(t)),
        remove: () => remove(t),
        edit: () =>
          setTodoPanel({
            id: t.id,
            text: t.text,
            area: t.area,
            day: t.dueAt ? instantToDay(t.dueAt) : '',
            time: t.dueAt ? instantToTime(t.dueAt) : '',
            starred: t.starred,
          }),
      }
    },
    [completing, toggleStar, complete, uncomplete, remove],
  )

  // --- Derived lists -------------------------------------------------------

  const open = todos.filter((t) => !t.completedAt)
  const starred = open.filter((t) => t.starred)

  /**
   * Search narrows the lists on the Todos screen only.
   *
   * This hook is shared — the Today screen reads `todos` and `starred` from the
   * same place — so filtering everything here would mean typing in the Todos
   * search box silently emptied Today's Top 3. The counts and the rail stay
   * whole for the same reason: they are facts about your todos, not about your
   * search.
   */
  const needle = query.trim().toLowerCase()
  const matches = (t: Todo) =>
    !needle ||
    t.text.toLowerCase().includes(needle) ||
    t.area.toLowerCase().includes(needle)

  /// Most recently finished first — the opposite of the open lists, because
  /// "what did I just do" is the question the Done tab answers.
  const done = todos
    .filter((t) => t.completedAt && matches(t))
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))

  /// The rail says DONE TODAY, so it has to mean today. It used to be every
  /// todo ever completed, which was a number that only ever went up.
  const doneToday = todos.filter((t) => t.completedAt && isToday(t.completedAt))

  /// Worked out from the due date every render, against the clock and the
  /// user's chosen first day of the week — never read off the record. This is
  /// what stops a todo added on Monday still claiming to be "today" on
  /// Wednesday.
  const inGroup = (group: TodoGroup) =>
    open.filter((t) => matches(t) && groupFor(t.dueAt, weekStart) === group)

  const todayList = inGroup('TODAY')
  const weekList = inGroup('THIS_WEEK')
  const somedayList = inGroup('SOMEDAY')

  /// The real "BY AREA" list. This panel used to be four hardcoded rows with
  /// invented counts that never moved, whatever you added or ticked off.
  /// Busiest first, so the rail answers "where is the work piling up?".
  const areaCounts = Object.entries(
    open.reduce<Record<string, number>>((acc, t) => {
      acc[t.area] = (acc[t.area] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([name, count]) => ({ name, count, color: areaColor(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  // --- Due-date calendar, shown inside the todo panel ----------------------

  const now = new Date()
  const todayISO = isoOf(now.getFullYear(), now.getMonth(), now.getDate())
  const base =
    todoPanel && isISO(todoPanel.day)
      ? { y: +todoPanel.day.slice(0, 4), m: +todoPanel.day.slice(5, 7) - 1 }
      : { y: now.getFullYear(), m: now.getMonth() }

  const calShift = (todoPanel && todoPanel.calShift) || 0
  const dm = new Date(base.y, base.m + calShift, 1)
  const dY = dm.getFullYear()
  const dMo = dm.getMonth()
  const firstDow = new Date(dY, dMo, 1).getDay()
  const daysIn = new Date(dY, dMo + 1, 0).getDate()

  // Leading blanks pad the grid so day 1 lands under the right weekday.
  const calCells: {
    day: string
    selected: boolean
    isToday: boolean
    pick: () => void
  }[] = []
  for (let k = 0; k < firstDow; k++) {
    calCells.push({ day: '', selected: false, isToday: false, pick: () => {} })
  }
  for (let d = 1; d <= daysIn; d++) {
    const iso = isoOf(dY, dMo, d)
    calCells.push({
      day: String(d),
      selected: !!todoPanel && todoPanel.day === iso,
      isToday: iso === todayISO,
      pick: () => setPanel({ day: iso }),
    })
  }

  const cal = {
    label: monthLong(dm) + ' ' + dY,
    prev: () => setPanel({ calShift: calShift - 1 }),
    next: () => setPanel({ calShift: calShift + 1 }),
    cells: calCells,
  }

  const areaChips = AREAS.map((name) => ({
    name,
    selected: !!todoPanel && todoPanel.area === name,
    pick: () => setPanel({ area: name }),
  }))

  // --- Panel ---------------------------------------------------------------

  const savePanel = () => {
    if (!todoPanel || !todoPanel.text.trim()) return
    const panel = todoPanel
    setTodoPanel(null)

    const fields = {
      text: panel.text.trim(),
      area: panel.area,
      starred: panel.starred,
      // A time with no day has nothing to attach to, so the day is what decides
      // whether there is a due date at all.
      dueAt: panel.day ? dayTimeToInstant(panel.day, panel.time) : null,
    }

    // An id means it already exists. No id means it is new — the old code used
    // an array index for this, which drifted whenever the list changed.
    if (panel.id) {
      api
        .updateTodo(panel.id, fields)
        .then(put)
        .catch(() => fail('Could not save that todo.'))
    } else {
      api
        .createTodo(fields)
        .then((created) => setTodos((s) => [created, ...s]))
        .catch(() => fail('Could not add that todo.'))
    }
  }

  /// Opening the full panel carries over whatever was already typed, dates and
  /// all, so pressing + DETAILS never costs you what you had written.
  const openCreateTodo = () => {
    const parsed = parseQuickAdd(draft)
    setTodoPanel({
      id: null,
      text: parsed.text,
      area: parsed.area,
      day: parsed.dueAt ? instantToDay(parsed.dueAt) : todayDay(),
      time: parsed.dueAt ? instantToTime(parsed.dueAt) : '',
      starred: false,
    })
    setDraft('')
  }

  // --- Quick-add box -------------------------------------------------------

  const onDraftChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft(e.target.value)

  /// Enter adds straight from the box. The date, time and #area are read out of
  /// what was typed — see parseQuickAdd.
  const onDraftKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return

    const parsed = parseQuickAdd(draft)
    // "tomorrow" on its own is a date with nothing to do on it.
    if (!parsed.text) return

    add(parsed)
    setDraft('')
  }

  return {
    todos: open,
    done,
    doneToday,
    areaCounts,
    todosLoading: loading,
    todosError,
    draft,
    onDraftChange,
    onDraftKey,
    query,
    setQuery,
    undoable,
    undoDelete,
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
    removeTodo: remove,
  }
}
