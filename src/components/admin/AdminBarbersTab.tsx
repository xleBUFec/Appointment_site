import React, { useState } from 'react';
import { Barber, UserProfile } from '../../types';
import { saveBarber, deleteBarber } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Star, Award, X, User } from 'lucide-react';

interface AdminBarbersTabProps {
  barbers: Barber[];
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const AdminBarbersTab: React.FC<AdminBarbersTabProps> = ({
  barbers,
  currentUser,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Barber>>({
    name: '',
    role: 'Барбер',
    avatar_url: '',
    experience: '3 года опыта',
    rating: 4.9,
    bio: '',
    active: true,
  });

  const handleOpenAdd = () => {
    setEditForm({
      id: 'barber-' + Math.random().toString(36).substr(2, 7),
      name: '',
      role: 'Барбер',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      experience: '3 года опыта',
      rating: 4.9,
      bio: '',
      active: true,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (barber: Barber) => {
    setEditForm({ ...barber });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name) return;
    await saveBarber(editForm as Barber, currentUser);
    await onRefresh();
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить мастера из системы?')) {
      await deleteBarber(id, currentUser);
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
            Команда мастеров и стилистов
          </h3>
          <p className="text-xs text-[#8b949e]">
            Управление персоналом, фото, стажем и личными карточками мастеров
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="gold-button flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить мастера</span>
        </button>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {barbers.map(barber => (
          <div
            key={barber.id}
            className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col justify-between hover:border-[#38414e] transition-all"
          >
            <div>
              <div className="relative mb-4 overflow-hidden rounded-xl aspect-square">
                <img
                  src={barber.avatar_url}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-[#c59b27]/30 text-[#fce082] text-xs font-semibold">
                  <Star className="w-3 h-3 fill-[#c59b27] text-[#c59b27]" />
                  <span>{barber.rating}</span>
                </div>
              </div>

              <div className="text-[11px] uppercase tracking-wider text-[#c59b27] font-semibold mb-1">
                {barber.role}
              </div>
              <h4 className="font-serif text-base font-bold text-[#f8f5ee] mb-1">
                {barber.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mb-3">
                <Award className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>{barber.experience}</span>
              </div>
              {barber.bio && (
                <p className="text-xs text-[#8b949e] line-clamp-2">
                  {barber.bio}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#21262d] flex items-center justify-end gap-1 mt-3">
              <button
                onClick={() => handleOpenEdit(barber)}
                className="p-2 rounded-lg text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
                title="Редактировать"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(barber.id)}
                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
                {editForm.id && barbers.some(b => b.id === editForm.id) ? 'Редактирование профиля мастера' : 'Новый мастер'}
              </h4>
              <button onClick={() => setIsEditing(false)} className="text-[#8b949e] hover:text-[#f8f5ee]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Имя и фамилия *</label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  placeholder="Например: Артем Смирнов"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Должность / Роль</label>
                  <input
                    type="text"
                    value={editForm.role || ''}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                    placeholder="Топ-барбер, Шеф"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Рейтинг (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={editForm.rating || 4.9}
                    onChange={e => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                    className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Опыт работы</label>
                <input
                  type="text"
                  value={editForm.experience || ''}
                  onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  placeholder="5 лет в барберинге"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">URL фотографии / аватара</label>
                <input
                  type="url"
                  value={editForm.avatar_url || ''}
                  onChange={e => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Биография / Навыки</label>
                <textarea
                  rows={2}
                  value={editForm.bio || ''}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
                  placeholder="Специализация, техники, победы в баттлах..."
                />
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
