import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// 图数据类型定义
export interface GraphNode {
  id: string;
  label: string;
  rank: number;
  x?: number;
  y?: number;
  isActive?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  isActive?: boolean;
}

export interface GraphData {
  version?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  initialPositions?: Record<string, { x: number; y: number }>;
}

interface GraphDataState {
  data: GraphData | null;
  loading: boolean;
  error: string | null;
}

const initialState: GraphDataState = {
  data: null,
  loading: false,
  error: null
};

const graphDataSlice = createSlice({
  name: 'graphData',
  initialState,
  reducers: {
    setGraph: (state, action: PayloadAction<GraphData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateNodeRanks: (state, action: PayloadAction<Record<string, number>>) => {
      if (state.data) {
        state.data.nodes = state.data.nodes.map(node => ({
          ...node,
          rank: action.payload[node.id] !== undefined ? action.payload[node.id] : node.rank
        }));
      }
    },
    updateEdgeWeights: (state, action: PayloadAction<Record<string, number>>) => {
      if (state.data) {
        state.data.edges = state.data.edges.map(edge => ({
          ...edge,
          weight: action.payload[edge.id] !== undefined ? action.payload[edge.id] : edge.weight
        }));
      }
    },
    setActiveEdges: (state, action: PayloadAction<string[]>) => {
      if (state.data) {
        state.data.edges = state.data.edges.map(edge => ({
          ...edge,
          isActive: action.payload.indexOf(edge.id) !== -1
        }));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearGraph: (state) => {
      state.data = null;
      state.error = null;
    }
  }
});

export const {
  setGraph,
  updateNodeRanks,
  updateEdgeWeights,
  setActiveEdges,
  setLoading,
  setError,
  clearGraph
} = graphDataSlice.actions;

// 选择器
export const selectGraph = (state: RootState) => state.graphData?.data || null;
export const selectGraphLoading = (state: RootState) => state.graphData?.loading || false;
export const selectGraphError = (state: RootState) => state.graphData?.error || null;

export default graphDataSlice.reducer;
