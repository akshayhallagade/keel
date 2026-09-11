import { useCallback, useEffect, useState } from 'react'
import type { Todo, TodoBucket } from '@keel/types'
import { DOT_COLORS } from '../seedData'
import type { TodoPanelState } from '../types'
import * as api from '../../../api/todos'
import { ApiError } from '../../../api/client'
import {
  dayToInstant,
  fmtDueAt,
  instantToDay,
  isISO,
  isoOf,
  monthLong,
} from './helpers'

const AREAS = ['FINANCE', 'HOME', 'HEALTH', 'PROJECTS', 'INBOX']

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
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [todosError, setTodosError] = useState('')

  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [animFlip, setAnimFlip] = useState(false)
  const [todoPanel, setTodoPanel] = useState<TodoPanelState | null>(null)

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

  const add = useCallback(
    (input: { text: string; area?: string; bucket?: TodoBucket }) =>
      api
        .createTodo({
          text: input.text,
          area: input.area ?? 'INBOX',
          bucket: input.bucket ?? 'TODAY',
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

  const remove = useCallback(
    (todo: Todo) => {
      setTodos((s) => s.filter((t) => t.id !== todo.id))
      api.deleteTodo(todo.id).catch(() => {
        setTodos((s) => [todo, ...s])
        fail('Could not delete that todo.')
      })
    },
    [fail],
  )

  // --- Row model -----------------------------------------------------------

  /// What a todo row needs: its data, and what its three buttons do. Nothing
  /// about how it looks — TodoRow and Home.css own that.
  const mkRow = useCallback(
    (t: Todo, idx: number) => ({
      id: t.id,
      text: t.text,
      tag: t.area,
      due: fmtDueAt(t.dueAt),
      star: t.starred,
      completing: completing.has(t.id),
      dotColor: DOT_COLORS[t.area] || 'var(--check-border)',
      /// Position in its own list, used only to stagger the entrance.
      index: idx || 0,
      starToggle: () => toggleStar(t),
      toggle: () => complete(t),
      edit: () =>
        setTodoPanel({
          id: t.id,
          text: t.text,
          area: t.area,
          day: t.dueAt ? instantToDay(t.dueAt) : '',
          starred: t.starred,
          bucket: t.bucket,
        }),
    }),
    [completing, toggleStar, complete],
  )

  // --- Derived lists -------------------------------------------------------

  const open = todos.filter((t) => !t.completedAt)
  const done = todos.filter((t) => t.completedAt)

  const inBucket = (bucket: TodoBucket) =>
    open.filter((t) => t.bucket === bucket)

  const todayList = inBucket('TODAY')
  const weekList = inBucket('THIS_WEEK')
  const somedayList = inBucket('SOMEDAY')
  const starred = open.filter((t) => t.starred)

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
      bucket: panel.bucket,
      starred: panel.starred,
      dueAt: panel.day ? dayToInstant(panel.day) : null,
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

  const openCreateTodo = () => {
    setTodoPanel({
      id: null,
      text: draft.trim(),
      area: 'INBOX',
      day: '',
      starred: false,
      bucket: 'TODAY',
    })
    setDraft('')
  }

  // --- Quick-add box -------------------------------------------------------

  const onDraftChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft(e.target.value)

  /// Enter adds straight from the box. A trailing "#tag" becomes the area.
  const onDraftKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    let text = draft.trim()
    if (!text) return

    let area = 'INBOX'
    const m = text.match(/#(\w+)\s*$/)
    if (m) {
      area = m[1].toUpperCase()
      text = text.slice(0, m.index).trim()
    }
    if (!text) return

    add({ text, area })
    setDraft('')
  }

  return {
    todos: open,
    done,
    todosLoading: loading,
    todosError,
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
    removeTodo: remove,
  }
}
