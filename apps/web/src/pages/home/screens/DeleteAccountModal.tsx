import { useState } from 'react'
import { deleteMe } from '../../../api/users'
import { ApiError } from '../../../api/client'

/**
 * Confirmation for closing an account.
 *
 * Typing the address is the point: this is the one action in the app with no
 * undo button in front of the user, so it asks for something that cannot be
 * done by reflex. A plain "are you sure?" is dismissed without reading.
 *
 * The data is soft-deleted server-side and recoverable by hand, but nothing in
 * the interface offers that, so it is treated here as permanent.
 */
export default function DeleteAccountModal({
  email,
  onClose,
  onDeleted,
}: {
  email: string
  onClose: () => void
  onDeleted: () => void
}) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Compared case-insensitively and trimmed: the address is already unique
  // that way in the database, so being stricter here would only be a puzzle.
  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase()

  const confirm = () => {
    if (!matches || busy) return
    setBusy(true)
    setError('')
    deleteMe()
      .then(onDeleted)
      .catch((err) => {
        setBusy(false)
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not close your account. Check your connection.',
        )
      })
  }

  return (
    <button
      type="button"
      className="hs-confirm-backdrop"
      onClick={onClose}
      aria-label="Close"
    >
      <div
        className="hs-confirm-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
      >
        <div className="hs-confirm-title" id="delete-account-title">
          Close your account?
        </div>
        <div className="hs-confirm-msg">
          This closes <strong>{email}</strong> and everything in it — todos,
          routines, projects, the lot. You will be signed out immediately.
        </div>

        <div className="hs-panel-field" style={{ marginTop: 16 }}>
          <label className="hs-field-label" htmlFor="confirm-email">
            TYPE YOUR EMAIL TO CONFIRM
          </label>
          <input
            id="confirm-email"
            className="hs-field-input is-mono-plain"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            autoComplete="off"
            autoFocus
          />
        </div>

        {error && (
          <div role="alert" className="hs-save-error" style={{ marginTop: 14 }}>
            {error}
          </div>
        )}

        <div className="hs-confirm-actions">
          <button
            type="button"
            className="hs-btn-accent"
            onClick={confirm}
            disabled={!matches || busy}
          >
            {busy ? 'CLOSING…' : 'CLOSE ACCOUNT'}
          </button>
          <button type="button" className="hs-btn-ghost" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </button>
  )
}
