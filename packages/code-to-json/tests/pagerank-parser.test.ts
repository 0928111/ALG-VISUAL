import { PageRankParser } from '../pagerank-parser';
import { ConversionResult, ConverterConfig } from '../types';

describe('PageRankParser', () => {
  let parser: PageRankParser;
  let config: ConverterConfig;

  beforeEach(() => {
    config = {};
    parser = new PageRankParser(config);
  });

  test('应该正确解析PageRank算法的类定义', async () => {
    const code = `
class PageRankVisualizer:
    def __init__(self, graph, damping_factor=0.85):
        self.graph = graph
        self.damping_factor = damping_factor
        self.pagerank = {}
`;

    const result = await parser.parse(code, 'python');
    
    // 验证类节点
    const classNodes = result.graph.nodes.filter(node => node.type === 'class');
    expect(classNodes).toHaveLength(1);
    expect(classNodes[0].label).toBe('PageRankVisualizer');
    expect(classNodes[0].properties.methods).toContain('__init__');
  });

  test('应该正确识别PageRank算法的关键步骤函数', async () => {
    const code = `
def initialize_pagerank():
    pagerank = {}
    for node in graph:
        pagerank[node] = 1.0 / len(graph)
    return pagerank

def calculate_outgoing_probabilities():
    # 计算出度概率
    pass

def iterate_pagerank():
    # 迭代计算PageRank
    pass

def rank_nodes():
    # 对节点进行排名
    pass

def main():
    initialize_pagerank()
    calculate_outgoing_probabilities()
    iterate_pagerank()
    rank_nodes()
`;

    const result = await parser.parse(code, 'python');
    
    // 验证PageRank步骤函数
    const stepFunctions = result.graph.nodes.filter(node => 
      node.type === 'function' && node.properties.isPageRankStep
    );
    
    expect(stepFunctions).toHaveLength(5);
    
    // 验证步骤顺序
    const sortedSteps = stepFunctions.sort((a, b) => a.properties.stepOrder - b.properties.stepOrder);
    expect(sortedSteps[0].label).toBe('initialize_pagerank');
    expect(sortedSteps[1].label).toBe('calculate_outgoing_probabilities');
    expect(sortedSteps[2].label).toBe('iterate_pagerank');
    expect(sortedSteps[3].label).toBe('rank_nodes');
    expect(sortedSteps[4].label).toBe('main');
  });

  test('应该正确识别PageRank算法的数据变量', async () => {
    const code = `
pagerank = {}
adjacency_matrix = [[0, 1, 0], [0, 0, 1], [1, 0, 0]]
transition_matrix = [[0, 0.5, 0.5], [0, 0, 1], [1, 0, 0]]
damping_factor = 0.85
num_nodes = 3
tolerance = 1e-6
`;

    const result = await parser.parse(code, 'python');
    
    // 验证PageRank数据变量
    const dataVariables = result.graph.nodes.filter(node => 
      node.type === 'variable' && node.properties.isPageRankData
    );
    
    expect(dataVariables.length).toBeGreaterThan(0);
    
    const variableNames = dataVariables.map(v => v.label);
    expect(variableNames).toContain('pagerank');
    expect(variableNames).toContain('adjacency_matrix');
    expect(variableNames).toContain('transition_matrix');
    expect(variableNames).toContain('damping_factor');
  });

  test('应该正确创建PageRank算法步骤之间的顺序关系', async () => {
    const code = `
def initialize_pagerank():
    return {}

def calculate_outgoing_probabilities():
    return {}

def iterate_pagerank():
    return {}

def rank_nodes():
    return {}

def main():
    initialize_pagerank()
    calculate_outgoing_probabilities()
    iterate_pagerank()
    rank_nodes()
`;

    const result = await parser.parse(code, 'python');
    
    // 验证PageRank步骤顺序边
    const sequenceEdges = result.graph.edges.filter(edge => edge.type === 'pagerank_sequence');
    expect(sequenceEdges).toHaveLength(4);
    
    // 验证边的顺序
    const stepFunctions = result.graph.nodes
      .filter(node => node.type === 'function' && node.properties.isPageRankStep)
      .sort((a, b) => a.properties.stepOrder - b.properties.stepOrder);
    
    for (let i = 0; i < sequenceEdges.length; i++) {
      const edge = sequenceEdges[i];
      const expectedSource = stepFunctions[i].id;
      const expectedTarget = stepFunctions[i + 1].id;
      
      expect(edge.source).toBe(expectedSource);
      expect(edge.target).toBe(expectedTarget);
      expect(edge.weight).toBe(2.0);
    }
  });

  test('应该正确创建变量与使用它们的函数之间的关系', async () => {
    const code = `
pagerank = {}
def initialize_pagerank():
    global pagerank
    pagerank = {}
    return pagerank

def use_pagerank():
    return pagerank
`;

    const result = await parser.parse(code, 'python');
    
    // 验证变量与函数之间的关系
    const useEdges = result.graph.edges.filter(edge => edge.type === 'uses');
    expect(useEdges.length).toBeGreaterThan(0);
    
    const pagerankVar = result.graph.nodes.find(node => 
      node.type === 'variable' && node.label === 'pagerank'
    );
    
    const usingFunctions = result.graph.nodes.filter(node => 
      node.type === 'function' && (node.label === 'initialize_pagerank' || node.label === 'use_pagerank')
    );
    
    for (const func of usingFunctions) {
      const edge = useEdges.find(e => e.source === pagerankVar.id && e.target === func.id);
      expect(edge).toBeDefined();
      expect(edge.weight).toBe(1.5);
    }
  });

  test('应该正确处理函数调用关系', async () => {
    const code = `
def initialize_pagerank():
    return {}

def calculate_outgoing_probabilities():
    return {}

def iterate_pagerank():
    initialize_pagerank()
    calculate_outgoing_probabilities()
    return {}

def main():
    iterate_pagerank()
`;

    const result = await parser.parse(code, 'python');
    
    // 验证函数调用关系
    const callEdges = result.graph.edges.filter(edge => edge.type === 'calls');
    expect(callEdges.length).toBeGreaterThan(0);
    
    // 验证iterate_pagerank调用initialize_pagerank和calculate_outgoing_probabilities
    const iterateFunc = result.graph.nodes.find(node => node.label === 'iterate_pagerank');
    const initFunc = result.graph.nodes.find(node => node.label === 'initialize_pagerank');
    const calcFunc = result.graph.nodes.find(node => node.label === 'calculate_outgoing_probabilities');
    
    expect(iterateFunc).toBeDefined();
    expect(initFunc).toBeDefined();
    expect(calcFunc).toBeDefined();
    
    const iterateToInitEdge = callEdges.find(e => 
      e.source === iterateFunc.id && e.target === initFunc.id
    );
    const iterateToCalcEdge = callEdges.find(e => 
      e.source === iterateFunc.id && e.target === calcFunc.id
    );
    
    expect(iterateToInitEdge).toBeDefined();
    expect(iterateToCalcEdge).toBeDefined();
  });

  test('应该正确设置元数据', async () => {
    const code = `
def pagerank_function():
    pass
`;

    const result = await parser.parse(code, 'python');
    
    // 验证元数据
    expect(result.metadata.language).toBe('python');
    expect(result.metadata.version).toBe('1.0');
    expect(result.metadata.algorithm).toBe('pagerank');
    expect(result.metadata.timestamp).toBeDefined();
  });

  test('应该抛出错误当语言不是Python时', async () => {
    const code = `
function pagerankFunction() {
    return {};
}
`;

    await expect(parser.parse(code, 'javascript')).rejects.toThrow(
      'PageRank解析器仅支持Python语言，不支持: javascript'
    );
  });
});