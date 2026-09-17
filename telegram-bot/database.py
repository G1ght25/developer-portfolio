"""
Database module for Telegram Portfolio Bot
Using aiosqlite for asynchronous SQLite operations
"""

import aiosqlite
from typing import List, Dict, Any, Optional

DB_NAME = "demo_bot.db"


async def init_db():
    """Initialize database tables and seed initial data if empty."""
    async with aiosqlite.connect(DB_NAME) as db:
        # Users table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                full_name TEXT,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Products table for Demo 1 (E-commerce / Food Delivery)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                price INTEGER NOT NULL
            )
        """)

        # Cart table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                UNIQUE(user_id, product_id),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        """)

        # Orders table for Demo 1
        await db.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                items_summary TEXT NOT NULL,
                total_price INTEGER NOT NULL,
                status TEXT DEFAULT 'Новый',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Appointments table for Demo 2 (Booking)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                customer_name TEXT NOT NULL,
                service TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                phone TEXT NOT NULL,
                status TEXT DEFAULT 'Активна',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Leads table for Demo 3 (Cost Calculator / Quote requests)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                project_type TEXT NOT NULL,
                budget TEXT NOT NULL,
                description TEXT NOT NULL,
                phone TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.commit()

        # Seed initial products if table is empty
        cursor = await db.execute("SELECT COUNT(*) FROM products")
        count = (await cursor.fetchone())[0]

        if count == 0:
            sample_products = [
                # Сеты
                ("Сеты", "🍣 Сет «Филадельфия MAX»", "32 шт. Классическая Филадельфия, Филадельфия с угрем, Спешл с авокадо и Гриль", 1390),
                ("Сеты", "🔥 Сет «Горячий Килограмм»", "32 шт. Запеченные роллы с лососем, крабом, тигровой креветкой и острый темпура", 1090),
                ("Сеты", "👑 Сет «Императорский Дракон»", "40 шт. Зеленый Дракон, Красный Дракон, Угорь унаги, Нежный тунец и Лосось", 1790),
                # Роллы
                ("Роллы", "🥑 Филадельфия Classic", "8 шт. Премиальный охлажденный лосось, сыр Cremette, спелый авокадо", 420),
                ("Роллы", "🦀 Калифорния с крабом", "8 шт. Снежный краб, икра тобико, хрустящий огурец, японский майонез", 360),
                ("Роллы", "🍤 Запеченный с креветкой", "8 шт. Тигровая креветка под нежной сырно-чесночной шапочкой с соусом унаги", 450),
                ("Роллы", "🥢 Темпура с копченым угрем", "8 шт. Хрустящий горячий ролл в сухарях панко с угрем и кунжутом", 480),
                # Напитки
                ("Напитки", "🫐 Домашний морс (Облепиха)", "0.5 л. Натуральный ягодный морс собственного приготовления без консервантов", 130),
                ("Напитки", "🍋 Лимонад Цитрус-Мята", "0.5 л. Освежающий лимонад из свежевыжатого сока апельсина, лайма и мяты", 150),
                ("Напитки", "🍵 Холодный зеленый чай с жасмином", "0.5 л. Натуральный заваренный китайский чай с жасмином и лемонграссом", 120),
            ]
            await db.executemany(
                "INSERT INTO products (category, name, description, price) VALUES (?, ?, ?, ?)",
                sample_products
            )
            await db.commit()


# ==================== USERS ====================

async def register_user(user_id: int, username: Optional[str], full_name: Optional[str]):
    """Register or update user in database."""
    async with aiosqlite.connect(DB_NAME) as db:
        await db.execute("""
            INSERT INTO users (user_id, username, full_name)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                username = excluded.username,
                full_name = excluded.full_name
        """, (user_id, username, full_name))
        await db.commit()


async def get_all_users() -> List[Dict[str, Any]]:
    """Get all registered users for broadcast."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT user_id, username, full_name, joined_at FROM users") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


# ==================== PRODUCTS & CART ====================

async def get_categories() -> List[str]:
    """Get distinct categories from products."""
    async with aiosqlite.connect(DB_NAME) as db:
        async with db.execute("SELECT DISTINCT category FROM products ORDER BY category") as cursor:
            rows = await cursor.fetchall()
            return [row[0] for row in rows]


async def get_products_by_category(category: str) -> List[Dict[str, Any]]:
    """Get products list for a given category."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, category, name, description, price FROM products WHERE category = ?",
            (category,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_product_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    """Get single product by id."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, category, name, description, price FROM products WHERE id = ?",
            (product_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def add_to_cart(user_id: int, product_id: int, quantity: int = 1):
    """Add or increment product quantity in user's cart."""
    async with aiosqlite.connect(DB_NAME) as db:
        await db.execute("""
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, product_id) DO UPDATE SET
                quantity = quantity + excluded.quantity
        """, (user_id, product_id, quantity))
        await db.commit()


async def remove_from_cart(user_id: int, product_id: int):
    """Remove single item completely from user's cart."""
    async with aiosqlite.connect(DB_NAME) as db:
        await db.execute("DELETE FROM cart WHERE user_id = ? AND product_id = ?", (user_id, product_id))
        await db.commit()


async def decrement_from_cart(user_id: int, product_id: int):
    """Decrement quantity or remove if quantity becomes 0."""
    async with aiosqlite.connect(DB_NAME) as db:
        cursor = await db.execute("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?", (user_id, product_id))
        row = await cursor.fetchone()
        if row:
            if row[0] > 1:
                await db.execute("UPDATE cart SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?", (user_id, product_id))
            else:
                await db.execute("DELETE FROM cart WHERE user_id = ? AND product_id = ?", (user_id, product_id))
            await db.commit()


async def get_user_cart(user_id: int) -> List[Dict[str, Any]]:
    """Get detailed cart contents for a user."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("""
            SELECT c.product_id, c.quantity, p.name, p.price, (c.quantity * p.price) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        """, (user_id,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def clear_user_cart(user_id: int):
    """Clear all items in user's cart."""
    async with aiosqlite.connect(DB_NAME) as db:
        await db.execute("DELETE FROM cart WHERE user_id = ?", (user_id,))
        await db.commit()


# ==================== ORDERS ====================

async def create_order(user_id: int, customer_name: str, phone: str, address: str, items_summary: str, total_price: int) -> int:
    """Create a new order and clear cart."""
    async with aiosqlite.connect(DB_NAME) as db:
        cursor = await db.execute("""
            INSERT INTO orders (user_id, customer_name, phone, address, items_summary, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, customer_name, phone, address, items_summary, total_price))
        order_id = cursor.lastrowid
        await db.execute("DELETE FROM cart WHERE user_id = ?", (user_id,))
        await db.commit()
        return order_id


async def get_latest_orders(limit: int = 5) -> List[Dict[str, Any]]:
    """Get latest orders for admin."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, user_id, customer_name, phone, address, items_summary, total_price, status, created_at FROM orders ORDER BY id DESC LIMIT ?",
            (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


# ==================== APPOINTMENTS ====================

async def create_appointment(user_id: int, customer_name: str, service: str, date: str, time: str, phone: str) -> int:
    """Create a new service appointment."""
    async with aiosqlite.connect(DB_NAME) as db:
        cursor = await db.execute("""
            INSERT INTO appointments (user_id, customer_name, service, date, time, phone)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, customer_name, service, date, time, phone))
        appointment_id = cursor.lastrowid
        await db.commit()
        return appointment_id


async def get_user_active_appointments(user_id: int) -> List[Dict[str, Any]]:
    """Get active appointments for a specific user."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("""
            SELECT id, service, date, time, phone, status, created_at
            FROM appointments
            WHERE user_id = ? AND status = 'Активна'
            ORDER BY id DESC
        """, (user_id,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def cancel_appointment(appointment_id: int, user_id: int) -> bool:
    """Cancel an appointment."""
    async with aiosqlite.connect(DB_NAME) as db:
        cursor = await db.execute(
            "UPDATE appointments SET status = 'Отменена' WHERE id = ? AND (user_id = ? OR ? = 0)",
            (appointment_id, user_id, user_id)
        )
        await db.commit()
        return cursor.rowcount > 0


async def get_latest_appointments(limit: int = 5) -> List[Dict[str, Any]]:
    """Get latest appointments for admin."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, user_id, customer_name, service, date, time, phone, status, created_at FROM appointments ORDER BY id DESC LIMIT ?",
            (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


# ==================== LEADS / QUOTES ====================

async def create_lead(user_id: int, project_type: str, budget: str, description: str, phone: str) -> int:
    """Create a new IT project lead."""
    async with aiosqlite.connect(DB_NAME) as db:
        cursor = await db.execute("""
            INSERT INTO leads (user_id, project_type, budget, description, phone)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, project_type, budget, description, phone))
        lead_id = cursor.lastrowid
        await db.commit()
        return lead_id


async def get_latest_leads(limit: int = 5) -> List[Dict[str, Any]]:
    """Get latest leads for admin."""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, user_id, project_type, budget, description, phone, created_at FROM leads ORDER BY id DESC LIMIT ?",
            (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


# ==================== STATS ====================

async def get_dashboard_stats() -> Dict[str, Any]:
    """Get aggregated statistics for admin dashboard."""
    async with aiosqlite.connect(DB_NAME) as db:
        # Users count
        cursor = await db.execute("SELECT COUNT(*) FROM users")
        total_users = (await cursor.fetchone())[0]

        # Orders count and revenue
        cursor = await db.execute("SELECT COUNT(*), COALESCE(SUM(total_price), 0) FROM orders")
        orders_row = await cursor.fetchone()
        total_orders = orders_row[0]
        total_revenue = orders_row[1]

        # Appointments count
        cursor = await db.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Активна'")
        active_appointments = (await cursor.fetchone())[0]

        # Leads count
        cursor = await db.execute("SELECT COUNT(*) FROM leads")
        total_leads = (await cursor.fetchone())[0]

        return {
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "active_appointments": active_appointments,
            "total_leads": total_leads
        }
