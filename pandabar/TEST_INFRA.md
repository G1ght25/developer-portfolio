# PandaBar E2E Testing Infrastructure Specification

## 1. Testing Philosophy and Methodology

The PandaBar End-to-End (E2E) testing framework provides opaque-box functional verification, security audit validation, and stress-workload simulation against both the live production environment (`https://185-251-88-240.sslip.io`) and local development endpoints (`http://localhost:3000`).

### Core Testing Tenets
1. **Opaque-Box Verification**: Tests interact strictly via public HTTP REST, SSE, and role-based authentication interfaces. Internal database and state variables are observed only through authoritative API responses and audit logs.
2. **Authoritative Specification Grounding**: Expected outputs are derived directly from `PROJECT.md`, `ORIGINAL_REQUEST.md`, and business logic rules (e.g. 1000 RUB free delivery threshold, 9-stage Order FSM transitions, and RBAC privilege separation).
3. **Integrity & Zero Facade Guarantee**: Tests assert real system logic. No dummy test doubles, mocking shims, or facade passes are permitted. Defects discovered on the server are faithfully detected, reported as failed assertions against the specification, and cataloged for implementation milestones M2 and M3.
4. **4-Tier Structured Test Hierarchy**:
   - **Tier 1 (Feature Coverage)**: Comprehensive baseline functionality (>=5 test cases per feature domain).
   - **Tier 2 (Boundary & Corner Cases)**: Edge conditions, zero values, input format variations, and terminal locks (>=5 test cases per area).
   - **Tier 3 (Cross-Feature Combinations)**: Multi-system pairwise interactions, stop-list overrides, and role guards.
   - **Tier 4 (Real-World Workload Scenarios)**: Complete end-to-end customer and operational user journeys.
5. **Zero Emojis Policy**: Strictly zero emojis across all test code, runners, console output, log files, and documentation.

---

## 2. Directory Layout and Module Architecture

```
tests/e2e/
├── __init__.py
├── config.py                           # Target URL, SSL configuration, auth helpers, phone generators
├── runner.py                           # Unified CLI runner with formatted reports and tier selection
├── tier1_features/                     # Tier 1: Baseline Feature Coverage (60 tests)
│   ├── __init__.py
│   ├── test_client_catalog.py          # Catalog retrieval, schema fields, positive pricing, categories
│   ├── test_client_search.py           # Substring matching, case-insensitivity, category filters
│   ├── test_cart_operations.py         # Subtotal calculations, multi-item scaling, cutlery counts
│   ├── test_delivery_fee.py            # Free delivery >=1000 RUB rule, 150 RUB fee, pickup zero fee
│   ├── test_order_checkout.py          # Delivery & pickup checkout, payment options, timeline init
│   ├── test_client_profile.py          # Registration, login, duplicate phone conflict, profile update
│   ├── test_kds_queue.py               # Kitchen KDS queue access, phone masking, cooking/ready FSM
│   ├── test_courier_dispatch.py        # Courier queue, address metadata, delivering/completed FSM
│   ├── test_manager_zreports.py        # Daily Z-report aggregates, CSV UTF-8 BOM export, OPEX settings
│   └── test_warehouse_inventory.py     # Warehouse inventory retrieval, set-stock, restock increment
├── tier2_boundary/                     # Tier 2: Boundary & Corner Cases (46 tests)
│   ├── __init__.py
│   ├── test_zero_rub_cart.py           # Empty items rejection, quantity clamping, extreme values
│   ├── test_delivery_threshold_999_1000.py # Strict 999 vs 1000 RUB discrete boundary step tests
│   ├── test_russian_phone_formats.py   # +7 masked, 7XXXXXXXXXX, 8XXXXXXXXXX, 10-digit normalization
│   ├── test_empty_address_fields.py    # Empty/whitespace street, house defaults, pickup exemptions
│   ├── test_expired_invalid_promos.py  # Bogus promo codes, below-threshold gates, discount overrides
│   ├── test_kitchen_closed_rejection.py # Emergency kitchen pause 403 blocking and reason messages
│   ├── test_terminal_state_rejection.py # Lock on completed/cancelled states (409), cancellation reason (422)
│   └── test_unauthenticated_pii_rejection.py # Unauthenticated access rejection for orders, workers, PINs
├── tier3_combinations/                 # Tier 3: Cross-Feature Combinations (17 tests)
│   ├── __init__.py
│   ├── test_promo_delivery_threshold.py # Promo code min-order interacting with delivery fee threshold
│   ├── test_stop_list_rejection.py     # Menu stop-list inStock toggle and order availability
│   ├── test_pos_order_bypass_defense.py # Unauthenticated isPosOrder parameter injection defenses
│   └── test_sequential_fsm_roles.py   # Client -> Chef -> Courier -> Admin sequential transitions
└── tier4_workloads/                    # Tier 4: Real-World Workload Scenarios (4 tests)
    ├── __init__.py
    ├── test_e2e_customer_to_audit.py   # Complete user journey: Register -> Browse -> Order -> KDS -> Courier -> Z-Report
    ├── test_e2e_pickup_flow.py         # Branch pickup journey: Checkout -> KDS -> Counter Hand-Off
    ├── test_e2e_cancellation_flow.py   # Cancellation journey with mandatory reason, terminal lock, audit trail
    └── test_e2e_inventory_deduction.py # Recipe inventory consumption observation, order placement, restocking
```

---

## 3. Feature Inventory Coverage Matrix

| Feature Domain | Test Module | Test Cases | Tier | Specification Source |
|---|---|---|---|---|
| Client Catalog | `tier1_features/test_client_catalog.py` | 6 | Tier 1 | PROJECT.md Feature 1 |
| Menu Search & Filtering | `tier1_features/test_client_search.py` | 6 | Tier 1 | ORIGINAL_REQUEST.md R2 |
| Cart Calculation | `tier1_features/test_cart_operations.py` | 6 | Tier 1 | ORIGINAL_REQUEST.md R1 |
| Delivery Fee (1000 RUB Threshold) | `tier1_features/test_delivery_fee.py` | 6 | Tier 1 | PROJECT.md Feature 4, 19 |
| Order Checkout | `tier1_features/test_order_checkout.py` | 6 | Tier 1 | PROJECT.md Feature 3, 17 |
| Client Identity & Profile | `tier1_features/test_client_profile.py` | 6 | Tier 1 | ORIGINAL_REQUEST.md R2 |
| Kitchen KDS Queue & Cooking | `tier1_features/test_kds_queue.py` | 6 | Tier 1 | PROJECT.md Feature 17, 20 |
| Courier Dispatch & Delivery | `tier1_features/test_courier_dispatch.py` | 6 | Tier 1 | PROJECT.md Feature 21 |
| Manager Daily Z-Reports & CSV | `tier1_features/test_manager_zreports.py` | 6 | Tier 1 | PROJECT.md Feature 22 |
| Warehouse Stock & Restock | `tier1_features/test_warehouse_inventory.py` | 6 | Tier 1 | PROJECT.md Feature 22 |
| 0 RUB Cart & Quantities | `tier2_boundary/test_zero_rub_cart.py` | 5 | Tier 2 | PROJECT.md Feature 19 |
| 999 vs 1000 RUB Threshold | `tier2_boundary/test_delivery_threshold_999_1000.py` | 6 | Tier 2 | PROJECT.md Feature 4, 19 |
| Russian Phone Formats | `tier2_boundary/test_russian_phone_formats.py` | 6 | Tier 2 | ORIGINAL_REQUEST.md R1 |
| Empty Address Fields | `tier2_boundary/test_empty_address_fields.py` | 6 | Tier 2 | ORIGINAL_REQUEST.md R1 |
| Expired / Invalid Promos | `tier2_boundary/test_expired_invalid_promos.py` | 6 | Tier 2 | PROJECT.md Feature 19 |
| Kitchen Closed Order Rejection | `tier2_boundary/test_kitchen_closed_rejection.py` | 5 | Tier 2 | PROJECT.md Feature 20 |
| Terminal State Lock & Reason | `tier2_boundary/test_terminal_state_rejection.py` | 6 | Tier 2 | PROJECT.md Feature 17 |
| Unauthenticated PII Defense | `tier2_boundary/test_unauthenticated_pii_rejection.py` | 6 | Tier 2 | PROJECT.md Feature 13, 14, 16 |
| Promo & Delivery Interaction | `tier3_combinations/test_promo_delivery_threshold.py` | 4 | Tier 3 | PROJECT.md Feature 4, 19 |
| Stop-List Menu Toggling | `tier3_combinations/test_stop_list_rejection.py` | 4 | Tier 3 | PROJECT.md Feature 20 |
| POS Order Injection Defense | `tier3_combinations/test_pos_order_bypass_defense.py` | 4 | Tier 3 | PROJECT.md Feature 15 |
| Sequential Multi-Role FSM | `tier3_combinations/test_sequential_fsm_roles.py` | 5 | Tier 3 | PROJECT.md Feature 17 |
| Customer to Audit Journey | `tier4_workloads/test_e2e_customer_to_audit.py` | 1 | Tier 4 | ORIGINAL_REQUEST.md R2 |
| Branch Pickup Journey | `tier4_workloads/test_e2e_pickup_flow.py` | 1 | Tier 4 | ORIGINAL_REQUEST.md R2 |
| Order Cancellation Journey | `tier4_workloads/test_e2e_cancellation_flow.py` | 1 | Tier 4 | PROJECT.md Feature 17, 18 |
| Warehouse Stock Deduction Journey | `tier4_workloads/test_e2e_inventory_deduction.py` | 1 | Tier 4 | PROJECT.md Feature 22 |
| **Total Test Suite Volume** | **26 Modules** | **127 Tests** | **Tiers 1-4** | **Complete System Scope** |

---

## 4. Test Execution Instructions

### 4.1 Prerequisites
- Python 3.10+ (tested on Python 3.12.10 on Windows and Linux).
- Standard library modules only (`urllib.request`, `unittest`, `ssl`, `json`, `sys`, `time`, `random`). No external pip dependencies required.

### 4.2 Single-Command Execution
Execute the entire 127-test suite against the live production server:
```powershell
python tests/e2e/runner.py
```

### 4.3 Tier-Specific Execution
Execute individual tiers for targeted regression runs:
```powershell
# Tier 1: Baseline Feature Coverage (60 tests)
python tests/e2e/runner.py --tier 1

# Tier 2: Boundary & Corner Cases (46 tests)
python tests/e2e/runner.py --tier 2

# Tier 3: Cross-Feature Combinations (17 tests)
python tests/e2e/runner.py --tier 3

# Tier 4: Real-World Workload Scenarios (4 tests)
python tests/e2e/runner.py --tier 4
```

### 4.4 Target Server Overrides
To run tests against a local instance or alternative staging deployment:
```powershell
python tests/e2e/runner.py --target http://localhost:3000
```
Alternatively, set the environment variable:
```powershell
$env:PANDABAR_TARGET_URL = "http://localhost:3000"
python tests/e2e/runner.py
```

### 4.5 Standard Unittest Runner
The suite is fully compatible with standard Python unittest test discovery:
```powershell
python -m unittest discover -s tests/e2e -p "test_*.py"
```

---

## 5. Current Implementation Defect Catalog (Milestones M2 & M3)

The test suite accurately asserts the intended specifications. As designed, the following 5 tests currently fail against the live production server, detecting known security and validation gaps scheduled for remediation in Milestone M3:

1. **`test_unauthenticated_single_order_pii_rejected` (Tier 2)**:
   - *Specification*: `PROJECT.md` Feature 13 (Order IDOR & PII Protection). Unauthenticated requests to `GET /api/orders/:orderId` must return HTTP 401 or 403.
   - *Current Server Behavior*: Returns HTTP 200 with full customer name, phone number, and address due to `if (authUser && !isStaff)` allowing `null` authUser.
   - *Remediation Target*: Milestone M3.

2. **`test_unauthenticated_thermal_receipt_pii_rejected` (Tier 2)**:
   - *Specification*: `PROJECT.md` Feature 14 (Thermal Receipt PII Protection). Unauthenticated requests to `GET /api/orders/:orderId/receipt` must return HTTP 401 or 403.
   - *Current Server Behavior*: Returns HTTP 200 with 1C thermal receipt HTML without authentication checks.
   - *Remediation Target*: Milestone M3.

3. **`test_unauthenticated_pos_order_discount_injection_rejected` (Tier 3)**:
   - *Specification*: `PROJECT.md` Feature 15 (POS Order Parameter Injection Defense). Unauthenticated clients must not set `isPosOrder: true` or receive arbitrary POS discounts.
   - *Current Server Behavior*: Server accepts `isPosOrder: true` from unauthenticated client bodies and applies up to 25% custom discount.
   - *Remediation Target*: Milestone M3.

4. **`test_unauthenticated_pos_cannot_bypass_kitchen_pause` (Tier 3)**:
   - *Specification*: `PROJECT.md` Feature 15 & 20. Emergency kitchen pause must reject customer orders regardless of client payload parameters.
   - *Current Server Behavior*: Server accepts `isPosOrder: true` and bypasses the kitchen closed check (`!kitchenStatus.isOpen && !isPosOrder`).
   - *Remediation Target*: Milestone M3.

5. **`test_unauthenticated_pos_threshold_reduction_rejected` (Tier 3)**:
   - *Specification*: `PROJECT.md` Feature 15. Unauthenticated clients cannot reduce the delivery fee threshold from 1000 RUB to 600 RUB by claiming `isPosOrder: true`.
   - *Current Server Behavior*: Server sets delivery fee to 0 RUB at 600 RUB when `isPosOrder: true` is present.
   - *Remediation Target*: Milestone M3.
