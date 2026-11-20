-- ========================================================
-- BLADE & CO. BARBERSHOP DATABASE SCHEMA FOR SUPABASE
-- Скопируйте этот SQL скрипт и вставьте в Supabase SQL Editor
-- ========================================================

-- 1. Таблица мастеров (персонал)
CREATE TABLE IF NOT EXISTS public.barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    experience TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.95,
    bio TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Таблица услуг (прайс-лист)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hair', 'beard', 'combo', 'spa')),
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Таблица бронирований
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
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

-- 4. Таблица настроек сайта, маркетинга и SEO (CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    hero_badge TEXT NOT NULL,
    announcement_banner TEXT,
    announcement_active BOOLEAN DEFAULT true,
    promo_code TEXT,
    promo_discount_percent INTEGER DEFAULT 20,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    work_hours TEXT NOT NULL,
    telegram TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Таблица логов аудита
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT now(),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT
);

-- ========================================================
-- Автоматическое добавление недостающих колонок, если таблицы были созданы ранее
-- ========================================================
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.95;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS barber_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS announcement_banner TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_discount_percent INTEGER DEFAULT 20;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 6. Включение Row Level Security (RLS) и безопасные политики доступа
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Удаление старых политик при повторном запуске
DROP POLICY IF EXISTS "Public all barbers" ON public.barbers;
DROP POLICY IF EXISTS "Public all services" ON public.services;
DROP POLICY IF EXISTS "Public all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public all site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public all audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public read barbers" ON public.barbers;
DROP POLICY IF EXISTS "Admin manage barbers" ON public.barbers;
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Admin manage services" ON public.services;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin manage audit_logs" ON public.audit_logs;

-- БЕЗОПАСНЫЕ ПОЛИТИКИ ДОСТУПА (Клиенты не могут менять прайс, удалять мастеров и читать логи):
-- 1. Мастера: чтение доступно всем, изменения только администраторам
CREATE POLICY "Public read barbers" ON public.barbers 
    FOR SELECT USING (true);
CREATE POLICY "Admin manage barbers" ON public.barbers 
    FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com');

-- 2. Услуги: чтение доступно всем, изменения только администраторам
CREATE POLICY "Public read services" ON public.services 
    FOR SELECT USING (true);
CREATE POLICY "Admin manage services" ON public.services 
    FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com');

-- 3. Настройки сайта & SEO: чтение доступно всем, изменения только администраторам
CREATE POLICY "Public read site_settings" ON public.site_settings 
    FOR SELECT USING (true);
CREATE POLICY "Admin manage site_settings" ON public.site_settings 
    FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com');

-- 4. Заявки (Бронирования): создание разрешено клиентам (INSERT). Просмотр всех заявок — только администратору
CREATE POLICY "Public insert bookings" ON public.bookings 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage bookings" ON public.bookings 
    FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com');

-- 5. Журнал аудита: доступен только администраторам
CREATE POLICY "Admin manage audit_logs" ON public.audit_logs 
    FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'thunderwoltt@gmail.com');

-- 7. Начальные данные (Seed Data)
INSERT INTO public.site_settings (id, hero_title, hero_subtitle, hero_badge, announcement_banner, announcement_active, promo_code, promo_discount_percent, address, phone, work_hours, telegram, seo_title, seo_description, seo_keywords)
VALUES (
    1,
    'Искусство точной стрижки и безупречного стиля',
    'Мастера с многолетним опытом, традиционное бритье опасной бритвой, премиальная косметика и атмосфера настоящего мужского клуба.',
    'Премиум сервис & Мужские традиции',
    '🔥 Скидка 20% на первый визит по промокоду FIRST20 при бронировании на сайте!',
    true,
    'FIRST20',
    20,
    'г. Москва, ул. Большая Дмитровка, д. 12',
    '+7 (495) 123-45-67',
    '10:00 — 22:00 ежедневно',
    '@blade_barbershop',
    'BLADE & CO. | Премиум Барбершоп в центре Москвы',
    'Классические мужские стрижки, моделирование бороды и бритье опасной бритвой. Онлайн-запись 24/7.',
    'барбершоп, мужская стрижка, борода, бритье, Москва, Большая Дмитровка'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.barbers (id, name, role, avatar_url, experience, rating, bio, active)
VALUES 
    ('barber-1', 'Александр "Клык" Романов', 'Шеф-барбер', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', '10 лет опыта', 4.98, 'Специалист по классическим британским стрижкам и королевскому бритью опасной бритвой.', true),
    ('barber-2', 'Максим Воронов', 'Топ-барбер', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '6 лет опыта', 4.95, 'Мастер фейдов любой сложности, моделирования бороды и текстурных укладок.', true),
    ('barber-3', 'Денис Громов', 'Барбер-стилист', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', '4 года опыта', 4.92, 'Современные тренды, уход за кожей головы и индивидуальный подбор стиля.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, title, description, price, duration_min, category, popular, active)
VALUES 
    ('service-1', 'Классическая мужская стрижка', 'Мытье головы, индивидуальная стрижка ножницами и машинкой, укладка премиум стайлингом.', 2500, 50, 'hair', true, true),
    ('service-2', 'Моделирование бороды и усов', 'Четкие контуры, распаривание горячим полотенцем, уход специальными маслами.', 1800, 40, 'beard', true, true),
    ('service-3', 'Комплекс "Шеф": Стрижка + Борода', 'Полное преображение: стрижка волос, моделирование бороды и бритье шейной зоны.', 3800, 75, 'combo', true, true),
    ('service-4', 'Королевское бритье опасной бритвой', 'Традиционный ритуал с распаривающими полотенцами, пеной из барсучьего помазка и холодным компрессом.', 2200, 45, 'beard', false, true),
    ('service-5', 'Премиум СПА-уход для лица и кожи', 'Очищающая маска с черным углем, массаж лица и увлажняющая сыворотка.', 1600, 30, 'spa', false, true),
    ('service-6', 'Камуфляж седины волос и бороды', 'Естественное тонирование седых волос без эффекта окрашенности за 15 минут.', 1500, 30, 'hair', false, true)
ON CONFLICT (id) DO NOTHING;
