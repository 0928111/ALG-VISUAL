# 🤖 可视化智能体接口 - 快速参考

## 📌 三个核心问题的答案

### 1️⃣ 需要向智能体传递哪些参数？

**完整输入结构：`AgentInputContext`**

```typescript
{
  // 当前图数据
  graphData: {
    nodes: [{ id, label, rank, x?, y? }],
    edges: [{ id, source, target, weight, isActive? }]
  },
  
  // 当前可视化规范
  visualizationSpec: {
    nodeStyle: { radiusRange, colors, defaultColor },
    edgeStyle: { widthRange, normalColor, activeColor, opacityRange },
    layoutParams: { type, forceStrength, linkDistance, collisionRadius },
    canvasConfig: { width, height, backgroundColor }
  },
  
  // 当前视图状态
  viewState: {
    zoomLevel,        // 0.6 ~ 2.0
    centerPosition,   // [x, y]
    selectedNodes,
    highlightedEdges
  },
  
  // 用户自然语言描述
  userDescription: "增大节点A的PageRank值",
  
  timestamp: Date.now()
}
```

### 2️⃣ 智能体应返回哪些参数？

**完整输出结构：`AgentOutputResponse`**

```typescript
{
  success: boolean,
  message: string,
  
  // 数据更新（可选）
  dataUpdate?: {
    nodeUpdates: [{ id, rank?, x?, y? }],
    edgeUpdates: [{ id, weight?, isActive? }]
  },
  
  // 样式更新（可选）
  styleUpdate?: {
    nodeStyle: { radiusRange?, colorOverrides? },
    edgeStyle: { widthRange?, normalColor?, activeColor? },
    layoutParams: { forceStrength?, linkDistance?, collisionRadius? }
  },
  
  // 视图操作（可选）
  viewAction?: {
    zoom: { level, duration? },
    pan: { target, duration? },
    highlight: { nodes?, edges?, duration? },
    animation: { type, targets, duration? }
  },
  
  timestamp: Date.now()
}
```

### 3️⃣ 系统是否已具备支持接口？

**✅ 已完成：**

| 组件 | 文件路径 | 功能 |
|------|---------|------|
| 接口定义 | `packages/agent-bridge/visualization-agent-interface.ts` | 输入/输出类型、验证、辅助函数 |
| 执行器 | `packages/agent-bridge/visualization-agent-executor.ts` | 将响应应用到系统 |
| 测试脚本 | `test-agent-interface.js` | 命令行验证 |
| 集成指南 | `VISUALIZATION_AGENT_INTEGRATION_GUIDE.md` | 完整文档 |

---

## 🚀 快速开始

### 测试接口（命令行）

```bash
node test-agent-interface.js
```

### 集成到React组件

```typescript
import { 
  buildAgentInputFromState,
  mockVisualizationAgent,
  validateAgentResponse
} from '@alg-visual/agent-bridge/visualization-agent-interface';
import { executeAgentResponse } from '@alg-visual/agent-bridge/visualization-agent-executor';

// 1. 构建输入
const input = buildAgentInputFromState({
  graphData: currentGraphData,
  currentConfig: graphConfig,
  viewState: { zoomLevel, centerPosition, selectedNodes, highlightedEdges },
  userDescription: "增大节点A的PageRank值"
});

// 2. 调用智能体
const response = mockVisualizationAgent(input);

// 3. 验证响应
const validation = validateAgentResponse(response);
if (!validation.valid) {
  console.error('验证失败:', validation.errors);
  return;
}

// 4. 执行响应
await executeAgentResponse(response, {
  currentGraphData,
  graphViewRef: graphViewRef.current,
  onExecutionComplete: (success, message) => {
    console.log(message);
  }
});
```

---

## 🎯 支持的操作类型

### 数据调整

| 操作 | 示例描述 | 返回 |
|------|---------|------|
| 修改PR值 | "增大节点A的PageRank值" | `nodeUpdates: [{ id: 'A', rank: 50 }]` |
| 调整权重 | "将所有边的权重调整为10" | `edgeUpdates: [{ id: 'A->B', weight: 10 }]` |
| 重新定位 | "将节点排列成圆形" | `nodeUpdates: [{ id: 'A', x: 450, y: 200 }]` |

### 样式调整

| 操作 | 示例描述 | 返回 |
|------|---------|------|
| 改变颜色 | "把节点A改成红色" | `nodeStyle: { colorOverrides: { A: '#FF5555' } }` |
| 调整布局 | "让节点更紧凑" | `layoutParams: { linkDistance: 80 }` |

### 视图操作

| 操作 | 示例描述 | 返回 |
|------|---------|------|
| 缩放 | "放大视图" | `zoom: { level: 1.5, duration: 800 }` |
| 高亮 | "高亮节点A" | `highlight: { nodes: ['A'], edges: [...] }` |

---

## 📊 测试结果

**全部8个测试用例通过 ✅**

```
✅ 增大节点PageRank值
✅ 调整边权重
✅ 改变节点颜色
✅ 调整布局紧凑度
✅ 高亮节点
✅ 放大视图
✅ 圆形排列
✅ 未识别指令（正确返回失败）
```

---

## 🔌 系统兼容性

### 与现有架构完全兼容

- ✅ 使用现有的 [`GraphViewZone.tsx`](d:\1-毕业论文\ALG-VISUAL\apps\web\src\components\EnhancedPageRankVisualization\GraphViewZone.tsx) 组件
- ✅ 兼容 [`pagerank-graph-data.json`](d:\1-毕业论文\ALG-VISUAL\public\data\pagerank-graph-data.json) 数据格式
- ✅ 遵循 [`directed-weighted-graph.spec.json`](d:\1-毕业论文\ALG-VISUAL\public\data\directed-weighted-graph.spec.json) 规范
- ✅ 集成 Redux store ([`graphDataSlice`](d:\1-毕业论文\ALG-VISUAL\apps\web\src\store\graphDataSlice.ts), [`graphSpecSlice`](d:\1-毕业论文\ALG-VISUAL\apps\web\src\store\graphSpecSlice.ts))
- ✅ 扩展现有 [`agent-bridge`](d:\1-毕业论文\ALG-VISUAL\packages\agent-bridge\index.ts) 包

### 无需修改现有代码

接口设计为**纯扩展性**，不影响现有功能。

---

## 🔄 下一步工作

### 立即可用（已完成）

1. ✅ 使用模拟智能体测试接口
2. ✅ 在命令行验证所有场景
3. ✅ 查看完整文档了解集成方式

### 后续扩展（可选）

1. 🔄 接入真实AI服务（OpenAI/Claude/本地模型）
2. 🔄 创建交互界面（AgentPanel组件）
3. 🔄 添加更多识别场景和关键词
4. 🔄 实现视图操作API（缩放、平移、动画）
5. 🔄 支持多步骤序列操作

---

## 📖 相关文档

- **完整集成指南**: [`VISUALIZATION_AGENT_INTEGRATION_GUIDE.md`](d:\1-毕业论文\ALG-VISUAL\VISUALIZATION_AGENT_INTEGRATION_GUIDE.md)
- **接口定义**: [`visualization-agent-interface.ts`](d:\1-毕业论文\ALG-VISUAL\packages\agent-bridge\visualization-agent-interface.ts)
- **执行器**: [`visualization-agent-executor.ts`](d:\1-毕业论文\ALG-VISUAL\packages\agent-bridge\visualization-agent-executor.ts)
- **测试脚本**: [`test-agent-interface.js`](d:\1-毕业论文\ALG-VISUAL\test-agent-interface.js)

---

## ✨ 核心特性

- 🎯 **类型安全**：完整的TypeScript类型定义
- ✅ **自动验证**：内置响应验证功能
- 🔌 **即插即用**：与现有系统无缝集成
- 📊 **全面测试**：8个典型场景覆盖
- 📚 **详细文档**：包含使用示例和常见问题

---

**🚀 开始使用智能体接口，让你的图可视化系统更智能！**
