import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit, 
  Trash, 
  Move, 
  FileText,
  BarChart3,
  Clock,
  Users,
  DollarSign,
  Target,
  Layers
} from 'lucide-react';

interface WBSNode {
  id: string;
  code: string;
  name: string;
  description: string;
  level: number;
  parentId?: string;
  children: string[];
  taskIds: string[];
  isExpanded: boolean;
  deliverables: string[];
  estimatedHours: number;
  estimatedCost: number;
}

export const WorkBreakdownStructure: React.FC = () => {
  const { currentProject } = useProject();
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([
    {
      id: 'wbs-1',
      code: '1.0',
      name: '專案管理',
      description: '專案整體管理與協調',
      level: 1,
      children: ['wbs-1-1', 'wbs-1-2'],
      taskIds: [],
      isExpanded: true,
      deliverables: ['專案計劃書', '風險管理計劃'],
      estimatedHours: 120,
      estimatedCost: 12000
    },
    {
      id: 'wbs-1-1',
      code: '1.1',
      name: '專案啟動',
      description: '專案啟動階段相關工作',
      level: 2,
      parentId: 'wbs-1',
      children: [],
      taskIds: [],
      isExpanded: false,
      deliverables: ['專案章程', 'stakeholder 清單'],
      estimatedHours: 40,
      estimatedCost: 4000
    },
    {
      id: 'wbs-1-2',
      code: '1.2',
      name: '專案規劃',
      description: '詳細專案規劃工作',
      level: 2,
      parentId: 'wbs-1',
      children: [],
      taskIds: [],
      isExpanded: false,
      deliverables: ['工作分解結構', '時程計劃'],
      estimatedHours: 80,
      estimatedCost: 8000
    },
    {
      id: 'wbs-2',
      code: '2.0',
      name: '系統設計',
      description: '系統架構與介面設計',
      level: 1,
      children: ['wbs-2-1', 'wbs-2-2'],
      taskIds: [],
      isExpanded: true,
      deliverables: ['系統架構圖', 'UI/UX 設計稿'],
      estimatedHours: 200,
      estimatedCost: 25000
    },
    {
      id: 'wbs-2-1',
      code: '2.1',
      name: '需求分析',
      description: '系統需求收集與分析',
      level: 2,
      parentId: 'wbs-2',
      children: [],
      taskIds: [],
      isExpanded: false,
      deliverables: ['需求規格書', '使用案例圖'],
      estimatedHours: 80,
      estimatedCost: 10000
    },
    {
      id: 'wbs-2-2',
      code: '2.2',
      name: 'UI/UX 設計',
      description: '使用者介面與體驗設計',
      level: 2,
      parentId: 'wbs-2',
      children: [],
      taskIds: [],
      isExpanded: false,
      deliverables: ['線框圖', '視覺設計稿', '互動原型'],
      estimatedHours: 120,
      estimatedCost: 15000
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 計算 WBS 統計資訊
  const wbsStats = useMemo(() => {
    const totalNodes = wbsNodes.length;
    const totalHours = wbsNodes.reduce((sum, node) => sum + node.estimatedHours, 0);
    const totalCost = wbsNodes.reduce((sum, node) => sum + node.estimatedCost, 0);
    const maxLevel = Math.max(...wbsNodes.map(node => node.level));
    const deliverables = wbsNodes.reduce((sum, node) => sum + node.deliverables.length, 0);

    return {
      totalNodes,
      totalHours,
      totalCost,
      maxLevel,
      deliverables
    };
  }, [wbsNodes]);

  // 切換節點展開/收合
  const toggleNodeExpansion = (nodeId: string) => {
    setWbsNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, isExpanded: !node.isExpanded }
          : node
      )
    );
  };

  // 獲取可見節點（考慮展開狀態）
  const getVisibleNodes = () => {
    const visibleNodes: WBSNode[] = [];
    const processNode = (node: WBSNode) => {
      visibleNodes.push(node);
      if (node.isExpanded && node.children.length > 0) {
        node.children.forEach(childId => {
          const childNode = wbsNodes.find(n => n.id === childId);
          if (childNode) {
            processNode(childNode);
          }
        });
      }
    };

    // 先處理根節點（level 1）
    wbsNodes
      .filter(node => node.level === 1)
      .forEach(rootNode => processNode(rootNode));

    return visibleNodes;
  };

  // 渲染 WBS 節點
  const renderWBSNode = (node: WBSNode) => {
    const hasChildren = node.children.length > 0;
    const indentLevel = (node.level - 1) * 24;

    return (
      <div 
        key={node.id}
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
          selectedNode?.id === node.id ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => setSelectedNode(node)}
      >
        <div className="flex items-center p-4" style={{ paddingLeft: `${16 + indentLevel}px` }}>
          {/* 展開/收合按鈕 */}
          <div className="w-6 flex justify-center">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(node.id);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                {node.isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <div className="w-4"></div>
            )}
          </div>

          {/* WBS 代碼 */}
          <div className="w-20 text-sm font-mono text-slate-600 mr-4">
            {node.code}
          </div>

          {/* 節點資訊 */}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-medium text-slate-800 mr-2">{node.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                node.level === 1 ? 'bg-blue-100 text-blue-800' :
                node.level === 2 ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                Level {node.level}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{node.description}</p>
            {node.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.deliverables.map((deliverable, index) => (
                  <span key={index} className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                    {deliverable}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 統計資訊 */}
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              {node.estimatedHours}h
            </div>
            <div className="flex items-center">
              <DollarSign size={14} className="mr-1" />
              ${node.estimatedCost.toLocaleString()}
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <Edit size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Layers size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">沒有可用的專案</h2>
          <p className="text-slate-500">請選擇或創建一個專案以查看工作分解結構</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 標題區域 */}
      <div className="relative bg-[url('https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">工作分解結構 (WBS)</h1>
              <p className="text-white/80">層次化分解專案工作範圍，明確定義交付成果</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 transition-colors text-sm flex items-center">
                <FileText size={14} className="mr-1.5" />
                匯出 WBS
              </button>
              <button className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm flex items-center shadow-sm hover:bg-indigo-50 transition-colors">
                <Plus size={14} className="mr-1.5" />
                新增節點
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
          {/* WBS 樹狀結構 */}
          <div className="lg:col-span-3 bg-white border-r border-slate-200">
            {/* 統計概覽 */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{wbsStats.totalNodes}</div>
                  <div className="text-xs text-slate-500">工作包</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{wbsStats.maxLevel}</div>
                  <div className="text-xs text-slate-500">分解層級</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{wbsStats.deliverables}</div>
                  <div className="text-xs text-slate-500">交付成果</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{wbsStats.totalHours}</div>
                  <div className="text-xs text-slate-500">預估時數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600">${wbsStats.totalCost.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">預估成本</div>
                </div>
              </div>
            </div>

            {/* WBS 樹狀清單 */}
            <div className="overflow-auto">
              <div className="min-w-full">
                {getVisibleNodes().map(node => renderWBSNode(node))}
              </div>
            </div>
          </div>

          {/* 節點詳情面板 */}
          <div className="lg:col-span-1 bg-slate-50 p-6">
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-800">節點詳情</h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {isEditing ? '取消' : '編輯'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">WBS 代碼</label>
                    <div className="font-mono text-sm bg-white p-2 rounded border">{selectedNode.code}</div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">名稱</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={selectedNode.name}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">{selectedNode.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-1">描述</label>
                    {isEditing ? (
                      <textarea 
                        value={selectedNode.description}
                        rows={3}
                        className="w-full p-2 border border-slate-200 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm bg-white p-2 rounded border">{selectedNode.description}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">預估時數</label>
                      <div className="text-sm bg-white p-2 rounded border flex items-center">
                        <Clock size={14} className="text-slate-400 mr-1" />
                        {selectedNode.estimatedHours}h
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">預估成本</label>
                      <div className="text-sm bg-white p-2 rounded border flex items-center">
                        <DollarSign size={14} className="text-slate-400 mr-1" />
                        ${selectedNode.estimatedCost.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase block mb-2">交付成果</label>
                    <div className="space-y-1">
                      {selectedNode.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center text-sm bg-white p-2 rounded border">
                          <Target size={14} className="text-green-500 mr-2" />
                          {deliverable}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm">
                        儲存
                      </button>
                      <button className="px-3 py-2 border border-slate-200 rounded text-sm">
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">選擇一個 WBS 節點</p>
                <p className="text-xs">查看詳細資訊</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};