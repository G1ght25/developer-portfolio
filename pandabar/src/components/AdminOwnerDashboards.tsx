/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Award, 
  BarChart3, RefreshCw, Plus, Trash2, CheckCircle2, XCircle, Edit3, 
  ChefHat, Truck, UserCheck, Lock, Search, SlidersHorizontal, ArrowUpRight,
  AlertTriangle, Layers, PieChart, Calendar, ArrowDownRight,
  Warehouse, Save, Sliders, Check, Printer, Terminal, Copy, Ban, X,
  Key, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import { 
  AnalyticsSummary, Product, WorkerAccount, WorkerRole, Order, 
  WarehouseIngredient, OperationalExpenses, AnalyticsChartPoint, KitchenStatus 
} from '../types';
import { Receipt1C } from './Receipt1C';
import { formatPhone } from '../utils/phoneFormatter';
import { getAuthHeaders } from '../utils/auth';

interface OwnerDashboardProps {
  products: Product[];
  onUpdateProduct?: (productId: string, price?: number, inStock?: boolean) => void;
  kitchenStatus?: KitchenStatus;
  onUpdateKitchenStatus?: (isOpen: boolean, reason?: string, minutes?: number) => void;
}

export interface AdminDashboardProps extends OwnerDashboardProps {
  onSwitchView?: (view: 'admin' | 'owner' | 'chef' | 'courier' | 'storefront') => void;
}

export class DashboardErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Dashboard error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-panda-charcoal border border-red-500/30 text-white space-y-4 max-w-xl mx-auto my-10 shadow-2xl">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <h3 className="font-display font-bold text-lg">Ошибка загрузки панели</h3>
          </div>
          <p className="text-xs text-white/60">
            {this.state.error?.message || "Произошла непредвиденная ошибка при отрисовке панели."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-panda-orange text-white text-xs font-bold cursor-pointer hover:bg-panda-orange-hover transition-all"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function OwnerDashboard({ 
  products, 
  onUpdateProduct,
  kitchenStatus,
  onUpdateKitchenStatus
}: OwnerDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | '2days' | 'week' | 'month'>('month');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [inventory, setInventory] = useState<WarehouseIngredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'zreport' | 'inventory' | 'stoplist' | 'orders' | 'print'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

  // Daily Z-Report State
  const [zReportData, setZReportData] = useState<any | null>(null);
  const [zReportLoading, setZReportLoading] = useState(false);
  const [selectedZReportDate, setSelectedZReportDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Kitchen Emergency Stop Dialog State for Owner
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('Высокая нагрузка кухни / Технический перерыв');
  const [pauseMinutesInput, setPauseMinutesInput] = useState<number>(30);

  // 1C Printing & Print Agent State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [printAgentStatus, setPrintAgentStatus] = useState<{
    online: boolean;
    lastSeen: number;
    hostname: string;
    token: string;
    printedCount: number;
  } | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  // OPEX Modal / Edit State
  const [isOpexModalOpen, setIsOpexModalOpen] = useState(false);
  const [opexForm, setOpexForm] = useState<OperationalExpenses>({
    rentMonthly: 120000,
    salariesMonthly: 140000,
    marketingMonthly: 30000,
    utilitiesMonthly: 20000,
    otherMonthly: 10000,
    updatedAt: Date.now()
  });
  const [opexSavedNotification, setOpexSavedNotification] = useState(false);

  // Price editing state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');

  // Restock Action State
  const [restockSuccessId, setRestockSuccessId] = useState<string | null>(null);

  // Warehouse CRUD & Custom Metric/Stock State
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<WarehouseIngredient | null>(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'fish',
    categoryLabel: 'Рыба & Морепродукты',
    stock: '',
    unit: 'кг',
    customUnit: '',
    minThreshold: '',
    costPerUnit: ''
  });
  const [manualStockInputs, setManualStockInputs] = useState<{ [id: string]: string }>({});

  const handleOpenAddInventory = () => {
    setInventoryForm({
      name: '',
      category: 'fish',
      categoryLabel: 'Рыба & Морепродукты',
      stock: '10',
      unit: 'кг',
      customUnit: '',
      minThreshold: '3',
      costPerUnit: '500'
    });
    setIsAddInventoryModalOpen(true);
  };

  const handleOpenEditInventory = (item: WarehouseIngredient) => {
    const isStandardUnit = ['кг', 'г', 'л', 'мл', 'шт', 'уп', 'порц'].includes(item.unit);
    setEditingInventoryItem(item);
    setInventoryForm({
      name: item.name,
      category: item.category,
      categoryLabel: item.categoryLabel || item.category,
      stock: item.stock.toString(),
      unit: isStandardUnit ? item.unit : 'custom',
      customUnit: isStandardUnit ? '' : item.unit,
      minThreshold: item.minThreshold.toString(),
      costPerUnit: item.costPerUnit.toString()
    });
  };

  const handleSaveInventoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = inventoryForm.unit === 'custom' ? (inventoryForm.customUnit.trim() || 'шт') : inventoryForm.unit;
    const payload = {
      name: inventoryForm.name.trim(),
      category: inventoryForm.category,
      categoryLabel: inventoryForm.categoryLabel,
      stock: parseFloat(inventoryForm.stock) || 0,
      unit: finalUnit,
      minThreshold: parseFloat(inventoryForm.minThreshold) || 1,
      costPerUnit: parseFloat(inventoryForm.costPerUnit) || 0
    };

    try {
      if (editingInventoryItem) {
        const res = await fetch(`/api/admin/inventory/${editingInventoryItem.id}`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setEditingInventoryItem(null);
          fetchInventory();
        }
      } else {
        const res = await fetch('/api/admin/inventory', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsAddInventoryModalOpen(false);
          fetchInventory();
        }
      }
    } catch (err) {
      console.error('Failed to save inventory position:', err);
    }
  };

  const handleDeleteInventory = async (id: string, name: string) => {
    if (!window.confirm(`Удалить позицию "${name}" со склада?`)) return;
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        fetchInventory();
      }
    } catch (err) {
      console.error('Failed to delete inventory position:', err);
    }
  };

  const handleSetExactStock = async (id: string) => {
    const val = manualStockInputs[id];
    if (val === undefined || val === '') return;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return;
    try {
      const res = await fetch('/api/admin/inventory/set-stock', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ingredientId: id, stock: num })
      });
      if (res.ok) {
        setRestockSuccessId(id);
        setTimeout(() => setRestockSuccessId(null), 2000);
        setManualStockInputs(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        fetchInventory();
      }
    } catch (err) {
      console.error('Failed to set exact stock:', err);
    }
  };

  const fetchAnalytics = async (period = selectedPeriod) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
        if (data.analytics.opexDetails) {
          setOpexForm(data.analytics.opexDetails);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.inventory) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchZReport = async (date = selectedZReportDate) => {
    setZReportLoading(true);
    try {
      const res = await fetch(`/api/admin/daily-report?date=${date}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.report) {
        setZReportData(data.report);
      }
    } catch (err) {
      console.error('Error fetching Z-report:', err);
    } finally {
      setZReportLoading(false);
    }
  };

  const handlePrintOwnerZReport = () => {
    if (!zReportData) return;

    const printHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.35; color: #000; background: #fff; max-width: 720px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
              PANDABAR • ДНЕВНОЙ Z-ОТЧЕТ КАССЫ
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
          <title>Z-Отчет Кассы - Суши Панда (${zReportData.dateFormatted})</title>
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
    if (activeTab === 'zreport') {
      fetchZReport(selectedZReportDate);
    }
  }, [activeTab, selectedZReportDate]);


  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders for owner:', err);
    }
  };

  const fetchPrintStatus = async () => {
    try {
      const res = await fetch('/api/admin/print-status', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.agent) {
        setPrintAgentStatus(data.agent);
      }
    } catch (err) {
      console.error('Error fetching print status:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
    fetchInventory();
    fetchOrders();
    fetchPrintStatus();

    const interval = setInterval(() => {
      fetchAnalytics(selectedPeriod);
      fetchInventory();
      fetchOrders();
      fetchPrintStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const handlePeriodChange = (period: 'day' | '2days' | 'week' | 'month') => {
    setSelectedPeriod(period);
    fetchAnalytics(period);
  };

  const handleSaveOpex = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/opex', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(opexForm)
      });
      const data = await res.json();
      if (data.success) {
        setOpexSavedNotification(true);
        setTimeout(() => setOpexSavedNotification(false), 3000);
        setIsOpexModalOpen(false);
        fetchAnalytics(selectedPeriod);
      }
    } catch (err) {
      console.error('Failed to save OPEX:', err);
    }
  };

  const handleRestock = async (ingredientId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    try {
      const res = await fetch('/api/admin/inventory/restock', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ingredientId, amount })
      });
      const data = await res.json();
      if (data.success) {
        setRestockSuccessId(ingredientId);
        setTimeout(() => setRestockSuccessId(null), 2000);
        fetchInventory();
      }
    } catch (err) {
      console.error('Failed to restock ingredient:', err);
    }
  };

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
      console.error('Failed to toggle stock:', err);
    }
  };

  const handleSavePrice = async (productId: string) => {
    const numPrice = parseInt(editPriceValue, 10);
    if (isNaN(numPrice) || numPrice <= 0) return;
    try {
      const res = await fetch(`/api/admin/menu/${productId}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ price: numPrice })
      });
      if (res.ok) {
        if (onUpdateProduct) onUpdateProduct(productId, numPrice, undefined);
        setEditingProductId(null);
      }
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const periodLabels = {
    day: 'Сегодня (24 часа)',
    '2days': 'Последние 2 дня (48ч)',
    week: 'Текущая неделя (7 дней)',
    month: 'Текущий месяц (30 дней)'
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5" />
              <span>Панель Владельца Бизнеса</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-panda-orange/15 text-panda-orange text-[11px] font-bold">
              🔥 Точный расчет чистой прибыли & склад
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-normal italic text-white tracking-tight">
            Управленческий Учет & Аналитика
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Выручка, себестоимость рецептур (Food Cost), ручной учет постоянных расходов (OPEX), чистая прибыль и списание сырья со склада.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Emergency Kitchen Stop Status Toggle */}
          {kitchenStatus && (
            <button
              onClick={() => {
                if (kitchenStatus.isOpen) {
                  setIsStopConfirmOpen(true);
                } else if (onUpdateKitchenStatus) {
                  onUpdateKitchenStatus(true, '');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer border shadow-sm ${
                kitchenStatus.isOpen
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-red-600 text-white border-red-700 animate-pulse'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${kitchenStatus.isOpen ? 'bg-emerald-400' : 'bg-white'}`} />
              <span>{kitchenStatus.isOpen ? '🟢 Приём заказов открыт' : '🛑 Кухня закрыта / Стоп'}</span>
            </button>
          )}

          <button
            onClick={() => { fetchAnalytics(selectedPeriod); fetchInventory(); fetchOrders(); }}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-all cursor-pointer disabled:opacity-50"
            title="Обновить финансовые показатели"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsOpexModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Настроить OPEX (Расходы)</span>
          </button>
          
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-panda-orange text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              📊 Аналитика & Прибыль
            </button>
            <button
              onClick={() => setActiveTab('zreport')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'zreport' ? 'bg-emerald-600 text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              📋 Дневной Z-Отчет
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory' ? 'bg-panda-orange text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              📦 Склад & Сырье ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('stoplist')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stoplist' ? 'bg-panda-orange text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              🍱 Меню & Цены
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-panda-orange text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              🧾 Заказы ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'print' ? 'bg-panda-orange text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              <span>🖨️ Печать (1С)</span>
              <span className={`h-2 w-2 rounded-full ${printAgentStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: FINANCIAL ANALYTICS & NET PROFIT ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Period Selector Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-panda-charcoal border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Calendar className="h-4 w-4 text-panda-orange" />
              <span>Период отчета: <strong className="text-white">{periodLabels[selectedPeriod]}</strong></span>
            </div>

            <div className="flex items-center rounded-2xl bg-white/5 p-1 border border-white/10 w-full sm:w-auto">
              {(['day', '2days', 'week', 'month'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedPeriod === period
                      ? 'bg-panda-orange text-white shadow-lg'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {period === 'day' && 'День'}
                  {period === '2days' && '2 Дня'}
                  {period === 'week' && 'Неделя'}
                  {period === 'month' && 'Месяц'}
                </button>
              ))}
            </div>
          </div>

          {/* KPI 5-Cards Grid: Revenue, Food Cost, Gross Profit, OPEX, Net Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Gross Revenue */}
            <div className="rounded-3xl border border-emerald-500/20 bg-panda-charcoal p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">1. Выручка (Gross)</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="font-mono text-2xl font-black text-white">
                  {analytics?.totalRevenue?.toLocaleString('ru-RU') || 0} ₽
                </p>
              </div>
              <p className="text-[11px] text-white/40 mt-3 flex items-center gap-1 border-t border-white/5 pt-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Заказов: <strong>{analytics?.completedOrders || 0}</strong></span>
              </p>
            </div>

            {/* Card 2: Food Cost */}
            <div className="rounded-3xl border border-amber-500/20 bg-panda-charcoal p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">2. Себестоимость сырья</span>
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <p className="font-mono text-2xl font-black text-white">
                  {analytics?.foodCost?.toLocaleString('ru-RU') || 0} ₽
                </p>
              </div>
              <p className="text-[11px] text-white/40 mt-3 border-t border-white/5 pt-2">
                Доля Food Cost: <strong className="text-amber-400">
                  {analytics?.totalRevenue ? Math.round(((analytics.foodCost || 0) / analytics.totalRevenue) * 100) : 0}%
                </strong>
              </p>
            </div>

            {/* Card 3: Gross Profit */}
            <div className="rounded-3xl border border-blue-500/20 bg-panda-charcoal p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">3. Валовая Прибыль</span>
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <p className="font-mono text-2xl font-black text-white">
                  {analytics?.grossProfit?.toLocaleString('ru-RU') || 0} ₽
                </p>
              </div>
              <p className="text-[11px] text-white/40 mt-3 border-t border-white/5 pt-2">
                Маржинальность: <strong className="text-blue-400">{analytics?.grossMargin || 0}%</strong>
              </p>
            </div>

            {/* Card 4: OPEX (Operational Expenses) */}
            <div className="rounded-3xl border border-purple-500/20 bg-panda-charcoal p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">4. Расходы OPEX</span>
                  <button 
                    onClick={() => setIsOpexModalOpen(true)}
                    className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
                    title="Редактировать постоянные расходы"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-mono text-2xl font-black text-white">
                  {analytics?.opex?.toLocaleString('ru-RU') || 0} ₽
                </p>
              </div>
              <p className="text-[11px] text-white/40 mt-3 border-t border-white/5 pt-2 flex items-center justify-between">
                <span>Аренда + ЗП + Реклама</span>
                <span className="text-purple-400 text-[10px] underline cursor-pointer" onClick={() => setIsOpexModalOpen(true)}>Настроить</span>
              </p>
            </div>

            {/* Card 5: Net Profit (KEY METRIC) */}
            <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 to-panda-charcoal p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span>👑 ЧИСТАЯ ПРИБЫЛЬ</span>
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className={`font-mono text-2xl sm:text-3xl font-black ${(analytics?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {analytics?.netProfit?.toLocaleString('ru-RU') || 0} ₽
                </p>
              </div>
              <div className="mt-3 border-t border-emerald-500/20 pt-2 flex items-center justify-between text-[11px]">
                <span className="text-white/50">Рентабельность:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                  (analytics?.netMargin || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {analytics?.netMargin || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Financial Breakdown Visual Chart */}
          {analytics?.chartData && analytics.chartData.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-panda-orange" />
                    <span>Финансовая Динамика по Отрезкам Времени</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    Соотношение Выручки, Себестоимости блюд, Расходов OPEX и Итоговой Чистой Прибыли
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Выручка
                  </span>
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Food Cost
                  </span>
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-400" /> OPEX
                  </span>
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className="h-2.5 w-2.5 rounded-full bg-panda-orange" /> Чистая Прибыль
                  </span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-4">
                {analytics.chartData.map((pt, idx) => {
                  const maxVal = Math.max(...analytics.chartData!.map(p => p.revenue), 1);
                  const revPercent = (pt.revenue / maxVal) * 100;

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-white text-sm">{pt.label}</span>
                        <div className="flex items-center gap-4 font-mono">
                          <span className="text-white/60">Заказов: <strong>{pt.orders || 0}</strong></span>
                          <span className="text-emerald-400 font-bold">Выручка: {(pt.revenue || 0).toLocaleString('ru-RU')} ₽</span>
                          <span className="text-amber-400/80">Себестоимость: -{(pt.foodCost || 0).toLocaleString('ru-RU')} ₽</span>
                          <span className="text-purple-400/80">OPEX: -{(pt.opex || 0).toLocaleString('ru-RU')} ₽</span>
                          <span className={`font-black px-2.5 py-0.5 rounded-lg ${(pt.netProfit || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                            Итог: {(pt.netProfit || 0).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>

                      {/* Visual segmented bar */}
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                        <div 
                          className="bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(5, revPercent * 0.6)}%` }}
                          title={`Выручка: ${pt.revenue || 0} ₽`}
                        />
                        <div 
                          className="bg-amber-500/80 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(3, ((pt.foodCost || 0) / maxVal) * 100 * 0.6)}%` }}
                          title={`Себестоимость: ${pt.foodCost || 0} ₽`}
                        />
                        <div 
                          className="bg-purple-500/80 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(2, ((pt.opex || 0) / maxVal) * 100 * 0.6)}%` }}
                          title={`OPEX: ${pt.opex || 0} ₽`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two-Column Analytics: Top Dishes with Margins & Consumed Ingredients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top dishes with Food Cost and Net Margin */}
            <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 space-y-4 shadow-xl">
              <h3 className="font-display text-lg font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-panda-gold" />
                  <span>Рейтинг Блюд & Маржинальность</span>
                </span>
                <span className="text-[10px] text-white/40 font-normal">С учетом себестоимости</span>
              </h3>
              
              <div className="space-y-3">
                {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                  analytics.topProducts.map((prod, idx) => (
                    <div key={prod.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-xs text-panda-orange w-5 text-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">{prod.name}</p>
                            <p className="text-[10px] text-white/40">{prod.count} шт. продано</p>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-xs font-bold text-emerald-400">{prod.revenue.toLocaleString('ru-RU')} ₽</p>
                          <p className="text-[10px] text-white/40">Себестоимость: -{prod.cost.toLocaleString('ru-RU')} ₽</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                        <span className="text-white/50">Прибыль блюда: <strong className="text-white font-mono">{prod.profit.toLocaleString('ru-RU')} ₽</strong></span>
                        <span className="font-mono font-bold text-panda-gold text-[10px] bg-panda-gold/10 px-2 py-0.5 rounded-md">
                          Маржа: {prod.margin}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 italic py-6 text-center">Данные о продажах формируются...</p>
                )}
              </div>
            </div>

            {/* Top Raw Ingredients Consumed from Warehouse */}
            <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 space-y-4 shadow-xl">
              <h3 className="font-display text-lg font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-emerald-400" />
                  <span>Расход Сырья со Склада за Период</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 font-bold">Списано автоматически</span>
              </h3>

              <div className="space-y-3">
                {analytics?.topIngredientsUsed && analytics.topIngredientsUsed.length > 0 ? (
                  analytics.topIngredientsUsed.map((ing, idx) => (
                    <div key={ing.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white">{ing.name}</p>
                          <p className="text-[10px] text-white/40">Израсходовано: <strong className="text-panda-orange">{ing.amount} {ing.unit}</strong></p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {ing.cost.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 italic py-6 text-center">Списания отобразятся после заказов.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1.5: DAILY Z-REPORT & COMMERCE SUMMARY (ДНЕВНОЙ Z-ОТЧЕТ ЗА СМЕНУ) ── */}
      {activeTab === 'zreport' && (
        <div className="space-y-6">
          {/* Controls Bar: Date Selector, Print A4 Button, Export CSV Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-panda-charcoal p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg no-print">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-white/60">Дата смены:</span>
              <input
                type="date"
                value={selectedZReportDate}
                onChange={(e) => setSelectedZReportDate(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => fetchZReport(selectedZReportDate)}
                disabled={zReportLoading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-all cursor-pointer"
                title="Обновить отчет"
              >
                <RefreshCw className={`h-4 w-4 ${zReportLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/api/admin/daily-report/export-csv?date=${selectedZReportDate}`}
                download
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥 Экспорт в Excel / CSV</span>
              </a>

              <button
                onClick={handlePrintOwnerZReport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Распечатать Z-Отчет (A4 Ч/Б)</span>
              </button>
            </div>
          </div>

          {/* Structured Z-Report Printable Sheet */}
          {zReportData ? (
            <div className="print-document-container bg-white text-zinc-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-zinc-200 max-w-4xl mx-auto space-y-8 select-text">
              {/* Report Header */}
              <div className="border-b-2 border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950">
                    PANDABAR • ДНЕВНОЙ Z-ОТЧЕТ КАССЫ
                  </h2>
                  <p className="text-xs font-bold text-zinc-600 mt-1">
                    Служба доставки суши и ресторан • г. Барнаул
                  </p>
                </div>
                <div className="text-right text-xs font-mono text-zinc-700">
                  <p><strong>Дата смены:</strong> {zReportData.dateFormatted}</p>
                  <p className="text-[10px] text-zinc-500">Сформирован: {new Date(zReportData.generatedAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* 1. Main Financial Metrics KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Выручка за смену</p>
                  <p className="text-xl sm:text-2xl font-black font-mono text-zinc-950 mt-1">
                    {zReportData.totalRevenue.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Средний чек</p>
                  <p className="text-xl sm:text-2xl font-black font-mono text-zinc-950 mt-1">
                    {zReportData.averageCheck.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Выполнено заказов</p>
                  <p className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-1">
                    {zReportData.completedOrdersCount} шт
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Отменено</p>
                  <p className="text-xl sm:text-2xl font-black font-mono text-red-600 mt-1">
                    {zReportData.cancelledOrdersCount} шт
                  </p>
                </div>
              </div>

              {/* 2. Payment Methods & Order Types Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl border border-zinc-300 space-y-3">
                  <h4 className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-200 pb-2">
                    1. Способы оплаты
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Наличными при получении:</span>
                      <strong className="text-zinc-950">{(zReportData.payments?.cash || 0).toLocaleString('ru-RU')} ₽</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Безналичными (терминал курьера):</span>
                      <strong className="text-zinc-950">{(zReportData.payments?.card || 0).toLocaleString('ru-RU')} ₽</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-300 space-y-3">
                  <h4 className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-200 pb-2">
                    2. Типы заказов
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Доставка курьером:</span>
                      <strong>{zReportData.deliveryOrdersCount || 0} шт. ({(zReportData.deliveryRevenue || 0).toLocaleString('ru-RU')} ₽)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Самовывоз из бара:</span>
                      <strong>{zReportData.pickupOrdersCount || 0} шт. ({(zReportData.pickupRevenue || 0).toLocaleString('ru-RU')} ₽)</strong>
                    </div>
                  </div>
                </div>
              </div>


              {/* 3. Top Sold Dishes Ranking Table */}
              <div className="space-y-3 page-break-avoid">
                <h4 className="text-xs font-black uppercase text-zinc-900">
                  3. Рейтинг проданных блюд за смену
                </h4>
                <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-100 border-b border-zinc-900 font-bold">
                      <tr>
                        <th className="p-2 border-r border-zinc-900 w-10 text-center">№</th>
                        <th className="p-2 border-r border-zinc-900">Наименование блюда</th>
                        <th className="p-2 border-r border-zinc-900 w-24 text-center">Кол-во</th>
                        <th className="p-2 text-right w-32">Выручка</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {zReportData.topProducts && zReportData.topProducts.length > 0 ? (
                        zReportData.topProducts.map((p: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2 border-r border-zinc-200 text-center font-mono font-bold">{idx + 1}</td>
                            <td className="p-2 border-r border-zinc-200 font-semibold">{p.name}</td>
                            <td className="p-2 border-r border-zinc-200 text-center font-mono">{p.quantity} шт</td>
                            <td className="p-2 text-right font-mono font-bold">{p.revenue.toLocaleString('ru-RU')} ₽</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-zinc-400 italic">За смену не было проданных позиций</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Packaging and Cutlery Consumed */}
              <div className="space-y-3 page-break-avoid">
                <h4 className="text-xs font-black uppercase text-zinc-900">
                  4. Расход базовых комплектов и упаковки
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {zReportData.packagingUsage && zReportData.packagingUsage.map((u: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 flex items-center justify-between">
                      <span className="text-zinc-700 text-[11px]">{u.name}:</span>
                      <strong className="font-mono text-zinc-950 font-bold">{u.quantity} {u.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures for A4 Document */}
              <div className="pt-6 border-t-2 border-zinc-900 grid grid-cols-2 gap-8 text-xs font-semibold">
                <div>
                  <p>Отчет сдал (Старший смены): ______________________</p>
                </div>
                <div className="text-right">
                  <p>Отчет принял (Управляющий): ______________________</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-white/40 italic">
              {zReportLoading ? 'Формирование отчета...' : 'Выберите дату и нажмите обновить.'}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: WAREHOUSE & STOCK INVENTORY (УЧЕТ ТОВАРОВ ДЛЯ ВЛАДЕЛЬЦА) ── */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Header Bar & Search & Add Position Button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-panda-charcoal p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Поиск позиции (лосось, рис, палочки, нори, сыр...)..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-panda-orange"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-white/50 px-1">
                <span>Позиций: <strong className="text-white">{filteredInventory.length}</strong></span>
                <span className="h-3 w-px bg-white/10 hidden sm:inline" />
                <span className="text-emerald-400 font-bold hidden sm:inline">● Автосписание рецептур</span>
              </div>
            </div>

            <button
              onClick={handleOpenAddInventory}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-panda-orange/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить позицию на склад</span>
            </button>
          </div>

          {/* Warehouse Stock Grid */}
          {filteredInventory.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center flex flex-col items-center">
              <Warehouse className="h-12 w-12 text-white/20 mb-3" />
              <h4 className="font-display text-lg font-bold text-white">Склад пуст или ничего не найдено</h4>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                Нажмите «Добавить позицию на склад», чтобы создать ингредиенты, упаковку или расходники с любыми единицами измерения.
              </p>
              <button
                onClick={handleOpenAddInventory}
                className="mt-4 px-4 py-2 rounded-xl bg-panda-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Создать первую позицию</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInventory.map(item => {
                const isCritical = item.stock <= item.minThreshold * 0.5;
                const isWarning = item.stock <= item.minThreshold;
                const percent = Math.min(100, Math.round((item.stock / Math.max(1, item.minThreshold * 2.5)) * 100));
                const manualVal = manualStockInputs[item.id] !== undefined ? manualStockInputs[item.id] : '';

                return (
                  <div 
                    key={item.id} 
                    className={`rounded-3xl p-5 border transition-all space-y-4 bg-panda-charcoal shadow-xl relative overflow-hidden flex flex-col justify-between ${
                      isCritical 
                        ? 'border-red-500/50 bg-red-950/20 shadow-red-500/5' 
                        : isWarning 
                          ? 'border-amber-500/40' 
                          : 'border-white/10'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Category, Name & Edit/Delete actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-panda-orange">
                            {item.categoryLabel || item.category}
                          </span>
                          <h4 className="font-display font-bold text-white text-base leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-white/40">
                            Себестоимость: ~{item.costPerUnit} ₽ / {item.unit}
                          </p>
                        </div>

                        {/* Top Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditInventory(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer"
                            title="Редактировать параметры и метрику"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(item.id, item.name)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all cursor-pointer"
                            title="Удалить позицию"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border shrink-0 flex items-center gap-1 ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                            : isWarning
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isCritical ? '⚠️ КРИТИЧЕСКИ МАЛО' : isWarning ? 'Заканчивается' : '✓ В норме'}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          Мин: {item.minThreshold} {item.unit}
                        </span>
                      </div>

                      {/* Stock level bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white/60">Текущий остаток:</span>
                          <span className="font-bold text-white text-base">
                            {item.stock} <span className="text-panda-orange">{item.unit}</span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/35 font-mono">
                          <span>Списано сегодня: {item.usedToday || 0} {item.unit}</span>
                          <span>За период: {item.usedPeriod || 0} {item.unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Adjustment Controls: Manual exact volume + quick buttons */}
                    <div className="pt-3 border-t border-white/5 space-y-2.5">
                      {/* Manual Exact Volume Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                          Ввести точный объем вручную:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              step="any"
                              placeholder={`Напр. ${item.stock}`}
                              value={manualVal}
                              onChange={(e) => setManualStockInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSetExactStock(item.id);
                              }}
                              className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-panda-orange"
                            />
                            <span className="absolute right-2.5 top-1.5 text-[10px] text-white/40 font-mono pointer-events-none">
                              {item.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSetExactStock(item.id)}
                            disabled={manualVal === ''}
                            className="px-3 py-1.5 rounded-xl bg-panda-orange hover:bg-panda-orange-hover text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                          >
                            Задать
                          </button>
                        </div>
                      </div>

                      {/* Quick Restock Action Buttons */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                          Быстрое пополнение (+):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRestock(item.id, item.unit === 'кг' || item.unit === 'л' ? 1 : item.unit === 'г' || item.unit === 'мл' ? 100 : 10)}
                            className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-white font-mono font-bold text-xs transition-all cursor-pointer"
                          >
                            +{item.unit === 'кг' || item.unit === 'л' ? '1' : item.unit === 'г' || item.unit === 'мл' ? '100' : '10'} {item.unit}
                          </button>
                          <button
                            onClick={() => handleRestock(item.id, item.unit === 'кг' || item.unit === 'л' ? 5 : item.unit === 'г' || item.unit === 'мл' ? 500 : 50)}
                            className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-white font-mono font-bold text-xs transition-all cursor-pointer"
                          >
                            +{item.unit === 'кг' || item.unit === 'л' ? '5' : item.unit === 'г' || item.unit === 'мл' ? '500' : '50'} {item.unit}
                          </button>
                          <button
                            onClick={() => handleRestock(item.id, item.unit === 'кг' || item.unit === 'л' ? 10 : item.unit === 'г' || item.unit === 'мл' ? 1000 : 100)}
                            className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-white font-mono font-bold text-xs transition-all cursor-pointer"
                          >
                            +{item.unit === 'кг' || item.unit === 'л' ? '10' : item.unit === 'г' || item.unit === 'мл' ? '1000' : '100'} {item.unit}
                          </button>
                        </div>
                      </div>

                      {restockSuccessId === item.id && (
                        <p className="text-[10px] text-emerald-400 font-bold text-center animate-in fade-in">
                          ✓ Остаток успешно обновлен!
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MODAL: ADD / EDIT WAREHOUSE POSITION ── */}
          {(isAddInventoryModalOpen || editingInventoryItem) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
              <div className="w-full max-w-lg bg-panda-charcoal border border-white/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-panda-orange/15 border border-panda-orange/30 text-panda-orange flex items-center justify-center">
                      <Warehouse className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-lg">
                        {editingInventoryItem ? 'Редактировать позицию склада' : 'Новая позиция на складе'}
                      </h3>
                      <p className="text-xs text-white/40">
                        {editingInventoryItem ? 'Изменение названия, метрики или остатка' : 'Добавление сырья, упаковки или расходников'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddInventoryModalOpen(false);
                      setEditingInventoryItem(null);
                    }}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveInventoryForm} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/70">
                      Название позиции / ингредиента <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Напр. Лосось филе охл., Палочки бамбук, Сыр Cremette"
                      value={inventoryForm.name}
                      onChange={(e) => setInventoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-panda-orange"
                    />
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">
                        Категория на складе
                      </label>
                      <select
                        value={inventoryForm.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          const labels: { [k: string]: string } = {
                            fish: 'Рыба & Морепродукты',
                            dairy: 'Сыры & Молочка',
                            groceries: 'Бакалея & Крупы',
                            vegetables: 'Овощи & Зелень',
                            sauces: 'Соусы & Заправки',
                            bakery: 'Выпечка & Тесто',
                            packaging: 'Упаковка & Расходники',
                            other: 'Прочее'
                          };
                          setInventoryForm(prev => ({ 
                            ...prev, 
                            category: cat,
                            categoryLabel: labels[cat] || 'Прочее'
                          }));
                        }}
                        className="w-full bg-panda-dark border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-panda-orange"
                      >
                        <option value="fish">Рыба & Морепродукты</option>
                        <option value="dairy">Сыры & Молочка</option>
                        <option value="groceries">Бакалея & Крупы</option>
                        <option value="vegetables">Овощи & Зелень</option>
                        <option value="sauces">Соусы & Заправки</option>
                        <option value="bakery">Выпечка & Тесто</option>
                        <option value="packaging">Упаковка & Расходники</option>
                        <option value="other">Другое / Прочее</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">
                        Отображаемый ярлык категории
                      </label>
                      <input
                        type="text"
                        placeholder="Напр. Упаковка для роллов"
                        value={inventoryForm.categoryLabel}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, categoryLabel: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-panda-orange"
                      />
                    </div>
                  </div>

                  {/* Unit / Metric Selector & Custom Input */}
                  <div className="space-y-2 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                      <span>Единица измерения (Метрика) <span className="text-red-400">*</span></span>
                      <span className="text-[10px] text-panda-orange font-normal">Любая своя метрика</span>
                    </label>

                    {/* Quick Metric Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {['кг', 'г', 'л', 'мл', 'шт', 'уп', 'порц'].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setInventoryForm(prev => ({ ...prev, unit: u, customUnit: '' }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                            inventoryForm.unit === u
                              ? 'bg-panda-orange border-panda-orange text-white'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {u}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setInventoryForm(prev => ({ ...prev, unit: 'custom' }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          inventoryForm.unit === 'custom'
                            ? 'bg-panda-orange border-panda-orange text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        ✏️ Своя метрика
                      </button>
                    </div>

                    {/* Custom Metric Field if selected or custom */}
                    {inventoryForm.unit === 'custom' && (
                      <div className="pt-2">
                        <input
                          type="text"
                          required
                          placeholder="Введите свою единицу (напр. коробка, рулон, банка, пачка, метр)"
                          value={inventoryForm.customUnit}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, customUnit: e.target.value }))}
                          className="w-full bg-black/50 border border-panda-orange/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-panda-orange"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Stock, Threshold, Cost */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">
                        Текущий остаток <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="Напр. 15.5"
                        value={inventoryForm.stock}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-panda-orange"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">
                        Мин. порог
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Напр. 3"
                        value={inventoryForm.minThreshold}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, minThreshold: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-panda-orange"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">
                        Цена за ед. (₽)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Напр. 450"
                        value={inventoryForm.costPerUnit}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, costPerUnit: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-panda-orange"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddInventoryModalOpen(false);
                        setEditingInventoryItem(null);
                      }}
                      className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Отмена
                    </button>

                    <button
                      type="submit"
                      className="h-11 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-panda-orange/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingInventoryItem ? 'Сохранить изменения' : 'Создать позицию'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: STOP-LIST & MENU PRICING ── */}
      {activeTab === 'stoplist' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panda-charcoal p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Поиск блюда для смены цены или стоп-листа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-panda-orange"
              />
            </div>
            <span className="text-xs text-white/40">
              Найдено позиций: <strong className="text-white">{filteredProducts.length}</strong>
            </span>
          </div>

          <div className="rounded-3xl border border-white/10 bg-panda-charcoal overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/70">
                <thead className="bg-white/5 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Блюдо</th>
                    <th className="px-6 py-4">Категория</th>
                    <th className="px-6 py-4">Состав & Граммовка</th>
                    <th className="px-6 py-4">Цена (₽)</th>
                    <th className="px-6 py-4">Наличие (Стоп-лист)</th>
                    <th className="px-6 py-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map(product => {
                    const isAvailable = product.inStock !== false;
                    const isEditing = editingProductId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                            <div>
                              <p className="font-bold text-white">{product.name}</p>
                              <p className="text-[10px] text-white/40">{product.weight} {product.category === 'drinks' ? 'мл' : 'г'}.</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-white/60">
                          {product.category}
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                            {product.ingredientsSummary || 'Состав формируется'}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-panda-orange">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editPriceValue}
                                onChange={(e) => setEditPriceValue(e.target.value)}
                                className="w-20 bg-panda-dark border border-panda-orange px-2 py-1 rounded-lg text-xs text-white"
                              />
                              <button
                                onClick={() => handleSavePrice(product.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px]"
                              >
                                Сохранить
                              </button>
                            </div>
                          ) : (
                            <span>{product.price} ₽</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            isAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span>{isAvailable ? 'В наличии' : 'Стоп-Лист'}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStock(product)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                                isAvailable
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                            >
                              {isAvailable ? 'В стоп-лист' : 'Вернуть в продажу'}
                            </button>

                            <button
                              onClick={() => {
                                setEditingProductId(product.id);
                                setEditPriceValue(product.price.toString());
                              }}
                              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                              title="Изменить цену"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: COMPLETE ORDERS ARCHIVE ── */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 space-y-4 shadow-xl">
          <h3 className="font-display text-lg font-bold text-white">Полный Архив Заказов Платформы</h3>
          
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-white/40 italic text-center py-8">Заказы отсутствуют.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Заказ #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                        order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' : 'bg-panda-orange/15 text-panda-orange'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-white/40 mt-1">Клиент: {order.userName} ({order.userPhone})</p>
                    <p className="text-[11px] text-white/60 mt-0.5">
                      Позиций: {order.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-panda-orange text-sm">{order.total} ₽</p>
                    <p className="text-[10px] text-white/30 font-mono mt-0.5">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: 1C PRINTING & KITCHEN PRINT AGENT ── */}
      {activeTab === 'print' && (
        <div className="space-y-6">
          {/* Print Agent Status & Setup Card */}
          <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-panda-orange/10 border border-panda-orange/20 text-panda-orange flex items-center justify-center">
                  <Printer className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <span>Автоматическая Печать Накладных (Замена 1С)</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    Генерация накладных 3-в-1 (Накладная + Товарный чек + Заявка для цеха кухни)
                  </p>
                </div>
              </div>

              {/* Live Connection Badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-white/5">
                <span className={`h-2.5 w-2.5 rounded-full ${printAgentStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                <span className="text-xs font-bold text-white">
                  {printAgentStatus?.online ? '🟢 Агент кухни онлайн' : '⚪ Агент кухни не запущен'}
                </span>
              </div>
            </div>

            {/* Token & Quick Command */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-panda-orange flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Код / Токен для подключения Агента</span>
                </h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Используйте этот токен в приложении печати на компьютере кухни или кассы:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-panda-dark px-3 py-2 rounded-xl text-panda-gold font-mono font-bold text-xs border border-white/10 select-all">
                    {printAgentStatus?.token || '—'}
                  </code>
                  <button
                    onClick={() => {
                      if (printAgentStatus?.token) {
                        navigator.clipboard.writeText(printAgentStatus.token);
                        setTokenCopied(true);
                        setTimeout(() => setTokenCopied(false), 2000);
                      }
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                    title="Скопировать токен"
                  >
                    {tokenCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Команда запуска на кухонном ПК</span>
                </h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Запустите агент в папке проекта на кассе. Он будет автоматически сохранять картинки/файлы чеков:
                </p>
                <code className="block bg-panda-dark px-3 py-2 rounded-xl text-emerald-300 font-mono text-[11px] border border-white/10 overflow-x-auto select-all">
                  node print-agent/index.js
                </code>
              </div>
            </div>
          </div>

          {/* Orders Table with 1C Printing */}
          <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-base">Все Накладные & Чеки Заказов</h3>
                <p className="text-xs text-white/40">Нажмите на любой заказ, чтобы распечатать или открыть бланк 1С</p>
              </div>
              <span className="text-xs text-white/40">Всего: <strong className="text-white">{orders.length}</strong></span>
            </div>

            <div className="space-y-3">
              {orders.map(order => (
                <div 
                  key={order.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs hover:border-panda-orange/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-panda-orange text-sm">
                        #{order.id.replace(/\D/g, '').slice(-5) || order.id.slice(-5)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.type === 'delivery' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {order.type === 'delivery' ? 'Доставка' : 'Самовывоз'}
                      </span>
                      <span className="text-white/40 font-mono text-[10px]">
                        {new Date(order.createdAt).toLocaleTimeString('ru-RU')}
                      </span>
                    </div>

                    <p className="font-bold text-white text-xs">
                      Клиент: {order.userName || 'Гость'} <span className="text-white/40 font-normal">({order.userPhone})</span>
                    </p>

                    <p className="text-[11px] text-white/50">
                      {order.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-mono font-bold text-white text-sm">
                      {order.total} ₽
                    </span>

                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-panda-orange/15 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Печать 1С</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: 1C RECEIPT VIEWER & PRINTER ── */}
      {selectedReceiptOrder && (
        <Receipt1C 
          order={selectedReceiptOrder} 
          onClose={() => setSelectedReceiptOrder(null)} 
        />
      )}

      {/* ── MODAL: OPEX (OPERATIONAL EXPENSES) SETTINGS ── */}
      {isOpexModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-panda-charcoal border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="font-display font-bold text-white text-xl flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-purple-400" />
                  <span>Постоянные Расходы (OPEX)</span>
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Укажите ежемесячные расходы для точного расчета Чистой Прибыли
                </p>
              </div>
              <button
                onClick={() => setIsOpexModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOpex} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-semibold">1. Аренда помещения в месяц (₽):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={opexForm.rentMonthly}
                  onChange={e => setOpexForm({ ...opexForm, rentMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">2. Зарплатный фонд (ФОТ) в месяц (₽):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={opexForm.salariesMonthly}
                  onChange={e => setOpexForm({ ...opexForm, salariesMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">3. Маркетинг и реклама в месяц (₽):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={opexForm.marketingMonthly}
                  onChange={e => setOpexForm({ ...opexForm, marketingMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">4. Коммунальные услуги & софт (₽):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={opexForm.utilitiesMonthly}
                  onChange={e => setOpexForm({ ...opexForm, utilitiesMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">5. Прочие операционные расходы (₽):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={opexForm.otherMonthly}
                  onChange={e => setOpexForm({ ...opexForm, otherMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
                💡 <strong>Итоговый ежемесячный OPEX:</strong>{' '}
                <span className="font-mono font-bold text-white">
                  {(opexForm.rentMonthly + opexForm.salariesMonthly + opexForm.marketingMonthly + opexForm.utilitiesMonthly + opexForm.otherMonthly).toLocaleString('ru-RU')} ₽ / мес.
                </span>
                <p className="text-[10px] text-purple-300/70 mt-1">
                  При выборе периода (День, 2 дня, Неделя) сумма расходов делится пропорционально дням автоматически.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpexModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-extrabold shadow-lg hover:brightness-110 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Сохранить расходы</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMERGENCY KITCHEN STOP CONFIRMATION MODAL FOR OWNER */}
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
                    Управление доступностью витрины для гостей
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
                <label className="block text-white/70 font-semibold mb-1">Длительность закрытия / блокировки сайта:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '30 минут', val: 30 },
                    { label: '1 час', val: 60 },
                    { label: '2 часа', val: 120 },
                    { label: '4 часа', val: 240 },
                    { label: '📅 На сегодня (до завтра)', val: 1440 },
                    { label: '📅 На 2 дня (завтра включительно)', val: 2880 },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setPauseMinutesInput(opt.val);
                        if (opt.val >= 1440) {
                          setPauseReasonInput('Ресторан временно закрыт на весь день. Приносим извинения за неудобства!');
                        }
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        pauseMinutesInput === opt.val ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                ⚠️ <strong>Внимание:</strong> После подтверждения приём заказов на сайте будет полностью заблокирован. Гости увидят аккуратную информационную плашку с причиной.
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
    </div>
  );
}

export function AdminDashboard({ 
  products, 
  onUpdateProduct,
  kitchenStatus,
  onUpdateKitchenStatus,
  onSwitchView
}: AdminDashboardProps) {
  const [workers, setWorkers] = useState<WorkerAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminTab, setAdminTab] = useState<'business' | 'workers'>('workers');

  // Master PINs state
  const [systemPins, setSystemPins] = useState<{
    pin_kitchen: string;
    pin_courier: string;
    pin_owner: string;
    pin_admin: string;
  }>({
    pin_kitchen: '7701',
    pin_courier: '8802',
    pin_owner: '9903',
    pin_admin: '1488'
  });
  const [isEditingPins, setIsEditingPins] = useState(false);
  const [editPinsForm, setEditPinsForm] = useState({
    pin_kitchen: '',
    pin_courier: '',
    pin_owner: '',
    pin_admin: ''
  });
  const [pinsSaveMsg, setPinsSaveMsg] = useState<string | null>(null);

  // Visibility and copying state
  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter & Search
  const [filterType, setFilterType] = useState<'all' | 'staff' | 'clients'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<WorkerRole>('chef');
  const [newWorkerPin, setNewWorkerPin] = useState('');

  const [editingWorker, setEditingWorker] = useState<WorkerAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<WorkerRole>('chef');
  const [editPin, setEditPin] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'blocked'>('active');

  const fetchSystemPins = async () => {
    try {
      const res = await fetch('/api/admin/system-pins', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.pins) {
        setSystemPins(data.pins);
        setEditPinsForm(data.pins);
      }
    } catch (err) {
      console.error('Error fetching system pins:', err);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/workers?type=${filterType}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.workers) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemPins();
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [filterType]);

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSavePins = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/system-pins', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editPinsForm)
      });
      const data = await res.json();
      if (data.success) {
        setSystemPins(editPinsForm);
        setIsEditingPins(false);
        setPinsSaveMsg('Ключ-пароли успешно обновлены!');
        setTimeout(() => setPinsSaveMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error updating system pins:', err);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName || !newWorkerPhone || !newWorkerPin) return;

    try {
      const res = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: newWorkerName,
          phone: newWorkerPhone,
          role: newWorkerRole,
          pinCode: newWorkerPin
        })
      });
      const data = await res.json();
      if (data.success && data.worker) {
        setWorkers(prev => [data.worker, ...prev.filter(w => w.id !== data.worker.id)]);
        setIsCreateModalOpen(false);
        setNewWorkerName('');
        setNewWorkerPhone('');
        setNewWorkerPin('');
      }
    } catch (err) {
      console.error('Error creating worker:', err);
    }
  };

  const openEditModal = (worker: WorkerAccount) => {
    setEditingWorker(worker);
    setEditName(worker.name);
    setEditPhone(worker.phone);
    setEditRole(worker.role);
    setEditPin('');
    setEditStatus(worker.status === 'blocked' ? 'blocked' : 'active');
  };

  const handleSaveEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      const res = await fetch(`/api/admin/workers/${editingWorker.id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          role: editRole,
          status: editStatus,
          pinCode: editPin
        })
      });
      const data = await res.json();
      if (data.success && data.worker) {
        setWorkers(prev => prev.map(w => w.id === editingWorker.id ? data.worker : w));
        setEditingWorker(null);
      }
    } catch (err) {
      console.error('Error updating worker:', err);
    }
  };

  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (workerId === 'user-admin-main') {
      alert('Главного администратора системы удалить нельзя.');
      return;
    }
    if (!window.confirm(`Вы точно хотите удалить пользователя "${workerName}" из базы данных?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/workers/${workerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
      }
    } catch (err) {
      console.error('Error deleting worker:', err);
    }
  };

  const roleBadges: Record<WorkerRole, { label: string; color: string; icon: any }> = {
    admin: { label: 'Администратор', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: Lock },
    owner: { label: 'Владелец', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Award },
    chef: { label: 'Шеф-Повар (Кухня)', color: 'bg-panda-orange/15 text-panda-orange border-panda-orange/30', icon: ChefHat },
    courier: { label: 'Курьер (Доставка)', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Truck },
    manager: { label: 'Менеджер Смены', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: UserCheck },
    client: { label: 'Клиент', color: 'bg-white/10 text-white/70 border-white/20', icon: Users }
  };

  // Filtered workers list
  const filteredWorkers = workers.filter(w => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (w.name || '').toLowerCase().includes(q);
    const phoneMatch = (w.phone || '').toLowerCase().includes(q);
    const pinMatch = (w.pinCode || '').toLowerCase().includes(q);
    const roleMatch = (roleBadges[w.role]?.label || '').toLowerCase().includes(q);
    return nameMatch || phoneMatch || pinMatch || roleMatch;
  });

  const staffCount = workers.filter(w => ['chef', 'courier', 'manager', 'admin', 'owner'].includes(w.role)).length;
  const clientsCount = workers.filter(w => w.role === 'client' || !w.role).length;

  return (
    <div className="space-y-8">
      {/* Top Admin Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-panda-charcoal to-panda-charcoal/80 p-4 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panda-orange/15 text-panda-orange border border-panda-orange/30">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">Главная Панель Администратора</h3>
            <p className="text-xs text-white/40">Логины, пароли, мастер-ключи терминалов и полное управление базой</p>
          </div>
        </div>

        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
          <button
            onClick={() => setAdminTab('workers')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              adminTab === 'workers' ? 'bg-panda-orange text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
          >
            База & Пароли ({workers.length})
          </button>
          <button
            onClick={() => setAdminTab('business')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              adminTab === 'business' ? 'bg-panda-orange text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
          >
            Бизнес & Аналитика
          </button>
        </div>
      </div>

      {/* Quick Role Emulation & Screen Switcher Cards (Admin exclusive) */}
      {onSwitchView && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
              <Eye className="h-4 w-4 text-panda-orange" />
              Быстрый переход к экранам персонала (Эмуляция ролей):
            </span>
            <span className="text-[10px] text-panda-gold font-mono font-bold bg-panda-gold/10 px-2.5 py-0.5 rounded-full border border-panda-gold/20">
              ТОЛЬКО У АДМИНИСТРАТОРА
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onSwitchView('chef')}
              className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-left transition-all group cursor-pointer hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ChefHat className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="font-bold text-xs text-white">Экран Кухни (KDS)</h4>
              <p className="text-[10px] text-white/40 mt-0.5">Терминал поваров и таймеры</p>
            </button>

            <button
              onClick={() => onSwitchView('courier')}
              className="p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-left transition-all group cursor-pointer hover:border-blue-500/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-8 w-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Truck className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-blue-400/50 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="font-bold text-xs text-white">Планшет Курьера</h4>
              <p className="text-[10px] text-white/40 mt-0.5">Маршруты и статусы доставки</p>
            </button>

            <button
              onClick={() => onSwitchView('owner')}
              className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-left transition-all group cursor-pointer hover:border-amber-500/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              </div>
              <h4 className="font-bold text-xs text-white">Кабинет Управляющего</h4>
              <p className="text-[10px] text-white/40 mt-0.5">Выручка, аналитика, склад</p>
            </button>

            <button
              onClick={() => onSwitchView('storefront')}
              className="p-3.5 rounded-2xl bg-panda-orange/10 hover:bg-panda-orange/20 border border-panda-orange/20 text-left transition-all group cursor-pointer hover:border-panda-orange/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-8 w-8 rounded-xl bg-panda-orange/20 flex items-center justify-center text-panda-orange">
                  <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-panda-orange/50 group-hover:text-panda-orange transition-colors" />
              </div>
              <h4 className="font-bold text-xs text-white">Витрина Сайта</h4>
              <p className="text-[10px] text-white/40 mt-0.5">Интерфейс гостя и корзина</p>
            </button>
          </div>
        </div>
      )}

      {adminTab === 'business' ? (
        <OwnerDashboard 
          products={products} 
          onUpdateProduct={onUpdateProduct} 
          kitchenStatus={kitchenStatus}
          onUpdateKitchenStatus={onUpdateKitchenStatus}
        />
      ) : (
        /* Workers and Passwords Management Tab */
        <div className="space-y-8">
          
          {/* 1. MASTER PIN SERVICE KEYS WIDGET */}
          <div className="rounded-3xl border border-white/10 bg-panda-charcoal p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-panda-orange/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                    Служебные Ключ-Пароли Доступа
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold">MASTER PINS</span>
                  </h3>
                  <p className="text-xs text-white/50">Быстрые ключи для входа персонала в служебные экраны</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pinsSaveMsg && (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-pulse">
                    ✓ {pinsSaveMsg}
                  </span>
                )}
                {!isEditingPins ? (
                  <button
                    onClick={() => {
                      setEditPinsForm(systemPins);
                      setIsEditingPins(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Изменить мастер-коды</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingPins(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                )}
              </div>
            </div>

            {isEditingPins ? (
              <form onSubmit={handleSavePins} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs font-bold text-panda-orange flex items-center gap-2">
                      <ChefHat className="h-4 w-4" /> Экран Кухни
                    </label>
                    <input
                      type="text"
                      required
                      value={editPinsForm.pin_kitchen}
                      onChange={e => setEditPinsForm(p => ({ ...p, pin_kitchen: e.target.value }))}
                      className="w-full bg-panda-dark border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-panda-orange"
                    />
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs font-bold text-blue-400 flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Экран Курьера
                    </label>
                    <input
                      type="text"
                      required
                      value={editPinsForm.pin_courier}
                      onChange={e => setEditPinsForm(p => ({ ...p, pin_courier: e.target.value }))}
                      className="w-full bg-panda-dark border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <Award className="h-4 w-4" /> Панель Владельца
                    </label>
                    <input
                      type="text"
                      required
                      value={editPinsForm.pin_owner}
                      onChange={e => setEditPinsForm(p => ({ ...p, pin_owner: e.target.value }))}
                      className="w-full bg-panda-dark border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Пароль Администратора
                    </label>
                    <input
                      type="text"
                      required
                      value={editPinsForm.pin_admin}
                      onChange={e => setEditPinsForm(p => ({ ...p, pin_admin: e.target.value }))}
                      className="w-full bg-panda-dark border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-panda-orange hover:bg-panda-orange-hover text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Сохранить все ключ-пароли
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Kitchen Key Card */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-panda-orange/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-panda-orange flex items-center gap-1.5">
                      <ChefHat className="h-4 w-4" /> Кухня
                    </span>
                    <button
                      onClick={() => handleCopy(systemPins.pin_kitchen, 'pin_kitchen')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                      title="Скопировать"
                    >
                      {copiedKey === 'pin_kitchen' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="text-center py-2">
                    <span className="font-mono text-2xl font-black text-white tracking-widest">
                      {systemPins.pin_kitchen || '7701'}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 text-center">ПИН-код для экрана поваров</span>
                </div>

                {/* Courier Key Card */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Truck className="h-4 w-4" /> Курьер
                    </span>
                    <button
                      onClick={() => handleCopy(systemPins.pin_courier, 'pin_courier')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                      title="Скопировать"
                    >
                      {copiedKey === 'pin_courier' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="text-center py-2">
                    <span className="font-mono text-2xl font-black text-white tracking-widest">
                      {systemPins.pin_courier || '8802'}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 text-center">ПИН-код для экрана доставки</span>
                </div>

                {/* Owner Key Card */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Award className="h-4 w-4" /> Владелец
                    </span>
                    <button
                      onClick={() => handleCopy(systemPins.pin_owner, 'pin_owner')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                      title="Скопировать"
                    >
                      {copiedKey === 'pin_owner' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="text-center py-2">
                    <span className="font-mono text-2xl font-black text-white tracking-widest">
                      {systemPins.pin_owner || '9903'}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 text-center">ПИН-код панели владельца</span>
                </div>

                {/* Admin Key Card */}
                <div className="bg-white/5 p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-500/60 transition-all bg-gradient-to-b from-emerald-500/5 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Lock className="h-4 w-4" /> Администратор
                    </span>
                    <button
                      onClick={() => handleCopy(systemPins.pin_admin, 'pin_admin')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                      title="Скопировать"
                    >
                      {copiedKey === 'pin_admin' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="text-center py-2">
                    <span className="font-mono text-2xl font-black text-emerald-400 tracking-widest">
                      {systemPins.pin_admin || '1488'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400/60 text-center">Ключ-пароль админа (+79937444590)</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. ACCOUNTS & PASSWORDS REGISTRY */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Реестр Аккаунтов & Паролей</span>
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-normal italic text-white tracking-tight">
                  Логины, Пароли и Управление Доступом
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Все учетные записи базы данных. Просматривайте пароли, редактируйте права, вносите новых пользователей.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 h-12 rounded-2xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white font-extrabold text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Внести человека в базу</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'all' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Все аккаунты ({workers.length})
                </button>
                <button
                  onClick={() => setFilterType('staff')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'staff' ? 'bg-panda-orange text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Сотрудники ({staffCount})
                </button>
                <button
                  onClick={() => setFilterType('clients')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'clients' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Клиенты ({clientsCount})
                </button>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    type="text"
                    placeholder="Поиск по имени, номеру, паролю..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-panda-orange"
                  />
                </div>

                <button
                  onClick={() => setShowAllPasswords(prev => !prev)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showAllPasswords 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                  title={showAllPasswords ? 'Скрыть пароли' : 'Показать пароли'}
                >
                  {showAllPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{showAllPasswords ? 'Скрыть пароли' : 'Показать пароли'}</span>
                </button>

                <button
                  onClick={fetchWorkers}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
                  title="Обновить список"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-panda-orange' : ''}`} />
                </button>
              </div>
            </div>

            {/* Workers Cards Grid */}
            {filteredWorkers.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/40 space-y-3">
                <Users className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold">Пользователи не найдены</p>
                <p className="text-xs text-white/30">Попробуйте изменить параметры поиска или фильтрации</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkers.map(worker => {
                  const Badge = roleBadges[worker.role] || roleBadges.client;
                  const Icon = Badge.icon;
                  const isPinRevealed = showAllPasswords || revealedPins[worker.id];
                  const isBlocked = worker.status === 'blocked';

                  return (
                    <div 
                      key={worker.id} 
                      className={`rounded-3xl border ${isBlocked ? 'border-red-500/30 bg-red-950/10' : 'border-white/10 bg-panda-charcoal'} p-5 space-y-4 shadow-xl relative overflow-hidden transition-all hover:border-white/20`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${Badge.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                              {worker.name}
                              {worker.role === 'admin' && <Lock className="h-3 w-3 text-emerald-400" />}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${Badge.color}`}>
                                <Icon className="h-2.5 w-2.5" />
                                <span>{Badge.label}</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isBlocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {isBlocked ? 'Заблокирован' : 'Активен'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(worker)}
                            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            title="Редактировать профиль и пароль"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {worker.role !== 'admin' && worker.id !== 'user-admin-main' && (
                            <button
                              onClick={() => handleDeleteWorker(worker.id, worker.name)}
                              className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Удалить из базы"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Credentials Display Section */}
                      <div className="space-y-2 text-xs">
                        {/* Login (Phone) */}
                        <div className="flex items-center justify-between bg-black/40 px-3 py-2.5 rounded-xl border border-white/5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Логин (Телефон):</span>
                            <span className="font-mono text-white text-xs font-bold">{formatPhone(worker.phone)}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(worker.phone, `phone-${worker.id}`)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                            title="Скопировать логин"
                          >
                            {copiedKey === `phone-${worker.id}` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Password / Access Status */}
                        <div className="flex items-center justify-between bg-black/40 px-3 py-2.5 rounded-xl border border-white/5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Пароль / Доступ:</span>
                            <span className="font-mono text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5" /> Защищён (хэш)
                            </span>
                          </div>
                          <button
                            onClick={() => openEditModal(worker)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                            title="Сменить пароль сотрудника"
                          >
                            <Key className="h-3 w-3" /> Сменить
                          </button>
                        </div>

                        {/* Footer info */}
                        <div className="flex items-center justify-between text-[10px] text-white/30 pt-1">
                          <span>ID: {worker.id.slice(0, 10)}...</span>
                          <span>{worker.createdAt ? new Date(worker.createdAt).toLocaleDateString('ru-RU') : ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Worker / User Account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-panda-charcoal border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-panda-orange/15 text-panda-orange flex items-center justify-center border border-panda-orange/30">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-white text-lg">Внести Человека в Базу</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1 font-semibold">ФИО / Имя пользователя:</label>
                <input
                  type="text"
                  required
                  placeholder="например, Алексей Смирнов"
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-panda-orange"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Номер телефона (Логин):</label>
                <input
                  type="text"
                  required
                  placeholder="+7 (999) 000-00-00"
                  value={newWorkerPhone}
                  onChange={e => setNewWorkerPhone(formatPhone(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-panda-orange"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Должность (Роль):</label>
                <select
                  value={newWorkerRole}
                  onChange={e => setNewWorkerRole(e.target.value as WorkerRole)}
                  className="w-full bg-panda-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-panda-orange"
                >
                  <option value="chef">Шеф-Повар (Экран Кухни)</option>
                  <option value="courier">Курьер (Экран Доставки)</option>
                  <option value="manager">Менеджер Смены</option>
                  <option value="owner">Владелец бизнеса</option>
                  <option value="admin">Администратор</option>
                  <option value="client">Клиент (Покупатель)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Пароль / Ключ доступа:</label>
                <input
                  type="text"
                  required
                  placeholder="Любой пароль или ПИН-код"
                  value={newWorkerPin}
                  onChange={e => setNewWorkerPin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono tracking-wider focus:outline-none focus:border-panda-orange"
                />
                <p className="text-[11px] text-white/40 mt-1">Этот пароль будет отображаться вам в панели в открытом виде.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-panda-orange text-white font-extrabold shadow-lg hover:bg-panda-orange-hover cursor-pointer"
                >
                  Создать и сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Worker / User Account */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-panda-charcoal border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Edit3 className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-white text-lg">Редактирование Профиля</h3>
              </div>
              <button
                onClick={() => setEditingWorker(null)}
                className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditWorker} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1 font-semibold">ФИО / Имя пользователя:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-panda-orange"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Телефон (Логин):</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(formatPhone(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-panda-orange"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Должность (Роль):</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as WorkerRole)}
                  className="w-full bg-panda-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-panda-orange"
                >
                  <option value="chef">Шеф-Повар (Экран Кухни)</option>
                  <option value="courier">Курьер (Экран Доставки)</option>
                  <option value="manager">Менеджер Смены</option>
                  <option value="owner">Владелец бизнеса</option>
                  <option value="admin">Администратор</option>
                  <option value="client">Клиент (Покупатель)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Статус аккаунта:</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as 'active' | 'blocked')}
                  className="w-full bg-panda-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-panda-orange"
                >
                  <option value="active">Активен (доступ разрешен)</option>
                  <option value="blocked">Заблокирован (доступ закрыт)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold">Пароль / ПИН-код:</label>
                <input
                  type="text"
                  value={editPin}
                  onChange={e => setEditPin(e.target.value)}
                  placeholder="Введите новый пароль или оставьте прежний"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono tracking-wider focus:outline-none focus:border-panda-orange"
                />
                <p className="text-[11px] text-white/40 mt-1">Оставьте пустым, если не хотите менять текущий пароль.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-panda-orange text-white font-extrabold shadow-lg hover:bg-panda-orange-hover cursor-pointer"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

