import type { WorkspaceData, WorkspaceSource } from './workspace'
import { WORKSPACE_SEED } from './seed/workspace-seed'

export interface MockWorkspaceOptions {
  latencyMs?: number
}

export class MockWorkspaceSource implements WorkspaceSource {
  private readonly latency: number

  constructor(options: MockWorkspaceOptions = {}) {
    this.latency = options.latencyMs ?? 200
  }

  async load(): Promise<WorkspaceData> {
    if (this.latency > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latency))
    }
    return structuredClone(WORKSPACE_SEED)
  }
}
