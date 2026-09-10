import { ROUTINE_TYPES } from '../seedData'
import type { HomeState } from '../useHomeState'
import type { RoutinePeriod } from '../types'
import { RoutineRow } from '../rows/RoutineRow'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function StatTile({
  label,
  value,
  unit,
  positive,
}: {
  label: string
  value: string | number
  unit: string
  positive?: boolean
}) {
  return (
    <div className="hs-stat-tile">
      <div className="hs-stat-label">{label}</div>
      <div
        className="hs-stat-value"
        style={positive ? { color: 'var(--positive)' } : undefined}
      >
        {value}
      </div>
      <div className="hs-stat-unit">{unit}</div>
    </div>
  )
}

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
            <div className="hs-segmented">
              {(['grouped', 'flat'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRoutinesView(v)}
                  aria-pressed={routinesView === v}
                  className={`hs-segment${
                    routinesView === v ? ' is-active' : ''
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
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
          (ROUTINE_TYPES as readonly RoutinePeriod[]).map((type) => (
            <div key={type}>
              <div className="hs-group-head">
                <div className="hs-section-label is-bare">{type}</div>
                <div className="hs-group-head-note">LAST 7 DAYS · STREAK</div>
              </div>

              {routines
                .filter((r) => r.period === type)
                .map((r) => (
                  <RoutineRow key={r.name} rt={mkRoutine(r)} sub="time" />
                ))}

              <div className="hs-add-row-dashed">
                <div className="hs-add-dash-box">+</div>
                <input
                  className="hs-add-input"
                  value={routineDrafts[type] || ''}
                  onChange={(e) => setRDraft(type, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addRoutine(type, routineDrafts[type])
                  }}
                  placeholder={`Add a ${type.toLowerCase()} routine — press Enter`}
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ marginTop: 24 }}>
            {routines.map((r) => (
              <RoutineRow
                key={r.name}
                rt={mkRoutine(r)}
                sub="period-and-time"
              />
            ))}
          </div>
        )}
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">TODAY</div>
          <div className="hs-big-stat">
            <div className="hs-big-stat-value">
              {routinesDone}
              <span className="hs-big-stat-total">/{routinesTotal}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>complete</div>
          </div>
          <div className="hs-bar-track" style={{ marginTop: 12 }}>
            <div className="hs-bar-fill" style={{ width: routinePct }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <StatTile
            label="CONSISTENCY"
            value={consistencyPct}
            unit="THIS WEEK"
          />
          <StatTile
            label="BEST STREAK"
            value={bestStreak}
            unit="DAYS"
            positive
          />
        </div>

        <div>
          <div className="hs-group-head">
            <div className="hs-section-label is-bare">THIS WEEK</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {DOW.map((d, i) => (
                <div key={i} className="hs-dow-head">
                  {d}
                </div>
              ))}
            </div>
          </div>
          {routines.map((r) => (
            <div key={r.name} className="hs-heat-row">
              <div className="hs-heat-name">{r.name}</div>
              <div style={{ display: 'flex', gap: 3, flex: 'none' }}>
                {(r.week || []).map((v, wi) => (
                  <div
                    key={wi}
                    className={`hs-heat-cell${v ? ' is-on' : ''}`}
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
