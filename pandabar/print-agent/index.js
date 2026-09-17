#!/usr/bin/env node

/**
 * 🐼 PandaBar Kitchen Print Agent (Замена 1С)
 * Автономный агент для автоматического перехвата и печати накладных на кухне
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags or env
const args = process.argv.slice(2);
function getArg(name, def) {
  const match = args.find(a => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1];
  return process.env[name.toUpperCase()] || def;
}

const SERVER_URL = (getArg('server', 'http://185.251.88.240:3000')).replace(/\/$/, '');
const PRINT_TOKEN = getArg('token', 'pandabar_print_secret_2026');
const POLL_INTERVAL_MS = parseInt(getArg('interval', '3000'), 10);
const OUTPUT_DIR = path.resolve(__dirname, getArg('output', 'print_output'));

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('\n============================================================');
console.log('🐼 PandaBar Kitchen Print Agent (Замена 1С)');
console.log('============================================================');
console.log(`🌐 Сервер:          ${SERVER_URL}`);
console.log(`🔑 Токен:           ${PRINT_TOKEN.substring(0, 8)}...`);
console.log(`📂 Папка картинок:  ${OUTPUT_DIR}`);
console.log(`⏱️ Интервал опроса: ${POLL_INTERVAL_MS / 1000} сек.`);
console.log('============================================================\n');

let isProcessing = false;
const printedOrderIds = new Set();

// Load existing printed history from disk
const historyFile = path.join(OUTPUT_DIR, '.printed_history.json');
if (fs.existsSync(historyFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    if (Array.isArray(data)) {
      data.forEach(id => printedOrderIds.add(id));
    }
  } catch (e) {}
}

function saveHistory() {
  try {
    fs.writeFileSync(historyFile, JSON.stringify(Array.from(printedOrderIds)), 'utf8');
  } catch (e) {}
}

async function request(endpoint, options = {}) {
  const url = `${SERVER_URL}${endpoint}`;
  const isHttps = url.startsWith('https://');
  const lib = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(url, {
      ...options,
      headers: {
        'x-print-token': PRINT_TOKEN,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } else {
            resolve({ status: res.statusCode, text: data, buffer: Buffer.from(data) });
          }
        } catch (err) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function renderAsciiReceipt(order) {
  const dateStr = new Date(order.createdAt).toLocaleDateString('ru-RU');
  const timeStr = new Date(order.createdAt).toLocaleTimeString('ru-RU');
  const order1CNum = order.id.replace(/\D/g, '').slice(-5) || '00001';

  let txt = `
============================================================
              ПАНДА доставка готовых блюд
          пр-т. Калинина 116 | тел. 600-417
============================================================
           ЗАКАЗ № ${order1CNum} от ${dateStr} ${timeStr}
------------------------------------------------------------
Покупатель: ${order.userName || 'Клиент'}
Телефон:    ${order.userPhone}
Тип заказа: ${order.type === 'delivery' ? 'ДОСТАВКА' : 'САМОВЫВОЗ'}
`;

  if (order.type === 'delivery' && order.address) {
    txt += `Адрес:      ул. ${order.address.street}, д. ${order.address.house}${order.address.apartment ? `, кв. ${order.address.apartment}` : ''}\n`;
  }

  if (order.notes) {
    txt += `Примечание: ${order.notes}\n`;
  }

  txt += `------------------------------------------------------------
№  Товар                                 Кол.  Цена    Сумма
------------------------------------------------------------\n`;

  order.items.forEach((item, idx) => {
    const num = (idx + 1).toString().padEnd(3);
    const name = item.product.name.substring(0, 36).padEnd(37);
    const qty = item.quantity.toString().padStart(4);
    const price = item.product.price.toFixed(2).padStart(8);
    const sum = (item.product.price * item.quantity).toFixed(2).padStart(8);
    txt += `${num}${name}${qty}${price}${sum}\n`;
  });

  txt += `------------------------------------------------------------
ИТОГО ПО ЗАКАЗУ:                                   ${order.total.toFixed(2)} руб.
============================================================

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
                  ✂ ЛИНИЯ ОТРЕЗА ДЛЯ ЦЕХА
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

============================================================
                ЗАЯВКА ДЛЯ ЦЕХА № ${order1CNum}
              Время заказа: ${dateStr} ${timeStr}
============================================================\n`;

  order.items.forEach((item, idx) => {
    txt += `  [ ] ${idx + 1}. ${item.product.name}  --->  ${item.quantity} шт.\n`;
  });

  txt += `============================================================\n\n`;
  return txt;
}

function renderHtmlReceipt(order) {
  const dateStr = new Date(order.createdAt).toLocaleDateString('ru-RU');
  const timeStr = new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const readyTimeStr = new Date(order.createdAt + 35 * 60 * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const order1CNum = order.id.replace(/\D/g, '').slice(-5) || '00001';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Накладная 1С - Заказ #${order1CNum}</title>
  <style>
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      line-height: 1.3;
      margin: 0;
      padding: 15px;
      background: white;
      color: black;
      width: 580px;
    }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th, td { border: 1px solid black; padding: 4px 6px; }
    th { background: #f0f0f0; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .border-box { border: 1px solid black; padding: 4px 8px; }
    .cut-line {
      border-top: 2px dashed #999;
      margin: 20px 0;
      text-align: center;
      position: relative;
    }
    .cut-line span {
      background: white;
      padding: 0 10px;
      position: relative;
      top: -9px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <!-- БЛОК 1: НАКЛАДНАЯ -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <div class="bold">Поставщик: <u>ПАНДА доставка готовых блюд</u></div>
      <div>Адрес: <u>пр-т. Калинина 116</u></div>
      <div>Телефон: <u>600-417 8-983-352-69-72 www.pandabar.ru</u></div>
    </div>
    <div class="border-box bold">
      ${order.type === 'delivery' ? 'Доставка' : 'Самовывоз'}: ${dateStr} ${timeStr}
    </div>
  </div>

  <div class="text-center bold" style="font-size: 14px; margin: 10px 0;">
    ЗАКАЗ № ${order1CNum} от ${dateStr}
  </div>

  <div>
    <div><span class="bold">Покупатель:</span> <u>${order.userName || 'Гость'}</u></div>
    <div><span class="bold">Телефон:</span> <u>${order.userPhone}</u></div>
    ${order.type === 'delivery' && order.address ? `<div><span class="bold">Адрес:</span> <u>ул. ${order.address.street}, д. ${order.address.house}${order.address.apartment ? `, кв. ${order.address.apartment}` : ''}</u></div>` : ''}
    ${order.notes ? `<div><span class="bold">Примечание:</span> <i>${order.notes}</i></div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 30px;">№</th>
        <th>Товар</th>
        <th style="width: 70px;">Кол-во</th>
        <th style="width: 70px;">Цена</th>
        <th style="width: 80px;">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((it, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="bold">"${it.product.name}" (шт)</td>
          <td class="text-center">${it.quantity}</td>
          <td class="text-right">${it.product.price.toFixed(2)}</td>
          <td class="text-right bold">${(it.product.price * it.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr class="bold">
        <td colspan="4" class="text-right">Итого по заказу:</td>
        <td class="text-right">${order.total.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 15px; text-align: right;">
    Покупатель: ________________________ (подпись)
  </div>

  <div class="cut-line"><span>✂ линия отреза для кухни</span></div>

  <!-- БЛОК 3: ЗАЯВКА ДЛЯ ЦЕХА -->
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div class="bold" style="font-size: 13px;">ЦЕХ / КУХНЯ</div>
    <div class="border-box bold" style="border: 2px solid black;">
      Готовность: ${dateStr} ${readyTimeStr}
    </div>
  </div>

  <div class="text-center bold" style="font-size: 14px; margin: 10px 0;">
    ЗАЯВКА ДЛЯ ЦЕХА № ${order1CNum} от ${dateStr}
  </div>

  ${order.notes ? `<div style="border: 1px solid black; padding: 6px; background: #fffbe6; margin-bottom: 8px;"><strong>⚠️ Комментарий кухни:</strong> ${order.notes}</div>` : ''}

  <table style="border: 2px solid black;">
    <thead>
      <tr style="border-bottom: 2px solid black; background: #ddd;">
        <th style="width: 40px;">№</th>
        <th>Товар (Наименование блюда)</th>
        <th style="width: 100px;">Количество</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((it, idx) => `
        <tr>
          <td class="text-center bold">${idx + 1}</td>
          <td class="bold" style="font-size: 14px;">"${it.product.name}"</td>
          <td class="text-center bold" style="font-size: 16px;">${it.quantity} шт.</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

async function processNewOrder(order) {
  const order1CNum = order.id.replace(/\D/g, '').slice(-5) || '00001';
  const filePrefix = `order_${order1CNum}_${Date.now()}`;
  
  const txtPath = path.join(OUTPUT_DIR, `${filePrefix}.txt`);
  const htmlPath = path.join(OUTPUT_DIR, `${filePrefix}.html`);

  const asciiReceipt = renderAsciiReceipt(order);
  const htmlReceipt = renderHtmlReceipt(order);

  fs.writeFileSync(txtPath, asciiReceipt, 'utf8');
  fs.writeFileSync(htmlPath, htmlReceipt, 'utf8');

  printedOrderIds.add(order.id);
  saveHistory();

  console.log(`\n🖨️ [НОВЫЙ ЗАКАЗ] #${order1CNum} от ${order.userName || 'Клиент'} (${order.total} ₽)`);
  console.log(`   📄 Накладная сохранена: ${htmlPath}`);
  console.log(`   📄 Текстовый чек:      ${txtPath}`);
  console.log(`   ⏱️ Время поступления:   ${new Date().toLocaleTimeString('ru-RU')}`);

  // Send acknowledgement to server
  try {
    await request('/api/print-agent/ack', {
      method: 'POST',
      body: { orderId: order.id, status: 'printed', file: `${filePrefix}.html` }
    });
  } catch (err) {}
}

async function checkPendingOrders() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const res = await request('/api/print-agent/pending');
    if (res.status === 200 && res.data?.success && Array.isArray(res.data.orders)) {
      for (const order of res.data.orders) {
        if (!printedOrderIds.has(order.id)) {
          await processNewOrder(order);
        }
      }
    }
  } catch (err) {
    // Network offline or server restart, retry silently
  } finally {
    isProcessing = false;
  }
}

// Initial check & interval polling
checkPendingOrders();
setInterval(checkPendingOrders, POLL_INTERVAL_MS);

// Send periodic heartbeat
setInterval(async () => {
  try {
    await request('/api/print-agent/heartbeat', {
      method: 'POST',
      body: { hostname: 'Kitchen-POS', time: Date.now() }
    });
  } catch (e) {}
}, 10000);
