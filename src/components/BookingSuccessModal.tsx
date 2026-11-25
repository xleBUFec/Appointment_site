import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Scissors, 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Send, 
  ExternalLink,
  QrCode,
  Sparkles,
  Heart
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [showKaspiModal, setShowKaspiModal] = useState(booking.payment_method === 'kaspi');

  useEffect(() => {
    // Конфетти салют при подтверждении записи
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c59b27', '#e4ba43', '#fce082', '#ffffff'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const formattedDate = new Date(booking.booking_date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  // Экспорт в Google Календарь
  const getGoogleCalendarUrl = () => {
    const [hours, mins] = (booking.booking_time || '12:00').split(':').map(Number);
    const startDate = new Date(booking.booking_date);
    startDate.setHours(hours, mins, 0, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 час по умолчанию

    const formatIsoUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const startStr = formatIsoUtc(startDate);
    const endStr = formatIsoUtc(endDate);

    const title = encodeURIComponent(`Стрижка в BLADE & CO.: ${booking.service_name}`);
    const details = encodeURIComponent(
      `Мастер: ${booking.barber_name}\nУслуга: ${booking.service_name}\nСтоимость: ${booking.price.toLocaleString('ru-RU')} ₸\nНомер брони: #${booking.id}\nАдрес: г. Алматы, пр. Достык, д. 42`
    );
    const location = encodeURIComponent('г. Алматы, пр. Достык, д. 42');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  // Скачивание .ics файла (для iPhone, Mac, Android, Outlook)
  const downloadIcsFile = () => {
    const [hours, mins] = (booking.booking_time || '12:00').split(':').map(Number);
    const startDate = new Date(booking.booking_date);
    startDate.setHours(hours, mins, 0, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatIsoUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BLADE & CO.//Barbershop Booking//KZ',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@blade-co.kz`,
      `DTSTAMP:${formatIsoUtc(new Date())}`,
      `DTSTART:${formatIsoUtc(startDate)}`,
      `DTEND:${formatIsoUtc(endDate)}`,
      `SUMMARY:BLADE & CO.: ${booking.service_name}`,
      `DESCRIPTION:Мастер: ${booking.barber_name}\\nУслуга: ${booking.service_name}\\nСтоимость: ${booking.price} ₸\\nНомер записи: #${booking.id}`,
      'LOCATION:г. Алматы, пр. Достык, д. 42',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `BLADE_CO_Booking_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Копирование информации о визите
  const copySummary = () => {
    const text = `Запись в барбершоп BLADE & CO.:\nДата: ${formattedDate} в ${booking.booking_time}\nМастер: ${booking.barber_name}\nУслуга: ${booking.service_name} (${booking.price.toLocaleString('ru-RU')} ₸)\nАдрес: г. Алматы, пр. Достык, д. 42\nНомер брони: #${booking.id}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTelegramUrl = `https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&text=${encodeURIComponent(`Записался в барбершоп BLADE & CO. в Алматы на ${booking.booking_date} в ${booking.booking_time} к мастеру ${booking.barber_name}!`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#161b22] border border-[#c59b27]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#c59b27]/20 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8b949e] hover:text-[#f8f5ee] p-1.5 rounded-lg hover:bg-[#21262d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#c59b27] to-[#e4ba43] text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#c59b27]/30">
            <CheckCircle className="w-9 h-9 stroke-[2.2]" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-[#c59b27] font-semibold">
            Бронирование подтверждено
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f8f5ee] mt-1">
            Ждем вас в BLADE & CO.
          </h2>
          <p className="text-xs text-[#8b949e] mt-1">
            Номер брони: <span className="font-mono text-[#f8f5ee] font-bold">{booking.id}</span>
          </p>
        </div>

        {/* Kaspi QR Quick Pay Banner */}
        {booking.payment_method === 'kaspi' && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#e11c38]/15 via-[#e11c38]/10 to-[#161b22] border border-[#e11c38]/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#e11c38] text-white flex items-center justify-center shadow-md shadow-[#e11c38]/30 flex-shrink-0 font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#f8f5ee]">Kaspi QR активен</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#e11c38] text-white font-bold">Kaspi Pay</span>
                </div>
                <p className="text-[11px] text-[#8b949e]">
                  Сумма к оплате: <strong className="text-[#f8f5ee]">{booking.price.toLocaleString('ru-RU')} ₸</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowKaspiModal(!showKaspiModal)}
              className="px-3 py-1.5 rounded-lg bg-[#e11c38] hover:bg-[#c7152e] text-white text-xs font-bold transition-all shadow-md flex-shrink-0"
            >
              {showKaspiModal ? 'Скрыть QR' : 'Показать QR'}
            </button>
          </div>
        )}

        {/* Expanded Simulated Kaspi QR Card */}
        {showKaspiModal && (
          <div className="mb-5 p-5 rounded-2xl bg-[#0e1117] border border-[#e11c38]/30 text-center animate-in zoom-in-95 duration-200">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-3">
              {/* Stylized QR representation */}
              <div className="w-36 h-36 border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black rounded-sm" />
                  <div className="w-8 h-8 bg-[#e11c38] rounded-sm" />
                </div>
                <div className="text-center font-bold text-[10px] text-black">
                  KASPI QR
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black rounded-sm" />
                  <div className="w-8 h-8 bg-black rounded-sm" />
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-[#f8f5ee]">
              {booking.price.toLocaleString('ru-RU')} ₸
            </div>
            <p className="text-xs text-[#8b949e] mt-1">
              Отсканируйте камерой Kaspi в приложении или оплатите при посещении
            </p>
          </div>
        )}

        {/* Ticket receipt card */}
        <div className="bg-[#0e1117] border border-[#21262d] rounded-2xl p-5 mb-5 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#c59b27]" />
              <span className="font-semibold text-sm text-[#f8f5ee]">{booking.service_name}</span>
            </div>
            <span className="font-bold text-sm text-[#c59b27]">{booking.price.toLocaleString('ru-RU')} ₸</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#8b949e] block mb-0.5">Барбер</span>
              <span className="font-medium text-[#f8f5ee]">{booking.barber_name}</span>
            </div>
            <div>
              <span className="text-[#8b949e] block mb-0.5">Клиент</span>
              <span className="font-medium text-[#f8f5ee]">{booking.client_name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#21262d]">
            <div className="flex items-center gap-1.5 text-[#f8f5ee]">
              <Calendar className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#f8f5ee]">
              <Clock className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0" />
              <span>{booking.booking_time}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs text-[#8b949e]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0" />
              <span>Алматы, пр. Достык, 42</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://2gis.kz/almaty"
                target="_blank"
                rel="noreferrer"
                className="text-[#29b6f6] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>2GIS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href="https://yandex.kz/maps/?text=Алматы+Достык+42"
                target="_blank"
                rel="noreferrer"
                className="text-[#c59b27] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Яндекс</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Action Badges (Calendar & Share) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0e1117] border border-[#21262d] hover:border-[#c59b27]/60 hover:bg-[#1a202c] transition-all text-center group"
          >
            <Calendar className="w-4 h-4 text-[#c59b27] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-[#f8f5ee]">Google Календарь</span>
          </a>

          <button
            onClick={downloadIcsFile}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0e1117] border border-[#21262d] hover:border-[#c59b27]/60 hover:bg-[#1a202c] transition-all text-center group cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#c59b27] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-[#f8f5ee]">Скачать .ICS</span>
          </button>

          <a
            href={shareTelegramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0e1117] border border-[#21262d] hover:border-[#c59b27]/60 hover:bg-[#1a202c] transition-all text-center group"
          >
            <Send className="w-4 h-4 text-[#29b6f6] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-[#f8f5ee]">В Telegram</span>
          </a>

          <button
            onClick={copySummary}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0e1117] border border-[#21262d] hover:border-[#c59b27]/60 hover:bg-[#1a202c] transition-all text-center group cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400 mb-1" />
            ) : (
              <Copy className="w-4 h-4 text-[#c59b27] mb-1 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-semibold text-[#f8f5ee]">
              {copied ? 'Скопировано!' : 'Копировать'}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onViewBookings();
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-[#21262d] text-xs sm:text-sm font-semibold text-[#f8f5ee] hover:bg-[#21262d] transition-colors text-center"
          >
            Мои записи
          </button>
          <button
            onClick={onClose}
            className="flex-1 gold-button py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-black text-center shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Отлично, закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
