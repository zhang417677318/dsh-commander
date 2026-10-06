import { render, screen, within } from '@testing-library/react'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import TeamPage from './TeamPage'

async function renderPage() {
  const source = new MockWorkspaceSource({ latencyMs: 0 })
  render(<TeamPage source={source} />)
  await screen.findByRole('heading', { level: 2, name: '我的团队' })
}

test('renders one card per team member with skills and stats', async () => {
  await renderPage()

  const cards = screen.getAllByRole('article')
  expect(cards).toHaveLength(6)

  const frontend = cards.find((card) => within(card).queryByText('前端工程师'))
  expect(frontend).toBeDefined()
  expect(within(frontend!).getByText('React / Vue / 小程序开发')).toBeVisible()
  expect(within(frontend!).getByText('累计任务')).toBeVisible()
  expect(within(frontend!).getByText('98.4%')).toBeVisible()
})

test('status is conveyed as text, not only as a dot', async () => {
  await renderPage()

  // 只数成员卡上的状态，别把统计卡里的「在线」也算进来
  expect(screen.getAllByText('在线', { selector: '.state' })).toHaveLength(4)
  expect(screen.getAllByText('待命', { selector: '.state' })).toHaveLength(2)
})

test('headline stats are derived from the roster', async () => {
  await renderPage()

  const total = screen.getByText('智能体总数').closest('.stat')
  const online = screen.getByText('在线', { selector: '.k' }).closest('.stat')
  const running = screen.getByText('运行中任务').closest('.stat')

  expect(within(total as HTMLElement).getByText('6')).toBeVisible()
  expect(within(online as HTMLElement).getByText('4')).toBeVisible()
  // 三个成员带进度条 = 有进行中的任务
  expect(within(running as HTMLElement).getByText('3')).toBeVisible()
})

test('members with an active assignment expose a progress bar', async () => {
  await renderPage()

  const bars = screen.getAllByRole('progressbar')
  expect(bars).toHaveLength(3)
  expect(bars[0]).toHaveAttribute('aria-valuenow', '62')
})
