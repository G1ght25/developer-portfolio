"""
Tier 2: Boundary & Corner Cases - 999 vs 1000 RUB Free Delivery Threshold
Area: Strict Boundary Verification of Delivery Fee (1000 RUB Cutoff)
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestDeliveryThreshold999Vs1000(unittest.TestCase):
    """Test boundary precision around the 1000 RUB free delivery threshold."""

    @classmethod
    def setUpClass(cls):
        status, data, _ = api_request("/api/menu")
        cls.catalog = data.get("menu", []) if status == 200 and isinstance(data, dict) else []
        # Find item with price exactly 1000 (e.g. item-sets-set-pikantnyj-new) or combination
        cls.exact_1000_item = next((i for i in cls.catalog if i.get("price") == 1000), None)
        cls.under_1000_item = next((i for i in cls.catalog if i.get("price", 0) < 1000), None)

    def test_subtotal_below_1000_has_delivery_fee_150(self):
        """Test 2.2.1: Subtotal < 1000 RUB strictly incurs 150 RUB delivery fee."""
        self.assertIsNotNone(self.under_1000_item, "Catalog requires item under 1000")
        price = self.under_1000_item["price"]

        payload = {
            "userName": "Boundary Below 1000",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Попова", "house": "1"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.under_1000_item["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 150, f"Expected 150 fee for subtotal {price}")
        self.assertEqual(order.get("total"), price + 150)

    def test_subtotal_exactly_1000_has_zero_delivery_fee(self):
        """Test 2.2.2: Subtotal exactly 1000 RUB qualifies for 0 RUB free delivery."""
        if self.exact_1000_item:
            items = [{"product": {"id": self.exact_1000_item["id"]}, "quantity": 1}]
            expected_subtotal = 1000
        else:
            # Pair 2x 500
            item_500 = next((i for i in self.catalog if i.get("price") == 500), None)
            if item_500:
                items = [{"product": {"id": item_500["id"]}, "quantity": 2}]
                expected_subtotal = 1000
            else:
                self.skipTest("No combination summing exactly to 1000 RUB")

        payload = {
            "userName": "Exact 1000 User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "пр. Красноармейский", "house": "100"},
            "paymentMethod": "cash",
            "items": items,
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0, f"Expected 0 fee for exact 1000 RUB subtotal, got {order.get('deliveryFee')}")
        self.assertEqual(order.get("total"), expected_subtotal)

    def test_subtotal_above_1000_has_zero_delivery_fee(self):
        """Test 2.2.3: Subtotal strictly above 1000 RUB (e.g. >1100) receives 0 RUB delivery fee."""
        self.assertIsNotNone(self.under_1000_item)
        price = self.under_1000_item["price"]
        qty = (1000 // price) + 1
        expected_subtotal = price * qty
        self.assertGreater(expected_subtotal, 1000)

        payload = {
            "userName": "Above 1000 User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Молодежная", "house": "15"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.under_1000_item["id"]}, "quantity": qty}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0)
        self.assertEqual(order.get("total"), expected_subtotal)

    def test_pickup_below_1000_remains_free(self):
        """Test 2.2.4: Pickup order below 1000 RUB has 0 delivery fee."""
        price = self.under_1000_item["price"]
        payload = {
            "userName": "Pickup Below 1000",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.under_1000_item["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0)

    def test_pickup_exact_1000_remains_free(self):
        """Test 2.2.5: Pickup order at 1000 RUB has 0 delivery fee."""
        if not self.exact_1000_item:
            self.skipTest("Exact 1000 item not available")
        payload = {
            "userName": "Pickup 1000",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.exact_1000_item["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0)

    def test_boundary_step_delta_fee_transition(self):
        """Test 2.2.6: Verify discrete step transition between below-threshold and above-threshold."""
        price = self.under_1000_item["price"]
        # Order 1: single item (<1000)
        p1 = {
            "userName": "Step Below",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Советская", "house": "5"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.under_1000_item["id"]}, "quantity": 1}],
        }
        s1, d1, _ = api_request("/api/orders", method="POST", data=p1)
        self.assertEqual(s1, 200)
        self.assertEqual(d1.get("order", {}).get("deliveryFee"), 150)

        # Order 2: multi item (>=1000)
        qty = max(2, (1000 // price) + 1)
        p2 = {
            "userName": "Step Above",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Советская", "house": "5"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.under_1000_item["id"]}, "quantity": qty}],
        }
        s2, d2, _ = api_request("/api/orders", method="POST", data=p2)
        self.assertEqual(s2, 200)
        self.assertEqual(d2.get("order", {}).get("deliveryFee"), 0)


if __name__ == "__main__":
    unittest.main()
