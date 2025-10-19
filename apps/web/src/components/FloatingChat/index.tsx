import { useState, useEffect, useRef } from 'react'
import { simulateAgentMessage } from '../../../../../packages/agent-bridge'
import './FloatingChat.css'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // 添加欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: '你好！我是智能体助手，可以帮助你理解PageRank算法。你可以问我关于算法步骤、节点状态或请求高亮显示特定步骤。',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // 发送消息到智能体
    try {
      // 尝试解析JSON格式
      const parsed = JSON.parse(inputMessage)
      simulateAgentMessage(parsed.action, parsed.node)
    } catch (error) {
      // 如果不是JSON格式，直接发送字符串
      simulateAgentMessage(inputMessage)
    }

    // 模拟智能体响应
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `收到指令: ${inputMessage}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)
    }, 1000)
  }

  const getSmartResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('高亮') || lowerInput.includes('highlight')) {
      return '已为您高亮显示相关步骤。您可以通过输入具体的步骤名称来获取更详细的信息。'
    } else if (lowerInput.includes('下一步') || lowerInput.includes('next')) {
      return '已执行下一步操作。PageRank算法正在逐步计算中，每个步骤都会影响网页的排名。'
    } else if (lowerInput.includes('重置') || lowerInput.includes('reset')) {
      return '已重置算法状态。所有网页的PageRank值已恢复到初始状态。'
    } else if (lowerInput.includes('pagerank') || lowerInput.includes('排名')) {
      return 'PageRank是一种链接分析算法，用于评估网页的重要性。它通过分析网页之间的链接关系来计算排名。'
    } else if (lowerInput.includes('链接') || lowerInput.includes('link')) {
      return '链接分析是PageRank的核心。每个页面的排名值会根据其入链和出链进行重新分配。'
    } else {
      return '我理解您的询问。您可以输入JSON格式的指令，如：{"action":"highlight","node":"FETCH_PAGES"}，或者直接提问关于算法的问题。'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickCommands = [
    { text: '高亮抓取步骤', action: '{"action":"highlight","node":"FETCH_PAGES"}' },
    { text: '下一步', action: '{"action":"nextStep"}' },
    { text: '重置算法', action: '{"action":"reset"}' },
    { text: '什么是PageRank？', action: '什么是PageRank？' }
  ]

  // 拖拽功能状态
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 80 }) // 增加y值，避免与导航栏重叠
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const chatWindowRef = useRef<HTMLDivElement>(null)

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOpen) return
    
    const chatWindow = chatWindowRef.current
    if (!chatWindow) return

    const rect = chatWindow.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
    e.preventDefault()
  }

  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // 边界检测
      const maxX = window.innerWidth - 380 // 聊天窗口宽度
      const maxY = window.innerHeight - 600 // 聊天窗口高度

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, dragOffset])

  const handleQuickCommand = (command: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: command,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)
    
    // 发送消息到智能体
    try {
      // 尝试解析JSON格式
      const parsed = JSON.parse(command)
      simulateAgentMessage(parsed.action, parsed.node)
    } catch (error) {
      // 如果不是JSON格式，直接发送字符串
      simulateAgentMessage(command)
    }
    
    // 模拟智能体响应
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `执行命令: ${command}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentResponse])
      setIsTyping(false)
    }, 1000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div 
      className={`floating-chat ${isOpen ? 'open' : 'closed'}`}
      style={{
        position: 'fixed',
        left: `${position.x + (isOpen ? 320 : 0)}px`, // 聊天窗口打开时调整按钮位置
        top: `${position.y + (isOpen ? 520 : 0)}px`, // 避免与聊天窗口重叠
        right: 'auto',
        bottom: 'auto',
        zIndex: 1001
      }}
    >
      {/* 浮动按钮 */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? '关闭聊天' : '打开智能体助手'}
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={`chat-window ${isDragging ? 'dragging' : ''}`}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            right: 'auto',
            bottom: 'auto'
          }}

        >
          {/* 聊天头部 */}
          <div className="chat-header" onMouseDown={handleMouseDown}>
            <div className="chat-title">
              <span className="chat-avatar">🤖</span>
              <div className="chat-info">
                <h3>智能体助手</h3>
                <span className="chat-status">
                  {isTyping ? '正在输入...' : '在线'}
                </span>
              </div>
            </div>
            <button 
              className="minimize-btn"
              onClick={() => setIsOpen(false)}
              title="最小化"
            >
              －
            </button>
            <div className="drag-handle" title="拖拽移动">⋮⋮</div>
          </div>

          {/* 消息区域 */}
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message agent typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷命令 */}
          <div className="quick-commands">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                className="quick-command-btn"
                onClick={() => handleQuickCommand(cmd.action)}
                title={`快速执行: ${cmd.text}`}
              >
                {cmd.text}
              </button>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="input-area">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="输入消息或JSON指令..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              title="发送消息"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingChat