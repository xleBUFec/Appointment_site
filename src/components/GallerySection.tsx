import React, { useState } from 'react';
import { Camera, Scissors, Sparkles, X, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'hair' | 'beard' | 'lounge';
  categoryLabel: string;
  image: string;
  barber: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Textured Crop Fade',
    category: 'hair',
    categoryLabel: 'Стрижка',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    barber: 'Александр "Клык"',
  },
  {
    id: 'g-2',
    title: 'Классический Pompadour & Контуры',
    category: 'hair',
    categoryLabel: 'Стрижка',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    barber: 'Максим Воронов',
  },
  {
    id: 'g-3',
    title: 'Моделирование бороды с четким фейдом',
    category: 'beard',
    categoryLabel: 'Борода',
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&w=800&q=80',
    barber: 'Александр "Клык"',
  },
  {
    id: 'g-4',
    title: 'Королевское бритье опасной бритвой',
    category: 'beard',
    categoryLabel: 'Бритье',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    barber: 'Денис Громов',
  },
  {
    id: 'g-5',
    title: 'Интерьер джентльменского клуба',
    category: 'lounge',
    categoryLabel: 'Атмосфера',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    barber: 'BLADE & CO. Lounge',
  },
  {
    id: 'g-6',
    title: 'Low Taper Fade & Текстура',
    category: 'hair',
    categoryLabel: 'Стрижка',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',
    barber: 'Максим Воронов',
  },
];

interface GallerySectionProps {
  onSelectServiceAndBook?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onSelectServiceAndBook }) => {
  const [filter, setFilter] = useState<'all' | 'hair' | 'beard' | 'lounge'>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const filtered = filter === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === filter);

  return (
    <section className="py-20 border-t border-[#21262d] bg-[#0b0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>Портфолио & Атмосфера</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f8f5ee]">
              Работы наших мастеров
            </h2>
            <p className="text-sm text-[#8b949e] mt-2 max-w-xl">
              Точность линий, выверенная геометрия формы и безупречное качество исполнения в каждой детали
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Все работы' },
              { id: 'hair', label: 'Стрижки' },
              { id: 'beard', label: 'Бороды & Бритье' },
              { id: 'lounge', label: 'Интерьер' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-[#c59b27] text-black shadow-md'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-[#f8f5ee] border border-[#21262d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="group relative rounded-2xl overflow-hidden bg-[#161b22] border border-[#21262d] cursor-pointer aspect-[4/3] shadow-lg hover:border-[#c59b27]/50 transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Bottom Details */}
              <div className="absolute bottom-0 inset-x-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c59b27] block mb-1">
                  {item.categoryLabel}
                </span>
                <h4 className="font-serif text-base font-bold text-[#f8f5ee] leading-tight">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs text-[#8b949e]">
                  <span>Барбер: {item.barber}</span>
                  <span className="text-[#c59b27] text-[11px] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Смотреть
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/10] w-full overflow-hidden bg-black">
              <img
                src={activeImage.image}
                alt={activeImage.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c59b27] font-bold">
                  {activeImage.categoryLabel} • {activeImage.barber}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#f8f5ee] mt-0.5">
                  {activeImage.title}
                </h3>
              </div>

              {onSelectServiceAndBook && (
                <button
                  onClick={() => {
                    setActiveImage(null);
                    onSelectServiceAndBook();
                  }}
                  className="gold-button text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Хочу такую стрижку</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
