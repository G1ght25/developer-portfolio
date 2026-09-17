"""
Tier 1: Feature Coverage - Order Checkout
Area: Order Placement, Parameter Validation, and Server Sanitization
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestOrderCheckout(unittest.TestCase):
    """Test suite for complete checkout submission, price enforcement, and payment options."""

    @classmethod
    def setUpClass(cls):
        status, data, _ = api_request("/api/menu")
        cls.catalog = data.get("menu", []) if status == 200 and isinstance(data, dict) else []
        cls.test_product = cls.catalog[0] if cls.catalog else {"id": "item-filadelfiya", "name": "Филадельфия", "price": 590}

    def test_standard_delivery_order_checkout(self):
        """Test 5.1: Valid delivery order checkout generates order ID and 'pending' status."""
        payload = {
            "userName": "Иван Доставочкин",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {
                "street": "пр. Социалистический",
                "house": "85",
                "apartment": "12",
                "entrance": "1",
                "floor": "3",
            },
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.test_product["id"]}, "quantity": 2}],
            "notes": "Пожалуйста, не звонить в домофон",
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200, f"Expected 200, got {status}: {data}")
        self.assertTrue(data.get("success"))
        order = data.get("order", {})
        self.assertTrue(order.get("id"), "Expected order ID in response")
        self.assertEqual(order.get("status"), "pending")
        self.assertEqual(order.get("type"), "delivery")
        self.assertIsNotNone(order.get("address"))

    def test_standard_pickup_order_checkout(self):
        """Test 5.2: Valid pickup order checkout associates pickup location."""
        pickup_loc = "ул. Балтийская, 16"
        payload = {
            "userName": "Мария Самовывозова",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": pickup_loc,
            "paymentMethod": "card_courier",
            "items": [{"product": {"id": self.test_product["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("status"), "pending")
        self.assertEqual(order.get("type"), "pickup")
        self.assertEqual(order.get("pickupLocation"), pickup_loc)

    def test_price_tampering_overridden_by_catalog_price(self):
        """Test 5.3: Attacker claiming 1 RUB for 590 RUB dish is overridden by server."""
        real_price = self.test_product.get("price", 590)
        payload = {
            "userName": "Hacker Price",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{
                "product": {
                    "id": self.test_product["id"],
                    "name": self.test_product.get("name", "Ролл"),
                    "price": 1,  # Attacker attempts 1 RUB
                },
                "quantity": 2,
            }],
            "total": 2,  # Attacker attempts 2 RUB
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("total"), real_price * 2, "Server must enforce official catalog price")

    def test_payment_methods_acceptance(self):
        """Test 5.4: Valid payment methods (cash, card_courier, online_mock) are accepted."""
        methods = ["cash", "card_courier", "online_mock"]
        for method in methods:
            payload = {
                "userName": f"Payment Tester {method}",
                "userPhone": generate_unique_phone(),
                "type": "pickup",
                "pickupLocation": "ул. Ленина, д. 42",
                "paymentMethod": method,
                "items": [{"product": {"id": self.test_product["id"]}, "quantity": 1}],
            }
            status, data, _ = api_request("/api/orders", method="POST", data=payload)
            self.assertEqual(status, 200, f"Failed for payment method {method}: {data}")
            self.assertEqual(data.get("order", {}).get("paymentMethod"), method)

    def test_invalid_payment_method_rejected(self):
        """Test 5.5: Unsupported payment method returns HTTP 400 Bad Request."""
        payload = {
            "userName": "Bad Payment Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "crypto_bitcoin",
            "items": [{"product": {"id": self.test_product["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 400, f"Expected 400 for invalid payment method, got {status}")

    def test_order_status_timeline_initialization(self):
        """Test 5.6: New order initializes statusTimeline with 'pending' event."""
        payload = {
            "userName": "Timeline Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": self.test_product["id"]}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        timeline = order.get("statusTimeline", [])
        self.assertGreater(len(timeline), 0, "statusTimeline must not be empty")
        self.assertEqual(timeline[0].get("status"), "pending")


if __name__ == "__main__":
    unittest.main()
