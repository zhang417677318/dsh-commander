import type { LogEntry, LogState } from '../../domain/types'

const DOT_CLASS: Record<LogState, string> = {
  run: 'ld-run',
  done: 'ld-done',
  idle: 'ld-idle',
}

export function LiveLog({ entries }: { entries: LogEntry[] }) {
  return (
    <section className="glass panel" role="log" aria-live="polite" aria-label="实时执行日志">
      <div className="panel-head">
        <h3>实时执行日志</h3>
        <button className="link" type="button">
          查看全部
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="log-empty">暂无执行记录</p>
      ) : (
        <div className="log">
          {entries.map((entry) => (
            <div className="log-item" key={`${entry.at}-${entry.agent}-${entry.text}`}>
              <span className={`log-dot ${DOT_CLASS[entry.state]}`} aria-hidden="true" />
              <span className="log-time">{entry.at}</span>
              <span className="log-body">
                <strong>{entry.agent}</strong>
                <p>{entry.text}</p>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default LiveLog
