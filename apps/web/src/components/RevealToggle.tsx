import { useId } from 'react'

/**
 * Show/hide toggle for password fields, drawn as a sun over a horizon:
 * risen with rays when the password is visible, set below the line when hidden.
 * Straight strokes and a single accent keep it in step with the keel logo.
 */
export default function RevealToggle({
  shown,
  onToggle,
}: {
  shown: boolean
  onToggle: () => void
}) {
  // Colons from useId are valid in an id but awkward anywhere near CSS, so strip them.
  const clipId = `sun-${useId().replace(/:/g, '')}`
  const label = shown ? 'Hide password' : 'Show password'

  return (
    <button
      type="button"
      className="reveal-btn"
      onClick={onToggle}
      aria-pressed={shown}
      aria-label={label}
      title={label}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            {/* Anything below the horizon is cut away, so the sun simply sets. */}
            <rect x="0" y="0" width="20" height="13.4" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <g
            className="reveal-sun"
            style={{ transform: shown ? 'translateY(0)' : 'translateY(7px)' }}
          >
            <circle
              cx="10"
              cy="9.6"
              r="3.1"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <g
              className="reveal-rays"
              style={{ opacity: shown ? 1 : 0 }}
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            >
              <line x1="10" y1="2.5" x2="10" y2="4.1" />
              <line x1="4.5" y1="4.5" x2="5.6" y2="5.6" />
              <line x1="15.5" y1="4.5" x2="14.4" y2="5.6" />
            </g>
          </g>
        </g>

        <line
          x1="2.6"
          y1="13.4"
          x2="17.4"
          y2="13.4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
