import { ROUTINE_TYPES } from '../seedData'
import type { HomeState } from '../useHomeState'
import type { RoutinePeriod } from '../types'

const R_MIN_LABELS = ['00', '15', '30', '45']

export function TodoPanel({ vm }: { vm: HomeState }) {
  const { todoPanel, setTodoPanel, setPanel, savePanel, areaChips, cal } = vm
  if (!todoPanel) return null
  const isEdit = todoPanel.index >= 0

  return (
    <>
      <button
        type="button"
        className="hs-panel-overlay"
        onClick={() => setTodoPanel(null)}
        aria-label="Close"
      />
      <div className="hs-panel">
        <div className="hs-panel-head">
          <div className="hs-panel-title">
            {isEdit ? 'EDIT TODO' : 'NEW TODO'}
          </div>
          <button
            type="button"
            className="hs-panel-close"
            onClick={() => setTodoPanel(null)}
          >
            ✕
          </button>
        </div>
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
              <button
                key={ch.name}
                type="button"
                className="hs-chip-flat"
                style={{
                  borderColor: ch.border,
                  color: ch.color,
                  background: ch.bg,
                }}
                onClick={ch.pick}
              >
                {ch.name}
              </button>
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
              {cal.cells.map((cd, i) => (
                <button
                  key={i}
                  type="button"
                  className="hs-cal-cell"
                  onClick={cd.pick}
                  style={{
                    fontWeight: cd.weight,
                    color: cd.color,
                    background: cd.bg,
                    border: cd.ring,
                  }}
                >
                  {cd.day}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
          }}
          onClick={() => setPanel({ star: !todoPanel.star })}
        >
          <div style={{ color: 'var(--accent)', fontSize: 16 }}>
            {todoPanel.star ? '★' : '☆'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Mark as Top 3 priority
          </div>
        </button>
        <div className="hs-panel-actions">
          <button type="button" className="hs-btn-accent" onClick={savePanel}>
            {isEdit ? 'SAVE CHANGES' : 'ADD TODO'}
          </button>
          <button
            type="button"
            className="hs-btn-ghost"
            onClick={() => setTodoPanel(null)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </>
  )
}

export function RoutinePanel({ vm }: { vm: HomeState }) {
  const { rPanel, setRPanel, setRPanelState, saveRoutine, accent } = vm
  if (!rPanel) return null
  const isEdit = !!rPanel.orig

  const hourWindow = [-1, 0, 1, 2].map((off) => {
    const base = rPanel.hour
    const h = ((((base - 1 + off) % 12) + 12) % 12) + 1
    return { label: String(h), off, pick: () => setRPanel({ hour: h }) }
  })
  const minWindow = [-1, 0, 1, 2].map((off) => {
    const idx = (((rPanel.minIdx + off) % 4) + 4) % 4
    return {
      label: R_MIN_LABELS[idx],
      off,
      pick: () => setRPanel({ minIdx: idx }),
    }
  })

  return (
    <>
      <button
        type="button"
        className="hs-panel-overlay"
        onClick={() => setRPanelState(null)}
        aria-label="Close"
      />
      <div className="hs-panel">
        <div className="hs-panel-head">
          <div className="hs-panel-title">
            {isEdit ? 'EDIT ROUTINE' : 'NEW ROUTINE'}
          </div>
          <button
            type="button"
            className="hs-panel-close"
            onClick={() => setRPanelState(null)}
          >
            ✕
          </button>
        </div>
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
            {(ROUTINE_TYPES as readonly RoutinePeriod[]).map((t) => {
              const sel = rPanel.period === t
              return (
                <button
                  key={t}
                  type="button"
                  className="hs-chip"
                  style={{
                    borderColor: sel ? accent : 'var(--line)',
                    color: sel ? 'var(--paper)' : 'var(--text-2)',
                    background: sel ? accent : 'var(--input-bg)',
                  }}
                  onClick={() => setRPanel({ period: t })}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>
        <div className="hs-panel-field">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div className="hs-field-label">TIME (OPTIONAL)</div>
            {rPanel.timeSet && (
              <button
                type="button"
                style={{
                  font: '400 10px "IBM Plex Mono",monospace',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                onClick={() => setRPanel({ timeSet: false })}
              >
                ✕ remove
              </button>
            )}
          </div>
          {rPanel.timeSet ? (
            <div
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '6px 0',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 112,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 10,
                    right: 10,
                    transform: 'translateY(-50%)',
                    height: 28,
                    background: '#F3EEE3',
                    borderTop: '1px solid var(--line)',
                    borderBottom: '1px solid var(--line)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    borderRadius: 5,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontFamily: '"IBM Plex Mono",monospace',
                  }}
                >
                  {hourWindow.map((row) => (
                    <button
                      key={row.label + row.off}
                      type="button"
                      onClick={row.pick}
                      style={{
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        color: row.off === 0 ? 'var(--ink)' : 'var(--muted-2)',
                        fontWeight: row.off === 0 ? 600 : 400,
                        fontSize: row.off === 0 ? 17 : 14,
                      }}
                    >
                      {row.label}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontFamily: '"IBM Plex Mono",monospace',
                  }}
                >
                  {minWindow.map((row) => (
                    <button
                      key={row.label + row.off}
                      type="button"
                      onClick={row.pick}
                      style={{
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        color: row.off === 0 ? 'var(--ink)' : 'var(--muted-2)',
                        fontWeight: row.off === 0 ? 600 : 400,
                        fontSize: row.off === 0 ? 17 : 14,
                      }}
                    >
                      {row.label}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"IBM Plex Mono",monospace',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setRPanel({ ampm: 'AM' })}
                    style={{
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      color:
                        rPanel.ampm === 'AM' ? 'var(--ink)' : 'var(--muted-2)',
                      fontWeight: rPanel.ampm === 'AM' ? 600 : 400,
                      fontSize: rPanel.ampm === 'AM' ? 17 : 14,
                    }}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setRPanel({ ampm: 'PM' })}
                    style={{
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      color:
                        rPanel.ampm === 'PM' ? 'var(--ink)' : 'var(--muted-2)',
                      fontWeight: rPanel.ampm === 'PM' ? 600 : 400,
                      fontSize: rPanel.ampm === 'PM' ? 17 : 14,
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              style={{
                textAlign: 'center',
                font: '500 11px "IBM Plex Mono",monospace',
                letterSpacing: '.05em',
                padding: '12px 0',
                borderRadius: 8,
                border: '1px dashed var(--line)',
                color: 'var(--muted)',
                cursor: 'pointer',
                background: 'none',
              }}
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
        <div className="hs-panel-actions">
          <button type="button" className="hs-btn-accent" onClick={saveRoutine}>
            {isEdit ? 'SAVE' : 'ADD ROUTINE'}
          </button>
          <button
            type="button"
            className="hs-btn-ghost"
            onClick={() => setRPanelState(null)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </>
  )
}

export function CreatePanel({ vm }: { vm: HomeState }) {
  const { cPanel, setCPanelState, cCfg, saveC, accent } = vm
  if (!cPanel || !cCfg) return null

  return (
    <>
      <button
        type="button"
        className="hs-panel-overlay"
        onClick={() => setCPanelState(null)}
        aria-label="Close"
      />
      <div className="hs-panel">
        <div className="hs-panel-head">
          <div className="hs-panel-title">{cCfg.title}</div>
          <button
            type="button"
            className="hs-panel-close"
            onClick={() => setCPanelState(null)}
          >
            ✕
          </button>
        </div>
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
              {cCfg.chips.opts.map((o) => {
                const sel = cPanel.chip === o
                return (
                  <button
                    key={o}
                    type="button"
                    className="hs-chip"
                    style={{
                      padding: '9px 12px',
                      borderColor: sel ? accent : 'var(--line)',
                      color: sel ? 'var(--paper)' : 'var(--text-2)',
                      background: sel ? accent : 'var(--input-bg)',
                    }}
                    onClick={() =>
                      setCPanelState((p) => (p ? { ...p, chip: o } : p))
                    }
                  >
                    {o}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div className="hs-panel-actions">
          <button type="button" className="hs-btn-accent" onClick={saveC}>
            {cCfg.save}
          </button>
          <button
            type="button"
            className="hs-btn-ghost"
            onClick={() => setCPanelState(null)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </>
  )
}

export function HobbyPanel({ vm }: { vm: HomeState }) {
  const { hPanel, setHPanelState, accent } = vm
  if (!hPanel) return null
  const isActive = hPanel.status === 'ACTIVE'

  const saveHobby = () => {
    const nm = hPanel.name.trim()
    if (!nm) return
    if (hPanel.status === 'ACTIVE') {
      vm.setHobbies((s) => [
        ...s,
        {
          name: nm,
          meta:
            'STARTED TODAY' +
            (hPanel.note.trim()
              ? ' · ' + hPanel.note.trim().toUpperCase()
              : ''),
          sessions: 0,
        },
      ])
    } else {
      vm.setHobbyTry((s) => [...s, { name: nm }])
    }
    setHPanelState(null)
  }

  return (
    <>
      <button
        type="button"
        className="hs-panel-overlay"
        onClick={() => setHPanelState(null)}
        aria-label="Close"
      />
      <div className="hs-panel">
        <div className="hs-panel-head">
          <div className="hs-panel-title">NEW HOBBY</div>
          <button
            type="button"
            className="hs-panel-close"
            onClick={() => setHPanelState(null)}
          >
            ✕
          </button>
        </div>
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
            <button
              type="button"
              className="hs-chip"
              style={{
                borderColor: isActive ? accent : 'var(--line)',
                color: isActive ? 'var(--paper)' : 'var(--text-2)',
                background: isActive ? accent : 'var(--input-bg)',
              }}
              onClick={() =>
                setHPanelState((p) => (p ? { ...p, status: 'ACTIVE' } : p))
              }
            >
              START NOW
            </button>
            <button
              type="button"
              className="hs-chip"
              style={{
                borderColor: !isActive ? accent : 'var(--line)',
                color: !isActive ? 'var(--paper)' : 'var(--text-2)',
                background: !isActive ? accent : 'var(--input-bg)',
              }}
              onClick={() =>
                setHPanelState((p) => (p ? { ...p, status: 'TRY' } : p))
              }
            >
              WANT TO TRY
            </button>
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
        <div className="hs-panel-actions">
          <button type="button" className="hs-btn-accent" onClick={saveHobby}>
            ADD HOBBY
          </button>
          <button
            type="button"
            className="hs-btn-ghost"
            onClick={() => setHPanelState(null)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </>
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
    <>
      <button
        type="button"
        className="hs-panel-overlay"
        onClick={() => setProjPanelState(null)}
        aria-label="Close"
      />
      <div className="hs-panel">
        <div className="hs-panel-head">
          <div className="hs-panel-title">
            {projPanel.orig ? 'EDIT PROJECT' : 'PROJECT'}
          </div>
          <button
            type="button"
            className="hs-panel-close"
            onClick={() => setProjPanelState(null)}
          >
            ✕
          </button>
        </div>
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
            className="hs-field-input"
            style={{
              font: '400 12px "IBM Plex Mono",monospace',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
            }}
            value={projPanel.tag}
            onChange={(e) => setProjPanel({ tag: e.target.value })}
            placeholder="e.g. FINANCE"
          />
        </div>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: 'var(--accent)',
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
          }}
          onClick={() => {
            setConfirmDel({ kind: 'project', name: projPanel.orig })
            setProjPanelState(null)
          }}
        >
          <div style={{ fontSize: 13 }}>✕</div>
          <div
            style={{
              font: '500 10px "IBM Plex Mono",monospace',
              letterSpacing: '.08em',
            }}
          >
            DELETE PROJECT
          </div>
        </button>
        <div className="hs-panel-actions">
          <button type="button" className="hs-btn-accent" onClick={saveProject}>
            SAVE
          </button>
          <button
            type="button"
            className="hs-btn-ghost"
            onClick={() => setProjPanelState(null)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </>
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
