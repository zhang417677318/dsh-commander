import { useState } from 'react'
import WorkspaceGate from '../../app/WorkspaceGate'
import ModelsPanel from './ModelsPanel'
import AgentDefaultsPanel from './AgentDefaultsPanel'
import AgentPresetPanel from './AgentPresetPanel'
import type { SettingsGroup, SettingsRow, WorkspaceData, WorkspaceSource } from '../../domain/workspace'
import type { AgentDefaultModel } from '../../domain/models'

type DraftState = Record<string, string | boolean>

function initialDraft(groups: SettingsGroup[]): DraftState {
  const draft: DraftState = {}
  for (const group of groups) {
    for (const row of group.rows) draft[row.id] = row.value
  }
  return draft
}

function Row({ row, draft, onChange }: {
  row: SettingsRow
  draft: DraftState
  onChange: (id: string, value: string | boolean) => void
}) {
  const value = draft[row.id]

  return (
    <div className="field">
      <span className="lb">
        <strong>{row.label}</strong>
        <span>{row.hint}</span>
      </span>

      {row.control === 'switch' ? (
        <button
          className="sw"
          type="button"
          role="switch"
          aria-checked={value === true}
          aria-label={row.label}
          onClick={() => onChange(row.id, !(value === true))}
        />
      ) : row.control === 'segment' ? (
        <div className="seg" role="tablist" aria-label={row.label}>
          {row.options.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={value === option}
              onClick={() => onChange(row.id, option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <>
          <label className="sr" htmlFor={`setting-${row.id}`}>
            {row.label}
          </label>
          <input
            className="inp"
            id={`setting-${row.id}`}
            type="text"
            value={String(value ?? '')}
            onChange={(event) => onChange(row.id, event.target.value)}
          />
        </>
      )}
    </div>
  )
}

export function SettingsPage({ source }: { source: WorkspaceSource }) {
  return (
    <WorkspaceGate source={source} label="设置">
      {(data) => <SettingsBody data={data} />}
    </WorkspaceGate>
  )
}

interface NavEntry {
  id: string
  title: string
}

function SettingsBody({ data }: { data: WorkspaceData }) {
  const groups: SettingsGroup[] = data.settings
  // 「模型」不是通用的分组表单，插在「通用」之后
  const nav: NavEntry[] = [
    ...groups.slice(0, 2).map((group) => ({ id: group.id, title: group.title })),
    { id: 'models', title: '模型' },
    { id: 'presets', title: 'Agent 预设' },
    ...groups.slice(2).map((group) => ({ id: group.id, title: group.title })),
  ]

  const [activeId, setActiveId] = useState(nav[0]?.id ?? 'models')
  const [draft, setDraft] = useState<DraftState>(() => initialDraft(groups))
  const [agentDefault, setAgentDefault] = useState<AgentDefaultModel>(data.agentDefaultModel)

  const active = nav.find((entry) => entry.id === activeId) ?? nav[0]
  const activeGroup = groups.find((group) => group.id === active?.id)

  const rowsDirty = groups.some((group) =>
    group.rows.some((row) => draft[row.id] !== row.value),
  )
  const defaultDirty =
    agentDefault.provider !== data.agentDefaultModel.provider ||
    agentDefault.model !== data.agentDefaultModel.model ||
    agentDefault.reasoningEffort !== data.agentDefaultModel.reasoningEffort
  const dirty = rowsDirty || defaultDirty

  const update = (id: string, value: string | boolean) =>
    setDraft((current) => ({ ...current, [id]: value }))

  const reset = () => {
    setDraft(initialDraft(groups))
    setAgentDefault(data.agentDefaultModel)
  }

  return (
    <div className="view view--full">
      <div className="page">
        <div className="page-head">
          <div className="ph-text">
            <h2>设置</h2>
            <p>{dirty ? '有未保存的改动' : '账户、外观与模型偏好，改动会自动保存'}</p>
          </div>
          <div className="page-actions">
            <button
              className="btn-ghost"
              type="button"
              disabled={!dirty}
              onClick={reset}
            >
              恢复默认
            </button>
          </div>
        </div>

        <div className="split">
          <nav className="glass side-nav" aria-label="设置分类">
            {nav.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-current={entry.id === active?.id ? 'true' : undefined}
                onClick={() => setActiveId(entry.id)}
              >
                {entry.title}
              </button>
            ))}
          </nav>

          <div className="stack-col">
            {active?.id === 'models' ? (
              <div className="glass card">
                <div className="card-head">
                  <h3>模型</h3>
                  <span className="aside">按提供商分行，一次展开一张</span>
                </div>
                <ModelsPanel providers={data.providers} />
              </div>
            ) : active?.id === 'presets' ? (
              <div className="glass card">
                <div className="card-head">
                  <h3>Agent 预设</h3>
                </div>
                <AgentPresetPanel
                  presets={data.agentPresets}
                  guides={data.presetGuides}
                  defaultPresetId={data.defaultPresetId}
                />
              </div>
            ) : active === undefined ? null : (
              <div className="glass card" key={active.id}>
                <div className="card-head">
                  <h3>{active.title}</h3>
                </div>
                {active.id === 'agent-defaults' ? (
                  <AgentDefaultsPanel
                    providers={data.providers}
                    value={agentDefault}
                    onChange={setAgentDefault}
                  />
                ) : null}
                {activeGroup?.rows.map((row) => (
                  <Row key={row.id} row={row} draft={draft} onChange={update} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
