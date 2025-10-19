import React from 'react';
import EnhancedPageRankVisualization from '../../components/EnhancedPageRankVisualization';
import './TestFourZoneLayout.css';

const TestFourZoneLayout: React.FC = () => {
  return (
    <div className="test-four-zone-layout">
      <div className="page-header">
        <h1>四区域布局测试页面</h1>
        <p>这是一个完整的四区域布局演示，包含数据面板、图可视化、流程图和控制面板</p>
      </div>
      
      <div className="visualization-container">
        <EnhancedPageRankVisualization 
          width={1200}
          height={800}
          showControls={true}
          standalone={true}
        />
      </div>
    </div>
  );
};

export default TestFourZoneLayout;