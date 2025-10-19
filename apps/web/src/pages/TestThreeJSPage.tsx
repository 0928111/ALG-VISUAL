import React, { useState, useEffect, useRef } from 'react';
import ThreeGraphViewZone, { ThreeGraphViewZoneRef } from '../components/EnhancedPageRankVisualization/ThreeGraphViewZone';

const TestThreeJSPage: React.FC = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [renderComplete, setRenderComplete] = useState(false);
  const graphRef = useRef<ThreeGraphViewZoneRef>(null);

  useEffect(() => {
    // 生成测试数据
    const nodes = [
      { id: 'A', label: '节点 A', rank: 85 },
      { id: 'B', label: '节点 B', rank: 70 },
      { id: 'C', label: '节点 C', rank: 60 },
      { id: 'D', label: '节点 D', rank: 45 },
      { id: 'E', label: '节点 E', rank: 30 }
    ];

    const edges = [
      { id: 'AB', source: 'A', target: 'B', weight: 2 },
      { id: 'AC', source: 'A', target: 'C', weight: 1 },
      { id: 'BC', source: 'B', target: 'C', weight: 3 },
      { id: 'CD', source: 'C', target: 'D', weight: 1 },
      { id: 'DE', source: 'D', target: 'E', weight: 2 }
    ];

    setGraphData({ nodes, edges });
  }, []);

  const handleNodeClick = (nodeId: string) => {
    console.log('点击节点:', nodeId);
    setSelectedNode(nodeId);
  };

  const handleNodeHover = (nodeId: string | null) => {
    console.log('悬停节点:', nodeId);
    setHoveredNode(nodeId);
  };

  const handleRenderComplete = () => {
    console.log('Three.js 渲染完成');
    setRenderComplete(true);
  };

  const handleHighlightPath = () => {
    if (graphRef.current) {
      graphRef.current.highlightPath(['A', 'B', 'C']);
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.reset();
      setSelectedNode(null);
      setHoveredNode(null);
    }
  };

  const handleExportImage = () => {
    if (graphRef.current) {
      const dataUrl = graphRef.current.exportAsImage();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = 'threejs-graph.png';
        link.href = dataUrl;
        link.click();
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Three.js PageRank 可视化测试</h1>
      <p>测试Three.js渲染器是否正常工作</p>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={handleHighlightPath}>高亮路径 A-B-C</button>
          <button onClick={handleReset}>重置视图</button>
          <button onClick={handleExportImage}>导出图片</button>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>状态:</strong> {renderComplete ? '✅ 渲染完成' : '⏳ 渲染中...'}
          {selectedNode && <span> | 选中节点: {selectedNode}</span>}
          {hoveredNode && <span> | 悬停节点: {hoveredNode}</span>}
        </div>
        
        <ThreeGraphViewZone
          ref={graphRef}
          data={graphData}
          config={{ 
            width: 800, 
            height: 600,
            layoutType: 'force',
            iterations: 500
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onRenderComplete={handleRenderComplete}
        />
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>测试说明</h3>
        <ul>
          <li>如果看到3D图形渲染，说明Three.js集成成功</li>
          <li>可以尝试拖拽、缩放来交互</li>
          <li>节点大小和颜色应该反映PageRank值</li>
          <li>点击节点会显示选中状态</li>
          <li>悬停节点会显示悬停状态</li>
          <li>使用控制按钮测试各种功能</li>
        </ul>
      </div>
    </div>
  );
};

export default TestThreeJSPage;