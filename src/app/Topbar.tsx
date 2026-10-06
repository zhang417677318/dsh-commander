export function Topbar() {
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

        <div className="win-controls" aria-hidden="true">
          <span className="win-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M5 12h14" />
            </svg>
          </span>
          <span className="win-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="5" y="5" width="14" height="14" rx="1.5" />
            </svg>
          </span>
          <span className="win-btn win-btn-close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
