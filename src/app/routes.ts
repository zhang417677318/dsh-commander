export const VIEW_IDS = [
  'workbench',
  'team',
  'tasks',
  'kb',
  'market',
  'projects',
  'files',
  'settings',
] as const

export type ViewId = (typeof VIEW_IDS)[number]

export interface NavItem {
  id: ViewId
  label: string
  badge?: number
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'workbench', label: '工作台' },
  { id: 'team', label: '我的团队' },
  { id: 'tasks', label: '任务中心', badge: 3 },
  { id: 'kb', label: '知识库' },
  { id: 'market', label: '插件市场' },
  { id: 'projects', label: '项目管理' },
  { id: 'files', label: '文件管理' },
  { id: 'settings', label: '设置' },
]

export const VIEW_TITLES: Record<ViewId, string> = {
  workbench: '工作台 · AI 编程助手',
  team: '我的团队 · AI 编程助手',
  tasks: '任务中心 · AI 编程助手',
  kb: '知识库 · AI 编程助手',
  market: '插件市场 · AI 编程助手',
  projects: '项目管理 · AI 编程助手',
  files: '文件管理 · AI 编程助手',
  settings: '设置 · AI 编程助手',
}

export function readView(hash: string): ViewId {
  const raw = hash.replace(/^#\/?/, '')
  return (VIEW_IDS as readonly string[]).includes(raw) ? (raw as ViewId) : 'workbench'
}
