import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DeleteAccountModal from './DeleteAccountModal'

const deleteMe = vi.hoisted(() => vi.fn())
vi.mock('../../../api/users', () => ({ deleteMe }))

const EMAIL = 'demo@keel.app'

function setup() {
  const onClose = vi.fn()
  const onDeleted = vi.fn()
  render(
    <DeleteAccountModal
      email={EMAIL}
      onClose={onClose}
      onDeleted={onDeleted}
    />,
  )
  return {
    onClose,
    onDeleted,
    user: userEvent.setup(),
    confirmButton: () => screen.getByRole('button', { name: /close account/i }),
    input: () => screen.getByLabelText(/type your email/i),
  }
}

beforeEach(() => {
  deleteMe.mockReset()
  deleteMe.mockResolvedValue(null)
})

describe('DeleteAccountModal', () => {
  // The whole reason this dialog exists: closing an account has no undo in
  // front of the user, so it must not be possible by reflex.
  it('cannot be confirmed until the email is typed', async () => {
    const { confirmButton, onDeleted } = setup()

    expect(confirmButton()).toBeDisabled()
    expect(deleteMe).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('stays disabled for the wrong address', async () => {
    const { user, input, confirmButton } = setup()

    await user.type(input(), 'someone@else.app')

    expect(confirmButton()).toBeDisabled()
  })

  it('enables once the address matches', async () => {
    const { user, input, confirmButton } = setup()

    await user.type(input(), EMAIL)

    expect(confirmButton()).toBeEnabled()
  })

  // The address is already case-insensitively unique in the database, so being
  // stricter here would be a puzzle rather than a safeguard.
  it('accepts a different case and surrounding space', async () => {
    const { user, input, confirmButton } = setup()

    await user.type(input(), '  DEMO@Keel.App  ')

    expect(confirmButton()).toBeEnabled()
  })

  it('calls the API and hands back when confirmed', async () => {
    const { user, input, confirmButton, onDeleted } = setup()

    await user.type(input(), EMAIL)
    await user.click(confirmButton())

    expect(deleteMe).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it('reports a failure and does not sign the user out', async () => {
    deleteMe.mockRejectedValue(new Error('offline'))
    const { user, input, confirmButton, onDeleted } = setup()

    await user.type(input(), EMAIL)
    await user.click(confirmButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    // Still signed in, still on the screen — the account was not closed.
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('closes without deleting when cancelled', async () => {
    const { user, onClose, onDeleted } = setup()

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(deleteMe).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })
})
