import { _electron as electron, expect, test } from '@playwright/test'

// Electron 走 vite dev server 加载渲染进程，复用 playwright 的 webServer 配置。
const DEV_SERVER_URL = 'http://127.0.0.1:5199'

test('the desktop shell boots and renders the workbench', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: { ...process.env, DSH_DEV_SERVER_URL: DEV_SERVER_URL },
  })

  const window = await app.firstWindow()
  await expect(window.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(window.getByRole('log', { name: '实时执行日志' })).toBeVisible()
  await expect(window.getByLabel('输入你的需求')).toBeVisible()

  await app.close()
})

test('the shell exposes native window controls, not dead buttons', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: { ...process.env, DSH_DEV_SERVER_URL: DEV_SERVER_URL },
  })

  const window = await app.firstWindow()
  await expect(window.getByRole('button', { name: '最小化' })).toBeEnabled()
  await expect(window.getByRole('button', { name: '最大化' })).toBeEnabled()
  await expect(window.getByRole('button', { name: '关闭窗口' })).toBeEnabled()

  await app.close()
})

test('native window controls talk to the main process', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: { ...process.env, DSH_DEV_SERVER_URL: DEV_SERVER_URL },
  })

  const window = await app.firstWindow()
  await expect(window.getByRole('heading', { level: 2 })).toBeVisible()

  await window.getByRole('button', { name: '最大化' }).click()
  await expect(window.getByRole('button', { name: '还原窗口' })).toBeVisible()

  const isMaximized = await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0]?.isMaximized(),
  )
  expect(isMaximized).toBe(true)

  await window.getByRole('button', { name: '还原窗口' }).click()
  await expect(window.getByRole('button', { name: '最大化' })).toBeVisible()

  await app.close()
})

test('the window title tracks the active view and stays resizable', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: { ...process.env, DSH_DEV_SERVER_URL: DEV_SERVER_URL },
  })

  const window = await app.firstWindow()
  await expect(window.getByRole('heading', { level: 2 })).toBeVisible()

  const info = await app.evaluate(({ BrowserWindow }) => {
    const target = BrowserWindow.getAllWindows()[0]
    return { title: target?.getTitle(), resizable: target?.isResizable() }
  })
  // App.tsx 会把 document.title 同步到当前视图，Electron 再把它当作窗口标题
  expect(info.title).toBe('工作台 · AI 编程助手')
  expect(info.resizable).toBe(true)

  await app.close()
})
