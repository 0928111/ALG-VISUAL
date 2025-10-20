import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Navigation from '../../components/Navigation';
import DataView from '../../components/DataView';
import FlowchartView from '../../components/FlowchartView';
import Controls from '../../components/Controls';
import FloatingChat from '../../components/FloatingChat';
import './PageRankCourse.css';

const PageRankCourse: React.FC = () => {
  const graphRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false); // 添加收起状态

  // 静态图数据 - 移除动画状态
  const staticGraphData = {
    nodes: [
      { id: 'A', label: '页面A', prValue: 0.25, x: 200, y: 200 },
      { id: 'B', label: '页面B', prValue: 0.25, x: 400, y: 150 },
      { id: 'C', label: '页面C', prValue: 0.25, x: 400, y: 250 },
      { id: 'D', label: '页面D', prValue: 0.25, x: 600, y: 200 }
    ],
    links: [
      { source: 'A', target: 'B', weight: 0.5 },
      { source: 'A', target: 'C', weight: 0.5 },
      { source: 'B', target: 'D', weight: 1.0 },
      { source: 'C', target: 'D', weight: 1.0 }
    ]
  };

  useEffect(() => {
    if (!graphRef.current) return;

    // 清空容器，防止重复渲染
    d3.select(graphRef.current).selectAll('*').remove();

    // 创建SVG容器并定义箭头标记
    const svg = d3.select(graphRef.current)
      .append('svg')
      .attr('width', 600)
      .attr('height', 400)
      .style('border', '1px solid #ccc');

    svgRef.current = svg.node();

    // 定义节点颜色映射
    const nodeColors = {
      'A': '#FF6B6B', // 红色
      'B': '#4ECDC4', // 青色
      'C': '#45B7D1', // 蓝色
      'D': '#FFA07A'  // 橙色
    };

    // 使用统一的静态数据
    const graphData = {
      nodes: [
        { id: 'A', label: '页面A', x: 100, y: 200, rank: 0.25 },
        { id: 'B', label: '页面B', x: 300, y: 100, rank: 0.25 },
        { id: 'C', label: '页面C', x: 300, y: 300, rank: 0.25 },
        { id: 'D', label: '页面D', x: 500, y: 200, rank: 0.25 }
      ],
      links: [
        { source: 'A', target: 'B', weight: 1 },
        { source: 'A', target: 'C', weight: 1 },
        { source: 'B', target: 'D', weight: 1 },
        { source: 'C', target: 'D', weight: 1 }
      ]
    };

    // 定义箭头标记 - 颜色与边颜色一致
    const defs = svg.append('defs');
    
    // 为每个源节点创建不同颜色的箭头
    Object.keys(nodeColors).forEach(nodeId => {
      defs.append('marker')
        .attr('id', `arrow-${nodeId}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)  // 调整refX值，让箭头更贴近节点边缘
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', nodeColors[nodeId as keyof typeof nodeColors])
        .attr('stroke', 'none'); // 确保没有描边
    });

    // 计算节点边缘的坐标，避免箭头指向中心
    const getEdgeCoordinates = (source: any, target: any) => {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = 20; // 节点半径
      
      // 计算从源节点边缘到目标节点边缘的坐标
      const sourceEdgeX = source.x + (dx / distance) * radius;
      const sourceEdgeY = source.y + (dy / distance) * radius;
      const targetEdgeX = target.x - (dx / distance) * radius;
      const targetEdgeY = target.y - (dy / distance) * radius;
      
      return {
        x1: sourceEdgeX,
        y1: sourceEdgeY,
        x2: targetEdgeX,
        y2: targetEdgeY
      };
    };

    // 绘制带箭头的边，颜色与起始节点一致
    svg.selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('x1', d => {
        const sourceNode = graphData.nodes.find(n => n.id === d.source);
        const targetNode = graphData.nodes.find(n => n.id === d.target);
        return sourceNode && targetNode ? getEdgeCoordinates(sourceNode, targetNode).x1 : 0;
      })
      .attr('y1', d => {
        const sourceNode = graphData.nodes.find(n => n.id === d.source);
        const targetNode = graphData.nodes.find(n => n.id === d.target);
        return sourceNode && targetNode ? getEdgeCoordinates(sourceNode, targetNode).y1 : 0;
      })
      .attr('x2', d => {
        const sourceNode = graphData.nodes.find(n => n.id === d.source);
        const targetNode = graphData.nodes.find(n => n.id === d.target);
        return sourceNode && targetNode ? getEdgeCoordinates(sourceNode, targetNode).x2 : 0;
      })
      .attr('y2', d => {
        const sourceNode = graphData.nodes.find(n => n.id === d.source);
        const targetNode = graphData.nodes.find(n => n.id === d.target);
        return sourceNode && targetNode ? getEdgeCoordinates(sourceNode, targetNode).y2 : 0;
      })
      .attr('stroke', d => nodeColors[d.source as keyof typeof nodeColors])
      .attr('stroke-width', 2)
      .attr('marker-end', d => `url(#arrow-${d.source})`);

    // 绘制节点
    const nodeGroups = svg.selectAll('g')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeGroups.append('circle')
      .attr('r', 20)
      .attr('fill', d => nodeColors[d.id as keyof typeof nodeColors])
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .attr('font-weight', 'bold');

    return () => {
      if (graphRef.current && svgRef.current) {
        graphRef.current.removeChild(svgRef.current);
      }
    };
  }, []);

  return (
    <div className="pagerank-course">
      <Navigation courseTitle="PageRank 算法" courseId="pagerank" />
      
      <div className="pagerank-content">
        <div className="pagerank-main-layout">
          <div className="pagerank-left-panel">
            <DataView />
          </div>
          <div className="pagerank-center-panel">
            <div className="graph-container">
              <div ref={graphRef}></div>
            </div>
          </div>
          <div className="pagerank-right-panel">
            <FlowchartView />
          </div>
        </div>
        <div className={`pagerank-bottom-panel ${controlsCollapsed ? 'controls-collapsed' : ''}`}>
          <Controls onCollapseChange={setControlsCollapsed} />
        </div>
      </div>
      
      <FloatingChat />
    </div>
  );
};

export default PageRankCourse;