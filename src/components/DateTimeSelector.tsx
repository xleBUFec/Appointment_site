import React from 'react';
import { Calendar, Clock, Sun, Sunset, Moon } from 'lucide-react';

interface DateTimeSelectorProps {
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
}) => {
  // Generate next 14 days
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const day = d.getDate();
    const month = d.toLocaleDateString('ru-RU', { month: 'short' });
    const isToday = i === 0;
    const isTomorrow = i === 1;

    let label = `${day} ${month}`;
    if (isToday) label = 'Сегодня';
    else if (isTomorrow) label = 'Завтра';

    return {
      iso,
      weekday: weekday.toUpperCase(),
      day,
      month,
      label,
    };
  });

  const timeSlots = {
    morning: {
      title: 'Утро',
      icon: Sun,
      slots: ['10:00', '10:30', '11:00', '11:30'],
    },
    afternoon: {
      title: 'День',
      icon: Sunset,
      slots: ['12:00', '12:30', '13:30', '14:00', '14:30', '15:30', '16:00', '16:30'],
    },
    evening: {
      title: 'Вечер',
      icon: Moon,
      slots: ['17:00', '17:30', '18:30', '19:00', '19:30', '20:30', '21:00'],
    },
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Date Picker Horizontal Strip */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#f8f5ee]">
          <Calendar className="w-4 h-4 text-[#c59b27]" />
          <span>Выберите день визита</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {dates.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => onSelectDate(d.iso)}
                className={`flex-shrink-0 w-24 py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c59b27] border-[#c59b27] text-black shadow-lg shadow-[#c59b27]/25 font-bold scale-[1.03]'
                    : 'bg-[#161b22] border-[#21262d] text-[#8b949e] hover:border-[#38414e] hover:text-[#f8f5ee]'
                }`}
              >
                <div className={`text-[10px] tracking-wider font-semibold ${isSelected ? 'text-black/80' : 'text-[#8b949e]'}`}>
                  {d.weekday}
                </div>
                <div className={`text-xl font-bold my-0.5 ${isSelected ? 'text-black' : 'text-[#f8f5ee]'}`}>
                  {d.day}
                </div>
                <div className={`text-[11px] truncate ${isSelected ? 'text-black/90 font-medium' : 'text-[#8b949e]'}`}>
                  {d.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time Slots Picker */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-[#f8f5ee]">
          <Clock className="w-4 h-4 text-[#c59b27]" />
          <span>Выберите время записи</span>
        </div>

        <div className="space-y-4">
          {Object.entries(timeSlots).map(([key, group]) => {
            const Icon = group.icon;
            return (
              <div key={key} className="p-4 rounded-2xl bg-[#161b22]/50 border border-[#21262d]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
                  <Icon className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>{group.title}</span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {group.slots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => onSelectTime(slot)}
                        className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#c59b27] text-black shadow-md shadow-[#c59b27]/30 scale-[1.03]'
                            : 'bg-[#0e1117] text-[#c0c7d0] hover:text-[#f8f5ee] hover:bg-[#21262d] border border-[#21262d]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-[#21262d] text-sm text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#161b22] transition-colors"
        >
          Назад к выбору мастера
        </button>

        <button
          disabled={!selectedDate || !selectedTime}
          onClick={onNext}
          className={`gold-button text-black font-bold text-sm px-7 py-3 rounded-xl transition-all flex items-center gap-2 ${
            !selectedDate || !selectedTime ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:scale-[1.02]'
          }`}
        >
          <span>Далее: Контакты и подтверждение</span>
        </button>
      </div>

    </div>
  );
};
