import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { loadGraphSpec } from '../../graph/spec/SpecLoader';
import { loadGraphData } from '../../graph/data/GraphDataLoader';
import GraphViewZone, { GraphViewZoneRef, GraphData } from '../../components/EnhancedPageRankVisualization/GraphViewZone';
import LegendPanel from '../../components/LegendPanel';
import TeachingFlowRunner from '../../components/TeachingFlowRunner';
import './IntegratedGraphDemo.css';

const IntegratedGraphDemo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const graphViewRef = useRef<GraphViewZoneRef>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });

  // 页面加载时获取规范和数据
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading graph spec and data...');
        
        // 加载规范
        await loadGraphSpec(dispatch, '/data/directed-weighted-graph.spec.json');
        
        // 加载数据
        await loadGraphData(dispatch, '/data/pagerank-graph-data.json');
        
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // 加载可视化图数据（用于 GraphViewZone）
  useEffect(() => {
    fetch('/data/pagerank-graph-data.json')
      .then(res => res.json())
      .then(json => {
        const nodes = (json.nodes || []).map((n: any) => ({ id: n.id, label: n.label, rank: n.rank, x: n.x, y: n.y }));
        const edges = (json.edges || []).map((e: any) => ({ id: e.id, source: e.source, target: e.target, weight: e.weight }));
        setGraphData({ nodes, edges });
      })
      .catch(err => console.error('加载GraphView数据失败', err));
  }, []);


  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
  };

  const handleNodeHover = (nodeId: string | null) => {
    console.log('Node hover:', nodeId);
  };

  const handleStageChange = (stageId: string, stageIndex: number) => {
    console.log('Stage changed:', stageId, stageIndex);
  };

  return (
    <div className="integrated-graph-demo">
      <header className="demo-header">
        <h1>PageRank 算法可视化演示</h1>
        <p>基于配置驱动的图形可视化系统</p>
      </header>

      <main className="demo-main">
        <GraphViewZone
          ref={graphViewRef}
          data={graphData}
          config={{ width: 800, height: 600 }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </main>

      {/* 图例面板 */}
      <LegendPanel />

      {/* 教学流程控制器 */}
      <TeachingFlowRunner
        onStageChange={handleStageChange}
        svgRef={svgRef}
      />
    </div>
  );
};

export default IntegratedGraphDemo;
