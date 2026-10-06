/**
 * 设计令牌的单一事实来源（与 src/styles/tokens.css 必须逐字一致）。
 * 任何一档颜色被调整时，这里的对比度测试会立刻报警。
 */
export const TOKENS = {
  bg: '#F0FDFA',
  glass: '#FFFFFF',
  primary: '#0891B2',
  'primary-600': '#0E7490',
  secondary: '#22D3EE',
  accent: '#16A34A',
  ink: '#0D2F3A',
  'ink-2': '#3E5F6C',
  'ink-3': '#55707B',
  'ink-4': '#6B8794',
} as const

export type TokenName = keyof typeof TOKENS

function channel(hex: string, index: number): number {
  const start = 1 + index * 2
  return Number.parseInt(hex.slice(start, start + 2), 16) / 255
}

function linear(value: number): number {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) throw new Error(`unsupported colour: ${hex}`)
  return (
    0.2126 * linear(channel(hex, 0)) +
    0.7152 * linear(channel(hex, 1)) +
    0.0722 * linear(channel(hex, 2))
  )
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const [light, dark] = a > b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

/** WCAG 2.1 AA：正文 4.5:1，大号文字（≥18px 或 ≥14px 粗体）3:1。 */
export function meetsAA(foreground: string, background: string, large = false): boolean {
  return contrastRatio(foreground, background) >= (large ? 3 : 4.5)
}
