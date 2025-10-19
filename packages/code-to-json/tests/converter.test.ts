import { CodeToJSONConverter } from '../code-to-json-converter';
import { validateConversionResult } from '../utils';

describe('CodeToJSONConverter', () => {
  let converter: CodeToJSONConverter;
  
  beforeEach(() => {
    converter = new CodeToJSONConverter();
  });
  
  test('应该正确转换简单的Python函数', async () => {
    const code = `
def hello_world():
    print("Hello, World!")
    return True
`;
    
    const result = await converter.convert(code, 'python');
    
    expect(result.metadata.language).toBe('python');
    expect(result.graph.nodes).toHaveLength(1);
    expect(result.graph.nodes[0].type).toBe('function');
    expect(result.graph.nodes[0].label).toBe('hello_world');
    expect(validateConversionResult(result)).toBe(true);
  });
  
  test('应该正确转换Python类定义', async () => {
    const code = `
class MyClass:
    def __init__(self, value):
        self.value = value
    
    def get_value(self):
        return self.value
`;
    
    const result = await converter.convert(code, 'python');
    
    expect(result.metadata.language).toBe('python');
    expect(result.graph.nodes).toHaveLength(2); // 1个类 + 1个函数
    
    const classNode = result.graph.nodes.find(n => n.type === 'class');
    expect(classNode).toBeDefined();
    expect(classNode?.label).toBe('MyClass');
    
    const functionNode = result.graph.nodes.find(n => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.label).toBe('__init__');
    
    expect(validateConversionResult(result)).toBe(true);
  });
  
  test('应该正确识别函数调用关系', async () => {
    const code = `
def function_a():
    return "A"

def function_b():
    result = function_a()
    return result + "B"

def function_c():
    return function_b()
`;
    
    const result = await converter.convert(code, 'python');
    
    expect(result.graph.edges).toHaveLength(2); // function_b调用function_a，function_c调用function_b
    
    const edgeAB = result.graph.edges.find(e => 
      result.graph.nodes.find(n => n.id === e.source)?.label === 'function_b' &&
      result.graph.nodes.find(n => n.id === e.target)?.label === 'function_a'
    );
    
    const edgeBC = result.graph.edges.find(e => 
      result.graph.nodes.find(n => n.id === e.source)?.label === 'function_c' &&
      result.graph.nodes.find(n => n.id === e.target)?.label === 'function_b'
    );
    
    expect(edgeAB).toBeDefined();
    expect(edgeAB?.type).toBe('calls');
    
    expect(edgeBC).toBeDefined();
    expect(edgeBC?.type).toBe('calls');
    
    expect(validateConversionResult(result)).toBe(true);
  });
  
  test('应该正确处理变量定义', async () => {
    const code = `
variable_x = 10
variable_y = "hello"
variable_z = [1, 2, 3]
`;
    
    const result = await converter.convert(code, 'python');
    
    expect(result.graph.nodes).toHaveLength(3);
    
    const variableNodes = result.graph.nodes.filter(n => n.type === 'variable');
    expect(variableNodes).toHaveLength(3);
    
    const varX = variableNodes.find(n => n.label === 'variable_x');
    const varY = variableNodes.find(n => n.label === 'variable_y');
    const varZ = variableNodes.find(n => n.label === 'variable_z');
    
    expect(varX).toBeDefined();
    expect(varX?.properties.value).toBe('10');
    
    expect(varY).toBeDefined();
    expect(varY?.properties.value).toBe('"hello"');
    
    expect(varZ).toBeDefined();
    expect(varZ?.properties.value).toBe('[1, 2, 3]');
    
    expect(validateConversionResult(result)).toBe(true);
  });
  
  test('应该正确处理继承关系', async () => {
    const code = `
class BaseClass:
    def base_method(self):
        return "base"

class DerivedClass(BaseClass):
    def derived_method(self):
        return "derived"
`;
    
    const result = await converter.convert(code, 'python');
    
    const baseClass = result.graph.nodes.find(n => n.label === 'BaseClass');
    const derivedClass = result.graph.nodes.find(n => n.label === 'DerivedClass');
    
    expect(baseClass).toBeDefined();
    expect(derivedClass).toBeDefined();
    
    const inheritanceEdge = result.graph.edges.find(e => 
      e.source === baseClass?.id && 
      e.target === derivedClass?.id && 
      e.type === 'inherits'
    );
    
    expect(inheritanceEdge).toBeDefined();
    
    expect(validateConversionResult(result)).toBe(true);
  });
  
  test('应该抛出不支持语言的错误', async () => {
    const code = 'some code';
    
    await expect(converter.convert(code, 'ruby' as any)).rejects.toThrow('不支持的语言: ruby');
  });
});