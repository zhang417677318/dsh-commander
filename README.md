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

## 打成 exe

```powershell
pnpm app:dir        # 免安装目录，产物在 release\win-unpacked\AI 编程助手.exe
pnpm app:installer  # NSIS 安装包，产物在 release\
```

`app:dir` 出来的就是一个可以直接双击的 exe，整个 `win-unpacked` 目录拷到别的机器上也能跑。

> **国内打包必须先设镜像和代理**，否则 electron-builder 会卡在从 GitHub 下载 Electron 发行包（报 `connect ETIMEDOUT ...:443`）：
>
> ```powershell
> $env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
> $env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/'
> $env:HTTPS_PROXY = 'http://127.0.0.1:7897'   # 按你本机代理端口改
> $env:HTTP_PROXY  = 'http://127.0.0.1:7897'
> pnpm app:dir
> ```

> **重新打包前必须先关掉正在运行的 exe**，否则 electron-builder 删不掉旧目录，报 `EBUSY: resource busy or locked`。

打包另一个坑写在 `vite.config.ts` 里：**`base` 必须是 `'./'`**。默认的绝对路径在 Electron 的 `file://` 下会解析到盘符根目录（变成 `file:///F:/assets/...`），开发模式一切正常、装完却是白屏。`e2e/packaged.spec.ts` 专门守这条。

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
| `pnpm app:dir` | 打包成免安装的 exe 目录 |
| `pnpm app:installer` | 打包成 NSIS 安装包 |
| `pnpm start` | 启动开发服务器并打开浏览器 |
| `pnpm dev` | 只启动开发服务器 |
| `pnpm build:electron` | 只编译 Electron 主进程与 preload |
| `pnpm test` | 单元与组件测试（vitest） |
| `pnpm test:watch` | 测试监听模式 |
| `pnpm typecheck` | 类型检查 |
| `pnpm build` | 生产构建：Web 产物到 `dist/`，Electron 产物到 `electron/dist/` |
| `pnpm e2e` | Playwright 端到端 19 项（浏览器 12 + Electron 4 + 打包产物 2 + 路由穿越 1） |

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

### 模型配置（对齐 dsh 原生 Models 页）

设置里的「模型」分组不是通用表单，而是照 dsh 原生的结构实现的：

- **按提供商分行**：DeepSeek 账号 → DeepSeek → 第三方，一次只展开一张编辑卡
- **凭据只写保存**：输入框永不回填，应用后立即清空；配置里只留引用（`DEEPSEEK_API_KEY` 这类），不出现密钥值
- **状态不能只看颜色**：绿点＝已确认配置、红点＝确认缺失、灰点＝未知，旁边永远有对应文字
- **账号路由不给编辑**：`deepseek-account` 走登录态，不提供 API 密钥与 Base URL 输入框
- **自定义设置**：`baseURL`（占位符随协议变化）、第三方路由的显示名称与 API 协议
- **模型行**：`id`、显示名称、上下文窗口、最大输出 token 数、输入类型（文本/图片，至少保留一种）
- **恢复默认模型**：编辑会物化整个模型目录并标记「已覆盖基线」，重置后回到「继承 N 行」

有一处是刻意的：**推理等级不作为提供商级控件**。原生文档明确说它是按模型的能力，做成提供商级开关只会被部分模型拒绝。它只出现在「智能体默认值」里，作为默认模型选择的可选字段（对应 dsh 的 `agent-default-model`：`provider` + `model` + 可选 `reasoningEffort`）。

### Agent 预设（对齐 dsh 原生 Agent 预设页）

设置里的「Agent 预设」按 dsh 的 `dsh-client-ui-agent-preset` 实现，页面文案与四份帮助内容**逐字取自该包的中文文案表**：

- **内置分组**：标准模式 / PTC 模式 / 极简模式 / 创造模式，2×2 卡片，右上角显示预设 id（`standard` / `ptc` / `minimal` / `cordis`）
- **默认徽标取代分组徽标**：当前默认项的徽标是「新任务默认」，其余是「内置」
- **点卡片即选中**：设为新任务默认，对应写入 `agent-preset-registry` 命名空间
- **模式说明 / 如何使用**：只读帮助对话框，两个页签各自记住滚动位置，底部「复制」把正文放进剪贴板
- **查看配置**：以只读 YAML 展示该预设声明的插件条目
- **Escape 关闭对话框并把焦点还给打开它的卡片**；帮助不改变新任务默认值
- **自定义分组**保留创造入口「让 Agent 帮我创建预设模式」

> ⚠️ 一处需要你知道的差异：**「查看配置」里的 YAML 是重建的，不是原文**。内置预设的插件声明在 bundle 里，安装包的 asar 中读不到（包名取自 dsh 运行时里实际存在的包，内容按各预设帮助里描述的能力拼的）。拿到真实声明后替换 `src/domain/seed/presets-seed.ts` 里的 `composition` 字段即可，其余不用动。
