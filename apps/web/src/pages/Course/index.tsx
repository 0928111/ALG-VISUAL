import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { reset } from '../../store/simulatorSlice'
import { RootState } from '../../store'
import Navigation from '../../components/Navigation'
import DataView from '../../components/DataView'
import FlowchartView from '../../components/FlowchartView'
import Controls from '../../components/Controls'
import FloatingChat from '../../components/FloatingChat'
// import DynamicGraphView from '../../components/DynamicGraphView'
// import EnhancedPageRankVisualization from '../../components/EnhancedPageRankVisualization'
import './Course.css'

function Course() {
  const { courseId } = useParams<{ courseId: string }>()
  const dispatch = useDispatch()
  const [courseTitle, setCourseTitle] = useState('算法教学')
  const { nodes } = useSelector((state: RootState) => state.simulator)

  useEffect(() => {
    // 重置模拟器状态
    dispatch(reset())
    
    // 根据courseId设置课程标题
    const courseNames: { [key: string]: string } = {
      'pagerank': 'PageRank 算法',
      'dijkstra': 'Dijkstra 算法',
      'sliding-window': '滑动窗口算法'
    }
    setCourseTitle(courseNames[courseId || ''] || '算法教学')
  }, [dispatch, courseId])

  // 为新的单向带权图渲染器准备数据 - 使用正确的数据格式
  const graphNodes = useMemo(() => {
    return nodes.map(node => ({
      id: node.id,
      label: node.name,
      rank: node.value,
      prValue: node.value, // 添加prValue字段用于渲染
      isActive: node.value > 0.25 // 根据PageRank值设置活跃状态
    }));
  }, [nodes]);

  const graphLinks = useMemo(() => {
    return [
      { id: 'edge-A-C', source: 'A', target: 'C', weight: 0.5, direction: 'out' as const },
      { id: 'edge-B-A', source: 'B', target: 'A', weight: 0.8, direction: 'out' as const },
      { id: 'edge-B-D', source: 'B', target: 'D', weight: 0.3, direction: 'out' as const },
      { id: 'edge-C-D', source: 'C', target: 'D', weight: 0.6, direction: 'out' as const },
      { id: 'edge-D-A', source: 'D', target: 'A', weight: 0.4, direction: 'out' as const },
      { id: 'edge-D-C', source: 'D', target: 'C', weight: 0.7, direction: 'out' as const }
    ];
  }, []);

  return (
    <div className="course-page">
      <Navigation courseTitle={courseTitle} courseId={courseId || 'default'} />
      
      <div className="course-content">
        <div className="course-main-layout">
          <div className="course-left-panel">
            <DataView />
          </div>
          <div className="course-center-panel">
            <div className="visualization-placeholder">
              <p>可视化区域</p>
              <a href="/label-collision-demo" target="_blank" rel="noopener noreferrer">
                查看标签碰撞演示
              </a>
            </div>
          </div>
          <div className="course-right-panel">
            <FlowchartView />
          </div>
        </div>
        <div className="course-bottom-panel">
          <Controls />
        </div>
      </div>
      
      <FloatingChat />
    </div>
  )
}

export default Course