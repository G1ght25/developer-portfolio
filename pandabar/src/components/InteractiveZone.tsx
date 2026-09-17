import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shuffle, Gift, RotateCw, Users, ChevronRight, Star, Flame, Check } from 'lucide-react';
import { Product } from '../types';
import { playBambooSnap, playPandaPurr } from '../utils/audio';
import ProductImage from './ProductImage';
import PartyRecommenderModal from './PartyRecommenderModal';

interface InteractiveZoneProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAddBundleToCart?: (items: { product: Product; quantity: number }[]) => void;
  theme?: 'dark' | 'light';
}

const CHEF_COMMENTS = [
  "Королевский выбор! Этот премиальный сет станет главным украшением вашего стола. Шеф рекомендует!",
  "Максимум сочной начинки, отборный свежий лосось и хрустящая текстура — гарантированное удовольствие!",
  "Один из самых востребованных хитов PandaBar. Щедрая порция и идеальный баланс вкусов!",
  "Топовая рекомендация от шефа для особенного вечера: невероятно сытно и изысканно!",
  "Идеальное сочетание ингредиентов премиум-класса. Попробуйте — это гастрономический восторг!"
];

export default function InteractiveZone({ products, onAddToCart, onAddBundleToCart, theme = 'dark' }: InteractiveZoneProps) {
  // Filter for high-ticket / high-margin products to maximize sales & AOV
  const highMarginProducts = useMemo(() => {
    const highTier = products.filter(p => {
      if (p.category === 'dopolnitelno' || p.category === 'drinks') return false;
      if (p.category === 'sets') return true; // Big checks!
      if (p.category === 'pizza' && p.price >= 450) return true;
      if (['baked-rolls', 'tempura-rolls', 'classic-rolls'].includes(p.category) && p.price >= 360) return true;
      return false;
    });
    return highTier.length > 0 ? highTier : products;
  }, [products]);

  // --- 1. RANDOMIZER / CHEF ADVICE STATES ---
  const [randomizerState, setRandomizerState] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chefComment, setChefComment] = useState('');
  const [spinIndex, setSpinIndex] = useState(0);
  const [isAddedNotice, setIsAddedNotice] = useState(false);

  // --- 2. PARTY BANQUET RECOMMENDER MODAL STATE ---
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);

  // Hardware / System Back Button Trapping for Interactive Zone Result
  const modalHistoryPushedRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);

  useEffect(() => {
    if (randomizerState === 'result' && !modalHistoryPushedRef.current) {
      modalHistoryPushedRef.current = true;
      try { window.history.pushState({ interactiveModal: true }, ''); } catch (e) {}
    } else if (randomizerState !== 'result' && modalHistoryPushedRef.current) {
      modalHistoryPushedRef.current = false;
      if (window.history.state?.interactiveModal) {
        ignoreNextPopStateRef.current = true;
        try { window.history.back(); } catch (e) {}
      }
    }
  }, [randomizerState]);

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }
      if (modalHistoryPushedRef.current && randomizerState === 'result') {
        modalHistoryPushedRef.current = false;
        setRandomizerState('idle');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [randomizerState]);

  // --- RANDOMIZER HANDLER ---
  const handleRandomize = () => {
    if (highMarginProducts.length === 0) return;
    setRandomizerState('spinning');
    setIsAddedNotice(false);
    playBambooSnap();

    let duration = 1600;
    let intervalTime = 70;
    let elapsed = 0;

    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * highMarginProducts.length);
      setSpinIndex(tempIndex);
      elapsed += intervalTime;
      
      if (elapsed > duration * 0.65) {
        clearInterval(interval);
        const slowInterval = setInterval(() => {
          const finalIndex = Math.floor(Math.random() * highMarginProducts.length);
          setSpinIndex(finalIndex);
          elapsed += 160;
          if (elapsed > duration) {
            clearInterval(slowInterval);
            const chosen = highMarginProducts[finalIndex];
            setSelectedProduct(chosen);
            setRandomizerState('result');
            playPandaPurr();
            setChefComment(CHEF_COMMENTS[Math.floor(Math.random() * CHEF_COMMENTS.length)]);
          }
        }, 160);
      }
    }, intervalTime);
  };

  const handleAddChosenToCart = () => {
    if (!selectedProduct) return;
    onAddToCart(selectedProduct);
    setIsAddedNotice(true);
    setTimeout(() => setIsAddedNotice(false), 2000);
  };

  return (
    <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panda-orange/10 border border-panda-orange/25 text-panda-orange text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Специальные предложения & Рекомендации</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${
          theme === 'light' ? 'text-zinc-950' : 'text-white'
        }`}>
          Меню на компанию и Совет Шеф-Панды
        </h2>
        <p className={`text-xs sm:text-sm max-w-xl mx-auto mt-2.5 leading-relaxed ${
          theme === 'light' ? 'text-zinc-600' : 'text-white/60'
        }`}>
          Помощники идеального заказа: умный конструктор для застолья с друзьями или индивидуальная рекомендация топовых блюд от нашего шефа
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* ================= CARD 1: BANQUET & PARTY RECOMMENDER ================= */}
        <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group ${
          theme === 'light'
            ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-panda-orange/30 shadow-[0_10px_30px_rgba(249,115,22,0.08)]'
            : 'bg-gradient-to-br from-panda-orange/20 via-rose-500/10 to-panda-charcoal/90 border-panda-orange/30 shadow-2xl'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-panda-orange/10 rounded-full blur-3xl pointer-events-none group-hover:bg-panda-orange/15 transition-all" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panda-orange/20 border border-panda-orange/40 text-panda-orange text-[11px] font-black uppercase tracking-widest">
                <Users className="h-3.5 w-3.5" />
                <span>AI Конструктор Застолья</span>
              </div>
              <span className="text-xs font-bold text-panda-orange bg-panda-orange/10 px-2.5 py-1 rounded-lg">
                от 2 до 20+ персон
              </span>
            </div>

            <div>
              <h3 className={`font-display text-xl sm:text-2xl font-black ${theme === 'light' ? 'text-zinc-950' : 'text-white'}`}>
                Заказываете на компанию или праздник? 🎉
              </h3>
              <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${theme === 'light' ? 'text-zinc-600' : 'text-white/70'}`}>
                Не нужно тратить время на долгий выбор: умный алгоритм рассчитает сытный сбалансированный банкетный сет с большими роллами, горячей пиццей, десертами и подарками за 1 клик!
              </p>
            </div>

            {/* Benefit Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-white/80 bg-black/20 p-2 rounded-xl border border-white/5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Оптимальный вес на гостя</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/80 bg-black/20 p-2 rounded-xl border border-white/5">
                <span className="text-panda-orange font-bold">★</span>
                <span>Пицца в подарок к сету</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/80 bg-black/20 p-2 rounded-xl border border-white/5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Полный комплект приборов и соусов</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/80 bg-black/20 p-2 rounded-xl border border-white/5">
                <span className="text-panda-orange font-bold">🚀</span>
                <span>Быстрая доставка к застолью</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-panda-orange/30 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>СОБРАТЬ МЕНЮ НА КОМПАНИЮ</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ================= CARD 2: CHEF PANDA\\'S CHOICE (HIGH MARGIN / EXPENSIVE) ================= */}
        <div className={`flex flex-col rounded-3xl border p-6 sm:p-8 justify-between relative overflow-hidden transition-all duration-300 group ${
          theme === 'light'
            ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-300/40 shadow-[0_10px_30px_rgba(16,185,129,0.08)]'
            : 'bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-panda-charcoal/90 border-emerald-500/30 shadow-2xl'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                <span>Совет Шеф-Панды</span>
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                Премиум & Хиты
              </span>
            </div>

            {randomizerState === 'idle' && (
              <div className="text-center py-5">
                <div className="flex justify-center mb-3">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <Shuffle className="h-8 w-8" />
                  </div>
                </div>
                <h3 className={`font-display text-xl font-bold ${theme === 'light' ? 'text-zinc-950' : 'text-white'}`}>
                  Хотите самое вкусное и сытное? 🍣
                </h3>
                <p className={`text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed ${theme === 'light' ? 'text-zinc-600' : 'text-white/60'}`}>
                  Шеф отобрал лучшие фирменные сеты, запечённые деликатесы и пиццы с максимальным количеством начинки.
                </p>
              </div>
            )}

            {randomizerState === 'spinning' && (
              <div className="text-center py-5">
                <div className="flex justify-center mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.55, ease: 'linear' }}
                    className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                  >
                    <RotateCw className="h-8 w-8" />
                  </motion.div>
                </div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-800' : 'text-white/80'}`}>
                  Шеф-панда выбирает шедевр...
                </h4>
                <p className="text-sm text-emerald-400 font-extrabold mt-2 truncate max-w-xs mx-auto">
                  {highMarginProducts[spinIndex]?.name}
                </p>
              </div>
            )}

            {randomizerState === 'result' && selectedProduct && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/25 border border-white/10">
                  <ProductImage 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/15 shadow-md" 
                    placeholderEmoji={selectedProduct.category === 'sets' ? '🍱' : selectedProduct.category === 'pizza' ? '🍕' : '🍣'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {selectedProduct.category === 'sets' ? 'Сет' : selectedProduct.category === 'pizza' ? 'Пицца' : 'Премиум ролл'}
                      </span>
                      {selectedProduct.weight && (
                        <span className="text-[11px] text-white/50 font-mono">
                          {selectedProduct.weight} г
                        </span>
                      )}
                    </div>
                    <h4 className={`text-base font-extrabold truncate mt-0.5 ${theme === 'light' ? 'text-zinc-950' : 'text-white'}`}>
                      {selectedProduct.name}
                    </h4>
                    <p className={`text-[11px] line-clamp-1 mt-0.5 ${theme === 'light' ? 'text-zinc-600' : 'text-white/50'}`}>
                      {selectedProduct.description}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-black text-panda-orange">
                        {selectedProduct.price} ₽
                      </span>
                      {selectedProduct.pieces && (
                        <span className="text-xs text-white/40">
                          ({selectedProduct.pieces} шт.)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[11px] leading-relaxed italic text-emerald-300 font-medium text-center">
                    "{chefComment}"
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative z-10 mt-5 pt-5 border-t border-white/10">
            {randomizerState === 'result' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddChosenToCart}
                  className="h-12 rounded-2xl bg-panda-orange hover:bg-panda-orange-hover text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xl shadow-panda-orange/30"
                >
                  {isAddedNotice ? <Check className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                  <span>{isAddedNotice ? 'ДОБАВЛЕНО!' : `В КОРЗИНУ • ${selectedProduct?.price} ₽`}</span>
                </button>
                <button
                  onClick={handleRandomize}
                  className={`h-12 rounded-2xl border text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                    theme === 'light'
                      ? 'border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                      : 'border-white/15 text-white/90 hover:bg-white/10'
                  }`}
                >
                  <RotateCw className="h-4 w-4" />
                  <span>ДРУГОЙ СОВЕТ</span>
                </button>
              </div>
            ) : (
              <button
                disabled={randomizerState === 'spinning'}
                onClick={handleRandomize}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-55"
              >
                <Shuffle className="h-4 w-4" />
                <span>СПРОСИТЬ СОВЕТ ШЕФ-ПАНДЫ</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* PARTY BANQUET RECOMMENDER MODAL */}
      <PartyRecommenderModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        products={products}
        onAddBundleToCart={(bundle) => {
          if (onAddBundleToCart) {
            onAddBundleToCart(bundle);
          } else {
            bundle.forEach(item => {
              for (let i = 0; i < item.quantity; i++) {
                onAddToCart(item.product);
              }
            });
          }
        }}
        theme={theme}
      />
    </section>
  );
}
