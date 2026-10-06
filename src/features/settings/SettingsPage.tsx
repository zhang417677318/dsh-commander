import { useState } from 'react'
import WorkspaceGate from '../../app/WorkspaceGate'
import type { SettingsGroup, SettingsRow, WorkspaceSource } from '../../domain/workspace'

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
      {(data) => <SettingsBody groups={data.settings} />}
    </WorkspaceGate>
  )
}

function SettingsBody({ groups }: { groups: SettingsGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id ?? '')
  const [draft, setDraft] = useState<DraftState>(() => initialDraft(groups))

  const active = groups.find((group) => group.id === activeId) ?? groups[0]
  const dirty = groups.some((group) =>
    group.rows.some((row) => draft[row.id] !== row.value),
  )

  const update = (id: string, value: string | boolean) =>
    setDraft((current) => ({ ...current, [id]: value }))

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
              onClick={() => setDraft(initialDraft(groups))}
            >
              恢复默认
            </button>
          </div>
        </div>

        <div className="split">
          <nav className="glass side-nav" aria-label="设置分类">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                aria-current={group.id === active?.id ? 'true' : undefined}
                onClick={() => setActiveId(group.id)}
              >
                {group.title}
              </button>
            ))}
          </nav>

          <div className="stack-col">
            {active === undefined ? null : (
              <div className="glass card" key={active.id}>
                <div className="card-head">
                  <h3>{active.title}</h3>
                </div>
                {active.rows.map((row) => (
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
