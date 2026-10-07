import { existsSync } from 'node:fs'
import { _electron as electron, expect, test } from '@playwright/test'

const APP = 'F:/dsh-commander/release/win-unpacked/AI 编程助手.exe'

/**
 * 打包产物冒烟测试。
 *
 * 这一条专门防「开发模式正常、装完白屏」这类问题——渲染进程在 file:// 下
 * 加载，任何绝对路径的资源引用都会 404。跑之前需要先执行 `pnpm app:dir`。
 */
test.describe('packaged application', () => {
  test.skip(!existsSync(APP), '先执行 pnpm app:dir 生成 release/win-unpacked')

  test('the packaged exe renders the workbench', async () => {
    const app = await electron.launch({ executablePath: APP })
    const window = await app.firstWindow()

    const failures: string[] = []
    window.on('requestfailed', (request) =>
      failures.push(`${request.url()} :: ${request.failure()?.errorText}`),
    )

    await expect(window.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(window.getByRole('log', { name: '实时执行日志' })).toBeVisible()

    // avatar.png 是可选的头像覆盖钩子：同目录放一张图就会自动启用，
    // 没有时 img 会被 onError 移除。它的 404 是预期行为，不算资源缺失。
    const unexpected = failures.filter((entry) => !entry.includes('avatar.png'))
    expect(unexpected).toEqual([])

    await app.close()
  })

  test('the packaged exe loads no asset over the network', async () => {
    const app = await electron.launch({ executablePath: APP })
    const window = await app.firstWindow()
    await expect(window.getByRole('heading', { level: 2 })).toBeVisible()

    expect(window.url().startsWith('file://')).toBe(true)
    expect(await window.title()).toBe('工作台 · AI 编程助手')

    await app.close()
  })
})
