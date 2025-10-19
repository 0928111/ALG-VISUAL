# 设计系统配置文档

本文档记录项目的设计系统配置，包含视觉语言、布局结构、组件设计等规范。

## 设计系统概览

**风格名称**: Soft Neumorphic Cloud Dashboard

## 视觉语言

### 调色板

| 颜色类型 | 色值 | 用途 |
|---------|------|------|
| Primary | `#6A78F9` | 主要品牌色 |
| Secondary | `#9FA8DA` | 次要品牌色 |
| Background | `#F5F6FB` | 页面背景 |
| Surface | `#FFFFFF` | 卡片表面 |
| Text Primary | `#333333` | 主要文本 |
| Text Secondary | `#777A8C` | 次要文本 |
| Accent | `#EAEAFF` | 强调色 |
| Shadow Light | `rgba(255, 255, 255, 0.7)` | 浅色阴影 |
| Shadow Dark | `rgba(0, 0, 0, 0.1)` | 深色阴影 |

### 字体系统

- **字体族**: Inter, Poppins, or similar sans-serif
- **字重**:
  - Light: 300
  - Regular: 400
  - Medium: 500
  - Semibold: 600
- **字号**:
  - H1: 24px
  - H2: 20px
  - H3: 16px
  - Body: 14px
  - Caption: 12px
- **行高**: 1.5
- **字间距**: 0.2px

### 形状系统

- 圆角半径: `16px`
- 卡片圆角: `20px`
- 按钮圆角: `24px`
- 芯片圆角: `50%`

### 视觉效果

- **柔和阴影**: `0px 4px 12px rgba(0,0,0,0.08)`
- **内嵌阴影**: `inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.8)`
- **模糊强度**: `12px`
- **主色光晕**: `0 0 12px rgba(106,120,249,0.4)`

### 图标系统

- **风格**: 圆角线条图标，带有微妙渐变填充
- **尺寸**:
  - Small: 16px
  - Medium: 24px
  - Large: 36px
- **颜色使用**: 图标遵循类别颜色主题（如文档用红色，图片用蓝色）

## 布局结构

### 网格系统

- **列数**: 12
- **间距**: 24px
- **边距**: 32px
- **容器最大宽度**: 1440px

### 页面结构

#### 顶部栏
- **高度**: 64px
- **元素**: Logo区域、搜索栏、操作按钮、用户头像
- **对齐方式**: space-between

#### 侧边栏
- **宽度**: 220px
- **位置**: 左侧
- **内容**: Logo、导航菜单、插图
- **导航风格**: 垂直堆叠，带图标和悬停光晕

#### 主内容区
1. **汇总卡片区**
   - 布局: 2列网格
   - 组件: 存储使用小部件、类别卡片网格

2. **联系人面板**
   - 布局: 带头像和微妙分隔线的列表

3. **邀请区块**
   - 布局: 水平表单 + 社交图标

## 组件设计

### 卡片

```css
background: #FFFFFF;
box-shadow: soft drop + inner glow;
padding: 24px;
/* 悬停效果: 微妙提升和颜色渲染 */
```

### 按钮

#### 主要按钮
```css
background: linear-gradient(145deg, #6A78F9, #8C9CFF);
color: #FFFFFF;
border-radius: 24px;
/* 悬停: 提亮渐变 + 轻微缩放 */
```

#### 次要按钮
```css
background: #FFFFFF;
border: 1px solid #E0E0E0;
color: #555;
```

### 输入框

```css
background: #FFFFFF;
border-radius: 20px;
box-shadow: inner light shadow;
/* 内含图标 */
/* 聚焦效果: 主色外轮廓光晕 */
```

### 进度圆环

- **类型**: 圆环图
- **主色**: `#6A78F9`
- **轨道色**: `#E0E3FF`
- **中心标签**: 百分比，中等字重

### 头像列表

- **形状**: 圆形
- **阴影**: 柔和内阴影
- **对齐**: 左对齐堆叠列表

### 数据卡片

- **形状**: 圆角矩形
- **图标颜色**: 主题化
- **指标**: 类别标签、大小值、最后更新时间

## 间距系统

- **内边距标尺**: 4px, 8px, 16px, 24px, 32px, 48px
- **间隙标尺**: 8px, 12px, 16px, 24px
- **区块间距**: 32px
- **卡片间距**: 16px

## 交互反馈

- **悬停**: 柔和提升或颜色渲染
- **激活**: 轻微压缩效果
- **聚焦**: 彩色轮廓光晕
- **过渡**: `all 0.25s ease-in-out`

## 设计令牌

```css
--primary-radius: 20px;
--shadow-depth: medium;
--animation-curve: ease-in-out;
--transition-time: 0.25s;
--blur-filter: backdrop-filter: blur(10px);
```

---

**原始文件**: 标准化json.txt  
**转换日期**: 2025-10-18
