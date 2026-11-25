import React, { useState, useEffect } from 'react';
import { UserProfile, Booking, Service, Barber, SiteSettings, AuditLog } from '../../types';
import { 
  getActiveUser, 
  fetchBarbers, 
  fetchServices, 
  fetchAllBookings, 
  fetchSiteSettings, 
  fetchAuditLogs 
} from '../../lib/supabase';
import { DEFAULT_ADMIN_EMAIL } from '../../lib/mockData';
import { isCurrentAdminSessionValid } from '../../lib/security';
import { AdminOverview } from './AdminOverview';
import { AdminBookingsTab } from './AdminBookingsTab';
import { AdminServicesTab } from './AdminServicesTab';
import { AdminBarbersTab } from './AdminBarbersTab';
import { AdminMarketingTab } from './AdminMarketingTab';
import { AdminLogsTab } from './AdminLogsTab';
import { AdminBackupsTab } from './AdminBackupsTab';
import { MasterCabinet } from './MasterCabinet';
import { ClientCabinet } from './ClientCabinet';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  Megaphone, 
  History, 
  Database, 
  X, 
  ShieldCheck, 
  User, 
  RefreshCw,
  LogIn,
  Lock,
  LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
  onRepeatBooking?: (serviceName: string, barberName: string) => void;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  isSupabaseConnected,
  onRepeatBooking,
  onOpenAuth,
  onOpenSettings,
  onLogout,
}) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(getActiveUser());
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    const active = getActiveUser();
    setCurrentUserState(active);

    const [bRes, sRes, bkRes, setRes, lRes] = await Promise.all([
      fetchBarbers(),
      fetchServices(),
      fetchAllBookings(active),
      fetchSiteSettings(),
      fetchAuditLogs(active),
    ]);

    setBarbers(bRes.data);
    setServices(sRes.data);
    setBookings(bkRes.data);
    setSettings(setRes);
    setLogs(lRes);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      const active = getActiveUser();
      setCurrentUserState(active);
      loadAllData();
      if (active.role === 'admin') setActiveTab('overview');
      else if (active.role === 'master') setActiveTab('master_schedule');
      else setActiveTab('client_cabinet');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAuthenticated = currentUser.id !== 'guest' && Boolean(currentUser.email);
  const isThunderwolttAdmin = currentUser.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
  const isAdmin = isAuthenticated && currentUser.role === 'admin' && isThunderwolttAdmin && isCurrentAdminSessionValid();
  const isMaster = isAuthenticated && currentUser.role === 'master' && !isAdmin;
  const isClient = isAuthenticated && (currentUser.role === 'client' || (!isAdmin && !isMaster));

  const adminTabs = [
    { id: 'overview', label: 'Дашборд & Выручка', icon: LayoutDashboard },
    { id: 'bookings', label: 'Заявки / CRM', icon: Calendar, badge: bookings.filter(b => b.status === 'confirmed').length },
    { id: 'services', label: 'Услуги и цены', icon: Scissors },
    { id: 'barbers', label: 'Мастера и команда', icon: Users },
    { id: 'marketing', label: 'Контент, Баннеры & SEO', icon: Megaphone },
    { id: 'logs', label: 'Журнал аудита', icon: History },
    { id: 'backups', label: 'Резервные копии', icon: Database },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#161b22] border border-[#30363d] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top App Header */}
        <div className="px-6 py-4 border-b border-[#21262d] flex flex-wrap items-center justify-between gap-4 bg-[#0e1117]/80">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c59b27] to-[#7a5c13] flex items-center justify-center text-black font-bold">
              <Scissors className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#f8f5ee] uppercase tracking-wide">
                  BLADE & CO.
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#21262d] text-[#c59b27] font-semibold border border-[#c59b27]/30 flex items-center gap-1">
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-[#c59b27]" />
                      <span>{isThunderwolttAdmin ? 'Главный Администратор' : 'Администратор'}</span>
                    </>
                  ) : isMaster ? (
                    'Кабинет мастера'
                  ) : isClient ? (
                    'Личный кабинет клиента'
                  ) : (
                    'Вход в систему'
                  )}
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                {isAuthenticated ? `${currentUser.name} (${currentUser.email})` : 'Требуется авторизация'}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            
            {/* Supabase settings quick link for admin only */}
            {isAdmin && onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 text-xs font-medium transition-all"
                title="Настройки подключения к базе данных Supabase"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">База Supabase</span>
              </button>
            )}

            {/* Logout button if authenticated */}
            {isAuthenticated && onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#30363d] bg-[#21262d] hover:bg-red-950/40 hover:text-red-300 text-xs text-[#8b949e] transition-all"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 rounded-xl border border-[#21262d] text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Content body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Admin Sidebar (ONLY SHOWN FOR VERIFIED ADMINISTRATOR) */}
          {isAdmin && (
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#21262d] p-3 space-y-1 bg-[#0e1117]/60 overflow-x-auto md:overflow-y-auto flex md:flex-col flex-row flex-shrink-0">
              {adminTabs.map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#c59b27] text-black shadow-md'
                        : 'text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </div>

                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-black text-[#c59b27]' : 'bg-[#21262d] text-[#c59b27]'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Workspace Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#161b22]/50">
            {loading ? (
              <div className="text-center py-24 text-xs text-[#8b949e] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#c59b27]" />
                <span>Загрузка данных...</span>
              </div>
            ) : !isAuthenticated ? (
              /* GUEST / UNAUTHENTICATED LOCKED VIEW */
              <div className="h-full flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#c59b27] flex items-center justify-center mb-4 shadow-lg shadow-[#c59b27]/10">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#f8f5ee] mb-2">
                  Доступ ограничен
                </h3>
                <p className="text-xs text-[#8b949e] mb-6 leading-relaxed">
                  Панель управления и личный кабинет доступны только зарегистрированным пользователям. Пожалуйста, выполните вход в свой аккаунт.
                </p>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="gold-button text-black font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Войти в аккаунт</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ADMIN VIEWS (CMS, CRM, Settings, Team, Backups) */}
                {isAdmin && (
                  <>
                    {activeTab === 'overview' && (
                      <AdminOverview
                        bookings={bookings}
                        services={services}
                        barbers={barbers}
                        onNavigateToBookings={() => setActiveTab('bookings')}
                      />
                    )}

                    {activeTab === 'bookings' && (
                      <AdminBookingsTab
                        bookings={bookings}
                        currentUser={currentUser}
                        onRefresh={loadAllData}
                      />
                    )}

                    {activeTab === 'services' && (
                      <AdminServicesTab
                        services={services}
                        currentUser={currentUser}
                        onRefresh={loadAllData}
                      />
                    )}

                    {activeTab === 'barbers' && (
                      <AdminBarbersTab
                        barbers={barbers}
                        currentUser={currentUser}
                        onRefresh={loadAllData}
                      />
                    )}

                    {activeTab === 'marketing' && settings && (
                      <AdminMarketingTab
                        settings={settings}
                        currentUser={currentUser}
                        onRefresh={loadAllData}
                      />
                    )}

                    {activeTab === 'logs' && (
                      <AdminLogsTab logs={logs} />
                    )}

                    {activeTab === 'backups' && (
                      <AdminBackupsTab
                        currentUser={currentUser}
                        onRefresh={loadAllData}
                      />
                    )}
                  </>
                )}

                {/* MASTER VIEW (Schedule, clients) */}
                {isMaster && (
                  <MasterCabinet
                    currentUser={currentUser}
                    barbers={barbers}
                    bookings={bookings}
                    onRefresh={loadAllData}
                  />
                )}

                {/* CLIENT VIEW (Bookings history, cancel, bonus points) */}
                {isClient && (
                  <ClientCabinet
                    currentUser={currentUser}
                    bookings={bookings}
                    onRefresh={loadAllData}
                    onBookAgain={(srvName, brbName) => {
                      onClose();
                      if (onRepeatBooking) {
                        onRepeatBooking(srvName, brbName);
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
