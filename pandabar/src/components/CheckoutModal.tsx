/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, Store, CreditCard, DollarSign, MessageSquare, ShieldCheck, MapPin, Loader2, AlertCircle, Clock, Calendar, UtensilsCrossed } from 'lucide-react';
import { CartItem, PromoCode, Order, User, CutleryKits } from '../types';
import { formatPhone } from '../utils/phoneFormatter';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: 'delivery' | 'pickup';
  appliedPromo: PromoCode | null;
  discountAmount: number;
  onOrderSuccess: (order: Order, user?: User) => void;
  userPhone: string;
  userName: string;
  currentUser?: User | null;
  theme?: 'dark' | 'light';
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  orderType,
  appliedPromo,
  discountAmount,
  onOrderSuccess,
  userPhone,
  userName,
  currentUser,
  theme = 'dark'
}: CheckoutModalProps) {
  const [phone, setPhone] = React.useState('');
  const [name, setName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Timing states (ASAP vs Preorder)
  const [timingType, setTimingType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledDay, setScheduledDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Sushi Cutlery & Kits
  const [personsCount, setPersonsCount] = useState(2);
  const [chopsticksCount, setChopsticksCount] = useState(2);
  const [soySauceCount, setSoySauceCount] = useState(2);
  const [wasabiCount, setWasabiCount] = useState(2);
  const [gingerCount, setGingerCount] = useState(2);

  // Change from (for Cash payment)
  const [changeFrom, setChangeFrom] = useState('');
  
  // Delivery address states
  const [street, setStreet] = React.useState('');
  const [house, setHouse] = React.useState('');
  const [apartment, setApartment] = React.useState('');
  const [entrance, setEntrance] = React.useState('');
  const [floor, setFloor] = React.useState('');
  const [intercom, setIntercom] = React.useState('');

  const hasInitializedRef = React.useRef(false);

  // Auto-fill from profile or local storage when opened
  React.useEffect(() => {
    if (isOpen) {
      if (!hasInitializedRef.current) {
        // Retrieve local storage address backup
        let savedAddress: any = null;
        try {
          const stored = localStorage.getItem('pandabar_saved_address');
          if (stored) savedAddress = JSON.parse(stored);
        } catch (e) {}

        if (currentUser) {
          setName(currentUser.name || userName || '');
          setPhone(formatPhone(currentUser.phone || userPhone || ''));
          if (currentUser.address && currentUser.address.street) {
            setStreet(currentUser.address.street || '');
            setHouse(currentUser.address.house || '');
            setApartment(currentUser.address.apartment || '');
            setEntrance(currentUser.address.entrance || '');
            setFloor(currentUser.address.floor || '');
            setIntercom(currentUser.address.intercom || '');
          } else if (savedAddress) {
            setStreet(savedAddress.street || '');
            setHouse(savedAddress.house || '');
            setApartment(savedAddress.apartment || '');
            setEntrance(savedAddress.entrance || '');
            setFloor(savedAddress.floor || '');
            setIntercom(savedAddress.intercom || '');
          } else {
            setStreet(''); setHouse(''); setApartment(''); setEntrance(''); setFloor(''); setIntercom('');
          }
        } else {
          setName(userName || '');
          setPhone(formatPhone(userPhone || ''));
          if (savedAddress) {
            setStreet(savedAddress.street || '');
            setHouse(savedAddress.house || '');
            setApartment(savedAddress.apartment || '');
            setEntrance(savedAddress.entrance || '');
            setFloor(savedAddress.floor || '');
            setIntercom(savedAddress.intercom || '');
          } else {
            setStreet(''); setHouse(''); setApartment(''); setEntrance(''); setFloor(''); setIntercom('');
          }
        }
        hasInitializedRef.current = true;
      }
    } else {
      hasInitializedRef.current = false;
    }
  }, [isOpen, currentUser, userName, userPhone]);

  // Persist address changes to local storage
  React.useEffect(() => {
    if (street || house || apartment || entrance || floor || intercom) {
      localStorage.setItem('pandabar_saved_address', JSON.stringify({
        street, house, apartment, entrance, floor, intercom
      }));
    }
  }, [street, house, apartment, entrance, floor, intercom]);

  // Pickup location (Barnaul branches)
  const [pickupBranch, setPickupBranch] = useState('г. Барнаул, ул. Власихинская, д. 103 (Основное производство, 10:00 - 22:00)');

  // Local activeOrderType allowing toggling delivery / pickup inside checkout
  const [activeOrderType, setActiveOrderType] = useState<'delivery' | 'pickup'>(orderType);
  React.useEffect(() => {
    setActiveOrderType(orderType);
  }, [orderType]);

  // Validation refs and field error indicators
  const nameRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const streetRef = React.useRef<HTMLInputElement>(null);
  const houseRef = React.useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    phone?: boolean;
    street?: boolean;
    house?: boolean;
  }>({});

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_courier'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate available 30-min time slots considering cooking + delivery window and kitchen hours (10:00 - 22:00)
  const availableTimeSlots = useMemo(() => {
    const slots: string[] = [];
    const now = new Date();

    const minPrepMinutes = activeOrderType === 'delivery' ? 60 : 30;
    const earliestTime = new Date(now.getTime() + minPrepMinutes * 60 * 1000);

    for (let h = 10; h <= 21; h++) {
      for (let m of [0, 30]) {
        if (h === 21 && m > 30) continue;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        
        if (scheduledDay === 'today') {
          const slotDate = new Date();
          slotDate.setHours(h, m, 0, 0);
          if (slotDate.getTime() > earliestTime.getTime()) {
            slots.push(timeStr);
          }
        } else {
          // Tomorrow slots are always available within operating hours
          slots.push(timeStr);
        }
      }
    }
    return slots;
  }, [scheduledDay, activeOrderType]);

  // Set default slot if none chosen or current became invalid
  React.useEffect(() => {
    if (timingType === 'scheduled' && (!selectedTimeSlot || !availableTimeSlots.includes(selectedTimeSlot))) {
      if (availableTimeSlots.length > 0) {
        setSelectedTimeSlot(availableTimeSlots[0]);
      }
    }
  }, [timingType, scheduledDay, availableTimeSlots, selectedTimeSlot]);

  // Items and pricing
  const itemsTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const effectiveDiscount = activeOrderType === 'pickup' && !appliedPromo 
    ? Math.round(itemsTotal * 0.1) 
    : discountAmount;
  const deliveryFee = activeOrderType === 'delivery' ? (itemsTotal >= 1000 ? 0 : 150) : 0;
  const finalTotal = Math.max(0, itemsTotal - effectiveDiscount + deliveryFee);

  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: typeof fieldErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = true;
      setFieldErrors(newErrors);
      setError('Пожалуйста, укажите ваше имя (минимум 2 буквы)');
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameRef.current?.focus();
      return;
    }

    const digitsCount = phone.replace(/\D/g, '').length;
    if (!phone || digitsCount < 11) {
      newErrors.phone = true;
      setFieldErrors(newErrors);
      setError('Пожалуйста, укажите полный номер телефона (11 цифр)');
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      phoneRef.current?.focus();
      return;
    }

    if (activeOrderType === 'delivery') {
      if (!street.trim()) {
        newErrors.street = true;
        setFieldErrors(newErrors);
        setError('Пожалуйста, укажите улицу доставки');
        streetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        streetRef.current?.focus();
        return;
      }
      if (!house.trim()) {
        newErrors.house = true;
        setFieldErrors(newErrors);
        setError('Пожалуйста, укажите номер дома');
        houseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        houseRef.current?.focus();
        return;
      }
    }

    if (timingType === 'scheduled' && !selectedTimeSlot) {
      setError('Выберите удобное время получения заказа');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setError(null);

    const isPreorder = timingType === 'scheduled';
    const targetTimeFormatted = isPreorder ? `${scheduledDay === 'today' ? 'Сегодня' : 'Завтра'} в ${selectedTimeSlot}` : undefined;

    const cutleryPayload: CutleryKits = {
      chopsticksCount,
      soySauceCount,
      wasabiCount,
      gingerCount
    };

    const orderPayload = {
      userId: '', // Calculated on backend
      userName: name,
      userPhone: phone,
      type: activeOrderType,
      address: activeOrderType === 'delivery' ? {
        street,
        house,
        apartment,
        entrance,
        floor,
        intercom
      } : undefined,
      pickupLocation: activeOrderType === 'pickup' ? pickupBranch : undefined,
      paymentMethod,
      items: cart,
      total: finalTotal,
      deliveryFee,
      discount: effectiveDiscount,
      timingType,
      targetTime: targetTimeFormatted,
      isPreorder,
      personsCount,
      chopsticksCount,
      cutleryKits: cutleryPayload,
      changeFrom: paymentMethod === 'cash' && changeFrom ? parseFloat(changeFrom) : undefined,
      notes: notes.trim() || undefined
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();

      if (data.success) {
        onOrderSuccess(data.order, data.user);
      } else {
        setError(data.error || 'Произошла ошибка при отправке заказа');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Ошибка соединения с сервером. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 md:bg-black/80 md:backdrop-blur-sm"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-panda-charcoal shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-panda-orange/10 text-panda-orange">
              {activeOrderType === 'delivery' ? <Truck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-white">Оформление заказа</h3>
              <p className="text-[10px] text-white/40 font-semibold uppercase">
                {activeOrderType === 'delivery' ? 'Курьерская доставка' : 'Быстрый самовывоз (-10%)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/5 text-white/40 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
          
          {/* Segmented Delivery / Pickup Switcher */}
          <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setActiveOrderType('delivery');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeOrderType === 'delivery'
                  ? 'bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>Курьерская доставка</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveOrderType('pickup');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeOrderType === 'pickup'
                  ? 'bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Самовывоз (-10%)</span>
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-300 font-semibold flex items-center gap-2.5 shadow-lg"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
                <span>Ваше Имя <span className="text-red-400">*</span></span>
                {fieldErrors.name && <span className="text-red-400 text-[9px] lowercase font-semibold">обязательно</span>}
              </label>
              <input
                ref={nameRef}
                type="text"
                placeholder="Как к вам обращаться?"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false }));
                }}
                className={`w-full h-11 px-4 rounded-xl text-sm text-white focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'bg-red-500/10 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'bg-white/5 border border-white/10 focus:border-panda-orange'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
                <span>Телефон для связи <span className="text-red-400">*</span></span>
                {fieldErrors.phone && <span className="text-red-400 text-[9px] lowercase font-semibold">11 цифр</span>}
              </label>
              <input
                ref={phoneRef}
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: false }));
                }}
                className={`w-full h-11 px-4 rounded-xl text-sm text-white focus:outline-none transition-all font-mono ${
                  fieldErrors.phone
                    ? 'bg-red-500/10 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'bg-white/5 border border-white/10 focus:border-panda-orange'
                }`}
              />
            </div>
          </div>

          {/* Time Preference Selector (ASAP vs Scheduled) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-panda-orange pl-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-panda-orange" />
                <span>Время получения</span>
              </span>
              <span className="text-[10px] text-white/50 font-normal">
                {timingType === 'asap' ? (orderType === 'delivery' ? '~45-60 мин' : '~20-30 мин') : 'Точное время'}
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => setTimingType('asap')}
                className={`py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  timingType === 'asap'
                    ? 'bg-panda-orange text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Как можно скорее</span>
              </button>

              <button
                type="button"
                onClick={() => setTimingType('scheduled')}
                className={`py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  timingType === 'scheduled'
                    ? 'bg-panda-orange text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>К точному времени</span>
              </button>
            </div>

            {/* Scheduled Date and Time Slot Picker */}
            {timingType === 'scheduled' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduledDay('today')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scheduledDay === 'today'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    Сегодня
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduledDay('tomorrow')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scheduledDay === 'tomorrow'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    Завтра
                  </button>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1.5">
                    Выберите интервал времени
                  </label>
                  {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                      {availableTimeSlots.map((timeStr) => (
                        <button
                          key={timeStr}
                          type="button"
                          onClick={() => setSelectedTimeSlot(timeStr)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                            selectedTimeSlot === timeStr
                              ? 'bg-panda-orange text-white shadow-md shadow-panda-orange/20 border border-panda-orange'
                              : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                          }`}
                        >
                          {timeStr}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400 py-2">
                      На сегодня прием предзаказов завершен (кухня работает до 23:00). Выберите завтрашний день.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sushi Cutlery & Accessories Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-l-2 border-panda-orange pl-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5 text-panda-orange" />
                <span>Приборы и соусы</span>
              </h4>
              <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-md">Включены в заказ</span>
            </div>
            <p className="text-[11px] text-white/50 pl-2.5">
              Соевый соус, васаби и имбирь уже входят в стоимость заказа бесплатно.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Персон</p>
                  <p className="text-[9px] text-white/40">Количество</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPersonsCount(p => Math.max(1, p - 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >-</button>
                  <span className="font-mono font-bold text-white w-4 text-center">{personsCount}</span>
                  <button
                    type="button"
                    onClick={() => setPersonsCount(p => Math.min(20, p + 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >+</button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Палочки</p>
                  <p className="text-[9px] text-white/40">Стандартные</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChopsticksCount(p => Math.max(0, p - 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >-</button>
                  <span className="font-mono font-bold text-white w-4 text-center">{chopsticksCount}</span>
                  <button
                    type="button"
                    onClick={() => setChopsticksCount(p => Math.min(20, p + 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >+</button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Соевый соус</p>
                  <p className="text-[9px] text-white/40">Порции</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSoySauceCount(p => Math.max(0, p - 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >-</button>
                  <span className="font-mono font-bold text-white w-4 text-center">{soySauceCount}</span>
                  <button
                    type="button"
                    onClick={() => setSoySauceCount(p => Math.min(10, p + 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >+</button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Васаби</p>
                  <p className="text-[9px] text-white/40">Порции</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWasabiCount(p => Math.max(0, p - 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >-</button>
                  <span className="font-mono font-bold text-white w-4 text-center">{wasabiCount}</span>
                  <button
                    type="button"
                    onClick={() => setWasabiCount(p => Math.min(10, p + 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >+</button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Имбирь</p>
                  <p className="text-[9px] text-white/40">Порции</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGingerCount(p => Math.max(0, p - 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >-</button>
                  <span className="font-mono font-bold text-white w-4 text-center">{gingerCount}</span>
                  <button
                    type="button"
                    onClick={() => setGingerCount(p => Math.min(10, p + 1))}
                    className="h-6 w-6 rounded-md bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Fields */}
          {activeOrderType === 'delivery' ? (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-panda-orange pl-2.5">
                Адрес доставки
              </h4>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8 sm:col-span-9">
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 flex items-center justify-between">
                    <span>Улица <span className="text-red-400">*</span></span>
                    {fieldErrors.street && <span className="text-red-400 text-[9px] lowercase font-semibold">укажите улицу</span>}
                  </label>
                  <input
                    ref={streetRef}
                    type="text"
                    placeholder="Например, Власихинская"
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      if (fieldErrors.street) setFieldErrors(prev => ({ ...prev, street: false }));
                    }}
                    className={`w-full h-11 px-4 rounded-xl text-xs text-white focus:outline-none transition-all ${
                      fieldErrors.street
                        ? 'bg-red-500/10 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : 'bg-white/5 border border-white/10 focus:border-panda-orange'
                    }`}
                  />
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 flex items-center justify-between">
                    <span>Дом <span className="text-red-400">*</span></span>
                    {fieldErrors.house && <span className="text-red-400 text-[9px] lowercase font-semibold">номер</span>}
                  </label>
                  <input
                    ref={houseRef}
                    type="text"
                    placeholder="103"
                    value={house}
                    onChange={(e) => {
                      setHouse(e.target.value);
                      if (fieldErrors.house) setFieldErrors(prev => ({ ...prev, house: false }));
                    }}
                    className={`w-full h-11 px-3 rounded-xl text-xs text-white focus:outline-none text-center transition-all ${
                      fieldErrors.house
                        ? 'bg-red-500/10 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : 'bg-white/5 border border-white/10 focus:border-panda-orange'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">
                    Квартира/Офис
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
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-panda-orange pl-2.5">
                Пункт самовывоза (г. Барнаул)
              </h4>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">
                  Выберите ресторан выдачи заказа
                </label>
                <div className="space-y-2.5">
                  {[
                    'г. Барнаул, ул. Власихинская, д. 103 (Основное производство, 10:00 - 22:00)',
                    'г. Барнаул, пр-т. Калинина, д. 116/10 (Филиал и пункт выдачи, 10:00 - 22:00)'
                  ].map((branch) => (
                    <label
                      key={branch}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        pickupBranch === branch
                          ? 'border-panda-orange bg-panda-orange/10 text-white font-bold shadow-md shadow-panda-orange/10'
                          : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pickupBranch"
                        checked={pickupBranch === branch}
                        onChange={() => setPickupBranch(branch)}
                        className="accent-panda-orange h-4 w-4 shrink-0"
                      />
                      <MapPin className="h-4 w-4 text-panda-orange shrink-0" />
                      <span>{branch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-panda-orange pl-2.5">
              Способ оплаты
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border gap-2 text-center cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-panda-orange bg-panda-orange/5 text-white font-bold'
                    : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="sr-only"
                />
                <DollarSign className="h-5 w-5 text-panda-orange" />
                <span className="text-xs">Наличными при получении</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border gap-2 text-center cursor-pointer transition-all ${
                  paymentMethod === 'card_courier'
                    ? 'border-panda-orange bg-panda-orange/5 text-white font-bold'
                    : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card_courier'}
                  onChange={() => setPaymentMethod('card_courier')}
                  className="sr-only"
                />
                <CreditCard className="h-5 w-5 text-panda-orange" />
                <span className="text-xs">Картой / Терминал курьера</span>
              </label>
            </div>

            {/* Change From Input if Cash is selected */}
            {paymentMethod === 'cash' && (
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Сдача с купюры</p>
                  <p className="text-[10px] text-white/40">Укажите номинал, чтобы курьер подготовил сдачу</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder={`Например: ${Math.ceil(finalTotal / 500) * 500 || 5000}`}
                    value={changeFrom}
                    onChange={(e) => setChangeFrom(e.target.value)}
                    className="w-full sm:w-36 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-panda-orange text-center"
                  />
                  <span className="text-xs font-bold text-white/50">₽</span>
                </div>
              </div>
            )}
          </div>

          {/* Cooking Comments */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Комментарий к заказу</span>
            </label>
            <textarea
              placeholder="Например: Пожалуйста, побольше имбиря, или бесконтактная доставка у двери."
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange transition-all resize-none"
            />
            <p className="text-right text-[9px] text-white/25 mt-0.5">{notes.length}/500</p>
          </div>
        </form>

        {/* Receipt Footer and Submit CTA */}
        <div className="border-t border-white/5 bg-panda-charcoal/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              {activeOrderType === 'delivery' ? 'Итого к оплате (доставка)' : 'Итого со скидкой 10% (самовывоз)'}
            </p>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start mt-0.5">
              <span className="font-display text-2xl sm:text-3xl font-black text-gradient-orange">
                {finalTotal.toLocaleString('ru-RU')} ₽
              </span>
              {deliveryFee > 0 && activeOrderType === 'delivery' && (
                <span className="text-[10px] text-white/40 font-medium">
                  (+150 ₽ доставка)
                </span>
              )}
            </div>
            {appliedPromo && (
              <p className="text-[9px] text-green-400 font-semibold mt-0.5">
                Промокод {appliedPromo.code} активирован!
              </p>
            )}
          </div>

          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto gap-2">
            {error && (
              <p className="text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-center sm:text-right max-w-xs">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => handleSubmitOrder()}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 sm:px-10 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover hover:from-orange-600 hover:to-orange-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-panda-orange/20 hover:shadow-panda-orange/35 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Оформляем...</span>
                </>
              ) : (
                <span>Оформить Заказ</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
