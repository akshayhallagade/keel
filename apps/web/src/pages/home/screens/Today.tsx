import type { HomeState } from '../useHomeState'

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
            <div
              key={td.text}
              onMouseEnter={td.onEnter}
              onMouseLeave={td.onLeave}
              className="hs-row"
              style={{
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
                <span
                  className="hs-checkbox-tick"
                  style={{ animation: td.tickAnim }}
                >
                  {td.check}
                </span>
              </button>
              <div className="hs-row-body">
                <div
                  className="hs-row-title"
                  style={{ color: td.textColor, textDecoration: td.deco }}
                >
                  {td.text}
                </div>
                <div className="hs-row-sub">
                  <span style={{ color: td.dotColor }}>●</span> {td.tag} &nbsp;{' '}
                  {td.due}
                </div>
              </div>
              <button
                type="button"
                title="Remove from Top 3"
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
          ))}
          {showOpenSpot && (
            <div className="hs-row" style={{ animation: 'none' }}>
              <div
                className="hs-checkbox"
                style={{ borderColor: 'var(--check-border)' }}
              />
              <div
                style={{
                  flex: 1,
                  fontSize: 14.5,
                  fontStyle: 'italic',
                  color: 'var(--muted)',
                }}
              >
                (open spot)
              </div>
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
          <div
            style={{
              display: 'flex',
              gap: 18,
              padding: '13px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div
              style={{
                font: '400 11px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
                width: 66,
                flex: 'none',
                paddingTop: 2,
              }}
            >
              4:30 PM
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Gym — pull day
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}
              >
                Routine · streak 12 days
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 18,
              padding: '13px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div
              style={{
                font: '400 11px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
                width: 66,
                flex: 'none',
                paddingTop: 2,
              }}
            >
              7:00 PM
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                SIP auto-invest hits account
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}
              >
                ₹15,000 · Index fund
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, padding: '13px 0' }}>
            <div
              style={{
                font: '400 11px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
                width: 66,
                flex: 'none',
                paddingTop: 2,
              }}
            >
              SUN 9AM
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Credit card bill due — HDFC
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}
              >
                ₹23,410 · autopay on
              </div>
            </div>
          </div>
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
          <div
            key={td.text}
            onMouseEnter={td.onEnter}
            onMouseLeave={td.onLeave}
            className="hs-row"
            style={{
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
              <span
                className="hs-checkbox-tick"
                style={{ animation: td.tickAnim }}
              >
                {td.check}
              </span>
            </button>
            <div className="hs-row-body">
              <div
                style={{
                  fontSize: 14,
                  color: td.textColor,
                  textDecoration: td.deco,
                }}
              >
                {td.text}
              </div>
              <div className="hs-row-sub">
                {td.tag} &nbsp; {td.due}
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
          {routines.map((r) => {
            const rt = mkRoutine(r)
            return (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '5px 0',
                }}
              >
                <button
                  type="button"
                  className="hs-checkbox"
                  style={{
                    width: 14,
                    height: 14,
                    borderColor: rt.boxBorder,
                    background: rt.boxBg,
                  }}
                  onClick={rt.toggle}
                >
                  <span
                    className="hs-checkbox-tick"
                    style={{ animation: rt.tickAnim }}
                  >
                    {rt.check}
                  </span>
                </button>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    color: rt.color,
                    textDecoration: rt.deco,
                  }}
                >
                  {rt.name}{' '}
                  <span style={{ font: '400 9px "IBM Plex Mono",monospace' }}>
                    {rt.suffix}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div>
          <div className="hs-section-label">MONEY THIS MONTH</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Spent</div>
            <div style={{ font: '500 14px "IBM Plex Mono",monospace' }}>
              ₹{Math.round(spent).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="hs-bar-track" style={{ margin: '8px 0 4px' }}>
            <div className="hs-bar-fill" style={{ width: spentPct }} />
          </div>
          <div className="hs-meta-sm">56% OF ₹75,000 BUDGET</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Investments
            </div>
            <div style={{ font: '500 14px "IBM Plex Mono",monospace' }}>
              {investToday}{' '}
              <span style={{ color: 'var(--positive)', fontSize: 11 }}>
                +2.1%
              </span>
            </div>
          </div>
        </div>
        {prefs.quote && (
          <div>
            <div className="hs-section-label">RESURFACING</div>
            <div
              className="hs-newsreader"
              style={{
                fontSize: 15.5,
                lineHeight: 1.5,
                marginTop: 12,
                color: '#3D382F',
              }}
            >
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
