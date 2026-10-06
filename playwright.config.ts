import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
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
