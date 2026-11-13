import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Barber, Service, Booking, SiteSettings, UserProfile, AuditLog } from '../types';
import { INITIAL_BARBERS, INITIAL_SERVICES, INITIAL_SITE_SETTINGS, DEMO_USERS, INITIAL_AUDIT_LOGS } from './mockData';

const STORAGE_KEY_URL = 'barber_supabase_url';
const STORAGE_KEY_KEY = 'barber_supabase_key';
const STORAGE_KEY_LOCAL_BOOKINGS = 'barber_local_bookings';
const STORAGE_KEY_SERVICES = 'barber_local_services';
const STORAGE_KEY_BARBERS = 'barber_local_barbers';
const STORAGE_KEY_SETTINGS = 'barber_local_settings';
const STORAGE_KEY_LOGS = 'barber_local_audit_logs';
const STORAGE_KEY_ACTIVE_USER = 'barber_active_user';

// Initial config from environment or localStorage
export function getSavedSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || envUrl;
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || envKey;

  return {
    url: localUrl.trim(),
    anonKey: localKey.trim(),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  initSupabaseClient();
}

let supabaseClient: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseConfig();
  if (url && anonKey) {
    try {
      supabaseClient = createClient(url, anonKey);
      return supabaseClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  return null;
}

// Initialize on module load
initSupabaseClient();

export function getClient(): SupabaseClient | null {
  if (!supabaseClient) {
    initSupabaseClient();
  }
  return supabaseClient;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !key) {
      return { success: false, message: 'Укажите URL проекта и публичный Anon Key' };
    }
    const testClient = createClient(url.trim(), key.trim());
    const { error } = await testClient.from('services').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Подключение к Supabase успешно! (Таблица services еще не создана, выполните SQL-скрипт).' 
        };
      }
      return { success: false, message: `Ошибка Supabase: ${error.message}` };
    }
    return { success: true, message: 'Успешное подключение к базе данных Supabase!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Не удалось установить соединение' };
  }
}

// --- Active User / Role System ---
export function getActiveUser(): UserProfile {
  const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }
  return DEMO_USERS[0]; // Admin by default
}

export function setActiveUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_USER, JSON.stringify(user));
}

// --- Audit Logs ---
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      // fallback
    }
  }
  const saved = localStorage.getItem(STORAGE_KEY_LOGS);
  return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
}

export async function addAuditLog(action: string, details: string, user: UserProfile): Promise<void> {
  const newLog: AuditLog = {
    id: 'log-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    user_name: user.name,
    user_role: user.role,
    action,
    details,
  };

  const client = getClient();
  if (client) {
    try {
      await client.from('audit_logs').insert([newLog]);
    } catch (e) {
      // ignore
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY_LOGS);
  const logs: AuditLog[] = saved ? JSON.parse(saved) : [...INITIAL_AUDIT_LOGS];
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 100)));
}

// --- Site Settings (CMS / Marketing / SEO) ---
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('site_settings')
        .select('*')
        .single();

      if (!error && data) {
        return data as SiteSettings;
      }
    } catch (e) {
      // fallback
    }
  }
  const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
  return saved ? JSON.parse(saved) : INITIAL_SITE_SETTINGS;
}

export async function saveSiteSettings(settings: SiteSettings, user: UserProfile): Promise<boolean> {
  const client = getClient();
  let ok = false;
  if (client) {
    try {
      const { error } = await client
        .from('site_settings')
        .upsert([{ id: 1, ...settings }]);
      if (!error) ok = true;
    } catch (e) {
      // ignore
    }
  }
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  await addAuditLog('Обновление настроек сайта', 'Изменены тексты, баннер или SEO-поля', user);
  return true;
}

// --- Barbers CRUD ---
export async function fetchBarbers(): Promise<{ data: Barber[]; isSupabase: boolean }> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('barbers')
        .select('*')
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data, isSupabase: true };
      }
    } catch (e) {
      console.warn('Supabase fetchBarbers fallback:', e);
    }
  }
  const saved = localStorage.getItem(STORAGE_KEY_BARBERS);
  return { data: saved ? JSON.parse(saved) : INITIAL_BARBERS, isSupabase: false };
}

export async function saveBarber(barber: Barber, user: UserProfile): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      await client.from('barbers').upsert([barber]);
    } catch (e) {
      // ignore
    }
  }
  const { data: current } = await fetchBarbers();
  const index = current.findIndex(b => b.id === barber.id);
  let updated: Barber[];
  if (index >= 0) {
    updated = current.map(b => b.id === barber.id ? barber : b);
  } else {
    updated = [barber, ...current];
  }
  localStorage.setItem(STORAGE_KEY_BARBERS, JSON.stringify(updated));
  await addAuditLog(index >= 0 ? 'Редактирование мастера' : 'Добавление мастера', `Мастер: ${barber.name} (${barber.role})`, user);
  return true;
}

export async function deleteBarber(id: string, user: UserProfile): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      await client.from('barbers').delete().eq('id', id);
    } catch (e) {
      // ignore
    }
  }
  const { data: current } = await fetchBarbers();
  const barber = current.find(b => b.id === id);
  const updated = current.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY_BARBERS, JSON.stringify(updated));
  if (barber) {
    await addAuditLog('Удаление мастера', `Мастер: ${barber.name}`, user);
  }
  return true;
}

// --- Services CRUD ---
export async function fetchServices(): Promise<{ data: Service[]; isSupabase: boolean }> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data, isSupabase: true };
      }
    } catch (e) {
      console.warn('Supabase fetchServices fallback:', e);
    }
  }
  const saved = localStorage.getItem(STORAGE_KEY_SERVICES);
  return { data: saved ? JSON.parse(saved) : INITIAL_SERVICES, isSupabase: false };
}

export async function saveService(service: Service, user: UserProfile): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      await client.from('services').upsert([service]);
    } catch (e) {
      // ignore
    }
  }
  const { data: current } = await fetchServices();
  const index = current.findIndex(s => s.id === service.id);
  let updated: Service[];
  if (index >= 0) {
    updated = current.map(s => s.id === service.id ? service : s);
  } else {
    updated = [...current, service];
  }
  localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(updated));
  await addAuditLog(index >= 0 ? 'Редактирование услуги' : 'Создание услуги', `Услуга: ${service.title} (${service.price} ₽)`, user);
  return true;
}

export async function deleteService(id: string, user: UserProfile): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      await client.from('services').delete().eq('id', id);
    } catch (e) {
      // ignore
    }
  }
  const { data: current } = await fetchServices();
  const srv = current.find(s => s.id === id);
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(updated));
  if (srv) {
    await addAuditLog('Удаление услуги', `Услуга: ${srv.title}`, user);
  }
  return true;
}

// --- Bookings ---
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<{ booking: Booking; isSupabase: boolean }> {
  const client = getClient();
  const id = 'bk-' + Math.random().toString(36).substr(2, 9);
  const newBooking: Booking = {
    ...booking,
    id,
    created_at: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (!error && data) {
        return { booking: data, isSupabase: true };
      }
      console.warn('Supabase insert warning, falling back to local storage:', error?.message);
    } catch (e) {
      console.warn('Supabase insert exception:', e);
    }
  }

  // Fallback to localStorage
  const saved = localStorage.getItem(STORAGE_KEY_LOCAL_BOOKINGS);
  const bookings: Booking[] = saved ? JSON.parse(saved) : [];
  bookings.unshift(newBooking);
  localStorage.setItem(STORAGE_KEY_LOCAL_BOOKINGS, JSON.stringify(bookings));

  return { booking: newBooking, isSupabase: false };
}

export async function fetchAllBookings(): Promise<{ data: Booking[]; isSupabase: boolean }> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (!error && data) {
        return { data, isSupabase: true };
      }
    } catch (e) {
      console.warn('Supabase fetchAllBookings fallback:', e);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY_LOCAL_BOOKINGS);
  return { data: saved ? JSON.parse(saved) : [], isSupabase: false };
}

export async function updateBookingStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'completed',
  user: UserProfile
): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      const { error } = await client
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (!error) {
        await addAuditLog('Смена статуса записи', `Запись #${id}: ${status}`, user);
        return true;
      }
    } catch (e) {
      console.warn('Supabase updateBookingStatus error:', e);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY_LOCAL_BOOKINGS);
  if (saved) {
    const list: Booking[] = JSON.parse(saved);
    const updated = list.map(b => b.id === id ? { ...b, status } : b);
    localStorage.setItem(STORAGE_KEY_LOCAL_BOOKINGS, JSON.stringify(updated));
    await addAuditLog('Смена статуса записи', `Запись #${id}: ${status}`, user);
    return true;
  }
  return false;
}

export async function cancelBooking(id: string, user?: UserProfile): Promise<boolean> {
  const active = user || getActiveUser();
  return updateBookingStatus(id, 'cancelled', active);
}

// --- Backup & Restore (JSON Dump) ---
export async function exportDatabaseBackup(): Promise<string> {
  const [barbers, services, bookings, settings, logs] = await Promise.all([
    fetchBarbers(),
    fetchServices(),
    fetchAllBookings(),
    fetchSiteSettings(),
    fetchAuditLogs(),
  ]);

  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    barbers: barbers.data,
    services: services.data,
    bookings: bookings.data,
    settings,
    auditLogs: logs,
  };

  return JSON.stringify(backupData, null, 2);
}

export async function restoreDatabaseBackup(jsonString: string, user: UserProfile): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.services || !parsed.barbers) {
      return { success: false, message: 'Неверный формат файла резервной копии.' };
    }

    if (parsed.barbers) localStorage.setItem(STORAGE_KEY_BARBERS, JSON.stringify(parsed.barbers));
    if (parsed.services) localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(parsed.services));
    if (parsed.bookings) localStorage.setItem(STORAGE_KEY_LOCAL_BOOKINGS, JSON.stringify(parsed.bookings));
    if (parsed.settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(parsed.settings));

    await addAuditLog('Восстановление из бэкапа', `Восстановлено из бэкапа от ${parsed.exportedAt || 'неизвестно'}`, user);
    return { success: true, message: 'Данные успешно восстановлены из резервной копии!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Ошибка при разборе файла бэкапа' };
  }
}
