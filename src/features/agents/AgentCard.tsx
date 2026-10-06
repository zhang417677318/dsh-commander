import type { Agent, AgentStatus } from '../../domain/types'
import { CATEGORY_TONE, categoryOf } from './categories'

const STATUS_LABEL: Record<AgentStatus, string> = {
  online: '在线',
  idle: '待命',
  running: '运行中',
}

export function AgentCard({ agent, hidden }: { agent: Agent; hidden: boolean }) {
  const tone = CATEGORY_TONE[categoryOf(agent)]

  return (
    <article className="agent" hidden={hidden}>
      <span className={`agent-icon ${tone}`} aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8.6" r="3.4" />
          <path d="M5.6 19.4c0-3.2 2.9-5.4 6.4-5.4s6.4 2.2 6.4 5.4" />
        </svg>
      </span>
      <span className="agent-meta">
        <strong>{agent.name}</strong>
        <span>{agent.role}</span>
      </span>
      <span className={`state ${agent.status === 'online' ? 'on' : 'idle'}`}>
        {STATUS_LABEL[agent.status]}
      </span>
    </article>
  )
}

export default AgentCard
