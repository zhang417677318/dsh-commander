import { useMemo, useState } from 'react'
import AgentCard from './AgentCard'
import type { Agent } from '../../domain/types'
import './agents.css'

export const TABS = ['全部', '开发', '设计', '运维', '测试'] as const
export type Tab = (typeof TABS)[number]
export type Category = '开发' | '设计' | '测试' | '运维' | '文案'

const RULES: readonly { match: string; category: Category }[] = [
  { match: '前端', category: '开发' },
  { match: '后端', category: '开发' },
  { match: 'UI', category: '设计' },
  { match: '测试', category: '测试' },
  { match: '运维', category: '运维' },
  { match: '文案', category: '文案' },
]

/** 分类规则保持纯函数，便于单独验证边界。 */
export function categoryOf(agent: Pick<Agent, 'name' | 'role'>): Category {
  const haystack = `${agent.name} ${agent.role}`
  return RULES.find((rule) => haystack.includes(rule.match))?.category ?? '开发'
}

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
