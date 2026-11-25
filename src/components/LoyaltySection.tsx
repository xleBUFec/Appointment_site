import React from 'react';
import { Gift, Sparkles, CreditCard, Award, Coffee, ShieldCheck, ArrowRight, UserPlus, Crown, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface LoyaltySectionProps {
  currentUser?: UserProfile;
  onOpenAuth: () => void;
}

export const LoyaltySection: React.FC<LoyaltySectionProps> = ({ currentUser, onOpenAuth }) => {
  const isGuest = !currentUser || currentUser.id === 'guest' || !currentUser.email;

  const tiers = [
    { name: 'Bronze', cashback: '5%', threshold: 'Начальный', color: 'text-amber-500' },
    { name: 'Silver', cashback: '7%', threshold: 'от 50 000 ₸', color: 'text-slate-300' },
    { name: 'Gold Elite', cashback: '10%', threshold: 'от 120 000 ₸', color: 'text-[#e4ba43]' },
    { name: 'Diamond VIP', cashback: '15%', threshold: 'от 250 000 ₸', color: 'text-[#8ab4f8]' },
  ];

  return (
    <section className="py-20 border-t border-[#21262d] bg-gradient-to-b from-[#0b0e14] via-[#11151c] to-[#0b0e14] relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c59b27]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Программа лояльности & Клубные привилегии</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f8f5ee] leading-tight">
              Клуб джентльменов <br />
              <span className="text-gradient-gold">BLADE & CO. Priority</span>
            </h2>

            <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
              Мы ценим постоянство наших гостей. Присоединяйтесь к закрытой программе лояльности в Алматы, накапливайте бонусы с каждого визита и пользуйтесь эксклюзивными клубными привилегиями.
            </p>

            {/* Benefit Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">1 500 ₸ бонусов на старт</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">Начисляем сразу при регистрации (1 бонус = 1 тенге)</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">До 15% Кэшбэк бонусами</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">Копите баллы и оплачивайте до 50% чека на любые услуги</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">Lounge Бар & Напитки</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">Зерновой эспрессо, чай и выдержанный виски для всех членов клуба</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 border border-[#c59b27]/30 text-[#c59b27] flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#f8f5ee]">Приоритетная бронь</h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">Быстрое бронирование топовых вечерних окон в пятницу и субботу</p>
                </div>
              </div>
            </div>

            {/* Loyalty Tiers strip */}
            <div className="p-3.5 rounded-2xl bg-[#161b22]/50 border border-[#21262d]">
              <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider block mb-2">
                Уровни привилегий клуба:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tiers.map(t => (
                  <div key={t.name} className="p-2 rounded-xl bg-[#0e1117] border border-[#21262d] text-center">
                    <div className={`text-xs font-bold ${t.color}`}>{t.name}</div>
                    <div className="text-xs font-semibold text-[#f8f5ee]">{t.cashback} кэшбэк</div>
                    <div className="text-[9px] text-[#8b949e]">{t.threshold}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            {isGuest ? (
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onOpenAuth}
                  className="gold-button text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Создать аккаунт и получить 1 500 ₸ бонусов</span>
                </button>
                <span className="text-xs text-[#8b949e]">Быстрая регистрация по телефону</span>
              </div>
            ) : (
              <div className="pt-2 text-xs text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Вы являетесь активным участником клуба. Ваш бонусный баланс: {currentUser?.bonus_points || 1500} ₸</span>
              </div>
            )}
          </div>

          {/* Right Gold Card Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl p-7 bg-gradient-to-br from-[#262013] via-[#181510] to-[#0c0d10] border border-[#c59b27]/50 shadow-2xl shadow-[#c59b27]/15 relative overflow-hidden transform hover:-rotate-1 hover:scale-105 transition-all duration-300">
              
              {/* Card sheen highlight */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c59b27]/20 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#c59b27] text-black flex items-center justify-center font-bold font-serif shadow-md">
                    B
                  </div>
                  <span className="font-serif font-bold text-sm tracking-widest text-[#f8f5ee] uppercase">
                    BLADE & CO.
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c59b27] border border-[#c59b27]/40 px-2.5 py-1 rounded-full">
                  BLACK VIP
                </span>
              </div>

              {/* Card chip & Number */}
              <div className="space-y-4 mb-8">
                <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-200 to-amber-400 opacity-80 shadow-sm" />
                <div className="font-mono text-sm tracking-[0.25em] text-[#f8f5ee]/80">
                  •••• •••• •••• 8842
                </div>
              </div>

              {/* Bottom card info */}
              <div className="flex items-end justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8b949e] block">Владелец карты</span>
                  <span className="font-semibold text-xs text-[#f8f5ee]">
                    {currentUser && currentUser.id !== 'guest' ? currentUser.name : 'GENTLEMAN MEMBER'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#8b949e] block">Бонусный счет</span>
                  <span className="font-mono font-bold text-sm text-[#c59b27]">
                    {currentUser && currentUser.id !== 'guest' ? `${currentUser.bonus_points || 1500} ₸` : '1 500 ₸'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
