import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Todo } from '@keel/types'

import { useTodos } from './useTodos'
import { dayToInstant, todayDay } from './helpers'

const api = vi.hoisted(() => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  restoreTodo: vi.fn(),
}))
vi.mock('../../../api/todos', () => api)

let nextId = 0
const todo = (over: Partial<Todo> = {}): Todo => ({
  id: `t${++nextId}`,
  text: 'Call the plumber',
  area: 'HOME',
  dueAt: null,
  starred: false,
  completedAt: null,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  ...over,
})

/// Render the hook with a fixed starting list and wait for the initial load.
const load = async (list: Todo[]) => {
  api.listTodos.mockResolvedValue(list)
  const hook = renderHook(() => useTodos('MON'))
  await waitFor(() => expect(hook.result.current.todosLoading).toBe(false))
  return hook
}

beforeEach(() => {
  nextId = 0
  Object.values(api).forEach((fn) => fn.mockReset())
  api.listTodos.mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTodos: the BY AREA counts', () => {
  // This panel used to be four hardcoded rows — Finance 4, Home 3, Health 3,
  // Projects 5 — that never moved whatever you did.
  it('counts the real open todos, busiest area first', async () => {
    const { result } = await load([
      todo({ area: 'HOME' }),
      todo({ area: 'HOME' }),
      todo({ area: 'FINANCE' }),
      todo({ area: 'HOME' }),
    ])

    expect(result.current.areaCounts).toEqual([
      { name: 'HOME', count: 3, color: 'var(--warn)' },
      { name: 'FINANCE', count: 1, color: 'var(--accent)' },
    ])
  })

  it('leaves completed todos out of the counts', async () => {
    const { result } = await load([
      todo({ area: 'HOME' }),
      todo({ area: 'HOME', completedAt: '2026-03-02T10:00:00.000Z' }),
    ])

    expect(result.current.areaCounts[0].count).toBe(1)
  })

  it('gives an area nobody listed its own colour, not the INBOX grey', async () => {
    const { result } = await load([todo({ area: 'GARDEN' })])

    const garden = result.current.areaCounts[0].color
    expect(garden).not.toBe('var(--check-border)')
    // Same name, same colour, every time — it is hashed, not assigned.
    expect(garden).toBe(result.current.areaCounts[0].color)
  })
})

describe('useTodos: DONE TODAY', () => {
  it('counts only what was finished today', async () => {
    const { result } = await load([
      todo({ completedAt: new Date().toISOString() }),
      todo({ completedAt: '2026-01-05T10:00:00.000Z' }), // long ago
      todo(),
    ])

    // `done` is the full history, for the Done tab.
    expect(result.current.done).toHaveLength(2)
    // `doneToday` is what the rail claims to show.
    expect(result.current.doneToday).toHaveLength(1)
  })

  it('puts the most recently finished first', async () => {
    const { result } = await load([
      todo({ text: 'older', completedAt: '2026-03-01T09:00:00.000Z' }),
      todo({ text: 'newer', completedAt: '2026-03-02T09:00:00.000Z' }),
    ])

    expect(result.current.done.map((t) => t.text)).toEqual(['newer', 'older'])
  })
})

describe('useTodos: search', () => {
  it('narrows the lists by text and by area', async () => {
    const { result } = await load([
      todo({ text: 'Call the plumber', area: 'HOME', dueAt: null }),
      todo({ text: 'File taxes', area: 'FINANCE', dueAt: null }),
    ])

    act(() => result.current.setQuery('plumber'))
    expect(result.current.somedayList.map((t) => t.text)).toEqual([
      'Call the plumber',
    ])

    act(() => result.current.setQuery('finance'))
    expect(result.current.somedayList.map((t) => t.text)).toEqual([
      'File taxes',
    ])
  })

  /**
   * The hook is shared with the Today screen. Filtering everything here would
   * mean typing in the Todos search box quietly emptied Today's Top 3, which is
   * a different screen the user is not even looking at.
   */
  it('does not touch the Top 3 the Today screen reads', async () => {
    const { result } = await load([
      todo({ text: 'Call the plumber', starred: true }),
      todo({ text: 'File taxes', starred: true }),
    ])

    act(() => result.current.setQuery('plumber'))

    expect(result.current.starred).toHaveLength(2)
    expect(result.current.todos).toHaveLength(2)
  })
})

describe('useTodos: undo a delete', () => {
  it('offers the todo back once the server confirms', async () => {
    const row = todo({ text: 'Deleted by mistake' })
    const { result } = await load([row])
    api.deleteTodo.mockResolvedValue(null)

    await act(async () => result.current.removeTodo(row))

    expect(result.current.todos).toHaveLength(0)
    expect(result.current.undoable?.text).toBe('Deleted by mistake')
  })

  it('brings it back with the row the server hands over', async () => {
    const row = todo()
    const { result } = await load([row])
    api.deleteTodo.mockResolvedValue(null)
    api.restoreTodo.mockResolvedValue({ ...row, text: 'Restored' })

    await act(async () => result.current.removeTodo(row))
    await act(async () => result.current.undoDelete())

    expect(api.restoreTodo).toHaveBeenCalledWith(row.id)
    expect(result.current.todos.map((t) => t.text)).toEqual(['Restored'])
    expect(result.current.undoable).toBeNull()
  })

  // A failed delete means the todo is still on the server. Offering undo would
  // be offering to restore something that was never gone.
  it('offers no undo when the delete failed', async () => {
    const row = todo()
    const { result } = await load([row])
    api.deleteTodo.mockRejectedValue(new Error('offline'))

    await act(async () => result.current.removeTodo(row))

    expect(result.current.undoable).toBeNull()
    expect(result.current.todos).toHaveLength(1) // put back on screen
    expect(result.current.todosError).toBeTruthy()
  })

  it('stops offering undo after a while', async () => {
    vi.useFakeTimers()
    const row = todo()
    api.listTodos.mockResolvedValue([row])
    api.deleteTodo.mockResolvedValue(null)

    const { result } = renderHook(() => useTodos('MON'))
    await act(async () => {})

    await act(async () => result.current.removeTodo(row))
    expect(result.current.undoable).not.toBeNull()

    act(() => vi.advanceTimersByTime(9000))
    expect(result.current.undoable).toBeNull()
  })
})

describe('useTodos: quick add', () => {
  const enter = (result: { current: ReturnType<typeof useTodos> }) =>
    result.current.onDraftKey({
      key: 'Enter',
    } as React.KeyboardEvent<HTMLInputElement>)

  it('reads the date, time and area out of what was typed', async () => {
    const { result } = await load([])
    api.createTodo.mockResolvedValue(todo())

    act(() =>
      result.current.onDraftChange({
        target: { value: 'call plumber tomorrow 5pm #home' },
      } as React.ChangeEvent<HTMLInputElement>),
    )
    await act(async () => enter(result))

    const sent = api.createTodo.mock.calls[0][0]
    expect(sent.text).toBe('call plumber')
    expect(sent.area).toBe('HOME')

    const due = new Date(sent.dueAt)
    expect(due.getHours()).toBe(17)
  })

  // The box is for today's work. Something with no date would land in Someday,
  // which is not what anyone typing into a todo list means.
  it('falls back to today when the text names no date', async () => {
    const { result } = await load([])
    api.createTodo.mockResolvedValue(todo())

    act(() =>
      result.current.onDraftChange({
        target: { value: 'buy milk' },
      } as React.ChangeEvent<HTMLInputElement>),
    )
    await act(async () => enter(result))

    expect(api.createTodo.mock.calls[0][0].dueAt).toBe(dayToInstant(todayDay()))
  })

  it('adds nothing when the text is only a date', async () => {
    const { result } = await load([])

    act(() =>
      result.current.onDraftChange({
        target: { value: 'tomorrow' },
      } as React.ChangeEvent<HTMLInputElement>),
    )
    await act(async () => enter(result))

    expect(api.createTodo).not.toHaveBeenCalled()
  })
})
