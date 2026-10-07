import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // Electron 与打包产物测试会拉起真实应用，多 worker 并行会互相抢资源导致偶发失败。
  // 串行跑完整套只要十几秒，用稳定性换这点时间很划算。
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1600, height: 900 },
    baseURL: 'http://127.0.0.1:5199',
  },
  webServer: {
    // 显式绑 IPv4：默认的 localhost 在 Node 17+ 会解析到 ::1，
    // Electron 侧连 127.0.0.1 就会 chrome-error。
    command: 'pnpm dev --port 5199 --strictPort --host 127.0.0.1',
    port: 5199,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
