import { useEffect, useState } from 'react'
import AppShell from './app/AppShell'
import { VIEW_TITLES, readView, type ViewId } from './app/routes'
import './styles/tokens.css'
import './styles/global.css'

export default function App() {
  const [view, setView] = useState<ViewId>(() => readView(location.hash))

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

  return (
    <AppShell view={view} onNavigate={navigate}>
      {/* v1 只交付工作台，其余七个视图的内容由后续计划实现 */}
    </AppShell>
  )
}
