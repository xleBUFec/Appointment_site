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
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_GUEST_USER
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

export function saveSupabaseConfig(url: string, anonKey: string, user?: UserProfile) {
  const active = user || getActiveUser();
  if (active.role !== 'admin') {
    throw new Error('Доступ запрещен: настройки подключения к Supabase может менять только администратор');
  }

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
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.role) {
        return parsed;
      }
    } catch (e) {
      // fallback
    }
  }
  // Default to Guest (client without admin privileges)
  return DEFAULT_GUEST_USER;
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
        // Look up profile metadata or role; only DEFAULT_ADMIN_EMAIL can be admin
        const isDefaultAdmin = cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();
        const role: UserRole = isDefaultAdmin ? 'admin' : ((data.user.user_metadata?.role as UserRole) || 'client');
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
  
  // Direct check for admin thunderwoltt with password
  if (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
    if (cleanPass !== DEFAULT_ADMIN_PASSWORD) {
      return { success: false, message: 'Неверный пароль администратора' };
    }
    const adminUser = users.find(u => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) || INITIAL_REGISTERED_USERS[0];
    const { password, ...safeUser } = adminUser;
    safeUser.role = 'admin';
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
  // Security guard: ensure non-admin users cannot have admin role
  if (safeUser.role === 'admin' && safeUser.email?.toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
    safeUser.role = 'client';
  }
  setActiveUser(safeUser);
  await addAuditLog('Вход в систему', `Пользователь ${safeUser.name} (${safeUser.role}) вошел в систему`, safeUser);
  return { success: true, user: safeUser };
}

export async function registerUser(params: {
  name: string;
  phone: string;
  email: string;
  password: string;
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

  // Security guard: ordinary users can NEVER register as admin
  if (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'Этот email зарезервирован системой. Пожалуйста, используйте форму входа.' };
  }

  // All public registrations are strictly 'client' role
  const userRole: UserRole = 'client';

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
            role: 'client',
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
    role: 'client',
    bonus_points: 300, // starting bonus for new clients
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
    created_at: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...currentUsers];
  localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updatedUsers));

  const { password, ...safeUser } = newUser;
  setActiveUser(safeUser);
  await addAuditLog('Регистрация клиента', `Создан новый аккаунт клиента: ${safeUser.name} (${safeUser.email})`, safeUser);

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
  localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
  setActiveUser(DEFAULT_GUEST_USER);
}

// --- Audit Logs ---
export async function fetchAuditLogs(user?: UserProfile): Promise<AuditLog[]> {
  const active = user || getActiveUser();
  if (active.role !== 'admin') {
    return [];
  }

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
  if (!user || user.role !== 'admin') {
    throw new Error('Доступ запрещен: требуется роль администратора');
  }

  const client = getClient();
  if (client) {
    try {
      await client
        .from('site_settings')
        .upsert([{ id: 1, ...settings }]);
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
  if (!user || user.role !== 'admin') {
    throw new Error('Доступ запрещен: требуется роль администратора');
  }

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
  if (!user || user.role !== 'admin') {
    throw new Error('Доступ запрещен: требуется роль администратора');
  }

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
  if (!user || user.role !== 'admin') {
    throw new Error('Доступ запрещен: требуется роль администратора');
  }

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
  if (!user || user.role !== 'admin') {
    throw new Error('Доступ запрещен: требуется роль администратора');
  }

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

export async function fetchAllBookings(user?: UserProfile): Promise<{ data: Booking[]; isSupabase: boolean }> {
  const active = user || getActiveUser();
  // Privacy & security check: guest cannot view bookings
  if (!active || active.id === 'guest') {
    return { data: [], isSupabase: false };
  }

  let allData: Booking[] = [];
  let isSupabase = false;

  const client = getClient();
  if (client) {
    try {
      let query = client.from('bookings').select('*').order('booking_date', { ascending: false });

      // If client: request only their own bookings
      if (active.role === 'client') {
        if (active.email) {
          query = query.eq('client_email', active.email);
        } else if (active.phone) {
          query = query.eq('client_phone', active.phone);
        }
      } else if (active.role === 'master' && active.barber_id) {
        query = query.eq('barber_id', active.barber_id);
      }

      const { data, error } = await query;
      if (!error && data) {
        allData = data;
        isSupabase = true;
      }
    } catch (e) {
      console.warn('Supabase fetchAllBookings fallback:', e);
    }
  }

  if (!isSupabase) {
    const saved = localStorage.getItem(STORAGE_KEY_LOCAL_BOOKINGS);
    allData = saved ? JSON.parse(saved) : [];
  }

  // Filter strictly based on user role
  if (active.role === 'client') {
    const filtered = allData.filter(b => 
      (active.email && b.client_email && b.client_email.toLowerCase() === active.email.toLowerCase()) ||
      (active.phone && b.client_phone && b.client_phone.replace(/\D/g, '') === active.phone.replace(/\D/g, ''))
    );
    return { data: filtered, isSupabase };
  }

  if (active.role === 'master') {
    const filtered = allData.filter(b => 
      b.barber_id === active.barber_id || b.barber_name === active.name
    );
    return { data: filtered, isSupabase };
  }

  if (active.role === 'admin') {
    return { data: allData, isSupabase };
  }

  return { data: [], isSupabase: false };
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
export async function exportDatabaseBackup(user?: UserProfile): Promise<string> {
  const active = user || getActiveUser();
  if (active.role !== 'admin') {
    throw new Error('Доступ запрещен: требуется роль администратора');
  }

  const [barbers, services, bookings, settings, logs] = await Promise.all([
    fetchBarbers(),
    fetchServices(),
    fetchAllBookings(active),
    fetchSiteSettings(),
    fetchAuditLogs(active),
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
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Доступ запрещен: требуется роль администратора' };
  }

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
