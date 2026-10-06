import { useState } from 'react'
import WorkspaceGate from '../../app/WorkspaceGate'
import type { Task, TaskLane, TaskPriority, WorkspaceSource } from '../../domain/workspace'

const LANES: readonly { id: TaskLane; label: string }[] = [
  { id: 'queued', label: '待派发' },
  { id: 'running', label: '进行中' },
  { id: 'verify', label: '待验收' },
  { id: 'done', label: '已完成' },
]

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
}

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  high: 'p-hi',
  medium: 'p-mid',
  low: 'p-low',
}

const LANE_LABEL: Record<TaskLane, string> = {
  queued: '待派发',
  running: '进行中',
  verify: '待验收',
  done: '已完成',
}

function TaskCard({ task }: { task: Task }) {
  return (
    <article className="glass tk">
      <span className={`prio ${PRIORITY_CLASS[task.priority]}`}>
        {PRIORITY_LABEL[task.priority]}
      </span>
      <h4>{task.title}</h4>
      <div className="meta">
        {task.assignee} · {task.detail}
      </div>
      {task.progress === undefined ? null : (
        <span
          className="bar"
          role="progressbar"
          aria-valuenow={task.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${task.title} 进度 ${task.progress}%`}
        >
          <i style={{ width: `${task.progress}%` }} />
        </span>
      )}
      <div className="foot">
        <span className="mini">
          {task.eta !== undefined ? (
            <>
              预计 <b>{task.eta}</b>
            </>
          ) : task.acceptance !== undefined ? (
            <>
              验收{' '}
              <b>
                {task.acceptance.passed}/{task.acceptance.total}
              </b>
            </>
          ) : task.lane === 'done' ? (
            '已归档'
          ) : null}
        </span>
        <span className="mini" style={{ marginLeft: 'auto' }}>
          {task.code}
        </span>
      </div>
    </article>
  )
}

type ViewMode = 'board' | 'list'

export function TasksPage({ source }: { source: WorkspaceSource }) {
  const [mode, setMode] = useState<ViewMode>('board')

  return (
    <WorkspaceGate source={source} label="任务中心">
      {({ tasks }) => {
        const countOf = (lane: TaskLane) => tasks.filter((task) => task.lane === lane).length
        const busyAgents = new Set(
          tasks.filter((task) => task.lane === 'running').map((task) => task.assignee),
        ).size

        return (
          <div className="view view--full">
            <div className="page">
              <div className="page-head">
                <div className="ph-text">
                  <h2>任务中心</h2>
                  <p>指挥官派发的全部任务，按阶段跟踪进度与验收</p>
                </div>
                <div className="page-actions">
                  <div className="seg" role="tablist" aria-label="视图切换">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'board'}
                      onClick={() => setMode('board')}
                    >
                      看板
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'list'}
                      onClick={() => setMode('list')}
                    >
                      列表
                    </button>
                  </div>
                  <button className="btn-primary" type="button">
                    新建任务
                  </button>
                </div>
              </div>

              <div className="stat-row">
                <div className="glass stat">
                  <span className="k">待派发</span>
                  <span className="v">{countOf('queued')}</span>
                  <span className="d">等待智能体空闲</span>
                </div>
                <div className="glass stat" data-tone="teal">
                  <span className="k">进行中</span>
                  <span className="v">{countOf('running')}</span>
                  <span className="d">{busyAgents} 个智能体在跑</span>
                </div>
                <div className="glass stat" data-tone="amber">
                  <span className="k">待验收</span>
                  <span className="v">{countOf('verify')}</span>
                  <span className="d">需指挥官复核</span>
                </div>
                <div className="glass stat" data-tone="green">
                  <span className="k">今日完成</span>
                  <span className="v">12</span>
                  <span className="d">一次通过率 91%</span>
                </div>
              </div>

              {mode === 'board' ? (
                <div className="board">
                  {LANES.map((lane) => (
                    <section className="lane" data-lane={lane.id} key={lane.id} aria-label={lane.label}>
                      <div className="lane-head">
                        <span className="dot" aria-hidden="true" />
                        {lane.label}
                        <span className="n">{countOf(lane.id)}</span>
                      </div>
                      {tasks
                        .filter((task) => task.lane === lane.id)
                        .map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="glass card" style={{ padding: 0 }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>任务</th>
                        <th>阶段</th>
                        <th>指派</th>
                        <th>进度</th>
                        <th>编号</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>{LANE_LABEL[task.lane]}</td>
                          <td>{task.assignee}</td>
                          <td className="num">
                            {task.progress === undefined ? '—' : `${task.progress}%`}
                          </td>
                          <td className="num">{task.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      }}
    </WorkspaceGate>
  )
}

export default TasksPage
