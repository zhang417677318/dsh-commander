import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AgentPreset, PresetGuide } from '../../domain/presets'
import './presets.css'

/** 帮助对话框的两个页签。 */
type GuideTab = 'explanation' | 'usage'

const TAB_LABEL: Record<GuideTab, string> = {
  explanation: '模式说明',
  usage: '如何使用',
}

/** 只渲染帮助文案用到的极简标记：### 标题、> 引用、普通段落。 */
function Markdown({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((block, index) => {
        if (block.startsWith('### ')) {
          return (
            <h4 className="ap-md-h" key={index}>
              {block.slice(4)}
            </h4>
          )
        }
        if (block.startsWith('> ')) {
          return (
            <blockquote className="ap-md-quote" key={index}>
              {block.slice(2)}
            </blockquote>
          )
        }
        return (
          <p className="ap-md-p" key={index}>
            {block}
          </p>
        )
      })}
    </>
  )
}

function ViewConfigIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="11" height="11" rx="2" />
      <path d="M9 20h9a2 2 0 0 0 2-2v-9" />
    </svg>
  )
}

export interface AgentPresetPanelProps {
  presets: AgentPreset[]
  guides: Record<string, PresetGuide>
  defaultPresetId: string
}

export function AgentPresetPanel({ presets, guides, defaultPresetId }: AgentPresetPanelProps) {
  const [defaultId, setDefaultId] = useState(defaultPresetId)
  const [guide, setGuide] = useState<{ presetId: string; tab: GuideTab } | null>(null)
  const [configId, setConfigId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // 帮助对话框关闭后焦点要回到打开它的那张卡片
  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  /** 各页签各自记住滚动位置 */
  const scrollTops = useRef<Record<string, number>>({})

  const open = guide !== null || configId !== null

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setGuide(null)
      setConfigId(null)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || guide === null) return
    panel.scrollTop = scrollTops.current[`${guide.presetId}:${guide.tab}`] ?? 0
  }, [guide])

  const activePreset =
    guide === null ? null : (presets.find((item) => item.id === guide.presetId) ?? null)
  const activeGuide = guide === null ? null : (guides[guide.presetId] ?? null)
  const configPreset =
    configId === null ? null : (presets.find((item) => item.id === configId) ?? null)

  const switchTab = (tab: GuideTab) => {
    const panel = panelRef.current
    if (panel && guide !== null) {
      scrollTops.current[`${guide.presetId}:${guide.tab}`] = panel.scrollTop
    }
    setCopied(false)
    setGuide((current) => (current === null ? null : { ...current, tab }))
  }

  const copyGuide = async () => {
    if (activeGuide === null || guide === null) return
    const text = `${activeGuide.intro}\n\n${
      guide.tab === 'explanation' ? activeGuide.explanation : activeGuide.usage
    }`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="ap-list">
      <p className="ap-intro">
        选择 Agent 的工具和工作方式。日常任务用「标准模式」，扩展 DSH 的能力用「创造模式」。
      </p>

      <section className="ap-group" aria-labelledby="ap-builtin">
        <h4 className="ap-group-title" id="ap-builtin">
          内置
        </h4>
        <div className="ap-grid">
          {presets
            .filter((preset) => preset.builtin)
            .map((preset) => {
              const inUse = preset.id === defaultId
              return (
                <article className="ap-card" key={preset.id} data-inuse={inUse ? '1' : '0'}>
                  <button
                    className="ap-card-select"
                    type="button"
                    aria-pressed={inUse}
                    aria-label={`设为新任务默认：${preset.name}`}
                    onClick={(event) => {
                      triggerRef.current = event.currentTarget
                      setDefaultId(preset.id)
                      setAnnouncement(`已将「${preset.name}」设为新任务默认`)
                    }}
                  >
                    <span className="ap-card-head">
                      <strong>{preset.name}</strong>
                      <span className="ap-badge" data-kind={inUse ? 'inuse' : 'builtin'}>
                        {inUse ? '新任务默认' : '内置'}
                      </span>
                      <code className="ap-id">{preset.id}</code>
                    </span>
                    <span className="ap-desc">{preset.description}</span>
                  </button>

                  <div className="ap-card-foot">
                    <button
                      className="ap-link"
                      type="button"
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget
                        setCopied(false)
                        setGuide({ presetId: preset.id, tab: 'explanation' })
                      }}
                    >
                      模式说明
                    </button>
                    <button
                      className="ap-link"
                      type="button"
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget
                        setCopied(false)
                        setGuide({ presetId: preset.id, tab: 'usage' })
                      }}
                    >
                      如何使用
                    </button>
                    <button
                      className="ap-icon-btn"
                      type="button"
                      aria-label={`查看配置：${preset.name}`}
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget
                        setConfigId(preset.id)
                      }}
                    >
                      <ViewConfigIcon />
                    </button>
                  </div>
                </article>
              )
            })}
        </div>
      </section>

      <section className="ap-group" aria-labelledby="ap-custom">
        <h4 className="ap-group-title" id="ap-custom">
          自定义
        </h4>
        <button
          className="ap-draft"
          type="button"
          onClick={() => setAnnouncement('已发起创造模式任务：让 Agent 帮我创建预设模式')}
        >
          + 让 Agent 帮我创建预设模式
        </button>
      </section>

      <p className="sr" role="status" aria-live="polite">
        {announcement}
      </p>

      {/*
        对话框必须 portal 到 body：祖先 .glass 的 backdrop-filter 会为 position: fixed
        创建包含块，留在原地遮罩只会盖住卡片，盖不住整屏。
      */}
      {guide !== null && activePreset !== null && activeGuide !== null
        ? createPortal(
        <div className="ap-modal" role="dialog" aria-modal="true" aria-labelledby="ap-guide-title">
          <div className="ap-modal-box">
            <header className="ap-modal-head">
              <h3 id="ap-guide-title">{activePreset.name}</h3>
              <code className="ap-id">{activePreset.id}</code>
              <button
                className="ap-icon-btn ap-modal-close"
                type="button"
                aria-label="关闭"
                onClick={() => {
                  setGuide(null)
                  triggerRef.current?.focus()
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <div className="ap-tabs" role="tablist" aria-label="帮助内容">
              {(['explanation', 'usage'] as GuideTab[]).map((tab) => (
                <button
                  key={tab}
                  className="ap-tab"
                  type="button"
                  role="tab"
                  aria-selected={guide.tab === tab}
                  onClick={() => switchTab(tab)}
                >
                  {TAB_LABEL[tab]}
                </button>
              ))}
            </div>

            <div
              className="ap-tabpanel"
              role="tabpanel"
              tabIndex={0}
              ref={panelRef}
              aria-label={TAB_LABEL[guide.tab]}
            >
              <p className="ap-guide-intro">{activeGuide.intro}</p>
              <Markdown text={guide.tab === 'explanation' ? activeGuide.explanation : activeGuide.usage} />
            </div>

            <footer className="ap-modal-foot">
              <button className="btn-ghost btn-ghost-sm" type="button" onClick={copyGuide}>
                {copied ? '已复制' : '复制'}
              </button>
            </footer>
          </div>
        </div>,
        document.body,
      )
        : null}

      {configPreset !== null
        ? createPortal(
        <div className="ap-modal" role="dialog" aria-modal="true" aria-labelledby="ap-config-title">
          <div className="ap-modal-box">
            <header className="ap-modal-head">
              <h3 id="ap-config-title">查看配置</h3>
              <code className="ap-id">{configPreset.id}</code>
              <button
                className="ap-icon-btn ap-modal-close"
                type="button"
                aria-label="关闭"
                onClick={() => {
                  setConfigId(null)
                  triggerRef.current?.focus()
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>
            <pre className="ap-yaml">{configPreset.composition}</pre>
          </div>
        </div>,
        document.body,
      )
        : null}
    </div>
  )
}

export default AgentPresetPanel
