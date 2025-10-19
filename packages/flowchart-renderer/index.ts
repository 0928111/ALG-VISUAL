// 新的D3.js图渲染器
export { GraphRenderer, type GraphNode, type GraphLink, type GraphData, type RendererOptions } from './GraphRenderer'

// 单向带权图渲染器
export { DirectedWeightedGraphRenderer } from './DirectedWeightedGraphRenderer';

// 动画控制器
export * from './AnimationController'

// 增强动画控制器
export { EnhancedAnimationController } from './EnhancedAnimationController';
export { FailureProtectionRollbackManager } from './FailureProtectionRollbackManager';
// 增强动画控制器类型
export type {
  EnhancedAnimationFrame,
  EnhancedNodeAnimationState,
  EnhancedLinkAnimationState,
  EnhancedAnimationControllerOptions
} from './EnhancedAnimationController'

// 动态图渲染器
export * from './DynamicGraphRenderer'

// WebGL图可视化渲染器
export { ThreeGraphRenderer } from './ThreeGraphRenderer';
export type { ThreeRendererOptions } from './ThreeGraphRenderer';
export { ThreeForceSimulation, ThreeForceConfig } from './ThreeForceSimulation';
export { ThreePerformanceRenderer } from './ThreePerformanceRenderer';
export type { PerformanceOptions } from './ThreePerformanceRenderer';
export { WebGLGraphVisualization } from './WebGLGraphVisualization';
export { default as WebGLGraphDemo } from './WebGLGraphDemo';
export { default as WebGLIntegrationTest } from './WebGLIntegrationTest';

// WebGL兼容性检测
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function checkWebGL2Support(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return !!gl;
  } catch {
    return false;
  }
}

export function getBrowserCompatibilityInfo() {
  const webglSupported = checkWebGLSupport();
  const webgl2Supported = checkWebGL2Support();
  
  return {
    webgl: {
      supported: webglSupported,
      version: webgl2Supported ? 'WebGL 2.0' : webglSupported ? 'WebGL 1.0' : 'Not supported'
    },
    recommendations: !webglSupported ? [
      'WebGL is not supported in your browser',
      'Please use a modern browser like Chrome, Firefox, Safari, or Edge'
    ] : [
      'WebGL is supported',
      'Optimal performance expected'
    ]
  };
}