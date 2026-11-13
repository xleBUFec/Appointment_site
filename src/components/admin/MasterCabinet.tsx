import React, { useState } from 'react';
import { Booking, Barber, UserProfile } from '../../types';
import { updateBookingStatus } from '../../lib/supabase';
import { Calendar, Clock, Scissors, User, Phone, CheckCircle2, Ban, TrendingUp, DollarSign, Star, Award } from 'lucide-react';

interface MasterCabinetProps {
  currentUser: UserProfile;
  barbers: Barber[];
  bookings: Booking[];
  onRefresh: () => void;
  onRepeatBooking?: (serviceName: string, barberName: string) => void;
}

export const MasterCabinet: React.FC<MasterCabinetProps> = ({
  currentUser,
  barbers,
  bookings,
  onRefresh,
}) => {
  const currentBarber = barbers.find(b => b.id === currentUser.barber_id || b.name === currentUser.name) || barbers[0];
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter only bookings for this master
  const myBookings = bookings.filter(b => 
    b.barber_id === currentBarber?.id ||
    b.barber_name === currentBarber?.name ||
    b.barber_id === 'any' // unassigned bookings
  );

  const completed = myBookings.filter(b => b.status === 'completed');
  const confirmed = myBookings.filter(b => b.status === 'confirmed');

  // Master commission (e.g. 40% payout)
  const masterCommissionRate = 0.45;
  const totalTurnover = completed.reduce((sum, b) => sum + (b.price || 0), 0);
  const masterEarnings = Math.round(totalTurnover * masterCommissionRate);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    setLoadingId(id);
    await updateBookingStatus(id, status, currentUser);
    await onRefresh();
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Master Profile Header */}
      <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentBarber?.avatar_url || currentUser.avatar_url}
            alt={currentBarber?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#c59b27]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
                {currentBarber?.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#fce082] font-semibold">
                ★ {currentBarber?.rating || 4.98}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">{currentBarber?.role} • {currentBarber?.experience}</p>
            <p className="text-[11px] text-[#c59b27] mt-0.5">Личный кабинет мастера</p>
          </div>
        </div>

        {/* Master stats pills */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] text-center">
            <span className="text-[10px] text-[#8b949e] uppercase block">Заработок мастера (45%)</span>
            <span className="text-base font-bold text-emerald-400">{masterEarnings.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] text-center">
            <span className="text-[10px] text-[#8b949e] uppercase block">Обслужено клиентов</span>
            <span className="text-base font-bold text-[#f8f5ee]">{completed.length}</span>
          </div>
        </div>
      </div>

      {/* Bookings Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-serif text-base font-bold text-[#f8f5ee] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#c59b27]" />
            <span>Мои клиенты и расписание ({confirmed.length} активных)</span>
          </h4>
        </div>

        <div className="space-y-3">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#8b949e] border border-dashed border-[#21262d] rounded-2xl">
              На выбранный период записей нет
            </div>
          ) : (
            myBookings.map(b => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#f8f5ee]">{b.client_name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        b.status === 'confirmed'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                          : b.status === 'completed'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950/40 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {b.status === 'confirmed' ? 'Ожидается' : b.status === 'completed' ? 'Завершено' : 'Отменено'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                    <span className="flex items-center gap-1 text-[#f8f5ee]">
                      <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                      <a href={`tel:${b.client_phone}`} className="hover:underline">{b.client_phone}</a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-[#c59b27]" />
                      {b.service_name} ({b.price} ₽)
                    </span>
                  </div>

                  {b.comment && (
                    <div className="text-xs text-[#8b949e] italic bg-[#161b22] px-2.5 py-1 rounded-lg border border-[#21262d] inline-block">
                      «{b.comment}»
                    </div>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#21262d]">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-semibold text-[#f8f5ee] flex items-center md:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{b.booking_date}</span>
                    </div>
                    <div className="text-xs text-[#c59b27] font-bold">
                      {b.booking_time}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {b.status === 'confirmed' && (
                      <>
                        <button
                          disabled={loadingId === b.id}
                          onClick={() => handleStatusChange(b.id, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Клиент пришел</span>
                        </button>
                        <button
                          disabled={loadingId === b.id}
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Не явился</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
