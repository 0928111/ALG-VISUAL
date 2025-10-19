/**
 * 代码到JSON转换组件的类型定义
 */

// 支持的编程语言类型
export type SupportedLanguage = 'python' | 'javascript' | 'java' | 'cpp';

// 节点类型
export type NodeType = 'function' | 'class' | 'variable' | 'statement' | 'module' | 'import';

// 边类型
export type EdgeType = 'calls' | 'inherits' | 'defines' | 'uses' | 'imports' | 'pagerank_sequence' | 'pagerank_uses' | 'pagerank_data_flow';

// 节点属性
export interface NodeProperties {
  code: string;
  line: number;
  file: string;
  [key: string]: any;
}

// 图节点
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: NodeProperties;
}

// 边属性
export interface EdgeProperties {
  code?: string;
  [key: string]: any;
}

// 图边
export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  properties?: EdgeProperties;
}

// 图结构
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// 元数据
export interface Metadata {
  language: SupportedLanguage;
  version: string;
  timestamp: string;
  [key: string]: any;
}

// 转换结果
export interface ConversionResult {
  metadata: Metadata;
  graph: Graph;
}

// 代码解析器接口
export interface CodeParser {
  parse(code: string, language: SupportedLanguage): Promise<ConversionResult>;
}

// 转换器配置
export interface ConverterConfig {
  includeLineNumbers?: boolean;
  includeSourceCode?: boolean;
  weightCalculation?: 'uniform' | 'frequency' | 'custom';
  customWeightFunction?: (edge: GraphEdge) => number;
}