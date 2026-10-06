import { render, screen } from '@testing-library/react'
import CommanderBanner from './CommanderBanner'
import StatusFlow from './StatusFlow'
import type { CommanderStage } from '../../domain/types'

const stage: CommanderStage = { done: ['analysis', 'planning'], active: 'dispatch' }

test('status flow exposes four steps with text, not colour alone', () => {
  render(<StatusFlow stage={stage} />)

  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByText('任务分析')).toHaveAccessibleName(/已完成/)
  expect(screen.getByText('智能体分配中')).toHaveAccessibleName(/进行中/)
  expect(screen.getByText('执行中')).toHaveAccessibleName(/未开始/)
})

test('the active step is announced as the current step', () => {
  render(<StatusFlow stage={stage} />)

  expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('智能体分配中')
})

test('banner renders the model tag and the greeting verbatim', () => {
  render(
    <CommanderBanner
      commander={{
        name: 'AI 指挥官 Commander',
        model: 'DeepSeek R1',
        greeting:
          '你好！我是你的 AI 指挥官，负责分析需求、拆解任务，并调度你的智能体团队高效完成工作。',
      }}
      stage={stage}
    />,
  )

  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('AI 指挥官 Commander')
  expect(screen.getByText('DeepSeek R1')).toBeVisible()
  expect(screen.getByText(/负责分析需求、拆解任务/)).toBeVisible()
})
