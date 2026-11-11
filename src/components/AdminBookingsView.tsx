import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { fetchAllBookings, cancelBooking } from '../lib/supabase';
import { Calendar, Clock, Scissors, User, Phone, Search, X, RefreshCw, AlertCircle, CheckCircle, Ban } from 'lucide-react';

interface AdminBookingsViewProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
}

export const AdminBookingsView: React.FC<AdminBookingsViewProps> = ({
  isOpen,
  onClose,
  isSupabaseConnected,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    const { data } = await fetchAllBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = async (id: string) => {
    if (confirm('Вы уверены, что хотите отменить эту запись?')) {
      const ok = await cancelBooking(id);
      if (ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      }
    }
  };

  const filtered = bookings.filter(b => 
    b.client_name.toLowerCase().includes(search.toLowerCase()) ||
    b.client_phone.includes(search) ||
    b.service_name.toLowerCase().includes(search.toLowerCase()) ||
    b.barber_name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#c59b27] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#f8f5ee]">
                Журнал записей
              </h3>
              <p className="text-xs text-[#8b949e]">
                {isSupabaseConnected ? 'Данные синхронизированы с Supabase' : 'Локальные записи браузера'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadBookings}
              disabled={loading}
              className="p-2 rounded-xl border border-[#21262d] text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
              title="Обновить список"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-[#8b949e] hover:text-[#f8f5ee] p-2 rounded-xl hover:bg-[#21262d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-[#0e1117] border border-[#21262d]">
            <span className="text-[11px] text-[#8b949e] uppercase tracking-wider block">Активных записей</span>
            <span className="text-xl font-bold text-[#f8f5ee]">{activeCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0e1117] border border-[#21262d]">
            <span className="text-[11px] text-[#8b949e] uppercase tracking-wider block">Ожидаемая выручка</span>
            <span className="text-xl font-bold text-[#c59b27]">{totalRevenue.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[#0e1117] border border-[#21262d]">
            <span className="text-[11px] text-[#8b949e] uppercase tracking-wider block">Источник данных</span>
            <span className="text-sm font-semibold text-emerald-400">
              {isSupabaseConnected ? 'База данных Supabase' : 'Локальное хранилище'}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, номеру телефона, услуге или мастеру..."
            className="w-full bg-[#0e1117] border border-[#21262d] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        {/* Bookings List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-[#8b949e] text-sm">
              Загрузка данных...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#8b949e] text-sm border border-dashed border-[#21262d] rounded-2xl">
              {bookings.length === 0 ? 'Записей пока нет. Оформите первую запись!' : 'Ничего не найдено по вашему запросу'}
            </div>
          ) : (
            filtered.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#38414e] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-[#f8f5ee]">
                      {b.client_name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950/50 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {b.status === 'confirmed' ? 'Подтверждено' : 'Отменено'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                    <span className="flex items-center gap-1 text-[#c0c7d0]">
                      <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                      {b.client_phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-[#c59b27]" />
                      {b.service_name} ({b.price} ₽)
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#c59b27]" />
                      {b.barber_name}
                    </span>
                  </div>

                  {b.comment && (
                    <div className="text-xs text-[#8b949e] italic bg-[#161b22] px-2.5 py-1 rounded-lg border border-[#21262d] inline-block">
                      «{b.comment}»
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#21262d]">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-semibold text-[#f8f5ee] flex items-center sm:justify-end gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{b.booking_date}</span>
                    </div>
                    <div className="text-xs text-[#c59b27] font-medium flex items-center sm:justify-end gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{b.booking_time}</span>
                    </div>
                  </div>

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/30 transition-colors flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Отменить</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
