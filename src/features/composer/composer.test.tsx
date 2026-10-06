import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockSessionSource } from '../../domain/mock-session'
import Composer from './Composer'

// 注意：不要解构 `load`，方法依赖 this 绑定。
async function agentFixture() {
  const source = new MockSessionSource({ latencyMs: 0 })
  return (await source.load()).agents
}

async function setup() {
  const agents = await agentFixture()
  const onSend = vi.fn()
  render(<Composer agents={agents} pending={false} onSend={onSend} />)
  return { onSend, user: userEvent.setup() }
}

test('Enter sends and clears the box', async () => {
  const { onSend, user } = await setup()
  const box = screen.getByLabelText('输入你的需求')

  await user.click(box)
  await user.paste('加一个预约入口')
  await user.keyboard('{Enter}')

  expect(onSend).toHaveBeenCalledWith('加一个预约入口')
  expect(box).toHaveValue('')
})

test('Shift+Enter inserts a newline instead of sending', async () => {
  const { onSend, user } = await setup()
  const box = screen.getByLabelText('输入你的需求')

  await user.click(box)
  await user.paste('第一行')
  await user.keyboard('{Shift>}{Enter}{/Shift}')

  expect(onSend).not.toHaveBeenCalled()
  expect(box).toHaveValue('第一行\n')
})

test('empty input never sends', async () => {
  const { onSend } = await setup()

  expect(screen.getByRole('button', { name: '发送' })).toBeDisabled()
  expect(onSend).not.toHaveBeenCalled()
})

test('a pending turn disables sending', async () => {
  const agents = await agentFixture()
  render(<Composer agents={agents} pending onSend={() => {}} />)

  expect(screen.getByRole('button', { name: '发送' })).toBeDisabled()
})

test('the @ button opens a listbox of agents and inserts a mention token', async () => {
  const { user } = await setup()

  await user.click(screen.getByRole('button', { name: /选择智能体/ }))
  const listbox = screen.getByRole('listbox', { name: '选择要 @ 的智能体' })
  await user.click(within(listbox).getByRole('option', { name: /UI 设计师/ }))

  expect(screen.getByLabelText('输入你的需求')).toHaveValue('@UI 设计师 ')
})

test('the popover closes again after a mention is inserted', async () => {
  const { user } = await setup()

  await user.click(screen.getByRole('button', { name: /选择智能体/ }))
  await user.click(screen.getByRole('option', { name: /前端工程师/ }))

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})
