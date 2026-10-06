import { MockWorkspaceSource } from './mock-workspace'

test('load returns every view dataset', async () => {
  const data = await new MockWorkspaceSource({ latencyMs: 0 }).load()

  expect(data.team).toHaveLength(6)
  expect(data.tasks).toHaveLength(7)
  expect(data.documents).toHaveLength(5)
  expect(data.plugins).toHaveLength(6)
  expect(data.projects).toHaveLength(3)
  expect(data.milestones).toHaveLength(6)
  expect(data.files).toHaveLength(5)
  expect(data.settings).toHaveLength(3)
})

test('task lanes cover all four stages', async () => {
  const { tasks } = await new MockWorkspaceSource({ latencyMs: 0 }).load()
  const lanes = new Set(tasks.map((task) => task.lane))

  expect(lanes).toEqual(new Set(['queued', 'running', 'verify', 'done']))
})

test('each team member carries stats and an assignment', async () => {
  const { team } = await new MockWorkspaceSource({ latencyMs: 0 }).load()

  for (const member of team) {
    expect(member.stats.total).toBeGreaterThan(0)
    expect(member.stats.secondaryValue.length).toBeGreaterThan(0)
    expect(member.assignment.title.length).toBeGreaterThan(0)
  }
})

test('loaded data is a deep clone, so edits never leak into the seed', async () => {
  const source = new MockWorkspaceSource({ latencyMs: 0 })
  const first = await source.load()
  first.tasks[0]!.title = '被改坏了'
  first.settings[0]!.rows[0]!.label = '被改坏了'

  const second = await source.load()
  expect(second.tasks[0]!.title).not.toBe('被改坏了')
  expect(second.settings[0]!.rows[0]!.label).not.toBe('被改坏了')
})

test('the shell carries the shared navigation contract', async () => {
  const data = await new MockWorkspaceSource({ latencyMs: 0 }).load()
  const nickname = data.settings
    .flatMap((group) => group.rows)
    .find((row) => row.id === 'nickname')

  expect(nickname?.control).toBe('text')
})
