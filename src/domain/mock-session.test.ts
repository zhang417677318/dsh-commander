import { MockSessionSource } from './mock-session'

test('load returns a session with the commander, agents and seeded messages', async () => {
  const source = new MockSessionSource({ latencyMs: 0 })
  const session = await source.load()

  expect(session.commander.model).toBe('DeepSeek R1')
  expect(session.agents).toHaveLength(6)
  expect(session.messages.length).toBeGreaterThanOrEqual(3)
})

test('the first commander message carries a three-step breakdown', async () => {
  const source = new MockSessionSource({ latencyMs: 0 })
  const { messages } = await source.load()
  const breakdown = messages.find((m) => m.breakdown)?.breakdown ?? []

  expect(breakdown).toHaveLength(3)
  expect(breakdown[0]).toMatchObject({ index: 1, agentName: 'UI 设计智能体', state: 'done' })
  expect(breakdown[2]?.state).toBe('queued')
})

test('send appends a commander reply that never echoes the raw text back', async () => {
  const source = new MockSessionSource({ latencyMs: 0 })
  const reply = await source.send('帮我做一个预约页')

  expect(reply.author).toBe('commander')
  expect(reply.text).not.toContain('帮我做一个预约页')
  expect(reply.text.length).toBeGreaterThan(0)
})
