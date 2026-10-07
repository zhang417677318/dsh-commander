import type { AgentPreset, PresetGuide } from '../presets'

/**
 * 内置 Agent 预设。
 *
 * 名称、描述与帮助文案逐字取自 dsh-client-ui-agent-preset 的 zh 文案表。
 * composition 无法从安装包里读到（声明在 bundle 内），这里按各预设帮助里
 * 描述的能力重建，包名取自 dsh 运行时里实际存在的包。
 */
export const AGENT_PRESETS: AgentPreset[] = [
  {
    id: 'standard',
    name: '标准模式',
    builtin: true,
    description: '处理代码、文件和资料，适合大多数任务。Agent 会按需使用检索、编辑和终端等工具。',
    composition: `# standard — 直接向模型提供各个工具
- id: skills
  name: '@deepseek-ai/dsh-skill-filesystem'
- id: plan
  name: '@deepseek-ai/dsh-plan-mode'
- id: goal
  name: '@deepseek-ai/dsh-tool-goal'
- id: subagent
  name: '@deepseek-ai/dsh-tool-subagent'
- id: workflow
  name: '@deepseek-ai/dsh-tool-workflow'
- id: files
  name: '@deepseek-ai/dsh-tool-fs'
- id: shell
  name: '@deepseek-ai/dsh-tool-pwsh-persistent'
- id: retention
  name: '@deepseek-ai/dsh-output-retention'
`,
  },
  {
    id: 'ptc',
    name: 'PTC 模式',
    builtin: true,
    description: '包含标准模式的所有能力，更适合批量调用工具，并对结果进行筛选、整理、去重、统计或汇总的任务。',
    composition: `# ptc — 与 standard 相同，但不启用 workflow，改为提供 run_code
- id: skills
  name: '@deepseek-ai/dsh-skill-filesystem'
- id: plan
  name: '@deepseek-ai/dsh-plan-mode'
- id: goal
  name: '@deepseek-ai/dsh-tool-goal'
- id: subagent
  name: '@deepseek-ai/dsh-tool-subagent'
- id: files
  name: '@deepseek-ai/dsh-tool-fs'
- id: shell
  name: '@deepseek-ai/dsh-tool-pwsh-persistent'
- id: run-code
  name: '@deepseek-ai/dsh-tool-run-code'
- id: retention
  name: '@deepseek-ai/dsh-output-retention'
`,
  },
  {
    id: 'minimal',
    name: '极简模式',
    builtin: true,
    description: 'Agent 仅使用终端工具完成任务，适合测试和对比其基础表现。',
    composition: `# minimal — 仅一个持久 Shell 工具，固定系统提示词
- id: system-prompt
  name: '@deepseek-ai/dsh-system-prompt'
  config:
    preset: minimal
- id: shell
  name: '@deepseek-ai/dsh-tool-pwsh-persistent'
`,
  },
  {
    id: 'cordis',
    name: '创造模式',
    builtin: true,
    description: '用对话定制 DSH：让 Agent 编写插件，添加新功能或界面；也能组合工具和提示词，创建自己的模式。',
    composition: `# cordis — 具备标准任务工具，另加运行时检查与插件管理
- id: skills
  name: '@deepseek-ai/dsh-skill-filesystem'
- id: plan
  name: '@deepseek-ai/dsh-plan-mode'
- id: goal
  name: '@deepseek-ai/dsh-tool-goal'
- id: subagent
  name: '@deepseek-ai/dsh-tool-subagent'
- id: workflow
  name: '@deepseek-ai/dsh-tool-workflow'
- id: files
  name: '@deepseek-ai/dsh-tool-fs'
- id: shell
  name: '@deepseek-ai/dsh-tool-pwsh-persistent'
- id: cordis
  name: '@deepseek-ai/dsh-tool-cordis'
- id: preset
  name: '@deepseek-ai/dsh-agent-preset'
- id: retention
  name: '@deepseek-ai/dsh-output-retention'
`,
  },
]

export const DEFAULT_PRESET_ID = 'standard'

export const PRESET_GUIDES: Record<string, PresetGuide> = {
  standard: {
    intro: '新建任务时选择「标准模式」，说明要完成什么、相关文件在哪里，以及怎样判断任务完成。',
    explanation: [
      '### 工作方式',
      'Agent 直接调用工具来读写文件、检索资料和执行终端命令。包含 Skills、计划、目标、子 Agent、工作流和上下文压缩等能力。',
      '### 什么时候选',
      '日常编程、文件处理和资料整理可以从这里开始。标准模式也能编写脚本、批量处理文件；PTC 改变的是工具调用方式，批量任务并不必须使用 PTC。',
    ].join('\n\n'),
    usage: [
      '### 修复一个问题',
      '> 搜索表单连续提交两次后，结果会消失。请定位原因、修复问题并运行相关测试，最后说明原因和修改内容。',
      '预期产出：代码修改、相关测试结果，以及问题原因说明。',
      '### 整理项目资料',
      '> 阅读项目中的 Markdown 记录，整理已经达成的结论和仍待确认的问题，并附上对应文件链接。',
      '预期产出：一份带来源引用的总结，方便回到原文核对。',
    ].join('\n\n'),
  },
  ptc: {
    intro: '新建任务时选择「PTC 模式」，说明输入文件、处理规则和输出格式。代码由 Agent 编写。',
    explanation: [
      '### 怎样调用工具',
      'PTC 是 Programmatic Tool Calling，即通过程序调用工具。当前内置预设让 Agent 通过 run_code 编写 TypeScript 程序，使用生成的工具 SDK 发起调用。程序可以组织循环、条件判断、错误处理，以及适合并发执行的调用。',
      '### 哪些结果交给模型',
      '工具返回的数据先交给程序，经过筛选、计算或合并，再通过输出或返回值交给模型；图片结果会另行附加。程序中的工具调用仍会被记录，也仍受工具权限约束。',
      '### 与标准模式的区别',
      '两种模式都能编程、批量处理文件。标准模式直接向模型提供各个工具；PTC 让模型用代码组织工具调用。当前 PTC 预设未启用 workflow 工具。速度和 token 用量取决于具体任务与结果处理方式。',
    ].join('\n\n'),
    usage: [
      '### 批量检查配置文件',
      '> 检查 configs/ 下所有 JSON 文件，按照 schema.json 找出缺失字段和不合法的值。每个问题写成 CSV 中的一行；读取失败的文件也记入报告，继续检查其余文件。保留原文件。',
      '预期产出：问题汇总和一份 CSV 报告。程序可以对多份文件执行相同检查，处理单个文件的失败，再汇总结果。',
      '### 汇总错误日志',
      '> 分析 logs/ 下的日志，按服务和错误类型统计次数，列出出现最多的十类错误，每类保留一条示例。完整统计另存为 CSV。',
      '预期产出：高频错误摘要和完整统计表。中间数据可以先在程序中聚合，再把汇总交给模型。',
    ].join('\n\n'),
  },
  minimal: {
    intro: '新建任务时选择「极简模式」。做对照测试时，保持模型、权限、任务输入和工作区起始状态一致。',
    explanation: [
      '### 保留哪些能力',
      '仅提供一个持久 Shell 工具，并使用固定系统提示词。内置预设不加载 Skills、计划、上下文压缩，也不注入标准运行时上下文。',
      '### 什么时候选',
      '适合作为实验和对照测试的基线。Agent 仍能通过终端命令读写文件、运行脚本，但缺少管理长任务的内置辅助能力。工具少，不代表对新手更容易。',
    ].join('\n\n'),
    usage: [
      '### 对比基础修复表现',
      '> 运行这个项目的测试，找出失败原因，做最小修复，再运行相关测试并报告结果。',
      '分别用标准模式和极简模式，从相同的工作区状态执行这条任务，对比完成情况、工具调用和最终修改。极简模式会通过终端命令完成这些操作。',
    ].join('\n\n'),
  },
  cordis: {
    intro: '新建任务时选择「创造模式」，说明希望增加什么能力、从哪里使用，以及怎样验证效果。',
    explanation: [
      '### 可以创造什么',
      '创造模式具备标准任务工具，并增加运行时检查、持久化插件管理，以及 Cordis 插件和 Agent 预设的开发指引。可以编写插件来添加功能或界面，也可以组合工具和提示词，创建适合特定任务的模式。',
      '### 插件与模式的关系',
      '插件为 DSH 增加能力，例如工具、服务连接或界面入口。模式是一份 Agent 预设，用来选择任务可用的工具，并约定 Agent 的工作方式。自定义模式中也可以使用自己开发的插件。',
      '### 怎样让成果生效',
      '可以要求 Agent 完成安装并验证实际效果。插件可能即时加载，也可能需要重启，取决于修改内容；新建的模式在创建新任务时选择。',
    ].join('\n\n'),
    usage: [
      '### 添加一个界面',
      '> 帮我写一个 DSH 插件，在侧栏增加「项目笔记」入口，列出当前工作区的 Markdown 文件，点击后能预览内容。完成安装并验证页面能打开。',
      '预期产出：带侧栏入口和预览页的插件，以及仍需完成的生效步骤。',
      '### 添加一个工具',
      '> 写一个插件，提供读取项目测试报告、汇总失败用例的工具。注册工具，并用一份示例报告验证调用结果。',
      '预期产出：可调用的新工具，以及一次示例调用的验证结果。',
      '### 创建自己的模式',
      '> 基于标准模式创建「代码审查」模式，优先检查潜在错误和测试缺口，指出文件与行号，修改文件前先询问我。保存成可选择的预设。',
      '预期产出：可在新任务中选择的自定义模式。审查要求用于指导 Agent，实际可执行的操作仍由权限设置决定。',
    ].join('\n\n'),
  },
}
