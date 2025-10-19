export interface PageRankNode {
  id: string
  name: string
  value: number
  prevValue: number
}

export interface PageRankState {
  nodes: PageRankNode[]
  step: number
  totalSteps: number
  uiHints?: UIHints // 新增：用于图可视化的UI提示
}

export interface UIHints {
  redistribute?: {
    [nodeId: string]: {
      from: string
      value: number
      progress?: number
    }
  }
  highlights?: string[]
  activeEdges?: {
    source: string
    target: string
    weight: number
  }[]
}

export interface StepMeta {
  nodeId: string
  description: string
  title: string
}

/**
 * 初始化PageRank状态
 */
export function reset(): PageRankState {
  return {
    nodes: [
      { id: 'A', name: '网页A', value: 0.25, prevValue: 0.25 },
      { id: 'B', name: '网页B', value: 0.25, prevValue: 0.25 },
      { id: 'C', name: '网页C', value: 0.25, prevValue: 0.25 },
      { id: 'D', name: '网页D', value: 0.25, prevValue: 0.25 }
    ],
    step: 0,
    totalSteps: 8,
    uiHints: {
      highlights: ['A', 'B', 'C', 'D'],
      activeEdges: []
    }
  }
}

/**
 * 模拟PageRank的一步迭代
 */
export function step(prevState: PageRankState): PageRankState {
  const newState = {
    ...prevState,
    step: prevState.step + 1,
    nodes: prevState.nodes.map(node => ({
      ...node,
      prevValue: node.value
    }))
  }

  // 初始化UIHints
  newState.uiHints = {
    highlights: [],
    activeEdges: [],
    redistribute: {}
  }

  // 根据步骤更新PageRank值（模拟算法过程）
  switch (newState.step) {
    case 1:
      newState.nodes[0].value = 0.35  // A增加
      newState.nodes[1].value = 0.20  // B减少
      newState.nodes[2].value = 0.25  // C不变
      newState.nodes[3].value = 0.20  // D减少
      
      // 设置可视化提示
      newState.uiHints.highlights = ['A', 'B', 'D']
      newState.uiHints.redistribute = {
        'A': { from: 'B', value: 0.15, progress: 0.5 },
        'D': { from: 'B', value: 0.05, progress: 0.3 }
      }
      newState.uiHints.activeEdges = [
        { source: 'B', target: 'A', weight: 0.15 },
        { source: 'B', target: 'D', weight: 0.05 }
      ]
      break
    case 2:
      newState.nodes[0].value = 0.30
      newState.nodes[1].value = 0.25
      newState.nodes[2].value = 0.20
      newState.nodes[3].value = 0.25
      
      newState.uiHints.highlights = ['A', 'C']
      newState.uiHints.redistribute = {
        'C': { from: 'A', value: 0.05, progress: 0.7 }
      }
      newState.uiHints.activeEdges = [
        { source: 'A', target: 'C', weight: 0.05 }
      ]
      break
    case 3:
      newState.nodes[0].value = 0.25
      newState.nodes[1].value = 0.30
      newState.nodes[2].value = 0.20
      newState.nodes[3].value = 0.25
      
      newState.uiHints.highlights = ['B', 'A']
      newState.uiHints.redistribute = {
        'B': { from: 'A', value: 0.05, progress: 0.4 }
      }
      newState.uiHints.activeEdges = [
        { source: 'A', target: 'B', weight: 0.05 }
      ]
      break
    case 4:
      newState.nodes[0].value = 0.20
      newState.nodes[1].value = 0.25
      newState.nodes[2].value = 0.30
      newState.nodes[3].value = 0.25
      
      newState.uiHints.highlights = ['C', 'A', 'B']
      newState.uiHints.redistribute = {
        'C': { from: 'A,B', value: 0.10, progress: 0.7 }
      }
      newState.uiHints.activeEdges = [
        { source: 'A', target: 'C', weight: 0.05 },
        { source: 'B', target: 'C', weight: 0.05 }
      ]
      break
    case 5:
      newState.nodes[0].value = 0.22
      newState.nodes[1].value = 0.23
      newState.nodes[2].value = 0.27
      newState.nodes[3].value = 0.28
      
      newState.uiHints.highlights = ['D', 'C']
      newState.uiHints.redistribute = {
        'D': { from: 'C', value: 0.02, progress: 0.5 }
      }
      newState.uiHints.activeEdges = [
        { source: 'C', target: 'D', weight: 0.02 }
      ]
      break
    case 6:
      newState.nodes[0].value = 0.21
      newState.nodes[1].value = 0.24
      newState.nodes[2].value = 0.26
      newState.nodes[3].value = 0.29
      
      newState.uiHints.highlights = ['D']
      newState.uiHints.activeEdges = []
      break
    case 7:
      newState.nodes[0].value = 0.205
      newState.nodes[1].value = 0.245
      newState.nodes[2].value = 0.255
      newState.nodes[3].value = 0.295
      
      newState.uiHints.highlights = ['A', 'B', 'C', 'D']
      newState.uiHints.activeEdges = []
      break
    case 8:
      newState.nodes[0].value = 0.20
      newState.nodes[1].value = 0.25
      newState.nodes[2].value = 0.25
      newState.nodes[3].value = 0.30
      
      newState.uiHints.highlights = ['D']
      newState.uiHints.activeEdges = []
      break
    default:
      // 初始状态
      newState.nodes.forEach(node => {
        node.value = 0.25
        node.prevValue = 0.25
      })
      newState.uiHints.highlights = ['A', 'B', 'C', 'D']
  }

  return newState
}

/**
 * 获取步骤的元数据信息
 */
export function getStepMeta(step: number): StepMeta {
  const stepMetas: { [key: number]: StepMeta } = {
    0: { nodeId: 'INIT', description: '初始化所有网页的PageRank值', title: '初始化' },
    1: { nodeId: 'FETCH_PAGES', description: '抓取所有网页并分析链接关系', title: '抓取网页' },
    2: { nodeId: 'REDISTRIBUTE', description: '重新分配PageRank值', title: '重新分配' },
    3: { nodeId: 'AGGREGATE', description: '统计和存储新的PageRank值', title: '统计存储' },
    4: { nodeId: 'ITERATE', description: '进行下一次迭代计算', title: '迭代计算' },
    5: { nodeId: 'CONVERGE', description: '检查是否收敛', title: '收敛检查' },
    6: { nodeId: 'NORMALIZE', description: '归一化PageRank值', title: '归一化' },
    7: { nodeId: 'FINALIZE', description: '完成PageRank计算', title: '完成计算' },
    8: { nodeId: 'COMPLETE', description: 'PageRank算法执行完成', title: '算法完成' }
  }

  return stepMetas[step] || stepMetas[0]
}

/**
 * 获取所有步骤的流程节点映射
 */
export function getStepMapping(): { [key: number]: string } {
  return {
    0: 'INIT',
    1: 'FETCH_PAGES',
    2: 'REDISTRIBUTE',
    3: 'AGGREGATE',
    4: 'ITERATE',
    5: 'CONVERGE',
    6: 'NORMALIZE',
    7: 'FINALIZE',
    8: 'COMPLETE'
  }
}