import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const devServerUrl = process.env['DSH_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null

function windowOf(event: { sender: Electron.WebContents }): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

function broadcastMaximized(window: BrowserWindow) {
  window.webContents.send('window:maximized-changed', window.isMaximized())
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    frame: false,
    backgroundColor: '#F0FDFA',
    title: 'AI 编程助手',
    webPreferences: {
      preload: join(currentDir, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow = window

  // 先渲染再显示，避免白屏闪一下
  window.once('ready-to-show', () => window.show())

  // 外链交给系统浏览器，不在应用内开新窗口
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  window.on('maximize', () => broadcastMaximized(window))
  window.on('unmaximize', () => broadcastMaximized(window))
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })

  if (devServerUrl) {
    void window.loadURL(devServerUrl)
  } else {
    void window.loadFile(join(currentDir, '..', '..', 'dist', 'index.html'))
  }
}

ipcMain.on('window:minimize', (event) => {
  windowOf(event)?.minimize()
})

ipcMain.on('window:toggle-maximize', (event) => {
  const window = windowOf(event)
  if (!window) return
  if (window.isMaximized()) window.unmaximize()
  else window.maximize()
})

ipcMain.on('window:close', (event) => {
  windowOf(event)?.close()
})

ipcMain.handle('window:is-maximized', (event) => windowOf(event)?.isMaximized() ?? false)

void app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
