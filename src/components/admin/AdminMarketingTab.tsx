import React, { useState } from 'react';
import { SiteSettings, UserProfile } from '../../types';
import { saveSiteSettings } from '../../lib/supabase';
import { Megaphone, Search, Save, CheckCircle2, Globe, Sparkles, MapPin, Phone, Clock, Send } from 'lucide-react';

interface AdminMarketingTabProps {
  settings: SiteSettings;
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const AdminMarketingTab: React.FC<AdminMarketingTabProps> = ({
  settings,
  currentUser,
  onRefresh,
}) => {
  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettings(form, currentUser);
    await onRefresh();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Top action */}
      <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
            Маркетинг, контент и SEO-параметры
          </h3>
          <p className="text-xs text-[#8b949e]">
            Управляйте баннерами акций, текстами на главной и индексацией без привлечения разработчиков
          </p>
        </div>

        <button
          type="submit"
          className="gold-button flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black shadow-lg hover:scale-105 transition-transform"
        >
          <Save className="w-4 h-4" />
          <span>Сохранить изменения</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Изменения сохранены и сразу применились на сайте!</span>
        </div>
      )}

      {/* 1. Promo & Banner */}
      <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#c59b27] uppercase tracking-wider">
          <Megaphone className="w-4 h-4" />
          <span>Промо-акция и верхний баннер</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="bannerActive"
            checked={form.announcement_active}
            onChange={e => setForm({ ...form, announcement_active: e.target.checked })}
            className="w-4 h-4 rounded text-[#c59b27] bg-[#161b22] border-[#21262d]"
          />
          <label htmlFor="bannerActive" className="text-xs font-semibold text-[#f8f5ee] cursor-pointer">
            Показывать верхний промо-баннер на сайте
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Текст баннера</label>
          <input
            type="text"
            value={form.announcement_banner}
            onChange={e => setForm({ ...form, announcement_banner: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            placeholder="🔥 Скидка 20% на первый визит..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Промокод</label>
            <input
              type="text"
              value={form.promo_code}
              onChange={e => setForm({ ...form, promo_code: e.target.value })}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Размер скидки (%)</label>
            <input
              type="number"
              value={form.promo_discount_percent}
              onChange={e => setForm({ ...form, promo_discount_percent: Number(e.target.value) })}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            />
          </div>
        </div>
      </div>

      {/* 2. Hero texts */}
      <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#c59b27] uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Главный экран (Hero блок)</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Верхний бейдж</label>
          <input
            type="text"
            value={form.hero_badge}
            onChange={e => setForm({ ...form, hero_badge: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Главный заголовок H1</label>
          <input
            type="text"
            value={form.hero_title}
            onChange={e => setForm({ ...form, hero_title: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Подзаголовок / Описание</label>
          <textarea
            rows={2}
            value={form.hero_subtitle}
            onChange={e => setForm({ ...form, hero_subtitle: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
          />
        </div>
      </div>

      {/* 3. Contacts & Location */}
      <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#c59b27] uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Контакты и локация</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Адрес барбершопа</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Телефон для связи</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">График работы</label>
            <input
              type="text"
              value={form.work_hours}
              onChange={e => setForm({ ...form, work_hours: e.target.value })}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Telegram аккаунт</label>
            <input
              type="text"
              value={form.telegram}
              onChange={e => setForm({ ...form, telegram: e.target.value })}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            />
          </div>
        </div>
      </div>

      {/* 4. SEO & Meta */}
      <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#c59b27] uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Поисковая оптимизация (SEO & Мета-теги)</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">SEO Title (Заголовок вкладки)</label>
          <input
            type="text"
            value={form.seo_title}
            onChange={e => setForm({ ...form, seo_title: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Meta Description (Сниппет в Яндексе / Google)</label>
          <textarea
            rows={2}
            value={form.seo_description}
            onChange={e => setForm({ ...form, seo_description: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Ключевые слова (Keywords)</label>
          <input
            type="text"
            value={form.seo_keywords}
            onChange={e => setForm({ ...form, seo_keywords: e.target.value })}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3.5 py-2 text-xs text-[#f8f5ee] focus:outline-none focus:border-[#c59b27]"
            placeholder="барбершоп, стрижка, борода..."
          />
        </div>
      </div>

    </form>
  );
};
