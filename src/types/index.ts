export interface Barber {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  experience: string;
  rating: number;
  bio?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_min: number;
  category: 'hair' | 'beard' | 'combo' | 'spa';
  popular?: boolean;
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

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
