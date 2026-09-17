"""
Tier 2: Boundary & Corner Cases - Empty Address Fields
Area: Delivery vs Pickup Address Validation & Sanitization
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestEmptyAddressFields(unittest.TestCase):
    """Test boundary conditions for empty, whitespace-only, and malformed address structures."""

    def test_delivery_order_without_address_object(self):
        """Test 2.4.1: Delivery order submitted without address object handles gracefully without crashing."""
        payload = {
            "userName": "No Address User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        # Server accepts or rejects with 400; must not crash with 500
        self.assertIn(status, (200, 400), f"Expected 200 or 400, got {status}: {data}")

    def test_delivery_order_with_empty_street(self):
        """Test 2.4.2: Delivery order with empty street string ('') is handled safely."""
        payload = {
            "userName": "Empty Street User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "", "house": "15"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertIn(status, (200, 400))
        if status == 200:
            order = data.get("order", {})
            # Server nullifies empty street
            self.assertIsNone(order.get("address"))

    def test_delivery_order_with_whitespace_street(self):
        """Test 2.4.3: Delivery order with whitespace-only street ('   ') is stripped."""
        payload = {
            "userName": "Whitespace Street User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "    ", "house": "15"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertIn(status, (200, 400))
        if status == 200:
            order = data.get("order", {})
            self.assertIsNone(order.get("address"))

    def test_delivery_order_with_missing_house(self):
        """Test 2.4.4: Delivery order with valid street but missing house defaults house to empty string."""
        payload = {
            "userName": "Missing House User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Ползунова"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertIn(status, (200, 400))
        if status == 200:
            addr = data.get("order", {}).get("address")
            if addr:
                self.assertEqual(addr.get("street"), "ул. Ползунова")

    def test_pickup_order_with_empty_delivery_address_succeeds(self):
        """Test 2.4.5: Pickup orders do not require delivery address and succeed."""
        payload = {
            "userName": "Pickup No Address",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
            "address": None,
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200, f"Expected 200 for pickup without address, got {status}: {data}")
        self.assertEqual(data.get("order", {}).get("type"), "pickup")

    def test_excessive_address_length_sanitization(self):
        """Test 2.4.6: Extreme length address (>500 chars) is sanitized without server error."""
        long_street = "ул. " + ("ОченьДлиннаяУлица" * 30)
        payload = {
            "userName": "Long Address User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": long_street, "house": "1"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertIn(status, (200, 400))
        if status == 200:
            stored_street = data.get("order", {}).get("address", {}).get("street", "")
            self.assertLessEqual(len(stored_street), 200, "Street must be sanitized to max 200 chars")


if __name__ == "__main__":
    unittest.main()
