import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// 定义节点和链接的数据接口
interface Node {
  id: string;
}

interface Link {
  source: string;
  target: string;
  weight: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const DirectedGraph: React.FC<{ data: GraphData }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    // 清除现有内容以避免重复渲染
    svg.selectAll("*").remove();

    // 设置SVG画布尺寸，可根据需要调整或通过props传递
    const width = 800;
    const height = 600;
    svg.attr('width', width).attr('height', height);

    // 创建颜色比例尺：使用D3的内置颜色方案（如category10）实现多种颜色区分，可扩展至更多节点
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // 初始化力导向模拟：调整链接距离（例如100像素）以控制边长度，避免过长边；添加斥力和中心力以优化布局比例
    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(100)) // 设置链接距离，确保边不过长
      .force('charge', d3.forceManyBody().strength(-300)) // 节点间斥力，防止重叠
      .force('center', d3.forceCenter(width / 2, height / 2)); // 将图居中于画布

    // 定义箭头标记用于边方向指示
    const defs = svg.append('defs');
    defs.selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15) // 箭头位置调整，确保指向节点边缘
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999'); // 箭头颜色使用中性色，避免与边颜色冲突

    // 绘制边：颜色绑定至起点节点，使用箭头标记表示方向
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', d => {
        const sourceNode = data.nodes.find(n => n.id === d.source);
        return sourceNode ? colorScale(sourceNode.id) : '#ccc'; // 边颜色与起点节点一致
      })
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)'); // 添加箭头

    // 在边中点添加权重文本标注，确保文字清晰可读
    const linkText = svg.append('g')
      .selectAll('text')
      .data(data.links)
      .enter().append('text')
      .text(d => d.weight)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333'); // 文本颜色使用深色以提高对比度

    // 绘制节点：圆形元素，颜色通过比例尺分配
    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', d => colorScale(d.id))
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any); // 添加拖拽交互

    // 添加节点ID文本标签，位于节点上方
    const nodeText = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .text(d => d.id)
      .attr('font-size', 14)
      .attr('text-anchor', 'middle')
      .attr('dy', -15) // 垂直偏移，避免与节点重叠
      .attr('fill', '#000');

    // 力模拟的tick函数：更新节点和边位置，实现动态布局
    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const sourceNode = data.nodes.find(n => n.id === d.source);
          return sourceNode ? (sourceNode as any).x : 0;
        })
        .attr('y1', d => {
          const sourceNode = data.nodes.find(n => n.id === d.source);
          return sourceNode ? (sourceNode as any).y : 0;
        })
        .attr('x2', d => {
          const targetNode = data.nodes.find(n => n.id === d.target);
          return targetNode ? (targetNode as any).x : 0;
        })
        .attr('y2', d => {
          const targetNode = data.nodes.find(n => n.id === d.target);
          return targetNode ? (targetNode as any).y : 0;
        });

      linkText
        .attr('x', d => {
          const sourceNode = data.nodes.find(n => n.id === d.source);
          const targetNode = data.nodes.find(n => n.id === d.target);
          return sourceNode && targetNode ? ((sourceNode as any).x + (targetNode as any).x) / 2 : 0;
        })
        .attr('y', d => {
          const sourceNode = data.nodes.find(n => n.id === d.source);
          const targetNode = data.nodes.find(n => n.id === d.target);
          return sourceNode && targetNode ? ((sourceNode as any).y + (targetNode as any).y) / 2 : 0;
        });

      node
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y);

      nodeText
        .attr('x', d => (d as any).x)
        .attr('y', d => (d as any).y);
    });

    // 拖拽交互处理函数
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, any>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = (d as any).x;
      d.fy = (d as any).y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, any>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, any>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [data]); // 依赖项为data，数据变化时重渲染

  return <svg ref={svgRef}></svg>;
};

export default DirectedGraph;