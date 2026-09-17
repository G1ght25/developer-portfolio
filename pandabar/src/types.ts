/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IngredientPortion {
  id: string;
  name: string;
  amount: number; // in unit (e.g. grams, ml, or pcs)
  unit: 'г' | 'мл' | 'шт';
  costEstimate?: number; // estimated cost in rubles
}

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredientsSummary?: string; // e.g., "Рис (140г), Лосось (70г), Сыр Cremette (60г), Нори (1шт)"
  ingredients?: IngredientPortion[];
  price: number;
  oldPrice?: number | null;
  weight: number; // in grams
  pieces?: number | null; // e.g., 8 rolls
  image: string;
  category: string;
  tags?: string[] | null; // e.g., ["New", "Spicy", "Popular", "Vegetarian"]
  spicy?: boolean;
  vegetarian?: boolean;
  inStock?: boolean; // false = in stop-list
}

export type WorkerRole = 'chef' | 'courier' | 'manager' | 'admin' | 'owner' | 'client';

export interface WorkerAccount {
  id: string;
  name: string;
  phone: string;
  role: WorkerRole;
  pinCode: string;
  active: boolean;
  status?: 'active' | 'blocked';
  createdAt: number;
}

export interface WarehouseIngredient {
  id: string;
  name: string;
  category: 'fish' | 'dairy' | 'groceries' | 'vegetables' | 'sauces' | 'bakery' | 'packaging' | string;
  categoryLabel?: string;
  stock: number; // current stock quantity
  currentStock?: number; // compatibility alias
  unit: string; // e.g. 'кг', 'г', 'л', 'мл', 'шт', 'уп', 'порц' or custom metric
  minThreshold: number; // threshold when it becomes warning/critical
  costPerUnit: number; // cost per standard unit (e.g. rub/kg or rub/pc)
  usedToday?: number; // amount used today
  usedPeriod?: number; // amount used in selected analytics period
  supplier?: string;
  lastRestocked?: number;
}

export interface OperationalExpenses {
  rentMonthly: number; // Аренда в месяц
  salariesMonthly: number; // ФОТ (зарплаты) в месяц
  marketingMonthly: number; // Маркетинг и реклама в месяц
  utilitiesMonthly: number; // Коммунальные услуги и связь в месяц
  otherMonthly: number; // Прочие расходы в месяц
  rentPerMonth?: number;
  salariesPerMonth?: number;
  utilitiesPerMonth?: number;
  marketingPerMonth?: number;
  packagingPerOrder?: number;
  acquiringFeePercent?: number;
  deliveryCostPerOrder?: number;
  updatedAt?: number;
}

export interface AnalyticsChartPoint {
  label: string;
  revenue: number;
  foodCost: number;
  opex: number;
  netProfit: number;
  orders: number;
}

export interface AnalyticsSummary {
  period: 'day' | '2days' | 'week' | 'month';
  periodLabel: string;
  totalRevenue: number;
  foodCost: number;
  grossProfit: number;
  grossMargin: number; // in %
  opex: number; // Operational expenses allocated for period
  netProfit: number; // grossProfit - opex
  netMargin: number; // in %
  totalOrders: number;
  averageCheck: number;
  completedOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  deliveryOrders: number;
  pickupOrders: number;
  paymentMethods: { method: string; label: string; count: number; sum: number }[];
  chartData: AnalyticsChartPoint[];
  topProducts: { 
    id: string; 
    name: string; 
    category: string; 
    count: number; 
    revenue: number; 
    cost: number; 
    profit: number; 
    margin: number;
  }[];
  categoryRevenue: { category: string; label: string; revenue: number; percentage: number }[];
  topIngredientsUsed: { 
    id: string; 
    name: string; 
    amount: number; 
    unit: string; 
    cost: number;
  }[];
  expenses: OperationalExpenses;
  opexDetails?: OperationalExpenses;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: 'client' | 'chef' | 'courier' | 'owner' | 'admin';
  token?: string;
  address?: {
    street: string;
    house: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    intercom?: string;
  };
  createdAt: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cooking' | 'delivering' | 'ready' | 'completed' | 'cancelled';

export interface StatusTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: number;
}

export interface KitchenStatus {
  isOpen: boolean;
  pauseReason: string;
  pauseUntil: number | null;
  updatedAt: number;
}

export interface CutleryKits {
  personsCount?: number;
  chopsticks?: number;
  chopsticksCount?: number;
  trainingChopsticks?: number;
  trainingChopsticksCount?: number;
  soySauce?: number;
  soySauceCount?: number;
  wasabi?: number;
  wasabiCount?: number;
  ginger?: number;
  gingerCount?: number;
}

export type OrderType = 'delivery' | 'pickup' | 'dine_in';
export type PaymentMethod = 'cash' | 'card_courier' | 'online_mock' | 'card_terminal' | 'transfer' | 'paid_pos';

export interface Order<TType = OrderType> {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: TType extends 'dine_in' ? ('delivery' | 'pickup' | ('dine_in' & any)) : TType;
  address?: {
    street: string;
    house: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    intercom?: string;
  };
  pickupLocation?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  discount?: number;
  status: OrderStatus;
  statusTimeline: StatusTimelineEvent[];
  createdAt: number;
  estimatedTime: string; // e.g., "14:30" or "45 мин."
  timingType?: 'asap' | 'scheduled';
  targetTime?: string;
  targetTimestamp?: number;
  isPreorder?: boolean;
  personsCount?: number;
  chopsticksCount?: number;
  trainingChopsticksCount?: number;
  cutleryKits?: CutleryKits;
  changeFrom?: number;
  isPosOrder?: boolean;
  notes?: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountPercent?: number;
  minOrderAmount: number;
  description: string;
}

export interface DailyZReport {
  date: string;
  dateFormatted: string;
  totalRevenue: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  totalOrdersCount: number;
  averageCheck: number;
  deliveryOrdersCount: number;
  pickupOrdersCount: number;
  dineInOrdersCount: number;
  deliveryRevenue: number;
  pickupRevenue: number;
  dineInRevenue: number;
  payments: {
    cash: number;
    card: number;
    online: number;
  };
  topProducts: {
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }[];
  packagingUsage: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  generatedAt: number;
}

declare module 'lucide-react' {
  export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role?: 'client' | 'chef' | 'courier' | 'owner' | 'admin';
    token?: string;
    address?: {
      street: string;
      house: string;
      apartment?: string;
      entrance?: string;
      floor?: string;
      intercom?: string;
    };
    createdAt: number;
  }
}

