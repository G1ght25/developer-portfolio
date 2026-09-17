# Project: PandaBar Food Delivery Service Audit & Refinement

## Architecture
- Frontend: React 19 SPA, Vite 6, Tailwind CSS v4, Motion, Lucide React, Web Audio engine.
- Backend: Node.js Express 4.21 monolithic server with embedded SQLite database, cryptographic HMAC-SHA256 session management, and Server-Sent Events (SSE).
- Role Architecture: 5 primary roles (Client, Chef/Kitchen, Courier, Manager, Owner/Admin).
- Security & FSM: 9-stage Order Finite State Machine with role guards, server-side price recalculation, and immutable audit logs.
- Live Deployment: Target server at https://185-251-88-240.sslip.io reverse-proxied by Nginx 1.28.3 with TLS.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | TypeScript Clean Build | Eliminate 530+ TS2322 errors in menuData and remove dead products.ts | M1 | Survey 1 |
| 2 | Cross-Platform Scripts | Make package.json build/test/clean scripts cross-platform | M1 | Survey 1 |
| 3 | Fast Direct Ordering (<4 clicks) | Direct 1-click cart addition and direct checkout from product modal | M2 | Survey 2 |
| 4 | Free Delivery Progress Meter | Visual progress bar in CartDrawer for 1000 RUB threshold | M2 | Survey 2 |
| 5 | Cart Cutlery & Person Transparency | Cutlery and person count controls and summary in CartDrawer | M2 | Survey 2 |
| 6 | Inline Red Form Validation | Human-readable field error messages and red borders in CheckoutModal | M2 | Survey 2 |
| 7 | Submit Button User Guidance | Enable submit button clicking to provide clear validation feedback | M2 | Survey 2 |
| 8 | Mobile Bottom Navigation Mount | Mount MobileBottomNav in App.tsx with mobile padding | M2 | Survey 2 |
| 9 | 375px Header & Viewport Fixes | Prevent clipping of action buttons and format address inputs on 375px | M2 | Survey 2 |
| 10 | Dark & Light Theming Readability | UI theme switcher and eliminate black-on-black text contrast in light mode | M2 | Survey 2 |
| 11 | React Rendering Performance | Memoize core sections, debounce search, and eliminate redundant polling | M2 | Survey 2 |
| 12 | Route Shadowing Fix (/api/orders/my) | Reorder Express route registration before :orderId param | M3 | Survey 3 |
| 13 | Order IDOR & PII Protection | Require authentication or phone match on GET /api/orders/:orderId | M3 | Survey 3 |
| 14 | Thermal Receipt PII Protection | Restrict GET /api/orders/:orderId/receipt to staff or order owner | M3 | Survey 3 |
| 15 | POS Order Parameter Injection Defense | Disallow unauthenticated clients from setting isPosOrder: true | M3 | Survey 3 |
| 16 | Sysadmin RBAC Isolation | Restrict /api/sysadmin/* to admin/sysadmin roles (prevent cook/courier leak) | M3 | Survey 3 |
| 17 | Order FSM Lifecycle Transitions | Enforce 9-stage status rules across Client, Chef, Courier, and Admin | M3 | Survey 3 |
| 18 | Client Order Cancellation Support | Allow authenticated clients to cancel pending orders with a valid reason | M3 | Survey 3 |
| 19 | Server Price & Discount Recalculation | Strict recalculation of catalog items, delivery fees, and promo codes | M3 | Survey 3 |
| 20 | Stop-List & Emergency Kitchen Pause | Cook/Chef ingredient stop-list and kitchen emergency pause toggle | M3 | Survey 3 |
| 21 | Courier Dispatch & Delivery Workflow | Courier terminal order pickup and delivery status updates | M3 | Survey 3 |
| 22 | Manager & Admin Analytics & Reports | Z-Reports, P&L analytics, inventory management, and CSV export | M3 | Survey 3 |
| 23 | E2E Regression & Stress Test Suite | 100% E2E test execution (Tiers 1-4) and adversarial verification (Tier 5) | M4 | Survey 1, 2, 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Type Integrity & Build Tooling | Fix TypeScript strict errors, remove dead duplicate products.ts, setup cross-platform scripts | none | IN_PROGRESS |
| M2 | Foolproof UX/UI & Viewports | <4 clicks flow, 1000 RUB cart progress bar, inline red form errors, MobileBottomNav, 375px viewports, theme contrast | M1 | PLANNED |
| M3 | Security, RBAC & FSM Hardening | Fix route shadowing (/api/orders/my), IDOR PII leaks, isPosOrder injection, sysadmin RBAC, FSM verification | M1 | PLANNED |
| M4 | Final Milestone: 100% E2E & Adversarial Hardening | Phase 1: Pass 100% E2E test suite (Tiers 1-4); Phase 2: Adversarial Coverage Hardening (Tier 5) | M2, M3, E2E Track | PLANNED |

## Interface Contracts
### Client UI ↔ Cart & Checkout Components
- CartDrawer: Emits onProceedToCheckout(), displays items, subtotal, delivery fee, threshold bar (1000 RUB), and cutlery summary.
- CheckoutModal: Validates { name, phone, orderType, street, house, paymentMethod }. Emits validated payload to POST /api/orders. Displays inline errors with red border highlights.
- ProductDetailModal: Provides direct onAddToCartAndCheckout() button to achieve <4 clicks order completion.

### Frontend ↔ Backend API Contracts
- POST /api/orders: Submits { items, userPhone, userName, type, address, paymentMethod, promoCode }. Server recalculates prices and returns 200 OK with { success: true, order, user }. Rejects unauthenticated isPosOrder.
- GET /api/orders/my: Returns { success: true, orders: Order[] } for authenticated user. Registered BEFORE GET /api/orders/:orderId.
- GET /api/orders/:orderId: Returns { success: true, order: Order } only if requester is staff or the order owner (phone/userId match). Returns 401/403 otherwise.
- POST /api/orders/:orderId/status: Accepts { status: OrderStatus, reason?: string }. Enforces ORDER_FSM_RULES and role authorization. Returns 200 OK on success, 409 on terminal state, 422 on invalid transition.

## Code Layout
- Frontend UI Components: src/components/*.tsx
- Frontend App & Routing: src/App.tsx, src/main.tsx, src/index.css
- Frontend Data & Types: src/data/menuData.ts, src/types.ts
- Backend Server: server.ts
- Backend Security & FSM: src/server/securityService.ts
- Integration & E2E Tests: 	ests/e2e/, scratch/*.py
