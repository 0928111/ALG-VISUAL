import { useState } from 'react'
import './PageRankSidebar.css'

function PageRankSidebar() {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'formula'>('overview')

  const overviewContent = {
    title: 'PageRank 算法概述',
    description: 'PageRank是一种由Google创始人Larry Page和Sergey Brin开发的链接分析算法，用于评估网页的重要性。',
    keyPoints: [
      '基于网页之间的链接关系计算排名',
      '每个页面的排名值会分配到其出链页面',
      '考虑阻尼因子模拟用户浏览行为',
      '迭代计算直到收敛到稳定状态'
    ]
  }

  const stepsContent = [
    { id: 1, title: '初始化', description: '为所有页面设置初始PageRank值' },
    { id: 2, title: '链接分析', description: '分析页面之间的链接关系' },
    { id: 3, title: '排名计算', description: '根据链接关系重新计算PageRank值' },
    { id: 4, title: '阻尼处理', description: '应用阻尼因子处理排名泄漏' },
    { id: 5, title: '迭代收敛', description: '重复计算直到排名值收敛' }
  ]

  const formulaContent = {
    title: 'PageRank 公式',
    formula: 'PR(A) = (1-d) + d × Σ(PR(Ti)/C(Ti))',
    explanation: [
      'PR(A): 页面A的PageRank值',
      'd: 阻尼因子(通常设为0.85)',
      'Ti: 链接到页面A的页面',
      'C(Ti): 页面Ti的出链数量'
    ]
  }

  return (
    <div className="pagerank-sidebar">
      <div className="sidebar-header">
        <h3>PageRank 学习指南</h3>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📚 概述
        </button>
        <button 
          className={`tab-btn ${activeTab === 'steps' ? 'active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          📝 步骤
        </button>
        <button 
          className={`tab-btn ${activeTab === 'formula' ? 'active' : ''}`}
          onClick={() => setActiveTab('formula')}
        >
          🔢 公式
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h4>{overviewContent.title}</h4>
            <p className="overview-description">{overviewContent.description}</p>
            <div className="key-points">
              <h5>核心概念：</h5>
              <ul>
                {overviewContent.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="steps-section">
            <h4>算法执行步骤</h4>
            <div className="steps-list">
              {stepsContent.map((step) => (
                <div key={step.id} className="step-item">
                  <div className="step-number">{step.id}</div>
                  <div className="step-content">
                    <h5>{step.title}</h5>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'formula' && (
          <div className="formula-section">
            <h4>{formulaContent.title}</h4>
            <div className="formula-box">
              <code>{formulaContent.formula}</code>
            </div>
            <div className="formula-explanation">
              <h5>参数说明：</h5>
              <ul>
                {formulaContent.explanation.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="learning-tips">
          <h5>💡 学习提示</h5>
          <ul>
            <li>观察链接关系如何影响排名</li>
            <li>注意阻尼因子的作用</li>
            <li>理解迭代收敛过程</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PageRankSidebar