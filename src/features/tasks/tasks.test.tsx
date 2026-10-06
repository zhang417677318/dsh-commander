import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import TasksPage from './TasksPage'

async function renderPage() {
  render(<TasksPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '任务中心' })
}

test('the board shows four lanes in workflow order', async () => {
  await renderPage()

  const lanes = screen.getAllByRole('region')
  expect(lanes.map((lane) => lane.getAttribute('aria-label'))).toEqual([
    '待派发',
    '进行中',
    '待验收',
    '已完成',
  ])
})

test('every task lands in its own lane', async () => {
  await renderPage()

  const running = screen.getByRole('region', { name: '进行中' })
  expect(within(running).getAllByRole('article')).toHaveLength(2)
  expect(within(running).getByText('生成小程序首页代码')).toBeVisible()

  const queued = screen.getByRole('region', { name: '待派发' })
  expect(within(queued).getAllByRole('article')).toHaveLength(2)
})

test('priority and task code are visible on each card', async () => {
  await renderPage()

  expect(screen.getByText('高优先级')).toBeVisible()
  expect(screen.getAllByText('#T-1042').length).toBeGreaterThan(0)
})

test('switching to the list view renders a sortable table instead of the board', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('tab', { name: '列表' }))

  expect(screen.queryByRole('region', { name: '待派发' })).not.toBeInTheDocument()
  // 1 行表头 + 7 个任务
  expect(screen.getAllByRole('row')).toHaveLength(8)
  expect(screen.getByRole('columnheader', { name: '任务' })).toBeVisible()
})

test('progress bars only appear on tasks that have progress', async () => {
  await renderPage()

  expect(screen.getAllByRole('progressbar')).toHaveLength(2)
})
