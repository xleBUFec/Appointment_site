import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Barber, Service, Booking } from '../types';
import { INITIAL_BARBERS, INITIAL_SERVICES } from './mockData';

const STORAGE_KEY_URL = 'barber_supabase_url';
const STORAGE_KEY_KEY = 'barber_supabase_key';
const STORAGE_KEY_LOCAL_BOOKINGS = 'barber_local_bookings';

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
      // Table might not be created yet, but connection is valid
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

// Fetch Barbers
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
  return { data: INITIAL_BARBERS, isSupabase: false };
}

// Fetch Services
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
  return { data: INITIAL_SERVICES, isSupabase: false };
}

// Create Booking
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

// Get Bookings (for Admin / Manage list)
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

// Cancel Booking
export async function cancelBooking(id: string): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      const { error } = await client
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase cancelBooking error:', e);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY_LOCAL_BOOKINGS);
  if (saved) {
    const list: Booking[] = JSON.parse(saved);
    const updated = list.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
    localStorage.setItem(STORAGE_KEY_LOCAL_BOOKINGS, JSON.stringify(updated));
    return true;
  }
  return false;
}
