import React, { useEffect } from 'react';
import { Booking } from '../types';
import { CheckCircle, Calendar, Clock, MapPin, Scissors, X, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingSuccessModalProps {
  booking: Booking;
  onClose: () => void;
  onViewBookings: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  onClose,
  onViewBookings,
}) => {
  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c59b27', '#e4ba43', '#fce082', '#ffffff'],
      });
    } catch (e) {
      // ignore in test environments
    }
  }, []);

  const formattedDate = new Date(booking.booking_date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#161b22] border border-[#c59b27]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#c59b27]/20">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8b949e] hover:text-[#f8f5ee] p-1.5 rounded-lg hover:bg-[#21262d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#c59b27] to-[#e4ba43] text-black flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c59b27]/30">
            <CheckCircle className="w-9 h-9 stroke-[2.2]" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#c59b27] font-semibold">
            Бронирование подтверждено
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f8f5ee] mt-1">
            Ждем вас в BLADE & CO.
          </h2>
          <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
            Номер брони: <span className="font-mono text-[#f8f5ee] font-bold">{booking.id}</span>
          </p>
        </div>

        {/* Ticket receipt card */}
        <div className="bg-[#0e1117] border border-[#21262d] rounded-2xl p-5 mb-6 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#c59b27]" />
              <span className="font-semibold text-sm text-[#f8f5ee]">{booking.service_name}</span>
            </div>
            <span className="font-bold text-sm text-[#c59b27]">{booking.price.toLocaleString('ru-RU')} ₽</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#8b949e] block mb-0.5">Мастер</span>
              <span className="font-medium text-[#f8f5ee]">{booking.barber_name}</span>
            </div>
            <div>
              <span className="text-[#8b949e] block mb-0.5">Клиент</span>
              <span className="font-medium text-[#f8f5ee]">{booking.client_name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#21262d]">
            <div className="flex items-center gap-1.5 text-[#f8f5ee]">
              <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#f8f5ee]">
              <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>{booking.booking_time}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#21262d] flex items-center gap-2 text-xs text-[#8b949e]">
            <MapPin className="w-4 h-4 text-[#c59b27] flex-shrink-0" />
            <span>г. Москва, ул. Большая Дмитровка, д. 12</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onViewBookings();
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-[#21262d] text-sm font-semibold text-[#f8f5ee] hover:bg-[#21262d] transition-colors text-center"
          >
            Посмотреть в списке записей
          </button>
          <button
            onClick={onClose}
            className="flex-1 gold-button py-3 px-4 rounded-xl text-sm font-bold text-black text-center"
          >
            Отлично, спасибо!
          </button>
        </div>

      </div>
    </div>
  );
};
