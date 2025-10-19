# PageRank 可视化改进总结

## 概述
本次改进将原有的静态流程图可视化升级为基于 D3.js 的动态、交互式数据可视化，实现了真正的数据驱动动画效果。

## 主要改进

### 1. 核心渲染器升级
- **新增 GraphRenderer**: 基于 D3.js 的强大图形渲染器
- **数据驱动动画**: 使用 D3.js selection.transition() 实现平滑动画
- **力导向布局**: 自动计算节点位置，避免重叠
- **交互功能**: 支持节点拖拽、缩放、点击等操作

### 2. 可视化效果增强
- **节点大小映射**: 根据 PageRank 值自动调整节点大小
- **颜色渐变**: 使用绿色→橙色→红色渐变表示 PR 值高低
- **边权重可视化**: 边的粗细反映权重大小
- **脉冲动画**: 活跃边添加脉冲效果，模拟"访问者流动"
- **值更新动画**: PR 值变化时有平滑的过渡动画

### 3. 增强版组件功能
- **实时控制面板**: 动画速度控制、播放/暂停功能
- **交互式图例**: 颜色图例、节点大小说明
- **节点详情展示**: 点击节点显示详细信息
- **权重分配面板**: 显示当前步骤的权重分配情况
- **响应式设计**: 适配不同屏幕尺寸

### 4. 演示页面
- **独立演示组件**: 展示完整的可视化功能
- **分步骤演示**: 4个步骤展示 PageRank 算法执行过程
- **控制功能**: 上一步/下一步/播放/暂停
- **特性说明**: 详细说明各项可视化特性

## 技术实现

### 数据结构
```typescript
interface GraphNode {
  id: string;
  label: string;
  prValue: number;
  isActive: boolean;
  isUpdating: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
  isActive: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
```

### 动画实现
- **节点更新动画**: 使用 `selection.transition().duration(1000)`
- **脉冲动画**: CSS `@keyframes pulse` 实现
- **力导向布局**: D3.js `forceSimulation` 自动计算位置
- **缩放和平移**: D3.js `zoom` 行为实现

### 颜色映射
```typescript
const getNodeColor = (d: GraphNode) => {
  const scale = d3.scaleLinear<string>()
    .domain([minValue, maxValue])
    .range(['#4CAF50', '#F44336']);
  return scale(d.prValue);
};
```

## 文件结构
```
packages/flowchart-renderer/
├── GraphRenderer.ts          # 新的 D3.js 渲染器
├── DynamicGraphRenderer.ts   # 原有的静态渲染器
└── index.ts                  # 导出模块

apps/web/src/components/
├── EnhancedPageRankVisualization/
│   ├── index.tsx              # 增强版可视化组件
│   └── EnhancedPageRankVisualization.css
├── VisualizationDemo/
│   ├── index.tsx              # 演示组件
│   └── VisualizationDemo.css
└── DynamicGraphView/
    ├── index.tsx              # 更新为使用 GraphRenderer
    └── DynamicGraphView.css

apps/web/src/pages/
├── Course/index.tsx           # 更新为使用增强版组件
└── Demo/index.tsx             # 新增演示页面
```

## 使用方式

### 在课程页面中使用
```typescript
<EnhancedPageRankVisualization
  width={900}
  height={700}
  showLabels={true}
  showWeights={true}
  animationSpeed={1}
  showLegend={true}
  showControls={true}
/>
```

### 演示页面访问
- 主页点击 "🎯 查看可视化演示" 按钮
- 或直接访问 `/demo` 路径

## 效果展示

### 动画效果
1. **节点大小变化**: 根据 PR 值实时调整大小
2. **颜色渐变**: 从绿色（低 PR 值）到红色（高 PR 值）
3. **边脉冲动画**: 活跃边有脉冲效果
4. **值更新动画**: PR 值变化时有数字滚动效果

### 交互功能
1. **节点点击**: 显示节点详细信息
2. **拖拽移动**: 可以拖动节点调整位置
3. **缩放平移**: 鼠标滚轮缩放，拖拽空白区域平移
4. **动画控制**: 播放、暂停、速度调节

### 响应式特性
1. **自适应布局**: 根据容器大小自动调整
2. **移动端适配**: 触摸友好的交互设计
3. **性能优化**: 使用 D3.js 的高效渲染机制

## 总结

这次改进将 PageRank 算法的可视化从静态展示升级为动态、交互式的数据可视化体验。通过 D3.js 的强大功能，实现了真正的数据驱动动画，让用户能够直观地理解 PageRank 算法的工作原理和权重分配过程。

新的可视化不仅美观，更重要的是具有很强的教育价值，能够帮助学习者更好地理解算法的执行过程和核心概念。