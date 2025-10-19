# 📚 ALG-VISUAL 文档中心

> 欢迎来到 ALG-VISUAL 项目文档中心！这里汇集了项目的所有技术文档。

## 📖 文档导航

### 🚀 快速开始

**如果你是第一次接触本项目，建议从这里开始：**

- [⭐ 快速开始指南](guides/QUICK_START_GUIDE.md) - 5分钟上手单向带权图渲染器
- [新系统快速开始](guides/QUICK_START_NEW_SYSTEM.md) - 新系统使用指南

### 🏗️ 架构设计 (architecture/)

了解项目的整体架构和设计理念：

1. [Agent架构设计](architecture/AGENT_ARCHITECTURE.md) - 智能体系统架构
2. [图可视化系统](architecture/GRAPH_VISUALIZATION_SYSTEM.md) - 可视化系统架构
3. [有向图规范 v1](architecture/DIRECTED_GRAPH_SPEC_v1.md) - 单向带权图规范文档

### 📘 使用指南 (guides/)

详细的功能集成和使用指南：

1. [可视化Agent集成指南](guides/VISUALIZATION_AGENT_INTEGRATION_GUIDE.md) - 完整的Agent集成教程
2. [Agent接口快速参考](guides/AGENT_INTERFACE_QUICK_REFERENCE.md) - API快速查询手册
3. [PageRank重构指南](guides/PAGERANK_REFACTOR_FINAL.md) - PageRank模块重构
4. [PageRank可视化重构指南](guides/PAGERANK_VISUALIZATION_REFACTOR_GUIDE.md)
5. [优化验证指南](guides/OPTIMIZATION_VERIFICATION_GUIDE.md) - 性能优化验证流程

### 💻 实现总结 (implementation/)

各模块的详细实现文档：

1. [有向图实现总结](implementation/DIRECTED_GRAPH_IMPLEMENTATION_SUMMARY.md) - 有向图渲染器实现
2. [Agent接口总结](implementation/AGENT_INTERFACE_SUMMARY.md) - Agent接口实现细节
3. [总体实现总结](implementation/IMPLEMENTATION_SUMMARY.md) - 项目整体实现
4. [PageRank重构总结](implementation/PAGERANK_REFACTOR_SUMMARY.md)
5. [最终优化总结](implementation/FINAL_OPTIMIZATION_SUMMARY.md)
6. [可视化增强总结](implementation/VISUALIZATION_ENHANCEMENTS_SUMMARY.md)
7. [可视化优化总结](implementation/VISUALIZATION_OPTIMIZATION_SUMMARY.md)
8. [PageRank可视化优化总结](implementation/PAGERANK_VISUALIZATION_OPTIMIZATION_SUMMARY.md)

### 🔧 问题修复 (fixes/)

历史问题的诊断和修复记录：

1. [错误修复总结](fixes/ERROR_FIXES_SUMMARY.md) - 常见错误修复
2. [问题诊断报告](fixes/ISSUE_DIAGNOSIS_REPORT.md) - 问题诊断流程
3. [TypeScript错误日志](fixes/typescript-errors-log.md) - TS编译错误记录
4. [状态连接修复](fixes/STATE_CONNECTION_FIX_SUMMARY.md)
5. [UI布局修复](fixes/UI_LAYOUT_FIX_SUMMARY.md)
6. [布局溢出修复](fixes/LAYOUT_OVERFLOW_FIX_SUMMARY.md)
7. [布局稳定性修复](fixes/LAYOUT_STABILITY_FIX.md)
8. [布局稳定性优化](fixes/LAYOUT_STABILITY_OPTIMIZATION.md)
9. [图布局优化总结](fixes/GRAPH_LAYOUT_OPTIMIZATION_SUMMARY.md)

### ✅ 检查清单 (checklists/)

开发和验证的检查清单：

1. [优化验证检查清单](checklists/OPTIMIZATION_VERIFICATION_CHECKLIST.md)
2. [快速验证检查清单](checklists/QUICK_VERIFICATION_CHECKLIST.md)
3. [快速参考优化](checklists/QUICK_REFERENCE_OPTIMIZATION.md)

### 📝 其他文档 (misc/)

补充文档和设计资料：

1. [调试页面检查清单](misc/DEBUG_PAGE_CHECK.md)
2. [浮动聊天实现](misc/FLOATING_CHAT_IMPLEMENTATION.md)
3. [可视化改进](misc/VISUALIZATION_IMPROVEMENTS.md)
4. [设计系统配置](misc/design-system-profile.md) - UI设计规范

### 📋 项目管理

- [项目整理总结](PROJECT_CLEANUP_SUMMARY.md) - 2025-10-18 项目文件整理记录

## 🎯 文档使用建议

### 新手入门路径

```mermaid
graph LR
    A[快速开始指南] --> B[图可视化系统]
    B --> C[有向图实现总结]
    C --> D[使用指南]
```

1. 阅读 [快速开始指南](guides/QUICK_START_GUIDE.md)
2. 了解 [图可视化系统架构](architecture/GRAPH_VISUALIZATION_SYSTEM.md)
3. 查看 [有向图实现总结](implementation/DIRECTED_GRAPH_IMPLEMENTATION_SUMMARY.md)
4. 根据需求选择具体的使用指南

### 开发者路径

```mermaid
graph LR
    A[架构设计] --> B[实现总结]
    B --> C[Agent集成指南]
    C --> D[问题修复参考]
```

1. 研读 [架构设计文档](architecture/)
2. 深入 [实现总结](implementation/)
3. 学习 [Agent集成](guides/VISUALIZATION_AGENT_INTEGRATION_GUIDE.md)
4. 参考 [问题修复记录](fixes/)

### 维护者路径

1. 定期查看 [检查清单](checklists/)
2. 更新 [实现总结](implementation/)
3. 记录 [问题修复](fixes/)
4. 维护 [使用指南](guides/)

## 📊 文档统计

| 分类 | 文档数量 | 说明 |
|------|---------|------|
| 架构设计 | 3 | 系统架构和规范 |
| 使用指南 | 7 | 功能使用教程 |
| 实现总结 | 8 | 技术实现细节 |
| 问题修复 | 9 | 历史问题记录 |
| 检查清单 | 3 | 开发验证清单 |
| 其他文档 | 4 | 补充资料 |
| **总计** | **34** | **含本索引文件** |

## 🔍 搜索技巧

- **快速查找API**: 查看 [Agent接口快速参考](guides/AGENT_INTERFACE_QUICK_REFERENCE.md)
- **问题排查**: 浏览 [问题修复](fixes/) 目录
- **性能优化**: 参考 [优化相关文档](implementation/)
- **新功能开发**: 参考 [架构设计](architecture/) 和 [实现总结](implementation/)

## 📌 文档维护规范

### 新增文档时

1. 选择合适的分类目录
2. 使用清晰的文件名（英文大写+下划线）
3. 添加文档头部说明（创建日期、作者、版本等）
4. 更新本 README.md 的导航链接

### 文档格式要求

- 使用 Markdown 格式
- 添加适当的标题层级
- 包含代码示例时使用语法高亮
- 重要内容使用引用块或表格
- 添加相关文档的交叉引用

## 🔗 相关资源

- [项目主 README](../README.md)
- [下一步计划](../NEXT_STEPS.md)
- [Agent Bridge 模块文档](../packages/agent-bridge/README.md)

## 📮 反馈与建议

如果你在使用文档过程中有任何问题或建议，欢迎：

- 提交 Issue
- 发起 Pull Request
- 联系项目维护者

---

**文档中心维护**: Qoder AI  
**最后更新**: 2025-10-18  
**文档版本**: v1.0
