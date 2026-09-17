document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for nav links
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

  // --- PandaBar Tab Switcher ---
  const switchButtons = document.querySelectorAll('.switch-btn');
  switchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabName = btn.getAttribute('data-tab');
      document.querySelectorAll('.screen-view').forEach(view => {
        view.classList.remove('active');
      });
      const activeView = document.getElementById(`view-${tabName}`);
      if (activeView) activeView.classList.add('active');
    });
  });

  // --- Telegram Bot Mockup Simulator ---
  const tgKeys = document.querySelectorAll('.tg-key');
  const tgReplyBox = document.getElementById('tg-reply-box');

  const TG_REPLIES = {
    shop: `<strong>Корзина заказа #104:</strong><br>
           - Сет Самурай XXL (1 шт) - 1 490 RUB<br>
           - Морс брусничный (2 шт) - 280 RUB<br>
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
            - Срок: 3-4 недели<br>
            - Стек: React 19 / Python / SQLite<br>
            -------------------<br>
            Оценка трудоемкости: <strong>80-120 часов</strong>
            <div class="tg-inline-action">
              <button class="tg-act-btn">Скачать КП</button>
              <button class="tg-act-btn">Связаться</button>
            </div>`,
    admin: `<strong>Панель администратора:</strong><br>
            Пользователей: <strong>1 420 чел.</strong><br>
            Активных заказов: <strong>38 шт.</strong><br>
            Оборот за день: <strong>54 800 RUB</strong>
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

  // --- Echo Sonar Game Launch ---
  const btnPlay = document.getElementById('btn-play-game');
  const radarOverlay = document.querySelector('.radar-overlay');
  const gameFrame = document.getElementById('game-frame');
  const btnFs = document.getElementById('btn-fullscreen-toggle');

  if (btnPlay && gameFrame) {
    btnPlay.addEventListener('click', () => {
      if (radarOverlay) radarOverlay.classList.add('hidden');
      gameFrame.src = gameFrame.getAttribute('data-src');
      gameFrame.classList.add('active');
    });
  }

  if (btnFs && gameFrame) {
    btnFs.addEventListener('click', () => {
      if (gameFrame.requestFullscreen) {
        gameFrame.requestFullscreen();
      }
    });
  }

  console.log('Portfolio initialized successfully. Built by G1ght25.');
});