import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1600, height: 900 },
    baseURL: 'http://localhost:5199',
  },
  webServer: {
    command: 'pnpm dev --port 5199',
    port: 5199,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
