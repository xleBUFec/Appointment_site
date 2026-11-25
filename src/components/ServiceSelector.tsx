import React, { useState, useMemo } from 'react';
import { Service } from '../types';
import { Clock, Check, Scissors, Sparkles, Search, X, Flame } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Все услуги' },
    { id: 'hair', label: 'Стрижки' },
    { id: 'beard', label: 'Борода и усы' },
    { id: 'combo', label: 'Комплексы' },
    { id: 'spa', label: 'СПА и уход' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchCategory = activeCategory === 'all' || service.category === activeCategory;
      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchSearch = !cleanQuery || 
        service.title.toLowerCase().includes(cleanQuery) || 
        (service.description && service.description.toLowerCase().includes(cleanQuery));
      return matchCategory && matchSearch;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#c59b27] text-black font-semibold shadow-lg shadow-[#c59b27]/20 scale-[1.02]'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#1f2633] border border-[#21262d]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по услугам..."
            className="w-full bg-[#161b22] border border-[#21262d] focus:border-[#c59b27] rounded-xl pl-9 pr-8 py-2 text-xs text-[#f8f5ee] placeholder-[#8b949e] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f8f5ee]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center bg-[#161b22]/30 rounded-2xl border border-[#21262d] p-6 max-w-md mx-auto">
          <Scissors className="w-10 h-10 text-[#8b949e] mx-auto mb-3 opacity-40" />
          <h4 className="text-sm font-bold text-[#f8f5ee] mb-1">Услуги не найдены</h4>
          <p className="text-xs text-[#8b949e] mb-4">
            По запросу "{searchQuery}" ничего не найдено. Попробуйте изменить параметры поиска.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#21262d] text-xs font-semibold text-[#f8f5ee] hover:bg-[#2b313a] transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map(service => {
            const isSelected = selectedService?.id === service.id;
            return (
              <div
                key={service.id}
                onClick={() => onSelect(service)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#161b22] border-[#c59b27] shadow-xl shadow-[#c59b27]/10 ring-1 ring-[#c59b27]'
                    : 'bg-[#161b22]/70 border-[#21262d] hover:border-[#38414e] hover:bg-[#161b22]'
                }`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/50 text-[#fce082] text-[11px] font-semibold">
                    <Flame className="w-3 h-3 text-[#e4ba43]" />
                    Популярное
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between pr-24 mb-2">
                    <h3 className="font-serif text-lg font-bold text-[#f8f5ee] group-hover:text-[#c59b27] transition-colors">
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
                      {service.price.toLocaleString('ru-RU')} ₸
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8b949e]">
                      <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                      {service.duration_min} мин
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#c59b27] border-[#c59b27] text-black shadow-sm'
                        : 'border-[#30363d] text-transparent group-hover:border-[#8b949e]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nav Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
        <div className="text-xs text-[#8b949e]">
          {selectedService ? (
            <span>Выбрано: <strong className="text-[#f8f5ee]">{selectedService.title}</strong> ({selectedService.price.toLocaleString('ru-RU')} ₸)</span>
          ) : (
            <span>Выберите услугу для продолжения</span>
          )}
        </div>

        <button
          disabled={!selectedService}
          onClick={onNext}
          className={`gold-button text-black font-bold text-sm px-7 py-3 rounded-xl transition-all flex items-center gap-2 ${
            !selectedService ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:scale-[1.02]'
          }`}
        >
          <span>Далее: Выбор мастера</span>
        </button>
      </div>

    </div>
  );
};
