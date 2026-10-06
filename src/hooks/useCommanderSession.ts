import { useCallback, useEffect, useState } from 'react'
import type { CommanderSession, Message } from '../domain/types'
import type { SessionSource } from '../domain/session-source'

export type SessionStatus = 'loading' | 'ready' | 'error'

export interface CommanderSessionState {
  status: SessionStatus
  session: CommanderSession | null
  pending: boolean
  error: Error | null
  send: (text: string) => Promise<void>
  retry: () => void
}

let localSeq = 0

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause))
}

function clock(): string {
  return new Date().toTimeString().slice(0, 5)
}

/**
 * 会话状态机。
 *
 * `source` 是 effect 依赖，调用方必须传稳定实例；每次渲染新建 source 会造成无限重新加载。
 */
export function useCommanderSession(source: SessionSource): CommanderSessionState {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [session, setSession] = useState<CommanderSession | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)

    source.load().then(
      (next) => {
        if (cancelled) return
        setSession(next)
        setStatus('ready')
      },
      (cause: unknown) => {
        if (cancelled) return
        setError(toError(cause))
        setStatus('error')
      },
    )

    return () => {
      cancelled = true
    }
  }, [source, reloadKey])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (trimmed.length === 0) return

      const optimistic: Message = {
        id: `m-local-${++localSeq}`,
        author: 'user',
        at: clock(),
        text: trimmed,
      }

      setPending(true)
      setError(null)
      setSession((current) =>
        current ? { ...current, messages: [...current.messages, optimistic] } : current,
      )

      try {
        const reply = await source.send(trimmed)
        setSession((current) =>
          current ? { ...current, messages: [...current.messages, reply] } : current,
        )
      } catch (cause: unknown) {
        // 发送失败不清空会话：界面仍可继续使用，错误单独暴露给调用方展示。
        setError(toError(cause))
      } finally {
        setPending(false)
      }
    },
    [source],
  )

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  return { status, session, pending, error, send, retry }
}
