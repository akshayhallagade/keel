import type { HomeState } from '../useHomeState'

export default function Hobbies({ vm }: { vm: HomeState }) {
  const {
    hobbies,
    setHobbies,
    hobbyTry,
    setHobbyTry,
    hobbyDraft,
    setHobbyDraft,
    hoverHobby,
    setHoverHobby,
    setHPanelState,
  } = vm

  const hobbyStats = `${hobbies.length} ACTIVE · ${hobbies.reduce((a, h) => a + h.sessions, 0)} SESSIONS THIS YEAR`

  const onHobbyKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hobbyDraft.trim()) {
      setHobbyTry((s) => [...s, { name: hobbyDraft.trim() }])
      setHobbyDraft('')
    }
  }

  const openNewHobby = () => {
    setHPanelState({ name: hobbyDraft.trim(), status: 'ACTIVE', note: '' })
    setHobbyDraft('')
  }

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Hobbies</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="hs-meta-sm">{hobbyStats}</div>
            <button
              type="button"
              className="hs-btn-small-accent"
              onClick={openNewHobby}
            >
              + NEW HOBBY
            </button>
          </div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 24 }}>
          TIME FOR THINGS THAT AREN&rsquo;T WORK
        </div>

        <div className="hs-section-label">ACTIVE</div>
        {hobbies.map((h, i) => {
          const key = 'a' + i
          const delOpacity = hoverHobby === key ? 1 : 0
          return (
            <div
              key={h.name}
              onMouseEnter={() => setHoverHobby(key)}
              onMouseLeave={() => setHoverHobby(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '15px 0',
                borderBottom: '1px solid var(--line-soft)',
                animation: 'rowIn .35s ease backwards',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{h.name}</div>
                <div className="hs-row-sub">
                  {h.meta}
                  <span style={{ color: 'var(--accent)' }}>
                    {h.quiet ? ' GOING QUIET' : ''}
                  </span>
                </div>
              </div>
              <div
                style={{
                  font: '500 13px "IBM Plex Mono",monospace',
                  color: 'var(--text-2)',
                  flex: 'none',
                }}
              >
                {h.sessions}{' '}
                <span style={{ fontSize: 9, color: 'var(--muted)' }}>
                  SESSIONS
                </span>
              </div>
              <button
                type="button"
                title="Log a session"
                style={{
                  font: '400 10px "IBM Plex Mono",monospace',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  flex: 'none',
                  background: 'none',
                  border: 'none',
                }}
                onClick={() =>
                  setHobbies((s) =>
                    s.map((x, xi) =>
                      xi === i
                        ? {
                            ...x,
                            sessions: x.sessions + 1,
                            meta: 'LAST SESSION TODAY',
                            quiet: false,
                          }
                        : x,
                    ),
                  )
                }
              >
                LOG →
              </button>
              <button
                type="button"
                title="Remove"
                className="hs-row-action"
                style={{ flex: 'none', opacity: delOpacity }}
                onClick={() => setHobbies((s) => s.filter((_, xi) => xi !== i))}
              >
                ✕
              </button>
            </div>
          )
        })}

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          WANT TO TRY
        </div>
        {hobbyTry.map((h, i) => {
          const key = 't' + i
          const delOpacity = hoverHobby === key ? 1 : 0
          return (
            <div
              key={h.name}
              onMouseEnter={() => setHoverHobby(key)}
              onMouseLeave={() => setHoverHobby(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 0',
                borderBottom: '1px solid var(--line-soft)',
                animation: 'rowIn .35s ease backwards',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  color: 'var(--text-2)',
                }}
              >
                {h.name}
              </div>
              <button
                type="button"
                title="Move to active"
                style={{
                  font: '400 10px "IBM Plex Mono",monospace',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  flex: 'none',
                  background: 'none',
                  border: 'none',
                }}
                onClick={() => {
                  setHobbyTry((s) => s.filter((_, xi) => xi !== i))
                  setHobbies((s) => [
                    ...s,
                    { name: h.name, meta: 'STARTED TODAY', sessions: 0 },
                  ])
                }}
              >
                START →
              </button>
              <button
                type="button"
                title="Remove"
                className="hs-row-action"
                style={{ flex: 'none', opacity: delOpacity }}
                onClick={() =>
                  setHobbyTry((s) => s.filter((_, xi) => xi !== i))
                }
              >
                ✕
              </button>
            </div>
          )
        })}
        <div className="hs-add-row">
          <div className="hs-add-plus">+</div>
          <input
            className="hs-add-input"
            value={hobbyDraft}
            onChange={(e) => setHobbyDraft(e.target.value)}
            onKeyDown={onHobbyKey}
            placeholder="Add a hobby to try — press Enter"
          />
          <button
            type="button"
            className="hs-add-details"
            onClick={openNewHobby}
          >
            + DETAILS
          </button>
        </div>
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">THIS MONTH</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginTop: 14,
            }}
          >
            <div style={{ font: '500 32px "IBM Plex Mono",monospace' }}>
              6
              <span style={{ color: 'var(--muted)', fontSize: 19 }}>h 40m</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>logged</div>
          </div>
          <div
            style={{
              font: '400 10px "IBM Plex Mono",monospace',
              color: 'var(--positive)',
              marginTop: 8,
            }}
          >
            ▲ 1H 20M VS JUNE
          </div>
        </div>
        <div>
          <div className="hs-section-label">SPLIT</div>
          <div
            style={{
              display: 'flex',
              height: 10,
              borderRadius: 3,
              overflow: 'hidden',
              marginTop: 14,
              transformOrigin: 'left',
              animation: 'barGrow .8s cubic-bezier(.22,1,.36,1) .2s backwards',
            }}
          >
            <div style={{ width: '40%', background: 'var(--accent)' }} />
            <div style={{ width: '28%', background: '#C0913C' }} />
            <div style={{ width: '22%', background: 'var(--positive)' }} />
            <div style={{ width: '10%', background: 'var(--check-border)' }} />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginTop: 12,
            }}
          >
            {[
              { name: 'Photography', color: 'var(--accent)', pct: 40 },
              { name: 'Guitar', color: '#C0913C', pct: 28 },
              { name: 'Cooking', color: 'var(--positive)', pct: 22 },
              { name: 'Sketching', color: 'var(--check-border)', pct: 10 },
            ].map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--text-2)',
                }}
              >
                <div>
                  <span style={{ color: s.color }}>●</span> {s.name}
                </div>
                <div
                  style={{
                    fontFamily: '"IBM Plex Mono",monospace',
                    fontSize: 11,
                  }}
                >
                  {s.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
