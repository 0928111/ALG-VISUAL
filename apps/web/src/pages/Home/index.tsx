import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import coursesData from '../../data/courses.json'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { courses } = coursesData

  const handleCourseClick = (courseId: string, enabled: boolean) => {
    if (enabled) {
      navigate(`/course/${courseId}`)
    }
  }

  const handleDemoClick = () => {
    navigate('/demo')
  }

  return (
    <div className="home">
      <Navigation />
      <div className="home-container">
        <header className="home-header">
          <h1 className="home-title">算法可视化学习平台</h1>
          <p className="home-subtitle">通过交互式可视化学习经典算法</p>
          <button className="demo-button" onClick={handleDemoClick}>
            🎯 查看可视化演示
          </button>
        </header>

        <div className="courses-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`course-card ${course.enabled ? 'enabled' : 'disabled'}`}
              onClick={() => handleCourseClick(course.id, course.enabled)}
            >
              <div className="course-icon" style={{ backgroundColor: course.color }}>
                {course.icon}
              </div>
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="course-difficulty">{course.difficulty}</span>
                  <span className="course-duration">{course.duration}</span>
                </div>
              </div>
              {!course.enabled && (
                <div className="coming-soon-badge">即将上线</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home