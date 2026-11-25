import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, X, ExternalLink, Copy, Check, Terminal, Key, Globe, Shield, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { getSavedSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import { DEFAULT_ADMIN_EMAIL } from '../lib/mockData';
import { isCurrentAdminSessionValid } from '../lib/security';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
  currentUser: UserProfile;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
  currentUser,
}) => {
  const currentConfig = getSavedSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const isAdmin = 
    currentUser.role === 'admin' && 
    currentUser.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && 
    isCurrentAdminSessionValid();

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    try {
      saveSupabaseConfig(url, anonKey, currentUser);
      onConfigUpdated();
      onClose();
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Ошибка сохранения' });
    }
  };

  const handleResetDemo = () => {
    try {
      saveSupabaseConfig('', '', currentUser);
      setUrl('');
      setAnonKey('');
      setTestResult({ success: true, message: 'Переключено в Демо-режим (локальные данные)' });
      onConfigUpdated();
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Ошибка сброса' });
    }
  };

  const sqlCode = `-- ========================================================
-- BLADE & CO. BARBERSHOP DATABASE SCHEMA & SECURE RLS
-- Вставьте данный скрипт в Supabase SQL Editor
-- ========================================================

CREATE TABLE IF NOT EXISTS public.barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    experience TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.95,
    bio TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hair', 'beard', 'combo', 'spa')),
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    service_id TEXT,
    barber_id TEXT,
    service_name TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    payment_method TEXT DEFAULT 'kaspi',
    tips INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    hero_badge TEXT NOT NULL,
    announcement_banner TEXT,
    announcement_active BOOLEAN DEFAULT true,
    promo_code TEXT,
    promo_discount_percent INTEGER DEFAULT 20,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    work_hours TEXT NOT NULL,
    telegram TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT now(),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT
);

-- Автоматическое добавление колонок, если таблицы уже были созданы ранее:
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.95;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS barber_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'kaspi';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tips INTEGER DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS announcement_banner TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_discount_percent INTEGER DEFAULT 20;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Функция проверки прав администратора в базе данных (Защита от подделки JWT)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'email') = 'thunderwoltt@gmail.com',
    false
  );
END;
$$;

-- Функция проверки занятых слотов без раскрытия персональных данных клиентов
CREATE OR REPLACE FUNCTION public.get_occupied_slots(p_date DATE, p_barber_id TEXT DEFAULT NULL)
RETURNS TABLE (slot_time TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_barber_id IS NOT NULL AND p_barber_id != '' THEN
    RETURN QUERY 
      SELECT b.booking_time 
      FROM public.bookings b 
      WHERE b.booking_date = p_date 
        AND b.barber_id = p_barber_id 
        AND b.status = 'confirmed';
  ELSE
    RETURN QUERY 
      SELECT b.booking_time 
      FROM public.bookings b 
      WHERE b.booking_date = p_date 
        AND b.status = 'confirmed';
  END IF;
END;
$$;

-- Включение Row Level Security (RLS)
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Удаление старых политик
DROP POLICY IF EXISTS "Public all barbers" ON public.barbers;
DROP POLICY IF EXISTS "Public all services" ON public.services;
DROP POLICY IF EXISTS "Public all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public all site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public all audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public read barbers" ON public.barbers;
DROP POLICY IF EXISTS "Admin manage barbers" ON public.barbers;
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Admin manage services" ON public.services;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin manage audit_logs" ON public.audit_logs;

-- БЕЗОПАСНЫЕ ПОЛИТИКИ ДОСТУПА (Клиенты не могут менять прайс, удалять мастеров и читать логи):
-- 1. Мастера: чтение доступно всем, изменения только администраторам
CREATE POLICY "Public read barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Admin manage barbers" ON public.barbers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Услуги: чтение доступно всем, изменения только администраторам
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Настройки сайта & SEO: чтение доступно всем, изменения только администраторам
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Заявки (Бронирования): создание разрешено клиентам (INSERT). Просмотр всех заявок — только администратору
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage bookings" ON public.bookings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Журнал аудита: доступен только администраторам
CREATE POLICY "Admin manage audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#f8f5ee]">
                Подключение к Supabase API
              </h3>
              <p className="text-xs text-[#8b949e]">
                Настройки базы данных (Доступ ограничен администратором)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Denial for Non-Admins */}
        {!isAdmin ? (
          <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-lg font-bold text-[#f8f5ee] mb-2">
              Доступ запрещен
            </h4>
            <p className="text-xs text-[#8b949e] leading-relaxed mb-6">
              Ключи API, URL проекта и структура базы данных Supabase защищены. Просматривать и изменять эти параметры может только Главный Администратор.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#21262d] text-xs font-semibold text-[#f8f5ee] hover:bg-[#30363d] transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          /* Admin View */
          <>
            {/* Tabs */}
            <div className="flex gap-2 my-4 border-b border-[#21262d] pb-2">
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'config'
                    ? 'bg-[#c59b27] text-black shadow-md'
                    : 'text-[#8b949e] hover:text-[#f8f5ee]'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>API Ключи & Подключение</span>
              </button>
              <button
                onClick={() => setActiveTab('sql')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'sql'
                    ? 'bg-[#c59b27] text-black shadow-md'
                    : 'text-[#8b949e] hover:text-[#f8f5ee]'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Безопасная SQL-схема & RLS</span>
              </button>
            </div>

            {/* Tab 1: Config */}
            {activeTab === 'config' && (
              <div className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e] mb-1.5 flex items-center justify-between">
                    <span>Project URL</span>
                    <span className="text-[10px] text-[#484f58]">https://your-project.supabase.co</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8b949e] mb-1.5 flex items-center justify-between">
                    <span>Anon / Public Key</span>
                    <span className="text-[10px] text-[#484f58]">eyJh...</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Test results banner */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-950/40 border-red-500/30 text-red-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{testResult.success ? 'Успешно' : 'Ошибка соединения'}</p>
                      <p className="text-[11px] opacity-80 mt-0.5">{testResult.message}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTest}
                      disabled={isTesting || !url || !anonKey}
                      className="px-4 py-2 rounded-xl border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-[#f8f5ee] transition-all disabled:opacity-40"
                    >
                      {isTesting ? 'Проверка...' : 'Тест соединения'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDemo}
                      className="px-3 py-2 rounded-xl text-xs text-[#8b949e] hover:text-amber-400 transition-colors"
                    >
                      Сбросить в демо-режим
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="gold-button text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Сохранить настройки
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: SQL */}
            {activeTab === 'sql' && (
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">
                    Выполните этот SQL в Supabase Dashboard для создания таблиц с политиками безопасности RLS.
                  </span>
                  <button
                    onClick={copySql}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-[#f8f5ee] transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>Копировать SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-[#0e1117] border border-[#30363d] rounded-2xl p-4 text-[11px] font-mono text-[#8b949e] overflow-x-auto max-h-[45vh] leading-relaxed select-all">
                  <code>{sqlCode}</code>
                </pre>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
