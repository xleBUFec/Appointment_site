import React, { useState } from 'react';
import { Service } from '../types';
import { Clock, Check, Scissors, Sparkles } from 'lucide-react';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  onNext: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onSelect,
  onNext,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Все услуги' },
    { id: 'hair', label: 'Стрижки' },
    { id: 'beard', label: 'Борода и усы' },
    { id: 'combo', label: 'Комплексы' },
    { id: 'spa', label: 'СПА и уход' },
  ];

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-6">
      
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-[#c59b27] text-black font-semibold shadow-lg shadow-[#c59b27]/20'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#1f2633] border border-[#21262d]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map(service => {
          const isSelected = selectedService?.id === service.id;
          return (
            <div
              key={service.id}
              onClick={() => onSelect(service)}
              className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#161b22] border-[#c59b27] shadow-xl shadow-[#c59b27]/10 ring-1 ring-[#c59b27]'
                  : 'bg-[#161b22]/70 border-[#21262d] hover:border-[#38414e] hover:bg-[#161b22]'
              }`}
            >
              {service.popular && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/50 text-[#fce082] text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-[#e4ba43]" />
                  Хит
                </div>
              )}

              <div>
                <div className="flex items-start justify-between pr-14 mb-2">
                  <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
                    {service.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#8b949e] mb-4 line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#21262d] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[#f8f5ee]">
                    {service.price.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#8b949e]">
                    <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                    {service.duration_min} мин
                  </span>
                </div>

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

      {/* Continue Action */}
      <div className="flex justify-end pt-4">
        <button
          disabled={!selectedService}
          onClick={onNext}
          className={`gold-button text-black font-bold text-sm px-7 py-3 rounded-xl transition-all flex items-center gap-2 ${
            !selectedService ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:scale-[1.02]'
          }`}
        >
          <span>Далее: Выбрать мастера</span>
        </button>
      </div>

    </div>
  );
};
