# AI 指挥官工作台 v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一个可运行、可测试的工作台首屏：左侧导航 + AI 指挥官横幅 + 任务拆解对话流 + 智能体侧栏，全部由可替换的数据源驱动，为后续接入真实 Host 留好接缝。

**Architecture:** 纯前端的单页应用，React 18 + Vite + TypeScript。UI 与数据完全解耦：所有会话数据来自一个 `SessionSource` 接口，v1 只实现 `MockSessionSource`（内存假数据 + 可控延时），将来换成 `HostSessionSource`（对接 dsh 的本地 Host API）时，组件层一行都不用动。样式走 CSS 自定义属性做设计令牌，不使用任何 UI 框架，保证将来能整体搬进 dsh 的客户端插件而不打架。

**Tech Stack:** React 18.3 / react-dom 18.3 / TypeScript 5 / Vite / Vitest + @testing-library/react + jsdom / Playwright（仅做视觉基线）/ pnpm

**Spec:** 视觉与交互规格见 `docs/specs/workbench-design.html`（Task 1 会把现有设计稿复制进仓库），设计系统的取值来自 ui-ux-pro-max 的 Glassmorphism(light) + Medical Teal 推荐。

## Global Constraints

以下取值是项目级约束，每个任务的验收都隐含包含本节。

- **必须使用 React 18**（`react@18.3.x`）。不要升级到 19：dsh 客户端插件宿主运行在 React 18，跨版本会导致将来无法挂载。
- **颜色令牌（逐字使用，不得改写为近似值）**：`--bg:#F0FDFA`、`--primary:#0891B2`、`--primary-600:#0E7490`、`--secondary:#22D3EE`、`--accent:#16A34A`、`--ink:#0D2F3A`、`--ink-2:#3E5F6C`、`--ink-3:#55707B`、`--ink-4:#6B8794`。
  - 注：`ink-3` 与 `ink-4` 相对现有设计稿做了加深。设计稿原值 `#5E7C87` / `#64808C` 在白色玻璃面上只有 4.46:1 与 4.19:1，达不到 AA。加深后 `ink-3` 为 5.26:1，可作为正文色；`ink-4` 为 3.80:1，**只允许用于 ≥18px 的文字或纯装饰性标签**。
- **玻璃面参数**：`background: rgba(255,255,255,.74)`、`backdrop-filter: blur(18px) saturate(1.5)`、`border: 1px solid rgba(255,255,255,.72)`。全站 `backdrop-filter` 的使用面不超过 6 处（性能约束）。
- **圆角**：卡片 20px、内层卡片 16px、按钮/胶囊 999px、输入 12px。
- **字号**：11 / 12 / 13 / 14 / 15 / 17 / 20 / 26 px。正文 14px，行高 1.6。
- **间距**：4 / 8 / 12 / 14 / 16 / 18 / 20 / 22 px，不得出现表外取值。
- **文本对比度**：任何正文文字与其实际背景的对比度 ≥ 4.5:1；大号（≥18px 或 ≥14px 粗体）≥ 3:1。`--ink-4` 禁止用于正文，仅限大号文字与装饰性标签。
- **图标**：一律内联 SVG，`stroke-width` 在 1.7–1.9 之间，同一层级不得混用填充与描边风格。禁止用 emoji 充当结构图标。
- **字体**：禁止引入 Google Fonts 或任何远程字体。字体栈固定为 `'Segoe UI Variable Display','Segoe UI',-apple-system,'PingFang SC','Microsoft YaHei UI','Microsoft YaHei',system-ui,sans-serif`。
- **动效**：过渡 200ms `cubic-bezier(.4,0,.2,1)`；必须响应 `prefers-reduced-motion: reduce` 并关闭位移与旋转类动画。
- **可点击元素**：必须有 `cursor: pointer`、hover 态、可见的 `:focus-visible` 焦点环（`2px solid #0891B2`，offset 2px）。
- **状态表达**：任何状态不得只用颜色区分，必须同时有文字或图标。
- **断点**：1440 / 1120 / 860 px 三档。1120 以下右栏下沉，860 以下侧栏收成图标条。
- **包管理**：只用 pnpm。提交前 `pnpm typecheck && pnpm test` 必须全绿。
- **提交粒度**：一个任务一次提交，提交信息用 `feat:` / `test:` / `chore:` 前缀。

---

## File Structure

```
dsh-commander/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ vitest.setup.ts
├─ eslint.config.js
├─ playwright.config.ts
├─ docs/
│  ├─ specs/workbench-design.html          # 设计稿（从现成 mock 复制）
│  └─ superpowers/plans/2026-10-07-workbench-v1.md
├─ src/
│  ├─ main.tsx                             # 挂载入口
│  ├─ App.tsx                              # 路由分发
│  ├─ styles/
│  │  ├─ tokens.css                        # 全部设计令牌
│  │  └─ global.css                        # reset + 基元样式
│  ├─ theme/
│  │  ├─ contrast.ts                       # WCAG 对比度计算（纯函数）
│  │  └─ contrast.test.ts
│  ├─ domain/
│  │  ├─ types.ts                          # 领域模型，无框架依赖
│  │  ├─ session-source.ts                 # SessionSource 接口 + 工厂
│  │  ├─ mock-session.ts                   # v1 唯一的实现
│  │  └─ mock-session.test.ts
│  ├─ hooks/
│  │  ├─ useCommanderSession.ts            # 会话状态机
│  │  └─ useCommanderSession.test.tsx
│  ├─ app/
│  │  ├─ AppShell.tsx                      # 侧栏 + 顶栏 + 内容槽
│  │  ├─ Sidebar.tsx
│  │  ├─ Topbar.tsx
│  │  ├─ routes.ts                         # 视图名与 hash 映射
│  │  └─ shell.test.tsx
│  └─ features/
│     ├─ commander/
│     │  ├─ CommanderBanner.tsx
│     │  ├─ StatusFlow.tsx
│     │  ├─ MessageList.tsx
│     │  ├─ TaskBreakdownCard.tsx
│     │  └─ commander.test.tsx
│     ├─ composer/
│     │  ├─ Composer.tsx
│     │  ├─ AgentMentionPopover.tsx
│     │  └─ composer.test.tsx
│     ├─ agents/
│     │  ├─ AgentRail.tsx
│     │  ├─ AgentCard.tsx
│     │  ├─ LiveLog.tsx
│     │  └─ agents.test.tsx
│     └─ workbench/
│        ├─ WorkbenchPage.tsx
│        └─ workbench.test.tsx
└─ e2e/
   └─ workbench.spec.ts
```

**职责边界（这是本计划锁定的分解决策）：**

- `src/domain/**` 不认识 React，可被 Node 脚本单独调用。
- `src/features/**` 只通过 props 接收数据，不自己 fetch。
- `src/app/**` 负责布局与路由，不包含业务渲染逻辑。
- `src/theme/**` 只放与视觉正确性有关的纯函数，便于测试。

---

## Task 1: 工程脚手架与测试基线

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.setup.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `docs/specs/workbench-design.html`（复制现有设计稿）
- Create: `.gitignore`

**Interfaces:**
- Consumes: 无
- Produces: `pnpm dev` 可启动、`pnpm test` 可执行、`src/App.tsx` 默认导出 `App` 组件

- [ ] **Step 1: 初始化仓库与依赖**

```bash
cd /f/dsh-commander
git init
pnpm init
pnpm add react@18.3 react-dom@18.3
pnpm add -D typescript vite @vitejs/plugin-react @types/react@18 @types/react-dom@18 \
  vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  eslint @eslint/js typescript-eslint prettier @playwright/test
```

- [ ] **Step 2: 写配置文件**

`package.json` 的 scripts 段必须是：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lint": "eslint ."
  }
}
```

`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
  },
})
```

`vitest.setup.ts`：

```ts
import '@testing-library/jest-dom/vitest'
```

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "skipLibCheck": true
  },
  "include": ["src", "e2e", "vite.config.ts", "vitest.setup.ts"]
}
```

`.gitignore`：

```
node_modules
dist
playwright-report
test-results
*.local
```

- [ ] **Step 3: 写失败的冒烟测试**

`src/App.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the product name in the sidebar', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'AI 编程助手' })).toBeInTheDocument()
})
```

- [ ] **Step 4: 运行测试确认失败**

Run: `pnpm test`
Expected: FAIL，报错为 `Failed to resolve import "./App"`。

- [ ] **Step 5: 写最小实现**

`src/App.tsx`：

```tsx
import './styles/tokens.css'
import './styles/global.css'

export default function App() {
  return <h1>AI 编程助手</h1>
}
```

`src/main.tsx`：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const host = document.getElementById('root')
if (!host) throw new Error('#root not found')

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>AI 编程助手</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

同时把现有设计稿复制进仓库，作为后续所有视觉任务的唯一参照：

```bash
cp "/c/Users/张成千/.codex/visualizations/2026/10/07/ai-commander-workspace/index.html" \
   docs/specs/workbench-design.html
```

- [ ] **Step 6: 运行测试确认通过**

Run: `pnpm test && pnpm typecheck`
Expected: PASS，1 passed；typecheck 无输出。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "chore: scaffold vite + react 18 + vitest baseline"
```

---

## Task 2: 设计令牌层与对比度校验

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/theme/contrast.ts`
- Test: `src/theme/contrast.test.ts`

**Interfaces:**
- Consumes: Task 1 的工程配置
- Produces: CSS 变量全集；`contrastRatio(foreground: string, background: string): number`；`meetsAA(fg: string, bg: string, large?: boolean): boolean`；`TOKENS: Record<string, string>`

- [ ] **Step 1: 写失败的测试**

`src/theme/contrast.test.ts`：

```ts
import { contrastRatio, meetsAA, TOKENS } from './contrast'

test('white against the page background is not usable for body text', () => {
  expect(meetsAA('#FFFFFF', TOKENS.bg)).toBe(false)
})

test('ink on the glass surface clears AA for body text', () => {
  expect(contrastRatio(TOKENS.ink, TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(TOKENS['ink-2'], TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
})

test('tertiary ink clears AA at body size', () => {
  expect(contrastRatio(TOKENS['ink-3'], TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
})

test('quaternary ink clears 3:1 for large text but is rejected for body text', () => {
  const ratio = contrastRatio(TOKENS['ink-4'], TOKENS.glass)
  expect(ratio).toBeGreaterThanOrEqual(3)
  expect(ratio).toBeLessThan(4.5)
  expect(meetsAA(TOKENS['ink-4'], TOKENS.glass, true)).toBe(true)
  expect(meetsAA(TOKENS['ink-4'], TOKENS.glass, false)).toBe(false)
})

test('primary on-glass text clears AA', () => {
  expect(contrastRatio(TOKENS['primary-600'], TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/theme/contrast.test.ts`
Expected: FAIL，`Failed to resolve import "./contrast"`。

- [ ] **Step 3: 实现对比度工具**

`src/theme/contrast.ts`：

```ts
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

function channel(hex: string, index: number): number {
  const start = 1 + index * 2
  return Number.parseInt(hex.slice(start, start + 2), 16) / 255
}

function linear(value: number): number {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) throw new Error(`unsupported colour: ${hex}`)
  return 0.2126 * linear(channel(hex, 0)) + 0.7152 * linear(channel(hex, 1)) + 0.0722 * linear(channel(hex, 2))
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const [light, dark] = a > b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

export function meetsAA(foreground: string, background: string, large = false): boolean {
  return contrastRatio(foreground, background) >= (large ? 3 : 4.5)
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test src/theme/contrast.test.ts`
Expected: PASS，5 passed。若某档未达标，请调整 `TOKENS` 里的色值直到通过——**改令牌，不要改断言**。

- [ ] **Step 5: 写令牌样式表**

`src/styles/tokens.css`（取值必须与 `TOKENS` 完全一致）：

```css
:root {
  --bg: #F0FDFA;
  --primary: #0891B2;
  --primary-600: #0E7490;
  --secondary: #22D3EE;
  --accent: #16A34A;
  --ink: #0D2F3A;
  --ink-2: #3E5F6C;
  --ink-3: #55707B;
  --ink-4: #6B8794;

  --glass: rgba(255, 255, 255, .74);
  --glass-strong: rgba(255, 255, 255, .86);
  --hair: rgba(255, 255, 255, .72);
  --line: rgba(13, 80, 96, .10);
  --blur: 18px;

  --grad-brand: linear-gradient(135deg, #22D3EE 0%, #0891B2 100%);
  --grad-mint: linear-gradient(135deg, #5EEAD4 0%, #0891B2 100%);

  --r-sm: 12px;
  --r-md: 16px;
  --r-lg: 20px;
  --r-full: 999px;

  --sh-1: 0 1px 2px rgba(16, 64, 80, .05);
  --sh-2: 0 10px 26px -12px rgba(16, 64, 80, .20);
  --sh-3: 0 26px 56px -26px rgba(16, 64, 80, .28);

  --fs-11: 11px; --fs-12: 12px; --fs-13: 13px; --fs-14: 14px; --fs-15: 15px;
  --fs-17: 17px; --fs-20: 20px; --fs-26: 26px;

  --dur: 200ms;
  --ease: cubic-bezier(.4, 0, .2, 1);
}
```

`src/styles/global.css`：

```css
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--bg);
  font-family: 'Segoe UI Variable Display', 'Segoe UI', -apple-system,
    'PingFang SC', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif;
  font-size: var(--fs-14);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 8px; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
}
```

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add design tokens with wcag contrast guard"
```

---

## Task 3: 领域模型与 Mock 数据源

**Files:**
- Create: `src/domain/types.ts`, `src/domain/session-source.ts`, `src/domain/mock-session.ts`
- Test: `src/domain/mock-session.test.ts`

**Interfaces:**
- Consumes: 无（纯 TS）
- Produces:
  - `type AgentStatus = 'online' | 'idle' | 'running'`
  - `type TaskState = 'done' | 'running' | 'queued'`
  - `type FlowStep = 'analysis' | 'planning' | 'dispatch' | 'execution'`
  - `interface Agent { id: string; name: string; role: string; skills: string[]; model: string; status: AgentStatus }`
  - `interface BreakdownItem { id: string; index: number; agentName: string; action: string; state: TaskState }`
  - `interface Message { id: string; author: 'user' | 'commander'; at: string; text: string; breakdown?: BreakdownItem[] }`
  - `interface CommanderSession { commander: { name: string; model: string; greeting: string }; stage: { done: FlowStep[]; active: FlowStep }; agents: Agent[]; messages: Message[] }`
  - `interface SessionSource { load(): Promise<CommanderSession>; send(text: string): Promise<Message> }`
  - `class MockSessionSource implements SessionSource`

- [ ] **Step 1: 写失败的测试**

`src/domain/mock-session.test.ts`：

```ts
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/domain/mock-session.test.ts`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 定义领域模型**

`src/domain/types.ts`：把 `Interfaces` 里列出的类型逐个导出，字段名与类型完全照写，不加多余字段。

`src/domain/session-source.ts`：

```ts
import type { CommanderSession, Message } from './types'

export interface SessionSource {
  load(): Promise<CommanderSession>
  send(text: string): Promise<Message>
}
```

- [ ] **Step 4: 实现 MockSessionSource**

`src/domain/mock-session.ts` 的关键结构如下（数据取自设计稿，六位智能体与三条消息逐条落进去）：

```ts
import type { Agent, CommanderSession, Message } from './types'
import type { SessionSource } from './session-source'

const AGENTS: Agent[] = [
  { id: 'w-01', name: '前端工程师', role: 'React / Vue / 小程序开发', skills: ['代码生成', '组件拆分'], model: 'deepseek-flash', status: 'online' },
  { id: 'w-02', name: '后端工程师', role: 'Java / Python / Node.js', skills: ['接口设计', '数据库'], model: 'deepseek-flash', status: 'online' },
  { id: 'w-03', name: 'UI 设计师', role: '界面设计 / 交互设计', skills: ['视觉规范', '配色系统'], model: 'deepseek-flash', status: 'online' },
  { id: 'w-04', name: '测试工程师', role: '功能测试 / 自动化测试', skills: ['用例生成', '兼容性检查'], model: 'deepseek-flash', status: 'online' },
  { id: 'w-05', name: '运维工程师', role: '服务器 / Docker / 部署', skills: ['容器编排', '日志排查'], model: 'deepseek-flash', status: 'idle' },
  { id: 'w-06', name: '文案工程师', role: '技术文档 / 内容生成', skills: ['小红书种草', '产品文档'], model: 'deepseek-flash', status: 'idle' },
]

export interface MockOptions { latencyMs?: number }

export class MockSessionSource implements SessionSource {
  private readonly latency: number
  constructor(options: MockOptions = {}) { this.latency = options.latencyMs ?? 240 }

  private wait(ms = this.latency) {
    return ms === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))
  }

  async load(): Promise<CommanderSession> {
    await this.wait()
    return structuredClone(SEED_SESSION)
  }

  async send(_text: string): Promise<Message> {
    await this.wait()
    return {
      id: `m-${Date.now()}`,
      author: 'commander',
      at: new Date().toTimeString().slice(0, 5),
      text: '收到，我正在分析需求并拆解任务，稍后会把方案和执行计划同步给你。',
    }
  }
}

const SEED_SESSION: CommanderSession = { /* commander / stage / agents: AGENTS / messages: 三条 */ }
```

`SEED_SESSION.messages` 必须是三条：用户「帮我设计一个美容院小程序首页，并生成对应代码」（10:24）、指挥官带三条 `breakdown` 的回复（10:24）、用户「好的，麻烦尽快，最好今天能出初稿」（10:25）。

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test src/domain/mock-session.test.ts && pnpm typecheck`
Expected: PASS，3 passed。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add commander session domain model and mock source"
```

---

## Task 4: 会话状态 Hook

**Files:**
- Create: `src/hooks/useCommanderSession.ts`
- Test: `src/hooks/useCommanderSession.test.tsx`

**Interfaces:**
- Consumes: `SessionSource`、`CommanderSession`、`Message`（Task 3）
- Produces: `useCommanderSession(source: SessionSource): { status: 'loading' | 'ready' | 'error'; session: CommanderSession | null; pending: boolean; send(text: string): Promise<void>; error: Error | null }`

- [ ] **Step 1: 写失败的测试**

```tsx
import { act, renderHook, waitFor } from '@testing-library/react'
import { MockSessionSource } from '../domain/mock-session'
import { useCommanderSession } from './useCommanderSession'

test('starts in loading and settles into ready', async () => {
  const { result } = renderHook(() => useCommanderSession(new MockSessionSource({ latencyMs: 0 })))
  expect(result.current.status).toBe('loading')
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.session?.agents).toHaveLength(6)
})

test('send appends the user message immediately and toggles pending', async () => {
  const source = new MockSessionSource({ latencyMs: 0 })
  const { result } = renderHook(() => useCommanderSession(source))
  await waitFor(() => expect(result.current.status).toBe('ready'))

  await act(async () => { await result.current.send('加一个预约入口') })

  const authors = result.current.session!.messages.map((m) => m.author)
  expect(authors.at(-2)).toBe('user')
  expect(authors.at(-1)).toBe('commander')
  expect(result.current.pending).toBe(false)
})

test('a rejected load surfaces as error state', async () => {
  const broken = { load: () => Promise.reject(new Error('host down')), send: () => Promise.reject(new Error()) }
  const { result } = renderHook(() => useCommanderSession(broken))
  await waitFor(() => expect(result.current.status).toBe('error'))
  expect(result.current.error?.message).toBe('host down')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/hooks/useCommanderSession.test.tsx`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 Hook**

要点：`useEffect` 里调用 `source.load()`；用 `cancelled` 标志避免卸载后 setState；`send` 先乐观追加用户消息、置 `pending`，await 成功后再追加指挥官回复；捕获异常进 `error`。

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test src/hooks/useCommanderSession.test.tsx`
Expected: PASS，3 passed。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add commander session state hook"
```

---

## Task 5: 应用外壳（侧栏 / 顶栏 / hash 路由）

**Files:**
- Create: `src/app/routes.ts`, `src/app/AppShell.tsx`, `src/app/Sidebar.tsx`, `src/app/Topbar.tsx`
- Modify: `src/App.tsx`
- Test: `src/app/shell.test.tsx`

**Interfaces:**
- Consumes: CSS 令牌（Task 2）
- Produces: `type ViewId = 'workbench' | 'team' | 'tasks' | 'kb' | 'market' | 'projects' | 'files' | 'settings'`；`readView(hash: string): ViewId`；`NAV_ITEMS: { id: ViewId; label: string; badge?: number }[]`；`<AppShell view={ViewId} onNavigate={(v: ViewId) => void}>{children}</AppShell>`

- [ ] **Step 1: 写失败的测试**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppShell from './AppShell'
import { readView } from './routes'

test('unknown hash falls back to the workbench', () => {
  expect(readView('#nope')).toBe('workbench')
  expect(readView('')).toBe('workbench')
  expect(readView('#team')).toBe('team')
})

test('the active nav item is marked with aria-current', () => {
  render(<AppShell view="tasks" onNavigate={() => {}}>content</AppShell>)
  expect(screen.getByRole('button', { name: /任务中心/ })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('button', { name: '工作台' })).not.toHaveAttribute('aria-current')
})

test('clicking a nav item reports the target view', async () => {
  const onNavigate = vi.fn()
  render(<AppShell view="workbench" onNavigate={onNavigate}>content</AppShell>)
  await userEvent.click(screen.getByRole('button', { name: '知识库' }))
  expect(onNavigate).toHaveBeenCalledWith('kb')
})

test('active navigation is never communicated by colour alone', () => {
  render(<AppShell view="market" onNavigate={() => {}}>content</AppShell>)
  expect(screen.getByRole('button', { name: /插件市场/ })).toHaveAttribute('aria-current', 'page')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/app/shell.test.tsx`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现路由表与外壳**

`src/app/routes.ts`：

```ts
export const VIEW_IDS = ['workbench','team','tasks','kb','market','projects','files','settings'] as const
export type ViewId = (typeof VIEW_IDS)[number]

export const NAV_ITEMS = [
  { id: 'workbench', label: '工作台' },
  { id: 'team', label: '我的团队' },
  { id: 'tasks', label: '任务中心', badge: 3 },
  { id: 'kb', label: '知识库' },
  { id: 'market', label: '插件市场' },
  { id: 'projects', label: '项目管理' },
  { id: 'files', label: '文件管理' },
  { id: 'settings', label: '设置' },
] as const satisfies readonly { id: ViewId; label: string; badge?: number }[]

export function readView(hash: string): ViewId {
  const raw = hash.replace(/^#\/?/, '')
  return (VIEW_IDS as readonly string[]).includes(raw) ? (raw as ViewId) : 'workbench'
}
```

`Sidebar.tsx` 的每个导航项必须是 `<button type="button">`，激活项加 `aria-current="page"`，图标为内联 SVG（从设计稿里逐个搬），badge 用 `<span className="nav-badge">`。`Topbar.tsx` 包含搜索框（带 `<label className="sr">`）、通知、主题、专业版、窗口控制三件套。`AppShell.tsx` 用 CSS Grid 排 `250px minmax(0,1fr)`。

`src/App.tsx` 接上 hash 路由：

```tsx
export default function App() {
  const [view, setView] = useState<ViewId>(() => readView(location.hash))
  useEffect(() => {
    const sync = () => setView(readView(location.hash))
    addEventListener('hashchange', sync)
    return () => removeEventListener('hashchange', sync)
  }, [])
  const navigate = (next: ViewId) => { location.hash = next }
  return <AppShell view={view} onNavigate={navigate}>{/* 视图槽，Task 10 填充 */}</AppShell>
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test src/app/shell.test.tsx && pnpm typecheck`
Expected: PASS，4 passed。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add app shell with hash routing"
```

---

## Task 6: 指挥官横幅与状态流程

**Files:**
- Create: `src/features/commander/CommanderBanner.tsx`, `src/features/commander/StatusFlow.tsx`
- Test: `src/features/commander/commander.test.tsx`

**Interfaces:**
- Consumes: `CommanderSession['commander']`、`CommanderSession['stage']`（Task 3）
- Produces: `<CommanderBanner commander={...} stage={...} />`；`<StatusFlow stage={...} />`

- [ ] **Step 1: 写失败的测试**

```tsx
import { render, screen } from '@testing-library/react'
import StatusFlow from './StatusFlow'
import CommanderBanner from './CommanderBanner'

const stage = { done: ['analysis', 'planning'] as const, active: 'dispatch' as const }

test('status flow exposes four steps with text, not colour alone', () => {
  render(<StatusFlow stage={{ done: [...stage.done], active: stage.active }} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByText('任务分析')).toHaveAccessibleName(/已完成/)
  expect(screen.getByText('智能体分配中')).toHaveAccessibleName(/进行中/)
  expect(screen.getByText('执行中')).toHaveAccessibleName(/未开始/)
})

test('the active step is announced as the current step', () => {
  render(<StatusFlow stage={{ done: [...stage.done], active: stage.active }} />)
  expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('智能体分配中')
})

test('banner renders the model tag and the greeting verbatim', () => {
  render(
    <CommanderBanner
      commander={{ name: 'AI 指挥官 Commander', model: 'DeepSeek R1',
        greeting: '你好！我是你的 AI 指挥官，负责分析需求、拆解任务，并调度你的智能体团队高效完成工作。' }}
      stage={{ done: ['analysis', 'planning'], active: 'dispatch' }}
    />,
  )
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('AI 指挥官 Commander')
  expect(screen.getByText('DeepSeek R1')).toBeVisible()
  expect(screen.getByText(/负责分析需求、拆解任务/)).toBeVisible()
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/commander`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 StatusFlow**

四个步骤的文案固定为 `任务分析 / 方案规划 / 智能体分配中 / 执行中`。每步是一个 `<li>`，内部有一个仅屏幕可见的 `<span className="sr">` 承载 `已完成 / 进行中 / 未开始`；进行中的那一步加 `aria-current="step"`。完成态与进行态使用不同 SVG（对勾 / 旋转环），**不得**只靠颜色。

- [ ] **Step 4: 实现 CommanderBanner**

结构：头像（内联 SVG 或 `avatar.png`，`onError` 时移除）、标题 `h2`、模型标签、问候语、`<StatusFlow />`、右侧标语区。右侧标语在 1120px 以下用 CSS 隐藏，不要用 JS 判断宽度。

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test src/features/commander`
Expected: PASS，3 passed。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add commander banner and status flow"
```

---

## Task 7: 对话流与任务拆解卡

**Files:**
- Create: `src/features/commander/MessageList.tsx`, `src/features/commander/TaskBreakdownCard.tsx`
- Test: `src/features/commander/messages.test.tsx`

**Interfaces:**
- Consumes: `Message`、`BreakdownItem`（Task 3）
- Produces: `<MessageList messages={Message[]} />`；`<TaskBreakdownCard items={BreakdownItem[]} />`

- [ ] **Step 1: 写失败的测试**

```tsx
import { render, screen, within } from '@testing-library/react'
import TaskBreakdownCard from './TaskBreakdownCard'
import MessageList from './MessageList'

const items = [
  { id: 'b1', index: 1, agentName: 'UI 设计智能体', action: '生成界面设计方案', state: 'done' as const },
  { id: 'b2', index: 2, agentName: '前端开发智能体', action: '制作小程序页面', state: 'running' as const },
  { id: 'b3', index: 3, agentName: '测试智能体', action: '检查效果和兼容性', state: 'queued' as const },
]

test('breakdown rows carry index, agent, action and an explicit state label', () => {
  render(<TaskBreakdownCard items={items} />)
  const rows = screen.getAllByRole('listitem')
  expect(rows).toHaveLength(3)
  expect(within(rows[0]!).getByText('已完成')).toBeVisible()
  expect(within(rows[1]!).getByText('进行中')).toBeVisible()
  expect(within(rows[2]!).getByText('等待派发')).toBeVisible()
})

test('message list separates the user and commander turns for assistive tech', () => {
  render(<MessageList messages={[
    { id: 'm1', author: 'user', at: '10:24', text: '帮我设计一个美容院小程序首页' },
    { id: 'm2', author: 'commander', at: '10:24', text: '我已经理解你的需求，将安排：', breakdown: items },
  ]} />)
  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.getByText('李晓晨')).toBeVisible()
  expect(screen.getByText('AI 指挥官 Commander')).toBeVisible()
})

test('the thread is a polite live region so new replies are announced', () => {
  render(<MessageList messages={[]} />)
  expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/commander/messages.test.tsx`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 TaskBreakdownCard**

外层 `<section>` 带标题「任务拆解 · N 个智能体协同」，内部 `<ol>` 三个 `<li>`，每行依次是序号方块、图标、名称+职责、状态胶囊。状态映射固定为 `done→已完成 / running→进行中 / queued→等待派发`，写在常量里而不是散落在 JSX。

- [ ] **Step 4: 实现 MessageList**

每条消息 `<article className={author === 'user' ? 'msg me' : 'msg'}>`，容器 `<section role="log" aria-live="polite" aria-label="与指挥官的协作记录">`。用户气泡右对齐用 CSS，不要用 `dir` 之类的 hacks。

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test src/features/commander/messages.test.tsx`
Expected: PASS，3 passed。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add message list and task breakdown card"
```

---

## Task 8: 输入区与 @ 智能体

**Files:**
- Create: `src/features/composer/Composer.tsx`, `src/features/composer/AgentMentionPopover.tsx`
- Test: `src/features/composer/composer.test.tsx`

**Interfaces:**
- Consumes: `Agent[]`（Task 3）
- Produces: `<Composer agents={Agent[]} pending={boolean} onSend={(text: string) => void} />`

- [ ] **Step 1: 写失败的测试**

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockSessionSource } from '../../domain/mock-session'
import Composer from './Composer'

async function setup() {
  const { load } = new MockSessionSource({ latencyMs: 0 })
  const agents = (await load()).agents
  const onSend = vi.fn()
  render(<Composer agents={agents} pending={false} onSend={onSend} />)
  return { onSend, user: userEvent.setup() }
}

test('Enter sends and clears the box', async () => {
  const { onSend, user } = await setup()
  const box = screen.getByLabelText('输入你的需求')
  await user.type(box, '加一个预约入口')
  await user.keyboard('{Enter}')
  expect(onSend).toHaveBeenCalledWith('加一个预约入口')
  expect(box).toHaveValue('')
})

test('Shift+Enter inserts a newline instead of sending', async () => {
  const { onSend, user } = await setup()
  const box = screen.getByLabelText('输入你的需求')
  await user.type(box, '第一行')
  await user.keyboard('{Shift>}{Enter}{/Shift}')
  expect(onSend).not.toHaveBeenCalled()
  expect(box).toHaveValue('第一行\n')
})

test('empty input never sends', async () => {
  const { onSend } = await setup()
  expect(screen.getByRole('button', { name: '发送' })).toBeDisabled()
  expect(onSend).not.toHaveBeenCalled()
})

test('the @ button opens a listbox of agents and inserts a mention token', async () => {
  const { user } = await setup()
  await user.click(screen.getByRole('button', { name: /选择智能体/ }))
  const options = screen.getByRole('listbox', { name: '选择要 @ 的智能体' })
  await user.click(within(options).getByRole('option', { name: /UI 设计师/ }))
  expect(screen.getByLabelText('输入你的需求')).toHaveValue('@UI 设计师 ')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/composer`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 Composer**

`<textarea>` 带 `<label className="sr">输入你的需求</label>`；`pending` 为真时发送按钮 `disabled` 并显示加载态；输入为空时按钮同样 `disabled`；`onInput` 里做自适应高度（`scrollHeight`，上限 120px）。四个快捷按钮文案固定为 `选择智能体 / 上传文件 / 插入图片 / 使用模板`。

- [ ] **Step 4: 实现 AgentMentionPopover**

用 `role="listbox"` + `aria-label="选择要 @ 的智能体"`，每个条目 `role="option"`。打开时禁用页面滚动；按 `Escape` 关闭并把焦点还给触发按钮；点击外部关闭。定位用 `position: absolute`，父容器 `.composer` 设 `position: relative`。

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test src/features/composer`
Expected: PASS，4 passed。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add composer with agent mention popover"
```

---

## Task 9: 智能体侧栏与执行日志

**Files:**
- Create: `src/features/agents/AgentRail.tsx`, `src/features/agents/AgentCard.tsx`, `src/features/agents/LiveLog.tsx`
- Test: `src/features/agents/agents.test.tsx`

**Interfaces:**
- Consumes: `Agent`（Task 3）
- Produces: `<AgentRail agents={Agent[]} />`；`<LiveLog entries={{ at: string; agent: string; text: string; state: 'run' | 'done' | 'idle' }[]} />`

- [ ] **Step 1: 写失败的测试**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockSessionSource } from '../../domain/mock-session'
import AgentRail from './AgentRail'
import LiveLog from './LiveLog'

const entries = [
  { at: '10:25', agent: '前端工程师', text: '正在生成页面代码…', state: 'run' as const },
  { at: '10:24', agent: 'UI 设计师', text: '完成界面设计方案…', state: 'done' as const },
]

test('every agent shows name, skills and a textual status', async () => {
  const { agents } = await new MockSessionSource({ latencyMs: 0 }).load()
  render(<AgentRail agents={agents} />)
  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(screen.getAllByText('在线')).toHaveLength(4)
  expect(screen.getAllByText('待命').length).toBe(2)
})

test('the 开发 tab filters the rail down to developers', async () => {
  const { agents } = await new MockSessionSource({ latencyMs: 0 }).load()
  render(<AgentRail agents={agents} />)
  await userEvent.click(screen.getByRole('tab', { name: '开发' }))
  // 被过滤掉的卡片使用 hidden 属性，因此不再出现在可访问性树里
  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.getByText('UI 设计师')).not.toBeVisible()
})

test('filtering is driven by aria-selected, not by CSS classes', async () => {
  const { agents } = await new MockSessionSource({ latencyMs: 0 }).load()
  render(<AgentRail agents={agents} />)
  await userEvent.click(screen.getByRole('tab', { name: '运维' }))
  expect(screen.getByRole('tab', { name: '运维' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: '全部' })).toHaveAttribute('aria-selected', 'false')
})

test('the execution log is a polite live region with time, agent and text', () => {
  render(<LiveLog entries={entries} />)
  const log = screen.getByRole('log', { name: '实时执行日志' })
  expect(log).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByText('10:25')).toBeVisible()
  expect(screen.getByText('正在生成页面代码…')).toBeVisible()
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/agents`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 AgentCard 与 AgentRail**

分类来自智能体自身的 `role` 关键词映射（`开发 / 设计 / 测试 / 运维 / 文案`），写成一个 `categoryOf(agent): Category` 纯函数并单独测两个边界：`后端工程师 → 开发`、`文案工程师 → 文案`。tab 用 `role="tablist"` + `role="tab"` + `aria-selected`。过滤后的隐藏用 `hidden` 属性，不要用 `display:none` 内联样式。

- [ ] **Step 4: 实现 LiveLog**

容器 `<section role="log" aria-live="polite" aria-label="实时执行日志">`，每条记录有时间（等宽字体）、智能体名、文本和状态点。状态点只是补充，文本本身要能读懂。

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test src/features/agents`
Expected: PASS，4 passed。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add agent rail and live execution log"
```

---

## Task 10: 工作台组装与视觉基线

**Files:**
- Create: `src/features/workbench/WorkbenchPage.tsx`, `src/features/workbench/workbench.test.tsx`
- Create: `e2e/workbench.spec.ts`, `playwright.config.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: 前面所有组件的产出
- Produces: `<WorkbenchPage source={SessionSource} />`；`pnpm e2e` 可跑的视觉基线

- [ ] **Step 1: 写失败的测试**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MockSessionSource } from '../../domain/mock-session'
import WorkbenchPage from './WorkbenchPage'

test('loading state is announced before the session arrives', () => {
  render(<WorkbenchPage source={new MockSessionSource({ latencyMs: 50 })} />)
  expect(screen.getByRole('status')).toHaveTextContent('正在连接指挥官')
})

test('the whole workbench renders once the session resolves', async () => {
  render(<WorkbenchPage source={new MockSessionSource({ latencyMs: 0 })} />)
  await waitFor(() => expect(screen.getByRole('heading', { level: 2 })).toBeVisible())
  expect(screen.getByRole('log', { name: '与指挥官的协作记录' })).toBeVisible()
  expect(screen.getByRole('log', { name: '实时执行日志' })).toBeVisible()
  expect(screen.getByLabelText('输入你的需求')).toBeVisible()
})

test('a failed load shows a retry affordance instead of a blank screen', async () => {
  const broken = { load: () => Promise.reject(new Error('host down')), send: () => Promise.reject(new Error()) }
  render(<WorkbenchPage source={broken} />)
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('连接指挥官失败'))
  expect(screen.getByRole('button', { name: '重试' })).toBeEnabled()
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/workbench`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 WorkbenchPage**

三块布局：横幅（`CommanderBanner`）、滚动对话区（`MessageList`）、输入区（`Composer`）组成中间列；右侧列是 `AgentRail` + `LiveLog` + 推荐卡片。加载中渲染 `<p role="status">正在连接指挥官…</p>`，失败渲染 `<div role="alert">连接指挥官失败</div>` 加一个「重试」按钮（点击重新调用 `load`）。把 `src/App.tsx` 里 `view === 'workbench'` 的分支接上这个组件。

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test src/features/workbench && pnpm typecheck && pnpm test`
Expected: 全绿，累计不少于 28 个用例。

- [ ] **Step 5: 配置并生成视觉基线**

`playwright.config.ts`：

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 900 } },
  webServer: { command: 'pnpm dev --port 5199', port: 5199, reuseExistingServer: true },
})
```

`e2e/workbench.spec.ts`：

```ts
import { expect, test } from '@playwright/test'

test('workbench matches the design baseline', async ({ page }) => {
  await page.goto('http://localhost:5199/#workbench')
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(page).toHaveScreenshot('workbench-1600x900.png', { maxDiffPixelRatio: 0.02 })
})

test('responsive shell keeps navigation reachable at 1024', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 820 })
  await page.goto('http://localhost:5199/#workbench')
  await expect(page.getByRole('button', { name: '工作台' })).toBeVisible()
})
```

Run: `pnpm e2e -- --update-snapshots`
Expected: 生成 `e2e/workbench.spec.ts-snapshots/workbench-1600x900.png`。人工比对一次这张基线图与 `docs/specs/workbench-design.html`，确认无布局回归后再提交。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: compose workbench page with loading and error states"
```

---

## 后续计划（不在本次范围内）

以下内容各自独立成篇，等 v1 工作台通过验收后按同样格式单独出计划：

1. **我的团队**页面（增删改智能体、技能编辑、模型切换）
2. **任务中心**（看板拖拽、列表视图、筛选与排序）
3. **知识库**（上传、解析、索引状态、检索）
4. **插件市场**（列表、详情、安装/卸载生命周期）
5. **项目管理** + **文件管理**（同一套资源模型，建议合并成一个计划）
6. **设置**（表单持久化、主题切换真实生效）
7. **Host 接入**：实现 `HostSessionSource`，把 `MockSessionSource` 换掉，走 dsh 本地 Host 的 HTTP + WebSocket；这一步之前必须先确定是挂成 dsh 客户端插件还是独立外壳

---

## Self-Review

**1. Spec coverage（对照设计稿逐个功能点）**

| 设计稿元素 | 覆盖任务 |
|---|---|
| 左侧导航 8 项 + badge + 用户区 | Task 5 |
| 顶栏搜索 / 通知 / 主题 / 专业版 / 窗口控制 | Task 5 |
| 指挥官横幅 + DeepSeek R1 标签 + 问候语 | Task 6 |
| 任务分析 / 方案规划 / 智能体分配中 / 执行中 | Task 6 |
| 用户消息 + 指挥官回复 + 任务拆解卡 | Task 7 |
| 底部输入区 + 四个快捷按钮 + 发送 | Task 8 |
| 我的智能体（6 张卡 + 分类 tab + 添加） | Task 9 |
| 实时执行日志 + 推荐使用 | Task 9 |
| 玻璃拟态、圆角、阴影、配色令牌 | Task 2 |
| 断点 1440 / 1120 / 860 | Task 5（外壳）、Task 6（标语隐藏）、Task 10（回归） |
| 对比度 ≥ 4.5:1 | Task 2（自动断言） |
| reduced-motion | Task 2（全局样式）+ Task 10（回归用例） |

**2. Placeholder scan**：无 TBD / TODO / "稍后补充"。"实现 X" 的步骤均给出了结构要点与固定文案，数据取自设计稿，没有留空。

**3. Type consistency**：`SessionSource` 的 `load/send`（Task 3）→ `useCommanderSession` 的 `send`（Task 4）→ `WorkbenchPage` 的 `source` prop（Task 10）签名一致；`BreakdownItem.state` 的三值 `done|running|queued`（Task 3）与 `TaskBreakdownCard` 的状态映射（Task 7）一致；`Agent.status` 的 `online|idle|running`（Task 3）与 `AgentCard` 的文案映射（Task 9）一致；`ViewId` 联合类型（Task 5）与 `readView` 白名单一致。

---

## 执行记录（2026-10-07）

计划已按 10 个任务全部执行完毕，分支 `feat/workbench-v1`。执行过程中共 12 处与原文不同，逐条记录原因，后续计划不要重蹈。

**环境**

1. **Node 版本**：本机 `node` 在 PATH 上解析到微信开发者工具自带的 v16，跑不了 Vite。实际使用 `F:\nodejs\node.exe`（v22.20.0）。所有命令前需 `export PATH="F:/nodejs:$PATH"`（PowerShell 为 `$env:PATH = 'F:\nodejs;' + $env:PATH`）。`package.json` 已加 `engines.node >= 20`。
2. **依赖实际版本**：安装时解析到 vite 8.3.2 / vitest 5.0.3 / typescript 7.0.2 / eslint 10.12.0，均高于计划书写时的预期。TS 7 的严格度带来下面第 3 条。

**任务内偏差**

3. **Task 1 不引入 CSS**：原文让 `App.tsx` 在 Task 1 就 `import './styles/tokens.css'`，但这两个文件属于 Task 2，Vite 会因找不到模块而失败。改为 Task 2 一并创建并接入。
4. **新增 `src/vite-env.d.ts`**：TS 7 对 CSS 副作用导入报 `TS2882`，需要 `/// <reference types="vite/client" />` 声明。计划里漏了这一步。
5. **`vite.config.ts` 用 `vitest/config` 的 `defineConfig`**：从 `vite` 导入时 `test` 字段没有类型。
6. **vitest 必须排除 e2e**：默认 include 会收进 `e2e/*.spec.ts`，导致 vitest 去跑 Playwright 的用例并报文件级失败。已在 `test.exclude` 显式排除。
7. **`CommanderSession` 增加 `log: LogEntry[]`**：原文 Task 10 要渲染 `LiveLog`，但 Task 3 的会话类型里没有日志字段，任务无法闭环。同时新增 `src/domain/defaults.ts`，把指挥官名称、模型、问候语、用户名收敛成一份常量，避免 UI 与 mock 各写一遍。
8. **`useCommanderSession` 增加 `retry()`**：原文 Task 10 要求错误态有重试按钮，但 Task 4 的 Hook 没有暴露重试入口。
9. **Hook 的数据源必须稳定**：`renderHook(() => useCommanderSession(new MockSessionSource()))` 会因每次渲染新建实例而无限重新加载。测试改为在 `renderHook` 外创建实例；`App.tsx` 用 `useMemo` 固定实例。调用方后续也要遵守这条。
10. **测试里不能解构 `load`**：`const { load } = new MockSessionSource()` 会丢失 `this` 绑定，运行时报 `Cannot read properties of undefined (reading 'wait')`。已改为 `source.load()`。
11. **`StatusFlow` 用 `aria-label` 表达状态**：ARIA 的 `listitem` 不做 name-from-content 计算，`toHaveAccessibleName` 拿到空串。改为每个 `<li>` 显式带 `aria-label="任务分析，已完成"`。
12. **新增 `src/app/icons.tsx`**：八个导航图标内联进 `Sidebar.tsx` 会把文件撑到 120 行以上，抽成独立模块。
13. **新增 `src/features/agents/categories.ts`**：`categoryOf` 原本在 `AgentRail.tsx` 里，但 `AgentCard` 也需要它来决定身份色，抽出来避免循环依赖；`AgentRail` 保留 re-export 以免破坏测试导入。
14. **Playwright 需要 `baseURL`**：`page.goto('/#workbench')` 依赖 `use.baseURL`，否则 URL 无效。
15. **视觉基线窗口**：截图在 1600×900（真 16:9）生成。原设计稿的紧凑断点分散在拆分后的三个 CSS 文件里，第一次跑 e2e 时第三条消息被挤出可视区，已在 `commander.css` / `composer.css` / `workbench.css` 各自补回 `@media (min-width:1121px) and (max-height:960px)` 规则。

**验收结果**

| 检查 | 结果 |
|---|---|
| `pnpm typecheck` | 通过，无输出 |
| `pnpm test` | 10 个文件 / 42 个用例全过 |
| `pnpm build` | 通过，JS 168.13 kB（gzip 53.53 kB）、CSS 21.75 kB（gzip 5.13 kB） |
| `pnpm e2e` | 4 项全过，视觉基线 `e2e/workbench.spec.ts-snapshots/workbench-1600x900-win32.png` 稳定 |
| 对比度守卫 | `src/theme/contrast.test.ts` 5 项全过，令牌改动会立刻报警 |

---

## 追加：Electron 桌面外壳（2026-10-07）

v1 验收后又追加了一步，把工作台包成真正的桌面应用。这部分不在原计划的 10 个任务里，是独立的一次开发。

**新增文件**

| 文件 | 职责 |
|---|---|
| `electron/main.ts` | 主进程：无边框窗口、IPC 窗口控制、外链交给系统浏览器 |
| `electron/preload.ts` | 经 `contextBridge` 暴露极小的 `window.dshDesktop` |
| `src/app/desktop.ts` | 渲染层的类型化访问器，浏览器里返回 `null` |
| `scripts/dev-desktop.mjs` | 开发启动器：编译主进程 → 起 Vite → 等端口 → 拉起 Electron |
| `e2e/desktop.spec.ts` | 用 Playwright 的 `_electron` 验证真实窗口 |
| `pnpm-workspace.yaml` | pnpm 11 的安装脚本白名单 |

**新引入的坑（都已解决）**

1. **Electron 二进制下不来**：postinstall 走 GitHub releases，国内 `fetch failed`。解法是设 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` 再 `pnpm install`。
2. **pnpm 11 默认拦掉 postinstall**：`electron` 和 `esbuild` 都装了空壳。白名单的键名是 `allowBuilds`（不是文档里常见的 `onlyBuiltDependencies`），写进 `pnpm-workspace.yaml`；交互式 `pnpm approve-builds` 会自动改写这个文件。
3. **被忽略的构建脚本会让 `pnpm <script>` 直接失败**：pnpm 在跑脚本前会做依赖状态检查，检查失败就中止，表现为 `pnpm typecheck` 报一长串内部堆栈。批准构建后就恢复了。
4. **`localhost` 与 `127.0.0.1` 不是一回事**：Playwright 的 webServer 用默认 host 起 Vite，在 Node 17+ 上绑到 IPv6 的 `::1`；Electron 去连 `127.0.0.1` 得到的是 `chrome-error://chromewebdata/`（页面全白，但 preload 正常）。已在 `playwright.config.ts` 与 dev 启动器里统一为显式 `--host 127.0.0.1`。
5. **窗口标题会变**：`App.tsx` 设置的 `document.title` 会被 Electron 当作窗口标题，所以生产标题是「工作台 · AI 编程助手」而不是产品名。e2e 断言按实际行为写。

**视觉基线更新**

窗口控制在浏览器里没有原生能力，改成了禁用态（`opacity: .45`）。这会让工作台的截图基线变化一次，已用 `pnpm e2e -- --update-snapshots` 重新生成并人工比对，随后不带 `--update` 复跑确认稳定。

**桌面化的验收结果**

| 检查 | 结果 |
|---|---|
| `pnpm typecheck` | 通过 |
| `pnpm test` | 11 个文件 / 46 个用例全过 |
| `pnpm e2e` | 8 项全过（浏览器 4 + Electron 4） |
| Electron 主进程体积 | main.mjs 2.2 kB、preload.cjs 802 B |

Electron 的四项覆盖：窗口能启动并渲染工作台、三个窗口控制是可用按钮而非死控件、点击最大化真的调用主进程（`isMaximized()` 返回 true 且按钮变成「还原窗口」）、窗口标题跟随视图且窗口可缩放。

---

## 追加：其余七个功能视图（2026-10-07）

原计划的「后续计划」一节列了七个待写计划。实际执行时按用户要求直接做完，没有再单独出计划。以下记录架构决定与被砍掉的东西。

**数据层：新增WorkspaceSource**

原有的 `SessionSource` 只服务工作台。七个新视图共用 `src/domain/workspace.ts` 的 `WorkspaceSource`，一个 `load()` 返回 `WorkspaceData`：

```
team · tasks · documents · knowledgeCategories · plugins
projects · milestones · deliverables · activity · files · storage · settings
```

`MockWorkspaceSource` 从 `src/domain/seed/workspace-seed.ts` 读取，`useWorkspace` 提供 loading / ready / error 三态，七个页面共用一个 `WorkspaceGate` 外壳，三态处理不重复实现。

**名册收敛**

智能体数据原来只存在于 `mock-session.ts`。新增 `src/domain/seed/agents.ts` 的 `TEAM` 作为唯一来源，工作台侧栏从中裁出基础字段，团队页直接用带统计与任务的富字段。同一个人的名字和技能不会在两处各写一遍。

**新增文件（22 个）**

| 类别 | 文件 |
|---|---|
| 领域 | `workspace.ts`、`mock-workspace.ts`、`seed/agents.ts`、`seed/workspace-seed.ts` |
| Hook | `useWorkspace.ts` |
| 外壳 | `app/WorkspaceGate.tsx`、`styles/layout.css` |
| 页面 | `features/team/TeamPage.tsx`、`tasks/TasksPage.tsx`、`knowledge/KnowledgePage.tsx`、`market/MarketPage.tsx`、`projects/ProjectsPage.tsx`、`files/FilesPage.tsx`、`settings/SettingsPage.tsx` |
| 测试 | 上述每个模块对应的 8 个 `*.test.*` |

**执行中修掉的真问题**

1. **`aria-current={false}` 会渲染成字面量 `"false"`**：React 对 `aria-*` 属性不做布尔省略。知识库与设置的侧栏导航原本这样写，测试断言「非激活项没有该属性」直接失败。改成 `cond ? 'true' : undefined`。
2. **`role="switch"` 用错了属性**：原本写 `aria-pressed`，switch 语义要求 `aria-checked`，否则屏幕阅读器读不出开关状态。CSS 选择器同步改为 `.sw[aria-checked='true']`。
3. **任务卡状态文案串台**：三元表达式兜底成了「已归档」，导致「进行中」的任务也显示已归档。改为只在 `lane === 'done'` 时显示。
4. **硬编码的派生数据**：「3 个智能体在跑」是写死的，改为从进行中任务的 assignee 去重计数。
5. **知识库筛选是假的**：原先非「全部」分类返回 `documents.slice(0, 2)`，与分类计数对不上。改为给每份文档加 `categoryId`，分类计数由清单派生，并补了空态文案。
6. **CSS 注入顺序**：`layout.css` 在 `App.tsx` 里最后导入，会覆盖各功能自己的同名选择器（当时只有 `.bar` 冲突）。共享基元统一放 layout.css，功能样式不再重复定义同名类。

**这一轮砍掉的东西（有意为之）**

- 「新建智能体 / 上传文档 / 新建项目」等按钮目前是视觉占位，没有接入真实表单。数据层是只读的，写操作需要先扩 `WorkspaceSource` 接口。
- 设置页只做单分类展示（不是设计稿里的三组全列），因为分类导航是真的、切换有实际意义。
- 列表视图（任务中心的「列表」）是只读表格，没有排序与分页。
- 智能体头像仍是统一的内联 SVG，没有各角色区分形象。

**本轮的验收结果**

| 检查 | 结果 |
|---|---|
| `pnpm typecheck` | 通过 |
| `pnpm test` | 19 个文件 / 83 个用例全过（新增 37 个） |
| `pnpm e2e` | 17 项全过（浏览器 12 + Electron 4 + 路由 1），新增「八个视图各自渲染」与「遍历八个视图不报错」 |
| 工作台视觉基线 | CSS 重组后有一次亚像素级偏移，已重新生成并复跑确认稳定 |
