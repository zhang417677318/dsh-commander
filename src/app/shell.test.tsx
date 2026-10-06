import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppShell from './AppShell'
import { readView } from './routes'

test('unknown hash falls back to the workbench', () => {
  expect(readView('#nope')).toBe('workbench')
  expect(readView('')).toBe('workbench')
  expect(readView('#team')).toBe('team')
  expect(readView('#/tasks')).toBe('tasks')
})

test('the active nav item is marked with aria-current', () => {
  render(
    <AppShell view="tasks" onNavigate={() => {}}>
      content
    </AppShell>,
  )

  expect(screen.getByRole('button', { name: /任务中心/ })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('button', { name: '工作台' })).not.toHaveAttribute('aria-current')
})

test('clicking a nav item reports the target view', async () => {
  const onNavigate = vi.fn()
  render(
    <AppShell view="workbench" onNavigate={onNavigate}>
      content
    </AppShell>,
  )

  await userEvent.click(screen.getByRole('button', { name: '知识库' }))
  expect(onNavigate).toHaveBeenCalledWith('kb')
})

test('all eight navigation destinations are reachable', () => {
  render(
    <AppShell view="workbench" onNavigate={() => {}}>
      content
    </AppShell>,
  )

  const nav = screen.getByRole('navigation', { name: '主导航' })
  expect(nav.querySelectorAll('button')).toHaveLength(8)
})

test('the shell exposes a searchable top bar and the product name', () => {
  render(
    <AppShell view="workbench" onNavigate={() => {}}>
      content
    </AppShell>,
  )

  expect(screen.getByRole('heading', { name: 'AI 编程助手' })).toBeVisible()
  expect(screen.getByLabelText('搜索')).toBeVisible()
  expect(screen.getByRole('main')).toBeVisible()
})
