"""
Tier 2: Boundary & Corner Cases - Russian Phone Number Formats
Area: Normalization and Rejection of Russian Mobile Phone Formats
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestRussianPhoneFormats(unittest.TestCase):
    """Test boundary cases for Russian phone formatting, normalization, and validation."""

    def _submit_order_with_phone(self, phone):
        payload = {
            "userName": "Phone Tester",
            "userPhone": phone,
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        return api_request("/api/orders", method="POST", data=payload)

    def test_standard_masked_phone(self):
        """Test 2.3.1: Standard masked phone '+7 (913) 123-45-67' is accepted and stored."""
        phone = generate_unique_phone()
        status, data, _ = self._submit_order_with_phone(phone)
        self.assertEqual(status, 200, f"Expected 200 for masked phone, got {status}: {data}")
        order = data.get("order", {})
        self.assertTrue(order.get("userPhone").startswith("+7"))

    def test_plain_11_digits_starting_with_7(self):
        """Test 2.3.2: Plain 11-digit phone '79130001122' is accepted and normalized to +7 (913)..."""
        raw_digits = "7913" + str(int(generate_unique_phone().replace("+7", "").replace("(", "").replace(")", "").replace("-", "").replace(" ", "")))[-7:]
        status, data, _ = self._submit_order_with_phone(raw_digits)
        self.assertEqual(status, 200, f"Expected 200 for 7XXXXXXXXXX, got {status}: {data}")
        order = data.get("order", {})
        self.assertTrue(order.get("userPhone").startswith("+7 (913)"))

    def test_plain_11_digits_starting_with_8(self):
        """Test 2.3.3: Traditional 8-prefix phone '89130001122' is accepted and normalized to +7."""
        raw_digits = "8913" + str(int(generate_unique_phone().replace("+7", "").replace("(", "").replace(")", "").replace("-", "").replace(" ", "")))[-7:]
        status, data, _ = self._submit_order_with_phone(raw_digits)
        self.assertEqual(status, 200, f"Expected 200 for 8XXXXXXXXXX, got {status}: {data}")
        order = data.get("order", {})
        self.assertTrue(order.get("userPhone").startswith("+7 (913)"))

    def test_10_digits_without_country_code(self):
        """Test 2.3.4: 10-digit number '9130001122' is accepted and prefixed with +7."""
        raw_digits = "913" + str(int(generate_unique_phone().replace("+7", "").replace("(", "").replace(")", "").replace("-", "").replace(" ", "")))[-7:]
        status, data, _ = self._submit_order_with_phone(raw_digits)
        self.assertEqual(status, 200, f"Expected 200 for 10 digits, got {status}: {data}")
        order = data.get("order", {})
        self.assertTrue(order.get("userPhone").startswith("+7 (913)"))

    def test_too_short_phone_rejected(self):
        """Test 2.3.5: Phone with insufficient digits ('+7 (999) 12') is rejected with 400."""
        status, data, _ = self._submit_order_with_phone("+7 (999) 12")
        self.assertEqual(status, 400, f"Expected 400 for short phone, got {status}")

    def test_alphanumeric_or_gibberish_phone_rejected(self):
        """Test 2.3.6: Non-numeric phone string ('+7-ABC-NOT-A-PHONE') is rejected with 400."""
        status, data, _ = self._submit_order_with_phone("+7-ABC-NOT-A-PHONE")
        self.assertEqual(status, 400, f"Expected 400 for alphabetic phone, got {status}")


if __name__ == "__main__":
    unittest.main()
