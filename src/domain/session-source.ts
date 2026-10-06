import type { CommanderSession, Message } from './types'

/**
 * UI 与后端之间唯一的接缝。
 * v1 只提供 MockSessionSource；将来接 dsh 本地 Host 时新增 HostSessionSource 即可，
 * 组件层不需要任何改动。
 */
export interface SessionSource {
  load(): Promise<CommanderSession>
  send(text: string): Promise<Message>
}
