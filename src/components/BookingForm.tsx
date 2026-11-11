import React, { useState } from 'react';
import { Service, Barber } from '../types';
import { ShieldCheck, User, Phone, Mail, MessageSquare, Clock, Calendar, Check, Loader2, Database } from 'lucide-react';

interface BookingFormProps {
  selectedService: Service;
  selectedBarber: Barber | null;
  selectedDate: string;
  selectedTime: string;
  isSupabaseConnected: boolean;
  onSubmit: (formData: {
    client_name: string;
    client_phone: string;
    client_email: string;
    comment: string;
  }) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTime,
  isSupabaseConnected,
  onSubmit,
  onBack,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7 ');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Format Russian phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+7')) {
      val = '+7 ';
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }
    if (phone.replace(/\D/g, '').length < 11) {
      setError('Пожалуйста, укажите полный номер телефона');
      return;
    }
    setError('');
    await onSubmit({
      client_name: name.trim(),
      client_phone: phone.trim(),
      client_email: email.trim(),
      comment: comment.trim(),
    });
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact fields (left column) */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="font-serif text-xl font-bold text-[#f8f5ee]">
            Контактные данные
          </h3>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Ваше имя <span className="text-[#c59b27]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Петров"
                className="w-full bg-[#161b22] border border-[#21262d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Номер телефона <span className="text-[#c59b27]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 999 123-45-67"
                className="w-full bg-[#161b22] border border-[#21262d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Электронная почта (для подтверждения)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@example.com"
                className="w-full bg-[#161b22] border border-[#21262d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Пожелания или комментарий к записи
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-[#8b949e]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например: желаемый стиль стрижки, чувствительная кожа или напиток к визиту"
                className="w-full bg-[#161b22] border border-[#21262d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f8f5ee] placeholder-[#484f58] focus:outline-none focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </div>

        </div>

        {/* Order Summary (right column) */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#21262d] sticky top-28 space-y-5">
            <h4 className="font-serif text-lg font-bold text-[#f8f5ee] border-b border-[#21262d] pb-3">
              Детали визита
            </h4>

            {/* Service row */}
            <div>
              <div className="text-xs text-[#8b949e] mb-1">Выбранная услуга</div>
              <div className="font-semibold text-base text-[#f8f5ee]">
                {selectedService.title}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8b949e] mt-1">
                <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Длительность: {selectedService.duration_min} минут</span>
              </div>
            </div>

            {/* Barber row */}
            <div>
              <div className="text-xs text-[#8b949e] mb-1">Мастер</div>
              <div className="font-semibold text-sm text-[#f8f5ee]">
                {selectedBarber ? selectedBarber.name : 'Любой свободный мастер'}
              </div>
              {selectedBarber && (
                <div className="text-xs text-[#c59b27]">
                  {selectedBarber.role}
                </div>
              )}
            </div>

            {/* Date & Time row */}
            <div>
              <div className="text-xs text-[#8b949e] mb-1">Дата и время записи</div>
              <div className="font-semibold text-sm text-[#f8f5ee] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c59b27]" />
                <span className="capitalize">{formattedDate} в {selectedTime}</span>
              </div>
            </div>

            {/* Supabase connection indicator */}
            <div className="pt-3 border-t border-[#21262d] text-xs flex items-center gap-2 text-[#8b949e]">
              <Database className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>
                {isSupabaseConnected ? 'Синхронизация с базой Supabase' : 'Сохранение в локальное хранилище'}
              </span>
            </div>

            {/* Total price */}
            <div className="pt-4 border-t border-[#21262d] flex items-baseline justify-between">
              <span className="text-sm font-semibold text-[#8b949e]">К оплате на месте:</span>
              <span className="text-2xl font-bold text-[#f8f5ee]">
                {selectedService.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-button text-black font-bold text-base py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Бронирование...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>Подтвердить запись</span>
                </>
              )}
            </button>

            <div className="text-center">
              <span className="text-[11px] text-[#8b949e] inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Оплата после визита картой или наличными
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Nav Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-[#21262d] text-sm text-[#8b949e] hover:text-[#f8f5ee] hover:bg-[#161b22] transition-colors"
        >
          Назад к выбору времени
        </button>
      </div>

    </form>
  );
};
