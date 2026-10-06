import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockSessionSource } from '../../domain/mock-session'
import AgentRail, { categoryOf } from './AgentRail'
import LiveLog from './LiveLog'
import type { LogEntry } from '../../domain/types'

async function agentFixture() {
  const source = new MockSessionSource({ latencyMs: 0 })
  return (await source.load()).agents
}

const entries: LogEntry[] = [
  { at: '10:25', agent: '前端工程师', text: '正在生成页面代码…', state: 'run' },
  { at: '10:24', agent: 'UI 设计师', text: '完成界面设计方案…', state: 'done' },
]

test('category rules map roles to the rail tabs', () => {
  expect(categoryOf({ name: '前端工程师', role: 'React / Vue / 小程序开发' })).toBe('开发')
  expect(categoryOf({ name: '后端工程师', role: 'Java / Python / Node.js' })).toBe('开发')
  expect(categoryOf({ name: 'UI 设计师', role: '界面设计 / 交互设计' })).toBe('设计')
  expect(categoryOf({ name: '文案工程师', role: '技术文档 / 内容生成' })).toBe('文案')
})

test('every agent shows name, skills and a textual status', async () => {
  const agents = await agentFixture()
  render(<AgentRail agents={agents} />)

  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(screen.getAllByText('在线')).toHaveLength(4)
  expect(screen.getAllByText('待命')).toHaveLength(2)
  expect(screen.getByText('React / Vue / 小程序开发')).toBeVisible()
})

test('the 开发 tab filters the rail down to developers', async () => {
  const agents = await agentFixture()
  render(<AgentRail agents={agents} />)

  await userEvent.click(screen.getByRole('tab', { name: '开发' }))

  // 被过滤掉的卡片使用 hidden 属性，因此不再出现在可访问性树里
  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.getByText('UI 设计师')).not.toBeVisible()
})

test('filtering is driven by aria-selected, not by CSS classes', async () => {
  const agents = await agentFixture()
  render(<AgentRail agents={agents} />)

  await userEvent.click(screen.getByRole('tab', { name: '运维' }))

  expect(screen.getByRole('tab', { name: '运维' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: '全部' })).toHaveAttribute('aria-selected', 'false')
})

test('the execution log is a polite live region with time, agent and text', () => {
  render(<LiveLog entries={entries} />)

  const log = screen.getByRole('log', { name: '实时执行日志' })
  expect(log).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByText('10:25')).toBeVisible()
  expect(screen.getByText('前端工程师')).toBeVisible()
  expect(screen.getByText('正在生成页面代码…')).toBeVisible()
})

test('the execution log renders an explicit empty state', () => {
  render(<LiveLog entries={[]} />)

  expect(screen.getByText('暂无执行记录')).toBeVisible()
})
