import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectSpec } from '../../store/graphSpecSlice';
import './LegendPanel.css';

const STORAGE_KEY = 'pr-legend-pos';

interface LegendPanelProps {
  initialPosition?: { x: number; y: number };
}

const LegendPanel: React.FC<LegendPanelProps> = ({ initialPosition }) => {
  const spec = useSelector(selectSpec);
  const [position, setPosition] = useState<{ x: number; y: number }>(
    initialPosition || spec?.legend?.position || { x: 24, y: 24 }
  );
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  // 从 localStorage 恢复位置
  useEffect(() => {
    if (spec?.legend?.persist) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPosition(parsed);
        } catch (e) {
          console.warn('Failed to parse stored legend position');
        }
      }
    }
  }, [spec]);

  // 保存位置到 localStorage
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    if (spec?.legend?.persist) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    }
  }, [spec]);

  // 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(spec?.legend?.draggable ?? true)) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: position.x,
      offsetY: position.y
    };
  }, [position, spec]);

  // 拖拽中
  useEffect(() => {
    if (!isDragging || !dragRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const newX = dragRef.current.offsetX + deltaX;
      const newY = dragRef.current.offsetY + deltaY;

      // 限制在窗口范围内
      const maxX = window.innerWidth - 260; // 260 是面板宽度
      const maxY = window.innerHeight - 200; // 预估高度

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (position) {
        savePosition(position);
      }
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, savePosition]);

  // 切换折叠状态
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  if (!spec) return null;

  const legendItems = spec.legend?.items || [
    { icon: 'node', label: '节点（PR 映射大小/颜色）' },
    { icon: 'edgeOut', label: '出度（蓝）' },
    { icon: 'edgeIn', label: '入度（橙）' },
    { icon: 'weight', label: '边权（粗细/数值）' }
  ];

  return (
    <div
      className={`legend-panel ${isDragging ? 'dragging' : ''} ${collapsed ? 'collapsed' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: spec.palette?.legendBg || 'rgba(255,255,255,0.9)'
      }}
    >
      <div className="legend-panel-header" onMouseDown={handleMouseDown}>
        <h3 className="legend-panel-title">图例</h3>
        {spec.legend?.collapsible !== false && (
          <button
            className="legend-panel-toggle"
            onClick={toggleCollapsed}
            title={collapsed ? '展开' : '折叠'}
          >
            {collapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      <div className="legend-panel-content">
        {legendItems.map((item, index) => (
          <div key={index} className="legend-item">
            <div className={`legend-icon ${item.icon === 'edgeOut' ? 'edge-out' : item.icon === 'edgeIn' ? 'edge-in' : item.icon}`}>
              {item.icon === 'weight' && '15'}
            </div>
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendPanel;
