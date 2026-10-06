import { useEffect, useRef, useState } from 'react'
import AgentMentionPopover from './AgentMentionPopover'
import type { Agent } from '../../domain/types'
import './composer.css'

export interface ComposerProps {
  agents: Agent[]
  pending: boolean
  onSend: (text: string) => void
}

const QUICK_ACTIONS = [
  { id: 'upload', label: '上传文件' },
  { id: 'image', label: '插入图片' },
  { id: 'template', label: '使用模板' },
] as const

export function Composer({ agents, pending, onSend }: ComposerProps) {
  const [value, setValue] = useState('')
  const [mentionOpen, setMentionOpen] = useState(false)
  const boxRef = useRef<HTMLTextAreaElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const canSend = value.trim().length > 0 && !pending

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    box.style.height = 'auto'
    box.style.height = `${Math.min(box.scrollHeight, 120)}px`
  }, [value])

  function submit() {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    setMentionOpen(false)
  }

  function pickAgent(agent: Agent) {
    setValue((current) => {
      const needsSpace = current.length > 0 && !current.endsWith(' ')
      return `${current}${needsSpace ? ' ' : ''}@${agent.name} `
    })
    setMentionOpen(false)
    boxRef.current?.focus()
  }

  return (
    <section className="composer">
      <div className="composer-box">
        <label className="sr" htmlFor="composer-input">
          输入你的需求
        </label>
        <textarea
          id="composer-input"
          ref={boxRef}
          rows={1}
          value={value}
          placeholder="请输入你的需求，或直接选择常用指令…"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
        />

        <div className="composer-bar">
          <button
            className="quick"
            type="button"
            ref={triggerRef}
            aria-haspopup="listbox"
            aria-expanded={mentionOpen}
            onClick={() => setMentionOpen((open) => !open)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3.6" />
              <path d="M15.6 8.4v4.4a3.4 3.4 0 0 0 3.4-2.4 7 7 0 1 0-2.6 7.5" />
            </svg>
            选择智能体
          </button>

          {QUICK_ACTIONS.map((action) => (
            <button key={action.id} className="quick" type="button">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3.5" y="3.5" width="17" height="17" rx="3.2" />
                <path d="M3.5 9.4h17" />
              </svg>
              {action.label}
            </button>
          ))}

          <div className="composer-send">
            <button className="icon-btn" type="button" aria-label="语音输入">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="3" width="6" height="10" rx="3" />
                <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
              </svg>
            </button>
            <button
              className="btn-send"
              type="button"
              aria-label="发送"
              disabled={!canSend}
              onClick={submit}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.5 3.5 3.8 10.2l6.6 2.6 2.6 6.6z" />
                <path d="m10.4 12.8 10.1-9.3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AgentMentionPopover
        agents={agents}
        open={mentionOpen}
        onPick={pickAgent}
        onClose={() => setMentionOpen(false)}
        triggerRef={triggerRef}
      />
    </section>
  )
}

export default Composer
