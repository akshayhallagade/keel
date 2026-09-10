import type { HomeState } from '../useHomeState'

export type TodoRowModel = ReturnType<HomeState['mkRow']>

/**
 * One todo line: checkbox, title + tag/due, star, edit pencil.
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
  return (
    <div
      className={`hs-row${td.completing ? ' is-completing' : ''}${
        topRuled ? ' is-top-ruled' : ''
      }`}
      style={{ animationDelay: td.index * 0.05 + 's' }}
    >
      <button
        type="button"
        className={`hs-checkbox${td.completing ? ' is-checked' : ''}`}
        onClick={td.toggle}
        aria-label={`Complete ${td.text}`}
      >
        <span className="hs-checkbox-tick">{td.completing ? '✓' : ''}</span>
      </button>

      <div className="hs-row-body">
        <div className="hs-row-title">{td.text}</div>
        <div className="hs-row-sub">
          <span style={{ color: td.dotColor }}>●</span> {td.tag} &nbsp; {td.due}
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
    </div>
  )
}
