/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ShoppingBag, User, Menu } from 'lucide-react';
import { CartItem, User as UserType } from '../types';

interface MobileBottomNavProps {
  cart: CartItem[];
  onOpenCart: () => void;
  currentUser: UserType | null;
  onOpenProfile: () => void;
  theme?: 'dark' | 'light';
  isModalOpen?: boolean;
}

export default function MobileBottomNav({
  cart,
  onOpenCart,
  currentUser,
  onOpenProfile,
  theme = 'dark',
  isModalOpen = false,
}: MobileBottomNavProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const content = (
    <div 
      style={{
        WebkitTransform: isModalOpen ? 'translate3d(0, 100%, 0)' : 'translate3d(0, 0, 0)',
        transform: isModalOpen ? 'translate3d(0, 100%, 0)' : 'translate3d(0, 0, 0)',
        opacity: isModalOpen ? 0 : 1,
        pointerEvents: isModalOpen ? 'none' : 'auto',
        willChange: 'transform, opacity',
      }}
      className={`md:hidden firefox-bottom-fix fixed bottom-0 inset-x-0 z-40 border-t px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out ${
        theme === 'light'
          ? 'bg-white border-zinc-200 text-zinc-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]'
          : 'bg-[#0F1016] border-white/10 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.8)]'
      }`}
    >
      <div className="mx-auto flex items-center justify-between max-w-sm gap-2">
        {/* 1. Menu / Catalog */}
        <a
          href="#menu"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors active:scale-95 ${
            theme === 'light' ? 'text-zinc-600 hover:text-orange-600' : 'text-white/70 hover:text-panda-orange'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${theme === 'light' ? 'bg-zinc-100' : 'bg-white/5'}`}>
            <Menu className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-bold">Меню</span>
        </a>

        {/* 2. Profile / Auth */}
        <button
          onClick={onOpenProfile}
          className={`flex flex-[1.3] flex-col items-center justify-center gap-1 py-1 transition-colors active:scale-95 cursor-pointer ${
            theme === 'light' ? 'text-zinc-600 hover:text-orange-600' : 'text-white/70 hover:text-panda-orange'
          }`}
        >
          <div className={`relative p-1.5 rounded-xl ${theme === 'light' ? 'bg-zinc-100' : 'bg-white/5'}`}>
            <User className="h-4.5 w-4.5 text-panda-orange" />
            {currentUser && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-panda-dark" />
            )}
          </div>
          <span className="text-[10px] font-bold line-clamp-1">
            {currentUser ? (currentUser.name.split(' ')[0] || 'Профиль') : 'Войти'}
          </span>
        </button>

        {/* 3. Cart Button */}
        <button
          onClick={onOpenCart}
          className="flex flex-[1.6] items-center justify-center gap-2 py-2.5 px-3.5 rounded-2xl bg-panda-orange text-white font-bold shadow-lg shadow-panda-orange/30 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="relative shrink-0">
            <ShoppingBag className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-panda-orange">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-xs tracking-tight whitespace-nowrap">
            {cartItemsCount > 0 ? `${cartTotal} ₽` : 'Корзина'}
          </span>
        </button>
      </div>
    </div>
  );

  if (!isMounted || typeof document === 'undefined') return null;

  return ReactDOM.createPortal(content, document.body);
}
