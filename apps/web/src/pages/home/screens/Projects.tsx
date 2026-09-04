import type { HomeState } from '../useHomeState'

export default function Projects({ vm }: { vm: HomeState }) {
  const {
    activeProjects,
    pausedProjects,
    pinnedProjects,
    unpinnedActive,
    projectDraft,
    setProjectDraft,
    addProject,
  } = vm

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 24 }}>
        <div className="hs-title">Projects</div>
        <div className="hs-meta-sm">
          {activeProjects.length} ACTIVE · {pausedProjects.length} PAUSED
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridAutoFlow: 'dense',
          gap: 16,
        }}
      >
        {pinnedProjects.map((pp) => (
          <div
            key={pp.name}
            style={{
              gridRow: 'span 2',
              border: '1px solid var(--line)',
              background: 'var(--input-bg)',
              borderRadius: 8,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div className="hs-image-slot">Photo</div>
            <div
              style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    font: '500 8px "IBM Plex Mono",monospace',
                    letterSpacing: '.12em',
                    color: 'var(--accent)',
                  }}
                >
                  {pp.tag} · PINNED
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flex: 'none',
                  }}
                >
                  <button
                    type="button"
                    className="hs-row-action"
                    style={{ fontSize: 8, letterSpacing: '.08em' }}
                    onClick={pp.togglePin}
                  >
                    UNPIN
                  </button>
                  <button
                    type="button"
                    className="hs-row-action"
                    style={{ fontSize: 8, letterSpacing: '.08em' }}
                    onClick={pp.edit}
                  >
                    EDIT
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>
                {pp.name}
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--line-soft)',
                  marginTop: 12,
                  paddingTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  className="hs-checkbox"
                  style={{
                    borderColor: pp.nextBoxBorder,
                    background: pp.nextBoxBg,
                  }}
                  onClick={pp.completeNext}
                >
                  {pp.nextCheck}
                </button>
                <div
                  style={{
                    fontSize: 13,
                    color: pp.nextColor,
                    textDecoration: pp.nextDeco,
                  }}
                >
                  {pp.nextLabel}
                </div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    font: '500 10px "IBM Plex Mono",monospace',
                    color: 'var(--text-2)',
                    marginBottom: 6,
                  }}
                >
                  <span>
                    {pp.done}/{pp.total} TASKS
                  </span>
                  <span>{pp.pctNum}</span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'var(--track)',
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: pp.pct,
                      height: '100%',
                      background: 'var(--accent)',
                      borderRadius: 2,
                      transition: 'width .5s cubic-bezier(.22,1,.36,1)',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      font: '500 9px "IBM Plex Mono",monospace',
                      letterSpacing: '.08em',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                    }}
                    onClick={pp.view}
                  >
                    ALL TASKS ({pp.openCount} OPEN) →
                  </button>
                  <button
                    type="button"
                    title="Show next tasks"
                    className="hs-row-action"
                    onClick={pp.toggleExpand}
                  >
                    {pp.chevron}
                  </button>
                </div>
                {pp.expanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--line-soft)',
                      marginTop: 10,
                      paddingTop: 4,
                    }}
                  >
                    {pp.openTasks.map((ot) => (
                      <div
                        key={ot.text}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '6px 0',
                        }}
                      >
                        <button
                          type="button"
                          onClick={ot.toggle}
                          style={{
                            width: 13,
                            height: 13,
                            border: '1.5px solid var(--check-border)',
                            borderRadius: 3,
                            flex: 'none',
                            cursor: 'pointer',
                            background: 'none',
                          }}
                        />
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                          {ot.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {unpinnedActive.map((pj) => (
          <div
            key={pj.name}
            style={{
              border: '1px solid var(--line)',
              background: 'var(--input-bg)',
              borderRadius: 8,
              padding: '16px 18px',
              minWidth: 0,
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  font: '500 8px "IBM Plex Mono",monospace',
                  letterSpacing: '.12em',
                  color: 'var(--accent)',
                }}
              >
                {pj.tag}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="hs-row-action"
                  style={{ fontSize: 8, letterSpacing: '.08em' }}
                  onClick={pj.togglePin}
                >
                  {pj.pinLabel}
                </button>
                <button
                  type="button"
                  className="hs-row-action"
                  style={{ fontSize: 8, letterSpacing: '.08em' }}
                  onClick={pj.edit}
                >
                  EDIT
                </button>
                <button
                  type="button"
                  className="hs-row-action"
                  style={{ fontSize: 8, letterSpacing: '.08em' }}
                  onClick={pj.del}
                >
                  DELETE
                </button>
                <button
                  type="button"
                  className="hs-row-action"
                  style={{ fontSize: 8, letterSpacing: '.08em' }}
                  onClick={pj.togglePause}
                >
                  {pj.pauseLabel}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 7 }}>
              {pj.name}
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                margin: '12px 0 6px',
              }}
            >
              <div
                style={{
                  width: pj.pct,
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 2,
                  transition: 'width .5s cubic-bezier(.22,1,.36,1)',
                }}
              />
            </div>
            <div className="hs-meta-sm">{pj.meta}</div>
            <div
              style={{
                borderTop: '1px solid var(--line-soft)',
                marginTop: 12,
                paddingTop: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <button
                  type="button"
                  className="hs-checkbox"
                  style={{
                    borderColor: pj.nextBoxBorder,
                    background: pj.nextBoxBg,
                  }}
                  onClick={pj.completeNext}
                >
                  {pj.nextCheck}
                </button>
                <div
                  style={{
                    fontSize: 13,
                    color: pj.nextColor,
                    textDecoration: pj.nextDeco,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pj.nextLabel}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: 'none',
                }}
              >
                <button
                  type="button"
                  style={{
                    font: '500 9px "IBM Plex Mono",monospace',
                    letterSpacing: '.08em',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                  onClick={pj.view}
                >
                  ALL →
                </button>
                <button
                  type="button"
                  title="Show next tasks"
                  className="hs-row-action"
                  onClick={pj.toggleExpand}
                >
                  {pj.chevron}
                </button>
              </div>
            </div>
            {pj.expanded && (
              <div
                style={{
                  borderTop: '1px solid var(--line-soft)',
                  marginTop: 10,
                  paddingTop: 4,
                }}
              >
                {pj.openTasks.map((ot) => (
                  <div
                    key={ot.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '6px 0',
                    }}
                  >
                    <button
                      type="button"
                      onClick={ot.toggle}
                      style={{
                        width: 13,
                        height: 13,
                        border: '1.5px solid var(--check-border)',
                        borderRadius: 3,
                        flex: 'none',
                        cursor: 'pointer',
                        background: 'none',
                      }}
                    />
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                      {ot.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hs-add-row">
        <div className="hs-add-plus" style={{ fontSize: 14 }}>
          +
        </div>
        <input
          className="hs-add-input"
          value={projectDraft}
          onChange={(e) => setProjectDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addProject()
          }}
          placeholder="Start a project — press Enter"
        />
        <button type="button" className="hs-add-details" onClick={addProject}>
          + ADD
        </button>
      </div>

      {pausedProjects.length > 0 && (
        <>
          <div className="hs-section-label" style={{ margin: '26px 0 8px' }}>
            PAUSED
          </div>
          {pausedProjects.map((pj) => (
            <div
              key={pj.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ fontSize: 14, color: 'var(--text-3)' }}>
                {pj.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="hs-meta-sm">{pj.meta}</div>
                <button
                  type="button"
                  style={{
                    font: '500 9px "IBM Plex Mono",monospace',
                    letterSpacing: '.08em',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                  onClick={pj.togglePause}
                >
                  RESUME
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export function ProjectDetail({ vm }: { vm: HomeState }) {
  const {
    projects,
    openProject,
    setScreen,
    setOpenProject,
    projTaskDraft,
    setProjTaskDraft,
    setProjects,
  } = vm
  const project = projects.find((x) => x.name === openProject)
  if (!project) return null

  const total = project.tasks.length
  const doneN = project.tasks.filter((t) => t.done).length
  const pct = (total ? Math.round((doneN / total) * 100) : 0) + '%'

  const onTaskKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const txt = projTaskDraft.trim()
    if (!txt) return
    setProjects((s) =>
      s.map((x) =>
        x.name === project.name
          ? { ...x, tasks: [...x.tasks, { text: txt, done: false }] }
          : x,
      ),
    )
    setProjTaskDraft('')
  }

  return (
    <div className="hs-screen">
      <div style={{ maxWidth: 640 }}>
        <button
          type="button"
          style={{
            font: '500 10px "IBM Plex Mono",monospace',
            letterSpacing: '.1em',
            color: 'var(--muted)',
            cursor: 'pointer',
            marginBottom: 18,
            background: 'none',
            border: 'none',
          }}
          onClick={() => {
            setScreen('projects')
            setOpenProject(null)
          }}
        >
          ← PROJECTS
        </button>
        <div
          style={{
            font: '500 9px "IBM Plex Mono",monospace',
            letterSpacing: '.14em',
            color: 'var(--accent)',
          }}
        >
          {project.tag}
        </div>
        <div
          className="hs-newsreader"
          style={{
            fontSize: 30,
            fontWeight: 500,
            marginTop: 8,
            lineHeight: 1.15,
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            height: 4,
            background: 'var(--track)',
            borderRadius: 2,
            margin: '18px 0 6px',
          }}
        >
          <div
            style={{
              width: pct,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 2,
              transition: 'width .5s cubic-bezier(.22,1,.36,1)',
            }}
          />
        </div>
        <div className="hs-meta-sm">
          {doneN} OF {total} TASKS DONE · {pct}
        </div>
        <div className="hs-section-label" style={{ margin: '30px 0 2px' }}>
          TASKS
        </div>
        {project.tasks.map((t, i) => (
          <div
            key={t.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '13px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <button
              type="button"
              className="hs-checkbox"
              style={{
                width: 16,
                height: 16,
                borderColor: t.done ? 'var(--ink)' : 'var(--check-border)',
                background: t.done ? 'var(--ink)' : 'transparent',
              }}
              onClick={() =>
                setProjects((s) =>
                  s.map((x) =>
                    x.name === project.name
                      ? {
                          ...x,
                          tasks: x.tasks.map((tt, ii) =>
                            ii === i ? { ...tt, done: !tt.done } : tt,
                          ),
                        }
                      : x,
                  ),
                )
              }
            >
              {t.done ? '✓' : ''}
            </button>
            <div
              style={{
                fontSize: 14,
                color: t.done ? 'var(--muted)' : 'var(--ink)',
                textDecoration: t.done ? 'line-through' : 'none',
              }}
            >
              {t.text}
            </div>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: '1.5px dashed var(--muted-2)',
              borderRadius: 3,
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              fontSize: 11,
            }}
          >
            +
          </div>
          <input
            className="hs-add-input"
            value={projTaskDraft}
            onChange={(e) => setProjTaskDraft(e.target.value)}
            onKeyDown={onTaskKey}
            placeholder="Add a task — press Enter"
          />
        </div>
      </div>
    </div>
  )
}
