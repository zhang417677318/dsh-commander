import { expect, test } from '@playwright/test'

/** 每个视图的可识别地标：标题 + 一个只有该页才有的元素 */
const ROUTES = [
  { hash: 'workbench', heading: 'AI 指挥官 Commander', landmark: '实时执行日志' },
  { hash: 'team', heading: '我的团队', landmark: '智能体总数' },
  { hash: 'tasks', heading: '任务中心', landmark: '待派发' },
  { hash: 'kb', heading: '知识库', landmark: '最近更新' },
  { hash: 'market', heading: '插件市场', landmark: '本周精选' },
  { hash: 'projects', heading: '项目管理', landmark: '最近交付物' },
  { hash: 'files', heading: '文件管理', landmark: '工作空间' },
  { hash: 'settings', heading: '设置', landmark: '账户与资料' },
] as const

for (const route of ROUTES) {
  test(`the ${route.hash} view renders its own content`, async ({ page }) => {
    await page.goto(`/#${route.hash}`)

    await expect(page.getByRole('heading', { level: 2, name: route.heading })).toBeVisible()
    await expect(page.getByText(route.landmark, { exact: false }).first()).toBeVisible()
  })
}

test('navigating through all eight views never throws', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/#workbench')
  for (const label of ['我的团队', '任务中心', '知识库', '插件市场', '项目管理', '文件管理', '设置', '工作台']) {
    await page.getByRole('button', { name: label === '任务中心' ? /任务中心/ : label }).click()
    await expect(page.getByRole('button', { name: label === '任务中心' ? /任务中心/ : label })).toHaveAttribute(
      'aria-current',
      'page',
    )
  }

  expect(errors).toEqual([])
})
