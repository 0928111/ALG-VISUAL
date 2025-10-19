import React, { useEffect, useState } from 'react';

function DebugPage() {
  const [status, setStatus] = useState<string>('正在检查...');
  const [graphData, setGraphData] = useState<any>(null);
  const [stepsData, setStepsData] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // 捕获控制台日志
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      setConsoleLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      setConsoleLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalError.apply(console, args);
    };
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    setStatus('正在加载数据文件...');
    
    // 测试数据文件加载
    Promise.all([
      fetch('/data/pagerank-graph-data.json').then(res => {
        console.log('图数据响应状态:', res.status, res.statusText);
        return res;
      }),
      fetch('/data/pagerank-steps.json').then(res => {
        console.log('步骤数据响应状态:', res.status, res.statusText);
        return res;
      })
    ])
    .then(([graphRes, stepsRes]) => {
      if (!graphRes.ok) throw new Error(`图数据加载失败: ${graphRes.status}`);
      if (!stepsRes.ok) throw new Error(`步骤数据加载失败: ${stepsRes.status}`);
      
      return Promise.all([graphRes.json(), stepsRes.json()]);
    })
    .then(([graph, steps]) => {
      setGraphData(graph);
      setStepsData(steps);
      setStatus('✅ 所有数据文件加载成功');
      console.log('图数据:', graph);
      console.log('步骤数据:', steps);
    })
    .catch(error => {
      setStatus(`❌ 数据加载失败: ${error.message}`);
      console.error('数据加载错误:', error);
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 调试页面</h1>
      <div style={{ 
        backgroundColor: status.includes('❌') ? '#fee' : '#efe', 
        padding: '10px', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        {status}
      </div>
      
      {graphData && (
        <div style={{ marginBottom: '20px' }}>
          <h3>图数据概览:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            {JSON.stringify(graphData, null, 2).substring(0, 500)}...
          </pre>
        </div>
      )}
      
      {stepsData && (
        <div style={{ marginBottom: '20px' }}>
          <h3>步骤数据概览:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            步骤数: {stepsData.steps?.length || 0}
            {stepsData.steps && stepsData.steps.length > 0 && (
              <div>第一步: {JSON.stringify(stepsData.steps[0], null, 2).substring(0, 200)}...
              </div>
            )}
          </pre>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h3>控制台日志:</h3>
        <div style={{ 
          background: '#000', 
          color: '#0f0', 
          padding: '10px', 
          borderRadius: '4px', 
          fontSize: '12px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {consoleLogs.length === 0 ? (
            <div>等待日志...</div>
          ) : (
            consoleLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ marginRight: '10px' }}>🏠 返回主页</a>
        <a href="/course/pagerank" style={{ marginRight: '10px' }}>📊 PageRank</a>
        <a href="/test-threejs">🎯 Three.js测试</a>
      </div>
    </div>
  );
}

export default DebugPage;