import type { Agent } from '../../domain/types'

export const TABS = ['全部', '开发', '设计', '运维', '测试'] as const
export type Tab = (typeof TABS)[number]
export type Category = '开发' | '设计' | '测试' | '运维' | '文案'

const RULES: readonly { match: string; category: Category }[] = [
  { match: '前端', category: '开发' },
  { match: '后端', category: '开发' },
  { match: 'UI', category: '设计' },
  { match: '测试', category: '测试' },
  { match: '运维', category: '运维' },
  { match: '文案', category: '文案' },
]

/** 分类规则保持纯函数，便于单独验证边界。 */
export function categoryOf(agent: Pick<Agent, 'name' | 'role'>): Category {
  const haystack = `${agent.name} ${agent.role}`
  return RULES.find((rule) => haystack.includes(rule.match))?.category ?? '开发'
}

/** 每个分类一个身份色，避免六张卡片长得一模一样。 */
export const CATEGORY_TONE: Record<Category, string> = {
  开发: 'tone-blue',
  设计: 'tone-pink',
  测试: 'tone-teal',
  运维: 'tone-amber',
  文案: 'tone-slate',
}
