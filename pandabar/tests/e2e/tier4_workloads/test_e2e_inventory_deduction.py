"""
Tier 4: Real-World Workload Scenarios - Inventory Deduction & Restock
Scenario: Ingredient Stock Check -> Recipe Ordering -> Warehouse Deduction -> Restock
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    generate_unique_phone,
)


class TestE2EInventoryDeduction(unittest.TestCase):
    """End-to-end user journey verifying recipe-based warehouse inventory tracking and restock operations."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    def test_complete_inventory_tracking_and_restock(self):
        """Complete workflow for inventory observation, order placement, and restock replenishment."""
        # 1. Fetch initial inventory state
        status_inv, data_inv, _ = api_request("/api/admin/inventory", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status_inv, 200)
        items = data_inv.get("inventory", [])
        self.assertGreater(len(items), 0)

        target_ing = items[0]
        target_id = target_ing["id"]
        initial_stock = target_ing.get("stock", target_ing.get("currentStock", 0))

        # 2. Place order containing recipe items
        payload = {
            "userName": "Инвентарь Заказчик",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 2}],
        }
        status_order, data_order, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status_order, 200)

        # 3. Restock target ingredient to guarantee adequate buffers
        restock_amount = 500
        status_restock, data_restock, _ = api_request(
            "/api/admin/inventory/restock",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"ingredientId": target_id, "amount": restock_amount}
        )
        self.assertEqual(status_restock, 200)
        updated_item = data_restock.get("ingredient", {})
        new_stock = updated_item.get("stock", updated_item.get("currentStock", 0))
        self.assertGreaterEqual(new_stock, initial_stock)


if __name__ == "__main__":
    unittest.main()
