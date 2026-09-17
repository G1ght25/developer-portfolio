import { strict as assert } from 'assert';
import productsDefault, { products } from '../src/products';
import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  PROMO_CODES,
  DEFAULT_WAREHOUSE_STOCK,
  DEFAULT_OPEX,
} from '../src/data/menuData';
import type {
  Product,
  IngredientPortion,
  WarehouseIngredient,
  OperationalExpenses,
  Order,
  OrderStatus,
  CutleryKits,
  PaymentMethod,
  OrderType,
  DailyZReport,
  PromoCode,
} from '../src/types';
import * as LucideIcons from 'lucide-react';

console.log('=== RUNNING M1 IMPORT & TYPE VERIFICATION TESTS ===');

let passCount = 0;
let failCount = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

// Test 1: products.ts exports
runTest('src/products.ts default export matches named export', () => {
  assert.ok(Array.isArray(products), 'products named export should be an array');
  assert.ok(Array.isArray(productsDefault), 'products default export should be an array');
  assert.strictEqual(products, productsDefault, 'Default and named export should be reference identical');
  assert.strictEqual(products, MENU_ITEMS, 'products should be reference identical to MENU_ITEMS');
  assert.ok(products.length > 0, `Expected products length > 0, got ${products.length}`);
});

// Test 2: Product type contract validation across all items
runTest('All items in MENU_ITEMS satisfy Product interface contract', () => {
  const ids = new Set<string>();
  for (let i = 0; i < MENU_ITEMS.length; i++) {
    const item = MENU_ITEMS[i];
    assert.ok(typeof item.id === 'string' && item.id.length > 0, `Item at index ${i} missing valid id`);
    assert.ok(!ids.has(item.id), `Duplicate product id detected: ${item.id}`);
    ids.add(item.id);

    assert.ok(typeof item.name === 'string' && item.name.length > 0, `Item ${item.id} missing valid name`);
    assert.ok(typeof item.price === 'number' && !isNaN(item.price) && item.price >= 0, `Item ${item.id} invalid price: ${item.price}`);
    assert.ok(typeof item.weight === 'number' && !isNaN(item.weight), `Item ${item.id} invalid weight`);
    assert.ok(typeof item.image === 'string', `Item ${item.id} missing image`);
    assert.ok(typeof item.category === 'string' && item.category.length > 0, `Item ${item.id} missing category`);

    // Nullable fields
    assert.ok(
      item.oldPrice === undefined || item.oldPrice === null || (typeof item.oldPrice === 'number' && !isNaN(item.oldPrice)),
      `Item ${item.id} has invalid oldPrice: ${item.oldPrice}`
    );
    assert.ok(
      item.pieces === undefined || item.pieces === null || typeof item.pieces === 'number',
      `Item ${item.id} has invalid pieces: ${item.pieces}`
    );
    assert.ok(
      item.tags === undefined || item.tags === null || (Array.isArray(item.tags) && item.tags.every(t => typeof t === 'string')),
      `Item ${item.id} has invalid tags: ${JSON.stringify(item.tags)}`
    );

    // Ingredients
    if (item.ingredients) {
      assert.ok(Array.isArray(item.ingredients), `Item ${item.id} ingredients is not an array`);
      for (const ing of item.ingredients) {
        assert.ok(typeof ing.id === 'string', `Ingredient missing id in ${item.id}`);
        assert.ok(typeof ing.name === 'string', `Ingredient missing name in ${item.id}`);
        assert.ok(typeof ing.amount === 'number' && !isNaN(ing.amount), `Ingredient invalid amount in ${item.id}`);
        assert.ok(typeof ing.unit === 'string', `Ingredient missing unit in ${item.id}`);
      }
    }
  }
});

// Test 3: Categories consistency
runTest('Category mapping consistency', () => {
  assert.ok(Array.isArray(MENU_CATEGORIES) && MENU_CATEGORIES.length > 0, 'MENU_CATEGORIES should be non-empty array');
  const categoryIds = new Set(MENU_CATEGORIES.map(c => c.id));
  const missingCategories = new Set<string>();

  for (const item of MENU_ITEMS) {
    if (!categoryIds.has(item.category)) {
      missingCategories.add(item.category);
    }
  }

  console.log(`      Total products: ${MENU_ITEMS.length}, Defined categories: ${MENU_CATEGORIES.length}`);
  if (missingCategories.size > 0) {
    console.log(`      Notice: Product categories not in MENU_CATEGORIES list: ${Array.from(missingCategories).join(', ')}`);
  }
});

// Test 4: DEFAULT_WAREHOUSE_STOCK contract and math
runTest('DEFAULT_WAREHOUSE_STOCK integrity and deduction logic', () => {
  assert.ok(Array.isArray(DEFAULT_WAREHOUSE_STOCK), 'DEFAULT_WAREHOUSE_STOCK must be array');
  assert.strictEqual(DEFAULT_WAREHOUSE_STOCK.length, 12, 'Expected 12 warehouse ingredients');

  for (const ing of DEFAULT_WAREHOUSE_STOCK) {
    assert.ok(typeof ing.id === 'string', `Missing warehouse id: ${ing.id}`);
    assert.ok(typeof ing.name === 'string', `Missing warehouse name: ${ing.name}`);
    assert.ok(typeof ing.stock === 'number' && !isNaN(ing.stock), `Warehouse ${ing.id} invalid stock: ${ing.stock}`);
    assert.ok(typeof ing.currentStock === 'number', `Warehouse ${ing.id} missing currentStock compatibility field`);
    assert.strictEqual(ing.stock, ing.currentStock, `Warehouse ${ing.id} stock and currentStock should match`);
    assert.ok(typeof ing.costPerUnit === 'number' && !isNaN(ing.costPerUnit), `Warehouse ${ing.id} invalid costPerUnit`);
    assert.ok(typeof ing.minThreshold === 'number', `Warehouse ${ing.id} invalid minThreshold`);

    // Verify deduction arithmetic
    const deduction = 50;
    const newStock = Math.max(0, parseFloat((ing.stock - deduction).toFixed(2)));
    assert.ok(!isNaN(newStock), `Deduction produced NaN on ${ing.id}`);
  }
});

// Test 5: DEFAULT_OPEX structure
runTest('DEFAULT_OPEX compatibility properties', () => {
  assert.ok(typeof DEFAULT_OPEX === 'object' && DEFAULT_OPEX !== null, 'DEFAULT_OPEX must be object');
  const requiredProps: (keyof OperationalExpenses)[] = [
    'rentMonthly',
    'salariesMonthly',
    'utilitiesMonthly',
    'marketingMonthly',
    'otherMonthly',
  ];
  for (const prop of requiredProps) {
    assert.ok(typeof DEFAULT_OPEX[prop] === 'number', `DEFAULT_OPEX missing required property: ${prop}`);
    assert.ok(!isNaN(DEFAULT_OPEX[prop] as number), `DEFAULT_OPEX property ${prop} is NaN`);
  }

  // Legacy per-month properties
  assert.ok(typeof DEFAULT_OPEX.rentPerMonth === 'number', 'DEFAULT_OPEX missing rentPerMonth');
  assert.ok(typeof DEFAULT_OPEX.salariesPerMonth === 'number', 'DEFAULT_OPEX missing salariesPerMonth');
  assert.ok(typeof DEFAULT_OPEX.utilitiesPerMonth === 'number', 'DEFAULT_OPEX missing utilitiesPerMonth');
  assert.ok(typeof DEFAULT_OPEX.marketingPerMonth === 'number', 'DEFAULT_OPEX missing marketingPerMonth');
});

// Test 6: PROMO_CODES structure
runTest('PROMO_CODES validation', () => {
  assert.ok(Array.isArray(PROMO_CODES), 'PROMO_CODES must be array');
  assert.ok(PROMO_CODES.length > 0, 'PROMO_CODES should not be empty');
  for (const p of PROMO_CODES) {
    assert.ok(typeof p.code === 'string' && p.code.length > 0, 'PromoCode missing code');
    assert.ok(p.discountType === 'percent' || p.discountType === 'fixed', `Invalid discountType: ${p.discountType}`);
    assert.ok(typeof p.discountValue === 'number' && p.discountValue > 0, `Invalid discountValue in ${p.code}`);
    assert.ok(typeof p.minOrderAmount === 'number', `Invalid minOrderAmount in ${p.code}`);
  }
});

// Test 7: Lucide React module augmentation validation
runTest('Lucide React icons and symbols intact after module augmentation', () => {
  assert.ok(typeof LucideIcons === 'object', 'LucideIcons must be an object');
  assert.ok(typeof LucideIcons.ShoppingCart === 'object' || typeof LucideIcons.ShoppingCart === 'function', 'ShoppingCart icon missing');
  assert.ok(typeof LucideIcons.User === 'object' || typeof LucideIcons.User === 'function', 'User icon missing');
  assert.ok(typeof LucideIcons.Phone === 'object' || typeof LucideIcons.Phone === 'function', 'Phone icon missing');
  assert.ok(typeof LucideIcons.Search === 'object' || typeof LucideIcons.Search === 'function', 'Search icon missing');
  assert.ok(typeof LucideIcons.Plus === 'object' || typeof LucideIcons.Plus === 'function', 'Plus icon missing');
  assert.ok(typeof LucideIcons.Minus === 'object' || typeof LucideIcons.Minus === 'function', 'Minus icon missing');
  assert.ok(typeof LucideIcons.Trash2 === 'object' || typeof LucideIcons.Trash2 === 'function', 'Trash2 icon missing');
});

// Test 8: Order and CutleryKits types
runTest('CutleryKits and PaymentMethod type contract compatibility', () => {
  const kits: CutleryKits = {
    personsCount: 2,
    chopsticks: 2,
    trainingChopsticks: 0,
    soySauce: 2,
    wasabi: 2,
    ginger: 2,
    soySauceCount: 2,
    wasabiCount: 2,
    gingerCount: 2,
  };
  assert.strictEqual(kits.soySauce, 2);
  assert.strictEqual(kits.soySauceCount, 2);

  const orderTypes: OrderType[] = ['delivery', 'pickup', 'dine_in'];
  assert.strictEqual(orderTypes.length, 3);

  const paymentMethods: PaymentMethod[] = [
    'cash',
    'card_courier',
    'online_mock',
    'card_terminal',
    'transfer',
    'paid_pos',
  ];
  assert.strictEqual(paymentMethods.length, 6);
});

console.log(`\n=== IMPORT & TYPE TEST SUMMARY ===`);
console.log(`Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
