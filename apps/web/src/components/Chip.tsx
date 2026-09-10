/**
 * A pick-one chip.
 *
 * The selected look used to be three inline style properties recomputed in
 * seven different places, each threading the runtime `accent` colour down as a
 * prop. `--accent` is already a CSS variable on `.home-shell`, so the selected
 * state is just a class and CSS reads the user's colour on its own.
 */
export default function Chip({
  label,
  selected,
  onClick,
  flat,
  className = '',
  style,
}: {
  label: string
  selected: boolean
  onClick: () => void
  /** The squatter variant used in settings and the todo area picker. */
  flat?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${flat ? 'hs-chip-flat' : 'hs-chip'}${
        selected ? ' is-selected' : ''
      }${className ? ' ' + className : ''}`}
      style={style}
    >
      {label}
    </button>
  )
}
