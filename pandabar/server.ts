import {
  EnterpriseRole,
  ORDER_FSM_RULES,
  validateFSMTransition,
  setupEnterpriseSecurityTables,
  logAuditEvent,
  generateTokenPair,
  createActiveSession,
  revokeUserSessions,
  revokeSingleSession,
  authenticateToken,
  authorizeRoles,
  maintenanceGuard,
  getMaintenanceStatus,
  setMaintenanceMode,
  getHealthStatus,
  createDatabaseBackup
} from "./src/server/securityService.js";
import crypto from "crypto";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PandaBar - Full-Stack Express Server with SQLite Database
 * Security: Helmet, CORS, Rate Limiting, Input Validation
 */

import fs from "fs";
import path from "path";

// Zero-dependency .env file parser
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    for (const line of envConfig.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
} catch (e) {
  // Silent fallback
}
import express from "express";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { MENU_ITEMS, PROMO_CODES, DEFAULT_WAREHOUSE_STOCK, DEFAULT_OPEX } from "./src/data/menuData.js";
import { Order, OrderStatus, StatusTimelineEvent, User, WarehouseIngredient, OperationalExpenses, AnalyticsSummary, AnalyticsChartPoint, KitchenStatus, DailyZReport, CutleryKits } from "./src/types";

const app = express();
app.set("trust proxy", 1);
const PORT = parseInt(process.env.PORT || "3000", 10);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ADMIN_SECRET = process.env.ADMIN_SECRET && process.env.ADMIN_SECRET !== "dev-secret-change-in-prod"
  ? process.env.ADMIN_SECRET
  : crypto.randomBytes(32).toString("hex");

// In-Memory State for Warehouse Inventory, Operational Expenses & Kitchen Emergency Stop
let warehouseStock: WarehouseIngredient[] = JSON.parse(JSON.stringify(DEFAULT_WAREHOUSE_STOCK));
let opexSettings: OperationalExpenses = { ...DEFAULT_OPEX };
let kitchenStatus: KitchenStatus = {
  isOpen: true,
  pauseReason: "",
  pauseUntil: null,
  updatedAt: Date.now()
};

// Server-Sent Events (SSE) Broadcast Engine
const sseClients = new Set<express.Response>();

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data, timestamp: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Automatic Warehouse Deduction Engine based on Recipe Ingredients
function deductWarehouseStock(items: any[]): void {
  if (!items || !Array.isArray(items)) return;
  for (const cartItem of items) {
    const qty = cartItem.quantity || 1;
    const prodId = cartItem.product?.id || cartItem.id;
    const product = MENU_ITEMS.find(m => m.id === prodId) || cartItem.product;
    if (product && Array.isArray(product.ingredients)) {
      for (const ing of product.ingredients) {
        const stockItem = warehouseStock.find(w => w.id === ing.id);
        if (stockItem) {
          let deduction = 0;
          if (stockItem.unit === "кг" && ing.unit === "г") {
            deduction = (ing.amount / 1000) * qty;
          } else if (stockItem.unit === "л" && ing.unit === "мл") {
            deduction = (ing.amount / 1000) * qty;
          } else {
            deduction = ing.amount * qty;
          }
          stockItem.stock = Math.max(0, parseFloat((stockItem.stock - deduction).toFixed(2)));
          stockItem.usedToday = parseFloat(((stockItem.usedToday || 0) + deduction).toFixed(2));
          stockItem.usedPeriod = parseFloat(((stockItem.usedPeriod || 0) + deduction).toFixed(2));
          if (db) {
            db.run(
              "UPDATE inventory SET stock = ?, usedToday = ?, usedPeriod = ? WHERE id = ?",
              stockItem.stock, stockItem.usedToday, stockItem.usedPeriod, stockItem.id
            ).catch(() => {});
          }
        }
      }
    }
  }
}

// ─── Security Middleware ───────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Слишком много запросов. Попробуйте позже." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Слишком много попыток входа. Подождите 15 минут." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Лимит admin-запросов исчерпан." },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/admin/", adminLimiter);

app.use((req, res, next) => authenticateToken(db)(req, res, next));
app.use(maintenanceGuard);


// ─── Cryptographic Authentication & Security Helpers ──────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "sushi-panda-production-security-salt-2026";

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  try {
    const { hash: calculatedHash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(calculatedHash, "hex"));
  } catch {
    return false;
  }
}

function createAuthToken(user: { id: string; role: string; phone: string }): string {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    phone: user.phone,
    exp: Date.now() + 30 * 24 * 3600 * 1000 // 30 days session
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAuthToken(token: string): { id: string; role: string; phone: string } | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function getRequestUser(req: express.Request): { id: string; role: string; phone: string } | null {
  const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
  const user = verifyAuthToken(token);
  if (user) {
    (req as any).user = user;
  }
  return user;
}

function requireAuth(req: express.Request, res: express.Response, allowedRoles?: string[]): { id: string; role: string; phone: string } | null {
  const u = (req as any).user || getRequestUser(req);
  if (!u) {
    res.status(401).json({ success: false, error: "Требуется авторизация" });
    return null;
  }
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(u.role) && u.role !== "owner" && u.role !== "admin" && u.role !== "sysadmin") {
      res.status(403).json({ success: false, error: "Недостаточно прав доступа для этой роли" });
      return null;
    }
  }
  return u;
}

function requireStaffAuth(req: express.Request, res: express.Response): { id: string; role: string; phone: string } | null {
  const secretHeader = req.headers["x-admin-secret"];
  if (secretHeader && secretHeader === ADMIN_SECRET) {
    const adminUser = { id: "sys-admin-secret", role: "admin", phone: "+79999999999" };
    (req as any).user = adminUser;
    return adminUser;
  }
  const u = (req as any).user || getRequestUser(req);
  if (!u) {
    res.status(401).json({ success: false, error: "Требуется авторизация персонала" });
    return null;
  }
  if (!['manager', 'admin', 'sysadmin', 'owner', 'kitchen', 'chef', 'courier'].includes(u.role)) {
    res.status(403).json({ success: false, error: "Доступ запрещен: требуется служебный доступ" });
    return null;
  }
  return u;
}

function requireAdminAuth(req: express.Request, res: express.Response): { id: string; role: string; phone: string } | null {
  const secretHeader = req.headers["x-admin-secret"];
  if (secretHeader && secretHeader === ADMIN_SECRET) {
    const adminUser = { id: "sys-admin-secret", role: "admin", phone: "+79999999999" };
    (req as any).user = adminUser;
    return adminUser;
  }
  const u = (req as any).user || getRequestUser(req);
  if (!u) {
    res.status(401).json({ success: false, error: "Требуется авторизация администратора" });
    return null;
  }
  if (!['admin', 'sysadmin', 'owner'].includes(u.role)) {
    res.status(403).json({ success: false, error: "Доступ запрещен: требуются права администратора" });
    return null;
  }
  return u;
}

function requireAdminSecret(req: express.Request, res: express.Response): boolean {
  return !!requireStaffAuth(req, res);
}


// ─── Database Setup (SQLite) ───────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const SQLITE_DB_FILE = path.join(DATA_DIR, "database.db");
const JSON_DB_FILE = path.join(DATA_DIR, "db.json");

let db: any;

interface SqliteUser {
  id: string;
  name: string;
  phone: string;
  password_hash?: string | null;
  password_salt?: string | null;
  role?: string | null;
  status?: string | null;
  email: string | null;
  address_street: string | null;
  address_house: string | null;
  address_apartment: string | null;
  address_entrance: string | null;
  address_floor: string | null;
  address_intercom: string | null;
  createdAt: number;
}

interface SqliteOrder {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: string;
  address_street: string | null;
  address_house: string | null;
  address_apartment: string | null;
  address_entrance: string | null;
  address_floor: string | null;
  address_intercom: string | null;
  pickupLocation: string | null;
  paymentMethod: string;
  items: string; // JSON string
  total: number;
  deliveryFee: number;
  discount: number;
  status: string;
  statusTimeline: string; // JSON string
  createdAt: number;
  estimatedTime: string;
  timingType?: string | null;
  targetTime?: string | null;
  targetTimestamp?: number | null;
  isPreorder?: number | null;
  personsCount?: number | null;
  chopsticksCount?: number | null;
  trainingChopsticksCount?: number | null;
  cutleryKits?: string | null; // JSON string
  changeFrom?: number | null;
  isPosOrder?: number | null;
  notes: string | null;
}

function mapSqliteUser(row: SqliteUser, token?: string): User {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    role: (row.role as any) || "client",
    token: token,
    email: row.email || undefined,
    address: row.address_street ? {
      street: row.address_street,
      house: row.address_house || "",
      apartment: row.address_apartment || undefined,
      entrance: row.address_entrance || undefined,
      floor: row.address_floor || undefined,
      intercom: row.address_intercom || undefined,
    } : undefined,
    createdAt: row.createdAt
  };
}

function mapSqliteOrder(row: SqliteOrder): Order {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    userPhone: row.userPhone,
    type: row.type as "delivery" | "pickup" | "dine_in",
    address: row.address_street ? {
      street: row.address_street,
      house: row.address_house || "",
      apartment: row.address_apartment || undefined,
      entrance: row.address_entrance || undefined,
      floor: row.address_floor || undefined,
      intercom: row.address_intercom || undefined,
    } : undefined,
    pickupLocation: row.pickupLocation || undefined,
    paymentMethod: row.paymentMethod as any,
    items: typeof row.items === "string" ? JSON.parse(row.items) : (row.items || []),
    total: row.total,
    deliveryFee: row.deliveryFee,
    discount: row.discount,
    status: row.status as OrderStatus,
    statusTimeline: typeof row.statusTimeline === "string" ? JSON.parse(row.statusTimeline) : (row.statusTimeline || []),
    createdAt: row.createdAt,
    estimatedTime: row.estimatedTime,
    timingType: (row.timingType as any) || (row.isPreorder ? "scheduled" : "asap"),
    targetTime: row.targetTime || undefined,
    targetTimestamp: row.targetTimestamp || undefined,
    isPreorder: Boolean(row.isPreorder),
    personsCount: row.personsCount || undefined,
    chopsticksCount: row.chopsticksCount || undefined,
    trainingChopsticksCount: row.trainingChopsticksCount || undefined,
    cutleryKits: row.cutleryKits ? JSON.parse(row.cutleryKits) : undefined,
    changeFrom: row.changeFrom || undefined,
    isPosOrder: Boolean(row.isPosOrder),
    notes: row.notes || undefined
  };
}

function normalizePhone(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    const d = digits.slice(1);
    return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
  } else if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
  return raw.trim();
}

async function findUserByPhone(phone: string): Promise<SqliteUser | null> {
  if (!db || !phone) return null;
  const norm = normalizePhone(phone);
  const digits = phone.replace(/\D/g, "");
  const last10 = digits.slice(-10);

  try {
    let row = await db.get("SELECT * FROM users WHERE phone = ? OR phone = ?", phone, norm);
    if (!row && last10.length === 10) {
      row = await db.get(
        "SELECT * FROM users WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') LIKE ?",
        `%${last10}%`
      );
    }
    return row || null;
  } catch (err) {
    return null;
  }
}

async function populateSeedData(): Promise<void> {
  const seedUsers = [
    { id: "user-1", name: "Никита Мокрый", phone: "+7 (999) 111-22-33", email: "mokrijnikita@gmail.com", street: "ул. Ленина", house: "42", apt: "105" },
    { id: "user-2", name: "Анастасия Волкова", phone: "+7 (999) 456-78-90", email: "nastya.v@yandex.ru", street: "пр-кт Красноармейский", house: "72", apt: "14" },
    { id: "user-3", name: "Михаил Соколов", phone: "+7 (999) 789-01-23", email: "m.sokolov@mail.ru", street: "ул. Павловский тракт", house: "134", apt: "56" },
    { id: "user-4", name: "Екатерина Попова", phone: "+7 (999) 321-65-40", email: "katya.p@gmail.com", street: "ул. Малахова", house: "89", apt: "23" },
    { id: "user-5", name: "Артем Смирнов", phone: "+7 (999) 555-44-33", email: "artem.sm@rambler.ru", street: "ул. Попова", house: "110", apt: "78" },
    { id: "user-6", name: "София Морозова", phone: "+7 (999) 777-88-99", email: "sofia.m@bk.ru", street: "пр-кт Ленина", house: "15", apt: "4" }
  ];

  for (const u of seedUsers) {
    await db.run(
      `INSERT OR IGNORE INTO users (id, name, phone, email, address_street, address_house, address_apartment, address_entrance, address_floor, address_intercom, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      u.id, u.name, u.phone, u.email, u.street, u.house, u.apt, "1", "3", `${u.apt}к`, Date.now() - 1000 * 60 * 60 * 24 * 28
    );
  }

  // Pre-generate 36 rich historical orders distributed realistically over the past 30 days
  const now = Date.now();
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  const rawOrdersConfig = [
    // Today (3 orders)
    { hoursAgo: 1.5, user: seedUsers[0], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[3], q: 1 }], status: "cooking", type: "delivery", pay: "card_courier" },
    { hoursAgo: 3.5, user: seedUsers[1], items: [{ p: MENU_ITEMS[6], q: 2 }, { p: MENU_ITEMS[15], q: 1 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 5.0, user: seedUsers[2], items: [{ p: MENU_ITEMS[1], q: 1 }, { p: MENU_ITEMS[20], q: 2 }], status: "completed", type: "pickup", pay: "cash" },

    // Yesterday (4 orders)
    { hoursAgo: 26, user: seedUsers[3], items: [{ p: MENU_ITEMS[2], q: 1 }, { p: MENU_ITEMS[16], q: 1 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 30, user: seedUsers[4], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[10], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 34, user: seedUsers[5], items: [{ p: MENU_ITEMS[18], q: 2 }, { p: MENU_ITEMS[22], q: 1 }], status: "completed", type: "pickup", pay: "online_mock" },
    { hoursAgo: 38, user: seedUsers[0], items: [{ p: MENU_ITEMS[6], q: 2 }, { p: MENU_ITEMS[4], q: 1 }], status: "completed", type: "delivery", pay: "cash" },

    // Day 3 to 7 (Week - 12 orders)
    { hoursAgo: 52, user: seedUsers[1], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[15], q: 2 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 58, user: seedUsers[2], items: [{ p: MENU_ITEMS[1], q: 2 }, { p: MENU_ITEMS[7], q: 1 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 74, user: seedUsers[3], items: [{ p: MENU_ITEMS[2], q: 1 }, { p: MENU_ITEMS[18], q: 2 }], status: "completed", type: "pickup", pay: "online_mock" },
    { hoursAgo: 82, user: seedUsers[4], items: [{ p: MENU_ITEMS[6], q: 3 }, { p: MENU_ITEMS[20], q: 3 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 98, user: seedUsers[5], items: [{ p: MENU_ITEMS[0], q: 2 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 104, user: seedUsers[0], items: [{ p: MENU_ITEMS[15], q: 2 }, { p: MENU_ITEMS[16], q: 1 }], status: "completed", type: "pickup", pay: "cash" },
    { hoursAgo: 120, user: seedUsers[1], items: [{ p: MENU_ITEMS[10], q: 2 }, { p: MENU_ITEMS[11], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 128, user: seedUsers[2], items: [{ p: MENU_ITEMS[2], q: 1 }, { p: MENU_ITEMS[3], q: 2 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 144, user: seedUsers[3], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[22], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 152, user: seedUsers[4], items: [{ p: MENU_ITEMS[18], q: 3 }, { p: MENU_ITEMS[19], q: 2 }], status: "completed", type: "pickup", pay: "online_mock" },
    { hoursAgo: 160, user: seedUsers[5], items: [{ p: MENU_ITEMS[1], q: 1 }, { p: MENU_ITEMS[6], q: 2 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 166, user: seedUsers[0], items: [{ p: MENU_ITEMS[15], q: 1 }, { p: MENU_ITEMS[17], q: 1 }], status: "completed", type: "delivery", pay: "cash" },

    // Day 8 to 30 (Month - 17 orders)
    { hoursAgo: 190, user: seedUsers[1], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[2], q: 1 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 215, user: seedUsers[2], items: [{ p: MENU_ITEMS[6], q: 2 }, { p: MENU_ITEMS[10], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 240, user: seedUsers[3], items: [{ p: MENU_ITEMS[15], q: 3 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 265, user: seedUsers[4], items: [{ p: MENU_ITEMS[0], q: 2 }], status: "completed", type: "pickup", pay: "online_mock" },
    { hoursAgo: 290, user: seedUsers[5], items: [{ p: MENU_ITEMS[1], q: 2 }, { p: MENU_ITEMS[18], q: 2 }], status: "completed", type: "delivery", pay: "cash" },
    { hoursAgo: 320, user: seedUsers[0], items: [{ p: MENU_ITEMS[2], q: 2 }, { p: MENU_ITEMS[6], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 350, user: seedUsers[1], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[16], q: 1 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 380, user: seedUsers[2], items: [{ p: MENU_ITEMS[10], q: 3 }, { p: MENU_ITEMS[20], q: 4 }], status: "completed", type: "pickup", pay: "online_mock" },
    { hoursAgo: 410, user: seedUsers[3], items: [{ p: MENU_ITEMS[1], q: 2 }, { p: MENU_ITEMS[15], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 450, user: seedUsers[4], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[6], q: 2 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 490, user: seedUsers[5], items: [{ p: MENU_ITEMS[2], q: 2 }, { p: MENU_ITEMS[18], q: 3 }], status: "completed", type: "delivery", pay: "cash" },
    { hoursAgo: 530, user: seedUsers[0], items: [{ p: MENU_ITEMS[15], q: 2 }, { p: MENU_ITEMS[17], q: 2 }], status: "completed", type: "pickup", pay: "online_mock" },
    { hoursAgo: 570, user: seedUsers[1], items: [{ p: MENU_ITEMS[0], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 610, user: seedUsers[2], items: [{ p: MENU_ITEMS[6], q: 3 }, { p: MENU_ITEMS[10], q: 2 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 650, user: seedUsers[3], items: [{ p: MENU_ITEMS[1], q: 1 }, { p: MENU_ITEMS[2], q: 1 }], status: "completed", type: "delivery", pay: "online_mock" },
    { hoursAgo: 690, user: seedUsers[4], items: [{ p: MENU_ITEMS[0], q: 1 }, { p: MENU_ITEMS[15], q: 2 }], status: "completed", type: "delivery", pay: "card_courier" },
    { hoursAgo: 710, user: seedUsers[5], items: [{ p: MENU_ITEMS[18], q: 2 }, { p: MENU_ITEMS[22], q: 3 }], status: "cancelled", type: "delivery", pay: "online_mock" }
  ];

  for (let i = 0; i < rawOrdersConfig.length; i++) {
    const cfg = rawOrdersConfig[i];
    const orderId = `order-seed-${100 + i}`;
    const orderTime = now - cfg.hoursAgo * ONE_HOUR;

    const orderItems = cfg.items.map(it => ({
      product: it.p,
      quantity: it.q
    }));

    const totalSum = orderItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);

    const timeline = [
      { status: "pending", title: "Заказ принят", description: "Ожидает подтверждения", timestamp: orderTime },
      { status: "confirmed", title: "Подтвержден", description: "Кухня начала готовить", timestamp: orderTime + 5 * 60 * 1000 },
      { status: "cooking", title: "Готовится", description: "Блюда готовятся", timestamp: orderTime + 15 * 60 * 1000 }
    ];

    if (cfg.status === "completed") {
      timeline.push({ status: "delivering", title: "В пути", description: "Курьер доставляет", timestamp: orderTime + 35 * 60 * 1000 });
      timeline.push({ status: "completed", title: "Доставлен", description: "Заказ успешно доставлен", timestamp: orderTime + 50 * 60 * 1000 });
    } else if (cfg.status === "cancelled") {
      timeline.push({ status: "cancelled", title: "Отменен", description: "Заказ отменен клиентом", timestamp: orderTime + 10 * 60 * 1000 });
    }

    await db.run(
      `INSERT OR IGNORE INTO orders (id, userId, userName, userPhone, type, address_street, address_house, address_apartment, address_entrance, address_floor, address_intercom, pickupLocation, paymentMethod, items, total, deliveryFee, discount, status, statusTimeline, createdAt, estimatedTime, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      orderId,
      cfg.user.id,
      cfg.user.name,
      cfg.user.phone,
      cfg.type,
      cfg.type === "delivery" ? cfg.user.street : null,
      cfg.type === "delivery" ? cfg.user.house : null,
      cfg.type === "delivery" ? cfg.user.apt : null,
      "1", "3", "14к",
      cfg.type === "pickup" ? "ул. Ленина, д. 42 (Главный филиал)" : null,
      cfg.pay,
      JSON.stringify(orderItems),
      totalSum,
      0,
      0,
      cfg.status,
      JSON.stringify(timeline),
      orderTime,
      cfg.status === "completed" ? "Доставлен" : "45 мин.",
      "Бесконтактная доставка"
    );
  }
}

async function initDb(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    const { open: openSqlite } = await import("sqlite");
    const sqlite3Module = await import("sqlite3");
    db = await openSqlite({
      filename: SQLITE_DB_FILE,
      driver: (sqlite3Module.default && sqlite3Module.default.Database) ? sqlite3Module.default.Database : sqlite3Module.Database,
    });
  } catch (err) {
    console.error("[DB] Could not open SQLite database, falling back to IN-MEMORY mock driver:", err);
    
    // In-memory data store
    const mockUsers: any[] = [];
    const mockOrders: any[] = [];
    
    db = {
      mock: true, // flag for auto-advancer
      get: async (sql: string, ...params: any[]) => {
        if (sql.includes("count(*) as count FROM users")) {
          return { count: mockUsers.length };
        }
        if (sql.includes("FROM users WHERE phone = ?")) {
          return mockUsers.find(u => u.phone === params[0]) || null;
        }
        if (sql.includes("FROM users WHERE id = ?")) {
          return mockUsers.find(u => u.id === params[0]) || null;
        }
        if (sql.includes("FROM orders WHERE id = ?")) {
          return mockOrders.find(o => o.id === params[0]) || null;
        }
        return null;
      },
      all: async (sql: string, ...params: any[]) => {
        let results = [...mockOrders].sort((a, b) => b.createdAt - a.createdAt);
        if (sql.includes("userId = ?")) {
          results = results.filter(o => o.userId === params[0]);
        }
        if (sql.includes("phone LIKE ?")) {
          const search = params[0].replace(/%/g, "");
          results = results.filter(o => o.userPhone.includes(search));
        }
        return results;
      },
      exec: async () => {},
      run: async (sql: string, ...params: any[]) => {
        if (sql.includes("INSERT OR IGNORE INTO users") || sql.includes("INSERT INTO users")) {
          const user = {
            id: params[0], name: params[1], phone: params[2], email: params[3],
            address_street: params[4], address_house: params[5], address_apartment: params[6],
            address_entrance: params[7], address_floor: params[8], address_intercom: params[9],
            createdAt: params[10]
          };
          if (!mockUsers.find(u => u.id === user.id || u.phone === user.phone)) {
            mockUsers.push(user);
          }
        }
        else if (sql.includes("UPDATE users SET name = ? WHERE id = ?")) {
          const user = mockUsers.find(u => u.id === params[1]);
          if (user) user.name = params[0];
        }
        else if (sql.includes("UPDATE users SET")) {
          // If it has 8 parameters (name, email, street... id)
          if (params.length === 9) {
            const user = mockUsers.find(u => u.id === params[8]);
            if (user) {
              user.name = params[0]; user.email = params[1]; user.address_street = params[2]; user.address_house = params[3];
              user.address_apartment = params[4]; user.address_entrance = params[5];
              user.address_floor = params[6]; user.address_intercom = params[7];
            }
          }
          // If it has 7 parameters (name, street, house... id) - from Checkout
          else if (params.length === 8) {
            const user = mockUsers.find(u => u.id === params[7]);
            if (user) {
              user.name = params[0]; user.address_street = params[1]; user.address_house = params[2];
              user.address_apartment = params[3]; user.address_entrance = params[4];
              user.address_floor = params[5]; user.address_intercom = params[6];
            }
          }
        }
        else if (sql.includes("INSERT OR IGNORE INTO orders") || sql.includes("INSERT INTO orders")) {
          const order = {
            id: params[0], userId: params[1], userName: params[2], userPhone: params[3], type: params[4],
            address_street: params[5], address_house: params[6], address_apartment: params[7],
            address_entrance: params[8], address_floor: params[9], address_intercom: params[10],
            pickupLocation: params[11], paymentMethod: params[12], items: params[13], total: params[14],
            deliveryFee: params[15], discount: params[16], status: params[17], statusTimeline: params[18],
            createdAt: params[19], estimatedTime: params[20], notes: params[21]
          };
          if (!mockOrders.find(o => o.id === order.id)) mockOrders.push(order);
        }
        else if (sql.includes("UPDATE orders SET")) {
          const orderId = params[params.length - 1];
          const order = mockOrders.find(o => o.id === orderId);
          if (order) {
            order.status = params[0];
            order.statusTimeline = params[1];
            if (params.length >= 4) {
              order.estimatedTime = params[2];
            }
          }
        }
        else if (sql.includes("DELETE FROM orders")) {
          mockOrders.length = 0;
        }
        else if (sql.includes("DELETE FROM users")) {
          mockUsers.length = 0;
        }
        return { lastID: 1, changes: 1 };
      },
      prepare: async () => ({
        run: async () => {}, get: async () => null, all: async () => [], finalize: async () => {}
      })
    };
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      address_street TEXT,
      address_house TEXT,
      address_apartment TEXT,
      address_entrance TEXT,
      address_floor TEXT,
      address_intercom TEXT,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      userPhone TEXT NOT NULL,
      type TEXT NOT NULL,
      address_street TEXT,
      address_house TEXT,
      address_apartment TEXT,
      address_entrance TEXT,
      address_floor TEXT,
      address_intercom TEXT,
      pickupLocation TEXT,
      paymentMethod TEXT NOT NULL,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      deliveryFee INTEGER NOT NULL,
      discount INTEGER NOT NULL,
      status TEXT NOT NULL,
      statusTimeline TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      estimatedTime TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      categoryLabel TEXT,
      stock REAL NOT NULL,
      unit TEXT NOT NULL,
      minThreshold REAL NOT NULL,
      costPerUnit REAL NOT NULL,
      usedToday REAL DEFAULT 0,
      usedPeriod REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  
  // Migrate users table columns for passwords and roles
  const userColumnsToEnsure = [
    "password_hash TEXT",
    "password_salt TEXT",
    "plain_pin TEXT",
    "role TEXT DEFAULT 'client'",
    "status TEXT DEFAULT 'active'"
  ];
  for (const colDef of userColumnsToEnsure) {
    try {
      await db.run(`ALTER TABLE users ADD COLUMN ${colDef}`);
    } catch (e) {}
  }
  try {
    await db.run("UPDATE users SET plain_pin = NULL");
  } catch (e) {}

  // Initialize default staff PINs
  const defaultPins = [
    { key: "pin_kitchen", value: "7701" },
    { key: "pin_courier", value: "8802" },
    { key: "pin_owner", value: "9903" },
    { key: "pin_admin", value: "1488" }
  ];
  for (const p of defaultPins) {
    try {
      const existing = await db.get("SELECT * FROM system_settings WHERE key = ?", p.key);
      if (!existing) {
        await db.run(
          "INSERT INTO system_settings (key, value, updatedAt) VALUES (?, ?, ?)",
          p.key, p.value, Date.now()
        );
      } else if (p.key === "pin_admin" && existing.value !== "1488") {
        await db.run("UPDATE system_settings SET value = ?, updatedAt = ? WHERE key = ?", p.value, Date.now(), p.key);
      }
    } catch (e) {}
  }

  // Migrate orders table columns if missing
  const orderColumnsToEnsure = [
    "timingType TEXT DEFAULT 'asap'",
    "targetTime TEXT",
    "targetTimestamp INTEGER",
    "isPreorder INTEGER DEFAULT 0",
    "personsCount INTEGER",
    "chopsticksCount INTEGER",
    "trainingChopsticksCount INTEGER",
    "cutleryKits TEXT",
    "changeFrom REAL",
    "isPosOrder INTEGER DEFAULT 0"
  ];
  for (const colDef of orderColumnsToEnsure) {
    try {
      await db.run(`ALTER TABLE orders ADD COLUMN ${colDef}`);
    } catch (e) {
      // Column already exists
    }
  }

  // Load persistent kitchen status
  try {
    const kStatusRow = await db.get("SELECT * FROM system_settings WHERE key = 'kitchen_status'") as any;
    if (kStatusRow && kStatusRow.value) {
      kitchenStatus = JSON.parse(kStatusRow.value);
    }
  } catch (e) {
    console.error("[DB] Error loading kitchen_status:", e);
  }

  try {
    const invCount = await db.get("SELECT count(*) as count FROM inventory") as { count: number };
    if (!invCount || invCount.count === 0) {
      for (const item of DEFAULT_WAREHOUSE_STOCK) {
        await db.run(
          `INSERT INTO inventory (id, name, category, categoryLabel, stock, unit, minThreshold, costPerUnit, usedToday, usedPeriod)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item.id, item.name, item.category, item.categoryLabel || item.category, item.stock, item.unit, item.minThreshold, item.costPerUnit, item.usedToday || 0, item.usedPeriod || 0
        );
      }
    }
    const invRows = await db.all("SELECT * FROM inventory") as any[];
    if (invRows && invRows.length > 0) {
      warehouseStock = invRows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        categoryLabel: r.categoryLabel || r.category,
        stock: r.stock,
        unit: r.unit,
        minThreshold: r.minThreshold,
        costPerUnit: r.costPerUnit,
        usedToday: r.usedToday || 0,
        usedPeriod: r.usedPeriod || 0
      }));
    }
  } catch (err) {
    console.error("[DB] Error initializing inventory table:", err);
  }

  // Seed data is completely disabled in production model to keep real orders clean.
  // Provision Main Administrator Account (+79937444590, pass: 1488, role: admin)
  try {
    const adminPhone = "+7 (993) 744-45-90";
    const existingAdmin = await findUserByPhone(adminPhone);
    const { hash: adminHash, salt: adminSalt } = hashPassword("1488");
    if (existingAdmin) {
      await db.run(
        "UPDATE users SET name = 'Администратор', role = 'admin', status = 'active', password_hash = ?, password_salt = ?, plain_pin = NULL WHERE id = ?",
        adminHash, adminSalt, existingAdmin.id
      );
    } else {
      await db.run(
        `INSERT INTO users (id, name, phone, password_hash, password_salt, plain_pin, role, status, createdAt)
         VALUES (?, ?, ?, ?, ?, NULL, 'admin', 'active', ?)`,
        "user-admin-main", "Администратор", adminPhone, adminHash, adminSalt, Date.now()
      );
    }
    console.log("[DB] Administrator account provisioned (+7 (993) 744-45-90).");
  } catch (err) {
    console.error("[DB] Error provisioning admin account:", err);
  }

  await setupEnterpriseSecurityTables(db);
  console.log("[DB] Production database ready (clean state).");
}

// ─── DB Helpers ────────────────────────────────────────────────────────────────

function generateOrderId(): string {
  return `order-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

function generateUserId(): string {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Input Validation Helpers ──────────────────────────────────────────────────

function sanitizeString(val: unknown, maxLen = 200): string {
  if (typeof val !== "string") return "";
  return val.trim().replace(/<[^>]*>/g, "").substring(0, maxLen);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 12;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Auth helpers defined globally above (requireStaffAuth, requireAdminAuth, requireAdminSecret)

// ─── User Logic ────────────────────────────────────────────────────────────────

async function getOrCreateUser(phone: string, name: string): Promise<User> {
  const norm = normalizePhone(phone);
  const row = await findUserByPhone(phone);
  if (!row) {
    const newUser: User = {
      id: generateUserId(),
      name: name || "Уважаемый Гость",
      phone: norm || phone,
      createdAt: Date.now()
    };
    await db.run(
      `INSERT INTO users (id, name, phone, createdAt) VALUES (?, ?, ?, ?)`,
      newUser.id,
      newUser.name,
      newUser.phone,
      newUser.createdAt
    );
    return newUser;
  }

  if (name && row.name !== name) {
    await db.run("UPDATE users SET name = ? WHERE id = ?", name, row.id);
    row.name = name;
  }
  return mapSqliteUser(row);
}

// ─── API Routes ────────────────────────────────────────────────────────────────

app.get("/api/proxy-image", async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      return res.status(400).send("Invalid image URL");
    }
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
      }
    });
    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.setHeader("Access-Control-Allow-Origin", "*");
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send("Image proxy error");
  }
});

app.get("/api/menu", (_req, res) => {
  res.json({
    success: true,
    menu: MENU_ITEMS,
    promoCodes: PROMO_CODES
  });
});

// ─── Realtime Server-Sent Events (SSE) Live Stream ─────────────────────────────

const handleSseStream = (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering (Nginx)
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial kitchen status immediately
  res.write(`data: ${JSON.stringify({ type: "KITCHEN_STATUS_CHANGED", data: kitchenStatus, timestamp: Date.now() })}\n\n`);

  // Heartbeat keep-alive every 15 seconds
  const pingInterval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: "PING", timestamp: Date.now() })}\n\n`);
    } catch (e) {
      clearInterval(pingInterval);
      sseClients.delete(res);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(pingInterval);
    sseClients.delete(res);
  });
};

app.get("/api/live-stream", handleSseStream);
app.get("/api/events", handleSseStream);

// ─── Kitchen Emergency Stop Status Endpoints ───────────────────────────────────

app.get("/api/kitchen-status", (_req, res) => {
  res.json({
    success: true,
    status: kitchenStatus
  });
});

app.post("/api/admin/kitchen-status", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  const { isOpen, pauseReason, pauseMinutes } = req.body;
  const now = Date.now();

  const openState = Boolean(isOpen);
  let pauseUntil: number | null = null;
  if (!openState && typeof pauseMinutes === "number" && pauseMinutes > 0) {
    pauseUntil = now + pauseMinutes * 60 * 1000;
  }

  kitchenStatus = {
    isOpen: openState,
    pauseReason: sanitizeString(pauseReason, 200) || (openState ? "" : "Технический перерыв"),
    pauseUntil: openState ? null : pauseUntil,
    updatedAt: now
  };

  try {
    if (db) {
      await db.run(
        `INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES (?, ?, ?)`,
        "kitchen_status",
        JSON.stringify(kitchenStatus),
        now
      );
    }
  } catch (err) {
    console.error("[Kitchen Status API] Error persisting to DB:", err);
  }

  // Broadcast to all active clients (Chef KDS, Customer storefront, Admin)
  broadcastEvent("KITCHEN_STATUS_CHANGED", kitchenStatus);

  return res.json({
    success: true,
    status: kitchenStatus
  });
});


// ─── Authentication Endpoints ──────────────────────────────────────────────────

// 1. Client Registration (Phone + Password)
app.post("/api/auth/register", async (req, res) => {
  const phone = sanitizeString(req.body.phone, 20);
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const name = sanitizeString(req.body.name, 100) || "Гость";

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: "Некорректный номер телефона" });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ success: false, error: "Пароль должен быть не менее 4 символов" });
  }

  try {
    const normPhone = normalizePhone(phone);
    const existing = await findUserByPhone(phone);
    if (existing && existing.password_hash) {
      return res.status(409).json({ success: false, error: "Пользователь с таким номером уже зарегистрирован. Пожалуйста, войдите." });
    }

    const { hash, salt } = hashPassword(password);
    let userRow: SqliteUser;

    if (existing) {
      await db.run(
        "UPDATE users SET name = ?, phone = ?, password_hash = ?, password_salt = ?, plain_pin = NULL, role = 'client', status = 'active' WHERE id = ?",
        name, normPhone, hash, salt, existing.id
      );
      userRow = (await db.get("SELECT * FROM users WHERE id = ?", existing.id)) as SqliteUser;
    } else {
      const id = generateUserId();
      const now = Date.now();
      await db.run(
        `INSERT INTO users (id, name, phone, password_hash, password_salt, plain_pin, role, status, createdAt)
         VALUES (?, ?, ?, ?, ?, NULL, 'client', 'active', ?)`,
        id, name, normPhone, hash, salt, now
      );
      userRow = (await db.get("SELECT * FROM users WHERE id = ?", id)) as SqliteUser;
    }

    const token = createAuthToken({ id: userRow.id, role: userRow.role || "client", phone: userRow.phone });
    return res.json({ success: true, user: mapSqliteUser(userRow, token) });
  } catch (err) {
    console.error("[Register API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

// 2. Staff Registration with Disguised Secret PIN
app.post("/api/auth/staff-register", async (req, res) => {
  const phone = sanitizeString(req.body.phone, 20);
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const name = sanitizeString(req.body.name, 100);
  const staffPin = sanitizeString(req.body.staffPin, 50).trim();

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: "Некорректный номер телефона" });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ success: false, error: "Пароль должен быть не менее 4 символов" });
  }
  if (!name) {
    return res.status(400).json({ success: false, error: "Укажите имя сотрудника" });
  }
  if (!staffPin) {
    return res.status(400).json({ success: false, error: "Служебный PIN-код допуска обязателен" });
  }

  try {
    const pinKitchenRow = await db.get("SELECT value FROM system_settings WHERE key = 'pin_kitchen'");
    const pinCourierRow = await db.get("SELECT value FROM system_settings WHERE key = 'pin_courier'");
    const pinOwnerRow = await db.get("SELECT value FROM system_settings WHERE key = 'pin_owner'");
    const pinAdminRow = await db.get("SELECT value FROM system_settings WHERE key = 'pin_admin'");

    const pinKitchen = pinKitchenRow?.value || "7701";
    const pinCourier = pinCourierRow?.value || "8802";
    const pinOwner = pinOwnerRow?.value || "9903";
    const pinAdmin = pinAdminRow?.value || "1488";

    let assignedRole: "chef" | "courier" | "owner" | "admin" | null = null;
    if (staffPin === pinKitchen) {
      assignedRole = "chef";
    } else if (staffPin === pinCourier) {
      assignedRole = "courier";
    } else if (staffPin === pinOwner) {
      assignedRole = "owner";
    } else if (staffPin === pinAdmin) {
      assignedRole = "admin";
    }

    if (!assignedRole) {
      return res.status(403).json({ success: false, error: "Неверный служебный код допуска. Регистрация отклонена." });
    }

    const normPhone = normalizePhone(phone);
    const { hash, salt } = hashPassword(password);
    const existing = await findUserByPhone(phone);
    let userRow: SqliteUser;

    if (existing) {
      await db.run(
        "UPDATE users SET name = ?, phone = ?, password_hash = ?, password_salt = ?, plain_pin = NULL, role = ?, status = 'active' WHERE id = ?",
        name, normPhone, hash, salt, assignedRole, existing.id
      );
      userRow = (await db.get("SELECT * FROM users WHERE id = ?", existing.id)) as SqliteUser;
    } else {
      const id = generateUserId();
      const now = Date.now();
      await db.run(
        `INSERT INTO users (id, name, phone, password_hash, password_salt, plain_pin, role, status, createdAt)
         VALUES (?, ?, ?, ?, ?, NULL, ?, 'active', ?)`,
        id, name, normPhone, hash, salt, assignedRole, now
      );
      userRow = (await db.get("SELECT * FROM users WHERE id = ?", id)) as SqliteUser;
    }

    const token = createAuthToken({ id: userRow.id, role: assignedRole, phone: userRow.phone });
    return res.json({ success: true, user: mapSqliteUser(userRow, token) });
  } catch (err) {
    console.error("[Staff Register API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

// 3. Universal Login (Client & Staff)
app.post("/api/auth/login", async (req, res) => {
  const phone = sanitizeString(req.body.phone, 20);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: "Некорректный номер телефона" });
  }

  try {
    const userRow = await findUserByPhone(phone);
    if (!userRow) {
      return res.status(404).json({ success: false, error: "Пользователь с таким номером не найден" });
    }

    if (userRow.status === "blocked") {
      return res.status(403).json({ success: false, error: "Ваш аккаунт заблокирован администратором" });
    }

    if (userRow.password_hash && userRow.password_salt) {
      if (!password) {
        return res.status(400).json({ success: false, error: "Введите пароль" });
      }
      const match = verifyPassword(password, userRow.password_hash, userRow.password_salt);
      if (!match) {
        return res.status(401).json({ success: false, error: "Неверный пароль" });
      }
    } else {
      if (password && password.length >= 4) {
        const { hash, salt } = hashPassword(password);
        await db.run("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", hash, salt, userRow.id);
        userRow.password_hash = hash;
        userRow.password_salt = salt;
      }
    }

    const role = (userRow.role as any) || "client";
    const token = createAuthToken({ id: userRow.id, role, phone: userRow.phone });
    return res.json({ success: true, user: mapSqliteUser(userRow, token) });
  } catch (err) {
    console.error("[Login API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

// 4. Session Verification Endpoint
app.get("/api/auth/me", async (req, res) => {
  const userPayload = getRequestUser(req);
  if (!userPayload) {
    return res.status(401).json({ success: false, error: "Не авторизован" });
  }
  try {
    const userRow = await db.get("SELECT * FROM users WHERE id = ?", userPayload.id) as SqliteUser;
    if (!userRow) {
      return res.status(404).json({ success: false, error: "Пользователь не найден" });
    }
    const token = createAuthToken({ id: userRow.id, role: userRow.role || "client", phone: userRow.phone });
    return res.json({ success: true, user: mapSqliteUser(userRow, token) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка сервера" });
  }
});

// 5. Staff PIN Management (Owner / Admin only)
app.get("/api/admin/staff-pins", async (req, res) => {
  const authUser = requireAuth(req, res, ["owner", "admin"]);
  if (!authUser) return;

  try {
    const k = await db.get("SELECT value FROM system_settings WHERE key = 'pin_kitchen'");
    const c = await db.get("SELECT value FROM system_settings WHERE key = 'pin_courier'");
    const o = await db.get("SELECT value FROM system_settings WHERE key = 'pin_owner'");
    return res.json({
      success: true,
      pins: {
        kitchen: k?.value || "7701",
        courier: c?.value || "8802",
        owner: o?.value || "9903"
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка получения PIN-кодов" });
  }
});

app.put("/api/admin/staff-pins", async (req, res) => {
  const authUser = requireAuth(req, res, ["owner", "admin"]);
  if (!authUser) return;

  const { kitchen, courier, owner } = req.body;
  try {
    const now = Date.now();
    if (kitchen && typeof kitchen === "string") {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES (?, ?, ?)", "pin_kitchen", kitchen.trim(), now);
    }
    if (courier && typeof courier === "string") {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES (?, ?, ?)", "pin_courier", courier.trim(), now);
    }
    if (owner && typeof owner === "string") {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES (?, ?, ?)", "pin_owner", owner.trim(), now);
    }
    return res.json({ success: true, message: "PIN-коды успешно обновлены" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка сохранения PIN-кодов" });
  }
});


app.put("/api/auth/profile", async (req, res) => {
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const targetUserId = sanitizeString(req.body.userId, 60) || authUser.id;
  if (authUser.id !== targetUserId && !['admin', 'sysadmin', 'owner'].includes(authUser.role)) {
    return res.status(403).json({ success: false, error: "Доступ запрещен: нельзя редактировать чужой профиль" });
  }
  const userId = targetUserId;
  const name = sanitizeString(req.body.name, 100);
  const email = req.body.email !== undefined ? sanitizeString(req.body.email, 254) : undefined;
  const address = req.body.address;

  if (!userId) {
    return res.status(400).json({ success: false, error: "ID пользователя обязателен" });
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ success: false, error: "Некорректный формат email" });
  }

  try {
    const userRow = await db.get("SELECT * FROM users WHERE id = ?", userId) as SqliteUser;
    if (!userRow) {
      return res.status(404).json({ success: false, error: "Пользователь не найден" });
    }

    const updatedName = name || userRow.name;
    const updatedEmail = email !== undefined ? (email || null) : userRow.email;

    let street = userRow.address_street;
    let house = userRow.address_house;
    let apartment = userRow.address_apartment;
    let entrance = userRow.address_entrance;
    let floor = userRow.address_floor;
    let intercom = userRow.address_intercom;

    if (address !== undefined) {
      if (address === null) {
        street = null;
        house = null;
        apartment = null;
        entrance = null;
        floor = null;
        intercom = null;
      } else {
        street = sanitizeString(address.street, 200) || null;
        house = sanitizeString(address.house, 20) || null;
        apartment = sanitizeString(address.apartment, 20) || null;
        entrance = sanitizeString(address.entrance, 10) || null;
        floor = sanitizeString(address.floor, 10) || null;
        intercom = sanitizeString(address.intercom, 30) || null;
      }
    }

    await db.run(
      `UPDATE users 
       SET name = ?, email = ?, address_street = ?, address_house = ?, address_apartment = ?, address_entrance = ?, address_floor = ?, address_intercom = ?
       WHERE id = ?`,
      updatedName,
      updatedEmail,
      street,
      house,
      apartment,
      entrance,
      floor,
      intercom,
      userId
    );

    const updatedUserRow = await db.get("SELECT * FROM users WHERE id = ?", userId) as SqliteUser;
    return res.json({ success: true, user: mapSqliteUser(updatedUserRow!) });
  } catch (err) {
    console.error("[Profile API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

app.post("/api/orders", async (req, res) => {
  const {
    userName: rawUserName,
    userPhone: rawUserPhone,
    type,
    address,
    pickupLocation: rawPickupLocation,
    paymentMethod,
    items,
    total: rawTotal,
    deliveryFee: rawDeliveryFee,
    discount: rawDiscount,
    notes: rawNotes,
    timingType: rawTimingType,
    targetTime: rawTargetTime,
    targetTimestamp: rawTargetTimestamp,
    isPreorder: rawIsPreorder,
    personsCount: rawPersonsCount,
    chopsticksCount: rawChopsticksCount,
    trainingChopsticksCount: rawTrainingChopsticksCount,
    cutleryKits: rawCutleryKits,
    changeFrom: rawChangeFrom,
    isPosOrder: rawIsPosOrder
  } = req.body;

  const authUser = (req as any).user || getRequestUser(req);
  const isStaffUser = Boolean(authUser && ['manager', 'admin', 'sysadmin', 'owner', 'kitchen', 'chef', 'courier'].includes(authUser.role));
  const isPosOrder = Boolean(rawIsPosOrder) && isStaffUser;

  // 1. Emergency Stop Check: block customer orders when kitchen is stopped
  if (!kitchenStatus.isOpen && !isPosOrder) {
    return res.status(403).json({
      success: false,
      error: `Приём заказов временно приостановлен кухней. ${kitchenStatus.pauseReason ? `Причина: ${kitchenStatus.pauseReason}` : "Приносим извинения за неудобства."}`
    });
  }

  const userName = sanitizeString(rawUserName, 100);
  const userPhone = sanitizeString(rawUserPhone, 20);
  const notes = sanitizeString(rawNotes, 500);
  const pickupLocation = sanitizeString(rawPickupLocation, 200);

  if (!userPhone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "Неверные данные заказа" });
  }
  if (!isValidPhone(userPhone)) {
    return res.status(400).json({ success: false, error: "Некорректный формат номера телефона" });
  }
  if (!["delivery", "pickup"].includes(type)) {
    return res.status(400).json({ success: false, error: "Неверный тип заказа" });
  }
  const validPaymentMethods = ["cash", "card_courier", "online_mock", "card_terminal", "transfer", "paid_pos"];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, error: "Неверный способ оплаты" });
  }
  if (items.length > 50) {
    return res.status(400).json({ success: false, error: "Слишком много позиций в заказе" });
  }

  // Authoritative server-side price recalculation from official catalog
  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const rawItem of items) {
    const prodId = rawItem?.product?.id;
    const catalogProduct = MENU_ITEMS.find(m => m.id === prodId);
    if (!catalogProduct) {
      return res.status(400).json({
        success: false,
        error: `Товар не найден в действующем меню: ${rawItem?.product?.name || prodId || "Неизвестный товар"}`
      });
    }
    const qty = Math.max(1, Math.min(99, parseInt(rawItem.quantity, 10) || 1));
    subtotal += catalogProduct.price * qty;
    verifiedItems.push({
      product: { ...catalogProduct },
      quantity: qty
    });
  }

  // Authoritative discount calculation
  let discount = 0;
  const rawPromo = req.body.promoCode ? sanitizeString(req.body.promoCode, 30).toUpperCase().trim() : undefined;
  if (rawPromo) {
    const promo = PROMO_CODES.find(p => p.code.toUpperCase() === rawPromo);
    if (promo && subtotal >= promo.minOrderAmount) {
      if (promo.discountType === "percent") {
        discount = Math.round(subtotal * (promo.discountValue / 100));
      } else {
        discount = Math.min(subtotal, promo.discountValue);
      }
    }
  } else if (typeof rawDiscount === "number" && rawDiscount > 0) {
    const matchingPromo = PROMO_CODES.find(p => {
      if (subtotal < p.minOrderAmount) return false;
      const expected = p.discountType === "percent"
        ? Math.round(subtotal * (p.discountValue / 100))
        : p.discountValue;
      return Math.abs(expected - rawDiscount) <= 2;
    });
    if (matchingPromo) {
      discount = rawDiscount;
    } else if (isPosOrder) {
      discount = Math.min(rawDiscount, Math.round(subtotal * 0.25));
    } else {
      discount = 0;
    }
  }

  const deliveryFee = type === "delivery" ? (subtotal >= (isPosOrder ? 600 : 1000) ? 0 : 150) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  // Preorder and timing handling
  const isPreorder = Boolean(rawIsPreorder || (rawTimingType === "scheduled" && rawTargetTime));
  const timingType = isPreorder ? "scheduled" : "asap";
  const targetTime = rawTargetTime ? sanitizeString(rawTargetTime, 50) : undefined;
  const targetTimestamp = typeof rawTargetTimestamp === "number" ? rawTargetTimestamp : undefined;

  try {
    const user = await getOrCreateUser(userPhone, userName);

    const now = Date.now();
    const firstTimelineEvent: StatusTimelineEvent = {
      status: "pending",
      title: isPreorder ? `Предзаказ оформлен (${targetTime || "ко времени"})` : "Заказ оформлен",
      description:
        type === "delivery"
          ? (isPreorder ? `Предзаказ на доставку к ${targetTime || "указанному времени"}` : "Заказ принят и ожидает подтверждения оператором")
          : (isPreorder ? `Предзаказ на самовывоз к ${targetTime || "указанному времени"}` : "Заказ принят, ожидаем подтверждения кухни"),
      timestamp: now
    };

    let street = null;
    let house = null;
    let apartment = null;
    let entrance = null;
    let floor = null;
    let intercom = null;

    if (type === "delivery" && address) {
      street = sanitizeString(address.street, 200) || null;
      house = sanitizeString(address.house, 20) || null;
      apartment = sanitizeString(address.apartment, 20) || null;
      entrance = sanitizeString(address.entrance, 10) || null;
      floor = sanitizeString(address.floor, 10) || null;
      intercom = sanitizeString(address.intercom, 30) || null;
    }

    let estimatedTime = type === "delivery" ? "45-60 мин." : "20-30 мин.";
    if (isPreorder && targetTime) {
      estimatedTime = `Ко времени: ${targetTime}`;
    }

    const newOrder: Order = {
      id: generateOrderId(),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: type as "delivery" | "pickup" | "dine_in",
      address: type === "delivery" && street ? {
        street,
        house: house || "",
        apartment: apartment || undefined,
        entrance: entrance || undefined,
        floor: floor || undefined,
        intercom: intercom || undefined
      } : undefined,
      pickupLocation: type === "pickup" ? pickupLocation : undefined,
      paymentMethod: paymentMethod as any,
      items: verifiedItems,
      total,
      deliveryFee,
      discount,
      status: "pending",
      statusTimeline: [firstTimelineEvent],
      createdAt: now,
      estimatedTime,
      timingType,
      targetTime,
      targetTimestamp,
      isPreorder,
      personsCount: typeof rawPersonsCount === "number" ? rawPersonsCount : undefined,
      chopsticksCount: typeof rawChopsticksCount === "number" ? rawChopsticksCount : undefined,
      trainingChopsticksCount: typeof rawTrainingChopsticksCount === "number" ? rawTrainingChopsticksCount : undefined,
      cutleryKits: rawCutleryKits && typeof rawCutleryKits === "object" ? rawCutleryKits : undefined,
      changeFrom: typeof rawChangeFrom === "number" ? rawChangeFrom : undefined,
      isPosOrder,
      notes: notes || undefined
    };

    await db.run(
      `INSERT INTO orders (
        id, userId, userName, userPhone, type, address_street, address_house, address_apartment, 
        address_entrance, address_floor, address_intercom, pickupLocation, paymentMethod, items, 
        total, deliveryFee, discount, status, statusTimeline, createdAt, estimatedTime, notes,
        timingType, targetTime, targetTimestamp, isPreorder, personsCount, chopsticksCount, 
        trainingChopsticksCount, cutleryKits, changeFrom, isPosOrder
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newOrder.id,
      newOrder.userId,
      newOrder.userName,
      newOrder.userPhone,
      newOrder.type,
      street,
      house,
      apartment,
      entrance,
      floor,
      intercom,
      newOrder.pickupLocation || null,
      newOrder.paymentMethod,
      JSON.stringify(newOrder.items),
      newOrder.total,
      newOrder.deliveryFee,
      newOrder.discount,
      newOrder.status,
      JSON.stringify(newOrder.statusTimeline),
      newOrder.createdAt,
      newOrder.estimatedTime,
      newOrder.notes || null,
      newOrder.timingType || "asap",
      newOrder.targetTime || null,
      newOrder.targetTimestamp || null,
      newOrder.isPreorder ? 1 : 0,
      newOrder.personsCount || null,
      newOrder.chopsticksCount || null,
      newOrder.trainingChopsticksCount || null,
      newOrder.cutleryKits ? JSON.stringify(newOrder.cutleryKits) : null,
      newOrder.changeFrom || null,
      newOrder.isPosOrder ? 1 : 0
    );

    // Update user permanent profile address if delivery order
    if (type === "delivery" && street) {
      await db.run(
        `UPDATE users SET name = ?, address_street = ?, address_house = ?, address_apartment = ?, address_entrance = ?, address_floor = ?, address_intercom = ? WHERE id = ?`,
        userName || user.name,
        street,
        house,
        apartment,
        entrance,
        floor,
        intercom,
        user.id
      );
      user.name = userName || user.name;
      user.address = {
        street,
        house: house || "",
        apartment: apartment || undefined,
        entrance: entrance || undefined,
        floor: floor || undefined,
        intercom: intercom || undefined
      };
    }

    // Deduct raw ingredients automatically from warehouse inventory
    deductWarehouseStock(newOrder.items);

    // Save 1C receipt automatically on disk
    saveReceiptFiles(newOrder);

    // Broadcast new order to Chef KDS and Admin in real-time via SSE
    broadcastEvent("ORDER_CREATED", newOrder);

    return res.json({ success: true, order: newOrder, user });
  } catch (err) {
    console.error("[Create Order API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

// ─── 1C Receipts & Kitchen Print Agent Endpoints ───────────────────────────────

const PRINTED_RECEIPTS_DIR = path.join(process.cwd(), "printed_receipts");
if (!fs.existsSync(PRINTED_RECEIPTS_DIR)) {
  fs.mkdirSync(PRINTED_RECEIPTS_DIR, { recursive: true });
}

let printAgentStatus = {
  online: false,
  lastHeartbeat: 0,
  hostname: "Касса / Кухня"
};

const printedOrdersSet = new Set<string>();

function generateReceipt1CHtml(order: Order): string {
  const dateStr = new Date(order.createdAt).toLocaleDateString("ru-RU");
  const deliveryTimeStr = new Date(order.createdAt + 60 * 60 * 1000).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const readyTimeStr = new Date(order.createdAt + 35 * 60 * 1000).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const order1CNum = order.id.replace(/\D/g, "").slice(-5) || "00001";
  const isOnlinePaid = order.paymentMethod === "online_mock";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Накладная 1С - Заказ #${order1CNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 4mm 8mm;
    }
    *, *:before, *:after { box-sizing: border-box; }
    html, body {
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5px;
      line-height: 1.15;
      margin: 0;
      padding: 4px;
      background: white;
      color: black;
      width: 100%;
      max-width: 650px;
    }
    table { width: 100%; border-collapse: collapse; margin: 3px 0; font-size: 9px; }
    th, td { border: 1px solid black; padding: 1.5px 3px; }
    th { background: #f0f0f0; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .border-box { border: 1px solid black; padding: 2px 4px; }
    .section-block { page-break-inside: avoid; break-inside: avoid; margin-bottom: 2px; }
    .cut-line {
      border-top: 1.5px dashed #444;
      margin: 4px 0 3px 0;
      text-align: center;
      position: relative;
      height: 6px;
    }
    .cut-line span {
      background: white;
      padding: 0 6px;
      position: relative;
      top: -6px;
      font-size: 8px;
      color: #333;
    }
    @media print {
      body { width: 100%; max-width: none; padding: 0; margin: 0; }
      .cut-line span { color: black; }
    }
  </style>
</head>
<body>
  <!-- БЛОК 1: НАКЛАДНАЯ ДЛЯ КУРЬЕРА -->
  <div class="section-block">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div class="bold">Поставщик: <u>ПАНДА доставка готовых блюд</u></div>
        <div>Адрес: <u>пр-т. Калинина 116</u> | Телефон: <u>600-417 8-983-352-69-72</u></div>
      </div>
      <div class="border-box bold">
        ${order.type === "delivery" ? "Доставка" : "Самовывоз"}: ${dateStr} ${deliveryTimeStr}
      </div>
    </div>

    <div class="text-center bold" style="font-size: 11px; margin: 2px 0;">
      ЗАКАЗ № ${order1CNum} от ${dateStr}
    </div>

    <div>
      <div><span class="bold">Покупатель:</span> <u>${order.userName || "Гость"}</u> | <span class="bold">Тел:</span> <u>${order.userPhone}</u></div>
      ${order.type === "delivery" && order.address ? `<div><span class="bold">Адрес:</span> <u>ул. ${order.address.street}, д. ${order.address.house}${order.address.apartment ? `, кв. ${order.address.apartment}` : ""}${order.address.entrance ? `, под. ${order.address.entrance}` : ""}${order.address.floor ? `, эт. ${order.address.floor}` : ""}</u></div>` : `<div><span class="bold">Самовывоз:</span> <u>${order.pickupLocation || "пр-т. Калинина 116"}</u></div>`}
      ${order.notes ? `<div><span class="bold">Прим:</span> <i>${order.notes}</i></div>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 20px;">№</th>
          <th>Товар</th>
          <th style="width: 45px;">Кол.</th>
          <th style="width: 55px;">Цена</th>
          <th style="width: 60px;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, idx) => `
          <tr>
            <td class="text-center bold">${idx + 1}</td>
            <td class="bold">"${it.product.name}" (шт)</td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-right">${it.product.price.toFixed(2)}</td>
            <td class="text-right bold">${(it.product.price * it.quantity).toFixed(2)}</td>
          </tr>
        `).join("")}
        <tr class="bold">
          <td colspan="4" class="text-right">Итого по заказу:</td>
          <td class="text-right bold">${order.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px; font-size: 8.5px;">
      <div>Покупатель: _________________ (подпись)</div>
      <div class="bold">Сумма: ${order.total.toFixed(2)} руб.</div>
    </div>
  </div>

  <div class="cut-line"><span>✂ линия отреза</span></div>

  <!-- БЛОК 2: ТОВАРНЫЙ ЧЕК -->
  <div class="section-block">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div class="bold">Поставщик: <u>ПАНДА доставка готовых блюд</u> (пр-т. Калинина 116, тел. 600-417)</div>
      </div>
      <div class="bold" style="font-size: 10px;">
        ТОВАРНЫЙ ЧЕК № ${order1CNum}
      </div>
    </div>

    <div style="margin-top: 1px;">
      <span class="bold">Покупатель:</span> <u>${order.userName || "Гость"}</u>
      ${order.notes ? ` | <i>${order.notes}</i>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 20px;">№</th>
          <th>Товар</th>
          <th style="width: 45px;">Кол.</th>
          <th style="width: 55px;">Цена</th>
          <th style="width: 60px;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, idx) => `
          <tr>
            <td class="text-center bold">${idx + 1}</td>
            <td class="bold">"${it.product.name}" (шт)</td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-right">${it.product.price.toFixed(2)}</td>
            <td class="text-right bold">${(it.product.price * it.quantity).toFixed(2)}</td>
          </tr>
        `).join("")}
        <tr class="bold">
          <td colspan="4" class="text-right">Итого:</td>
          <td class="text-right">${order.total.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right">Предоплата:</td>
          <td class="text-right">${isOnlinePaid ? order.total.toFixed(2) : "0.00"}</td>
        </tr>
        <tr class="bold">
          <td colspan="4" class="text-right">Долг клиента на ${dateStr}:</td>
          <td class="text-right">${isOnlinePaid ? "0.00" : order.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: right; font-size: 8.5px; margin-top: 2px;">
      Покупатель: _________________
    </div>
  </div>

  <div class="cut-line"><span>✂ линия отреза для кухни</span></div>

  <!-- БЛОК 3: ЗАЯВКА ДЛЯ ЦЕХА -->
  <div class="section-block">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="bold" style="font-size: 11px;">ЦЕХ / КУХНЯ</div>
      <div class="border-box bold" style="border: 1.5px solid black; font-size: 10px;">
        Готовность: ${dateStr} ${readyTimeStr}
      </div>
    </div>

    <div class="text-center bold" style="font-size: 11px; margin: 2px 0;">
      ЗАЯВКА ДЛЯ ЦЕХА № ${order1CNum} от ${dateStr}
    </div>

    ${order.notes ? `<div style="border: 1px solid black; padding: 2px 4px; background: #fffbe6; margin-bottom: 3px; font-size: 9px;"><strong>⚠️ Комментарий кухни:</strong> ${order.notes}</div>` : ""}

    <table style="border: 1.5px solid black;">
      <thead>
        <tr style="border-bottom: 1.5px solid black; background: #ddd;">
          <th style="width: 25px;">№</th>
          <th>Товар (Наименование блюда)</th>
          <th style="width: 70px;">Количество</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, idx) => `
          <tr>
            <td class="text-center bold">${idx + 1}</td>
            <td class="bold" style="font-size: 10.5px;">"${it.product.name}"</td>
            <td class="text-center bold" style="font-size: 11.5px;">${it.quantity} шт.</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

function saveReceiptFiles(order: Order) {
  try {
    const order1CNum = order.id.replace(/\D/g, "").slice(-5) || "00001";
    const htmlContent = generateReceipt1CHtml(order);
    const filePath = path.join(PRINTED_RECEIPTS_DIR, `receipt_${order1CNum}_${order.id}.html`);
    fs.writeFileSync(filePath, htmlContent, "utf8");
  } catch (err) {
    console.error("[Receipt Saver] Error:", err);
  }
}

app.get("/api/orders/:orderId/receipt", async (req, res) => {
  const authUser = (req as any).user || getRequestUser(req);
  if (!authUser) {
    return res.status(401).send("Требуется авторизация");
  }
  const orderId = sanitizeString(req.params.orderId, 60);
  try {
    const row = await db.get("SELECT * FROM orders WHERE id = ?", orderId) as SqliteOrder;
    if (!row) {
      return res.status(404).send("Заказ не найден");
    }
    const order = mapSqliteOrder(row);
    const isStaff = ['manager', 'admin', 'sysadmin', 'owner', 'chef', 'kitchen', 'courier'].includes(authUser.role);
    if (!isStaff) {
      const uPhoneNorm = authUser.phone ? authUser.phone.replace(/\D/g, "") : "";
      const oPhoneNorm = order.userPhone ? order.userPhone.replace(/\D/g, "") : "";
      if (authUser.id !== order.userId && uPhoneNorm !== oPhoneNorm) {
        return res.status(403).send("Доступ запрещен");
      }
    }
    const html = generateReceipt1CHtml(order);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (err) {
    return res.status(500).send("Ошибка генерации накладной");
  }
});

app.get("/api/print-agent/pending", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  try {
    const rows = await db.all("SELECT * FROM orders ORDER BY createdAt DESC LIMIT 20") as SqliteOrder[];
    const allOrders = rows.map(mapSqliteOrder);
    const pendingToPrint = allOrders.filter(o => !printedOrdersSet.has(o.id));
    return res.json({ success: true, orders: pendingToPrint });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка" });
  }
});

app.post("/api/print-agent/ack", (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  const { orderId } = req.body;
  if (orderId) {
    printedOrdersSet.add(orderId);
  }
  return res.json({ success: true });
});

app.post("/api/print-agent/heartbeat", (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  printAgentStatus = {
    online: true,
    lastHeartbeat: Date.now(),
    hostname: req.body?.hostname || "Кухонный ПК"
  };
  return res.json({ success: true, timestamp: Date.now() });
});

app.get("/api/admin/print-status", (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  const isOnline = Date.now() - printAgentStatus.lastHeartbeat < 30000;
  return res.json({
    success: true,
    agent: {
      online: isOnline,
      lastSeen: printAgentStatus.lastHeartbeat,
      hostname: printAgentStatus.hostname,
      token: ADMIN_SECRET,
      printedCount: printedOrdersSet.size
    }
  });
});

app.get("/api/orders", async (req, res) => {
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const userId = sanitizeString(req.query.userId as string, 60);
  const phone = sanitizeString(req.query.phone as string, 20);

  try {
    let rows: SqliteOrder[] = [];
    const isStaff = ['manager', 'admin', 'sysadmin', 'owner'].includes(authUser.role);
    const isChef = ['chef', 'kitchen'].includes(authUser.role);
    const isCourier = authUser.role === 'courier';

    if (isStaff) {
      if (userId) {
        rows = await db.all("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC", userId) as SqliteOrder[];
      } else if (phone) {
        const normalizedQuery = phone.replace(/\D/g, "");
        if (normalizedQuery.length < 10) {
          return res.status(400).json({ success: false, error: "Некорректный номер телефона" });
        }
        rows = await db.all(
          `SELECT * FROM orders 
           WHERE replace(replace(replace(replace(userPhone, "+", ""), " ", ""), "(", ""), ")", "") LIKE ?
           ORDER BY createdAt DESC`,
          `%${normalizedQuery}%`
        ) as SqliteOrder[];
      } else {
        rows = await db.all("SELECT * FROM orders ORDER BY createdAt DESC") as SqliteOrder[];
      }
    } else if (isChef) {
      rows = await db.all(
        "SELECT * FROM orders WHERE status IN ('pending', 'confirmed', 'cooking', 'ready') ORDER BY createdAt DESC"
      ) as SqliteOrder[];
    } else if (isCourier) {
      rows = await db.all(
        "SELECT * FROM orders WHERE status IN ('ready', 'delivering', 'completed') ORDER BY createdAt DESC"
      ) as SqliteOrder[];
    } else {
      // Regular client: STRICTLY their own orders only!
      const userPhoneNorm = authUser.phone ? authUser.phone.replace(/\D/g, "") : "";
      rows = await db.all(
        `SELECT * FROM orders 
         WHERE userId = ? OR (userPhone != '' AND replace(replace(replace(replace(userPhone, "+", ""), " ", ""), "(", ""), ")", "") = ?)
         ORDER BY createdAt DESC`,
        authUser.id,
        userPhoneNorm
      ) as SqliteOrder[];
    }

    const orders = rows.map(mapSqliteOrder);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("[Get Orders API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

app.get("/api/orders/:orderId", async (req, res) => {
  const orderId = sanitizeString(req.params.orderId, 60);

  try {
    const row = await db.get("SELECT * FROM orders WHERE id = ?", orderId) as SqliteOrder;
    if (!row) {
      return res.status(404).json({ success: false, error: "Заказ не найден" });
    }
    const order = mapSqliteOrder(row);
    const authUser = (req as any).user || getRequestUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: "Требуется авторизация" });
    }
    const isStaff = ['manager', 'admin', 'sysadmin', 'owner', 'chef', 'kitchen', 'courier'].includes(authUser.role);
    if (!isStaff) {
      const uPhoneNorm = authUser.phone ? authUser.phone.replace(/\D/g, "") : "";
      const oPhoneNorm = order.userPhone ? order.userPhone.replace(/\D/g, "") : "";
      if (authUser.id !== order.userId && uPhoneNorm !== oPhoneNorm) {
        return res.status(403).json({ success: false, error: "Доступ к чужому заказу запрещен" });
      }
    }
    return res.json({ success: true, order });
  } catch (err) {
    console.error("[Get Order API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

const handleOrderStatusUpdate = async (req: express.Request, res: express.Response) => {
  if (!requireAdminSecret(req, res)) return;

  const orderId = sanitizeString(req.params.orderId, 60);
  const status = sanitizeString(req.body.status, 30) as OrderStatus;

  const validStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "cooking",
    "delivering",
    "ready",
    "completed",
    "cancelled"
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: "Некорректный статус заказа" });
  }

  try {
    const row = await db.get("SELECT * FROM orders WHERE id = ?", orderId) as SqliteOrder;
    if (!row) {
      return res.status(404).json({ success: false, error: "Заказ не найден" });
    }

    const order = mapSqliteOrder(row);

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(409).json({
        success: false,
        error: "Нельзя изменить статус завершённого или отменённого заказа"
      });
    }

    const statusMessages: Record<OrderStatus, { title: string; description: string }> = {
      pending: { title: "Принят", description: "Заказ ожидает подтверждения." },
      confirmed: {
        title: "Подтвержден",
        description: "Оператор подтвердил ваш заказ! Скоро начнем готовить."
      },
      cooking: {
        title: "Готовится",
        description: "Шеф-повар уже крутит ваши роллы из свежайшей рыбы!"
      },
      delivering: {
        title: "Передан курьеру",
        description: "Курьер забрал горячий заказ и спешит по вашему адресу!"
      },
      ready: {
        title: "Готов к выдаче",
        description: "Заказ готов и ждет вас на пункте самовывоза. Приятного аппетита!"
      },
      completed: {
        title: "Доставлен",
        description: "Заказ успешно доставлен. Спасибо, что вы с Суши Панда! Напишите отзыв!"
      },
      cancelled: {
        title: "Отменен",
        description: "Заказ отменен. Свяжитесь с поддержкой для уточнения причин."
      }
    }
  // Enterprise FSM Validation
  const transition = validateFSMTransition(
    order.status,
    status,
    ((req as any).user?.role as any) || "manager",
    req.body.cancellationReason || req.body.reason
  );
  if (!transition.valid) {
    return res.status(422).json({ success: false, error: transition.error });
  }

  await logAuditEvent(db, {
    userId: (req as any).user?.id,
    userRole: (req as any).user?.role,
    action: "ORDER_STATUS_CHANGE",
    entityType: "order",
    entityId: orderId,
    details: { from: order.status, to: status, reason: req.body.cancellationReason || req.body.reason },
    req
  });
;

    const { title, description } = statusMessages[status];
    const newTimelineEvent: StatusTimelineEvent = {
      status,
      title,
      description,
      timestamp: Date.now()
    };

    const alreadyHasStatus = order.statusTimeline.some((e) => e.status === status);
    if (!alreadyHasStatus) {
      order.statusTimeline.push(newTimelineEvent);
    }

    order.status = status;

    if (status === "completed" || status === "cancelled") {
      order.estimatedTime = status === "completed" ? "Доставлен" : "Отменён";
    } else if (status === "cooking") {
      order.estimatedTime = order.type === "delivery" ? "30-40 мин." : "10-15 мин.";
    } else if (status === "delivering") {
      order.estimatedTime = "15-20 мин.";
    } else if (status === "ready") {
      order.estimatedTime = "Готов!";
    }

    await db.run(
      "UPDATE orders SET status = ?, statusTimeline = ?, estimatedTime = ? WHERE id = ?",
      order.status,
      JSON.stringify(order.statusTimeline),
      order.estimatedTime,
      orderId
    );

    // Broadcast order status change via SSE in real-time
    broadcastEvent("ORDER_UPDATED", order);

    return res.json({ success: true, order });
  } catch (err) {
    console.error("[Update Status API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
};

app.post("/api/admin/orders/:orderId/status", handleOrderStatusUpdate);
app.post("/api/orders/:orderId/status", handleOrderStatusUpdate);
app.patch("/api/admin/orders/:orderId/status", handleOrderStatusUpdate);
app.patch("/api/orders/:orderId/status", handleOrderStatusUpdate);
app.patch("/api/admin/orders/:orderId", handleOrderStatusUpdate);
app.patch("/api/orders/:orderId", handleOrderStatusUpdate);

// Full order items & contents editing by kitchen chef/admin
app.put(["/api/orders/:orderId", "/api/admin/orders/:orderId"], async (req, res) => {
  if (!requireAdminSecret(req, res)) return;

  const orderId = sanitizeString(req.params.orderId, 60);
  const { items, notes, cutleryKits, changeFrom, personsCount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "В заказе должно быть хотя бы одно блюдо" });
  }

  try {
    const row = await db.get("SELECT * FROM orders WHERE id = ?", orderId) as SqliteOrder;
    if (!row) {
      return res.status(404).json({ success: false, error: "Заказ не найден" });
    }

    const order = mapSqliteOrder(row);

    // Calculate new total
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
    let total = subtotal;
    if (order.discount && order.discount > 0) {
      total = Math.max(0, subtotal - order.discount);
    }

    order.items = items;
    order.total = total;
    if (notes !== undefined) order.notes = sanitizeString(notes, 300);
    if (cutleryKits !== undefined) order.cutleryKits = cutleryKits;
    if (changeFrom !== undefined) order.changeFrom = changeFrom;
    if (personsCount !== undefined) order.personsCount = personsCount;

    await db.run(
      `UPDATE orders SET 
        items = ?, 
        total = ?, 
        notes = ?, 
        cutleryKits = ?, 
        changeFrom = ?, 
        personsCount = ? 
       WHERE id = ?`,
      JSON.stringify(order.items),
      order.total,
      order.notes || null,
      order.cutleryKits ? JSON.stringify(order.cutleryKits) : null,
      order.changeFrom || null,
      order.personsCount || null,
      orderId
    );

    // Re-generate updated 1C receipt on disk
    saveReceiptFiles(order);

    // Broadcast update via SSE
    broadcastEvent("ORDER_UPDATED", order);

    return res.json({ success: true, order });
  } catch (err) {
    console.error("[Edit Order API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера при обновлении заказа" });
  }
});

app.post("/api/admin/reset", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;

  if (IS_PRODUCTION) {
    return res.status(403).json({
      success: false,
      error: "Сброс базы данных недоступен в production режиме"
    });
  }

  try {
    await db.run("DELETE FROM orders");
    await db.run("DELETE FROM users");
    warehouseStock = JSON.parse(JSON.stringify(DEFAULT_WAREHOUSE_STOCK));
    opexSettings = { ...DEFAULT_OPEX };
    await populateSeedData();
    return res.json({ success: true, message: "Database reset to initial state" });
  } catch (err) {
    console.error("[Reset API] Error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
});

// ─── Warehouse Inventory Endpoints ─────────────────────────────────────────────

app.get("/api/admin/inventory", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  try {
    if (db) {
      const rows = await db.all("SELECT * FROM inventory ORDER BY name ASC") as any[];
      if (rows && rows.length > 0) {
        warehouseStock = rows.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          categoryLabel: r.categoryLabel || r.category,
          stock: r.stock,
          unit: r.unit,
          minThreshold: r.minThreshold,
          costPerUnit: r.costPerUnit,
          usedToday: r.usedToday || 0,
          usedPeriod: r.usedPeriod || 0
        }));
      }
    }
    return res.json({
      success: true,
      inventory: warehouseStock
    });
  } catch (err) {
    console.error("[Inventory GET] Error:", err);
    return res.json({ success: true, inventory: warehouseStock });
  }
});

// Create new warehouse position (owner custom position and metrics)
app.post("/api/admin/inventory", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  try {
    const { name, category, categoryLabel, stock, unit, minThreshold, costPerUnit } = req.body;
    if (!name || stock === undefined || !unit) {
      return res.status(400).json({ success: false, error: "Название, остаток и единица измерения обязательны" });
    }

    const newId = `ing-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: WarehouseIngredient = {
      id: newId,
      name: sanitizeString(name, 100),
      category: sanitizeString(category || "groceries", 50),
      categoryLabel: sanitizeString(categoryLabel || category || "Бакалея", 50),
      stock: parseFloat(parseFloat(stock).toFixed(2)) || 0,
      unit: sanitizeString(unit, 20) || "шт",
      minThreshold: parseFloat(parseFloat(minThreshold).toFixed(2)) || 1,
      costPerUnit: parseFloat(parseFloat(costPerUnit).toFixed(2)) || 0,
      usedToday: 0,
      usedPeriod: 0
    };

    warehouseStock.push(newItem);

    if (db) {
      await db.run(
        `INSERT INTO inventory (id, name, category, categoryLabel, stock, unit, minThreshold, costPerUnit, usedToday, usedPeriod)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        newItem.id, newItem.name, newItem.category, newItem.categoryLabel, newItem.stock, newItem.unit, newItem.minThreshold, newItem.costPerUnit, 0, 0
      );
    }

    return res.json({ success: true, ingredient: newItem });
  } catch (err) {
    console.error("[Inventory POST] Error:", err);
    return res.status(500).json({ success: false, error: "Не удалось сохранить позицию" });
  }
});

// Update warehouse position (name, metrics, stock, min threshold, cost)
app.put("/api/admin/inventory/:id", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  try {
    const { id } = req.params;
    const { name, category, categoryLabel, stock, unit, minThreshold, costPerUnit } = req.body;

    const itemIndex = warehouseStock.findIndex(w => w.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: "Ингредиент не найден" });
    }

    const item = warehouseStock[itemIndex];
    if (name) item.name = sanitizeString(name, 100);
    if (category) item.category = sanitizeString(category, 50);
    if (categoryLabel) item.categoryLabel = sanitizeString(categoryLabel, 50);
    if (stock !== undefined) item.stock = parseFloat(parseFloat(stock).toFixed(2));
    if (unit) item.unit = sanitizeString(unit, 20);
    if (minThreshold !== undefined) item.minThreshold = parseFloat(parseFloat(minThreshold).toFixed(2));
    if (costPerUnit !== undefined) item.costPerUnit = parseFloat(parseFloat(costPerUnit).toFixed(2));

    if (db) {
      await db.run(
        `UPDATE inventory SET name = ?, category = ?, categoryLabel = ?, stock = ?, unit = ?, minThreshold = ?, costPerUnit = ? WHERE id = ?`,
        item.name, item.category, item.categoryLabel, item.stock, item.unit, item.minThreshold, item.costPerUnit, item.id
      );
    }

    return res.json({ success: true, ingredient: item });
  } catch (err) {
    console.error("[Inventory PUT] Error:", err);
    return res.status(500).json({ success: false, error: "Не удалось обновить позицию" });
  }
});

// Delete warehouse position
app.delete("/api/admin/inventory/:id", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  try {
    const { id } = req.params;
    warehouseStock = warehouseStock.filter(w => w.id !== id);

    if (db) {
      await db.run("DELETE FROM inventory WHERE id = ?", id);
    }

    return res.json({ success: true, message: "Позиция удалена" });
  } catch (err) {
    console.error("[Inventory DELETE] Error:", err);
    return res.status(500).json({ success: false, error: "Не удалось удалить позицию" });
  }
});

// Set exact stock volume manually
app.post("/api/admin/inventory/set-stock", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  try {
    const { ingredientId, stock } = req.body;
    if (!ingredientId || stock === undefined) {
      return res.status(400).json({ success: false, error: "ID ингредиента и объем обязательны" });
    }

    const item = warehouseStock.find(w => w.id === ingredientId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Ингредиент не найден" });
    }

    const numStock = parseFloat(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, error: "Объем должен быть неотрицательным числом" });
    }

    item.stock = parseFloat(numStock.toFixed(2));

    if (db) {
      await db.run("UPDATE inventory SET stock = ? WHERE id = ?", item.stock, item.id);
    }

    return res.json({ success: true, ingredient: item });
  } catch (err) {
    console.error("[Inventory set-stock] Error:", err);
    return res.status(500).json({ success: false, error: "Ошибка сохранения объема" });
  }
});

// Quick restock by delta
app.post("/api/admin/inventory/restock", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  try {
    const { ingredientId, amount } = req.body;
    if (!ingredientId || amount === undefined) {
      return res.status(400).json({ success: false, error: "ID ингредиента и количество обязательны" });
    }

    const item = warehouseStock.find(w => w.id === ingredientId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Ингредиент не найден на складе" });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: "Количество должно быть положительным числом" });
    }

    item.stock = parseFloat((item.stock + numAmount).toFixed(2));

    if (db) {
      await db.run("UPDATE inventory SET stock = ? WHERE id = ?", item.stock, item.id);
    }

    return res.json({ success: true, ingredient: item });
  } catch (err) {
    console.error("[Inventory restock] Error:", err);
    return res.status(500).json({ success: false, error: "Ошибка пополнения склада" });
  }
});

// ─── Operational Expenses (OPEX) Endpoints ─────────────────────────────────────

app.get("/api/admin/opex", (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  return res.json({
    success: true,
    opex: opexSettings
  });
});

app.put("/api/admin/opex", (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const { rentMonthly, salariesMonthly, marketingMonthly, utilitiesMonthly, otherMonthly } = req.body;

  if (typeof rentMonthly === "number" && rentMonthly >= 0) opexSettings.rentMonthly = rentMonthly;
  if (typeof salariesMonthly === "number" && salariesMonthly >= 0) opexSettings.salariesMonthly = salariesMonthly;
  if (typeof marketingMonthly === "number" && marketingMonthly >= 0) opexSettings.marketingMonthly = marketingMonthly;
  if (typeof utilitiesMonthly === "number" && utilitiesMonthly >= 0) opexSettings.utilitiesMonthly = utilitiesMonthly;
  if (typeof otherMonthly === "number" && otherMonthly >= 0) opexSettings.otherMonthly = otherMonthly;
  
  opexSettings.updatedAt = Date.now();

  return res.json({
    success: true,
    opex: opexSettings
  });
});

// ─── Advanced Analytics Engine (Periods: day, 2days, week, month) ──────────────

app.get("/api/admin/analytics", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  try {
    const period = (req.query.period as string) || "month";
    const now = Date.now();
    const ONE_HOUR = 3600 * 1000;
    const ONE_DAY = 24 * ONE_HOUR;

    let startTime = now - 30 * ONE_DAY;
    let daysCount = 30;

    if (period === "day") {
      startTime = now - ONE_DAY;
      daysCount = 1;
    } else if (period === "2days") {
      startTime = now - 2 * ONE_DAY;
      daysCount = 2;
    } else if (period === "week") {
      startTime = now - 7 * ONE_DAY;
      daysCount = 7;
    } else {
      startTime = now - 30 * ONE_DAY;
      daysCount = 30;
    }

    let allOrders: Order[] = [];
    if (db && typeof db.all === "function") {
      const rows = await db.all("SELECT * FROM orders ORDER BY createdAt DESC");
      allOrders = rows.map(mapSqliteOrder);
    }

    // Filter orders within requested period
    const periodOrders = allOrders.filter(o => o.createdAt >= startTime);
    const completedOrdersList = periodOrders.filter(o => o.status === "completed");
    const totalOrders = periodOrders.length;
    const completedOrders = completedOrdersList.length;
    const activeOrders = periodOrders.filter(o => o.status !== "completed" && o.status !== "cancelled").length;
    const cancelledOrders = periodOrders.filter(o => o.status === "cancelled").length;

    // Delivery vs Pickup
    const deliveryOrders = periodOrders.filter(o => o.type === "delivery").length;
    const pickupOrders = periodOrders.filter(o => o.type === "pickup").length;

    // Payment Methods
    const paymentMethods = {
      card: periodOrders.filter(o => o.paymentMethod === "card_courier").length,
      online: periodOrders.filter(o => o.paymentMethod === "online_mock").length,
      cash: periodOrders.filter(o => o.paymentMethod === "cash").length
    };

    // Revenue
    const totalRevenue = completedOrdersList.reduce((sum, o) => sum + o.total, 0);
    const averageCheck = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

    // Detailed Food Cost Calculation & Ingredients Consumption
    let totalFoodCost = 0;
    const ingredientsConsumptionMap: Record<string, { id: string; name: string; amount: number; unit: string; totalCost: number }> = {};
    const productSalesMap: Record<string, { id: string; name: string; category: string; count: number; revenue: number; cost: number; profit: number; margin: number }> = {};

    for (const order of completedOrdersList) {
      for (const item of order.items) {
        const prodId = item.product?.id || item.product?.name;
        const catalogProduct = MENU_ITEMS.find(m => m.id === item.product?.id) || item.product;
        const price = catalogProduct?.price || item.product?.price || 0;
        const qty = item.quantity || 1;

        // Calculate dish recipe food cost
        let itemUnitCost = 0;
        if (catalogProduct && Array.isArray(catalogProduct.ingredients)) {
          for (const ing of catalogProduct.ingredients) {
            const ingCost = (ing.costEstimate || 0);
            itemUnitCost += ingCost;

            // Track ingredients consumed
            if (!ingredientsConsumptionMap[ing.id]) {
              ingredientsConsumptionMap[ing.id] = {
                id: ing.id,
                name: ing.name,
                amount: 0,
                unit: ing.unit,
                totalCost: 0
              };
            }
            ingredientsConsumptionMap[ing.id].amount += ing.amount * qty;
            ingredientsConsumptionMap[ing.id].totalCost += ingCost * qty;
          }
        } else {
          // Fallback estimated 32% food cost if recipe details missing
          itemUnitCost = price * 0.32;
        }

        const itemTotalCost = Math.round(itemUnitCost * qty);
        totalFoodCost += itemTotalCost;

        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            id: prodId,
            name: catalogProduct?.name || item.product?.name || "Блюдо",
            category: catalogProduct?.category || item.product?.category || "other",
            count: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0
          };
        }

        productSalesMap[prodId].count += qty;
        productSalesMap[prodId].revenue += price * qty;
        productSalesMap[prodId].cost += itemTotalCost;
      }
    }

    // Compute dish margins and sort
    const topProducts = Object.values(productSalesMap).map(p => {
      p.profit = p.revenue - p.cost;
      p.margin = p.revenue > 0 ? Math.round((p.profit / p.revenue) * 1000) / 10 : 0;
      return p;
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    // Format top raw ingredients
    const topIngredientsUsed = Object.values(ingredientsConsumptionMap).map(ing => {
      let displayAmount = ing.amount;
      let displayUnit = ing.unit;
      if (ing.unit === "г" && ing.amount >= 1000) {
        displayAmount = parseFloat((ing.amount / 1000).toFixed(2));
        displayUnit = "кг";
      } else if (ing.unit === "мл" && ing.amount >= 1000) {
        displayAmount = parseFloat((ing.amount / 1000).toFixed(2));
        displayUnit = "л";
      }
      return {
        id: ing.id,
        name: ing.name,
        amount: displayAmount,
        unit: displayUnit,
        cost: Math.round(ing.totalCost)
      };
    }).sort((a, b) => b.cost - a.cost).slice(0, 8);

    // Financial KPI Totals
    const grossProfit = Math.max(0, totalRevenue - totalFoodCost);
    const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0;

    const totalMonthlyOpex = (opexSettings.rentMonthly || 0) +
      (opexSettings.salariesMonthly || 0) +
      (opexSettings.marketingMonthly || 0) +
      (opexSettings.utilitiesMonthly || 0) +
      (opexSettings.otherMonthly || 0);

    // Allocated OPEX proportional to days
    const allocatedOpex = Math.round(totalMonthlyOpex * (daysCount / 30));
    const netProfit = grossProfit - allocatedOpex;
    const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

    // Dynamic Chart Points Generation based on selected period
    const chartData: AnalyticsChartPoint[] = [];

    if (period === "day") {
      const timeSlots = [
        { label: "10:00 - 12:00", hStart: 10, hEnd: 12 },
        { label: "12:00 - 15:00", hStart: 12, hEnd: 15 },
        { label: "15:00 - 18:00", hStart: 15, hEnd: 18 },
        { label: "18:00 - 21:00", hStart: 18, hEnd: 21 },
        { label: "21:00 - 23:30", hStart: 21, hEnd: 24 }
      ];
      const slotOpex = Math.round(allocatedOpex / timeSlots.length);
      timeSlots.forEach((slot, idx) => {
        const slotRev = Math.round(totalRevenue * (0.15 + (idx === 3 || idx === 1 ? 0.15 : 0.05)));
        const slotFood = Math.round(slotRev * 0.33);
        const slotGross = slotRev - slotFood;
        const slotNet = slotGross - slotOpex;
        chartData.push({
          label: slot.label,
          revenue: slotRev,
          foodCost: slotFood,
          opex: slotOpex,
          netProfit: slotNet,
          orders: Math.max(1, Math.round(completedOrders * (slotRev / (totalRevenue || 1))))
        });
      });
    } else if (period === "2days") {
      const slots = [
        { label: "Вчера (День)" },
        { label: "Вчера (Вечер)" },
        { label: "Сегодня (День)" },
        { label: "Сегодня (Вечер)" }
      ];
      const slotOpex = Math.round(allocatedOpex / 4);
      slots.forEach((slot, idx) => {
        const weight = idx === 1 || idx === 3 ? 0.32 : 0.18;
        const slotRev = Math.round(totalRevenue * weight);
        const slotFood = Math.round(slotRev * 0.34);
        const slotGross = slotRev - slotFood;
        chartData.push({
          label: slot.label,
          revenue: slotRev,
          foodCost: slotFood,
          opex: slotOpex,
          netProfit: slotGross - slotOpex,
          orders: Math.max(1, Math.round(completedOrders * weight))
        });
      });
    } else if (period === "week") {
      const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
      const dayOpex = Math.round(allocatedOpex / 7);
      const weights = [0.10, 0.11, 0.12, 0.14, 0.20, 0.22, 0.11];
      days.forEach((day, idx) => {
        const slotRev = Math.round(totalRevenue * weights[idx]);
        const slotFood = Math.round(slotRev * 0.33);
        const slotGross = slotRev - slotFood;
        chartData.push({
          label: day,
          revenue: slotRev,
          foodCost: slotFood,
          opex: dayOpex,
          netProfit: slotGross - dayOpex,
          orders: Math.max(1, Math.round(completedOrders * weights[idx]))
        });
      });
    } else {
      // Month (4 weeks)
      const weeks = ["Неделя 1", "Неделя 2", "Неделя 3", "Неделя 4"];
      const weekOpex = Math.round(allocatedOpex / 4);
      const weights = [0.22, 0.26, 0.24, 0.28];
      weeks.forEach((wk, idx) => {
        const slotRev = Math.round(totalRevenue * weights[idx]);
        const slotFood = Math.round(slotRev * 0.33);
        const slotGross = slotRev - slotFood;
        chartData.push({
          label: wk,
          revenue: slotRev,
          foodCost: slotFood,
          opex: weekOpex,
          netProfit: slotGross - weekOpex,
          orders: Math.max(1, Math.round(completedOrders * weights[idx]))
        });
      });
    }

    // Category breakdown
    const categoryRevenueMap: Record<string, number> = {};
    const categoryLabels: Record<string, string> = {
      sets: "Сеты",
      "baked-rolls": "Запеченные роллы",
      "classic-rolls": "Классические роллы",
      "tempura-rolls": "Темпура роллы",
      sushi: "Суши & Гунканы",
      pizza: "Пицца 30см",
      wok: "WOK Лапша",
      drinks: "Напитки",
      desserts: "Десерты"
    };

    for (const order of completedOrdersList) {
      for (const item of order.items) {
        const cat = item.product?.category || "other";
        categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + (item.quantity * (item.product?.price || 0));
      }
    }

    const categoryRevenue = Object.entries(categoryRevenueMap).map(([cat, rev]) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      revenue: rev,
      percentage: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    const paymentMethodsList = [
      {
        method: "card_courier",
        label: "Картой курьеру",
        count: periodOrders.filter(o => o.paymentMethod === "card_courier").length,
        sum: completedOrdersList.filter(o => o.paymentMethod === "card_courier").reduce((s, o) => s + o.total, 0)
      },
      {
        method: "online_mock",
        label: "Онлайн на сайте",
        count: periodOrders.filter(o => o.paymentMethod === "online_mock").length,
        sum: completedOrdersList.filter(o => o.paymentMethod === "online_mock").reduce((s, o) => s + o.total, 0)
      },
      {
        method: "cash",
        label: "Наличными",
        count: periodOrders.filter(o => o.paymentMethod === "cash").length,
        sum: completedOrdersList.filter(o => o.paymentMethod === "cash").reduce((s, o) => s + o.total, 0)
      }
    ];

    const analyticsResult: AnalyticsSummary = {
      period: period as any,
      periodLabel: period === "day" ? "Сегодня (24ч)" : period === "2days" ? "2 дня (48ч)" : period === "week" ? "Неделя (7 дней)" : "Месяц (30 дней)",
      totalRevenue,
      foodCost: totalFoodCost,
      grossProfit,
      grossMargin,
      opex: allocatedOpex,
      netProfit,
      netMargin,
      expenses: opexSettings,
      opexDetails: opexSettings,
      totalOrders,
      averageCheck,
      completedOrders,
      activeOrders,
      cancelledOrders,
      topProducts,
      categoryRevenue,
      topIngredientsUsed,
      chartData,
      deliveryOrders,
      pickupOrders,
      paymentMethods: paymentMethodsList
    };

    return res.json({
      success: true,
      analytics: analyticsResult
    });
  } catch (err: any) {
    console.error("[Analytics API] Error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// ─── Daily Z-Report & POS Analytics Engine ─────────────────────────────────────

async function computeDailyZReport(targetDateStr?: string): Promise<DailyZReport> {
  const dateStr = targetDateStr || new Date().toISOString().slice(0, 10);
  const [y, m, d] = dateStr.split("-");
  const dateFormatted = `${d}.${m}.${y}`;

  let allOrders: Order[] = [];
  if (db && typeof db.all === "function") {
    const rows = await db.all("SELECT * FROM orders ORDER BY createdAt DESC");
    allOrders = rows.map(mapSqliteOrder);
  }

  // Filter orders created on target day
  const dayOrders = allOrders.filter(o => {
    const oDate = new Date(o.createdAt);
    const oDateStr = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, "0")}-${String(oDate.getDate()).padStart(2, "0")}`;
    return oDateStr === dateStr;
  });

  const completedOrders = dayOrders.filter(o => o.status === "completed");
  const cancelledOrders = dayOrders.filter(o => o.status === "cancelled");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageCheck = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  const deliveryOrders = completedOrders.filter(o => o.type === "delivery");
  const pickupOrders = completedOrders.filter(o => o.type === "pickup");
  const dineInOrders = completedOrders.filter(o => o.type === "dine_in");

  const deliveryRevenue = deliveryOrders.reduce((s, o) => s + o.total, 0);
  const pickupRevenue = pickupOrders.reduce((s, o) => s + o.total, 0);
  const dineInRevenue = dineInOrders.reduce((s, o) => s + o.total, 0);

  // Payment breakdown
  const payments = {
    cash: completedOrders.filter(o => o.paymentMethod === "cash").reduce((s, o) => s + o.total, 0),
    card: completedOrders.filter(o => ["card_courier", "card_terminal"].includes(o.paymentMethod)).reduce((s, o) => s + o.total, 0),
    online: completedOrders.filter(o => ["online_mock", "transfer", "paid_pos"].includes(o.paymentMethod)).reduce((s, o) => s + o.total, 0)
  };

  // Top products
  const productMap: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};
  let totalRollsCount = 0;
  let totalChopsticksCount = 0;
  let totalTrainingChopsticksCount = 0;
  let totalSoySauceCount = 0;
  let totalWasabiCount = 0;
  let totalGingerCount = 0;

  for (const order of completedOrders) {
    totalChopsticksCount += (order.chopsticksCount || order.personsCount || 1);
    totalTrainingChopsticksCount += (order.trainingChopsticksCount || 0);
    if (order.cutleryKits) {
      totalSoySauceCount += (order.cutleryKits.soySauce || 0);
      totalWasabiCount += (order.cutleryKits.wasabi || 0);
      totalGingerCount += (order.cutleryKits.ginger || 0);
    } else {
      const pCount = order.personsCount || 1;
      totalSoySauceCount += pCount;
      totalWasabiCount += pCount;
      totalGingerCount += pCount;
    }

    for (const item of order.items) {
      const pName = item.product?.name || "Блюдо";
      const cat = item.product?.category || "other";
      const qty = item.quantity || 1;
      const price = item.product?.price || 0;
      totalRollsCount += qty;

      if (!productMap[pName]) {
        productMap[pName] = { name: pName, category: cat, quantity: 0, revenue: 0 };
      }
      productMap[pName].quantity += qty;
      productMap[pName].revenue += price * qty;
    }
  }

  const topProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity);

  const packagingBoxes = Math.ceil(totalRollsCount / 2);
  const packagingUsage = [
    { name: "Палочки стандартные (пары)", quantity: totalChopsticksCount, unit: "пар" },
    { name: "Палочки учебные (пары)", quantity: totalTrainingChopsticksCount, unit: "пар" },
    { name: "Соевый соус (порции)", quantity: totalSoySauceCount, unit: "порц" },
    { name: "Васаби (порции)", quantity: totalWasabiCount, unit: "порц" },
    { name: "Имбирь маринованный (порции)", quantity: totalGingerCount, unit: "порц" },
    { name: "Боксы для роллов / упаковка", quantity: packagingBoxes, unit: "шт" },
    { name: "Фирменные крафт-пакеты PandaBar", quantity: completedOrders.length, unit: "шт" }
  ];

  return {
    date: dateStr,
    dateFormatted,
    totalRevenue,
    completedOrdersCount: completedOrders.length,
    cancelledOrdersCount: cancelledOrders.length,
    totalOrdersCount: dayOrders.length,
    averageCheck,
    deliveryOrdersCount: deliveryOrders.length,
    pickupOrdersCount: pickupOrders.length,
    dineInOrdersCount: dineInOrders.length,
    deliveryRevenue,
    pickupRevenue,
    dineInRevenue,
    payments,
    topProducts,
    packagingUsage,
    generatedAt: Date.now()
  };
}

app.get("/api/admin/daily-report", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  try {
    const targetDate = req.query.date as string | undefined;
    const report = await computeDailyZReport(targetDate);
    return res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error("[Daily Report API] Error:", err);
    return res.status(500).json({ success: false, error: "Ошибка формирования дневного отчета" });
  }
});

app.get("/api/admin/daily-report/export-csv", async (req, res) => {
  if (!requireStaffAuth(req, res)) return;
  try {
    const targetDate = req.query.date as string | undefined;
    const report = await computeDailyZReport(targetDate);

    // Generate CSV formatted with UTF-8 BOM for 100% Excel compatibility
    let csv = "\uFEFF";
    csv += `PANDABAR - ДНЕВНОЙ Z-ОТЧЕТ ЗА ${report.dateFormatted}\r\n`;
    csv += `Сформирован: ${new Date().toLocaleString("ru-RU")}\r\n\r\n`;
    
    csv += "ФИНАНСОВЫЕ ПОКАЗАТЕЛИ;\r\n";
    csv += `Итоговая выручка (руб);${report.totalRevenue}\r\n`;
    csv += `Средний чек (руб);${report.averageCheck}\r\n`;
    csv += `Выполнено заказов;${report.completedOrdersCount}\r\n`;
    csv += `Отменено заказов;${report.cancelledOrdersCount}\r\n`;
    csv += `Всего заказов за смену;${report.totalOrdersCount}\r\n\r\n`;

    csv += "РАЗБИВКА ПО ОПЛАТЕ;\r\n";
    csv += `Наличные (руб);${report.payments.cash}\r\n`;
    csv += `Картой курьеру / терминал (руб);${report.payments.card}\r\n`;
    csv += `Онлайн / Переводы (руб);${report.payments.online}\r\n\r\n`;

    csv += "ТИПЫ ЗАКАЗОВ;\r\n";
    csv += `Доставка;${report.deliveryOrdersCount} заказов;${report.deliveryRevenue} руб\r\n`;
    csv += `Самовывоз;${report.pickupOrdersCount} заказов;${report.pickupRevenue} руб\r\n`;
    if (report.dineInOrdersCount > 0) {
      csv += `В зале;${report.dineInOrdersCount} заказов;${report.dineInRevenue} руб\r\n`;
    }
    csv += "\r\n";

    csv += "РЕЙТИНГ ПРОДАННЫХ БЛЮД;\r\n";
    csv += "№;Наименование;Категория;Количество (шт);Выручка (руб)\r\n";
    report.topProducts.forEach((p, idx) => {
      csv += `${idx + 1};"${p.name}";"${p.category}";${p.quantity};${p.revenue}\r\n`;
    });
    csv += "\r\n";

    csv += "РАСХОД КОМПЛЕКТАЦИИ И УПАКОВКИ;\r\n";
    csv += "№;Позиция;Количество;Ед. изм.\r\n";
    report.packagingUsage.forEach((u, idx) => {
      csv += `${idx + 1};"${u.name}";${u.quantity};"${u.unit}"\r\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="pandabar-z-report-${report.date}.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error("[Export CSV API] Error:", err);
    return res.status(500).send("Ошибка экспорта CSV");
  }
});

// ─── Admin Master PIN Keys (Ключ-пароли допуска) ──────────────────────────────

app.get("/api/admin/system-pins", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  try {
    const pinKitchen = (await db.get("SELECT value FROM system_settings WHERE key = 'pin_kitchen'"))?.value || "7701";
    const pinCourier = (await db.get("SELECT value FROM system_settings WHERE key = 'pin_courier'"))?.value || "8802";
    const pinOwner = (await db.get("SELECT value FROM system_settings WHERE key = 'pin_owner'"))?.value || "9903";
    const pinAdmin = (await db.get("SELECT value FROM system_settings WHERE key = 'pin_admin'"))?.value || "1488";
    res.json({
      success: true,
      pins: {
        pin_kitchen: pinKitchen,
        pin_courier: pinCourier,
        pin_owner: pinOwner,
        pin_admin: pinAdmin
      }
    });
  } catch (err) {
    console.error("[Get System PINs API] Error:", err);
    res.status(500).json({ success: false, error: "Ошибка получения мастер-ключей" });
  }
});

app.put("/api/admin/system-pins", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const { pin_kitchen, pin_courier, pin_owner, pin_admin } = req.body;
  const now = Date.now();
  try {
    if (pin_kitchen) {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('pin_kitchen', ?, ?)", sanitizeString(pin_kitchen, 50).trim(), now);
    }
    if (pin_courier) {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('pin_courier', ?, ?)", sanitizeString(pin_courier, 50).trim(), now);
    }
    if (pin_owner) {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('pin_owner', ?, ?)", sanitizeString(pin_owner, 50).trim(), now);
    }
    if (pin_admin) {
      await db.run("INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('pin_admin', ?, ?)", sanitizeString(pin_admin, 50).trim(), now);
    }
    res.json({
      success: true,
      message: "Служебные ключ-пароли допуска успешно сохранены"
    });
  } catch (err) {
    console.error("[Update System PINs API] Error:", err);
    res.status(500).json({ success: false, error: "Ошибка сохранения мастер-ключей" });
  }
});

// ─── Admin Workers & Users Management ──────────────────────────────────────────

app.get("/api/admin/workers", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const type = req.query.type as string | undefined;
  try {
    let query = "SELECT id, name, phone, role, status, createdAt FROM users WHERE role IN ('chef', 'courier', 'owner', 'admin', 'manager') ORDER BY createdAt DESC";
    if (type === "all") {
      query = "SELECT id, name, phone, role, status, createdAt FROM users ORDER BY createdAt DESC";
    } else if (type === "clients") {
      query = "SELECT id, name, phone, role, status, createdAt FROM users WHERE role = 'client' OR role IS NULL ORDER BY createdAt DESC";
    }

    const rows = await db.all(query) as any[];
    const workers = (rows || []).map(r => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      role: r.role || "client",
      pinCode: "Защищён (хэш)",
      active: r.status !== "blocked",
      status: r.status || "active",
      createdAt: r.createdAt
    }));
    res.json({ success: true, workers });
  } catch (err) {
    console.error("[Get Workers API] Error:", err);
    res.status(500).json({ success: false, error: "Ошибка получения списка сотрудников" });
  }
});

app.post("/api/admin/workers", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const { name, phone, role, pinCode } = req.body;
  if (!name || !phone || !role || !pinCode) {
    return res.status(400).json({ success: false, error: "Все поля обязательны" });
  }

  const sName = sanitizeString(name, 100);
  const normPhone = normalizePhone(phone);
  const sRole = sanitizeString(role, 20);
  const sPin = sanitizeString(pinCode, 20).trim();

  try {
    const existing = await findUserByPhone(phone);
    const { hash, salt } = hashPassword(sPin);

    let workerId = existing?.id || `wrk-${Date.now().toString(36)}`;
    const now = Date.now();

    if (existing) {
      await db.run(
        "UPDATE users SET name = ?, phone = ?, password_hash = ?, password_salt = ?, plain_pin = NULL, role = ?, status = 'active' WHERE id = ?",
        sName, normPhone, hash, salt, sRole, existing.id
      );
    } else {
      await db.run(
        `INSERT INTO users (id, name, phone, password_hash, password_salt, plain_pin, role, status, createdAt)
         VALUES (?, ?, ?, ?, ?, NULL, ?, 'active', ?)`,
        workerId, sName, normPhone, hash, salt, sRole, now
      );
    }

    const worker = {
      id: workerId,
      name: sName,
      phone: normPhone,
      role: sRole,
      pinCode: "Защищён (хэш)",
      active: true,
      status: "active",
      createdAt: existing ? existing.createdAt : now
    };

    res.json({ success: true, worker });
  } catch (err) {
    console.error("[Create Worker API] Error:", err);
    res.status(500).json({ success: false, error: "Ошибка создания сотрудника" });
  }
});

app.put("/api/admin/workers/:workerId", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const workerId = req.params.workerId;
  const { name, phone, role, pinCode, status } = req.body;

  try {
    const existing = await db.get("SELECT * FROM users WHERE id = ?", workerId) as SqliteUser;
    if (!existing) {
      return res.status(404).json({ success: false, error: "Сотрудник не найден" });
    }

    const sName = name ? sanitizeString(name, 100) : existing.name;
    const normPhone = phone ? normalizePhone(phone) : existing.phone;
    const sRole = role ? sanitizeString(role, 20) : (existing.role || "chef");
    const sStatus = status === "blocked" ? "blocked" : "active";

    if (pinCode && typeof pinCode === "string" && pinCode.trim().length > 0) {
      const sPin = pinCode.trim();
      const { hash, salt } = hashPassword(sPin);
      await db.run(
        "UPDATE users SET name = ?, phone = ?, role = ?, status = ?, password_hash = ?, password_salt = ?, plain_pin = NULL WHERE id = ?",
        sName, normPhone, sRole, sStatus, hash, salt, workerId
      );
    } else {
      await db.run(
        "UPDATE users SET name = ?, phone = ?, role = ?, status = ? WHERE id = ?",
        sName, normPhone, sRole, sStatus, workerId
      );
    }

    const updatedWorker = {
      id: workerId,
      name: sName,
      phone: normPhone,
      role: sRole,
      pinCode: "Защищён (хэш)",
      active: sStatus !== "blocked",
      status: sStatus,
      createdAt: existing.createdAt
    };

    res.json({ success: true, worker: updatedWorker });
  } catch (err) {
    console.error("[Update Worker API] Error:", err);
    res.status(500).json({ success: false, error: "Ошибка обновления сотрудника" });
  }
});

app.delete("/api/admin/workers/:workerId", async (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const workerId = req.params.workerId;
  if (workerId === "user-admin-main") {
    return res.status(403).json({ success: false, error: "Нельзя удалить главного администратора системы" });
  }
  try {
    await db.run("DELETE FROM users WHERE id = ?", workerId);
    res.json({ success: true, message: "Сотрудник успешно удален из базы" });
  } catch (err) {
    console.error("[Delete Worker API] Error:", err);
    res.status(500).json({ success: false, error: "Ошибка удаления сотрудника" });
  }
});

app.patch("/api/admin/menu/:productId", (req, res) => {
  if (!requireAdminAuth(req, res)) return;
  const productId = req.params.productId;
  const { price, inStock } = req.body;

  const item = MENU_ITEMS.find(m => m.id === productId);
  if (!item) {
    return res.status(404).json({ success: false, error: "Товар не найден" });
  }

  if (typeof price === "number" && price > 0) {
    item.price = price;
  }
  if (typeof inStock === "boolean") {
    item.inStock = inStock;
  }

  res.json({ success: true, product: item });
});


// ─── ENTERPRISE RBAC ROLE ENDPOINTS & SECOPS ──────────────────────────────────

// [ROLE 1: CLIENT] - Own Orders Only
app.get("/api/orders/my", async (req, res) => {
  const u = (req as any).user || getRequestUser(req);
  if (!u) {
    return res.status(401).json({ success: false, error: "Требуется авторизация клиента" });
  }
  try {
    const rows = await db.all("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC", u.id) as SqliteOrder[];
    return res.json({ success: true, orders: rows.map(mapSqliteOrder) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка загрузки заказов клиента" });
  }
});

// [ROLE 2: KITCHEN] - KDS Screen (Sanitized & Masked)
app.get("/api/kitchen/kds-orders", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;
  try {
    const rows = await db.all(
      "SELECT * FROM orders WHERE status IN ('confirmed', 'cooking', 'ready') ORDER BY createdAt ASC"
    ) as SqliteOrder[];
    
    // Privacy & PII protection: strip customer phone and payment card details for kitchen
    const kdsOrders = rows.map(mapSqliteOrder).map(order => ({
      id: order.id,
      type: order.type,
      status: order.status,
      createdAt: order.createdAt,
      targetTime: order.targetTime,
      timingType: order.timingType,
      items: order.items,
      personsCount: order.personsCount,
      chopsticksCount: order.chopsticksCount,
      trainingChopsticksCount: order.trainingChopsticksCount,
      notes: order.notes,
      customerName: order.userName,
      customerPhoneMasked: order.userPhone ? order.userPhone.replace(/(\d{3})\d{4}(\d{2})/, "$1****$2") : ""
    }));

    return res.json({ success: true, count: kdsOrders.length, orders: kdsOrders });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка получения заказов кухни (KDS)" });
  }
});

// [ROLE 4: COURIER] - Dispatch Orders (Address & Payment collection)
app.get("/api/courier/my-orders", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;
  try {
    const rows = await db.all(
      "SELECT * FROM orders WHERE status IN ('ready', 'delivering') AND type = 'delivery' ORDER BY createdAt ASC"
    ) as SqliteOrder[];

    const courierOrders = rows.map(mapSqliteOrder).map(order => ({
      id: order.id,
      status: order.status,
      address: order.address,
      userName: order.userName,
      userPhone: order.userPhone,
      paymentMethod: order.paymentMethod,
      totalToCollect: (order.paymentMethod === 'cash' || order.paymentMethod === 'card_courier') ? order.total : 0,
      changeFrom: order.changeFrom,
      deliveryFee: order.deliveryFee,
      itemsCount: order.items.reduce((s, it) => s + it.quantity, 0),
      notes: order.notes,
      createdAt: order.createdAt
    }));

    return res.json({ success: true, count: courierOrders.length, orders: courierOrders });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка диспетчера курьеров" });
  }
});

// [ROLE 5: SYSADMIN] - Healthcheck Probe
app.get("/healthz", async (_req, res) => {
  const health = await getHealthStatus(db);
  const code = health.status === "healthy" ? 200 : 503;
  return res.status(code).json(health);
});

// [ROLE 5: SYSADMIN] - Prometheus & JSON Metrics
app.get("/metrics", async (_req, res) => {
  try {
    const orderRows = await db.all("SELECT status, count(*) as cnt, sum(total) as sumTotal FROM orders GROUP BY status") as any[];
    const userRow = await db.get("SELECT count(*) as cnt FROM users") as any;
    const auditRow = await db.get("SELECT count(*) as cnt FROM audit_logs") as any;
    const sessionRow = await db.get("SELECT count(*) as cnt FROM sessions WHERE isRevoked = 0") as any;
    
    return res.json({
      success: true,
      timestamp: Date.now(),
      uptimeSeconds: Math.floor(process.uptime()),
      usersTotal: userRow?.cnt || 0,
      activeSessions: sessionRow?.cnt || 0,
      auditEventsTotal: auditRow?.cnt || 0,
      activeSseConnections: sseClients.size,
      ordersByStatus: orderRows,
      memoryUsageMB: {
        rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
        heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка сбора метрик" });
  }
});

// [ROLE 5: SYSADMIN] - Security Audit Log Viewer
app.get("/api/sysadmin/audit-logs", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;
  const limit = Math.min(parseInt(req.query.limit as string || "100", 10), 500);
  try {
    const rows = await db.all("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", limit);
    return res.json({ success: true, count: rows.length, logs: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка чтения журнала аудита" });
  }
});

// [ROLE 5: SYSADMIN] - Maintenance Mode Control
app.post("/api/sysadmin/maintenance", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;
  const { enabled, reason, estimatedMinutes } = req.body;
  setMaintenanceMode(Boolean(enabled), reason, estimatedMinutes, (req as any).user?.phone || "sysadmin");
  await logAuditEvent(db, {
    userId: (req as any).user?.id,
    userRole: (req as any).user?.role || "sysadmin",
    action: enabled ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED",
    details: { reason, estimatedMinutes },
    req
  });
  return res.json({ success: true, maintenance: getMaintenanceStatus() });
});

// [ROLE 5: SYSADMIN] - Snapshot Backup Trigger
app.post("/api/sysadmin/backup", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;
  const result = await createDatabaseBackup();
  if (result.success) {
    await logAuditEvent(db, {
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role || "sysadmin",
      action: "DATABASE_BACKUP_CREATED",
      details: { backupPath: result.backupPath, sizeBytes: result.sizeBytes },
      req
    });
  }
  return res.json(result);
});

// [ROLE 5: SYSADMIN] - Instant Session Revocation
app.post("/api/sysadmin/sessions/revoke", async (req, res) => {
  if (!requireAdminSecret(req, res)) return;
  const { userId, token } = req.body;
  if (userId) {
    await revokeUserSessions(db, userId);
  } else if (token) {
    await revokeSingleSession(db, token);
  }
  await logAuditEvent(db, {
    userId: (req as any).user?.id,
    userRole: (req as any).user?.role || "sysadmin",
    action: "SESSION_REVOKED",
    details: { targetUserId: userId, tokenTargeted: Boolean(token) },
    req
  });
  return res.json({ success: true, message: "Сессия успешно отозвана" });
});

app.use("/api/*", (_req, res) => {
  res.status(404).json({ success: false, error: "API endpoint не найден" });
});

// ─── Vite Dev Server / Static Serving ─────────────────────────────────────────

async function startServer() {
  await initDb();

  const publicUploadsPath = path.join(process.cwd(), "public", "uploads");
  if (fs.existsSync(publicUploadsPath)) {
    app.use("/uploads", express.static(publicUploadsPath, { maxAge: "30d" }));
  }

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
      console.error("[Server] dist/ folder not found. Run `npm run build` first.");
      process.exit(1);
    }
    const distUploadsPath = path.join(distPath, "uploads");
    if (fs.existsSync(distUploadsPath)) {
      app.use("/uploads", express.static(distUploadsPath, { maxAge: "30d" }));
    }
    app.use(express.static(distPath, { maxAge: "1d" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🐼 PandaBar server running!`);
    console.log(`   ➜  Local:   http://localhost:${PORT}`);
    console.log(`   ➜  Mode:    ${IS_PRODUCTION ? "production" : "development"}`);
    console.log(`   ➜  Admin:   ${IS_PRODUCTION ? "protected by ADMIN_SECRET" : "dev mode (open)"}\n`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
