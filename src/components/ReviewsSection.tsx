import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, User, Sparkles, Plus, ThumbsUp } from 'lucide-react';
import { UserProfile } from '../types';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  service: string;
  barber: string;
  comment: string;
  verified: boolean;
  likes: number;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Дмитрий В.',
    rating: 5,
    date: 'Вчера',
    service: 'Комплекс "Шеф": Стрижка + Борода',
    barber: 'Александр "Клык"',
    comment: 'Лучший барбершоп в центре. Александр — настоящий мастер своего дела, идеально подобрал форму бороды под структуру лица. Отдельный респект за отличный эспрессо и атмосферу!',
    verified: true,
    likes: 14,
  },
  {
    id: 'rev-2',
    author: 'Артем Мельников',
    rating: 5,
    date: '3 дня назад',
    service: 'Классическая мужская стрижка',
    barber: 'Максим Воронов',
    comment: 'Идеальный фейд! Переходы ровные, укладка держится весь день даже без тонны лака. Очень внимательное отношение к деталям и чистый, стерильный инструмент.',
    verified: true,
    likes: 9,
  },
  {
    id: 'rev-3',
    author: 'Сергей Николаев',
    rating: 5,
    date: 'Неделю назад',
    service: 'Королевское бритье опасной бритвой',
    barber: 'Денис Громов',
    comment: 'Непередаваемые ощущения от королевского бритья с горячими компрессами. Кожа после процедуры гладкая, никакого раздражения. Буду постоянным клиентом!',
    verified: true,
    likes: 18,
  },
];

interface ReviewsSectionProps {
  currentUser?: UserProfile;
  onOpenAuth?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ currentUser, onOpenAuth }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('barber_site_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState(currentUser?.name && currentUser.id !== 'guest' ? currentUser.name : '');
  const [serviceName, setServiceName] = useState('Классическая мужская стрижка');
  const [barberName, setBarberName] = useState('Александр "Клык" Романов');
  const [comment, setComment] = useState('');
  const [likedReviews, setLikedReviews] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest' && currentUser.name) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser]);

  const handleLike = (id: string) => {
    if (likedReviews.includes(id)) return;
    setLikedReviews([...likedReviews, id]);
    const updated = reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r);
    setReviews(updated);
    localStorage.setItem('barber_site_reviews', JSON.stringify(updated));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !authorName.trim()) return;

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      author: authorName.trim(),
      rating,
      date: 'Только что',
      service: serviceName,
      barber: barberName,
      comment: comment.trim(),
      verified: Boolean(currentUser && currentUser.id !== 'guest'),
      likes: 1,
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem('barber_site_reviews', JSON.stringify(updated));
    setComment('');
    setIsModalOpen(false);
  };

  return (
    <section className="py-20 border-t border-[#21262d] bg-[#0e1117]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Stats Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 fill-[#c59b27]" />
              <span>Честные отзывы</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f8f5ee]">
              Что говорят наши джентльмены
            </h2>
            <p className="text-sm text-[#8b949e] mt-2 max-w-xl">
              Более 98% клиентов возвращаются к нам снова и рекомендуют нас друзьям и коллегам
            </p>
          </div>

          {/* Rating Cards */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#161b22] p-4 rounded-2xl border border-[#21262d]">
            <div className="flex items-center gap-3">
              <span className="font-serif text-4xl font-bold text-[#c59b27]">4.98</span>
              <div>
                <div className="flex text-[#c59b27]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c59b27]" />
                  ))}
                </div>
                <span className="text-[11px] text-[#8b949e] block mt-0.5">
                  На основе 320+ отзывов
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#21262d] hidden sm:block" />

            <button
              onClick={() => setIsModalOpen(true)}
              className="gold-button text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Оставить отзыв</span>
            </button>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-[#161b22] border border-[#21262d] flex flex-col justify-between hover:border-[#38414e] transition-all shadow-md"
            >
              <div>
                {/* Header of review */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#f8f5ee]">
                        {r.author}
                      </span>
                      {r.verified && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1" title="Проверенный клиент">
                          <CheckCircle2 className="w-3 h-3" />
                          Визит подтвержден
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8b949e]">{r.date}</span>
                  </div>

                  <div className="flex text-[#c59b27]">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#c59b27]" />
                    ))}
                  </div>
                </div>

                {/* Service Tag */}
                <div className="text-[11px] text-[#c59b27] font-medium bg-[#0e1117] px-2.5 py-1 rounded-lg border border-[#21262d] inline-block mb-3">
                  {r.service} • {r.barber}
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                  "{r.comment}"
                </p>
              </div>

              {/* Bottom Likes */}
              <div className="pt-4 mt-4 border-t border-[#21262d] flex items-center justify-between text-xs text-[#8b949e]">
                <span>Полезный отзыв?</span>
                <button
                  onClick={() => handleLike(r.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                    likedReviews.includes(r.id)
                      ? 'border-[#c59b27] text-[#c59b27] bg-[#c59b27]/10'
                      : 'border-[#21262d] hover:border-[#38414e] text-[#8b949e]'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{r.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Add Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-3xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#f8f5ee] mb-1">
              Оставить отзыв о визите
            </h3>
            <p className="text-xs text-[#8b949e] mb-4">
              Поделитесь вашими впечатлениями о стрижке и мастере
            </p>

            <form onSubmit={handleAddReview} className="space-y-4">
              {/* Rating selection */}
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">
                  Ваша оценка
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 text-[#c59b27] hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-[#c59b27]' : 'text-[#30363d]'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Услуга
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] outline-none"
                >
                  <option value="Классическая мужская стрижка">Классическая мужская стрижка</option>
                  <option value="Моделирование бороды и усов">Моделирование бороды и усов</option>
                  <option value='Комплекс "Шеф": Стрижка + Борода'>Комплекс "Шеф": Стрижка + Борода</option>
                  <option value="Королевское бритье опасной бритвой">Королевское бритье опасной бритвой</option>
                  <option value="Премиум СПА-уход">Премиум СПА-уход</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Мастер
                </label>
                <select
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] outline-none"
                >
                  <option value='Александр "Клык" Романов'>Александр "Клык" Романов</option>
                  <option value="Максим Воронов">Максим Воронов</option>
                  <option value="Денис Громов">Денис Громов</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                  Ваш отзыв
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Расскажите о работе мастера, атмосфере и сервисе..."
                  className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#c59b27] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f5ee] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#30363d] text-xs font-semibold text-[#8b949e] hover:text-[#f8f5ee]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 gold-button text-black font-bold text-xs py-2.5 rounded-xl shadow-md"
                >
                  Опубликовать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
