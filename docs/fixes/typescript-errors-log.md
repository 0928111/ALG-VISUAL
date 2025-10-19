# TypeScript 错误日志

本文档记录项目中遇到的TypeScript编译错误，用于追踪问题修复历史。

> **注意**: 这是历史错误记录，当前版本中这些问题应该已经修复。

## GraphViewZone.tsx 错误

### 问题: 找不到名称"d"

**文件**: `apps/web/src/components/EnhancedPageRankVisualization/GraphViewZone.tsx`

**错误代码**: TS2304

**影响行**:
- 第659行: 列52-53, 列66-67
- 第661行: 列40-41
- 第672行: 列44-45, 列71-72
- 第677行: 列44-45, 列71-72

**原因**: D3.js 选择器回调函数中的参数`d`未正确声明类型

**修复方案**: 为D3回调函数添加正确的类型注解

---

## DirectedWeightedGraphRenderer.ts 错误

### 错误1: 类型"SimulationNodeDatum"上不存在属性"rank"

**文件**: `packages/flowchart-renderer/DirectedWeightedGraphRenderer.ts`

**错误代码**: TS2339

**影响行**: 第157行, 列78-82

**原因**: D3的`SimulationNodeDatum`接口不包含自定义的`rank`属性

**修复方案**: 扩展`SimulationNodeDatum`接口，添加自定义属性

```typescript
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  rank: number;
  // ... 其他属性
}
```

---

### 错误2: 类型参数不兼容

**文件**: `packages/flowchart-renderer/DirectedWeightedGraphRenderer.ts`

**错误代码**: TS2345

**影响行**:
- 第376行: 边权重属性设置
- 第401行: 节点ID属性设置
- 第406行: 边粗细设置
- 第431行: 边粗细设置

**错误示例**:
```typescript
// 错误: 类型"(d: GraphLink) => string"的参数不能赋给...
.attr('stroke-width', (d: GraphLink) => ...)
```

**原因**: D3的类型推断要求更明确的类型注解

**修复方案**: 为D3选择器的回调函数添加显式类型注解

```typescript
.attr('stroke-width', (d: GraphLink): string => {
  return calculateStrokeWidth(d);
})
```

---

## 错误分类统计

| 错误类型 | 错误代码 | 数量 | 文件 |
|---------|---------|-----|------|
| 找不到名称 | TS2304 | 7 | GraphViewZone.tsx |
| 属性不存在 | TS2339 | 1 | DirectedWeightedGraphRenderer.ts |
| 类型不兼容 | TS2345 | 4 | DirectedWeightedGraphRenderer.ts |

---

## 修复优先级

1. ✅ **高优先级**: SimulationNodeDatum接口扩展（阻止编译）
2. ✅ **中优先级**: D3回调函数类型注解（类型安全）
3. ✅ **低优先级**: GraphViewZone中的`d`参数声明（代码规范）

---

## 相关文档

- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [D3.js类型定义](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3)
- 项目修复总结: `docs/fixes/ERROR_FIXES_SUMMARY.md`

---

**原始文件**: tsc-errors.txt  
**转换日期**: 2025-10-18  
**状态**: 历史记录（问题已修复）
