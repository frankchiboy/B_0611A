import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Filter,
  Download,
  Plus,
  Edit
} from 'lucide-react';

interface ResourceAnalytics {
  totalHours: number;
  billableHours: number;
  utilization: number;
  efficiency: number;
  tasksAssigned: number;
  tasksCompleted: number;
  averageTaskDuration: number;
  costPerHour: number;
  totalCost: number;
  skillsCount: number;
}

export const ResourceWorksheet: React.FC = () => {
  const { currentProject } = useProject();
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter'>('month');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // 計算資源分析數據
  const resourceAnalytics = useMemo(() => {
    if (!currentProject) return new Map();

    const analytics = new Map<string, ResourceAnalytics>();

    currentProject.resources.forEach(resource => {
      const assignedTasks = currentProject.tasks.filter(task => 
        task.assignedTo.includes(resource.id)
      );
      
      const completedTasks = assignedTasks.filter(task => 
        task.status === 'completed'
      );

      const totalHours = assignedTasks.reduce((sum, task) => 
        sum + (task.duration * 8), 0
      ); // 假設每天8小時

      const billableHours = totalHours * 0.8; // 假設80%為可計費時間

      const averageTaskDuration = assignedTasks.length > 0 
        ? assignedTasks.reduce((sum, task) => sum + task.duration, 0) / assignedTasks.length
        : 0;

      analytics.set(resource.id, {
        totalHours,
        billableHours,
        utilization: resource.utilization,
        efficiency: completedTasks.length / Math.max(assignedTasks.length, 1) * 100,
        tasksAssigned: assignedTasks.length,
        tasksCompleted: completedTasks.length,
        averageTaskDuration,
        costPerHour: resource.cost,
        totalCost: billableHours * resource.cost,
        skillsCount: resource.skills?.length || 0
      });
    });

    return analytics;
  }, [currentProject]);

  // 獲取團隊統計
  const teamStatistics = useMemo(() => {
    if (!currentProject) return null;

    const totalResources = currentProject.resources.length;
    const averageUtilization = totalResources > 0 
      ? Math.round(currentProject.resources.reduce((sum, r) => sum + r.utilization, 0) / totalResources)
      : 0;

    const overUtilized = currentProject.resources.filter(r => r.utilization > 90).length;
    const underUtilized = currentProject.resources.filter(r => r.utilization < 60).length;

    const totalCost = Array.from(resourceAnalytics.values())
      .reduce((sum, analytics) => sum + analytics.totalCost, 0);

    return {
      totalResources,
      averageUtilization,
      overUtilized,
      underUtilized,
      totalCost
    };
  }, [currentProject, resourceAnalytics]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Users size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">沒有可用的專案</h2>
          <p className="text-slate-500">請選擇或創建一個專案以查看資源工作表</p>
        </div>
      </div>
    );
  }

  const selectedResource = selectedResourceId 
    ? currentProject.resources.find(r => r.id === selectedResourceId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* 標題區域 */}
      <div className="relative bg-[url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">資源工作表</h1>
              <p className="text-white/80">深度分析資源配置、工作負載與績效表現</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value as any)}
                className="px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm"
              >
                <option value="week">本週</option>
                <option value="month">本月</option>
                <option value="quarter">本季</option>
              </select>
              
              <button className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 transition-colors text-sm flex items-center">
                <Download size={14} className="mr-1.5" />
                匯出報表
              </button>
              
              <button className="px-4 py-2 bg-white text-emerald-700 rounded-lg text-sm flex items-center shadow-sm hover:bg-emerald-50 transition-colors">
                <Plus size={14} className="mr-1.5" />
                新增資源
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 統計概覽 */}
      {teamStatistics && (
        <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{teamStatistics.totalResources}</div>
              <div className="text-xs text-slate-500">總資源數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamStatistics.averageUtilization}%</div>
              <div className="text-xs text-slate-500">平均利用率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{teamStatistics.overUtilized}</div>
              <div className="text-xs text-slate-500">過度使用</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">{teamStatistics.underUtilized}</div>
              <div className="text-xs text-slate-500">使用不足</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${teamStatistics.totalCost.toLocaleString()}</div>
              <div className="text-xs text-slate-500">總成本</div>
            </div>
          </div>
        </div>
      )}

      {/* 檢視模式切換 */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              總覽
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              詳細資料
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'analytics' 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              分析圖表
            </button>
          </div>
          
          <button className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm flex items-center">
            <Filter size={14} className="mr-1.5" />
            篩選
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProject.resources.map(resource => {
                const analytics = resourceAnalytics.get(resource.id);
                if (!analytics) return null;

                return (
                  <div 
                    key={resource.id}
                    className={`card cursor-pointer transition-all hover:shadow-lg ${
                      selectedResourceId === resource.id ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    onClick={() => setSelectedResourceId(resource.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 mr-3 border-2 border-white shadow-sm">
                            {resource.avatar ? (
                              <img 
                                src={resource.avatar} 
                                alt={resource.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-medium text-slate-600">
                                {resource.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{resource.name}</h3>
                            <p className="text-sm text-slate-500">{resource.role || '未指定角色'}</p>
                          </div>
                        </div>
                        
                        <div className={`p-2 rounded-lg ${
                          analytics.utilization > 90 ? 'bg-red-100 text-red-700' :
                          analytics.utilization > 75 ? 'bg-amber-100 text-amber-700' :
                          analytics.utilization > 60 ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {analytics.utilization > 90 ? <AlertTriangle size={16} /> :
                           analytics.utilization > 60 ? <CheckCircle size={16} /> :
                           <Activity size={16} />}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">利用率</span>
                            <span className="font-medium">{analytics.utilization}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                analytics.utilization > 90 ? 'bg-red-500' :
                                analytics.utilization > 75 ? 'bg-amber-500' :
                                analytics.utilization > 60 ? 'bg-green-500' :
                                'bg-slate-400'
                              }`}
                              style={{ width: `${analytics.utilization}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center text-slate-500 mb-1">
                              <Clock size={14} className="mr-1" />
                              工作時數
                            </div>
                            <div className="font-medium">{analytics.totalHours}h</div>
                          </div>
                          <div>
                            <div className="flex items-center text-slate-500 mb-1">
                              <BarChart3 size={14} className="mr-1" />
                              效率
                            </div>
                            <div className="font-medium">{Math.round(analytics.efficiency)}%</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center text-slate-500 mb-1">
                              <Calendar size={14} className="mr-1" />
                              任務數
                            </div>
                            <div className="font-medium">{analytics.tasksAssigned}</div>
                          </div>
                          <div>
                            <div className="flex items-center text-slate-500 mb-1">
                              <DollarSign size={14} className="mr-1" />
                              總成本
                            </div>
                            <div className="font-medium">${analytics.totalCost.toLocaleString()}</div>
                          </div>
                        </div>

                        {resource.skills && resource.skills.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-500 mb-2">技能</div>
                            <div className="flex flex-wrap gap-1">
                              {resource.skills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                                  {skill}
                                </span>
                              ))}
                              {resource.skills.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                  +{resource.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="p-6">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">資源</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">利用率</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">工作時數</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">任務數</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">效率</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">成本</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">狀態</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {currentProject.resources.map(resource => {
                      const analytics = resourceAnalytics.get(resource.id);
                      if (!analytics) return null;

                      return (
                        <tr key={resource.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 mr-3">
                                {resource.avatar ? (
                                  <img src={resource.avatar} alt={resource.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm font-medium text-slate-600">
                                    {resource.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800">{resource.name}</div>
                                <div className="text-xs text-slate-500">{resource.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-slate-100 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    analytics.utilization > 90 ? 'bg-red-500' :
                                    analytics.utilization > 75 ? 'bg-amber-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${analytics.utilization}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{analytics.utilization}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {analytics.totalHours}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {analytics.tasksCompleted}/{analytics.tasksAssigned}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {Math.round(analytics.efficiency)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            ${analytics.totalCost.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              analytics.utilization > 90 ? 'bg-red-100 text-red-800' :
                              analytics.utilization > 75 ? 'bg-amber-100 text-amber-800' :
                              analytics.utilization > 60 ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {analytics.utilization > 90 ? '過載' :
                               analytics.utilization > 75 ? '繁忙' :
                               analytics.utilization > 60 ? '正常' :
                               '空閒'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-emerald-600 hover:text-emerald-800">
                              <Edit size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 利用率分佈圖 */}
              <div className="card p-6">
                <h3 className="font-medium text-slate-800 mb-4">利用率分佈</h3>
                <div className="space-y-4">
                  {currentProject.resources.map(resource => {
                    const analytics = resourceAnalytics.get(resource.id);
                    if (!analytics) return null;

                    return (
                      <div key={resource.id} className="flex items-center">
                        <div className="w-20 text-sm text-slate-600 truncate">{resource.name}</div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                analytics.utilization > 90 ? 'bg-red-500' :
                                analytics.utilization > 75 ? 'bg-amber-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${analytics.utilization}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-700">{analytics.utilization}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 成本分析 */}
              <div className="card p-6">
                <h3 className="font-medium text-slate-800 mb-4">成本分析</h3>
                <div className="space-y-4">
                  {currentProject.resources.map(resource => {
                    const analytics = resourceAnalytics.get(resource.id);
                    if (!analytics) return null;
                    
                    const maxCost = Math.max(...Array.from(resourceAnalytics.values()).map(a => a.totalCost));
                    const costPercentage = maxCost > 0 ? (analytics.totalCost / maxCost) * 100 : 0;

                    return (
                      <div key={resource.id} className="flex items-center">
                        <div className="w-20 text-sm text-slate-600 truncate">{resource.name}</div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-purple-500"
                              style={{ width: `${costPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-700">${analytics.totalCost.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};