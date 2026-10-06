import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import SettingsPage from './SettingsPage'

async function renderPage() {
  render(<SettingsPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '设置' })
}

test('the group navigation lists every settings group', async () => {
  await renderPage()

  const nav = screen.getByRole('navigation', { name: '设置分类' })
  const buttons = nav.querySelectorAll('button')
  expect(buttons).toHaveLength(3)
  expect(buttons[0]).toHaveAttribute('aria-current', 'true')
})

test('switching groups swaps the visible form', async () => {
  await renderPage()

  expect(screen.getByLabelText('昵称')).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: '模型与推理' }))

  expect(screen.queryByLabelText('昵称')).not.toBeInTheDocument()
  expect(screen.getByLabelText('指挥官模型')).toHaveValue('DeepSeek R1')
  expect(screen.getByRole('button', { name: '模型与推理' })).toHaveAttribute('aria-current', 'true')
})

test('switches expose their state through aria-checked', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('button', { name: '通用' }))
  const autostart = screen.getByRole('switch', { name: '开机自动启动' })
  expect(autostart).toBeChecked()

  await userEvent.click(autostart)
  expect(autostart).not.toBeChecked()
})

test('editing a field marks the form dirty and reset clears it', async () => {
  await renderPage()

  const reset = screen.getByRole('button', { name: '恢复默认' })
  expect(reset).toBeDisabled()

  const nickname = screen.getByLabelText('昵称')
  await userEvent.clear(nickname)
  await userEvent.type(nickname, '张三')

  expect(reset).toBeEnabled()
  expect(screen.getByText('有未保存的改动')).toBeVisible()

  await userEvent.click(reset)
  expect(reset).toBeDisabled()
  expect(screen.getByLabelText('昵称')).toHaveValue('李晓晨')
})

test('segment rows reflect the chosen option', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('button', { name: '通用' }))
  const dark = screen.getByRole('tab', { name: '深色' })
  expect(dark).toHaveAttribute('aria-selected', 'false')

  await userEvent.click(dark)
  expect(dark).toHaveAttribute('aria-selected', 'true')
})
