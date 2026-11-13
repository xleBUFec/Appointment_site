import React from 'react';
import { Scissors, Database, CheckCircle2, LayoutDashboard, Sparkles, User, Megaphone } from 'lucide-react';
import { UserProfile, SiteSettings } from '../types';

interface NavbarProps {
  isSupabaseConnected: boolean;
  currentUser: UserProfile;
  settings: SiteSettings | null;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onScrollToBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSupabaseConnected,
  currentUser,
  settings,
  onOpenSettings,
  onOpenAdmin,
  onScrollToBooking,
}) => {
  return (
    <div className="sticky top-0 z-40">
      
      {/* Dynamic Announcement Banner (CMS controlled) */}
      {settings?.announcement_active && settings.announcement_banner && (
        <div className="bg-gradient-to-r from-[#8f6d19] via-[#c59b27] to-[#7a5c13] text-black font-semibold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md">
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span>{settings.announcement_banner}</span>
          {settings.promo_code && (
            <span className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
              {settings.promo_code}
            </span>
          )}
        </div>
      )}

      <header className="bg-[#0e1117]/90 backdrop-blur-md border-b border-[#21262d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c59b27] to-[#7a5c13] flex items-center justify-center shadow-lg shadow-[#c59b27]/20 border border-[#fce082]/30">
              <Scissors className="w-6 h-6 text-black transform -rotate-45" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#f8f5ee] uppercase block leading-none">
                BLADE & CO.
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c59b27] font-semibold">
                Gentlemen's Barbershop
              </span>
            </div>
          </div>

          {/* Navigation links & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Supabase status badge */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
              }`}
              title="Нажмите для настройки подключения к Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConnected ? 'Supabase: Активен' : 'Демо / Подключить Supabase'}
              </span>
              {isSupabaseConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Admin / Cabinet Switcher Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] text-xs font-semibold text-[#f8f5ee] transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-[#c59b27]" />
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] text-[#8b949e] leading-none uppercase">
                  {currentUser.role === 'admin' ? 'Админ' : currentUser.role === 'master' ? 'Мастер' : 'Клиент'}
                </span>
                <span className="leading-tight block">Кабинет & CMS</span>
              </div>
            </button>

            {/* Book Now Button */}
            <button
              onClick={onScrollToBooking}
              className="gold-button text-black font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Записаться
            </button>
          </div>

        </div>
      </header>
    </div>
  );
};
