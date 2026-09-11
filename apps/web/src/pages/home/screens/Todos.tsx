import type { HomeState } from '../useHomeState'
import type { Todo } from '../types'
import TodoRow from '../rows/TodoRow'

const FILTERS = ['ALL', 'TODAY', 'THIS WEEK', 'SOMEDAY']

const AREA_ROWS = [
  { name: 'Finance', color: 'var(--accent)', count: 4 },
  { name: 'Home', color: 'var(--warn)', count: 3 },
  { name: 'Health', color: 'var(--positive)', count: 3 },
  { name: 'Projects', color: 'var(--info)', count: 5 },
]

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
    draft,
    onDraftChange,
    onDraftKey,
    openCreateTodo,
    todos,
    todosLoading,
    todosError,
  } = vm

  const doneCount = done.length
  const groups = [
    { label: 'TODAY', items: todayList },
    { label: 'THIS WEEK', items: weekList },
    { label: 'SOMEDAY', items: somedayList },
  ].filter((g) => filter === 'ALL' || filter === g.label)

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Todos</div>
          <div className="hs-meta-sm">
            {todos.length} OPEN · {doneCount} DONE TODAY
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
        </div>

        {todosError && (
          <div role="alert" className="hs-save-error">
            {todosError}
          </div>
        )}

        {todosLoading ? (
          <div className="hs-empty">Loading your todos…</div>
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
        {!todosLoading && !todosError && todos.length === 0 && (
          <div className="hs-empty">
            Nothing yet. Add your first todo below.
          </div>
        )}

        <div className="hs-add-row">
          <div className="hs-add-plus">+</div>
          <input
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
          {AREA_ROWS.map((a) => (
            <div key={a.name} className="hs-rail-row">
              <div>
                <span style={{ color: a.color }}>●</span> {a.name}
              </div>
              <div className="hs-meta-sm">{a.count}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="hs-section-label">DONE TODAY · {doneCount}</div>
          {done.map((dn) => (
            <div key={dn.text} className="hs-done-row">
              <div className="hs-done-check">✓</div>
              <div className="hs-done-text">{dn.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
