/**
 * 桌面端开发启动器：先编译 Electron 主进程，再起 Vite，等端口就绪后拉起 Electron。
 * 退出时把两个子进程一起收掉，避免留下孤儿。
 */
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const port = process.env.DSH_DEV_PORT ?? '5180'
const url = `http://127.0.0.1:${port}`

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: false, ...options })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))))
  })
}

async function waitForServer(target, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(target)
      if (response.ok) return
    } catch {
      // 服务还没起来，继续等
    }
    await delay(200)
  }
  throw new Error(`dev server did not become ready at ${target}`)
}

const children = []
function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

await run(process.execPath, ['node_modules/esbuild/bin/esbuild', 'electron/main.ts',
  '--bundle', '--platform=node', '--format=esm', '--external:electron',
  '--outfile=electron/dist/main.mjs'])
await run(process.execPath, ['node_modules/esbuild/bin/esbuild', 'electron/preload.ts',
  '--bundle', '--platform=node', '--format=cjs', '--external:electron',
  '--outfile=electron/dist/preload.cjs'])

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', port, '--strictPort', '--host', '127.0.0.1'], {
  cwd: root,
  stdio: 'inherit',
})
children.push(vite)
vite.on('exit', (code) => shutdown(code ?? 0))

await waitForServer(url)

const electron = spawn(process.execPath, ['node_modules/electron/cli.js', '.'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, DSH_DEV_SERVER_URL: url },
})
children.push(electron)
electron.on('exit', () => shutdown(0))
