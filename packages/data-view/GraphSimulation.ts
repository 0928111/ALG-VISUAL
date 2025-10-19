/**
 * 图仿真模块 - 用于动态可视化PageRank算法的节点间权重传递过程
 */

export interface GraphNode {
  id: string
  rank: number
  delta: number // 变化量
  position: { x: number; y: number }
  radius: number // 节点大小，与rank成正比
  color: string // 节点颜色，根据rank变化
  highlight: boolean // 是否高亮显示
}

export interface GraphEdge {
  source: string
  target: string
  weight: number // 边的权重
  active: boolean // 是否处于活跃状态（正在传递权重）
  animationProgress: number // 动画进度 0-1
  color: string // 边的颜色
}

export interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  iteration: number
  totalIterations: number
}

export interface UIHints {
  redistribute?: {
    [nodeId: string]: {
      from: string
      value: number
      progress?: number
    }
  }
  highlights?: string[] // 需要高亮的节点ID
  activeEdges?: {
    source: string
    target: string
    weight: number
  }[]
}

/**
 * 初始化图状态
 */
export function initializeGraph(): GraphState {
  return {
    nodes: [
      {
        id: 'A',
        rank: 0.25,
        delta: 0,
        position: { x: 200, y: 200 },
        radius: 20,
        color: '#4CAF50',
        highlight: false
      },
      {
        id: 'B',
        rank: 0.25,
        delta: 0,
        position: { x: 400, y: 150 },
        radius: 20,
        color: '#4CAF50',
        highlight: false
      },
      {
        id: 'C',
        rank: 0.25,
        delta: 0,
        position: { x: 300, y: 300 },
        radius: 20,
        color: '#4CAF50',
        highlight: false
      },
      {
        id: 'D',
        rank: 0.25,
        delta: 0,
        position: { x: 500, y: 250 },
        radius: 20,
        color: '#4CAF50',
        highlight: false
      }
    ],
    edges: [
      { source: 'A', target: 'B', weight: 0.5, active: false, animationProgress: 0, color: '#999' },
      { source: 'A', target: 'C', weight: 0.5, active: false, animationProgress: 0, color: '#999' },
      { source: 'B', target: 'A', weight: 0.3, active: false, animationProgress: 0, color: '#999' },
      { source: 'B', target: 'D', weight: 0.7, active: false, animationProgress: 0, color: '#999' },
      { source: 'C', target: 'A', weight: 0.4, active: false, animationProgress: 0, color: '#999' },
      { source: 'C', target: 'D', weight: 0.6, active: false, animationProgress: 0, color: '#999' },
      { source: 'D', target: 'B', weight: 0.8, active: false, animationProgress: 0, color: '#999' },
      { source: 'D', target: 'C', weight: 0.2, active: false, animationProgress: 0, color: '#999' }
    ],
    iteration: 0,
    totalIterations: 8
  }
}

/**
 * 更新图状态 - 根据UIHints更新节点和边的状态
 */
export function updateGraphState(graphState: GraphState, uiHints: UIHints): GraphState {
  const newState = { ...graphState }
  
  // 更新节点状态
  newState.nodes = graphState.nodes.map(node => {
    const newNode = { ...node }
    
    // 重置高亮状态
    newNode.highlight = false
    
    // 根据UIHints设置高亮
    if (uiHints.highlights?.includes(node.id)) {
      newNode.highlight = true
    }
    
    // 根据rank值更新颜色和大小
    const intensity = Math.min(node.rank * 2, 1)
    newNode.color = node.highlight 
      ? `#FF6B6B` // 高亮时使用红色
      : `hsl(${120 + intensity * 60}, 70%, ${50 + intensity * 20}%)` // 根据rank调整颜色
    
    newNode.radius = 15 + node.rank * 30 // 根据rank调整大小
    
    return newNode
  })
  
  // 更新边状态
  newState.edges = graphState.edges.map(edge => {
    const newEdge = { ...edge }
    
    // 重置边状态
    newEdge.active = false
    newEdge.animationProgress = 0
    newEdge.color = '#999'
    
    // 检查是否有重新分配的数据
    if (uiHints.redistribute) {
      Object.entries(uiHints.redistribute).forEach(([targetId, data]) => {
        if (targetId === edge.target && data.from === edge.source) {
          newEdge.active = true
          newEdge.weight = data.value
          newEdge.animationProgress = data.progress || 0
          newEdge.color = '#4CAF50' // 活跃边使用绿色
        }
      })
    }
    
    // 检查是否在活跃边列表中
    if (uiHints.activeEdges) {
      uiHints.activeEdges.forEach(activeEdge => {
        if (activeEdge.source === edge.source && activeEdge.target === edge.target) {
          newEdge.active = true
          newEdge.weight = activeEdge.weight
          newEdge.color = '#2196F3' // 活跃边使用蓝色
        }
      })
    }
    
    return newEdge
  })
  
  return newState
}

/**
 * 获取节点间的连接关系
 */
export function getNodeConnections(nodeId: string, edges: GraphEdge[]): GraphEdge[] {
  return edges.filter(edge => edge.source === nodeId || edge.target === nodeId)
}

/**
 * 计算节点的前驱节点
 */
export function getPredecessors(nodeId: string, edges: GraphEdge[]): string[] {
  return edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source)
}

/**
 * 计算节点的后继节点
 */
export function getSuccessors(nodeId: string, edges: GraphEdge[]): string[] {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target)
}

/**
 * 更新节点位置（用于拖拽等交互）
 */
export function updateNodePosition(
  graphState: GraphState, 
  nodeId: string, 
  position: { x: number; y: number }
): GraphState {
  return {
    ...graphState,
    nodes: graphState.nodes.map(node => 
      node.id === nodeId ? { ...node, position } : node
    )
  }
}

/**
 * 获取动画进度（用于平滑过渡）
 */
export function getAnimationProgress(graphState: GraphState): number {
  const activeEdges = graphState.edges.filter(edge => edge.active)
  if (activeEdges.length === 0) return 0
  
  const totalProgress = activeEdges.reduce((sum, edge) => sum + edge.animationProgress, 0)
  return totalProgress / activeEdges.length
}