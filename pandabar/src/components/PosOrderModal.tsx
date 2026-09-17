import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  X, Plus, Minus, Search, ShoppingBag, Truck, Store, 
  Clock, Check, AlertCircle, UtensilsCrossed
} from 'lucide-react';
import { Product, Order, CutleryKits } from '../types';
import { formatPhone } from '../utils/phoneFormatter';

interface PosOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOrderCreated: (order: Order) => void;
  theme?: 'dark' | 'light';
}

export function PosOrderModal({
  isOpen,
  onClose,
  products,
  onOrderCreated,
  theme = 'dark'
}: PosOrderModalProps) {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('Гость');
  const [notes, setNotes] = useState('');
  
  // Delivery address fields
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [intercom, setIntercom] = useState('');
  
  // Timing (ASAP vs Exact Time)
  const [timingType, setTimingType] = useState<'asap' | 'scheduled'>('asap');
  const [targetTime, setTargetTime] = useState('');
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_courier'>('cash');
  const [changeFrom, setChangeFrom] = useState('');
  
  // Cart for POS
  const [posCart, setPosCart] = useState<{ [productId: string]: number }>({});
  
  // Sushi cutlery
  const [personsCount, setPersonsCount] = useState(1);
  const [chopsticksCount, setChopsticksCount] = useState(1);
  const [soySauceCount, setSoySauceCount] = useState(1);
  const [wasabiCount, setWasabiCount] = useState(1);
  const [gingerCount, setGingerCount] = useState(1);
  
  // Filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'sets', label: 'Сеты' },
    { id: 'baked-rolls', label: 'Запеченные' },
    { id: 'classic-rolls', label: 'Классика' },
    { id: 'tempura-rolls', label: 'Темпура' },
    { id: 'wok', label: 'WOK' },
    { id: 'drinks', label: 'Напитки' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartItemsArray = useMemo(() => {
    return Object.entries(posCart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const prod = products.find(p => p.id === id);
        return prod ? { product: prod, quantity: qty } : null;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
  }, [posCart, products]);

  const itemsTotal = cartItemsArray.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? (itemsTotal >= 1000 ? 0 : 150) : 0;
  const total = itemsTotal + deliveryFee;

  const handleQtyChange = (productId: string, delta: number) => {
    setPosCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemsArray.length === 0) {
      setError('Добавьте хотя бы одно блюдо в заказ');
      return;
    }
    const digitsCount = phone.replace(/\D/g, '').length;
    if (orderType === 'delivery' && (!phone || digitsCount < 11)) {
      setError('Для доставки обязателен номер телефона клиента');
      return;
    }
    if (orderType === 'delivery' && (!street.trim() || !house.trim())) {
      setError('Для доставки укажите улицу и номер дома');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const isPreorder = timingType === 'scheduled';
    const cutleryPayload: CutleryKits = {
      chopsticksCount,
      soySauceCount,
      wasabiCount,
      gingerCount
    };

    const payload = {
      userName: name.trim() || 'Гость',
      userPhone: phone.trim() || '+7 (999) 000-00-00',
      type: orderType,
      address: orderType === 'delivery' ? {
        street: street.trim(),
        house: house.trim(),
        apartment: apartment.trim() || undefined,
        entrance: entrance.trim() || undefined,
        floor: floor.trim() || undefined,
        intercom: intercom.trim() || undefined,
      } : undefined,
      pickupLocation: orderType === 'pickup' ? 'г. Барнаул, ул. Власихинская, д. 103 (Основное производство)' : undefined,
      paymentMethod,
      items: cartItemsArray,
      total,
      deliveryFee,
      discount: 0,
      timingType,
      targetTime: isPreorder && targetTime ? targetTime : undefined,
      isPreorder,
      personsCount,
      chopsticksCount,
      cutleryKits: cutleryPayload,
      changeFrom: paymentMethod === 'cash' && changeFrom ? parseFloat(changeFrom) : undefined,
      isPosOrder: true,
      notes: notes.trim() || undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.order) {
        onOrderCreated(data.order);
        onClose();
      } else {
        setError(data.error || 'Ошибка создания заказа');
      }
    } catch (err) {
      console.error('POS order error:', err);
      setError('Ошибка сети при создании заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-5xl bg-panda-charcoal border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-panda-dark/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-panda-orange/20 text-panda-orange flex items-center justify-center font-bold">
              POS
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-lg">
                Ручной ввод заказа (Касса / Кухня)
              </h3>
              <p className="text-xs text-white/40">
                Быстрое оформление заказа по телефону или в зале
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Menu Catalog Selector */}
          <div className="lg:col-span-7 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4 overflow-y-auto max-h-[50vh] lg:max-h-[68vh] scrollbar-thin">
            {/* Search & Category Filter */}
            <div className="space-y-2.5 sticky top-0 bg-panda-charcoal/95 pb-2 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Поиск по меню (Филадельфия, Удон, Сет...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-panda-orange text-white'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredProducts.map(product => {
                const qty = posCart[product.id] || 0;
                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      qty > 0 ? 'bg-panda-orange/10 border-panda-orange/40' : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white leading-snug">{product.name}</p>
                        <p className="text-[10px] text-white/40">{product.weight} г.</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">
                        {product.price} ₽
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-white/50">
                        {qty > 0 ? `${qty * product.price} ₽` : 'Не выбрано'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, -1)}
                            className="h-7 w-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 active:scale-95"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="font-mono font-black text-white text-xs w-5 text-center">
                            {qty}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, 1)}
                          className="h-7 w-7 rounded-lg bg-panda-orange text-white font-bold flex items-center justify-center hover:bg-panda-orange-hover active:scale-95 shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Details, Client & Payment */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-4 bg-panda-charcoal/40 overflow-y-auto max-h-[50vh] lg:max-h-[68vh] scrollbar-thin">
            {/* Order Type Selector */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'delivery' ? 'bg-panda-orange text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Доставка</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'pickup' ? 'bg-panda-orange text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>Самовывоз</span>
              </button>
            </div>

            {/* Client info */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Имя гостя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Телефон</label>
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-panda-orange"
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Улица</label>
                      <input
                        type="text"
                        placeholder="ул. Ленина"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Дом</label>
                      <input
                        type="text"
                        placeholder="42"
                        value={house}
                        onChange={e => setHouse(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none text-center"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div>
                      <input
                        type="text"
                        placeholder="Кв"
                        value={apartment}
                        onChange={e => setApartment(e.target.value)}
                        className="w-full h-8 rounded-lg bg-white/5 border border-white/10 text-xs text-white text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Под"
                        value={entrance}
                        onChange={e => setEntrance(e.target.value)}
                        className="w-full h-8 rounded-lg bg-white/5 border border-white/10 text-xs text-white text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Эт"
                        value={floor}
                        onChange={e => setFloor(e.target.value)}
                        className="w-full h-8 rounded-lg bg-white/5 border border-white/10 text-xs text-white text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Домофон"
                        value={intercom}
                        onChange={e => setIntercom(e.target.value)}
                        className="w-full h-8 rounded-lg bg-white/5 border border-white/10 text-xs text-white text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timing Selector */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-panda-orange" />
                  <span>Время готовности</span>
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTimingType('asap')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      timingType === 'asap' ? 'bg-panda-orange text-white' : 'bg-white/5 text-white/50'
                    }`}
                  >
                    Как можно скорее
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimingType('scheduled')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      timingType === 'scheduled' ? 'bg-panda-orange text-white' : 'bg-white/5 text-white/50'
                    }`}
                  >
                    К точному времени
                  </button>
                </div>
              </div>
              {timingType === 'scheduled' && (
                <input
                  type="text"
                  placeholder="Например: 19:30 или Завтра 14:00"
                  value={targetTime}
                  onChange={e => setTargetTime(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              )}
            </div>

            {/* Cutlery Counter */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-panda-orange" />
                  <span>Комплектация приборами</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <span className="text-white/60">Палочки:</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setChopsticksCount(p => Math.max(0, p - 1))} className="h-5 w-5 bg-white/10 rounded text-center leading-none">-</button>
                    <span className="font-bold text-white w-3 text-center">{chopsticksCount}</span>
                    <button type="button" onClick={() => setChopsticksCount(p => p + 1)} className="h-5 w-5 bg-white/10 rounded text-center leading-none">+</button>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <span className="text-white/60">Соусник:</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setSoySauceCount(p => Math.max(0, p - 1))} className="h-5 w-5 bg-white/10 rounded text-center leading-none">-</button>
                    <span className="font-bold text-white w-3 text-center">{soySauceCount}</span>
                    <button type="button" onClick={() => setSoySauceCount(p => p + 1)} className="h-5 w-5 bg-white/10 rounded text-center leading-none">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-[9px] font-bold uppercase text-white/40">Способ оплаты</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === 'cash' ? 'bg-panda-orange/15 border-panda-orange text-white' : 'bg-white/5 border-white/5 text-white/60'
                  }`}
                >
                  Наличные
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card_courier')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === 'card_courier' ? 'bg-panda-orange/15 border-panda-orange text-white' : 'bg-white/5 border-white/5 text-white/60'
                  }`}
                >
                  Картой / Терминал
                </button>
              </div>

              {paymentMethod === 'cash' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    placeholder="Сдача с (купюра)"
                    value={changeFrom}
                    onChange={e => setChangeFrom(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                  />
                  <span className="text-xs text-white/40">₽</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Комментарий / Пожелание кухни</label>
              <input
                type="text"
                placeholder="Без огурца, больше имбиря, код от шлагбаума..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange"
              />
            </div>
          </div>
        </div>

        {/* Footer & Submit Action */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-panda-charcoal flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-white/40">Позиций:</span>{' '}
              <strong className="text-white font-mono">{cartItemsArray.reduce((s, i) => s + i.quantity, 0)} шт</strong>
            </div>
            <div>
              <span className="text-white/40">Итого:</span>{' '}
              <strong className="text-emerald-400 font-mono text-base">{total} ₽</strong>
            </div>
            {error && (
              <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={isSubmitting || cartItemsArray.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black shadow-lg shadow-panda-orange/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Создание...' : 'Отправить заказ на кухню'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
