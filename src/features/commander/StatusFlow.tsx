import type { CommanderStage, FlowStep } from '../../domain/types'

const STEPS: readonly { id: FlowStep; label: string }[] = [
  { id: 'analysis', label: '任务分析' },
  { id: 'planning', label: '方案规划' },
  { id: 'dispatch', label: '智能体分配中' },
  { id: 'execution', label: '执行中' },
]

type StepState = 'done' | 'active' | 'todo'

/** 状态必须同时有可见图形和屏幕可读文案，不能只靠颜色。 */
const SPOKEN: Record<StepState, string> = {
  done: '，已完成',
  active: '，进行中',
  todo: '，未开始',
}

function stateOf(step: FlowStep, stage: CommanderStage): StepState {
  if (stage.done.includes(step)) return 'done'
  return stage.active === step ? 'active' : 'todo'
}

function Tick({ state }: { state: StepState }) {
  if (state === 'done') {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }
  if (state === 'active') {
    return (
      <svg className="spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
        <path d="M12 4a8 8 0 1 1-8 8" />
      </svg>
    )
  }
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function StatusFlow({ stage }: { stage: CommanderStage }) {
  return (
    <ol className="flow" aria-label="任务流程">
      {STEPS.map((step) => {
        const state = stateOf(step.id, stage)
        return (
          <li
            key={step.id}
            className="flow-step"
            data-state={state}
            aria-label={`${step.label}${SPOKEN[state]}`}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span className="tick" aria-hidden="true">
              <Tick state={state} />
            </span>
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}

export default StatusFlow
