import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import SettingsPage from './SettingsPage'

async function openPresets() {
  render(<SettingsPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '设置' })
  await userEvent.click(screen.getByRole('button', { name: 'Agent 预设' }))
}

test('the built-in group lists all four presets with their ids', async () => {
  await openPresets()

  expect(screen.getAllByRole('article')).toHaveLength(4)
  expect(screen.getByText('标准模式')).toBeVisible()
  expect(screen.getByText('PTC 模式')).toBeVisible()
  expect(screen.getByText('极简模式')).toBeVisible()
  expect(screen.getByText('创造模式')).toBeVisible()

  expect(screen.getByText('standard')).toBeVisible()
  expect(screen.getByText('ptc')).toBeVisible()
  expect(screen.getByText('minimal')).toBeVisible()
  expect(screen.getByText('cordis')).toBeVisible()
})

test('preset descriptions are the native copy', async () => {
  await openPresets()

  expect(
    screen.getByText(
      '处理代码、文件和资料，适合大多数任务。Agent 会按需使用检索、编辑和终端等工具。',
    ),
  ).toBeVisible()
  expect(
    screen.getByText('Agent 仅使用终端工具完成任务，适合测试和对比其基础表现。'),
  ).toBeVisible()
})

test('the default badge replaces the group badge on exactly one card', async () => {
  await openPresets()

  const inUse = screen.getAllByText('新任务默认')
  expect(inUse).toHaveLength(1)
  expect(inUse[0]!.closest('.ap-card')).toHaveTextContent('标准模式')
  // 分组标题也叫「内置」，这里只数卡片上的徽标
  expect(screen.getAllByText('内置', { selector: '.ap-badge' })).toHaveLength(3)
})

test('clicking a card makes it the new-task default', async () => {
  await openPresets()

  await userEvent.click(screen.getByRole('button', { name: '设为新任务默认：创造模式' }))

  expect(screen.getByRole('button', { name: '设为新任务默认：创造模式' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(screen.getByRole('button', { name: '设为新任务默认：标准模式' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  expect(screen.getByText('新任务默认').closest('.ap-card')).toHaveTextContent('创造模式')
})

test('模式说明 opens a read-only help dialog with the native explanation', async () => {
  await openPresets()
  const card = screen.getByText('标准模式').closest('.ap-card') as HTMLElement

  await userEvent.click(within(card).getByRole('button', { name: '模式说明' }))

  const dialog = screen.getByRole('dialog', { name: '标准模式' })
  expect(within(dialog).getByText(/新建任务时选择「标准模式」/)).toBeVisible()
  expect(within(dialog).getByText('工作方式')).toBeVisible()
  expect(within(dialog).getByText(/包含 Skills、计划、目标、子 Agent/)).toBeVisible()
})

test('the help dialog switches to 如何使用 without changing the default', async () => {
  await openPresets()
  const card = screen.getByText('PTC 模式').closest('.ap-card') as HTMLElement

  await userEvent.click(within(card).getByRole('button', { name: '如何使用' }))
  const dialog = screen.getByRole('dialog', { name: 'PTC 模式' })
  expect(within(dialog).getByText('批量检查配置文件')).toBeVisible()

  await userEvent.click(within(dialog).getByRole('tab', { name: '模式说明' }))
  expect(within(dialog).getByText(/Programmatic Tool Calling/)).toBeVisible()

  // 帮助不改变新任务默认值
  expect(screen.getByText('新任务默认').closest('.ap-card')).toHaveTextContent('标准模式')
})

test('复制 puts the guide text on the clipboard', async () => {
  const user = userEvent.setup()
  await openPresets()
  const card = screen.getByText('极简模式').closest('.ap-card') as HTMLElement

  await user.click(within(card).getByRole('button', { name: '模式说明' }))
  const dialog = screen.getByRole('dialog', { name: '极简模式' })
  await user.click(within(dialog).getByRole('button', { name: '复制' }))

  expect(within(dialog).getByRole('button', { name: '已复制' })).toBeVisible()
  const clip = await navigator.clipboard.readText()
  expect(clip).toContain('新建任务时选择「极简模式」')
  expect(clip).toContain('仅提供一个持久 Shell 工具')
})

test('Escape closes the dialog and returns focus to the card that opened it', async () => {
  await openPresets()
  const card = screen.getByText('创造模式').closest('.ap-card') as HTMLElement
  const trigger = within(card).getByRole('button', { name: '模式说明' })

  await userEvent.click(trigger)
  expect(screen.getByRole('dialog', { name: '创造模式' })).toBeVisible()

  await userEvent.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

test('查看配置 shows the declared plugin list as read-only YAML', async () => {
  await openPresets()

  await userEvent.click(screen.getByRole('button', { name: '查看配置：PTC 模式' }))

  const dialog = screen.getByRole('dialog', { name: '查看配置' })
  expect(within(dialog).getByText(/run-code/)).toBeVisible()
  expect(within(dialog).getByText(/dsh-tool-run-code/)).toBeVisible()
  expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument()
})

test('the custom group keeps its creation entry', async () => {
  await openPresets()

  expect(screen.getByText('自定义')).toBeVisible()
  const draft = screen.getByRole('button', { name: '+ 让 Agent 帮我创建预设模式' })
  expect(draft).toBeEnabled()
})
