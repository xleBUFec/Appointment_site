import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, Booking, Service, Barber, SiteSettings, AuditLog } from '../../types';
import { 
  getActiveUser, 
  setActiveUser, 
  fetchBarbers, 
  fetchServices, 
  fetchAllBookings, 
  fetchSiteSettings, 
  fetchAuditLogs 
} from '../../lib/supabase';
import { DEMO_USERS } from '../../lib/mockData';
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
  Gift,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
  onRepeatBooking?: (serviceName: string, barberName: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  isSupabaseConnected,
  onRepeatBooking,
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
    const [bRes, sRes, bkRes, setRes, lRes] = await Promise.all([
      fetchBarbers(),
      fetchServices(),
      fetchAllBookings(),
      fetchSiteSettings(),
      fetchAuditLogs(),
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
      loadAllData();
      // Set initial tab depending on user role
      if (currentUser.role === 'admin') setActiveTab('overview');
      else if (currentUser.role === 'master') setActiveTab('master_schedule');
      else setActiveTab('client_cabinet');
    }
  }, [isOpen, currentUser.role]);

  if (!isOpen) return null;

  const handleSwitchUser = (user: UserProfile) => {
    setActiveUser(user);
    setCurrentUserState(user);
    if (user.role === 'admin') setActiveTab('overview');
    else if (user.role === 'master') setActiveTab('master_schedule');
    else setActiveTab('client_cabinet');
  };

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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#21262d] text-[#c59b27] font-semibold border border-[#c59b27]/30">
                  {currentUser.role === 'admin' ? 'Панель управления' : currentUser.role === 'master' ? 'Кабинет мастера' : 'Личный кабинет'}
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                {isSupabaseConnected ? 'Синхронизация с Supabase активна' : 'Автономный режим (Local Storage)'}
              </p>
            </div>
          </div>

          {/* Quick Role Switcher (Демо-переключатель ролей) */}
          <div className="flex items-center gap-2 bg-[#161b22] p-1 rounded-2xl border border-[#21262d]">
            <span className="text-[10px] text-[#8b949e] uppercase font-semibold px-2 hidden sm:inline">
              Роль:
            </span>
            {DEMO_USERS.map(u => {
              const isSelected = currentUser.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#c59b27] text-black shadow-md'
                      : 'text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>
                    {u.role === 'admin' ? 'Админ' : u.role === 'master' ? 'Мастер' : 'Клиент'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Close & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 rounded-xl border border-[#21262d] text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Content body with responsive sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Tabs (Only shown for Admin, Master/Client have tailored views) */}
          {currentUser.role === 'admin' && (
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
            ) : (
              <>
                {/* Admin views */}
                {currentUser.role === 'admin' && (
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

                {/* Master view */}
                {currentUser.role === 'master' && (
                  <MasterCabinet
                    currentUser={currentUser}
                    barbers={barbers}
                    bookings={bookings}
                    onRefresh={loadAllData}
                  />
                )}

                {/* Client view */}
                {currentUser.role === 'client' && (
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
