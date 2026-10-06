import type { ReactNode } from 'react'
import type { ViewId } from './routes'

/** 全站统一的图标外壳：24 网格、1.7 描边、对屏幕阅读器隐藏。 */
export function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const NAV_ICONS: Record<ViewId, ReactNode> = {
  workbench: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2.2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2.2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2.2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2.2" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.6 19.2c0-3 2.4-5.2 5.4-5.2s5.4 2.2 5.4 5.2" />
      <path d="M16.2 11.4a3.1 3.1 0 1 0 0-6.2" />
      <path d="M17.4 14.4c2.2.5 3.6 2.2 3.6 4.4" />
    </>
  ),
  tasks: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="3.4" />
      <path d="m8.4 12.2 2.3 2.3 4.9-5" />
    </>
  ),
  kb: (
    <>
      <path d="M4 6.2A2.7 2.7 0 0 1 6.7 3.5H19v14.2H6.7A2.7 2.7 0 0 0 4 20.4z" />
      <path d="M8.2 7.6h7M8.2 11h4.6" />
    </>
  ),
  market: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <path d="M17 13.6v6.8M13.6 17h6.8" />
    </>
  ),
  projects: (
    <>
      <rect x="3.4" y="4" width="5" height="16" rx="2" />
      <rect x="9.6" y="4" width="5" height="10" rx="2" />
      <rect x="15.8" y="4" width="4.8" height="13" rx="2" />
    </>
  ),
  files: (
    <path d="M3.5 7.6A2.6 2.6 0 0 1 6.1 5h3.3l1.7 2.1H18a2.6 2.6 0 0 1 2.5 2.6v6.7A2.6 2.6 0 0 1 17.9 19H6.1a2.6 2.6 0 0 1-2.6-2.6z" />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.2v2.5M12 18.3v2.5M20.8 12h-2.5M5.7 12H3.2M18.2 5.8l-1.8 1.8M7.6 16.4l-1.8 1.8M18.2 18.2l-1.8-1.8M7.6 7.6 5.8 5.8" />
    </>
  ),
}

export const LogoMark = (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 3.2 19 20l-7-4.4L5 20z" />
    <path d="M12 3.2V20" />
  </svg>
)
