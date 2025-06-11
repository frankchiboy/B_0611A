import React, { useState } from 'react';
import { Download, Upload, Play, Plus, Trash, Calendar, Clock, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  duration: number;
  dependencies: string[];
  start?: number;
  end?: number;
}

interface WorkflowNode {
  id: string;
  tool_name: string;
  input: {
    dependencies: string[];
  };
  meta: {
    duration: number;
    title: string;
    start?: number;
    end?: number;
  };
}

interface WorkflowJSON {
  version: string;
  nodes: WorkflowNode[];
  metadata: {
    projectName: string;
    totalDuration: number;
    createdAt: string;
  };
}

export const WorkflowConverter: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: '設計 UI',
      duration: 3,
      dependencies: []
    },
    {
      id: 'task-2',
      title: '開發前端',
      duration: 5,
      dependencies: ['task-1']
    },
    {
      id: 'task-3',
      title: '開發後端',
      duration: 6,
      dependencies: ['task-1']
    },
    {
      id: 'task-4',
      title: '串接 API',
      duration: 3,
      dependencies: ['task-2', 'task-3']
    },
    {
      id: 'task-5',
      title: '測試與修正',
      duration: 4,
      dependencies: ['task-4']
    }
  ]);

  const [projectName, setProjectName] = useState('專案排程工作流程');
  const [newTask, setNewTask] = useState({ title: '', duration: 1 });

  // 計算任務時程（拓撲排序 + FS 依賴）
  const calculateSchedule = (taskList: Task[]): Task[] => {
    const scheduledTasks: Task[] = [];
    const processed = new Set<string>();
    
    // 深度優先搜尋來計算每個任務的開始和結束時間
    const calculateTaskTime = (taskId: string): Task => {
      if (processed.has(taskId)) {
        return scheduledTasks.find(t => t.id === taskId)!;
      }

      const task = taskList.find(t => t.id === taskId);
      if (!task) throw new Error(`Task ${taskId} not found`);

      let startTime = 0;

      // 計算依賴任務的最晚結束時間
      if (task.dependencies.length > 0) {
        const depEndTimes = task.dependencies.map(depId => {
          const depTask = calculateTaskTime(depId);
          return depTask.end || 0;
        });
        startTime = Math.max(...depEndTimes);
      }

      const scheduledTask: Task = {
        ...task,
        start: startTime,
        end: startTime + task.duration
      };

      scheduledTasks.push(scheduledTask);
      processed.add(taskId);
      
      return scheduledTask;
    };

    // 計算所有任務
    taskList.forEach(task => {
      if (!processed.has(task.id)) {
        calculateTaskTime(task.id);
      }
    });

    return scheduledTasks.sort((a, b) => (a.start || 0) - (b.start || 0));
  };

  // 轉換為 Bolt Workflow JSON
  const convertToWorkflowJSON = (): WorkflowJSON => {
    const scheduledTasks = calculateSchedule(tasks);
    const totalDuration = Math.max(...scheduledTasks.map(t => t.end || 0));

    const nodes: WorkflowNode[] = scheduledTasks.map(task => ({
      id: task.id,
      tool_name: 'task',
      input: {
        dependencies: task.dependencies
      },
      meta: {
        duration: task.duration,
        title: task.title,
        start: task.start,
        end: task.end
      }
    }));

    return {
      version: '1.0.0',
      nodes,
      metadata: {
        projectName,
        totalDuration,
        createdAt: new Date().toISOString()
      }
    };
  };

  // 新增任務
  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      duration: newTask.duration,
      dependencies: []
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', duration: 1 });
  };

  // 刪除任務
  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // 更新任務依賴
  const updateTaskDependencies = (taskId: string, dependencies: string[]) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, dependencies } : t
    ));
  };

  // 匯出 JSON
  const exportJSON = () => {
    const workflow = convertToWorkflowJSON();
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scheduledTasks = calculateSchedule(tasks);

  return (
    <div className="flex flex-col h-full">
      {/* 標題區域 */}
      <div className="relative bg-[url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">專案排程工具</h1>
              <p className="text-white/80">將 Microsoft Project 任務結構轉換為 Bolt Workflow JSON</p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 backdrop-blur-sm"
                placeholder="專案名稱"
              />
              <button
                onClick={exportJSON}
                className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm flex items-center shadow-sm hover:bg-indigo-50 transition-colors"
              >
                <Download size={14} className="mr-1.5" />
                匯出 JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 任務管理區域 */}
          <div className="card">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-display font-semibold text-slate-800 mb-1">任務管理</h2>
              <p className="text-slate-500 text-sm">定義專案任務與依賴關係</p>
            </div>
            
            {/* 新增任務 */}
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="任務名稱"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  value={newTask.duration}
                  onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="天數"
                />
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center"
                >
                  <Plus size={14} className="mr-1" />
                  新增
                </button>
              </div>
            </div>
            
            {/* 任務列表 */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="card-gradient p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-slate-800">{task.title}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <Clock size={14} className="mr-1" />
                        {task.duration} 天
                      </div>
                    </div>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 block">依賴任務</label>
                    <div className="space-y-1">
                      {tasks.filter(t => t.id !== task.id).map(availableTask => (
                        <label key={availableTask.id} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={task.dependencies.includes(availableTask.id)}
                            onChange={(e) => {
                              const newDeps = e.target.checked
                                ? [...task.dependencies, availableTask.id]
                                : task.dependencies.filter(id => id !== availableTask.id);
                              updateTaskDependencies(task.id, newDeps);
                            }}
                            className="form-checkbox h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mr-2"
                          />
                          <span className="text-slate-700">{availableTask.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 時程預覽區域 */}
          <div className="card">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-display font-semibold text-slate-800 mb-1">時程預覽</h2>
              <p className="text-slate-500 text-sm">計算後的任務排程（Finish-to-Start）</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {scheduledTasks.map((task, index) => (
                <div key={task.id} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium mr-4">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-slate-800">{task.title}</h3>
                      <span className="text-xs text-slate-500">{task.duration} 天</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar size={14} className="mr-1" />
                      第 {task.start! + 1} 天
                      <ArrowRight size={14} className="mx-2" />
                      第 {task.end} 天
                    </div>
                    
                    {task.dependencies.length > 0 && (
                      <div className="mt-1 text-xs text-slate-500">
                        依賴: {task.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId);
                          return depTask?.title;
                        }).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">專案總工期</span>
                <span className="font-medium text-slate-800">
                  {Math.max(...scheduledTasks.map(t => t.end || 0))} 天
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* JSON 預覽 */}
        <div className="card mt-6">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-display font-semibold text-slate-800 mb-1">Workflow JSON 預覽</h2>
            <p className="text-slate-500 text-sm">即將匯出的 Bolt.new Workflow 格式</p>
          </div>
          
          <div className="p-6">
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-80 overflow-y-auto">
              {JSON.stringify(convertToWorkflowJSON(), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};