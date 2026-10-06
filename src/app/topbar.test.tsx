import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Topbar from './Topbar'
import type { DesktopBridge } from './desktop'

function fakeBridge(overrides: Partial<DesktopBridge> = {}): DesktopBridge {
  return {
    isDesktop: true,
    platform: 'win32',
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn().mockResolvedValue(false),
    onMaximizedChange: vi.fn(() => () => {}),
    ...overrides,
  }
}

afterEach(() => {
  delete window.dshDesktop
})

test('window controls are disabled when there is no desktop shell', () => {
  render(<Topbar />)

  expect(screen.getByRole('button', { name: '最小化' })).toBeDisabled()
  expect(screen.getByRole('button', { name: '最大化' })).toBeDisabled()
  expect(screen.getByRole('button', { name: '关闭窗口' })).toBeDisabled()
})

test('window controls drive the desktop bridge', async () => {
  const bridge = fakeBridge()
  window.dshDesktop = bridge
  render(<Topbar />)

  await userEvent.click(screen.getByRole('button', { name: '最小化' }))
  await userEvent.click(screen.getByRole('button', { name: '最大化' }))
  await userEvent.click(screen.getByRole('button', { name: '关闭窗口' }))

  expect(bridge.minimize).toHaveBeenCalledOnce()
  expect(bridge.toggleMaximize).toHaveBeenCalledOnce()
  expect(bridge.close).toHaveBeenCalledOnce()
})

test('the maximize control reflects the reported window state', async () => {
  const bridge = fakeBridge({ isMaximized: vi.fn().mockResolvedValue(true) })
  window.dshDesktop = bridge
  render(<Topbar />)

  expect(await screen.findByRole('button', { name: '还原窗口' })).toBeEnabled()
  expect(screen.queryByRole('button', { name: '最大化' })).not.toBeInTheDocument()
})

test('the shell subscribes to maximize changes and unsubscribes on unmount', () => {
  const unsubscribe = vi.fn()
  const bridge = fakeBridge({ onMaximizedChange: vi.fn(() => unsubscribe) })
  window.dshDesktop = bridge
  const { unmount } = render(<Topbar />)

  expect(bridge.onMaximizedChange).toHaveBeenCalledOnce()
  unmount()
  expect(unsubscribe).toHaveBeenCalledOnce()
})
