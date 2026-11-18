import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Barber, Service, Booking, SiteSettings, UserProfile, AuditLog, RegisteredUser, UserRole } from '../types';
import { 
  INITIAL_BARBERS, 
  INITIAL_SERVICES, 
  INITIAL_SITE_SETTINGS, 
  DEMO_USERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_REGISTERED_USERS,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD
} from './mockData';

const STORAGE_KEY_URL = 'barber_supabase_url';
const STORAGE_KEY_KEY = 'barber_supabase_key';
const STORAGE_KEY_LOCAL_BOOKINGS = 'barber_local_bookings';
const STORAGE_KEY_SERVICES = 'barber_local_services';
const STORAGE_KEY_BARBERS = 'barber_local_barbers';
const STORAGE_KEY_SETTINGS = 'barber_local_settings';
const STORAGE_KEY_LOGS = 'barber_local_audit_logs';
const STORAGE_KEY_ACTIVE_USER = 'barber_active_user';
const STORAGE_KEY_REGISTERED_USERS = 'barber_registered_users';

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

// --- Registered Users Storage ---
export function getRegisteredUsers(): RegisteredUser[] {
  const saved = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
  let users: RegisteredUser[] = saved ? JSON.parse(saved) : [];
  
  // Ensure default admin (thunderwoltt@gmail.com) always exists
  const hasAdmin = users.some(u => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase());
  if (!hasAdmin) {
    users = [...INITIAL_REGISTERED_USERS, ...users.filter(u => u.email !== DEFAULT_ADMIN_EMAIL)];
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
  }
  return users;
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
  // Default to the admin account requested by user
  return DEMO_USERS[0];
}

export function setActiveUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_USER, JSON.stringify(user));
}

// --- Authentication & Account Creation ---
export async function loginUser(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, message: 'Введите email и пароль' };
  }

  // Check Supabase Auth first if connected
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!error && data.user) {
        // Look up profile metadata or role
        const role = (data.user.user_metadata?.role as UserRole) || (cleanEmail === DEFAULT_ADMIN_EMAIL ? 'admin' : 'client');
        const userProf: UserProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Пользователь',
          email: data.user.email,
          phone: data.user.user_metadata?.phone || '',
          role,
          bonus_points: 500,
        };
        setActiveUser(userProf);
        await addAuditLog('Вход в аккаунт', `Пользователь ${userProf.email} вошел в систему (Supabase Auth)`, userProf);
        return { success: true, user: userProf };
      }
    } catch (e) {
      console.warn('Supabase auth error, falling back to local registered users:', e);
    }
  }

  // Fallback: check local registered users list
  const users = getRegisteredUsers();
  
  // Direct check for admin thunderwoltt
  if (cleanEmail === DEFAULT_ADMIN_EMAIL && cleanPass === DEFAULT_ADMIN_PASSWORD) {
    const adminUser = users.find(u => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL) || INITIAL_REGISTERED_USERS[0];
    const { password, ...safeUser } = adminUser;
    setActiveUser(safeUser);
    await addAuditLog('Вход Администратора', `Администратор ${safeUser.email} успешно авторизован`, safeUser);
    return { success: true, user: safeUser };
  }

  const found = users.find(u => u.email?.toLowerCase() === cleanEmail);
  if (!found) {
    return { success: false, message: 'Пользователь с таким email не найден' };
  }

  if (found.password && found.password !== cleanPass) {
    return { success: false, message: 'Неверный пароль' };
  }

  const { password, ...safeUser } = found;
  setActiveUser(safeUser);
  await addAuditLog('Вход в систему', `Пользователь ${safeUser.name} (${safeUser.role}) вошел в систему`, safeUser);
  return { success: true, user: safeUser };
}

export async function registerUser(params: {
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPass = params.password.trim();
  const cleanName = params.name.trim();
  const cleanPhone = params.phone.trim();

  if (!cleanEmail || !cleanPass || !cleanName || !cleanPhone) {
    return { success: false, message: 'Заполните все обязательные поля' };
  }

  if (cleanPass.length < 6) {
    return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
  }

  // If email is thunderwoltt@gmail.com, automatically promote to admin
  const userRole: UserRole = cleanEmail === DEFAULT_ADMIN_EMAIL ? 'admin' : (params.role || 'client');

  // Check if email already registered locally
  const currentUsers = getRegisteredUsers();
  const alreadyExists = currentUsers.some(u => u.email?.toLowerCase() === cleanEmail);
  if (alreadyExists) {
    return { success: false, message: 'Пользователь с таким email уже зарегистрирован' };
  }

  // Try Supabase Auth SignUp if available
  const client = getClient();
  let supabaseUserId: string | null = null;
  if (client) {
    try {
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          data: {
            name: cleanName,
            phone: cleanPhone,
            role: userRole,
          },
        },
      });
      if (!error && data.user) {
        supabaseUserId = data.user.id;
      }
    } catch (e) {
      console.warn('Supabase signUp fallback:', e);
    }
  }

  const newUser: RegisteredUser = {
    id: supabaseUserId || 'user-' + Math.random().toString(36).substr(2, 9),
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    password: cleanPass,
    role: userRole,
    bonus_points: 300, // starting bonus for new users
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
    created_at: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...currentUsers];
  localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updatedUsers));

  const { password, ...safeUser } = newUser;
  setActiveUser(safeUser);
  await addAuditLog('Регистрация аккаунта', `Создан новый аккаунт: ${safeUser.name} (${safeUser.email}) с ролью ${safeUser.role}`, safeUser);

  return { success: true, user: safeUser };
}

export async function logoutUser(): Promise<void> {
  const client = getClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
  // Set default client or guest
  const defaultClient = DEMO_USERS.find(u => u.role === 'client') || DEMO_USERS[0];
  setActiveUser(defaultClient);
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
