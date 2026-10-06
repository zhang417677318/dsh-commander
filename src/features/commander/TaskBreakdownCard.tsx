import type { BreakdownItem, TaskState } from '../../domain/types'

const STATE_LABEL: Record<TaskState, string> = {
  done: '已完成',
  running: '进行中',
  queued: '等待派发',
}

const STATE_CLASS: Record<TaskState, string> = {
  done: 'st-done',
  running: 'st-run',
  queued: 'st-wait',
}

const ROW_ICONS = [
  <g key="palette">
    <circle cx="12" cy="12" r="8.6" />
    <path d="m12 3.4 3 6.2-3 1.4-3-1.4z" />
    <path d="m3.6 13.6 6-1.4 1.4 3-3 5.4" />
  </g>,
  <path key="code" d="m8.4 6.4-5 5.6 5 5.6M15.6 6.4l5 5.6-5 5.6" />,
  <g key="shield">
    <path d="M12 21.2s7.6-3.8 7.6-9.6V5.6L12 2.8 4.4 5.6v6c0 5.8 7.6 9.6 7.6 9.6z" />
    <path d="m9 12 2.1 2.1 4-4" />
  </g>,
]

export function TaskBreakdownCard({ items }: { items: BreakdownItem[] }) {
  return (
    <section className="taskcard" aria-label="任务拆解">
      <header className="taskcard-head">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary-600)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 3 9 5-9 5-9-5z" />
          <path d="m3 13 9 5 9-5" />
        </svg>
        <h4>任务拆解 · {items.length} 个智能体协同</h4>
      </header>

      <ol>
        {items.map((item, index) => (
          <li key={item.id} className="task-row">
            <span className="task-idx" aria-hidden="true">
              {item.index}
            </span>
            <span className="task-icon" aria-hidden="true">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ROW_ICONS[index % ROW_ICONS.length]}
              </svg>
            </span>
            <span className="task-text">
              <strong>{item.agentName}</strong>
              <span>{item.action}</span>
            </span>
            <span className={`task-state ${STATE_CLASS[item.state]}`}>
              {STATE_LABEL[item.state]}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default TaskBreakdownCard
