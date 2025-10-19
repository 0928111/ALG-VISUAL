# PageRank Graph Renderer

## 概述

基于PageRank算法的Python图形渲染程序，能够读取标准化的JSON格式代码分析结果，并生成可视化的图形表示。

## 架构设计

### 核心组件

1. **JSON加载器 (JSONLoader)**：负责加载和验证标准化的JSON数据
2. **图构建器 (GraphBuilder)**：将JSON数据转换为图结构
3. **PageRank计算器 (PageRankCalculator)**：实现PageRank算法并计算节点重要性
4. **布局算法 (LayoutAlgorithm)**：确定节点在画布上的位置
5. **渲染引擎 (RenderingEngine)**：将图渲染为可视化图像
6. **导出器 (Exporter)**：将渲染结果导出为各种格式

### 程序流程

1. 加载JSON数据
2. 验证数据格式
3. 构建图结构
4. 计算PageRank值
5. 应用布局算法
6. 渲染图形
7. 导出结果

### 使用方式

```python
from pagerank_renderer import PageRankRenderer

# 创建渲染器实例
renderer = PageRankRenderer()

# 加载JSON数据
renderer.load_json('code_analysis_result.json')

# 计算PageRank
renderer.calculate_pagerank()

# 渲染图形
renderer.render()

# 导出结果
renderer.export('output.png')
```

### 配置选项

```python
config = {
    'layout': 'force_directed',  # 布局算法: force_directed, circular, hierarchical
    'node_size': 'pagerank',     # 节点大小: fixed, pagerank, degree
    'node_color': 'type',        # 节点颜色: fixed, type, pagerank
    'edge_width': 'weight',      # 边宽度: fixed, weight
    'show_labels': True,         # 是否显示标签
    'label_size': 12,            # 标签大小
    'output_format': 'png',      # 输出格式: png, svg, pdf
    'width': 1200,               # 图像宽度
    'height': 800                # 图像高度
}

renderer = PageRankRenderer(config)
```

### 支持的布局算法

1. **力导向布局 (Force-Directed Layout)**：基于物理模拟的布局，节点之间的斥力和边的引力
2. **圆形布局 (Circular Layout)**：将节点均匀分布在圆周上
3. **层次布局 (Hierarchical Layout)**：按照层次结构排列节点

### 依赖库

- networkx：图数据结构和算法
- numpy：数值计算
- matplotlib：基础绘图
- plotly：交互式可视化
- pygraphviz：高级图形布局（可选）