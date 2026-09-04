import type { HomeState } from '../useHomeState'

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

  const alarmsOnCount = alarms.filter((a) => a.on).length
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
      rowOpacity: a.on ? 1 : 0.45,
      timeColor: a.on ? 'var(--ink)' : 'var(--muted)',
      bg: a.on ? 'var(--ink)' : '#D8D2C4',
      knob: a.on ? 18 : 2,
      knob2: a.on ? 15 : 2,
      hourDeg: (h % 12) * 30 + m * 0.5,
      minDeg: m * 6,
      clockId: 'alarm-tile-clock-' + i,
      flip: () =>
        setAlarms((s) =>
          s.map((x, xi) => (xi === i ? { ...x, on: !x.on } : x)),
        ),
    }
  })

  const editing = editingAlarmIdx !== null ? alarms[editingAlarmIdx] : null
  const draftTime = alarmDraft
    ? alarmDraft.h + ':' + String(alarmDraft.m).padStart(2, '0')
    : ''
  const hourDeg = alarmDraft ? (alarmDraft.h % 12) * 30 + alarmDraft.m * 0.5 : 0
  const minDeg = alarmDraft ? alarmDraft.m * 6 : 0

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 2 }}>
        <div className="hs-title">Alarms</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', border: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => setAlarmView('list')}
              style={{
                font: '500 9px "IBM Plex Mono",monospace',
                letterSpacing: '.08em',
                padding: '7px 11px',
                cursor: 'pointer',
                border: 'none',
                background: alarmView === 'list' ? 'var(--ink)' : 'transparent',
                color: alarmView === 'list' ? 'var(--paper)' : 'var(--text-2)',
              }}
            >
              LIST
            </button>
            <button
              type="button"
              onClick={() => setAlarmView('dial')}
              style={{
                font: '500 9px "IBM Plex Mono",monospace',
                letterSpacing: '.08em',
                padding: '7px 11px',
                cursor: 'pointer',
                border: 'none',
                borderLeft: '1px solid var(--line)',
                background: alarmView === 'dial' ? 'var(--ink)' : 'transparent',
                color: alarmView === 'dial' ? 'var(--paper)' : 'var(--text-2)',
              }}
            >
              DIAL
            </button>
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
        {alarmsOnCount} OF {alarms.length} ON · NEXT RINGS {nextAlarm}
      </div>

      {alarmView === 'list' &&
        rows.map((r) => (
          <div
            key={r.a.label}
            style={{ borderBottom: '1px solid var(--line-soft)' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '18px 0',
                opacity: r.rowOpacity,
                transition: 'opacity .25s ease',
                animation: 'rowIn .35s ease backwards',
              }}
            >
              <div
                style={{
                  font: '500 30px "IBM Plex Mono",monospace',
                  color: r.timeColor,
                  width: 150,
                  flex: 'none',
                }}
              >
                {r.a.time}
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                  {' '}
                  {r.a.ampm}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: r.timeColor,
                  }}
                >
                  {r.a.label}
                </div>
                <div className="hs-row-sub">{r.a.days}</div>
              </div>
              <button
                type="button"
                style={{
                  font: '400 10px "IBM Plex Mono",monospace',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  flex: 'none',
                  background: 'none',
                  border: 'none',
                }}
                onClick={() => {
                  setEditingAlarmIdx(r.i)
                  setAlarmDraft({ h: r.h, m: r.m, ampm: r.a.ampm })
                }}
              >
                EDIT
              </button>
              <button
                type="button"
                className="hs-toggle-track"
                style={{ width: 36, height: 20, background: r.bg }}
                onClick={r.flip}
              >
                <div className="hs-toggle-knob" style={{ left: r.knob }} />
              </button>
            </div>
          </div>
        ))}

      {alarmView === 'dial' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '38px 32px' }}>
          {rows.map((r) => (
            <div
              key={r.a.label}
              style={{
                width: 270,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '28px 18px',
                background: 'var(--input-bg)',
                border: '1px solid var(--line)',
                opacity: r.rowOpacity,
                transition: 'opacity .25s ease',
                animation: 'rowIn .35s ease backwards',
              }}
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
                <line
                  x1="55"
                  y1="5"
                  x2="55"
                  y2="14"
                  stroke="var(--ink)"
                  strokeWidth="2"
                />
                <line
                  x1="105"
                  y1="55"
                  x2="96"
                  y2="55"
                  stroke="var(--ink)"
                  strokeWidth="2"
                />
                <line
                  x1="55"
                  y1="105"
                  x2="55"
                  y2="96"
                  stroke="var(--ink)"
                  strokeWidth="2"
                />
                <line
                  x1="5"
                  y1="55"
                  x2="14"
                  y2="55"
                  stroke="var(--ink)"
                  strokeWidth="2"
                />
                {CLOCK_TICKS.map((t, ti) => (
                  <line
                    key={ti}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke="#D8D2C4"
                    strokeWidth="1.2"
                  />
                ))}
                <g
                  onPointerDown={(e) => {
                    e.preventDefault()
                    setDragTileHand('hour')
                    setDragTileIdx(r.i)
                  }}
                  style={{
                    cursor: 'grab',
                    transformOrigin: '55px 55px',
                    transform: `rotate(${r.hourDeg}deg)`,
                  }}
                >
                  <line
                    className="hs-alarm-clock-line"
                    x1="55"
                    y1="55"
                    x2="55"
                    y2="27"
                    stroke={r.timeColor}
                    strokeWidth="3.2"
                  />
                  <circle cx="55" cy="27" r="4.5" fill={r.timeColor} />
                </g>
                <g
                  onPointerDown={(e) => {
                    e.preventDefault()
                    setDragTileHand('minute')
                    setDragTileIdx(r.i)
                  }}
                  style={{
                    cursor: 'grab',
                    transformOrigin: '55px 55px',
                    transform: `rotate(${r.minDeg}deg)`,
                  }}
                >
                  <line
                    className="hs-alarm-clock-line"
                    x1="55"
                    y1="55"
                    x2="55"
                    y2="17"
                    stroke="var(--accent)"
                    strokeWidth="2.2"
                  />
                  <circle cx="55" cy="17" r="3.6" fill="var(--accent)" />
                </g>
                <circle cx="55" cy="55" r="2.6" fill={r.timeColor} />
              </svg>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div
                  style={{
                    font: '600 26px "IBM Plex Mono",monospace',
                    color: r.timeColor,
                  }}
                >
                  {r.a.time}
                </div>
                <div
                  style={{
                    font: '500 11px "IBM Plex Mono",monospace',
                    color: 'var(--muted)',
                  }}
                >
                  {r.a.ampm}
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  paddingTop: 16,
                  borderTop: '1px solid var(--line-soft)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: r.timeColor,
                    }}
                  >
                    {r.a.label}
                  </div>
                  <div
                    style={{
                      font: '400 9px "IBM Plex Mono",monospace',
                      color: 'var(--muted)',
                      marginTop: 2,
                    }}
                  >
                    {r.a.days}
                  </div>
                </div>
                <button
                  type="button"
                  className="hs-toggle-track"
                  style={{ width: 30, height: 17, background: r.bg }}
                  onClick={r.flip}
                >
                  <div
                    className="hs-toggle-knob"
                    style={{ width: 13, height: 13, left: r.knob2 }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && alarmDraft && editingAlarmIdx !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--paper)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 34,
            animation: 'screenIn .3s ease both',
          }}
        >
          <button
            type="button"
            style={{
              position: 'absolute',
              top: 32,
              right: 36,
              font: '400 13px "IBM Plex Mono",monospace',
              color: 'var(--muted)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
            onClick={() => {
              setEditingAlarmIdx(null)
              setDragHand(null)
            }}
          >
            ✕ CLOSE
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{editing.label}</div>
            <div
              style={{
                font: '400 10px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
                marginTop: 6,
                letterSpacing: '.08em',
              }}
            >
              {editing.days}
            </div>
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
                style={{
                  font: '600 16px "IBM Plex Mono",monospace',
                  fill: 'var(--ink)',
                }}
              >
                {idx + 1}
              </text>
            ))}
            <g
              onPointerDown={(e) => {
                e.preventDefault()
                setDragHand('hour')
              }}
              style={{
                transformOrigin: '130px 130px',
                transform: `rotate(${hourDeg}deg)`,
                cursor: 'grab',
              }}
            >
              <line
                x1="130"
                y1="130"
                x2="130"
                y2="70"
                stroke="var(--ink)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="130" cy="70" r="12" fill="var(--ink)" />
            </g>
            <g
              onPointerDown={(e) => {
                e.preventDefault()
                setDragHand('minute')
              }}
              style={{
                transformOrigin: '130px 130px',
                transform: `rotate(${minDeg}deg)`,
                cursor: 'grab',
              }}
            >
              <line
                x1="130"
                y1="130"
                x2="130"
                y2="38"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="130" cy="38" r="9" fill="var(--accent)" />
            </g>
            <circle cx="130" cy="130" r="5" fill="var(--ink)" />
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{ font: '600 44px "IBM Plex Mono",monospace' }}>
              {draftTime}
            </div>
            <button
              type="button"
              style={{
                font: '500 13px "IBM Plex Mono",monospace',
                letterSpacing: '.1em',
                color: 'var(--paper)',
                background: 'var(--ink)',
                padding: '9px 14px',
                cursor: 'pointer',
                border: 'none',
              }}
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
              style={{
                font: '500 11px "IBM Plex Mono",monospace',
                letterSpacing: '.1em',
                color: 'var(--paper)',
                background: 'var(--accent)',
                padding: '13px 26px',
                cursor: 'pointer',
                border: 'none',
              }}
              onClick={() => {
                setAlarms((s) =>
                  s.map((x, xi) =>
                    xi === editingAlarmIdx
                      ? {
                          ...x,
                          time:
                            alarmDraft.h +
                            ':' +
                            String(alarmDraft.m).padStart(2, '0'),
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

const REMINDERS_TODAY = [
  {
    when: '4:15 PM',
    name: 'Leave for the gym',
    meta: '15 MIN BEFORE · PULL DAY',
  },
  {
    when: '9:30 PM',
    name: 'Plan tomorrow’s Top 3',
    meta: 'LINKED TO EVENING ROUTINE',
  },
]
const REMINDERS_UPCOMING = [
  {
    when: 'SUN 8AM',
    name: 'Credit card autopay executes',
    meta: '₹23,410 · CHECK BALANCE FIRST',
  },
  {
    when: 'TUE 4PM',
    name: 'Plumber arrives — kitchen tap',
    meta: 'LINKED TO TODO',
  },
]
const REMINDERS_RECURRING = [
  {
    when: '4TH',
    name: 'SIP executes tomorrow',
    meta: 'MONTHLY · DAY BEFORE THE 5TH',
  },
  {
    when: 'MON 9AM',
    name: 'Weekly review — clear inbox',
    meta: 'EVERY MONDAY',
  },
  {
    when: '28TH',
    name: 'Renew gym membership',
    meta: 'MONTHLY · CURRENTLY OVERDUE',
  },
]

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
    <div
      style={{
        display: 'flex',
        gap: 18,
        padding: '14px 0',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div
        style={{
          font: '400 11px "IBM Plex Mono",monospace',
          color: accentWhen ? 'var(--accent)' : 'var(--muted)',
          width: 76,
          flex: 'none',
          paddingTop: 2,
        }}
      >
        {when}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>{name}</div>
        <div className="hs-row-sub" style={{ marginTop: 2 }}>
          {meta}
        </div>
      </div>
    </div>
  )
}

export function Reminders({ vm }: { vm: HomeState }) {
  const { newRems, openC } = vm
  const today = newRems.filter((r) => r.bucket === 'TODAY')
  const upcoming = newRems.filter((r) => r.bucket === 'UPCOMING')
  const recurring = newRems.filter((r) => r.bucket === 'RECURRING')

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

        <div className="hs-section-label">TODAY</div>
        {REMINDERS_TODAY.map((r) => (
          <ReminderRow key={r.name} {...r} accentWhen />
        ))}
        {today.map((r, i) => (
          <div key={i} style={{ animation: 'rowIn .35s ease backwards' }}>
            <ReminderRow
              when={r.when}
              name={r.name}
              meta="ADDED TODAY"
              accentWhen
            />
          </div>
        ))}

        <div className="hs-section-label" style={{ marginTop: 26 }}>
          UPCOMING
        </div>
        {REMINDERS_UPCOMING.map((r) => (
          <ReminderRow key={r.name} {...r} />
        ))}
        {upcoming.map((r, i) => (
          <div key={i} style={{ animation: 'rowIn .35s ease backwards' }}>
            <ReminderRow when={r.when} name={r.name} meta="ADDED TODAY" />
          </div>
        ))}

        <div className="hs-section-label" style={{ marginTop: 26 }}>
          RECURRING
        </div>
        {REMINDERS_RECURRING.map((r) => (
          <ReminderRow key={r.name} {...r} />
        ))}
        {recurring.map((r, i) => (
          <div key={i} style={{ animation: 'rowIn .35s ease backwards' }}>
            <ReminderRow when={r.when} name={r.name} meta="ADDED TODAY" />
          </div>
        ))}

        <button
          type="button"
          className="hs-add-row"
          onClick={openC('rem')}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          <div className="hs-add-plus">+</div>
          <div
            style={{
              flex: 1,
              font: '400 13px "IBM Plex Sans",sans-serif',
              color: 'var(--muted)',
              textAlign: 'left',
            }}
          >
            Remind me to&hellip;
          </div>
          <div className="hs-add-details">+ ADD</div>
        </button>
      </div>
    </div>
  )
}
