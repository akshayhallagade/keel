import { ACCENTS } from '../seedData'
import type { HomeState } from '../useHomeState'

export default function Settings({ vm }: { vm: HomeState }) {
  const {
    profile,
    setProfile,
    accent,
    setAccent,
    mode,
    setMode,
    prefs,
    setPrefs,
    weekStart,
    setWeekStart,
  } = vm

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ME'
  const accentName = (ACCENTS.find((a) => a.hex === accent) || ACCENTS[0]).name

  const prefDefs: { key: keyof typeof prefs; name: string; desc: string }[] = [
    { key: 'quote', name: 'Daily resurfaced quote', desc: 'SHOWN ON TODAY' },
    { key: 'digest', name: 'Morning digest', desc: 'EMAIL · 8:00 AM' },
    { key: 'alerts', name: 'Due-date alerts', desc: 'PUSH · DAY OF' },
    { key: 'sip', name: 'SIP reminders', desc: 'DAY BEFORE EXECUTION' },
  ]

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col">
        <div className="hs-title">Settings</div>
        <div className="hs-meta" style={{ marginBottom: 26 }}>
          ACCOUNT &amp; PREFERENCES
        </div>

        <div className="hs-section-label">PROFILE</div>
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'flex-start',
            padding: '18px 0',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          <div
            className="hs-avatar hs-avatar-lg"
            style={{ background: accent }}
          >
            {initials}
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div className="hs-panel-field">
              <div className="hs-field-label">NAME</div>
              <input
                className="hs-field-input"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="hs-panel-field">
              <div className="hs-field-label">EMAIL</div>
              <input
                className="hs-field-input"
                style={{ font: '400 12.5px "IBM Plex Mono",monospace' }}
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          ACCOUNT
        </div>
        <SettingsRow title="Plan" sub="PERSONAL · FREE" action="UPGRADE →" />
        <SettingsRow
          title="Password"
          sub="LAST CHANGED FEB 2026"
          action="CHANGE →"
        />
        <SettingsRow
          title="Export my data"
          sub="TODOS, ROUTINES, MONEY · .JSON"
          action="EXPORT →"
        />

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          CONNECTED
        </div>
        <SettingsRow
          title="Google Calendar"
          sub={
            <>
              <span style={{ color: 'var(--positive)' }}>●</span> CONNECTED ·
              arjun@gmail.com
            </>
          }
          action="REMOVE"
          mute
        />
        <SettingsRow
          title="Bank sync"
          sub={
            <>
              <span style={{ color: 'var(--positive)' }}>●</span> CONNECTED ·
              SYNCED 09:42
            </>
          }
          action="REMOVE"
          mute
        />
        <SettingsRow
          title="Fitness tracker"
          sub="NOT CONNECTED"
          action="CONNECT →"
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
          <button
            type="button"
            style={{
              border: '1px solid var(--line)',
              color: 'var(--text-2)',
              font: '500 10px "IBM Plex Mono",monospace',
              letterSpacing: '.1em',
              padding: '11px 16px',
              cursor: 'pointer',
              background: 'none',
            }}
          >
            SIGN OUT
          </button>
          <button
            type="button"
            style={{
              border: '1px solid #E8CFC8',
              color: 'var(--accent)',
              font: '500 10px "IBM Plex Mono",monospace',
              letterSpacing: '.1em',
              padding: '11px 16px',
              cursor: 'pointer',
              background: 'none',
            }}
          >
            DELETE ACCOUNT
          </button>
        </div>
      </div>

      <div className="hs-rail">
        <div>
          <div className="hs-section-label">APPEARANCE</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {(['LIGHT', 'DARK'] as const).map((name) => {
              const sel = mode === name.toLowerCase()
              return (
                <button
                  key={name}
                  type="button"
                  className="hs-chip-flat"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px 0',
                    borderColor: sel ? accent : 'var(--line)',
                    color: sel ? 'var(--paper)' : 'var(--text-2)',
                    background: sel ? accent : 'var(--input-bg)',
                  }}
                  onClick={() =>
                    setMode(name.toLowerCase() as 'light' | 'dark')
                  }
                >
                  {name}
                </button>
              )
            })}
          </div>
          <div className="hs-meta-sm" style={{ marginTop: 10 }}>
            {mode === 'dark'
              ? 'DARK · APPLIES TO ALL SCREENS'
              : 'LIGHT · APPLIES TO ALL SCREENS'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 18,
            }}
          >
            <div style={{ fontSize: 13.5 }}>Accent</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCENTS.map((a) => (
                <button
                  key={a.hex}
                  type="button"
                  onClick={() => setAccent(a.hex)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: a.hex,
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    boxShadow:
                      a.hex === accent
                        ? 'inset 0 0 0 2.5px var(--paper)'
                        : 'none',
                    border: `1.5px solid ${a.hex === accent ? 'var(--ink)' : 'transparent'}`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="hs-meta-sm" style={{ marginTop: 8 }}>
            ACCENT · {accentName}
          </div>
        </div>
        <div>
          <div className="hs-section-label">PREFERENCES</div>
          {prefDefs.map((d) => {
            const isOn = !!prefs[d.key]
            return (
              <div
                key={d.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{d.name}</div>
                  <div className="hs-row-sub">{d.desc}</div>
                </div>
                <button
                  type="button"
                  className="hs-toggle-track"
                  style={{
                    width: 32,
                    height: 18,
                    background: isOn ? 'var(--ink)' : '#D8D2C4',
                  }}
                  onClick={() =>
                    setPrefs((s) => ({ ...s, [d.key]: !s[d.key] }))
                  }
                >
                  <div
                    className="hs-toggle-knob"
                    style={{ left: isOn ? 16 : 2 }}
                  />
                </button>
              </div>
            )
          })}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 0',
            }}
          >
            <div style={{ fontSize: 13.5 }}>Week starts on</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['MON', 'SUN'].map((name) => {
                const sel = weekStart === name
                return (
                  <button
                    key={name}
                    type="button"
                    className="hs-chip-flat"
                    style={{
                      borderColor: sel ? accent : 'var(--line)',
                      color: sel ? 'var(--paper)' : 'var(--text-2)',
                      background: sel ? accent : 'var(--input-bg)',
                    }}
                    onClick={() => setWeekStart(name)}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsRow({
  title,
  sub,
  action,
  mute,
}: {
  title: string
  sub: React.ReactNode
  action: string
  mute?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '13px 0',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
        <div className="hs-row-sub">{sub}</div>
      </div>
      <div
        style={{
          font: '400 10px "IBM Plex Mono",monospace',
          color: mute ? 'var(--muted)' : 'var(--accent)',
          cursor: 'pointer',
        }}
      >
        {action}
      </div>
    </div>
  )
}
