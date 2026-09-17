/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  User, 
  Phone, 
  Clock, 
  Zap, 
  Menu, 
  X, 
  LogOut, 
  Check, 
  Volume2, 
  VolumeX, 
  Search, 
  ChevronDown,
  Info
} from 'lucide-react';
import { CartItem, User as UserType, KitchenStatus } from '../types';
import { VkIcon } from './AboutModal';

interface HeaderProps {
  cart: CartItem[];
  onOpenCart: () => void;
  currentUser: UserType | null;
  onOpenProfile: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme?: 'dark' | 'light';
  isModalOpen?: boolean;
  kitchenStatus?: KitchenStatus;
  isConnected?: boolean;
  onOpenAbout?: () => void;
}

export default function Header({
  cart,
  onOpenCart,
  currentUser,
  onOpenProfile,
  onLogout,
  onSearch,
  searchQuery,
  soundEnabled,
  onToggleSound,
  theme = 'dark',
  isModalOpen = false,
  kitchenStatus,
  isConnected = true,
  onOpenAbout,
}: HeaderProps) {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackSuccess(true);
    setTimeout(() => {
      setIsCallbackOpen(false);
      setCallbackSuccess(false);
      setCallbackPhone('');
    }, 2200);
  };

  const displayName = currentUser?.name || 'Никита';

  return (
    <>
      {/* Kitchen Emergency Alert */}
      {kitchenStatus && !kitchenStatus.isOpen && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-2.5 px-4 shadow-lg border-b border-red-700/50 relative z-50">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>
                <strong>Приём заказов временно приостановлен кухней!</strong>{' '}
                {kitchenStatus.pauseReason ? `(${kitchenStatus.pauseReason})` : 'Приносим извинения за неудобства.'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
              <span>Стоп-заказ</span>
            </div>
          </div>
        </div>
      )}

      {/* Offline Alert */}
      {!isConnected && (
        <div className="bg-amber-500 text-black py-1.5 px-4 text-xs font-bold text-center border-b border-amber-600 z-50">
          ⚡ Нет соединения с сервером. Восстановление связи...
        </div>
      )}

      {/* Top Navbar */}
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isModalOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        } bg-[#0d0e12]/92 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]`}
      >
        <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            
            {/* 1. ЛОГОТИП (СЛЕВА) */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              <a href="#" className="flex items-center gap-2.5 sm:gap-3.5 group">
                <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E53935] to-[#B71C1C] text-white font-black text-sm shadow-[0_4px_18px_rgba(229,57,53,0.35)] transition-transform duration-300 group-hover:scale-105 border border-white/15 shrink-0">
                  <span className="tracking-tighter font-mono text-base">🐼</span>
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-[#FF4D4D] transition-colors leading-tight font-sans">
                    Суши Панда
                  </span>
                  <span className="hidden sm:inline text-[9px] sm:text-[10px] font-bold tracking-[0.18em] uppercase text-white/45 group-hover:text-white/60 transition-colors">
                    СУШИ & WOK ПРЕМИУМ • БАРНАУЛ
                  </span>
                </div>
              </a>
            </div>

            {/* 2. ИНФОРМАЦИОННЫЕ МОДУЛИ (ПО ЦЕНТРУ - DESKTOP) */}
            <div className="hidden xl:flex items-center gap-6 px-6 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              {/* Режим работы */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-white tracking-wide">10:00 — 22:00</span>
                  <span className="text-[10px] font-medium text-white/40">Барнаул • ежедневно</span>
                </div>
              </div>

              <div className="h-7 w-[1px] bg-white/[0.08]" />

              {/* Скорость доставки */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Zap className="h-4 w-4 fill-emerald-400/20" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-white tracking-wide">Доставка от 45 мин</span>
                  <span className="text-[10px] font-medium text-emerald-400/90">или ролл в подарок</span>
                </div>
              </div>

              <div className="h-7 w-[1px] bg-white/[0.08]" />

              {/* Контакты */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E53935]/10 border border-[#E53935]/20 text-[#FF4D4D] shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-2">
                    <a 
                      href="tel:+73852600417" 
                      className="text-xs font-black text-white hover:text-[#FF4D4D] transition-colors font-mono tracking-tight"
                      title="Позвонить: 600-417"
                    >
                      600-417
                    </a>
                    <span className="text-white/20 text-[11px]">•</span>
                    <a 
                      href="tel:+79833526972" 
                      className="text-xs font-bold text-white/80 hover:text-white transition-colors font-mono tracking-tight"
                      title="Позвонить: +7 (983) 352-69-72"
                    >
                      +7 (983) 352-69-72
                    </a>
                  </div>
                  <span className="text-[10px] font-medium text-white/40">Звонок бесплатный</span>
                </div>
              </div>
            </div>

            {/* Быстрый поиск в шапке (для экранов >= 1024px) */}
            <div className="hidden lg:flex xl:hidden 2xl:flex relative max-w-[210px] w-full">
              <input
                type="text"
                placeholder="Поиск роллов..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF4D4D] focus:bg-white/[0.08] transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/35 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute right-2.5 top-2.5 text-[10px] text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 3. КНОПКИ ДЕЙСТВИЙ (СПРАВА) */}
            <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
              
              {/* VK Button */}
              <a
                href="https://vk.ru/panda_bar_barnaul"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0077FF]/12 hover:bg-[#0077FF]/20 text-[#4B9EFF] hover:text-white border border-[#0077FF]/25 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                title="Официальная группа ВКонтакте"
              >
                <VkIcon className="h-4 w-4" />
                <span className="hidden xl:inline">VK</span>
              </a>

              {/* О нас */}
              {onOpenAbout && (
                <button
                  onClick={onOpenAbout}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
                >
                  О нас
                </button>
              )}

              {/* Заказать звонок (Ghost/Outline) */}
              <button
                onClick={() => setIsCallbackOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#FF4D4D] hover:text-white bg-[#E53935]/10 hover:bg-[#E53935] border border-[#E53935]/30 hover:border-[#E53935] transition-all cursor-pointer shadow-sm"
              >
                Заказать звонок
              </button>

              {/* ASMR Sound toggle */}
              <button
                onClick={onToggleSound}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#E53935]/15 border-[#E53935]/30 text-[#FF4D4D] hover:bg-[#E53935]/25'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]'
                }`}
                title={soundEnabled ? "Отключить ASMR звуки" : "Включить ASMR звуки"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Профиль пользователя */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-black">
                    {displayName.charAt(0)}
                  </div>
                  <span className="max-w-[85px] truncate font-medium">{displayName}</span>
                  <ChevronDown className={`h-3 w-3 text-white/40 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#14161b] border border-white/[0.12] p-2 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-50 flex flex-col gap-1"
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                        <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Личный кабинет</p>
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/85 hover:text-white hover:bg-white/[0.06] transition-all text-left cursor-pointer"
                      >
                        <User className="h-4 w-4 text-[#FF4D4D]" />
                        <span>Мои заказы & профиль</span>
                      </button>

                      {onOpenAbout && (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onOpenAbout();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/85 hover:text-white hover:bg-white/[0.06] transition-all text-left cursor-pointer"
                        >
                          <Info className="h-4 w-4 text-amber-400" />
                          <span>О компании</span>
                        </button>
                      )}

                      {currentUser && (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onLogout();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left cursor-pointer border-t border-white/[0.06] mt-1"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Выйти</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ЯРКАЯ КРАСНАЯ КОРЗИНА-КАПСУЛА */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2.5 px-4 lg:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E53935] to-[#FF4D4D] hover:from-[#d32f2f] hover:to-[#ff3333] text-white text-xs sm:text-sm font-black shadow-[0_4px_22px_rgba(229,57,53,0.38)] hover:shadow-[0_6px_28px_rgba(229,57,53,0.55)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white/20 shrink-0"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4 text-white" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#E53935] shadow-md animate-pulse">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
                <span className="tracking-tight">Корзина</span>
                <span className="text-white/30">•</span>
                <span className="font-mono tracking-tight text-white font-black">
                  {cartTotal.toLocaleString('ru-RU')} ₽
                </span>
              </button>

            </div>

            {/* MOBILE HEADER CONTROLS (< 768px) */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Phone quick link */}
              <a
                href="tel:+73852600417"
                className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:text-[#FF4D4D] transition-colors shrink-0"
                title="Позвонить: 600-417"
              >
                <Phone className="h-4 w-4" />
              </a>

              {/* Mobile Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E53935] to-[#FF4D4D] text-white text-xs font-black shadow-md border border-white/20 active:scale-95 shrink-0 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="font-mono">{cartTotal > 0 ? `${cartTotal.toLocaleString('ru-RU')} ₽` : '0 ₽'}</span>
                {cartItemsCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#E53935] px-1 font-mono">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Mobile Burger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-all shrink-0 cursor-pointer"
                aria-label="Меню навигации"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE MENU DROPDOWN (< 768px) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/[0.08] bg-[#14161b]/98 backdrop-blur-2xl px-4 py-5 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                
                {/* Mobile Search */}
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Поиск роллов и Wok..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF4D4D]"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                </div>

                {/* Hours & Delivery Info */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    <div className="text-[11px] leading-tight">
                      <p className="font-bold text-white">10:00 — 22:00</p>
                      <p className="text-white/40">Барнаул</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="text-[11px] leading-tight">
                      <p className="font-bold text-white">От 45 минут</p>
                      <p className="text-emerald-400">или ролл в подарок</p>
                    </div>
                  </div>
                </div>

                {/* Phones */}
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Прямой номер доставки:</p>
                  <div className="flex items-center justify-between">
                    <a href="tel:+73852600417" className="text-base font-black text-white font-mono flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#FF4D4D]" />
                      600-417
                    </a>
                    <a href="tel:+79833526972" className="text-xs font-bold text-white/70 font-mono">
                      +7 (983) 352-69-72
                    </a>
                  </div>
                </div>

                {/* Action Links */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://vk.ru/panda_bar_barnaul"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0077FF]/15 border border-[#0077FF]/30 text-[#4B9EFF] text-xs font-bold"
                  >
                    <VkIcon className="h-4 w-4" />
                    <span>Мы в VK</span>
                  </a>

                  {onOpenAbout && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAbout();
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold"
                    >
                      <Info className="h-4 w-4 text-amber-400" />
                      <span>О нас</span>
                    </button>
                  )}
                </div>

                {/* Call request & ASMR */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCallbackOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#E53935]/15 border border-[#E53935]/30 text-[#FF4D4D] font-bold text-xs"
                  >
                    Заказать звонок
                  </button>

                  <button
                    onClick={onToggleSound}
                    className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
                      soundEnabled
                        ? 'bg-[#E53935]/15 border-[#E53935]/30 text-[#FF4D4D]'
                        : 'bg-white/[0.05] border-white/[0.08] text-white/50'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span>ASMR</span>
                  </button>
                </div>

                {/* User Profile */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold mt-1"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-[#FF4D4D]" />
                    <span>Личный кабинет ({displayName})</span>
                  </div>
                  <ChevronDown className="h-4 w-4 -rotate-90 text-white/40" />
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modal: Callback Request */}
      <AnimatePresence>
        {isCallbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCallbackOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-[#14161b] border border-white/[0.12] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10"
            >
              <button
                onClick={() => setIsCallbackOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E53935]/15 border border-[#E53935]/30 text-[#FF4D4D]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Заказ обратного звонка</h3>
                  <p className="text-xs text-white/50">Перезвоним за 2-3 минуты</p>
                </div>
              </div>

              {callbackSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Check className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-white">Заявка принята!</h4>
                  <p className="text-xs text-white/60 max-w-xs">
                    Оператор Суши Панда уже набирает ваш номер. Пожалуйста, ожидайте звонка.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="flex flex-col gap-4 mt-2">
                  <p className="text-xs text-white/60 leading-relaxed">
                    Оставьте ваш номер телефона — администратор свяжется с вами, поможет оформить заказ и ответит на любые вопросы по меню.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                      Номер телефона
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (999) 000-00-00"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF4D4D] focus:bg-white/[0.08] transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E53935] to-[#FF4D4D] hover:from-[#d32f2f] hover:to-[#ff3333] text-white font-bold text-sm shadow-[0_4px_20px_rgba(229,57,53,0.4)] transition-all active:scale-[0.98]"
                  >
                    Жду звонка
                  </button>
                  <p className="text-[10px] text-center text-white/40">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
