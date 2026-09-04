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
import { useHomeState } from './useHomeState'
import './Home.css'

export default function Home() {
  const vm = useHomeState()

  return (
    <div
      className={`home-shell${vm.mode === 'dark' ? ' dark-mode' : ''}`}
      style={{ '--accent': vm.accent } as React.CSSProperties}
    >
      {vm.splash && <Splash />}

      <Sidebar vm={vm} />

      {vm.screen === 'today' && <Today vm={vm} />}
      {vm.screen === 'todos' && <Todos vm={vm} />}
      {vm.screen === 'routines' && <Routines vm={vm} />}
      {vm.screen === 'projects' && <Projects vm={vm} />}
      {vm.screen === 'projectDetail' && <ProjectDetail vm={vm} />}
      {vm.screen === 'invest' && <Investments vm={vm} />}
      {vm.screen === 'accounts' && <Accounts vm={vm} />}
      {vm.screen === 'spend' && <Spend vm={vm} />}
      {vm.screen === 'budget' && <Budget />}
      {vm.screen === 'goals' && <Goals vm={vm} />}
      {vm.screen === 'books' && <Books vm={vm} />}
      {vm.screen === 'quotes' && <Quotes vm={vm} />}
      {vm.screen === 'wishlist' && <Wishlist vm={vm} />}
      {vm.screen === 'hobbies' && <Hobbies vm={vm} />}
      {vm.screen === 'alarms' && <Alarms vm={vm} />}
      {vm.screen === 'reminders' && <Reminders vm={vm} />}
      {vm.screen === 'settings' && <Settings vm={vm} />}

      <TodoPanel vm={vm} />
      <RoutinePanel vm={vm} />
      <CreatePanel vm={vm} />
      <HobbyPanel vm={vm} />
      <ProjectPanel vm={vm} />
      <ConfirmDeleteModal vm={vm} />
    </div>
  )
}
