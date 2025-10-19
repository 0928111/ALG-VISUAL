import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Home from './pages/Home'
import Course from './pages/Course'
import PageRankCourse from './pages/PageRankCourse'
import LabelCollisionDemo from './components/LabelCollisionDemo'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        <Route path="/course/:courseId" element={<Course />} />
        <Route path="/course/pagerank" element={<PageRankCourse />} />
        <Route path="/label-collision-demo" element={<LabelCollisionDemo />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App