# AI 指挥官工作台

多智能体协作的桌面端开发工作台。当前进度：v1 工作台首屏。

## 跑起来

```bash
pnpm install
pnpm start
```

`pnpm start` 会启动开发服务器并自动打开浏览器（http://127.0.0.1:5180）。

> **不要直接双击 `index.html` 或 `dist/index.html`。**
> 这是 Vite 构建的单页应用，入口脚本用的是绝对路径且为 ES module，用 `file://` 打开一定会白屏——浏览器会因为 CORS 策略拒绝加载模块。必须通过 HTTP 访问。

## 环境要求

- Node ≥ 20。本机 PATH 上的 `node` 是微信开发者工具自带的 v16，跑不了 Vite；
  实际使用 `F:\nodejs` 下的 v22。PowerShell 里先执行：

  ```powershell
  $env:PATH = 'F:\nodejs;' + $env:PATH
  ```

## 常用命令

| 命令 | 作用 |
|---|---|
| `pnpm start` | 启动开发服务器并打开浏览器 |
| `pnpm dev` | 只启动开发服务器 |
| `pnpm test` | 单元与组件测试（vitest） |
| `pnpm test:watch` | 测试监听模式 |
| `pnpm typecheck` | 类型检查 |
| `pnpm build` | 生产构建到 `dist/` |
| `pnpm e2e` | Playwright 端到端 + 视觉基线 |

首次跑 e2e 需要下载浏览器：`pnpm exec playwright install chromium`。

## 设计约束

设计令牌的单一事实来源是 `src/theme/contrast.ts` 与 `src/styles/tokens.css`，两者必须逐字一致。
改动任何色值前先跑 `pnpm test src/theme/contrast.test.ts`——那里有 WCAG 对比度断言守着。

完整的设计与实现约束见 `docs/superpowers/plans/2026-10-07-workbench-v1.md` 的「Global Constraints」。
视觉参照是 `docs/specs/workbench-design.html`。

## 架构接缝

UI 与数据完全解耦：所有会话数据来自 `src/domain/session-source.ts` 的 `SessionSource` 接口。
v1 只实现了 `MockSessionSource`；将来接 dsh 本地 Host 时新增 `HostSessionSource` 即可，组件层不需要改动。
