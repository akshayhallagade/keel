import type { HomeState } from '../useHomeState'
import { SEED_REMINDERS } from '../seedData'
import type { Hand } from '../useClockDrag'
import { pad2 } from '../state/helpers'

/// Quarter-hour tick marks on the small tile face, in its 110-unit viewBox.
const CLOCK_TICKS = [
  { x1: 80, y1: 11.7, x2: 77.5, y2: 16 },
  { x1: 98.3, y1: 30, x2: 93.97, y2: 32.5 },
  { x1: 98.3, y1: 80, x2: 93.97, y2: 77.5 },
  { x1: 80, y1: 98.3, x2: 77.5, y2: 93.97 },
  { x1: 30, y1: 98.3, x2: 32.5, y2: 93.97 },
  { x1: 11.7, y1: 80, x2: 16, y2: 77.5 },
  { x1: 11.7, y1: 30, x2: 16, y2: 32.5 },
  { x1: 30, y1: 11.7, x2: 32.5, y2: 16 },
]

/// Where the numerals 1–12 sit on the large editor face (260-unit viewBox).
const CLOCK_HOURS_XY = [
  { x: 177.5, y: 47.7 },
  { x: 212.3, y: 82.5 },
  { x: 225, y: 130 },
  { x: 212.3, y: 177.5 },
  { x: 177.5, y: 212.3 },
  { x: 130, y: 225 },
  { x: 82.5, y: 212.3 },
  { x: 47.7, y: 177.5 },
  { x: 35, y: 130 },
  { x: 47.7, y: 82.5 },
  { x: 82.5, y: 47.7 },
  { x: 130, y: 35 },
]

/// Where the two hands point, from an "h:mm" pair. The hour hand creeps
/// forward through the hour rather than jumping, hence the `+ m * 0.5`.
const handAngles = (h: number, m: number) => ({
  hourDeg: (h % 12) * 30 + m * 0.5,
  minDeg: m * 6,
})

/**
 * A draggable clock hand: the line, its cap, and the rotation.
 *
 * The tile face and the editor face drew this four times between them with
 * different numbers; the numbers are now props.
 */
function ClockHand({
  centre,
  length,
  capR,
  width,
  deg,
  color,
  onGrab,
}: {
  centre: number
  length: number
  capR: number
  width: number
  deg: number
  color: string
  onGrab: () => void
}) {
  return (
    <g
      onPointerDown={(e) => {
        e.preventDefault()
        onGrab()
      }}
      style={{
        cursor: 'grab',
        transformOrigin: `${centre}px ${centre}px`,
        transform: `rotate(${deg}deg)`,
      }}
    >
      <line
        className="hs-alarm-clock-line"
        x1={centre}
        y1={centre}
        x2={centre}
        y2={length}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <circle cx={centre} cy={length} r={capR} fill={color} />
    </g>
  )
}

export function Alarms({ vm }: { vm: HomeState }) {
  const {
    alarms,
    setAlarms,
    alarmView,
    setAlarmView,
    editingAlarmIdx,
    setEditingAlarmIdx,
    alarmDraft,
    setAlarmDraft,
    setDragHand,
    setDragTileHand,
    setDragTileIdx,
    openC,
  } = vm

  const onCount = alarms.filter((a) => a.on).length
  const on = alarms.filter((a) => a.on)
  const nextAlarm = on.length
    ? on[on.length - 1].time + ' ' + on[on.length - 1].ampm
    : '—'

  const rows = alarms.map((a, i) => {
    const [h, m] = a.time.split(':').map(Number)
    return {
      a,
      i,
      h,
      m,
      ...handAngles(h, m),
      clockId: 'alarm-tile-clock-' + i,
      grab: (hand: Hand) => () => {
        setDragTileHand(hand)
        setDragTileIdx(i)
      },
      flip: () =>
        setAlarms((s) =>
          s.map((x, xi) => (xi === i ? { ...x, on: !x.on } : x)),
        ),
      edit: () => {
        setEditingAlarmIdx(i)
        setAlarmDraft({ h, m, ampm: a.ampm })
      },
    }
  })

  const editing = editingAlarmIdx !== null ? alarms[editingAlarmIdx] : null
  const draftAngles = alarmDraft
    ? handAngles(alarmDraft.h, alarmDraft.m)
    : { hourDeg: 0, minDeg: 0 }

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 2 }}>
        <div className="hs-title">Alarms</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hs-segmented is-square">
            {(['list', 'dial'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAlarmView(v)}
                aria-pressed={alarmView === v}
                className={`hs-segment is-ink${
                  alarmView === v ? ' is-active' : ''
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="hs-btn-small-accent"
            style={{ whiteSpace: 'nowrap' }}
            onClick={openC('alarm')}
          >
            + NEW ALARM
          </button>
        </div>
      </div>
      <div className="hs-meta" style={{ marginBottom: 26 }}>
        {onCount} OF {alarms.length} ON · NEXT RINGS {nextAlarm}
      </div>

      {alarmView === 'list' &&
        rows.map((r) => (
          <div
            key={r.a.label}
            className={`hs-alarm-row${r.a.on ? '' : ' is-off'}`}
          >
            <div className="hs-alarm-time">
              {r.a.time}
              <span className="hs-alarm-ampm"> {r.a.ampm}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hs-alarm-label">{r.a.label}</div>
              <div className="hs-row-sub">{r.a.days}</div>
            </div>
            <button type="button" className="hs-hobby-cta" onClick={r.edit}>
              EDIT
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={r.a.on}
              aria-label={r.a.label}
              className={`hs-toggle-track lg${r.a.on ? ' is-on' : ''}`}
              onClick={r.flip}
            >
              <div className="hs-toggle-knob" />
            </button>
          </div>
        ))}

      {alarmView === 'dial' && (
        <div className="hs-dial-grid">
          {rows.map((r) => (
            <div
              key={r.a.label}
              className={`hs-dial-tile${r.a.on ? '' : ' is-off'}`}
            >
              <svg
                id={r.clockId}
                width="200"
                height="200"
                viewBox="0 0 110 110"
                style={{ touchAction: 'none' }}
              >
                <circle
                  cx="55"
                  cy="55"
                  r="50"
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="1.5"
                />
                {/* The four cardinal marks, drawn heavier than the ticks. */}
                {[
                  [55, 5, 55, 14],
                  [105, 55, 96, 55],
                  [55, 105, 55, 96],
                  [5, 55, 14, 55],
                ].map(([x1, y1, x2, y2]) => (
                  <line
                    key={`${x1}-${y1}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--ink)"
                    strokeWidth="2"
                  />
                ))}
                {CLOCK_TICKS.map((t, ti) => (
                  <line
                    key={ti}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke="var(--track-off)"
                    strokeWidth="1.2"
                  />
                ))}
                <ClockHand
                  centre={55}
                  length={27}
                  capR={4.5}
                  width={3.2}
                  deg={r.hourDeg}
                  color="var(--ink)"
                  onGrab={r.grab('hour')}
                />
                <ClockHand
                  centre={55}
                  length={17}
                  capR={3.6}
                  width={2.2}
                  deg={r.minDeg}
                  color="var(--accent)"
                  onGrab={r.grab('minute')}
                />
                <circle cx="55" cy="55" r="2.6" fill="var(--ink)" />
              </svg>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="hs-dial-time">{r.a.time}</div>
                <div className="hs-dial-ampm">{r.a.ampm}</div>
              </div>

              <div className="hs-dial-foot">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="hs-dial-label">{r.a.label}</div>
                  <div className="hs-dial-days">{r.a.days}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={r.a.on}
                  aria-label={r.a.label}
                  className={`hs-toggle-track sm${r.a.on ? ' is-on' : ''}`}
                  onClick={r.flip}
                >
                  <div className="hs-toggle-knob" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && alarmDraft && editingAlarmIdx !== null && (
        <div className="hs-alarm-editor">
          <button
            type="button"
            className="hs-editor-close"
            onClick={() => {
              setEditingAlarmIdx(null)
              setDragHand(null)
            }}
          >
            ✕ CLOSE
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{editing.label}</div>
            <div className="hs-editor-days">{editing.days}</div>
          </div>

          <svg
            id="alarm-edit-clock"
            width="260"
            height="260"
            viewBox="0 0 260 260"
            style={{ touchAction: 'none' }}
          >
            <circle
              cx="130"
              cy="130"
              r="122"
              fill="none"
              stroke="var(--line)"
              strokeWidth="1.5"
            />
            {CLOCK_HOURS_XY.map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="hs-clock-numeral"
              >
                {idx + 1}
              </text>
            ))}
            <ClockHand
              centre={130}
              length={70}
              capR={12}
              width={7}
              deg={draftAngles.hourDeg}
              color="var(--ink)"
              onGrab={() => setDragHand('hour')}
            />
            <ClockHand
              centre={130}
              length={38}
              capR={9}
              width={5}
              deg={draftAngles.minDeg}
              color="var(--accent)"
              onGrab={() => setDragHand('minute')}
            />
            <circle cx="130" cy="130" r="5" fill="var(--ink)" />
          </svg>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div className="hs-editor-time">
              {alarmDraft.h}:{pad2(alarmDraft.m)}
            </div>
            <button
              type="button"
              className="hs-btn-ink"
              onClick={() =>
                setAlarmDraft((d) =>
                  d ? { ...d, ampm: d.ampm === 'AM' ? 'PM' : 'AM' } : d,
                )
              }
            >
              {alarmDraft.ampm}
            </button>
          </div>

          <div className="hs-meta-sm">DRAG THE HANDS TO SET THE TIME</div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="hs-btn-accent lg"
              onClick={() => {
                setAlarms((s) =>
                  s.map((x, xi) =>
                    xi === editingAlarmIdx
                      ? {
                          ...x,
                          time: alarmDraft.h + ':' + pad2(alarmDraft.m),
                          ampm: alarmDraft.ampm,
                        }
                      : x,
                  ),
                )
                setEditingAlarmIdx(null)
              }}
            >
              SAVE
            </button>
            <button
              type="button"
              className="hs-btn-ghost"
              onClick={() => {
                setEditingAlarmIdx(null)
                setDragHand(null)
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------- Reminders */

function ReminderRow({
  when,
  name,
  meta,
  accentWhen,
}: {
  when: string
  name: string
  meta: string
  accentWhen?: boolean
}) {
  return (
    <div className="hs-reminder-row">
      <div className={`hs-reminder-when${accentWhen ? ' is-accent' : ''}`}>
        {when}
      </div>
      <div style={{ flex: 1 }}>
        <div className="hs-wish-name">{name}</div>
        <div className="hs-row-sub" style={{ marginTop: 2 }}>
          {meta}
        </div>
      </div>
    </div>
  )
}

export function Reminders({ vm }: { vm: HomeState }) {
  const { newRems, openC } = vm

  // Seeded reminders and the user's own render the same way, so each bucket
  // is one list rather than two blocks that had to stay in step.
  const buckets = [
    { label: 'TODAY', key: 'TODAY', seed: SEED_REMINDERS.today, accent: true },
    { label: 'UPCOMING', key: 'UPCOMING', seed: SEED_REMINDERS.upcoming },
    { label: 'RECURRING', key: 'RECURRING', seed: SEED_REMINDERS.recurring },
  ].map((b) => ({
    ...b,
    items: [
      ...b.seed,
      ...newRems
        .filter((r) => r.bucket === b.key)
        .map((r) => ({ when: r.when, name: r.name, meta: 'ADDED TODAY' })),
    ],
  }))

  return (
    <div className="hs-screen">
      <div style={{ maxWidth: 620 }}>
        <div className="hs-title-row" style={{ marginBottom: 2 }}>
          <div className="hs-title">Reminders</div>
          <div className="hs-meta-sm">6 SCHEDULED · 3 RECURRING</div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 26 }}>
          NUDGES SO NOTHING SLIPS
        </div>

        {buckets.map((b, i) => (
          <div key={b.key}>
            <div
              className="hs-section-label"
              style={i === 0 ? undefined : { marginTop: 26 }}
            >
              {b.label}
            </div>
            {b.items.map((r, ri) => (
              <ReminderRow key={r.name + ri} {...r} accentWhen={b.accent} />
            ))}
          </div>
        ))}

        <button
          type="button"
          className="hs-add-row is-button"
          onClick={openC('rem')}
        >
          <div className="hs-add-plus">+</div>
          <div className="hs-add-prompt">Remind me to&hellip;</div>
          <div className="hs-add-details">+ ADD</div>
        </button>
      </div>
    </div>
  )
}
