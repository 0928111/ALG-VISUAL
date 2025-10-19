import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { nextStep, prevStep, reset, setPlaying, setSpeed } from '../../store/simulatorSlice'
import './Controls.css'

interface ControlsProps {
  onCollapseChange?: (collapsed: boolean) => void; // 添加收起状态回调
}

function Controls({ onCollapseChange }: ControlsProps) {
  const { step, totalSteps, isPlaying, speed } = useSelector((state: RootState) => state.simulator)
  const dispatch = useDispatch()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 监听收起状态变化
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  // 现代控制器 - 直接集成到Redux状态管理
  const handlePlayPause = useCallback(() => {
    if (step >= totalSteps) {
      dispatch(reset())
      setTimeout(() => dispatch(setPlaying(true)), 100)
    } else {
      dispatch(setPlaying(!isPlaying))
    }
  }, [step, totalSteps, isPlaying, dispatch])

  const handleNextStep = useCallback(() => {
    if (step < totalSteps) {
      dispatch(nextStep())
    }
  }, [step, totalSteps, dispatch])

  const handlePrevStep = useCallback(() => {
    if (step > 0) {
      dispatch(prevStep())
    }
  }, [step, dispatch])

  const handleReset = useCallback(() => {
    dispatch(reset())
  }, [dispatch])

  const handleSpeedChange = useCallback((newSpeed: number) => {
    dispatch(setSpeed(newSpeed))
  }, [dispatch])

  // 自动播放逻辑 - 现代简洁实现
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        dispatch(nextStep())
      }, 1000 / speed)
      return () => clearInterval(interval)
    }
  }, [isPlaying, speed, dispatch])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          handlePlayPause()
          break
        case 'arrowright':
          e.preventDefault()
          handleNextStep()
          break
        case 'arrowleft':
          e.preventDefault()
          handlePrevStep()
          break
        case 'r':
          e.preventDefault()
          handleReset()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, step, totalSteps])

  return (
    <div className={`controls ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="controls-header">
        <h3>控制面板</h3>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(v => !v)}
          title={isCollapsed ? '展开' : '收起'}
        >
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="controls-content">
          <div className="controls-main">
            {/* 现代控制面板 - 采用最新设计方法 */}
            <div className="playback-controls">
              <button 
                className="control-btn reset-btn"
                onClick={handleReset}
                title="重置 (R)"
              >
                重置
              </button>
              
              <button 
                className="control-btn prev-btn"
                onClick={handlePrevStep}
                disabled={step === 0 || isPlaying}
                title="上一步 (←)"
              >
                上一步
              </button>
              
              <button 
                className={`control-btn play-pause-btn ${isPlaying ? 'playing active' : 'paused'}`}
                onClick={handlePlayPause}
                title="播放/暂停 (空格)"
              >
                {isPlaying ? '暂停' : '播放'}
              </button>
              
              <button 
                className="control-btn next-btn"
                onClick={handleNextStep}
                disabled={step >= totalSteps || isPlaying}
                title="下一步 (→)"
              >
                下一步
              </button>
            </div>

            <div className="speed-control">
              <label className="speed-label">播放速度:</label>
              <div className="speed-buttons">
                {[0.25, 0.5, 1, 1.5, 2].map((speedValue) => (
                  <button
                    key={speedValue}
                    className={`speed-btn ${speed === speedValue ? 'active' : ''}`}
                    onClick={() => handleSpeedChange(speedValue)}
                  >
                    {speedValue}x
                  </button>
                ))}
              </div>
            </div>

            <div className="progress-info">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                步骤 {step} / {totalSteps}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Controls