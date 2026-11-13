import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, X, ExternalLink, Copy, Check, Terminal, Key, Globe, Shield } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getSavedSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    onConfigUpdated();
    onClose();
  };

  const handleResetDemo = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setTestResult({ success: true, message: 'Переключено в Демо-режим (локальные данные)' });
    onConfigUpdated();
  };

  const sqlCode = `-- Выполните в Supabase SQL Editor:
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
    status TEXT DEFAULT 'confirmed',
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

ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public all barbers" ON public.barbers;
DROP POLICY IF EXISTS "Public all services" ON public.services;
DROP POLICY IF EXISTS "Public all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public all site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public all audit_logs" ON public.audit_logs;

CREATE POLICY "Public all barbers" ON public.barbers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);`;

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
                Подключение к Supabase
              </h3>
              <p className="text-xs text-[#8b949e]">
                Настройте базу данных для сохранения записей клиентов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f8f5ee] p-1.5 rounded-lg hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-[#c59b27] text-black shadow-md'
                : 'bg-[#0e1117] text-[#8b949e] border border-[#21262d] hover:text-[#f8f5ee]'
            }`}
          >
            Настройки API ключей
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-[#c59b27] text-black shadow-md'
                : 'bg-[#0e1117] text-[#8b949e] border border-[#21262d] hover:text-[#f8f5ee]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>SQL-скрипт таблиц</span>
          </button>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5">
          {activeTab === 'config' ? (
            <>
              {/* Info banner */}
              <div className="p-4 rounded-2xl bg-[#0e1117] border border-[#21262d] text-xs text-[#8b949e] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#f8f5ee]">
                  <Shield className="w-4 h-4 text-[#c59b27]" />
                  <span>Где найти ключи в Supabase:</span>
                </div>
                <p>
                  1. Войдите в <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#c59b27] underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> и откройте проект.<br/>
                  2. Перейдите в <strong>Project Settings → API</strong>.<br/>
                  3. Скопируйте <strong>Project URL</strong> и публичный ключ <strong>anon / public key</strong>.
                </p>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Anon Key Input */}
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                  Supabase Anon (Public) Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Test result status */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">
                  Выполните этот скрипт в <strong>SQL Editor</strong> вашего проекта Supabase:
                </span>
                <button
                  onClick={copySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] text-xs font-semibold text-[#f8f5ee] hover:bg-[#30363d] transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0e1117] border border-[#21262d] text-[11px] font-mono text-[#8b949e] overflow-x-auto max-h-72">
                <code>{sqlCode}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-5 border-t border-[#21262d] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDemo}
            className="text-xs text-[#8b949e] hover:text-[#f8f5ee] underline cursor-pointer"
          >
            Сбросить на Демо-режим
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting || !url || !anonKey}
              onClick={handleTest}
              className="px-4 py-2.5 rounded-xl border border-[#21262d] text-xs font-semibold text-[#f8f5ee] hover:bg-[#21262d] disabled:opacity-40 transition-colors"
            >
              {isTesting ? 'Проверка...' : 'Проверить соединение'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold text-black"
            >
              Сохранить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
