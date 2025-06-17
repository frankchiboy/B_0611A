import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Calendar, FileText, Trash, Save } from 'lucide-react';
import { Project } from '../../types/projectTypes';
import { createEmptyProject } from '../../utils/projectUtils';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  mode: 'create' | 'edit';
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  mode
}) => {
  const { currentProject, projects, createProject, updateProject, deleteProject } = useProject();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planning' as const
  });

  useEffect(() => {
    if (isOpen && mode === 'edit' && projectId) {
      const project = projects.find(p => p.id === projectId) || currentProject;
      if (project) {
        setFormData({
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status
        });
      }
    } else if (isOpen && mode === 'create') {
      setFormData({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'planning'
      });
    }
  }, [isOpen, mode, projectId, projects, currentProject]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('請輸入專案名稱');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('結束日期必須晚於開始日期');
      return;
    }

    if (mode === 'create') {
      const newProject = createEmptyProject(formData.name);
      const updatedProject = {
        ...newProject,
        ...formData
      };
      createProject(updatedProject.name);
    } else if (mode === 'edit' && projectId) {
      const project = projects.find(p => p.id === projectId) || currentProject;
      if (project) {
        const updatedProject = {
          ...project,
          ...formData,
          updatedAt: new Date().toISOString()
        };
        updateProject(updatedProject);
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (mode === 'edit' && projectId) {
      if (window.confirm('確定要刪除此專案嗎？此操作無法復原。')) {
        deleteProject(projectId);
        onClose();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">
            {mode === 'create' ? '建立新專案' : '編輯專案'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              專案名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="輸入專案名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">專案描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="輸入專案描述"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                開始日期
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                結束日期
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">專案狀態</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="planning">規劃中</option>
              <option value="active">進行中</option>
              <option value="on-hold">暫停</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center"
              >
                <Trash size={16} className="mr-2" />
                刪除專案
              </button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 rounded-lg text-white hover:bg-teal-600 flex items-center"
              >
                <Save size={16} className="mr-2" />
                {mode === 'create' ? '建立專案' : '儲存變更'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};