import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Electron 打包后用 file:// 加载 dist/index.html，
  // 绝对路径会解析到盘符根目录导致白屏，必须用相对路径。
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    // e2e 由 Playwright 跑，不能让 vitest 也收进来
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
  },
})
