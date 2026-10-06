import { expect, test } from '@playwright/test'

test('workbench matches the design baseline', async ({ page }) => {
  await page.goto('/#workbench')
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(page.getByRole('log', { name: '实时执行日志' })).toBeVisible()

  await expect(page).toHaveScreenshot('workbench-1600x900.png', { maxDiffPixelRatio: 0.02 })
})

test('navigation stays reachable and the shell reflows at 1024', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 820 })
  await page.goto('/#workbench')

  await expect(page.getByRole('button', { name: '工作台' })).toBeVisible()
  await expect(page.getByRole('button', { name: /任务中心/ })).toBeVisible()
})

test('clicking a nav item switches the route', async ({ page }) => {
  await page.goto('/#workbench')
  await page.getByRole('button', { name: '我的团队' }).click()

  await expect(page).toHaveURL(/#team$/)
  await expect(page.getByRole('button', { name: '我的团队' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('sending a prompt renders both turns', async ({ page }) => {
  await page.goto('/#workbench')
  const box = page.getByLabel('输入你的需求')
  await box.click()
  await box.fill('再加一个会员中心入口')
  await box.press('Enter')

  await expect(page.getByText('再加一个会员中心入口')).toBeVisible()
  await expect(page.getByRole('log', { name: '与指挥官的协作记录' })).toContainText(
    '收到，我正在分析需求并拆解任务',
  )
})
