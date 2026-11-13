import React from 'react';
import { Booking, UserProfile } from '../../types';
import { cancelBooking } from '../../lib/supabase';
import { User, Gift, Scissors, Calendar, Clock, RotateCcw, Ban, CheckCircle2, Star, Sparkles } from 'lucide-react';

interface ClientCabinetProps {
  currentUser: UserProfile;
  bookings: Booking[];
  onRefresh: () => void;
  onBookAgain: (serviceName: string, barberName: string) => void;
}

export const ClientCabinet: React.FC<ClientCabinetProps> = ({
  currentUser,
  bookings,
  onRefresh,
  onBookAgain,
}) => {
  // Filter bookings for this client
  const myBookings = bookings.filter(b => 
    b.client_phone === currentUser.phone ||
    b.client_name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
  );

  const activeBookings = myBookings.filter(b => b.status === 'confirmed');
  const pastBookings = myBookings.filter(b => b.status !== 'confirmed');

  const handleCancel = async (id: string) => {
    if (confirm('Вы уверены, что хотите отменить эту запись?')) {
      await cancelBooking(id, currentUser);
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Loyalty & Profile Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161b22] to-[#0e1117] border border-[#c59b27]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#c59b27]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
                {currentUser.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#fce082] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#e4ba43]" />
                VIP Клиент
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">{currentUser.phone}</p>
            <p className="text-[11px] text-[#c59b27] mt-0.5">Личный кабинет клиента</p>
          </div>
        </div>

        {/* Loyalty Balance */}
        <div className="p-4 rounded-xl bg-[#0e1117] border border-[#21262d] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#c59b27] flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#8b949e] uppercase block">Бонусный баланс</span>
            <div className="text-lg font-bold text-[#f8f5ee]">
              {currentUser.bonus_points || 650} <span className="text-xs text-[#c59b27]">баллов</span>
            </div>
            <span className="text-[10px] text-emerald-400">1 балл = 1 рубль скидки</span>
          </div>
        </div>
      </div>

      {/* Active Bookings */}
      <div className="space-y-3">
        <h4 className="font-serif text-base font-bold text-[#f8f5ee] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#c59b27]" />
          <span>Предстоящие записи ({activeBookings.length})</span>
        </h4>

        {activeBookings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8b949e] border border-dashed border-[#21262d] rounded-2xl bg-[#0e1117]">
            У вас пока нет активных записей. Запишитесь на удобное время!
          </div>
        ) : (
          activeBookings.map(b => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#f8f5ee]">{b.service_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 uppercase font-semibold">
                    Подтверждено
                  </span>
                </div>
                <div className="text-xs text-[#8b949e] mt-1">
                  Мастер: <strong className="text-[#f8f5ee]">{b.barber_name}</strong> • Сумма: <strong className="text-[#c59b27]">{b.price} ₽</strong>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#21262d]">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-[#f8f5ee]">{b.booking_date}</div>
                  <div className="text-xs text-[#c59b27] font-bold">{b.booking_time}</div>
                </div>

                <button
                  onClick={() => handleCancel(b.id)}
                  className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Отменить</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Visit History */}
      <div className="space-y-3">
        <h4 className="font-serif text-base font-bold text-[#f8f5ee] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#c59b27]" />
          <span>История визитов</span>
        </h4>

        {pastBookings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8b949e] border border-dashed border-[#21262d] rounded-2xl bg-[#0e1117]">
            История посещений пока пуста
          </div>
        ) : (
          pastBookings.map(b => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-[#0e1117] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-semibold text-[#f8f5ee]">{b.service_name}</div>
                <div className="text-[#8b949e]">Мастер: {b.barber_name} • {b.booking_date}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#c59b27]">{b.price} ₽</span>
                <button
                  onClick={() => onBookAgain(b.service_name, b.barber_name)}
                  className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#f8f5ee] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Повторить стрижку</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
