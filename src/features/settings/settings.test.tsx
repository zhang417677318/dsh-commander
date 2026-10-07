import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import SettingsPage from './SettingsPage'

async function renderPage() {
  render(<SettingsPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '设置' })
}

/* ------------------------------ 导航与通用表单 ------------------------------ */

test('the group navigation lists every settings group including 模型', async () => {
  await renderPage()

  const nav = screen.getByRole('navigation', { name: '设置分类' })
  const buttons = [...nav.querySelectorAll('button')].map((button) => button.textContent)
  expect(buttons).toEqual(['账户与资料', '通用', '模型', 'Agent 预设', '智能体默认值'])
  expect(nav.querySelector('button')).toHaveAttribute('aria-current', 'true')
})

test('switching groups swaps the visible form', async () => {
  await renderPage()

  expect(screen.getByLabelText('昵称')).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: '模型' }))

  expect(screen.queryByLabelText('昵称')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /账号路由/ })).toBeVisible()
  expect(screen.getByRole('button', { name: '模型' })).toHaveAttribute('aria-current', 'true')
})

test('switches expose their state through aria-checked', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('button', { name: '通用' }))
  const autostart = screen.getByRole('switch', { name: '开机自动启动' })
  expect(autostart).toBeChecked()

  await userEvent.click(autostart)
  expect(autostart).not.toBeChecked()
})

test('segment rows reflect the chosen option', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('button', { name: '通用' }))
  const dark = screen.getByRole('tab', { name: '深色' })
  expect(dark).toHaveAttribute('aria-selected', 'false')

  await userEvent.click(dark)
  expect(dark).toHaveAttribute('aria-selected', 'true')
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

/* ------------------------------ 模型提供商 ------------------------------ */

test('providers render as rows in catalog order with a textual credential state', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))

  expect(screen.getByRole('button', { name: /账号路由/ })).toBeVisible()
  expect(screen.getByRole('button', { name: /DEEPSEEK_API_KEY/ })).toBeVisible()
  expect(screen.getByRole('button', { name: /MOONSHOT_API_KEY/ })).toBeVisible()

  // 状态不能只靠颜色：文字与颜色点同时存在
  expect(screen.getAllByText('密钥已配置', { selector: '.state' }).length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText('密钥缺失', { selector: '.state' })).toBeVisible()
})

test('only one provider card is expanded at a time', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))

  const account = screen.getByRole('button', { name: /账号路由/ })
  expect(account).toHaveAttribute('aria-expanded', 'true')

  const official = screen.getByRole('button', { name: /DEEPSEEK_API_KEY/ })
  await userEvent.click(official)

  expect(account).toHaveAttribute('aria-expanded', 'false')
  expect(official).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByLabelText('DeepSeek 的 API 密钥')).toBeVisible()
})

test('the account provider never offers a key or base url editor', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))

  expect(screen.queryByLabelText('DeepSeek 账号 的 API 密钥')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('DeepSeek 账号 的 Base URL')).not.toBeInTheDocument()
  expect(screen.getByText(/账号路由使用登录态/)).toBeVisible()
})

test('applying a key flips the state and never keeps the secret in the field', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))

  const moonshot = screen.getByRole('button', { name: /MOONSHOT_API_KEY/ })
  expect(within(moonshot).getByText('密钥缺失')).toBeVisible()
  await userEvent.click(moonshot)

  const key = screen.getByLabelText('Moonshot 的 API 密钥')
  const apply = screen.getByRole('button', { name: '应用' })
  expect(apply).toBeDisabled()

  await userEvent.type(key, 'sk-test-123456')
  expect(apply).toBeEnabled()
  await userEvent.click(apply)

  expect(key).toHaveValue('')
  expect(
    within(screen.getByRole('button', { name: /MOONSHOT_API_KEY/ })).getByText('密钥已配置'),
  ).toBeVisible()
})

test('a model can never end up with zero input modalities', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))
  await userEvent.click(screen.getByRole('button', { name: /DEEPSEEK_API_KEY/ }))

  // 每个模型行是一个分组，避免多行同名复选框互相干扰
  const row = screen.getByRole('group', { name: '模型 deepseek-chat' })
  const textOnly = within(row).getByRole('checkbox', { name: '文本' })
  const image = within(row).getByRole('checkbox', { name: '图片' })
  expect(textOnly).toBeChecked()
  expect(image).not.toBeChecked()

  await userEvent.click(textOnly)

  // 只剩一种时不允许取消
  expect(textOnly).toBeChecked()

  await userEvent.click(image)
  expect(image).toBeChecked()
  await userEvent.click(textOnly)
  expect(textOnly).not.toBeChecked()
})

test('editing a model materialises the catalog and reset restores the baseline', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))
  await userEvent.click(screen.getByRole('button', { name: /DEEPSEEK_API_KEY/ }))

  const reset = screen.getByRole('button', { name: '恢复默认模型' })
  expect(reset).toBeDisabled()
  expect(screen.getByText('继承 2 行')).toBeVisible()

  const context = screen.getByLabelText('deepseek-chat 的上下文窗口')
  await userEvent.clear(context)
  await userEvent.type(context, '64000')

  expect(screen.getByText('已覆盖基线')).toBeVisible()
  expect(reset).toBeEnabled()
  expect(screen.getByLabelText('deepseek-chat 的上下文窗口')).toHaveValue(64000)

  await userEvent.click(reset)
  expect(screen.getByText('继承 2 行')).toBeVisible()
  expect(screen.getByLabelText('deepseek-chat 的上下文窗口')).toHaveValue(128000)
})

test('the panel states why reasoning effort is not a provider-level control', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '模型' }))

  expect(screen.getByText(/推理等级不在这里配置/)).toBeVisible()
})

/* ------------------------------ 智能体默认值 ------------------------------ */

test('agent defaults are a provider plus model selection', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '智能体默认值' }))

  expect(screen.getByLabelText('默认提供商')).toHaveValue('deepseek-account')
  expect(screen.getByLabelText('默认模型')).toHaveValue('deepseek-flash')
  expect(screen.getByLabelText('推理等级')).toHaveValue('max')
  expect(screen.getByLabelText('单任务预算上限')).toHaveValue('¥2.00')
})

test('changing the provider rewrites the available models', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '智能体默认值' }))

  await userEvent.selectOptions(screen.getByLabelText('默认提供商'), 'moonshotai')

  const models = [...screen.getByLabelText('默认模型').querySelectorAll('option')].map(
    (option) => option.value,
  )
  expect(models).toEqual(['kimi-k2-0905-preview'])
  expect(screen.getByLabelText('默认模型')).toHaveValue('kimi-k2-0905-preview')
})

test('reasoning effort can be left unspecified', async () => {
  await renderPage()
  await userEvent.click(screen.getByRole('button', { name: '智能体默认值' }))

  const reset = screen.getByRole('button', { name: '恢复默认' })
  expect(reset).toBeDisabled()

  await userEvent.selectOptions(screen.getByLabelText('推理等级'), '')
  expect(screen.getByLabelText('推理等级')).toHaveValue('')
  expect(reset).toBeEnabled()
  expect(screen.getByText('有未保存的改动')).toBeVisible()
})
