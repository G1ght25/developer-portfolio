"""
Tier 3: Cross-Feature Combinations - Stop-List & Item Availability
Area: Kitchen Stop-List Toggling and Dish Ordering Availability
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    generate_unique_phone,
)


class TestStopListRejection(unittest.TestCase):
    """Test interaction between admin menu stop-list toggle and client order placement."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()
        status, data, _ = api_request("/api/menu")
        cls.catalog = data.get("menu", []) if status == 200 and isinstance(data, dict) else []
        cls.target_product = cls.catalog[0] if cls.catalog else {"id": "item-filadelfiya", "name": "Филадельфия", "price": 590}

    @classmethod
    def tearDownClass(cls):
        # Guarantee item is restored to inStock: true
        if cls.admin_token and cls.target_product:
            api_request(
                f"/api/admin/menu/{cls.target_product['id']}",
                method="PATCH",
                headers={"Authorization": f"Bearer {cls.admin_token}"},
                data={"inStock": True}
            )

    def test_unauthenticated_menu_stoplist_update_rejected(self):
        """Test 3.2.1: Unauthenticated request to toggle product inStock returns HTTP 401."""
        prod_id = self.target_product["id"]
        status, data, _ = api_request(
            f"/api/admin/menu/{prod_id}",
            method="PATCH",
            data={"inStock": False}
        )
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated stop-list toggle, got {status}")

    def test_admin_can_toggle_dish_to_stop_list(self):
        """Test 3.2.2: Admin can set dish inStock: false via PATCH /api/admin/menu/:productId."""
        prod_id = self.target_product["id"]
        status, data, _ = api_request(
            f"/api/admin/menu/{prod_id}",
            method="PATCH",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"inStock": False}
        )
        self.assertEqual(status, 200, f"Expected 200 for stop-list patch, got {status}: {data}")
        self.assertTrue(data.get("success"))
        product = data.get("product", {})
        self.assertFalse(product.get("inStock", True))

    def test_admin_can_restore_dish_from_stop_list(self):
        """Test 3.2.3: Admin can restore dish to inStock: true."""
        prod_id = self.target_product["id"]
        status, data, _ = api_request(
            f"/api/admin/menu/{prod_id}",
            method="PATCH",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"inStock": True}
        )
        self.assertEqual(status, 200)
        product = data.get("product", {})
        self.assertTrue(product.get("inStock"))

    def test_ordering_active_dish_succeeds(self):
        """Test 3.2.4: Ordering active inStock: true dish succeeds."""
        payload = {
            "userName": "Active Dish Order",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.target_product["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200, f"Expected 200 for active dish order, got {status}: {data}")
        self.assertTrue(data.get("success"))


if __name__ == "__main__":
    unittest.main()
