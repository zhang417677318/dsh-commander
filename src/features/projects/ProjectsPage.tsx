import WorkspaceGate from '../../app/WorkspaceGate'
import type { Project, ProjectStatus, WorkspaceSource } from '../../domain/workspace'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: '进行中',
  delivered: '已交付',
  planned: '规划中',
}

const MEMBER_TONE = [
  'linear-gradient(135deg,#60A5FA,#2563EB)',
  'linear-gradient(135deg,#F472B6,#DB2777)',
  'linear-gradient(135deg,#5EEAD4,#0891B2)',
  'linear-gradient(135deg,#FCD34D,#F59E0B)',
]

function ProjectCard({ project }: { project: Project }) {
  const shown = project.members.slice(0, 3)
  const rest = project.members.length - shown.length

  return (
    <article className="glass proj">
      <div className="proj-top">
        <span className={`plug-ico tone-${project.tone}`} aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3.5" width="16" height="17" rx="3.4" />
            <path d="M8.5 9.5h7M8.5 13.5h4.5" />
          </svg>
        </span>
        <span className="nm">
          <strong>{project.name}</strong>
          <span>
            {STATUS_LABEL[project.status]} · {project.updatedAt}
          </span>
        </span>
        <span className={`state ${project.status === 'active' ? 'on' : 'idle'}`}>
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <span
        className="bar"
        role="progressbar"
        aria-valuenow={project.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${project.name} 完成度 ${project.progress}%`}
      >
        <i style={{ width: `${project.progress}%` }} />
      </span>

      <div className="milestone">
        完成度 {project.progress}%
        <span className="dotline" />
        {project.milestones.done} / {project.milestones.total} 个里程碑
      </div>

      <div className="member-foot" style={{ borderTop: 0, paddingTop: 0 }}>
        <span className="stack">
          {shown.map((member, index) => (
            <span
              key={member}
              className="dot"
              style={{ background: MEMBER_TONE[index % MEMBER_TONE.length] }}
              title={member}
            />
          ))}
          {rest > 0 ? <span className="more">+{rest}</span> : null}
        </span>
        <span className="mini" style={{ marginLeft: 'auto' }}>
          {project.taskCount} 个任务
        </span>
      </div>
    </article>
  )
}

export function ProjectsPage({ source }: { source: WorkspaceSource }) {
  return (
    <WorkspaceGate source={source} label="项目管理">
      {({ projects, milestones, deliverables, activity }) => (
        <div className="view view--full">
          <div className="page">
            <div className="page-head">
              <div className="ph-text">
                <h2>项目管理</h2>
                <p>按项目归拢任务、文件与交付物，掌握整体推进节奏</p>
              </div>
              <div className="page-actions">
                <button className="btn-ghost" type="button">
                  归档项目
                </button>
                <button className="btn-primary" type="button">
                  新建项目
                </button>
              </div>
            </div>

            <div className="grid g3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="glass card">
              <div className="card-head">
                <h3>美容院小程序 · 里程碑</h3>
                <span className="aside">当前阶段：页面开发</span>
              </div>
              <ol className="timeline">
                {milestones.map((milestone) => (
                  <li className="tl-node" key={milestone.id} data-on={milestone.done ? '1' : '0'}>
                    <span className="tl-dot" aria-hidden="true" />
                    {milestone.label}
                    <span className="sr">{milestone.done ? '，已完成' : '，未开始'}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid g2">
              <div className="glass card">
                <div className="card-head">
                  <h3>最近交付物</h3>
                  <span className="aside">来自 3 个智能体</span>
                </div>
                <div className="stack-col" style={{ gap: 8 }}>
                  {deliverables.map((item) => (
                    <div className="doc" key={item.id}>
                      <span
                        className="doc-ico"
                        style={{
                          background:
                            item.badge === 'UI'
                              ? 'linear-gradient(135deg,#5EEAD4,#0891B2)'
                              : item.badge === 'CODE'
                                ? 'linear-gradient(135deg,#60A5FA,#2563EB)'
                                : 'linear-gradient(135deg,#FCD34D,#F59E0B)',
                        }}
                        aria-hidden="true"
                      >
                        {item.badge}
                      </span>
                      <span className="doc-meta">
                        <strong>{item.name}</strong>
                        <span>{item.meta}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass card">
                <div className="card-head">
                  <h3>项目动态</h3>
                  <span className="aside">最近 2 小时</span>
                </div>
                <div className="log">
                  {activity.map((entry) => (
                    <div className="log-item" key={`${entry.at}-${entry.agent}`}>
                      <span
                        className={`log-dot ${entry.state === 'done' ? 'ld-done' : entry.state === 'run' ? 'ld-run' : 'ld-idle'}`}
                        aria-hidden="true"
                      />
                      <span className="log-time">{entry.at}</span>
                      <span className="log-body">
                        <strong>{entry.agent}</strong>
                        <p>{entry.text}</p>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceGate>
  )
}

export default ProjectsPage
