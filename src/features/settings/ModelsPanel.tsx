import { useState } from 'react'
import {
  PROTOCOL_LABELS,
  PROTOCOL_PLACEHOLDERS,
} from '../../domain/seed/models-seed'
import type {
  ApiProtocol,
  CredentialState,
  InputModality,
  ModelProvider,
  ProviderModel,
} from '../../domain/models'
import './models.css'

const CREDENTIAL_LABEL: Record<CredentialState, string> = {
  configured: '密钥已配置',
  missing: '密钥缺失',
  unknown: '密钥状态未知',
}

const PROTOCOL_OPTIONS: ApiProtocol[] = [
  'openai-chat-completions',
  'openai-responses',
  'anthropic-messages',
]

/** 凭据只写保存：输入框永远不回填，应用后立即清空。 */
function ApiKeyField({
  provider,
  onApplied,
}: {
  provider: ModelProvider
  onApplied: (state: CredentialState) => void
}) {
  const [value, setValue] = useState('')
  const canApply = value.trim().length > 0

  return (
    <div className="mp-field">
      <span className="lb">
        <strong>API 密钥</strong>
        <span>
          只写保存，不会写进配置文件；配置里只留引用 {provider.credentialRef}
        </span>
      </span>
      <input
        className="inp"
        type="password"
        autoComplete="new-password"
        aria-label={`${provider.label} 的 API 密钥`}
        placeholder="粘贴密钥后点应用"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        className="btn-primary btn-primary-sm"
        type="button"
        disabled={!canApply}
        onClick={() => {
          setValue('')
          onApplied('configured')
        }}
      >
        应用
      </button>
    </div>
  )
}

function ModelRow({
  model,
  providerLabel,
  onChange,
}: {
  model: ProviderModel
  providerLabel: string
  onChange: (next: ProviderModel) => void
}) {
  const toggleInput = (modality: InputModality) => {
    const has = model.input.includes(modality)
    // 至少保留一种输入类型
    if (has && model.input.length === 1) return
    onChange({
      ...model,
      input: has ? model.input.filter((item) => item !== modality) : [...model.input, modality],
    })
  }

  return (
    <div className="mp-model" role="group" aria-label={`模型 ${model.id}`}>
      <div className="mp-model-head">
        <code className="mp-model-id">{model.id}</code>
        <input
          className="inp mp-model-name"
          type="text"
          aria-label={`${model.id} 的显示名称`}
          placeholder="显示名称（可选）"
          value={model.name ?? ''}
          onChange={(event) =>
            onChange({ ...model, name: event.target.value === '' ? undefined : event.target.value })
          }
        />
      </div>

      <div className="mp-model-grid">
        <label className="mp-num">
          <span>上下文窗口</span>
          <input
            className="inp"
            type="number"
            min={1}
            aria-label={`${model.id} 的上下文窗口`}
            value={model.contextWindow ?? ''}
            onChange={(event) =>
              onChange({
                ...model,
                contextWindow: event.target.value === '' ? undefined : Number(event.target.value),
              })
            }
          />
        </label>
        <label className="mp-num">
          <span>最大输出 token 数</span>
          <input
            className="inp"
            type="number"
            min={1}
            aria-label={`${model.id} 的最大输出 token 数`}
            value={model.maxTokens ?? ''}
            onChange={(event) =>
              onChange({
                ...model,
                maxTokens: event.target.value === '' ? undefined : Number(event.target.value),
              })
            }
          />
        </label>
      </div>

      <fieldset className="mp-inputs">
        <legend>输入类型</legend>
        <label>
          <input
            type="checkbox"
            checked={model.input.includes('text')}
            onChange={() => toggleInput('text')}
          />
          文本
        </label>
        <label>
          <input
            type="checkbox"
            checked={model.input.includes('image')}
            onChange={() => toggleInput('image')}
          />
          图片
        </label>
        <span className="mini">至少保留一种</span>
      </fieldset>

      <span className="sr">{providerLabel} 的模型 {model.id}</span>
    </div>
  )
}

function ProviderEditor({
  provider,
  onCredentialApplied,
  onBaseURLChange,
  onModelsChange,
  onResetModels,
}: {
  provider: ModelProvider
  onCredentialApplied: (state: CredentialState) => void
  onBaseURLChange: (value: string) => void
  onModelsChange: (models: ProviderModel[]) => void
  onResetModels: () => void
}) {
  const [customOpen, setCustomOpen] = useState(false)

  const updateModel = (index: number, next: ProviderModel) => {
    const models = provider.models.map((model, i) => (i === index ? next : model))
    onModelsChange(models)
  }

  return (
    <div className="mp-editor">
      {provider.kind === 'account' ? (
        <p className="mp-note">
          账号路由使用登录态，不提供 API 密钥与 Base URL 输入框；模型目录保存到该路由自己的设置段。
        </p>
      ) : (
        <ApiKeyField provider={provider} onApplied={onCredentialApplied} />
      )}

      {provider.kind === 'account' ? null : (
        <div className="mp-custom">
          <button
            className="mp-custom-toggle"
            type="button"
            aria-expanded={customOpen}
            onClick={() => setCustomOpen((open) => !open)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={customOpen ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
            </svg>
            自定义设置
          </button>

          {customOpen ? (
            <div className="mp-custom-body">
              {provider.kind === 'third-party' && provider.protocol !== undefined ? (
                <div className="mp-field">
                  <span className="lb">
                    <strong>API 协议</strong>
                    <span>存储的是协议标识符，界面按产品名显示</span>
                  </span>
                  <span className="skill">{PROTOCOL_LABELS[provider.protocol]}</span>
                  <code className="mp-code">{provider.protocol}</code>
                </div>
              ) : null}

              <div className="mp-field">
                <span className="lb">
                  <strong>Base URL</strong>
                  <span>留空则使用适配器内置的公共端点</span>
                </span>
                <input
                  className="inp"
                  type="url"
                  aria-label={`${provider.label} 的 Base URL`}
                  placeholder={provider.baseURLPlaceholder ?? ''}
                  value={provider.baseURL ?? ''}
                  onChange={(event) => onBaseURLChange(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="mp-models">
        <div className="mp-models-head">
          <strong>模型目录</strong>
          <span className="mini">
            {provider.modelsOverridden ? '已覆盖基线' : `继承 ${provider.models.length} 行`}
          </span>
          <button
            className="btn-ghost btn-ghost-sm mp-reset"
            type="button"
            disabled={!provider.modelsOverridden}
            onClick={onResetModels}
          >
            恢复默认模型
          </button>
        </div>
        {provider.models.map((model, index) => (
          <ModelRow
            key={model.id}
            model={model}
            providerLabel={provider.label}
            onChange={(next) => updateModel(index, next)}
          />
        ))}
      </div>
    </div>
  )
}

export interface ModelsPanelProps {
  providers: ModelProvider[]
}

export function ModelsPanel({ providers }: ModelsPanelProps) {
  const [list, setList] = useState<ModelProvider[]>(providers)
  const [expandedId, setExpandedId] = useState<string | null>(providers[0]?.id ?? null)
  const [announcement, setAnnouncement] = useState('')

  const patch = (id: string, update: (provider: ModelProvider) => ModelProvider) => {
    setList((current) => current.map((provider) => (provider.id === id ? update(provider) : provider)))
  }

  return (
    <div className="mp-list">
      {list.map((provider) => {
        const expanded = provider.id === expandedId
        return (
          <section className="mp-row" key={provider.id}>
            <button
              className="mp-row-head"
              type="button"
              aria-expanded={expanded}
              aria-controls={`provider-${provider.id}`}
              onClick={() => setExpandedId(expanded ? null : provider.id)}
            >
              <span className={`mp-cred mp-cred-${provider.credentialState}`} aria-hidden="true" />
              <span className="mp-row-title">
                <strong>{provider.label}</strong>
                <span>
                  {provider.kind === 'account'
                    ? '账号路由'
                    : provider.credentialRef === null
                      ? '沿用原生认证'
                      : provider.credentialRef}
                </span>
              </span>
              <span className={`state ${provider.credentialState === 'configured' ? 'on' : 'idle'}`}>
                {CREDENTIAL_LABEL[provider.credentialState]}
              </span>
              <span className="mini mp-count">{provider.models.length} 个模型</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={expanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>

            {expanded ? (
              <div className="mp-editor-wrap" id={`provider-${provider.id}`}>
                <ProviderEditor
                  provider={provider}
                  onCredentialApplied={(state) => {
                    patch(provider.id, (current) => ({ ...current, credentialState: state }))
                    setAnnouncement(`${provider.label} 的密钥已保存`)
                  }}
                  onBaseURLChange={(value) =>
                    patch(provider.id, (current) => ({ ...current, baseURL: value }))
                  }
                  onModelsChange={(models) =>
                    patch(provider.id, (current) => ({
                      ...current,
                      models,
                      modelsOverridden: true,
                    }))
                  }
                  onResetModels={() => {
                    const baseline = providers.find((item) => item.id === provider.id)
                    if (!baseline) return
                    patch(provider.id, (current) => ({
                      ...current,
                      models: baseline.models,
                      modelsOverridden: false,
                    }))
                    setAnnouncement(`${provider.label} 已恢复默认模型目录`)
                  }}
                />
              </div>
            ) : null}
          </section>
        )
      })}

      <p className="sr" role="status" aria-live="polite">
        {announcement}
      </p>

      <p className="mp-foot">
        推理等级不在这里配置：它是按模型的能力，做成提供商级开关只会被部分模型拒绝。
      </p>
    </div>
  )
}

export default ModelsPanel
