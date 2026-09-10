import { useState } from 'react'
import { SEED_HOBBIES, SEED_HOBBY_TRY } from '../seedData'
import type { HobbyPanelState } from '../types'

export function useHobbies() {
  const [hobbies, setHobbies] = useState(SEED_HOBBIES)
  const [hobbyTry, setHobbyTry] = useState(SEED_HOBBY_TRY)
  const [hobbyDraft, setHobbyDraft] = useState('')
  const [hPanel, setHPanelState] = useState<HobbyPanelState | null>(null)

  return {
    hobbies,
    setHobbies,
    hobbyTry,
    setHobbyTry,
    hobbyDraft,
    setHobbyDraft,
    hPanel,
    setHPanelState,
  }
}
