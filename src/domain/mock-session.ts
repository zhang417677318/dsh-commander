import type { Agent, CommanderSession, LogEntry, Message } from './types'
import type { SessionSource } from './session-source'

const AGENTS: Agent[] = [
  {
    id: 'w-01',
    name: '前端工程师',
    role: 'React / Vue / 小程序开发',
    skills: ['代码生成', '组件拆分'],
    model: 'deepseek-flash',
    status: 'online',
  },
  {
    id: 'w-02',
    name: '后端工程师',
    role: 'Java / Python / Node.js',
    skills: ['接口设计', '数据库'],
    model: 'deepseek-flash',
    status: 'online',
  },
  {
    id: 'w-03',
    name: 'UI 设计师',
    role: '界面设计 / 交互设计',
    skills: ['视觉规范', '配色系统'],
    model: 'deepseek-flash',
    status: 'online',
  },
  {
    id: 'w-04',
    name: '测试工程师',
    role: '功能测试 / 自动化测试',
    skills: ['用例生成', '兼容性检查'],
    model: 'deepseek-flash',
    status: 'online',
  },
  {
    id: 'w-05',
    name: '运维工程师',
    role: '服务器 / Docker / 部署',
    skills: ['容器编排', '日志排查'],
    model: 'deepseek-flash',
    status: 'idle',
  },
  {
    id: 'w-06',
    name: '文案工程师',
    role: '技术文档 / 内容生成',
    skills: ['小红书种草', '产品文档'],
    model: 'deepseek-flash',
    status: 'idle',
  },
]

const SEED_MESSAGES: Message[] = [
  {
    id: 'm-01',
    author: 'user',
    at: '10:24',
    text: '帮我设计一个美容院小程序首页，并生成对应代码',
  },
  {
    id: 'm-02',
    author: 'commander',
    at: '10:24',
    text: '我已经理解你的需求，将安排：',
    breakdown: [
      { id: 'b-01', index: 1, agentName: 'UI 设计智能体', action: '生成界面设计方案', state: 'done' },
      { id: 'b-02', index: 2, agentName: '前端开发智能体', action: '制作小程序页面', state: 'running' },
      { id: 'b-03', index: 3, agentName: '测试智能体', action: '检查效果和兼容性', state: 'queued' },
    ],
  },
  {
    id: 'm-03',
    author: 'user',
    at: '10:25',
    text: '好的，麻烦尽快，最好今天能出初稿',
  },
]

const SEED_LOG: LogEntry[] = [
  { at: '10:25', agent: '前端工程师', text: '正在生成页面代码…', state: 'run' },
  { at: '10:24', agent: 'UI 设计师', text: '完成界面设计方案…', state: 'done' },
  { at: '10:23', agent: '测试工程师', text: '开始兼容性测试…', state: 'idle' },
]

const SEED_SESSION: CommanderSession = {
  commander: {
    name: 'AI 指挥官 Commander',
    model: 'DeepSeek R1',
    greeting:
      '你好！我是你的 AI 指挥官，负责分析需求、拆解任务，并调度你的智能体团队高效完成工作。',
  },
  stage: { done: ['analysis', 'planning'], active: 'dispatch' },
  agents: AGENTS,
  messages: SEED_MESSAGES,
  log: SEED_LOG,
}

export interface MockOptions {
  latencyMs?: number
}

export class MockSessionSource implements SessionSource {
  private readonly latency: number

  constructor(options: MockOptions = {}) {
    this.latency = options.latencyMs ?? 240
  }

  private wait(ms = this.latency): Promise<void> {
    return ms === 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms))
  }

  async load(): Promise<CommanderSession> {
    await this.wait()
    return structuredClone(SEED_SESSION)
  }

  async send(_text: string): Promise<Message> {
    await this.wait()
    return {
      id: `m-${Date.now()}`,
      author: 'commander',
      at: new Date().toTimeString().slice(0, 5),
      text: '收到，我正在分析需求并拆解任务，稍后会把方案和执行计划同步给你。',
    }
  }
}
