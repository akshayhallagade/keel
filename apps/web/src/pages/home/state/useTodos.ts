import { useCallback, useState } from 'react'
import { DOT_COLORS, SEED_DONE, SEED_TODOS } from '../seedData'
import type { Todo, TodoGroup, TodoPanelState } from '../types'
import { fmtDue, isISO, isoOf, monthLong } from './helpers'

const AREAS = ['FINANCE', 'HOME', 'HEALTH', 'PROJECTS', 'INBOX']

/// How long the completing row is left on screen before it moves to Done.
/// Matches the opacity transition on .hs-row in Home.css.
const COMPLETE_MS = 700

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(SEED_TODOS)
  const [done, setDone] = useState(SEED_DONE)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [animFlip, setAnimFlip] = useState(false)
  const [todoPanel, setTodoPanel] = useState<TodoPanelState | null>(null)

  const setPanel = useCallback((patch: Partial<TodoPanelState>) => {
    setTodoPanel((s) => (s ? { ...s, ...patch } : s))
  }, [])

  /// Builds what a todo row needs: its data, and what its three buttons do.
  /// Everything about how it *looks* — the tick, the strikethrough, the fade
  /// while completing, the hover-revealed star and pencil — belongs to
  /// TodoRow and Home.css, which is why none of it appears here.
  const mkRow = useCallback(
    (t: Todo, idx: number) => {
      const i = todos.indexOf(t)
      const isSame = (x: Todo) => x.text === t.text && x.group === t.group
      return {
        text: t.text,
        tag: t.tag,
        due: fmtDue(t.due),
        star: !!t.star,
        completing: !!t.completing,
        dotColor: DOT_COLORS[t.tag] || 'var(--check-border)',
        /// Position in its own list, used only to stagger the entrance.
        index: idx || 0,
        starToggle: () =>
          setTodos((s) =>
            s.map((x) => (isSame(x) ? { ...x, star: !x.star } : x)),
          ),
        toggle: () => {
          if (t.completing) return
          setTodos((s) =>
            s.map((x) => (isSame(x) ? { ...x, completing: true } : x)),
          )
          // A timer rather than onTransitionEnd: the row unmounts as part of
          // this, and a transition that never fires (reduced motion, a hidden
          // tab) would strand the todo mid-completion.
          setTimeout(() => {
            setTodos((s) => s.filter((x) => !isSame(x)))
            setDone((s) => [{ text: t.text }, ...s])
          }, COMPLETE_MS)
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
    [todos],
  )

  const todayList = todos.filter((t) => t.group === 'TODAY')
  const weekList = todos.filter((t) => t.group === 'THIS WEEK')
  const somedayList = todos.filter((t) => t.group === 'SOMEDAY')
  const starred = todos.filter((t) => t.star)

  // --- Due-date calendar shown inside the todo panel ---
  const now = new Date()
  const todayISO = isoOf(now.getFullYear(), now.getMonth(), now.getDate())
  const base =
    todoPanel && isISO(todoPanel.due)
      ? { y: +todoPanel.due.slice(0, 4), m: +todoPanel.due.slice(5, 7) - 1 }
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
      selected: !!todoPanel && todoPanel.due === iso,
      isToday: iso === todayISO,
      pick: () => setPanel({ due: iso }),
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
    selected: !!todoPanel && todoPanel.tag === name,
    pick: () => setPanel({ tag: name }),
  }))

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

  /// Enter adds straight from the box. A trailing "#tag" becomes the area.
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

  return {
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
  }
}
