# AI 指挥官工作台

多智能体协作的桌面端开发工作台。八个功能视图全部实现，Electron 桌面外壳可运行。

## 跑成桌面应用

```powershell
$env:PATH = 'F:\nodejs;' + $env:PATH
cd F:\dsh-commander
pnpm dev:desktop
```

这条命令会依次做三件事：编译 Electron 主进程 → 起 Vite → 拉起 Electron 窗口。改前端代码会热更新，改 `electron/` 下的代码需要重跑。

跑生产版本（先构建再启动，加载 `dist/` 而不是 dev server）：

```powershell
pnpm desktop
```

> **首次安装注意**：Electron 的 postinstall 要从 GitHub releases 下载约 245 MB 的运行时。
> 国内直连会 `fetch failed`，先设镜像再装：
>
> ```powershell
> $env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
> pnpm install
> ```

### 桌面外壳做了什么

- **无边框窗口**：`frame: false`，窗口控制（最小化 / 最大化 / 关闭）由界面里的三个按钮驱动，通过 IPC 打通主进程。顶栏是拖动区（`-webkit-app-region: drag`），输入框和按钮排除了拖动。
- **安全默认值**：`contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`。preload 只经 `contextBridge` 暴露一个极小的 `window.dshDesktop`，不把 `ipcRenderer` 本体交给渲染层。
- **外链走系统浏览器**：`setWindowOpenHandler` 拒绝应用内开新窗口。
- **优雅降级**：浏览器里没有 `window.dshDesktop`，三个窗口控制自动变成禁用态，而不是留一个点了没反应的假按钮。
- **窗口标题跟随视图**：`document.title` 会被 Electron 当作窗口标题，切换视图时标题同步变化。

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
| `pnpm dev:desktop` | 开发模式启动桌面应用（Vite + Electron） |
| `pnpm desktop` | 构建后启动桌面应用（生产模式） |
| `pnpm start` | 启动开发服务器并打开浏览器 |
| `pnpm dev` | 只启动开发服务器 |
| `pnpm build:electron` | 只编译 Electron 主进程与 preload |
| `pnpm test` | 单元与组件测试（vitest） |
| `pnpm test:watch` | 测试监听模式 |
| `pnpm typecheck` | 类型检查 |
| `pnpm build` | 生产构建：Web 产物到 `dist/`，Electron 产物到 `electron/dist/` |
| `pnpm e2e` | Playwright 端到端（浏览器 4 项 + Electron 4 项）+ 视觉基线 |

首次跑 e2e 需要下载浏览器：`pnpm exec playwright install chromium`。

## 设计约束

设计令牌的单一事实来源是 `src/theme/contrast.ts` 与 `src/styles/tokens.css`，两者必须逐字一致。
改动任何色值前先跑 `pnpm test src/theme/contrast.test.ts`——那里有 WCAG 对比度断言守着。

完整的设计与实现约束见 `docs/superpowers/plans/2026-10-07-workbench-v1.md` 的「Global Constraints」。
视觉参照是 `docs/specs/workbench-design.html`。

## 架构接缝

UI 与数据完全解耦，两个接口分别覆盖工作台与其余七个视图：

| 接口 | 位置 | 提供什么 | v1 实现 |
|---|---|---|---|
| `SessionSource` | `src/domain/session-source.ts` | 指挥官会话：名册、消息、状态流、执行日志 | `MockSessionSource` |
| `WorkspaceSource` | `src/domain/workspace.ts` | 团队 / 任务 / 知识库 / 插件 / 项目 / 文件 / 设置 | `MockWorkspaceSource` |

将来接 dsh 本地 Host 时，只要新增 `HostSessionSource` 与 `HostWorkspaceSource` 并在 `src/App.tsx` 里换掉实例，**组件层一行都不用改**。

名册数据只有一份：`src/domain/seed/agents.ts` 的 `TEAM` 同时供工作台侧栏与「我的团队」页面使用，不会出现同一个人的信息在两个文件里各写一遍。

## 已实现的视图

| 视图 | 主要交互 |
|---|---|
| 工作台 | 发送消息、@ 选择智能体、键盘 Enter 发送 / Shift+Enter 换行 |
| 我的团队 | 按分类筛选、查看任务负载与进度 |
| 任务中心 | 看板 / 列表视图切换 |
| 知识库 | 分类筛选（含空态）、索引状态 |
| 插件市场 | 分类筛选、安装 / 卸载切换 |
| 项目管理 | 项目进度、里程碑时间线、交付物与动态 |
| 文件管理 | 存储占用分色图例、文件表格 |
| 设置 | 分类导航、开关、分段选项、未保存标记与恢复默认 |
