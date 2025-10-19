# 🤖 Agent Bridge - 智能体桥接模块

该模块提供两套智能体接口：

## 1. 模拟器控制接口（原有功能）

用于控制PageRank算法模拟器的播放、暂停、步进等操作。

```typescript
import { handleAgentMessage, simulateAgentMessage } from '@alg-visual/agent-bridge';

// 示例：控制模拟器播放
simulateAgentMessage('play');
simulateAgentMessage('nextStep');
simulateAgentMessage('highlight', 'A');
```

## 2. 可视化调整接口（新增功能）✨

用于根据自然语言描述调整图可视化效果。

### 快速开始

```typescript
import { 
  buildAgentInputFromState,
  mockVisualizationAgent,
  executeAgentResponse
} from '@alg-visual/agent-bridge';

// 1. 构建输入
const input = buildAgentInputFromState({
  graphData: { nodes, edges },
  currentConfig: graphConfig,
  viewState: { zoomLevel, centerPosition },
  userDescription: "增大节点A的PageRank值"
});

// 2. 调用智能体
const response = mockVisualizationAgent(input);

// 3. 执行响应
await executeAgentResponse(response, {
  currentGraphData,
  graphViewRef: graphViewRef.current
});
```

### 支持的操作

- 📊 **数据调整**: 修改节点PR值、边权重、节点位置
- 🎨 **样式调整**: 改变颜色、大小范围、布局参数
- 🎬 **视图操作**: 缩放、平移、高亮、动画

### 测试

```bash
# 运行命令行测试
node test-agent-interface.js
```

### 文档

- [完整集成指南](../../docs/guides/VISUALIZATION_AGENT_INTEGRATION_GUIDE.md)
- [快速参考](../../docs/guides/AGENT_INTERFACE_QUICK_REFERENCE.md)
- [总结文档](../../docs/implementation/AGENT_INTERFACE_SUMMARY.md)

---

**当前状态**: ✅ 接口已完成并通过测试，可立即使用模拟智能体，或接入真实AI服务。
