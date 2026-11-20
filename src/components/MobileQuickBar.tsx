import React from 'react';
import { Scissors, Phone } from 'lucide-react';
import { SiteSettings } from '../types';

interface MobileQuickBarProps {
  settings?: SiteSettings | null;
  onScrollToBooking: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({
  settings,
  onScrollToBooking,
}) => {
  const phone = settings?.phone || '+7 (495) 123-45-67';

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0e1117]/95 backdrop-blur-md border-t border-[#21262d] px-4 py-2.5 flex items-center gap-3 shadow-2xl">
      <a
        href={`tel:${phone}`}
        className="p-3 rounded-xl border border-[#30363d] bg-[#161b22] text-[#c59b27] flex items-center justify-center flex-shrink-0"
        title="Позвонить в барбершоп"
      >
        <Phone className="w-5 h-5" />
      </a>

      <button
        onClick={onScrollToBooking}
        className="flex-1 gold-button text-black font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
      >
        <Scissors className="w-4 h-4 transform -rotate-45" />
        <span>Записаться на стрижку</span>
      </button>
    </div>
  );
};
