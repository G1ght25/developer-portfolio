document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Smooth Scroll for Navigation Links ---
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
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

  // --- 2. Scroll Reveal Animations (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // --- 3. Telegram Username Copy to Clipboard with Toast ---
  const btnCopy = document.getElementById('btn-copy-username');
  const copyBtnText = document.getElementById('copy-btn-text');
  const toastNotify = document.getElementById('toast-notify');
  let toastTimeout = null;

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const username = btnCopy.getAttribute('data-username') || '@g1ghtik';
      
      const copySuccess = () => {
        if (copyBtnText) copyBtnText.textContent = 'Скопировано!';
        btnCopy.classList.add('copied');

        if (toastNotify) {
          toastNotify.textContent = `Ник ${username} скопирован в буфер!`;
          toastNotify.classList.add('show');
          clearTimeout(toastTimeout);
          toastTimeout = setTimeout(() => {
            toastNotify.classList.remove('show');
          }, 2800);
        }

        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = `Скопировать ${username}`;
          btnCopy.classList.remove('copied');
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(username).then(copySuccess).catch(() => {
          fallbackCopy(username, copySuccess);
        });
      } else {
        fallbackCopy(username, copySuccess);
      }
    });
  }

  function fallbackCopy(text, callback) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (err) {
      console.warn('Copy failed', err);
    }
    document.body.removeChild(textarea);
  }

  // --- 4. PandaBar Tab Switcher ---
  const switchButtons = document.querySelectorAll('.switch-btn');
  const switchTab = (tabName) => {
    switchButtons.forEach(b => {
      if (b.getAttribute('data-tab') === tabName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    document.querySelectorAll('.screen-view').forEach(view => {
      view.classList.remove('active');
    });
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.add('active');
  };

  switchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // External trigger for tab switcher
  const switchTriggers = document.querySelectorAll('.switch-tab-trigger');
  switchTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const tabName = trigger.getAttribute('data-tab') || 'showcase';
      switchTab(tabName);
      const laptopMockup = document.querySelector('.laptop-mockup');
      if (laptopMockup) {
        laptopMockup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // --- 5. Telegram Bot Mockup Simulator ---
  const tgKeys = document.querySelectorAll('.tg-key');
  const tgReplyBox = document.getElementById('tg-reply-box');

  const TG_REPLIES = {
    shop: `<strong>Корзина заказа #104:</strong><br>
           - Сет Самурай XXL (1 шт) — 1 490 RUB<br>
           - Морс брусничный (2 шт) — 280 RUB<br>
           -------------------<br>
           Итого: <strong>1 770 RUB</strong> (Доставка: 0 RUB)<br>
           Статус: <em>Ожидает подтверждения</em>
           <div class="tg-inline-action">
             <button class="tg-act-btn">Подтвердить</button>
             <button class="tg-act-btn cancel">Отмена</button>
           </div>`,
    booking: `<strong>Бронирование услуги:</strong><br>
              Услуга: <em>Архитектурный аудит проекта</em><br>
              Дата: <strong>Пятница, 18 сентября</strong><br>
              Время: <strong>15:30 (МСК)</strong><br>
              Слот временно зарезервирован.<br>
              <div class="tg-inline-action">
                <button class="tg-act-btn">Забронировать</button>
                <button class="tg-act-btn cancel">Выбрать время</button>
              </div>`,
    quote: `<strong>Калькулятор сметы IT:</strong><br>
            - Тип: Web-сервис + Telegram Bot + KDS<br>
            - Срок: 2-3 недели<br>
            - Стек: React 19 / Python / aiosqlite<br>
            -------------------<br>
            Оценка трудоемкости: <strong>80-110 часов</strong>
            <div class="tg-inline-action">
              <button class="tg-act-btn">Скачать КП</button>
              <a href="https://t.me/g1ghtik" target="_blank" rel="noopener noreferrer" class="tg-act-btn" style="text-decoration:none; display:inline-block;">Связаться</a>
            </div>`,
    admin: `<strong>Панель администратора:</strong><br>
            Пользователей в базе: <strong>1 420 чел.</strong><br>
            Активных чеков: <strong>38 шт.</strong><br>
            Выручка за сегодня: <strong>54 800 RUB</strong>
            <div class="tg-inline-action">
              <button class="tg-act-btn">Рассылка</button>
              <button class="tg-act-btn">Экспорт</button>
            </div>`
  };

  tgKeys.forEach(key => {
    key.addEventListener('click', () => {
      tgKeys.forEach(k => k.classList.remove('active'));
      key.classList.add('active');

      const msgType = key.getAttribute('data-msg');
      if (tgReplyBox && TG_REPLIES[msgType]) {
        tgReplyBox.innerHTML = TG_REPLIES[msgType];
      }
    });
  });

  // --- 6. Echo Sonar Game Launch & Fullscreen ---
  const btnPlay = document.getElementById('btn-play-game');
  const btnQuickPlay = document.getElementById('btn-quick-play');
  const radarOverlay = document.querySelector('.radar-overlay');
  const gameFrame = document.getElementById('game-frame');
  const btnFs = document.getElementById('btn-fullscreen-toggle');

  const launchGame = () => {
    if (radarOverlay) radarOverlay.classList.add('hidden');
    if (gameFrame) {
      if (!gameFrame.src || gameFrame.src === 'about:blank' || !gameFrame.classList.contains('active')) {
        gameFrame.src = gameFrame.getAttribute('data-src');
        gameFrame.classList.add('active');
      }
    }
  };

  if (btnPlay) btnPlay.addEventListener('click', launchGame);
  if (btnQuickPlay) {
    btnQuickPlay.addEventListener('click', () => {
      launchGame();
      const terminal = document.querySelector('.radar-terminal');
      if (terminal) {
        terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (btnFs && gameFrame) {
    btnFs.addEventListener('click', () => {
      launchGame();
      if (gameFrame.requestFullscreen) {
        gameFrame.requestFullscreen();
      } else if (gameFrame.webkitRequestFullscreen) {
        gameFrame.webkitRequestFullscreen();
      } else if (gameFrame.msRequestFullscreen) {
        gameFrame.msRequestFullscreen();
      }
    });
  }

  console.log('Portfolio initialized successfully. Built for @g1ghtik.');
});
