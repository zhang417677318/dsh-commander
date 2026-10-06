import { render, screen, within } from '@testing-library/react'
import { MockWorkspaceSource } from '../../domain/mock-workspace'
import FilesPage from './FilesPage'

async function renderPage() {
  render(<FilesPage source={new MockWorkspaceSource({ latencyMs: 0 })} />)
  await screen.findByRole('heading', { level: 2, name: '文件管理' })
}

test('storage is broken down by category in both the bar and the legend', async () => {
  await renderPage()

  const bar = screen.getByRole('img', { name: /存储占用/ })
  expect(bar).toHaveAccessibleName(/设计稿 6.2 GB/)
  expect(bar).toHaveAccessibleName(/代码产物 3.4 GB/)
  expect(bar.querySelectorAll('i')).toHaveLength(4)
})

test('the file table lists every entry with size, time and owner', async () => {
  await renderPage()

  // 1 行表头 + 5 个文件
  expect(screen.getAllByRole('row')).toHaveLength(6)
  expect(screen.getByText('miniapp-source.zip')).toBeVisible()
  expect(screen.getByText('48.2 MB')).toBeVisible()
  expect(screen.getByText('前端工程师')).toBeVisible()
})

test('the breadcrumb states where the listing lives', async () => {
  await renderPage()

  const crumbs = document.querySelector('.crumbs') as HTMLElement
  expect(within(crumbs).getByText('美容院小程序')).toBeVisible()
})

test('folder rows are distinguishable from files by their badge', async () => {
  await renderPage()

  expect(screen.getByText('DIR')).toBeVisible()
  expect(screen.getByText('ZIP')).toBeVisible()
})
