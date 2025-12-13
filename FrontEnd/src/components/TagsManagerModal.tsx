import React, { useState } from 'react';
import { useLanguage } from '../config/i18n';
import { Tag } from '../types/types';

interface TagsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onAdd: (tag: Tag) => void;
  onUpdate: (tag: Tag) => void;
  onDelete: (id: string) => void;
}

const TagsManagerModal: React.FC<TagsManagerModalProps> = ({ isOpen, onClose, tags, onAdd, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ label: '', color: '#6366f1' });
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setFormData({ label: '', color: '#6366f1' });
      setEditingId(null);
      setDeleteId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (formData.label) {
      if (editingId) {
        onUpdate({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        onAdd({ id: `tag_${Date.now()}`, ...formData });
      }
      setFormData({ label: '', color: '#6366f1' });
    }
  };

  const handleEditClick = (tag: Tag) => {
    setEditingId(tag.id);
    setFormData({ label: tag.label, color: tag.color });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ label: '', color: '#6366f1' });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      if (editingId === deleteId) {
        handleCancelEdit();
      }
    }
  };

  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        {deleteId && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              {/* Alerta de exclusão */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Tag?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita e removerá a tag de todas as oportunidades associadas.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{t('leads.tags_modal_title') || 'Gerenciar Etiquetas'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`space-y-4 p-4 bg-gray-50 rounded-lg border ${editingId ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {editingId ? 'Editar Tag' : 'Nova Tag'}
              </span>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5L19.5 4.5M4.5 4.5l15 15" /></svg>
                  Cancelar
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da Tag (Ex: Quente)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                onClick={handleSave}
                disabled={!formData.label}
                className={`px-4 py-2 text-white font-medium rounded-lg disabled:opacity-50 text-sm flex items-center gap-2 transition-colors ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-900'}`}
              >
                {editingId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <div className="relative group">
                <div
                  className={`w-8 h-8 rounded-lg border cursor-pointer flex items-center justify-center ${isCustomColor ? 'ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: formData.color }}
                >
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => {
                      setFormData({ ...formData, color: e.target.value });
                      setIsCustomColor(true);
                    }}
                    className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                  />
                  {/* Ícone de paleta */}
                  <svg className="w-4 h-4 text-white drop-shadow-md pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7.03 3 3 7.03 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 0v0m0 0v0m0 0v0" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {tags.map((tag: Tag) => (
              <div key={tag.id} className={`flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-sm transition-all ${editingId === tag.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                  <span className="text-sm font-medium text-gray-700">{tag.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(tag)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                    title={t('common.edit')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9.293-9.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L10 20H3v-6z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tag.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                    title={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-gray-400 text-center italic py-4">Nenhuma tag criada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsManagerModal;
