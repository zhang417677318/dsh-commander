import { useCommanderSession } from '../../hooks/useCommanderSession'
import type { SessionSource } from '../../domain/session-source'
import CommanderBanner from '../commander/CommanderBanner'
import MessageList from '../commander/MessageList'
import Composer from '../composer/Composer'
import AgentRail from '../agents/AgentRail'
import LiveLog from '../agents/LiveLog'
import './workbench.css'
import '../../styles/layout.css'

export interface WorkbenchPageProps {
  source: SessionSource
}

export function WorkbenchPage({ source }: WorkbenchPageProps) {
  const { status, session, pending, error, send, retry } = useCommanderSession(source)

  if (status === 'loading') {
    return (
      <div className="view view--full">
        <p className="page-status" role="status">
          正在连接指挥官…
        </p>
      </div>
    )
  }

  if (status === 'error' || session === null) {
    return (
      <div className="view view--full">
        <div className="page-error" role="alert">
          <strong>连接指挥官失败</strong>
          <p>{error?.message ?? '未知错误'}</p>
          <button className="btn-primary" type="button" onClick={retry}>
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="workspace">
        <CommanderBanner commander={session.commander} stage={session.stage} />
        <MessageList messages={session.messages} />
        <Composer agents={session.agents} pending={pending} onSend={send} />
      </div>

      <aside className="rightbar">
        <AgentRail agents={session.agents} />
        <LiveLog entries={session.log} />

        <section className="suggest">
          <span className="suggest-ico" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.6 18h4.8M10.4 21h3.2" />
              <path d="M12 3a6 6 0 0 1 3.4 10.9c-.6.4-.9 1-.9 1.7v.4H9.5v-.4c0-.7-.3-1.3-.9-1.7A6 6 0 0 1 12 3z" />
            </svg>
          </span>
          <p>
            <b>推荐使用</b>
            <br />
            你可以试试：「帮我生成一篇小红书种草文案」
          </p>
        </section>
      </aside>
    </div>
  )
}

export default WorkbenchPage
