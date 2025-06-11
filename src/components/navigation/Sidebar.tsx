import React from 'react';
import { LayoutDashboard, GanttChart, CheckSquare, Users, Coins, AlertTriangle, Archive, Clock, BarChart4, Settings, PlusCircle, Anchor, Menu, X, Workflow, Layers, FileSpreadsheet, Activity, Sliders, BookTemplate as FileTemplate } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const [expanded, setExpanded] = React.useState(true);
  const { currentProject, createProject } = useProject();

  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: <LayoutDashboard size={20} />, category: 'main' },
    { id: 'gantt', label: '甘特圖', icon: <GanttChart size={20} />, category: 'main' },
    { id: 'tasks', label: '任務', icon: <CheckSquare size={20} />, category: 'main' },
    { id: 'resources', label: '資源', icon: <Users size={20} />, category: 'main' },
    
    // 進階功能分組
    { id: 'wbs', label: 'WBS', icon: <Layers size={20} />, category: 'advanced' },
    { id: 'resource-worksheet', label: '資源工作表', icon: <FileSpreadsheet size={20} />, category: 'advanced' },
    { id: 'project-tracking', label: '專案追蹤', icon: <Activity size={20} />, category: 'advanced' },
    { id: 'custom-fields', label: '自訂欄位', icon: <Sliders size={20} />, category: 'advanced' },
    { id: 'templates', label: '專案範本', icon: <FileTemplate size={20} />, category: 'advanced' },
    
    // 其他功能
    { id: 'costs', label: '成本', icon: <Coins size={20} />, category: 'other' },
    { id: 'risks', label: '風險', icon: <AlertTriangle size={20} />, category: 'other' },
    { id: 'workflow', label: '工作流程', icon: <Workflow size={20} />, category: 'other' },
    { id: 'snapshots', label: '備份', icon: <Archive size={20} />, category: 'other' },
    { id: 'recent', label: '最近', icon: <Clock size={20} />, category: 'other' },
    { id: 'reports', label: '報告', icon: <BarChart4 size={20} />, category: 'other' },
    { id: 'settings', label: '設定', icon: <Settings size={20} />, category: 'other' },
  ];

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const renderNavSection = (category: string, title: string) => {
    const items = navItems.filter(item => item.category === category);
    
    return (
      <div className="mb-4">
        {expanded && (
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
          </div>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                  currentView === item.id
                    ? 'bg-gradient-soft from-navy-50 via-teal-50 to-navy-50 text-navy-700 font-medium shadow-soft'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
                title={!expanded ? item.label : undefined}
              >
                <span className={`${expanded ? 'mr-3' : 'mx-auto'} ${currentView === item.id ? 'text-teal-600' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {expanded && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`h-screen transition-all duration-300 ease-in-out flex flex-col ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="relative z-10 flex items-center h-16 px-4 border-b border-slate-100 bg-white">
        <div className="flex items-center">
          <div className="rounded-xl bg-gradient-wave from-teal-400 via-teal-500 to-navy-500 p-2 mr-2 shadow-soft">
            <Anchor size={expanded ? 24 : 20} className="text-white" />
          </div>
          {expanded && <h1 className="text-xl font-display font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-navy-600">ProjectCraft</h1>}
        </div>
        <button 
          onClick={toggleSidebar} 
          className="ml-auto p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      
      <div className="relative z-10 mt-6 px-3">
        {expanded && (
          <div className="flex items-center mb-4 px-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">我的專案</h2>
            <button
              onClick={() => createProject()}
              className="ml-auto p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
            >
              <PlusCircle size={14} />
            </button>
         </div>
        )}
        
        {expanded && currentProject && (
          <div className="mb-6">
            <div className="relative bg-gradient-soft from-white to-slate-50 rounded-xl p-3 mb-2 shadow-soft overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-navy-500" style={{ width: `${currentProject.progress}%` }}></div>
              <h3 className="font-medium text-sm mb-1 truncate text-slate-800">{currentProject.name}</h3>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">進度</span>
                <span className="font-medium text-teal-600">{currentProject.progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <nav className="relative z-10 flex-1 px-3 mt-2 overflow-y-auto">
        {renderNavSection('main', '核心功能')}
        {renderNavSection('advanced', '進階工具')}
        {renderNavSection('other', '其他功能')}
      </nav>
      
      <div className="relative z-10 mt-auto p-4 border-t border-slate-100">
        {expanded ? (
          <div className="flex items-center bg-gradient-soft from-white to-slate-50 p-2 rounded-xl shadow-soft">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-slate-100 border-2 border-white shadow-soft">
              <img 
                src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Alex Chen</p>
              <p className="text-xs text-slate-400">專案經理</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-soft">
              <img 
                src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};