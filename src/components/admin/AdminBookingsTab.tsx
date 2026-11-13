import React, { useState } from 'react';
import { Booking, UserProfile } from '../../types';
import { updateBookingStatus } from '../../lib/supabase';
import { Search, Download, CheckCircle2, Clock, Ban, Calendar, User, Phone, Check, RefreshCw, Scissors } from 'lucide-react';

interface AdminBookingsTabProps {
  bookings: Booking[];
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const AdminBookingsTab: React.FC<AdminBookingsTabProps> = ({
  bookings,
  currentUser,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    setLoadingId(id);
    await updateBookingStatus(id, status, currentUser);
    await onRefresh();
    setLoadingId(null);
  };

  const filtered = bookings.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.client_name.toLowerCase().includes(search.toLowerCase()) ||
      b.client_phone.includes(search) ||
      b.service_name.toLowerCase().includes(search.toLowerCase()) ||
      b.barber_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['ID', 'Клиент', 'Телефон', 'Email', 'Услуга', 'Мастер', 'Цена', 'Дата', 'Время', 'Статус', 'Комментарий'];
    const rows = filtered.map(b => [
      b.id,
      `"${b.client_name.replace(/"/g, '""')}"`,
      `"${b.client_phone}"`,
      `"${b.client_email || ''}"`,
      `"${b.service_name}"`,
      `"${b.barber_name}"`,
      b.price,
      b.booking_date,
      b.booking_time,
      b.status,
      `"${(b.comment || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Filters and search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Все записи' },
            { id: 'confirmed', label: 'Подтверждены' },
            { id: 'completed', label: 'Выполнены' },
            { id: 'cancelled', label: 'Отменены' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#c59b27] text-black shadow-md'
                  : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-[#f8f5ee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right actions: search & CSV download */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по клиенту, телефону..."
              className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27]"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-[#f8f5ee] transition-colors"
            title="Выгрузить в Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#c59b27]" />
            <span className="hidden sm:inline">Экспорт CSV</span>
          </button>
        </div>

      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#8b949e] border border-dashed border-[#21262d] rounded-2xl">
            Записей с выбранными параметрами не найдено
          </div>
        ) : (
          filtered.map(booking => {
            const isLoading = loadingId === booking.id;
            return (
              <div
                key={booking.id}
                className="p-4 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#38414e] transition-all"
              >
                {/* Left: Client and service details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#f8f5ee]">
                      {booking.client_name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        booking.status === 'confirmed'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                          : booking.status === 'completed'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950/40 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'Ожидает визита' : booking.status === 'completed' ? 'Выполнено' : 'Отменено'}
                    </span>
                    <span className="text-[11px] text-[#484f58] font-mono">
                      #{booking.id}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                    <span className="flex items-center gap-1 text-[#f8f5ee]">
                      <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                      {booking.client_phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-[#c59b27]" />
                      {booking.service_name} • <strong className="text-[#f8f5ee]">{booking.price} ₽</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#c59b27]" />
                      Мастер: {booking.barber_name}
                    </span>
                  </div>

                  {booking.comment && (
                    <div className="text-xs text-[#8b949e] italic bg-[#161b22] px-2.5 py-1 rounded-lg border border-[#21262d] inline-block">
                      «{booking.comment}»
                    </div>
                  )}
                </div>

                {/* Right: Date, Time & Status control buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#21262d]">
                  
                  <div className="text-left md:text-right">
                    <div className="text-xs font-semibold text-[#f8f5ee] flex items-center md:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{booking.booking_date}</span>
                    </div>
                    <div className="text-xs text-[#c59b27] font-bold">
                      {booking.booking_time}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {booking.status !== 'completed' && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                        className="p-2 rounded-xl bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-500/30 transition-all text-xs font-semibold flex items-center gap-1"
                        title="Отметить как выполненную"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Выполнено</span>
                      </button>
                    )}

                    {booking.status !== 'cancelled' && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-500/30 transition-all text-xs font-semibold flex items-center gap-1"
                        title="Отменить запись"
                      >
                        <Ban className="w-4 h-4" />
                        <span className="hidden sm:inline">Отменить</span>
                      </button>
                    )}

                    {booking.status === 'cancelled' && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="p-2 rounded-xl bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 border border-amber-500/30 transition-all text-xs font-semibold flex items-center gap-1"
                        title="Восстановить запись"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Восстановить</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
