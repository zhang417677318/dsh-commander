/**
 * 桌面端桥接层。
 *
 * 浏览器里 `window.dshDesktop` 不存在，返回 null；组件据此把窗口控制降级为不可用，
 * 而不是留一个点了没反应的假按钮。
 */
export interface DesktopBridge {
  readonly isDesktop: true
  readonly platform: string
  minimize(): void
  toggleMaximize(): void
  close(): void
  isMaximized(): Promise<boolean>
  onMaximizedChange(listener: (maximized: boolean) => void): () => void
}

declare global {
  interface Window {
    dshDesktop?: DesktopBridge
  }
}

export function desktopBridge(): DesktopBridge | null {
  if (typeof window === 'undefined') return null
  return window.dshDesktop ?? null
}
