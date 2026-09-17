/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Compass, ShieldCheck, User, MessageSquare, Phone, MapPin, Sparkles, Clock, AlertCircle, X, Sun, Moon, ChefHat, Truck, Award, Lock, LogOut, Eye, LayoutDashboard } from 'lucide-react';
import { CartItem, Product, User as UserType, Order, PromoCode, OrderStatus, KitchenStatus } from './types';
import { MENU_ITEMS } from './data/menuData';

// Subcomponents
import Header from './components/Header';
import Hero from './components/Hero';
import InteractiveZone from './components/InteractiveZone';
import MenuSection from './components/MenuSection';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import UserProfile from './components/UserProfile';
import ReviewSection from './components/ReviewSection';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import { ChefDashboard, CourierDashboard } from './components/RoleDashboards';
import { OwnerDashboard, AdminDashboard, DashboardErrorBoundary } from './components/AdminOwnerDashboards';
import StaffAuthModal from './components/StaffAuthModal';
import ProductImage from './components/ProductImage';

// ASMR Audio Utilities
import { isSoundEnabled, setSoundEnabled, playFurinChime, playBambooSnap, playCookieCrack, playPandaPurr, playNewOrderAlarm, unlockAudio } from './utils/audio';
import { getAuthHeaders } from './utils/auth';

export default function App() {
  // Menu list (populated from API with fallback)
  const [products, setProducts] = useState<Product[]>(MENU_ITEMS);

  // Real-time Kitchen Status (Emergency Stop)
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatus>({
    isOpen: true,
    pauseReason: '',
    pauseUntil: null,
    updatedAt: Date.now()
  });
  const [isConnected, setIsConnected] = useState(true);

  const handleUpdateKitchenStatus = async (isOpen: boolean, reason = '', minutes?: number) => {
    try {
      const res = await fetch('/api/admin/kitchen-status', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isOpen, pauseReason: reason, pauseMinutes: minutes })
      });
      const data = await res.json();
      if (data.success && data.status) {
        setKitchenStatus(data.status);
      }
    } catch (err) {
      console.error('Error updating kitchen status:', err);
    }
  };

  const handleUpdateProduct = (productId: string, price?: number, inStock?: boolean) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          ...(price !== undefined ? { price } : {}),
          ...(inStock !== undefined ? { inStock } : {})
        };
      }
      return p;
    }));
  };

  // User Auth state (initialized first to prevent TDZ error)
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('pandabar_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse user from localStorage:", e);
      return null;
    }
  });

  // User Role determination and Staff Terminal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const currentRole: 'client' | 'chef' | 'courier' | 'owner' | 'admin' = (currentUser?.role as any) || 'client';
  const [staffViewMode, setStaffViewMode] = useState<'dashboard' | 'storefront'>('dashboard');

  // Master Admin Screen Switcher (Exclusively available for role === 'admin')
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'owner' | 'chef' | 'courier' | 'storefront'>(() => {
    try {
      const saved = sessionStorage.getItem('pandabar_admin_view_mode');
      if (saved && ['admin', 'owner', 'chef', 'courier', 'storefront'].includes(saved)) {
        return saved as any;
      }
    } catch (e) {}
    return 'admin';
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('pandabar_admin_view_mode', adminViewMode);
    } catch (e) {}
  }, [adminViewMode]);

  // Listen to #staff or /staff in URL
  useEffect(() => {
    const handleUrlRoute = () => {
      if (window.location.hash === '#staff' || window.location.pathname.endsWith('/staff')) {
        setIsStaffModalOpen(true);
      }
    };
    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Sound state
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    setSoundEnabledState(nextVal);
    if (nextVal) {
      playFurinChime();
    }
  };

  // Theme state for presentation
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('pandabar_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Effect to toggle light/dark theme class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    try {
      localStorage.setItem('pandabar_theme', theme);
    } catch (e) {
      console.warn(e);
    }
  }, [theme]);

  // Order status progression updater for Chef/Courier dashboards
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        console.error(`[Status update] Failed (${response.status}):`, err.error);
        return;
      }
      const data = await response.json();
      if (data.success && data.order) {
        // Keep client tracking state synced if this is the user's active order
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder(data.order);
        }
      }
    } catch (err) {
      console.error("[Status update] Network error:", err);
    }
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pandabar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to parse cart from localStorage:", e);
      return [];
    }
  });



  // Active tracking order state
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('pandabar_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse active order from localStorage:", e);
      return null;
    }
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // UI state toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Checkout intermediary data
  const [checkoutType, setCheckoutType] = useState<'delivery' | 'pickup'>('delivery');
  const [checkoutPromo, setCheckoutPromo] = useState<PromoCode | null>(null);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);

  // ─── Hardware / System Back Button Trapping (prevent browser back closing the site when modal is open) ───
  const modalHistoryPushedRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);
  const isAnyAppModalOpen = isCartOpen || isCheckoutOpen || isProfileOpen || selectedProduct !== null;

  useEffect(() => {
    if (isAnyAppModalOpen && !modalHistoryPushedRef.current) {
      modalHistoryPushedRef.current = true;
      try {
        window.history.pushState({ pandabarModalOpen: true }, '');
      } catch (e) {}
    } else if (!isAnyAppModalOpen && modalHistoryPushedRef.current) {
      modalHistoryPushedRef.current = false;
      if (window.history.state?.pandabarModalOpen) {
        ignoreNextPopStateRef.current = true;
        try {
          window.history.back();
        } catch (e) {}
      }
    }
  }, [isAnyAppModalOpen]);

  // Lock body scroll when any modal is open so the menu in background does not scroll or shift
  useEffect(() => {
    if (isAnyAppModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyAppModalOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }
      if (modalHistoryPushedRef.current) {
        modalHistoryPushedRef.current = false;
        if (selectedProduct) {
          setSelectedProduct(null);
        } else if (isCheckoutOpen) {
          setIsCheckoutOpen(false);
        } else if (isCartOpen) {
          setIsCartOpen(false);
        } else if (isProfileOpen) {
          setIsProfileOpen(false);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, isCheckoutOpen, isCartOpen, isProfileOpen]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('pandabar_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pandabar_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pandabar_user');
    }
  }, [currentUser]);

  // Sync active order to localStorage
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('pandabar_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('pandabar_active_order');
    }
  }, [activeOrder]);

  // Fetch initial kitchen status and menu from the fullstack API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [menuRes, kitchenRes] = await Promise.all([
          fetch('/api/menu').catch(() => null),
          fetch('/api/kitchen-status').catch(() => null)
        ]);

        if (menuRes && menuRes.ok) {
          const mData = await menuRes.json();
          if (mData.success && mData.menu) setProducts(mData.menu);
        }

        if (kitchenRes && kitchenRes.ok) {
          const kData = await kitchenRes.json();
          if (kData.success && kData.status) setKitchenStatus(kData.status);
        }
      } catch (err) {
        console.warn('Initial data fetch warning:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Robust SSE Real-time Listener with Auto-reconnect & Fallback Polling
  useEffect(() => {
    let evtSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let isCancelled = false;

    const connectSSE = () => {
      try {
        evtSource = new EventSource('/api/live-stream');

        evtSource.onopen = () => {
          setIsConnected(true);
        };

        evtSource.onmessage = (event) => {
          setIsConnected(true);
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'KITCHEN_STATUS_CHANGED' && parsed.data) {
              setKitchenStatus(parsed.data);
            } else if (parsed.type === 'ORDER_UPDATED' && parsed.data) {
              const updatedOrder: Order = parsed.data;
              if (activeOrder && activeOrder.id === updatedOrder.id) {
                setActiveOrder(updatedOrder);
              }
            } else if (parsed.type === 'ORDER_CREATED' && parsed.data) {
              // Alarm sound played if staff viewport
              if (currentRole === 'chef' || currentRole === 'admin') {
                playNewOrderAlarm();
              }
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        };

        evtSource.onerror = () => {
          if (evtSource) {
            evtSource.close();
            evtSource = null;
          }
          if (!isCancelled) {
            reconnectTimeout = setTimeout(connectSSE, 3000);
          }
        };
      } catch (e) {
        if (!isCancelled) {
          reconnectTimeout = setTimeout(connectSSE, 4000);
        }
      }
    };

    connectSSE();

    // Fallback polling for kitchen status and orders every 10 seconds
    const fallbackInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/kitchen-status');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status) {
            setKitchenStatus(data.status);
            setIsConnected(true);
          }
        } else {
          setIsConnected(false);
        }
      } catch (e) {
        setIsConnected(false);
      }
    }, 10000);

    return () => {
      isCancelled = true;
      if (evtSource) evtSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(fallbackInterval);
    };
  }, [currentRole, activeOrder?.id]);

  // Poll current status of active order in background
  useEffect(() => {
    if (!activeOrder) return;

    // Check if order is completed or cancelled, stop polling
    if (activeOrder.status === 'completed' || activeOrder.status === 'cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const headers: Record<string, string> = {};
        if (currentUser?.token) {
          headers['Authorization'] = `Bearer ${currentUser.token}`;
        }
        const response = await fetch(`/api/orders/${activeOrder.id}`, { headers });
        const data = await response.json();
        if (data.success && data.order) {
          setActiveOrder(data.order);
          if (data.order.status === 'completed' || data.order.status === 'cancelled') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error polling active order:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeOrder?.id, activeOrder?.status]);

  // --- ACTIONS ---

  const handleAddToCart = (product: Product) => {
    playBambooSnap();
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        // Create a new array AND a new object to avoid mutation (important for React StrictMode)
        return prevCart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === productId);
      if (existingIndex === -1) return prevCart;
      const item = prevCart[existingIndex];
      if (item.quantity > 1) {
        // Create new array AND new object to avoid mutation (important for React StrictMode)
        return prevCart.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.product.id !== productId);
      }
    });
  };

  const handleAddBundleToCart = (items: { product: Product; quantity: number }[]) => {
    try {
      playBambooSnap();
      playFurinChime();
    } catch (e) {}
    setCart((prevCart) => {
      let newCart = [...prevCart];
      items.forEach(({ product, quantity }) => {
        const existingIndex = newCart.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + quantity
          };
        } else {
          newCart.push({ product, quantity });
        }
      });
      return newCart;
    });
    setIsCartOpen(true);
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    // Attempt to search for existing active order for this user
    fetch(`/api/orders?userId=${user.id}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders) {
          const ongoing = data.orders.find((o: Order) => o.status !== 'completed' && o.status !== 'cancelled');
          if (ongoing) {
            setActiveOrder(ongoing);
          }
        }
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveOrder(null);
    localStorage.removeItem('pandabar_user');
    localStorage.removeItem('pandabar_auth_token');
    localStorage.removeItem('pandabar_active_order');
  };

  const handleOpenCheckout = (type: 'delivery' | 'pickup', promo: PromoCode | null, discount: number) => {
    setCheckoutType(type);
    setCheckoutPromo(promo);
    setCheckoutDiscount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order, updatedUser?: User) => {
    setIsCheckoutOpen(false);
    setCart([]); // Clear shopping cart upon checkout success
    setActiveOrder(order);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem('pandabar_user', JSON.stringify(updatedUser));
    }
    setIsProfileOpen(true); // Automatically open personal tracking panel
  };

  return (
    <div className="min-h-screen bg-panda-dark text-white selection:bg-panda-orange selection:text-white relative overflow-x-clip transition-colors duration-500">
      <div className="mesh-gradient-bg" />
      <div className="japanese-grid" />
      
      {/* Exquisite, ultra-premium Japanese atmospheric accents in the background (fixed to cover entire scroll height) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-20 md:opacity-30 transition-opacity duration-500">
        {/* Large Decorative Vertical Japanese Glyphs */}
        <div className="absolute top-[12%] left-[3%] text-panda-orange/5 font-display text-[6vw] leading-none font-black uppercase select-none tracking-[0.2em] hidden lg:block" style={{ writingMode: 'vertical-rl' }}>
          パンダ寿司
        </div>
        <div className="absolute top-[32%] right-[3%] text-panda-gold/5 font-display text-[7vw] leading-none font-bold select-none tracking-[0.2em] hidden lg:block" style={{ writingMode: 'vertical-rl' }}>
          厳選素材
        </div>
        <div className="absolute bottom-[8%] left-[4%] text-panda-gold/5 font-mono text-[10px] tracking-[0.4em] font-bold select-none hidden md:block" style={{ writingMode: 'vertical-rl' }}>
          ARTISAN SHUN SUSHI & YAKITORI
        </div>

        {/* Traditional Seigaiha wave vector outline accents */}
        <div className="absolute top-[6%] right-[6%] w-80 h-80 opacity-[0.04] text-panda-orange">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,15 A15,15 0 0,1 80,15 A15,15 0 0,1 80,45 A15,15 0 0,1 50,45 A15,15 0 0,1 50,15" />
            <path d="M20,45 A15,15 0 0,1 50,45 A15,15 0 0,1 50,75 A15,15 0 0,1 20,75 A15,15 0 0,1 20,45" />
            <path d="M50,45 A15,15 0 0,1 80,45 A15,15 0 0,1 80,75 A15,15 0 0,1 50,75 A15,15 0 0,1 50,45" />
          </svg>
        </div>
        <div className="absolute bottom-[10%] right-[12%] w-96 h-96 opacity-[0.03] text-panda-gold">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" fill="none" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1.25" fill="none" strokeDasharray="10 2" />
          </svg>
        </div>

        {/* Left Side Bamboo Grove Accent */}
        <div className={`absolute top-[3%] left-[1.5%] w-24 h-[94%] hidden md:block transition-all duration-300 ${
          theme === 'light' 
            ? 'opacity-[0.85] text-emerald-600' 
            : 'opacity-[0.4] text-emerald-400'
        }`}>
          <svg viewBox="0 0 100 800" className="w-full h-full" fill="currentColor">
            {/* Bamboo stalk 1 */}
            <path d="M 30,800 L 30,0 C 30,-5 34,-5 34,0 L 34,800 Z" opacity={theme === 'light' ? '0.9' : '0.8'} />
            <rect x="28" y="100" width="8" height="2" rx="0.5" />
            <rect x="28" y="220" width="8" height="2" rx="0.5" />
            <rect x="28" y="340" width="8" height="2" rx="0.5" />
            <rect x="28" y="460" width="8" height="2" rx="0.5" />
            <rect x="28" y="580" width="8" height="2" rx="0.5" />
            <rect x="28" y="700" width="8" height="2" rx="0.5" />
            
            {/* Bamboo stalk 2 (angled) */}
            <path d="M 60,800 L 50,0 C 50,-5 53,-5 53,0 L 63,800 Z" opacity={theme === 'light' ? '0.95' : '0.85'} />
            <rect x="53" y="150" width="8" height="2" rx="0.5" transform="rotate(-1 57 150)" />
            <rect x="52" y="280" width="8" height="2" rx="0.5" transform="rotate(-1 56 280)" />
            <rect x="50" y="410" width="8" height="2" rx="0.5" transform="rotate(-1 54 410)" />
            <rect x="49" y="540" width="8" height="2" rx="0.5" transform="rotate(-1 53 540)" />
            <rect x="47" y="670" width="8" height="2" rx="0.5" transform="rotate(-1 51 670)" />

            {/* Bamboo Leaves */}
            {/* Branch 1 */}
            <path d="M 32,220 C 20,200 10,210 5,230 C 15,225 25,225 32,220 Z" />
            <path d="M 32,220 C 15,190 5,195 2,210 C 12,205 22,210 32,220 Z" />
            {/* Branch 2 */}
            <path d="M 52,280 C 65,260 75,270 80,290 C 70,285 60,285 52,280 Z" />
            <path d="M 52,280 C 68,250 78,255 81,270 C 71,265 61,270 52,280 Z" />
            {/* Branch 3 */}
            <path d="M 30,460 C 15,440 5,450 0,470 C 10,465 20,465 30,460 Z" />
            <path d="M 30,460 C 12,430 2,435 -1,450 C 9,445 19,450 30,460 Z" />
            {/* Branch 4 */}
            <path d="M 49,540 C 62,520 72,530 77,550 C 67,545 57,545 49,540 Z" />
            {/* Leaves higher up */}
            <path d="M 33,100 C 45,80 55,90 60,110 C 50,105 40,105 33,100 Z" />
          </svg>
        </div>

        {/* Right Side Bamboo Grove Accent */}
        <div className={`absolute top-[18%] right-[2%] w-20 h-[80%] hidden lg:block transition-all duration-300 ${
          theme === 'light' 
            ? 'opacity-[0.8] text-emerald-600' 
            : 'opacity-[0.35] text-emerald-400'
        }`}>
          <svg viewBox="0 0 100 800" className="w-full h-full" fill="currentColor">
            <path d="M 40,800 L 40,0 C 40,-5 43,-5 43,0 L 43,800 Z" opacity={theme === 'light' ? '0.9' : '0.8'} />
            <rect x="39" y="80" width="6" height="2" rx="0.5" />
            <rect x="39" y="200" width="6" height="2" rx="0.5" />
            <rect x="39" y="320" width="6" height="2" rx="0.5" />
            <rect x="39" y="440" width="6" height="2" rx="0.5" />
            <rect x="39" y="560" width="6" height="2" rx="0.5" />
            <rect x="39" y="680" width="6" height="2" rx="0.5" />
            
            {/* Leaves */}
            <path d="M 41,200 C 55,180 65,190 70,210 C 60,205 50,205 41,200 Z" />
            <path d="M 41,320 C 25,300 15,310 10,330 C 20,325 30,325 41,320 Z" />
            <path d="M 41,560 C 55,540 65,550 70,570 C 60,565 50,565 41,560 Z" />
            <path d="M 41,680 C 25,660 15,670 10,690 C 20,685 30,685 41,680 Z" />
          </svg>
        </div>

        {/* Cute Stylized Minimalist Panda sitting on left side */}
        <div className={`absolute bottom-[20%] left-[3.5%] w-36 h-36 opacity-95 hidden md:block select-none pointer-events-none filter ${
          theme === 'light' 
            ? 'drop-shadow-[0_10px_25px_rgba(224,62,62,0.18)]' 
            : 'drop-shadow-[0_10px_25px_rgba(224,62,62,0.35)]'
        }`}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Soft Warm Backglow Aura */}
            <circle cx="100" cy="100" r="75" fill={theme === 'light' ? 'url(#risingSunGlow)' : 'url(#vibrantPandaGlow)'} opacity={theme === 'light' ? 0.22 : 0.45} />
            <defs>
              <radialGradient id="vibrantPandaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E03E3E" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#C5A880" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#C5A880" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="risingSunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E03E3E" />
                <stop offset="100%" stopColor="#E03E3E" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Panda Body */}
            <circle 
              cx="100" 
              cy="120" 
              r="50" 
              fill="#FFFFFF" 
              stroke={theme === 'light' ? '#18181B' : '#C5A880'} 
              strokeWidth={theme === 'light' ? '2.5' : '1.75'} 
            />
            <path 
              d="M 60,110 Q 100,100 140,110 Q 150,150 100,165 Q 50,150 60,110 Z" 
              fill="#FFFFFF" 
              stroke={theme === 'light' ? '#18181B' : '#C5A880'} 
              strokeWidth={theme === 'light' ? '2.5' : '1'} 
            />
            
            {/* Panda Back Ears */}
            <circle cx="55" cy="45" r="22" fill="#18181B" stroke={theme === 'light' ? 'none' : '#C5A880'} strokeWidth={theme === 'light' ? '0' : '1'} />
            <circle cx="145" cy="45" r="22" fill="#18181B" stroke={theme === 'light' ? 'none' : '#C5A880'} strokeWidth={theme === 'light' ? '0' : '1'} />
            <circle cx="55" cy="45" r="12" fill="#27272A" />
            <circle cx="145" cy="45" r="12" fill="#27272A" />
            
            {/* Head */}
            <circle 
              cx="100" 
              cy="80" 
              r="48" 
              fill="#FFFFFF" 
              stroke={theme === 'light' ? '#18181B' : '#C5A880'} 
              strokeWidth={theme === 'light' ? '2.5' : '1.75'} 
            />
            
            {/* Eye Patches */}
            <ellipse cx="78" cy="78" rx="15" ry="11" transform="rotate(-15 78 78)" fill="#18181B" />
            <ellipse cx="122" cy="78" rx="15" ry="11" transform="rotate(15 122 78)" fill="#18181B" />
            
            {/* Eyes (inner white dots for life) */}
            <circle cx="76" cy="76" r="4" fill="#FFFFFF" />
            <circle cx="124" cy="76" r="4" fill="#FFFFFF" />
            
            {/* Nose/Snout */}
            <ellipse cx="100" cy="90" rx="8" ry="5" fill="#18181B" />
            <path d="M 100,95 Q 100,101 95,101 M 100,95 Q 100,101 105,101" stroke="#18181B" strokeWidth="2.5" fill="none" />
            
            {/* Cheeks */}
            <circle cx="62" cy="92" r="6" fill="#FF4D4D" opacity={theme === 'light' ? '0.5' : '0.9'} />
            <circle cx="138" cy="92" r="6" fill="#FF4D4D" opacity={theme === 'light' ? '0.5' : '0.9'} />
            
            {/* Arms hugging a bamboo stalk */}
            <path d="M 52,108 C 55,125 75,135 90,125 C 80,120 70,110 52,108 Z" fill="#18181B" stroke={theme === 'light' ? 'none' : '#C5A880'} strokeWidth={theme === 'light' ? '0' : '1'} />
            <path d="M 148,108 C 145,125 125,135 110,125 C 120,120 130,110 148,108 Z" fill="#18181B" stroke={theme === 'light' ? 'none' : '#C5A880'} strokeWidth={theme === 'light' ? '0' : '1'} />
            
            {/* Small bamboo twig held in hand */}
            <path d="M 85,135 L 115,105" stroke={theme === 'light' ? '#22C55E' : '#34D399'} strokeWidth="4.5" strokeLinecap="round" />
            {/* Leaves on twig */}
            <path d="M 105,115 C 112,102 124,106 128,112 C 118,114 110,114 105,115 Z" fill={theme === 'light' ? '#4ADE80' : '#10B981'} />
            <path d="M 95,125 C 90,112 78,116 74,122 C 84,124 92,124 95,125 Z" fill={theme === 'light' ? '#4ADE80' : '#10B981'} />
          </svg>
        </div>

        {/* Top-Right Peeking Panda Silhouette */}
        <div className={`absolute top-[8%] right-[5%] w-32 h-32 opacity-95 hidden lg:block select-none pointer-events-none filter ${
          theme === 'light' 
            ? 'drop-shadow-[0_10px_25px_rgba(224,62,62,0.15)]' 
            : 'drop-shadow-[0_10px_25px_rgba(224,62,62,0.35)]'
        }`}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Soft Warm Backglow Aura */}
            <circle cx="160" cy="80" r="75" fill={theme === 'light' ? 'url(#risingSunGlow)' : 'url(#vibrantPandaGlow)'} opacity={theme === 'light' ? 0.22 : 0.45} />

            {/* Head peeking from right side */}
            <circle 
              cx="160" 
              cy="80" 
              r="50" 
              fill="#FFFFFF" 
              stroke={theme === 'light' ? '#18181B' : '#C5A880'} 
              strokeWidth={theme === 'light' ? '2.5' : '1.75'} 
            />
            
            {/* Ears */}
            <circle cx="120" cy="45" r="18" fill="#18181B" stroke={theme === 'light' ? 'none' : '#C5A880'} strokeWidth={theme === 'light' ? '0' : '1'} />
            <circle cx="190" cy="40" r="18" fill="#18181B" stroke={theme === 'light' ? 'none' : '#C5A880'} strokeWidth={theme === 'light' ? '0' : '1'} />
            
            {/* Eye Patches */}
            <ellipse cx="138" cy="85" rx="14" ry="10" transform="rotate(-25 138 85)" fill="#18181B" />
            <ellipse cx="178" cy="80" rx="14" ry="10" transform="rotate(10 178 80)" fill="#18181B" />
            
            {/* Eyes */}
            <circle cx="138" cy="83" r="3" fill="#FFFFFF" />
            <circle cx="176" cy="78" r="3" fill="#FFFFFF" />
            
            {/* Snout & Nose */}
            <ellipse cx="152" cy="98" rx="7" ry="4" fill="#18181B" />

            {/* Cheeks */}
            <circle cx="128" cy="96" r="5" fill="#FF4D4D" opacity={theme === 'light' ? '0.5' : '0.9'} />
            <circle cx="178" cy="92" r="5" fill="#FF4D4D" opacity={theme === 'light' ? '0.5' : '0.9'} />
            
            {/* Little paws holding edge */}
            <circle cx="108" cy="115" r="14" fill="#18181B" stroke={theme === 'light' ? '#18181B' : '#C5A880'} strokeWidth={theme === 'light' ? '1' : '1.5'} />
            <circle cx="145" cy="135" r="14" fill="#18181B" stroke={theme === 'light' ? '#18181B' : '#C5A880'} strokeWidth={theme === 'light' ? '1' : '1.5'} />
          </svg>
        </div>

        {/* Floating cherry blossom (Sakura) petal elements at varied angles and positions */}
        <div className="absolute top-[20%] left-[15%] w-6 h-4 opacity-[0.08] text-panda-orange rotate-12">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10,0 C13,4 17,6 17,10 C17,14 13,17 10,15 C7,17 3,14 3,10 C3,6 7,4 10,0 Z" />
          </svg>
        </div>
        <div className="absolute top-[55%] left-[25%] w-8 h-5 opacity-[0.06] text-panda-gold rotate-45">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10,0 C13,4 17,6 17,10 C17,14 13,17 10,15 C7,17 3,14 3,10 C3,6 7,4 10,0 Z" />
          </svg>
        </div>
        <div className="absolute top-[75%] right-[18%] w-5 h-3 opacity-[0.08] text-panda-orange -rotate-12">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10,0 C13,4 17,6 17,10 C17,14 13,17 10,15 C7,17 3,14 3,10 C3,6 7,4 10,0 Z" />
          </svg>
        </div>
        <div className="absolute top-[15%] right-[22%] w-7 h-4 opacity-[0.07] text-panda-gold -rotate-45">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10,0 C13,4 17,6 17,10 C17,14 13,17 10,15 C7,17 3,14 3,10 C3,6 7,4 10,0 Z" />
          </svg>
        </div>

        {/* Minimalist Asian red sun and stamp silhouette accents */}
        <div className="absolute top-[40%] left-[8%] w-16 h-16 rounded-full bg-panda-orange/5 blur-[2px] border border-panda-orange/10 hidden md:block pointer-events-none transform-gpu" />
        <div className="absolute top-[41%] left-[8.5%] border border-panda-gold/15 px-1.5 py-2.5 text-[9px] text-panda-gold/40 font-mono font-bold tracking-widest hidden md:block pointer-events-none select-none">
          極
        </div>

        {/* Designer crop corner marks (L-shapes) */}
        <div className="absolute top-12 left-12 w-8 h-8 border-t border-l border-white/5" />
        <div className="absolute top-12 right-12 w-8 h-8 border-t border-r border-white/5" />
        <div className="absolute bottom-12 left-12 w-8 h-8 border-b border-l border-white/5" />
        <div className="absolute bottom-12 right-12 w-8 h-8 border-b border-r border-white/5" />
      </div>

      {/* Staff Shift Top Bar (only visible when authorized as staff) */}
      {/* Staff Shift Top Bar (only visible when authorized as staff) */}
      {currentRole !== 'client' && (
        <div className={`w-full border-b py-2.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs relative z-50 sticky top-0 backdrop-blur-md ${
          theme === 'light' ? 'bg-white/95 border-zinc-200 text-zinc-800 shadow-sm' : 'bg-panda-charcoal/95 border-white/10 text-white shadow-xl'
        }`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-white text-sm tracking-tight">СУШИ ПАНДА</span>
              <span className="text-white/20">|</span>
              <span className={`px-2.5 py-1 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 ${
                currentRole === 'admin' 
                  ? 'bg-red-500/15 border border-red-500/30 text-red-400 shadow-sm' 
                  : 'bg-panda-orange/15 border border-panda-orange/30 text-panda-orange'
              }`}>
                {currentRole === 'chef' && <ChefHat className="h-3.5 w-3.5" />}
                {currentRole === 'courier' && <Truck className="h-3.5 w-3.5" />}
                {currentRole === 'owner' && <Award className="h-3.5 w-3.5" />}
                {currentRole === 'admin' && <ShieldCheck className="h-3.5 w-3.5 text-red-400" />}
                <span>
                  {currentRole === 'chef' ? 'Терминал кухни (Шеф)' : currentRole === 'courier' ? 'Курьерская доставка' : currentRole === 'owner' ? 'Кабинет управления' : 'Администратор'}
                </span>
              </span>
            </div>

            {/* ONLY ADMIN: Master Screen Switcher */}
            {currentRole === 'admin' && (
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto max-w-full shadow-inner">
                <button
                  type="button"
                  onClick={() => setAdminViewMode('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminViewMode === 'admin'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Панель системного администратора"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Админ-панель</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminViewMode('owner')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminViewMode === 'owner'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Кабинет управляющего (выручка, аналитика, склад)"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Управляющий</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminViewMode('chef')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminViewMode === 'chef'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="KDS-терминал кухни (повара)"
                >
                  <ChefHat className="h-3.5 w-3.5" />
                  <span>Кухня (KDS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminViewMode('courier')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminViewMode === 'courier'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Планшет курьера (доставки)"
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Курьер</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminViewMode('storefront')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminViewMode === 'storefront'
                      ? 'bg-panda-orange text-white shadow-md shadow-panda-orange/30 scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Клиентская витрина сайта (меню, корзина)"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Витрина сайта</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Non-admin owner toggle */}
            {currentRole === 'owner' && (
              <button
                onClick={() => setStaffViewMode(prev => prev === 'dashboard' ? 'storefront' : 'dashboard')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-white/10"
              >
                {staffViewMode === 'dashboard' ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-panda-gold" />
                    <span>Витрина сайта</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="h-3.5 w-3.5 text-panda-orange" />
                    <span className="text-panda-orange font-extrabold">В кабинет</span>
                  </>
                )}
              </button>
            )}

            <span className="text-white/60 font-semibold hidden md:inline">{currentUser?.name}</span>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Завершить смену</span>
            </button>
          </div>
        </div>
      )}

      {currentRole === 'admin' && adminViewMode === 'chef' ? (
        /* CHEF VIEWPORT WRAPPER (ADMIN EMULATION) */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <ChefDashboard 
            onStatusUpdate={handleUpdateOrderStatus} 
            products={products} 
            onUpdateProduct={handleUpdateProduct}
            kitchenStatus={kitchenStatus}
            onUpdateKitchenStatus={handleUpdateKitchenStatus}
          />
        </div>
      ) : currentRole === 'admin' && adminViewMode === 'courier' ? (
        /* COURIER VIEWPORT WRAPPER (ADMIN EMULATION) */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <CourierDashboard onStatusUpdate={handleUpdateOrderStatus} />
        </div>
      ) : currentRole === 'admin' && adminViewMode === 'owner' ? (
        /* OWNER VIEWPORT WRAPPER (ADMIN EMULATION) */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <DashboardErrorBoundary>
            <OwnerDashboard 
              products={products} 
              onUpdateProduct={handleUpdateProduct}
              kitchenStatus={kitchenStatus}
              onUpdateKitchenStatus={handleUpdateKitchenStatus}
            />
          </DashboardErrorBoundary>
        </div>
      ) : currentRole === 'admin' && adminViewMode === 'admin' ? (
        /* ADMIN VIEWPORT WRAPPER */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <DashboardErrorBoundary>
            <AdminDashboard 
              products={products} 
              onUpdateProduct={handleUpdateProduct}
              kitchenStatus={kitchenStatus}
              onUpdateKitchenStatus={handleUpdateKitchenStatus}
              onSwitchView={setAdminViewMode}
            />
          </DashboardErrorBoundary>
        </div>
      ) : currentRole === 'chef' ? (
        /* CHEF VIEWPORT WRAPPER */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <ChefDashboard 
            onStatusUpdate={handleUpdateOrderStatus} 
            products={products} 
            onUpdateProduct={handleUpdateProduct}
            kitchenStatus={kitchenStatus}
            onUpdateKitchenStatus={handleUpdateKitchenStatus}
          />
        </div>
      ) : currentRole === 'courier' ? (
        /* COURIER VIEWPORT WRAPPER */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <CourierDashboard onStatusUpdate={handleUpdateOrderStatus} />
        </div>
      ) : (currentRole === 'owner' && staffViewMode === 'dashboard') ? (
        /* OWNER VIEWPORT WRAPPER */
        <div className="relative z-10 min-h-[80vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <DashboardErrorBoundary>
            <OwnerDashboard 
              products={products} 
              onUpdateProduct={handleUpdateProduct}
              kitchenStatus={kitchenStatus}
              onUpdateKitchenStatus={handleUpdateKitchenStatus}
            />
          </DashboardErrorBoundary>
        </div>
      ) : (
        /* CLIENT VIEWPORT */
        <>
          {/* 1. Sticky Navigation */}
          <Header
            cart={cart}
            onOpenCart={() => {
              setIsCartOpen(true);
              playFurinChime();
            }}
            currentUser={currentUser}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLogout={handleLogout}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            theme={theme}
            isModalOpen={isAnyAppModalOpen}
            kitchenStatus={kitchenStatus}
            isConnected={isConnected}
            onOpenAbout={() => setIsAboutOpen(true)}
          />
          {/* 2. Welcome Banner area */}
          <Hero theme={theme} />

            {/* 3. Real-time active tracking sticky banner (Float at bottom right) */}
            <AnimatePresence>
              {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && !isProfileOpen && (
                <motion.button
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  onClick={() => setIsProfileOpen(true)}
                  className="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-panda-orange to-panda-orange-hover px-5 h-14 text-white font-extrabold text-xs shadow-xl orange-glow-strong hover:scale-[1.03] active:scale-95 cursor-pointer transition-all border border-white/10"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span>ОТСЛЕДИТЬ ЗАКАЗ #{activeOrder.id} ({
                    activeOrder.status === 'pending' ? 'Принят' :
                    activeOrder.status === 'confirmed' ? 'Подтвержден' :
                    activeOrder.status === 'cooking' ? 'Готовится' :
                    activeOrder.status === 'delivering' ? 'В пути' : 'Готов'
                  })</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* 3.5 Menu Catalog */}
            <MenuSection
              products={products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              theme={theme}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            />

            {/* 4. High-Conversion Sales Zone: Party Banquet Recommender & Chef Panda's Advice */}
            <InteractiveZone 
              products={products}
              onAddToCart={handleAddToCart}
              onAddBundleToCart={handleAddBundleToCart}
              theme={theme}
            />

            {/* 5. Special promotional banner highlights */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-white/5 bg-panda-charcoal/40 p-6 flex items-start gap-4 hover:border-white/10 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panda-orange/10 text-panda-orange shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">45 минут или ролл в подарок</h4>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">Быстро везем горячие суши и хрустящую пиццу по всему городу.</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-panda-charcoal/40 p-6 flex items-start gap-4 hover:border-white/10 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panda-orange/10 text-panda-orange shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">Гарантия свежести рыбы</h4>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">Только охлажденный мурманский лосось, никаких заморозок.</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-panda-charcoal/40 p-6 flex items-start gap-4 hover:border-white/10 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panda-orange/10 text-panda-orange shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">Подарки при самовывозе</h4>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">Заберите сами из любого филиала и получите скидку 10% в чеке.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5.5 Visual Presentation Gallery (Atmosphere & Food photos) */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 relative z-10">
              <div className="border-b border-white/5 pb-6 mb-8 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-panda-orange">Галерея Вкусов & Презентация</span>
                <h2 className="font-display text-3xl sm:text-4xl font-normal italic tracking-tight text-white mt-1">
                  Атмосфера Суши Панда
                </h2>
                <p className="text-sm text-white/40 mt-1 max-w-xl">
                  Каждый ролл — это шедевр, приготовленный профессиональными сушистами и доставленный к вашему столу в идеальном состоянии.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
                    title: 'Свежайшие Ингредиенты',
                    desc: 'Охлажденный лосось из Мурманска, авокадо сорта Хасс и соусы по секретным рецептам шефа.'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=80',
                    title: 'Секреты Мастерства',
                    desc: 'Каждый ролл крутится исключительно вручную из-под ножа, сохраняя идеальную форму и вкус.'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=600&auto=format&fit=crop&q=80',
                    title: 'Фирменная Подача',
                    desc: 'Экологичная и стильная упаковка премиум-класса, сохраняющая тепло и свежесть блюд.'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=80',
                    title: 'Мгновенная Доставка',
                    desc: 'Собственные курьеры на скутерах в термосумках доставят ваш заказ горячим за 45 минут.'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -6 }}
                    className="rounded-3xl border border-white/5 bg-panda-charcoal/30 overflow-hidden shadow-lg hover:border-white/10 transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <ProductImage
                        src={item.url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        placeholderEmoji={idx === 0 ? '🍱' : idx === 1 ? '📦' : '🛵'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-panda-dark/95 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] text-panda-orange font-bold uppercase tracking-widest">Презентация</span>
                        <h4 className="font-display text-base font-bold text-white mt-0.5">{item.title}</h4>
                      </div>
                    </div>
                    <div className="p-5 bg-panda-charcoal/20">
                      <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 6. Social reviews testimonials */}
          <ReviewSection theme={theme} />
        </>
      )}

      {/* 7. Footer contacts */}
      <Footer theme={theme} onOpenStaffAuth={() => setIsStaffModalOpen(true)} onOpenAbout={() => setIsAboutOpen(true)} />

      {/* --- SIDE DRAWER: SHOPPING CART --- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={handleOpenCheckout}
        kitchenStatus={kitchenStatus}
        products={products}
        theme={theme}
      />

      {/* --- OVERLAY MODAL: CHECKOUT PORTAL --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            orderType={checkoutType}
            appliedPromo={checkoutPromo}
            discountAmount={checkoutDiscount}
            onOrderSuccess={handleOrderSuccess}
            userPhone={currentUser?.phone || ''}
            userName={currentUser?.name || ''}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {/* --- OVERLAY MODAL: USER ACCOUNT PROFILE (TRACKER + HISTORY) --- */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-3xl border border-white/10 bg-panda-dark shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Profile Modal Close */}
              <div className="px-6 py-4 border-b border-white/5 bg-panda-charcoal flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-panda-orange" />
                  <span className="font-display font-black text-sm text-white">Личный кабинет</span>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-white/5 text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Profile Main Body Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <UserProfile
                  currentUser={currentUser}
                  onLoginSuccess={handleLoginSuccess}
                  onLogout={handleLogout}
                  activeOrder={activeOrder}
                  onUpdateActiveOrder={(order) => {
                    setActiveOrder(order);
                    // Also trigger state sync inside client if order finished/cancelled
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    
      {/* About and Legal Info Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        theme={theme}
      />

      {/* Staff Secret Authentication Modal */}
      <StaffAuthModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          if (window.location.hash === '#staff') {
            try { window.history.replaceState(null, '', window.location.pathname); } catch (e) {}
          }
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsStaffModalOpen(false);
        }}
        theme={theme}
      />
</div>
  );
}
