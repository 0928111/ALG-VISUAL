import { useNavigate, useLocation } from 'react-router-dom'
import './Navigation.css'

interface NavigationProps {
  courseTitle?: string
  courseId?: string
}

function Navigation({ courseTitle, courseId }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isCoursePage = location.pathname.includes('/course/')

  const handleBackToHome = () => {
    navigate('/')
  }

  const getPageTitle = () => {
    if (isCoursePage && courseTitle) {
      return courseTitle
    }
    return '算法可视化学习平台'
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          {isCoursePage && (
            <button 
              className="nav-back-btn"
              onClick={handleBackToHome}
              title="返回主页"
            >
              ← 返回
            </button>
          )}
          <div className="nav-logo" onClick={handleBackToHome}>
            <span className="nav-logo-icon">🎯</span>
            <span className="nav-logo-text">AlgoLearn</span>
          </div>
        </div>
        
        <div className="nav-center">
          <h1 className="nav-title">{getPageTitle()}</h1>
          {isCoursePage && courseId && (
            <span className="nav-course-id">课程: {courseId}</span>
          )}
        </div>

        <div className="nav-right">
          <div className="nav-actions">
            <button className="nav-btn" title="帮助">
              ❓
            </button>
            <button className="nav-btn" title="设置">
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation