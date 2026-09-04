import { useState } from 'react'
import Login from './pages/login/Login'
import Onboarding from './pages/onboarding/Onboarding'
import Home from './pages/home/Home'

type Screen = 'login' | 'onboarding' | 'home'

function App() {
  const [screen, setScreen] = useState<Screen>('login')

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('home')} />
  }

  if (screen === 'home') {
    return <Home />
  }

  return <Login onAuthenticated={() => setScreen('onboarding')} />
}

export default App
