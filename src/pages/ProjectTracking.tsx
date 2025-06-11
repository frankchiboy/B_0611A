import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target, 
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface ProjectMetrics {
  scheduleVariance: number; // SV
  costVariance: number; // CV
  schedulePerformanceIndex: number; // SPI
  costPerformanceIndex: number; // CPI
  estimateAtCompletion: number; // EAC
  estimateToComplete: number; // ETC
  plannedValue: number; // PV
  earnedValue: number; // EV
  actualCost: number; // AC
  budgetAtCompletion: number; // BAC
  completionPercentage: number;
  riskScore: number;
}

interface TrackingAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
}

export const ProjectTracking: React.FC = () => {
  const { currentProject } = useProject();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [trackingView, setTrackingView] = useState<'overview' | 'earned-value' | 'risks' | 'trends'>('overview');

  // 計算專案追蹤指標
  const projectMetrics = useMemo((): ProjectMetrics => {
    if (!currentProject) {
      return {
        scheduleVariance: 0,
        costVariance: 0,
        schedulePerformanceIndex: 1,
        costPerformanceIndex: 1,
        estimateAtCompletion: 0,
        estimateToComplete: 0,
        plannedValue: 0,
        earnedValue: 0,
        actualCost: 0,
        budgetAtCompletion: 0,
        completionPercentage: 0,
        riskScore: 0
      };
    }

    const budgetAtCompletion = currentProject.budget.total;
    const actualCost = currentProject.budget.spent;
    const completionPercentage = currentProject.progress;
    
    // 預計值 (PV) - 基於時程的預期進度
    const projectStartDate = new Date(currentProject.startDate);
    const projectEndDate = new Date(currentProject.endDate);
    const today = new Date();
    
    const totalDuration = (projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDuration = Math.max(0, (today.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const plannedCompletionPercentage = Math.min(100, (elapsedDuration / totalDuration) * 100);
    
    const plannedValue = (plannedCompletionPercentage / 100) * budgetAtCompletion;
    const earnedValue = (completionPercentage / 100) * budgetAtCompletion;
    
    // 差異分析
    const scheduleVariance = earnedValue - plannedValue;
    const costVariance = earnedValue - actualCost;
    
    // 績效指標
    const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 1;
    const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 1;
    
    // 完工預估
    const estimateAtCompletion = costPerformanceIndex > 0 ? budgetAtCompletion / costPerformanceIndex : budgetAtCompletion;
    const estimateToComplete = estimateAtCompletion - actualCost;
    
    // 風險評分 (基於多個因素)
    let riskScore = 0;
    if (schedulePerformanceIndex < 0.9) riskScore += 30;
    if (costPerformanceIndex < 0.9) riskScore += 30;
    if (currentProject.risks.filter(r => r.status === 'identified' && (r.probability === 'high' || r.impact === 'high')).length > 0) riskScore += 20;
    if (currentProject.tasks.filter(t => t.status === 'delayed').length > 0) riskScore += 20;

    return {
      scheduleVariance,
      costVariance,
      schedulePerformanceIndex,
      costPerformanceIndex,
      estimateAtCompletion,
      estimateToComplete,
      plannedValue,
      earnedValue,
      actualCost,
      budgetAtCompletion,
      completionPercentage,
      riskScore: Math.min(100, riskScore)
    };
  }, [currentProject]);

  // 生成追蹤警示
  const trackingAlerts = useMemo((): TrackingAlert[] => {
    if (!currentProject) return [];

    const alerts: TrackingAlert[] = [];

    // 進度警示
    if (projectMetrics.schedulePerformanceIndex < 0.9) {
      alerts.push({
        id: 'schedule-delay',
        type: 'error',
        title: '進度落後',
        message: `專案進度落後 ${Math.abs(projectMetrics.scheduleVariance).toLocaleString()} 元的工作價值`,
        priority: 'high',
        date: new Date().toISOString()
      });
    }

    // 成本警示
    if (projectMetrics.costPerformanceIndex < 0.9) {
      alerts.push({
        id: 'cost-overrun',
        type: 'error',
        title: '成本超支',
        message: `專案成本超支 ${Math.abs(projectMetrics.costVariance).toLocaleString()} 元`,
        priority: 'high',
        date: new Date().toISOString()
      });
    }

    // 里程碑警示
    const upcomingMilestones = currentProject.milestones.filter(m => {
      const milestoneDate = new Date(m.date);
      const today = new Date();
      const daysUntil = (milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return m.status === 'upcoming' && daysUntil <= 7 && daysUntil > 0;
    });

    upcomingMilestones.forEach(milestone => {
      alerts.push({
        id: `milestone-${milestone.id}`,
        type: 'warning',
        title: '即將到期的里程碑',
        message: `里程碑「${milestone.name}」將在 ${Math.ceil((new Date(milestone.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天內到期`,
        priority: 'medium',
        date: new Date().toISOString()
      });
    });

    // 資源警示
    const overUtilizedResources = currentProject.resources.filter(r => r.utilization > 90);
    if (overUtilizedResources.length > 0) {
      alerts.push({
        id: 'resource-overutilization',
        type: 'warning',
        title: '資源過度使用',
        message: `${overUtilizedResources.length} 個資源的利用率超過 90%`,
        priority: 'medium',
        date: new Date().toISOString()
      });
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [currentProject, projectMetrics]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">沒有可用的專案</h2>
          <p className="text-slate-500">請選擇或創建一個專案以查看追蹤控制面板</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 標題區域 */}
      <div className="relative bg-[url('https://images.pexels.com/photos/3183170/pexels-photo-3183170.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">專案追蹤控制</h1>
              <p className="text-white/80">即時監控專案績效、風險與關鍵指標</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm"
              >
                <option value="week">本週</option>
                <option value="month">本月</option>
                <option value="quarter">本季</option>
              </select>
              
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                projectMetrics.riskScore < 30 ? 'bg-green-500/20 text-green-200' :
                projectMetrics.riskScore < 60 ? 'bg-amber-500/20 text-amber-200' :
                'bg-red-500/20 text-red-200'
              }`}>
                風險等級: {projectMetrics.riskScore < 30 ? '低' : projectMetrics.riskScore < 60 ? '中' : '高'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 關鍵指標概覽 */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className="text-blue-500 mr-1" />
              <span className="text-xs text-slate-500 uppercase">SPI</span>
            </div>
            <div className={`text-2xl font-bold ${
              projectMetrics.schedulePerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'
            }`}>
              {projectMetrics.schedulePerformanceIndex.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500">進度績效</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign size={16} className="text-green-500 mr-1" />
              <span className="text-xs text-slate-500 uppercase">CPI</span>
            </div>
            <div className={`text-2xl font-bold ${
              projectMetrics.costPerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'
            }`}>
              {projectMetrics.costPerformanceIndex.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500">成本績效</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target size={16} className="text-purple-500 mr-1" />
              <span className="text-xs text-slate-500 uppercase">EV</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ${Math.round(projectMetrics.earnedValue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">已賺取價值</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar size={16} className="text-amber-500 mr-1" />
              <span className="text-xs text-slate-500 uppercase">SV</span>
            </div>
            <div className={`text-2xl font-bold ${
              projectMetrics.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {projectMetrics.scheduleVariance >= 0 ? '+' : ''}${Math.round(projectMetrics.scheduleVariance).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">進度差異</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign size={16} className="text-rose-500 mr-1" />
              <span className="text-xs text-slate-500 uppercase">CV</span>
            </div>
            <div className={`text-2xl font-bold ${
              projectMetrics.costVariance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {projectMetrics.costVariance >= 0 ? '+' : ''}${Math.round(projectMetrics.costVariance).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">成本差異</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap size={16} className="text-indigo-500 mr-1" />
              <span className="text-xs text-slate-500 uppercase">EAC</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              ${Math.round(projectMetrics.estimateAtCompletion).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">完工預估</div>
          </div>
        </div>
      </div>

      {/* 檢視模式切換 */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setTrackingView('overview')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              trackingView === 'overview' 
                ? 'bg-white text-slate-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            概覽儀表板
          </button>
          <button
            onClick={() => setTrackingView('earned-value')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              trackingView === 'earned-value' 
                ? 'bg-white text-slate-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            實獲價值分析
          </button>
          <button
            onClick={() => setTrackingView('risks')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              trackingView === 'risks' 
                ? 'bg-white text-slate-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            風險監控
          </button>
          <button
            onClick={() => setTrackingView('trends')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              trackingView === 'trends' 
                ? 'bg-white text-slate-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            趨勢分析
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {trackingView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 專案狀態總覽 */}
            <div className="lg:col-span-2">
              <div className="card p-6 mb-6">
                <h3 className="font-medium text-slate-800 mb-4">專案健康度儀表板</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full border-8 ${
                      projectMetrics.completionPercentage >= 75 ? 'border-green-500' :
                      projectMetrics.completionPercentage >= 50 ? 'border-amber-500' :
                      'border-red-500'
                    } flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-2xl font-bold text-slate-800">
                        {Math.round(projectMetrics.completionPercentage)}%
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800">整體進度</h4>
                    <p className="text-sm text-slate-500">專案完成度</p>
                  </div>

                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full border-8 ${
                      projectMetrics.riskScore < 30 ? 'border-green-500' :
                      projectMetrics.riskScore < 60 ? 'border-amber-500' :
                      'border-red-500'
                    } flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-2xl font-bold text-slate-800">
                        {Math.round(projectMetrics.riskScore)}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800">風險指數</h4>
                    <p className="text-sm text-slate-500">整體風險評分</p>
                  </div>

                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full border-8 ${
                      projectMetrics.costPerformanceIndex >= 1 ? 'border-green-500' :
                      projectMetrics.costPerformanceIndex >= 0.9 ? 'border-amber-500' :
                      'border-red-500'
                    } flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-xl font-bold text-slate-800">
                        {projectMetrics.costPerformanceIndex.toFixed(1)}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800">成本效率</h4>
                    <p className="text-sm text-slate-500">成本績效指標</p>
                  </div>
                </div>
              </div>

              {/* 任務狀態分佈 */}
              <div className="card p-6">
                <h3 className="font-medium text-slate-800 mb-4">任務執行狀態</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { status: 'completed', label: '已完成', color: 'green', icon: CheckCircle },
                    { status: 'in-progress', label: '進行中', color: 'blue', icon: Activity },
                    { status: 'delayed', label: '已延遲', color: 'red', icon: AlertTriangle },
                    { status: 'not-started', label: '未開始', color: 'slate', icon: Clock }
                  ].map(({ status, label, color, icon: Icon }) => {
                    const count = currentProject.tasks.filter(t => t.status === status).length;
                    const percentage = Math.round((count / currentProject.tasks.length) * 100);
                    
                    return (
                      <div key={status} className="text-center">
                        <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-2`}>
                          <Icon size={20} className={`text-${color}-600`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{count}</div>
                        <div className="text-xs text-slate-500">{label}</div>
                        <div className="text-xs text-slate-400">({percentage}%)</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 警示面板 */}
            <div className="card p-6">
              <h3 className="font-medium text-slate-800 mb-4">即時警示</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trackingAlerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'error' ? 'bg-red-50 border-red-500' :
                      alert.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-1 rounded ${
                        alert.type === 'error' ? 'bg-red-100 text-red-600' :
                        alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      } mr-3 mt-0.5`}>
                        {alert.type === 'error' ? <AlertTriangle size={14} /> :
                         alert.type === 'warning' ? <Clock size={14} /> :
                         <Activity size={14} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 text-sm">{alert.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                            alert.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {alert.priority === 'high' ? '高' : alert.priority === 'medium' ? '中' : '低'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(alert.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {trackingAlerts.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">目前沒有警示項目</p>
                    <p className="text-xs text-slate-400">專案運行狀況良好</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {trackingView === 'earned-value' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 實獲價值分析圖表 */}
            <div className="card p-6">
              <h3 className="font-medium text-slate-800 mb-4">實獲價值分析 (EVA)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-blue-800">計劃價值 (PV)</span>
                    <div className="text-xs text-blue-600">Planned Value</div>
                  </div>
                  <span className="text-lg font-bold text-blue-800">
                    ${Math.round(projectMetrics.plannedValue).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-green-800">實獲價值 (EV)</span>
                    <div className="text-xs text-green-600">Earned Value</div>
                  </div>
                  <span className="text-lg font-bold text-green-800">
                    ${Math.round(projectMetrics.earnedValue).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-red-800">實際成本 (AC)</span>
                    <div className="text-xs text-red-600">Actual Cost</div>
                  </div>
                  <span className="text-lg font-bold text-red-800">
                    ${Math.round(projectMetrics.actualCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 績效指標 */}
            <div className="card p-6">
              <h3 className="font-medium text-slate-800 mb-4">關鍵績效指標</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-800">進度績效指標 (SPI)</span>
                    <div className="text-xs text-slate-500">Schedule Performance Index</div>
                  </div>
                  <div className="flex items-center">
                    {projectMetrics.schedulePerformanceIndex > 1 ? (
                      <ArrowUp size={16} className="text-green-500 mr-1" />
                    ) : projectMetrics.schedulePerformanceIndex < 1 ? (
                      <ArrowDown size={16} className="text-red-500 mr-1" />
                    ) : (
                      <Minus size={16} className="text-slate-500 mr-1" />
                    )}
                    <span className={`font-bold ${
                      projectMetrics.schedulePerformanceIndex >= 1 ? 'text-green-600' :
                      projectMetrics.schedulePerformanceIndex >= 0.9 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {projectMetrics.schedulePerformanceIndex.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-800">成本績效指標 (CPI)</span>
                    <div className="text-xs text-slate-500">Cost Performance Index</div>
                  </div>
                  <div className="flex items-center">
                    {projectMetrics.costPerformanceIndex > 1 ? (
                      <ArrowUp size={16} className="text-green-500 mr-1" />
                    ) : projectMetrics.costPerformanceIndex < 1 ? (
                      <ArrowDown size={16} className="text-red-500 mr-1" />
                    ) : (
                      <Minus size={16} className="text-slate-500 mr-1" />
                    )}
                    <span className={`font-bold ${
                      projectMetrics.costPerformanceIndex >= 1 ? 'text-green-600' :
                      projectMetrics.costPerformanceIndex >= 0.9 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {projectMetrics.costPerformanceIndex.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-800">完工預估 (EAC)</span>
                    <div className="text-xs text-slate-500">Estimate at Completion</div>
                  </div>
                  <span className="font-bold text-slate-800">
                    ${Math.round(projectMetrics.estimateAtCompletion).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-800">完工尚需 (ETC)</span>
                    <div className="text-xs text-slate-500">Estimate to Complete</div>
                  </div>
                  <span className="font-bold text-slate-800">
                    ${Math.round(projectMetrics.estimateToComplete).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 其他檢視模式的內容可以在這裡繼續擴展 */}
        {trackingView === 'risks' && (
          <div className="card p-6">
            <h3 className="font-medium text-slate-800 mb-4">風險監控中心</h3>
            <p className="text-slate-500">風險監控功能開發中...</p>
          </div>
        )}

        {trackingView === 'trends' && (
          <div className="card p-6">
            <h3 className="font-medium text-slate-800 mb-4">趨勢分析</h3>
            <p className="text-slate-500">趨勢分析功能開發中...</p>
          </div>
        )}
      </div>
    </div>
  );
};