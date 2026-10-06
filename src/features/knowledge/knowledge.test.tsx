import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import KnowledgePage from './KnowledgePage'

async function renderPage() {
  render(<KnowledgePage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '知识库' })
}

test('lists every document with size, owner and index state', async () => {
  await renderPage()

  expect(screen.getByText('美容院品牌视觉规范 v2')).toBeVisible()
  expect(screen.getByText('2.4 MB · 今天 10:12 · 李晓晨')).toBeVisible()
  expect(screen.getAllByText('已索引')).toHaveLength(4)
  expect(screen.getAllByText('待索引')).toHaveLength(1)
})

test('categories are navigable and the first one is current', async () => {
  await renderPage()

  const nav = screen.getByRole('navigation', { name: '知识库分类' })
  const buttons = nav.querySelectorAll('button')
  expect(buttons).toHaveLength(5)
  expect(buttons[0]).toHaveAttribute('aria-current', 'true')
  // 分类计数由文档清单派生
  expect(buttons[0]).toHaveTextContent('5')
  expect(buttons[1]).toHaveTextContent('2')

  await userEvent.click(screen.getByRole('button', { name: /技术文档/ }))
  expect(screen.getByRole('button', { name: /技术文档/ })).toHaveAttribute('aria-current', 'true')
  expect(screen.getByRole('button', { name: /全部文档/ })).not.toHaveAttribute('aria-current')
})

test('filtering by category narrows the list to that category', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('button', { name: /产品设计/ }))

  expect(screen.getByText('小程序功能需求说明')).toBeVisible()
  expect(screen.getByText('门店价格与套餐表')).toBeVisible()
  expect(screen.queryByText('接口约定与字段字典')).not.toBeInTheDocument()
})

test('an empty category explains itself instead of showing a blank panel', async () => {
  await renderPage()

  await userEvent.click(screen.getByRole('button', { name: /客户案例/ }))

  expect(screen.getByText('这个分类下还没有文档。')).toBeVisible()
})

test('the upload affordance states the accepted formats and limit', async () => {
  await renderPage()

  expect(screen.getByText('把文档拖到这里，或点击上传')).toBeVisible()
  expect(screen.getByText(/单个不超过 50 MB/)).toBeVisible()
})
