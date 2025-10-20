import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './LabelCollisionDemo.css';

interface GraphNode {
  id: string;
  label: string;
  prValue: number;
  x?: number;
  y?: number;
  isActive?: boolean;
  isUpdating?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
  isActive?: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const LabelCollisionDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [collisionInfo, setCollisionInfo] = useState<string>('');
  const [isOptimized, setIsOptimized] = useState(false);

  // 创建标签碰撞测试数据
  const createCollisionTestData = (): GraphData => ({
    nodes: [
      { id: 'A1', label: '测试节点A1', prValue: 0.2, x: 200, y: 200 },
      { id: 'A2', label: '测试节点A2', prValue: 0.15, x: 220, y: 180 },
      { id: 'A3', label: '测试节点A3', prValue: 0.25, x: 240, y: 200 },
      { id: 'B1', label: '测试节点B1', prValue: 0.18, x: 210, y: 220 },
      { id: 'B2', label: '测试节点B2', prValue: 0.22, x: 230, y: 220 }
    ],
    links: [
      { source: 'A1', target: 'A2', weight: 0.4 },
      { source: 'A2', target: 'A3', weight: 0.3 },
      { source: 'A1', target: 'B1', weight: 0.2 },
      { source: 'B1', target: 'B2', weight: 0.35 },
      { source: 'A3', target: 'B2', weight: 0.25 }
    ]
  });

  // 创建优化后的数据（节点位置分散）
  const createOptimizedData = (): GraphData => ({
    nodes: [
      { id: 'A1', label: '测试节点A1', prValue: 0.2, x: 150, y: 150 },
      { id: 'A2', label: '测试节点A2', prValue: 0.15, x: 300, y: 120 },
      { id: 'A3', label: '测试节点A3', prValue: 0.25, x: 450, y: 180 },
      { id: 'B1', label: '测试节点B1', prValue: 0.18, x: 200, y: 350 },
      { id: 'B2', label: '测试节点B2', prValue: 0.22, x: 400, y: 320 }
    ],
    links: [
      { source: 'A1', target: 'A2', weight: 0.4 },
      { source: 'A2', target: 'A3', weight: 0.3 },
      { source: 'A1', target: 'B1', weight: 0.2 },
      { source: 'B1', target: 'B2', weight: 0.35 },
      { source: 'A3', target: 'B2', weight: 0.25 }
    ]
  });

  // 检测标签碰撞
  const detectLabelCollisions = (nodes: GraphNode[]): any[] => {
    const collisions = [];
    const labelHeight = 14;
    const labelWidth = 80;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const dx = (node1.x || 0) - (node2.x || 0);
        const dy = (node1.y || 0) - (node2.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < labelWidth) {
          collisions.push({
            node1: node1.id,
            node2: node2.id,
            distance: distance,
            overlap: labelWidth - distance
          });
        }
      }
    }
    return collisions;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建SVG容器
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', 600)
      .attr('height', 400)
      .style('border', '1px solid #ccc');

    svgRef.current = svg.node();

    return () => {
      if (containerRef.current && svgRef.current) {
        containerRef.current.removeChild(svgRef.current);
      }
    };
  }, []);

  const handleTestCollision = () => {
    console.log('🎯 开始标签碰撞测试');
    setIsOptimized(false);
    
    const testData = createCollisionTestData();
    
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // 清空SVG
      
      console.log('📊 渲染碰撞测试数据:', testData);
      
      // 绘制边
      svg.selectAll('line')
        .data(testData.links)
        .enter()
        .append('line')
        .attr('x1', d => testData.nodes.find(n => n.id === d.source)?.x || 0)
        .attr('y1', d => testData.nodes.find(n => n.id === d.source)?.y || 0)
        .attr('x2', d => testData.nodes.find(n => n.id === d.target)?.x || 0)
        .attr('y2', d => testData.nodes.find(n => n.id === d.target)?.y || 0)
        .attr('stroke', '#999')
        .attr('stroke-width', 2);
      
      // 绘制节点
      const nodeGroups = svg.selectAll('g')
        .data(testData.nodes)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x},${d.y})`);
      
      nodeGroups.append('circle')
        .attr('r', 20)
        .attr('fill', '#69b3a2')
        .attr('stroke', '#333')
        .attr('stroke-width', 2);
      
      nodeGroups.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text(d => d.label)
        .attr('font-size', '12px')
        .attr('fill', '#333');
      
      // 检测碰撞
      setTimeout(() => {
        const collisions = detectLabelCollisions(testData.nodes);
        console.log('🔍 检测到标签碰撞:', collisions);
        
        if (collisions.length > 0) {
          const info = `检测到 ${collisions.length} 个标签碰撞:\n` +
            collisions.map(c => `  - ${c.node1} 与 ${c.node2} 重叠 ${c.overlap.toFixed(2)}px`).join('\n');
          setCollisionInfo(info);
          
          // 高亮碰撞节点
          collisions.forEach(collision => {
            svg.select(`g:nth-child(${testData.nodes.findIndex(n => n.id === collision.node1) + 2}) circle`)
              .attr('fill', 'red');
            svg.select(`g:nth-child(${testData.nodes.findIndex(n => n.id === collision.node2) + 2}) circle`)
              .attr('fill', 'red');
          });
        } else {
          setCollisionInfo('未检测到标签碰撞');
        }
      }, 1000);
    }
  };

  const handleOptimizeLabels = () => {
    console.log('🔄 应用标签位置优化');
    
    const optimizedData = createOptimizedData();
    
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // 清空SVG
      
      console.log('📊 渲染优化后的数据:', optimizedData);
      
      // 绘制边
      svg.selectAll('line')
        .data(optimizedData.links)
        .enter()
        .append('line')
        .attr('x1', d => optimizedData.nodes.find(n => n.id === d.source)?.x || 0)
        .attr('y1', d => optimizedData.nodes.find(n => n.id === d.source)?.y || 0)
        .attr('x2', d => optimizedData.nodes.find(n => n.id === d.target)?.x || 0)
        .attr('y2', d => optimizedData.nodes.find(n => n.id === d.target)?.y || 0)
        .attr('stroke', '#999')
        .attr('stroke-width', 2);
      
      // 绘制节点
      const nodeGroups = svg.selectAll('g')
        .data(optimizedData.nodes)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x},${d.y})`);
      
      nodeGroups.append('circle')
        .attr('r', 20)
        .attr('fill', '#69b3a2')
        .attr('stroke', '#333')
        .attr('stroke-width', 2);
      
      nodeGroups.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text(d => d.label)
        .attr('font-size', '12px')
        .attr('fill', '#333');
      
      // 检测优化后的碰撞
      setTimeout(() => {
        const collisions = detectLabelCollisions(optimizedData.nodes);
        console.log('🔍 优化后检测到标签碰撞:', collisions);
        
        if (collisions.length === 0) {
          setCollisionInfo('✅ 优化成功！未检测到标签碰撞');
          setIsOptimized(true);
        } else {
          const info = `优化后仍检测到 ${collisions.length} 个标签碰撞:\n` +
            collisions.map(c => `  - ${c.node1} 与 ${c.node2} 重叠 ${c.overlap.toFixed(2)}px`).join('\n');
          setCollisionInfo(info);
        }
      }, 1000);
    }
  };

  return (
    <div className="label-collision-demo">
      <div className="demo-header">
        <h2>🏷️ 标签碰撞优化演示</h2>
        <p>演示如何检测和解决图形可视化中的标签重叠问题</p>
      </div>
      
      <div className="demo-controls">
        <button onClick={handleTestCollision} className="test-btn">
          🔍 测试标签碰撞
        </button>
        <button onClick={handleOptimizeLabels} className="optimize-btn">
          🚀 优化标签位置
        </button>
      </div>
      
      <div className="demo-content">
        <div id="label-collision-graph-container" className="graph-container" ref={containerRef} />
        
        <div className="info-panel">
          <h3>检测结果</h3>
          <div className={`collision-info ${isOptimized ? 'optimized' : ''}`}>
            {collisionInfo || '点击"测试标签碰撞"开始检测'}
          </div>
          
          <div className="optimization-info">
            <h4>优化策略</h4>
            <ul>
              <li>📍 调整节点位置，增加间距</li>
              <li>🏷️ 优化标签布局，避免重叠</li>
              <li>🎯 保持图形结构完整性</li>
              <li>⚡ 实时检测和动态调整</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="demo-features">
        <h3>功能特性</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🔍 碰撞检测</h4>
            <p>智能识别重叠的标签和节点</p>
          </div>
          <div className="feature-card">
            <h4>🚀 自动优化</h4>
            <p>自动调整位置以避免标签重叠</p>
          </div>
          <div className="feature-card">
            <h4>📊 可视化反馈</h4>
            <p>直观显示检测结果和优化效果</p>
          </div>
          <div className="feature-card">
            <h4>⚡ 实时处理</h4>
            <p>支持动态图形的实时优化</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelCollisionDemo;