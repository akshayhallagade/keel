import { ROUTINE_TYPES } from '../seedData'
import type { HomeState } from '../useHomeState'
import type { RoutinePeriod } from '../types'
import Chip from '../../../components/Chip'
import Panel from './Panel'

const R_MIN_LABELS = ['00', '15', '30', '45']

/** One column of the routine time wheel. */
function WheelColumn({
  rows,
}: {
  rows: { label: string; active: boolean; pick: () => void }[]
}) {
  return (
    <div className="hs-wheel-col">
      {rows.map((row, i) => (
        <button
          key={row.label + i}
          type="button"
          onClick={row.pick}
          className={`hs-wheel-item${row.active ? ' is-active' : ''}`}
        >
          {row.label}
        </button>
      ))}
    </div>
  )
}

export function TodoPanel({ vm }: { vm: HomeState }) {
  const { todoPanel, setTodoPanel, setPanel, savePanel, areaChips, cal } = vm
  if (!todoPanel) return null
  const isEdit = todoPanel.id !== null
  const close = () => setTodoPanel(null)

  return (
    <Panel
      title={isEdit ? 'EDIT TODO' : 'NEW TODO'}
      saveLabel={isEdit ? 'SAVE CHANGES' : 'ADD TODO'}
      onSave={savePanel}
      onClose={close}
    >
      <div className="hs-panel-field">
        <div className="hs-field-label">TITLE</div>
        <input
          className="hs-field-input"
          value={todoPanel.text}
          onChange={(e) => setPanel({ text: e.target.value })}
          placeholder="What needs doing?"
        />
      </div>
      <div className="hs-panel-field">
        <div className="hs-field-label">AREA</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {areaChips.map((ch) => (
            <Chip
              key={ch.name}
              flat
              label={ch.name}
              selected={ch.selected}
              onClick={ch.pick}
            />
          ))}
        </div>
      </div>
      <div className="hs-panel-field">
        <div className="hs-field-label">DUE</div>
        <div className="hs-cal">
          <div className="hs-cal-head">
            <button type="button" className="hs-cal-nav" onClick={cal.prev}>
              ‹
            </button>
            <div className="hs-cal-label">{cal.label}</div>
            <button type="button" className="hs-cal-nav" onClick={cal.next}>
              ›
            </button>
          </div>
          <div className="hs-cal-grid" style={{ marginBottom: 5 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="hs-cal-dow">
                {d}
              </div>
            ))}
          </div>
          <div className="hs-cal-grid">
            {cal.cells.map((cd, i) =>
              cd.day ? (
                <button
                  key={i}
                  type="button"
                  className={`hs-cal-cell${cd.selected ? ' is-selected' : ''}${
                    cd.isToday ? ' is-today' : ''
                  }`}
                  onClick={cd.pick}
                >
                  {cd.day}
                </button>
              ) : (
                <div key={i} className="hs-cal-cell" />
              ),
            )}
          </div>
        </div>
      </div>
      <div className="hs-panel-field">
        <div className="hs-field-label">TIME</div>
        {/* The native picker, not a custom one: it already knows the user's
            12/24-hour preference and works from the keyboard. Blank means the
            todo is due that day at no particular time. */}
        <input
          type="time"
          className="hs-field-input"
          value={todoPanel.time}
          disabled={!todoPanel.day}
          onChange={(e) => setPanel({ time: e.target.value })}
        />
      </div>
      <button
        type="button"
        className="hs-star-toggle"
        aria-pressed={todoPanel.starred}
        onClick={() => setPanel({ starred: !todoPanel.starred })}
      >
        <span className="hs-star">{todoPanel.starred ? '★' : '☆'}</span>
        <span>Mark as Top 3 priority</span>
      </button>
    </Panel>
  )
}

export function RoutinePanel({ vm }: { vm: HomeState }) {
  const { rPanel, setRPanel, setRPanelState, saveRoutine } = vm
  if (!rPanel) return null
  const isEdit = !!rPanel.orig
  const close = () => setRPanelState(null)

  const hourRows = [-1, 0, 1, 2].map((off) => {
    const h = ((((rPanel.hour - 1 + off) % 12) + 12) % 12) + 1
    return {
      label: String(h),
      active: off === 0,
      pick: () => setRPanel({ hour: h }),
    }
  })
  const minRows = [-1, 0, 1, 2].map((off) => {
    const idx = (((rPanel.minIdx + off) % 4) + 4) % 4
    return {
      label: R_MIN_LABELS[idx],
      active: off === 0,
      pick: () => setRPanel({ minIdx: idx }),
    }
  })
  const ampmRows = (['AM', 'PM'] as const).map((v) => ({
    label: v,
    active: rPanel.ampm === v,
    pick: () => setRPanel({ ampm: v }),
  }))

  return (
    <Panel
      title={isEdit ? 'EDIT ROUTINE' : 'NEW ROUTINE'}
      saveLabel={isEdit ? 'SAVE' : 'ADD ROUTINE'}
      onSave={saveRoutine}
      onClose={close}
    >
      <div className="hs-panel-field">
        <div className="hs-field-label">ROUTINE</div>
        <input
          className="hs-field-input"
          value={rPanel.name}
          onChange={(e) => setRPanel({ name: e.target.value })}
          placeholder="e.g. Stretch 5 min"
        />
      </div>
      <div className="hs-panel-field">
        <div className="hs-field-label">TYPE</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 7,
          }}
        >
          {(ROUTINE_TYPES as readonly RoutinePeriod[]).map((t) => (
            <Chip
              key={t}
              label={t}
              selected={rPanel.period === t}
              onClick={() => setRPanel({ period: t })}
            />
          ))}
        </div>
      </div>
      <div className="hs-panel-field">
        <div className="hs-row-between">
          <div className="hs-field-label">TIME (OPTIONAL)</div>
          {rPanel.timeSet && (
            <button
              type="button"
              className="hs-link-mono"
              onClick={() => setRPanel({ timeSet: false })}
            >
              ✕ remove
            </button>
          )}
        </div>
        {rPanel.timeSet ? (
          <div className="hs-wheel">
            <div className="hs-wheel-rows">
              <div className="hs-wheel-band" />
              <WheelColumn rows={hourRows} />
              <WheelColumn rows={minRows} />
              <WheelColumn rows={ampmRows} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="hs-add-dashed"
            onClick={() =>
              setRPanel({
                timeSet: true,
                hour: rPanel.hour || (rPanel.period === 'EVENING' ? 8 : 7),
                minIdx: rPanel.minIdx ?? 0,
                ampm:
                  rPanel.ampm || (rPanel.period === 'EVENING' ? 'PM' : 'AM'),
              })
            }
          >
            + ADD A TIME
          </button>
        )}
      </div>
    </Panel>
  )
}

export function CreatePanel({ vm }: { vm: HomeState }) {
  const { cPanel, setCPanelState, cCfg, saveC } = vm
  if (!cPanel || !cCfg) return null

  return (
    <Panel
      title={cCfg.title}
      saveLabel={cCfg.save}
      onSave={saveC}
      onClose={() => setCPanelState(null)}
    >
      {cCfg.fields.map(([k, label, ph]) => (
        <div key={k} className="hs-panel-field">
          <div className="hs-field-label">{label}</div>
          <input
            className="hs-field-input"
            value={cPanel.vals[k] || ''}
            onChange={(e) =>
              setCPanelState((p) =>
                p ? { ...p, vals: { ...p.vals, [k]: e.target.value } } : p,
              )
            }
            placeholder={ph}
          />
        </div>
      ))}
      {cCfg.chips && (
        <div className="hs-panel-field">
          <div className="hs-field-label">{cCfg.chips.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {cCfg.chips.opts.map((o) => (
              <Chip
                key={o}
                label={o}
                selected={cPanel.chip === o}
                style={{ padding: '9px 12px' }}
                onClick={() =>
                  setCPanelState((p) => (p ? { ...p, chip: o } : p))
                }
              />
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}

export function HobbyPanel({ vm }: { vm: HomeState }) {
  const { hPanel, setHPanelState } = vm
  if (!hPanel) return null
  const isActive = hPanel.status === 'ACTIVE'

  const saveHobby = () => {
    const nm = hPanel.name.trim()
    if (!nm) return
    if (isActive) {
      const note = hPanel.note.trim()
      vm.setHobbies((s) => [
        ...s,
        {
          name: nm,
          meta: 'STARTED TODAY' + (note ? ' · ' + note.toUpperCase() : ''),
          sessions: 0,
        },
      ])
    } else {
      vm.setHobbyTry((s) => [...s, { name: nm }])
    }
    setHPanelState(null)
  }

  return (
    <Panel
      title="NEW HOBBY"
      saveLabel="ADD HOBBY"
      onSave={saveHobby}
      onClose={() => setHPanelState(null)}
    >
      <div className="hs-panel-field">
        <div className="hs-field-label">HOBBY</div>
        <input
          className="hs-field-input"
          value={hPanel.name}
          onChange={(e) =>
            setHPanelState((p) => (p ? { ...p, name: e.target.value } : p))
          }
          placeholder="e.g. Pottery"
        />
      </div>
      <div className="hs-panel-field">
        <div className="hs-field-label">WHERE DOES IT START?</div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}
        >
          <Chip
            label="START NOW"
            selected={isActive}
            onClick={() =>
              setHPanelState((p) => (p ? { ...p, status: 'ACTIVE' } : p))
            }
          />
          <Chip
            label="WANT TO TRY"
            selected={!isActive}
            onClick={() =>
              setHPanelState((p) => (p ? { ...p, status: 'TRY' } : p))
            }
          />
        </div>
        <div className="hs-meta-sm" style={{ lineHeight: 1.5 }}>
          {isActive
            ? 'Goes under Active — log sessions as you go.'
            : 'Parks it under Want to try — start it any time.'}
        </div>
      </div>
      {isActive && (
        <div className="hs-panel-field">
          <div className="hs-field-label">FIRST NOTE (OPTIONAL)</div>
          <input
            className="hs-field-input"
            value={hPanel.note}
            onChange={(e) =>
              setHPanelState((p) => (p ? { ...p, note: e.target.value } : p))
            }
            placeholder="e.g. Bought a starter kit"
          />
        </div>
      )}
    </Panel>
  )
}

export function ProjectPanel({ vm }: { vm: HomeState }) {
  const {
    projPanel,
    setProjPanel,
    setProjPanelState,
    saveProject,
    setConfirmDel,
  } = vm
  if (!projPanel) return null

  return (
    <Panel
      title={projPanel.orig ? 'EDIT PROJECT' : 'PROJECT'}
      saveLabel="SAVE"
      onSave={saveProject}
      onClose={() => setProjPanelState(null)}
    >
      <div className="hs-panel-field">
        <div className="hs-field-label">PROJECT NAME</div>
        <input
          className="hs-field-input"
          value={projPanel.name}
          onChange={(e) => setProjPanel({ name: e.target.value })}
          placeholder="Project name"
        />
      </div>
      <div className="hs-panel-field">
        <div className="hs-field-label">LABEL</div>
        <input
          className="hs-field-input is-mono"
          value={projPanel.tag}
          onChange={(e) => setProjPanel({ tag: e.target.value })}
          placeholder="e.g. FINANCE"
        />
      </div>
      <button
        type="button"
        className="hs-link-mono is-danger"
        onClick={() => {
          setConfirmDel({ kind: 'project', name: projPanel.orig })
          setProjPanelState(null)
        }}
      >
        <span style={{ fontSize: 13 }}>✕</span>
        <span>DELETE PROJECT</span>
      </button>
    </Panel>
  )
}

export function ConfirmDeleteModal({ vm }: { vm: HomeState }) {
  const { confirmDel, setConfirmDel, doDelete } = vm
  if (!confirmDel) return null
  const msg =
    confirmDel.kind === 'project'
      ? 'This project and all of its tasks will be removed. This can’t be undone.'
      : 'This routine and its streak history will be removed. This can’t be undone.'

  return (
    <button
      type="button"
      className="hs-confirm-backdrop"
      onClick={() => setConfirmDel(null)}
      aria-label="Close"
    >
      <div className="hs-confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="hs-confirm-title">Delete “{confirmDel.name}”?</div>
        <div className="hs-confirm-msg">{msg}</div>
        <div className="hs-confirm-actions">
          <button type="button" className="hs-btn-accent" onClick={doDelete}>
            DELETE
          </button>
          <button
            type="button"
            className="hs-btn-ghost"
            onClick={() => setConfirmDel(null)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </button>
  )
}
