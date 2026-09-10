import LogoMark from '../../components/LogoMark'
import { initialsOf, type HomeState } from './useHomeState'
import type { Screen } from './types'

const NAV_SECTIONS: {
  label: string
  items: { name: string; key: Screen | null }[]
}[] = [
  {
    label: 'TODAY',
    items: [
      { name: 'Today', key: 'today' },
      { name: 'Todos', key: 'todos' },
      { name: 'Routines', key: 'routines' },
      { name: 'Projects', key: 'projects' },
    ],
  },
  {
    label: 'LIFE',
    items: [
      { name: 'Hobbies', key: 'hobbies' },
      { name: 'Goals', key: 'goals' },
      { name: 'Books', key: 'books' },
      { name: 'Quotes', key: 'quotes' },
      { name: 'Wishlist', key: 'wishlist' },
    ],
  },
  {
    label: 'MONEY',
    items: [
      { name: 'Accounts', key: 'accounts' },
      { name: 'Spend', key: 'spend' },
      { name: 'Investments', key: 'invest' },
      { name: 'Budget', key: 'budget' },
    ],
  },
  {
    label: 'TIME',
    items: [
      { name: 'Alarms', key: 'alarms' },
      { name: 'Reminders', key: 'reminders' },
    ],
  },
]

export default function Sidebar({ vm }: { vm: HomeState }) {
  const { screen, go, accent, profile } = vm
  const initials = initialsOf(profile.name)

  return (
    <div className="hs-sidebar">
      <div className="hs-sidebar-brand">
        <LogoMark size={26} />
        <div className="hs-sidebar-brand-word">KEEL</div>
      </div>

      {NAV_SECTIONS.map((sec) => (
        <div className="hs-nav-section" key={sec.label}>
          <div className="hs-nav-label">{sec.label}</div>
          {sec.items.map((it) => {
            const active = it.key === screen
            return (
              <button
                type="button"
                key={it.name}
                className="hs-nav-item"
                onClick={it.key ? () => go(it.key as Screen) : undefined}
                style={{
                  fontWeight: active ? 600 : 400,
                  color: active ? accent : 'var(--text-2)',
                  cursor: it.key ? 'pointer' : 'default',
                }}
              >
                {it.name}
              </button>
            )
          })}
        </div>
      ))}

      <button
        type="button"
        className="hs-profile"
        onClick={() => go('settings')}
      >
        <div className="hs-avatar" style={{ background: accent }}>
          {initials}
        </div>
        <div className="hs-profile-info">
          <div
            className="hs-profile-name"
            style={{
              fontWeight: screen === 'settings' ? 600 : 500,
              color: screen === 'settings' ? accent : 'var(--ink)',
            }}
          >
            {profile.name}
          </div>
          <div className="hs-profile-tag">SETTINGS</div>
        </div>
      </button>
    </div>
  )
}
