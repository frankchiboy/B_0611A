import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Plus, 
  Edit, 
  Trash, 
  Settings, 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List,
  DollarSign,
  User,
  Save,
  X
} from 'lucide-react';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'currency' | 'user';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select type
  appliesTo: 'tasks' | 'resources' | 'projects' | 'all';
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  boolean: CheckSquare,
  select: List,
  currency: DollarSign,
  user: User
};

const fieldTypeLabels = {
  text: '文字',
  number: '數字',
  date: '日期',
  boolean: '是/否',
  select: '下拉選單',
  currency: '貨幣',
  user: '使用者'
};

export const CustomFields: React.FC = () => {
  const { currentProject } = useProject();
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: 'cf-1',
      name: '專案優先級',
      type: 'select',
      description: '專案的重要性等級',
      required: true,
      options: ['低', '中', '高', '緊急'],
      defaultValue: '中',
      appliesTo: 'projects',
      category: '基本資訊',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'cf-2',
      name: '技能等級',
      type: 'select',
      description: '資源的技能熟練度',
      required: false,
      options: ['初級', '中級', '高級', '專家'],
      defaultValue: '中級',
      appliesTo: 'resources',
      category: '技能評估',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'cf-3',
      name: '預估收益',
      type: 'currency',
      description: '任務完成後預期帶來的收益',
      required: false,
      defaultValue: 0,
      appliesTo: 'tasks',
      category: '財務',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'cf-4',
      name: '客戶滿意度',
      type: 'number',
      description: '客戶對任務的滿意度評分 (1-10)',
      required: false,
      defaultValue: 5,
      appliesTo: 'tasks',
      category: '品質評估',
      isActive: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ]);

  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomField>>({});

  // 新增自訂欄位
  const handleCreateField = () => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: editForm.name || '',
      type: editForm.type || 'text',
      description: editForm.description || '',
      required: editForm.required || false,
      defaultValue: editForm.defaultValue,
      options: editForm.options,
      appliesTo: editForm.appliesTo || 'tasks',
      category: editForm.category || '自訂',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCustomFields([...customFields, newField]);
    setShowCreateForm(false);
    setEditForm({});
  };

  // 更新自訂欄位
  const handleUpdateField = () => {
    if (!selectedField) return;

    const updatedField = {
      ...selectedField,
      ...editForm,
      updatedAt: new Date().toISOString()
    };

    setCustomFields(fields => 
      fields.map(field => 
        field.id === selectedField.id ? updatedField : field
      )
    );

    setSelectedField(updatedField);
    setIsEditing(false);
    setEditForm({});
  };

  // 刪除自訂欄位
  const handleDeleteField = (fieldId: string) => {
    if (window.confirm('確定要刪除此自訂欄位嗎？這個操作無法復原。')) {
      setCustomFields(fields => fields.filter(field => field.id !== fieldId));
      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }
    }
  };

  // 切換欄位狀態
  const toggleFieldStatus = (fieldId: string) => {
    setCustomFields(fields => 
      fields.map(field => 
        field.id === fieldId 
          ? { ...field, isActive: !field.isActive, updatedAt: new Date().toISOString() }
          : field
      )
    );
  };

  // 依類別分組欄位
  const fieldsByCategory = customFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, CustomField[]>);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Settings size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">沒有可用的專案</h2>
          <p className="text-slate-500">請選擇或創建一個專案以管理自訂欄位</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 標題區域 */}
      <div className="relative bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/80 to-purple-900/80 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">自訂欄位管理</h1>
              <p className="text-white/80">建立和管理專案、任務與資源的自訂屬性</p>
            </div>
            
            <button 
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-white text-violet-700 rounded-lg text-sm flex items-center shadow-sm hover:bg-violet-50 transition-colors"
            >
              <Plus size={14} className="mr-1.5" />
              新增欄位
            </button>
          </div>
        </div>
      </div>

      {/* 統計概覽 */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">{customFields.length}</div>
            <div className="text-xs text-slate-500">總欄位數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customFields.filter(f => f.isActive).length}
            </div>
            <div className="text-xs text-slate-500">啟用中</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(fieldsByCategory).length}
            </div>
            <div className="text-xs text-slate-500">類別數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {customFields.filter(f => f.required).length}
            </div>
            <div className="text-xs text-slate-500">必填欄位</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* 欄位列表 */}
          <div className="lg:col-span-2 bg-white border-r border-slate-200">
            <div className="p-6">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-medium text-slate-800 mb-3 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-violet-500 mr-2"></div>
                    {category}
                    <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {fields.length}
                    </span>
                  </h3>
                  
                  <div className="space-y-2">
                    {fields.map(field => {
                      const IconComponent = fieldTypeIcons[field.type];
                      
                      return (
                        <div 
                          key={field.id}
                          className={`p-4 border border-slate-200 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                            selectedField?.id === field.id ? 'ring-2 ring-violet-500 bg-violet-50' : 'hover:bg-slate-50'
                          } ${!field.isActive ? 'opacity-60' : ''}`}
                          onClick={() => setSelectedField(field)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg mr-3 ${
                                field.isActive ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <IconComponent size={16} />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-800">{field.name}</h4>
                                <p className="text-sm text-slate-500 mt-1">{field.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {fieldTypeLabels[field.type]}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    {field.appliesTo === 'all' ? '全部' : 
                                     field.appliesTo === 'tasks' ? '任務' :
                                     field.appliesTo === 'resources' ? '資源' : '專案'}
                                  </span>
                                  {field.required && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                      必填
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFieldStatus(field.id);
                                }}
                                className={`w-8 h-4 rounded-full transition-colors ${
                                  field.isActive ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                              >
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                                  field.isActive ? 'translate-x-4' : 'translate-x-0.5'
                                }`}></div>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteField(field.id);
                                }}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {customFields.length === 0 && (
                <div className="text-center py-12">
                  <Settings size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="font-medium text-slate-800 mb-2">尚未建立自訂欄位</h3>
                  <p className="text-slate-500 mb-4">開始建立您的第一個自訂欄位</p>
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg"
                  >
                    建立欄位
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 欄位詳情/編輯面板 */}
          <div className="bg-slate-50 p-6">
            {selectedField ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-slate-800">欄位詳情</h3>
                  <button 
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) {
                        setEditForm(selectedField);
                      } else {
                        setEditForm({});
                      }
                    }}
                    className="text-violet-600 hover:text-violet-800 text-sm flex items-center"
                  >
                    {isEditing ? <X size={16} className="mr-1" /> : <Edit size={16} className="mr-1" />}
                    {isEditing ? '取消' : '編輯'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">名稱</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">{selectedField.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">類型</label>
                    {isEditing ? (
                      <select 
                        value={editForm.type || ''}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      >
                        {Object.entries(fieldTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">
                        {fieldTypeLabels[selectedField.type]}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">描述</label>
                    {isEditing ? (
                      <textarea 
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">{selectedField.description}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">套用到</label>
                    {isEditing ? (
                      <select 
                        value={editForm.appliesTo || ''}
                        onChange={(e) => setEditForm({...editForm, appliesTo: e.target.value as any})}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      >
                        <option value="tasks">任務</option>
                        <option value="resources">資源</option>
                        <option value="projects">專案</option>
                        <option value="all">全部</option>
                      </select>
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">
                        {selectedField.appliesTo === 'all' ? '全部' : 
                         selectedField.appliesTo === 'tasks' ? '任務' :
                         selectedField.appliesTo === 'resources' ? '資源' : '專案'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">類別</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">{selectedField.category}</div>
                    )}
                  </div>

                  {(selectedField.type === 'select' || (isEditing && editForm.type === 'select')) && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">選項</label>
                      {isEditing ? (
                        <textarea 
                          value={editForm.options?.join('\n') || ''}
                          onChange={(e) => setEditForm({...editForm, options: e.target.value.split('\n').filter(o => o.trim())})}
                          rows={4}
                          placeholder="每行一個選項"
                          className="w-full p-2 border border-slate-200 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm bg-white p-2 rounded border">
                          {selectedField.options?.join(', ') || '無'}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center">
                    {isEditing ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editForm.required || false}
                          onChange={(e) => setEditForm({...editForm, required: e.target.checked})}
                          className="form-checkbox h-4 w-4 text-violet-600 mr-2"
                        />
                        <span className="text-sm text-slate-700">必填欄位</span>
                      </label>
                    ) : (
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded border-2 mr-2 ${
                          selectedField.required ? 'bg-violet-500 border-violet-500' : 'border-slate-300'
                        }`}>
                          {selectedField.required && (
                            <div className="text-white text-xs">✓</div>
                          )}
                        </div>
                        <span className="text-sm text-slate-700">必填欄位</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <button 
                        onClick={handleUpdateField}
                        className="flex-1 px-3 py-2 bg-violet-600 text-white rounded text-sm flex items-center justify-center"
                      >
                        <Save size={16} className="mr-1" />
                        儲存
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <div>建立時間: {new Date(selectedField.createdAt).toLocaleString()}</div>
                    <div>更新時間: {new Date(selectedField.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <Settings size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">選擇一個自訂欄位</p>
                <p className="text-xs">查看或編輯詳細資訊</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 建立欄位對話框 */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-800">建立新的自訂欄位</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">欄位名稱</label>
                <input 
                  type="text" 
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="輸入欄位名稱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">欄位類型</label>
                <select 
                  value={editForm.type || 'text'}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {Object.entries(fieldTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea 
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="描述此欄位的用途"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">套用到</label>
                <select 
                  value={editForm.appliesTo || 'tasks'}
                  onChange={(e) => setEditForm({...editForm, appliesTo: e.target.value as any})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="tasks">任務</option>
                  <option value="resources">資源</option>
                  <option value="projects">專案</option>
                  <option value="all">全部</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">類別</label>
                <input 
                  type="text" 
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="欄位類別"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.required || false}
                    onChange={(e) => setEditForm({...editForm, required: e.target.checked})}
                    className="form-checkbox h-4 w-4 text-violet-600 mr-2"
                  />
                  <span className="text-sm text-slate-700">設為必填欄位</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditForm({});
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
              >
                取消
              </button>
              <button 
                onClick={handleCreateField}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg"
              >
                建立欄位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};