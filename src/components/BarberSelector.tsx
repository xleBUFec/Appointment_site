import React from 'react';
import { Barber } from '../types';
import { Star, Award, Check, UserCheck } from 'lucide-react';

interface BarberSelectorProps {
  barbers: Barber[];
  selectedBarber: Barber | null;
  onSelect: (barber: Barber | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BarberSelector: React.FC<BarberSelectorProps> = ({
  barbers,
  selectedBarber,
  onSelect,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Any Master Option */}
      <div
        onClick={() => onSelect(null)}
        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
          selectedBarber === null
            ? 'bg-[#161b22] border-[#c59b27] ring-1 ring-[#c59b27]'
            : 'bg-[#161b22]/70 border-[#21262d] hover:border-[#38414e]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#21262d] flex items-center justify-center text-[#c59b27]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-[#f8f5ee]">Любой свободный мастер</h4>
            <p className="text-xs text-[#8b949e]">Система назначит лучшего мастера на выбранное время</p>
          </div>
        </div>

        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
            selectedBarber === null
              ? 'bg-[#c59b27] border-[#c59b27] text-black'
              : 'border-[#30363d] text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-[#21262d]"></div>
        <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-[#8b949e]">
          Или выберите конкретного мастера
        </span>
        <div className="flex-grow border-t border-[#21262d]"></div>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {barbers.map(barber => {
          const isSelected = selectedBarber?.id === barber.id;
          return (
            <div
              key={barber.id}
              onClick={() => onSelect(barber)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#161b22] border-[#c59b27] ring-1 ring-[#c59b27] shadow-xl shadow-[#c59b27]/10'
                  : 'bg-[#161b22]/70 border-[#21262d] hover:border-[#38414e] hover:bg-[#161b22]'
              }`}
            >
              <div>
                <div className="relative mb-4 overflow-hidden rounded-xl aspect-square">
                  <img
                    src={barber.avatar_url}
                    alt={barber.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-[#c59b27]/30 text-[#fce082] text-xs font-semibold">
                    <Star className="w-3 h-3 fill-[#c59b27] text-[#c59b27]" />
                    <span>{barber.rating}</span>
                  </div>
                </div>

                <div className="text-xs uppercase tracking-wider text-[#c59b27] font-semibold mb-1">
                  {barber.role}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#f8f5ee] mb-1">
                  {barber.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mb-3">
                  <Award className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>{barber.experience}</span>
                </div>
                {barber.bio && (
                  <p className="text-xs text-[#8b949e] line-clamp-2">
                    {barber.bio}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-[#21262d] flex items-center justify-between">
                <span className="text-xs font-medium text-[#c0c7d0]">
                  {isSelected ? 'Мастер выбран' : 'Выбрать этого мастера'}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-[#c59b27] border-[#c59b27] text-black'
                      : 'border-[#30363d] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-[#21262d] text-sm text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#161b22] transition-colors"
        >
          Назад к услугам
        </button>

        <button
          onClick={onNext}
          className="gold-button text-black font-bold text-sm px-7 py-3 rounded-xl transition-all hover:scale-[1.02]"
        >
          Далее: Дата и время
        </button>
      </div>

    </div>
  );
};
