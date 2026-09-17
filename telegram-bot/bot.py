"""
Telegram Demo Portfolio Bot
Stack: Python 3.12, aiogram 3.x, aiosqlite, FSM
Author: Senior Python Developer
"""

import os
import sys
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F, types
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder
from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    ReplyKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardRemove
)

import database as db

# Load environment variables
load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


# ==================== FSM STATES ====================

class OrderFSM(StatesGroup):
    name = State()
    phone = State()
    address = State()
    confirm = State()


class BookingFSM(StatesGroup):
    service = State()
    date = State()
    time = State()
    phone = State()


class LeadFSM(StatesGroup):
    project_type = State()
    budget = State()
    description = State()
    phone = State()


class BroadcastFSM(StatesGroup):
    text = State()
    confirm = State()


# ==================== KEYBOARDS ====================

def main_menu_kb(is_admin: bool = False) -> InlineKeyboardMarkup:
    """Main menu navigation keyboard."""
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="🛍 Демо 1: Каталог и Корзина (Магазин)", callback_data="demo_shop")
    )
    builder.row(
        InlineKeyboardButton(text="📅 Демо 2: Онлайн-запись на услугу", callback_data="demo_booking")
    )
    builder.row(
        InlineKeyboardButton(text="📊 Демо 3: Калькулятор и Заявка (IT)", callback_data="demo_calc")
    )
    builder.row(
        InlineKeyboardButton(text="💼 О разработчике и Цены (Портфолио)", callback_data="demo_portfolio")
    )
    admin_btn_text = "⚙️ Панель Администратора (Владелец)" if is_admin else "⚙️ Демо Панель Администратора"
    builder.row(
        InlineKeyboardButton(text=admin_btn_text, callback_data="demo_admin")
    )
    return builder.as_markup()


def back_to_main_kb() -> InlineKeyboardMarkup:
    """Return to main menu button."""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu"))
    return builder.as_markup()


# --- Demo 1: Shop Keyboards ---

async def shop_categories_kb(user_id: int) -> InlineKeyboardMarkup:
    """Categories selector keyboard."""
    builder = InlineKeyboardBuilder()
    categories = await db.get_categories()

    for cat in categories:
        builder.row(InlineKeyboardButton(text=f"📂 {cat}", callback_data=f"shop_cat:{cat}"))

    # Cart button with counter
    cart_items = await db.get_user_cart(user_id)
    total_qty = sum(item["quantity"] for item in cart_items)
    cart_label = f"🛒 Корзина ({total_qty})" if total_qty > 0 else "🛒 Корзина (пусто)"

    builder.row(
        InlineKeyboardButton(text=cart_label, callback_data="shop_cart")
    )
    builder.row(
        InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu")
    )
    return builder.as_markup()


def product_detail_kb(product_id: int, category: str, in_cart_qty: int = 0) -> InlineKeyboardMarkup:
    """Product card keyboard."""
    builder = InlineKeyboardBuilder()

    if in_cart_qty > 0:
        builder.row(
            InlineKeyboardButton(text="➖", callback_data=f"cart_dec:{product_id}:{category}"),
            InlineKeyboardButton(text=f"В корзине: {in_cart_qty} шт", callback_data="shop_cart"),
            InlineKeyboardButton(text="➕", callback_data=f"cart_inc:{product_id}:{category}")
        )
    else:
        builder.row(
            InlineKeyboardButton(text="➕ Добавить в корзину", callback_data=f"cart_add:{product_id}:{category}")
        )

    builder.row(
        InlineKeyboardButton(text="🛒 Перейти в корзину", callback_data="shop_cart")
    )
    builder.row(
        InlineKeyboardButton(text="◀️ К списку товаров", callback_data=f"shop_cat:{category}"),
        InlineKeyboardButton(text="🏠 Меню", callback_data="main_menu")
    )
    return builder.as_markup()


async def cart_view_kb(user_id: int) -> InlineKeyboardMarkup:
    """Cart view and control keyboard."""
    builder = InlineKeyboardBuilder()
    cart_items = await db.get_user_cart(user_id)

    if cart_items:
        for item in cart_items:
            builder.row(
                InlineKeyboardButton(text=f"❌ {item['name'][:18]}", callback_data=f"cart_del:{item['product_id']}"),
                InlineKeyboardButton(text="➖", callback_data=f"cart_dec:{item['product_id']}:cart"),
                InlineKeyboardButton(text=f"{item['quantity']} шт", callback_data="noop"),
                InlineKeyboardButton(text="➕", callback_data=f"cart_inc:{item['product_id']}:cart"),
            )

        builder.row(
            InlineKeyboardButton(text="🚀 Оформить заказ", callback_data="order_checkout")
        )
        builder.row(
            InlineKeyboardButton(text="🧹 Очистить корзину", callback_data="cart_clear")
        )

    builder.row(
        InlineKeyboardButton(text="🍣 В каталог", callback_data="demo_shop"),
        InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu")
    )
    return builder.as_markup()


def cancel_fsm_kb(target_menu: str = "main_menu") -> InlineKeyboardMarkup:
    """Cancel FSM action button."""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="❌ Отменить", callback_data=f"cancel_flow:{target_menu}"))
    return builder.as_markup()


# --- Demo 2: Booking Keyboards ---

def booking_services_kb() -> InlineKeyboardMarkup:
    """Service selection keyboard."""
    builder = InlineKeyboardBuilder()
    services = [
        ("💻 Экспресс-диагностика / Консультация (1 500 ₽)", "book_srv:Диагностика и Консультация"),
        ("🚗 Полное ТО / Комплекс услуг (4 500 ₽)", "book_srv:Полное ТО и Сервис"),
        ("💅 Премиум уход / Комплексная процедура (3 000 ₽)", "book_srv:Премиум процедура"),
        ("⚡ Срочный аудит / Ремонт (2 500 ₽)", "book_srv:Срочный аудит и Ремонт"),
    ]
    for name, cb in services:
        builder.row(InlineKeyboardButton(text=name, callback_data=cb))

    builder.row(
        InlineKeyboardButton(text="📋 Мои записи", callback_data="my_bookings")
    )
    builder.row(
        InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu")
    )
    return builder.as_markup()


def booking_dates_kb() -> InlineKeyboardMarkup:
    """Dynamic booking dates keyboard."""
    builder = InlineKeyboardBuilder()
    today = datetime.now()

    months_ru = {
        1: "янв", 2: "фев", 3: "мар", 4: "апр", 5: "мая", 6: "июн",
        7: "июл", 8: "авг", 9: "сен", 10: "окт", 11: "ноя", 12: "дек"
    }

    dates = [
        ("Сегодня", today),
        ("Завтра", today + timedelta(days=1)),
        ("Послезавтра", today + timedelta(days=2)),
    ]

    for label, dt in dates:
        formatted = f"{dt.day} {months_ru[dt.month]}"
        builder.row(
            InlineKeyboardButton(
                text=f"📅 {label} ({formatted})",
                callback_data=f"book_date:{formatted}"
            )
        )

    builder.row(
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_flow:demo_booking")
    )
    return builder.as_markup()


def booking_times_kb() -> InlineKeyboardMarkup:
    """Time slots selector keyboard."""
    builder = InlineKeyboardBuilder()
    times = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

    buttons = [
        InlineKeyboardButton(text=f"⏰ {t}", callback_data=f"book_time:{t}")
        for t in times
    ]
    # 2 columns
    builder.row(buttons[0], buttons[1])
    builder.row(buttons[2], buttons[3])
    builder.row(buttons[4], buttons[5])

    builder.row(
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_flow:demo_booking")
    )
    return builder.as_markup()


# --- Demo 3: Calculator / Leads Keyboards ---

def lead_project_types_kb() -> InlineKeyboardMarkup:
    """Project type selection keyboard."""
    builder = InlineKeyboardBuilder()
    projects = [
        ("🤖 Telegram-бот (Магазин / AI / Услуги)", "lead_type:Telegram-бот"),
        ("🌐 Веб-сайт / Сервис доставки еды", "lead_type:Веб-сайт / Доставка"),
        ("🕷 Парсер данных / Сбор информации", "lead_type:Парсер данных"),
        ("🔄 CRM-интеграция / Автоматизация", "lead_type:CRM-интеграция"),
    ]
    for name, cb in projects:
        builder.row(InlineKeyboardButton(text=name, callback_data=cb))

    builder.row(
        InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu")
    )
    return builder.as_markup()


def lead_budgets_kb() -> InlineKeyboardMarkup:
    """Budget options keyboard."""
    builder = InlineKeyboardBuilder()
    budgets = [
        ("💸 До 15 000 ₽ (Базовый бот / простой скрипт)", "lead_bgt:До 15 000 ₽"),
        ("💰 15 000 – 40 000 ₽ (Бот с БД, админкой и оплатой)", "lead_bgt:15 000 - 40 000 ₽"),
        ("💎 40 000 – 100 000+ ₽ (Комплексный сервис / WebApp)", "lead_bgt:40 000 - 100 000+ ₽"),
        ("✍️ Другой бюджет (укажу в описании)", "lead_bgt:Индивидуальный расчет"),
    ]
    for name, cb in budgets:
        builder.row(InlineKeyboardButton(text=name, callback_data=cb))

    builder.row(
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_flow:demo_calc")
    )
    return builder.as_markup()


# --- Demo 4: Portfolio Keyboards ---

def portfolio_kb() -> InlineKeyboardMarkup:
    """Portfolio actions keyboard."""
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="💬 Написать разработчику", url="tg://user?id=6362628210")
    )
    builder.row(
        InlineKeyboardButton(text="📊 Рассчитать мой проект (Калькулятор)", callback_data="demo_calc")
    )
    builder.row(
        InlineKeyboardButton(text="🌐 GitHub Репозитории", url="https://github.com")
    )
    builder.row(
        InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu")
    )
    return builder.as_markup()


# --- Demo 5: Admin Panel Keyboards ---

def admin_dashboard_kb() -> InlineKeyboardMarkup:
    """Admin dashboard keyboard."""
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="🛍 Последние 5 заказов", callback_data="admin_orders"),
        InlineKeyboardButton(text="📅 Последние 5 записей", callback_data="admin_bookings")
    )
    builder.row(
        InlineKeyboardButton(text="💼 Последние 5 заявок IT", callback_data="admin_leads"),
        InlineKeyboardButton(text="📢 Рассылка пользователям", callback_data="admin_broadcast")
    )
    builder.row(
        InlineKeyboardButton(text="🔔 Тест уведомления в ЛС", callback_data="admin_test_alert")
    )
    builder.row(
        InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu")
    )
    return builder.as_markup()


# ==================== HANDLERS & ROUTERS ====================

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())


# --- Base Commands ---

@dp.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext):
    """Start command handler with auto user registration."""
    await state.clear()
    user_id = message.from_user.id
    username = message.from_user.username
    full_name = message.from_user.full_name

    await db.register_user(user_id, username, full_name)
    is_admin = (user_id == ADMIN_ID)

    welcome_text = (
        f"👋 <b>Добро пожаловать, {full_name}!</b>\n\n"
        "Я — демонстрационный Telegram-бот для демонстрации <b>тестовый ботик </b>.\n\n"
        "Здесь собраны <b>4 готовых бизнес-сценария</b>, которые вы можете протестировать прямо сейчас:\n\n"
        "🛍 <b>1. Интернет-магазин / Доставка еды</b> — интерактивный каталог, корзина, оформление заказа и отправка чека администратору.\n"
        "📅 <b>2. Онлайн-запись на услугу</b> — пошаговый мастер записи (услуга ➔ дата ➔ время ➔ телефон) с сохранением в БД.\n"
        "📊 <b>3. Калькулятор IT-услуг / Лидогенерация</b> — опросник для сбора брифа и мгновенная отправка лида разработчику.\n"
        "💼 <b>4. О разработчике и Цены</b> — стек технологий, примеры работ и прайс-лист.\n"
        "⚙️ <b>5. Панель Администратора</b> — статистика, просмотр заявок и инструмент рассылки.\n\n"
        "👇 <i>Выберите интересующий раздел в меню ниже:</i>"
    )

    await message.answer(welcome_text, reply_markup=main_menu_kb(is_admin))


@dp.callback_query(F.data == "main_menu")
async def cb_main_menu(callback: types.CallbackQuery, state: FSMContext):
    """Callback to return to main menu."""
    await state.clear()
    is_admin = (callback.from_user.id == ADMIN_ID)
    menu_text = (
        "🏠 <b>Главное меню демонстрационного бота</b>\n\n"
        "Выберите раздел для тестирования функционала:"
    )
    await callback.message.edit_text(menu_text, reply_markup=main_menu_kb(is_admin))
    await callback.answer()


@dp.callback_query(F.data.startswith("cancel_flow:"))
async def cb_cancel_flow(callback: types.CallbackQuery, state: FSMContext):
    """Universal cancel handler for FSM flows."""
    await state.clear()
    target = callback.data.split(":")[1]

    if target == "demo_shop":
        await cb_demo_shop(callback)
    elif target == "demo_booking":
        await cb_demo_booking(callback)
    elif target == "demo_calc":
        await cb_demo_calc(callback)
    else:
        await cb_main_menu(callback, state)

    await callback.answer("Действие отменено.")


# ==================== MODULE 1: CATALOG & SHOP ====================

@dp.callback_query(F.data == "demo_shop")
async def cb_demo_shop(callback: types.CallbackQuery):
    """Show shop categories."""
    text = (
        "🛍 <b>Демо-режим: Интернет-магазин доставки еды</b>\n\n"
        "Полноценный модуль e-commerce внутри Telegram:\n"
        "• Динамические категории и карточки товаров\n"
        "• Интерактивная корзина с подсчетом стоимости\n"
        "• Оформление заказа через FSM и отправка чека администратору\n\n"
        "📂 <b>Выберите категорию меню:</b>"
    )
    await callback.message.edit_text(text, reply_markup=await shop_categories_kb(callback.from_user.id))
    await callback.answer()


@dp.callback_query(F.data.startswith("shop_cat:"))
async def cb_shop_category(callback: types.CallbackQuery):
    """Show products in selected category."""
    category = callback.data.split(":")[1]
    products = await db.get_products_by_category(category)

    builder = InlineKeyboardBuilder()
    for prod in products:
        builder.row(
            InlineKeyboardButton(
                text=f"{prod['name']} — {prod['price']} ₽",
                callback_data=f"shop_item:{prod['id']}"
            )
        )

    builder.row(
        InlineKeyboardButton(text="🛒 В корзину", callback_data="shop_cart"),
        InlineKeyboardButton(text="◀️ К категориям", callback_data="demo_shop")
    )

    text = f"📂 <b>Категория: {category}</b>\n\nВыберите блюдо для просмотра подробностей и заказа:"
    await callback.message.edit_text(text, reply_markup=builder.as_markup())
    await callback.answer()


@dp.callback_query(F.data.startswith("shop_item:"))
async def cb_shop_item(callback: types.CallbackQuery):
    """Show single product card with cart controls."""
    product_id = int(callback.data.split(":")[1])
    product = await db.get_product_by_id(product_id)

    if not product:
        await callback.answer("Товар не найден", show_alert=True)
        return

    # Check if item is already in user's cart
    user_cart = await db.get_user_cart(callback.from_user.id)
    in_cart = next((item for item in user_cart if item["product_id"] == product_id), None)
    qty = in_cart["quantity"] if in_cart else 0

    text = (
        f"🍱 <b>{product['name']}</b>\n\n"
        f"📝 <b>Описание:</b> {product['description']}\n\n"
        f"💰 <b>Цена:</b> <code>{product['price']} ₽</code>\n"
        f"🛒 <b>В вашей корзине:</b> {qty} шт."
    )

    await callback.message.edit_text(
        text,
        reply_markup=product_detail_kb(product_id, product["category"], qty)
    )
    await callback.answer()


@dp.callback_query(F.data.startswith("cart_add:") | F.data.startswith("cart_inc:"))
async def cb_cart_add(callback: types.CallbackQuery):
    """Add or increment product in cart."""
    parts = callback.data.split(":")
    product_id = int(parts[1])
    context = parts[2] if len(parts) > 2 else ""

    await db.add_to_cart(callback.from_user.id, product_id, 1)

    if context == "cart":
        await cb_shop_cart(callback)
    else:
        # Re-render product card
        product = await db.get_product_by_id(product_id)
        if product:
            user_cart = await db.get_user_cart(callback.from_user.id)
            in_cart = next((item for item in user_cart if item["product_id"] == product_id), None)
            qty = in_cart["quantity"] if in_cart else 0

            text = (
                f"🍱 <b>{product['name']}</b>\n\n"
                f"📝 <b>Описание:</b> {product['description']}\n\n"
                f"💰 <b>Цена:</b> <code>{product['price']} ₽</code>\n"
                f"🛒 <b>В вашей корзине:</b> {qty} шт."
            )
            await callback.message.edit_text(
                text,
                reply_markup=product_detail_kb(product_id, product["category"], qty)
            )

    await callback.answer("Товар добавлен в корзину! ✅")


@dp.callback_query(F.data.startswith("cart_dec:"))
async def cb_cart_dec(callback: types.CallbackQuery):
    """Decrement item quantity in cart."""
    parts = callback.data.split(":")
    product_id = int(parts[1])
    context = parts[2] if len(parts) > 2 else ""

    await db.decrement_from_cart(callback.from_user.id, product_id)

    if context == "cart":
        await cb_shop_cart(callback)
    else:
        product = await db.get_product_by_id(product_id)
        if product:
            user_cart = await db.get_user_cart(callback.from_user.id)
            in_cart = next((item for item in user_cart if item["product_id"] == product_id), None)
            qty = in_cart["quantity"] if in_cart else 0

            text = (
                f"🍱 <b>{product['name']}</b>\n\n"
                f"📝 <b>Описание:</b> {product['description']}\n\n"
                f"💰 <b>Цена:</b> <code>{product['price']} ₽</code>\n"
                f"🛒 <b>В вашей корзине:</b> {qty} шт."
            )
            await callback.message.edit_text(
                text,
                reply_markup=product_detail_kb(product_id, product["category"], qty)
            )

    await callback.answer("Количество обновлено.")


@dp.callback_query(F.data.startswith("cart_del:"))
async def cb_cart_del(callback: types.CallbackQuery):
    """Delete item completely from cart."""
    product_id = int(callback.data.split(":")[1])
    await db.remove_from_cart(callback.from_user.id, product_id)
    await cb_shop_cart(callback)
    await callback.answer("Товар удален из корзины.")


@dp.callback_query(F.data == "cart_clear")
async def cb_cart_clear(callback: types.CallbackQuery):
    """Clear whole cart."""
    await db.clear_user_cart(callback.from_user.id)
    await cb_shop_cart(callback)
    await callback.answer("Корзина полностью очищена 🧹")


@dp.callback_query(F.data == "shop_cart")
async def cb_shop_cart(callback: types.CallbackQuery):
    """Display user's shopping cart."""
    cart_items = await db.get_user_cart(callback.from_user.id)

    if not cart_items:
        text = (
            "🛒 <b>Ваша корзина пуста</b>\n\n"
            "Перейдите в каталог, чтобы выбрать вкуснейшие роллы, сеты или напитки!"
        )
    else:
        lines = []
        total_sum = 0
        for idx, item in enumerate(cart_items, 1):
            subtotal = item["subtotal"]
            total_sum += subtotal
            lines.append(f"<b>{idx}. {item['name']}</b>\n   └ {item['quantity']} шт. × {item['price']} ₽ = <b>{subtotal} ₽</b>")

        items_str = "\n\n".join(lines)
        text = (
            "🛒 <b>Ваша корзина:</b>\n\n"
            f"{items_str}\n\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"💵 <b>ИТОГО К ОПЛАТЕ: <code>{total_sum} ₽</code></b>\n"
            f"🛵 <b>Доставка:</b> Бесплатно (от 1000 ₽)"
        )

    await callback.message.edit_text(text, reply_markup=await cart_view_kb(callback.from_user.id))
    await callback.answer()


@dp.callback_query(F.data == "order_checkout")
async def cb_order_checkout(callback: types.CallbackQuery, state: FSMContext):
    """Start order checkout FSM."""
    cart_items = await db.get_user_cart(callback.from_user.id)
    if not cart_items:
        await callback.answer("Ваша корзина пуста!", show_alert=True)
        return

    await state.set_state(OrderFSM.name)
    user_name = callback.from_user.first_name or "Покупатель"

    text = (
        "🚀 <b>Оформление заказа (Шаг 1 из 3)</b>\n\n"
        "Пожалуйста, введите <b>ваше имя</b> для получения заказа:\n"
        f"<i>(Или отправьте <code>{user_name}</code>)</i>"
    )
    await callback.message.edit_text(text, reply_markup=cancel_fsm_kb("demo_shop"))
    await callback.answer()


@dp.message(OrderFSM.name)
async def process_order_name(message: types.Message, state: FSMContext):
    """Process order name and request phone."""
    name = message.text.strip()
    if len(name) < 2:
        await message.answer("⚠️ Пожалуйста, введите корректное имя (минимум 2 символа):", reply_markup=cancel_fsm_kb("demo_shop"))
        return

    await state.update_data(name=name)
    await state.set_state(OrderFSM.phone)

    text = (
        f"👍 Приятно познакомиться, <b>{name}</b>!\n\n"
        "📱 <b>Оформление заказа (Шаг 2 из 3)</b>\n"
        "Введите ваш <b>номер телефона</b> для связи с курьером:"
    )
    await message.answer(text, reply_markup=cancel_fsm_kb("demo_shop"))


@dp.message(OrderFSM.phone)
async def process_order_phone(message: types.Message, state: FSMContext):
    """Process order phone and request address."""
    phone = message.text.strip()
    if len(phone) < 6:
        await message.answer("⚠️ Пожалуйста, введите корректный номер телефона:", reply_markup=cancel_fsm_kb("demo_shop"))
        return

    await state.update_data(phone=phone)
    await state.set_state(OrderFSM.address)

    text = (
        "📍 <b>Оформление заказа (Шаг 3 из 3)</b>\n\n"
        "Укажите <b>адрес доставки</b> (город, улица, дом, квартира/офис):"
    )
    await message.answer(text, reply_markup=cancel_fsm_kb("demo_shop"))


@dp.message(OrderFSM.address)
async def process_order_address(message: types.Message, state: FSMContext):
    """Process order address, confirm and create order."""
    address = message.text.strip()
    data = await state.get_data()
    name = data.get("name")
    phone = data.get("phone")

    cart_items = await db.get_user_cart(message.from_user.id)
    if not cart_items:
        await message.answer("⚠️ Корзина пуста. Начните оформление заново.", reply_markup=back_to_main_kb())
        await state.clear()
        return

    total_sum = sum(item["subtotal"] for item in cart_items)
    items_summary_list = [f"• {item['name']} — {item['quantity']} шт. ({item['subtotal']} ₽)" for item in cart_items]
    items_summary = "\n".join(items_summary_list)

    # Save to database
    order_id = await db.create_order(
        user_id=message.from_user.id,
        customer_name=name,
        phone=phone,
        address=address,
        items_summary=items_summary,
        total_price=total_sum
    )
    await state.clear()

    # User receipt
    user_receipt = (
        f"🎉 <b>Спасибо за заказ! Заказ #{order_id} принят!</b>\n\n"
        f"👤 <b>Получатель:</b> {name}\n"
        f"📱 <b>Телефон:</b> {phone}\n"
        f"📍 <b>Адрес доставки:</b> {address}\n\n"
        f"📦 <b>Состав заказа:</b>\n{items_summary}\n\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>Сумма к оплате: <code>{total_sum} ₽</code></b>\n"
        f"⏱ <b>Примерное время доставки:</b> 40–50 мин.\n\n"
        f"<i>Детали заказа успешно переданы в ресторан и администратору!</i>"
    )
    await message.answer(user_receipt, reply_markup=back_to_main_kb())

    # Instant Admin notification
    admin_alert = (
        f"🚨 <b>НОВЫЙ ЗАКАЗ #{order_id} (Магазин)!</b>\n\n"
        f"👤 <b>Клиент:</b> {name} (@{message.from_user.username or 'нет'})\n"
        f"📱 <b>Телефон:</b> <code>{phone}</code>\n"
        f"📍 <b>Адрес доставки:</b> {address}\n\n"
        f"🛒 <b>Состав:</b>\n{items_summary}\n\n"
        f"💰 <b>СУММА:</b> <code>{total_sum} ₽</code>\n"
        f"🕒 <b>Время:</b> {datetime.now().strftime('%d.%m.%Y %H:%M')}"
    )
    try:
        await bot.send_message(chat_id=ADMIN_ID, text=admin_alert)
    except Exception as e:
        logger.error(f"Failed to send admin notification: {e}")


# ==================== MODULE 2: ONLINE BOOKING ====================

@dp.callback_query(F.data == "demo_booking")
async def cb_demo_booking(callback: types.CallbackQuery, state: FSMContext):
    """Start online booking flow."""
    await state.clear()
    text = (
        "📅 <b>Демо-режим: Онлайн-запись на услугу</b>\n\n"
        "Удобный пошаговый мастер записи для салонов красоты, автосервисов, клиник и консультаций.\n\n"
        "✨ <b>Шаг 1 из 4: Выберите интересующую услугу:</b>"
    )
    await callback.message.edit_text(text, reply_markup=booking_services_kb())
    await callback.answer()


@dp.callback_query(F.data.startswith("book_srv:"))
async def cb_book_service(callback: types.CallbackQuery, state: FSMContext):
    """Handle service selection."""
    service_name = callback.data.split(":")[1]
    await state.set_state(BookingFSM.date)
    await state.update_data(service=service_name)

    text = (
        f"🛠 <b>Выбрана услуга:</b> {service_name}\n\n"
        "🗓 <b>Шаг 2 из 4: Выберите удобную дату:</b>"
    )
    await callback.message.edit_text(text, reply_markup=booking_dates_kb())
    await callback.answer()


@dp.callback_query(F.data.startswith("book_date:"))
async def cb_book_date(callback: types.CallbackQuery, state: FSMContext):
    """Handle date selection."""
    date_val = callback.data.split(":")[1]
    await state.set_state(BookingFSM.time)
    await state.update_data(date=date_val)

    data = await state.get_data()
    service = data.get("service")

    text = (
        f"🛠 <b>Услуга:</b> {service}\n"
        f"🗓 <b>Дата:</b> {date_val}\n\n"
        "⏰ <b>Шаг 3 из 4: Выберите свободный слот времени:</b>"
    )
    await callback.message.edit_text(text, reply_markup=booking_times_kb())
    await callback.answer()


@dp.callback_query(F.data.startswith("book_time:"))
async def cb_book_time(callback: types.CallbackQuery, state: FSMContext):
    """Handle time selection and request phone."""
    time_val = callback.data.split(":")[1]
    await state.set_state(BookingFSM.phone)
    await state.update_data(time=time_val)

    data = await state.get_data()
    service = data.get("service")
    date_val = data.get("date")

    text = (
        f"🛠 <b>Услуга:</b> {service}\n"
        f"🗓 <b>Дата и время:</b> {date_val} в {time_val}\n\n"
        "📱 <b>Шаг 4 из 4:</b> Введите ваш <b>номер телефона</b> для подтверждения записи:"
    )
    await callback.message.edit_text(text, reply_markup=cancel_fsm_kb("demo_booking"))
    await callback.answer()


@dp.message(BookingFSM.phone)
async def process_booking_phone(message: types.Message, state: FSMContext):
    """Complete booking and alert admin."""
    phone = message.text.strip()
    if len(phone) < 6:
        await message.answer("⚠️ Введите корректный номер телефона:", reply_markup=cancel_fsm_kb("demo_booking"))
        return

    data = await state.get_data()
    service = data.get("service")
    date_val = data.get("date")
    time_val = data.get("time")
    customer_name = message.from_user.full_name or "Клиент"

    # Save appointment to database
    appointment_id = await db.create_appointment(
        user_id=message.from_user.id,
        customer_name=customer_name,
        service=service,
        date=date_val,
        time=time_val,
        phone=phone
    )
    await state.clear()

    # Confirmation markup with cancel option
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="❌ Отменить эту запись", callback_data=f"cancel_app:{appointment_id}")
    )
    builder.row(
        InlineKeyboardButton(text="📋 Мои записи", callback_data="my_bookings"),
        InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu")
    )

    confirm_text = (
        f"✅ <b>Запись #{appointment_id} успешно подтверждена!</b>\n\n"
        f"👤 <b>Клиент:</b> {customer_name}\n"
        f"🛠 <b>Услуга:</b> {service}\n"
        f"🗓 <b>Дата и время:</b> {date_val} в {time_val}\n"
        f"📱 <b>Контактный телефон:</b> {phone}\n\n"
        f"<i>Мы пришлем вам напоминание за 2 часа до начала визита.</i>"
    )
    await message.answer(confirm_text, reply_markup=builder.as_markup())

    # Admin notification
    admin_alert = (
        f"📅 <b>НОВАЯ ЗАПИСЬ НА УСЛУГУ #{appointment_id}!</b>\n\n"
        f"👤 <b>Клиент:</b> {customer_name} (@{message.from_user.username or 'нет'})\n"
        f"📱 <b>Телефон:</b> <code>{phone}</code>\n"
        f"🛠 <b>Услуга:</b> {service}\n"
        f"🗓 <b>Дата:</b> {date_val} в {time_val}"
    )
    try:
        await bot.send_message(chat_id=ADMIN_ID, text=admin_alert)
    except Exception as e:
        logger.error(f"Failed to send admin notification: {e}")


@dp.callback_query(F.data == "my_bookings")
async def cb_my_bookings(callback: types.CallbackQuery):
    """View active bookings of the user."""
    appointments = await db.get_user_active_appointments(callback.from_user.id)

    if not appointments:
        text = "📋 <b>У вас пока нет активных записей.</b>"
        builder = InlineKeyboardBuilder()
        builder.row(InlineKeyboardButton(text="➕ Записаться на услугу", callback_data="demo_booking"))
        builder.row(InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu"))
    else:
        text = "📋 <b>Ваши активные записи:</b>\n\n"
        builder = InlineKeyboardBuilder()
        for app in appointments:
            text += (
                f"🔹 <b>Запись #{app['id']}</b>\n"
                f"• Услуга: {app['service']}\n"
                f"• Время: {app['date']} в {app['time']}\n"
                f"• Статус: 🟢 {app['status']}\n\n"
            )
            builder.row(
                InlineKeyboardButton(text=f"❌ Отменить запись #{app['id']}", callback_data=f"cancel_app:{app['id']}")
            )
        builder.row(InlineKeyboardButton(text="◀️ В главное меню", callback_data="main_menu"))

    await callback.message.edit_text(text, reply_markup=builder.as_markup())
    await callback.answer()


@dp.callback_query(F.data.startswith("cancel_app:"))
async def cb_cancel_app(callback: types.CallbackQuery):
    """Cancel specific appointment."""
    app_id = int(callback.data.split(":")[1])
    success = await db.cancel_appointment(app_id, callback.from_user.id)

    if success:
        await callback.answer(f"Запись #{app_id} успешно отменена.", show_alert=True)
        # Notify admin about cancellation
        try:
            await bot.send_message(
                chat_id=ADMIN_ID,
                text=f"⚠️ <b>ОТМЕНА ЗАПИСИ #{app_id}</b>\nПользователь @{callback.from_user.username or callback.from_user.id} отменил запись."
            )
        except Exception:
            pass
        await cb_my_bookings(callback)
    else:
        await callback.answer("Не удалось отменить запись.", show_alert=True)


# ==================== MODULE 3: IT CALCULATOR & LEADS ====================

@dp.callback_query(F.data == "demo_calc")
async def cb_demo_calc(callback: types.CallbackQuery, state: FSMContext):
    """Start IT quote calculator flow."""
    await state.clear()
    text = (
        "📊 <b>Демо-режим: Калькулятор стоимости и Лидогенерация</b>\n\n"
        "Инструмент для автоматического сбора брифа и квалификации входящих заявок на разработку.\n\n"
        "💡 <b>Шаг 1 из 4: Какой тип проекта вас интересует?</b>"
    )
    await callback.message.edit_text(text, reply_markup=lead_project_types_kb())
    await callback.answer()


@dp.callback_query(F.data.startswith("lead_type:"))
async def cb_lead_type(callback: types.CallbackQuery, state: FSMContext):
    """Handle project type."""
    project_type = callback.data.split(":")[1]
    await state.set_state(LeadFSM.budget)
    await state.update_data(project_type=project_type)

    text = (
        f"📌 <b>Тип проекта:</b> {project_type}\n\n"
        "💰 <b>Шаг 2 из 4: В какой бюджет планируете уложиться?</b>"
    )
    await callback.message.edit_text(text, reply_markup=lead_budgets_kb())
    await callback.answer()


@dp.callback_query(F.data.startswith("lead_bgt:"))
async def cb_lead_budget(callback: types.CallbackQuery, state: FSMContext):
    """Handle budget selection and request description."""
    budget = callback.data.split(":")[1]
    await state.set_state(LeadFSM.description)
    await state.update_data(budget=budget)

    data = await state.get_data()
    project_type = data.get("project_type")

    text = (
        f"📌 <b>Тип:</b> {project_type}\n"
        f"💰 <b>Бюджет:</b> {budget}\n\n"
        "📝 <b>Шаг 3 из 4:</b> Опишите вкратце <b>суть вашей задачи</b> (какие функции нужны, есть ли готовое ТЗ или пример):"
    )
    await callback.message.edit_text(text, reply_markup=cancel_fsm_kb("demo_calc"))
    await callback.answer()


@dp.message(LeadFSM.description)
async def process_lead_description(message: types.Message, state: FSMContext):
    """Process description and request contact."""
    description = message.text.strip()
    await state.update_data(description=description)
    await state.set_state(LeadFSM.phone)

    text = (
        "🤝 <b>Шаг 4 из 4:</b> Укажите ваш <b>телефон или Telegram username</b> для связи и получения коммерческого предложения:"
    )
    await message.answer(text, reply_markup=cancel_fsm_kb("demo_calc"))


@dp.message(LeadFSM.phone)
async def process_lead_phone(message: types.Message, state: FSMContext):
    """Save lead to database and notify admin."""
    phone = message.text.strip()
    data = await state.get_data()
    project_type = data.get("project_type")
    budget = data.get("budget")
    description = data.get("description")

    # Save lead
    lead_id = await db.create_lead(
        user_id=message.from_user.id,
        project_type=project_type,
        budget=budget,
        description=description,
        phone=phone
    )
    await state.clear()

    user_response = (
        f"🎉 <b>Спасибо! Ваша заявка #{lead_id} успешно принята!</b>\n\n"
        f"📌 <b>Проект:</b> {project_type}\n"
        f"💰 <b>Ориентир по бюджету:</b> {budget}\n"
        f"📱 <b>Контакт:</b> {phone}\n\n"
        f"⚡ <b>Разработчик свяжется с вами в течение 15 минут</b>, ответит на все вопросы и подготовит предварительную смету."
    )
    await message.answer(user_response, reply_markup=back_to_main_kb())

    # Admin notification
    admin_alert = (
        f"💼 <b>НОВАЯ ЗАЯВКА НА РАЗРАБОТКУ #{lead_id}!</b>\n\n"
        f"👤 <b>Клиент:</b> {message.from_user.full_name} (@{message.from_user.username or 'нет'})\n"
        f"📱 <b>Контакт:</b> <code>{phone}</code>\n"
        f"📌 <b>Тип проекта:</b> {project_type}\n"
        f"💰 <b>Бюджет:</b> {budget}\n\n"
        f"📝 <b>Описание / ТЗ:</b>\n{description}"
    )
    try:
        await bot.send_message(chat_id=ADMIN_ID, text=admin_alert)
    except Exception as e:
        logger.error(f"Failed to send admin notification: {e}")


# ==================== MODULE 4: PORTFOLIO & PRICING ====================

@dp.callback_query(F.data == "demo_portfolio")
async def cb_demo_portfolio(callback: types.CallbackQuery):
    """Show developer's portfolio, stack, cases and pricing."""
    text = (
        "💼 <b>Senior Python Developer — Портфолио и Услуги</b>\n\n"
        "Разрабатываю быстрых, надежных и масштабируемых Telegram-ботов, парсеры и веб-сервисы под ключ.\n\n"
        "🛠 <b>Основной стек:</b>\n"
        "• <b>Языки и фреймворки:</b> Python 3.12, aiogram 3.x, FastAPI, Flask, Django\n"
        "• <b>Базы данных:</b> PostgreSQL, SQLite (aiosqlite), Redis, SQLAlchemy, Alembic\n"
        "• <b>Интеграции:</b> Платежные шлюзы (ЮKassa, Telegram Stars, CryptoBot), WebApp, CRM (AmoCRM, Bitrix24), Google Sheets API\n"
        "• <b>Инфраструктура:</b> Docker, Docker Compose, Linux/Ubuntu, Nginx, Git, CI/CD\n\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "💵 <b>Прайс-лист на типовые решения:</b>\n"
        "• <b>Бот-визитка / Лидогенератор:</b> от 5 000 ₽ <i>(1–2 дня)</i>\n"
        "• <b>Бот Онлайн-записи / Бронирования:</b> от 12 000 ₽ <i>(2–4 дня)</i>\n"
        "• <b>Интернет-магазин / Доставка еды:</b> от 15 000 ₽ <i>(3–5 дней)</i>\n"
        "• <b>Парсеры сайтов и мониторинг:</b> от 8 000 ₽ <i>(2–3 дня)</i>\n"
        "• <b>Сложные проекты с WebApp и AI:</b> от 30 000 ₽ <i>(индивидуально)</i>\n\n"
        "🚀 <i>Все боты сдаются с гарантией, чистым кодом и инструкцией по развертыванию на сервере!</i>"
    )
    await callback.message.edit_text(text, reply_markup=portfolio_kb())
    await callback.answer()


# ==================== MODULE 5: ADMIN PANEL ====================

@dp.callback_query(F.data == "demo_admin")
async def cb_demo_admin(callback: types.CallbackQuery):
    """Admin dashboard entrypoint."""
    user_id = callback.from_user.id
    is_admin = (user_id == ADMIN_ID)

    stats = await db.get_dashboard_stats()

    admin_badge = "👑 <b>Панель Администратора (Режим Владельца)</b>" if is_admin else "⚙️ <b>Панель Администратора (Демо-просмотр)</b>"

    text = (
        f"{admin_badge}\n\n"
        f"📊 <b>Сводная аналитика системы:</b>\n"
        f"👥 <b>Всего пользователей в БД:</b> <code>{stats['total_users']}</code>\n"
        f"🛍 <b>Оформлено заказов (Магазин):</b> <code>{stats['total_orders']}</code>\n"
        f"💵 <b>Сумма заказов:</b> <code>{stats['total_revenue']} ₽</code>\n"
        f"📅 <b>Активных записей на услуги:</b> <code>{stats['active_appointments']}</code>\n"
        f"💼 <b>Заявок на IT-разработку:</b> <code>{stats['total_leads']}</code>\n\n"
        f"<i>Управляйте заявками и выполняйте рассылки с помощью кнопок ниже:</i>"
    )

    await callback.message.edit_text(text, reply_markup=admin_dashboard_kb())
    await callback.answer()


@dp.callback_query(F.data == "admin_orders")
async def cb_admin_orders(callback: types.CallbackQuery):
    """View latest orders."""
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("🔒 Полный просмотр доступен только администратору бота.", show_alert=True)
        return

    orders = await db.get_latest_orders(5)
    if not orders:
        text = "🛍 <b>Заказов в базе пока нет.</b>"
    else:
        text = "🛍 <b>Последние 5 заказов (Магазин):</b>\n\n"
        for o in orders:
            text += (
                f"🔹 <b>Заказ #{o['id']}</b> ({o['created_at']})\n"
                f"• Клиент: {o['customer_name']} (тел: <code>{o['phone']}</code>)\n"
                f"• Адрес: {o['address']}\n"
                f"• Сумма: <b>{o['total_price']} ₽</b>\n"
                f"• Статус: {o['status']}\n\n"
            )

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="◀️ Назад в админку", callback_data="demo_admin"))
    await callback.message.edit_text(text, reply_markup=builder.as_markup())
    await callback.answer()


@dp.callback_query(F.data == "admin_bookings")
async def cb_admin_bookings(callback: types.CallbackQuery):
    """View latest bookings."""
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("🔒 Полный просмотр доступен только администратору бота.", show_alert=True)
        return

    bookings = await db.get_latest_appointments(5)
    if not bookings:
        text = "📅 <b>Записей на услуги в базе пока нет.</b>"
    else:
        text = "📅 <b>Последние 5 записей на услуги:</b>\n\n"
        for b in bookings:
            text += (
                f"🔹 <b>Запись #{b['id']}</b> ({b['created_at']})\n"
                f"• Клиент: {b['customer_name']} (тел: <code>{b['phone']}</code>)\n"
                f"• Услуга: {b['service']}\n"
                f"• Время: {b['date']} в {b['time']}\n"
                f"• Статус: {b['status']}\n\n"
            )

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="◀️ Назад в админку", callback_data="demo_admin"))
    await callback.message.edit_text(text, reply_markup=builder.as_markup())
    await callback.answer()


@dp.callback_query(F.data == "admin_leads")
async def cb_admin_leads(callback: types.CallbackQuery):
    """View latest IT leads."""
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("🔒 Полный просмотр доступен только администратору бота.", show_alert=True)
        return

    leads = await db.get_latest_leads(5)
    if not leads:
        text = "💼 <b>Заявок на IT-разработку пока нет.</b>"
    else:
        text = "💼 <b>Последние 5 заявок на расчет:</b>\n\n"
        for l in leads:
            text += (
                f"🔹 <b>Заявка #{l['id']}</b> ({l['created_at']})\n"
                f"• Тип: {l['project_type']}\n"
                f"• Бюджет: {l['budget']}\n"
                f"• Контакт: <code>{l['phone']}</code>\n"
                f"• ТЗ: <i>{l['description']}</i>\n\n"
            )

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="◀️ Назад в админку", callback_data="demo_admin"))
    await callback.message.edit_text(text, reply_markup=builder.as_markup())
    await callback.answer()


@dp.callback_query(F.data == "admin_test_alert")
async def cb_admin_test_alert(callback: types.CallbackQuery):
    """Test admin alert dispatch."""
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("🔒 Доступно только администратору.", show_alert=True)
        return

    try:
        await bot.send_message(
            chat_id=ADMIN_ID,
            text=f"🔔 <b>Тестовое уведомление!</b>\n\nСистема оповещений работает в штатном режиме.\nВремя проверки: {datetime.now().strftime('%H:%M:%S')}"
        )
        await callback.answer("✅ Тестовое уведомление успешно отправлено вам в ЛС!", show_alert=True)
    except Exception as e:
        await callback.answer(f"❌ Ошибка отправки: {e}", show_alert=True)


@dp.callback_query(F.data == "admin_broadcast")
async def cb_admin_broadcast(callback: types.CallbackQuery, state: FSMContext):
    """Start broadcast FSM."""
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("🔒 Рассылка доступна только администратору.", show_alert=True)
        return

    await state.set_state(BroadcastFSM.text)
    text = (
        "📢 <b>Рассылка сообщений по базе пользователей</b>\n\n"
        "Отправьте текст сообщения для рассылки всем зарегистрированным пользователям бота.\n"
        "<i>(Поддерживается HTML-разметка)</i>"
    )
    await callback.message.edit_text(text, reply_markup=cancel_fsm_kb("demo_admin"))
    await callback.answer()


@dp.message(BroadcastFSM.text)
async def process_broadcast_text(message: types.Message, state: FSMContext):
    """Confirm and execute broadcast."""
    broadcast_text = message.text
    users = await db.get_all_users()
    total_users = len(users)

    sent_count = 0
    fail_count = 0

    status_msg = await message.answer(f"⏳ Начинаю рассылку для {total_users} пользователей...")

    for u in users:
        try:
            await bot.send_message(chat_id=u["user_id"], text=f"📢 <b>Сообщение от администрации:</b>\n\n{broadcast_text}")
            sent_count += 1
            await asyncio.sleep(0.05)  # small throttle
        except Exception:
            fail_count += 1

    await state.clear()
    report = (
        f"✅ <b>Рассылка завершена!</b>\n\n"
        f"• Успешно доставлено: <b>{sent_count}</b>\n"
        f"• Ошибок (бот заблокирован): <b>{fail_count}</b>\n"
        f"• Всего в базе: <b>{total_users}</b>"
    )
    await status_msg.edit_text(report, reply_markup=admin_dashboard_kb())


# ==================== MAIN LAUNCHER ====================

async def main():
    """Bot startup and initialization."""
    logger.info("Initializing SQLite database...")
    await db.init_db()
    logger.info("Database initialized successfully!")

    # Verify bot credentials
    me = await bot.get_me()
    logger.info(f"Bot connected: @{me.username} (ID: {me.id})")
    logger.info(f"Admin ID: {ADMIN_ID}")

    # Start Polling
    logger.info("Starting Telegram Bot Polling...")
    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped by user.")
