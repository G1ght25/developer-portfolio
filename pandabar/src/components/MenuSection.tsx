/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Flame, Fish, Zap, ChefHat, Pizza, Soup,
  CupSoda, CakeSlice, Plus, Minus, Info, ShieldCheck,
  Search, X, SlidersHorizontal, ChevronDown, Ban
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { MENU_CATEGORIES } from '../data/menuData';
import ProductImage from './ProductImage';

interface MenuSectionProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  searchQuery: string;
  onSearch?: (q: string) => void;
  theme?: 'dark' | 'light';
  selectedProduct?: Product | null;
  onSelectProduct?: (product: Product | null) => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Sparkles, Flame, Fish, Zap, ChefHat, Pizza, Soup, CupSoda, CakeSlice
};

// Category accent colors
const categoryColors: Record<string, string> = {
  sets:           'from-amber-500 to-orange-500',
  'baked-rolls':  'from-red-500 to-rose-600',
  'classic-rolls':'from-panda-orange to-orange-400',
  'tempura-rolls':'from-yellow-500 to-amber-400',
  sushi:          'from-sky-500 to-blue-600',
  pizza:          'from-red-400 to-orange-400',
  wok:            'from-green-500 to-emerald-500',
  drinks:         'from-cyan-500 to-teal-500',
  desserts:       'from-pink-500 to-rose-400',
};

export default function MenuSection({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  searchQuery,
  onSearch,
  theme = 'dark',
  selectedProduct: propSelectedProduct,
  onSelectProduct,
  onModalStateChange,
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('sets');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'weight-desc'>('default');
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterVeg, setFilterVeg] = useState(false);
  const [internalSelectedProduct, setInternalSelectedProduct] = useState<Product | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  // Pizza customization state
  const [pizzaSauce, setPizzaSauce] = useState<'white' | 'red'>('red');
  const [pizzaSize, setPizzaSize] = useState<25 | 35>(25);

  const selectedProduct = propSelectedProduct !== undefined ? propSelectedProduct : internalSelectedProduct;
  const setSelectedProduct = (prod: Product | null) => {
    if (prod && prod.category === 'pizza') {
      // Auto-detect default sauce from name if specified
      const nameL = prod.name.toLowerCase();
      if (nameL.includes('белый')) {
        setPizzaSauce('white');
      } else {
        setPizzaSauce('red');
      }
      if (nameL.includes('35')) {
        setPizzaSize(35);
      } else {
        setPizzaSize(25);
      }
    }
    if (onSelectProduct) {
      onSelectProduct(prod);
    } else {
      setInternalSelectedProduct(prod);
    }
  };

  React.useEffect(() => {
    onModalStateChange?.(selectedProduct !== null);
  }, [selectedProduct, onModalStateChange]);

  const catBarRef = useRef<HTMLDivElement>(null);
  const activeCatRef = useRef<HTMLButtonElement>(null);

  // Hardware / System Back Button Trapping for Product Modal
  const modalHistoryPushedRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);

  useEffect(() => {
    if (selectedProduct && !modalHistoryPushedRef.current) {
      modalHistoryPushedRef.current = true;
      try { window.history.pushState({ menuProductModal: true }, ''); } catch (e) {}
    } else if (!selectedProduct && modalHistoryPushedRef.current) {
      modalHistoryPushedRef.current = false;
      if (window.history.state?.menuProductModal) {
        ignoreNextPopStateRef.current = true;
        try { window.history.back(); } catch (e) {}
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }
      if (modalHistoryPushedRef.current && selectedProduct) {
        modalHistoryPushedRef.current = false;
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct]);

  // Sync internal search with external if provided
  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

  const handleSearch = (val: string) => {
    setLocalSearch(val);
    onSearch?.(val);
  };

  const clearSearch = () => {
    setLocalSearch('');
    onSearch?.('');
  };

  // Scroll active category pill into view
  useEffect(() => {
    if (activeCatRef.current && catBarRef.current) {
      activeCatRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  const getProductQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const effectiveSearch = localSearch || searchQuery;

  const filteredProducts = products.filter(product => {
    const matchesSearch = effectiveSearch
      ? product.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(effectiveSearch.toLowerCase())
      : true;
    const matchesCategory = effectiveSearch ? true : product.category === selectedCategory;
    const matchesSpicy = filterSpicy ? product.spicy === true : true;
    const matchesVeg = filterVeg ? product.vegetarian === true : true;
    return matchesSearch && matchesCategory && matchesSpicy && matchesVeg;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'weight-desc') return b.weight - a.weight;
    return 0;
  });

  const activeCategory = MENU_CATEGORIES.find(c => c.id === selectedCategory);
  const hasActiveFilters = filterSpicy || filterVeg || sortBy !== 'default';

  return (
    <section className="relative z-10 w-full" id="menu">

      {/* ── SECTION HEADER ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-panda-orange">
              Каталог блюд
            </span>
            <h2 className={`font-display text-3xl sm:text-4xl font-normal italic tracking-tight mt-1 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              {effectiveSearch
                ? <>Поиск: <span className="text-panda-orange">«{effectiveSearch}»</span></>
                : 'Наше Меню'}
            </h2>
            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-zinc-600 font-medium' : 'text-white/40'}`}>
              {sortedProducts.length} {sortedProducts.length === 1 ? 'позиция' : sortedProducts.length < 5 ? 'позиции' : 'позиций'} в категории
            </p>
          </div>

          {/* Desktop Search */}
          <div className="relative hidden sm:flex items-center w-72">
            <Search className={`absolute left-3.5 h-4 w-4 pointer-events-none ${theme === 'light' ? 'text-zinc-400' : 'text-white/30'}`} />
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={localSearch}
              onChange={e => handleSearch(e.target.value)}
              className={`w-full h-11 pl-10 pr-9 rounded-2xl border text-sm transition-all focus:outline-none ${
                theme === 'light'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-orange-500 shadow-sm'
                  : 'bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-panda-orange focus:bg-white/8'
              }`}
            />
            {localSearch && (
              <button onClick={clearSearch} className={`absolute right-3 transition-colors ${theme === 'light' ? 'text-zinc-400 hover:text-zinc-700' : 'text-white/30 hover:text-white'}`}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative flex sm:hidden items-center mt-4">
          <Search className={`absolute left-3.5 h-4 w-4 pointer-events-none ${theme === 'light' ? 'text-zinc-400' : 'text-white/30'}`} />
          <input
            type="text"
            placeholder="Поиск суши, роллов, пиццы..."
            value={localSearch}
            onChange={e => handleSearch(e.target.value)}
            className={`w-full h-11 pl-10 pr-9 rounded-2xl border text-sm transition-all focus:outline-none ${
              theme === 'light'
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-orange-500 shadow-sm'
                : 'bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-panda-orange'
            }`}
          />
          {localSearch && (
            <button onClick={clearSearch} className={`absolute right-3 transition-colors ${theme === 'light' ? 'text-zinc-400 hover:text-zinc-700' : 'text-white/30 hover:text-white'}`}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY + LAYOUT WRAPPER ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">

          {/* ── DESKTOP SIDEBAR CATEGORIES ── */}
          <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pb-4 pr-1 scrollbar-thin">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/25 px-3 mb-2">
              Категории
            </div>
            {MENU_CATEGORIES.map(cat => {
              const Icon = iconMap[cat.icon] || Sparkles;
              const isActive = selectedCategory === cat.id && !effectiveSearch;
              const gradient = categoryColors[cat.id] || 'from-panda-orange to-orange-400';
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); clearSearch(); }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${isActive ? gradient : 'from-white/5 to-white/10'} transition-all`}>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`} />
                  </div>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/10 text-white/70' : 'text-white/20'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Filter panel in sidebar */}
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/25 px-3 mb-2">
                Фильтры
              </div>
              <button
                onClick={() => setFilterSpicy(!filterSpicy)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  filterSpicy ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${filterSpicy ? 'bg-red-500/20' : 'bg-white/5'}`}>
                  <Flame className="h-4 w-4" />
                </div>
                <span>Острое</span>
                {filterSpicy && <span className="ml-auto text-[9px] bg-red-500/20 px-1.5 py-0.5 rounded-md">ON</span>}
              </button>
              <button
                onClick={() => setFilterVeg(!filterVeg)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  filterVeg ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${filterVeg ? 'bg-green-500/20' : 'bg-white/5'}`}>
                  <Fish className="h-4 w-4 rotate-180" />
                </div>
                <span>Веган</span>
                {filterVeg && <span className="ml-auto text-[9px] bg-green-500/20 px-1.5 py-0.5 rounded-md">ON</span>}
              </button>

              {/* Sort */}
              <div className="mt-3 px-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Сортировка</div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full h-9 pl-3 pr-8 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-panda-orange cursor-pointer appearance-none"
                  >
                    <option value="default" className="bg-panda-charcoal">По умолчанию</option>
                    <option value="price-asc" className="bg-panda-charcoal">Сначала дешевле</option>
                    <option value="price-desc" className="bg-panda-charcoal">Сначала дороже</option>
                    <option value="weight-desc" className="bg-panda-charcoal">Сначала тяжелее</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-white/30 pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* ── MOBILE/TABLET: Horizontal Category Pills ── */}
            {!effectiveSearch && (
              <div
                ref={catBarRef}
                className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-5 -mx-4 px-4 scrollbar-thin scrollbar-thumb-panda-orange scrollbar-track-transparent"
              >
                {MENU_CATEGORIES.map(cat => {
                  const Icon = iconMap[cat.icon] || Sparkles;
                  const isActive = selectedCategory === cat.id;
                  const gradient = categoryColors[cat.id] || 'from-panda-orange to-orange-400';
                  return (
                    <button
                      key={cat.id}
                      ref={isActive ? activeCatRef : undefined}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                        isActive
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-[1.02]`
                          : theme === 'light'
                            ? 'bg-zinc-200/80 border border-zinc-300 text-zinc-800 hover:bg-zinc-300 hover:text-zinc-950 shadow-sm'
                            : 'bg-white/5 border border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── MOBILE: Filter toggle bar ── */}
            <div className="lg:hidden flex items-center gap-2 mb-5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-9 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  hasActiveFilters
                    ? 'bg-panda-orange/10 border-panda-orange/30 text-panda-orange'
                    : theme === 'light'
                      ? 'bg-zinc-200/80 border-zinc-300 text-zinc-800 hover:text-zinc-950'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Фильтры{hasActiveFilters ? ' •' : ''}</span>
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <button
                      onClick={() => setFilterSpicy(!filterSpicy)}
                      className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        filterSpicy
                          ? 'bg-red-500/20 border-red-500/40 text-red-500 font-bold'
                          : theme === 'light'
                            ? 'border-zinc-300 bg-zinc-200/80 text-zinc-700'
                            : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      <Flame className="h-3.5 w-3.5" /> Острое
                    </button>
                    <button
                      onClick={() => setFilterVeg(!filterVeg)}
                      className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        filterVeg
                          ? 'bg-green-500/20 border-green-500/40 text-green-600 font-bold'
                          : theme === 'light'
                            ? 'border-zinc-300 bg-zinc-200/80 text-zinc-700'
                            : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      <Fish className="h-3.5 w-3.5 rotate-180" /> Веган
                    </button>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as typeof sortBy)}
                        className={`h-9 pl-3 pr-7 rounded-xl border text-xs focus:outline-none cursor-pointer appearance-none ${
                          theme === 'light'
                            ? 'bg-zinc-200/80 border-zinc-300 text-zinc-800'
                            : 'bg-white/5 border-white/10 text-white'
                        }`}
                      >
                        <option value="default" className={theme === 'light' ? 'bg-white text-zinc-900' : 'bg-panda-charcoal text-white'}>По умолчанию</option>
                        <option value="price-asc" className={theme === 'light' ? 'bg-white text-zinc-900' : 'bg-panda-charcoal text-white'}>Дешевле</option>
                        <option value="price-desc" className={theme === 'light' ? 'bg-white text-zinc-900' : 'bg-panda-charcoal text-white'}>Дороже</option>
                        <option value="weight-desc" className={theme === 'light' ? 'bg-white text-zinc-900' : 'bg-panda-charcoal text-white'}>Тяжелее</option>
                      </select>
                      <ChevronDown className={`absolute right-2 top-2.5 h-3 w-3 ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'} pointer-events-none`} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── CATEGORY ACTIVE LABEL (desktop) ── */}
            {!effectiveSearch && activeCategory && (
              <div className="hidden lg:flex items-center gap-3 mb-6">
                <div className={`h-0.5 w-8 bg-gradient-to-r ${categoryColors[selectedCategory] || 'from-panda-orange to-orange-400'} rounded-full`} />
                <span className={`text-sm font-bold ${theme === 'light' ? 'text-zinc-800' : 'text-white/60'}`}>{activeCategory.name}</span>
                <span className={`text-xs ${theme === 'light' ? 'text-zinc-500' : 'text-white/25'}`}>— {sortedProducts.length} блюд</span>
              </div>
            )}

            {/* ── PRODUCT GRID ── */}
            {sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">😿</div>
                <h3 className={`font-display text-lg font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Ничего не найдено</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-zinc-600' : 'text-white/40'} mt-1 max-w-sm`}>
                  Попробуйте изменить фильтры или поисковый запрос.
                </p>
                {effectiveSearch && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-5 py-2 rounded-xl bg-panda-orange text-white text-xs font-bold cursor-pointer hover:bg-panda-orange-hover transition-all"
                  >
                    Сбросить поиск
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}-${effectiveSearch}-${filterSpicy}-${filterVeg}-${sortBy}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {sortedProducts.map((product, index) => {
                    const qty = getProductQuantity(product.id);
                    const isStopped = product.inStock === false;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
                        className={`flex flex-col rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden group ${
                          isStopped ? 'opacity-85 border-red-500/30' :
                          theme === 'light'
                            ? 'border-zinc-200/80 bg-white hover:border-orange-300/60 shadow-md hover:shadow-xl'
                            : 'border-white/5 bg-panda-charcoal/50 hover:border-white/10 hover:bg-panda-charcoal/80'
                        }`}
                      >
                        {/* ── Image ── */}
                        <div
                          className="relative w-full overflow-hidden bg-panda-gray cursor-pointer"
                          style={{ paddingBottom: '62%' }}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="absolute inset-0">
                            <ProductImage
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                                isStopped ? 'grayscale opacity-50' : ''
                              }`}
                              placeholderEmoji={product.category === 'drinks' ? '🥤' : product.category === 'desserts' ? '🍰' : '🍣'}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-panda-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Stop-List Banner Overlay */}
                            {isStopped && (
                              <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 z-10">
                                <span className="px-3.5 py-1.5 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-red-400/40">
                                  <Ban className="h-4 w-4" />
                                  Стоп-Лист
                                </span>
                                <span className="text-[10px] text-white/70 font-semibold mt-0.5">Временно нет в наличии</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {product.tags?.map((tag, idx) => (
                              <span key={idx} className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-panda-orange px-2 py-0.5 rounded-md shadow-md">
                                {tag}
                              </span>
                            ))}
                            {product.spicy && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-red-600/90 text-white text-[10px] shadow-md" title="Острое">🌶️</span>
                            )}
                            {product.vegetarian && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-green-600/90 text-white text-[10px] shadow-md" title="Вегетарианское">🥦</span>
                            )}
                          </div>

                          {/* Weight badge */}
                          <div className="absolute bottom-3 right-3 rounded-lg bg-black/85 px-2.5 py-1 text-[10px] font-bold text-white/90 shadow-md">
                            {product.pieces ? `${product.pieces} шт • ` : ''}{product.weight} {product.category === 'drinks' ? 'мл' : 'г'}
                          </div>

                          {/* Cart badge if in cart */}
                          {qty > 0 && !isStopped && (
                            <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-panda-orange text-white text-[11px] font-black shadow-lg">
                              {qty}
                            </div>
                          )}
                        </div>

                        {/* ── Body ── */}
                        <div className="flex flex-col flex-1 p-5">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4
                              onClick={() => setSelectedProduct(product)}
                              className={`font-display font-normal italic text-lg ${theme === 'light' ? 'text-zinc-900' : 'text-white'} hover:text-panda-orange transition-colors cursor-pointer leading-tight`}
                            >
                              {product.name}
                            </h4>
                            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                              theme === 'light' ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' : 'bg-white/5 text-white/50 border border-white/5'
                            }`}>
                              {product.weight} {product.category === 'drinks' ? 'мл' : 'г'}
                            </span>
                          </div>

                          <p className={`text-xs ${theme === 'light' ? 'text-zinc-600' : 'text-white/55'} leading-relaxed line-clamp-2 mb-2.5`}>
                            {product.description}
                          </p>

                          {/* ── Muted Ingredients Breakdown (Composition with Grams) ── */}
                          {product.ingredientsSummary && (
                            <div className={`p-2 rounded-xl mb-4 border transition-colors ${
                              theme === 'light'
                                ? 'bg-zinc-50/90 border-zinc-200/70 text-zinc-500'
                                : 'bg-white/[0.03] border-white/5 text-white/40'
                            }`}>
                              <p className="text-[10px] uppercase font-bold tracking-wider mb-0.5 opacity-70">
                                🍱 Состав и граммовка:
                              </p>
                              <p className="text-[11px] leading-snug line-clamp-2 font-normal">
                                {product.ingredientsSummary}
                              </p>
                            </div>
                          )}

                          {/* Price + Add */}
                          <div className={`flex items-center justify-between gap-3 pt-3 border-t ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'} mt-auto`}>
                            <div className="flex flex-col">
                              {product.oldPrice && (
                                <span className={`text-xs ${theme === 'light' ? 'text-zinc-400' : 'text-white/25'} line-through font-mono leading-none`}>
                                  {product.oldPrice} ₽
                                </span>
                              )}
                              <span className={`font-mono text-xl font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} leading-tight`}>
                                {product.price} <span className={`${theme === 'light' ? 'text-zinc-500' : 'text-white/50'} text-sm`}>₽</span>
                              </span>
                            </div>

                            {isStopped ? (
                              <button
                                disabled
                                className="h-10 px-4 rounded-xl border border-red-500/40 bg-red-500/15 text-red-400 font-black text-xs flex items-center gap-1.5 cursor-not-allowed opacity-90 shadow-sm"
                              >
                                <Ban className="h-4 w-4" />
                                <span>Стоп-Лист</span>
                              </button>
                            ) : qty > 0 ? (
                              <div className="flex items-center rounded-xl bg-panda-orange/10 border border-panda-orange/25 p-0.5 h-10">
                                <button
                                  onClick={() => onRemoveFromCart(product.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-panda-orange/20 text-panda-orange active:scale-90 transition-all cursor-pointer"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className={`w-7 text-center text-sm font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{qty}</span>
                                <button
                                  onClick={() => onAddToCart(product)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-panda-orange/20 text-panda-orange active:scale-90 transition-all cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onAddToCart(product)}
                                className={`h-10 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                  theme === 'light'
                                    ? 'bg-zinc-100 border-zinc-200 text-zinc-900 hover:bg-panda-orange hover:border-panda-orange hover:text-white'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-panda-orange hover:border-panda-orange'
                                }`}
                              >
                                <Plus className="h-4 w-4" />
                                В корзину
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── PRODUCT DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[88vh] overflow-y-auto ${
                theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'border-white/10 bg-panda-charcoal text-white'
              }`}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className={`absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-2xl transition-all active:scale-90 cursor-pointer ${
                  theme === 'light' ? 'bg-white/95 text-zinc-900 border-zinc-300 hover:bg-zinc-100' : 'bg-black/80 text-white border-white/20 hover:bg-panda-orange'
                }`}
                title="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Left: Image */}
              <div className={`relative ${theme === 'light' ? 'bg-zinc-100' : 'bg-panda-gray'}`} style={{ minHeight: 240 }}>
                <ProductImage
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover absolute inset-0"
                  placeholderEmoji={selectedProduct.category === 'drinks' ? '🥤' : selectedProduct.category === 'desserts' ? '🍰' : '🍣'}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'light' ? 'from-white/40' : 'from-panda-charcoal/60'} to-transparent`} />
                <div className="absolute top-4 left-4 flex gap-1.5">
                  {selectedProduct.spicy && (
                    <span className="text-[10px] font-black uppercase text-white bg-red-600 px-2 py-0.5 rounded-md shadow-sm">🌶️ ОСТРОЕ</span>
                  )}
                  {selectedProduct.vegetarian && (
                    <span className="text-[10px] font-black uppercase text-white bg-green-600 px-2 py-0.5 rounded-md shadow-sm">🥦 ВЕГАН</span>
                  )}
                </div>
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                    {selectedProduct.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] font-extrabold uppercase text-white bg-panda-orange px-2 py-0.5 rounded-md shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Right: Info */}
              <div className="flex flex-col p-6 sm:p-8">
                <span className="text-[10px] font-bold text-panda-orange uppercase tracking-widest">
                  {MENU_CATEGORIES.find(c => c.id === selectedProduct.category)?.name}
                </span>
                <h3 className={`font-display text-xl sm:text-2xl font-black mt-1 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                  {selectedProduct.name}
                </h3>

                <div className={`flex items-center gap-4 text-xs font-semibold mt-2 mb-3 ${theme === 'light' ? 'text-zinc-500' : 'text-white/40'}`}>
                  {selectedProduct.pieces && <span>🍱 {selectedProduct.pieces} кусочков</span>}
                  <span>⚖️ Вес: <strong>{selectedProduct.weight} {selectedProduct.category === 'drinks' ? 'мл' : 'г'}</strong></span>
                </div>

                <p className={`text-xs leading-relaxed mb-4 ${theme === 'light' ? 'text-zinc-600' : 'text-white/65'}`}>
                  {selectedProduct.description}
                </p>

                {/* ── Pizza Interactive Customizer (Size & Sauce) ── */}
                {selectedProduct.category === 'pizza' && (
                  <div className={`p-4 rounded-2xl border mb-4 space-y-3.5 ${
                    theme === 'light' ? 'bg-orange-50/70 border-orange-200' : 'bg-white/[0.04] border-white/10'
                  }`}>
                    {/* Size Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-700' : 'text-panda-gold'}`}>
                          🍕 Диаметр пиццы:
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {pizzaSize === 25 ? 'Стандарт (25 см)' : 'Большая (35 см)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPizzaSize(25)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            pizzaSize === 25
                              ? 'bg-panda-orange text-white shadow-md shadow-panda-orange/20 border border-panda-orange'
                              : theme === 'light'
                                ? 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>25 см</span>
                          <span className="text-[10px] opacity-75 font-normal">({selectedProduct.weight || 450}г)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPizzaSize(35)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            pizzaSize === 35
                              ? 'bg-panda-orange text-white shadow-md shadow-panda-orange/20 border border-panda-orange'
                              : theme === 'light'
                                ? 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>35 см</span>
                          <span className="text-[10px] opacity-75 font-normal">({Math.round((selectedProduct.weight || 450) * 1.55)}г)</span>
                        </button>
                      </div>
                    </div>

                    {/* Sauce Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-700' : 'text-panda-gold'}`}>
                          🍅 Основа / Соус:
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {pizzaSauce === 'red' ? 'Красный фирменный (Томатный)' : 'Белый сливочный (Ранч/Альфредо)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPizzaSauce('red')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            pizzaSauce === 'red'
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/20 border border-red-500'
                              : theme === 'light'
                                ? 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>🍅 Красный соус</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPizzaSauce('white')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            pizzaSauce === 'white'
                              ? 'bg-amber-100 text-amber-950 font-black shadow-md border border-amber-300'
                              : theme === 'light'
                                ? 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>🥛 Белый соус</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Detailed Recipe & Grams Chips ── */}
                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                  <div className={`p-3.5 rounded-2xl border mb-4 ${
                    theme === 'light' ? 'bg-zinc-100/90 border-zinc-200' : 'bg-white/5 border-white/10'
                  }`}>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5 ${
                      theme === 'light' ? 'text-zinc-700' : 'text-panda-gold'
                    }`}>
                      <ChefHat className="h-3.5 w-3.5" />
                      <span>Технологический состав & точные граммовки:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.ingredients.map(ing => (
                        <span 
                          key={ing.id}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                            theme === 'light' 
                              ? 'bg-white border-zinc-300 text-zinc-800 shadow-xs' 
                              : 'bg-white/5 border-white/10 text-white/90'
                          }`}
                        >
                          <span className="text-panda-orange font-bold">•</span>
                          <span>{ing.name}</span>
                          <span className="font-mono text-panda-orange font-bold text-[10px]">
                            {ing.amount} {ing.unit}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-5">
                  <div className={`flex items-start gap-2.5 rounded-xl p-2.5 text-xs ${
                    theme === 'light' ? 'bg-zinc-100 border border-zinc-200 text-zinc-700' : 'bg-white/5 text-white/60'
                  }`}>
                    <ShieldCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className={`font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>100% Свежие ингредиенты из-под ножа</p>
                      <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-zinc-500' : 'text-white/35'}`}>
                        {selectedProduct.category === 'pizza' 
                          ? 'Настоящая моцарелла, свежее тесто и авторские соусы.' 
                          : 'Охлажденный лосось, премиальный рис Shinaki, сливочный сыр Cremette.'}
                      </p>
                    </div>
                  </div>
                </div>

                {(() => {
                  // Compute dynamic customized product if pizza
                  const isPizza = selectedProduct.category === 'pizza';
                  let effectiveProduct = selectedProduct;
                  let effectivePrice = selectedProduct.price;
                  let effectiveWeight = selectedProduct.weight;

                  if (isPizza) {
                    const baseCleanName = selectedProduct.name
                      .replace(/\s*(25|35)\s*см/gi, '')
                      .replace(/\s*\((белый|красный)\s*соус\)/gi, '')
                      .trim();
                    
                    const sauceLabel = pizzaSauce === 'white' ? 'белый соус' : 'красный соус';
                    const configuredName = `${baseCleanName} ${pizzaSize} см (${sauceLabel})`;
                    
                    // Price calculation: 35cm is ~+55% or +240-280 руб
                    if (pizzaSize === 35) {
                      effectivePrice = Math.round(selectedProduct.price * 1.5);
                      effectiveWeight = Math.round(selectedProduct.weight * 1.55);
                    }
                    
                    effectiveProduct = {
                      ...selectedProduct,
                      id: `${selectedProduct.id}-${pizzaSize}cm-${pizzaSauce}`,
                      name: configuredName,
                      price: effectivePrice,
                      weight: effectiveWeight,
                      pieces: 8
                    };
                  }

                  const activeQty = getProductQuantity(effectiveProduct.id);

                  return (
                    <div className={`flex items-center justify-between gap-4 pt-4 border-t ${theme === 'light' ? 'border-zinc-200' : 'border-white/5'}`}>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-semibold uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-white/35'}`}>
                          {isPizza ? `Итого за ${pizzaSize} см` : 'Цена'}
                        </span>
                        {selectedProduct.oldPrice && !isPizza && (
                          <span className={`text-xs line-through font-mono ${theme === 'light' ? 'text-zinc-400' : 'text-white/25'}`}>{selectedProduct.oldPrice} ₽</span>
                        )}
                        <span className={`font-display text-2xl font-black ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{effectivePrice} ₽</span>
                      </div>

                      {selectedProduct.inStock === false ? (
                        <button
                          disabled
                          className="h-12 px-6 rounded-xl bg-red-500/20 border border-red-500/40 text-red-500 font-extrabold text-sm flex items-center gap-2 cursor-not-allowed opacity-90 shadow-md"
                        >
                          <Ban className="h-4.5 w-4.5" />
                          <span>Стоп-Лист (Нет в наличии)</span>
                        </button>
                      ) : activeQty > 0 ? (
                        <div className="flex items-center rounded-xl bg-panda-orange/10 border border-panda-orange/25 p-1 h-12 min-w-28">
                          <button
                            onClick={() => onRemoveFromCart(effectiveProduct.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-panda-orange/20 text-panda-orange cursor-pointer transition-all active:scale-90"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className={`flex-1 text-center font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                            {activeQty}
                          </span>
                          <button
                            onClick={() => onAddToCart(effectiveProduct)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-panda-orange/20 text-panda-orange cursor-pointer transition-all active:scale-90"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(effectiveProduct)}
                          className="h-12 px-6 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white font-bold text-sm shadow-lg shadow-panda-orange/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>В корзину ({effectivePrice} ₽)</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
