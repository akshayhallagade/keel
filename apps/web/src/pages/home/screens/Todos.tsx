import type { HomeState } from '../useHomeState'

const FILTERS = ['ALL', 'TODAY', 'THIS WEEK', 'SOMEDAY']

const AREA_ROWS = [
  { name: 'Finance', color: 'var(--accent)', count: 4 },
  { name: 'Home', color: '#C0913C', count: 3 },
  { name: 'Health', color: '#5B7B4F', count: 3 },
  { name: 'Projects', color: '#5A6E8C', count: 5 },
]

function TodoRow({
  td,
  showDot,
}: {
  td: ReturnType<HomeState['mkRow']>
  showDot: boolean
}) {
  return (
    <div
      onMouseEnter={td.onEnter}
      onMouseLeave={td.onLeave}
      className="hs-row"
      style={{
        borderTop: '1px solid var(--line-soft)',
        borderBottom: 'none',
        opacity: td.opacity,
        transform: td.shift,
        animationDelay: td.delay,
      }}
    >
      <button
        type="button"
        className="hs-checkbox"
        onClick={td.toggle}
        style={{ borderColor: td.boxBorder, background: td.boxBg }}
      >
        <span className="hs-checkbox-tick" style={{ animation: td.tickAnim }}>
          {td.check}
        </span>
      </button>
      <div className="hs-row-body">
        <div
          className="hs-row-title"
          style={{
            fontWeight: showDot ? 500 : 400,
            color: td.textColor,
            textDecoration: td.deco,
          }}
        >
          {td.text}
        </div>
        <div className="hs-row-sub">
          {showDot && <span style={{ color: td.dotColor }}>●</span>} {td.tag}{' '}
          &nbsp; {td.due}
        </div>
      </div>
      <button
        type="button"
        title="Add to Top 3"
        className="hs-star-btn"
        onClick={td.starToggle}
        style={{ color: td.starColor, opacity: td.starOpacity }}
      >
        {td.starGlyph}
      </button>
      <button
        type="button"
        title="Edit"
        className="hs-row-action"
        onClick={td.edit}
        style={{ opacity: td.editOpacity }}
      >
        ✎
      </button>
    </div>
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
  } = vm

  const fToday = filter === 'ALL' || filter === 'TODAY'
  const fWeek = filter === 'ALL' || filter === 'THIS WEEK'
  const fSomeday = filter === 'ALL' || filter === 'SOMEDAY'
  const doneCount = 2 + done.length

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Todos</div>
          <div className="hs-meta-sm">
            {todos.length} OPEN · {doneCount} DONE TODAY
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 22,
            margin: '18px 0 22px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: 10,
          }}
        >
          {FILTERS.map((name) => {
            const active = filter === name
            return (
              <button
                type="button"
                key={name}
                onClick={() => setFilter(name)}
                style={{
                  font: '500 10px "IBM Plex Mono",monospace',
                  letterSpacing: '.1em',
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  paddingBottom: 10,
                  marginBottom: -11,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: active ? 'var(--accent)' : 'transparent',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>

        {fToday && (
          <>
            <div className="hs-section-label" style={{ border: 'none' }}>
              TODAY · {todayList.length}
            </div>
            {todayList.map((t, i) => (
              <TodoRow key={t.text} td={mkRow(t, i)} showDot />
            ))}
          </>
        )}
        {fWeek && (
          <>
            <div
              className="hs-section-label"
              style={{ border: 'none', paddingTop: 22 }}
            >
              THIS WEEK · {weekList.length}
            </div>
            {weekList.map((t, i) => (
              <TodoRow key={t.text} td={mkRow(t, i)} showDot />
            ))}
          </>
        )}
        {fSomeday && (
          <>
            <div
              className="hs-section-label"
              style={{ border: 'none', paddingTop: 22 }}
            >
              SOMEDAY · {somedayList.length}
            </div>
            {somedayList.map((t, i) => (
              <TodoRow key={t.text} td={mkRow(t, i)} showDot />
            ))}
          </>
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
            <div
              key={a.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: a.color }}>●</span> {a.name}
              </div>
              <div className="hs-meta-sm">{a.count}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="hs-section-label">DONE TODAY · {doneCount}</div>
          {done.map((dn) => (
            <div
              key={dn.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: 'var(--ink)',
                  borderRadius: 3,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--paper)',
                  fontSize: 9,
                }}
              >
                ✓
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  textDecoration: 'line-through',
                }}
              >
                {dn.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
