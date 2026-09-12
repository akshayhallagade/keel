import { useEffect, useRef } from 'react'
import type { HomeState } from '../useHomeState'
import type { Todo } from '../types'
import TodoRow from '../rows/TodoRow'
import { sectionsFor } from '../state/helpers'

const FILTERS = ['ALL', 'TODAY', 'THIS WEEK', 'SOMEDAY', 'DONE']

function Group({
  label,
  items,
  mkRow,
  first,
}: {
  label: string
  items: Todo[]
  mkRow: HomeState['mkRow']
  first: boolean
}) {
  return (
    <>
      <div
        className="hs-section-label"
        style={{ border: 'none', paddingTop: first ? undefined : 22 }}
      >
        {label} · {items.length}
      </div>
      {/* Keyed by id, not text. Two todos with the same words are two todos. */}
      {items.map((t, i) => (
        <TodoRow key={t.id} td={mkRow(t, i)} topRuled />
      ))}
    </>
  )
}

export default function Todos({ vm }: { vm: HomeState }) {
  const {
    todayList,
    weekList,
    somedayList,
    mkRow,
    filter,
    setFilter,
    done,
    doneToday,
    areaCounts,
    query,
    setQuery,
    undoable,
    undoDelete,
    draft,
    onDraftChange,
    onDraftKey,
    openCreateTodo,
    todos,
    todosLoading,
    todosError,
  } = vm

  const addBox = useRef<HTMLInputElement>(null)

  /// "/" jumps to the add box, the way it does in most things you type into
  /// all day. Ignored while you are already in a field, or it would type "/".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey) return
      const el = e.target as HTMLElement | null
      if (el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA') return
      e.preventDefault()
      addBox.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const showDone = filter === 'DONE'
  const shownSections = sectionsFor(filter)
  const groups = [
    { label: 'TODAY', items: todayList },
    { label: 'THIS WEEK', items: weekList },
    { label: 'SOMEDAY', items: somedayList },
  ].filter((g) => shownSections.includes(g.label))

  /// Counted from what is actually rendered, so a search that matches nothing
  /// says so instead of leaving three empty headings.
  const shown = showDone
    ? done.length
    : groups.reduce((n, g) => n + g.items.length, 0)
  const nothingFound = !todosLoading && !todosError && shown === 0

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Todos</div>
          <div className="hs-meta-sm">
            {todos.length} OPEN · {doneToday.length} DONE TODAY
          </div>
        </div>

        <div className="hs-tabs">
          {FILTERS.map((name) => (
            <button
              type="button"
              key={name}
              onClick={() => setFilter(name)}
              aria-pressed={filter === name}
              className={`hs-tab${filter === name ? ' is-active' : ''}`}
            >
              {name}
            </button>
          ))}
          <input
            className="hs-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search todos"
          />
        </div>

        {todosError && (
          <div role="alert" className="hs-save-error">
            {todosError}
          </div>
        )}

        {todosLoading ? (
          <div className="hs-empty">Loading your todos…</div>
        ) : showDone ? (
          <Group label="DONE" items={done} mkRow={mkRow} first />
        ) : (
          groups.map((g, i) => (
            <Group
              key={g.label}
              label={g.label}
              items={g.items}
              mkRow={mkRow}
              first={i === 0}
            />
          ))
        )}

        {/* A brand-new account has nothing at all. Without this the screen is
            three empty headings and a box, which reads as broken. */}
        {nothingFound && (
          <div className="hs-empty">
            {query
              ? `Nothing matches “${query}”.`
              : showDone
                ? 'Nothing finished yet.'
                : 'Nothing yet. Add your first todo below.'}
          </div>
        )}

        <div className="hs-add-row">
          <div className="hs-add-plus">+</div>
          <input
            ref={addBox}
            className="hs-add-input"
            value={draft}
            onChange={onDraftChange}
            onKeyDown={onDraftKey}
            placeholder='Type to add — "call plumber tue 5pm #home" — press Enter'
          />
          <button
            type="button"
            className="hs-add-details"
            onClick={openCreateTodo}
          >
            + DETAILS
          </button>
        </div>
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">BY AREA</div>
          {/* Counted from the real todos. This panel used to be four invented
              rows whose numbers never moved. */}
          {areaCounts.length === 0 && <div className="hs-empty-sm">—</div>}
          {areaCounts.map((a) => (
            <div key={a.name} className="hs-rail-row">
              <div>
                <span style={{ color: a.color }}>●</span> {a.name}
              </div>
              <div className="hs-meta-sm">{a.count}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="hs-section-label">
            DONE TODAY · {doneToday.length}
          </div>
          {doneToday.length === 0 && <div className="hs-empty-sm">—</div>}
          {doneToday.map((dn) => (
            <div key={dn.id} className="hs-done-row">
              <div className="hs-done-check">✓</div>
              <div className="hs-done-text">{dn.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Deleting is soft on the server, so undo costs nothing but a click. */}
      {undoable && (
        <div className="hs-undo" role="status">
          <span className="hs-undo-text">Deleted “{undoable.text}”</span>
          <button type="button" className="hs-undo-btn" onClick={undoDelete}>
            UNDO
          </button>
        </div>
      )}
    </div>
  )
}
