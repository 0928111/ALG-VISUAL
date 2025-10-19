import type { AppDispatch } from '../../store';
import { setSpec, setLoading, setError } from '../../store/graphSpecSlice';
import type { GraphSpec } from '../../store/graphSpecSlice';

/**
 * 加载图形规范配置文件
 * @param dispatch Redux dispatch 函数
 * @param url 规范文件的 URL 路径，默认为 '/data/directed-weighted-graph.spec.json'
 * @returns Promise<GraphSpec> 解析后的规范对象
 * @throws 如果规范文件不符合基本 schema（缺少 palette 或 edge 字段）
 */
export async function loadGraphSpec(
  dispatch: AppDispatch,
  url: string = '/data/directed-weighted-graph.spec.json'
): Promise<GraphSpec> {
  dispatch(setLoading(true));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const spec: GraphSpec = await response.json();

    // 基本 schema 校验
    if (!spec?.palette) {
      throw new Error('Invalid graph spec: missing "palette" field');
    }

    if (!spec?.edge) {
      throw new Error('Invalid graph spec: missing "edge" field');
    }

    // 验证必需的 palette 字段
    const requiredPaletteFields = ['nodeFill', 'nodeStroke', 'edgeOut', 'edgeIn', 'weightText', 'background'];
    for (const field of requiredPaletteFields) {
      if (!(field in spec.palette)) {
        throw new Error(`Invalid graph spec: palette missing required field "${field}"`);
      }
    }

    // 验证必需的 edge 字段
    if (typeof spec.edge.dualChannel !== 'boolean') {
      throw new Error('Invalid graph spec: edge.dualChannel must be a boolean');
    }

    if (!spec.edge.strokeWidth || typeof spec.edge.strokeWidth.min !== 'number' || typeof spec.edge.strokeWidth.max !== 'number') {
      throw new Error('Invalid graph spec: edge.strokeWidth must have min and max properties');
    }

    // 验证 node 字段
    if (!spec?.node || !spec.node.radius || typeof spec.node.radius.min !== 'number' || typeof spec.node.radius.max !== 'number') {
      throw new Error('Invalid graph spec: node.radius must have min and max properties');
    }

    // 派发成功 action
    dispatch(setSpec(spec));

    console.log('✅ Graph spec loaded successfully:', spec);

    return spec;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load graph spec';
    console.error('❌ Error loading graph spec:', errorMessage);
    dispatch(setError(errorMessage));
    throw error;
  }
}
