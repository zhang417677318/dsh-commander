import { useEffect, useMemo, useState } from 'react'
import AppShell from './app/AppShell'
import { VIEW_TITLES, readView, type ViewId } from './app/routes'
import WorkbenchPage from './features/workbench/WorkbenchPage'
import TeamPage from './features/team/TeamPage'
import TasksPage from './features/tasks/TasksPage'
import KnowledgePage from './features/knowledge/KnowledgePage'
import MarketPage from './features/market/MarketPage'
import ProjectsPage from './features/projects/ProjectsPage'
import FilesPage from './features/files/FilesPage'
import SettingsPage from './features/settings/SettingsPage'
import { MockSessionSource } from './domain/mock-session'
import { MockWorkspaceSource } from './domain/mock-workspace'
import './styles/tokens.css'
import './styles/global.css'
import './styles/layout.css'

export default function App() {
  const [view, setView] = useState<ViewId>(() => readView(location.hash))
  // 数据源必须是稳定实例：useCommanderSession 以它作为 effect 依赖。
  const sessionSource = useMemo(() => new MockSessionSource(), [])
  const workspaceSource = useMemo(() => new MockWorkspaceSource(), [])

  useEffect(() => {
    const sync = () => setView(readView(location.hash))
    addEventListener('hashchange', sync)
    return () => removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    document.title = VIEW_TITLES[view]
  }, [view])

  const navigate = (next: ViewId) => {
    location.hash = next
  }

  function renderView() {
    switch (view) {
      case 'workbench':
        return <WorkbenchPage source={sessionSource} />
      case 'team':
        return <TeamPage source={workspaceSource} />
      case 'tasks':
        return <TasksPage source={workspaceSource} />
      case 'kb':
        return <KnowledgePage source={workspaceSource} />
      case 'market':
        return <MarketPage source={workspaceSource} />
      case 'projects':
        return <ProjectsPage source={workspaceSource} />
      case 'files':
        return <FilesPage source={workspaceSource} />
      case 'settings':
        return <SettingsPage source={workspaceSource} />
      default:
        return null
    }
  }

  return (
    <AppShell view={view} onNavigate={navigate}>
      {renderView()}
    </AppShell>
  )
}
