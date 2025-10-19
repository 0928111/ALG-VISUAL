import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { highlightNode } from '../../store/simulatorSlice'
import { STEP_MAPPING, getNodeIdByStep } from "../../../../../packages/simulators/pagerank/mapping";
import './FlowchartView.css'

interface FlowNode {
  id: string
  title: string
  description: string
  icon: string
  x: number
  y: number
}

function FlowchartView() {
  const { step, highlightedNode } = useSelector((state: RootState) => state.simulator)
  const dispatch = useDispatch()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // 定义流程节点位置
  const flowNodes: FlowNode[] = [
    { id: STEP_MAPPING.STEP_1, title: '抓取网页', description: '获取所有网页内容', icon: '🕷️', x: 140, y: 50 },
    { id: STEP_MAPPING.STEP_2, title: '分析链接', description: '提取页面间链接关系', icon: '🔗', x: 140, y: 120 },
    { id: STEP_MAPPING.STEP_3, title: '重新分配', description: '计算新的PageRank值', icon: '📊', x: 140, y: 190 },
    { id: STEP_MAPPING.STEP_4, title: '存储结果', description: '保存更新后的排名', icon: '💾', x: 140, y: 260 },
    { id: STEP_MAPPING.STEP_5, title: '迭代计算', description: '重复计算过程', icon: '🔄', x: 140, y: 330 },
    { id: STEP_MAPPING.STEP_6, title: '收敛检查', description: '判断是否达到稳定状态', icon: '✅', x: 140, y: 400 },
    { id: STEP_MAPPING.STEP_7, title: '归一化', description: '标准化最终排名', icon: '📈', x: 140, y: 470 },
    { id: STEP_MAPPING.STEP_8, title: '完成', description: '输出最终PageRank结果', icon: '🎯', x: 140, y: 540 }
  ]

  useEffect(() => {
    const nodeId = getNodeIdByStep(step)
    if (nodeId) {
      dispatch(highlightNode(nodeId))
    }
  }, [step, dispatch])

  const handleNodeClick = (nodeId: string) => {
    dispatch(highlightNode(nodeId))
  }

  const isNodeActive = (nodeId: string) => {
    const nodeIndex = flowNodes.findIndex(node => node.id === nodeId)
    const currentStepIndex = flowNodes.findIndex(node => node.id === getNodeIdByStep(step))
    return nodeIndex <= currentStepIndex
  }

  const isNodeHighlighted = (nodeId: string) => {
    return highlightedNode === nodeId
  }

  return (
    <div className="flowchart-view">
      <div className="flowchart-header">
        <h3>PageRank 算法流程图</h3>
        <div className="flowchart-info">
          <span className="step-indicator">步骤 {step}/8</span>
          {highlightedNode && (
            <span className="current-node">当前节点: {highlightedNode}</span>
          )}
        </div>
      </div>

      <div className="flowchart-container">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="600" 
          viewBox="0 0 280 600"
          className="flowchart-svg"
        >
          {/* 定义渐变和滤镜 */}
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
            
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#f7931e" />
            </linearGradient>
            
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ffed4e" />
            </linearGradient>
            
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feFlood floodColor="#000000" floodOpacity="0.2"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* 箭头标记 */}
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
             refX="9" refY="3.5" orient="auto">
              <polygon 
                points="0 0, 10 3.5, 0 7" 
                fill="#8b92a9" 
              />
            </marker>
            
            <marker id="arrowheadActive" markerWidth="10" markerHeight="7" 
             refX="9" refY="3.5" orient="auto">
              <polygon 
                points="0 0, 10 3.5, 0 7" 
                fill="#ff6b35" 
              />
            </marker>
          </defs>
          
          {/* 连接线 */}
          {flowNodes.map((node, index) => {
            if (index === flowNodes.length - 1) return null
            
            const nextNode = flowNodes[index + 1]
            const isActive = isNodeActive(node.id)
            
            return (
              <line
                key={`line-${node.id}`}
                x1={node.x}
                y1={node.y + 30}
                x2={nextNode.x}
                y2={nextNode.y - 30}
                stroke={isActive ? "#ff6b35" : "#8b92a9"}
                strokeWidth={isActive ? "3" : "2"}
                strokeDasharray={isActive ? "0" : "5,5"}
                markerEnd={`url(#${isActive ? 'arrowheadActive' : 'arrowhead'})`}
                className={isActive ? "flow-line active" : "flow-line"}
              />
            )
          })}
          
          {/* 循环连接线 (从迭代计算回到重新分配) */}
          <path
            d="M 170 330 Q 230 330 230 210 Q 230 190 170 190"
            fill="none"
            stroke={isNodeActive(STEP_MAPPING.STEP_5) ? "#ff6b35" : "#8b92a9"}
            strokeWidth={isNodeActive(STEP_MAPPING.STEP_5) ? "2" : "1.5"}
            strokeDasharray={isNodeActive(STEP_MAPPING.STEP_5) ? "0" : "5,5"}
            markerEnd={`url(#${isNodeActive(STEP_MAPPING.STEP_5) ? 'arrowheadActive' : 'arrowhead'})`}
            className={isNodeActive(STEP_MAPPING.STEP_5) ? "flow-line active" : "flow-line"}
          />
          
          {/* 循环标签 */}
          {isNodeActive(STEP_MAPPING.STEP_5) && (
            <text x="240" y="265" fill="#ff6b35" fontSize="12" textAnchor="middle">
              未收敛
            </text>
          )}
          
          {/* 节点 */}
          {flowNodes.map((node) => {
            const isActive = isNodeActive(node.id)
            const isHighlighted = isNodeHighlighted(node.id)
            const isHovered = hoveredNode === node.id
            
            return (
              <g key={node.id} className="flow-node-group">
                {/* 节点背景 */}
                <rect
                  x={node.x - 100}
                  y={node.y - 30}
                  width="200"
                  height="60"
                  rx="12"
                  fill={
                    isHighlighted 
                      ? "url(#highlightGradient)" 
                      : isActive 
                        ? "url(#activeGradient)" 
                        : "white"
                  }
                  stroke={
                    isHighlighted 
                      ? "#ff6b35" 
                      : isActive 
                        ? "#ff6b35" 
                        : "#e2e8f0"
                  }
                  strokeWidth={isHighlighted ? "3" : isActive ? "2" : "1"}
                  filter={isHighlighted ? "url(#glow)" : "url(#shadow)"}
                  className="flow-node-rect"
                  style={{
                    cursor: 'pointer',
                    transform: isHighlighted || isHovered ? 'scale(1.03)' : 'scale(1)',
                    transformOrigin: `${node.x}px ${node.y}px`,
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                
                {/* 节点图标背景 */}
                <circle
                  cx={node.x - 70}
                  cy={node.y}
                  r="18"
                  fill={isActive ? "white" : "url(#nodeGradient)"}
                  className="flow-node-icon-bg"
                />
                
                {/* 节点图标文字 */}
                <text
                  x={node.x - 70}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize="18"
                  className="flow-node-icon"
                >
                  {node.icon}
                </text>
                
                {/* 节点标题 */}
                <text
                  x={node.x - 30}
                  y={node.y - 5}
                  fontSize="14"
                  fontWeight="600"
                  fill={isActive ? "white" : "#2c3e50"}
                  className="flow-node-title"
                >
                  {node.title}
                </text>
                
                {/* 节点描述 */}
                <text
                  x={node.x - 30}
                  y={node.y + 12}
                  fontSize="11"
                  fill={isActive ? "rgba(255,255,255,0.8)" : "#7f8c8d"}
                  className="flow-node-desc"
                >
                  {node.description}
                </text>
              </g>
            )
          })}
        </svg>
        
        <div className="flowchart-legend">
          <div className="legend-item">
            <div className="legend-color highlighted"></div>
            <span>当前步骤</span>
          </div>
          <div className="legend-item">
            <div className="legend-color active"></div>
            <span>已完成步骤</span>
          </div>
          <div className="legend-item">
            <div className="legend-color"></div>
            <span>待执行步骤</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlowchartView