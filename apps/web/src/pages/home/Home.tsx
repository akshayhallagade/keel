import type { ComponentType } from 'react'
import Sidebar from './Sidebar'
import Splash from './Splash'
import Today from './screens/Today'
import Todos from './screens/Todos'
import Routines from './screens/Routines'
import Projects, { ProjectDetail } from './screens/Projects'
import { Investments, Accounts, Spend, Budget } from './screens/Money'
import { Goals, Books, Quotes, Wishlist } from './screens/Life'
import Hobbies from './screens/Hobbies'
import { Alarms, Reminders } from './screens/Time'
import Settings from './screens/Settings'
import {
  TodoPanel,
  RoutinePanel,
  CreatePanel,
  HobbyPanel,
  ProjectPanel,
  ConfirmDeleteModal,
} from './panels/Panels'
import type { User } from '@keel/types'
import type { Screen } from './types'
import { useHomeState, type HomeState } from './useHomeState'
import './Home.css'

/**
 * Every screen, keyed by the `Screen` union. Because the key type is `Screen`,
 * adding a case to that union without adding it here is a compile error — which
 * the seventeen-line chain of `{vm.screen === '…' && <X/>}` this replaces could
 * never catch.
 */
const SCREENS: Record<Screen, ComponentType<{ vm: HomeState }>> = {
  today: Today,
  todos: Todos,
  routines: Routines,
  projects: Projects,
  projectDetail: ProjectDetail,
  invest: Investments,
  accounts: Accounts,
  spend: Spend,
  budget: Budget,
  goals: Goals,
  books: Books,
  quotes: Quotes,
  wishlist: Wishlist,
  hobbies: Hobbies,
  alarms: Alarms,
  reminders: Reminders,
  settings: Settings,
}

const PANELS = [
  TodoPanel,
  RoutinePanel,
  CreatePanel,
  HobbyPanel,
  ProjectPanel,
  ConfirmDeleteModal,
]

export default function Home({
  user,
  onSignOut,
}: {
  user: User
  onSignOut: () => void
}) {
  const vm = useHomeState(user, onSignOut)
  const Screen = SCREENS[vm.screen]

  return (
    <div
      className={`home-shell${vm.mode === 'dark' ? ' dark-mode' : ''}`}
      style={{ '--accent': vm.accent } as React.CSSProperties}
    >
      {vm.splash && <Splash />}

      <Sidebar vm={vm} />

      <Screen vm={vm} />

      {PANELS.map((P, i) => (
        <P key={i} vm={vm} />
      ))}
    </div>
  )
}
