import React from 'react';
import { MapPin, Navigation, Clock, Phone, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';

interface LocationSectionProps {
  settings?: SiteSettings | null;
  onStartBooking?: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings, onStartBooking }) => {
  const address = settings?.address || 'г. Москва, ул. Большая Дмитровка, д. 12';
  const phone = settings?.phone || '+7 (495) 123-45-67';
  const hours = settings?.work_hours || '10:00 — 22:00 ежедневно';
  const yandexMapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

  return (
    <section className="py-20 border-t border-[#21262d] bg-[#0e1117]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Info Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Локация в центре Москвы</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f8f5ee]">
              Как нас найти
            </h2>

            <p className="text-sm text-[#8b949e] leading-relaxed">
              Мы находимся в историческом центре Москвы. Удобный подъезд на автомобиле с возможностью парковки и всего 3 минуты неспешным шагом от метро.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">{address}</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">Метро: Театральная / Охотный ряд (выход №2)</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">Режим работы</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">{hours} • Без перерывов и выходных</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">Прямой телефон & Telegram</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    <a href={`tel:${phone}`} className="hover:underline text-[#f8f5ee]">{phone}</a> • 
                    <span className="text-[#c59b27] ml-1">{settings?.telegram || '@blade_barbershop'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={yandexMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="gold-button text-black font-bold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Маршрут в Яндекс.Картах</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {onStartBooking && (
                <button
                  onClick={onStartBooking}
                  className="px-5 py-3 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] text-xs font-semibold text-[#f8f5ee] transition-colors"
                >
                  Записаться онлайн
                </button>
              )}
            </div>

          </div>

          {/* Atmospheric Map Graphic Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#21262d] bg-[#161b22] shadow-2xl aspect-[4/3] group">
              <img
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80"
                alt="BLADE & CO. Interior & Location"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117] via-[#0e1117]/40 to-transparent" />

              {/* Pin Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#161b22]/90 backdrop-blur-md border border-[#c59b27]/40 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c59b27] text-black flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#f8f5ee] block leading-tight">
                      BLADE & CO. Barbershop
                    </span>
                    <span className="text-[11px] text-[#8b949e]">
                      {address}
                    </span>
                  </div>
                </div>

                <a
                  href={yandexMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-[#c59b27]/20 hover:bg-[#c59b27]/30 text-[#fce082] transition-colors"
                  title="Открыть карту"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
