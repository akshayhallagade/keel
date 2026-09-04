import { ROUTINE_TYPES } from '../seedData'
import type { HomeState } from '../useHomeState'
import type { RoutinePeriod } from '../types'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Routines({ vm }: { vm: HomeState }) {
  const {
    routines,
    mkRoutine,
    routinesDone,
    routinesTotal,
    routinesView,
    setRoutinesView,
    routineDrafts,
    setRDraft,
    addRoutine,
    setRPanelState,
    accent,
  } = vm

  const routinePct =
    Math.round((routinesDone / Math.max(1, routinesTotal)) * 100) + '%'
  const consistencyPct =
    Math.round(
      (routines.reduce((a, r) => a + (r.week || []).filter(Boolean).length, 0) /
        Math.max(1, routines.length * 7)) *
        100,
    ) + '%'
  const bestStreak = routines.reduce((m, r) => Math.max(m, r.streak || 0), 0)

  const openNewRoutine = () =>
    setRPanelState({
      orig: null,
      name: '',
      time: '',
      period: 'MORNING',
      timeSet: false,
      hour: 7,
      minIdx: 0,
      ampm: 'AM',
    })

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Routines</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--line)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setRoutinesView('grouped')}
                style={{
                  font: '500 9px "IBM Plex Mono",monospace',
                  letterSpacing: '.08em',
                  padding: '7px 12px',
                  cursor: 'pointer',
                  border: 'none',
                  color:
                    routinesView !== 'flat' ? 'var(--paper)' : 'var(--text-2)',
                  background:
                    routinesView !== 'flat' ? accent : 'var(--input-bg)',
                }}
              >
                GROUPED
              </button>
              <button
                type="button"
                onClick={() => setRoutinesView('flat')}
                style={{
                  font: '500 9px "IBM Plex Mono",monospace',
                  letterSpacing: '.08em',
                  padding: '7px 12px',
                  cursor: 'pointer',
                  border: 'none',
                  color:
                    routinesView === 'flat' ? 'var(--paper)' : 'var(--text-2)',
                  background:
                    routinesView === 'flat' ? accent : 'var(--input-bg)',
                }}
              >
                FLAT
              </button>
            </div>
            <div className="hs-meta-sm">
              {routinesDone}/{routinesTotal} DONE TODAY
            </div>
            <button
              type="button"
              className="hs-btn-small-accent"
              onClick={openNewRoutine}
            >
              + NEW ROUTINE
            </button>
          </div>
        </div>
        <div className="hs-meta">SATURDAY · JULY 5, 2026</div>

        {routinesView !== 'flat' ? (
          (ROUTINE_TYPES as readonly RoutinePeriod[]).map((type) => {
            const list = routines.filter((r) => r.period === type)
            return (
              <div key={type}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '28px 0 2px',
                    borderBottom: '1px solid var(--line)',
                    paddingBottom: 8,
                  }}
                >
                  <div
                    className="hs-section-label"
                    style={{ border: 'none', padding: 0 }}
                  >
                    {type}
                  </div>
                  <div
                    style={{
                      font: '500 9px "IBM Plex Mono",monospace',
                      letterSpacing: '.1em',
                      color: 'var(--muted-2)',
                    }}
                  >
                    LAST 7 DAYS · STREAK
                  </div>
                </div>
                {list.map((r) => {
                  const rt = mkRoutine(r)
                  return (
                    <div
                      key={r.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '15px 0',
                        borderBottom: '1px solid var(--line-soft)',
                      }}
                    >
                      <button
                        type="button"
                        className="hs-checkbox lg"
                        onClick={rt.toggle}
                        style={{
                          borderColor: rt.boxBorder,
                          background: rt.boxBg,
                        }}
                      >
                        <span
                          className="hs-checkbox-tick"
                          style={{ animation: rt.tickAnim }}
                        >
                          {rt.check}
                        </span>
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: rt.color,
                            textDecoration: rt.deco,
                          }}
                        >
                          {r.name}
                        </div>
                        <div className="hs-row-sub">
                          {rt.time} {rt.suffix}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 5, flex: 'none' }}>
                        {rt.weekDots.map((wd, wi) => (
                          <div
                            key={wi}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: wd.bg,
                            }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          width: 44,
                          justifyContent: 'flex-end',
                          flex: 'none',
                        }}
                      >
                        <span style={{ color: rt.streakColor, fontSize: 10 }}>
                          ▲
                        </span>
                        <span
                          style={{
                            font: '500 14px "IBM Plex Mono",monospace',
                            color: rt.streakColor,
                          }}
                        >
                          {rt.streakLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        title="Edit"
                        className="hs-row-action"
                        onClick={rt.edit}
                        style={{ opacity: rt.delOpacity }}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        title="Remove"
                        className="hs-row-action"
                        onClick={rt.del}
                        style={{ opacity: rt.delOpacity }}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--line-soft)',
                  }}
                >
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      border: '1.5px dashed var(--muted-2)',
                      borderRadius: 4,
                      flex: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: accent,
                      fontSize: 12,
                    }}
                  >
                    +
                  </div>
                  <input
                    className="hs-add-input"
                    value={routineDrafts[type] || ''}
                    onChange={(e) => setRDraft(type, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        addRoutine(type, routineDrafts[type])
                    }}
                    placeholder={`Add a ${type.toLowerCase()} routine — press Enter`}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ marginTop: 24 }}>
            {routines.map((r) => {
              const rt = mkRoutine(r)
              return (
                <div
                  key={r.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '15px 0',
                    borderBottom: '1px solid var(--line-soft)',
                  }}
                >
                  <button
                    type="button"
                    className="hs-checkbox lg"
                    onClick={rt.toggle}
                    style={{ borderColor: rt.boxBorder, background: rt.boxBg }}
                  >
                    <span
                      className="hs-checkbox-tick"
                      style={{ animation: rt.tickAnim }}
                    >
                      {rt.check}
                    </span>
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: rt.color,
                        textDecoration: rt.deco,
                      }}
                    >
                      {r.name}
                    </div>
                    <div className="hs-row-sub">
                      {r.period} · {rt.time} {rt.suffix}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flex: 'none' }}>
                    {rt.weekDots.map((wd, wi) => (
                      <div
                        key={wi}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: wd.bg,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      width: 44,
                      justifyContent: 'flex-end',
                      flex: 'none',
                    }}
                  >
                    <span style={{ color: rt.streakColor, fontSize: 10 }}>
                      ▲
                    </span>
                    <span
                      style={{
                        font: '500 14px "IBM Plex Mono",monospace',
                        color: rt.streakColor,
                      }}
                    >
                      {rt.streakLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    title="Edit"
                    className="hs-row-action"
                    onClick={rt.edit}
                    style={{ opacity: rt.delOpacity }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    className="hs-row-action"
                    onClick={rt.del}
                    style={{ opacity: rt.delOpacity }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">TODAY</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginTop: 14,
            }}
          >
            <div style={{ font: '500 32px "IBM Plex Mono",monospace' }}>
              {routinesDone}
              <span style={{ color: 'var(--muted)', fontSize: 19 }}>
                /{routinesTotal}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>complete</div>
          </div>
          <div className="hs-bar-track" style={{ marginTop: 12 }}>
            <div className="hs-bar-fill" style={{ width: routinePct }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div className="hs-stat-tile">
            <div className="hs-stat-label">CONSISTENCY</div>
            <div className="hs-stat-value">{consistencyPct}</div>
            <div
              style={{
                font: '400 9px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
              }}
            >
              THIS WEEK
            </div>
          </div>
          <div className="hs-stat-tile">
            <div className="hs-stat-label">BEST STREAK</div>
            <div className="hs-stat-value" style={{ color: 'var(--positive)' }}>
              {bestStreak}
            </div>
            <div
              style={{
                font: '400 9px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
              }}
            >
              DAYS
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--line)',
              paddingBottom: 8,
            }}
          >
            <div
              className="hs-section-label"
              style={{ border: 'none', padding: 0 }}
            >
              THIS WEEK
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {DOW.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    textAlign: 'center',
                    font: '500 8px "IBM Plex Mono",monospace',
                    color: 'var(--muted-2)',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
          {routines.map((r) => (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 0',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 11.5,
                  color: 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {r.name}
              </div>
              <div style={{ display: 'flex', gap: 3, flex: 'none' }}>
                {(r.week || []).map((v, wi) => (
                  <div
                    key={wi}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: v ? accent : 'var(--track)',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
