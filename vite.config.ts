import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    // e2e 由 Playwright 跑，不能让 vitest 也收进来
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
  },
})
