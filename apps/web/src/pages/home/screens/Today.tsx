import type { HomeState } from '../useHomeState'
import TodoRow from '../rows/TodoRow'
import { RoutineLine } from '../rows/RoutineRow'

/// Static until the calendar and money feeds are wired up.
const UP_NEXT = [
  { at: '4:30 PM', what: 'Gym — pull day', sub: 'Routine · streak 12 days' },
  {
    at: '7:00 PM',
    what: 'SIP auto-invest hits account',
    sub: '₹15,000 · Index fund',
  },
  {
    at: 'SUN 9AM',
    what: 'Credit card bill due — HDFC',
    sub: '₹23,410 · autopay on',
  },
]

export default function Today({ vm }: { vm: HomeState }) {
  const {
    starred,
    mkRow,
    todos,
    go,
    routines,
    mkRoutine,
    routinesDone,
    routinesTotal,
    countProg,
    draft,
    onDraftChange,
    onDraftKey,
    openCreateTodo,
    prefs,
  } = vm

  const top3 = starred.slice(0, 3).map((t, i) => mkRow(t, i))
  const showOpenSpot = starred.length < 3
  const allOpen = todos.filter((t) => !t.star).map((t, i) => mkRow(t, i))
  const spent = 42180 * countProg
  const spentPct = (56 * countProg).toFixed(1) + '%'
  const investToday = '₹' + (8.4 * countProg).toFixed(1) + 'L'

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col">
        <div className="hs-title">Today</div>
        <div className="hs-meta" style={{ marginBottom: 26 }}>
          SATURDAY · JULY 5, 2026
        </div>

        <div className="hs-section-label">TOP 3 FOR TODAY</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {top3.map((td) => (
            <TodoRow key={td.text} td={td} />
          ))}
          {showOpenSpot && (
            <div className="hs-row" style={{ animation: 'none' }}>
              <div className="hs-checkbox" />
              <div className="hs-open-spot">(open spot)</div>
            </div>
          )}
        </div>

        <div className="hs-section-row">
          <div
            className="hs-section-label"
            style={{ border: 'none', padding: 0 }}
          >
            UP NEXT
          </div>
          <button
            type="button"
            className="hs-view-all"
            onClick={() => go('todos')}
          >
            VIEW ALL →
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {UP_NEXT.map((u, i) => (
            <div
              key={u.at}
              className="hs-agenda-row"
              style={
                i === UP_NEXT.length - 1 ? { borderBottom: 'none' } : undefined
              }
            >
              <div className="hs-agenda-time">{u.at}</div>
              <div>
                <div className="hs-agenda-what">{u.what}</div>
                <div className="hs-agenda-sub">{u.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="hs-section-row">
          <div
            className="hs-section-label"
            style={{ border: 'none', padding: 0 }}
          >
            ALL OPEN · {todos.length}
          </div>
          <button
            type="button"
            className="hs-view-all"
            onClick={() => go('todos')}
          >
            VIEW ALL →
          </button>
        </div>
        {allOpen.map((td) => (
          <TodoRow key={td.text} td={td} />
        ))}

        <div className="hs-add-row">
          <div className="hs-add-plus">+</div>
          <input
            className="hs-add-input"
            value={draft}
            onChange={onDraftChange}
            onKeyDown={onDraftKey}
            placeholder='Add a todo — "call plumber tue 5pm #home" — press Enter'
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

      <div className="hs-rail">
        <div>
          <div
            className="hs-title-row"
            style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}
          >
            <div
              className="hs-section-label"
              style={{ border: 'none', padding: 0 }}
            >
              ROUTINES · {routinesDone}/{routinesTotal}
            </div>
          </div>
          {routines.map((r) => (
            <RoutineLine key={r.name} rt={mkRoutine(r)} />
          ))}
        </div>

        <div>
          <div className="hs-section-label">MONEY THIS MONTH</div>
          <div className="hs-rail-stat">
            <div className="hs-rail-stat-label">Spent</div>
            <div className="hs-rail-stat-value">
              ₹{Math.round(spent).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="hs-bar-track" style={{ margin: '8px 0 4px' }}>
            <div className="hs-bar-fill" style={{ width: spentPct }} />
          </div>
          <div className="hs-meta-sm">56% OF ₹75,000 BUDGET</div>
          <div className="hs-rail-stat">
            <div className="hs-rail-stat-label">Investments</div>
            <div className="hs-rail-stat-value">
              {investToday} <span className="hs-delta-up">+2.1%</span>
            </div>
          </div>
        </div>

        {prefs.quote && (
          <div>
            <div className="hs-section-label">RESURFACING</div>
            <div className="hs-newsreader hs-quote-body">
              &ldquo;What you do every day matters more than what you do once in
              a while.&rdquo;
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 6 }}>
              — GRETCHEN RUBIN · SAVED MAR 2026
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
