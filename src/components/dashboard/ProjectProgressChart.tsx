import React from 'react';
import { useProject } from '../../context/ProjectContext';

export const ProjectProgressChart: React.FC = () => {
  const { currentProject } = useProject();

  if (!currentProject) return null;

  const tasks = currentProject.tasks;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const delayedTasks = tasks.filter(task => task.status === 'delayed').length;
  const notStartedTasks = tasks.filter(task => task.status === 'not-started').length;

  const total = tasks.length;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-slate-500">尚無任務資料</p>
      </div>
    );
  }

  // 計算百分比
  const completedPercentage = (completedTasks / total) * 100;
  const inProgressPercentage = (inProgressTasks / total) * 100;
  const delayedPercentage = (delayedTasks / total) * 100;
  const notStartedPercentage = (notStartedTasks / total) * 100;

  // SVG 圓餅圖參數
  const size = 160;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // 計算各段的偏移
  let currentOffset = 0;
  const segments = [
    { 
      percentage: completedPercentage, 
      color: '#10b981', 
      label: '已完成',
      count: completedTasks
    },
    { 
      percentage: inProgressPercentage, 
      color: '#3b82f6', 
      label: '進行中',
      count: inProgressTasks
    },
    { 
      percentage: delayedPercentage, 
      color: '#f59e0b', 
      label: '已延遲',
      count: delayedTasks
    },
    { 
      percentage: notStartedPercentage, 
      color: '#6b7280', 
      label: '未開始',
      count: notStartedTasks
    }
  ].filter(segment => segment.percentage > 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-medium text-slate-800 mb-4">專案進度分佈</h3>
      
      <div className="flex items-center justify-between">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => {
              const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset * circumference / 100;
              currentOffset += segment.percentage;
              
              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          
          {/* 中心文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-slate-800">{currentProject.progress}%</div>
            <div className="text-xs text-slate-500">整體進度</div>
          </div>
        </div>

        {/* 圖例 */}
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="text-sm">
                <div className="font-medium text-slate-800">{segment.label}</div>
                <div className="text-xs text-slate-500">
                  {segment.count} 項 ({Math.round(segment.percentage)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};