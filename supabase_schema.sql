-- ========================================================
-- BLADE & CO. BARBERSHOP DATABASE SCHEMA FOR SUPABASE
-- Скопируйте этот SQL скрипт и вставьте в Supabase SQL Editor
-- ========================================================

-- 1. Создаем таблицу барберов (мастеров)
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    experience TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.95,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Создаем таблицу услуг
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hair', 'beard', 'combo', 'spa')),
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Создаем таблицу бронирований
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    service_id TEXT,
    barber_id TEXT,
    service_name TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Настраиваем Row Level Security (RLS) для публичного доступа клиентов
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Разрешаем чтение барберов и услуг всем пользователям (включая анонимных)
CREATE POLICY "Public read barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

-- Разрешаем клиентам создавать бронирования и смотреть свои бронирования
CREATE POLICY "Public create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);

-- 5. Начальные данные (Seed Data)
INSERT INTO public.barbers (name, role, avatar_url, experience, rating, bio)
VALUES 
    ('Александр "Клык" Романов', 'Шеф-барбер', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', '10 лет опыта', 4.98, 'Специалист по классическим британским стрижкам и королевскому бритью опасной бритвой.'),
    ('Максим Воронов', 'Топ-барбер', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '6 лет опыта', 4.95, 'Мастер фейдов любой сложности, моделирования бороды и текстурных укладок.'),
    ('Денис Громов', 'Барбер-стилист', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', '4 года опыта', 4.92, 'Современные тренды, уход за кожей головы и индивидуальный подбор стиля.')
ON CONFLICT DO NOTHING;

INSERT INTO public.services (title, description, price, duration_min, category, popular)
VALUES 
    ('Классическая мужская стрижка', 'Мытье головы, индивидуальная стрижка ножницами и машинкой, укладка премиум стайлингом.', 2500, 50, 'hair', true),
    ('Моделирование бороды и усов', 'Четкие контуры, распаривание горячим полотенцем, уход специальными маслами.', 1800, 40, 'beard', true),
    ('Комплекс "Шеф": Стрижка + Борода', 'Полное преображение: стрижка волос, моделирование бороды и бритье шейной зоны.', 3800, 75, 'combo', true),
    ('Королевское бритье опасной бритвой', 'Традиционный ритуал с распаривающими полотенцами, пеной из барсучьего помазка и холодным компрессом.', 2200, 45, 'beard', false),
    ('Премиум СПА-уход для лица и кожи', 'Очищающая маска с черным углем, массаж лица и увлажняющая сыворотка.', 1600, 30, 'spa', false),
    ('Камуфляж седины волос и бороды', 'Естественное тонирование седых волос без эффекта окрашенности за 15 минут.', 1500, 30, 'hair', false)
ON CONFLICT DO NOTHING;
