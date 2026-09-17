"""
Tier 2: Boundary & Corner Cases - 0 RUB Cart & Invalid Quantities
Area: Edge Conditions in Cart Contents and Zero Pricing
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestZeroRubCart(unittest.TestCase):
    """Test boundary cases for 0 RUB items, empty carts, and negative quantities."""

    def test_empty_items_list_returns_400(self):
        """Test 2.1.1: Cart with empty items array [] is rejected with 400 Bad Request."""
        payload = {
            "userName": "Zero Cart User",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 400, f"Expected 400 for empty items, got {status}")
        self.assertFalse(data.get("success", True))

    def test_missing_items_parameter_returns_400(self):
        """Test 2.1.2: Order payload completely missing 'items' key returns 400 Bad Request."""
        payload = {
            "userName": "Missing Items User",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 400, f"Expected 400 for missing items, got {status}")

    def test_zero_quantity_clamping_or_rejection(self):
        """Test 2.1.3: Item with quantity: 0 is either clamped to minimum 1 or rejected."""
        payload = {
            "userName": "Zero Qty User",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 0}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        # Server clamps quantity with Math.max(1, qty) or returns 400
        if status == 200:
            order = data.get("order", {})
            self.assertGreater(order.get("total", 0), 0, "Order total cannot be 0 for catalog item")
            self.assertEqual(order.get("items", [])[0].get("quantity"), 1)
        else:
            self.assertEqual(status, 400)

    def test_negative_quantity_clamping_or_rejection(self):
        """Test 2.1.4: Item with negative quantity (e.g. -10) is clamped to positive or rejected."""
        payload = {
            "userName": "Negative Qty User",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": -10}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        if status == 200:
            order = data.get("order", {})
            self.assertGreater(order.get("total", 0), 0)
            self.assertGreaterEqual(order.get("items", [])[0].get("quantity"), 1)
        else:
            self.assertEqual(status, 400)

    def test_excessive_quantity_boundary_capped(self):
        """Test 2.1.5: Item with extreme quantity (e.g. 9999) is capped to maximum 99."""
        payload = {
            "userName": "Extreme Qty User",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 9999}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        if status == 200:
            order = data.get("order", {})
            # Server specifies Math.min(99, qty)
            self.assertLessEqual(order.get("items", [])[0].get("quantity"), 99)


if __name__ == "__main__":
    unittest.main()
