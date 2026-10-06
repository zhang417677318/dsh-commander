/** 产品文案常量：UI 与 mock 数据共用，避免同一句话在多个文件各写一遍。 */
export const COMMANDER_IDENTITY = {
  name: 'AI 指挥官 Commander',
  model: 'DeepSeek R1',
  greeting:
    '你好！我是你的 AI 指挥官，负责分析需求、拆解任务，并调度你的智能体团队高效完成工作。',
} as const

export const DEFAULT_USER_NAME = '李晓晨'
export const DEFAULT_USER_WORKSPACE = '个人工作室'
