import { highlightNode, clearHighlight, nextStep, prevStep, reset, setPlaying, setStep, setSpeed } from '../../apps/web/src/store/simulatorSlice'

// ==================== 模拟器智能体接口（原有功能） ====================

// 动态获取store实例，避免循环依赖
function getStore() {
  try {
    // @ts-ignore
    return window.__REDUX_STORE__ || require('../../apps/web/src/store').store
  } catch (error) {
    console.warn('Failed to get Redux store:', error)
    return null
  }
}

export interface AgentMessage {
  action: string
  node?: string
  step?: number
  speed?: number
  data?: any
}

/**
 * 处理来自智能体的消息（用于控制模拟器）
 */
export function handleAgentMessage(message: string | AgentMessage) {
  try {
    let parsedMessage: AgentMessage
    
    if (typeof message === 'string') {
      parsedMessage = JSON.parse(message) as AgentMessage
    } else {
      parsedMessage = message
    }

    console.log('Received agent message:', parsedMessage)

    // 使用setTimeout确保在下一个事件循环中执行，避免潜在的循环依赖问题
    setTimeout(() => {
      try {
        const store = getStore()
        if (!store) {
          console.error('Redux store not available')
          return
        }

        switch (parsedMessage.action) {
          case 'highlight':
            if (parsedMessage.node) {
              store.dispatch(highlightNode(parsedMessage.node))
            }
            break
            
          case 'clearHighlight':
            store.dispatch(clearHighlight())
            break
            
          case 'nextStep':
            store.dispatch(nextStep())
            break
            
          case 'prevStep':
            store.dispatch(prevStep())
            break
            
          case 'reset':
            store.dispatch(reset())
            break
            
          case 'play':
            store.dispatch(setPlaying(true))
            break
            
          case 'pause':
            store.dispatch(setPlaying(false))
            break
            
          case 'setStep':
            if (parsedMessage.step !== undefined) {
              store.dispatch(setStep(parsedMessage.step))
            }
            break
            
          case 'setSpeed':
            if (parsedMessage.speed !== undefined) {
              store.dispatch(setSpeed(parsedMessage.speed))
            }
            break
            
          default:
            console.warn('Unknown agent action:', parsedMessage.action)
        }
      } catch (dispatchError) {
        console.error('Failed to dispatch action:', dispatchError)
      }
    }, 0)
  } catch (error) {
    console.error('Failed to handle agent message:', error)
  }
}

/**
 * 创建智能体消息
 */
export function createAgentMessage(action: string, data?: any): AgentMessage {
  return {
    action,
    ...data
  }
}

/**
 * 模拟智能体消息（用于测试）
 */
export function simulateAgentMessage(action: string | AgentMessage, node?: string) {
  if (typeof action === 'string') {
    const message: AgentMessage = {
      action,
      ...(node && { node })
    }
    handleAgentMessage(message)
  } else {
    handleAgentMessage(action)
  }
}

// ==================== 可视化智能体接口（新增功能） ====================

// 导出可视化智能体接口和执行器
export * from './visualization-agent-interface';
export * from './visualization-agent-executor';