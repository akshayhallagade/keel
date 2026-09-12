/// Todos come from the API, so their shape is the shared one rather than a
/// local copy.
///
/// Which of the three lists a todo appears in is not part of that shape. It is
/// worked out from `dueAt` at render time — see `groupFor` in state/helpers.ts.
export type { Todo } from '@keel/types'

export type RoutinePeriod =
  'WAKE UP' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'BEDTIME'

export interface Routine {
  name: string
  period: RoutinePeriod
  time: string
  done: boolean
  missed?: boolean
  streak: number
  week: boolean[]
}

export interface ProjectTask {
  text: string
  done: boolean
}

export interface Project {
  name: string
  tag: string
  paused: boolean
  pinned?: boolean
  tasks: ProjectTask[]
}

export interface Hobby {
  name: string
  meta: string
  sessions: number
  quiet?: boolean
}

export interface HobbyTry {
  name: string
}

export interface Alarm {
  time: string
  ampm: 'AM' | 'PM'
  label: string
  days: string
  on: boolean
}

export interface Profile {
  name: string
  email: string
}

export interface Prefs {
  quote: boolean
  digest: boolean
  alerts: boolean
  sip: boolean
}

export type Screen =
  | 'today'
  | 'todos'
  | 'routines'
  | 'projects'
  | 'projectDetail'
  | 'invest'
  | 'accounts'
  | 'spend'
  | 'budget'
  | 'goals'
  | 'hobbies'
  | 'books'
  | 'quotes'
  | 'wishlist'
  | 'alarms'
  | 'reminders'
  | 'settings'

/// What the todo panel is editing. `id` is null when creating a new one —
/// which is also how save knows whether to POST or PATCH. It used to be an
/// index into the todos array, captured when the panel opened, so anything
/// added or completed in the meantime made it point at the wrong row.
export interface TodoPanelState {
  id: string | null
  text: string
  area: string
  /// "YYYY-MM-DD" while editing; converted to an instant on save. Empty for
  /// no date.
  day: string
  /// "HH:MM" while editing, as <input type="time"> gives it. Empty means the
  /// todo is due that day but at no particular time.
  time: string
  starred: boolean
  /// How many months the calendar has been paged from its starting month.
  calShift?: number
}

export interface RoutinePanelState {
  orig: string | null
  name: string
  time: string
  period: RoutinePeriod
  timeSet: boolean
  hour: number
  minIdx: number
  ampm: 'AM' | 'PM'
}

export interface ProjectPanelState {
  orig: string
  name: string
  tag: string
}

export interface HobbyPanelState {
  name: string
  status: 'ACTIVE' | 'TRY'
  note: string
}

export type CreatePanelType =
  'goal' | 'book' | 'quote' | 'wish' | 'spend' | 'alarm' | 'rem'

export interface CreatePanelState {
  type: CreatePanelType
  vals: Record<string, string>
  chip: string | null
}

export interface ConfirmDeleteState {
  kind: 'project' | 'routine'
  name: string
}

export interface AlarmDraft {
  h: number
  m: number
  ampm: 'AM' | 'PM'
}
