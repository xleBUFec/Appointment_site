import React from 'react';
import { Sparkles, Clock, Award, Shield, ArrowDown } from 'lucide-react';

interface HeroProps {
  onStartBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartBooking }) => {
  return (
    <div className="relative overflow-hidden pt-12 pb-20 border-b border-[#21262d]">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c59b27]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161b22] border border-[#c59b27]/40 text-[#c59b27] text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#e4ba43]" />
          <span>Премиум сервис & Мужские традиции</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f8f5ee] mb-6 leading-[1.1]">
          Искусство точной стрижки <br />
          <span className="gold-gradient-text italic font-serif">и безупречного стиля</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-[#8b949e] text-base sm:text-lg mb-10 leading-relaxed font-light">
          Мастера с многолетним опытом, традиционное бритье опасной бритвой, премиальная косметика и атмосфера настоящего мужского клуба.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={onStartBooking}
            className="w-full sm:w-auto gold-button text-black font-bold text-base px-8 py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Выбрать мастера и время</span>
            <ArrowDown className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Stats & Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-[#21262d]/60">
          <div className="p-4 rounded-xl bg-[#161b22]/50 border border-[#21262d] text-center">
            <Award className="w-5 h-5 text-[#c59b27] mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-bold text-[#f8f5ee]">10+ лет</div>
            <div className="text-xs text-[#8b949e]">Традиций мастерства</div>
          </div>
          <div className="p-4 rounded-xl bg-[#161b22]/50 border border-[#21262d] text-center">
            <Sparkles className="w-5 h-5 text-[#c59b27] mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-bold text-[#f8f5ee]">4.98</div>
            <div className="text-xs text-[#8b949e]">Рейтинг отзывов</div>
          </div>
          <div className="p-4 rounded-xl bg-[#161b22]/50 border border-[#21262d] text-center">
            <Clock className="w-5 h-5 text-[#c59b27] mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-bold text-[#f8f5ee]">10:00 - 22:00</div>
            <div className="text-xs text-[#8b949e]">Ежедневно без выходных</div>
          </div>
          <div className="p-4 rounded-xl bg-[#161b22]/50 border border-[#21262d] text-center">
            <Shield className="w-5 h-5 text-[#c59b27] mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-bold text-[#f8f5ee]">100%</div>
            <div className="text-xs text-[#8b949e]">Стерильность инструмента</div>
          </div>
        </div>

      </div>
    </div>
  );
};
