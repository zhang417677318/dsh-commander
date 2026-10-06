import { useEffect, useRef, type RefObject } from 'react'
import type { Agent } from '../../domain/types'

export interface AgentMentionPopoverProps {
  agents: Agent[]
  open: boolean
  onPick: (agent: Agent) => void
  onClose: () => void
  /** 触发按钮：点击它不应被判定为「点了外部」，否则会和开关逻辑打架。 */
  triggerRef?: RefObject<HTMLElement | null>
}

export function AgentMentionPopover({
  agents,
  open,
  onPick,
  onClose,
  triggerRef,
}: AgentMentionPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onClose()
      triggerRef?.current?.focus()
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (triggerRef?.current?.contains(target)) return
      onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open, onClose, triggerRef])

  if (!open) return null

  return (
    <div className="popover" ref={panelRef} role="listbox" aria-label="选择要 @ 的智能体">
      <h4 className="popover-title">选择要 @ 的智能体</h4>
      {agents.map((agent) => (
        <button
          key={agent.id}
          type="button"
          role="option"
          aria-selected={false}
          className="pop-item"
          onClick={() => onPick(agent)}
        >
          <span className="av av-28 agent-dot" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8.6" r="3.4" />
              <path d="M5.6 19.4c0-3.2 2.9-5.4 6.4-5.4s6.4 2.2 6.4 5.4" />
            </svg>
          </span>
          <span className="pop-meta">
            <strong>{agent.name}</strong>
            <span>{agent.role}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default AgentMentionPopover
