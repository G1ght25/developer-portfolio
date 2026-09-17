/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, Phone, MapPin, ClipboardList, CheckCircle, Clock, 
  Flame, Sparkles, ChefHat, Truck, Store, ChevronDown, Check, LogOut,
  AlertCircle, ShieldCheck, Play, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';
import { Order, OrderStatus, StatusTimelineEvent, User } from '../types';
import { formatPhone } from '../utils/phoneFormatter';
import { getAuthHeaders } from '../utils/auth';

interface UserProfileProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  activeOrder: Order | null;
  onUpdateActiveOrder: (order: Order) => void;
}

export default function UserProfile({
  currentUser,
  onLoginSuccess,
  onLogout,
  activeOrder,
  onUpdateActiveOrder
}: UserProfileProps) {
  // Login / Register Form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile management states
  const [activeTab, setActiveTab] = useState<'tracking' | 'history' | 'settings'>('tracking');
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Address edit state
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [intercom, setIntercom] = useState('');
  const [profileName, setProfileName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingAddressInline, setIsEditingAddressInline] = useState(false);

  // Sync profile details when user changes
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setStreet(currentUser.address?.street || '');
      setHouse(currentUser.address?.house || '');
      setApartment(currentUser.address?.apartment || '');
      setEntrance(currentUser.address?.entrance || '');
      setFloor(currentUser.address?.floor || '');
      setIntercom(currentUser.address?.intercom || '');
      
      // Auto-toggle editor if no address is set yet
      if (!currentUser.address?.street) {
        setIsEditingAddressInline(true);
      } else {
        setIsEditingAddressInline(false);
      }
      
      // Fetch initial history
      fetchOrderHistory();
    }
  }, [currentUser]);

  // Real-time automatic polling for the active order status (every 3 seconds)
  useEffect(() => {
    if (!currentUser || !activeOrder) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${activeOrder.id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success && data.order) {
          onUpdateActiveOrder(data.order);
        }
      } catch (err) {
        console.error('Polling error for active order:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, activeOrder]);

  const fetchOrderHistory = async () => {
    if (!currentUser) return;
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        // Filter out completed/cancelled for active tab or display everything in history
        setOrdersHistory(data.orders);
        
        // If there's an active order in the list, set it
        const currentActive = data.orders.find((o: Order) => o.status !== 'completed' && o.status !== 'cancelled');
        if (currentActive && (!activeOrder || activeOrder.status !== currentActive.status)) {
          onUpdateActiveOrder(currentActive);
        }
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) {
      setError('Введите номер телефона');
      return;
    }
    if (!passwordInput) {
      setError('Введите пароль');
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'register'
        ? { phone: phoneInput, password: passwordInput, name: nameInput.trim() || 'Гость' }
        : { phone: phoneInput, password: passwordInput };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success && data.user) {
        if (data.user.token) {
          localStorage.setItem('pandabar_auth_token', data.user.token);
        }
        localStorage.setItem('pandabar_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        if (response.status === 409 && authMode === 'register') {
          setError('Этот номер уже зарегистрирован. Переключаем на вход...');
          setTimeout(() => {
            setAuthMode('login');
            setError(null);
          }, 1400);
        } else {
          setError(data.error || (authMode === 'register' ? 'Ошибка регистрации' : 'Ошибка входа'));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка подключения к серверу. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    setSaveSuccess(false);
    setError(null);

    const payload = {
      userId: currentUser.id,
      name: profileName,
      address: {
        street,
        house,
        apartment,
        entrance,
        floor,
        intercom
      }
    };

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.user); // update parent user state
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        setError(data.error || 'Ошибка сохранения профиля');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setError('Ошибка соединения с сервером при сохранении профиля.');
    } finally {
      setIsSavingProfile(false);
    }
  };



  // Define Stepper Steps based on order type (delivery vs pickup)
  const getStepperSteps = (type: 'delivery' | 'pickup') => {
    const common = [
      { status: 'pending', label: 'Принят', icon: Clock, desc: 'Ожидает повара' },
      { status: 'confirmed', label: 'Подтвержден', icon: ShieldCheck, desc: 'Проверен оператором' },
      { status: 'cooking', label: 'Готовится', icon: ChefHat, desc: 'Наши сушисты крутят роллы' }
    ];

    if (type === 'delivery') {
      return [
        ...common,
        { status: 'delivering', label: 'В пути', icon: Truck, desc: 'Курьер мчится по адресу' },
        { status: 'completed', label: 'Доставлен', icon: CheckCircle, desc: 'Приятного аппетита!' }
      ];
    } else {
      return [
        ...common,
        { status: 'ready', label: 'Готов к выдаче', icon: Store, desc: 'Заберите ваш заказ' },
        { status: 'completed', label: 'Получен', icon: CheckCircle, desc: 'Приятного аппетита!' }
      ];
    }
  };

  // Get index of current status to highlight steps
  const getActiveStepIndex = (currentStatus: OrderStatus, steps: any[]) => {
    if (currentStatus === 'cancelled') return -1;
    let statusToFind = currentStatus;
    // Map 'ready' to 'cooking' step for delivery orders if 'ready' is not in the stepper
    if (currentStatus === 'ready' && !steps.some(step => step.status === 'ready')) {
      statusToFind = 'cooking';
    }
    return steps.findIndex(step => step.status === statusToFind);
  };

  // --- RENDERS ---

  // 1. LOGGED-OUT LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/10 bg-panda-charcoal p-8 shadow-2xl relative"
        >
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-panda-orange to-panda-gold text-2xl shadow-lg mb-4">
              🐼
            </div>
            <h3 className="font-display text-xl font-black text-white">Личный кабинет</h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              Отслеживайте статус заказа в реальном времени и сохраняйте адреса доставки
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/5 border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'login' ? 'bg-panda-orange text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register' ? 'bg-panda-orange text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Ваше Имя
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Как к вам обращаться"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                  />
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                Номер Телефона
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  required
                  placeholder="+7 (999) 123-45-67"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
                  onInput={(e) => setPhoneInput(formatPhone((e.target as HTMLInputElement).value))}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                {authMode === 'register' ? 'Придумайте пароль' : 'Пароль'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onInput={(e) => setPasswordInput((e.target as HTMLInputElement).value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                />
                <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !phoneInput || !passwordInput}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-sm font-extrabold shadow-lg shadow-panda-orange/15 hover:shadow-panda-orange/25 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Подождите...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'register' ? 'Создать аккаунт' : 'Войти'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. LOGGED-IN PANEL
  const stepperSteps = activeOrder ? getStepperSteps(activeOrder.type) : [];
  const activeStepIdx = activeOrder ? getActiveStepIndex(activeOrder.status, stepperSteps) : -1;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header Greeting */}
      <div className="rounded-3xl border border-white/5 bg-panda-charcoal/40 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-panda-orange to-panda-gold text-2xl shadow-lg font-black font-display text-panda-dark">
            {(currentUser.name || 'Гость').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-white">
              Рады видеть, {currentUser.name || 'Гость'}!
            </h3>

            <p className="text-xs text-white/50 mt-1 flex items-center justify-center md:justify-start gap-1">
              <Phone className="h-3.5 w-3.5 text-panda-orange" />
              <span>{currentUser.phone}</span>
              <span className="mx-1.5">•</span>
              <span>В клубе Суши Панда</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="h-10 px-4 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Выйти</span>
        </button>
      </div>


      {/* Tabs list */}
      <div className="flex gap-2.5 border-b border-white/5 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
            activeTab === 'tracking'
              ? 'bg-panda-orange text-white shadow-md'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
          }`}
        >
          Отслеживание заказа
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            fetchOrderHistory();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
            activeTab === 'history'
              ? 'bg-panda-orange text-white shadow-md'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
          }`}
        >
          История заказов ({ordersHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
            activeTab === 'settings'
              ? 'bg-panda-orange text-white shadow-md'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
          }`}
        >
          Адрес и Данные
        </button>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: TRACKING & STEPPER */}
        {activeTab === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {!activeOrder ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center flex flex-col items-center">
                <div className="text-4xl mb-3">🍣</div>
                <h4 className="font-display text-base font-bold text-white">Нет активных заказов</h4>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Когда вы оформите заказ на доставку или самовывоз, здесь появится подробный статус его приготовления и движения в реальном времени!
                </p>
              </div>
            ) : (
              <>
                {/* Real-time Order Stepper Widget */}
                <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 md:p-8 shadow-xl space-y-8 relative overflow-hidden">
                  
                  {/* Decorative glowing gradient ring */}
                  <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-panda-orange/5 blur-2xl pointer-events-none" />

                  {/* Header metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-panda-orange font-bold uppercase tracking-wider">Активный заказ</span>
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                      </div>
                      <h4 className="font-display text-lg font-black text-white mt-1">
                        Заказ #{activeOrder.id}
                      </h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-white/40 font-bold uppercase">Ожидаемое время</p>
                      <p className="font-display text-lg font-extrabold text-white mt-0.5 flex items-center gap-1.5 sm:justify-end">
                        <Clock className="h-4 w-4 text-panda-orange" />
                        <span>{activeOrder.estimatedTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* STEPPER DISPLAY */}
                  <div className="relative">
                    {/* Stepper Connecting Line */}
                    <div className="absolute top-[21px] left-5 sm:left-[21px] right-5 sm:right-[21px] h-0.5 bg-white/5 -z-10 hidden sm:block" />

                    {/* Desktop Stepper Horizontal */}
                    <div className="hidden sm:grid grid-cols-5 gap-2 relative">
                      {stepperSteps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx < activeStepIdx;
                        const isCurrent = idx === activeStepIdx;
                        const isPending = idx > activeStepIdx;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-500 ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : isCurrent
                                  ? 'bg-panda-orange border-panda-orange text-white orange-glow-strong scale-110 animate-pulse'
                                  : 'bg-panda-gray border-white/10 text-white/40'
                              }`}
                            >
                              {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : <StepIcon className="h-5 w-5" />}
                            </div>
                            <h5 className={`text-xs font-bold mt-3.5 transition-colors duration-300 ${isCurrent ? 'text-panda-orange' : isCompleted ? 'text-white' : 'text-white/40'}`}>
                              {step.label}
                            </h5>
                            <p className="text-[9px] text-white/30 mt-1 px-1 line-clamp-2 leading-normal">
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Stepper Vertical */}
                    <div className="flex sm:hidden flex-col gap-6 relative pl-8 border-l border-white/5">
                      {stepperSteps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx < activeStepIdx;
                        const isCurrent = idx === activeStepIdx;

                        return (
                          <div key={idx} className="relative flex flex-col">
                            {/* Marker dot */}
                            <div
                              className={`absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : isCurrent
                                  ? 'bg-panda-orange border-panda-orange text-white orange-glow scale-105'
                                  : 'bg-panda-gray border-white/10 text-white/30'
                              }`}
                            >
                              {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <StepIcon className="h-4 w-4" />}
                            </div>
                            <h5 className={`text-xs font-bold ${isCurrent ? 'text-panda-orange' : isCompleted ? 'text-white' : 'text-white/40'}`}>
                              {step.label}
                            </h5>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Timeline Logger (collapsible or static) */}
                  <div className="border-t border-white/5 pt-6 space-y-3.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Хронология событий</h5>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                      {[...activeOrder.statusTimeline].reverse().map((event, idx) => (
                        <div key={idx} className="flex justify-between gap-4 p-2.5 rounded-xl bg-white/5 text-xs">
                          <div>
                            <p className="font-semibold text-white">{event.title}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{event.description}</p>
                          </div>
                          <span className="text-[9px] font-mono text-white/30 shrink-0">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary of order products */}
                  <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Содержимое</p>
                      <div className="space-y-1 text-white/70">
                        {(activeOrder.items || []).map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.product?.name || 'Блюдо'} × {item.quantity || 1}</span>
                            <span className="font-semibold text-white">{((item.product?.price || 0) * (item.quantity || 1))} ₽</span>
                          </div>
                        ))}
                      </div>
                    </div>


                    <div className="space-y-2 border-l border-white/5 pl-0 md:pl-4 text-white/60">
                      <div className="flex justify-between">
                        <span>Тип заказа</span>
                        <span className="text-white font-semibold">{activeOrder.type === 'delivery' ? '🚗 Доставка' : '🏢 Самовывоз'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Куда</span>
                        <span className="text-white font-semibold max-w-[150px] truncate text-right">
                          {activeOrder.type === 'delivery' 
                            ? `ул. ${activeOrder.address?.street}, д. ${activeOrder.address?.house}` 
                            : activeOrder.pickupLocation}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Оплата</span>
                        <span className="text-white font-semibold">
                          {activeOrder.paymentMethod === 'cash' ? 'Наличные' : activeOrder.paymentMethod === 'card_courier' ? 'Картой' : 'Оплачено'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>


              </>
            )}
          </motion.div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {isHistoryLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 text-panda-orange animate-spin" />
              </div>
            ) : ordersHistory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
                <p className="text-sm text-white/40">У вас еще не было завершенных заказов.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordersHistory.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/5 bg-panda-charcoal/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Заказ #{order.id}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          order.status === 'completed' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : order.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-panda-orange/10 text-panda-orange border border-panda-orange/20'
                        }`}>
                          {order.status === 'completed' ? 'Доставлен' : order.status === 'cancelled' ? 'Отменен' : 'Активен'}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()} в {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-white/60 mt-2 line-clamp-1">
                        {(order.items || []).map(item => `${item.product?.name || 'Блюдо'} (x${item.quantity || 1})`).join(', ')}
                      </p>

                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <span className="block text-xs text-white/40">Сумма заказа</span>
                      <span className="block font-display text-base font-black text-white mt-0.5">
                        {order.total} ₽
                      </span>
                      {(order.status === 'completed' || order.status === 'cancelled') && (
                        <button
                          onClick={() => {
                            // Easily duplicate/reorder
                            onUpdateActiveOrder(order);
                            setActiveTab('tracking');
                          }}
                          className="mt-2 text-[10px] font-bold text-panda-orange hover:underline cursor-pointer"
                        >
                          Посмотреть хронологию
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: SETTINGS / SAVED ADDRESS */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 md:p-8 shadow-xl space-y-6">
              <h4 className="font-display text-base font-black text-white flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-panda-orange" />
                <span>Редактирование профиля и адреса</span>
              </h4>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Имя
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-panda-orange"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Телефон (нельзя изменить)
                  </label>
                  <input
                    type="tel"
                    disabled
                    value={currentUser.phone}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/5 text-sm text-white/30 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Delivery info */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Сохраненный адрес для доставки (ускоряет заказ)
                </h5>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8 sm:col-span-9">
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                      Улица
                    </label>
                    <input
                      type="text"
                      placeholder="Ленина"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                      Дом
                    </label>
                    <input
                      type="text"
                      placeholder="42к1"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                      Кв./Офис
                    </label>
                    <input
                      type="text"
                      placeholder="105"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                      Подъезд
                    </label>
                    <input
                      type="text"
                      placeholder="2"
                      value={entrance}
                      onChange={(e) => setEntrance(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                      Этаж
                    </label>
                    <input
                      type="text"
                      placeholder="5"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                      Домофон
                    </label>
                    <input
                      type="text"
                      placeholder="105к"
                      value={intercom}
                      onChange={(e) => setIntercom(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Submit addresses */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5 justify-end">
                {saveSuccess && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-400 font-bold flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Данные сохранены!</span>
                  </motion.span>
                )}
                <button
                  type="submit"
                  disabled={isSavingProfile || !profileName}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Сохранение...</span>
                    </>
                  ) : (
                    <span>Сохранить изменения</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
