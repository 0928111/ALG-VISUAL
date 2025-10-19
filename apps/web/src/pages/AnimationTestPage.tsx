import { useState, useCallback } from 'react';
import { IntegratedAnimationSystem } from '../components/IntegratedAnimationSystem';
import './AnimationTestPage.css';

// 示例图数据
const sampleGraphData = {
  nodes: [
    { id: 'A', name: '节点A', x: 100, y: 100, rank: 0.25 },
    { id: 'B', name: '节点B', x: 300, y: 150, rank: 0.35 },
    { id: 'C', name: '节点C', x: 500, y: 100, rank: 0.45 },
    { id: 'D', name: '节点D', x: 200, y: 300, rank: 0.55 },
    { id: 'E', name: '节点E', x: 400, y: 350, rank: 0.65 },
    { id: 'F', name: '节点F', x: 600, y: 300, rank: 0.75 }
  ],
  edges: [
    { id: 'AB', source: 'A', target: 'B', weight: 2 },
    { id: 'AC', source: 'A', target: 'C', weight: 1 },
    { id: 'BD', source: 'B', target: 'D', weight: 3 },
    { id: 'BE', source: 'B', target: 'E', weight: 2 },
    { id: 'CE', source: 'C', target: 'E', weight: 4 },
    { id: 'DE', source: 'D', target: 'E', weight: 1 },
    { id: 'EF', source: 'E', target: 'F', weight: 2 }
  ]
};

// 示例阶段定义
const sampleStages = [
  {
    name: '初始化',
    description: '图结构初始布局',
    effects: [
      {
        type: 'pulse',
        nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
        duration: 1500,
        intensity: 1.1
      }
    ]
  },
  {
    name: '数据流动',
    description: '展示数据在节点间的流动',
    effects: [
      {
        type: 'flow',
        source: 'A',
        target: 'B',
        duration: 2000,
        particleCount: 8
      },
      {
        type: 'flow',
        source: 'B',
        target: 'E',
        duration: 2000,
        particleCount: 6
      }
    ]
  },
  {
    name: '权重强调',
    description: '突出显示重要连接',
    effects: [
      {
        type: 'emphasize',
        elements: ['CE', 'BD'],
        scale: 1.3,
        duration: 1000
      },
      {
        type: 'dim',
        edges: ['AB', 'AC', 'DE', 'EF'],
        opacity: 0.4,
        duration: 1000
      }
    ]
  },
  {
    name: 'Rank更新',
    description: '节点重要性更新',
    effects: [
      {
        type: 'rankUpdate',
        nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
        newRanks: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        duration: 2500
      }
    ]
  },
  {
    name: '完成',
    description: '动画演示完成',
    effects: [
      {
        type: 'pulse',
        nodes: ['E'],
        duration: 2000,
        intensity: 1.5
      }
    ]
  }
];

export function AnimationTestPage() {
  const [testResults, setTestResults] = useState({
    fps: [],
    renderTime: [],
    memoryUsage: [],
    totalStages: 0,
    completedStages: 0,
    errors: []
  });
  
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentTestStage, setCurrentTestStage] = useState(0);
  const [debugMode, setDebugMode] = useState(true);
  const [enableConstraints, setEnableConstraints] = useState(true);
  const [enableFailureProtection, setEnableFailureProtection] = useState(true);
  const [enableScheduler, setEnableScheduler] = useState(true);

  const handleStageChange = (stage: number) => {
    setCurrentTestStage(stage);
    setTestResults(prev => ({
      ...prev,
      completedStages: stage + 1
    }));
  };

  const handleAnimationComplete = () => {
    setIsTestRunning(false);
    console.log('动画测试完成');
  };

  const handleError = (error: any) => {
    setTestResults(prev => ({
      ...prev,
      errors: [...prev.errors, error]
    }));
    console.error('动画测试错误:', error);
  };

  const runPerformanceTest = async () => {
    setIsTestRunning(true);
    setTestResults({
      fps: [],
      renderTime: [],
      memoryUsage: [],
      totalStages: sampleStages.length,
      completedStages: 0,
      errors: []
    });

    // 模拟性能数据收集
    const collectMetrics = setInterval(() => {
      if (!isTestRunning) {
        clearInterval(collectMetrics);
        return;
      }

      // 模拟性能数据
      const mockFPS = 45 + Math.random() * 15; // 45-60 FPS
      const mockRenderTime = 8 + Math.random() * 12; // 8-20ms
      const mockMemoryUsage = 50 + Math.random() * 30; // 50-80MB

      setTestResults(prev => ({
        ...prev,
        fps: [...prev.fps.slice(-29), mockFPS], // 保持最近30个数据点
        renderTime: [...prev.renderTime.slice(-29), mockRenderTime],
        memoryUsage: [...prev.memoryUsage.slice(-29), mockMemoryUsage]
      }));
    }, 1000);
    
    // 清理函数
    return () => clearInterval(collectMetrics);
  };

  const calculateAverage = (arr: number[]) => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  };

  const getPerformanceGrade = useCallback(() => {
    const avgFPS = calculateAverage(testResults.fps);
    const avgRenderTime = calculateAverage(testResults.renderTime);
    
    if (avgFPS >= 55 && avgRenderTime <= 12) return 'A';
    if (avgFPS >= 45 && avgRenderTime <= 16) return 'B';
    if (avgFPS >= 35 && avgRenderTime <= 20) return 'C';
    return 'D';
  }, [testResults.fps, testResults.renderTime]);

  return (
    <div className="animation-test-page">
      <div className="test-header">
        <h1>动画优化效果测试</h1>
        <p>测试集成动画系统的性能和稳定性</p>
      </div>

      <div className="test-controls">
        <div className="control-section">
          <h3>功能开关</h3>
          <div className="feature-toggles">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
              调试模式
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={enableScheduler}
                onChange={(e) => setEnableScheduler(e.target.checked)}
              />
              动画调度器
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={enableConstraints}
                onChange={(e) => setEnableConstraints(e.target.checked)}
              />
              边界约束
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={enableFailureProtection}
                onChange={(e) => setEnableFailureProtection(e.target.checked)}
              />
              失败保护
            </label>
          </div>
        </div>

        <div className="control-section">
          <h3>测试控制</h3>
          <div className="test-buttons">
            <button
              className="test-button primary"
              onClick={runPerformanceTest}
              disabled={isTestRunning}
            >
              {isTestRunning ? '测试中...' : '开始性能测试'}
            </button>
            <button
              className="test-button secondary"
              onClick={() => setTestResults(prev => ({ ...prev, errors: [] }))}
            >
              清除错误
            </button>
          </div>
        </div>
      </div>

      <div className="test-content">
        <div className="animation-container">
          <IntegratedAnimationSystem
            graphData={sampleGraphData}
            stages={sampleStages}
            onStageChange={handleStageChange}
            onAnimationComplete={handleAnimationComplete}
            onError={handleError}
            width={800}
            height={500}
            enableConstraints={enableConstraints}
            enableFailureProtection={enableFailureProtection}
            enableScheduler={enableScheduler}
            debugMode={debugMode}
          />
        </div>

        <div className="metrics-panel">
          <h3>性能指标</h3>
          
          <div className="metrics-summary">
            <div className="metric-card">
              <div className="metric-label">平均FPS</div>
              <div className="metric-value">
                {calculateAverage(testResults.fps).toFixed(1)}
              </div>
              <div className={`metric-grade grade-${getPerformanceGrade()}`}>
                {getPerformanceGrade()}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">平均渲染时间</div>
              <div className="metric-value">
                {calculateAverage(testResults.renderTime).toFixed(1)}ms
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">内存使用</div>
              <div className="metric-value">
                {(calculateAverage(testResults.memoryUsage) / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">完成进度</div>
              <div className="metric-value">
                {testResults.completedStages}/{testResults.totalStages}
              </div>
            </div>
          </div>

          <div className="metrics-charts">
            <div className="chart-container">
              <h4>FPS趋势</h4>
              <div className="chart">
                {testResults.fps.map((fps, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{
                      height: `${(fps / 60) * 100}%`,
                      backgroundColor: fps >= 50 ? '#4caf50' : fps >= 30 ? '#ff9800' : '#f44336'
                    }}
                    title={`FPS: ${fps.toFixed(1)}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="chart-container">
              <h4>渲染时间</h4>
              <div className="chart">
                {testResults.renderTime.map((time, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{
                      height: `${(time / 25) * 100}%`,
                      backgroundColor: time <= 12 ? '#4caf50' : time <= 20 ? '#ff9800' : '#f44336'
                    }}
                    title={`渲染时间: ${time.toFixed(1)}ms`}
                  />
                ))}
              </div>
            </div>
          </div>

          {testResults.errors.length > 0 && (
            <div className="error-section">
              <h4>错误日志</h4>
              <div className="error-list">
                {testResults.errors.map((error, index) => (
                  <div key={index} className="error-item">
                    {error.message || error.toString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="test-summary">
        <h3>测试结果总结</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">测试状态:</span>
            <span className={`summary-value status-${isTestRunning ? 'running' : testResults.errors.length > 0 ? 'error' : 'completed'}`}>
              {isTestRunning ? '运行中' : testResults.errors.length > 0 ? '有错误' : '已完成'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">性能等级:</span>
            <span className={`summary-value grade-${getPerformanceGrade()}`}>
              {getPerformanceGrade()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">错误数量:</span>
            <span className="summary-value">
              {testResults.errors.length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">当前阶段:</span>
            <span className="summary-value">
              {sampleStages && sampleStages[currentTestStage]?.name || '未开始'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}