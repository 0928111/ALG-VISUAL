# 📚 可视化智能体接口集成指南

## 目录

1. [概述](#概述)
2. [接口设计说明](#接口设计说明)
3. [快速开始](#快速开始)
4. [详细使用说明](#详细使用说明)
5. [集成到现有系统](#集成到现有系统)
6. [扩展智能体功能](#扩展智能体功能)
7. [常见问题](#常见问题)

---

## 概述

### 🎯 目标

创建一个标准化接口，使智能体能够根据自然语言描述调整图可视化效果，实现：

- 📊 **数据调整**：修改节点PageRank值、边权重、节点位置等
- 🎨 **样式调整**：改变节点颜色、大小范围、布局参数等
- 🎬 **视图操作**：缩放、平移、高亮、动画等

### 📁 文件结构

```
ALG-VISUAL/
├── packages/agent-bridge/
│   ├── index.ts                              # 原有的智能体桥接（模拟器控制）
│   ├── visualization-agent-interface.ts      # 新增：可视化智能体接口定义
│   └── visualization-agent-executor.ts       # 新增：响应执行器
└── test-agent-interface.js                   # 新增：命令行测试脚本
```

---

## 接口设计说明

### 1️⃣ 需要向智能体传递的参数

#### **AgentInputContext** - 完整输入上下文

```typescript
interface AgentInputContext {
  // 当前图数据
  graphData: {
    nodes: Array<{
      id: string;        // 节点ID，如 'A', 'B'
      label: string;     // 节点标签，如 '网页A'
      rank: number;      // PageRank值 (0-100)
      x?: number;        // X坐标（可选）
      y?: number;        // Y坐标（可选）
    }>;
    edges: Array<{
      id: string;        // 边ID，如 'A->B'
      source: string;    // 源节点ID
      target: string;    // 目标节点ID
      weight: number;    // 权重 (0-30)
      isActive?: boolean;
    }>;
  };

  // 当前可视化规范
  visualizationSpec: {
    nodeStyle: {
      radiusRange: [number, number];  // 节点半径范围，如 [18, 36]
      colors: Record<string, string>; // 节点颜色映射
      defaultColor: string;
    };
    edgeStyle: {
      widthRange: [number, number];   // 边宽度范围，如 [1.5, 3.5]
      normalColor: string;            // 普通边颜色
      activeColor: string;            // 激活边颜色
      opacityRange: [number, number];
    };
    layoutParams: {
      type: 'force' | 'circular' | 'hierarchical';
      forceStrength?: number;         // 力导向强度 (-1000 ~ 0)
      linkDistance?: number;          // 边距离 (50 ~ 300)
      collisionRadius?: number;       // 碰撞半径 (10 ~ 100)
    };
    canvasConfig: {
      width: number;
      height: number;
      backgroundColor: string;
    };
  };

  // 当前视图状态
  viewState: {
    zoomLevel: number;              // 缩放级别 (0.6 ~ 2.0)
    centerPosition: [number, number];
    selectedNodes: string[];
    highlightedEdges: string[];
  };

  // 用户自然语言描述
  userDescription: string;          // 如 "增大节点A的PageRank值"
  
  timestamp: number;
}
```

### 2️⃣ 智能体应返回的参数

#### **AgentOutputResponse** - 完整输出响应

```typescript
interface AgentOutputResponse {
  success: boolean;
  message: string;
  
  // 图数据更新（可选）
  dataUpdate?: {
    nodeUpdates?: Array<{
      id: string;
      rank?: number;      // 更新PageRank
      x?: number;         // 更新X坐标
      y?: number;         // 更新Y坐标
    }>;
    edgeUpdates?: Array<{
      id: string;
      weight?: number;    // 更新权重
      isActive?: boolean;
    }>;
  };
  
  // 样式配置更新（可选）
  styleUpdate?: {
    nodeStyle?: {
      radiusRange?: [number, number];
      colorOverrides?: Record<string, string>;
    };
    edgeStyle?: {
      widthRange?: [number, number];
      normalColor?: string;
      activeColor?: string;
    };
    layoutParams?: {
      forceStrength?: number;
      linkDistance?: number;
      collisionRadius?: number;
    };
  };
  
  // 视图操作（可选）
  viewAction?: {
    zoom?: {
      level: number;
      duration?: number;
    };
    pan?: {
      target: [number, number];
      duration?: number;
    };
    highlight?: {
      nodes?: string[];
      edges?: string[];
      duration?: number;
    };
    animation?: {
      type: 'flow' | 'pulse' | 'emphasize';
      targets: string[];
      duration?: number;
    };
  };
  
  timestamp: number;
}
```

---

## 快速开始

### 步骤1：运行命令行测试

验证接口设计是否符合需求：

```bash
# 进入项目目录
cd d:\1-毕业论文\ALG-VISUAL

# 运行测试脚本
node test-agent-interface.js
```

**预期输出示例：**

```
🧪 可视化智能体接口测试
================================================================================

================================================================================
📋 测试: 增大节点PageRank值
================================================================================

📥 输入:
   用户描述: "请将节点A的PageRank值增大"
   节点数量: 4
   边数量: 7

📤 输出:
   成功: true
   消息: 已将节点A的PageRank值增大到50

   📊 数据更新:
      节点更新 (1个):
        - A: rank=50

✅ 验证结果: 通过

... (更多测试用例)
```

### 步骤2：理解测试结果

测试脚本演示了以下场景：

| 测试场景 | 用户描述 | 智能体响应 |
|---------|---------|-----------|
| 增大节点PR值 | "请将节点A的PageRank值增大" | 返回节点A的rank=50 |
| 调整边权重 | "将所有边的权重调整为相同" | 返回所有边的weight=10 |
| 改变颜色 | "把节点A改成红色" | 返回节点A的颜色覆盖 |
| 紧凑布局 | "让节点之间更加紧凑" | 返回缩短的linkDistance参数 |
| 高亮节点 | "高亮显示节点A" | 返回高亮操作指令 |
| 放大视图 | "放大视图" | 返回缩放至1.5倍 |
| 圆形排列 | "将节点排列成圆形" | 返回所有节点的新坐标 |

---

## 详细使用说明

### 构建输入上下文

使用辅助函数从当前系统状态构建输入：

```typescript
import { buildAgentInputFromState } from './packages/agent-bridge/visualization-agent-interface';

// 从GraphViewZone组件状态构建
const input = buildAgentInputFromState({
  graphData: currentGraphData,  // 从Redux或组件props获取
  currentConfig: graphConfig,   // GraphViewZone的config
  viewState: {
    zoomLevel: 1.2,
    centerPosition: [450, 350],
    selectedNodes: [],
    highlightedEdges: []
  },
  userDescription: "增大节点A的PageRank值"
});
```

### 调用智能体

```typescript
import { mockVisualizationAgent } from './packages/agent-bridge/visualization-agent-interface';

// 使用模拟智能体（测试用）
const response = mockVisualizationAgent(input);

// 或调用真实智能体（需要实现）
// const response = await callVisualizationAgent(input);
```

### 验证响应

```typescript
import { validateAgentResponse } from './packages/agent-bridge/visualization-agent-interface';

const validation = validateAgentResponse(response);
if (!validation.valid) {
  console.error('响应验证失败:', validation.errors);
}
```

### 执行响应

```typescript
import { executeAgentResponse } from './packages/agent-bridge/visualization-agent-executor';
import { useDispatch, useSelector } from 'react-redux';

// 在React组件中
const dispatch = useDispatch();
const currentGraphData = useSelector(state => state.graphData.data);
const graphViewRef = useRef<GraphViewZoneRef>(null);

await executeAgentResponse(response, {
  graphDataDispatcher: {
    updateNodeRanks: (ranks) => dispatch(updateNodeRanks(ranks)),
    updateEdgeWeights: (weights) => dispatch(updateEdgeWeights(weights)),
    setActiveEdges: (edges) => dispatch(setActiveEdges(edges))
  },
  graphViewRef: graphViewRef.current,
  currentGraphData: currentGraphData,
  onExecutionComplete: (success, message) => {
    console.log(success ? '✅' : '❌', message);
  }
});
```

---

## 集成到现有系统

### 方案1：在GraphViewZone组件中集成

在 `GraphViewZone.tsx` 中添加智能体调用功能：

```typescript
import { 
  buildAgentInputFromState, 
  mockVisualizationAgent,
  validateAgentResponse 
} from '@alg-visual/agent-bridge/visualization-agent-interface';
import { executeAgentResponse } from '@alg-visual/agent-bridge/visualization-agent-executor';

// 在GraphViewZone组件中添加方法
const handleAgentRequest = useCallback(async (userDescription: string) => {
  // 1. 构建输入
  const input = buildAgentInputFromState({
    graphData: internalData,
    currentConfig: finalConfig,
    viewState: {
      zoomLevel,
      centerPosition: [finalConfig.width / 2, finalConfig.height / 2],
      selectedNodes: selectedNode ? [selectedNode] : [],
      highlightedEdges: []
    },
    userDescription
  });

  // 2. 调用智能体
  const response = mockVisualizationAgent(input);

  // 3. 验证响应
  const validation = validateAgentResponse(response);
  if (!validation.valid) {
    console.error('智能体响应无效:', validation.errors);
    return;
  }

  // 4. 执行响应
  await executeAgentResponse(response, {
    currentGraphData: internalData,
    graphViewRef: ref as any,
    onExecutionComplete: (success, message) => {
      console.log(message);
    }
  });
}, [internalData, finalConfig, zoomLevel, selectedNode]);

// 通过ref暴露给外部
React.useImperativeHandle(ref, () => ({
  // ... 现有方法
  executeAgentRequest: handleAgentRequest  // 新增
}));
```

### 方案2：创建独立的AgentPanel组件

创建一个新的交互面板组件：

```typescript
// apps/web/src/components/AgentPanel/index.tsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mockVisualizationAgent, buildAgentInputFromState } from '@alg-visual/agent-bridge/visualization-agent-interface';
import { executeAgentResponse } from '@alg-visual/agent-bridge/visualization-agent-executor';

export const AgentPanel: React.FC<{
  graphViewRef: React.RefObject<GraphViewZoneRef>;
}> = ({ graphViewRef }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const dispatch = useDispatch();
  const graphData = useSelector(state => state.graphData.data);

  const handleSubmit = async () => {
    // 构建输入
    const agentInput = buildAgentInputFromState({
      graphData: graphData,
      currentConfig: {}, // 从GraphViewZone获取
      viewState: {},
      userDescription: input
    });

    // 调用智能体
    const response = mockVisualizationAgent(agentInput);

    // 执行响应
    await executeAgentResponse(response, {
      currentGraphData: graphData,
      graphViewRef: graphViewRef.current,
      onExecutionComplete: (success, message) => {
        setResult(message);
      }
    });
  };

  return (
    <div className="agent-panel">
      <h3>🤖 智能体助手</h3>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入调整需求，如：增大节点A的PageRank值"
      />
      <button onClick={handleSubmit}>执行</button>
      {result && <div className="result">{result}</div>}
    </div>
  );
};
```

### 方案3：通过Redux Action集成

在 Redux store 中添加智能体相关的 action：

```typescript
// apps/web/src/store/agentSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mockVisualizationAgent } from '@alg-visual/agent-bridge/visualization-agent-interface';

export const executeAgentCommand = createAsyncThunk(
  'agent/executeCommand',
  async (userDescription: string, { getState }) => {
    const state = getState() as RootState;
    
    const input = buildAgentInputFromState({
      graphData: state.graphData.data,
      currentConfig: {}, // 需要从配置中获取
      viewState: {},
      userDescription
    });

    return mockVisualizationAgent(input);
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    loading: false,
    lastResponse: null,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(executeAgentCommand.pending, (state) => {
        state.loading = true;
      })
      .addCase(executeAgentCommand.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(executeAgentCommand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default agentSlice.reducer;
```

---

## 扩展智能体功能

### 接入真实AI服务

将 `callVisualizationAgent` 函数替换为实际的AI调用：

```typescript
// packages/agent-bridge/visualization-agent-interface.ts

export async function callVisualizationAgent(
  input: AgentInputContext
): Promise<AgentOutputResponse> {
  // 方案1: 调用OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一个图可视化助手，根据用户描述返回JSON格式的调整参数...'
        },
        {
          role: 'user',
          content: JSON.stringify(input)
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);

  // 方案2: 调用本地AI服务
  // const response = await fetch('http://localhost:8000/api/agent', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input)
  // });
  // return await response.json();
}
```

### 添加新的响应类型

在接口定义中扩展 `AgentOutputResponse`：

```typescript
interface AgentOutputResponse {
  // ... 现有字段
  
  // 新增：多步骤操作
  sequence?: {
    steps: Array<{
      delay: number;  // 延迟时间(ms)
      action: 'dataUpdate' | 'styleUpdate' | 'viewAction';
      params: any;
    }>;
  };
  
  // 新增：条件执行
  conditional?: {
    condition: string;  // 条件表达式
    ifTrue: AgentOutputResponse;
    ifFalse: AgentOutputResponse;
  };
}
```

---

## 常见问题

### Q1: 智能体响应后，图没有更新？

**A:** 检查以下几点：
1. 确认 `graphViewRef` 已正确传递
2. 确认 Redux dispatcher 已正确配置
3. 查看控制台是否有错误日志
4. 确认响应通过了验证

### Q2: 如何调试智能体响应？

**A:** 在执行前添加日志：

```typescript
console.log('智能体输入:', JSON.stringify(input, null, 2));
console.log('智能体输出:', JSON.stringify(response, null, 2));
```

### Q3: 样式更新为什么没有生效？

**A:** 样式更新需要GraphViewZone组件支持动态配置更新。当前实现中，样式更新仅记录日志，需要扩展组件功能：

```typescript
// 在GraphViewZone中添加配置更新方法
const updateConfig = useCallback((newConfig: Partial<GraphConfig>) => {
  setFinalConfig({ ...finalConfig, ...newConfig });
}, [finalConfig]);
```

### Q4: 如何添加更多的智能体识别关键词？

**A:** 在 `mockVisualizationAgent` 函数中添加更多条件判断：

```typescript
// 示例：识别"缩小"关键词
if (description.includes('缩小')) {
  return {
    success: true,
    message: '已缩小视图至0.8倍',
    viewAction: {
      zoom: { level: 0.8, duration: 800 }
    },
    timestamp: Date.now()
  };
}
```

### Q5: 如何实现异步动画序列？

**A:** 使用批量执行功能：

```typescript
import { executeBatchAgentResponses } from './packages/agent-bridge/visualization-agent-executor';

const responses = [
  { /* 第1步：高亮节点 */ },
  { /* 第2步：调整rank */ },
  { /* 第3步：放大视图 */ }
];

await executeBatchAgentResponses(responses, config);
```

---

## 📝 总结

### ✅ 已完成

1. ✅ 定义了完整的智能体接口（输入/输出）
2. ✅ 实现了响应执行器
3. ✅ 创建了命令行测试脚本
4. ✅ 提供了7种典型场景的模拟响应
5. ✅ 包含响应验证功能

### 🔄 待扩展

1. 🔄 接入真实AI服务（OpenAI/本地模型）
2. 🔄 扩展GraphViewZone支持动态配置更新
3. 🔄 实现更多视图操作API（缩放、平移、动画）
4. 🔄 创建AgentPanel交互界面
5. 🔄 添加更多智能识别场景

### 📌 下一步

1. 运行 `node test-agent-interface.js` 验证接口
2. 选择一种集成方案（方案1/2/3）
3. 根据实际需求扩展智能体功能
4. 接入真实AI服务

---

**如有任何问题，请参考代码注释或提出issue！** 🚀
