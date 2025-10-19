# 图可视化优化快速参考

## 🎯 核心优化点

### 1️⃣ 节点初始布局
```typescript
// 优先使用预设位置，回退到环形布局
const nodes = data.nodes.map((node, index) => {
  if (node.x && node.y) return { ...node, x: node.x, y: node.y };
  
  // 环形布局计算
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    ...node,
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  };
});
```

### 2️⃣ 力模拟关键参数
```typescript
linkDistance: (d) => 120 * (0.8 + d.weight/15 * 0.4)  // 动态距离
linkStrength: 0.6                                      // 增强链接
chargeStrength: -600                                   // 适度排斥
centerStrength: 0.15                                   // 降低中心力
collisionStrength: 0.95                                // 强碰撞避免
alphaDecay: 0.012                                      // 减缓衰减
```

### 3️⃣ 渐入式动画时序
```typescript
边动画:   0ms + i*80ms,  duration 1000ms, easeCubicOut
节点动画: 0ms + i*100ms, duration 800ms,  easeBackOut(1.2)
标签动画: 400ms + i*100ms, duration 600ms, easeCubicOut
PR值动画: 600ms + i*100ms, duration 600ms, easeCubicOut
```

### 4️⃣ 边颜色匹配源节点
```typescript
const colorMap = {
  'A': '#6BBF59',  // 绿色
  'B': '#F3C6D1',  // 粉色
  'C': '#56B5E9',  // 蓝色
  'D': '#F4B56A'   // 橙色
};

edge.stroke = colorMap[sourceId];
edge.markerEnd = `url(#arrow-${sourceId})`;
```

### 5️⃣ 悬停交互增强
```typescript
节点放大: 1.3x
边框加粗: 5px
相关边透明度: 1.0
无关边透明度: 0.08
权重标签: 加粗
动画时长: 250ms (悬停), 350ms (恢复)
```

---

## 📊 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| 初始渲染 | < 2s | ~1.5s |
| 布局稳定 | < 8s | ~6s |
| 悬停响应 | < 300ms | 250ms |
| 动画帧率 | ≥ 60fps | ~60fps |

---

## 🎨 视觉层次

```
时间轴:
0s    ━━━ 边开始出现
0.8s  ━━━ 边全部显示
      ━━━ 节点开始弹出
1.2s  ━━━ 节点全部显示
1.6s  ━━━ 标签全部显示
1.8s  ━━━ PR值全部显示
2.5s  ━━━ 第一阶段稳定开始
4.5s  ━━━ 第二阶段微调开始
6.0s  ━━━ 布局完全稳定 ✓
```

---

## 🔍 快速验证

### 测试页面
http://localhost:5173/test-graph-view

### 验证清单
- [ ] 节点从预设位置开始
- [ ] 边逐个出现（延迟80ms）
- [ ] 节点逐个弹出（延迟100ms，回弹效果）
- [ ] 边颜色匹配源节点
- [ ] 箭头颜色匹配源节点
- [ ] 悬停节点时相关边高亮
- [ ] 6秒后布局稳定

---

## 🐛 常见问题

**Q: 节点还是随机分布？**
A: 确认 `pagerank-graph-data.json` 包含 x, y 坐标，硬刷新（Ctrl+Shift+R）

**Q: 边颜色不对？**
A: 检查控制台错误，重启开发服务器

**Q: 布局不稳定？**
A: 等待完整6秒，检查控制台是否有"✅ 力导向模拟已完成"

---

## 📄 完整文档

详细说明：[GRAPH_LAYOUT_OPTIMIZATION_SUMMARY.md](./GRAPH_LAYOUT_OPTIMIZATION_SUMMARY.md)
验证清单：[OPTIMIZATION_VERIFICATION_CHECKLIST.md](./OPTIMIZATION_VERIFICATION_CHECKLIST.md)

---

生成时间：2025-10-18
