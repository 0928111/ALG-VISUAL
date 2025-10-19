"""
PageRank图形渲染程序的主模块
"""

import json
import networkx as nx
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import os


class LayoutAlgorithm(Enum):
    """布局算法枚举"""
    FORCE_DIRECTED = "force_directed"
    CIRCULAR = "circular"
    HIERARCHICAL = "hierarchical"
    SPRING = "spring"
    RANDOM = "random"


class NodeSizeStrategy(Enum):
    """节点大小策略枚举"""
    FIXED = "fixed"
    PAGERANK = "pagerank"
    DEGREE = "degree"


class NodeColorStrategy(Enum):
    """节点颜色策略枚举"""
    FIXED = "fixed"
    TYPE = "type"
    PAGERANK = "pagerank"


class EdgeWidthStrategy(Enum):
    """边宽度策略枚举"""
    FIXED = "fixed"
    WEIGHT = "weight"


class PageRankRenderer:
    """PageRank图形渲染器主类"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        初始化渲染器
        
        Args:
            config: 配置选项
        """
        # 默认配置
        self.default_config = {
            'layout': LayoutAlgorithm.FORCE_DIRECTED,
            'node_size': NodeSizeStrategy.PAGERANK,
            'node_color': NodeColorStrategy.TYPE,
            'edge_width': EdgeWidthStrategy.WEIGHT,
            'show_labels': True,
            'label_size': 10,
            'output_format': 'png',
            'width': 1200,
            'height': 800,
            'damping_factor': 0.85,
            'max_iterations': 100,
            'tolerance': 1e-6,
            'node_min_size': 300,
            'node_max_size': 1500,
            'edge_min_width': 1.0,
            'edge_max_width': 5.0,
            'title': 'Code Graph Visualization',
            'figsize': (12, 8)
        }
        
        # 合并用户配置
        self.config = self.default_config.copy()
        if config:
            self.config.update(config)
        
        # 初始化变量
        self.graph = nx.DiGraph()
        self.json_data = None
        self.node_positions = None
        self.pagerank_values = None
        
        # 节点类型颜色映射
        self.type_color_map = {
            'function': '#3498db',
            'class': '#e74c3c',
            'variable': '#2ecc71',
            'statement': '#f39c12',
            'module': '#9b59b6',
            'import': '#1abc9c'
        }
    
    def load_json(self, file_path: str) -> None:
        """
        加载JSON数据
        
        Args:
            file_path: JSON文件路径
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                self.json_data = json.load(f)
            
            # 验证数据格式
            self._validate_json_data()
            
            # 构建图
            self._build_graph()
            
        except FileNotFoundError:
            raise FileNotFoundError(f"找不到文件: {file_path}")
        except json.JSONDecodeError:
            raise ValueError(f"文件不是有效的JSON格式: {file_path}")
        except Exception as e:
            raise RuntimeError(f"加载JSON数据时出错: {str(e)}")
    
    def load_json_from_dict(self, data: Dict[str, Any]) -> None:
        """
        从字典加载JSON数据
        
        Args:
            data: JSON数据字典
        """
        self.json_data = data
        
        # 验证数据格式
        self._validate_json_data()
        
        # 构建图
        self._build_graph()
    
    def _validate_json_data(self) -> None:
        """验证JSON数据格式"""
        if not self.json_data:
            raise ValueError("JSON数据为空")
        
        if 'metadata' not in self.json_data or 'graph' not in self.json_data:
            raise ValueError("JSON数据格式不正确，缺少metadata或graph字段")
        
        if 'nodes' not in self.json_data['graph'] or 'edges' not in self.json_data['graph']:
            raise ValueError("JSON数据格式不正确，graph中缺少nodes或edges字段")
        
        if not isinstance(self.json_data['graph']['nodes'], list) or not isinstance(self.json_data['graph']['edges'], list):
            raise ValueError("nodes和edges必须是列表")
    
    def _build_graph(self) -> None:
        """从JSON数据构建NetworkX图"""
        # 清空现有图
        self.graph = nx.DiGraph()
        
        # 添加节点
        for node_data in self.json_data['graph']['nodes']:
            node_id = node_data['id']
            node_type = node_data.get('type', 'unknown')
            node_label = node_data.get('label', node_id)
            node_properties = node_data.get('properties', {})
            
            self.graph.add_node(
                node_id,
                type=node_type,
                label=node_label,
                **node_properties
            )
        
        # 添加边
        for edge_data in self.json_data['graph']['edges']:
            source = edge_data['source']
            target = edge_data['target']
            edge_type = edge_data.get('type', 'unknown')
            edge_weight = edge_data.get('weight', 1.0)
            edge_properties = edge_data.get('properties', {})
            
            self.graph.add_edge(
                source,
                target,
                type=edge_type,
                weight=edge_weight,
                **edge_properties
            )
    
    def calculate_pagerank(self) -> None:
        """计算PageRank值"""
        if not self.graph:
            raise ValueError("图未初始化，请先加载JSON数据")
        
        # 计算PageRank
        self.pagerank_values = nx.pagerank(
            self.graph,
            alpha=self.config['damping_factor'],
            max_iter=self.config['max_iterations'],
            tol=self.config['tolerance']
        )
        
        # 将PageRank值添加到节点属性
        nx.set_node_attributes(self.graph, self.pagerank_values, 'pagerank')
    
    def apply_layout(self) -> None:
        """应用布局算法"""
        if not self.graph:
            raise ValueError("图未初始化，请先加载JSON数据")
        
        layout = self.config['layout']
        
        if layout == LayoutAlgorithm.FORCE_DIRECTED:
            self.node_positions = nx.spring_layout(
                self.graph,
                k=1.0,
                iterations=50,
                seed=42
            )
        elif layout == LayoutAlgorithm.CIRCULAR:
            self.node_positions = nx.circular_layout(self.graph)
        elif layout == LayoutAlgorithm.HIERARCHICAL:
            self.node_positions = self._hierarchical_layout()
        elif layout == LayoutAlgorithm.SPRING:
            self.node_positions = nx.spring_layout(self.graph)
        elif layout == LayoutAlgorithm.RANDOM:
            self.node_positions = nx.random_layout(self.graph)
        else:
            raise ValueError(f"不支持的布局算法: {layout}")
    
    def _hierarchical_layout(self) -> Dict[str, Tuple[float, float]]:
        """层次布局算法"""
        # 简单的层次布局实现
        # 在实际应用中，可以使用更复杂的层次布局算法
        
        # 计算每个节点的层级
        levels = {}
        visited = set()
        
        # 找到所有根节点（没有入边的节点）
        root_nodes = [n for n in self.graph.nodes() if self.graph.in_degree(n) == 0]
        
        # 如果没有根节点，选择所有入度为0的节点
        if not root_nodes:
            root_nodes = list(self.graph.nodes())[:1]  # 选择第一个节点作为根
        
        # BFS遍历计算层级
        from collections import deque
        queue = deque([(node, 0) for node in root_nodes])
        
        while queue:
            node, level = queue.popleft()
            
            if node in visited:
                continue
                
            visited.add(node)
            levels[node] = level
            
            # 将所有未访问的邻居加入队列
            for neighbor in self.graph.successors(node):
                if neighbor not in visited:
                    queue.append((neighbor, level + 1))
        
        # 为未访问的节点分配层级
        for node in self.graph.nodes():
            if node not in levels:
                levels[node] = max(levels.values()) + 1
        
        # 按层级分组节点
        level_groups = {}
        for node, level in levels.items():
            if level not in level_groups:
                level_groups[level] = []
            level_groups[level].append(node)
        
        # 计算位置
        positions = {}
        max_level = max(levels.values())
        
        for level, nodes in level_groups.items():
            # 在同一层级中均匀分布节点
            num_nodes = len(nodes)
            if num_nodes == 1:
                x = 0.5
            else:
                x_positions = np.linspace(0.1, 0.9, num_nodes)
                for i, node in enumerate(nodes):
                    positions[node] = (x_positions[i], 1.0 - level / (max_level + 1))
        
        return positions
    
    def render(self, show: bool = False) -> plt.Figure:
        """
        渲染图形
        
        Args:
            show: 是否显示图形
            
        Returns:
            matplotlib图形对象
        """
        if not self.graph:
            raise ValueError("图未初始化，请先加载JSON数据")
        
        if not self.pagerank_values:
            self.calculate_pagerank()
        
        if not self.node_positions:
            self.apply_layout()
        
        # 创建图形
        fig, ax = plt.subplots(figsize=self.config['figsize'])
        ax.set_title(self.config['title'], fontsize=16)
        
        # 绘制边
        self._draw_edges(ax)
        
        # 绘制节点
        self._draw_nodes(ax)
        
        # 绘制标签
        if self.config['show_labels']:
            self._draw_labels(ax)
        
        # 添加图例
        self._add_legend(ax)
        
        # 调整布局
        plt.tight_layout()
        
        if show:
            plt.show()
        
        return fig
    
    def _draw_edges(self, ax: plt.Axes) -> None:
        """绘制边"""
        edge_width_strategy = self.config['edge_width']
        
        # 计算边宽度
        if edge_width_strategy == EdgeWidthStrategy.FIXED:
            edge_widths = 1.5
        elif edge_width_strategy == EdgeWidthStrategy.WEIGHT:
            edge_weights = [self.graph[u][v].get('weight', 1.0) for u, v in self.graph.edges()]
            min_weight = min(edge_weights) if edge_weights else 1.0
            max_weight = max(edge_weights) if edge_weights else 1.0
            
            if max_weight > min_weight:
                edge_widths = [
                    self.config['edge_min_width'] + 
                    (w - min_weight) / (max_weight - min_weight) * 
                    (self.config['edge_max_width'] - self.config['edge_min_width'])
                    for w in edge_weights
                ]
            else:
                edge_widths = [self.config['edge_min_width']] * len(edge_weights)
        else:
            edge_widths = 1.5
        
        # 绘制边
        nx.draw_networkx_edges(
            self.graph,
            pos=self.node_positions,
            width=edge_widths,
            edge_color='gray',
            alpha=0.6,
            ax=ax,
            arrows=True,
            arrowsize=20,
            arrowstyle='->',
            connectionstyle='arc3,rad=0.1'
        )
    
    def _draw_nodes(self, ax: plt.Axes) -> None:
        """绘制节点"""
        node_size_strategy = self.config['node_size']
        node_color_strategy = self.config['node_color']
        
        # 计算节点大小
        if node_size_strategy == NodeSizeStrategy.FIXED:
            node_sizes = [self.config['node_min_size']] * len(self.graph.nodes())
        elif node_size_strategy == NodeSizeStrategy.PAGERANK:
            pagerank_values = [self.pagerank_values[node] for node in self.graph.nodes()]
            min_pr = min(pagerank_values) if pagerank_values else 0.0
            max_pr = max(pagerank_values) if pagerank_values else 1.0
            
            if max_pr > min_pr:
                node_sizes = [
                    self.config['node_min_size'] + 
                    (pr - min_pr) / (max_pr - min_pr) * 
                    (self.config['node_max_size'] - self.config['node_min_size'])
                    for pr in pagerank_values
                ]
            else:
                node_sizes = [self.config['node_min_size']] * len(pagerank_values)
        elif node_size_strategy == NodeSizeStrategy.DEGREE:
            degrees = [self.graph.degree(node) for node in self.graph.nodes()]
            min_degree = min(degrees) if degrees else 0
            max_degree = max(degrees) if degrees else 1
            
            if max_degree > min_degree:
                node_sizes = [
                    self.config['node_min_size'] + 
                    (deg - min_degree) / (max_degree - min_degree) * 
                    (self.config['node_max_size'] - self.config['node_min_size'])
                    for deg in degrees
                ]
            else:
                node_sizes = [self.config['node_min_size']] * len(degrees)
        else:
            node_sizes = [self.config['node_min_size']] * len(self.graph.nodes())
        
        # 计算节点颜色
        if node_color_strategy == NodeColorStrategy.FIXED:
            node_colors = ['skyblue'] * len(self.graph.nodes())
        elif node_color_strategy == NodeColorStrategy.TYPE:
            node_colors = [self.type_color_map.get(self.graph.nodes[node].get('type', 'unknown'), 'gray') 
                          for node in self.graph.nodes()]
        elif node_color_strategy == NodeColorStrategy.PAGERANK:
            pagerank_values = [self.pagerank_values[node] for node in self.graph.nodes()]
            node_colors = pagerank_values
            cmap = plt.cm.viridis
        else:
            node_colors = ['skyblue'] * len(self.graph.nodes())
        
        # 绘制节点
        if node_color_strategy == NodeColorStrategy.PAGERANK:
            nx.draw_networkx_nodes(
                self.graph,
                pos=self.node_positions,
                node_size=node_sizes,
                node_color=node_colors,
                cmap=plt.cm.viridis,
                alpha=0.8,
                ax=ax
            )
        else:
            nx.draw_networkx_nodes(
                self.graph,
                pos=self.node_positions,
                node_size=node_sizes,
                node_color=node_colors,
                alpha=0.8,
                ax=ax
            )
    
    def _draw_labels(self, ax: plt.Axes) -> None:
        """绘制标签"""
        labels = {node: self.graph.nodes[node].get('label', node) for node in self.graph.nodes()}
        
        nx.draw_networkx_labels(
            self.graph,
            pos=self.node_positions,
            labels=labels,
            font_size=self.config['label_size'],
            font_family='sans-serif',
            ax=ax
        )
    
    def _add_legend(self, ax: plt.Axes) -> None:
        """添加图例"""
        if self.config['node_color'] == NodeColorStrategy.TYPE:
            # 创建类型图例
            legend_elements = []
            for node_type, color in self.type_color_map.items():
                # 检查图中是否有此类型的节点
                has_type = any(self.graph.nodes[node].get('type') == node_type for node in self.graph.nodes())
                if has_type:
                    legend_elements.append(mpatches.Patch(color=color, label=node_type))
            
            if legend_elements:
                ax.legend(handles=legend_elements, loc='upper right')
        
        elif self.config['node_color'] == NodeColorStrategy.PAGERANK:
            # 添加PageRank颜色条
            sm = plt.cm.ScalarMappable(cmap=plt.cm.viridis, 
                                       norm=plt.Normalize(vmin=min(self.pagerank_values.values()), 
                                                         vmax=max(self.pagerank_values.values())))
            sm.set_array([])
            cbar = plt.colorbar(sm, ax=ax)
            cbar.set_label('PageRank Value')
    
    def export(self, output_path: str, dpi: int = 300) -> None:
        """
        导出图形
        
        Args:
            output_path: 输出路径
            dpi: 图像分辨率
        """
        # 渲染图形
        fig = self.render()
        
        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # 保存图形
        fig.savefig(output_path, dpi=dpi, bbox_inches='tight')
        plt.close(fig)
    
    def get_pagerank_values(self) -> Dict[str, float]:
        """
        获取PageRank值
        
        Returns:
            节点ID到PageRank值的映射
        """
        if not self.pagerank_values:
            self.calculate_pagerank()
        
        return self.pagerank_values
    
    def get_node_positions(self) -> Dict[str, Tuple[float, float]]:
        """
        获取节点位置
        
        Returns:
            节点ID到位置的映射
        """
        if not self.node_positions:
            self.apply_layout()
        
        return self.node_positions