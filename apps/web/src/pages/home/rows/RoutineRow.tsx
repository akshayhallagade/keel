import type { HomeState } from '../useHomeState'

export type RoutineModel = ReturnType<HomeState['mkRoutine']>

function Box({ rt, small }: { rt: RoutineModel; small?: boolean }) {
  return (
    <button
      type="button"
      className={`hs-checkbox ${small ? 'sm' : 'lg'}${
        rt.done ? ' is-checked' : ''
      }`}
      onClick={rt.toggle}
      aria-pressed={rt.done}
      aria-label={`Mark ${rt.name} done`}
    >
      <span className="hs-checkbox-tick">{rt.done ? '✓' : ''}</span>
    </button>
  )
}

function title(rt: RoutineModel) {
  return `hs-routine-title${rt.done ? ' is-done' : ''}${
    rt.missed ? ' is-missed' : ''
  }`
}

/** The compact line in Today's rail: checkbox and name, nothing else. */
export function RoutineLine({ rt }: { rt: RoutineModel }) {
  return (
    <div className="hs-routine-line">
      <Box rt={rt} small />
      <div className={title(rt)}>
        {rt.name} {rt.missed && <span className="hs-missed">· △ MISSED</span>}
      </div>
    </div>
  )
}

/**
 * The full row on the Routines screen.
 *
 * `sub` is the only difference between the grouped and flat views — grouped
 * already has the period as its section heading, flat has to name it.
 *
 * The edit and delete buttons used to carry `opacity: rt.delOpacity`, driven
 * by a `hoverRoutine` state that neither view ever set — so they were
 * permanently invisible. They are hover- and focus-revealed by CSS now.
 */
export function RoutineRow({
  rt,
  sub,
}: {
  rt: RoutineModel
  sub: 'time' | 'period-and-time'
}) {
  return (
    <div className="hs-routine-row">
      <Box rt={rt} />

      <div className="hs-routine-body">
        <div className={title(rt)}>{rt.name}</div>
        <div className="hs-row-sub">
          {sub === 'period-and-time' && rt.period + ' · '}
          {rt.time} {rt.missed && '· △ MISSED'}
        </div>
      </div>

      <div className="hs-week-dots" aria-label="Last 7 days">
        {rt.week.map((on, i) => (
          <span key={i} className={`hs-week-dot${on ? ' is-on' : ''}`} />
        ))}
      </div>

      <div className={`hs-streak${rt.streak > 0 ? '' : ' is-zero'}`}>
        <span className="hs-streak-arrow">▲</span>
        <span className="hs-streak-value">
          {rt.streak > 0 ? rt.streak : '—'}
        </span>
      </div>

      <button
        type="button"
        title="Edit"
        className="hs-row-action"
        onClick={rt.edit}
      >
        ✎
      </button>
      <button
        type="button"
        title="Remove"
        className="hs-row-action"
        onClick={rt.del}
      >
        ✕
      </button>
    </div>
  )
}
