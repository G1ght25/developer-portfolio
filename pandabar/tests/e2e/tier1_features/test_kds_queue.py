"""
Tier 1: Feature Coverage - KDS Cooking / Ready Queue
Area: Kitchen Display System (KDS) Queue & Chef FSM Operations
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    register_staff_user,
    register_client,
    get_admin_token,
    generate_unique_phone,
)


class TestKdsQueue(unittest.TestCase):
    """Test suite for Kitchen Display System queue access, phone privacy, and chef lifecycle updates."""

    @classmethod
    def setUpClass(cls):
        cls.chef = register_staff_user(role="chef", name="Шеф Повар КДС")
        cls.admin_token = get_admin_token()

    def _create_test_order(self):
        """Helper to create and confirm an order ready for kitchen processing."""
        payload = {
            "userName": "Клиент Для Кухни",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        order = data.get("order", {})
        order_id = order.get("id")

        # Confirm order via admin
        if order_id and self.admin_token:
            api_request(
                f"/api/admin/orders/{order_id}/status",
                method="POST",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                data={"status": "confirmed"}
            )
        return order_id

    def test_chef_kds_orders_access(self):
        """Test 7.1: Authenticated chef can fetch KDS active orders."""
        token = self.chef["token"]
        self.assertIsNotNone(token, "Chef token required")
        status, data, _ = api_request("/api/kitchen/kds-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200, f"Expected 200 for chef KDS access, got {status}: {data}")
        self.assertTrue(data.get("success"))
        self.assertIn("orders", data)

    def test_unauthenticated_kds_access_rejected(self):
        """Test 7.2: Unauthenticated request to /api/kitchen/kds-orders returns HTTP 401."""
        status, data, _ = api_request("/api/kitchen/kds-orders")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated KDS access, got {status}")

    def test_kds_phone_number_masking_for_privacy(self):
        """Test 7.3: Customer phone numbers in KDS orders are masked for staff privacy."""
        self._create_test_order()
        token = self.chef["token"]
        status, data, _ = api_request("/api/kitchen/kds-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200)
        orders = data.get("orders", [])
        for order in orders:
            phone = order.get("userPhone", "")
            if phone:
                # Phone should be masked (e.g. +7 (***) ***-12-34 or contain asterisks)
                self.assertTrue(
                    "*" in phone or phone.startswith("+7 (***)"),
                    f"Phone '{phone}' is not properly masked for KDS privacy"
                )

    def test_chef_status_transition_confirmed_to_cooking(self):
        """Test 7.4: Chef can advance confirmed order to 'cooking' status."""
        order_id = self._create_test_order()
        token = self.chef["token"]

        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {token}"},
            data={"status": "cooking"}
        )
        self.assertEqual(status, 200, f"Expected 200 for chef cooking update, got {status}: {data}")
        self.assertEqual(data.get("order", {}).get("status"), "cooking")

    def test_chef_status_transition_cooking_to_ready(self):
        """Test 7.5: Chef can advance cooking order to 'ready' status."""
        order_id = self._create_test_order()
        token = self.chef["token"]

        # Step 1: cooking
        api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {token}"},
            data={"status": "cooking"}
        )
        # Step 2: ready
        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {token}"},
            data={"status": "ready"}
        )
        self.assertEqual(status, 200, f"Expected 200 for chef ready update, got {status}: {data}")
        self.assertEqual(data.get("order", {}).get("status"), "ready")

    def test_client_role_cannot_access_kds_queue(self):
        """Test 7.6: Client role cannot access staff KDS endpoint (HTTP 403 Forbidden)."""
        client = register_client()
        token = client["token"]
        status, data, _ = api_request("/api/kitchen/kds-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 403, f"Expected 403 for client accessing KDS, got {status}")


if __name__ == "__main__":
    unittest.main()
