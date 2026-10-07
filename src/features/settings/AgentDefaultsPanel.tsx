import type { AgentDefaultModel, ModelProvider } from '../../domain/models'

const EFFORT_LABEL: Record<NonNullable<AgentDefaultModel['reasoningEffort']>, string> = {
  low: '低',
  medium: '中',
  high: '高',
  max: '最大',
}

export interface AgentDefaultsPanelProps {
  providers: ModelProvider[]
  value: AgentDefaultModel
  onChange: (next: AgentDefaultModel) => void
}

/**
 * 对应 dsh 的 agent-default-model：新建 agent 未显式指定模型时用的 provider + model，
 * reasoningEffort 可选。这里不提供提供商级推理开关——那是按模型的能力。
 */
export function AgentDefaultsPanel({ providers, value, onChange }: AgentDefaultsPanelProps) {
  const current = providers.find((provider) => provider.id === value.provider) ?? providers[0]
  const models = current?.models ?? []

  return (
    <div className="stack-col" style={{ gap: 0 }}>
      <div className="field">
        <span className="lb">
          <strong>默认提供商</strong>
          <span>新创建的智能体默认走这条路由</span>
        </span>
        <select
          className="sel"
          aria-label="默认提供商"
          value={current?.id ?? ''}
          onChange={(event) => {
            const next = providers.find((provider) => provider.id === event.target.value)
            const firstModel = next?.models[0]?.id ?? ''
            onChange({
              ...value,
              provider: event.target.value,
              model: firstModel,
            })
          }}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="lb">
          <strong>默认模型</strong>
          <span>由所选提供商持有的模型 id</span>
        </span>
        <select
          className="sel"
          aria-label="默认模型"
          value={value.model}
          onChange={(event) => onChange({ ...value, model: event.target.value })}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name === undefined ? model.id : `${model.name} · ${model.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="lb">
          <strong>推理等级</strong>
          <span>可选。按模型能力生效，选「不指定」则沿用提供商默认</span>
        </span>
        <select
          className="sel"
          aria-label="推理等级"
          value={value.reasoningEffort ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              reasoningEffort:
                event.target.value === ''
                  ? undefined
                  : (event.target.value as NonNullable<AgentDefaultModel['reasoningEffort']>),
            })
          }
        >
          <option value="">不指定</option>
          {(Object.keys(EFFORT_LABEL) as NonNullable<AgentDefaultModel['reasoningEffort']>[]).map(
            (effort) => (
              <option key={effort} value={effort}>
                {EFFORT_LABEL[effort]}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  )
}

export default AgentDefaultsPanel
