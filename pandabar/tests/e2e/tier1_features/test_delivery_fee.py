"""
Tier 1: Feature Coverage - Delivery Fee Calculation
Area: Server Delivery Fee Threshold (1000 RUB Rule) & Mode Selection
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestDeliveryFeeCalculation(unittest.TestCase):
    """Test suite verifying authoritative server-side delivery fee calculation."""

    @classmethod
    def setUpClass(cls):
        status, data, _ = api_request("/api/menu")
        cls.catalog = data.get("menu", []) if status == 200 and isinstance(data, dict) else []
        # Find item < 1000 and item >= 1000 or combo
        cls.small_item = next((i for i in cls.catalog if i.get("price", 0) < 1000), {"id": "item-filadelfiya", "price": 590})
        cls.large_item = next((i for i in cls.catalog if i.get("price", 0) >= 1000), None)
        if not cls.large_item:
            cls.large_item = cls.small_item

    def test_delivery_under_1000_rub_incurs_150_fee(self):
        """Test 4.1: Delivery order below 1000 RUB subtotal incurs 150 RUB delivery fee."""
        price = self.small_item.get("price", 500)
        # Ensure subtotal < 1000
        qty = 1 if price < 1000 else 1
        if price >= 1000:
            self.skipTest("Catalog has no items under 1000 RUB")

        payload = {
            "userName": "Under 1000 Delivery",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Ленина", "house": "10"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.small_item["id"]}, "quantity": qty}],
            "deliveryFee": 0,  # Client attempts to send 0
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 150, f"Expected 150 RUB delivery fee for subtotal {price}, got {order.get('deliveryFee')}")
        self.assertEqual(order.get("total"), price + 150)

    def test_delivery_at_or_above_1000_rub_is_free(self):
        """Test 4.2: Delivery order at or above 1000 RUB subtotal has 0 RUB delivery fee."""
        price = self.small_item.get("price", 500)
        # Choose qty so subtotal >= 1000
        qty = max(2, (1000 // price) + 1)
        subtotal = price * qty

        payload = {
            "userName": "Above 1000 Delivery",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Малахова", "house": "55"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.small_item["id"]}, "quantity": qty}],
            "deliveryFee": 150,  # Client erroneously sends 150
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0, f"Expected free delivery (0 RUB) for subtotal {subtotal}, got {order.get('deliveryFee')}")
        self.assertEqual(order.get("total"), subtotal)

    def test_pickup_under_1000_rub_has_zero_delivery_fee(self):
        """Test 4.3: Pickup order under 1000 RUB subtotal has 0 RUB delivery fee."""
        price = self.small_item.get("price", 500)
        payload = {
            "userName": "Small Pickup",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.small_item["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0, "Pickup orders must always have 0 delivery fee")
        self.assertEqual(order.get("total"), price)

    def test_pickup_above_1000_rub_has_zero_delivery_fee(self):
        """Test 4.4: Pickup order above 1000 RUB subtotal has 0 RUB delivery fee."""
        price = self.small_item.get("price", 500)
        qty = max(2, (1000 // price) + 1)
        subtotal = price * qty
        payload = {
            "userName": "Large Pickup",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.small_item["id"]}, "quantity": qty}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("deliveryFee"), 0)
        self.assertEqual(order.get("total"), subtotal)

    def test_delivery_fee_arithmetic_consistency(self):
        """Test 4.5: Final total satisfies formula: total == subtotal - discount + deliveryFee."""
        price = self.small_item.get("price", 500)
        payload = {
            "userName": "Arithmetic Tester",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "пр. Ленина", "house": "1"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.small_item["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        calculated_subtotal = sum(i["product"]["price"] * i["quantity"] for i in order.get("items", []))
        expected_total = calculated_subtotal - order.get("discount", 0) + order.get("deliveryFee", 0)
        self.assertEqual(order.get("total"), expected_total, "Order total arithmetic mismatch")

    def test_client_delivery_fee_tampering_ignored(self):
        """Test 4.6: Client sending negative or arbitrary delivery fee is overridden by server."""
        payload = {
            "userName": "Fee Tamperer",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Советская", "house": "12"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.small_item["id"]}, "quantity": 1}],
            "deliveryFee": -500,  # Negative fee attack
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertGreaterEqual(order.get("deliveryFee"), 0, "Delivery fee must not be negative")
        self.assertEqual(order.get("deliveryFee"), 150 if order.get("total") < 1000 + 150 else 0)


if __name__ == "__main__":
    unittest.main()
