import { 
  SupportedLanguage, 
  ConversionResult, 
  ConverterConfig, 
  CodeParser,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType
} from './types';
import { PageRankParser } from './pagerank-parser';

/**
 * 代码到JSON转换器主类
 */
export class CodeToJSONConverter {
  private parsers: Map<SupportedLanguage, CodeParser> = new Map();
  private pageRankParser: PageRankParser;
  private config: ConverterConfig;

  constructor(config: ConverterConfig = {}) {
    this.config = {
      includeLineNumbers: true,
      includeSourceCode: true,
      weightCalculation: 'uniform',
      ...config
    };
    this.pageRankParser = new PageRankParser(config);
    this.initializeParsers();
  }

  /**
   * 初始化解析器
   */
  private initializeParsers(): void {
    // 注册Python解析器
    this.parsers.set('python', new PythonParser(this.config));
    
    // 未来可以添加更多语言的解析器
    // this.parsers.set('javascript', new JavaScriptParser(this.config));
    // this.parsers.set('java', new JavaParser(this.config));
    // this.parsers.set('cpp', new CppParser(this.config));
  }

  /**
   * 将代码转换为JSON格式
   */
  async convertToJSON(code: string, language: SupportedLanguage, usePageRankParser = false): Promise<ConversionResult> {
    if (usePageRankParser && language === 'python') {
      return this.pageRankParser.parse(code, language);
    }
    
    const parser = this.parsers.get(language);
    if (!parser) {
      throw new Error(`不支持的语言: ${language}`);
    }
    
    return parser.parse(code, language);
  }

  /**
   * 注册新的解析器
   */
  registerParser(language: SupportedLanguage, parser: CodeParser): void {
    this.parsers.set(language, parser);
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return Array.from(this.parsers.keys());
  }
}

/**
 * Python代码解析器
 */
class PythonParser implements CodeParser {
  private config: ConverterConfig;

  constructor(config: ConverterConfig) {
    this.config = config;
  }

  async parse(code: string, language: SupportedLanguage): Promise<ConversionResult> {
    const lines = code.split('\n');
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const idMap = new Map<string, string>();
    
    // 简单的Python代码解析逻辑
    // 在实际应用中，这里应该使用更复杂的解析器，如Python AST
    let nodeIdCounter = 0;
    
    // 解析函数定义
    const functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\):/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      const params = match[2];
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      const nodeId = `func_${nodeIdCounter++}`;
      idMap.set(functionName, nodeId);
      
      nodes.push({
        id: nodeId,
        type: 'function',
        label: functionName,
        properties: {
          code: match[0],
          line: lineNumber,
          file: 'unknown',
          params: params.split(',').map(p => p.trim()).filter(p => p)
        }
      });
    }
    
    // 解析类定义
    const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(\([^)]*\))?:/g;
    
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      const inheritance = match[2] || '';
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      const nodeId = `class_${nodeIdCounter++}`;
      idMap.set(className, nodeId);
      
      nodes.push({
        id: nodeId,
        type: 'class',
        label: className,
        properties: {
          code: match[0],
          line: lineNumber,
          file: 'unknown',
          inheritance: inheritance.replace(/[()]/g, '').split(',').map(c => c.trim()).filter(c => c)
        }
      });
    }
    
    // 解析变量赋值
    const variableRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)/g;
    
    while ((match = variableRegex.exec(code)) !== null) {
      const varName = match[1];
      const value = match[2];
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      const nodeId = `var_${nodeIdCounter++}`;
      idMap.set(varName, nodeId);
      
      nodes.push({
        id: nodeId,
        type: 'variable',
        label: varName,
        properties: {
          code: match[0],
          line: lineNumber,
          file: 'unknown',
          value: value
        }
      });
    }
    
    // 解析函数调用关系
    const callRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const processedCalls = new Set<string>();
    
    while ((match = callRegex.exec(code)) !== null) {
      const callerFunction = this.getContainingFunction(code, match.index);
      const calledFunction = match[1];
      
      if (callerFunction && calledFunction && idMap.has(callerFunction) && idMap.has(calledFunction)) {
        const callKey = `${callerFunction}-${calledFunction}`;
        
        if (!processedCalls.has(callKey)) {
          processedCalls.add(callKey);
          
          edges.push({
            source: idMap.get(callerFunction)!,
            target: idMap.get(calledFunction)!,
            type: 'calls',
            weight: this.calculateWeight(edges),
            properties: {
              code: match[0]
            }
          });
        }
      }
    }
    
    // 解析继承关系
    nodes.filter(node => node.type === 'class').forEach(classNode => {
      const inheritance = classNode.properties.inheritance || [];
      
      inheritance.forEach((parentClass: string) => {
        if (idMap.has(parentClass)) {
          edges.push({
            source: idMap.get(parentClass)!,
            target: classNode.id,
            type: 'inherits',
            weight: this.calculateWeight(edges),
            properties: {}
          });
        }
      });
    });
    
    return {
      metadata: {
        language,
        version: '1.0',
        timestamp: new Date().toISOString()
      },
      graph: {
        nodes,
        edges
      }
    };
  }

  /**
   * 获取包含指定位置的函数名
   */
  private getContainingFunction(code: string, position: number): string | null {
    const beforePosition = code.substring(0, position);
    const lines = beforePosition.split('\n');
    
    // 从当前位置向上查找函数定义
    for (let i = lines.length - 1; i >= 0; i--) {
      const functionMatch = lines[i].match(/^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (functionMatch) {
        return functionMatch[1];
      }
    }
    
    return null;
  }

  /**
   * 计算边的权重
   */
  private calculateWeight(edges: GraphEdge[]): number {
    if (this.config.weightCalculation === 'uniform') {
      return 1.0;
    } else if (this.config.weightCalculation === 'frequency') {
      // 简单的频率计算：相同类型的边越多，权重越低
      const sameTypeEdges = edges.filter(e => e.type === 'calls').length;
      return Math.max(0.1, 1.0 - (sameTypeEdges * 0.1));
    } else if (this.config.weightCalculation === 'custom' && this.config.customWeightFunction) {
      return this.config.customWeightFunction(edges[edges.length - 1]);
    }
    
    return 1.0;
  }
}