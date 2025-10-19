import { 
  SupportedLanguage, 
  ConversionResult, 
  ConverterConfig, 
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType
} from './types';

/**
 * PageRank算法专用解析器
 * 专门用于解析PageRank算法代码并生成适合可视化的JSON数据
 */
export class PageRankParser {
  private config: ConverterConfig;

  constructor(config: ConverterConfig) {
    this.config = config;
  }

  async parse(code: string, language: SupportedLanguage): Promise<ConversionResult> {
    if (language !== 'python') {
      throw new Error(`PageRank解析器仅支持Python语言，不支持: ${language}`);
    }
    
    const lines = code.split('\n');
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const idMap = new Map<string, string>();
    
    // 🎯 数据验证：确保权重值在0-1标准化范围内
    const validateWeight = (weight: number): number => {
      if (weight < 0 || weight > 1) {
        console.warn(`⚠️ 权重值 ${weight} 超出0-1范围，将标准化到0-1范围内`);
        return Math.max(0, Math.min(1, weight));
      }
      return weight;
    };
    
    // 解析PageRank算法的关键组件
    const classMatches = this.extractClasses(code);
    const functionMatches = this.extractFunctions(code);
    const variableMatches = this.extractVariables(code);
    
    // 创建节点ID计数器
    let nodeIdCounter = 0;
    
    // 处理类定义
    for (const match of classMatches) {
      const className = match.name;
      const lineNumber = match.lineNumber;
      
      const nodeId = `class_${nodeIdCounter++}`;
      idMap.set(className, nodeId);
      
      nodes.push({
        id: nodeId,
        type: 'class',
        label: className,
        properties: {
          code: match.code,
          line: lineNumber,
          file: 'unknown',
          methods: match.methods || []
        }
      });
    }
    
    // 处理函数定义
    for (const match of functionMatches) {
      const functionName = match.name;
      const lineNumber = match.lineNumber;
      
      const nodeId = `func_${nodeIdCounter++}`;
      idMap.set(functionName, nodeId);
      
      nodes.push({
        id: nodeId,
        type: 'function',
        label: functionName,
        properties: {
          code: match.code,
          line: lineNumber,
          file: 'unknown',
          params: match.params || [],
          isPageRankStep: this.isPageRankStep(functionName),
          stepOrder: this.getPageRankStepOrder(functionName)
        }
      });
    }
    
    // 处理变量定义
    for (const match of variableMatches) {
      const varName = match.name;
      const lineNumber = match.lineNumber;
      
      const nodeId = `var_${nodeIdCounter++}`;
      idMap.set(varName, nodeId);
      
      nodes.push({
        id: nodeId,
        type: 'variable',
        label: varName,
        properties: {
          code: match.code,
          line: lineNumber,
          file: 'unknown',
          value: match.value || '',
          isPageRankData: this.isPageRankData(varName)
        }
      });
    }
    
    // 分析函数调用关系
    const callRelations = this.extractFunctionRelations(code, functionMatches);
    
    // 创建调用关系的边
    for (const relation of callRelations) {
      const caller = relation.caller;
      const callee = relation.callee;
      
      if (idMap.has(caller) && idMap.has(callee)) {
        edges.push({
          source: idMap.get(caller)!,
          target: idMap.get(callee)!,
          type: 'calls',
          weight: this.calculateWeight(relation.type),
          properties: {
            code: relation.code,
            callType: relation.type
          }
        });
      }
    }
    
    // 分析类继承关系
    for (const classMatch of classMatches) {
      if (classMatch.parentClass && idMap.has(classMatch.parentClass)) {
        edges.push({
          source: idMap.get(classMatch.parentClass)!,
          target: idMap.get(classMatch.name)!,
          type: 'inherits',
          weight: 1.0,
          properties: {}
        });
      }
    }
    
    // 添加PageRank算法特定的边关系
    this.addPageRankSpecificEdges(nodes, edges, idMap);
    
    return {
      metadata: {
        language,
        version: '1.0',
        timestamp: new Date().toISOString(),
        algorithm: 'pagerank'
      },
      graph: {
        nodes,
        edges
      }
    };
  }

  /**
   * 提取类定义
   */
  private extractClasses(code: string): Array<{
    name: string,
    code: string,
    lineNumber: number,
    methods: string[],
    parentClass?: string
  }> {
    const classes = [];
    const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(\([^)]*\))?:/g;
    let match;
    
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      const inheritance = match[2] || '';
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      // 提取父类
      let parentClass = undefined;
      if (inheritance) {
        const parentMatch = inheritance.match(/\(([^)]+)\)/);
        if (parentMatch) {
          parentClass = parentMatch[1].trim();
        }
      }
      
      // 提取方法
      const classStart = match.index;
      const classEnd = this.findClassEnd(code, classStart);
      const classCode = code.substring(classStart, classEnd);
      const methods = this.extractMethodsFromClass(classCode);
      
      classes.push({
        name: className,
        code: match[0],
        lineNumber,
        methods,
        parentClass
      });
    }
    
    return classes;
  }

  /**
   * 提取函数定义
   */
  private extractFunctions(code: string): Array<{
    name: string,
    code: string,
    lineNumber: number,
    params: string[]
  }> {
    const functions = [];
    const functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\):/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      const params = match[2];
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      functions.push({
        name: functionName,
        code: match[0],
        lineNumber,
        params: params.split(',').map(p => p.trim()).filter(p => p)
      });
    }
    
    return functions;
  }

  /**
   * 提取变量定义
   */
  private extractVariables(code: string): Array<{
    name: string,
    code: string,
    lineNumber: number,
    value?: string
  }> {
    const variables = [];
    const variableRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)/g;
    let match;
    
    while ((match = variableRegex.exec(code)) !== null) {
      const varName = match[1];
      const value = match[2];
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      variables.push({
        name: varName,
        code: match[0],
        lineNumber,
        value
      });
    }
    
    return variables;
  }

  /**
   * 提取函数调用关系
   */
  private extractFunctionRelations(
    code: string, 
    functionMatches: Array<{name: string, code: string, lineNumber: number}>
  ): Array<{
    caller: string,
    callee: string,
    code: string,
    type: string
  }> {
    const relations = [];
    
    // 为每个函数查找其内部调用的其他函数
    for (const func of functionMatches) {
      const funcName = func.name;
      const funcStart = code.indexOf(func.code);
      
      // 找到函数体的结束位置
      const funcEnd = this.findFunctionEnd(code, funcStart);
      const funcBody = code.substring(funcStart, funcEnd);
      
      // 查找函数调用
      const callRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
      let callMatch;
      
      while ((callMatch = callRegex.exec(funcBody)) !== null) {
        const calledFunction = callMatch[1];
        
        // 跳过自身调用和内置函数
        if (calledFunction !== funcName && !this.isBuiltinFunction(calledFunction)) {
          relations.push({
            caller: funcName,
            callee: calledFunction,
            code: callMatch[0],
            type: this.getCallType(funcName, calledFunction)
          });
        }
      }
    }
    
    return relations;
  }

  /**
   * 添加PageRank算法特定的边关系
   */
  private addPageRankSpecificEdges(
    nodes: GraphNode[], 
    edges: GraphEdge[], 
    idMap: Map<string, string>
  ): void {
    // 识别PageRank算法的关键步骤并添加顺序关系
    const stepFunctions = nodes
      .filter(n => n.type === 'function' && n.properties.isPageRankStep)
      .sort((a, b) => a.properties.stepOrder - b.properties.stepOrder);
    
    // 添加步骤之间的顺序关系
    for (let i = 0; i < stepFunctions.length - 1; i++) {
      const currentStep = stepFunctions[i];
      const nextStep = stepFunctions[i + 1];
      
      edges.push({
            source: currentStep.id,
            target: nextStep.id,
            type: 'pagerank_sequence',
            weight: validateWeight(0.8), // 标准化到0-1范围
            properties: {
              description: `${currentStep.label} → ${nextStep.label}`
            }
          });
    }
    
    // 识别PageRank数据变量并添加与使用它们的函数的关系
    const dataVariables = nodes.filter(n => n.type === 'variable' && n.properties.isPageRankData);
    
    for (const variable of dataVariables) {
      // 查找使用此变量的函数
      const usingFunctions = nodes.filter(n => 
        n.type === 'function' && 
        this.functionUsesVariable(n.properties.code, variable.label)
      );
      
      for (const func of usingFunctions) {
        edges.push({
          source: variable.id,
          target: func.id,
          type: 'uses',
          weight: validateWeight(0.6), // 标准化到0-1范围
          properties: {
            description: `${variable.label} used in ${func.label}`
          }
        });
      }
    }
  }

  /**
   * 判断函数是否是PageRank算法的步骤
   */
  private isPageRankStep(functionName: string): boolean {
    const stepFunctions = [
      'initialize_pagerank',
      'calculate_outgoing_probabilities',
      'iterate_pagerank',
      'rank_nodes',
      'main'
    ];
    
    return stepFunctions.includes(functionName);
  }

  /**
   * 获取PageRank算法步骤的顺序
   */
  private getPageRankStepOrder(functionName: string): number {
    const stepOrder: { [key: string]: number } = {
      'initialize_pagerank': 1,
      'calculate_outgoing_probabilities': 2,
      'iterate_pagerank': 3,
      'rank_nodes': 4,
      'main': 5
    };
    
    return stepOrder[functionName] || 999;
  }

  /**
   * 判断变量是否是PageRank算法的数据
   */
  private isPageRankData(varName: string): boolean {
    const pagerankData = [
      'pagerank',
      'adjacency_matrix',
      'transition_matrix',
      'damping_factor',
      'num_nodes',
      'tolerance'
    ];
    
    return pagerankData.some(data => varName.toLowerCase().includes(data));
  }

  /**
   * 判断是否是内置函数
   */
  private isBuiltinFunction(functionName: string): boolean {
    const builtins = [
      'print', 'len', 'range', 'sum', 'min', 'max', 'abs', 'round',
      'int', 'float', 'str', 'list', 'dict', 'set', 'tuple',
      'np.array', 'np.ones', 'np.zeros', 'np.dot', 'np.linalg.norm'
    ];
    
    return builtins.includes(functionName);
  }

  /**
   * 获取调用类型
   */
  private getCallType(caller: string, callee: string): string {
    // 特殊的PageRank调用关系
    if (caller === 'main' && this.isPageRankStep(callee)) {
      return 'main_flow';
    }
    
    if (this.isPageRankStep(caller) && this.isPageRankStep(callee)) {
      return 'step_flow';
    }
    
    return 'regular_call';
  }

  /**
   * 计算边的权重（标准化到0-1范围）
   */
  private calculateWeight(callType: string): number {
    const weights: { [key: string]: number } = {
      'main_flow': 0.9,     // 主流程：最高权重
      'step_flow': 0.7,     // 步骤流程：中高权重
      'regular_call': 0.4   // 普通调用：中等权重
    };
    
    return validateWeight(weights[callType] || 0.3); // 默认：低权重，使用验证
  }

  /**
   * 查找类定义的结束位置
   */
  private findClassEnd(code: string, startPos: number): number {
    const lines = code.substring(startPos).split('\n');
    let indentLevel = null;
    let endPos = startPos;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        endPos += line.length + 1;
        continue;
      }
      
      // 获取缩进级别
      const currentIndent = line.length - line.trimStart().length;
      
      if (indentLevel === null) {
        // 第一行非空行，设置缩进级别
        indentLevel = currentIndent;
      } else if (currentIndent <= indentLevel && trimmedLine) {
        // 找到缩进级别小于或等于类定义的行，类定义结束
        break;
      }
      
      endPos += line.length + 1;
    }
    
    return endPos;
  }

  /**
   * 查找函数定义的结束位置
   */
  private findFunctionEnd(code: string, startPos: number): number {
    const lines = code.substring(startPos).split('\n');
    let indentLevel = null;
    let endPos = startPos;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        endPos += line.length + 1;
        continue;
      }
      
      // 获取缩进级别
      const currentIndent = line.length - line.trimStart().length;
      
      if (indentLevel === null) {
        // 第一行非空行，设置缩进级别
        indentLevel = currentIndent;
      } else if (currentIndent <= indentLevel && trimmedLine) {
        // 找到缩进级别小于或等于函数定义的行，函数定义结束
        break;
      }
      
      endPos += line.length + 1;
    }
    
    return endPos;
  }

  /**
   * 从类代码中提取方法
   */
  private extractMethodsFromClass(classCode: string): string[] {
    const methods = [];
    const methodRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match;
    
    while ((match = methodRegex.exec(classCode)) !== null) {
      methods.push(match[1]);
    }
    
    return methods;
  }

  /**
   * 判断函数是否使用了某个变量
   */
  private functionUsesVariable(functionCode: string, varName: string): boolean {
    // 简单的字符串匹配，实际应用中可能需要更复杂的分析
    return functionCode.includes(varName);
  }
}