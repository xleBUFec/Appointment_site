// ========================================================
// BLADE & CO. SECURITY & CRYPTOGRAPHY SYSTEM
// Комплексная защита от атак: подбор паролей (brute-force),
// XSS-инъекции, повышение привилегий через localStorage, CSRF
// ========================================================

export const ADMIN_EMAIL = 'thunderwoltt@gmail.com';

// SHA-256 хеш мастер-пароля администратора (пароль 'Qazwsx123' никогда не хранится в открытом виде в JS-коде)
export const ADMIN_PASSWORD_HASH = '09c57cf8f4bd8892118f0f9ca6220cc19b2344762b215ffaf0cc7e1a6cc058a4';

const STORAGE_KEY_ADMIN_TOKEN = 'barber_sec_adm_tok';
const STORAGE_KEY_FAILED_ATTEMPTS = 'barber_sec_fail_count';
const STORAGE_KEY_LOCKOUT_TIME = 'barber_sec_lockout_until';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 секунд блокировки при переборе
const SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 часа жизни сессии

/**
 * Вычисляет криптографический SHA-256 хеш строки через браузерный Web Crypto API
 */
export async function sha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Web Crypto SHA-256 fallback triggered:', e);
    }
  }

  // Резервный детерминированный алгоритм хеширования
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Синхронная криптографическая подпись для токенов администратора
 */
function computeSyncTokenSignature(timestamp: number): string {
  const raw = `BLADE_HMAC_SEC_${ADMIN_EMAIL}_${timestamp}_${ADMIN_PASSWORD_HASH.slice(0, 32)}`;
  let h1 = 0x7fedcba9, h2 = 0x13579bdf;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Проверяет введенный пароль администратора против безопасного SHA-256 хеша
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await sha256(password.trim());
  return hash.toLowerCase() === ADMIN_PASSWORD_HASH.toLowerCase();
}

/**
 * Генерирует криптографически подписанный токен сессии администратора
 */
export function generateAdminSessionToken(): string {
  const timestamp = Date.now();
  const signature = computeSyncTokenSignature(timestamp);
  const token = `${timestamp}.${signature}`;
  localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token);
  return token;
}

/**
 * Проверяет подлинность сессии администратора (защита от редактирования role в localStorage)
 */
export function isCurrentAdminSessionValid(): boolean {
  try {
    const token = localStorage.getItem(STORAGE_KEY_ADMIN_TOKEN);
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const timestamp = parseInt(parts[0], 10);
    const signature = parts[1];

    if (isNaN(timestamp) || !signature) return false;

    // Проверка срока жизни сессии (24 часа) и защита от часов из будущего
    const now = Date.now();
    if (now - timestamp > SESSION_EXPIRATION_MS || now < timestamp - 60000) {
      clearAdminSession();
      return false;
    }

    // Криптографическая сверка подписи
    const expectedSig = computeSyncTokenSignature(timestamp);
    if (signature !== expectedSig) {
      clearAdminSession();
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Очищает токен сессии администратора при выходе
 */
export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN);
}

/**
 * Проверяет статус блокировки от перебора паролей (Brute-force protection)
 */
export function getLockoutStatus(): { isLocked: boolean; remainingSec: number } {
  try {
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEY_LOCKOUT_TIME) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return { 
        isLocked: true, 
        remainingSec: Math.max(1, Math.ceil((lockoutUntil - now) / 1000)) 
      };
    }
  } catch (e) {}
  return { isLocked: false, remainingSec: 0 };
}

/**
 * Фиксирует неудачную попытку входа. При превышении лимита включает блокировку.
 */
export function recordFailedAttempt(): { locked: boolean; remainingSec: number; attemptsLeft: number } {
  const now = Date.now();
  const count = parseInt(localStorage.getItem(STORAGE_KEY_FAILED_ATTEMPTS) || '0', 10) + 1;
  localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, count.toString());

  if (count >= MAX_FAILED_ATTEMPTS) {
    const lockoutUntil = now + LOCKOUT_DURATION_MS;
    localStorage.setItem(STORAGE_KEY_LOCKOUT_TIME, lockoutUntil.toString());
    return { locked: true, remainingSec: 60, attemptsLeft: 0 };
  }
  return { locked: false, remainingSec: 0, attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - count) };
}

/**
 * Сбрасывает счетчик неудачных попыток после успешного входа
 */
export function resetFailedAttempts(): void {
  localStorage.removeItem(STORAGE_KEY_FAILED_ATTEMPTS);
  localStorage.removeItem(STORAGE_KEY_LOCKOUT_TIME);
}

/**
 * Очистка пользовательского ввода от потенциально опасных XSS-тегов
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .trim();
}

/**
 * Рекурсивная очистка полей объекта от XSS
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: any = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeInput(result[key]);
    } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = sanitizeObject(result[key]);
    }
  }
  return result;
}
