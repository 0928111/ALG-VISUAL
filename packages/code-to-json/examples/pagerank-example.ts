import { convertPythonPageRankCode, saveAsJSON } from '../utils';

/**
 * 示例：将Python PageRank代码转换为JSON格式
 * 这个示例展示了如何使用code-to-json包中的工具函数
 * 将Python PageRank算法代码转换为标准化的JSON格式
 * 以便网页端的渲染组件能够解析并展示相应的图操作过程
 */

// 示例Python PageRank代码
const pythonPageRankCode = `
import numpy as np

class PageRankVisualizer:
    """
    PageRank算法可视化类
    展示初始分配→重新分配→迭代计算→收敛判断→排名判断的流程
    """
    
    def __init__(self, damping_factor=0.85, max_iterations=4, tolerance=1e-6):
        """
        初始化PageRank计算器
        
        Args:
            damping_factor: 阻尼系数，通常为0.85
            max_iterations: 最大迭代次数
            tolerance: 收敛阈值
        """
        self.damping_factor = damping_factor
        self.max_iterations = max_iterations
        self.tolerance = tolerance
        self.pagerank_history = []  # 存储每次迭代的PageRank值
        self.convergence_reached = False
        self.iteration_count = 0
        
    def initialize_pagerank(self, num_nodes):
        """
        初始化PageRank值（初始分配）
        
        Args:
            num_nodes: 节点数量
            
        Returns:
            初始PageRank值数组
        """
        # 初始均匀分配PageRank值
        initial_pagerank = np.ones(num_nodes) / num_nodes
        self.pagerank_history.append(initial_pagerank.copy())
        return initial_pagerank
    
    def create_sample_graph(self):
        """
        创建示例图结构
        
        Returns:
            adjacency_matrix: 邻接矩阵
            node_labels: 节点标签
        """
        # 创建一个简单的4节点图
        adjacency_matrix = np.array([
            [0, 1, 1, 0],  # 节点A指向B和C
            [0, 0, 1, 0],  # 节点B指向C
            [0, 0, 0, 1],  # 节点C指向D
            [1, 0, 0, 0]   # 节点D指向A
        ])
        
        node_labels = ['A', 'B', 'C', 'D']
        return adjacency_matrix, node_labels
    
    def calculate_outgoing_probabilities(self, adjacency_matrix):
        """
        计算出度概率转移矩阵（重新分配）
        
        Args:
            adjacency_matrix: 邻接矩阵
            
        Returns:
            转移概率矩阵
        """
        n = adjacency_matrix.shape[0]
        transition_matrix = np.zeros((n, n))
        
        # 计算每个节点的出度
        out_degrees = np.sum(adjacency_matrix, axis=1)
        
        # 处理每个节点的出边
        for i in range(n):
            if out_degrees[i] > 0:
                # 有出边的节点，均匀分配PageRank值
                transition_matrix[i] = adjacency_matrix[i] / out_degrees[i]
            else:
                # 悬挂节点，将PageRank值均匀分配给所有节点
                transition_matrix[i] = np.ones(n) / n
        
        return transition_matrix
    
    def iterate_pagerank(self, adjacency_matrix, initial_pagerank):
        """
        迭代计算PageRank值（迭代计算）
        
        Args:
            adjacency_matrix: 邻接矩阵
            initial_pagerank: 初始PageRank值
            
        Returns:
            最终PageRank值
        """
        n = adjacency_matrix.shape[0]
        current_pagerank = initial_pagerank.copy()
        
        # 计算转移概率矩阵
        transition_matrix = self.calculate_outgoing_probabilities(adjacency_matrix)
        
        # 迭代计算PageRank值
        for iteration in range(self.max_iterations):
            self.iteration_count = iteration + 1
            
            # PageRank迭代公式
            new_pagerank = (1 - self.damping_factor) / n + \\
                          self.damping_factor * np.dot(transition_matrix.T, current_pagerank)
            
            # 保存每次迭代的结果
            self.pagerank_history.append(new_pagerank.copy())
            
            # 检查收敛（收敛判断）
            diff = np.linalg.norm(new_pagerank - current_pagerank, 1)
            if diff < self.tolerance:
                self.convergence_reached = True
                break
                
            current_pagerank = new_pagerank
        
        return current_pagerank
    
    def rank_nodes(self, pagerank_values, node_labels):
        """
        根据PageRank值对节点进行排名（排名判断）
        
        Args:
            pagerank_values: PageRank值数组
            node_labels: 节点标签列表
            
        Returns:
            排名后的节点列表
        """
        # 将PageRank值和节点标签组合
        node_scores = [(label, score) for label, score in zip(node_labels, pagerank_values)]
        
        # 按PageRank值降序排序
        ranked_nodes = sorted(node_scores, key=lambda x: x[1], reverse=True)
        
        return ranked_nodes
    
    def main(self):
        """
        主函数，演示PageRank算法的完整流程
        """
        # 创建示例图
        adjacency_matrix, node_labels = self.create_sample_graph()
        
        # 初始化PageRank值
        num_nodes = adjacency_matrix.shape[0]
        initial_pagerank = self.initialize_pagerank(num_nodes)
        
        # 迭代计算PageRank值
        final_pagerank = self.iterate_pagerank(adjacency_matrix, initial_pagerank)
        
        # 节点排名
        ranked_nodes = self.rank_nodes(final_pagerank, node_labels)
        
        return {
            'adjacency_matrix': adjacency_matrix.tolist(),
            'node_labels': node_labels,
            'initial_pagerank': initial_pagerank.tolist(),
            'final_pagerank': final_pagerank.tolist(),
            'ranked_nodes': ranked_nodes,
            'pagerank_history': [h.tolist() for h in self.pagerank_history]
        }

# 创建PageRank可视化器实例
visualizer = PageRankVisualizer()

# 执行PageRank算法
result = visualizer.main()

# 打印结果
print("PageRank算法执行结果:")
print(f"节点标签: {result['node_labels']}")
print(f"初始PageRank值: {result['initial_pagerank']}")
print(f"最终PageRank值: {result['final_pagerank']}")
print(f"节点排名: {result['ranked_nodes']}")
`;

/**
 * 演示如何使用PageRank解析器
 */
export async function demonstratePageRankParser() {
  try {
    console.log('开始转换Python PageRank代码...');
    
    // 转换Python代码为JSON
    const result = await convertPythonPageRankCode(pythonPageRankCode);
    
    console.log('转换成功！');
    console.log('元数据:', result.metadata);
    console.log('节点数量:', result.graph.nodes.length);
    console.log('边数量:', result.graph.edges.length);
    
    // 保存结果到文件
    saveAsJSON(result, 'pagerank-graph-data.json');
    
    // 分析PageRank特定的节点和边
    const pageRankSteps = result.graph.nodes.filter(node => 
      node.type === 'function' && node.properties.isPageRankStep
    );
    
    const pageRankData = result.graph.nodes.filter(node => 
      node.type === 'variable' && node.properties.isPageRankData
    );
    
    const sequenceEdges = result.graph.edges.filter(edge => 
      edge.type === 'pagerank_sequence'
    );
    
    console.log('PageRank步骤函数:', pageRankSteps.map(node => node.label));
    console.log('PageRank数据变量:', pageRankData.map(node => node.label));
    console.log('PageRank顺序边数量:', sequenceEdges.length);
    
    return result;
  } catch (error) {
    console.error('转换过程中发生错误:', error);
    throw error;
  }
}

/**
 * 从文件加载Python代码并转换为JSON
 */
export async function convertPythonFileToJSON(filePath: string) {
  try {
    console.log(`从文件加载Python代码: ${filePath}`);
    
    // 使用工具函数从文件加载并转换
    const result = await convertPythonPageRankFile(filePath);
    
    console.log('转换成功！');
    console.log('元数据:', result.metadata);
    console.log('节点数量:', result.graph.nodes.length);
    console.log('边数量:', result.graph.edges.length);
    
    // 保存结果到文件
    const fileName = filePath.split('/').pop()?.replace('.py', '-graph-data.json') || 'output.json';
    saveAsJSON(result, fileName);
    
    return result;
  } catch (error) {
    console.error('转换过程中发生错误:', error);
    throw error;
  }
}

// 如果直接运行此文件，则执行演示
if (typeof require !== 'undefined' && require.main === module) {
  demonstratePageRankParser()
    .then(() => console.log('演示完成'))
    .catch(error => console.error('演示失败:', error));
}