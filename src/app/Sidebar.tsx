import { Icon, LogoMark, NAV_ICONS } from './icons'
import { NAV_ITEMS, type ViewId } from './routes'

export interface SidebarProps {
  view: ViewId
  onNavigate: (view: ViewId) => void
}

export function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark">{LogoMark}</span>
        <div className="logo-text">
          <h1>AI 编程助手</h1>
          <p>让每个想法都有智能体帮你实现</p>
        </div>
      </div>

      <nav className="nav" aria-label="主导航">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nav-item"
            aria-current={item.id === view ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon>{NAV_ICONS[item.id]}</Icon>
            <span>{item.label}</span>
            {item.badge === undefined ? null : (
              <span className="nav-badge" aria-label={`${item.badge} 个进行中`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="side-spacer" />

      <div className="upsell">
        <span className="upsell-orb" aria-hidden="true" />
        <h4>开通专业版</h4>
        <p>解锁更多 AI 员工与高级模型</p>
        <button className="btn-upgrade" type="button">
          立即升级
        </button>
      </div>

      <button className="profile" type="button">
        <span className="av av-32" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="9" r="3.6" />
            <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
          </svg>
        </span>
        <span className="profile-meta">
          <strong>李晓晨</strong>
          <span>个人工作室</span>
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-4)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </aside>
  )
}

export default Sidebar
