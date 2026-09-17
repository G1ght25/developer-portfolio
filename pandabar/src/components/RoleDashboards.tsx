import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Truck, Clock, MapPin, Phone, CheckCircle, Play, Sparkles, 
  RefreshCw, ClipboardList, Package, User, Check, ArrowRight, ShieldCheck, ShoppingBag,
  Search, AlertTriangle, Ban, CheckCircle2, Printer, Undo2, RotateCcw, X, Info, Edit3
} from 'lucide-react';
import { Order, OrderStatus, Product, KitchenStatus } from '../types';
import { Receipt1C } from './Receipt1C';
import { PosOrderModal } from './PosOrderModal';
import { EditOrderModal } from './EditOrderModal';
import { unlockAudio, playNewOrderAlarm } from '../utils/audio';
import { getAuthHeaders } from '../utils/auth';

interface ChefDashboardProps {
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  products?: Product[];
  onUpdateProduct?: (productId: string, price?: number, inStock?: boolean) => void;
  kitchenStatus?: KitchenStatus;
  onUpdateKitchenStatus?: (isOpen: boolean, reason?: string, minutes?: number) => void;
}

export function ChefDashboard({ 
  onStatusUpdate, 
  products = [], 
  onUpdateProduct,
  kitchenStatus,
  onUpdateKitchenStatus
}: ChefDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'cooking' | 'ready'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  
  // Kitchen main view mode: 'queue' or 'stoplist'
  const [mainMode, setMainMode] = useState<'queue' | 'stoplist'>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  // Safeguard & Double-click prevention state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [confirmOrderToFinish, setConfirmOrderToFinish] = useState<Order | null>(null);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [zReportData, setZReportData] = useState<any | null>(null);
  const [zReportLoading, setZReportLoading] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('Высокая нагрузка кухни (30 мин)');
  const [pauseMinutesInput, setPauseMinutesInput] = useState<number>(30);
  const [printedOrderIds, setPrintedOrderIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('pandabar_printed_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [undoToast, setUndoToast] = useState<{ orderId: string; orderNumber: string } | null>(null);

  const prevOrdersCountRef = React.useRef(0);

  const markOrderPrinted = (orderId: string) => {
    setPrintedOrderIds(prev => {
      const next = new Set(prev).add(orderId);
      try {
        localStorage.setItem('pandabar_printed_orders', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.orders) {
        // Check if new orders dropped in since last check
        if (prevOrdersCountRef.current > 0 && data.orders.length > prevOrdersCountRef.current) {
          playNewOrderAlarm();
        }
        prevOrdersCountRef.current = data.orders.length;
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching chef orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreatedFromPos = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    playNewOrderAlarm();
  };

  const fetchZReport = async () => {
    setZReportLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/admin/daily-report?date=${today}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.report) {
        setZReportData(data.report);
      }
    } catch (err) {
      console.error('Error fetching kitchen daily report:', err);
    } finally {
      setZReportLoading(false);
    }
  };

  const handleOpenZReport = () => {
    setIsZReportOpen(true);
    fetchZReport();
  };

  const handlePrintZReport = () => {
    if (!zReportData) return;

    const printHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.35; color: #000; background: #fff; max-width: 720px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
              PANDABAR • ДНЕВНОЙ Z-ОТЧЕТ СМЕНЫ
            </div>
            <div style="font-size: 10.5px; color: #333; margin-top: 2px;">
              Служба доставки суши и ресторан • г. Барнаул, пр-т Калинина 116
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; font-family: monospace;">
            <div><strong>Дата смены:</strong> ${zReportData.dateFormatted}</div>
            <div><strong>Сформирован:</strong> ${new Date(zReportData.generatedAt).toLocaleTimeString('ru-RU')}</div>
          </div>
        </div>

        <!-- 1. ИТОГОВЫЕ ПОКАЗАТЕЛИ -->
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 12px; font-size: 11px;">
          <thead>
            <tr style="background: #eee; border-bottom: 1.5px solid #000;">
              <th style="border: 1px solid #000; padding: 6px 8px; text-align: center;">Общая выручка</th>
              <th style="border: 1px solid #000; padding: 6px 8px; text-align: center;">Средний чек</th>
              <th style="border: 1px solid #000; padding: 6px 8px; text-align: center;">Выполнено заказов</th>
              <th style="border: 1px solid #000; padding: 6px 8px; text-align: center;">Отменено заказов</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-family: monospace; font-size: 13px; font-weight: bold; text-align: center;">
              <td style="border: 1px solid #000; padding: 6px 8px;">${(zReportData.totalRevenue || 0).toLocaleString('ru-RU')} руб.</td>
              <td style="border: 1px solid #000; padding: 6px 8px;">${(zReportData.averageCheck || 0).toLocaleString('ru-RU')} руб.</td>
              <td style="border: 1px solid #000; padding: 6px 8px;">${zReportData.completedOrdersCount || 0} шт.</td>
              <td style="border: 1px solid #000; padding: 6px 8px;">${zReportData.cancelledOrdersCount || 0} шт.</td>
            </tr>
          </tbody>
        </table>

        <!-- 2. ОПЛАТА И КАНАЛЫ СБЫТА -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 6px;">
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                <thead>
                  <tr style="background: #f0f0f0; border-bottom: 1px solid #000;">
                    <th colspan="2" style="padding: 4px 6px; text-align: left; font-size: 10.5px; font-weight: bold;">
                      1. СПОСОБЫ ОПЛАТЫ
                    </th>
                  </tr>
                </thead>
                <tbody style="font-family: monospace;">
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 4px 6px;">Наличными:</td>
                    <td style="padding: 4px 6px; text-align: right; font-weight: bold;">${(zReportData.payments?.cash || 0).toLocaleString('ru-RU')} руб.</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 4px 6px;">Безналичными (терминал):</td>
                    <td style="padding: 4px 6px; text-align: right; font-weight: bold;">${(zReportData.payments?.card || 0).toLocaleString('ru-RU')} руб.</td>
                  </tr>
                  <tr style="background: #fafafa; font-weight: bold;">
                    <td style="padding: 5px 6px;">ИТОГО ОПЛАЧЕНО:</td>
                    <td style="padding: 5px 6px; text-align: right;">${(zReportData.totalRevenue || 0).toLocaleString('ru-RU')} руб.</td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td style="width: 50%; vertical-align: top; padding-left: 6px;">
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                <thead>
                  <tr style="background: #f0f0f0; border-bottom: 1px solid #000;">
                    <th colspan="2" style="padding: 4px 6px; text-align: left; font-size: 10.5px; font-weight: bold;">
                      2. ТИПЫ ЗАКАЗОВ
                    </th>
                  </tr>
                </thead>
                <tbody style="font-family: monospace;">
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 4px 6px;">Доставка курьером:</td>
                    <td style="padding: 4px 6px; text-align: right; font-weight: bold;">${zReportData.deliveryOrdersCount || 0} шт. (${(zReportData.deliveryRevenue || 0).toLocaleString('ru-RU')} руб.)</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 4px 6px;">Самовывоз:</td>
                    <td style="padding: 4px 6px; text-align: right; font-weight: bold;">${zReportData.pickupOrdersCount || 0} шт. (${(zReportData.pickupRevenue || 0).toLocaleString('ru-RU')} руб.)</td>
                  </tr>
                  <tr style="background: #fafafa; font-weight: bold;">
                    <td style="padding: 5px 6px;">ВСЕГО ЗАКАЗОВ:</td>
                    <td style="padding: 5px 6px; text-align: right;">${zReportData.completedOrdersCount || 0} шт.</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>

        <!-- 3. ТАБЛИЦА ПРОДАННЫХ ПОЗИЦИЙ -->
        <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px;">
          3. ПРОДАННЫЕ БЛЮДА И ПОЗИЦИИ МЕНЮ:
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10.5px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #eee; border-bottom: 1px solid #000; font-weight: bold;">
              <th style="border: 1px solid #000; padding: 4px 6px; width: 28px; text-align: center;">№</th>
              <th style="border: 1px solid #000; padding: 4px 8px; text-align: left;">Наименование позиции</th>
              <th style="border: 1px solid #000; padding: 4px 8px; width: 80px; text-align: center;">Количество</th>
              <th style="border: 1px solid #000; padding: 4px 8px; width: 100px; text-align: right;">Сумма (руб.)</th>
            </tr>
          </thead>
          <tbody>
            ${(zReportData.topProducts || []).length === 0 ? `
              <tr>
                <td colspan="4" style="border: 1px solid #000; padding: 8px; text-align: center; color: #555;">Заказов за смену не зафиксировано</td>
              </tr>
            ` : (zReportData.topProducts || []).map((p: any, idx: number) => `
              <tr style="border-bottom: 1px solid #ccc; font-family: monospace;">
                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #000; padding: 3px 8px; text-align: left; font-family: Arial, sans-serif;">${p.name}</td>
                <td style="border: 1px solid #000; padding: 3px 8px; text-align: center; font-weight: bold;">${p.quantity} шт.</td>
                <td style="border: 1px solid #000; padding: 3px 8px; text-align: right; font-weight: bold;">${(p.revenue || 0).toLocaleString('ru-RU')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- ПОДПИСИ -->
        <div style="padding-top: 10px; border-top: 1px dashed #000; display: flex; justify-content: space-between; font-size: 10px; font-family: monospace;">
          <div>Шеф-повар смены: ____________________ / ____________________</div>
          <div>Кассир / Администратор: ____________________</div>
        </div>
      </div>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="utf-8">
          <title>Z-Отчет Смены - Суши Панда (${zReportData.dateFormatted})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              background: #fff;
              color: #000;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 1.3;
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table {
              border-collapse: collapse;
            }
          </style>
        </head>
        <body>
          ${printHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }, 250);
  };


  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStock = async (product: Product) => {
    const nextStock = product.inStock === false ? true : false;
    try {
      const res = await fetch(`/api/admin/menu/${product.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ inStock: nextStock })
      });
      if (res.ok) {
        if (onUpdateProduct) onUpdateProduct(product.id, undefined, nextStock);
      }
    } catch (err) {
      console.error('Failed to toggle stock from chef dashboard:', err);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    try {
      await onStatusUpdate(orderId, 'confirmed');
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStartCooking = async (orderId: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cooking' } : o));
    try {
      await onStatusUpdate(orderId, 'cooking');
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const executeFinishCooking = async (order: Order) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(order.id);
    setConfirmOrderToFinish(null);

    const nextStatus: OrderStatus = 'ready';
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
    
    // Show undo toast notification
    setUndoToast({ orderId: order.id, orderNumber: order.id });
    setTimeout(() => {
      setUndoToast(prev => prev?.orderId === order.id ? null : prev);
    }, 8000);

    try {
      await onStatusUpdate(order.id, nextStatus);
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUndoToCooking = async (orderId: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    setUndoToast(null);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cooking' } : o));
    try {
      await onStatusUpdate(orderId, 'cooking');
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const activeKitchenOrders = orders.filter(o => ['pending', 'confirmed', 'cooking'].includes(o.status));
  const finishedShiftOrders = orders.filter(o => ['ready', 'delivering', 'completed'].includes(o.status));

  const filteredOrders = orders.filter(o => {
    if (filter === 'ready') {
      return ['ready', 'delivering', 'completed'].includes(o.status);
    }
    const isKitchenStatus = o.status === 'pending' || o.status === 'confirmed' || o.status === 'cooking';
    if (!isKitchenStatus) return false;
    
    if (filter === 'pending') return o.status === 'pending' || o.status === 'confirmed';
    if (filter === 'cooking') return o.status === 'cooking';
    return true;
  });

  const stoppedProducts = products.filter(p => p.inStock === false);
  const filteredProductsForChef = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-panda-orange/10 text-panda-orange text-xs font-bold uppercase tracking-wider mb-2">
            <ChefHat className="h-3.5 w-3.5" />
            <span>Рабочее место Шеф-Повара (KDS)</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-normal italic text-white tracking-tight">
            Терминал Кухни & Стоп-Лист
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Управление готовкой с защитой от случайных нажатий и полной историей смены.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Manual POS Fast Order Button */}
          <button
            onClick={() => setIsPosModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-panda-orange/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>+ Новый заказ (POS)</span>
          </button>

          {/* Print Daily Z-Report Button for Kitchen Shift */}
          <button
            onClick={handleOpenZReport}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            title="Сформировать и напечатать отчет за день"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>Отчет за день (Z-отчет)</span>
          </button>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-all cursor-pointer disabled:opacity-50"
            title="Обновить список"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setMainMode('queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainMode === 'queue' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <span>Заказы</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
                {activeKitchenOrders.length}
              </span>
            </button>

            <button
              onClick={() => setMainMode('stoplist')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainMode === 'stoplist' ? 'bg-red-500 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Стоп-Лист</span>
              {stoppedProducts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-extrabold animate-pulse">
                  {stoppedProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {mainMode === 'queue' ? (
        /* KITCHEN ORDERS QUEUE VIEW */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panda-charcoal p-3.5 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-white/60">Фильтр очереди:</span>
            <div className="flex flex-wrap gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                В очереди ({activeKitchenOrders.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'pending' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Новые ({orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length})
              </button>
              <button
                onClick={() => setFilter('cooking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'cooking' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Готовятся ({orders.filter(o => o.status === 'cooking').length})
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filter === 'ready' ? 'bg-emerald-600 text-white' : 'text-emerald-400/70 hover:text-emerald-300'
                }`}
                title="Недавно готовые заказы (можно вернуть в готовку или распечатать)"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Готовые / Архив ({finishedShiftOrders.length})</span>
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center flex flex-col items-center">
              <div className="text-5xl mb-4 animate-bounce">
                {filter === 'ready' ? '📦' : '🍕'}
              </div>
              <h4 className="font-display text-lg font-bold text-white">
                {filter === 'ready' ? 'В архиве смены пока нет готовых заказов' : 'Очередь кухни пуста!'}
              </h4>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                {filter === 'ready' 
                  ? 'Как только повара закончат приготовление, заказы появятся здесь для проверки и повторной печати.'
                  : 'Все заказы приготовлены. Новые заказы от гостей мгновенно появятся в этой панели.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map(order => {
                const isPrinted = printedOrderIds.has(order.id);
                const isUpdating = updatingOrderId === order.id;
                const isFinishedState = ['ready', 'delivering', 'completed'].includes(order.status);

                return (
                  <div 
                    key={order.id} 
                    className={`rounded-3xl border p-6 bg-panda-charcoal shadow-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                      isFinishedState
                        ? 'border-emerald-500/20 bg-emerald-950/[0.04]'
                        : order.status === 'cooking' 
                          ? 'border-panda-orange/40 orange-glow' 
                          : 'border-white/10'
                    }`}
                  >
                    {order.status === 'cooking' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-panda-orange to-panda-gold animate-pulse" />
                    )}
                    
                    <div>
                      {/* Order header */}
                      <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.type === 'delivery' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                            }`}>
                              {order.type === 'delivery' ? 'Доставка' : 'Самовывоз'}
                            </span>

                            {/* Prominent Preorder Badge */}
                            {order.isPreorder && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse">
                                <Clock className="h-3 w-3" />
                                <span>ПРЕДЗАКАЗ: {order.targetTime || order.estimatedTime}</span>
                              </span>
                            )}

                            {order.isPosOrder && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Касса POS
                              </span>
                            )}
                            
                            {/* Print Badge Indicator */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                              isPrinted 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}>
                              {isPrinted ? <Check className="h-3 w-3" /> : <Printer className="h-3 w-3" />}
                              <span>{isPrinted ? 'Чек 1С напечатан' : 'Чек НЕ напечатан'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5">
                            <h3 className="font-display text-lg font-black text-white">
                              Заказ #{order.id}
                            </h3>
                            <button
                              onClick={() => setEditingOrder(order)}
                              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-panda-orange text-white/80 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/10 hover:border-panda-orange"
                              title="Изменить блюда, добавить или удалить позиции из заказа"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Редактировать</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono mt-0.5">
                            <span>Создан: {new Date(order.createdAt).toLocaleTimeString()}</span>
                            {order.estimatedTime && !order.isPreorder && (
                              <span className="text-panda-gold font-bold">Срок: {order.estimatedTime}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Статус</p>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold mt-1 ${
                            isFinishedState
                              ? 'text-emerald-400'
                              : order.status === 'cooking' 
                                ? 'text-panda-orange' 
                                : 'text-panda-gold'
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${
                              order.status === 'cooking' ? 'bg-panda-orange animate-ping' : isFinishedState ? 'bg-emerald-400' : 'bg-panda-gold'
                            }`} />
                            <span>
                              {order.status === 'cooking' 
                                ? 'Готовится' 
                                : order.status === 'ready'
                                  ? 'Готов к выдаче'
                                  : order.status === 'delivering'
                                    ? 'В пути у курьера'
                                    : order.status === 'completed'
                                      ? 'Завершен'
                                      : 'Ожидает'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Customer and address */}
                      <div className="space-y-2 text-xs border-b border-white/5 pb-3.5 mb-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-white/70">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-white/40 shrink-0" />
                            <span className="font-semibold text-white">{order.userName}</span>
                            <span className="text-white/40">({order.userPhone})</span>
                          </div>

                          {/* Cutlery Summary Pill */}
                          {order.chopsticksCount !== undefined && (
                            <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg text-[10.5px] font-mono text-white/80">
                              <span>🥢 Палочки: <strong>{order.chopsticksCount || 0}</strong></span>
                            </div>
                          )}
                        </div>

                        {order.type === 'delivery' && order.address && (
                          <div className="flex items-start gap-2 text-white/50">
                            <MapPin className="h-3.5 w-3.5 text-white/40 mt-0.5 shrink-0" />
                            <span className="leading-relaxed">
                              ул. {order.address.street}, д. {order.address.house}
                              {order.address.apartment && `, кв. ${order.address.apartment}`}
                              {order.address.floor && `, этаж ${order.address.floor}`}
                              {order.address.entrance && `, подъезд ${order.address.entrance}`}
                              {order.address.intercom && `, домофон ${order.address.intercom}`}
                            </span>
                          </div>
                        )}

                        {order.changeFrom && (
                          <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                            💵 Сдача с купюры: <strong>{order.changeFrom} ₽</strong> (Сдача: {(order.changeFrom - order.total).toFixed(2)} ₽)
                          </div>
                        )}

                        {order.notes && (
                          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 font-semibold leading-relaxed">
                            💬 Примечание гостя: {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Состав заказа:</p>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-xs bg-white/[0.02] p-2 rounded-xl">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{item.product.name}</span>
                                {item.product.category === 'sets' && <span className="text-[10px] text-panda-gold">🍱 Сет</span>}
                              </div>
                              <span className="font-mono text-panda-orange font-bold px-2 py-0.5 rounded-lg bg-panda-orange/10 shrink-0">
                                {item.quantity} шт.
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons with Safeguard protection */}
                    <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                      {isFinishedState ? (
                        /* Archive / Finished Order Actions */
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUndoToCooking(order.id)}
                              disabled={isUpdating}
                              className="flex-1 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                              title="Нажмите, если заказ был отмечен готовым по ошибке"
                            >
                              <Undo2 className="h-4 w-4" />
                              <span>{isUpdating ? 'Возвращаем...' : '↩️ Вернуть в готовку'}</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                markOrderPrinted(order.id);
                                setSelectedReceipt(order);
                              }}
                              className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Printer className="h-4 w-4 text-panda-orange" />
                              <span>Печать 1С</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-white/30 text-center">
                            Заказ в архиве. Если нажали случайно — верните его в готовку.
                          </p>
                        </div>
                      ) : (
                        /* Active Queue Actions */
                        <>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmOrder(order.id)}
                              disabled={isUpdating}
                              className="w-full h-11 rounded-xl bg-panda-gold/20 border border-panda-gold/30 text-panda-gold text-xs font-bold flex items-center justify-center gap-2 hover:bg-panda-gold/30 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              <span>{isUpdating ? 'Обновление...' : 'Подтвердить заказ'}</span>
                            </button>
                          )}

                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => handleStartCooking(order.id)}
                              disabled={isUpdating}
                              className="w-full h-11 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-panda-orange/15 disabled:opacity-50"
                            >
                              <Play className="h-4 w-4" />
                              <span>{isUpdating ? 'Начинаем...' : 'Начать приготовление'}</span>
                            </button>
                          )}

                          {order.status === 'cooking' && (
                            <button
                              onClick={() => setConfirmOrderToFinish(order)}
                              disabled={isUpdating}
                              className="w-full h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-green-500/15 disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              <span>Приготовлен — Передать {order.type === 'delivery' ? 'курьеру' : 'на выдачу'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              markOrderPrinted(order.id);
                              setSelectedReceipt(order);
                            }}
                            className={`w-full h-9 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isPrinted 
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white' 
                                : 'bg-panda-orange/10 hover:bg-panda-orange/20 border-panda-orange/30 text-panda-orange font-black'
                            }`}
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>{isPrinted ? 'Повторная печать накладной (1С)' : '🖨️ Распечатать накладную (1С)'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 1C Receipt Modal */}
          {selectedReceipt && (
            <Receipt1C 
              order={selectedReceipt} 
              onClose={() => setSelectedReceipt(null)} 
            />
          )}

          {/* SAFEGUARD CONFIRMATION MODAL BEFORE COMPLETING AN ORDER */}
          {confirmOrderToFinish && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-panda-charcoal border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-lg">
                        Подтверждение передачи
                      </h3>
                      <p className="text-xs text-white/40">
                        Заказ #{confirmOrderToFinish.id} • {confirmOrderToFinish.type === 'delivery' ? 'Доставка курьером' : 'Самовывоз'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmOrderToFinish(null)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Print Warning Alert if check hasn't been printed */}
                {!printedOrderIds.has(confirmOrderToFinish.id) ? (
                  <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Внимание: Чек 1С еще НЕ распечатан!</span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      Убедитесь, что бланк заказа распечатан для повара и курьера перед передачей.
                    </p>
                    <button
                      onClick={() => {
                        markOrderPrinted(confirmOrderToFinish.id);
                        setSelectedReceipt(confirmOrderToFinish);
                      }}
                      className="w-full py-2 rounded-xl bg-panda-orange hover:bg-panda-orange-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Распечатать чек 1С прямо сейчас</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Чек 1С уже распечатан</span>
                  </div>
                )}
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 text-xs space-y-1.5">
                  <p className="text-[10px] font-bold text-white/40 uppercase">Блюда в заказе:</p>
                  <p className="text-white font-medium leading-relaxed">
                    {confirmOrderToFinish.items.map(it => `${it.product.name} (${it.quantity} шт)`).join(', ')}
                  </p>
                  <p className="text-white/50 text-[11px] pt-1 border-t border-white/5">
                    Получатель: <strong className="text-white">{confirmOrderToFinish.userName}</strong> ({confirmOrderToFinish.userPhone})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setConfirmOrderToFinish(null)}
                    className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                  
                  <button
                    onClick={() => executeFinishCooking(confirmOrderToFinish)}
                    disabled={updatingOrderId === confirmOrderToFinish.id}
                    className="h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>✓ Да, передать</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* POS Order Modal */}
          {isPosModalOpen && (
            <PosOrderModal
              isOpen={isPosModalOpen}
              onClose={() => setIsPosModalOpen(false)}
              products={products}
              onOrderCreated={handleOrderCreatedFromPos}
            />
          )}

          {/* EMERGENCY KITCHEN STOP CONFIRMATION MODAL */}
          {isStopConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-panda-charcoal border border-red-500/40 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-lg">
                        Остановка приёма заказов
                      </h3>
                      <p className="text-xs text-white/40">
                        Аварийный стоп кухни (витрина будет заблокирована)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsStopConfirmOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Причина остановки для гостей:</label>
                    <input
                      type="text"
                      value={pauseReasonInput}
                      onChange={e => setPauseReasonInput(e.target.value)}
                      placeholder="Высокая нагрузка кухни / Тех. перерыв..."
                      className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Длительность паузы (минут):</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 30, 60, 120].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPauseMinutesInput(mins)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            pauseMinutesInput === mins ? 'bg-red-500 text-white border-red-600' : 'bg-white/5 border-white/5 text-white/60'
                          }`}
                        >
                          {mins} мин
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                    ⚠️ <strong>Внимание:</strong> После подтверждения клиенты на сайте увидят баннер о паузе и не смогут оформлять новые заказы.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setIsStopConfirmOpen(false)}
                    className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdateKitchenStatus) {
                        onUpdateKitchenStatus(false, pauseReasonInput, pauseMinutesInput);
                      }
                      setIsStopConfirmOpen(false);
                    }}
                    className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Ban className="h-4 w-4" />
                    <span>🛑 Закрыть приём заказов</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FLOATING UNDO TOAST IF WORKER CLICKED BY ACCIDENT */}
          {undoToast && (
            <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-panda-charcoal border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Заказ #{undoToast.orderNumber} передан!</p>
                  <p className="text-[10px] text-white/50">Нажали случайно?</p>
                </div>
              </div>
              <button
                onClick={() => handleUndoToCooking(undoToast.orderId)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>Вернуть</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* KITCHEN STOP-LIST VIEW FOR CHEF */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panda-charcoal p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Поиск блюда для остановки продажи..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-panda-orange"
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">Остановлено позиций:</span>
              <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 font-mono font-bold text-red-400">
                {stoppedProducts.length} шт.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductsForChef.map(product => {
              const isAvailable = product.inStock !== false;

              return (
                <div 
                  key={product.id}
                  className={`rounded-2xl border p-4 bg-panda-charcoal transition-all flex items-center justify-between gap-4 ${
                    isAvailable ? 'border-white/10' : 'border-red-500/40 bg-red-500/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{product.name}</h4>
                      <p className="text-[10px] text-white/40">{product.weight} г. • {product.price} ₽</p>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold mt-1 ${
                        isAvailable ? 'text-emerald-400' : 'text-red-400 font-black'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400 animate-ping'}`} />
                        <span>{isAvailable ? 'В меню (Доступно)' : 'В СТОП-ЛИСТЕ'}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStock(product)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border shrink-0 flex items-center gap-1 ${
                      isAvailable
                        ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/30'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        <span>В стоп-лист</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Вернуть в меню</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL DAILY Z-REPORT PRINTABLE MODAL FOR KITCHEN */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Дневной Z-Отчет Смены</h3>
                  <p className="text-xs text-white/50">Финансовая сводка, безналичный/наличный расчет, самовывоз и доставка</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintZReport}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Печать отчета (А4 Ч/Б)</span>
                </button>

                <button
                  onClick={() => setIsZReportOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {zReportLoading ? (
              <div className="py-20 text-center text-white/50 space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-panda-orange" />
                <p className="text-xs">Формирование отчета за смену...</p>
              </div>
            ) : zReportData ? (
              <div className="print-document-container bg-white text-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 space-y-6 select-text">
                {/* Header */}
                <div className="border-b-2 border-zinc-900 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
                      PANDABAR • ОТЧЕТ КУХНИ ЗА СМЕНУ
                    </h2>
                    <p className="text-xs font-bold text-zinc-600">Служба доставки суши и ресторан • г. Барнаул</p>
                  </div>
                  <div className="text-right text-xs font-mono text-zinc-700">
                    <p><strong>Дата:</strong> {zReportData.dateFormatted}</p>
                    <p className="text-[10px] text-zinc-500">Сформирован: {new Date(zReportData.generatedAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Key KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Общая выручка</p>
                    <p className="text-lg font-black font-mono text-zinc-950 mt-1">
                      {zReportData.totalRevenue?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Средний чек</p>
                    <p className="text-lg font-black font-mono text-zinc-950 mt-1">
                      {zReportData.averageCheck?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Выполнено</p>
                    <p className="text-lg font-black font-mono text-emerald-700 mt-1">
                      {zReportData.completedOrdersCount} шт
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Отменено</p>
                    <p className="text-lg font-black font-mono text-red-600 mt-1">
                      {zReportData.cancelledOrdersCount} шт
                    </p>
                  </div>
                </div>

                {/* Payment & Order Types Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-300 space-y-2 text-xs font-mono">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 border-b border-zinc-200 pb-1.5">
                      1. Способы оплаты
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-zinc-600">Наличными при получении:</span>
                      <strong className="text-zinc-950">{(zReportData.payments?.cash || 0).toLocaleString('ru-RU')} ₽</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-600">Безналичными (терминал курьера):</span>
                      <strong className="text-zinc-950">{(zReportData.payments?.card || 0).toLocaleString('ru-RU')} ₽</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-300 space-y-2 text-xs font-mono">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 border-b border-zinc-200 pb-1.5">
                      2. Типы заказов
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-zinc-600">Доставка курьером:</span>
                      <strong className="text-zinc-950">{zReportData.deliveryOrdersCount || 0} шт ({(zReportData.deliveryRevenue || 0).toLocaleString('ru-RU')} ₽)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-600">Самовывоз из бара:</span>
                      <strong className="text-zinc-950">{zReportData.pickupOrdersCount || 0} шт ({(zReportData.pickupRevenue || 0).toLocaleString('ru-RU')} ₽)</strong>
                    </div>
                  </div>

                </div>

                {/* Sold Dishes Table */}
                {zReportData.topSoldProducts && zReportData.topSoldProducts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900">
                      3. Проданные блюда и количество порций
                    </h4>
                    <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-100 border-b border-zinc-900 font-bold">
                          <tr>
                            <th className="p-2 border-r border-zinc-200">#</th>
                            <th className="p-2 border-r border-zinc-200">Наименование блюда</th>
                            <th className="p-2 text-center border-r border-zinc-200">Кол-во</th>
                            <th className="p-2 text-right">Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zReportData.topSoldProducts.map((p: any, idx: number) => (
                            <tr key={idx} className="border-b border-zinc-200 font-mono">
                              <td className="p-2 border-r border-zinc-200 text-zinc-500">{idx + 1}</td>
                              <td className="p-2 border-r border-zinc-200 font-sans font-medium text-zinc-950">{p.name}</td>
                              <td className="p-2 text-center border-r border-zinc-200 font-bold">{p.quantity} шт</td>
                              <td className="p-2 text-right font-bold text-zinc-950">{p.revenue?.toLocaleString('ru-RU')} ₽</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Signatures */}
                <div className="pt-4 border-t border-zinc-300 flex justify-between text-[11px] text-zinc-600 font-mono">
                  <p>Ответственный повар кухни: _______________ / _______________</p>
                  <p>Администратор смены: _______________</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-white/50">
                <p className="text-xs">Нет данных о заказах за текущую смену.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL FOR KITCHEN CHEF */}
      <EditOrderModal
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        products={products}
        onOrderUpdated={(updatedOrder) => {
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          setEditingOrder(null);
        }}
      />
    </div>
  );
}

export function CourierDashboard({ onStatusUpdate }: { onStatusUpdate: (id: string, status: any) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ready' | 'delivering'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching courier orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartDelivery = async (orderId: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivering' } : o));
    try {
      await onStatusUpdate(orderId, 'delivering');
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    try {
      await onStatusUpdate(orderId, 'completed');
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const deliveryOrders = orders.filter(o => {
    // Only delivery type orders that are ready, cooking, or in route
    if (o.type !== 'delivery') return false;
    return o.status === 'cooking' || o.status === 'delivering' || o.status === 'ready';
  });

  const filteredOrders = deliveryOrders.filter(o => {
    if (filter === 'ready') return o.status === 'cooking' || o.status === 'ready'; // ready or preparing
    if (filter === 'delivering') return o.status === 'delivering';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-panda-orange/10 text-panda-orange text-xs font-bold uppercase tracking-wider mb-2">
            <Truck className="h-3.5 w-3.5" />
            <span>Кабинет Быстрого Курьера</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-normal italic text-white tracking-tight">
            Доставка и Маршруты
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Курьеры забирают приготовленные заказы и мчатся по городу. Маршруты обновляются на встроенной карте!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-all cursor-pointer disabled:opacity-50"
            title="Обновить список"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Все ({deliveryOrders.length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'ready' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Ожидают ({deliveryOrders.filter(o => o.status !== 'delivering').length})
            </button>
            <button
              onClick={() => setFilter('delivering')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'delivering' ? 'bg-panda-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              В пути ({deliveryOrders.filter(o => o.status === 'delivering').length})
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center flex flex-col items-center">
          <div className="text-5xl mb-4 animate-bounce">🛵</div>
          <h4 className="font-display text-lg font-bold text-white">Все заказы доставлены!</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm">
            Нет активных доставок. Клиенты наслаждаются горячими суши от Суши Панда Ждем новые заказы!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Active Orders List */}
          <div className="xl:col-span-2 space-y-6">
            {filteredOrders.map(order => (
              <div 
                key={order.id}
                className={`rounded-3xl border p-6 bg-panda-charcoal shadow-xl transition-all relative overflow-hidden ${
                  order.status === 'delivering' ? 'border-panda-orange/40 orange-glow' : 'border-white/10'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Left part: order info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-black text-white">Заказ #{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'delivering' ? 'bg-panda-orange/15 text-panda-orange' : 'bg-panda-gold/15 text-panda-gold'
                      }`}>
                        {order.status === 'delivering' ? '🚗 Доставляется' : '⏳ Ждет курьера'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-panda-orange shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white leading-relaxed">
                            Адрес доставки:
                          </p>
                          <p className="text-white/60 mt-0.5 leading-relaxed">
                            ул. {order.address?.street}, д. {order.address?.house}
                            {order.address?.apartment && `, кв. ${order.address?.apartment}`}
                            {order.address?.entrance && `, под. ${order.address?.entrance}`}
                            {order.address?.floor && `, этаж ${order.address?.floor}`}
                            {order.address?.intercom && `, домофон ${order.address?.intercom}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <User className="h-4 w-4 text-white/30 shrink-0" />
                        <span className="font-medium text-white">{order.userName}</span>
                        <span className="text-white/40">|</span>
                        <span className="font-mono text-white/50">{order.userPhone}</span>
                      </div>

                      {order.notes && (
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-panda-gold italic">
                          Заметка: {order.notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-white/40">Сумма заказа к оплате:</span>
                      <span className="font-mono font-bold text-panda-orange text-sm">{order.total} ₽ ({order.paymentMethod === 'online_mock' ? 'Оплачен онлайн' : 'Оплата при получении'})</span>
                    </div>
                  </div>

                  {/* Right part: action and mock route mini map */}
                  <div className="md:w-64 flex flex-col justify-between shrink-0 bg-white/5 p-4 rounded-2xl border border-white/5">
                    
                    {/* Mock simple high-fidelity micro-map */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-panda-dark/50 border border-white/10 mb-4 flex items-center justify-center">
                      {/* Decorative grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
                      
                      {/* Path lines */}
                      <svg className="absolute inset-0 w-full h-full text-white/10" pointerEvents="none">
                        <path d="M 10 90 Q 80 40 180 30 T 240 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M 10 90 Q 80 40 180 30 T 240 100" fill="none" stroke="#E03E3E" strokeWidth="2.5" className={order.status === 'delivering' ? 'animate-[dash_5s_linear_infinite]' : ''} style={{ strokeDasharray: '6 6' }} />
                      </svg>
                      
                      {/* Delivery pins */}
                      <div className="absolute bottom-4 left-4 h-6 w-6 rounded-full bg-panda-dark flex items-center justify-center border border-white/10">
                        <ChefHat className="h-3 w-3 text-panda-gold" />
                      </div>
                      
                      <div className="absolute top-4 right-8 h-6 w-6 rounded-full bg-panda-orange flex items-center justify-center border border-white/10 shadow-lg shadow-panda-orange/35 animate-bounce">
                        <MapPin className="h-3 w-3 text-black" />
                      </div>

                      <div className="absolute inset-x-0 bottom-1.5 text-center text-[9px] text-white/40 font-mono">
                        {order.status === 'delivering' ? 'Курьер движется по адресу' : 'Маршрут построен'}
                      </div>
                    </div>

                    {order.status !== 'delivering' ? (
                      <button
                        onClick={() => handleStartDelivery(order.id)}
                        disabled={updatingOrderId === order.id}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Truck className="h-4 w-4" />
                        <span>{updatingOrderId === order.id ? 'Берем заказ...' : 'Взять доставку'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteDelivery(order.id)}
                        disabled={updatingOrderId === order.id}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-green-500/10 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>{updatingOrderId === order.id ? 'Сохраняем...' : 'Доставлен клиенту'}</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Interactive summary panel for courier */}
          <div className="rounded-3xl border border-white/10 bg-panda-charcoal/40 p-6 space-y-4">
            <h4 className="font-display text-base font-bold text-white flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-panda-orange" />
              <span>Сводка Курьера</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">Ожидают</p>
                <p className="text-xl font-mono font-bold text-panda-gold mt-1">
                  {deliveryOrders.filter(o => o.status !== 'delivering').length}
                </p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">В пути</p>
                <p className="text-xl font-mono font-bold text-panda-orange mt-1">
                  {deliveryOrders.filter(o => o.status === 'delivering').length}
                </p>
              </div>
            </div>

            <div className="bg-panda-orange/5 p-4 rounded-2xl border border-panda-orange/10 text-xs text-panda-gold/90 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Правило 45 минут:</span>
              </p>
              <p className="text-[11px] text-white/60">
                Доставляйте вовремя, чтобы клиент остался счастлив. Если курьер опаздывает, клиент получает подарочный промокод!
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
