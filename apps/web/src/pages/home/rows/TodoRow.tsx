import type { HomeState } from '../useHomeState'

export type TodoRowModel = ReturnType<HomeState['mkRow']>

/**
 * One todo line: checkbox, title + tag/due, star, edit pencil, delete.
 *
 * Todos and Today each had their own copy of this markup — three copies in
 * total — differing only in which border the row draws and the star's tooltip.
 * The completed/completing look and the hover-revealed buttons are CSS
 * (see .hs-row in Home.css); this component only decides which classes apply.
 */
export default function TodoRow({
  td,
  topRuled = false,
}: {
  td: TodoRowModel
  /** Rule above instead of below — used by the grouped lists on Todos. */
  topRuled?: boolean
}) {
  // A ticked row in the Done tab: the checkbox is full and un-ticks it.
  const checked = td.completing || td.done

  return (
    <div
      className={`hs-row${td.completing ? ' is-completing' : ''}${
        td.done ? ' is-done' : ''
      }${topRuled ? ' is-top-ruled' : ''}`}
      style={{ animationDelay: td.index * 0.05 + 's' }}
    >
      <button
        type="button"
        className={`hs-checkbox${checked ? ' is-checked' : ''}`}
        onClick={td.toggle}
        aria-label={`${td.done ? 'Reopen' : 'Complete'} ${td.text}`}
      >
        <span className="hs-checkbox-tick">{checked ? '✓' : ''}</span>
      </button>

      <div className="hs-row-body">
        <div className="hs-row-title">{td.text}</div>
        <div className="hs-row-sub">
          <span style={{ color: td.dotColor }}>●</span> {td.tag}
          {td.due && (
            <>
              &nbsp;{' '}
              {/* Late todos stay in Today — see groupFor — so the row is the
                  only place that can say they are late. */}
              <span
                className={td.overdue ? 'hs-row-due is-overdue' : undefined}
              >
                {td.due}
                {td.overdue ? ` · ${td.overdueLabel}` : ''}
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        title={td.star ? 'Remove from Top 3' : 'Add to Top 3'}
        aria-pressed={td.star}
        className={`hs-star-btn${td.star ? ' is-on' : ''}`}
        onClick={td.starToggle}
      >
        {td.star ? '★' : '☆'}
      </button>

      <button
        type="button"
        title="Edit"
        className="hs-row-action"
        onClick={td.edit}
      >
        ✎
      </button>

      <button
        type="button"
        title="Delete"
        aria-label={`Delete ${td.text}`}
        className="hs-row-action is-danger"
        onClick={td.remove}
      >
        ✕
      </button>
    </div>
  )
}
