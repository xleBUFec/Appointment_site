import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types';
import { exportDatabaseBackup, restoreDatabaseBackup } from '../../lib/supabase';
import { Database, Download, Upload, RefreshCw, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface AdminBackupsTabProps {
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const AdminBackupsTab: React.FC<AdminBackupsTabProps> = ({
  currentUser,
  onRefresh,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    try {
      const dump = await exportDatabaseBackup();
      const blob = new Blob([dump], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blade_co_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage({ type: 'success', text: 'Резервная копия успешно экспортирована и скачана!' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Ошибка при экспорте' });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await restoreDatabaseBackup(text, currentUser);
        if (res.success) {
          setStatusMessage({ type: 'success', text: res.message });
          await onRefresh();
        } else {
          setStatusMessage({ type: 'error', text: res.message });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Не удалось прочитать файл резервной копии.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetToDemo = () => {
    if (confirm('Сбросить данные к заводским демонстрационным настройкам? Текущие записи будут удалены.')) {
      localStorage.removeItem('barber_local_bookings');
      localStorage.removeItem('barber_local_services');
      localStorage.removeItem('barber_local_barbers');
      localStorage.removeItem('barber_local_settings');
      localStorage.removeItem('barber_local_audit_logs');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
          Резервное копирование и управление данными
        </h3>
        <p className="text-xs text-[#8b949e]">
          Защита данных от сбоев, перенос между устройствами и восстановление в 1 клик
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-xs sm:text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid of backup options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Export Card */}
        <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#c59b27] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#f8f5ee]">Экспорт резервной копии</h4>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Выгрузить полный снимок базы данных (услуги, мастера, записи клиентов, настройки маркетинга и логи) в файл JSON.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="gold-button w-full py-2.5 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Скачать JSON бэкап</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#f8f5ee]">Восстановление из файла</h4>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Загрузите ранее сохраненный JSON-файл для мгновенного восстановления всех цен, услуг и бронирований.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-[#f8f5ee] border border-[#30363d] flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Выбрать файл бэкапа</span>
            </button>
          </div>
        </div>

      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Опасная зона</span>
        </div>
        <p className="text-xs text-[#8b949e]">
          Если вам нужно очистить тестовые записи и вернуть исходный демонстрационный контент:
        </p>
        <button
          onClick={handleResetToDemo}
          className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors"
        >
          Сбросить все данные к исходным демо-настройкам
        </button>
      </div>

    </div>
  );
};
