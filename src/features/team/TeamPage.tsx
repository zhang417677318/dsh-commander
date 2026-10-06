import WorkspaceGate from '../../app/WorkspaceGate'
import { CATEGORY_TONE, categoryOf } from '../agents/categories'
import type { TeamMember, WorkspaceSource } from '../../domain/workspace'
import type { AgentStatus } from '../../domain/types'
import './team.css'

const STATUS_LABEL: Record<AgentStatus, string> = {
  online: '在线',
  idle: '待命',
  running: '运行中',
}

function MemberCard({ member }: { member: TeamMember }) {
  const tone = CATEGORY_TONE[categoryOf(member)]

  return (
    <article className="glass card member">
      <div className="member-top">
        <span className={`plug-ico ${tone}`} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8.6" r="3.4" />
            <path d="M5.6 19.4c0-3.2 2.9-5.4 6.4-5.4s6.4 2.2 6.4 5.4" />
          </svg>
        </span>
        <span className="member-who">
          <strong>{member.name}</strong>
          <span>{member.role}</span>
        </span>
        <span className={`state ${member.status === 'online' ? 'on' : 'idle'}`}>
          {STATUS_LABEL[member.status]}
        </span>
      </div>

      <div className="chip-row">
        <span className="skill model">{member.model}</span>
        {member.skills.map((skill) => (
          <span className="skill" key={skill}>
            {skill}
          </span>
        ))}
      </div>

      <div className="assignment">
        <div className="t">{member.assignment.title}</div>
        <div className="r">{member.assignment.detail}</div>
        {member.assignment.progress === undefined ? null : (
          <span
            className="bar info"
            style={{ marginTop: 8 }}
            role="progressbar"
            aria-valuenow={member.assignment.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${member.name}当前任务进度 ${member.assignment.progress}%`}
          >
            <i style={{ width: `${member.assignment.progress}%` }} />
          </span>
        )}
      </div>

      <div className="member-foot">
        <span className="mini">
          累计任务 <b>{member.stats.total}</b>
        </span>
        <span className="mini">
          {member.stats.secondaryLabel} <b>{member.stats.secondaryValue}</b>
        </span>
        <button className="btn-ghost btn-ghost-sm member-action" type="button">
          配置
        </button>
      </div>
    </article>
  )
}

export function TeamPage({ source }: { source: WorkspaceSource }) {
  return (
    <WorkspaceGate source={source} label="我的团队">
      {({ team }) => {
        const online = team.filter((member) => member.status === 'online').length
        const running = team.filter((member) => member.assignment.progress !== undefined).length

        return (
          <div className="view view--full">
            <div className="page">
              <div className="page-head">
                <div className="ph-text">
                  <h2>我的团队</h2>
                  <p>管理你的 AI 智能体，配置技能、模型与任务负载</p>
                </div>
                <div className="page-actions">
                  <button className="btn-ghost" type="button">
                    导入模板
                  </button>
                  <button className="btn-primary" type="button">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5.5v13M5.5 12h13" />
                    </svg>
                    新建智能体
                  </button>
                </div>
              </div>

              <div className="stat-row">
                <div className="glass stat">
                  <span className="k">智能体总数</span>
                  <span className="v">{team.length}</span>
                  <span className="d">还可添加 2 个</span>
                </div>
                <div className="glass stat" data-tone="green">
                  <span className="k">在线</span>
                  <span className="v">{online}</span>
                  <span className="d">{team.length - online} 位待命</span>
                </div>
                <div className="glass stat" data-tone="teal">
                  <span className="k">运行中任务</span>
                  <span className="v">{running}</span>
                  <span className="d">平均 2 分 40 秒</span>
                </div>
                <div className="glass stat" data-tone="amber">
                  <span className="k">今日 token</span>
                  <span className="v">
                    1.24<small>M</small>
                  </span>
                  <span className="d">折合 ¥3.80</span>
                </div>
              </div>

              <div className="grid g3">
                {team.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          </div>
        )
      }}
    </WorkspaceGate>
  )
}

export default TeamPage
