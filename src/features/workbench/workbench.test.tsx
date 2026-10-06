import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SessionSource } from '../../domain/session-source'
import { MockSessionSource } from '../../domain/mock-session'
import WorkbenchPage from './WorkbenchPage'

test('loading state is announced before the session arrives', () => {
  render(<WorkbenchPage source={new MockSessionSource({ latencyMs: 50 })} />)

  expect(screen.getByRole('status')).toHaveTextContent('正在连接指挥官')
})

test('the whole workbench renders once the session resolves', async () => {
  render(<WorkbenchPage source={new MockSessionSource({ latencyMs: 0 })} />)

  await waitFor(() => expect(screen.getByRole('heading', { level: 2 })).toBeVisible())
  expect(screen.getByRole('log', { name: '与指挥官的协作记录' })).toBeVisible()
  expect(screen.getByRole('log', { name: '实时执行日志' })).toBeVisible()
  expect(screen.getByLabelText('输入你的需求')).toBeVisible()
  expect(screen.getByRole('tablist', { name: '智能体分类' })).toBeVisible()
})

test('sending from the composer appends both turns', async () => {
  const source = new MockSessionSource({ latencyMs: 0 })
  render(<WorkbenchPage source={source} />)
  await waitFor(() => expect(screen.getByRole('heading', { level: 2 })).toBeVisible())

  const box = screen.getByLabelText('输入你的需求')
  await userEvent.click(box)
  await userEvent.paste('再加一个会员中心入口')
  await userEvent.keyboard('{Enter}')

  await waitFor(() =>
    expect(screen.getByText('再加一个会员中心入口')).toBeVisible(),
  )
  // 只数对话区里的消息，不要把右栏的智能体卡片算进来
  const thread = screen.getByRole('log', { name: '与指挥官的协作记录' })
  expect(within(thread).getAllByRole('article')).toHaveLength(5)
})

test('a failed load shows a retry affordance instead of a blank screen', async () => {
  const broken: SessionSource = {
    load: () => Promise.reject(new Error('host down')),
    send: () => Promise.reject(new Error('host down')),
  }
  render(<WorkbenchPage source={broken} />)

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('连接指挥官失败'))
  expect(screen.getByRole('button', { name: '重试' })).toBeEnabled()
})

test('retry recovers from a transient failure', async () => {
  let attempt = 0
  const flaky: SessionSource = {
    load: () => {
      attempt += 1
      return attempt === 1
        ? Promise.reject(new Error('host down'))
        : new MockSessionSource({ latencyMs: 0 }).load()
    },
    send: () => Promise.reject(new Error('not used')),
  }
  render(<WorkbenchPage source={flaky} />)
  await waitFor(() => expect(screen.getByRole('alert')).toBeVisible())

  await userEvent.click(screen.getByRole('button', { name: '重试' }))

  await waitFor(() => expect(screen.getByRole('heading', { level: 2 })).toBeVisible())
})
