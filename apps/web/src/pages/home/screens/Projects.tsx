import type { HomeState } from '../useHomeState'
import type { ProjectTask } from '../types'

type ProjectModel = HomeState['activeProjects'][number]
type PinnedModel = HomeState['pinnedProjects'][number]

/**
 * "Next: <task>" with a checkbox that ticks it off. When every task is done it
 * reads as complete instead. Both card layouts show this; `truncate` is the
 * only thing that differs between them.
 */
function NextTask({
  p,
  truncate,
}: {
  p: Pick<ProjectModel, 'allDone' | 'completeNext' | 'nextLabel'>
  truncate?: boolean
}) {
  return (
    <>
      <button
        type="button"
        className={`hs-checkbox${p.allDone ? ' is-checked' : ''}`}
        onClick={p.completeNext}
        aria-label="Complete the next task"
      >
        {p.allDone ? '✓' : ''}
      </button>
      <div
        className={`hs-next-task${p.allDone ? ' is-done' : ''}${
          truncate ? ' is-truncated' : ''
        }`}
      >
        {p.nextLabel}
      </div>
    </>
  )
}

/// The small caps actions in a card's top-right corner.
function CardActions({ actions }: { actions: [string, () => void][] }) {
  return (
    <div className="hs-card-actions">
      {actions.map(([label, onClick]) => (
        <button
          key={label}
          type="button"
          className="hs-row-action is-tiny"
          onClick={onClick}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/// The open-tasks list a card reveals when its chevron is clicked.
function OpenTasks({ p }: { p: ProjectModel }) {
  if (!p.expanded) return null
  return (
    <div className="hs-open-tasks">
      {p.openTasks.map((ot) => (
        <div key={ot.text} className="hs-open-task">
          <button
            type="button"
            className="hs-mini-box"
            onClick={ot.toggle}
            aria-label={`Complete ${ot.text}`}
          />
          <div className="hs-open-task-text">{ot.text}</div>
        </div>
      ))}
    </div>
  )
}

function ExpandButton({ p }: { p: ProjectModel }) {
  return (
    <button
      type="button"
      title="Show next tasks"
      aria-expanded={p.expanded}
      className="hs-row-action"
      onClick={p.toggleExpand}
    >
      {p.expanded ? '▴' : '▾'}
    </button>
  )
}

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

      <div className="hs-project-grid">
        {pinnedProjects.map((pp: PinnedModel) => (
          <div key={pp.name} className="hs-project-card is-pinned">
            <div className="hs-image-slot">Photo</div>
            <div className="hs-project-card-body">
              <div className="hs-project-head">
                <div className="hs-project-tag">{pp.tag} · PINNED</div>
                <CardActions
                  actions={[
                    ['UNPIN', pp.togglePin],
                    ['EDIT', pp.edit],
                  ]}
                />
              </div>

              <div className="hs-project-name is-large">{pp.name}</div>

              <div className="hs-project-next">
                <NextTask p={pp} />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 14 }}>
                <div className="hs-project-counts">
                  <span>
                    {pp.done}/{pp.total} TASKS
                  </span>
                  <span>{pp.pctNum}</span>
                </div>
                <div className="hs-bar-track sm">
                  <div
                    className="hs-bar-fill is-eased"
                    style={{ width: pp.pct }}
                  />
                </div>
                <div className="hs-project-foot">
                  <button
                    type="button"
                    className="hs-project-cta"
                    onClick={pp.view}
                  >
                    ALL TASKS ({pp.openCount} OPEN) →
                  </button>
                  <ExpandButton p={pp} />
                </div>
                <OpenTasks p={pp} />
              </div>
            </div>
          </div>
        ))}

        {unpinnedActive.map((pj) => (
          <div key={pj.name} className="hs-project-card">
            <div className="hs-project-head is-wrapped">
              <div className="hs-project-tag">{pj.tag}</div>
              <CardActions
                actions={[
                  [pj.pinLabel, pj.togglePin],
                  ['EDIT', pj.edit],
                  ['DELETE', pj.del],
                  [pj.pauseLabel, pj.togglePause],
                ]}
              />
            </div>

            <div className="hs-project-name">{pj.name}</div>

            <div className="hs-bar-track sm" style={{ margin: '12px 0 6px' }}>
              <div className="hs-bar-fill is-eased" style={{ width: pj.pct }} />
            </div>
            <div className="hs-meta-sm">{pj.meta}</div>

            <div className="hs-project-next is-split">
              <div className="hs-project-next-left">
                <NextTask p={pj} truncate />
              </div>
              <div className="hs-project-next-right">
                <button
                  type="button"
                  className="hs-project-cta"
                  onClick={pj.view}
                >
                  ALL →
                </button>
                <ExpandButton p={pj} />
              </div>
            </div>

            <OpenTasks p={pj} />
          </div>
        ))}
      </div>

      <div className="hs-add-row">
        <div className="hs-add-plus">+</div>
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
            <div key={pj.name} className="hs-paused-row">
              <div className="hs-paused-name">{pj.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="hs-meta-sm">{pj.meta}</div>
                <button
                  type="button"
                  className="hs-project-cta"
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

  // `typeof project.tasks` would not work here: a type query ignores the
  // narrowing the early return above gives us.
  const patchTasks = (fn: (tasks: ProjectTask[]) => ProjectTask[]) =>
    setProjects((s) =>
      s.map((x) =>
        x.name === project.name ? { ...x, tasks: fn(x.tasks) } : x,
      ),
    )

  const onTaskKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const txt = projTaskDraft.trim()
    if (!txt) return
    patchTasks((tasks) => [...tasks, { text: txt, done: false }])
    setProjTaskDraft('')
  }

  return (
    <div className="hs-screen">
      <div style={{ maxWidth: 640 }}>
        <button
          type="button"
          className="hs-back-link"
          onClick={() => {
            setScreen('projects')
            setOpenProject(null)
          }}
        >
          ← PROJECTS
        </button>

        <div className="hs-detail-tag">{project.tag}</div>
        <div className="hs-newsreader hs-detail-name">{project.name}</div>

        <div className="hs-bar-track sm" style={{ margin: '18px 0 6px' }}>
          <div className="hs-bar-fill is-eased" style={{ width: pct }} />
        </div>
        <div className="hs-meta-sm">
          {doneN} OF {total} TASKS DONE · {pct}
        </div>

        <div className="hs-section-label" style={{ margin: '30px 0 2px' }}>
          TASKS
        </div>
        {project.tasks.map((t, i) => (
          <div key={t.text} className="hs-detail-task">
            <button
              type="button"
              className={`hs-checkbox md${t.done ? ' is-checked' : ''}`}
              aria-pressed={t.done}
              aria-label={t.text}
              onClick={() =>
                patchTasks((tasks) =>
                  tasks.map((tt, ii) =>
                    ii === i ? { ...tt, done: !tt.done } : tt,
                  ),
                )
              }
            >
              {t.done ? '✓' : ''}
            </button>
            <div className={`hs-detail-task-text${t.done ? ' is-done' : ''}`}>
              {t.text}
            </div>
          </div>
        ))}

        <div className="hs-detail-task">
          <div className="hs-add-dash-box md">+</div>
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
