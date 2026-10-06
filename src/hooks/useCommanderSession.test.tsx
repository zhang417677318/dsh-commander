import { act, renderHook, waitFor } from '@testing-library/react'
import type { SessionSource } from '../domain/session-source'
import { MockSessionSource } from '../domain/mock-session'
import { useCommanderSession } from './useCommanderSession'

// 数据源实例必须在 renderHook 之外创建：hook 以 source 作为 effect 依赖，
// 每次渲染新建实例会导致无限重新加载。
const stableSource = () => new MockSessionSource({ latencyMs: 0 })

test('starts in loading and settles into ready', async () => {
  const source = stableSource()
  const { result } = renderHook(() => useCommanderSession(source))

  expect(result.current.status).toBe('loading')
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.session?.agents).toHaveLength(6)
})

test('send appends the user message immediately and toggles pending', async () => {
  const source = stableSource()
  const { result } = renderHook(() => useCommanderSession(source))
  await waitFor(() => expect(result.current.status).toBe('ready'))

  await act(async () => {
    await result.current.send('加一个预约入口')
  })

  const authors = result.current.session?.messages.map((m) => m.author) ?? []
  expect(authors.at(-2)).toBe('user')
  expect(authors.at(-1)).toBe('commander')
  expect(result.current.pending).toBe(false)
})

test('empty input is ignored', async () => {
  const source = stableSource()
  const { result } = renderHook(() => useCommanderSession(source))
  await waitFor(() => expect(result.current.status).toBe('ready'))
  const before = result.current.session?.messages.length

  await act(async () => {
    await result.current.send('   ')
  })

  expect(result.current.session?.messages.length).toBe(before)
})

test('a rejected load surfaces as error state', async () => {
  const broken: SessionSource = {
    load: () => Promise.reject(new Error('host down')),
    send: () => Promise.reject(new Error('host down')),
  }
  const { result } = renderHook(() => useCommanderSession(broken))

  await waitFor(() => expect(result.current.status).toBe('error'))
  expect(result.current.error?.message).toBe('host down')
})

test('retry re-runs the load and can recover', async () => {
  let attempt = 0
  const flaky: SessionSource = {
    load: () => {
      attempt += 1
      return attempt === 1
        ? Promise.reject(new Error('host down'))
        : new MockSessionSource({ latencyMs: 0 }).load()
    },
    send: () => Promise.reject(new Error('not used')),
  }
  const { result } = renderHook(() => useCommanderSession(flaky))
  await waitFor(() => expect(result.current.status).toBe('error'))

  act(() => result.current.retry())

  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.error).toBeNull()
})
