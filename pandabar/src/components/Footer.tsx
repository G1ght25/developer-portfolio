/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Phone, MapPin, Heart, ArrowUp, ChevronDown, ChevronUp, ShieldCheck, Sparkles, HelpCircle, Lock } from 'lucide-react';
import { VkIcon } from './AboutModal';

export default function Footer({ theme = 'dark', onOpenStaffAuth, onOpenAbout }: { theme?: 'dark' | 'light'; onOpenStaffAuth?: () => void; onOpenAbout?: () => void; }) {
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const barnaulFaqs = [
    {
      question: "Как заказать суши в Барнауле с бесплатной доставкой?",
      answer: "Заказать суши и роллы с бесплатной доставкой по Барнаулу очень просто — доставка по городу бесплатна при сумме заказа от 1 000 ₽. Кроме того, васаби, соевый соус и свежий имбирь уже включены в стоимость каждого заказа! Наша служба Суши Панда оперативно примет и привезет заказ за 45-60 минут прямо к вам домой или в офис."
    },
    {
      question: "В какие районы Барнаула осуществляется доставка?",
      answer: "Суши Панда доставляет вкуснейшие сеты и роллы во все административные районы города Барнаул: Индустриальный район (включая спальные кварталы, Сулиму, Новосиликатный), Ленинский район, Октябрьский район, Железнодорожный район и Центральный район. Мы гарантируем быструю доставку горячих блюд в специальных термосумках."
    },
    {
      question: "Какие акции на доставку суши и роллов действуют сегодня?",
      answer: "У нас действует целая система бонусов и выгодных предложений: 1) Обеденная скидка 20% ежедневно с 10:00 до 14:00 при заказе от 4 000 ₽; 2) Бонус от 2 500 ₽ на выбор: скидка 10%, жареный ролл «Сурими темпура» или нежареный «Сезам» в подарок; 3) Скидка 10% при самовывозе из бара; 4) Скидка 15% именинникам при заказе от 3 000 ₽. Мы всегда автоматически применяем самое выгодное предложение для вас!"
    },
    {
      question: "Каковы преимущества заказа роллов у Суши Панда Barnaul?",
      answer: "Главный секрет — премиальное качество ингредиентов. Мы используем только охлажденный мурманский лосось, оригинальный творожный сыр Cremette и отборный круглый рис. Мы крутим роллы исключительно 'из-под ножа' сразу после подтверждения заказа, не храним заготовки и делаем порции по-настоящему крупными и сытными!"
    }
  ];

  return (
    <footer className={`border-t pt-14 pb-12 transition-colors ${
      theme === 'light' ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-panda-dark border-white/5 text-white'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Rich SEO Content Section with Barnaul keywords */}
        <div className={`mb-12 rounded-3xl border p-6 sm:p-8 ${
          theme === 'light' ? 'bg-white border-zinc-200/80 shadow-sm' : 'border-white/5 bg-white/[0.01]'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className={`font-display text-lg sm:text-xl font-bold flex items-center gap-2 ${
                theme === 'light' ? 'text-zinc-900' : 'text-white'
              }`}>
                <Sparkles className="h-4.5 w-4.5 text-panda-orange animate-pulse" />
                <span>Суши Панда — Премиум доставка суши и роллов в Барнауле</span>
              </h3>
              <p className={`text-xs max-w-4xl ${
                theme === 'light' ? 'text-zinc-600' : 'text-white/50'
              }`}>
                Ищете где заказать самые свежие и вкусные суши в Барнауле? Суши Панда — ваш лучший выбор. Мы предлагаем премиальное качество по доступным ценам, быструю круглосуточную обработку заказов и мгновенную курьерскую доставку.
              </p>
            </div>
            <button
              onClick={() => setIsSeoExpanded(!isSeoExpanded)}
              className={`flex items-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-start md:self-auto ${
                theme === 'light' ? 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <span>{isSeoExpanded ? 'Скрыть описание' : 'Подробнее о доставке'}</span>
              {isSeoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {isSeoExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`overflow-hidden mt-6 pt-6 border-t space-y-6 ${theme === 'light' ? 'border-zinc-200' : 'border-white/5'}`}
              >
                {/* SEO Text columns */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed ${
                  theme === 'light' ? 'text-zinc-600' : 'text-white/40'
                }`}>
                  <div className="space-y-3">
                    <p>
                      Современный ритм жизни диктует свои правила, и порой на приготовление ужина совсем не остается сил. Именно поэтому <strong className={theme === 'light' ? 'text-zinc-900 font-bold' : 'text-white'}>быстрая доставка суши в Барнауле</strong> от компании Суши Панда станет идеальным решением для любого повода — будь то романтический ужин, весёлая дружеская вечеринка или обеденный перерыв в офисе.
                    </p>
                    <p>
                      Мы специализируемся на приготовлении традиционных и авторских блюд японской кухни. Наше меню включает в себя роскошные запеченные сеты, классические роллы «Филадельфия» с толстым слоем лосося, пикантную «Калифорнию» со снежным крабом, хрустящие темпура-роллы, а также азиатскую лапшу Wok и горячую неаполитанскую пиццу. Каждый кусочек — это истинное гастрономическое удовольствие!
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p>
                      Выбирая нас, вы получаете безупречный сервис: <strong className={theme === 'light' ? 'text-zinc-900 font-bold' : 'text-white'}>заказать роллы в Барнауле недорого</strong> теперь можно всего в пару кликов. Благодаря интуитивно понятному интерфейсу нашего сайта и автоматическому подтягиванию сохраненных адресов, оформление покупки займет не более минуты.
                    </p>
                    <p>
                      Мы гордимся своей логистикой. Наши курьеры превосходно знают карту Барнаула и доставят ваш заказ горячим и свежим в Индустриальный, Октябрьский, Ленинский, Железнодорожный и Центральный районы в течение 45 минут. Попробуйте Суши Панда сегодня — ощутите вкус настоящего кулинарного искусства!
                    </p>
                  </div>
                </div>

                {/* Structured QA Accordion */}
                <div className={`space-y-4 pt-4 border-t ${theme === 'light' ? 'border-zinc-200' : 'border-white/5'}`}>
                  <h4 className={`font-display font-bold text-sm flex items-center gap-2 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    <HelpCircle className="h-4 w-4 text-panda-orange" />
                    <span>Часто задаваемые вопросы (FAQ)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {barnaulFaqs.map((faq, idx) => (
                      <div key={idx} className={`rounded-2xl border p-4 space-y-1.5 ${
                        theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'border-white/5 bg-white/[0.005]'
                      }`}>
                        <p className={`font-bold text-xs ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{faq.question}</p>
                        <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-zinc-600' : 'text-white/40'}`}>{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Upper grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b ${theme === 'light' ? 'border-zinc-200' : 'border-white/5'}`}>
          
          {/* Col 1: About */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-panda-orange text-white font-mono font-bold text-xs shadow-md">
                PB
              </div>
              <span className={`font-display text-xl font-semibold italic tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                Суши Панда<span className="text-panda-orange">.</span>
              </span>
            </a>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-zinc-600' : 'text-white/40'}`}>
              Служба доставки премиальных суши, сочных роллов, горячей пиццы и Wok в Барнауле с 2013 года (PandaBAR). Свежий мурманский лосось, натуральный творожный сыр и приготовление блюд «из-под ножа».
            </p>
            <div>
              <a
                href="https://vk.ru/panda_bar_barnaul"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0077FF]/15 hover:bg-[#0077FF] text-[#4B9EFF] hover:text-white border border-[#0077FF]/30 text-xs font-bold transition-all shadow-sm group cursor-pointer"
              >
                <VkIcon className="h-4 w-4" />
                <span>Мы во ВКонтакте: vk.ru/panda_bar_barnaul</span>
              </a>
            </div>
          </div>

          {/* Col 2: Support contact details */}
          <div className={`lg:col-span-3 space-y-3 text-xs ${theme === 'light' ? 'text-zinc-700' : 'text-white/60'}`}>
            <h4 className={`font-display font-extrabold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Контакты и Служба</h4>
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-panda-orange shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div>
                  <a href="tel:+73852600417" className={`font-black font-mono text-sm hover:text-panda-orange transition-colors ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    600-417
                  </a>
                  <span className="text-[10px] text-white/40 block">Городской телефон в Барнауле</span>
                </div>
                <div>
                  <a href="tel:+79833526972" className={`font-bold font-mono hover:text-panda-orange transition-colors ${theme === 'light' ? 'text-zinc-900' : 'text-panda-gold'}`}>
                    +7 (983) 352-69-72
                  </a>
                  <span className="text-[10px] text-white/40 block">Мобильный оператор</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-panda-orange shrink-0" />
              <div>
                <p className={`font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>10:00 — 22:00</p>
                <p className={`text-[10px] ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'}`}>Барнаул, без перерывов и выходных</p>
              </div>
            </div>
            {onOpenAbout && (
              <div className="pt-1">
                <button
                  onClick={onOpenAbout}
                  className="text-xs text-panda-orange hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>→ О нас & Юридические реквизиты</span>
                </button>
              </div>
            )}
          </div>

          {/* Col 3: Delivery Zones */}
          <div className={`lg:col-span-3 space-y-3 text-xs ${theme === 'light' ? 'text-zinc-700' : 'text-white/60'}`}>
            <h4 className={`font-display font-extrabold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Адреса и Доставка</h4>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-panda-orange shrink-0 mt-0.5" />
              <div>
                <p className={`font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>г. Барнаул, ул. Власихинская, 103</p>
                <p className={`text-[10px] ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'}`}>Филиал: пр-т. Калинина, 116/10</p>
              </div>
            </div>
            <p className={`text-[10px] leading-relaxed pl-6 ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'}`}>
              Бесплатная доставка при заказе от 600 ₽ (Зеленая зона) и от 1000 ₽ по городу за 45-60 минут в термосумках. Доступен быстрый самовывоз.
            </p>
          </div>

          {/* Col 4: Scroll up */}
          <div className="lg:col-span-2 flex items-center justify-center lg:justify-end">
            <button
              onClick={scrollToTop}
              className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer group ${
                theme === 'light' ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-panda-orange hover:text-white hover:border-panda-orange shadow-sm' : 'bg-white/5 border-white/10 hover:bg-panda-orange hover:text-white hover:border-panda-orange text-white/60'
              }`}
              title="Наверх"
            >
              <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* Lower row */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'}`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>© 2013-2026 PandaBAR / Суши Панда. ИП Меликишвили Карина Гиоргиевна (ОГРНИП 325220200036107, ИНН 22791073)</p>
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="text-[11px] underline opacity-70 hover:opacity-100 hover:text-panda-orange transition-all cursor-pointer"
              >
                О нас & Реквизиты
              </button>
            )}
            {onOpenStaffAuth && (
              <button
                onClick={onOpenStaffAuth}
                className="text-[11px] opacity-40 hover:opacity-100 hover:text-panda-orange transition-all cursor-pointer flex items-center gap-1"
                title="Служебный вход для персонала"
              >
                <Lock className="h-3 w-3" />
                <span>Служебный вход</span>
              </button>
            )}
          </div>
          <p className="flex items-center gap-1">
            <span>Создано с заботой и</span>
            <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
            <span>для любителей настоящих суши</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
