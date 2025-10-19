/**
 * 智能体交互面板组件
 * 
 * 提供一个用户界面，允许用户通过自然语言描述调整图可视化效果
 */

import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  buildAgentInputFromState,
  mockVisualizationAgent,
  validateAgentResponse,
  type AgentOutputResponse
} from '../../../../packages/agent-bridge/visualization-agent-interface';
import { executeAgentResponse } from '../../../../packages/agent-bridge/visualization-agent-executor';
import type { GraphViewZoneRef } from '../EnhancedPageRankVisualization/GraphViewZone';
import type { RootState } from '../../store';
import './AgentPanel.css';

interface AgentPanelProps {
  graphViewRef: React.RefObject<GraphViewZoneRef>;
  currentConfig?: any;
  zoomLevel?: number;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  graphViewRef,
  currentConfig = {},
  zoomLevel = 1
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{
    query: string;
    response: AgentOutputResponse;
    timestamp: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // 从Redux获取当前图数据
  const graphData = useSelector((state: RootState) => state.graphData?.data || { nodes: [], edges: [] });

  // 预设示例
  const examples = [
    "增大节点A的PageRank值",
    "将所有边的权重调整为10",
    "把节点A改成红色",
    "让节点之间更加紧凑",
    "高亮显示节点A",
    "放大视图",
    "将节点排列成圆形"
  ];

  const handleSubmit = async () => {
    if (!input.trim() || !graphData || !graphData.nodes || !graphData.edges) {
      return;
    }

    setLoading(true);

    try {
      // 1. 构建智能体输入
      const agentInput = buildAgentInputFromState({
        graphData: {
          nodes: graphData.nodes,
          edges: graphData.edges
        },
        currentConfig,
        viewState: {
          zoomLevel,
          centerPosition: [currentConfig.width / 2 || 450, currentConfig.height / 2 || 350],
          selectedNodes: [],
          highlightedEdges: []
        },
        userDescription: input
      });

      console.log('🤖 发送到智能体:', agentInput);

      // 2. 调用智能体（当前使用模拟版本）
      const response = mockVisualizationAgent(agentInput);

      console.log('📤 智能体响应:', response);

      // 3. 验证响应
      const validation = validateAgentResponse(response);
      if (!validation.valid) {
        console.error('❌ 响应验证失败:', validation.errors);
        setHistory(prev => [...prev, {
          query: input,
          response: {
            ...response,
            success: false,
            message: `验证失败: ${validation.errors.join(', ')}`
          },
          timestamp: Date.now()
        }]);
        setLoading(false);
        return;
      }

      // 4. 执行响应
      if (graphViewRef.current) {
        await executeAgentResponse(response, {
          currentGraphData: graphData,
          graphViewRef: graphViewRef.current,
          onExecutionStart: () => {
            console.log('🚀 开始执行智能体指令');
          },
          onExecutionComplete: (success: boolean, message: string) => {
            console.log(success ? '✅' : '❌', message);
            setHistory(prev => [...prev, {
              query: input,
              response,
              timestamp: Date.now()
            }]);
            setLoading(false);
          },
          onError: (error: Error) => {
            console.error('❌ 执行失败:', error);
            setHistory(prev => [...prev, {
              query: input,
              response: {
                ...response,
                success: false,
                message: `执行失败: ${error.message}`
              },
              timestamp: Date.now()
            }]);
            setLoading(false);
          }
        });
      }

      // 清空输入
      setInput('');

    } catch (error) {
      console.error('❌ 处理智能体请求时出错:', error);
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`agent-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="agent-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>🤖 智能体助手</h3>
        <button className="toggle-button">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="agent-panel-content">
          {/* 输入区域 */}
          <div className="input-section">
            <textarea
              className="agent-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="描述你想要的调整，例如：增大节点A的PageRank值"
              disabled={loading || !graphData}
              rows={3}
            />
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={loading || !input.trim() || !graphData}
            >
              {loading ? '⏳ 处理中...' : '✨ 执行'}
            </button>
          </div>

          {/* 示例区域 */}
          <div className="examples-section">
            <div className="examples-label">💡 试试这些示例：</div>
            <div className="examples-grid">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="example-button"
                  onClick={() => handleExampleClick(example)}
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* 历史记录区域 */}
          {history.length > 0 && (
            <div className="history-section">
              <div className="history-label">📜 执行历史：</div>
              <div className="history-list">
                {history.slice().reverse().map((item, index) => (
                  <div
                    key={index}
                    className={`history-item ${item.response.success ? 'success' : 'failure'}`}
                  >
                    <div className="history-query">
                      <span className="query-icon">💬</span>
                      {item.query}
                    </div>
                    <div className="history-response">
                      <span className={`status-icon ${item.response.success ? 'success' : 'failure'}`}>
                        {item.response.success ? '✅' : '❌'}
                      </span>
                      {item.response.message}
                    </div>
                    <div className="history-timestamp">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 提示信息 */}
          {!graphData && (
            <div className="warning-message">
              ⚠️ 请先加载图数据
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentPanel;
