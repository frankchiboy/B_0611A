import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';

import { Calendar, Edit, PlusCircle, Trash, X } from 'lucide-react';
import type { Project } from '../../types/projectTypes';


interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;

  mode: 'create' | 'edit';
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({ isOpen, onClose, mode }) => {
  const { currentProject, createProject, updateProject, deleteProject } = useProject();

  const getInitialProject = (): Project | null => {
    if (mode === 'edit') return currentProject;
    if (mode === 'create') {
      return {
        id: '',
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'planning',
        progress: 0,
        tasks: [],
        resources: [],
        milestones: [],
        teams: [],
        costs: [],
        risks: [],
        budget: { total: 0, spent: 0, remaining: 0, currency: 'TWD', categories: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  };

  const [project, setProject] = useState<Project | null>(getInitialProject());

  useEffect(() => {
    if (isOpen) {
      setProject(getInitialProject());
    }
  }, [isOpen, mode]);

  if (!isOpen || !project) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleSave = () => {
    if (!project.name.trim()) {
      alert('請輸入專案名稱');

      return;
    }

    if (mode === 'create') {

      createProject(project.name);
    } else if (currentProject) {
      updateProject({ ...currentProject, ...project });
    }

    onClose();
  };

  const handleDelete = () => {

    if (mode === 'edit' && currentProject) {
      if (window.confirm('確定要刪除此專案嗎？')) {
        deleteProject(currentProject.id);

        onClose();
      }
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center">
            {mode === 'create' ? <PlusCircle size={24} className="text-teal-500 mr-3" /> : <Edit size={24} className="text-teal-500 mr-3" />}
            <h2 className="text-2xl font-display font-semibold">
              {mode === 'create' ? '建立專案' : '編輯專案'}
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              專案名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"

              value={project.name}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"

              placeholder="輸入專案名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">專案描述</label>
            <textarea
              name="description"

              value={project.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="輸入專案描述"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar size={16} className="inline mr-1.5" />

                開始日期
              </label>
              <input
                type="date"
                name="startDate"

                value={project.startDate}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar size={16} className="inline mr-1.5" />

                結束日期
              </label>
              <input
                type="date"
                name="endDate"

                value={project.endDate}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-between">
          <div>
            {mode === 'edit' && (
              <button onClick={handleDelete} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center">

                <Trash size={16} className="mr-2" />
                刪除專案
              </button>
            )}

          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              取消
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-teal-500 rounded-lg text-white hover:bg-teal-600">
              {mode === 'create' ? '建立專案' : '儲存變更'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDialog;