import { CodeToJSONConverter } from './code-to-json-converter';
import { ConversionResult, ConverterConfig } from './types';

/**
 * 创建转换器实例
 */
export function createConverter(config?: ConverterConfig): CodeToJSONConverter {
  return new CodeToJSONConverter(config);
}

/**
 * 验证转换结果的结构
 */
export function validateConversionResult(result: ConversionResult): boolean {
  if (!result.metadata || !result.graph) {
    return false;
  }
  
  if (!result.metadata.language || !result.metadata.timestamp) {
    return false;
  }
  
  if (!Array.isArray(result.graph.nodes) || !Array.isArray(result.graph.edges)) {
    return false;
  }
  
  // 验证节点结构
  for (const node of result.graph.nodes) {
    if (!node.id || !node.type || !node.label) {
      return false;
    }
  }
  
  // 验证边结构
  for (const edge of result.graph.edges) {
    if (!edge.source || !edge.target || !edge.type) {
      return false;
    }
  }
  
  return true;
}

/**
 * 保存JSON结果到文件（跨环境）
 */
export function saveAsJSON(result: ConversionResult, filename: string): void {
  const jsonString = JSON.stringify(result, null, 2);
  
  if (typeof window !== 'undefined' && window.document) {
    // 浏览器环境
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else if (typeof require !== 'undefined') {
    // Node.js环境
    const fs = require('fs');
    fs.writeFileSync(filename, jsonString, 'utf8');
  } else {
    throw new Error('无法确定当前环境，无法保存文件');
  }
}

/**
 * 将Python代码转换为PageRank专用的JSON格式
 */
export async function convertPythonPageRankCode(code: string, config?: ConverterConfig): Promise<ConversionResult> {
  const converter = createConverter(config);
  return converter.convertToJSON(code, 'python', true);
}

/**
 * 将Python代码转换为图渲染器期望的JSON格式
 */
export async function convertPythonToGraphRendererFormat(code: string): Promise<any> {
  // 首先使用现有的转换器获取代码结构
  const converter = createConverter();
  const conversionResult = await converter.convertToJSON(code, 'python', true);
  
  // 提取PageRank相关的节点和边
  const nodes: any[] = [];
  const edges: any[] = [];
  const initialPositions: any = {};
  
  // 处理节点
  let nodeIdCounter = 0;
  const nodeIdMap: { [key: string]: string } = {};
  
  // 优先处理PageRank数据变量作为图节点
  const pageRankDataNodes = conversionResult.graph.nodes.filter(node => 
    node.type === 'variable' && node.properties.isPageRankData
  );
  
  for (const node of pageRankDataNodes) {
    const nodeId = String.fromCharCode(65 + nodeIdCounter++); // A, B, C, D...
    nodeIdMap[node.id] = nodeId;
    
    // 随机位置或使用默认位置
    const x = 200 + (nodeIdCounter * 150) % 600;
    const y = 150 + Math.floor(nodeIdCounter / 4) * 200;
    
    nodes.push({
      id: nodeId,
      label: node.label,
      rank: 25, // 默认PageRank值
      x: x,
      y: y
    });
    
    initialPositions[nodeId] = { x, y };
  }
  
  // 如果没有找到PageRank数据变量，使用函数节点
  if (nodes.length === 0) {
    const pageRankFunctionNodes = conversionResult.graph.nodes.filter(node => 
      node.type === 'function' && node.properties.isPageRankStep
    );
    
    for (const node of pageRankFunctionNodes) {
      const nodeId = String.fromCharCode(65 + nodeIdCounter++); // A, B, C, D...
      nodeIdMap[node.id] = nodeId;
      
      // 随机位置或使用默认位置
      const x = 200 + (nodeIdCounter * 150) % 600;
      const y = 150 + Math.floor(nodeIdCounter / 4) * 200;
      
      nodes.push({
        id: nodeId,
        label: node.label,
        rank: 25, // 默认PageRank值
        x: x,
        y: y
      });
      
      initialPositions[nodeId] = { x, y };
    }
  }
  
  // 如果仍然没有节点，创建默认节点
  if (nodes.length === 0) {
    const defaultNodes = ['A', 'B', 'C', 'D'];
    for (const label of defaultNodes) {
      const x = 200 + (nodes.length * 150) % 600;
      const y = 150 + Math.floor(nodes.length / 4) * 200;
      
      nodes.push({
        id: label,
        label: `网页 ${label}`,
        rank: 25, // 默认PageRank值
        x: x,
        y: y
      });
      
      initialPositions[label] = { x, y };
    }
  }
  
  // 处理边 - 基于PageRank数据流或使用关系
  const pageRankEdges = conversionResult.graph.edges.filter(edge => 
    edge.type === 'pagerank_data_flow' || edge.type === 'pagerank_uses'
  );
  
  for (const edge of pageRankEdges) {
    const sourceId = nodeIdMap[edge.source];
    const targetId = nodeIdMap[edge.target];
    
    if (sourceId && targetId) {
      edges.push({
        id: `${sourceId}->${targetId}`,
        source: sourceId,
        target: targetId,
        weight: edge.weight || 10
      });
    }
  }
  
  // 如果没有PageRank边，创建默认边
  if (edges.length === 0 && nodes.length >= 2) {
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `${nodes[i].id}->${nodes[i+1].id}`,
        source: nodes[i].id,
        target: nodes[i+1].id,
        weight: 10
      });
    }
  }
  
  // 返回图渲染器期望的格式
  return {
    version: "1.0.0",
    nodes: nodes,
    edges: edges,
    initialPositions: initialPositions
  };
}

/**
 * 从文件加载Python代码并转换为图渲染器格式
 */
export async function convertPythonFileToGraphRendererFormat(filePath: string): Promise<any> {
  let code: string;
  
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    // 浏览器环境
    const response = await fetch(filePath);
    code = await response.text();
  } else if (typeof require !== 'undefined') {
    // Node.js环境
    const fs = require('fs');
    code = fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error('无法确定当前环境，无法读取文件');
  }
  
  return convertPythonToGraphRendererFormat(code);
}