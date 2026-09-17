"""
Tier 3: Cross-Feature Combinations - Promo Codes & Delivery Fee Threshold
Area: Pairwise Interaction between Promo Discounts and 1000 RUB Delivery Cutoff
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestPromoDeliveryThreshold(unittest.TestCase):
    """Test interaction between promo code discounts and delivery fee threshold calculation."""

    @classmethod
    def setUpClass(cls):
        status, data, _ = api_request("/api/menu")
        cls.catalog = data.get("menu", []) if status == 200 and isinstance(data, dict) else []
        cls.item = cls.catalog[0] if cls.catalog else {"id": "item-filadelfiya", "price": 590}

    def test_promo_discount_lowers_total_but_preserves_free_delivery(self):
        """Test 3.1.1: Order subtotal 1180 RUB with PANDA10 (10% discount): delivery fee remains 0 RUB."""
        # 2x 590 = 1180. Discount = 118. Paid total = 1062. Delivery fee = 0.
        payload = {
            "userName": "Promo Threshold User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Ленина", "house": "10"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item["id"]}, "quantity": 2}],
            "promoCode": "PANDA10",
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        subtotal = self.item["price"] * 2
        expected_discount = round(subtotal * 0.10)
        self.assertEqual(order.get("discount"), expected_discount)
        self.assertEqual(order.get("deliveryFee"), 0, "Free delivery must be preserved based on pre-discount subtotal >= 1000")
        self.assertEqual(order.get("total"), subtotal - expected_discount)

    def test_promo_code_min_order_gate_fails_below_threshold(self):
        """Test 3.1.2: Order subtotal 1000 RUB + WELCOME (min 1200): discount is 0, delivery is free."""
        # Subtotal 1000 qualifies for free delivery, but NOT for WELCOME promo (min 1200).
        item_500 = next((i for i in self.catalog if i.get("price") == 500), self.item)
        qty = 2 if item_500.get("price") == 500 else 2
        subtotal = item_500.get("price", 590) * qty

        payload = {
            "userName": "Gated Promo User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Ленина", "house": "10"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": item_500["id"]}, "quantity": qty}],
            "promoCode": "WELCOME",  # Requires 1200 RUB
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        if subtotal < 1200:
            self.assertEqual(order.get("discount"), 0, "WELCOME promo must not apply under 1200 RUB")
        if subtotal >= 1000:
            self.assertEqual(order.get("deliveryFee"), 0, "Free delivery must apply for subtotal >= 1000 RUB")

    def test_fixed_discount_promo_with_qualifying_delivery(self):
        """Test 3.1.3: Subtotal >= 1200 with WELCOME (200 RUB off): discount=200, deliveryFee=0."""
        # Calculate qty so subtotal >= 1200
        price = self.item["price"]
        qty = (1200 // price) + 1
        subtotal = price * qty

        payload = {
            "userName": "Fixed Promo User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "пр. Ленина", "house": "15"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item["id"]}, "quantity": qty}],
            "promoCode": "WELCOME",
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("discount"), 200, "WELCOME promo must give 200 RUB discount")
        self.assertEqual(order.get("deliveryFee"), 0)
        self.assertEqual(order.get("total"), subtotal - 200)

    def test_under_threshold_order_retains_paid_delivery_despite_promo_attempt(self):
        """Test 3.1.4: Subtotal < 1000 with invalid promo retains 150 RUB delivery fee."""
        payload = {
            "userName": "Under Promo User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Советская", "house": "1"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.item["id"]}, "quantity": 1}],
            "promoCode": "INVALID_CODE",
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("discount"), 0)
        if self.item["price"] < 1000:
            self.assertEqual(order.get("deliveryFee"), 150)


if __name__ == "__main__":
    unittest.main()
