import { useEffect, useState } from 'react'
import { desktopBridge, type DesktopBridge } from './desktop'

/** 订阅窗口最大化状态，让按钮在「最大化」和「还原」之间切换。 */
function useMaximized(bridge: DesktopBridge | null): boolean {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (!bridge) {
      setMaximized(false)
      return
    }
    let alive = true
    void bridge.isMaximized().then((value) => {
      if (alive) setMaximized(value)
    })
    const unsubscribe = bridge.onMaximizedChange(setMaximized)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [bridge])

  return maximized
}

export function Topbar() {
  const bridge = desktopBridge()
  const maximized = useMaximized(bridge)

  return (
    <header className="topbar">
      <div className="search">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.6" />
          <path d="m20.2 20.2-4.3-4.3" />
        </svg>
        <label className="sr" htmlFor="global-search">
          搜索
        </label>
        <input
          id="global-search"
          type="search"
          placeholder="搜索项目、文件、功能或对话…"
          autoComplete="off"
        />
      </div>

      <div className="top-actions">
        <button className="icon-btn" type="button" aria-label="通知">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 15.6V11a6 6 0 1 0-12 0v4.6L4.5 18h15z" />
            <path d="M9.8 21h4.4" />
          </svg>
          <span className="dot-badge" aria-hidden="true" />
        </button>

        <button className="icon-btn" type="button" aria-label="切换主题">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4.1" />
            <path d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
          </svg>
        </button>

        <button className="plan-pill" type="button">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 16.5h16l-1.3-8.2-3.9 3.1-3-5-3 5-3.9-3.1z" />
            <path d="M7.5 20h9" />
          </svg>
          专业版
        </button>

        <div className="win-controls" role="group" aria-label="窗口控制">
          <button
            className="win-btn"
            type="button"
            aria-label="最小化"
            disabled={bridge === null}
            onClick={() => bridge?.minimize()}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            className="win-btn"
            type="button"
            aria-label={maximized ? '还原窗口' : '最大化'}
            disabled={bridge === null}
            onClick={() => bridge?.toggleMaximize()}
          >
            {maximized ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <rect x="4.5" y="8" width="11.5" height="11.5" rx="1.5" />
                <path d="M8.5 8V5.5A1.5 1.5 0 0 1 10 4h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 15h-2" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="1.5" />
              </svg>
            )}
          </button>
          <button
            className="win-btn win-btn-close"
            type="button"
            aria-label="关闭窗口"
            disabled={bridge === null}
            onClick={() => bridge?.close()}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Topbar
