import React, { useRef, useState } from 'react';
import { Printer, X, Copy, Check } from 'lucide-react';
import { Order } from '../types';
import { rublesToWords, formatOrder1CNumber } from '../utils/russianWords';

interface Receipt1CProps {
  order: Order;
  onClose?: () => void;
  isModal?: boolean;
}

export function formatRub(amount: number): string {
  return (amount || 0).toFixed(2).replace('.', ',');
}

export function generate1CReceiptRawHtml(order: Order): string {
  const orderDate = new Date(order.createdAt || Date.now());
  const dateFormatted = orderDate.toLocaleDateString('ru-RU');
  
  const readyDate = new Date(order.createdAt + 35 * 60 * 1000);
  const deliveryDate = new Date(order.createdAt + 60 * 60 * 1000);

  const readyTimeStr = readyDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const deliveryTimeStr = deliveryDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const readyDateFormatted = readyDate.toLocaleDateString('ru-RU');
  const deliveryDateFormatted = deliveryDate.toLocaleDateString('ru-RU');

  const order1CNum = formatOrder1CNumber(order.id, order.createdAt);
  const wordsAmount = rublesToWords(order.total);

  const isOnlinePaid = order.paymentMethod === 'online_mock';
  const prepayment = isOnlinePaid ? order.total : 0;
  const clientDebt = isOnlinePaid ? 0 : order.total;

  const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const formatItemName = (name: string, weight?: number) => {
    const cleanName = name.replace(/^["']|["']$/g, '');
    const weightSuffix = weight ? ` ${weight}г` : '';
    return `"${cleanName}"${weightSuffix} (шт)`;
  };

  const addressLine = order.type === 'delivery' && order.address
    ? `ул. ${order.address.street || ''}, д. ${order.address.house || ''}${order.address.apartment ? `, кв. ${order.address.apartment}` : ''}${order.address.entrance ? `, под. ${order.address.entrance}` : ''}${order.address.floor ? `, эт. ${order.address.floor}` : ''}`
    : (order.pickupLocation || 'пр-т. Калинина 116');

  return `
    <div class="receipt-1c-sheet" style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.25; color: #000; background: #fff; width: 100%; max-width: 720px; margin: 0 auto; box-sizing: border-box;">
      
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- ─── SECTION 1: НАКЛАДНАЯ (ЗАКАЗ) ─────────────────────────────── -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div style="margin-bottom: 2px;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 2px;">
          <tr>
            <td style="vertical-align: top; font-size: 10.5px; line-height: 1.35; padding: 0;">
              <div>Поставщик: <u>ИП Меликишвили К.Г. / СУШИ ПАНДА (PandaBAR)</u></div>
              <div>Адрес: <u>г. Барнаул, ул. Власихинская, 103 (пр-т. Калинина 116)</u></div>
              <div>Телефон: <u>600-417, +7 (983) 352-69-72</u></div>
            </td>
            <td style="vertical-align: top; text-align: right; font-size: 11px; font-weight: bold; white-space: nowrap; padding: 0;">
              Доставка: ${deliveryDateFormatted} ${deliveryTimeStr}
            </td>
          </tr>
        </table>

        <div style="text-align: center; font-weight: bold; font-size: 13px; margin: 3px 0 5px 0;">
          ЗАКАЗ № ${order1CNum} от ${dateFormatted}
        </div>

        <div style="font-size: 10.5px; line-height: 1.35; margin-bottom: 5px;">
          <div>Покупатель: <u>${order.userName || 'Гость'}</u></div>
          <div>Адрес: <u>${addressLine}</u></div>
          <div>Телефон: <u>${order.userPhone || ''}</u></div>
          <div>Примечание: <u>${order.notes || ''}</u></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10.5px;">
          <thead>
            <tr style="border-bottom: 1px solid #000; font-weight: bold; background: #fafafa;">
              <th style="border: 1px solid #000; padding: 2px 4px; width: 28px; text-align: center;">№</th>
              <th style="border: 1px solid #000; padding: 2px 6px; text-align: center;">Товар</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 80px; text-align: center;">Количество</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 65px; text-align: center;">Цена</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 75px; text-align: center;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr>
                <td style="border: 1px solid #000; padding: 2px 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: left;">${formatItemName(item.product.name, item.product.weight)}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(item.product.price)}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(item.product.price * item.quantity)}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="2" style="border: 1px solid #000; border-right: none; padding: 2px 6px; text-align: right;">Итого по заказу:</td>
              <td style="border: 1px solid #000; border-left: none; border-right: none; padding: 2px 6px; text-align: center;">${totalQuantity}</td>
              <td style="border: 1px solid #000; border-left: none; border-right: none; padding: 2px 6px; text-align: right;"></td>
              <td style="border: 1px solid #000; border-left: none; padding: 2px 6px; text-align: right;">${formatRub(order.total)}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-size: 10.5px; margin-top: 6px;">
          На сумму: &nbsp;&nbsp;&nbsp;&nbsp;<strong>${wordsAmount}</strong>
        </div>

        <div style="margin-top: 10px; text-align: right; font-size: 10.5px;">
          Покупатель: _____________________________________
        </div>
      </div>

      <!-- ─── PERFORATION LINE 1 ─── -->
      <div style="border-top: 1px dashed #777; margin: 12px 0 8px 0;"></div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- ─── SECTION 2: ТОВАРНЫЙ ЧЕК ─────────────────────────────────── -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div style="margin-bottom: 2px;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 2px;">
          <tr>
            <td style="vertical-align: top; font-size: 10.5px; line-height: 1.35; padding: 0;">
              <div>Поставщик: <u>ИП Меликишвили К.Г. / СУШИ ПАНДА (PandaBAR)</u></div>
              <div>Адрес: <u>г. Барнаул, ул. Власихинская, 103 (пр-т. Калинина 116)</u></div>
              <div>Телефон: <u>600-417, +7 (983) 352-69-72</u></div>
            </td>
            <td style="vertical-align: top; text-align: right; font-size: 11px; font-weight: bold; white-space: nowrap; padding: 0;">
              ТОВАРНЫЙ ЧЕК № ${order1CNum} от ${dateFormatted}
            </td>
          </tr>
        </table>

        <div style="font-size: 10.5px; line-height: 1.35; margin-bottom: 5px;">
          <div>Покупатель: <u>${order.userName || 'Гость'}</u></div>
          <div>Примечание: <u>${order.notes || ''}</u></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10.5px;">
          <thead>
            <tr style="border-bottom: 1px solid #000; font-weight: bold; background: #fafafa;">
              <th style="border: 1px solid #000; padding: 2px 4px; width: 28px; text-align: center;">№</th>
              <th style="border: 1px solid #000; padding: 2px 6px; text-align: center;">Товар</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 80px; text-align: center;">Количество</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 65px; text-align: center;">Цена</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 75px; text-align: center;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr>
                <td style="border: 1px solid #000; padding: 2px 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: left;">${formatItemName(item.product.name, item.product.weight)}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(item.product.price)}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(item.product.price * item.quantity)}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="4" style="border: 1px solid #000; padding: 2px 6px; text-align: right;">Итого по заказу:</td>
              <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(order.total)}</td>
            </tr>
            <tr>
              <td colspan="4" style="border: 1px solid #000; padding: 2px 6px; text-align: right;">Предоплата:</td>
              <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(prepayment)}</td>
            </tr>
            <tr>
              <td colspan="4" style="border: 1px solid #000; padding: 2px 6px; text-align: right;">Долг клиента на ${dateFormatted}:</td>
              <td style="border: 1px solid #000; padding: 2px 6px; text-align: right;">${formatRub(clientDebt)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 10px; text-align: right; font-size: 10.5px;">
          Покупатель: _____________________________________
        </div>
      </div>

      <!-- ─── PERFORATION LINE 2 ─── -->
      <div style="border-top: 1px dashed #777; margin: 12px 0 8px 0;"></div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- ─── SECTION 3: ЗАЯВКА ДЛЯ ЦЕХА ───────────────────────────────── -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div>
        <div style="text-align: right; font-size: 11px; font-weight: bold; margin-bottom: 2px;">
          Готовность: ${readyDateFormatted} ${readyTimeStr}
        </div>

        <div style="text-align: center; font-weight: bold; font-size: 13px; margin: 0 0 5px 0;">
          ЗАЯВКА ДЛЯ ЦЕХА № ${order1CNum} от ${dateFormatted}
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10.5px;">
          <thead>
            <tr style="border-bottom: 1px solid #000; font-weight: bold; background: #fafafa;">
              <th style="border: 1px solid #000; padding: 2px 4px; width: 28px; text-align: center;">№</th>
              <th style="border: 1px solid #000; padding: 2px 6px; text-align: center;">Товар</th>
              <th style="border: 1px solid #000; padding: 2px 6px; width: 100px; text-align: center;">Количество</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr>
                <td style="border: 1px solid #000; padding: 2px 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: left; font-weight: 500;">${formatItemName(item.product.name, item.product.weight)}</td>
                <td style="border: 1px solid #000; padding: 2px 6px; text-align: center; font-weight: bold;">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function Receipt1C({ order, onClose, isModal = true }: Receipt1CProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const order1CNum = formatOrder1CNumber(order.id, order.createdAt);

  const handlePrint = () => {
    // Bulletproof printing via hidden isolated iframe
    const rawHtml = generate1CReceiptRawHtml(order);
    
    // Remove existing print iframes if any
    const existing = document.getElementById('print-receipt-iframe');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-receipt-iframe';
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
          <title>Накладная 1С - Заказ № ${order1CNum}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 10mm;
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
              line-height: 1.25;
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table {
              border-collapse: collapse;
            }
            u {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          ${rawHtml}
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

  const handleCopyText = () => {
    if (!receiptRef.current) return;
    navigator.clipboard.writeText(receiptRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderedHtml = generate1CReceiptRawHtml(order);

  const receiptElement = (
    <div 
      ref={receiptRef}
      className="receipt-1c-preview bg-white text-black p-5 sm:p-6 max-w-[660px] mx-auto shadow-2xl rounded-xl border border-neutral-200 select-text"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );

  if (!isModal) {
    return receiptElement;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-panda-charcoal border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[96vh] flex flex-col my-auto">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-panda-orange/10 text-panda-orange flex items-center justify-center">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base">Бланк накладной (Формат 1С 3-в-1)</h3>
              <p className="text-xs text-white/40">Заказ № {order1CNum} • Ровно 1 лист А4</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Скопировать текст"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-white/60" />}
              <span>{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-panda-orange/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Распечатать</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer ml-1"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-4 scrollbar-thin bg-neutral-900/60 rounded-2xl">
          {receiptElement}
        </div>
      </div>
    </div>
  );
}
