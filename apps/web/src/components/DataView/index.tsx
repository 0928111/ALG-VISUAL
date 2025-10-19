import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import './DataView.css'

interface DataViewProps {
  currentStep?: number;
}

function DataView({ currentStep = 0 }: DataViewProps) {
  const { step, prValues } = useSelector((state: RootState) => state.simulator)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [step])

  const totalNodes = prValues.length
  const totalLinks = 6 // 模拟链接数
  const avgRank = prValues.reduce((sum, node) => sum + node.value, 0) / totalNodes

  return (
    <div className="data-view">
      <div className="data-header">
        <h3>数据面板</h3>
        <div className="step-info">
          <span className="step-label">当前步骤:</span>
          <span className="step-value">{currentStep > 0 ? currentStep : step}</span>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-label">网页数量</div>
          <div className="stat-value">{totalNodes}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">链接总数</div>
          <div className="stat-value">{totalLinks}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">平均排名</div>
          <div className="stat-value">{avgRank.toFixed(3)}</div>
        </div>
      </div>

      <div className="pagerank-section">
        <h4>PageRank 值</h4>
        <div className="pagerank-list">
          {prValues.map((node) => (
            <div key={node.id} className={`pagerank-item ${isAnimating ? 'animating' : ''}`}>
              <div className="node-info">
                <span className="node-name">{node.name}</span>
                <span className="node-value">{node.value.toFixed(3)}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${node.value * 100}%`,
                    transition: isAnimating ? 'width 0.3s ease-in-out' : 'none'
                  }}
                />
              </div>
              <div className="value-change">
                {node.value > node.prevValue && (
                  <span className="change-up">↗ {(node.value - node.prevValue).toFixed(3)}</span>
                )}
                {node.value < node.prevValue && (
                  <span className="change-down">↘ {(node.prevValue - node.value).toFixed(3)}</span>
                )}
                {node.value === node.prevValue && step > 0 && (
                  <span className="change-same">→ 0.000</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="step-details">
        <h4>步骤详情</h4>
        <div className="step-description">
          {step === 0 && "初始化所有网页的PageRank值为0.25"}
          {step === 1 && "抓取所有网页并分析链接关系"}
          {step === 2 && "重新分配PageRank值"}
          {step === 3 && "统计和存储新的PageRank值"}
          {step === 4 && "进行下一次迭代计算"}
          {step === 5 && "检查是否收敛"}
          {step === 6 && "归一化PageRank值"}
          {step === 7 && "完成PageRank计算"}
          {step === 8 && "PageRank算法执行完成"}
          {step > 8 && "算法执行完成"}
        </div>
      </div>
    </div>
  )
}

export default DataView