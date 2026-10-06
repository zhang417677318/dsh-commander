export type AgentStatus = 'online' | 'idle' | 'running'
export type TaskState = 'done' | 'running' | 'queued'
export type FlowStep = 'analysis' | 'planning' | 'dispatch' | 'execution'
export type MessageAuthor = 'user' | 'commander'
export type LogState = 'run' | 'done' | 'idle'

export interface Agent {
  id: string
  name: string
  role: string
  skills: string[]
  model: string
  status: AgentStatus
}

export interface BreakdownItem {
  id: string
  index: number
  agentName: string
  action: string
  state: TaskState
}

export interface Message {
  id: string
  author: MessageAuthor
  at: string
  text: string
  breakdown?: BreakdownItem[]
}

export interface CommanderIdentity {
  name: string
  model: string
  greeting: string
}

export interface CommanderStage {
  done: FlowStep[]
  active: FlowStep
}

export interface LogEntry {
  at: string
  agent: string
  text: string
  state: LogState
}

export interface CommanderSession {
  commander: CommanderIdentity
  stage: CommanderStage
  agents: Agent[]
  messages: Message[]
  log: LogEntry[]
}
