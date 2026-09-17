document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. GOOGLE CHROME STYLE SCROLL PROGRESS BAR
  // ==========================================================================
  const scrollProgressBar = document.getElementById('scroll-progress');
  let ticking = false;

  const updateScrollProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
      if (scrollProgressBar) {
        scrollProgressBar.style.transform = `scaleX(${progress})`;
      }
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }, { passive: true });

  updateScrollProgress();

  // ==========================================================================
  // 2. GOOGLE CHROME PROMO REVEAL ANIMATIONS (IntersectionObserver)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.chrome-reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // ==========================================================================
  // 3. SMOOTH NAVIGATION FOR ANCHOR LINKS
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ==========================================================================
  // 4. TOAST NOTIFICATION HELPER
  // ==========================================================================
  const toastNotify = document.getElementById('toast-notify');
  let toastTimer = null;

  const showToast = (message, duration = 2800) => {
    if (!toastNotify) return;
    toastNotify.textContent = message;
    toastNotify.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotify.classList.remove('show');
    }, duration);
  };

  // ==========================================================================
  // 5. PANDABAR INTERACTIVE WORKSTATION CONSOLE
  // ==========================================================================
  // Tab Switcher
  const modePills = document.querySelectorAll('#station-nav .mode-pill');
  const tabViews = document.querySelectorAll('.station-tab-view');

  const switchPandaTab = (tabName) => {
    modePills.forEach(pill => {
      if (pill.getAttribute('data-tab') === tabName) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    tabViews.forEach(view => {
      if (view.id === `tab-${tabName}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  };

  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tab = pill.getAttribute('data-tab');
      if (tab) switchPandaTab(tab);
    });
  });

  // Food Dishes Database & Cart State
  const DISHES_DB = {
    'california': { name: 'Калифорния с креветкой', price: 490, dept: 'Холодный цех' },
    'bonita': { name: 'Бонита Чиз', price: 440, dept: 'Холодный цех' },
    'baked-khokku': { name: 'Запеченный Хокку', price: 485, dept: 'Печь 220°C' },
    'baked-midii': { name: 'Запечённые мидии', price: 490, dept: 'Печь 220°C' }
  };

  // Initial cart: 1 Bonita (440) + 1 Baked Midii (490) = 930
  const cartState = {
    'bonita': 1,
    'baked-midii': 1
  };

  const FREE_DELIVERY_THRESHOLD = 1000;
  const STANDARD_DELIVERY_FEE = 150;

  // DOM elements for cart
  const cartItemCountEl = document.getElementById('cart-item-count');
  const cartTotalSumEl = document.getElementById('cart-total-sum');
  const deliveryProgressFill = document.getElementById('delivery-progress-fill');
  const deliveryProgressLabel = document.getElementById('delivery-progress-label');
  const checkoutTotalLabel = document.getElementById('checkout-total-label');
  const checkoutDeliveryLabel = document.getElementById('checkout-delivery-label');
  const btnSubmitOrder = document.getElementById('btn-submit-order');

  // Sync and render cart
  const renderCart = () => {
    let totalItems = 0;
    let totalSum = 0;

    for (const [id, count] of Object.entries(cartState)) {
      if (count > 0 && DISHES_DB[id]) {
        totalItems += count;
        totalSum += count * DISHES_DB[id].price;
      }
    }

    // Update Counts and sums
    if (cartItemCountEl) cartItemCountEl.textContent = totalItems;
    if (cartTotalSumEl) cartTotalSumEl.textContent = totalSum.toLocaleString('ru-RU');
    if (checkoutTotalLabel) checkoutTotalLabel.textContent = `${totalSum.toLocaleString('ru-RU')} RUB`;

    // Free delivery calculation
    const isFreeDelivery = totalSum >= FREE_DELIVERY_THRESHOLD;
    const deliveryFee = totalItems === 0 ? 0 : (isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE);

    if (checkoutDeliveryLabel) {
      checkoutDeliveryLabel.textContent = isFreeDelivery ? '0 RUB (Бесплатно)' : `${deliveryFee} RUB`;
    }

    const progressPct = Math.min(100, Math.round((totalSum / FREE_DELIVERY_THRESHOLD) * 100));
    if (deliveryProgressFill) {
      deliveryProgressFill.style.width = `${progressPct}%`;
      deliveryProgressFill.style.backgroundColor = isFreeDelivery ? '#10b981' : '#e11d48';
    }

    if (deliveryProgressLabel) {
      if (isFreeDelivery) {
        deliveryProgressLabel.innerHTML = '<span style="color:#34d399; font-weight:700;">Бесплатная доставка активирована!</span>';
      } else {
        const diff = FREE_DELIVERY_THRESHOLD - totalSum;
        deliveryProgressLabel.innerHTML = `До бесплатной доставки осталось: <strong>${diff} RUB</strong>`;
      }
    }

    // Update individual dish buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      const dishId = btn.getAttribute('data-dish');
      const count = cartState[dishId] || 0;
      if (count > 0) {
        btn.classList.add('in-cart');
        btn.innerHTML = `&#10003; В корзине (${count})`;
      } else {
        btn.classList.remove('in-cart');
        btn.innerHTML = '+ В корзину';
      }
    });

    // Update 1C Receipt
    renderThermalReceipt(totalSum, deliveryFee);
  };

  // Add to cart click event
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dishId = btn.getAttribute('data-dish');
      if (!dishId || !DISHES_DB[dishId]) return;

      const currentCount = cartState[dishId] || 0;
      // Cycle: 0 -> 1 -> 2 -> 3 -> 0 (or increment up to 3)
      if (currentCount >= 3) {
        delete cartState[dishId];
        showToast(`Позиция «${DISHES_DB[dishId].name}» удалена из корзины`);
      } else {
        cartState[dishId] = currentCount + 1;
        showToast(`«${DISHES_DB[dishId].name}» добавлено (${cartState[dishId]} шт.)`);
      }

      renderCart();
    });
  });

  // Render 1C Thermal Receipt
  const renderThermalReceipt = (itemsSum, deliveryFee) => {
    const receiptPositions = document.getElementById('receipt-positions');
    const receiptTotalVal = document.getElementById('receipt-total-val');
    if (!receiptPositions) return;

    let rowsHtml = '';
    let idx = 1;

    for (const [id, count] of Object.entries(cartState)) {
      if (count > 0 && DISHES_DB[id]) {
        const item = DISHES_DB[id];
        const lineTotal = (item.price * count).toFixed(2);
        rowsHtml += `<div class="tape-row"><span>${idx}. ${item.name} (${count} шт)</span> <span>${lineTotal}</span></div>`;
        idx++;
      }
    }

    if (deliveryFee > 0) {
      rowsHtml += `<div class="tape-row"><span>${idx}. Доставка курьером</span> <span>${deliveryFee.toFixed(2)}</span></div>`;
    } else if (itemsSum > 0) {
      rowsHtml += `<div class="tape-row"><span>${idx}. Доставка курьером (Акция)</span> <span>0.00</span></div>`;
    }

    receiptPositions.innerHTML = rowsHtml || '<div class="tape-row"><span>Корзина пуста</span><span>0.00</span></div>';

    const grandTotal = (itemsSum + deliveryFee).toFixed(2);
    if (receiptTotalVal) {
      receiptTotalVal.textContent = `${grandTotal} RUB`;
    }
  };

  // KDS Live Timer State
  let kdsSeconds = 42;
  let kdsInterval = null;
  const timerEl = document.getElementById('timer-106');

  const startKdsTimer = () => {
    clearInterval(kdsInterval);
    kdsInterval = setInterval(() => {
      kdsSeconds++;
      const mins = String(Math.floor(kdsSeconds / 60)).padStart(2, '0');
      const secs = String(kdsSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  };

  startKdsTimer();

  // Submit Order from Storefront to KDS
  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener('click', () => {
      // Sync items to KDS ticket
      const kdsItemsEl = document.getElementById('kds-items-106');
      if (kdsItemsEl) {
        let itemsHtml = '';
        for (const [id, count] of Object.entries(cartState)) {
          if (count > 0 && DISHES_DB[id]) {
            const item = DISHES_DB[id];
            itemsHtml += `<div class="kds-item-row">&bull; ${count}x ${item.name} [${item.dept}]</div>`;
          }
        }
        if (!itemsHtml) {
          itemsHtml = '<div class="kds-item-row">&bull; 1x Бонита Чиз [Холодный цех]</div><div class="kds-item-row">&bull; 1x Запечённые мидии [Печь 220°C]</div>';
        }
        kdsItemsEl.innerHTML = itemsHtml;
      }

      // Reset ticket timer to 00:01
      kdsSeconds = 1;
      if (timerEl) timerEl.textContent = '00:01';
      startKdsTimer();

      // Switch to KDS tab
      switchPandaTab('kds');

      // Highlight KDS ticket
      const ticket106 = document.getElementById('kds-ticket-106');
      if (ticket106) {
        ticket106.classList.remove('fresh-alert');
        void ticket106.offsetWidth; // trigger reflow
        ticket106.classList.add('fresh-alert');
      }

      showToast('Заказ #106 передан в KDS кухни за 0.8 сек!');
    });
  }

  // KDS Action Toggle Button
  const btnKdsToggle = document.getElementById('btn-kds-toggle-106');
  let kdsStatusStep = 0; // 0: В РАБОТУ, 1: ГОТОВИТСЯ (ШЕФ), 2: ГОТОВО К ВЫДАЧЕ

  if (btnKdsToggle) {
    btnKdsToggle.addEventListener('click', () => {
      kdsStatusStep = (kdsStatusStep + 1) % 3;

      if (kdsStatusStep === 1) {
        btnKdsToggle.textContent = 'ГОТОВИТСЯ (ШЕФ)';
        btnKdsToggle.className = 'btn-kds-action';
        btnKdsToggle.style.background = '#f59e0b';
        btnKdsToggle.style.color = '#000';
        showToast('Чек #106: Повар подтвердил начало готовки');
      } else if (kdsStatusStep === 2) {
        btnKdsToggle.textContent = 'ГОТОВО К ВЫДАЧЕ';
        btnKdsToggle.className = 'btn-kds-action btn-kds-ready';
        btnKdsToggle.style.background = '';
        btnKdsToggle.style.color = '';
        clearInterval(kdsInterval);
        showToast('Чек #106 собран и упакован! Передается курьеру.');
      } else {
        btnKdsToggle.textContent = 'В РАБОТУ';
        btnKdsToggle.className = 'btn-kds-action btn-kds-start';
        btnKdsToggle.style.background = '';
        btnKdsToggle.style.color = '';
        startKdsTimer();
      }
    });
  }

  // 1C Receipt Print Button Simulation
  const btnPrintReceipt = document.getElementById('btn-print-receipt');
  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener('click', () => {
      const tape = document.querySelector('.thermal-tape');
      if (tape) {
        tape.style.transform = 'scale(0.98)';
        tape.style.boxShadow = '0 0 20px rgba(225, 29, 72, 0.4)';
        setTimeout(() => {
          tape.style.transform = '';
          tape.style.boxShadow = '';
        }, 400);
      }
      showToast('Эмуляция: Накладная #106 напечатана на ленте 80мм (ESC/POS)');
    });
  }

  // Courier Delivered Button
  const btnCourierDelivered = document.getElementById('btn-courier-delivered');
  if (btnCourierDelivered) {
    btnCourierDelivered.addEventListener('click', () => {
      btnCourierDelivered.textContent = '✓ Доставлено клиенту';
      btnCourierDelivered.style.background = '#10b981';
      btnCourierDelivered.style.color = '#fff';
      const badge = document.querySelector('.courier-badge');
      if (badge) {
        badge.textContent = 'Выполнено';
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
      }
      showToast('Заказ #106 успешно завершен и отмечен в базе!');
    });
  }

  // Initial cart calculation
  renderCart();

  // ==========================================================================
  // 6. TELEGRAM BOT SIMULATOR
  // ==========================================================================
  const tgScenarioButtons = document.querySelectorAll('.tg-k-btn');
  const tgBubbleContainer = document.getElementById('tg-bubble-container');

  const TG_SCENARIOS = {
    shop: `<strong>Корзина заказа #104:</strong><br>
           - Сет Самурай XXL (1 шт) &bull; 1 490 ₽<br>
           - Морс брусничный (2 шт) &bull; 280 ₽<br>
           ------------------------------------<br>
           Итого: <strong>1 770 ₽</strong> (Доставка: 0 ₽)<br>
           <span class="c-accent">Статус: В обработке ботом</span>
           <div style="margin-top:10px; display:flex; gap:8px;">
             <span style="background:rgba(225,29,72,0.2); border:1px solid #e11d48; color:#fff; padding:3px 10px; border-radius:6px; font-size:0.75rem;">Оплатить картой</span>
             <span style="background:rgba(255,255,255,0.06); color:#a1a1aa; padding:3px 10px; border-radius:6px; font-size:0.75rem;">Изменить</span>
           </div>`,

    booking: `<strong>Бронирование слота:</strong><br>
              Услуга: <em>Архитектурный аудит и оценка проекта</em><br>
              Дата: <strong>Сегодня / Ближайший слот</strong><br>
              Время: <strong>15:30 (МСК)</strong><br>
              Слот временно зарезервирован.<br>
              <div style="margin-top:10px; display:flex; gap:8px;">
                <span style="background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; padding:3px 10px; border-radius:6px; font-size:0.75rem;">Подтвердить слот</span>
                <span style="background:rgba(255,255,255,0.06); color:#a1a1aa; padding:3px 10px; border-radius:6px; font-size:0.75rem;">Выбрать другой день</span>
              </div>`,

    quote: `<strong>Калькулятор сметы IT:</strong><br>
            - Продукт: <em>Web-витрина + KDS + Telegram-бот</em><br>
            - Стек: React 19, Python aiogram 3.x, SQLite<br>
            - Срок реализации: <strong>14-21 день</strong><br>
            - Оценка трудоемкости: <strong>80-110 часов</strong><br>
            <div style="margin-top:10px;">
              <a href="https://t.me/g1ghtik?text=Здравствуйте!%20Хочу%20получить%20смету%20на%20разработку" target="_blank" rel="noopener noreferrer" style="color:#e11d48; text-decoration:none; font-weight:700; font-size:0.82rem;">
                Получить точный расчет в Telegram (@g1ghtik) &rarr;
              </a>
            </div>`,

    admin: `<strong>Панель администратора:</strong><br>
            - Пользователей в боте: <strong>1 420 чел.</strong><br>
            - Оформлено заказов за сегодня: <strong>38 шт.</strong><br>
            - Дневная выручка: <strong>54 800 RUB</strong><br>
            - Нагрузка CPU / RAM: <strong>12% / 180MB</strong><br>
            <div style="margin-top:10px; display:flex; gap:8px;">
              <span style="background:rgba(255,255,255,0.06); color:#fff; padding:3px 10px; border-radius:6px; font-size:0.75rem;">Экспорт CSV</span>
              <span style="background:rgba(225,29,72,0.2); border:1px solid #e11d48; color:#fff; padding:3px 10px; border-radius:6px; font-size:0.75rem;">Рассылка</span>
            </div>`
  };

  // Set phone status bar clock to live local time
  const phoneTimeEl = document.querySelector('.phone-time');
  if (phoneTimeEl) {
    const now = new Date();
    phoneTimeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  tgScenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tgScenarioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scenario = btn.getAttribute('data-scenario');
      if (tgBubbleContainer && TG_SCENARIOS[scenario]) {
        tgBubbleContainer.style.opacity = '0';
        tgBubbleContainer.style.transform = 'translateY(4px)';
        setTimeout(() => {
          tgBubbleContainer.innerHTML = TG_SCENARIOS[scenario];
          tgBubbleContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          tgBubbleContainer.style.opacity = '1';
          tgBubbleContainer.style.transform = 'translateY(0)';
        }, 60);

        const timeEl = document.querySelector('.tg-msg-time');
        if (timeEl) {
          const now = new Date();
          timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
      }
    });
  });

  // ==========================================================================
  // 7. OMNIPARSER CORE ENGINE (INTERACTIVE SCRAPER CONSOLE)
  // ==========================================================================
  const SCRAPER_DATA = {
    wb: {
      name: 'Wildberries',
      speed: '1 420 стр/мин',
      bypass: '99.8% Bypass',
      proxy: '185.220.101.45 (Residential)',
      count: '142 записи',
      logs: [
        { tag: 'info', text: 'Инициализация Playwright AsyncSession (Chromium TLS Fingerprint Chrome 130)' },
        { tag: 'proxy', text: 'Ротация резидентского IP -> 185.220.101.45:9050 [RU-MOW Residential Pool]' },
        { tag: 'shield', text: 'Cloudflare Turnstile Challenge обнаружен на wildberries.ru/catalog/...' },
        { tag: 'bypass', text: 'Cloudflare Turnstile успешно решен за 0.68с. Токен верификации получен.' },
        { tag: 'data', text: 'Извлечен каталог: 36 карточек (артикулы, цены WB Кошелька, остатки по складам)' },
        { tag: 'db', text: 'Пакетный Upsert 36 строк в PostgreSQL (0 дубликатов, транзакция зафиксирована)' },
        { tag: 'file', text: 'Сформирован отчет: wildberries_catalog_export.xlsx (36 строк, 8 колонок)' },
        { tag: 'success', text: 'Парсинг успешно завершен за 2.1с без блокировок и капчи!' }
      ],
      table: `
        <tr><td class="font-mono">WB-19842011</td><td>Робот-пылесос UltraClean X1</td><td class="font-mono text-crimson">18 490 ₽</td><td class="font-mono">-35%</td><td>Коледино (42 шт)</td><td><span class="badge-green">В наличии</span></td></tr>
        <tr><td class="font-mono">WB-20491823</td><td>Беспроводные наушники ProSound ANC</td><td class="font-mono text-crimson">4 990 ₽</td><td class="font-mono">-48%</td><td>Электросталь (118 шт)</td><td><span class="badge-green">В наличии</span></td></tr>
        <tr><td class="font-mono">WB-15093847</td><td>Умные часы AMOLED Titan Sport</td><td class="font-mono text-crimson">7 250 ₽</td><td class="font-mono">-22%</td><td>Казань (19 шт)</td><td><span class="badge-green">В наличии</span></td></tr>
        <tr><td class="font-mono">WB-38491024</td><td>Механическая клавиатура RGB Hot-Swap</td><td class="font-mono text-crimson">3 890 ₽</td><td class="font-mono">-40%</td><td>Санкт-Петербург (5 шт)</td><td><span class="badge-green">Мало</span></td></tr>
      `,
      json: `{\n  "status": "success",\n  "target": "wildberries.ru",\n  "proxy_used": "185.220.101.45:9050 (residential_pool_ru)",\n  "anti_bot_bypass": { "cloudflare_turnstile": true, "solve_time_sec": 0.68 },\n  "items_extracted": 36,\n  "sample_records": [\n    { "sku": "WB-19842011", "title": "Робот-пылесос UltraClean X1", "price": 18490, "stock": 42 }\n  ]\n}`
    },
    ozon: {
      name: 'Ozon',
      speed: '1 650 стр/мин',
      bypass: '99.9% Bypass',
      proxy: '94.130.12.88 (Mobile Pool 4G)',
      count: '280 записей',
      logs: [
        { tag: 'info', text: 'aiohttp Session инициализирована с подменой TLS JA3 / ClientHello' },
        { tag: 'proxy', text: 'Подключение мобильного прокси Мегафон (ротация каждые 30 сек)' },
        { tag: 'shield', text: 'Ozon Anti-Bot WAF WSS Socket авторизован' },
        { tag: 'data', text: 'Спарсено 48 карточек с ценами Ozon Карты и скидками 11.11' },
        { tag: 'db', text: 'Загрузка 48 записей в PostgreSQL (сравнение с ценами конкурентов)' },
        { tag: 'file', text: 'Генерация отчета ozon_price_monitor.xlsx (48 записей)' },
        { tag: 'success', text: 'Поток завершен без rate limit за 1.4с!' }
      ],
      table: `
        <tr><td class="font-mono">OZ-9942015</td><td>Кофемашина DeLonghi Magnifica S</td><td class="font-mono text-crimson">34 990 ₽</td><td class="font-mono">-28%</td><td>Ozon Хоругвино (24 шт)</td><td><span class="badge-green">В наличии</span></td></tr>
        <tr><td class="font-mono">OZ-8812903</td><td>Монитор 27" IPS 165Hz 2K Gaming</td><td class="font-mono text-crimson">16 790 ₽</td><td class="font-mono">-31%</td><td>Ozon Тверь (50 шт)</td><td><span class="badge-green">В наличии</span></td></tr>
        <tr><td class="font-mono">OZ-7734120</td><td>Планшет Pad Pro 11 256GB Wi-Fi</td><td class="font-mono text-crimson">42 490 ₽</td><td class="font-mono">-15%</td><td>Ozon Казань (12 шт)</td><td><span class="badge-green">В наличии</span></td></tr>
      `,
      json: `{\n  "status": "success",\n  "target": "ozon.ru",\n  "proxy_used": "94.130.12.88 (mobile_megafon_4g)",\n  "anti_bot_bypass": { "ozon_waf_passed": true, "session_time_sec": 1.41 },\n  "items_extracted": 48\n}`
    },
    avito: {
      name: 'Avito',
      speed: '980 стр/мин',
      bypass: '99.5% Bypass',
      proxy: '194.67.210.15 (Residential Static)',
      count: '84 объявления',
      logs: [
        { tag: 'info', text: 'Playwright Stealth + Headless Chromium запущен' },
        { tag: 'shield', text: 'Эмуляция движений мыши Bézier curves + WebGL Canvas Spoof' },
        { tag: 'data', text: 'Парсинг свежих объявлений: «Недвижимость / Аренда квартир»' },
        { tag: 'bypass', text: 'Деобфускация номера телефона: контакт +7 (921) ***-45-12 получен' },
        { tag: 'db', text: 'Запись 84 объявлений в SQLite базу данных' },
        { tag: 'success', text: 'Цикл завершен, Telegram-бот отправил 2 алерта по горячим ценам!' }
      ],
      table: `
        <tr><td class="font-mono">AV-4491028</td><td>Студия 32м² в ЖК «Новый Горизонт»</td><td class="font-mono text-crimson">42 000 ₽/мес</td><td class="font-mono">Свежее</td><td>Москва, м. Сокол</td><td><span class="badge-green">Активно</span></td></tr>
        <tr><td class="font-mono">AV-3918201</td><td>2-комн. квартира 64м² с ремонтом</td><td class="font-mono text-crimson">8 900 000 ₽</td><td class="font-mono">-7%</td><td>СПб, Приморский р-н</td><td><span class="badge-green">Активно</span></td></tr>
        <tr><td class="font-mono">AV-5501928</td><td>Toyota RAV4 2.5 AT 2021 (1 хоз)</td><td class="font-mono text-crimson">2 950 000 ₽</td><td class="font-mono">Срочно</td><td>Казань, Частное лицо</td><td><span class="badge-green">Активно</span></td></tr>
      `,
      json: `{\n  "status": "success",\n  "target": "avito.ru",\n  "proxy_used": "194.67.210.15 (residential_pool)",\n  "category": "real_estate",\n  "contacts_unlocked": 84\n}`
    },
    hh: {
      name: 'hh.ru',
      speed: '1 800 стр/мин',
      bypass: '100% Bypass',
      proxy: '45.142.214.10 (Datacenter High-Speed)',
      count: '310 резюме',
      logs: [
        { tag: 'info', text: 'Асинхронный сбор через HTTP/2 REST API' },
        { tag: 'data', text: 'Поиск кандидатов по фильтру: «Python Middle / Senior», «aiogram»' },
        { tag: 'bypass', text: 'Извлечение контактных данных: Telegram, WhatsApp, GitHub' },
        { tag: 'db', text: 'Импорт 310 валидных анкет в CRM / PostgreSQL' },
        { tag: 'file', text: 'Экспорт файла candidates_pool.xlsx' },
        { tag: 'success', text: '310 резюме сохранено за 3.2с без блокировок!' }
      ],
      table: `
        <tr><td class="font-mono">HH-1029481</td><td>Senior Python Backend Developer</td><td class="font-mono text-crimson">280 000 ₽</td><td class="font-mono">6 лет</td><td>Москва (Удаленно)</td><td><span class="badge-green">Открыт</span></td></tr>
        <tr><td class="font-mono">HH-2910384</td><td>Full-Stack React + Node.js Engineer</td><td class="font-mono text-crimson">190 000 ₽</td><td class="font-mono">4 года</td><td>СПб (Гибрид)</td><td><span class="badge-green">Открыт</span></td></tr>
        <tr><td class="font-mono">HH-3910285</td><td>DevOps / Cloud SRE Engineer</td><td class="font-mono text-crimson">320 000 ₽</td><td class="font-mono">7 лет</td><td>Удаленно (РФ)</td><td><span class="badge-green">Открыт</span></td></tr>
      `,
      json: `{\n  "status": "success",\n  "target": "hh.ru",\n  "category": "it_resumes",\n  "items_extracted": 310\n}`
    }
  };

  let activeScraperTarget = 'wb';

  const updateScraperTargetUI = (targetId) => {
    const data = SCRAPER_DATA[targetId];
    if (!data) return;

    activeScraperTarget = targetId;

    document.querySelectorAll('.scraper-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const smSpeed = document.getElementById('sm-speed');
    const smBypass = document.getElementById('sm-bypass');
    const smProxy = document.getElementById('sm-proxy');
    const smCount = document.getElementById('sm-count');

    if (smSpeed) smSpeed.textContent = data.speed;
    if (smBypass) smBypass.textContent = data.bypass;
    if (smProxy) smProxy.textContent = data.proxy;
    if (smCount) smCount.textContent = data.count;

    const logBox = document.getElementById('scraper-terminal-logs');
    if (logBox) {
      let logsHtml = '';
      const now = new Date();
      const timePrefix = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      data.logs.forEach((item, idx) => {
        const sec = String(10 + idx * 2).padStart(2, '0');
        const isSuccess = item.tag === 'success';
        logsHtml += `<div class="log-line ${isSuccess ? 'log-success' : ''}">
          <span class="log-ts">[${timePrefix}:${sec}]</span>
          <span class="log-tag ${item.tag}">${item.tag.toUpperCase()}</span>
          ${item.text}
        </div>`;
      });
      logBox.innerHTML = logsHtml;
    }

    const tableBody = document.getElementById('scraper-table-body');
    if (tableBody) tableBody.innerHTML = data.table;

    const jsonContent = document.getElementById('scraper-json-content');
    if (jsonContent) jsonContent.textContent = data.json;
  };

  document.querySelectorAll('.scraper-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) updateScraperTargetUI(targetId);
    });
  });

  document.querySelectorAll('.s-subview-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.s-subview-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const viewId = btn.getAttribute('data-view');
      document.querySelectorAll('.scraper-view').forEach(v => v.classList.remove('active'));
      const activeV = document.getElementById(`view-scraper-${viewId}`);
      if (activeV) activeV.classList.add('active');
    });
  });

  const btnRunScraper = document.getElementById('btn-run-scraper');
  const scraperStatusText = document.getElementById('scraper-status-text');

  if (btnRunScraper) {
    btnRunScraper.addEventListener('click', () => {
      btnRunScraper.disabled = true;
      btnRunScraper.innerHTML = '<span>⚡ Идет сбор данных...</span>';
      if (scraperStatusText) scraperStatusText.textContent = 'СТАТУС: ПОТОК АКТИВЕН';

      const cliTabBtn = document.querySelector('.s-subview-btn[data-view="cli"]');
      if (cliTabBtn) cliTabBtn.click();

      const logBox = document.getElementById('scraper-terminal-logs');
      if (logBox) {
        logBox.innerHTML = '<div class="log-line"><span class="log-tag info">START</span> Запуск асинхронного сбора данных...</div>';
      }

      const data = SCRAPER_DATA[activeScraperTarget];
      let step = 0;

      const streamInterval = setInterval(() => {
        if (!data || step >= data.logs.length) {
          clearInterval(streamInterval);
          btnRunScraper.disabled = false;
          btnRunScraper.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Запустить сбор данных</span>`;
          if (scraperStatusText) scraperStatusText.textContent = 'СТАТУС: ГОТОВ К ЗАПУСКУ';
          showToast(`Парсинг «${data.name}» успешно выполнен! Собрано ${data.count} без блокировок.`);
          return;
        }

        const item = data.logs[step];
        const now = new Date();
        const timePrefix = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const sec = String(now.getSeconds()).padStart(2, '0');
        const isSuccess = item.tag === 'success';

        const newLine = document.createElement('div');
        newLine.className = `log-line ${isSuccess ? 'log-success' : ''}`;
        newLine.innerHTML = `<span class="log-ts">[${timePrefix}:${sec}]</span> <span class="log-tag ${item.tag}">${item.tag.toUpperCase()}</span> ${item.text}`;

        if (logBox) {
          logBox.appendChild(newLine);
          logBox.scrollTop = logBox.scrollHeight;
        }
        step++;
      }, 350);
    });
  }

  const TARGET_FILES = {
    wb: 'wildberries_export.xlsx',
    ozon: 'ozon_export.xlsx',
    avito: 'avito_export.xlsx',
    hh: 'hh_ru_export.xlsx'
  };

  const btnExportExcel = document.getElementById('btn-export-excel');
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      const filename = TARGET_FILES[activeScraperTarget] || 'data_export.xlsx';
      const fileUrl = `./assets/exports/${filename}`;

      // Trigger real browser download of the genuine .xlsx spreadsheet
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.setAttribute('download', filename);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
      }, 150);

      showToast(`Файл «${filename}» скачан! Откройте в Excel.`);
    });
  }

  // ==========================================================================
  // 8. ECHO SONAR GAME LAUNCHER & FULLSCREEN CONTROLS
  // ==========================================================================
  const btnStartSonarFs = document.getElementById('btn-start-sonar-fs');
  const btnStartSonar = document.getElementById('btn-start-sonar');
  const sonarOverlay = document.getElementById('sonar-launch-overlay');
  const sonarIframe = document.getElementById('sonar-iframe');
  const btnSonarFullscreen = document.getElementById('btn-sonar-fullscreen');
  const sonarDisplayBox = document.getElementById('sonar-display-box');

  const focusSonarIframe = () => {
    try {
      if (sonarIframe && sonarIframe.contentWindow) {
        sonarIframe.contentWindow.focus();
      }
    } catch (e) {}
  };

  const launchEchoSonar = (requestFs = false) => {
    if (sonarOverlay) {
      sonarOverlay.classList.add('hidden');
      sonarOverlay.style.display = 'none';
    }
    if (sonarIframe) {
      if (!sonarIframe.src || sonarIframe.src === 'about:blank' || !sonarIframe.classList.contains('active')) {
        sonarIframe.src = sonarIframe.getAttribute('data-src');
        sonarIframe.classList.add('active');
      }

      if (requestFs) {
        try {
          if (sonarIframe.requestFullscreen) {
            sonarIframe.requestFullscreen().catch(() => {});
          } else if (sonarIframe.webkitRequestFullscreen) {
            sonarIframe.webkitRequestFullscreen();
          } else if (sonarIframe.msRequestFullscreen) {
            sonarIframe.msRequestFullscreen();
          }
        } catch (err) {
          console.warn('Fullscreen request failed:', err);
        }
      }

      focusSonarIframe();
      setTimeout(focusSonarIframe, 200);
      setTimeout(focusSonarIframe, 500);
    }
  };

  if (btnStartSonarFs) {
    btnStartSonarFs.addEventListener('click', () => launchEchoSonar(true));
  }

  if (btnStartSonar) {
    btnStartSonar.addEventListener('click', () => launchEchoSonar(false));
  }

  if (btnSonarFullscreen && sonarIframe) {
    btnSonarFullscreen.addEventListener('click', () => launchEchoSonar(true));
  }

  if (sonarDisplayBox) {
    sonarDisplayBox.addEventListener('click', () => {
      if (sonarIframe && sonarIframe.classList.contains('active')) {
        focusSonarIframe();
      }
    });
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === sonarIframe) {
      focusSonarIframe();
    }
  });

  // ==========================================================================
  // 8. TELEGRAM USERNAME COPY WITH TOAST
  // ==========================================================================
  const btnCopyTg = document.getElementById('btn-copy-tg');
  const copyTgLabel = document.getElementById('copy-tg-label');

  if (btnCopyTg) {
    btnCopyTg.addEventListener('click', () => {
      const username = btnCopyTg.getAttribute('data-username') || '@g1ghtik';

      const handleSuccess = () => {
        if (copyTgLabel) copyTgLabel.textContent = 'Скопировано!';
        btnCopyTg.classList.add('copied');
        showToast(`Ник ${username} скопирован в буфер обмена!`);

        setTimeout(() => {
          if (copyTgLabel) copyTgLabel.textContent = `Скопировать ${username}`;
          btnCopyTg.classList.remove('copied');
        }, 2500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(username).then(handleSuccess).catch(() => {
          fallbackClipboard(username, handleSuccess);
        });
      } else {
        fallbackClipboard(username, handleSuccess);
      }
    });
  }

  const fallbackClipboard = (text, callback) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
    document.body.removeChild(el);
  };

  console.log('Portfolio engine initialized successfully. Commercial contact: @g1ghtik');
});
