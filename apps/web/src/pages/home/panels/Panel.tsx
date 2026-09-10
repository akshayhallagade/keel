import type { ReactNode } from 'react'

/**
 * The slide-in panel shell: dimmed overlay, title bar with a close ✕, body, and
 * the save/cancel row pinned to the bottom.
 *
 * All five panels had their own copy of this. They agreed on everything except
 * the title and the save label, so those are the only two things that vary.
 */
export default function Panel({
  title,
  saveLabel,
  onSave,
  onClose,
  children,
}: {
  title: string
  saveLabel: string
  onSave: () => void
  onClose: () => void
  children: ReactNode
}) {
  return (
    <>
      <button
        type="button"
        className="hs-panel-overlay"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="hs-panel">
        <div className="hs-panel-head">
          <div className="hs-panel-title">{title}</div>
          <button type="button" className="hs-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
        <div className="hs-panel-actions">
          <button type="button" className="hs-btn-accent" onClick={onSave}>
            {saveLabel}
          </button>
          <button type="button" className="hs-btn-ghost" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </>
  )
}
