import React from 'react';
import { Booking, Service, Barber } from '../../types';
import { TrendingUp, Users, Calendar, CheckCircle2, Clock, Scissors, Award, AlertCircle } from 'lucide-react';

interface AdminOverviewProps {
  bookings: Booking[];
  services: Service[];
  barbers: Barber[];
  onNavigateToBookings: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  bookings,
  services,
  barbers,
  onNavigateToBookings,
}) => {
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const totalRevenue = completed.reduce((sum, b) => sum + (b.price || 0), 0);
  const potentialRevenue = confirmed.reduce((sum, b) => sum + (b.price || 0), 0);
  const avgCheck = completed.length > 0
    ? Math.round(totalRevenue / completed.length)
    : (confirmed.length > 0 ? Math.round(potentialRevenue / confirmed.length) : 2500);

  // Group by barber
  const barberStats = barbers.map(barber => {
    const barberBookings = bookings.filter(b => b.barber_name === barber.name || b.barber_id === barber.id);
    const rev = barberBookings.filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((s, b) => s + b.price, 0);
    return {
      barber,
      count: barberBookings.length,
      revenue: rev,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8b949e] uppercase tracking-wider mb-2">
            <span>Выполнено / Выручка</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#f8f5ee] mb-1">
            {totalRevenue.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-[#8b949e]">
            {completed.length} завершенных визитов
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8b949e] uppercase tracking-wider mb-2">
            <span>В очереди / Ожидание</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#c59b27] mb-1">
            {potentialRevenue.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-[#8b949e]">
            {confirmed.length} подтвержденных записей
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8b949e] uppercase tracking-wider mb-2">
            <span>Средний чек</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#f8f5ee] mb-1">
            {avgCheck.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-[#8b949e]">
            С учетом комплекса услуг
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1117] border border-[#21262d] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8b949e] uppercase tracking-wider mb-2">
            <span>Всего заявок</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#f8f5ee] mb-1">
            {bookings.length}
          </div>
          <div className="text-xs text-[#8b949e]">
            {cancelled.length > 0 ? `${cancelled.length} отмен` : 'Без отмен'}
          </div>
        </div>

      </div>

      {/* Main Grid: Barbers workload & Urgent Next Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Urgent Bookings */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0e1117] border border-[#21262d] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif text-lg font-bold text-[#f8f5ee]">
                Ближайшие записи клиентов
              </h4>
              <p className="text-xs text-[#8b949e]">Требуют приема мастера или подтверждения</p>
            </div>
            <button
              onClick={onNavigateToBookings}
              className="text-xs text-[#c59b27] hover:underline font-semibold"
            >
              Смотреть все ({bookings.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {confirmed.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-[#161b22] border border-[#21262d] flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm text-[#f8f5ee]">{b.client_name}</div>
                  <div className="text-[#8b949e]">
                    {b.service_name} • <span className="text-[#c59b27] font-medium">{b.price} ₽</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-[#f8f5ee]">{b.booking_date}</div>
                  <div className="text-[#c59b27] font-bold">{b.booking_time}</div>
                </div>
              </div>
            ))}

            {confirmed.length === 0 && (
              <div className="text-center py-8 text-xs text-[#8b949e]">
                Активных записей на ближайшее время нет
              </div>
            )}
          </div>
        </div>

        {/* Master stats */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0e1117] border border-[#21262d] space-y-4">
          <h4 className="font-serif text-lg font-bold text-[#f8f5ee]">
            Загрузка и рейтинг мастеров
          </h4>
          
          <div className="space-y-3">
            {barberStats.map(({ barber, count, revenue }) => (
              <div key={barber.id} className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={barber.avatar_url}
                    alt={barber.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#f8f5ee]">{barber.name}</div>
                    <div className="text-[11px] text-[#8b949e]">{barber.role} • ★ {barber.rating}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#c59b27]">{revenue.toLocaleString('ru-RU')} ₽</div>
                  <div className="text-[10px] text-[#8b949e]">{count} записей</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
