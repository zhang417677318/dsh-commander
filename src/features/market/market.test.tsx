import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import MarketPage from './MarketPage'

async function renderPage() {
  render(<MarketPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '插件市场' })
}

test('lists every plugin with rating and install count', async () => {
  await renderPage()

  expect(screen.getAllByRole('article')).toHaveLength(6)
  // 精选位与网格里各出现一次
  expect(screen.getAllByText('微信开发者工具桥')).toHaveLength(2)
  expect(screen.getByText('4.9')).toBeVisible()
  expect(screen.getAllByText(/安装$/).length).toBeGreaterThan(0)
})

test('installed plugins say so, and installing flips the label', async () => {
  await renderPage()

  const installButtons = screen
    .getAllByRole('button')
    .filter((button) => button.textContent === '安装' || button.textContent === '已安装')

  const target = installButtons.find((button) => button.textContent === '安装')
  expect(target).toBeDefined()

  await userEvent.click(target!)
  expect(target).toHaveTextContent('已安装')
})

test('the installed counter tracks the toggle', async () => {
  await renderPage()

  expect(screen.getByText('已安装 3')).toBeVisible()

  const target = screen
    .getAllByRole('button')
    .find((button) => button.textContent === '安装')
  await userEvent.click(target!)

  expect(screen.getByText('已安装 4')).toBeVisible()
})

test('category tabs filter the grid', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('tab', { name: '数据连接' }))

  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.getByText('云服务器部署')).toBeVisible()
  expect(screen.queryByText('Figma 设计同步')).not.toBeInTheDocument()
})

test('the featured slot highlights a real plugin', async () => {
  await renderPage()

  expect(screen.getByText('本周精选')).toBeVisible()
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('微信开发者工具桥')
})
