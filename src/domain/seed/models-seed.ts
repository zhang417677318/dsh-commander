import type { AgentDefaultModel, ModelProvider } from '../models'

/**
 * 提供商目录。顺序沿用原生约定：DeepSeek 账号 → DeepSeek → 第三方。
 */
export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'deepseek-account',
    label: 'DeepSeek 账号',
    kind: 'account',
    settingsNamespace: 'llm-deepseek-account',
    // 账号路由走登录态，没有可写凭据，也不提供 Base URL 输入框
    credentialRef: null,
    credentialState: 'configured',
    baseURL: null,
    baseURLPlaceholder: null,
    modelsOverridden: false,
    models: [
      { id: 'deepseek-flash', name: 'DeepSeek Flash', contextWindow: 128000, maxTokens: 8192, input: ['text'] },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', contextWindow: 128000, maxTokens: 65536, input: ['text'] },
    ],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    kind: 'official',
    settingsNamespace: 'llm-deepseek',
    credentialRef: 'DEEPSEEK_API_KEY',
    credentialState: 'configured',
    baseURL: null,
    baseURLPlaceholder: 'https://api.deepseek.com/anthropic',
    modelsOverridden: false,
    models: [
      { id: 'deepseek-chat', contextWindow: 128000, maxTokens: 8192, input: ['text'] },
      { id: 'deepseek-reasoner', contextWindow: 128000, maxTokens: 65536, input: ['text'] },
    ],
  },
  {
    id: 'moonshotai',
    label: 'Moonshot',
    kind: 'third-party',
    settingsNamespace: 'llm-pi-ai',
    credentialRef: 'MOONSHOT_API_KEY',
    credentialState: 'missing',
    baseURL: 'https://api.moonshot.cn/v1',
    baseURLPlaceholder: 'https://gateway.example/v1',
    protocol: 'openai-chat-completions',
    modelsOverridden: false,
    models: [
      { id: 'kimi-k2-0905-preview', name: 'Kimi K2', contextWindow: 256000, maxTokens: 8192, input: ['text'] },
    ],
  },
]

/** 对应 dsh 的 agent-default-model：provider + model，reasoningEffort 可选。 */
export const AGENT_DEFAULT_MODEL: AgentDefaultModel = {
  provider: 'deepseek-account',
  model: 'deepseek-flash',
  reasoningEffort: 'max',
}

/** 协议标识符 → 界面上显示的产品名。 */
export const PROTOCOL_LABELS: Record<string, string> = {
  'openai-chat-completions': 'OpenAI Chat Completions',
  'openai-responses': 'OpenAI Responses',
  'anthropic-messages': 'Anthropic Messages',
}

/** 端点占位示例随协议变化：Anthropic 的 SDK 会自己追加 /v1/messages。 */
export const PROTOCOL_PLACEHOLDERS: Record<string, string> = {
  'openai-chat-completions': 'https://gateway.example/v1',
  'openai-responses': 'https://gateway.example/v1',
  'anthropic-messages': 'https://gateway.example',
}
