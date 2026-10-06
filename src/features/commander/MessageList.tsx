import TaskBreakdownCard from './TaskBreakdownCard'
import { COMMANDER_IDENTITY, DEFAULT_USER_NAME } from '../../domain/defaults'
import type { CommanderIdentity, Message } from '../../domain/types'

export interface MessageListProps {
  messages: Message[]
  userName?: string
  commander?: CommanderIdentity
}

function UserAvatar() {
  return (
    <span className="av av-32" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="9" r="3.6" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      </svg>
    </span>
  )
}

function CommanderAvatar() {
  return (
    <span className="av av-32" aria-hidden="true">
      <img src="avatar.png" alt="" onError={(event) => event.currentTarget.remove()} />
      <svg className="art" viewBox="0 0 64 64">
        <path
          d="M32 10.8c-9.8 0-15.8 6.1-15.8 15.2 0 6 1.6 11.2 4.2 15.8l-1.1 6.6h25.4l-1.1-6.6c2.6-4.6 4.2-9.8 4.2-15.8 0-9.1-6-15.2-15.8-15.2z"
          fill="#0B5D74"
          fillOpacity={0.45}
        />
        <ellipse cx="32" cy="28.6" rx="8.5" ry="10.1" fill="#FFFFFF" fillOpacity={0.96} />
        <path
          d="M32 40.6c-9 0-16.3 5.7-16.3 13.3V64h32.6V53.9c0-7.6-7.3-13.3-16.3-13.3z"
          fill="#FFFFFF"
          fillOpacity={0.96}
        />
      </svg>
    </span>
  )
}

export function MessageList({
  messages,
  userName = DEFAULT_USER_NAME,
  commander = COMMANDER_IDENTITY,
}: MessageListProps) {
  return (
    <section className="thread" role="log" aria-live="polite" aria-label="与指挥官的协作记录">
      {messages.map((message) =>
        message.author === 'user' ? (
          <article key={message.id} className="msg me">
            <UserAvatar />
            <div className="msg-body">
              <div className="msg-head">
                <strong>{userName}</strong>
                <time>{message.at}</time>
              </div>
              <div className="bubble">{message.text}</div>
            </div>
          </article>
        ) : (
          <article key={message.id} className="msg">
            <CommanderAvatar />
            <div className="msg-body">
              <div className="msg-head">
                <strong>{commander.name}</strong>
                <span className="tag tag-sm">{commander.model}</span>
              </div>
              <div className="bubble">
                {message.text}
                {message.breakdown ? <TaskBreakdownCard items={message.breakdown} /> : null}
              </div>
            </div>
          </article>
        ),
      )}
    </section>
  )
}

export default MessageList
