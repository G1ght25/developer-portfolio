/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Clock, MapPin, ShieldCheck, Award, ExternalLink, CheckCircle2 } from 'lucide-react';

export function VkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.073 2H8.927C4.184 2 2 4.184 2 8.927v6.146C2 19.816 4.184 22 8.927 22h6.146C19.816 22 22 19.816 22 15.073V8.927C22 4.184 19.816 2 15.073 2zm3.328 14.526h-1.638c-.62 0-.81-.494-1.926-1.611-.97-.946-1.4-1.066-1.638-1.066-.334 0-.429.095-.429.549v1.503c0 .357-.114.625-1.049.625-1.55 0-3.267-.946-4.48-2.695-1.83-2.614-2.33-4.577-2.33-4.982 0-.226.095-.436.548-.436h1.639c.408 0 .563.187.72.624.786 2.278 2.1 4.276 2.645 4.276.205 0 .3-.095.3-.615v-2.39c-.062-1.096-.644-1.189-.644-1.579 0-.18.152-.361.399-.361h2.573c.348 0 .47.18.47.587v3.228c0 .348.152.47.252.47.205 0 .376-.12.753-.494 1.164-1.289 1.99-3.284 1.99-3.284.11-.237.29-.408.7-.408h1.639c.494 0 .6.248.494.597-.195.91-2.106 3.612-2.196 3.757-.225.334-.312.485 0 .9.225.297.962 1.002 1.455 1.572 1.025 1.135 1.625 2.083 1.815 2.502.106.357-.08.549-.553.549z" />
    </svg>
  );
}

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export default function AboutModal({ isOpen, onClose, theme = 'dark' }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 my-auto overflow-hidden ${
            theme === 'light' 
              ? 'bg-white border-zinc-200 text-zinc-900' 
              : 'bg-panda-charcoal border-white/10 text-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-5 border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panda-orange text-white font-mono font-bold text-sm shadow-md">
                PB
              </div>
              <div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                  О нас & Реквизиты
                </h3>
                <p className="text-xs text-white/50">
                  Служба доставки «Суши Панда» (PandaBAR) в Барнауле
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-1">
            
            {/* 1. Summary description */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-panda-orange font-bold text-sm">
                <Award className="h-4 w-4" />
                <span>Готовим и доставляем для вас с 2013 года</span>
              </div>
              <p className="text-white/70 leading-relaxed text-xs">
                «Суши Панда» — это популярный сервис доставки суши, сочных роллов, горячей пиццы и ароматного Wok в городе Барнаул. 
                Мы используем только свежий мурманский лосось, натуральный творожный сыр и отборный рис. 
                Все блюда готовятся исключительно «из-под ножа» сразу после оформления заказа.
              </p>
            </div>

            {/* 2. Contacts and VK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phones & Schedule */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Phone className="h-4 w-4 text-panda-orange" />
                  <span>Телефоны приема заказов</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <a 
                      href="tel:+73852600417" 
                      className="text-lg font-black font-mono text-white hover:text-panda-orange transition-colors block"
                    >
                      600-417
                    </a>
                    <span className="text-[10px] text-white/40">Городской телефон в Барнауле</span>
                  </div>
                  <div>
                    <a 
                      href="tel:+79833526972" 
                      className="text-base font-bold font-mono text-panda-gold hover:text-panda-orange transition-colors block"
                    >
                      +7 (983) 352-69-72
                    </a>
                    <span className="text-[10px] text-white/40">Мобильный оператор приема заказов</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-white/60">
                  <Clock className="h-3.5 w-3.5 text-panda-orange shrink-0" />
                  <span>Барнаул: с <strong>10:00</strong> до <strong>22:00</strong> (ежедневно)</span>
                </div>
              </div>

              {/* Social VK card */}
              <div className="bg-gradient-to-br from-[#0077FF]/15 to-transparent rounded-2xl p-4 border border-[#0077FF]/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4B9EFF] uppercase tracking-wider">
                    <VkIcon className="h-4 w-4" />
                    <span>Мы ВКонтакте</span>
                  </div>
                  <p className="text-white/70 text-xs">
                    Подписывайтесь на нашу официальную группу ВК! Акции, розыгрыши сетов, секретные промокоды и отзывы реальных клиентов.
                  </p>
                </div>

                <a
                  href="https://vk.ru/panda_bar_barnaul"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0077FF] hover:bg-[#0066DD] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0077FF]/20 transition-all cursor-pointer active:scale-95"
                >
                  <VkIcon className="h-4 w-4" />
                  <span>vk.ru/panda_bar_barnaul</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* 3. Addresses */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-panda-orange" />
                <span>Адреса и самовывоз в Барнауле</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70 pt-1">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <strong className="text-white block mb-0.5">г. Барнаул, ул. Власихинская, 103</strong>
                  <span className="text-[11px] text-white/40">Юридический адрес и основное производство</span>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <strong className="text-white block mb-0.5">г. Барнаул, пр-т. Калинина, 116/10</strong>
                  <span className="text-[11px] text-white/40">Филиал и точка самовывоза</span>
                </div>
              </div>
            </div>

            {/* 4. Legal Details (Реквизиты) */}
            <div className="bg-black/40 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Юридическая информация и реквизиты</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-white/40 block text-[11px]">Индивидуальный предприниматель:</span>
                  <span className="font-bold text-white">Меликишвили Карина Гиоргиевна</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px]">ОГРНИП:</span>
                  <span className="font-mono font-bold text-white">325220200036107</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px]">ИНН:</span>
                  <span className="font-mono font-bold text-white">22791073</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px]">ОКВЭД:</span>
                  <span className="font-bold text-white">56.10 (Деятельность ресторанов и услуг по доставке продуктов питания)</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-white/5">
                  <span className="text-white/40 block text-[11px]">Юридический адрес:</span>
                  <span className="text-white">Алтайский край, г. Барнаул, ул. Власихинская, 103</span>
                </div>
                <div className="sm:col-span-2 text-[11px] text-white/30 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Верификация: VK:49865 / VK49865 / BK49865</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer of modal */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span>© 2013-2026 PandaBAR / Суши Панда</span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
