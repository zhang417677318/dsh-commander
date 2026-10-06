import type {
  Deliverable,
  FileEntry,
  KnowledgeCategory,
  KnowledgeDoc,
  Milestone,
  Plugin,
  Project,
  SettingsGroup,
  StorageSlice,
  Task,
  WorkspaceData,
} from '../workspace'
import type { LogEntry } from '../types'
import { TEAM } from './agents'

const TASKS: Task[] = [
  {
    id: 't-01',
    code: '#T-1042',
    title: '生成小程序首页代码',
    lane: 'running',
    priority: 'high',
    assignee: '前端工程师',
    detail: '已运行 1 分 20 秒',
    progress: 62,
    acceptance: { total: 3, passed: 2 },
  },
  {
    id: 't-02',
    code: '#T-1046',
    title: '兼容性矩阵测试',
    lane: 'running',
    priority: 'medium',
    assignee: '测试工程师',
    detail: '已运行 2 分 05 秒',
    progress: 78,
  },
  {
    id: 't-03',
    code: '#T-1048',
    title: '生成小程序分享海报模板',
    lane: 'queued',
    priority: 'medium',
    assignee: 'UI 设计师',
    detail: '依赖 · 首页设计方案',
    eta: '3 分',
  },
  {
    id: 't-04',
    code: '#T-1049',
    title: '整理接口文档到知识库',
    lane: 'queued',
    priority: 'low',
    assignee: '文案工程师',
    detail: '等待智能体空闲',
    eta: '1 分',
  },
  {
    id: 't-05',
    code: '#T-1039',
    title: '美容院首页设计方案',
    lane: 'verify',
    priority: 'medium',
    assignee: 'UI 设计师',
    detail: '等待指挥官复核 · 验收 3 条通过 2 条',
    acceptance: { total: 3, passed: 2 },
  },
  {
    id: 't-06',
    code: '#T-1038',
    title: '需求分析与任务拆解',
    lane: 'done',
    priority: 'low',
    assignee: 'AI 指挥官',
    detail: '用时 12 秒 · 产出 3 个子任务',
  },
  {
    id: 't-07',
    code: '#T-1037',
    title: '品牌色彩与字体提取',
    lane: 'done',
    priority: 'low',
    assignee: 'UI 设计师',
    detail: '验收 2/2 通过 · 产出 1 套 token',
  },
]

const DOCUMENTS: KnowledgeDoc[] = [
  { id: 'd-01', name: '美容院品牌视觉规范 v2', kind: 'PDF', categoryId: 'brand', size: '2.4 MB', updatedAt: '今天 10:12', owner: '李晓晨', indexed: true },
  { id: 'd-02', name: '小程序功能需求说明', kind: 'DOC', categoryId: 'product', size: '860 KB', updatedAt: '今天 09:48', owner: '李晓晨', indexed: true },
  { id: 'd-03', name: '接口约定与字段字典', kind: 'MD', categoryId: 'tech', size: '128 KB', updatedAt: '昨天 18:30', owner: '后端工程师', indexed: true },
  { id: 'd-04', name: '门店价格与套餐表', kind: 'XLS', categoryId: 'product', size: '412 KB', updatedAt: '昨天 15:05', owner: '李晓晨', indexed: true },
  { id: 'd-05', name: '产品发布路演稿', kind: 'PPT', categoryId: 'brand', size: '6.1 MB', updatedAt: '10 月 5 日', owner: '文案工程师', indexed: false },
]

const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  // count 由文档清单派生，保证筛选结果与数字一致
  { id: 'all', label: '全部文档', count: DOCUMENTS.length },
  { id: 'product', label: '产品设计', count: DOCUMENTS.filter((d) => d.categoryId === 'product').length },
  { id: 'tech', label: '技术文档', count: DOCUMENTS.filter((d) => d.categoryId === 'tech').length },
  { id: 'brand', label: '品牌素材', count: DOCUMENTS.filter((d) => d.categoryId === 'brand').length },
  { id: 'case', label: '客户案例', count: DOCUMENTS.filter((d) => d.categoryId === 'case').length },
]

const PLUGINS: Plugin[] = [
  {
    id: 'p-01', name: '微信开发者工具桥', author: '官方', category: '开发工具',
    description: '让前端工程师直接调用本地开发者工具预览与真机调试。',
    rating: 4.9, installs: '12.4k', installed: true, tone: 'blue',
  },
  {
    id: 'p-02', name: 'Figma 设计同步', author: '社区', category: '设计资源',
    description: '把 Figma 画板与设计 token 直接同步给 UI 设计师，减少手工转述。',
    rating: 4.8, installs: '8.9k', installed: true, tone: 'pink',
  },
  {
    id: 'p-03', name: '自动化回归套件', author: '官方', category: '开发工具',
    description: '为测试工程师提供用例录制、断言生成与失败归因的完整链路。',
    rating: 4.7, installs: '6.2k', installed: false, tone: 'teal',
  },
  {
    id: 'p-04', name: '云服务器部署', author: '官方', category: '数据连接',
    description: '给运维工程师接上云厂商 API，支持一键部署、回滚与日志拉取。',
    rating: 4.6, installs: '4.1k', installed: true, tone: 'amber',
  },
  {
    id: 'p-05', name: '小红书内容助手', author: '社区', category: '效率增强',
    description: '按行业词库生成种草文案与选题清单，直接交给文案工程师执行。',
    rating: 4.8, installs: '9.6k', installed: false, tone: 'violet',
  },
  {
    id: 'p-06', name: '数据库直连', author: '官方', category: '数据连接',
    description: '只读方式连接生产库结构，让后端工程师在写代码前先看真实表。',
    rating: 4.5, installs: '3.3k', installed: false, tone: 'slate',
  },
]

const PROJECTS: Project[] = [
  {
    id: 'pr-01', name: '美容院小程序', status: 'active', updatedAt: '更新于 5 分钟前',
    progress: 64, milestones: { done: 6, total: 10 },
    members: ['前端工程师', 'UI 设计师', '测试工程师'], taskCount: 12, tone: 'teal',
  },
  {
    id: 'pr-02', name: '官网多语言改版', status: 'active', updatedAt: '更新于 1 小时前',
    progress: 42, milestones: { done: 4, total: 9 },
    members: ['前端工程师', '运维工程师'], taskCount: 9, tone: 'violet',
  },
  {
    id: 'pr-03', name: '品牌视觉规范', status: 'delivered', updatedAt: '昨天 18:40',
    progress: 100, milestones: { done: 5, total: 5 },
    members: ['UI 设计师', '文案工程师'], taskCount: 7, tone: 'slate',
  },
]

const MILESTONES: Milestone[] = [
  { id: 'm-01', label: '需求分析', done: true },
  { id: 'm-02', label: '信息架构', done: true },
  { id: 'm-03', label: '视觉设计', done: true },
  { id: 'm-04', label: '页面开发', done: true },
  { id: 'm-05', label: '联调测试', done: false },
  { id: 'm-06', label: '发布上线', done: false },
]

const DELIVERABLES: Deliverable[] = [
  { id: 'dl-01', badge: 'UI', name: '首页设计方案 · 4 个画板', meta: 'UI 设计师 · 今天 10:24 · 待验收' },
  { id: 'dl-02', badge: 'CODE', name: 'index.wxml / index.wxss', meta: '前端工程师 · 今天 10:25 · 进行中' },
  { id: 'dl-03', badge: 'DOC', name: '需求拆解与执行计划', meta: 'AI 指挥官 · 今天 10:24 · 已确认' },
]

const ACTIVITY: LogEntry[] = [
  { at: '10:25', agent: '前端工程师', text: '开始生成首页页面代码', state: 'run' },
  { at: '10:24', agent: 'UI 设计师', text: '提交首页设计方案，进入验收', state: 'done' },
  { at: '10:24', agent: 'AI 指挥官', text: '拆解出 3 个子任务并完成派发', state: 'done' },
]

const FILES: FileEntry[] = [
  { id: 'f-01', name: '首页设计稿', kind: 'DIR', size: '2.1 GB', updatedAt: '今天 10:12', owner: 'UI 设计师' },
  { id: 'f-02', name: 'miniapp-source.zip', kind: 'ZIP', size: '48.2 MB', updatedAt: '今天 10:05', owner: '前端工程师' },
  { id: 'f-03', name: '品牌视觉规范 v2.pdf', kind: 'PDF', size: '2.4 MB', updatedAt: '今天 09:48', owner: '李晓晨' },
  { id: 'f-04', name: '门店价格与套餐表.xlsx', kind: 'XLS', size: '412 KB', updatedAt: '昨天 15:05', owner: '李晓晨' },
  { id: 'f-05', name: '兼容性测试报告.log', kind: 'LOG', size: '1.8 MB', updatedAt: '昨天 11:20', owner: '测试工程师' },
]

const STORAGE: StorageSlice[] = [
  { id: 's-01', label: '设计稿', amount: '6.2 GB', percent: 12.4, tone: 'teal' },
  { id: 's-02', label: '代码产物', amount: '3.4 GB', percent: 6.8, tone: 'blue' },
  { id: 's-03', label: '文档', amount: '2.1 GB', percent: 4.2, tone: 'amber' },
  { id: 's-04', label: '其它', amount: '0.7 GB', percent: 2, tone: 'violet' },
]

const SETTINGS: SettingsGroup[] = [
  {
    id: 'account',
    title: '账户与资料',
    rows: [
      { id: 'nickname', label: '昵称', hint: '显示在对话与团队列表中', control: 'text', value: '李晓晨' },
      { id: 'workspace', label: '工作空间', hint: '个人工作室', control: 'text', value: '个人工作室' },
    ],
  },
  {
    id: 'general',
    title: '通用',
    rows: [
      { id: 'locale', label: '界面语言', hint: '菜单、提示与系统文案', control: 'text', value: '简体中文' },
      {
        id: 'appearance', label: '外观', hint: '当前为浅色玻璃主题', control: 'segment',
        value: '浅色', options: ['浅色', '深色', '跟随系统'],
      },
      { id: 'autostart', label: '开机自动启动', hint: '登录系统后自动打开工作台', control: 'switch', value: true },
      { id: 'notify', label: '任务完成时提醒', hint: '智能体交付后弹出系统通知', control: 'switch', value: true },
    ],
  },
  {
    id: 'model',
    title: '模型与推理',
    rows: [
      { id: 'commander-model', label: '指挥官模型', hint: '负责分析需求、拆解任务与验收', control: 'text', value: 'DeepSeek R1' },
      {
        id: 'effort', label: '推理强度', hint: '越高越准，token 消耗也越多', control: 'segment',
        value: '高', options: ['低', '中', '高'],
      },
      { id: 'worker-model', label: '智能体默认模型', hint: '新员工卡片的初始配置', control: 'text', value: 'deepseek-flash · low' },
      { id: 'budget', label: '单任务预算上限', hint: '超出后暂停并上报指挥官', control: 'text', value: '¥2.00' },
    ],
  },
]

export const WORKSPACE_SEED: WorkspaceData = {
  team: TEAM,
  tasks: TASKS,
  documents: DOCUMENTS,
  knowledgeCategories: KNOWLEDGE_CATEGORIES,
  plugins: PLUGINS,
  projects: PROJECTS,
  milestones: MILESTONES,
  deliverables: DELIVERABLES,
  activity: ACTIVITY,
  files: FILES,
  storage: STORAGE,
  settings: SETTINGS,
}
