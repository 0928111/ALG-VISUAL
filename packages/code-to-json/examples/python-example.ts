import { CodeToJSONConverter } from '../code-to-json-converter';

// 示例Python代码
const samplePythonCode = `
import numpy as np
import matplotlib.pyplot as plt

class PageRank:
    def __init__(self, damping_factor=0.85, max_iterations=100, tolerance=1e-6):
        self.damping_factor = damping_factor
        self.max_iterations = max_iterations
        self.tolerance = tolerance
    
    def calculate_pagerank(self, adjacency_matrix):
        n = adjacency_matrix.shape[0]
        
        # 初始化PageRank值
        pagerank = np.ones(n) / n
        
        # 计算出度链接矩阵
        out_degree = np.sum(adjacency_matrix, axis=1)
        transition_matrix = adjacency_matrix / out_degree[:, np.newaxis]
        
        # 处理悬挂节点
        dangling_nodes = np.where(out_degree == 0)[0]
        if len(dangling_nodes) > 0:
            transition_matrix[dangling_nodes] = 1 / n
        
        # PageRank迭代计算
        for _ in range(self.max_iterations):
            new_pagerank = (1 - self.damping_factor) / n + \
                          self.damping_factor * np.dot(transition_matrix.T, pagerank)
            
            # 检查收敛
            if np.linalg.norm(new_pagerank - pagerank, 1) < self.tolerance:
                break
                
            pagerank = new_pagerank
        
        return pagerank
    
    def visualize_pagerank(self, pagerank_values, node_labels=None):
        plt.figure(figsize=(10, 6))
        
        if node_labels is None:
            node_labels = [f"Node {i}" for i in range(len(pagerank_values))]
        
        plt.bar(node_labels, pagerank_values)
        plt.xlabel('Nodes')
        plt.ylabel('PageRank Value')
        plt.title('PageRank Distribution')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

def create_sample_graph():
    # 创建一个示例图的邻接矩阵
    adjacency_matrix = np.array([
        [0, 1, 1, 0],
        [0, 0, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 0]
    ])
    return adjacency_matrix

def main():
    # 创建示例图
    graph = create_sample_graph()
    
    # 创建PageRank计算器
    pr_calculator = PageRank()
    
    # 计算PageRank值
    pagerank_values = pr_calculator.calculate_pagerank(graph)
    
    # 可视化结果
    node_labels = ['A', 'B', 'C', 'D']
    pr_calculator.visualize_pagerank(pagerank_values, node_labels)
    
    print("PageRank Values:")
    for i, pr in enumerate(pagerank_values):
        print(f"{node_labels[i]}: {pr:.4f}")

if __name__ == "__main__":
    main()
`;

// 使用示例
async function demonstrateCodeToJSON() {
  // 创建转换器实例
  const converter = new CodeToJSONConverter({
    includeLineNumbers: true,
    includeSourceCode: true,
    weightCalculation: 'frequency'
  });
  
  try {
    // 转换Python代码为JSON
    const result = await converter.convert(samplePythonCode, 'python');
    
    // 输出结果
    console.log('转换结果:');
    console.log(JSON.stringify(result, null, 2));
    
    // 验证结果
    const { validateConversionResult } = require('../utils');
    if (validateConversionResult(result)) {
      console.log('转换结果验证通过');
    } else {
      console.error('转换结果验证失败');
    }
    
    return result;
  } catch (error) {
    console.error('转换过程中出错:', error);
    throw error;
  }
}

// 导出示例函数
export { demonstrateCodeToJSON, samplePythonCode };