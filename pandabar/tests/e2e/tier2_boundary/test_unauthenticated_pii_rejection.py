"""
Tier 2: Boundary & Corner Cases - Unauthenticated PII Access Rejection
Area: Customer Personal Identifiable Information (PII) & Administrative Isolation
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, generate_unique_phone


class TestUnauthenticatedPiiRejection(unittest.TestCase):
    """Test defense against unauthenticated data disclosure, IDOR, and PII leakage."""

    @classmethod
    def setUpClass(cls):
        # Create a sample order to test orderId and receipt endpoints
        payload = {
            "userName": "Конфиденциальный Клиент",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Секретная", "house": "99", "apartment": "1"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        _, data, _ = api_request("/api/orders", method="POST", data=payload)
        cls.sample_order_id = data.get("order", {}).get("id")

    def test_unauthenticated_get_all_orders_returns_401(self):
        """Test 2.8.1: GET /api/orders without Authorization header returns HTTP 401."""
        status, data, _ = api_request("/api/orders")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated /api/orders, got {status}")

    def test_unauthenticated_get_workers_returns_401(self):
        """Test 2.8.2: GET /api/admin/workers without Authorization header returns HTTP 401."""
        status, data, _ = api_request("/api/admin/workers")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated workers list, got {status}")

    def test_unauthenticated_get_system_pins_returns_401(self):
        """Test 2.8.3: GET /api/admin/system-pins without Authorization header returns HTTP 401."""
        status, data, _ = api_request("/api/admin/system-pins")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated system PINs, got {status}")

    def test_unauthenticated_single_order_pii_rejected(self):
        """Test 2.8.4: GET /api/orders/:orderId without auth MUST return HTTP 401/403 (Spec: PROJECT.md #13)."""
        self.assertIsNotNone(self.sample_order_id, "Sample order required")
        status, data, _ = api_request(f"/api/orders/{self.sample_order_id}")
        # According to specification (PROJECT.md R13): "Require authentication or phone match on GET /api/orders/:orderId. Returns 401/403 otherwise."
        self.assertIn(
            status,
            (401, 403),
            f"Specification Violation: Unauthenticated GET /api/orders/:orderId exposed customer PII with status {status}. Expected 401 or 403."
        )

    def test_unauthenticated_thermal_receipt_pii_rejected(self):
        """Test 2.8.5: GET /api/orders/:orderId/receipt without auth MUST return HTTP 401/403 (Spec: PROJECT.md #14)."""
        self.assertIsNotNone(self.sample_order_id, "Sample order required")
        status, data, _ = api_request(f"/api/orders/{self.sample_order_id}/receipt")
        # According to specification (PROJECT.md R14): "Thermal Receipt PII Protection: Restrict GET /api/orders/:orderId/receipt to staff or order owner."
        self.assertIn(
            status,
            (401, 403),
            f"Specification Violation: Unauthenticated receipt endpoint returned status {status}. Expected 401 or 403."
        )

    def test_backdoor_secret_header_and_query_rejected(self):
        """Test 2.8.6: Default backdoor header or query parameters are rejected with 401/403."""
        # Test default print secret header
        status_header, _, _ = api_request(
            "/api/admin/workers",
            headers={"x-admin-secret": "pandabar_print_secret_2026"}
        )
        self.assertIn(status_header, (401, 403), f"Backdoor secret header was accepted with status {status_header}")

        # Test dev query param
        status_query, _, _ = api_request("/api/admin/workers?secret=dev-secret-change-in-prod")
        self.assertIn(status_query, (401, 403), f"Backdoor dev secret query was accepted with status {status_query}")


if __name__ == "__main__":
    unittest.main()
