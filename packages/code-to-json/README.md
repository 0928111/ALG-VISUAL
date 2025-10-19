# PageRank算法可视化集成方案

本方案实现了将Python文件中的PageRank算法操作逻辑转换为标准化的JSON格式，以便网页端的渲染组件能够解析并展示相应的图操作过程。

## 系统架构

```
Python文件 → PageRank解析器 → JSON数据 → 网页端渲染组件 → 可视化动画
```

## 核心组件

### 1. PageRank解析器 (`pagerank-parser.ts`)

专门用于解析PageRank算法的Python代码，提取以下信息：
- 类定义和方法
- PageRank算法的特定步骤（初始化、计算出度概率、迭代计算、节点排名）
- 变量和数据流
- 函数调用关系
- PageRank特定的边关系（顺序边、使用边、数据流边）

### 2. 代码到JSON转换器 (`code-to-json-converter.ts`)

主转换器类，支持：
- 注册不同类型的解析器
- 转换代码为JSON格式
- 验证转换结果

### 3. 工具函数 (`utils.ts`)

提供便捷的转换函数：
- `convertPythonPageRankCode`: 转换Python PageRank代码字符串
- `convertPythonPageRankFile`: 转换Python PageRank文件
- `saveAsJSON`: 保存转换结果为JSON文件

## 使用方法

### 1. 转换Python代码字符串

```typescript
import { convertPythonPageRankCode, saveAsJSON } from '../utils';

const pythonCode = `
class PageRankVisualizer:
    def __init__(self, damping_factor=0.85):
        self.damping_factor = damping_factor
    
    def initialize_pagerank(self, num_nodes):
        return np.ones(num_nodes) / num_nodes
    
    def calculate_outgoing_probabilities(self, adjacency_matrix):
        # 实现逻辑...
        pass
    
    def iterate_pagerank(self, adjacency_matrix, initial_pagerank):
        # 实现逻辑...
        pass
    
    def rank_nodes(self, pagerank_values, node_labels):
        # 实现逻辑...
        pass
`;

// 转换代码
const result = await convertPythonPageRankCode(pythonCode);

// 保存结果
saveAsJSON(result, 'pagerank-data.json');
```

### 2. 转换Python文件

```typescript
import { convertPythonPageRankFile } from '../utils';

// 转换文件
const result = await convertPythonPageRankFile('./pagerank_example.py');

// 保存结果
saveAsJSON(result, 'pagerank-data.json');
```

## JSON输出格式

转换后的JSON数据包含以下结构：

```json
{
  "metadata": {
    "language": "python",
    "algorithm": "pagerank",
    "timestamp": "2023-xx-xx",
    "file": "pagerank_example.py"
  },
  "graph": {
    "nodes": [
      {
        "id": "node_1",
        "type": "class",
        "label": "PageRankVisualizer",
        "properties": {
          "startLine": 1,
          "endLine": 100,
          "isPageRankStep": false,
          "isPageRankData": false
        }
      },
      {
        "id": "node_2",
        "type": "function",
        "label": "initialize_pagerank",
        "properties": {
          "startLine": 20,
          "endLine": 30,
          "isPageRankStep": true,
          "stepOrder": 1,
          "stepName": "初始化"
        }
      },
      // 更多节点...
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2",
        "type": "contains",
        "properties": {}
      },
      {
        "id": "edge_2",
        "source": "node_2",
        "target": "node_3",
        "type": "pagerank_sequence",
        "properties": {
          "stepOrder": 2
        }
      },
      // 更多边...
    ]
  }
}
```

## PageRank特定功能

### 1. 步骤识别

解析器能够识别PageRank算法的关键步骤：
1. 初始化 (`initialize_pagerank`)
2. 计算出度概率 (`calculate_outgoing_probabilities`)
3. 迭代计算 (`iterate_pagerank`)
4. 节点排名 (`rank_nodes`)

### 2. 顺序关系

自动建立步骤之间的顺序关系，形成算法执行流程。

### 3. 数据流

跟踪变量在步骤之间的传递，形成数据流图。

## 网页端集成

网页端渲染组件可以解析生成的JSON数据，实现：
1. 动态展示PageRank算法的执行流程
2. 高亮当前执行的步骤
3. 显示数据在节点间的流动
4. 提供交互式控制（暂停、继续、单步执行）

## 示例

参考 `examples/pagerank-example.ts` 文件，了解完整的使用示例。

## 注意事项

1. Python代码应遵循特定的命名约定，以便解析器能够识别PageRank相关的方法和变量。
2. 确保Python代码语法正确，否则解析可能失败。
3. 生成的JSON数据可以进一步处理，以适应不同的可视化需求。