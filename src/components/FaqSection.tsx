import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { SiteSettings } from '../types';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Нужно ли мыть голову перед визитом к барберу?',
    answer: 'Нет, в этом нет необходимости. Мытье головы с массажем и применением профессионального очищающего шампуня, а также повторное мытье после стрижки и укладка премиальным стайлингом уже включены в стоимость любой нашей стрижки.',
  },
  {
    id: 'faq-2',
    question: 'Как барбер помогает подобрать форму стрижки или бороды?',
    answer: 'Перед началом работы каждый мастер проводит индивидуальную консультацию: оценивает форму черепа и овала лица, направление роста и структуру волос, а также ваш повседневный стиль одежды и образ жизни, предлагая идеальное решение.',
  },
  {
    id: 'faq-3',
    question: 'Можно ли записаться на стрижку день в день?',
    answer: 'Да! При онлайн-бронировании выберите дату на сегодня и опцию «Любой свободный мастер» — система автоматически подберет ближайшее свободное окно у дежурного барбера.',
  },
  {
    id: 'faq-4',
    question: 'Какую косметику и средства для ухода вы используете?',
    answer: 'Мы работаем исключительно с сертифицированной мужской косметикой премиум-сегмента: Morgan’s Pomade (Великобритания), Reuzel (Нидерланды), Proraso (Италия) и Lock Stock & Barrel. Все средства можно также приобрести для домашнего ухода.',
  },
  {
    id: 'faq-5',
    question: 'Как перенести или отменить запись, если изменились планы?',
    answer: 'Вы можете отменить или перенести запись в любое удобное время прямо в Личном кабинете на сайте в один клик без штрафов и комиссий, либо позвонив по нашему прямому телефону.',
  },
  {
    id: 'faq-6',
    question: 'Есть ли напитки и парковка для гостей?',
    answer: 'Да. Для всех гостей работает бесплатный Lounge-бар с зерновым кофе, чаем и премиальным шотландским виски. Рядом с барбершопом есть удобная парковка по пр. Достык, а вход находится в паре минут от метро Абай.',
  },
];

interface FaqSectionProps {
  settings?: SiteSettings | null;
  onStartBooking?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings, onStartBooking }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 border-t border-[#21262d] bg-[#0b0e14]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Вопросы и ответы</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f8f5ee]">
            Часто задаваемые вопросы
          </h2>
          <p className="text-sm text-[#8b949e] mt-2 max-w-lg mx-auto">
            Все, что нужно знать перед первым визитом в барбершоп BLADE & CO.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {FAQS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-[#c59b27]/40 bg-[#161b22]'
                    : 'border-[#21262d] bg-[#11151c] hover:border-[#30363d]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#f8f5ee]"
                >
                  <span>{item.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#c59b27] text-black rotate-180'
                        : 'bg-[#21262d] text-[#8b949e]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#8b949e] leading-relaxed border-t border-[#21262d]/50 animate-in fade-in duration-150">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-[#161b22] border border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#f8f5ee]">
              Остались вопросы или особые пожелания?
            </h4>
            <p className="text-xs text-[#8b949e] mt-0.5">
              Свяжитесь с нами в Telegram или позвоните администратору
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`https://t.me/${(settings?.telegram || '@blade_almaty').replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-[#f8f5ee] flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Telegram</span>
            </a>

            <a
              href={`tel:${settings?.phone || '+77771234567'}`}
              className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-[#f8f5ee] flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Позвонить</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
