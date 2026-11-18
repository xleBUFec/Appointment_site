import React from 'react';
import { 
  Scissors, 
  Database, 
  CheckCircle2, 
  LayoutDashboard, 
  Sparkles, 
  User, 
  Megaphone,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, SiteSettings } from '../types';

interface NavbarProps {
  isSupabaseConnected: boolean;
  currentUser: UserProfile;
  settings: SiteSettings | null;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onScrollToBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSupabaseConnected,
  currentUser,
  settings,
  onOpenSettings,
  onOpenAdmin,
  onOpenAuth,
  onLogout,
  onScrollToBooking,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const roleLabel = isAdmin ? 'Админ' : currentUser.role === 'master' ? 'Мастер' : 'Клиент';

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

      <header className="bg-[#0e1117]/95 backdrop-blur-md border-b border-[#21262d]">
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
          <div className="flex items-center gap-2 sm:gap-3">
            
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
              <span className="hidden lg:inline">
                {isSupabaseConnected ? 'Supabase: Активен' : 'Демо / Supabase'}
              </span>
              {isSupabaseConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Auth / Login button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] text-xs font-medium text-[#f8f5ee] transition-all"
              title="Войти или зарегистрировать новый аккаунт"
            >
              <LogIn className="w-3.5 h-3.5 text-[#c59b27]" />
              <span className="hidden sm:inline">Войти / Регистрация</span>
            </button>

            {/* User Profile & Role / Cabinet Button */}
            <div className="flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-xl p-0.5">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-[#21262d] text-xs font-semibold text-[#f8f5ee] transition-all"
                title="Открыть панель управления или кабинет"
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
                ) : (
                  <User className="w-4 h-4 text-[#c59b27]" />
                )}
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-[10px] uppercase font-bold text-[#c59b27]">
                      {roleLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#f8f5ee] max-w-[110px] truncate block">
                    {currentUser.name || currentUser.email || 'Кабинет'}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-[#21262d] transition-colors"
                title="Выйти из текущего аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Book Now Button */}
            <button
              onClick={onScrollToBooking}
              className="gold-button text-black font-semibold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2 rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Записаться
            </button>
          </div>

        </div>
      </header>
    </div>
  );
};
