import type { AppDispatch } from '../../store';
import { setGraph, setLoading, setError } from '../../store/graphDataSlice';
import type { GraphData, GraphNode, GraphEdge } from '../../store/graphDataSlice';

/**
 * 加载图数据文件
 * @param dispatch Redux dispatch 函数
 * @param url 图数据文件的 URL 路径，默认为 '/data/pagerank-graph-data.json'
 * @returns Promise<GraphData> 解析后的图数据对象
 * @throws 如果数据文件存在节点 ID 不唯一或边引用的节点不存在等问题
 */
export async function loadGraphData(
  dispatch: AppDispatch,
  url: string = '/data/pagerank-graph-data.json'
): Promise<GraphData> {
  dispatch(setLoading(true));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GraphData = await response.json();

    // 验证基本结构
    if (!data?.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid graph data: missing or invalid "nodes" array');
    }

    if (!data?.edges || !Array.isArray(data.edges)) {
      throw new Error('Invalid graph data: missing or invalid "edges" array');
    }

    // 验证节点 ID 唯一性
    const nodeIds = new Set<string>();
    for (const node of data.nodes) {
      if (!node.id || typeof node.id !== 'string') {
        throw new Error('Invalid graph data: node missing or invalid "id" field');
      }
      if (nodeIds.has(node.id)) {
        throw new Error(`Invalid graph data: duplicate node ID "${node.id}"`);
      }
      nodeIds.add(node.id);

      // 验证必需字段
      if (typeof node.label !== 'string') {
        throw new Error(`Invalid graph data: node "${node.id}" missing or invalid "label" field`);
      }
      if (typeof node.rank !== 'number') {
        throw new Error(`Invalid graph data: node "${node.id}" missing or invalid "rank" field`);
      }
    }

    // 验证边引用的节点存在
    for (const edge of data.edges) {
      if (!edge.id || typeof edge.id !== 'string') {
        throw new Error('Invalid graph data: edge missing or invalid "id" field');
      }
      if (!edge.source || !nodeIds.has(edge.source)) {
        throw new Error(`Invalid graph data: edge "${edge.id}" references unknown source node "${edge.source}"`);
      }
      if (!edge.target || !nodeIds.has(edge.target)) {
        throw new Error(`Invalid graph data: edge "${edge.id}" references unknown target node "${edge.target}"`);
      }
      if (typeof edge.weight !== 'number') {
        throw new Error(`Invalid graph data: edge "${edge.id}" missing or invalid "weight" field`);
      }
    }

    // 可选：边权重归一化处理
    if (data.edges.length > 0) {
      const weights = data.edges.map((e: GraphEdge) => e.weight);
      const maxWeight = Math.max(...weights);
      const minWeight = Math.min(...weights);

      // 如果权重范围过大，进行归一化
      if (maxWeight > 100 || minWeight < 0) {
        console.warn('⚠️ Edge weights are out of recommended range [0, 100], consider normalization');
      }
    }

    // 应用初始位置（如果提供）
    if (data.initialPositions) {
      data.nodes = data.nodes.map((node: GraphNode) => {
        const pos = data.initialPositions?.[node.id];
        return pos ? { ...node, x: pos.x, y: pos.y } : node;
      });
    }

    // 派发成功 action
    dispatch(setGraph(data));

    console.log('✅ Graph data loaded successfully:', {
      nodes: data.nodes.length,
      edges: data.edges.length,
      hasInitialPositions: !!data.initialPositions
    });

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load graph data';
    console.error('❌ Error loading graph data:', errorMessage);
    dispatch(setError(errorMessage));
    throw error;
  }
}

/**
 * 归一化边权重到指定范围
 * @param data 图数据
 * @param min 最小值，默认 0
 * @param max 最大值，默认 1
 * @returns 归一化后的图数据
 */
export function normalizeEdgeWeights(
  data: GraphData,
  min: number = 0,
  max: number = 1
): GraphData {
  if (data.edges.length === 0) return data;

  const weights = data.edges.map((e: GraphEdge) => e.weight);
  const currentMin = Math.min(...weights);
  const currentMax = Math.max(...weights);

  if (currentMin === currentMax) {
    // 所有权重相同，设置为中间值
    const midValue = (min + max) / 2;
    return {
      ...data,
      edges: data.edges.map((e: GraphEdge) => ({ ...e, weight: midValue }))
    };
  }

  // 线性归一化
  return {
    ...data,
    edges: data.edges.map((e: GraphEdge) => ({
      ...e,
      weight: min + ((e.weight - currentMin) / (currentMax - currentMin)) * (max - min)
    }))
  };
}
