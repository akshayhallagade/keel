import { ACCENTS } from '../seedData'
import type { HomeState } from '../useHomeState'
import { initialsOf } from '../state/helpers'
import Chip from '../../../components/Chip'

const PREF_DEFS = [
  { key: 'quote', name: 'Daily resurfaced quote', desc: 'SHOWN ON TODAY' },
  { key: 'digest', name: 'Morning digest', desc: 'EMAIL · 8:00 AM' },
  { key: 'alerts', name: 'Due-date alerts', desc: 'PUSH · DAY OF' },
  { key: 'sip', name: 'SIP reminders', desc: 'DAY BEFORE EXECUTION' },
] as const

const ACCOUNT_ROWS = [
  { title: 'Plan', sub: 'PERSONAL · FREE', action: 'UPGRADE →' },
  { title: 'Password', sub: 'LAST CHANGED FEB 2026', action: 'CHANGE →' },
  {
    title: 'Export my data',
    sub: 'TODOS, ROUTINES, MONEY · .JSON',
    action: 'EXPORT →',
  },
]

const CONNECTED_ROWS = [
  { title: 'Google Calendar', sub: 'CONNECTED · arjun@gmail.com', on: true },
  { title: 'Bank sync', sub: 'CONNECTED · SYNCED 09:42', on: true },
  { title: 'Fitness tracker', sub: 'NOT CONNECTED', on: false },
]

function SettingsRow({
  title,
  sub,
  action,
  mute,
  dot,
}: {
  title: string
  sub: string
  action: string
  mute?: boolean
  dot?: boolean
}) {
  return (
    <div className="hs-settings-row">
      <div>
        <div className="hs-settings-row-title">{title}</div>
        <div className="hs-row-sub">
          {dot && <span style={{ color: 'var(--positive)' }}>●</span>} {sub}
        </div>
      </div>
      <button
        type="button"
        className={`hs-settings-action${mute ? ' is-mute' : ''}`}
      >
        {action}
      </button>
    </div>
  )
}

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

  const initials = initialsOf(profile.name)
  const accentName = (ACCENTS.find((a) => a.hex === accent) || ACCENTS[0]).name

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col">
        <div className="hs-title">Settings</div>
        <div className="hs-meta" style={{ marginBottom: 26 }}>
          ACCOUNT &amp; PREFERENCES
        </div>

        <div className="hs-section-label">PROFILE</div>
        <div className="hs-profile-edit">
          <div
            className="hs-avatar hs-avatar-lg"
            style={{ background: accent }}
          >
            {initials}
          </div>
          <div className="hs-profile-edit-fields">
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
                className="hs-field-input is-mono-plain"
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
        {ACCOUNT_ROWS.map((r) => (
          <SettingsRow key={r.title} {...r} />
        ))}

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          CONNECTED
        </div>
        {CONNECTED_ROWS.map((r) => (
          <SettingsRow
            key={r.title}
            title={r.title}
            sub={r.sub}
            dot={r.on}
            mute={r.on}
            action={r.on ? 'REMOVE' : 'CONNECT →'}
          />
        ))}

        <div className="hs-danger-actions">
          <button
            type="button"
            className="hs-btn-outline"
            onClick={vm.onSignOut}
          >
            SIGN OUT
          </button>
          <button type="button" className="hs-btn-outline is-danger">
            DELETE ACCOUNT
          </button>
        </div>
      </div>

      <div className="hs-rail">
        <div>
          <div className="hs-section-label">APPEARANCE</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {(['light', 'dark'] as const).map((m) => (
              <Chip
                key={m}
                flat
                label={m.toUpperCase()}
                selected={mode === m}
                onClick={() => setMode(m)}
                style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}
              />
            ))}
          </div>
          <div className="hs-meta-sm" style={{ marginTop: 10 }}>
            {mode.toUpperCase()} · APPLIES TO ALL SCREENS
          </div>

          <div className="hs-rail-stat">
            <div style={{ fontSize: 13.5 }}>Accent</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCENTS.map((a) => (
                <button
                  key={a.hex}
                  type="button"
                  title={a.name}
                  aria-label={a.name}
                  aria-pressed={a.hex === accent}
                  onClick={() => setAccent(a.hex)}
                  className={`hs-swatch${a.hex === accent ? ' is-selected' : ''}`}
                  style={{ background: a.hex }}
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
          {PREF_DEFS.map((d) => {
            const isOn = !!prefs[d.key]
            return (
              <div key={d.key} className="hs-pref-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{d.name}</div>
                  <div className="hs-row-sub">{d.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={d.name}
                  className={`hs-toggle-track${isOn ? ' is-on' : ''}`}
                  onClick={() =>
                    setPrefs((s) => ({ ...s, [d.key]: !s[d.key] }))
                  }
                >
                  <div className="hs-toggle-knob" />
                </button>
              </div>
            )
          })}

          <div className="hs-pref-row">
            <div style={{ fontSize: 13.5 }}>Week starts on</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['MON', 'SUN'].map((name) => (
                <Chip
                  key={name}
                  flat
                  label={name}
                  selected={weekStart === name}
                  onClick={() => setWeekStart(name)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
