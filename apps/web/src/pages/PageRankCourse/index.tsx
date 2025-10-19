import React, { useRef, useEffect, useState } from 'react';
import { GraphRenderer } from '@alg-visual/flowchart-renderer';
import Navigation from '../../components/Navigation';
import DataView from '../../components/DataView';
import FlowchartView from '../../components/FlowchartView';
import Controls from '../../components/Controls';
import FloatingChat from '../../components/FloatingChat';
import './PageRankCourse.css';

const PageRankCourse: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GraphRenderer | null>(null);
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
    if (!containerRef.current) return;

    // 初始化渲染器 - 仅渲染静态图，无动画
    rendererRef.current = new GraphRenderer('pagerank-graph-container', {
      width: 800,
      height: 600,
      isCollapsible: false,
      isDraggable: true
    });

    // 渲染静态图数据
    if (rendererRef.current) {
      rendererRef.current.render(staticGraphData);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
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
            <div id="pagerank-graph-container" className="pagerank-visualization" ref={containerRef} />
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