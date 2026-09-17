"""
Tier 1: Feature Coverage - Cart Operations
Area: Cart Subtotal Calculation, Multi-Item Handling, and Validation
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestCartOperations(unittest.TestCase):
    """Test suite for cart item aggregation, subtotal calculation, and server constraints."""

    @classmethod
    def setUpClass(cls):
        status, data, _ = api_request("/api/menu")
        cls.catalog = data.get("menu", []) if status == 200 and isinstance(data, dict) else []
        cls.item_1 = cls.catalog[0] if len(cls.catalog) > 0 else {"id": "item-filadelfiya", "price": 590}
        cls.item_2 = cls.catalog[1] if len(cls.catalog) > 1 else {"id": "item-kaliforniya", "price": 490}

    def test_single_item_subtotal_calculation(self):
        """Test 3.1: Single item quantity multiplied by official price matches subtotal."""
        price = self.item_1.get("price", 500)
        qty = 3
        expected_subtotal = price * qty

        payload = {
            "userName": "Cart Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item_1["id"]}, "quantity": qty}],
            "deliveryFee": 0,
            "discount": 0,
            "total": 1,  # Intentional dummy client total to test server authoritative calculation
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200, f"Expected 200, got {status}: {data}")
        order = data.get("order", {})
        self.assertEqual(order.get("total"), expected_subtotal, f"Expected subtotal {expected_subtotal}, got {order.get('total')}")

    def test_multi_item_cart_aggregation(self):
        """Test 3.2: Multi-item cart calculates total sum of all item lines."""
        p1 = self.item_1.get("price", 500)
        p2 = self.item_2.get("price", 400)
        q1, q2 = 2, 1
        expected_items_total = (p1 * q1) + (p2 * q2)

        payload = {
            "userName": "Multi Item Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [
                {"product": {"id": self.item_1["id"]}, "quantity": q1},
                {"product": {"id": self.item_2["id"]}, "quantity": q2},
            ],
            "deliveryFee": 0,
            "discount": 0,
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("total"), expected_items_total)

    def test_cart_quantity_adjustment_scaling(self):
        """Test 3.3: Scaling quantity from 1 to 4 scales line item total proportionally."""
        price = self.item_1.get("price", 500)
        payload_1 = {
            "userName": "Scale Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item_1["id"]}, "quantity": 1}],
        }
        status_1, data_1, _ = api_request("/api/orders", method="POST", data=payload_1)
        self.assertEqual(status_1, 200)
        total_1 = data_1.get("order", {}).get("total")

        payload_4 = {
            "userName": "Scale Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item_1["id"]}, "quantity": 4}],
        }
        status_4, data_4, _ = api_request("/api/orders", method="POST", data=payload_4)
        self.assertEqual(status_4, 200)
        total_4 = data_4.get("order", {}).get("total")

        self.assertEqual(total_4, total_1 * 4, f"Expected 4x total ({total_1 * 4}), got {total_4}")

    def test_cutlery_and_persons_metadata_persistence(self):
        """Test 3.4: Cart supports person count and cutlery configuration."""
        payload = {
            "userName": "Cutlery Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item_1["id"]}, "quantity": 1}],
            "personsCount": 3,
            "chopsticksCount": 3,
            "cutleryKits": {"regular": 2, "training": 1, "soySauce": 3, "wasabi": 3, "ginger": 3},
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("personsCount"), 3)
        self.assertEqual(order.get("chopsticksCount"), 3)

    def test_empty_cart_submission_rejection(self):
        """Test 3.5: Empty items array returns HTTP 400 Bad Request."""
        payload = {
            "userName": "Empty Cart Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 400, f"Expected 400 Bad Request for empty items, got {status}")
        self.assertFalse(data.get("success", True))

    def test_non_array_items_rejection(self):
        """Test 3.6: Non-array items parameter returns HTTP 400."""
        payload = {
            "userName": "Malformed Cart Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": "not-an-array",
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 400, f"Expected 400 for non-array items, got {status}")


if __name__ == "__main__":
    unittest.main()
