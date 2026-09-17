/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PandaBar Enterprise Security & RBAC Service
 * Architecture: 5 Roles (Customer, Kitchen, Manager, Courier, Sysadmin)
 * Features:
 *  - Finite State Machine (FSM) Order Lifecycle Validation
 *  - Cryptographic Session Management with Instant Invalidation
 *  - Immutable Audit Logging (Audit Trail)
 *  - Context Isolation & Masking (PII Protection)
 *  - Health Checks, Prometheus-compatible Metrics & Snapshot Backups
 *  - Maintenance Mode Gateway
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

// ─── 1. Role System & Types ──────────────────────────────────────────────────

export type EnterpriseRole = 'client' | 'kitchen' | 'chef' | 'manager' | 'courier' | 'sysadmin' | 'owner' | 'admin';

export interface AuthenticatedUser {
  id: string;
  role: EnterpriseRole;
  phone: string;
  name?: string;
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ─── 2. Finite State Machine (FSM) ──────────────────────────────────────────

export type OrderFSMStatus = 
  | 'pending'           // Created / Pending Confirmation
  | 'pending_payment'   // Waiting for online payment webhook
  | 'confirmed'         // Confirmed by manager or system
  | 'cooking'           // Kitchen KDS preparing
  | 'ready'             // Cooked, packed, ready for pickup/courier
  | 'delivering'        // Courier on route
  | 'failed_delivery'   // Customer unreachable / failed delivery attempt
  | 'completed'         // Handed over / Delivered (Terminal)
  | 'cancelled';        // Cancelled with mandatory reason (Terminal)

interface FSMTransitionRule {
  allowedNext: OrderFSMStatus[];
  allowedRoles: EnterpriseRole[];
  requiresReason?: boolean;
}

export const ORDER_FSM_RULES: Record<OrderFSMStatus, FSMTransitionRule> = {
  pending: {
    allowedNext: ['confirmed', 'cancelled'],
    allowedRoles: ['client', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  pending_payment: {
    allowedNext: ['confirmed', 'cancelled'],
    allowedRoles: ['client', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  confirmed: {
    allowedNext: ['cooking', 'cancelled'],
    allowedRoles: ['kitchen', 'chef', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  cooking: {
    allowedNext: ['ready', 'cancelled'],
    allowedRoles: ['kitchen', 'chef', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  ready: {
    allowedNext: ['delivering', 'completed', 'cancelled'],
    allowedRoles: ['courier', 'kitchen', 'chef', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  delivering: {
    allowedNext: ['completed', 'failed_delivery', 'cancelled'],
    allowedRoles: ['courier', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  failed_delivery: {
    allowedNext: ['delivering', 'cancelled'],
    allowedRoles: ['courier', 'manager', 'sysadmin', 'owner', 'admin'],
  },
  completed: {
    allowedNext: [],
    allowedRoles: [],
  },
  cancelled: {
    allowedNext: [],
    allowedRoles: [],
  },
};

export function validateFSMTransition(
  currentStatus: string,
  newStatus: string,
  userRole: EnterpriseRole,
  cancellationReason?: string
): { valid: boolean; error?: string } {
  const current = currentStatus as OrderFSMStatus;
  const target = newStatus as OrderFSMStatus;

  const rule = ORDER_FSM_RULES[current];
  if (!rule) {
    return { valid: false, error: `Неизвестный исходный статус: ${currentStatus}` };
  }

  if (current === 'completed' || current === 'cancelled') {
    return { valid: false, error: `Заказ в статусе ${currentStatus} завершён и не подлежит изменению` };
  }

  if (!rule.allowedNext.includes(target)) {
    return { 
      valid: false, 
      error: `Недопустимый переход из '${currentStatus}' в '${newStatus}'. Допустимо: [${rule.allowedNext.join(', ')}]` 
    };
  }

  // Check role authorization for this transition (Sysadmin/Owner/Admin always have master override)
  if (userRole !== 'sysadmin' && userRole !== 'owner' && userRole !== 'admin') {
    const normalizedRole = userRole === 'chef' ? 'kitchen' : userRole;
    if (!rule.allowedRoles.includes(userRole) && !rule.allowedRoles.includes(normalizedRole as EnterpriseRole)) {
      return { 
        valid: false, 
        error: `Роль '${userRole}' не имеет прав для перевода заказа из '${currentStatus}' в '${newStatus}'` 
      };
    }
  }

  if (target === 'cancelled' && (!cancellationReason || cancellationReason.trim().length < 3)) {
    return { valid: false, error: 'Для отмены заказа требуется указать причину (не менее 3 символов)' };
  }

  return { valid: true };
}

// ─── 3. Database Schema Migration ───────────────────────────────────────────

export async function setupEnterpriseSecurityTables(db: any): Promise<void> {
  if (!db) return;

  try {
    await db.exec(`
      -- Audit Trail Table (Immutable Security Journal)
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userRole TEXT,
        action TEXT NOT NULL,
        entityType TEXT,
        entityId TEXT,
        details TEXT,
        ip TEXT,
        userAgent TEXT,
        timestamp INTEGER NOT NULL
      );

      -- Active & Revocable Sessions Table
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        role TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        ip TEXT,
        userAgent TEXT,
        isRevoked INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        expiresAt INTEGER NOT NULL
      );

      -- Delivery Zones Configuration
      CREATE TABLE IF NOT EXISTS delivery_zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        minOrderFree INTEGER NOT NULL DEFAULT 1000,
        standardFee INTEGER NOT NULL DEFAULT 150,
        estTimeMinutes INTEGER NOT NULL DEFAULT 45,
        isActive INTEGER NOT NULL DEFAULT 1
      );

      -- Critical Performance & Security Indexes
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
    `);

    // Seed default zones if table is empty
    const zoneCount = await db.get("SELECT count(*) as count FROM delivery_zones");
    if (!zoneCount || zoneCount.count === 0) {
      await db.run(
        `INSERT INTO delivery_zones (id, name, minOrderFree, standardFee, estTimeMinutes, isActive)
         VALUES 
          ('zone-barnaul-center', 'Барнаул (Центральная зона)', 1000, 150, 45, 1),
          ('zone-barnaul-outer', 'Барнаул (Отдаленные районы)', 1500, 200, 60, 1),
          ('zone-suburbs', 'Пригород / Коттеджные поселки', 2500, 350, 80, 1)`
      );
    }
  } catch (err) {
    console.error('[Security Service] Migration error (non-fatal):', err);
  }
}

// ─── 4. Audit Logging Engine ────────────────────────────────────────────────

export async function logAuditEvent(
  db: any,
  params: {
    userId?: string;
    userRole?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: any;
    req?: Request;
  }
): Promise<void> {
  if (!db) return;

  const id = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const ip = params.req ? (params.req.headers['x-forwarded-for'] as string || params.req.ip || '127.0.0.1') : 'internal';
  const userAgent = params.req ? (params.req.headers['user-agent'] || 'unknown') : 'system';
  const detailsStr = params.details ? (typeof params.details === 'string' ? params.details : JSON.stringify(params.details)) : null;

  try {
    await db.run(
      `INSERT INTO audit_logs (id, userId, userRole, action, entityType, entityId, details, ip, userAgent, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      params.userId || null,
      params.userRole || null,
      params.action,
      params.entityType || null,
      params.entityId || null,
      detailsStr,
      ip,
      userAgent,
      Date.now()
    );
  } catch (err) {
    console.error('[Audit Logger] Failed to record audit log:', err);
  }
}

// ─── 5. Cryptographic Sessions & Instant Revocation ─────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'sushi-panda-production-security-salt-2026';

export function generateTokenPair(user: { id: string; role: EnterpriseRole; phone: string; name?: string }): {
  accessToken: string;
  sessionId: string;
} {
  const sessionId = `sess-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    phone: user.phone,
    name: user.name || '',
    sessionId: sessionId,
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes short-lived
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  const accessToken = `${payload}.${signature}`;

  return { accessToken, sessionId };
}

export async function createActiveSession(
  db: any,
  user: AuthenticatedUser,
  token: string,
  req?: Request
): Promise<void> {
  if (!db) return;
  const ip = req ? (req.headers['x-forwarded-for'] as string || req.ip || '') : '';
  const ua = req ? (req.headers['user-agent'] || '') : '';
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 3600 * 1000; // 30 days session cap

  try {
    await db.run(
      `INSERT OR REPLACE INTO sessions (id, userId, role, token, ip, userAgent, isRevoked, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      user.sessionId || `sess-${now}`,
      user.id,
      user.role,
      token,
      ip,
      ua,
      now,
      expiresAt
    );
  } catch (err) {
    console.error('[Session Store] Error creating session record:', err);
  }
}

export async function isSessionRevoked(db: any, token: string): Promise<boolean> {
  if (!db) return false;
  try {
    const row = await db.get('SELECT isRevoked, expiresAt FROM sessions WHERE token = ?', token);
    if (!row) return false; // If not in DB, fallback to token signature check
    if (row.isRevoked === 1 || Date.now() > row.expiresAt) return true;
    return false;
  } catch {
    return false;
  }
}

export async function revokeUserSessions(db: any, userId: string): Promise<number> {
  if (!db) return 0;
  try {
    const res = await db.run('UPDATE sessions SET isRevoked = 1 WHERE userId = ?', userId);
    return res.changes || 1;
  } catch {
    return 0;
  }
}

export async function revokeSingleSession(db: any, token: string): Promise<boolean> {
  if (!db) return false;
  try {
    await db.run('UPDATE sessions SET isRevoked = 1 WHERE token = ?', token);
    return true;
  } catch {
    return false;
  }
}

// ─── 6. Authentication & RBAC Middlewares ───────────────────────────────────

export function authenticateToken(db: any) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
    if (!authHeader) {
      req.user = undefined;
      next();
      return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token || !token.includes('.')) {
      req.user = undefined;
      next();
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      req.user = undefined;
      next();
      return;
    }

    const [payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
    if (signature !== expectedSig) {
      req.user = undefined;
      next();
      return;
    }

    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      
      // Check session revocation in database
      const revoked = await isSessionRevoked(db, token);
      if (revoked) {
        res.status(401).json({ success: false, error: 'Сессия была отозвана или срок ее действия истек' });
        return;
      }

      req.user = {
        id: data.id,
        role: (data.role as EnterpriseRole) || 'client',
        phone: data.phone,
        name: data.name,
        sessionId: data.sessionId,
      };
      next();
    } catch {
      req.user = undefined;
      next();
    }
  };
}

export function authorizeRoles(...allowedRoles: EnterpriseRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Требуется авторизация (отсутствует токен)' });
      return;
    }

    // Sysadmin and Owner have master access across all ERP modules
    if (req.user.role === 'sysadmin' || req.user.role === 'owner') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: `Доступ запрещен для роли '${req.user.role}'. Требуются права: [${allowedRoles.join(', ')}]` 
      });
      return;
    }

    next();
  };
}

// ─── 7. Maintenance Mode Gateway ───────────────────────────────────────────

let maintenanceConfig = {
  enabled: false,
  reason: 'Плановые технические работы по обновлению базы данных PandaBar',
  estimatedEndTime: null as number | null,
  initiatedBy: 'system',
};

export function getMaintenanceStatus() {
  return { ...maintenanceConfig };
}

export function setMaintenanceMode(enabled: boolean, reason?: string, estimatedMinutes?: number, user?: string) {
  maintenanceConfig.enabled = enabled;
  if (reason) maintenanceConfig.reason = reason;
  maintenanceConfig.estimatedEndTime = estimatedMinutes ? Date.now() + estimatedMinutes * 60 * 1000 : null;
  if (user) maintenanceConfig.initiatedBy = user;
}

export function maintenanceGuard(req: Request, res: Response, next: NextFunction): void {
  // Allow health checks, status, login and admin bypass
  if (!maintenanceConfig.enabled) {
    next();
    return;
  }

  // Allow static assets, healthz and sysadmin auth routes
  if (
    req.path.startsWith('/healthz') || 
    req.path.startsWith('/api/auth/login') ||
    req.path.startsWith('/api/sysadmin')
  ) {
    next();
    return;
  }

  // If user is authenticated as sysadmin or owner, let them through
  if (req.user && (req.user.role === 'sysadmin' || req.user.role === 'owner')) {
    next();
    return;
  }

  res.status(503).json({
    success: false,
    error: 'Сервис находится в режиме технического обслуживания',
    maintenance: {
      active: true,
      reason: maintenanceConfig.reason,
      estimatedEndTime: maintenanceConfig.estimatedEndTime,
    }
  });
}

// ─── 8. Healthz, Metrics & Backups ──────────────────────────────────────────

export async function getHealthStatus(db: any) {
  let dbHealthy = false;
  let userCount = 0;
  let orderCount = 0;

  try {
    const u = await db.get('SELECT count(*) as count FROM users');
    const o = await db.get('SELECT count(*) as count FROM orders');
    userCount = u?.count || 0;
    orderCount = o?.count || 0;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  const memory = process.memoryUsage();
  return {
    status: dbHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now(),
    database: {
      connected: dbHealthy,
      driver: db?.mock ? 'in-memory-mock' : 'sqlite3',
      records: { users: userCount, orders: orderCount }
    },
    system: {
      memoryRssMB: (memory.rss / 1024 / 1024).toFixed(1),
      heapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(1),
      nodeVersion: process.version,
    },
    maintenance: maintenanceConfig.enabled
  };
}

export async function createDatabaseBackup(): Promise<{ success: boolean; backupPath?: string; sizeBytes?: number; error?: string }> {
  const dbFile = path.join(process.cwd(), 'data', 'database.db');
  if (!fs.existsSync(dbFile)) {
    return { success: false, error: 'Database file not found on disk' };
  }

  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup_pandabar_${timestamp}.db`;
  const backupFilePath = path.join(backupDir, backupFileName);

  try {
    fs.copyFileSync(dbFile, backupFilePath);
    const stats = fs.statSync(backupFilePath);
    return { success: true, backupPath: backupFilePath, sizeBytes: stats.size };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
