# 图形可视化系统 - 配置驱动架构

## 📋 概述

本系统实现了一个完全配置驱动的图形可视化平台，专门用于 PageRank 算法的教学演示。系统严格遵循"配置与逻辑分离"的设计原则，所有视觉样式均通过外部 JSON 配置文件控制。

## 🏗️ 架构设计

### 核心模块

```
apps/web/src/
├── store/                          # Redux 状态管理
│   ├── graphSpecSlice.ts          # 图形规范状态
│   ├── graphDataSlice.ts          # 图形数据状态
│   └── simulatorSlice.ts          # 模拟器状态
├── graph/                          # 图形处理模块
│   ├── spec/
│   │   └── SpecLoader.ts          # 规范加载器
│   └── data/
│       └── GraphDataLoader.ts     # 数据加载器
├── components/
│   ├── EnhancedPageRankVisualization/
│   │   └── GraphViewZoneNew.tsx   # 配置驱动的图形视图
│   ├── LegendPanel/               # 可拖拽图例面板
│   └── TeachingFlowRunner/        # 动画序列控制器
└── pages/
    └── IntegratedGraphDemo/       # 集成演示页面
```

### 双文件输入机制

#### 1. 样式规范文件 (`directed-weighted-graph.spec.json`)

位置：`/public/data/directed-weighted-graph.spec.json`

**核心配置项：**

- **palette**: 颜色方案
  - `nodeFill`: 节点填充色（支持按节点 ID 自定义）
  - `nodeStroke`: 节点边框色
  - `edgeOut`: 出度边颜色
  - `edgeIn`: 入度边颜色
  - `weightText`: 权重文字颜色
  - `background`: 画布背景色

- **node**: 节点样式
  - `radius`: { min, max } 半径范围
  - `shadow`: { blur, opacity } 阴影效果
  - `label`: 标签样式配置

- **edge**: 边样式
  - `dualChannel`: 是否启用双通道（入/出分离）
  - `curveOffset`: 曲线偏移量
  - `strokeWidth`: { min, max } 线宽范围
  - `arrow`: 箭头配置

- **layout**: 布局配置
  - `mode`: "force" 力导向布局
  - `force`: { linkDistance, charge, collide, centerStrength }
  - `fitToView`: { padding, minZoom, maxZoom }

- **animation**: 动画配置
  - `teachingFlow`: 动画序列定义
  - `flowParticle`: 粒子流动效果

#### 2. 图数据文件 (`pagerank-graph-data.json`)

位置：`/public/data/pagerank-graph-data.json`

**数据结构：**

```json
{
  "version": "1.0.0",
  "nodes": [
    { "id": "A", "label": "网页A", "rank": 0.25 }
  ],
  "edges": [
    { "id": "B->A", "source": "B", "target": "A", "weight": 15 }
  ],
  "initialPositions": {
    "A": { "x": 520, "y": 220 }
  }
}
```

## 🚀 快速开始

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 访问集成演示页面

打开浏览器访问：`http://localhost:5173/integrated`

### 3. 查看效果

- ✅ 图形自动加载并按规范渲染
- ✅ 图例面板可拖拽并持久化位置
- ✅ 动画序列控制器提供三阶段演示：
  - **预示（Predict）**: 节点脉冲动画
  - **观察（Observe）**: 粒子流动显示权重传播
  - **解释（Explain）**: PageRank 值更新动画

## 📦 Redux 状态管理

### graphSpecSlice

管理图形规范配置：

```typescript
import { selectSpec } from './store/graphSpecSlice';
const spec = useSelector(selectSpec);
```

### graphDataSlice

管理图形数据：

```typescript
import { selectGraph } from './store/graphDataSlice';
const graphData = useSelector(selectGraph);
```

### 数据加载

```typescript
import { loadGraphSpec } from './graph/spec/SpecLoader';
import { loadGraphData } from './graph/data/GraphDataLoader';

// 在组件中
const dispatch = useDispatch();
await loadGraphSpec(dispatch, '/data/directed-weighted-graph.spec.json');
await loadGraphData(dispatch, '/data/pagerank-graph-data.json');
```

## 🎨 组件使用

### GraphViewZoneNew

配置驱动的图形渲染组件：

```tsx
import GraphViewZoneNew from './components/EnhancedPageRankVisualization/GraphViewZoneNew';

<GraphViewZoneNew
  ref={graphViewRef}
  onNodeClick={(nodeId) => console.log(nodeId)}
  onNodeHover={(nodeId) => console.log(nodeId)}
/>
```

### LegendPanel

可拖拽的图例面板：

```tsx
import LegendPanel from './components/LegendPanel';

<LegendPanel initialPosition={{ x: 24, y: 24 }} />
```

### TeachingFlowRunner

动画序列控制器：

```tsx
import TeachingFlowRunner from './components/TeachingFlowRunner';

<TeachingFlowRunner
  onStageChange={(stageId, index) => console.log(stageId, index)}
  svgRef={svgRef}
/>
```

## 🔧 配置原则

### 禁止硬编码

❌ **错误示例：**

```typescript
// 不要在组件中硬编码颜色
.attr('fill', '#6BBF59')
.attr('stroke-width', 2)
```

✅ **正确示例：**

```typescript
// 从 spec 配置获取
.attr('fill', spec.palette.nodeFill[d.id] || spec.palette.nodeFill.default)
.attr('stroke-width', edgeWidthScale(d.weight))
```

### Schema 校验

加载器会自动验证：

- ✅ 节点 ID 唯一性
- ✅ 边引用的节点存在性
- ✅ 必需字段完整性
- ✅ 数据类型正确性

## 📊 教学动画系统

### 动画阶段配置

在 `spec.animation.teachingFlow` 中定义动画序列：

```json
{
  "id": "observe",
  "label": "观察（权重传播）",
  "effect": [
    { "type": "flow", "direction": "out", "color": "$palette.edgeOut" },
    { "type": "emphasize-weight-labels", "scale": 1.2 }
  ]
}
```

### 支持的效果类型

- `pulse-nodes`: 节点脉冲
- `dim-edges`: 边变暗
- `flow`: 粒子流动
- `emphasize-weight-labels`: 权重标签强调
- `rank-update`: PageRank 值更新
- `counter-badge`: 迭代计数器

## 🎯 扩展功能

### 1. 图例面板

- **可拖拽**: 鼠标拖动自由定位
- **持久化**: 位置保存到 localStorage
- **可折叠**: 节省屏幕空间

### 2. 缩放控制

- 放大/缩小按钮
- 实时缩放百分比显示
- 权重标签自适应缩放

### 3. 交互功能

- 节点悬停高亮
- 节点点击选中
- 相关边高亮显示

## 📝 开发规范

### 1. 所有样式必须来自配置

```typescript
// 正确：从 spec 获取
const nodeColor = spec.palette.nodeFill[nodeId] || spec.palette.nodeFill.default;

// 错误：硬编码
const nodeColor = '#6BBF59';
```

### 2. 使用比例尺处理数值

```typescript
const radiusScale = d3.scaleLinear()
  .domain([0, 1])
  .range([spec.node.radius.min, spec.node.radius.max]);
```

### 3. 添加数据校验

```typescript
if (!data?.nodes || !Array.isArray(data.nodes)) {
  throw new Error('Invalid graph data: missing nodes array');
}
```

## 🐛 故障排除

### 问题：图形不显示

1. 检查控制台是否有加载错误
2. 确认文件路径正确：`/data/...` 而非 `/public/data/...`
3. 验证 JSON 格式是否正确

### 问题：样式未应用

1. 检查 spec 文件是否加载成功
2. 确认 Redux store 已注册新的 slice
3. 使用 Redux DevTools 查看状态

### 问题：动画不工作

1. 确认 svgRef 已正确传递
2. 检查 spec.animation.teachingFlow 动画序列配置
3. 查看浏览器控制台的错误信息

## 📚 参考文档

- **规范文件示例**: `/public/data/directed-weighted-graph.spec.json`
- **数据文件示例**: `/public/data/pagerank-graph-data.json`
- **集成示例页面**: `/src/pages/IntegratedGraphDemo/index.tsx`

## 🎓 总结

本系统实现了：

✅ 双文件输入机制（规范 + 数据）  
✅ Redux 状态管理  
✅ 配置驱动渲染  
✅ 可拖拽图例面板  
✅ 动画序列  
✅ 完整的数据校验  
✅ 模块化架构设计  

所有功能均按照"配置与逻辑分离"原则实现，确保系统的可维护性和可扩展性。
