import { v4 as uuidv4 } from 'uuid';
import { Project, Task, Resource, Milestone, Team, CostRecord, Risk, DashboardMetrics } from '../types/projectTypes';

// 建立空白專案
export const createEmptyProject = (name?: string): Project => {
  const projectId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: projectId,
    name: name || `新專案 ${new Date().getTime()}`,
    description: '新建立的專案',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days later
    status: 'planning',
    progress: 0,
    tasks: [],
    resources: [],
    milestones: [],
    teams: [],
    costs: [],
    risks: [],
    budget: {
      total: 100000,
      spent: 0,
      remaining: 100000,
      currency: 'TWD',
      categories: [
        {
          id: uuidv4(),
          name: '人事費用',
          planned: 60000,
          actual: 0
        },
        {
          id: uuidv4(),
          name: '設備費用',
          planned: 25000,
          actual: 0
        },
        {
          id: uuidv4(),
          name: '其他費用',
          planned: 15000,
          actual: 0
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  };
};

// 建立新任務
export const createTask = (
  projectId: string,
  name: string,
  startDate: string,
  endDate: string,
  description?: string
): Task => {
  const taskId = uuidv4();
  const now = new Date().toISOString();
  
  // 計算工期
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    id: taskId,
    name,
    description: description || '',
    startDate,
    endDate,
    duration: Math.max(1, duration),
    progress: 0,
    status: 'not-started',
    priority: 'medium',
    assignedTo: [],
    dependencies: [],
    isMilestone: false,
    notes: '',
    attachments: [],
    createdAt: now,
    updatedAt: now
  };
};

// 建立新資源
export const createResource = (name: string, type: 'human' | 'material' | 'equipment'): Resource => {
  const resourceId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: resourceId,
    name,
    type,
    cost: type === 'human' ? 1000 : 500, // 預設時薪或單價
    availability: type === 'human' ? [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
    ] : [],
    utilization: 0,
    createdAt: now,
    updatedAt: now
  };
};

// 建立新里程碑
export const createMilestone = (name: string, date: string, description?: string): Milestone => {
  const milestoneId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: milestoneId,
    name,
    description: description || '',
    date,
    status: 'upcoming',
    taskIds: [],
    createdAt: now,
    updatedAt: now
  };
};

// 建立新團隊
export const createTeam = (name: string, description?: string): Team => {
  const teamId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: teamId,
    name,
    description: description || '',
    members: [],
    createdAt: now,
    updatedAt: now
  };
};

// 建立新成本紀錄
export const createCostRecord = (taskId: string): CostRecord => {
  const costId = uuidv4();
  
  return {
    id: costId,
    taskId,
    amount: 0,
    category: '其他',
    currency: 'TWD',
    date: new Date().toISOString().split('T')[0],
    invoiceId: '',
    status: 'pending',
    note: ''
  };
};

// 建立新風險
export const createRisk = (name: string): Risk => {
  const riskId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: riskId,
    name,
    description: '',
    probability: 'medium',
    impact: 'medium',
    status: 'identified',
    mitigation: '',
    owner: '',
    createdAt: now,
    updatedAt: now
  };
};

// 計算專案進度
export const calculateProjectProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
};

// 計算專案統計
export const getDashboardMetrics = (project: Project): DashboardMetrics => {
  const tasks = project.tasks;
  const resources = project.resources;
  const risks = project.risks;
  const milestones = project.milestones;
  
  // 任務完成率
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  // 即將到來的里程碑
  const upcomingMilestones = milestones.filter(milestone => {
    const milestoneDate = new Date(milestone.date);
    const today = new Date();
    const daysUntil = (milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return milestone.status === 'upcoming' && daysUntil <= 30 && daysUntil > 0;
  }).length;
  
  // 平均資源利用率
  const resourceUtilization = resources.length > 0 
    ? Math.round(resources.reduce((sum, res) => sum + res.utilization, 0) / resources.length)
    : 0;
  
  // 預算狀態
  const budgetPercentage = Math.round((project.budget.spent / project.budget.total) * 100);
  const budgetStatus: 'under' | 'on-track' | 'over' = 
    budgetPercentage < 80 ? 'under' : 
    budgetPercentage <= 100 ? 'on-track' : 'over';
  
  // 風險統計
  const risksCount = {
    low: risks.filter(risk => risk.impact === 'low' && risk.probability === 'low').length,
    medium: risks.filter(risk => 
      (risk.impact === 'medium' && risk.probability === 'low') ||
      (risk.impact === 'low' && risk.probability === 'medium') ||
      (risk.impact === 'medium' && risk.probability === 'medium')
    ).length,
    high: risks.filter(risk => 
      risk.impact === 'high' || risk.probability === 'high'
    ).length
  };
  
  return {
    taskCompletion,
    upcomingMilestones,
    resourceUtilization,
    budgetStatus: {
      percentage: budgetPercentage,
      status: budgetStatus
    },
    risksCount
  };
};

// 計算任務關鍵路徑
export const calculateCriticalPath = (tasks: Task[]): Task[] => {
  // 簡化版的關鍵路徑計算
  // 實際應用中需要更複雜的 CPM 算法
  
  const criticalTasks: Task[] = [];
  const taskMap = new Map<string, Task>();
  
  // 建立任務映射
  tasks.forEach(task => {
    taskMap.set(task.id, task);
  });
  
  // 找出沒有依賴的起始任務
  const startTasks = tasks.filter(task => task.dependencies.length === 0);
  
  // 遞歸計算最長路徑
  const findLongestPath = (task: Task, visited: Set<string>): number => {
    if (visited.has(task.id)) return 0; // 避免循環依賴
    
    visited.add(task.id);
    
    let maxDuration = task.duration;
    
    // 找出依賴此任務的後續任務
    const dependentTasks = tasks.filter(t => t.dependencies.includes(task.id));
    
    for (const depTask of dependentTasks) {
      const pathDuration = task.duration + findLongestPath(depTask, new Set(visited));
      maxDuration = Math.max(maxDuration, pathDuration);
    }
    
    return maxDuration;
  };
  
  // 找出關鍵路徑
  let maxPathDuration = 0;
  let criticalStartTask: Task | null = null;
  
  for (const startTask of startTasks) {
    const pathDuration = findLongestPath(startTask, new Set());
    if (pathDuration > maxPathDuration) {
      maxPathDuration = pathDuration;
      criticalStartTask = startTask;
    }
  }
  
  // 建構關鍵路徑任務列表
  if (criticalStartTask) {
    const buildCriticalPath = (task: Task, path: Task[]): void => {
      path.push(task);
      
      const dependentTasks = tasks.filter(t => t.dependencies.includes(task.id));
      if (dependentTasks.length > 0) {
        // 選擇最長的後續路徑
        let longestDepTask: Task | null = null;
        let longestDuration = 0;
        
        for (const depTask of dependentTasks) {
          const duration = findLongestPath(depTask, new Set());
          if (duration > longestDuration) {
            longestDuration = duration;
            longestDepTask = depTask;
          }
        }
        
        if (longestDepTask) {
          buildCriticalPath(longestDepTask, path);
        }
      }
    };
    
    buildCriticalPath(criticalStartTask, criticalTasks);
  }
  
  return criticalTasks;
};

// 驗證專案數據完整性
export const validateProject = (project: Project): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 檢查基本資訊
  if (!project.name || project.name.trim().length === 0) {
    errors.push('專案名稱不能為空');
  }
  
  if (!project.startDate || !project.endDate) {
    errors.push('專案開始和結束日期必須設定');
  } else {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    if (startDate >= endDate) {
      errors.push('專案結束日期必須晚於開始日期');
    }
  }
  
  // 檢查任務
  project.tasks.forEach((task, index) => {
    if (!task.name || task.name.trim().length === 0) {
      errors.push(`任務 ${index + 1} 的名稱不能為空`);
    }
    
    if (task.duration <= 0) {
      errors.push(`任務 "${task.name}" 的工期必須大於 0`);
    }
    
    if (task.progress < 0 || task.progress > 100) {
      errors.push(`任務 "${task.name}" 的進度必須在 0-100% 之間`);
    }
    
    // 檢查依賴關係
    task.dependencies.forEach(depId => {
      if (!project.tasks.find(t => t.id === depId)) {
        errors.push(`任務 "${task.name}" 依賴的任務不存在`);
      }
    });
  });
  
  // 檢查資源
  project.resources.forEach((resource, index) => {
    if (!resource.name || resource.name.trim().length === 0) {
      errors.push(`資源 ${index + 1} 的名稱不能為空`);
    }
    
    if (resource.cost < 0) {
      errors.push(`資源 "${resource.name}" 的成本不能為負數`);
    }
    
    if (resource.utilization < 0 || resource.utilization > 100) {
      errors.push(`資源 "${resource.name}" 的利用率必須在 0-100% 之間`);
    }
  });
  
  // 檢查預算
  if (project.budget.total <= 0) {
    errors.push('專案總預算必須大於 0');
  }
  
  if (project.budget.spent < 0) {
    errors.push('已支出預算不能為負數');
  }
  
  if (project.budget.spent > project.budget.total) {
    errors.push('已支出預算不能超過總預算');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};