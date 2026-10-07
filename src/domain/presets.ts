/** Agent 预设：一组工具与工作方式。结构对齐 dsh 的 agent-preset-registry。 */
export interface AgentPreset {
  id: string
  name: string
  description: string
  builtin: boolean
  /** 加载失败时置位，卡片会显示「加载失败」徽标 */
  broken?: boolean
  /** 声明的插件条目列表，只读查看用 */
  composition: string
}

/** 内置预设的只读帮助内容，与页面文案分开存放。 */
export interface PresetGuide {
  /** 新建任务时的操作提示 */
  intro: string
  /** 「模式说明」页签的正文 */
  explanation: string
  /** 「如何使用」页签的正文 */
  usage: string
}
