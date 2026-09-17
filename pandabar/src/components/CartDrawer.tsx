/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Truck, Store, Tag, ChevronRight, ShoppingBag, AlertCircle, Info, Gift, Clock, Sparkles } from 'lucide-react';
import { CartItem, Product, PromoCode, KitchenStatus } from '../types';
import { PROMO_CODES } from '../data/menuData';
import ProductImage from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: (type: 'delivery' | 'pickup', appliedPromo: PromoCode | null, finalDiscount: number) => void;
  kitchenStatus?: KitchenStatus;
  theme?: 'dark' | 'light';
  products?: Product[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOpenCheckout,
  kitchenStatus,
  theme = 'dark',
  products = []
}: CartDrawerProps) {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [selectedBonus, setSelectedBonus] = useState<'discount10' | 'surimi_tempura' | 'sezam'>('surimi_tempura');

  const itemsTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Delivery fee rules (1 000 ₽ threshold)
  const deliveryFee = orderType === 'delivery' ? (itemsTotal >= 1000 ? 0 : 150) : 0;

  // Promotions & Discounts calculation (Non-stacking: best benefit for user)
  const now = new Date();
  const currentHour = now.getHours();
  const isLunchTime = currentHour >= 10 && currentHour < 14;
  const isLunchEligible = isLunchTime && itemsTotal >= 4000;

  let lunchDiscount = isLunchEligible ? Math.round(itemsTotal * 0.20) : 0;
  let pickupDiscount = orderType === 'pickup' ? Math.round(itemsTotal * 0.10) : 0;
  let bonusDiscount = (itemsTotal >= 2500 && selectedBonus === 'discount10') ? Math.round(itemsTotal * 0.10) : 0;
  let promoDiscount = 0;
  if (appliedPromo && itemsTotal >= appliedPromo.minOrderAmount) {
    if (appliedPromo.discountType === 'percent') {
      promoDiscount = Math.round((itemsTotal * appliedPromo.discountValue) / 100);
    } else {
      promoDiscount = Math.min(itemsTotal, appliedPromo.discountValue);
    }
  }

  // Find the highest discount
  const discountAmount = Math.max(promoDiscount, pickupDiscount, lunchDiscount, bonusDiscount);

  let activeDiscountLabel = '';
  if (discountAmount > 0) {
    if (discountAmount === lunchDiscount && isLunchEligible) {
      activeDiscountLabel = 'Обеденная скидка (-20%)';
    } else if (discountAmount === promoDiscount && appliedPromo) {
      activeDiscountLabel = `Промокод (${appliedPromo.code} -${appliedPromo.discountType === 'percent' ? `${appliedPromo.discountValue}%` : `${appliedPromo.discountValue} ₽`})`;
    } else if (discountAmount === pickupDiscount && orderType === 'pickup') {
      activeDiscountLabel = 'Скидка на самовывоз (-10%)';
    } else if (discountAmount === bonusDiscount) {
      activeDiscountLabel = 'Бонусная скидка (-10%)';
    }
  }

  const finalTotal = Math.max(0, itemsTotal - discountAmount + deliveryFee);

  // Quick One-Click Cross-Sell items (Sauces, snacks, dessert, mini-sushi - NO drinks)
  const crossSellItems = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const targetIds = [
      'item-dopolnitelno-sous-quotspajsiquot', // Соус Спайси (35 ₽)
      'item-dopolnitelno-tri-sousa',            // Три соуса (105 ₽)
      'item-dopolnitelno-kartofel-fristandart', // Картофель фри (120 ₽)
      'item-desserts-chizkejk-new-york',        // Чизкейк NEW-YORK (190 ₽)
      'item-sushi-syake-spajs',                 // Сяке-спайс (120 ₽)
      'item-sushi-ebi-spajs',                   // Эби-спайс (95 ₽)
      'item-kappa-maki'                         // Каппа Маки (175 ₽)
    ];

    const matched = targetIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as Product[];

    if (matched.length < 4) {
      const fallback = products.filter(p => 
        (p.category === 'dopolnitelno' || p.category === 'desserts' || p.category === 'sushi') && 
        p.price <= 200 && 
        !matched.some(m => m.id === p.id)
      );
      matched.push(...fallback);
    }

    return matched;
  }, [products]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const matchedPromo = PROMO_CODES.find(p => p.code === code);
    if (!matchedPromo) {
      setPromoError('Промокод не существует');
      return;
    }

    if (itemsTotal < matchedPromo.minOrderAmount) {
      setPromoError(`Минимальная сумма заказа: ${matchedPromo.minOrderAmount} ₽`);
      return;
    }

    setAppliedPromo(matchedPromo);
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 md:bg-black/80 md:backdrop-blur-xs"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-full justify-end pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-panda-charcoal border-l border-white/5 flex flex-col h-full shadow-2xl relative pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-panda-orange" />
                  <h3 className="font-display text-lg font-bold text-white">Корзина</h3>
                  {cart.length > 0 && (
                    <span className="text-xs text-white/40 font-semibold bg-white/5 px-2 py-0.5 rounded-md">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)} шт
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-white/5 text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30 mb-4 shadow-inner">
                    <ShoppingBag className="h-8 w-8 text-white/40" />
                  </div>
                  <h4 className="font-display text-base font-bold text-white">В вашей корзине пусто</h4>
                  <p className="text-xs text-white/40 mt-1 max-w-xs leading-relaxed">
                    Добавьте роллы, суши или ароматный Wok из каталога, чтобы сделать заказ.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-white text-panda-dark font-bold text-xs hover:bg-panda-cream transition-all cursor-pointer"
                  >
                    Вернуться к меню
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
                    {/* Delivery type selectors */}
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
                      <button
                        onClick={() => {
                          setOrderType('delivery');
                          if (appliedPromo) handleRemovePromo(); // Reset coupon discount overlaps if any
                        }}
                        className={`flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          orderType === 'delivery'
                            ? 'bg-panda-orange text-white shadow-md'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Доставка</span>
                      </button>
                      <button
                        onClick={() => {
                          setOrderType('pickup');
                          if (appliedPromo) handleRemovePromo();
                        }}
                        className={`flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          orderType === 'pickup'
                            ? 'bg-panda-orange text-white shadow-md'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Store className="h-3.5 w-3.5" />
                        <span>Самовывоз</span>
                        <span className="text-[9px] px-1 py-0.5 rounded-md bg-white/10 text-white/90">
                          -10%
                        </span>
                      </button>
                    </div>

                    {/* Clear Button */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white/40">Выбранные товары</span>
                      <button
                        onClick={onClearCart}
                        className="text-red-400/80 hover:text-red-400 font-semibold cursor-pointer"
                      >
                        Очистить всё
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 group"
                        >
                          <ProductImage
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 rounded-xl object-cover bg-panda-gray"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-display font-bold text-xs text-white truncate">
                              {item.product.name}
                            </h5>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              {item.product.weight} {item.product.category === 'drinks' ? 'мл' : 'г'}
                            </p>
                            <span className="font-bold text-xs text-white mt-1 block">
                              {item.product.price} ₽
                            </span>
                          </div>

                          {/* Control */}
                          <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                            <button
                              onClick={() => onRemoveFromCart(item.product.id)}
                              className="h-7 w-7 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold px-1.5 min-w-5 text-center text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onAddToCart(item.product)}
                              className="h-7 w-7 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* One-Click Quick Cross-Sell Carousel */}
                    {crossSellItems.length > 0 && (
                      <div className="pt-3 pb-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-panda-orange flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Добавьте к заказу в 1 клик:</span>
                          </span>
                          <span className="text-[10px] text-white/40">Соусы, закуски, десерты</span>
                        </div>

                        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
                          {crossSellItems.map(item => {
                            const inCart = cart.find(c => c.product.id === item.id);
                            return (
                              <div
                                key={item.id}
                                className="min-w-[145px] max-w-[155px] p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-panda-orange/40 flex flex-col justify-between shrink-0 transition-all snap-start group"
                              >
                                <div>
                                  <div className="relative mb-2 w-full h-18 rounded-xl overflow-hidden bg-black/20">
                                    <ProductImage
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                    />
                                    {item.weight && (
                                      <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-black/75 text-white/90">
                                        {item.weight} г
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-[11px] font-bold text-white truncate" title={item.name}>
                                    {item.name}
                                  </h5>
                                  <p className="text-[9px] text-white/50 truncate mt-0.5">
                                    {item.category === 'desserts' ? 'Десерт' : item.category === 'dopolnitelno' ? 'Соус / Закуска' : 'Суши'}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onAddToCart(item)}
                                  className="mt-2 w-full h-7 rounded-xl bg-panda-orange/15 hover:bg-panda-orange text-panda-orange hover:text-white border border-panda-orange/30 hover:border-transparent text-[11px] font-black transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>{item.price} ₽</span>
                                  {inCart && (
                                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-panda-orange text-white text-[9px]">
                                      {inCart.quantity}
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delivery Notification Area with Progress Bar */}
                    {orderType === 'delivery' && (
                      <div className="rounded-2xl p-3.5 text-xs bg-white/[0.04] border border-white/10 text-white/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className={`h-4 w-4 ${itemsTotal >= 1000 ? 'text-emerald-400' : 'text-panda-orange'}`} />
                            <span className="font-bold text-white text-xs">
                              {itemsTotal >= 1000 ? 'Бесплатная доставка активна' : 'Доставка курьером (+150 ₽)'}
                            </span>
                          </div>
                          <span className={`font-mono text-xs font-black ${itemsTotal >= 1000 ? 'text-emerald-400' : 'text-panda-orange'}`}>
                            {itemsTotal >= 1000 ? '0 ₽' : '150 ₽'}
                          </span>
                        </div>

                        {/* Animated visual progress bar */}
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              itemsTotal >= 1000
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-panda-orange to-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.round((itemsTotal / 1000) * 100))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-white/50">
                          {itemsTotal >= 1000 ? (
                            <span className="text-emerald-300 font-medium">
                              Порог 1 000 ₽ достигнут. Приборы, соусы и доставка бесплатно!
                            </span>
                          ) : (
                            <span>
                              Добавьте ещё на <strong className="text-panda-orange font-bold font-mono">{1000 - itemsTotal} ₽</strong> до бесплатной доставки
                            </span>
                          )}
                          <span className="font-mono text-white/40 text-[10px] shrink-0 ml-2">
                            {Math.min(100, Math.round((itemsTotal / 1000) * 100))}%
                          </span>
                        </div>
                      </div>
                    )}

                    {orderType === 'pickup' && (
                      <div className="rounded-xl p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-2">
                        <Tag className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Скидка за самовывоз 10%</p>
                          <p className="text-[10px] text-white/50 mt-0.5">Скидка автоматически учтена в чеке ниже.</p>
                        </div>
                      </div>
                    )}

                    {/* Lunch promotion indicator */}
                    {isLunchTime && (
                      <div className={`rounded-xl p-3 text-xs border flex items-start gap-2 ${
                        isLunchEligible
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}>
                        <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">
                            {isLunchEligible ? 'Обеденная скидка 20% активна' : 'Обеденная скидка 20%'}
                          </p>
                          <p className="text-[10px] mt-0.5">
                            {isLunchEligible
                              ? 'Скидка 20% на весь заказ учтена в чеке.'
                              : `Действует с 10:00 до 14:00 при заказе от 4 000 ₽. Добавьте ещё на ${4000 - itemsTotal} ₽!`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bonus selector for orders >= 2 500 ₽ */}
                    {itemsTotal >= 2500 && (
                      <div className="rounded-2xl p-3.5 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Gift className="h-4 w-4 text-amber-400" />
                          <span>Бонус при заказе от 2 500 ₽:</span>
                        </div>
                        <p className="text-[11px] text-white/70">
                          Выберите один из 3 вариантов на ваш вкус:
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBonus('surimi_tempura')}
                            className={`p-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              selectedBonus === 'surimi_tempura'
                                ? 'bg-panda-orange border-panda-orange text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <span>Сурими темпура</span>
                            <span className="text-[8px] opacity-80">(жареный ролл)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBonus('sezam')}
                            className={`p-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              selectedBonus === 'sezam'
                                ? 'bg-panda-orange border-panda-orange text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <span>Сезам</span>
                            <span className="text-[8px] opacity-80">(нежареный ролл)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBonus('discount10')}
                            className={`p-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              selectedBonus === 'discount10'
                                ? 'bg-panda-orange border-panda-orange text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <span>Скидка 10%</span>
                            <span className="text-[8px] opacity-80">(на весь чек)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Promo Input & Receipt Footer */}
                  <div className="border-t border-white/10 bg-panda-charcoal/98 md:bg-panda-charcoal/80 md:backdrop-blur-md p-6 space-y-4">
                    {/* Coupon Input Form */}
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="ПРОМОКОД (PANDA10)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          disabled={!!appliedPromo}
                          className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none focus:border-panda-orange disabled:opacity-50"
                        />
                        {appliedPromo && (
                          <span className="absolute right-3.5 top-2.5 text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                            Применен
                          </span>
                        )}
                      </div>
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="h-10 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold cursor-pointer transition-all"
                        >
                          Сбросить
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="h-10 px-5 rounded-xl bg-white text-panda-dark font-bold text-xs hover:bg-panda-cream cursor-pointer transition-all"
                        >
                          Ввод
                        </button>
                      )}
                    </form>

                    {promoError && (
                      <p className="text-[10px] text-red-400 font-semibold">{promoError}</p>
                    )}

                    {/* Receipt breakdown */}
                    <div className="space-y-2 border-t border-white/5 pt-3 text-xs text-white/60">
                      <div className="flex justify-between">
                        <span>Сумма по меню</span>
                        <span className="text-white font-medium">{itemsTotal} ₽</span>
                      </div>
                      
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{activeDiscountLabel || 'Скидка'}</span>
                          </span>
                          <span>-{discountAmount} ₽</span>
                        </div>
                      )}

                      {itemsTotal >= 2500 && selectedBonus !== 'discount10' && (
                        <div className="flex justify-between text-amber-300 font-semibold">
                          <span className="flex items-center gap-1">
                            <Gift className="h-3 w-3 text-amber-400" />
                            <span>Подарок: {selectedBonus === 'surimi_tempura' ? 'Жареный «Сурими темпура»' : 'Ролл «Сезам»'}</span>
                          </span>
                          <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">0 ₽</span>
                        </div>
                      )}

                      {orderType === 'delivery' && (
                        <div className="flex justify-between">
                          <span>Доставка</span>
                          <span className="text-white font-medium">
                            {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                        <span className="font-display text-sm font-black text-white">К оплате</span>
                        <span className="font-display text-xl font-black text-white text-gradient-orange">
                          {finalTotal} ₽
                        </span>
                      </div>
                    </div>

                    {/* Kitchen Closed Warning if emergency stop active */}
                    {kitchenStatus && !kitchenStatus.isOpen && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Приём заказов временно приостановлен</p>
                          <p className="text-[11px] text-red-300/80 mt-0.5">
                            {kitchenStatus.pauseReason || 'Кухня временно на техническом перерыве. Попробуйте чуть позже.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Checkout CTA */}
                    <button
                      onClick={() => onOpenCheckout(orderType, appliedPromo, discountAmount)}
                      disabled={kitchenStatus ? !kitchenStatus.isOpen : false}
                      className={`w-full h-12 rounded-xl text-white text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                        kitchenStatus && !kitchenStatus.isOpen
                          ? 'bg-zinc-700 opacity-50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-panda-orange to-panda-orange-hover shadow-lg shadow-panda-orange/15 hover:shadow-panda-orange/25 active:scale-98 cursor-pointer group'
                      }`}
                    >
                      <span>{kitchenStatus && !kitchenStatus.isOpen ? 'Кухня временно закрыта' : 'Оформить заказ'}</span>
                      {(!kitchenStatus || kitchenStatus.isOpen) && (
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
