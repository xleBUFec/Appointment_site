import React, { useState, useEffect, useRef } from 'react';
import { Barber, Service, Booking } from './types';
import { fetchBarbers, fetchServices, createBooking, getSavedSupabaseConfig } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceSelector } from './components/ServiceSelector';
import { BarberSelector } from './components/BarberSelector';
import { DateTimeSelector } from './components/DateTimeSelector';
import { BookingForm } from './components/BookingForm';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { AdminBookingsView } from './components/AdminBookingsView';
import { Scissors, CheckCircle, MapPin, Phone, Clock, Globe, Send, ShieldCheck } from 'lucide-react';

export function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Booking Flow State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoadingInitial(true);
    const { url, anonKey } = getSavedSupabaseConfig();
    setIsSupabaseConnected(Boolean(url && anonKey));

    const [barbersRes, servicesRes] = await Promise.all([
      fetchBarbers(),
      fetchServices(),
    ]);

    setBarbers(barbersRes.data);
    setServices(servicesRes.data);
    setLoadingInitial(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const scrollToBooking = () => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSubmit = async (formData: {
    client_name: string;
    client_phone: string;
    client_email: string;
    comment: string;
  }) => {
    if (!selectedService) return;
    setIsSubmitting(true);

    try {
      const barberName = selectedBarber ? selectedBarber.name : 'Любой свободный мастер';
      const barberId = selectedBarber ? selectedBarber.id : 'any';

      const res = await createBooking({
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        client_email: formData.client_email,
        service_id: selectedService.id,
        barber_id: barberId,
        service_name: selectedService.title,
        barber_name: barberName,
        price: selectedService.price,
        booking_date: selectedDate,
        booking_time: selectedTime,
        comment: formData.comment,
        status: 'confirmed',
      });

      setConfirmedBooking(res.booking);
      // Reset form
      setStep(1);
    } catch (e) {
      console.error('Booking submission failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Услуга' },
    { num: 2, label: 'Мастер' },
    { num: 3, label: 'Дата и время' },
    { num: 4, label: 'Контакты' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-[#f8f5ee]">
      
      {/* Navigation */}
      <Navbar
        isSupabaseConnected={isSupabaseConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToBooking={scrollToBooking}
      />

      {/* Hero Section */}
      <Hero onStartBooking={scrollToBooking} />

      {/* Main Booking Container */}
      <main ref={bookingSectionRef} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Section title */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#c59b27] font-semibold">
            Онлайн бронирование
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f8f5ee] mt-1">
            Запись на стрижку в 4 простых шага
          </h2>
          <p className="text-xs sm:text-sm text-[#8b949e] mt-2 max-w-md mx-auto">
            Выберите желаемую услугу, предпочтительного барбера и удобное время визита
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="grid grid-cols-4 gap-2">
            {stepsHeader.map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <button
                  key={s.num}
                  disabled={!isPast && !isActive}
                  onClick={() => setStep(s.num as any)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                    isActive
                      ? 'border-[#c59b27] bg-[#161b22] text-[#f8f5ee]'
                      : isPast
                      ? 'border-[#21262d] bg-[#161b22]/50 text-[#c59b27] hover:border-[#38414e]'
                      : 'border-transparent text-[#484f58] cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#c59b27] text-black shadow-md shadow-[#c59b27]/30'
                        : isPast
                        ? 'bg-[#21262d] text-[#c59b27]'
                        : 'bg-[#161b22] text-[#484f58]'
                    }`}
                  >
                    {isPast ? <CheckCircle className="w-4 h-4 stroke-[2.5]" /> : s.num}
                  </div>
                  <span className="text-[11px] font-medium hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Panel */}
        <div className="bg-[#11151c] border border-[#21262d] rounded-3xl p-6 sm:p-8 shadow-2xl">
          {loadingInitial ? (
            <div className="text-center py-20 text-[#8b949e]">
              Загрузка меню услуг и мастеров...
            </div>
          ) : (
            <>
              {step === 1 && (
                <ServiceSelector
                  services={services}
                  selectedService={selectedService}
                  onSelect={(service) => setSelectedService(service)}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <BarberSelector
                  barbers={barbers}
                  selectedBarber={selectedBarber}
                  onSelect={(barber) => setSelectedBarber(barber)}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <DateTimeSelector
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectDate={(date) => setSelectedDate(date)}
                  onSelectTime={(time) => setSelectedTime(time)}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}

              {step === 4 && selectedService && (
                <BookingForm
                  selectedService={selectedService}
                  selectedBarber={selectedBarber}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  isSupabaseConnected={isSupabaseConnected}
                  onSubmit={handleBookingSubmit}
                  onBack={() => setStep(3)}
                  isLoading={isSubmitting}
                />
              )}
            </>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#0e1117] border-t border-[#21262d] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#c59b27]" />
              <span className="font-serif font-bold text-lg text-[#f8f5ee]">BLADE & CO.</span>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Барбершоп премиум-класса с традициями классического бритья и стрижки для современных джентльменов.
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-[#f8f5ee] mb-3">Локация</h5>
            <div className="text-xs text-[#8b949e] space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>г. Москва, ул. Большая Дмитровка, 12</span>
              </p>
              <p>Метро: Театральная / Охотный ряд</p>
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-[#f8f5ee] mb-3">Режим работы</h5>
            <div className="text-xs text-[#8b949e] space-y-1.5">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Понедельник — Воскресенье</span>
              </p>
              <p>С 10:00 до 22:00 без выходных</p>
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-[#f8f5ee] mb-3">Связь & Соцсети</h5>
            <div className="text-xs text-[#8b949e] space-y-1.5">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>+7 (495) 123-45-67</span>
              </p>
              <p className="flex items-center gap-2 text-[#c59b27]">
                <Send className="w-3.5 h-3.5" />
                <span>Telegram: @blade_barbershop</span>
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-[#21262d] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8b949e]">
          <div>© {new Date().getFullYear()} BLADE & CO. Все права защищены.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="cursor-pointer hover:text-[#f8f5ee]" onClick={() => setIsSettingsOpen(true)}>
              Настройка базы Supabase
            </span>
            <span className="cursor-pointer hover:text-[#f8f5ee]" onClick={() => setIsAdminOpen(true)}>
              Журнал записей
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {confirmedBooking && (
        <BookingSuccessModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onViewBookings={() => {
            setConfirmedBooking(null);
            setIsAdminOpen(true);
          }}
        />
      )}

      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={loadData}
      />

      <AdminBookingsView
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
      />

    </div>
  );
}

export default App;
