import { contextBridge, ipcRenderer } from 'electron'

/**
 * 渲染进程能看到的全部原生能力，只有这一小撮。
 * 不暴露 ipcRenderer 本体，避免渲染层拿到任意通道。
 */
const bridge = {
  isDesktop: true,
  platform: process.platform,
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized') as Promise<boolean>,
  onMaximizedChange: (listener: (maximized: boolean) => void) => {
    const handler = (_event: unknown, value: boolean) => listener(value)
    ipcRenderer.on('window:maximized-changed', handler)
    return () => {
      ipcRenderer.removeListener('window:maximized-changed', handler)
    }
  },
}

contextBridge.exposeInMainWorld('dshDesktop', bridge)
