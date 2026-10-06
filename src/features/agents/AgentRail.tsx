import { useMemo, useState } from 'react'
import AgentCard from './AgentCard'
import type { Agent } from '../../domain/types'
import { TABS, categoryOf, type Tab } from './categories'
import './agents.css'

export { TABS, categoryOf }
export type { Tab }

export function AgentRail({ agents }: { agents: Agent[] }) {
  const [tab, setTab] = useState<Tab>('全部')

  const categorized = useMemo(
    () => agents.map((agent) => ({ agent, category: categoryOf(agent) })),
    [agents],
  )

  return (
    <section className="glass panel" aria-labelledby="agent-rail-title">
      <div className="panel-head">
        <h3 id="agent-rail-title">我的智能体</h3>
        <button className="btn-add" type="button">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5.5v13M5.5 12h13" />
          </svg>
          添加
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="智能体分类">
        {TABS.map((item) => (
          <button
            key={item}
            className="tab"
            type="button"
            role="tab"
            aria-selected={item === tab}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="agents">
        {categorized.map(({ agent, category }) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            hidden={tab !== '全部' && category !== tab}
          />
        ))}
      </div>
    </section>
  )
}

export default AgentRail
