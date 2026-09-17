import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Users, Flame, ChevronRight, ShoppingBag, X, RefreshCw, Star } from 'lucide-react';
import { Product } from '../types';
import ProductImage from './ProductImage';

interface PartyRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddBundleToCart: (items: { product: Product; quantity: number }[]) => void;
  theme?: 'dark' | 'light';
}

type HungerLevel = 'light' | 'standard' | 'feast';
type TastePref = 'mixed' | 'salmon_fans' | 'spicy_hot' | 'baked_cheese' | 'meat_pizza';
type DessertsNeed = 'yes' | 'no';

export default function PartyRecommenderModal({
  isOpen,
  onClose,
  products,
  onAddBundleToCart,
  theme = 'dark'
}: PartyRecommenderModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [hungerLevel, setHungerLevel] = useState<HungerLevel>('feast');
  const [tastePref, setTastePref] = useState<TastePref>('mixed');
  const [dessertsNeed, setDessertsNeed] = useState<DessertsNeed>('yes');
  
  const [recommendedBundle, setRecommendedBundle] = useState<{ product: Product; quantity: number }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const bundle: { product: Product; quantity: number }[] = [];

      // 1. Pick a large main Set or 2 Sets if large party
      const sets = products.filter(p => p.category === 'sets');
      if (sets.length > 0) {
        if (peopleCount >= 4) {
          const bigSet = sets.find(s => (s.weight || 0) >= 1500) || sets[0];
          bundle.push({ product: bigSet, quantity: 1 });

          const secondSet = sets.find(s => s.id !== bigSet.id && (s.name.toLowerCase().includes('темпур') || s.name.toLowerCase().includes('пикант') || (s.weight || 0) >= 700)) || sets[1 % sets.length];
          bundle.push({ product: secondSet, quantity: 1 });
        } else {
          const bestSet = sets.find(s => tastePref === 'spicy_hot' ? s.name.toLowerCase().includes('пикант') : (s.weight || 0) >= 700) || sets[0];
          bundle.push({ product: bestSet, quantity: 1 });
        }
      }

      // 2. Add signature single rolls based on taste preferences
      const rolls = products.filter(p => ['baked-rolls', 'classic-rolls', 'tempura-rolls'].includes(p.category));
      if (tastePref === 'salmon_fans') {
        const phila = rolls.find(r => r.name.toLowerCase().includes('филадельфия')) || rolls[0];
        const bonita = rolls.find(r => r.name.toLowerCase().includes('бонита')) || rolls[1];
        if (phila) bundle.push({ product: phila, quantity: Math.max(1, Math.floor(peopleCount / 2)) });
        if (bonita) bundle.push({ product: bonita, quantity: 1 });
      } else if (tastePref === 'spicy_hot') {
        const meksika = rolls.find(r => r.name.toLowerCase().includes('мексика')) || rolls[0];
        const karai = rolls.find(r => r.name.toLowerCase().includes('карай')) || rolls[1];
        if (meksika) bundle.push({ product: meksika, quantity: Math.max(1, Math.floor(peopleCount / 2)) });
        if (karai) bundle.push({ product: karai, quantity: 1 });
      } else if (tastePref === 'baked_cheese') {
        const baked = rolls.filter(r => r.category === 'baked-rolls');
        if (baked[0]) bundle.push({ product: baked[0], quantity: 1 });
        if (baked[1]) bundle.push({ product: baked[1], quantity: 1 });
      } else {
        const signature = rolls.filter(r => (r.price || 0) >= 420);
        if (signature[0]) bundle.push({ product: signature[0], quantity: 1 });
        if (signature[1]) bundle.push({ product: signature[1], quantity: 1 });
        if (peopleCount >= 3 && signature[2]) bundle.push({ product: signature[2], quantity: 1 });
      }

      // 3. For large parties (>=3 people) or hungerLevel === 'feast', add Pizza!
      if (peopleCount >= 3 || hungerLevel === 'feast' || tastePref === 'meat_pizza') {
        const pizzas = products.filter(p => p.category === 'pizza');
        if (pizzas.length > 0) {
          const prefPizza = pizzas.find(p => p.name.toLowerCase().includes('пепперони') || p.name.toLowerCase().includes('мясная') || p.name.toLowerCase().includes('карбонара')) || pizzas[0];
          bundle.push({ product: prefPizza, quantity: peopleCount >= 6 ? 2 : 1 });
        }
      }

      // 4. Add Desserts if requested
      if (dessertsNeed === 'yes') {
        const desserts = products.filter(p => p.category === 'desserts' || p.name.toLowerCase().includes('чизкейк'));
        if (desserts.length > 0) {
          bundle.push({ product: desserts[0], quantity: Math.max(1, Math.floor(peopleCount / 2)) });
        }
      }

      setRecommendedBundle(bundle);
      setIsGenerating(false);
      setStep(3);
    }, 600);
  };

  const totalPrice = recommendedBundle.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalWeight = recommendedBundle.reduce((sum, item) => sum + (item.product.weight || 200) * item.quantity, 0);
  const totalPieces = recommendedBundle.reduce((sum, item) => sum + (item.product.pieces || (item.product.category === 'pizza' ? 8 : 1)) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
          theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-panda-charcoal border-white/10 text-white'
        }`}
      >
        {/* Header Bar */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-panda-orange/15 via-rose-500/10 to-transparent border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-panda-orange text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            <span>AI Конструктор Банкета & Большого Чека</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">
            Подбор идеального сета на компанию
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-md ${theme === 'light' ? 'text-zinc-600' : 'text-white/60'}`}>
            Укажите количество персон и предпочтения — шеф-алгоритм Суши Панда рассчитает оптимальный вес и составит сочный щедрый заказ.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Question 1: People Count */}
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-panda-orange" />
                    <span>1. На сколько человек делаем заказ?</span>
                  </span>
                  <span className="font-mono text-panda-orange font-black text-base bg-panda-orange/10 px-3 py-0.5 rounded-full">
                    {peopleCount} {peopleCount === 1 ? 'человек' : peopleCount >= 2 && peopleCount <= 4 ? 'человека' : 'человек'}
                  </span>
                </label>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-white/10 rounded-2xl bg-white/5 p-1">
                    <button
                      type="button"
                      onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-black text-lg cursor-pointer transition-all"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-black text-lg text-panda-orange">
                      {peopleCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPeopleCount(Math.min(20, peopleCount + 1))}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-black text-lg cursor-pointer transition-all"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[2, 3, 4, 6, 8, 10].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setPeopleCount(cnt)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          peopleCount === cnt
                            ? 'bg-panda-orange text-white border-panda-orange shadow-md shadow-panda-orange/20'
                            : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {cnt} чел.
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question 2: Appetite / Hunger Level */}
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-panda-orange" />
                  <span>2. Уровень аппетита компании:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'light', title: 'Легкий перекус', desc: '~12 кусочков/чел', badge: 'Лайт' },
                    { id: 'standard', title: 'Сытный ужин', desc: '~16 кусочков/чел', badge: 'Стандарт' },
                    { id: 'feast', title: 'Царский пир 👑', desc: '~22 кусочка + Пицца + Десерты', badge: 'Максимум сытости' }
                  ].map(lvl => (
                    <div
                      key={lvl.id}
                      onClick={() => setHungerLevel(lvl.id as HungerLevel)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        hungerLevel === lvl.id
                          ? 'border-panda-orange bg-panda-orange/10 ring-1 ring-panda-orange'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{lvl.title}</span>
                          <span className="text-[10px] font-mono text-panda-orange font-bold">{lvl.badge}</span>
                        </div>
                        <p className="text-[11px] text-white/50">{lvl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-panda-orange/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Далее: Вкусы и десерты</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Question 3: Taste Preferences */}
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-panda-orange" />
                  <span>3. Предпочтения по вкусам и наполнению:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'mixed', label: '🔥 Разнообразное (Сеты + Запеченные + Темпура)' },
                    { id: 'salmon_fans', label: '🍣 Много лосося & Филадельфия (Премиум)' },
                    { id: 'baked_cheese', label: '🧀 Сырные и запеченные шапочки (Горячие)' },
                    { id: 'spicy_hot', label: '🌶️ Остренькие соусы (Спайси, Кимчи, Мексика)' },
                    { id: 'meat_pizza', label: '🍕 Роллы + Обязательно горячая мясная пицца' }
                  ].map(pref => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setTastePref(pref.id as TastePref)}
                      className={`p-3 text-left rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                        tastePref === pref.id
                          ? 'border-panda-orange bg-panda-orange/10 text-white font-bold ring-1 ring-panda-orange'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Desserts */}
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <span>🍰 4. Побаловать компанию фирменными десертами?</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'yes', label: '🎂 Да, чизкейки New York' },
                    { id: 'no', label: '🚫 Нет, только сытные блюда' }
                  ].map(ds => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => setDessertsNeed(ds.id as DessertsNeed)}
                      className={`py-3 text-center rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        dessertsNeed === ds.id
                          ? 'border-panda-orange bg-panda-orange/10 text-white ring-1 ring-panda-orange'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {ds.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Формируем стол...' : 'Сформировать царский стол 👑'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-center font-mono">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase">Компания</span>
                  <strong className="text-sm text-white">{peopleCount} гостей</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block uppercase">Общий вес</span>
                  <strong className="text-sm text-emerald-400">~{totalWeight} г</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block uppercase">Кусочков / позиций</span>
                  <strong className="text-sm text-panda-orange">{totalPieces} шт.</strong>
                </div>
              </div>

              {/* Bundle list */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {recommendedBundle.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductImage 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" 
                        placeholderEmoji="🍣"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-white/50 truncate">
                          {item.product.category === 'sets' ? `Сет ${item.product.weight}г` : `${item.product.weight}г • ${item.product.category}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0 ml-3">
                      <span className="text-xs font-bold text-white block">
                        {item.quantity} × {item.product.price} ₽
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {item.quantity * item.product.price} ₽
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Action Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-panda-charcoal to-panda-charcoal border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                    Итого за банкетный набор:
                  </span>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-black text-white">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-xs text-white/40">({Math.round(totalPrice / peopleCount)} ₽ / чел)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    title="Пересчитать параметры"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (recommendedBundle && recommendedBundle.length > 0) {
                        onAddBundleToCart(recommendedBundle);
                      }
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-panda-orange/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer select-none"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Добавить всё в корзину ({totalPrice} ₽)</span>
                  </button>

                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
