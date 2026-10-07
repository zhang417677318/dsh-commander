/**
 * 模型配置领域模型。
 *
 * 结构对齐 dsh 原生 Models 设置页：按提供商分行、每行可展开成编辑卡，
 * 凭据只写保存、模型目录按行编辑。
 */

/** 输入模态。dsh 里 DeepSeek 适配器写 `inputModalities`，pi-ai 写 `input`，界面层统一成这一个概念。 */
export type InputModality = 'text' | 'image'

export interface ProviderModel {
  id: string
  /** 可选展示名；未提供时回退到 id */
  name?: string
  contextWindow?: number
  maxTokens?: number
  input: InputModality[]
}

/**
 * 命中凭据引用的状态。
 * 未知是合法状态：只有确认存在才点绿、确认缺失才点红，读不到就不下结论。
 */
export type CredentialState = 'configured' | 'missing' | 'unknown'

/** 账号路由与官方路由的凭据来源不同，第三方还要协议与显示名。 */
export type ProviderKind = 'account' | 'official' | 'third-party'

/** 自定义模型 API 支持的协议标识符。 */
export type ApiProtocol =
  | 'openai-chat-completions'
  | 'openai-responses'
  | 'anthropic-messages'

export interface ModelProvider {
  /** 稳定的 settings 键，也是凭据引用词干，创建后不可改 */
  id: string
  label: string
  kind: ProviderKind
  /** 该提供商所属的 settings 命名空间 */
  settingsNamespace: string
  /** 配置里保存的凭据引用名；账号路由没有引用，第三方留空表示沿用原生认证 */
  credentialRef: string | null
  credentialState: CredentialState
  baseURL: string | null
  /** 端点输入框的占位示例，随协议变化 */
  baseURLPlaceholder: string | null
  /** 仅第三方（pi-ai）路由需要 */
  protocol?: ApiProtocol
  models: ProviderModel[]
  /** 模型目录是否已被用户覆盖；false 表示仍在继承基线 */
  modelsOverridden: boolean
}

/** 新 agent 的默认模型选择，对应 dsh 的 agent-default-model。 */
export interface AgentDefaultModel {
  provider: string
  model: string
  /** 可选；服务端语义里它是按模型的能力，不是提供商级开关 */
  reasoningEffort?: 'low' | 'medium' | 'high' | 'max'
}
