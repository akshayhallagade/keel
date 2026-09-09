import { useEffect, useState } from 'react'
import type { User } from '@keel/types'
import { getAccessToken, clearAccessToken } from './api/client'
import { getMe } from './api/users'
import { logout } from './api/auth'
import Login from './pages/login/Login'
import Onboarding from './pages/onboarding/Onboarding'
import Home from './pages/home/Home'

function App() {
  const [user, setUser] = useState<User | null>(null)
  // Only block the first paint when there is actually a token worth checking.
  const [restoring, setRestoring] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    if (!getAccessToken()) return
    getMe()
      .then(setUser)
      .catch(() => {
        // Expired, revoked, or issued before a password change — treat as signed out.
        clearAccessToken()
      })
      .finally(() => setRestoring(false))
  }, [])

  if (restoring) return null

  if (!user) return <Login onAuthenticated={setUser} />

  // The server decides when onboarding is done, so a refresh mid-onboarding
  // returns to the questions instead of skipping them.
  if (!user.onboardedAt) return <Onboarding onComplete={setUser} />

  const signOut = () => {
    logout()
    setUser(null)
  }

  return <Home user={user} onSignOut={signOut} />
}

export default App
