import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PageRankNode {
  id: string
  name: string
  value: number
  prevValue: number
}

interface UIHints {
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

interface SimulatorState {
  step: number
  prValues: PageRankNode[]
  isPlaying: boolean
  speed: number
  totalSteps: number
  highlightedNode: string | null
  uiHints?: UIHints // 新增：用于图可视化的UI提示
  nodes: PageRankNode[] // 新增：兼容新的数据结构
}

const initialState: SimulatorState = {
  step: 0,
  prValues: [
    { id: 'A', name: '网页A', value: 0.25, prevValue: 0.25 },
    { id: 'B', name: '网页B', value: 0.25, prevValue: 0.25 },
    { id: 'C', name: '网页C', value: 0.25, prevValue: 0.25 },
    { id: 'D', name: '网页D', value: 0.25, prevValue: 0.25 }
  ],
  nodes: [
    { id: 'A', name: '网页A', value: 0.25, prevValue: 0.25 },
    { id: 'B', name: '网页B', value: 0.25, prevValue: 0.25 },
    { id: 'C', name: '网页C', value: 0.25, prevValue: 0.25 },
    { id: 'D', name: '网页D', value: 0.25, prevValue: 0.25 }
  ],
  isPlaying: false,
  speed: 1,
  totalSteps: 8,
  highlightedNode: null,
  uiHints: {
    highlights: ['A', 'B', 'C', 'D'],
    activeEdges: []
  }
}

const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.step < state.totalSteps) {
        state.step += 1
        // 模拟PageRank算法的一步迭代
        updatePageRankValues(state)
      }
      // 检查是否到达最后一步，如果是则自动停止播放
      if (state.step >= state.totalSteps) {
        state.isPlaying = false
      }
    },
    prevStep: (state) => {
      if (state.step > 0) {
        state.step -= 1
        updatePageRankValues(state)
      }
    },
    reset: (state) => {
      state.step = 0
      state.isPlaying = false
      state.highlightedNode = null
      state.prValues = [
        { id: 'A', name: '网页A', value: 0.25, prevValue: 0.25 },
        { id: 'B', name: '网页B', value: 0.25, prevValue: 0.25 },
        { id: 'C', name: '网页C', value: 0.25, prevValue: 0.25 },
        { id: 'D', name: '网页D', value: 0.25, prevValue: 0.25 }
      ]
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload
    },
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload
      updatePageRankValues(state)
    },
    highlightNode: (state, action: PayloadAction<string>) => {
      state.highlightedNode = action.payload
    },
    clearHighlight: (state) => {
      state.highlightedNode = null
    }
  }
})

// 模拟PageRank算法更新
function updatePageRankValues(state: SimulatorState) {
  const step = state.step
  
  // 保存之前的值用于动画
  state.prValues.forEach(node => {
    node.prevValue = node.value
  })
  state.nodes.forEach(node => {
    node.prevValue = node.value
  })
  
  // 初始化UIHints
  state.uiHints = {
    highlights: [],
    activeEdges: [],
    redistribute: {}
  }
  
  // 根据步骤更新PageRank值（模拟算法过程）
  switch (step) {
    case 1:
      state.prValues[0].value = 0.35  // A增加
      state.prValues[1].value = 0.20  // B减少
      state.prValues[2].value = 0.25  // C不变
      state.prValues[3].value = 0.20  // D减少
      
      state.nodes[0].value = 0.35
      state.nodes[1].value = 0.20
      state.nodes[2].value = 0.25
      state.nodes[3].value = 0.20
      
      // 设置可视化提示
      state.uiHints.highlights = ['A', 'B', 'D']
      state.uiHints.redistribute = {
        'A': { from: 'B', value: 0.15, progress: 0.5 },
        'D': { from: 'B', value: 0.05, progress: 0.3 }
      }
      state.uiHints.activeEdges = [
        { source: 'B', target: 'A', weight: 0.15 },
        { source: 'B', target: 'D', weight: 0.05 }
      ]
      break
    case 2:
      state.prValues[0].value = 0.30
      state.prValues[1].value = 0.25
      state.prValues[2].value = 0.20
      state.prValues[3].value = 0.25
      
      state.nodes[0].value = 0.30
      state.nodes[1].value = 0.25
      state.nodes[2].value = 0.20
      state.nodes[3].value = 0.25
      
      state.uiHints.highlights = ['A', 'C']
      state.uiHints.redistribute = {
        'C': { from: 'A', value: 0.05, progress: 0.7 }
      }
      state.uiHints.activeEdges = [
        { source: 'A', target: 'C', weight: 0.05 }
      ]
      break
    case 3:
      state.prValues[0].value = 0.25
      state.prValues[1].value = 0.30
      state.prValues[2].value = 0.20
      state.prValues[3].value = 0.25
      
      state.nodes[0].value = 0.25
      state.nodes[1].value = 0.30
      state.nodes[2].value = 0.20
      state.nodes[3].value = 0.25
      
      state.uiHints.highlights = ['B', 'A']
      state.uiHints.redistribute = {
        'B': { from: 'A', value: 0.05, progress: 0.4 }
      }
      state.uiHints.activeEdges = [
        { source: 'A', target: 'B', weight: 0.05 }
      ]
      break
    case 4:
      state.prValues[0].value = 0.20
      state.prValues[1].value = 0.25
      state.prValues[2].value = 0.30
      state.prValues[3].value = 0.25
      
      state.nodes[0].value = 0.20
      state.nodes[1].value = 0.25
      state.nodes[2].value = 0.30
      state.nodes[3].value = 0.25
      
      state.uiHints.highlights = ['C', 'A', 'B']
      state.uiHints.redistribute = {
        'C': { from: 'A,B', value: 0.10, progress: 0.7 }
      }
      state.uiHints.activeEdges = [
        { source: 'A', target: 'C', weight: 0.05 },
        { source: 'B', target: 'C', weight: 0.05 }
      ]
      break
    case 5:
      state.prValues[0].value = 0.22
      state.prValues[1].value = 0.23
      state.prValues[2].value = 0.27
      state.prValues[3].value = 0.28
      
      state.nodes[0].value = 0.22
      state.nodes[1].value = 0.23
      state.nodes[2].value = 0.27
      state.nodes[3].value = 0.28
      
      state.uiHints.highlights = ['D', 'C']
      state.uiHints.redistribute = {
        'D': { from: 'C', value: 0.02, progress: 0.5 }
      }
      state.uiHints.activeEdges = [
        { source: 'C', target: 'D', weight: 0.02 }
      ]
      break
    case 6:
      state.prValues[0].value = 0.21
      state.prValues[1].value = 0.24
      state.prValues[2].value = 0.26
      state.prValues[3].value = 0.29
      
      state.nodes[0].value = 0.21
      state.nodes[1].value = 0.24
      state.nodes[2].value = 0.26
      state.nodes[3].value = 0.29
      
      state.uiHints.highlights = ['D']
      state.uiHints.activeEdges = []
      break
    case 7:
      state.prValues[0].value = 0.205
      state.prValues[1].value = 0.245
      state.prValues[2].value = 0.255
      state.prValues[3].value = 0.295
      
      state.nodes[0].value = 0.205
      state.nodes[1].value = 0.245
      state.nodes[2].value = 0.255
      state.nodes[3].value = 0.295
      
      state.uiHints.highlights = ['A', 'B', 'C', 'D']
      state.uiHints.activeEdges = []
      break
    case 8:
      state.prValues[0].value = 0.20
      state.prValues[1].value = 0.25
      state.prValues[2].value = 0.25
      state.prValues[3].value = 0.30
      
      state.nodes[0].value = 0.20
      state.nodes[1].value = 0.25
      state.nodes[2].value = 0.25
      state.nodes[3].value = 0.30
      
      state.uiHints.highlights = ['D']
      state.uiHints.activeEdges = []
      break
    default:
      // 初始状态
      state.prValues.forEach(node => {
        node.value = 0.25
        node.prevValue = 0.25
      })
      state.nodes.forEach(node => {
        node.value = 0.25
        node.prevValue = 0.25
      })
      state.uiHints.highlights = ['A', 'B', 'C', 'D']
  }
}

export const {
  nextStep,
  prevStep,
  reset,
  setPlaying,
  setSpeed,
  setStep,
  highlightNode,
  clearHighlight
} = simulatorSlice.actions

export default simulatorSlice.reducer