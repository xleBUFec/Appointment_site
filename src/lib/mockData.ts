import { Barber, Service, SiteSettings, UserProfile, AuditLog, RegisteredUser } from '../types';
import { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } from './security';

export interface ServiceAddon {
  id: string;
  title: string;
  price: number;
  duration_min: number;
  description: string;
}

export const POPULAR_ADDONS: ServiceAddon[] = [
  {
    id: 'addon-1',
    title: 'Релакс-массаж головы с тоником',
    price: 1500,
    duration_min: 10,
    description: 'Улучшает микроциркуляцию, снимает стресс и тонизирует кожу головы',
  },
  {
    id: 'addon-2',
    title: 'Гидрогелевые патчи под глаза',
    price: 1000,
    duration_min: 5,
    description: 'Снимают следы усталости и отеки перед деловой встречей или свиданием',
  },
  {
    id: 'addon-3',
    title: 'Черная маска-детокс для Т-зоны',
    price: 1500,
    duration_min: 10,
    description: 'Глубокое очищение пор носа от токсинов и черных точек',
  },
  {
    id: 'addon-4',
    title: 'Премиум укладка матовой глиной Morgan’s',
    price: 1000,
    duration_min: 5,
    description: 'Надежная фиксация и благородный матовый финиш без блеска',
  },
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  hero_title: 'Искусство точной стрижки и безупречного стиля',
  hero_subtitle: 'Мастера с многолетним опытом, традиционное бритье опасной бритвой, премиальная косметика и атмосфера настоящего мужского клуба.',
  hero_badge: 'Премиум сервис & Мужские традиции',
  announcement_banner: '🔥 Скидка 20% на первый визит по промокоду FIRST20 при бронировании на сайте!',
  announcement_active: true,
  promo_code: 'FIRST20',
  promo_discount_percent: 20,
  address: 'г. Алматы, пр. Достык, д. 42',
  phone: '+7 (777) 123-45-67',
  work_hours: '10:00 — 22:00 ежедневно',
  telegram: '@blade_almaty',
  seo_title: 'BLADE & CO. | Премиум Барбершоп в Алматы (Достык)',
  seo_description: 'Классические мужские стрижки, моделирование бороды и королевское бритье в Алматы. Оплата Kaspi QR. Онлайн-запись 24/7.',
  seo_keywords: 'барбершоп алматы, мужская стрижка алматы, борода алматы, kaspi qr, достык, стрижка алматы',
};

export const DEFAULT_ADMIN_EMAIL = ADMIN_EMAIL;

export const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Гость',
  email: '',
  phone: '',
  role: 'client',
  bonus_points: 0,
};

export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'user-admin-thunderwoltt',
    name: 'Администратор (thunderwoltt)',
    phone: '+7 777 999-88-77',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD_HASH,
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-master-1',
    name: 'Александр "Клык" Романов',
    phone: '+7 777 111-22-33',
    email: 'romanov@blade-co.kz',
    password: 'password123',
    role: 'master',
    barber_id: 'barber-1',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-client-1',
    name: 'Алихан Сатпаев',
    phone: '+7 777 123-45-67',
    email: 'alikhan@example.kz',
    password: 'password123',
    role: 'client',
    bonus_points: 2500,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    created_at: new Date().toISOString(),
  },
];

export const DEMO_USERS: UserProfile[] = INITIAL_REGISTERED_USERS.map(({ password, ...rest }) => rest);

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    user_name: 'thunderwoltt (Главный Админ)',
    user_role: 'admin',
    action: 'Обновление цен',
    details: 'Услуга «Комплекс Шеф» установлена цена 12 000 ₸',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    user_name: 'Маркетолог',
    user_role: 'admin',
    action: 'Запуск промо-акции',
    details: 'Включен верхний баннер с промокодом FIRST20 (-20%)',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    user_name: 'Александр "Клык"',
    user_role: 'master',
    action: 'Завершение визита',
    details: 'Запись #bk-7821 выполнена успешно (Оплата Kaspi QR)',
  },
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-1',
    name: 'Александр "Клык" Романов',
    role: 'Шеф-барбер',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    experience: '10 лет опыта',
    rating: 4.98,
    bio: 'Специалист по классическим британским стрижкам и королевскому бритью опасной бритвой.',
    active: true,
  },
  {
    id: 'barber-2',
    name: 'Максим Воронов',
    role: 'Топ-барбер',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    experience: '6 лет опыта',
    rating: 4.95,
    bio: 'Мастер идеальных фейдов любой сложности, моделирования бороды и текстурных укладок.',
    active: true,
  },
  {
    id: 'barber-3',
    name: 'Денис Громов',
    role: 'Барбер-стилист',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    experience: '4 года опыта',
    rating: 4.92,
    bio: 'Современные тренды, эстетика мужского стиля и комплексный уход за волосами.',
    active: true,
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'service-1',
    title: 'Классическая мужская стрижка',
    description: 'Мытье головы, персональная стрижка ножницами и машинкой, укладка премиум стайлингом.',
    price: 8000,
    duration_min: 50,
    category: 'hair',
    popular: true,
    active: true,
  },
  {
    id: 'service-2',
    title: 'Моделирование бороды и усов',
    description: 'Четкие контуры, распаривание горячим компрессом, уход органическими маслами.',
    price: 6000,
    duration_min: 40,
    category: 'beard',
    popular: true,
    active: true,
  },
  {
    id: 'service-3',
    title: 'Комплекс "Шеф": Стрижка + Борода',
    description: 'Полное преображение: стрижка волос, моделирование бороды и бритье шейной зоны опасным лезвием.',
    price: 12000,
    duration_min: 75,
    category: 'combo',
    popular: true,
    active: true,
  },
  {
    id: 'service-4',
    title: 'Королевское бритье опасной бритвой',
    description: 'Традиционный ритуал: распаривающие полотенца, пена из барсучьего помазка и холодный компресс.',
    price: 7000,
    duration_min: 45,
    category: 'beard',
    popular: false,
    active: true,
  },
  {
    id: 'service-5',
    title: 'Премиум СПА-уход для лица',
    description: 'Очищающая маска с вулканической глиной, распаривание, массаж лица и сыворотка.',
    price: 6000,
    duration_min: 30,
    category: 'spa',
    popular: false,
    active: true,
  },
  {
    id: 'service-6',
    title: 'Камуфляж седины волос и бороды',
    description: 'Естественное тонирование седых волос без эффекта окрашенности за 15 минут.',
    price: 5000,
    duration_min: 30,
    category: 'hair',
    popular: false,
    active: true,
  },
];
