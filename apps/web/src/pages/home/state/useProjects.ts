import { useCallback, useState } from 'react'
import { SEED_PROJECTS } from '../seedData'
import type {
  ConfirmDeleteState,
  Project,
  ProjectPanelState,
  Screen,
} from '../types'

/// At most three projects can be pinned to Today.
const MAX_PINNED = 3

export function useProjects(
  askDelete: (target: ConfirmDeleteState) => void,
  goToScreen: (s: Screen) => void,
) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS)
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [projTaskDraft, setProjTaskDraft] = useState('')
  const [projectDraft, setProjectDraft] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({})
  const [projPanel, setProjPanelState] = useState<ProjectPanelState | null>(
    null,
  )

  const setProjPanel = useCallback((patch: Partial<ProjectPanelState>) => {
    setProjPanelState((s) => (s ? { ...s, ...patch } : s))
  }, [])

  const mkProject = useCallback(
    (p: Project) => {
      const total = p.tasks.length
      const doneN = p.tasks.filter((t) => t.done).length
      const openN = total - doneN
      const pct = total ? Math.round((doneN / total) * 100) : 0
      const next = p.tasks.find((t) => !t.done)

      const completeTask = (taskIdx: number) =>
        setProjects((s) =>
          s.map((x) =>
            x.name === p.name
              ? {
                  ...x,
                  tasks: x.tasks.map((t, i) =>
                    i === taskIdx ? { ...t, done: true } : t,
                  ),
                }
              : x,
          ),
        )

      return {
        name: p.name,
        tag: p.tag,
        pct: pct + '%',
        meta:
          pct + '% · ' + openN + (openN === 1 ? ' TASK OPEN' : ' TASKS OPEN'),
        nextLabel: next ? 'Next: ' + next.text : 'All tasks complete',
        /// True when every task is ticked — ProjectCard turns this into the
        /// filled box and the strikethrough.
        allDone: !next,
        completeNext: () => {
          const idx = p.tasks.findIndex((t) => !t.done)
          if (idx >= 0) completeTask(idx)
        },
        paused: p.paused,
        pauseLabel: p.paused ? 'RESUME' : 'PAUSE',
        togglePause: () =>
          setProjects((s) =>
            s.map((x) => (x.name === p.name ? { ...x, paused: !x.paused } : x)),
          ),
        edit: () =>
          setProjPanelState({ orig: p.name, name: p.name, tag: p.tag }),
        del: () => askDelete({ kind: 'project', name: p.name }),
        view: () => {
          goToScreen('projectDetail')
          setOpenProject(p.name)
          setProjTaskDraft('')
        },
        openCount: openN,
        expanded: !!expandedProjects[p.name],
        toggleExpand: () =>
          setExpandedProjects((s) => ({ ...s, [p.name]: !s[p.name] })),
        openTasks: p.tasks
          .map((t, i) => ({ t, i }))
          .filter((x) => !x.t.done)
          .map((x) => ({ text: x.t.text, toggle: () => completeTask(x.i) })),
        pinned: !!p.pinned,
        pinLabel: p.pinned ? 'UNPIN' : 'PIN',
        togglePin: () =>
          setProjects((s) => {
            const isPinned = s.find((x) => x.name === p.name)?.pinned
            // Silently refuse a fourth pin rather than dropping someone else's.
            if (!isPinned && s.filter((x) => x.pinned).length >= MAX_PINNED)
              return s
            return s.map((x) =>
              x.name === p.name ? { ...x, pinned: !x.pinned } : x,
            )
          }),
      }
    },
    [expandedProjects, askDelete, goToScreen],
  )

  const activeProjects = projects.filter((p) => !p.paused).map(mkProject)
  const pausedProjects = projects.filter((p) => p.paused).map(mkProject)
  const unpinnedActive = projects
    .filter((p) => !p.paused && !p.pinned)
    .map(mkProject)

  const pinnedProjects = projects
    .filter((p) => p.pinned && !p.paused)
    .slice(0, MAX_PINNED)
    .map((p) => {
      const total = p.tasks.length
      const doneN = p.tasks.filter((t) => t.done).length
      const next = p.tasks.find((t) => !t.done)
      return {
        ...mkProject(p),
        done: doneN,
        total,
        pctNum: (total ? Math.round((doneN / total) * 100) : 0) + '%',
        next: next ? next.text : 'All tasks complete',
        slotId: 'pinned-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }
    })

  const addProject = () => {
    const n = projectDraft.trim()
    if (!n) return
    setProjects((s) => [
      ...s,
      {
        name: n,
        tag: 'PROJECT',
        paused: false,
        tasks: [{ text: 'Define scope', done: false }],
      },
    ])
    setProjectDraft('')
  }

  const saveProject = () => {
    const pp = projPanel
    if (!pp || !pp.name.trim()) return
    setProjects((s) =>
      s.map((x) =>
        x.name === pp.orig
          ? {
              ...x,
              name: pp.name.trim(),
              tag: (pp.tag || '').trim().toUpperCase() || x.tag,
            }
          : x,
      ),
    )
    setProjPanelState(null)
  }

  return {
    projects,
    setProjects,
    activeProjects,
    pausedProjects,
    pinnedProjects,
    unpinnedActive,
    projectDraft,
    setProjectDraft,
    addProject,
    openProject,
    setOpenProject,
    projTaskDraft,
    setProjTaskDraft,
    projPanel,
    setProjPanel,
    setProjPanelState,
    saveProject,
  }
}
