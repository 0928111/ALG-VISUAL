/**
 * 可视化智能体执行器
 * 
 * 负责将智能体的响应应用到实际的可视化系统中
 * 
 * @module VisualizationAgentExecutor
 * @version 1.0.0
 */

import type {
  AgentOutputResponse,
  AgentOutputGraphDataUpdate,
  AgentOutputStyleUpdate,
  AgentOutputViewAction
} from './visualization-agent-interface';

// Redux Store 相关类型（避免直接依赖，使用接口定义）
export interface GraphDataDispatcher {
  updateNodeRanks: (ranks: Record<string, number>) => void;
  updateEdgeWeights: (weights: Record<string, number>) => void;
  setActiveEdges: (edgeIds: string[]) => void;
}

export interface GraphViewRef {
  updateNodeRanks: (ranks: Record<string, number>) => void;
  updateEdgeWeights: (weights: Record<string, number>) => void;
  highlightEdges: (edgeIds: string[]) => void;
  setData: (data: any) => void;
}

// 执行器配置
export interface ExecutorConfig {
  // Redux dispatchers（可选，用于更新全局状态）
  graphDataDispatcher?: GraphDataDispatcher;
  
  // GraphViewZone的ref（可选，用于直接操作视图）
  graphViewRef?: GraphViewRef | null;
  
  // 当前图数据（必需，用于合并更新）
  currentGraphData: {
    nodes: Array<{ id: string; rank: number; x?: number; y?: number }>;
    edges: Array<{ id: string; weight: number }>;
  };
  
  // 当前配置（可选，用于合并样式更新）
  currentConfig?: any;
  
  // 回调函数
  onExecutionStart?: () => void;
  onExecutionComplete?: (success: boolean, message: string) => void;
  onError?: (error: Error) => void;
}

/**
 * 执行智能体响应
 */
export async function executeAgentResponse(
  response: AgentOutputResponse,
  config: ExecutorConfig
): Promise<void> {
  const {
    graphDataDispatcher,
    graphViewRef,
    currentGraphData,
    onExecutionStart,
    onExecutionComplete,
    onError
  } = config;

  try {
    // 通知开始执行
    onExecutionStart?.();

    console.log('🚀 开始执行智能体响应:', response);

    // 1. 执行图数据更新
    if (response.dataUpdate) {
      await executeDataUpdate(
        response.dataUpdate,
        currentGraphData,
        graphDataDispatcher,
        graphViewRef
      );
    }

    // 2. 执行样式更新
    if (response.styleUpdate) {
      await executeStyleUpdate(
        response.styleUpdate,
        graphViewRef
      );
    }

    // 3. 执行视图操作
    if (response.viewAction) {
      await executeViewAction(
        response.viewAction,
        graphViewRef
      );
    }

    // 通知执行完成
    console.log('✅ 智能体响应执行完成');
    onExecutionComplete?.(true, response.message);

  } catch (error) {
    console.error('❌ 执行智能体响应失败:', error);
    onError?.(error as Error);
    onExecutionComplete?.(false, `执行失败: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * 执行图数据更新
 */
async function executeDataUpdate(
  dataUpdate: AgentOutputGraphDataUpdate,
  currentGraphData: ExecutorConfig['currentGraphData'],
  dispatcher?: GraphDataDispatcher,
  viewRef?: GraphViewRef | null
): Promise<void> {
  console.log('📊 执行图数据更新:', dataUpdate);

  // 1. 节点更新
  if (dataUpdate.nodeUpdates && dataUpdate.nodeUpdates.length > 0) {
    // 构建rank更新映射
    const rankUpdates: Record<string, number> = {};
    
    dataUpdate.nodeUpdates.forEach(update => {
      if (update.rank !== undefined) {
        rankUpdates[update.id] = update.rank;
      }
    });

    // 通过dispatcher更新Redux状态
    if (Object.keys(rankUpdates).length > 0) {
      console.log('  - 更新节点rank:', rankUpdates);
      dispatcher?.updateNodeRanks(rankUpdates);
      viewRef?.updateNodeRanks(rankUpdates);
    }

    // 处理位置更新（需要重新设置完整数据）
    const hasPositionUpdates = dataUpdate.nodeUpdates.some(u => u.x !== undefined || u.y !== undefined);
    if (hasPositionUpdates && viewRef) {
      const updatedNodes = currentGraphData.nodes.map(node => {
        const update = dataUpdate.nodeUpdates?.find(u => u.id === node.id);
        if (update) {
          return {
            ...node,
            rank: update.rank ?? node.rank,
            x: update.x ?? node.x,
            y: update.y ?? node.y
          };
        }
        return node;
      });

      console.log('  - 更新节点位置:', updatedNodes.filter(n => 
        dataUpdate.nodeUpdates?.some(u => u.id === n.id && (u.x !== undefined || u.y !== undefined))
      ));

      viewRef.setData({
        nodes: updatedNodes,
        edges: currentGraphData.edges
      });
    }
  }

  // 2. 边更新
  if (dataUpdate.edgeUpdates && dataUpdate.edgeUpdates.length > 0) {
    // 构建权重更新映射
    const weightUpdates: Record<string, number> = {};
    const activeEdgeIds: string[] = [];

    dataUpdate.edgeUpdates.forEach(update => {
      if (update.weight !== undefined) {
        weightUpdates[update.id] = update.weight;
      }
      if (update.isActive === true) {
        activeEdgeIds.push(update.id);
      }
    });

    // 更新权重
    if (Object.keys(weightUpdates).length > 0) {
      console.log('  - 更新边权重:', weightUpdates);
      dispatcher?.updateEdgeWeights(weightUpdates);
      viewRef?.updateEdgeWeights(weightUpdates);
    }

    // 更新激活状态
    if (activeEdgeIds.length > 0) {
      console.log('  - 激活边:', activeEdgeIds);
      dispatcher?.setActiveEdges(activeEdgeIds);
    }
  }

  // 添加小延迟确保更新生效
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * 执行样式更新
 */
async function executeStyleUpdate(
  styleUpdate: AgentOutputStyleUpdate,
  viewRef?: GraphViewRef | null
): Promise<void> {
  console.log('🎨 执行样式更新:', styleUpdate);

  // 注意：样式更新通常需要重新初始化GraphViewZone组件
  // 这里仅记录日志，实际应用需要通过props或Redux状态触发重渲染

  if (styleUpdate.nodeStyle) {
    console.log('  - 节点样式更新:', styleUpdate.nodeStyle);
    // TODO: 实现节点样式更新逻辑
    // 可能需要更新GraphConfig并触发组件重渲染
  }

  if (styleUpdate.edgeStyle) {
    console.log('  - 边样式更新:', styleUpdate.edgeStyle);
    // TODO: 实现边样式更新逻辑
  }

  if (styleUpdate.layoutParams) {
    console.log('  - 布局参数更新:', styleUpdate.layoutParams);
    // TODO: 实现布局参数更新逻辑
    // 可能需要停止当前模拟并使用新参数重启
  }

  console.warn('⚠️ 样式更新功能尚未完全实现，需要扩展GraphViewZone支持动态配置更新');
}

/**
 * 执行视图操作
 */
async function executeViewAction(
  viewAction: AgentOutputViewAction,
  viewRef?: GraphViewRef | null
): Promise<void> {
  console.log('🎬 执行视图操作:', viewAction);

  // 1. 缩放操作
  if (viewAction.zoom) {
    console.log('  - 缩放至:', viewAction.zoom.level);
    // TODO: 实现缩放功能
    // 需要访问SVG的zoom behavior或通过GraphViewZone暴露的API
    console.warn('⚠️ 缩放功能需要GraphViewZone暴露zoom API');
  }

  // 2. 平移操作
  if (viewAction.pan) {
    console.log('  - 平移至:', viewAction.pan.target);
    // TODO: 实现平移功能
    console.warn('⚠️ 平移功能需要GraphViewZone暴露pan API');
  }

  // 3. 高亮操作
  if (viewAction.highlight) {
    const { nodes, edges, duration } = viewAction.highlight;
    
    if (edges && edges.length > 0) {
      console.log('  - 高亮边:', edges);
      viewRef?.highlightEdges(edges);
      
      // 如果设置了持续时间，自动取消高亮
      if (duration && duration > 0) {
        await new Promise(resolve => setTimeout(resolve, duration));
        viewRef?.highlightEdges([]);
        console.log('  - 取消高亮');
      }
    }

    if (nodes && nodes.length > 0) {
      console.log('  - 高亮节点:', nodes);
      // TODO: 实现节点高亮功能
      // 可能需要GraphViewZone暴露highlightNodes方法
    }
  }

  // 4. 动画操作
  if (viewAction.animation) {
    console.log('  - 播放动画:', viewAction.animation.type);
    // TODO: 实现动画功能
    // 可能需要GraphViewZone暴露playAnimation方法
    console.warn('⚠️ 动画功能需要GraphViewZone暴露animation API');
  }
}

/**
 * 批量执行多个智能体响应
 */
export async function executeBatchAgentResponses(
  responses: AgentOutputResponse[],
  config: ExecutorConfig
): Promise<void> {
  console.log(`🔄 批量执行${responses.length}个智能体响应`);

  for (const [index, response] of responses.entries()) {
    console.log(`执行第${index + 1}/${responses.length}个响应`);
    await executeAgentResponse(response, config);
    
    // 添加间隔避免执行过快
    if (index < responses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('✅ 批量执行完成');
}
