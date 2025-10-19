/**
 * 动画序列控制器
 * 负责管理可视化动画的阶段切换和效果执行
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSpec } from '../../store/graphSpecSlice';
import { selectGraph, updateNodeRanks } from '../../store/graphDataSlice';
import * as d3 from 'd3';
import './TeachingFlowRunner.css';

interface TeachingFlowRunnerProps {
  onStageChange?: (stageId: string, stageIndex: number) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

const TeachingFlowRunner: React.FC<TeachingFlowRunnerProps> = ({ onStageChange, svgRef }) => {
  const spec = useSelector(selectSpec);
  const graphData = useSelector(selectGraph);
  const dispatch = useDispatch();

  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const animationRef = useRef<number | null>(null);

  const stages = spec?.animation?.teachingFlow || [];

  // 停止所有动画
  const stopAllAnimations = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // 执行粒子流动动画
  const executeFlowAnimation = useCallback((
    direction: 'in' | 'out',
    color: string
  ) => {
    if (!svgRef?.current || !graphData) return;

    const svg = d3.select(svgRef.current);
    const edges = graphData.edges;

    // 创建粒子组
    const particleGroup = svg.select('.main-group').append('g').attr('class', 'flow-particles');

    edges.forEach((edge) => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      // 根据方向选择起点和终点
      const [startNode, endNode] = direction === 'out' 
        ? [sourceNode, targetNode] 
        : [targetNode, sourceNode];

      // 创建路径
      const path = particleGroup.append('path')
        .attr('d', `M${startNode.x},${startNode.y}L${endNode.x},${endNode.y}`)
        .attr('stroke', 'none')
        .attr('fill', 'none')
        .attr('id', `flow-path-${edge.id}`);

      // 创建粒子
      const particle = particleGroup.append('circle')
        .attr('r', spec?.animation?.flowParticle?.size || 3)
        .attr('fill', color.replace('$palette.edgeOut', spec?.palette.edgeOut || '#2EA0FF')
                          .replace('$palette.edgeIn', spec?.palette.edgeIn || '#FF9C66'))
        .attr('opacity', 0.9);

      // 动画
      const duration = 1500 / (spec?.animation?.flowParticle?.speed || 220) * 1000;
      
      particle
        .transition()
        .duration(duration)
        .attrTween('transform', () => {
          return (t: number) => {
            const point = path.node()?.getPointAtLength(t * (path.node()?.getTotalLength() || 0));
            return point ? `translate(${point.x}, ${point.y})` : '';
          };
        })
        .attrTween('opacity', () => {
          return (t: number) => String(0.9 * (1 - t));
        })
        .on('end', function() {
          d3.select(this).remove();
        });
    });

    // 清理路径
    setTimeout(() => {
      particleGroup.selectAll('path').remove();
    }, 2000);

  }, [svgRef, graphData, spec]);

  // 执行节点脉冲效果
  const executePulseAnimation = useCallback((targets: string, times: number = 2) => {
    if (!svgRef?.current) return;

    const svg = d3.select(svgRef.current);
    const nodeTargets = targets === 'all' 
      ? graphData?.nodes.map(n => n.id) || []
      : [targets];

    nodeTargets.forEach(nodeId => {
      const nodeCircle = svg.select(`[data-node-id="${nodeId}"]`).select('.node-circle');
      
      for (let i = 0; i < times; i++) {
        nodeCircle
          .transition()
          .delay(i * 600)
          .duration(300)
          .attr('r', function() {
            const currentR = parseFloat(d3.select(this).attr('r'));
            return currentR * 1.3;
          })
          .transition()
          .duration(300)
          .attr('r', function() {
            const currentR = parseFloat(d3.select(this).attr('r'));
            return currentR / 1.3;
          });
      }
    });
  }, [svgRef, graphData]);

  // 执行边透明度调整
  const executeDimEdgesAnimation = useCallback((to: number) => {
    if (!svgRef?.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('.edge-line')
      .transition()
      .duration(spec?.animation?.duration || 450)
      .attr('opacity', to);
  }, [svgRef, spec]);

  // 执行权重标签缩放效果
  const executeEmphasizeWeightLabels = useCallback((scale: number) => {
    if (!svgRef?.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('.edge-weight')
      .transition()
      .duration(spec?.animation?.duration || 450)
      .attr('font-size', function() {
        const currentSize = parseFloat(d3.select(this).attr('font-size'));
        return `${currentSize * scale}px`;
      })
      .transition()
      .duration(spec?.animation?.duration || 450)
      .attr('font-size', function() {
        const currentSize = parseFloat(d3.select(this).attr('font-size'));
        return `${currentSize / scale}px`;
      });
  }, [svgRef, spec]);

  // 执行 rank 值更新
  const executeRankUpdateAnimation = useCallback(() => {
    if (!graphData) return;

    // 模拟 PageRank 值的更新
    const newRanks: Record<string, number> = {};
    graphData.nodes.forEach(node => {
      // 简单的随机波动模拟
      newRanks[node.id] = Math.max(0.1, Math.min(1, node.rank + (Math.random() - 0.5) * 0.1));
    });

    dispatch(updateNodeRanks(newRanks));
  }, [graphData, dispatch]);

  // 执行阶段效果
  const executeStageEffects = useCallback((stageIndex: number) => {
    const stage = stages[stageIndex];
    if (!stage) return;

    stage.effect.forEach((effect, index) => {
      setTimeout(() => {
        switch (effect.type) {
          case 'pulse-nodes':
            executePulseAnimation(effect.targets || 'all', effect.times || 2);
            break;
          case 'dim-edges':
            executeDimEdgesAnimation(effect.to || 0.2);
            break;
          case 'flow':
            if (effect.direction && effect.color) {
              executeFlowAnimation(
                effect.direction as 'in' | 'out',
                effect.color
              );
            }
            break;
          case 'emphasize-weight-labels':
            executeEmphasizeWeightLabels(effect.scale || 1.2);
            break;
          case 'rank-update':
            executeRankUpdateAnimation();
            break;
          case 'counter-badge':
            setIteration(prev => prev + 1);
            break;
          default:
            console.warn('Unknown effect type:', effect.type);
        }
      }, index * (spec?.animation?.duration || 450));
    });

    // 标记阶段完成
    setTimeout(() => {
      setCompletedStages(prev => new Set([...prev, stageIndex]));
    }, stage.effect.length * (spec?.animation?.duration || 450) + 500);

  }, [stages, spec, executePulseAnimation, executeDimEdgesAnimation, executeFlowAnimation, executeEmphasizeWeightLabels, executeRankUpdateAnimation]);

  // 切换到指定阶段
  const goToStage = useCallback((stageIndex: number) => {
    if (stageIndex < 0 || stageIndex >= stages.length) return;

    setCurrentStage(stageIndex);
    executeStageEffects(stageIndex);

    if (onStageChange) {
      onStageChange(stages[stageIndex].id, stageIndex);
    }
  }, [stages, executeStageEffects, onStageChange]);

  // 下一阶段
  const nextStage = useCallback(() => {
    const next = currentStage + 1;
    if (next < stages.length) {
      goToStage(next);
    } else {
      stopAllAnimations();
    }
  }, [currentStage, stages.length, goToStage, stopAllAnimations]);

  // 上一阶段
  const prevStage = useCallback(() => {
    const prev = currentStage - 1;
    if (prev >= 0) {
      goToStage(prev);
    }
  }, [currentStage, goToStage]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAllAnimations();
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying, stopAllAnimations]);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      nextStage();
    }, (spec?.animation?.duration || 450) * 3 + 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStage, nextStage, spec]);

  // 重置
  const reset = useCallback(() => {
    stopAllAnimations();
    setCurrentStage(0);
    setIteration(0);
    setCompletedStages(new Set());
  }, [stopAllAnimations]);

  if (!spec || stages.length === 0) return null;

  const progress = ((currentStage + 1) / stages.length) * 100;

  return (
    <>
      <div className="teaching-flow-runner">
        <div className="teaching-flow-stages">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`teaching-flow-stage ${
                index === currentStage ? 'active' : ''
              } ${completedStages.has(index) ? 'completed' : ''}`}
              onClick={() => goToStage(index)}
            >
              {stage.label}
              <span className="teaching-flow-stage-label">
                阶段 {index + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="teaching-flow-progress">
          <div
            className="teaching-flow-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="teaching-flow-controls">
          <button
            className="teaching-flow-button"
            onClick={prevStage}
            disabled={currentStage === 0}
          >
            ← 上一步
          </button>
          <button
            className="teaching-flow-button primary"
            onClick={togglePlay}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            className="teaching-flow-button"
            onClick={nextStage}
            disabled={currentStage === stages.length - 1}
          >
            下一步 →
          </button>
          <button
            className="teaching-flow-button"
            onClick={reset}
          >
            🔄 重置
          </button>
        </div>
      </div>

      {iteration > 0 && (
        <div className="teaching-flow-counter">
          迭代 {iteration}
        </div>
      )}
    </>
  );
};

export default TeachingFlowRunner;
