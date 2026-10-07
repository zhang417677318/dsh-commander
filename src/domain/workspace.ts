import type { Agent, LogEntry } from './types'
import type { AgentDefaultModel, ModelProvider } from './models'
import type { AgentPreset, PresetGuide } from './presets'

/* ------------------------------- 我的团队 ------------------------------- */

export interface AgentStats {
  /** 累计任务数 */
  total: number
  /** 第二项指标的标签，如「成功率」「缺陷命中」 */
  secondaryLabel: string
  /** 第二项指标的取值，如「98.4%」「41」 */
  secondaryValue: string
}

export interface AgentAssignment {
  title: string
  detail: string
  progress?: number
}

/** 我的团队页面用的富信息智能体；工作台侧栏只用 Agent 的基础字段。 */
export interface TeamMember extends Agent {
  stats: AgentStats
  assignment: AgentAssignment
}

/* ------------------------------- 任务中心 ------------------------------- */

export type TaskLane = 'queued' | 'running' | 'verify' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  code: string
  title: string
  lane: TaskLane
  priority: TaskPriority
  assignee: string
  detail: string
  progress?: number
  acceptance?: { total: number; passed: number }
  eta?: string
}

/* -------------------------------- 知识库 -------------------------------- */

export type DocKind = 'PDF' | 'DOC' | 'MD' | 'XLS' | 'PPT'

export interface KnowledgeDoc {
  id: string
  name: string
  kind: DocKind
  /** 所属分类 id，对应 KnowledgeCategory.id */
  categoryId: string
  size: string
  updatedAt: string
  owner: string
  indexed: boolean
}

export interface KnowledgeCategory {
  id: string
  label: string
  count: number
}

/* ------------------------------- 插件市场 ------------------------------- */

export type PluginCategory = '开发工具' | '设计资源' | '效率增强' | '数据连接'

export interface Plugin {
  id: string
  name: string
  author: string
  category: PluginCategory
  description: string
  rating: number
  installs: string
  installed: boolean
  tone: 'blue' | 'violet' | 'pink' | 'teal' | 'amber' | 'slate'
}

/* ------------------------------- 项目管理 ------------------------------- */

export type ProjectStatus = 'active' | 'delivered' | 'planned'

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  updatedAt: string
  progress: number
  milestones: { done: number; total: number }
  members: string[]
  taskCount: number
  tone: Plugin['tone']
}

export interface Milestone {
  id: string
  label: string
  done: boolean
}

export interface Deliverable {
  id: string
  badge: string
  name: string
  meta: string
}

/* ------------------------------- 文件管理 ------------------------------- */

export interface FileEntry {
  id: string
  name: string
  kind: string
  size: string
  updatedAt: string
  owner: string
}

export interface StorageSlice {
  id: string
  label: string
  amount: string
  /** 占总容量百分比 */
  percent: number
  tone: 'teal' | 'blue' | 'amber' | 'violet'
}

/* --------------------------------- 设置 --------------------------------- */

export interface SettingsSwitchRow {
  id: string
  label: string
  hint: string
  control: 'switch'
  value: boolean
}

export interface SettingsTextRow {
  id: string
  label: string
  hint: string
  control: 'text'
  value: string
}

export interface SettingsSegmentRow {
  id: string
  label: string
  hint: string
  control: 'segment'
  value: string
  options: string[]
}

export type SettingsRow = SettingsSwitchRow | SettingsTextRow | SettingsSegmentRow

export interface SettingsGroup {
  id: string
  title: string
  rows: SettingsRow[]
}

/* ------------------------- 工作区：所有视图的数据 ------------------------- */

export interface WorkspaceData {
  team: TeamMember[]
  /** 模型提供商目录，对应 dsh 原生的 Models 设置页 */
  providers: ModelProvider[]
  agentDefaultModel: AgentDefaultModel
  /** Agent 预设，对应 dsh 的 agent-preset-registry */
  agentPresets: AgentPreset[]
  defaultPresetId: string
  presetGuides: Record<string, PresetGuide>
  tasks: Task[]
  documents: KnowledgeDoc[]
  knowledgeCategories: KnowledgeCategory[]
  plugins: Plugin[]
  projects: Project[]
  milestones: Milestone[]
  deliverables: Deliverable[]
  activity: LogEntry[]
  files: FileEntry[]
  storage: StorageSlice[]
  settings: SettingsGroup[]
}

/**
 * 工作台之外所有视图的数据来源。
 * 与 SessionSource 一样，v1 只有 Mock 实现；接 dsh Host 时新增 HostWorkspaceSource 即可。
 */
export interface WorkspaceSource {
  load(): Promise<WorkspaceData>
}
