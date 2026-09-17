/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  MapPin, 
  Sparkles, 
  Clock, 
  Gift, 
  Truck, 
  Percent,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface HeroProps {
  theme?: 'dark' | 'light';
}

export default function Hero({ theme = 'dark' }: HeroProps) {
  const [addressCheck, setAddressCheck] = useState('');
  const [checkResult, setCheckResult] = useState<'success' | 'warning' | null>(null);

  const handleCheckAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressCheck.trim()) return;

    const lower = addressCheck.toLowerCase();
    // Simulating quick address validation for Barnaul
    if (
      lower.includes('ленин') || 
      lower.includes('павлов') || 
      lower.includes('малахов') || 
      lower.includes('строител') || 
      lower.includes('попов') || 
      lower.includes('балтийск') || 
      lower.includes('красноармей') || 
      addressCheck.length % 2 === 0
    ) {
      setCheckResult('success');
    } else {
      setCheckResult('warning');
    }
  };

  const promoCards = [
    {
      badgeText: 'С 10:00 до 14:00',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      badgeDot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      icon: Clock,
      iconColor: 'text-amber-400',
      title: 'Обеденная скидка 20%',
      desc: 'Действует ежедневно с 10:00 до 14:00 при сумме заказа от 4 000 ₽. Идеально для сытного ланча в офисе или дома!',
      glowColor: 'group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]',
      borderAccent: 'hover:border-amber-500/40',
      gradientAccent: 'from-amber-500/[0.06] via-transparent to-transparent',
    },
    {
      badgeText: '3 бонуса на выбор',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      badgeDot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      icon: Gift,
      iconColor: 'text-rose-400',
      title: 'Подарок или скидка 10% от 2 500 ₽',
      desc: 'При чеке от 2 500 ₽ выбирайте свой бонус: скидка 10%, хрустящий жареный ролл «Сурими темпура» или нежный ролл «Сезам» в подарок!',
      glowColor: 'group-hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)]',
      borderAccent: 'hover:border-rose-500/40',
      gradientAccent: 'from-rose-500/[0.06] via-transparent to-transparent',
    },
    {
      badgeText: 'Соусы включены',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      badgeDot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      icon: Truck,
      iconColor: 'text-emerald-400',
      title: 'Бесплатная доставка от 1 000 ₽',
      desc: 'Быстрая доставка по Барнаулу бесплатно при заказе от 1 000 ₽. Свежий имбирь, соевый соус и васаби уже входят в стоимость заказа!',
      glowColor: 'group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
      borderAccent: 'hover:border-emerald-500/40',
      gradientAccent: 'from-emerald-500/[0.06] via-transparent to-transparent',
    },
    {
      badgeText: 'До 15% выгоды',
      badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
      badgeDot: 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
      icon: Percent,
      iconColor: 'text-orange-400',
      title: 'Самовывоз 10% • Именинникам 15%',
      desc: 'Скидка 10% при заказе навынос из бара. А в ваш день рождения дарим скидку 15% на весь заказ от 3 000 ₽!',
      glowColor: 'group-hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)]',
      borderAccent: 'hover:border-orange-500/40',
      gradientAccent: 'from-[#E53935]/[0.06] via-transparent to-transparent',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 pb-14 sm:pb-20 bg-[#0d0e12]">
      
      {/* Background Soft Radial Lights */}
      <div 
        className="absolute top-10 left-1/4 -z-10 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-[#E53935]/[0.07] blur-[120px] pointer-events-none select-none" 
      />
      <div 
        className="absolute top-1/3 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-amber-500/[0.04] blur-[140px] pointer-events-none select-none" 
      />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* Two-column layout: Desktop ~55% / ~45% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ======================================================== */}
          {/* ЛЕВАЯ КОЛОНКА (Главный оффер и проверка адреса): ~55%    */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-7">
            
            {/* Top Mini-Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex max-w-fit items-center gap-2 rounded-full px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs font-semibold text-white/80"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]" />
              <span className="text-[11px] sm:text-xs tracking-wide text-white/90">
                Премиум доставка роллов в Барнауле
              </span>
            </motion.div>

            {/* 1. Главный заголовок H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="font-sans text-4xl sm:text-5xl md:text-6xl xl:text-[66px] font-black tracking-[-0.03em] leading-[1.05] text-white"
            >
              Свежайшие суши, <br className="hidden sm:inline" />
              роллы и Wok{' '}
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#FF6B6B] via-[#FF5252] to-[#FF8E53] bg-clip-text text-transparent select-none pr-1">
                из-под ножа.
              </span>
            </motion.h1>

            {/* 2. Подзаголовок */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-base sm:text-lg text-white/65 max-w-2xl font-normal leading-relaxed"
            >
              Премиальный охлажденный лосось, хрустящая темпура и горячий Wok. Готовим строго после подтверждения заказа и бережно доставляем по всему городу.
            </motion.p>

            {/* 3. Виджет быстрой проверки доставки (Единый Glass-контейнер) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="relative max-w-xl rounded-3xl bg-white/[0.035] border border-white/[0.09] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            >
              {/* Строка-статус с зеленой точкой-пульсаром */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-white/90">
                  Проверьте, входит ли ваш адрес в зону бесплатной доставки
                </span>
              </div>

              {/* Инпут с кнопкой в едином контейнере */}
              <form onSubmit={handleCheckAddress} className="relative flex items-center">
                <div className="relative flex-1 flex items-center">
                  <MapPin className="absolute left-4 h-4 w-4 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Введите улицу и дом..."
                    value={addressCheck}
                    onChange={(e) => {
                      setAddressCheck(e.target.value);
                      setCheckResult(null);
                    }}
                    className="w-full h-13 pl-11 pr-4 sm:pr-32 rounded-2xl bg-[#14161b]/90 border border-white/[0.1] text-sm text-white placeholder-white/35 focus:outline-none focus:border-[#FF4D4D] focus:bg-[#181a20] transition-all shadow-inner"
                  />
                </div>
                
                {/* Кнопка Проверить (абсолютно внутри справа на десктопе, либо справа) */}
                <button
                  type="submit"
                  className="sm:absolute sm:right-1.5 h-10 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-[#E53935] to-[#FF4D4D] hover:from-[#d32f2f] hover:to-[#ff3333] text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(229,57,53,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-95 ml-2 sm:ml-0"
                >
                  Проверить
                </button>
              </form>

              {/* Результат проверки с плавной анимацией */}
              <AnimatePresence>
                {checkResult === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3.5 flex items-start gap-2.5 rounded-2xl bg-emerald-500/[0.12] border border-emerald-500/25 p-3.5 text-xs text-emerald-300 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs">Адрес в зеленой зоне!</p>
                      <p className="text-emerald-300/90 text-[11px] mt-0.5">
                        Бесплатная доставка от 1 000 ₽. Имбирь, васаби и соевый соус уже включены в заказ.
                      </p>
                    </div>
                  </motion.div>
                )}

                {checkResult === 'warning' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3.5 flex items-start gap-2.5 rounded-2xl bg-amber-500/[0.12] border border-amber-500/25 p-3.5 text-xs text-amber-300 shadow-sm"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs">Стандартная зона Барнаула</p>
                      <p className="text-amber-300/90 text-[11px] mt-0.5">
                        Доставка 45–60 минут. Бесплатно при чеке от 1 000 ₽ (иначе 150 ₽).
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4. Микро-бейджи надежности под инпутом (в ряд) */}
              <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-white/60 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Соевый соус, васаби и имбирь — бесплатно</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Бесплатная доставка от 1 000 ₽</span>
                </div>
              </div>

            </motion.div>

          </div>


          {/* ======================================================== */}
          {/* ПРАВАЯ КОЛОНКА (Сетка промо-карточек): ~45%              */}
          {/* Desktop: вертикальный стек                               */}
          {/* Tablet (768-1024): 2x2 grid                              */}
          {/* Mobile (<768): горизонтальный свайп-слайдер              */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 w-full">
            
            {/* Desktop & Tablet container */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-1 gap-3.5">
              {promoCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 * idx }}
                    className={`group relative overflow-hidden rounded-2xl bg-white/[0.035] hover:bg-white/[0.055] border border-white/[0.08] ${card.borderAccent} p-4 sm:p-4.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${card.glowColor} cursor-default`}
                  >
                    {/* Subtle gradient glow in corner */}
                    <div className={`absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-gradient-to-br ${card.gradientAccent} blur-xl pointer-events-none`} />

                    {/* Top Row: Mini-badge and Icon */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${card.badgeBg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${card.badgeDot}`} />
                        <span>{card.badgeText}</span>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08]">
                        <IconComponent className={`h-3.5 w-3.5 ${card.iconColor}`} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#FF4D4D] transition-colors leading-snug">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-white/55 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {card.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile horizontal carousel slider (< 768px) */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-3 snap-x snap-mandatory pt-2 pb-3">
              {promoCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={idx}
                    className="min-w-[285px] max-w-[310px] shrink-0 snap-start rounded-2xl bg-white/[0.04] border border-white/[0.09] p-4 backdrop-blur-xl shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${card.badgeBg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${card.badgeDot}`} />
                        <span>{card.badgeText}</span>
                      </div>
                      <IconComponent className={`h-4 w-4 ${card.iconColor}`} />
                    </div>

                    <h3 className="text-sm font-bold text-white leading-tight">
                      {card.title}
                    </h3>

                    <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile pagination indicators */}
            <div className="md:hidden flex items-center justify-center gap-1.5 mt-2">
              <span className="text-[10px] text-white/40 font-medium">← Листайте акции пальцем →</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
