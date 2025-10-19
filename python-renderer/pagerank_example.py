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
            new_pagerank = (1 - self.damping_factor) / n + \
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
    
    def visualize_pagerank_history(self, node_labels):
        """
        可视化PageRank值的历史变化
        
        Args:
            node_labels: 节点标签列表
        """
        import matplotlib.pyplot as plt
        
        # 创建图表
        plt.figure(figsize=(12, 8))
        
        # 为每个节点绘制PageRank值的变化
        for i, label in enumerate(node_labels):
            history = [h[i] for h in self.pagerank_history]
            plt.plot(history, marker='o', label=f'Node {label}')
        
        # 添加图表元素
        plt.xlabel('Iteration')
        plt.ylabel('PageRank Value')
        plt.title('PageRank Value Evolution')
        plt.legend()
        plt.grid(True)
        
        # 设置x轴刻度
        plt.xticks(range(len(self.pagerank_history)), 
                  ['Initial'] + [f'Iter {i}' for i in range(1, len(self.pagerank_history))])
        
        plt.tight_layout()
        plt.show()
    
    def get_animation_data(self, node_labels):
        """
        获取动画数据，用于可视化展示
        
        Args:
            node_labels: 节点标签列表
            
        Returns:
            动画数据字典
        """
        animation_data = {
            'steps': [],
            'final_ranking': []
        }
        
        # 添加初始步骤
        animation_data['steps'].append({
            'step': 0,
            'description': '初始分配',
            'pagerank_values': self.pagerank_history[0].tolist(),
            'node_labels': node_labels
        })
        
        # 添加迭代步骤
        for i in range(1, len(self.pagerank_history)):
            animation_data['steps'].append({
                'step': i,
                'description': f'迭代计算 {i}',
                'pagerank_values': self.pagerank_history[i].tolist(),
                'node_labels': node_labels,
                'convergence': self.convergence_reached and i == len(self.pagerank_history) - 1
            })
        
        # 添加最终排名
        final_pagerank = self.pagerank_history[-1]
        ranked_nodes = self.rank_nodes(final_pagerank, node_labels)
        animation_data['final_ranking'] = ranked_nodes
        
        return animation_data


def main():
    """
    主函数，演示PageRank算法的完整流程
    """
    # 创建PageRank可视化器
    pr_visualizer = PageRankVisualizer(max_iterations=4)
    
    # 创建示例图
    adjacency_matrix, node_labels = pr_visualizer.create_sample_graph()
    print("示例图的邻接矩阵:")
    print(adjacency_matrix)
    print("节点标签:", node_labels)
    print()
    
    # 初始化PageRank值
    num_nodes = adjacency_matrix.shape[0]
    initial_pagerank = pr_visualizer.initialize_pagerank(num_nodes)
    print("初始PageRank值:")
    for label, pr in zip(node_labels, initial_pagerank):
        print(f"{label}: {pr:.4f}")
    print()
    
    # 计算转移概率矩阵
    transition_matrix = pr_visualizer.calculate_outgoing_probabilities(adjacency_matrix)
    print("转移概率矩阵:")
    print(transition_matrix)
    print()
    
    # 迭代计算PageRank值
    final_pagerank = pr_visualizer.iterate_pagerank(adjacency_matrix, initial_pagerank)
    print("最终PageRank值:")
    for label, pr in zip(node_labels, final_pagerank):
        print(f"{label}: {pr:.4f}")
    print()
    
    # 节点排名
    ranked_nodes = pr_visualizer.rank_nodes(final_pagerank, node_labels)
    print("节点排名:")
    for rank, (label, pr) in enumerate(ranked_nodes, 1):
        print(f"第{rank}名: {label} (PageRank: {pr:.4f})")
    print()
    
    # 可视化PageRank值的历史变化
    pr_visualizer.visualize_pagerank_history(node_labels)
    
    # 获取动画数据
    animation_data = pr_visualizer.get_animation_data(node_labels)
    print("动画数据:")
    print(animation_data)
    
    return animation_data


if __name__ == "__main__":
    animation_data = main()