import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import type { ViewId } from './routes'
import './shell.css'

export interface AppShellProps {
  view: ViewId
  onNavigate: (view: ViewId) => void
  /** 视图内容槽。v1 只交付工作台，其余视图暂为空。 */
  children?: ReactNode
}

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  return (
    <div className="app">
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <Sidebar view={view} onNavigate={onNavigate} />
      <div className="main">
        <Topbar />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
