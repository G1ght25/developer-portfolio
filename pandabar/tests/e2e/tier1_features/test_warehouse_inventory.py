"""
Tier 1: Feature Coverage - Warehouse Inventory
Area: Inventory Stocks, Restocking, and Material Thresholds
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    register_client,
)


class TestWarehouseInventory(unittest.TestCase):
    """Test suite for warehouse ingredient stock tracking, restocking, and authorization."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    def test_warehouse_inventory_retrieval(self):
        """Test 10.1: Authenticated staff can fetch inventory list."""
        self.assertIsNotNone(self.admin_token, "Admin token required")
        status, data, _ = api_request("/api/admin/inventory", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200, f"Expected 200 for inventory, got {status}: {data}")
        self.assertTrue(data.get("success"))
        self.assertIn("inventory", data)
        self.assertGreater(len(data.get("inventory", [])), 0)

    def test_warehouse_item_schema_integrity(self):
        """Test 10.2: Inventory items define identifier, name, stock, unit, and threshold."""
        status, data, _ = api_request("/api/admin/inventory", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200)
        items = data.get("inventory", [])
        for item in items[:10]:
            self.assertIn("id", item)
            self.assertIn("name", item)
            self.assertTrue("stock" in item or "currentStock" in item, f"Missing stock attribute in {item}")
            self.assertIn("unit", item)
            self.assertIn("minThreshold", item)

    def test_unauthenticated_inventory_access_rejected(self):
        """Test 10.3: Unauthenticated request to /api/admin/inventory returns HTTP 401."""
        status, data, _ = api_request("/api/admin/inventory")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated inventory, got {status}")

    def test_client_role_cannot_access_inventory(self):
        """Test 10.4: Client token cannot access warehouse inventory (HTTP 403 Forbidden)."""
        client = register_client()
        status, data, _ = api_request("/api/admin/inventory", headers={"Authorization": f"Bearer {client['token']}"})
        self.assertEqual(status, 403, f"Expected 403 for client accessing inventory, got {status}")

    def test_set_absolute_stock_quantity(self):
        """Test 10.5: Admin can set absolute ingredient stock via POST /api/admin/inventory/set-stock."""
        status, data, _ = api_request("/api/admin/inventory", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200)
        items = data.get("inventory", [])
        target = items[0]
        target_id = target["id"]

        test_quantity = 35000
        status_set, data_set, _ = api_request(
            "/api/admin/inventory/set-stock",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"ingredientId": target_id, "stock": test_quantity}
        )
        self.assertEqual(status_set, 200, f"Expected 200 for set-stock, got {status_set}: {data_set}")
        updated = data_set.get("ingredient", {})
        val = updated.get("stock", updated.get("currentStock"))
        self.assertEqual(val, test_quantity)

    def test_restock_ingredient_increment(self):
        """Test 10.6: Admin can restock ingredient quantity via POST /api/admin/inventory/restock."""
        status, data, _ = api_request("/api/admin/inventory", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200)
        items = data.get("inventory", [])
        target = items[0]
        target_id = target["id"]
        initial_stock = target.get("stock", target.get("currentStock", 0))

        delta = 1000
        status_restock, data_restock, _ = api_request(
            "/api/admin/inventory/restock",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"ingredientId": target_id, "amount": delta}
        )
        self.assertEqual(status_restock, 200, f"Expected 200 for restock, got {status_restock}: {data_restock}")
        updated = data_restock.get("ingredient", {})
        val = updated.get("stock", updated.get("currentStock"))
        self.assertEqual(val, initial_stock + delta)


if __name__ == "__main__":
    unittest.main()
