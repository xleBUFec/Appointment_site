import React, { useState } from 'react';
import { Service, UserProfile } from '../../types';
import { saveService, deleteService } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Clock, Sparkles, Check, X, Scissors } from 'lucide-react';

interface AdminServicesTabProps {
  services: Service[];
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const AdminServicesTab: React.FC<AdminServicesTabProps> = ({
  services,
  currentUser,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Service>>({
    title: '',
    description: '',
    price: 2500,
    duration_min: 45,
    category: 'hair',
    popular: false,
    active: true,
  });

  const handleOpenAdd = () => {
    setEditForm({
      id: 'srv-' + Math.random().toString(36).substr(2, 7),
      title: '',
      description: '',
      price: 2500,
      duration_min: 45,
      category: 'hair',
      popular: false,
      active: true,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditForm({ ...srv });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.price) return;
    await saveService(editForm as Service, currentUser);
    await onRefresh();
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить эту услугу из меню?')) {
      await deleteService(id, currentUser);
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
            Управление прайс-листом и услугами
          </h3>
          <p className="text-xs text-[#8b949e]">
            Маркетологи и администраторы могут менять цены и описания без помощи программистов
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="gold-button flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить услугу</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <div
            key={service.id}
            className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col justify-between hover:border-[#38414e] transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-semibold text-[#c59b27] uppercase tracking-wider block mb-1">
                    {service.category === 'hair' ? 'Стрижки' : service.category === 'beard' ? 'Борода' : service.category === 'combo' ? 'Комплекс' : 'СПА'}
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#f8f5ee]">
                    {service.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  {service.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#fce082] text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#e4ba43]" />
                      Хит
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#8b949e] line-clamp-2 mb-4">
                {service.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-[#f8f5ee]">
                  {service.price.toLocaleString('ru-RU')} ₽
                </span>
                <span className="flex items-center gap-1 text-xs text-[#8b949e]">
                  <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                  {service.duration_min} мин
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="p-2 rounded-lg text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
                  title="Редактировать"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                  title="Удалить услугу"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#21262d] mb-4">
              <h4 className="font-serif text-lg font-bold text-[#f8f5ee]">
                {editForm.id && services.some(s => s.id === editForm.id) ? 'Редактирование услуги' : 'Новая услуга'}
              </h4>
              <button onClick={() => setIsEditing(false)} className="text-[#8b949e] hover:text-[#f8f5ee]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Название услуги *</label>
                <input
                  type="text"
                  required
                  value={editForm.title || ''}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  placeholder="Например: Моделирование бороды"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Цена (₽) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.price || 0}
                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Длительность (мин) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.duration_min || 30}
                    onChange={e => setEditForm({ ...editForm, duration_min: Number(e.target.value) })}
                    className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Категория</label>
                <select
                  value={editForm.category || 'hair'}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                >
                  <option value="hair">Стрижки</option>
                  <option value="beard">Борода и усы</option>
                  <option value="combo">Комплексы</option>
                  <option value="spa">СПА и уход</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Описание услуги</label>
                <textarea
                  rows={3}
                  value={editForm.description || ''}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  placeholder="Что входит в услугу..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="popCheck"
                  checked={Boolean(editForm.popular)}
                  onChange={e => setEditForm({ ...editForm, popular: e.target.checked })}
                  className="w-4 h-4 rounded text-[#c59b27] bg-[#0e1117] border-[#21262d]"
                />
                <label htmlFor="popCheck" className="text-xs text-[#f8f5ee] cursor-pointer">
                  Отметить бейджем «Хит / Популярное» на главной странице
                </label>
              </div>

              <div className="pt-4 border-t border-[#21262d] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-[#21262d] text-xs text-[#8b949e] hover:text-[#f8f5ee]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="gold-button px-5 py-2 rounded-xl text-xs font-bold text-black"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
