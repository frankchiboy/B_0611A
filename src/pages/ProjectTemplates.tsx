import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  FileTemplate, 
  Plus, 
  Download, 
  Upload, 
  Star, 
  Copy, 
  Edit, 
  Trash, 
  Eye,
  Clock,
  Users,
  Calendar,
  Target,
  Layers,
  CheckCircle,
  Bookmark
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in weeks
  taskCount: number;
  resourceCount: number;
  milestoneCount: number;
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  previewData: {
    tasks: Array<{
      name: string;
      duration: number;
      dependencies: string[];
    }>;
    milestones: Array<{
      name: string;
      week: number;
    }>;
    resources: Array<{
      role: string;
      skills: string[];
    }>;
  };
}

const sampleTemplates: ProjectTemplate[] = [
  {
    id: 'tpl-1',
    name: '網站開發專案',
    description: '完整的網站開發流程，從需求分析到上線部署',
    category: '軟體開發',
    industry: '資訊科技',
    difficulty: 'intermediate',
    estimatedDuration: 12,
    taskCount: 25,
    resourceCount: 6,
    milestoneCount: 4,
    tags: ['網站', '前端', '後端', 'UI/UX'],
    isPublic: true,
    isFavorite: true,
    usageCount: 145,
    createdBy: 'Alex Chen',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    thumbnail: 'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=400',
    previewData: {
      tasks: [
        { name: '需求收集與分析', duration: 5, dependencies: [] },
        { name: 'UI/UX 設計', duration: 8, dependencies: ['需求收集與分析'] },
        { name: '前端開發', duration: 15, dependencies: ['UI/UX 設計'] },
        { name: '後端開發', duration: 20, dependencies: ['需求收集與分析'] },
        { name: '整合測試', duration: 7, dependencies: ['前端開發', '後端開發'] }
      ],
      milestones: [
        { name: '需求確認', week: 1 },
        { name: '設計完成', week: 3 },
        { name: '開發完成', week: 10 },
        { name: '上線部署', week: 12 }
      ],
      resources: [
        { role: '專案經理', skills: ['專案管理', '溝通協調'] },
        { role: 'UI/UX 設計師', skills: ['設計', 'Figma', '用戶體驗'] },
        { role: '前端工程師', skills: ['React', 'TypeScript', 'CSS'] },
        { role: '後端工程師', skills: ['Node.js', '資料庫', 'API'] }
      ]
    }
  },
  {
    id: 'tpl-2',
    name: '行銷活動企劃',
    description: '從策略規劃到執行監控的完整行銷活動流程',
    category: '行銷企劃',
    industry: '行銷廣告',
    difficulty: 'beginner',
    estimatedDuration: 8,
    taskCount: 18,
    resourceCount: 4,
    milestoneCount: 3,
    tags: ['行銷', '廣告', '社群媒體', '數據分析'],
    isPublic: true,
    isFavorite: false,
    usageCount: 89,
    createdBy: 'Sarah Wilson',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    thumbnail: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=400',
    previewData: {
      tasks: [
        { name: '市場調研', duration: 3, dependencies: [] },
        { name: '策略制定', duration: 2, dependencies: ['市場調研'] },
        { name: '創意發想', duration: 4, dependencies: ['策略制定'] },
        { name: '內容製作', duration: 6, dependencies: ['創意發想'] },
        { name: '活動執行', duration: 10, dependencies: ['內容製作'] }
      ],
      milestones: [
        { name: '策略確定', week: 2 },
        { name: '內容完成', week: 5 },
        { name: '活動結束', week: 8 }
      ],
      resources: [
        { role: '行銷經理', skills: ['策略規劃', '專案管理'] },
        { role: '創意總監', skills: ['創意發想', '視覺設計'] },
        { role: '內容編輯', skills: ['文案撰寫', '內容規劃'] },
        { role: '數據分析師', skills: ['數據分析', 'Google Analytics'] }
      ]
    }
  },
  {
    id: 'tpl-3',
    name: '產品開發流程',
    description: '從概念到量產的完整產品開發週期',
    category: '產品開發',
    industry: '製造業',
    difficulty: 'advanced',
    estimatedDuration: 24,
    taskCount: 45,
    resourceCount: 12,
    milestoneCount: 6,
    tags: ['產品設計', '製造', '品質控制', '供應鏈'],
    isPublic: true,
    isFavorite: true,
    usageCount: 67,
    createdBy: 'David Kim',
    createdAt: '2024-12-20T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
    thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
    previewData: {
      tasks: [
        { name: '概念設計', duration: 14, dependencies: [] },
        { name: '原型製作', duration: 21, dependencies: ['概念設計'] },
        { name: '測試驗證', duration: 10, dependencies: ['原型製作'] },
        { name: '量產準備', duration: 15, dependencies: ['測試驗證'] },
        { name: '品質檢驗', duration: 7, dependencies: ['量產準備'] }
      ],
      milestones: [
        { name: '概念確認', week: 2 },
        { name: '設計凍結', week: 8 },
        { name: '原型完成', week: 15 },
        { name: '測試通過', week: 18 },
        { name: '量產就緒', week: 22 },
        { name: '正式上市', week: 24 }
      ],
      resources: [
        { role: '產品經理', skills: ['產品管理', '市場分析'] },
        { role: '工業設計師', skills: ['產品設計', '3D建模'] },
        { role: '機械工程師', skills: ['機械設計', 'CAD'] },
        { role: '品質工程師', skills: ['品質管理', '測試驗證'] }
      ]
    }
  }
];

export const ProjectTemplates: React.FC = () => {
  const { createProject } = useProject();
  const [templates, setTemplates] = useState<ProjectTemplate[]>(sampleTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);

  // 篩選範本
  const filteredTemplates = templates.filter(template => {
    const categoryMatch = filterCategory === 'all' || template.category === filterCategory;
    const difficultyMatch = filterDifficulty === 'all' || template.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  // 取得所有類別
  const categories = Array.from(new Set(templates.map(t => t.category)));

  // 切換我的最愛
  const toggleFavorite = (templateId: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  // 使用範本建立專案
  const useTemplate = (template: ProjectTemplate) => {
    const projectName = `${template.name} - ${new Date().toLocaleDateString()}`;
    // 這裡可以根據範本數據建立實際的專案
    createProject(projectName);
    alert(`已基於「${template.name}」範本建立新專案！`);
  };

  // 複製範本
  const duplicateTemplate = (template: ProjectTemplate) => {
    const newTemplate: ProjectTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (副本)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    setTemplates([...templates, newTemplate]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-amber-100 text-amber-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '高級';
      default: return difficulty;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 標題區域 */}
      <div className="relative bg-[url('https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/80 to-blue-900/80 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">專案範本庫</h1>
              <p className="text-white/80">使用現成範本快速啟動您的專案，提升工作效率</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 transition-colors text-sm flex items-center">
                <Upload size={14} className="mr-1.5" />
                匯入範本
              </button>
              <button className="px-4 py-2 bg-white text-cyan-700 rounded-lg text-sm flex items-center shadow-sm hover:bg-cyan-50 transition-colors">
                <Plus size={14} className="mr-1.5" />
                建立範本
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 篩選和檢視控制 */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">所有類別</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">所有難度</option>
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">高級</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{filteredTemplates.length} 個範本</span>
            <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                網格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 範本列表 */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="card overflow-hidden hover:shadow-lg transition-all">
                {template.thumbnail && (
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${template.thumbnail})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                        template.isFavorite ? 'bg-amber-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Star size={16} fill={template.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(template.difficulty)}`}>
                        {getDifficultyLabel(template.difficulty)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{template.name}</h3>
                      <p className="text-sm text-slate-500">{template.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{template.description}</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-cyan-600">{template.taskCount}</div>
                      <div className="text-xs text-slate-500">任務</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{template.resourceCount}</div>
                      <div className="text-xs text-slate-500">資源</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{template.estimatedDuration}週</div>
                      <div className="text-xs text-slate-500">工期</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>使用 {template.usageCount} 次</span>
                    <span>by {template.createdBy}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm flex items-center justify-center"
                    >
                      <Eye size={14} className="mr-1" />
                      預覽
                    </button>
                    <button
                      onClick={() => useTemplate(template)}
                      className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                    >
                      使用
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">範本</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">類別</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">難度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">規模</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">使用次數</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">建立者</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTemplates.map(template => (
                    <tr key={template.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 mr-3 overflow-hidden">
                            {template.thumbnail ? (
                              <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileTemplate size={20} className="text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800 flex items-center">
                              {template.name}
                              {template.isFavorite && (
                                <Star size={14} className="text-amber-500 ml-2" fill="currentColor" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{template.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {template.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {getDifficultyLabel(template.difficulty)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {template.taskCount} 任務 / {template.resourceCount} 資源
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {template.usageCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {template.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(template.id)}
                            className="text-slate-400 hover:text-amber-500"
                          >
                            <Star size={16} fill={template.isFavorite ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowPreview(true);
                            }}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => useTemplate(template)}
                            className="text-cyan-600 hover:text-cyan-800"
                          >
                            使用
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 範本預覽對話框 */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{selectedTemplate.name}</h2>
                <p className="text-slate-500 text-sm">{selectedTemplate.description}</p>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本資訊 */}
                <div>
                  <h3 className="font-medium text-slate-800 mb-4">基本資訊</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">類別</span>
                      <span className="font-medium">{selectedTemplate.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">行業</span>
                      <span className="font-medium">{selectedTemplate.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">難度</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                        {getDifficultyLabel(selectedTemplate.difficulty)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">預估工期</span>
                      <span className="font-medium">{selectedTemplate.estimatedDuration} 週</span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-slate-800 mt-6 mb-3">標籤</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 統計資訊 */}
                <div>
                  <h3 className="font-medium text-slate-800 mb-4">專案規模</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">{selectedTemplate.taskCount}</div>
                      <div className="text-sm text-slate-500">任務數量</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedTemplate.resourceCount}</div>
                      <div className="text-sm text-slate-500">資源需求</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedTemplate.milestoneCount}</div>
                      <div className="text-sm text-slate-500">里程碑</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{selectedTemplate.usageCount}</div>
                      <div className="text-sm text-slate-500">使用次數</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 預覽內容 */}
              <div className="mt-8">
                <h3 className="font-medium text-slate-800 mb-4">範本內容預覽</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 主要任務 */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center">
                      <CheckCircle size={16} className="mr-2 text-cyan-500" />
                      主要任務
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.previewData.tasks.map((task, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="font-medium text-sm text-slate-800">{task.name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {task.duration} 天
                            {task.dependencies.length > 0 && (
                              <span className="ml-2">• 依賴: {task.dependencies.length} 項</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 里程碑 */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center">
                      <Bookmark size={16} className="mr-2 text-purple-500" />
                      關鍵里程碑
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.previewData.milestones.map((milestone, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="font-medium text-sm text-slate-800">{milestone.name}</div>
                          <div className="text-xs text-slate-500 mt-1">第 {milestone.week} 週</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 資源角色 */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center">
                      <Users size={16} className="mr-2 text-green-500" />
                      資源角色
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.previewData.resources.map((resource, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="font-medium text-sm text-slate-800">{resource.role}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {resource.skills.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => duplicateTemplate(selectedTemplate)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center"
              >
                <Copy size={16} className="mr-2" />
                複製範本
              </button>
              <button
                onClick={() => {
                  useTemplate(selectedTemplate);
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                使用此範本
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};