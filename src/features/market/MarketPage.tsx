import { useState } from 'react'
import WorkspaceGate from '../../app/WorkspaceGate'
import type { Plugin, PluginCategory, WorkspaceSource } from '../../domain/workspace'

const CATEGORIES: readonly (PluginCategory | '全部')[] = [
  '全部',
  '开发工具',
  '设计资源',
  '效率增强',
  '数据连接',
]

const TONE_CLASS: Record<Plugin['tone'], string> = {
  blue: 'tone-blue',
  violet: 'tone-violet',
  pink: 'tone-pink',
  teal: 'tone-teal',
  amber: 'tone-amber',
  slate: 'tone-slate',
}

function Star() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 3 2.6 6 6.4.6-4.9 4.3 1.4 6.1L12 16.7 6.5 20l1.4-6.1L3 9.6l6.4-.6z" />
    </svg>
  )
}

export function MarketPage({ source }: { source: WorkspaceSource }) {
  const [category, setCategory] = useState<PluginCategory | '全部'>('全部')
  const [installed, setInstalled] = useState<Record<string, boolean>>({})

  return (
    <WorkspaceGate source={source} label="插件市场">
      {({ plugins }) => {
        const isInstalled = (plugin: Plugin) => installed[plugin.id] ?? plugin.installed
        const visible = plugins.filter((plugin) => category === '全部' || plugin.category === category)
        const featured = plugins[0]

        return (
          <div className="view view--full">
            <div className="page">
              <div className="page-head">
                <div className="ph-text">
                  <h2>插件市场</h2>
                  <p>为智能体安装能力扩展，装完立即对全团队生效</p>
                </div>
                <div className="page-actions">
                  <span className="btn-ghost" aria-live="polite">
                    已安装 {plugins.filter(isInstalled).length}
                  </span>
                </div>
              </div>

              {featured === undefined ? null : (
                <div className="glass feature">
                  <span
                    className="plug-ico"
                    style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#A78BFA,#7C3AED)' }}
                    aria-hidden="true"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3 9 5-9 5-9-5z" />
                      <path d="m3 13 9 5 9-5" />
                    </svg>
                  </span>
                  <div className="ft">
                    <span className="skill model">本周精选</span>
                    <h3>{featured.name}</h3>
                    <p>{featured.description}</p>
                  </div>
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => setInstalled((map) => ({ ...map, [featured.id]: !isInstalled(featured) }))}
                  >
                    {isInstalled(featured) ? '已安装' : '安装插件'}
                  </button>
                </div>
              )}

              <div className="seg" role="tablist" aria-label="插件分类" style={{ alignSelf: 'flex-start' }}>
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={item === category}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="grid g3">
                {visible.map((plugin) => {
                  const on = isInstalled(plugin)
                  return (
                    <article className="glass plug" key={plugin.id}>
                      <div className="plug-top">
                        <span className={`plug-ico ${TONE_CLASS[plugin.tone]}`} aria-hidden="true">
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                               strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
                            <path d="m8 12 3 3 5-6" />
                          </svg>
                        </span>
                        <span className="nm">
                          <strong>{plugin.name}</strong>
                          <span>
                            {plugin.author} · {plugin.category}
                          </span>
                        </span>
                      </div>
                      <p>{plugin.description}</p>
                      <div className="plug-foot">
                        <span className="rate">
                          <Star />
                          {plugin.rating.toFixed(1)}
                        </span>
                        <span className="mini">{plugin.installs} 安装</span>
                        <button
                          className="btn-install"
                          type="button"
                          data-on={on ? '1' : '0'}
                          onClick={() => setInstalled((map) => ({ ...map, [plugin.id]: !on }))}
                        >
                          {on ? '已安装' : '安装'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }}
    </WorkspaceGate>
  )
}

export default MarketPage
