import React from 'react';
import { MapPin, Navigation, Clock, Phone, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';

interface LocationSectionProps {
  settings?: SiteSettings | null;
  onStartBooking?: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings, onStartBooking }) => {
  const address = settings?.address || 'г. Алматы, пр. Достык, д. 42';
  const phone = settings?.phone || '+7 (777) 123-45-67';
  const hours = settings?.work_hours || '10:00 — 22:00 ежедневно';
  const yandexMapsUrl = `https://yandex.kz/maps/?text=${encodeURIComponent(address)}`;
  const twoGisUrl = 'https://2gis.kz/almaty';

  return (
    <section className="py-20 border-t border-[#21262d] bg-[#0e1117]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Info Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Локация в центре Алматы</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f8f5ee]">
              Как нас найти
            </h2>

            <p className="text-sm text-[#8b949e] leading-relaxed">
              Мы расположены в престижном историческом районе Алматы на проспекте Достык. Удобный заезд с проспекта, собственная гостевая парковка и шаговая доступность от Дворца Республики.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">{address}</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">Ориентир: гостиница «Казахстан» • Вход с пр. Достык</p>
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
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">Телефон & Telegram</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    <a href={`tel:${phone}`} className="hover:underline text-[#f8f5ee]">{phone}</a> • 
                    <span className="text-[#c59b27] ml-1">{settings?.telegram || '@blade_almaty'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={twoGisUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl border border-[#29b6f6]/40 bg-[#0288d1]/10 hover:bg-[#0288d1]/20 text-[#29b6f6] text-xs font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Открыть в 2GIS</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={yandexMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="gold-button text-black font-bold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Яндекс Карты</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {onStartBooking && (
                <button
                  onClick={onStartBooking}
                  className="px-5 py-3 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] text-xs font-semibold text-[#f8f5ee] transition-colors cursor-pointer"
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
                alt="BLADE & CO. Barbershop Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#0e1117]/90 backdrop-blur-md border border-[#c59b27]/30 flex items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="text-xs uppercase font-bold text-[#c59b27] tracking-wider">BLADE & CO. ALMATY</div>
                  <div className="text-sm font-semibold text-[#f8f5ee] mt-0.5">{address}</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#c59b27] text-black flex items-center justify-center font-bold">
                  ★ 4.98
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
