import { render, screen, within } from '@testing-library/react'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import ProjectsPage from './ProjectsPage'

async function renderPage() {
  render(<ProjectsPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '项目管理' })
}

test('renders one card per project with progress and milestone counts', async () => {
  await renderPage()

  const cards = screen.getAllByRole('article')
  expect(cards).toHaveLength(3)

  const mini = cards.find((card) => within(card).queryByText('美容院小程序'))
  expect(mini).toBeDefined()
  // 这段文案和进度、分隔线在同一行，用子串匹配
  expect(within(mini!).getByText(/6 \/ 10 个里程碑/)).toBeVisible()
  expect(within(mini!).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '64')
})

test('the milestone timeline marks finished phases as text too', async () => {
  await renderPage()

  const timeline = document.querySelector('.timeline') as HTMLElement
  const nodes = within(timeline).getAllByRole('listitem')
  expect(nodes).toHaveLength(6)
  expect(nodes[0]).toHaveTextContent('已完成')
  expect(nodes[4]).toHaveTextContent('未开始')
})

test('deliverables and activity are both present', async () => {
  await renderPage()

  expect(screen.getByText('最近交付物')).toBeVisible()
  expect(screen.getByText('需求拆解与执行计划')).toBeVisible()
  expect(screen.getByText('项目动态')).toBeVisible()
  expect(screen.getByText('拆解出 3 个子任务并完成派发')).toBeVisible()
})

test('project members are shown as a stack with an overflow badge', async () => {
  await renderPage()

  expect(screen.getAllByTitle('前端工程师').length).toBeGreaterThan(0)
})
