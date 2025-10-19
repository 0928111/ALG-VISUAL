/**
 * 可视化智能体接口定义
 * 
 * 用于接入AI智能体，根据自然语言描述调整图可视化效果
 * 
 * @module VisualizationAgentInterface
 * @version 1.0.0
 */

// ==================== 输入参数类型定义 ====================

/**
 * 智能体输入 - 当前图数据
 */
export interface AgentInputGraphData {
  nodes: Array<{
    id: string;
    label: string;
    rank: number;
    x?: number;
    y?: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    weight: number;
    isActive?: boolean;
  }>;
}

/**
 * 智能体输入 - 当前可视化规范（简化版）
 */
export interface AgentInputVisualizationSpec {
  // 节点样式
  nodeStyle: {
    radiusRange: [number, number];  // 节点半径范围 [min, max]
    colors: Record<string, string>; // 节点颜色映射 {nodeId: color}
    defaultColor: string;           // 默认颜色
  };
  // 边样式
  edgeStyle: {
    widthRange: [number, number];   // 边宽度范围 [min, max]
    normalColor: string;            // 普通边颜色
    activeColor: string;            // 激活边颜色
    opacityRange: [number, number]; // 透明度范围 [min, max]
  };
  // 布局参数
  layoutParams: {
    type: 'force' | 'circular' | 'hierarchical';
    forceStrength?: number;         // 力导向强度 (-1000 ~ 0)
    linkDistance?: number;          // 边距离 (50 ~ 300)
    collisionRadius?: number;       // 碰撞半径 (10 ~ 100)
  };
  // 画布配置
  canvasConfig: {
    width: number;
    height: number;
    backgroundColor: string;
  };
}

/**
 * 智能体输入 - 当前视图状态
 */
export interface AgentInputViewState {
  zoomLevel: number;              // 当前缩放级别 (0.6 ~ 2.0)
  centerPosition: [number, number]; // 视图中心 [x, y]
  selectedNodes: string[];        // 选中的节点ID列表
  highlightedEdges: string[];     // 高亮的边ID列表
}

/**
 * 智能体输入 - 完整上下文
 */
export interface AgentInputContext {
  graphData: AgentInputGraphData;
  visualizationSpec: AgentInputVisualizationSpec;
  viewState: AgentInputViewState;
  userDescription: string;        // 用户的自然语言描述
  timestamp: number;              // 请求时间戳
}

// ==================== 输出参数类型定义 ====================

/**
 * 智能体输出 - 图数据更新
 */
export interface AgentOutputGraphDataUpdate {
  // 节点更新
  nodeUpdates?: Array<{
    id: string;
    rank?: number;      // 更新PageRank值
    x?: number;         // 更新X坐标
    y?: number;         // 更新Y坐标
  }>;
  // 边更新
  edgeUpdates?: Array<{
    id: string;
    weight?: number;    // 更新权重
    isActive?: boolean; // 更新激活状态
  }>;
}

/**
 * 智能体输出 - 样式配置更新
 */
export interface AgentOutputStyleUpdate {
  // 节点样式更新
  nodeStyle?: {
    radiusRange?: [number, number];
    colorOverrides?: Record<string, string>; // 覆盖特定节点颜色
  };
  // 边样式更新
  edgeStyle?: {
    widthRange?: [number, number];
    normalColor?: string;
    activeColor?: string;
    opacityRange?: [number, number];
  };
  // 布局参数更新
  layoutParams?: {
    forceStrength?: number;
    linkDistance?: number;
    collisionRadius?: number;
  };
}

/**
 * 智能体输出 - 视图操作
 */
export interface AgentOutputViewAction {
  // 缩放操作
  zoom?: {
    level: number;      // 目标缩放级别
    duration?: number;  // 动画时长(ms)
  };
  // 平移操作
  pan?: {
    target: [number, number]; // 目标中心位置 [x, y]
    duration?: number;
  };
  // 高亮操作
  highlight?: {
    nodes?: string[];   // 要高亮的节点
    edges?: string[];   // 要高亮的边
    duration?: number;  // 高亮持续时间(ms)，0表示持续
  };
  // 动画操作
  animation?: {
    type: 'flow' | 'pulse' | 'emphasize';
    targets: string[];  // 目标节点/边ID
    duration?: number;
  };
}

/**
 * 智能体输出 - 完整响应
 */
export interface AgentOutputResponse {
  success: boolean;
  message: string;                // 执行说明或错误信息
  dataUpdate?: AgentOutputGraphDataUpdate;
  styleUpdate?: AgentOutputStyleUpdate;
  viewAction?: AgentOutputViewAction;
  timestamp: number;
}

// ==================== 智能体接口主函数 ====================

/**
 * 调用智能体处理可视化调整请求
 * 
 * @param input 输入上下文
 * @returns Promise<智能体响应>
 */
export async function callVisualizationAgent(
  input: AgentInputContext
): Promise<AgentOutputResponse> {
  // TODO: 这里应该调用实际的智能体服务
  // 例如：调用大语言模型API、本地AI服务等
  
  throw new Error('Agent service not implemented yet. Please implement this function.');
}

/**
 * 模拟智能体响应（用于测试）
 * 
 * @param input 输入上下文
 * @returns 模拟的智能体响应
 */
export function mockVisualizationAgent(
  input: AgentInputContext
): AgentOutputResponse {
  console.log('🤖 智能体收到请求:', {
    userDescription: input.userDescription,
    nodeCount: input.graphData.nodes.length,
    edgeCount: input.graphData.edges.length
  });

  // 根据用户描述的关键词返回不同的模拟响应
  const description = input.userDescription.toLowerCase();

  // 示例1: 增大节点A的PageRank值
  if (description.includes('增大') && description.includes('a')) {
    return {
      success: true,
      message: '已将节点A的PageRank值增大到50',
      dataUpdate: {
        nodeUpdates: [
          { id: 'A', rank: 50 }
        ]
      },
      timestamp: Date.now()
    };
  }

  // 示例2: 调整边的权重
  if (description.includes('边') && description.includes('权重')) {
    return {
      success: true,
      message: '已调整所有边的权重为统一值10',
      dataUpdate: {
        edgeUpdates: input.graphData.edges.map(edge => ({
          id: edge.id,
          weight: 10
        }))
      },
      timestamp: Date.now()
    };
  }

  // 示例3: 改变节点颜色
  if (description.includes('颜色') || description.includes('红色')) {
    return {
      success: true,
      message: '已将节点A改为红色',
      styleUpdate: {
        nodeStyle: {
          colorOverrides: {
            'A': '#FF5555'
          }
        }
      },
      timestamp: Date.now()
    };
  }

  // 示例4: 调整布局紧凑度
  if (description.includes('紧凑') || description.includes('靠近')) {
    return {
      success: true,
      message: '已调整布局使节点更加紧凑',
      styleUpdate: {
        layoutParams: {
          linkDistance: 80,      // 缩短边距离
          forceStrength: -400    // 减弱排斥力
        }
      },
      timestamp: Date.now()
    };
  }

  // 示例5: 高亮特定节点
  if (description.includes('高亮') || description.includes('突出')) {
    const nodeIds = input.graphData.nodes.map(n => n.id);
    return {
      success: true,
      message: `已高亮节点${nodeIds[0]}及其相关边`,
      viewAction: {
        highlight: {
          nodes: [nodeIds[0]],
          edges: input.graphData.edges
            .filter(e => e.source === nodeIds[0] || e.target === nodeIds[0])
            .map(e => e.id),
          duration: 3000
        }
      },
      timestamp: Date.now()
    };
  }

  // 示例6: 放大视图
  if (description.includes('放大') || description.includes('zoom')) {
    return {
      success: true,
      message: '已放大视图至1.5倍',
      viewAction: {
        zoom: {
          level: 1.5,
          duration: 800
        }
      },
      timestamp: Date.now()
    };
  }

  // 示例7: 重新排列节点位置
  if (description.includes('圆形') || description.includes('环形')) {
    const centerX = input.visualizationSpec.canvasConfig.width / 2;
    const centerY = input.visualizationSpec.canvasConfig.height / 2;
    const radius = 150;
    const nodeCount = input.graphData.nodes.length;

    return {
      success: true,
      message: '已将节点重新排列为圆形布局',
      dataUpdate: {
        nodeUpdates: input.graphData.nodes.map((node, index) => {
          const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
          return {
            id: node.id,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        })
      },
      timestamp: Date.now()
    };
  }

  // 默认响应
  return {
    success: false,
    message: '未识别的指令。请尝试：增大节点、调整边权重、改变颜色、紧凑布局、高亮节点、放大视图、圆形排列等。',
    timestamp: Date.now()
  };
}

// ==================== 辅助函数 ====================

/**
 * 从当前系统状态构建智能体输入上下文
 */
export function buildAgentInputFromState(params: {
  graphData: AgentInputGraphData;
  currentConfig: any;  // GraphConfig from GraphViewZone
  viewState: Partial<AgentInputViewState>;
  userDescription: string;
}): AgentInputContext {
  const { graphData, currentConfig, viewState, userDescription } = params;

  return {
    graphData,
    visualizationSpec: {
      nodeStyle: {
        radiusRange: currentConfig.nodeRadiusRange || [18, 36],
        colors: currentConfig.colors?.node?.reduce((acc: Record<string, string>, color: string, index: number) => {
          const nodeId = String.fromCharCode(65 + index); // A, B, C, D...
          acc[nodeId] = color;
          return acc;
        }, {}) || {},
        defaultColor: currentConfig.colors?.node?.[4] || '#7E6BF2'
      },
      edgeStyle: {
        widthRange: currentConfig.edgeWidthRange || [1.5, 3.5],
        normalColor: currentConfig.colors?.edge?.normal || '#2EA0FF',
        activeColor: currentConfig.colors?.edge?.active || '#FF9C66',
        opacityRange: [0.6, 0.95]
      },
      layoutParams: {
        type: currentConfig.layoutType || 'force',
        forceStrength: -300,
        linkDistance: 120,
        collisionRadius: 38
      },
      canvasConfig: {
        width: currentConfig.width || 900,
        height: currentConfig.height || 700,
        backgroundColor: currentConfig.colors?.background || '#F5F7FA'
      }
    },
    viewState: {
      zoomLevel: viewState.zoomLevel || 1,
      centerPosition: viewState.centerPosition || [450, 350],
      selectedNodes: viewState.selectedNodes || [],
      highlightedEdges: viewState.highlightedEdges || []
    },
    userDescription,
    timestamp: Date.now()
  };
}

/**
 * 验证智能体响应的有效性
 */
export function validateAgentResponse(response: AgentOutputResponse): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查基本字段
  if (typeof response.success !== 'boolean') {
    errors.push('缺少success字段或类型错误');
  }
  if (!response.message || typeof response.message !== 'string') {
    errors.push('缺少message字段或类型错误');
  }

  // 检查数据更新
  if (response.dataUpdate) {
    if (response.dataUpdate.nodeUpdates) {
      response.dataUpdate.nodeUpdates.forEach((update, index) => {
        if (!update.id) {
          errors.push(`nodeUpdates[${index}]缺少id字段`);
        }
        if (update.rank !== undefined && (update.rank < 0 || update.rank > 100)) {
          errors.push(`nodeUpdates[${index}]的rank值超出范围[0, 100]`);
        }
      });
    }
    if (response.dataUpdate.edgeUpdates) {
      response.dataUpdate.edgeUpdates.forEach((update, index) => {
        if (!update.id) {
          errors.push(`edgeUpdates[${index}]缺少id字段`);
        }
        if (update.weight !== undefined && update.weight < 0) {
          errors.push(`edgeUpdates[${index}]的weight值不能为负数`);
        }
      });
    }
  }

  // 检查样式更新
  if (response.styleUpdate) {
    if (response.styleUpdate.nodeStyle?.radiusRange) {
      const [min, max] = response.styleUpdate.nodeStyle.radiusRange;
      if (min >= max || min < 5 || max > 100) {
        errors.push('nodeStyle.radiusRange范围无效');
      }
    }
    if (response.styleUpdate.edgeStyle?.widthRange) {
      const [min, max] = response.styleUpdate.edgeStyle.widthRange;
      if (min >= max || min < 0.5 || max > 10) {
        errors.push('edgeStyle.widthRange范围无效');
      }
    }
  }

  // 检查视图操作
  if (response.viewAction) {
    if (response.viewAction.zoom) {
      const level = response.viewAction.zoom.level;
      if (level < 0.6 || level > 2.0) {
        errors.push('zoom.level超出范围[0.6, 2.0]');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
