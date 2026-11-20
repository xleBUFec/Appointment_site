import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Scissors
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginUser, registerUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.success && res.user) {
        setSuccessMsg(`Добро пожаловать, ${res.user.name || res.user.email}!`);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
          resetForm();
        }, 600);
      } else {
        setError(res.message || 'Ошибка входа. Проверьте введенные данные.');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await registerUser({
        name,
        phone,
        email,
        password,
      });

      if (res.success && res.user) {
        setSuccessMsg(`Аккаунт успешно создан! Добро пожаловать, ${res.user.name}!`);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
          resetForm();
        }, 700);
      } else {
        setError(res.message || 'Ошибка при регистрации');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header with decorative glow */}
        <div className="px-6 pt-6 pb-4 border-b border-[#21262d] bg-gradient-to-b from-[#1f242c] to-[#161b22] relative">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c59b27] to-[#7a5c13] flex items-center justify-center shadow-lg shadow-[#c59b27]/20 border border-[#fce082]/30">
              <Scissors className="w-5 h-5 text-black transform -rotate-45" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#f8f5ee] tracking-wide uppercase">
                BLADE & CO.
              </h3>
              <p className="text-xs text-[#8b949e]">
                Личный кабинет & Авторизация
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-[#0e1117] rounded-xl border border-[#21262d]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-[#c59b27] text-black shadow-md'
                  : 'text-[#8b949e] hover:text-[#f8f5ee]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-[#c59b27] text-black shadow-md'
                  : 'text-[#8b949e] hover:text-[#f8f5ee]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Регистрация</span>
            </button>
          </div>
        </div>

        {/* Content & Forms */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          
          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ваш пароль"
                    className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f8f5ee]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-button text-black font-bold text-xs py-3 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Выполняется вход...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Войти в аккаунт</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#8b949e] pt-2">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-[#c59b27] hover:underline font-semibold"
                >
                  Зарегистрироваться
                </button>
              </p>
            </form>
          ) : (
            /* REGISTER FORM (STRICTLY CLIENT) */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Имя и Фамилия <span className="text-[#c59b27]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Константин Константинопольский"
                    className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Телефон <span className="text-[#c59b27]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 999 123-45-67"
                    className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Email <span className="text-[#c59b27]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Пароль <span className="text-[#c59b27]">*</span> (мин. 6 символов)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Надежный пароль"
                    className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f8f5ee] placeholder-[#484f58] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f8f5ee]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-button text-black font-bold text-xs py-3 rounded-xl shadow-lg mt-3 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Регистрация...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Зарегистрироваться как клиент</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#8b949e] pt-1">
                Уже есть учетная запись?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-[#c59b27] hover:underline font-semibold"
                >
                  Войти
                </button>
              </p>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
