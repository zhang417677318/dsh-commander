import type { ReactNode } from 'react'
import { useWorkspace } from '../hooks/useWorkspace'
import type { WorkspaceData, WorkspaceSource } from '../domain/workspace'

export interface WorkspaceGateProps {
  source: WorkspaceSource
  /** 用于加载与错误文案，例如「我的团队」 */
  label: string
  children: (data: WorkspaceData) => ReactNode
}

/**
 * 七个功能页共用的加载 / 错误 / 就绪三态外壳。
 * 页面只负责渲染就绪后的内容，三态处理不重复实现。
 */
export function WorkspaceGate({ source, label, children }: WorkspaceGateProps) {
  const { status, data, error, retry } = useWorkspace(source)

  if (status === 'loading') {
    return (
      <div className="view view--full">
        <p className="page-status" role="status">
          正在加载{label}…
        </p>
      </div>
    )
  }

  if (status === 'error' || data === null) {
    return (
      <div className="view view--full">
        <div className="page-error" role="alert">
          <strong>加载{label}失败</strong>
          <p>{error?.message ?? '未知错误'}</p>
          <button className="btn-primary" type="button" onClick={retry}>
            重试
          </button>
        </div>
      </div>
    )
  }

  return <>{children(data)}</>
}

export default WorkspaceGate
