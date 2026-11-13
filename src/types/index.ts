export type UserRole = 'admin' | 'master' | 'client';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar_url?: string;
  barber_id?: string; // links to Barber.id if role is 'master'
  bonus_points?: number;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  experience: string;
  rating: number;
  bio?: string;
  active?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_min: number;
  category: 'hair' | 'beard' | 'combo' | 'spa';
  popular?: boolean;
  active?: boolean;
}

export interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  service_id: string;
  barber_id: string;
  service_name: string;
  barber_name: string;
  price: number;
  booking_date: string;
  booking_time: string;
  comment?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  announcement_banner: string;
  announcement_active: boolean;
  promo_code: string;
  promo_discount_percent: number;
  address: string;
  phone: string;
  work_hours: string;
  telegram: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  details: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
