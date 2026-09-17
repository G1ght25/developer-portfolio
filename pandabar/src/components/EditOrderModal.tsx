import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Minus, Search, Trash2, Save, ShoppingBag, AlertCircle } from 'lucide-react';
import { Product, Order, CartItem } from '../types';
import ProductImage from './ProductImage';
import { getAuthHeaders } from '../utils/auth';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  products: Product[];
  onOrderUpdated: (updatedOrder: Order) => void;
  theme?: 'dark' | 'light';
}

export function EditOrderModal({
  isOpen,
  onClose,
  order,
  products,
  onOrderUpdated,
  theme = 'dark'
}: EditOrderModalProps) {
  if (!isOpen || !order) return null;

  const [items, setItems] = useState<CartItem[]>(() => {
    return order.items.map(it => ({
      product: it.product,
      quantity: it.quantity
    }));
  });

  const [notes, setNotes] = useState(order.notes || '');
  const [personsCount, setPersonsCount] = useState<number>(order.personsCount || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'sets', label: '🍱 Сеты' },
    { id: 'baked-rolls', label: '🔥 Запеченные' },
    { id: 'classic-rolls', label: '🍣 Классика' },
    { id: 'tempura-rolls', label: '🍤 Темпура' },
    { id: 'pizza', label: '🍕 Пицца' },
    { id: 'wok', label: '🥢 WOK' },
    { id: 'drinks', label: '🥤 Напитки' },
    { id: 'desserts', label: '🍰 Десерты' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddItem = (product: Product) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(it => it.product.id === product.id);
      if (existingIdx > -1) {
        return prev.map((it, idx) => 
          idx === existingIdx ? { ...it, quantity: it.quantity + 1 } : it
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const handleDecreaseQuantity = (productId: string) => {
    setItems(prev => {
      return prev.map(it => {
        if (it.product.id === productId) {
          return { ...it, quantity: it.quantity - 1 };
        }
        return it;
      }).filter(it => it.quantity > 0);
    });
  };

  const handleRemoveItem = (productId: string) => {
    setItems(prev => prev.filter(it => it.product.id !== productId));
  };

  const subtotal = items.reduce((sum, it) => sum + (it.product.price || 0) * it.quantity, 0);
  const total = Math.max(0, subtotal - (order.discount || 0));

  const handleSaveOrder = async () => {
    if (items.length === 0) {
      setError('В заказе должно оставаться хотя бы одно блюдо');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          items,
          notes,
          personsCount,
          cutleryKits: order.cutleryKits,
          changeFrom: order.changeFrom
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        onOrderUpdated(data.order);
        onClose();
      } else {
        setError(data.error || 'Ошибка при сохранении изменений');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сети при обращении к серверу');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl bg-panda-charcoal border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-panda-orange/15 via-white/5 to-transparent border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-panda-orange/20 text-panda-orange">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-white">
                  Редактирование состава заказа #{order.id}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 text-white/70">
                  {order.type === 'delivery' ? '🚗 Доставка' : order.type === 'dine_in' ? '🍽️ В зале' : '🛍️ Самовывоз'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Клиент: <strong className="text-white">{order.userName || 'Гость'}</strong> ({order.userPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Main Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          
          {/* Left Column: Menu Catalog to Add items */}
          <div className="md:col-span-7 p-6 border-r border-white/10 flex flex-col min-h-0 overflow-hidden bg-black/20">
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по меню для добавления..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-panda-orange"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-panda-orange text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredProducts.map(product => {
                const inOrderQty = items.find(it => it.product.id === product.id)?.quantity || 0;
                return (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                        placeholderEmoji="🍣"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                        <p className="text-[10px] text-white/50">{product.weight}г • {product.price} ₽</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddItem(product)}
                      className="px-3 py-1.5 rounded-xl bg-panda-orange/20 hover:bg-panda-orange text-panda-orange hover:text-white border border-panda-orange/30 text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{inOrderQty > 0 ? `+1 (в заказе: ${inOrderQty})` : 'Добавить'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Current Order Items & Summary */}
          <div className="md:col-span-5 p-6 flex flex-col min-h-0 overflow-hidden bg-panda-charcoal/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Состав заказа ({items.reduce((s, it) => s + it.quantity, 0)} шт)
              </h3>
            </div>

            {/* Current Items List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 mb-4">
              {items.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  Заказ пуст. Добавьте блюда из каталога слева.
                </div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.product.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{it.product.name}</h4>
                      <p className="text-[10px] font-mono text-panda-orange font-bold">
                        {it.quantity} × {it.product.price} ₽ = {it.quantity * it.product.price} ₽
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDecreaseQuantity(it.product.id)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-white">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => handleAddItem(it.product)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(it.product.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer ml-1"
                        title="Удалить из заказа"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notes & Options */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Примечание / Комментарий к заказу:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Без лука, приборы, острый соус отдельно..."
                  className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Total & Save Buttons */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase font-bold">Новая сумма:</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {total.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <button
                  onClick={handleSaveOrder}
                  disabled={isSaving || items.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить заказ'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
