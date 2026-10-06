# v1 工作台首屏 + Electron 桌面外壳

## 这个 PR 做了什么

交付一个可运行的桌面应用首屏：左侧导航、AI 指挥官横幅（含四段状态流程）、任务拆解对话流、输入区（含 @ 智能体弹层）、右栏智能体团队与实时执行日志。外壳是 Electron，界面是 React 18 + Vite + TypeScript。

## 核心架构决定

**UI 与数据完全解耦。** 所有会话数据来自 `src/domain/session-source.ts` 的 `SessionSource` 接口，v1 只实现 `MockSessionSource`。将来对接 dsh 本地 Host 时新增 `HostSessionSource` 即可，组件层不需要任何改动。

**React 18 而非 19。** dsh 的客户端插件宿主运行在 React 18，跨大版本将来无法挂载。

**无边框窗口 + 自绘窗口控制。** `frame: false`，最小化 / 最大化 / 关闭经 IPC 打到主进程；顶栏是拖动区，交互控件已排除。安全默认值 `contextIsolation: true` / `nodeIntegration: false` / `sandbox: true`，preload 只经 `contextBridge` 暴露一个极小的 `window.dshDesktop`。

## 验证证据

| 检查 | 结果 |
|---|---|
| `pnpm typecheck` | 通过，无输出 |
| `pnpm test` | 11 个文件 / 46 个用例全过 |
| `pnpm e2e` | 8 项全过（浏览器 4 + Electron 4） |
| `pnpm build` | Web JS 168.13 kB（gzip 53.53 kB）、CSS 21.75 kB（gzip 5.13 kB） |

Electron 的四项不是冒烟测试：真的拉起窗口、真的点最大化与还原、真的去主进程查 `isMaximized()`、真的断言窗口标题跟随视图。

对比度有自动化守卫：`src/theme/contrast.test.ts` 用 WCAG 公式断言每一档文字色，改令牌会立刻报警。视觉回归基线在 `e2e/workbench.spec.ts-snapshots/`。

## 已知限制

- 只交付工作台首屏。我的团队 / 任务中心 / 知识库 / 插件市场 / 项目管理 / 文件管理 / 设置七个视图尚未实现，导航可切换但内容为空。设计稿见 `docs/specs/workbench-design.html`。
- 数据是 mock，没有接真实 Host。
- 没有安装包（electron-builder / NSIS 未配置）。
- @ 智能体弹层支持 Tab 与 Enter，尚未实现方向键导航。

## 下一步

1. 配置 electron-builder，产出 Windows 安装包
2. 依次实现其余七个视图（各自独立成计划）
3. 实现 `HostSessionSource`，替换 mock —— 在此之前需先确定是挂成 dsh 客户端插件还是独立外壳

## 复核指引

```powershell
$env:PATH = 'F:\nodejs;' + $env:PATH
pnpm install
pnpm test
pnpm e2e          # 首次需 pnpm exec playwright install chromium
pnpm dev:desktop  # 打开桌面窗口
```

实现过程与全部偏差记录见 `docs/superpowers/plans/2026-10-07-workbench-v1.md`。
