# ALG-VISUAL - 图算法可视化教学平台

> 面向图算法教学与演示的可视化平台，核心聚焦于 **PageRank 算法的动态可视化**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-purple.svg)](https://vitejs.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9-orange.svg)](https://d3js.org/)

## ✨ 核心功能

- 🎯 **PageRank 算法可视化**: 动态展示算法执行过程
- 📊 **有向带权图渲染**: 基于 D3.js 的高性能图形渲染
- 🎬 **三阶段动画序列**: 预测 → 观察 → 解释
- 🎨 **多种布局模式**: FourZoneLayout、FlowchartView、GraphView
- 🤖 **智能体集成**: Agent Bridge 支持自然语言交互
- 💾 **状态管理**: Redux Toolkit 管理应用状态

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- pnpm >= 8.x

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 代码检查

```bash
pnpm lint
```

## 📁 项目结构

```
ALG-VISUAL/
├── apps/web/src/          # 主应用源码
│   ├── components/        # React组件
│   │   ├── EnhancedPageRankVisualization/  # PageRank可视化组件
│   │   ├── FloatingChat/  # 浮动聊天组件
│   │   └── ...
│   ├── pages/            # 页面路由
│   │   ├── Home/         # 首页
│   │   ├── Course/       # 课程页
│   │   └── ...
│   ├── store/            # Redux状态管理
│   ├── data/             # 静态数据（JSON）
│   └── main.tsx          # 应用入口
├── packages/             # 可复用模块
│   ├── agent-bridge/     # 智能体桥接
│   ├── data-view/        # 图数据模拟
│   ├── flowchart-renderer/  # 流程图渲染引擎
│   └── simulators/       # 算法模拟器
│       └── pagerank/     # PageRank模拟器
├── public/data/          # 公共数据文件
├── docs/                 # 项目文档
│   ├── architecture/     # 架构设计
│   ├── guides/          # 使用指南
│   ├── implementation/  # 实现总结
│   ├── fixes/           # 问题修复记录
│   ├── checklists/      # 检查清单
│   └── misc/            # 其他文档
└── package.json
```

## 🎯 核心模块

### 1. 图形渲染引擎

- **DirectedWeightedGraphRenderer**: 有向带权图渲染器
- **GraphRenderer**: 通用图形渲染器
- **DynamicGraphRenderer**: 动态图形渲染器

### 2. 可视化组件

- **GraphViewZone**: 图形视图区域
- **FlowchartView**: 流程图视图
- **FourZoneLayout**: 四区布局

### 3. 智能体系统

- **Agent Bridge**: 智能体桥接模块
- **Visualization Agent**: 可视化智能体接口

## 📚 文档导航

### 快速开始

- [快速开始指南](docs/guides/QUICK_START_GUIDE.md) ⭐ 推荐
- [新系统快速开始](docs/guides/QUICK_START_NEW_SYSTEM.md)

### 架构设计

- [Agent架构设计](docs/architecture/AGENT_ARCHITECTURE.md)
- [图可视化系统](docs/architecture/GRAPH_VISUALIZATION_SYSTEM.md)
- [有向图规范 v1](docs/architecture/DIRECTED_GRAPH_SPEC_v1.md)

### 集成指南

- [可视化Agent集成指南](docs/guides/VISUALIZATION_AGENT_INTEGRATION_GUIDE.md)
- [Agent接口快速参考](docs/guides/AGENT_INTERFACE_QUICK_REFERENCE.md)
- [PageRank重构指南](docs/guides/PAGERANK_REFACTOR_FINAL.md)

### 实现总结

- [有向图实现总结](docs/implementation/DIRECTED_GRAPH_IMPLEMENTATION_SUMMARY.md)
- [Agent接口总结](docs/implementation/AGENT_INTERFACE_SUMMARY.md)
- [最终优化总结](docs/implementation/FINAL_OPTIMIZATION_SUMMARY.md)

## 🛠️ 技术栈

- **前端框架**: React 19 + React DOM
- **构建工具**: Vite (rolldown-vite)
- **状态管理**: Redux Toolkit + React Redux
- **路由**: React Router DOM
- **可视化**: D3.js v7.9.0 + 动画序列控制器（TeachingFlowRunner）
- **类型系统**: TypeScript
- **包管理**: pnpm
- **代码规范**: ESLint

## 🎨 特性亮点

### 有向带权图可视化

- ✅ 节点颜色映射（A→绿色, B→粉色, C→蓝色, D→橙色）
- ✅ 出度边（蓝色）/ 入度边（橙色）
- ✅ PR值映射节点大小（18px~36px）
- ✅ 权重映射边粗细（1.5px~4.5px）
- ✅ 悬停高亮与工具提示
- ✅ 缩放平移交互
- ✅ 可拖拽图例

### 动画序列系统

```typescript
// 三阶段动画序列
renderer.animatePredict();  // 阶段1: 预测（节点脉冲）
renderer.animateObserve();  // 阶段2: 观察（权重传播）
renderer.animateExplain(1); // 阶段3: 解释（PR更新）
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**开发状态**: 🟢 积极开发中  
**最后更新**: 2025-10-18
