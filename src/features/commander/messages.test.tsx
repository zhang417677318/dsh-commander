import { render, screen, within } from '@testing-library/react'
import MessageList from './MessageList'
import TaskBreakdownCard from './TaskBreakdownCard'
import type { BreakdownItem, Message } from '../../domain/types'

const items: BreakdownItem[] = [
  { id: 'b1', index: 1, agentName: 'UI 设计智能体', action: '生成界面设计方案', state: 'done' },
  { id: 'b2', index: 2, agentName: '前端开发智能体', action: '制作小程序页面', state: 'running' },
  { id: 'b3', index: 3, agentName: '测试智能体', action: '检查效果和兼容性', state: 'queued' },
]

test('breakdown rows carry index, agent, action and an explicit state label', () => {
  render(<TaskBreakdownCard items={items} />)

  const rows = screen.getAllByRole('listitem')
  expect(rows).toHaveLength(3)
  expect(within(rows[0]!).getByText('UI 设计智能体')).toBeVisible()
  expect(within(rows[0]!).getByText('已完成')).toBeVisible()
  expect(within(rows[1]!).getByText('进行中')).toBeVisible()
  expect(within(rows[2]!).getByText('等待派发')).toBeVisible()
})

test('message list separates the user and commander turns for assistive tech', () => {
  const messages: Message[] = [
    { id: 'm1', author: 'user', at: '10:24', text: '帮我设计一个美容院小程序首页' },
    { id: 'm2', author: 'commander', at: '10:24', text: '我已经理解你的需求，将安排：', breakdown: items },
  ]
  render(<MessageList messages={messages} />)

  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.getByText('李晓晨')).toBeVisible()
  expect(screen.getByText('AI 指挥官 Commander')).toBeVisible()
  expect(screen.getByText('帮我设计一个美容院小程序首页')).toBeVisible()
})

test('the thread is a polite live region so new replies are announced', () => {
  render(<MessageList messages={[]} />)

  expect(screen.getByRole('log', { name: '与指挥官的协作记录' })).toHaveAttribute(
    'aria-live',
    'polite',
  )
})
