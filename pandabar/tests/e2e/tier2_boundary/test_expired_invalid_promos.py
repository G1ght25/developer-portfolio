"""
Tier 2: Boundary & Corner Cases - Expired / Invalid Promo Codes
Area: Promo Code Eligibility, Thresholds, and Tampering Defenses
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestExpiredInvalidPromos(unittest.TestCase):
    """Test boundary conditions for invalid, below-threshold, and tampered promo codes."""

    def _submit_order_with_promo(self, promo_code, claimed_discount, qty=1):
        payload = {
            "userName": "Promo Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": qty}],
            "promoCode": promo_code,
            "discount": claimed_discount,
        }
        return api_request("/api/orders", method="POST", data=payload)

    def test_nonexistent_promo_code_yields_zero_discount(self):
        """Test 2.5.1: Completely fictitious promo code gives 0 discount."""
        status, data, _ = self._submit_order_with_promo("NONEXISTENT_999", claimed_discount=300, qty=2)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("discount"), 0, "Fake promo code must produce 0 discount")

    def test_panda10_below_minimum_order_threshold(self):
        """Test 2.5.2: PANDA10 (min 1000 RUB) applied to 590 RUB order gives 0 discount."""
        status, data, _ = self._submit_order_with_promo("PANDA10", claimed_discount=59, qty=1)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("discount"), 0, "PANDA10 below 1000 RUB must produce 0 discount")

    def test_panda15_below_minimum_order_threshold(self):
        """Test 2.5.3: PANDA15 (min 2000 RUB) applied to 1180 RUB order gives 0 discount."""
        status, data, _ = self._submit_order_with_promo("PANDA15", claimed_discount=177, qty=2)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("discount"), 0, "PANDA15 below 2000 RUB must produce 0 discount")

    def test_promo_code_case_insensitivity(self):
        """Test 2.5.4: Lowercase 'panda10' operates identically to uppercase 'PANDA10'."""
        status, data, _ = self._submit_order_with_promo("panda10", claimed_discount=0, qty=2)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        subtotal = sum(i["product"]["price"] * i["quantity"] for i in order.get("items", []))
        expected_discount = round(subtotal * 0.10)
        self.assertEqual(order.get("discount"), expected_discount, f"Expected {expected_discount} discount for lowercase 'panda10'")

    def test_promo_code_whitespace_trimming(self):
        """Test 2.5.5: Promo code with surrounding spaces '   PANDA10   ' is accepted."""
        status, data, _ = self._submit_order_with_promo("   PANDA10   ", claimed_discount=0, qty=2)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        subtotal = sum(i["product"]["price"] * i["quantity"] for i in order.get("items", []))
        expected_discount = round(subtotal * 0.10)
        self.assertEqual(order.get("discount"), expected_discount)

    def test_client_discount_tampering_without_promo_code(self):
        """Test 2.5.6: Client sending discount: 500 without promo code has discount forced to 0."""
        status, data, _ = self._submit_order_with_promo(promo_code=None, claimed_discount=500, qty=2)
        self.assertEqual(status, 200)
        order = data.get("order", {})
        self.assertEqual(order.get("discount"), 0, "Arbitrary client discount must be reset to 0 by server")


if __name__ == "__main__":
    unittest.main()
