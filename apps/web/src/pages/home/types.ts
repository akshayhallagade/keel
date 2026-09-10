export type TodoGroup = 'TODAY' | 'THIS WEEK' | 'SOMEDAY'

export interface Todo {
  text: string
  tag: string
  due: string
  star: boolean
  group: TodoGroup
  completing?: boolean
}

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

export interface TodoPanelState {
  index: number
  text: string
  tag: string
  due: string
  star: boolean
  group?: TodoGroup
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
