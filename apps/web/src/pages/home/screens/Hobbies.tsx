import type { HomeState } from '../useHomeState'

/// Static until sessions are stored server-side.
const SPLIT = [
  { name: 'Photography', color: 'var(--accent)', pct: 40 },
  { name: 'Guitar', color: 'var(--warn)', pct: 28 },
  { name: 'Cooking', color: 'var(--positive)', pct: 22 },
  { name: 'Sketching', color: 'var(--check-border)', pct: 10 },
]

export default function Hobbies({ vm }: { vm: HomeState }) {
  const {
    hobbies,
    setHobbies,
    hobbyTry,
    setHobbyTry,
    hobbyDraft,
    setHobbyDraft,
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

  const logSession = (i: number) =>
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

  const startTry = (i: number, name: string) => {
    setHobbyTry((s) => s.filter((_, xi) => xi !== i))
    setHobbies((s) => [...s, { name, meta: 'STARTED TODAY', sessions: 0 }])
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
        {hobbies.map((h, i) => (
          <div key={h.name} className="hs-hobby-row">
            <div className="hs-hobby-body">
              <div className="hs-hobby-name">{h.name}</div>
              <div className="hs-row-sub">
                {h.meta}
                {h.quiet && (
                  <span style={{ color: 'var(--accent)' }}> GOING QUIET</span>
                )}
              </div>
            </div>
            <div className="hs-hobby-count">
              {h.sessions} <span className="hs-hobby-count-unit">SESSIONS</span>
            </div>
            <button
              type="button"
              title="Log a session"
              className="hs-hobby-cta"
              onClick={() => logSession(i)}
            >
              LOG →
            </button>
            <button
              type="button"
              title="Remove"
              className="hs-row-action"
              onClick={() => setHobbies((s) => s.filter((_, xi) => xi !== i))}
            >
              ✕
            </button>
          </div>
        ))}

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          WANT TO TRY
        </div>
        {hobbyTry.map((h, i) => (
          <div key={h.name} className="hs-hobby-row is-try">
            <div className="hs-hobby-try-name">{h.name}</div>
            <button
              type="button"
              title="Move to active"
              className="hs-hobby-cta"
              onClick={() => startTry(i, h.name)}
            >
              START →
            </button>
            <button
              type="button"
              title="Remove"
              className="hs-row-action"
              onClick={() => setHobbyTry((s) => s.filter((_, xi) => xi !== i))}
            >
              ✕
            </button>
          </div>
        ))}

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
          <div className="hs-big-stat">
            <div className="hs-big-stat-value">
              6<span className="hs-big-stat-total">h 40m</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>logged</div>
          </div>
          <div className="hs-delta-row">▲ 1H 20M VS JUNE</div>
        </div>

        <div>
          <div className="hs-section-label">SPLIT</div>
          <div className="hs-split-bar">
            {SPLIT.map((s) => (
              <div
                key={s.name}
                style={{ width: s.pct + '%', background: s.color }}
              />
            ))}
          </div>
          <div className="hs-split-legend">
            {SPLIT.map((s) => (
              <div key={s.name} className="hs-split-legend-row">
                <div>
                  <span style={{ color: s.color }}>●</span> {s.name}
                </div>
                <div className="hs-split-pct">{s.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
