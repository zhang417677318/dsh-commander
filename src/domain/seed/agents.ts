import type { TeamMember } from '../workspace'

/**
 * 智能体名册的唯一事实来源。
 * 工作台侧栏（SessionSource）与「我的团队」页面（WorkspaceSource）都从这里取，
 * 避免同一个人的名字和技能在两个文件里各写一遍。
 */
export const TEAM: TeamMember[] = [
  {
    id: 'w-01',
    name: '前端工程师',
    role: 'React / Vue / 小程序开发',
    skills: ['代码生成', '组件拆分'],
    model: 'deepseek-flash',
    status: 'online',
    stats: { total: 128, secondaryLabel: '成功率', secondaryValue: '98.4%' },
    assignment: {
      title: '正在生成小程序首页代码',
      detail: '任务 #T-1042 · 已运行 1 分 20 秒',
      progress: 62,
    },
  },
  {
    id: 'w-02',
    name: '后端工程师',
    role: 'Java / Python / Node.js',
    skills: ['接口设计', '数据库'],
    model: 'deepseek-flash',
    status: 'online',
    stats: { total: 96, secondaryLabel: '成功率', secondaryValue: '97.1%' },
    assignment: {
      title: '设计会员积分接口',
      detail: '任务 #T-1045 · 已运行 0 分 48 秒',
      progress: 34,
    },
  },
  {
    id: 'w-03',
    name: 'UI 设计师',
    role: '界面设计 / 交互设计',
    skills: ['视觉规范', '配色系统'],
    model: 'deepseek-flash',
    status: 'online',
    stats: { total: 74, secondaryLabel: '成功率', secondaryValue: '99.2%' },
    assignment: {
      title: '已交付美容院首页设计方案',
      detail: '任务 #T-1039 · 等待验收',
    },
  },
  {
    id: 'w-04',
    name: '测试工程师',
    role: '功能测试 / 自动化测试',
    skills: ['用例生成', '兼容性检查'],
    model: 'deepseek-flash',
    status: 'online',
    stats: { total: 213, secondaryLabel: '缺陷命中', secondaryValue: '41' },
    assignment: {
      title: '正在跑 12 台设备的兼容性矩阵',
      detail: '任务 #T-1046 · 已运行 2 分 05 秒',
      progress: 78,
    },
  },
  {
    id: 'w-05',
    name: '运维工程师',
    role: '服务器 / Docker / 部署',
    skills: ['容器编排', '日志排查'],
    model: 'deepseek-flash',
    status: 'idle',
    stats: { total: 52, secondaryLabel: '成功率', secondaryValue: '100%' },
    assignment: { title: '暂无进行中的任务', detail: '上次执行 · 今天 09:12' },
  },
  {
    id: 'w-06',
    name: '文案工程师',
    role: '技术文档 / 内容生成',
    skills: ['小红书种草', '产品文档'],
    model: 'deepseek-flash',
    status: 'idle',
    stats: { total: 88, secondaryLabel: '平均', secondaryValue: '41 秒' },
    assignment: { title: '暂无进行中的任务', detail: '上次执行 · 昨天 18:40' },
  },
]
