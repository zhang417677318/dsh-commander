import { useEffect, useState } from 'react'
import type { WorkspaceData, WorkspaceSource } from '../domain/workspace'

export type WorkspaceStatus = 'loading' | 'ready' | 'error'

export interface WorkspaceState {
  status: WorkspaceStatus
  data: WorkspaceData | null
  error: Error | null
  retry: () => void
}

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause))
}

/** 与 useCommanderSession 同构：source 必须是稳定实例。 */
export function useWorkspace(source: WorkspaceSource): WorkspaceState {
  const [status, setStatus] = useState<WorkspaceStatus>('loading')
  const [data, setData] = useState<WorkspaceData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)

    source.load().then(
      (next) => {
        if (cancelled) return
        setData(next)
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

  return {
    status,
    data,
    error,
    retry: () => setReloadKey((key) => key + 1),
  }
}
