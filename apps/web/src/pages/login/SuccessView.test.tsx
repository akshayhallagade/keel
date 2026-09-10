import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import SuccessView from './SuccessView'

/// Make matchMedia answer "yes" to prefers-reduced-motion for one test.
function withReducedMotion() {
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('SuccessView', () => {
  it('names the returning user and the new one differently', () => {
    const { rerender } = render(
      <SuccessView isReturning onContinue={() => {}} />,
    )
    expect(screen.getByText('You’re in')).toBeInTheDocument()

    rerender(<SuccessView isReturning={false} onContinue={() => {}} />)
    expect(screen.getByText('Account created')).toBeInTheDocument()
  })

  // The CTA used to be a <div role="button"> with only an onClick, so it was
  // unreachable from the keyboard. As a real button, Enter activates it.
  it('continues when the CTA is triggered by keyboard', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    render(<SuccessView isReturning onContinue={onContinue} />)

    const cta = screen.getByRole('button', { name: /continue/i })
    cta.focus()
    await user.keyboard('{Enter}')

    expect(onContinue).toHaveBeenCalled()
  })

  // The progress bar is not decoration — filling it is what carries the user
  // into the app. Without motion there is no tween to finish, so a timer has to
  // stand in, or signing in dead-ends on this screen.
  it('still auto-continues when motion is reduced', () => {
    const restore = withReducedMotion()
    vi.useFakeTimers()
    const onContinue = vi.fn()

    try {
      render(<SuccessView isReturning onContinue={onContinue} />)

      // Still on screen partway through: the pause before handing off is the
      // point of the bar, so it must not collapse to an instant redirect.
      vi.advanceTimersByTime(2000)
      expect(onContinue).not.toHaveBeenCalled()

      // 0.5s delay + 2.4s fill.
      vi.advanceTimersByTime(900)
      expect(onContinue).toHaveBeenCalledTimes(1)
    } finally {
      restore()
    }
  })

  it('does not fire the auto-continue after unmounting', () => {
    const restore = withReducedMotion()
    vi.useFakeTimers()
    const onContinue = vi.fn()

    try {
      const { unmount } = render(
        <SuccessView isReturning onContinue={onContinue} />,
      )
      unmount()
      vi.advanceTimersByTime(5000)

      expect(onContinue).not.toHaveBeenCalled()
    } finally {
      restore()
    }
  })
})
