"""
Tier 3: Cross-Feature Combinations - Sequential FSM Role Transitions
Area: Sequential Order Lifecycle (Client -> Chef -> Courier -> Admin) & Role Guards
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


class TestSequentialFsmRoles(unittest.TestCase):
    """Test sequential multi-role order transitions and strict role-based FSM guards."""

    @classmethod
    def setUpClass(cls):
        cls.chef = register_staff_user(role="chef", name="Шеф Ролевой")
        cls.courier = register_staff_user(role="courier", name="Курьер Ролевой")
        cls.admin_token = get_admin_token()

    def _create_order(self):
        payload = {
            "userName": "FSM Sequential User",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Малахова", "house": "10"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200)
        return data.get("order", {}).get("id")

    def test_complete_sequential_role_lifecycle(self):
        """Test 3.4.1: Legitimate sequential progression through Client -> Chef -> Courier -> Completed."""
        order_id = self._create_order()
        self.assertIsNotNone(order_id)

        # 1. Admin confirms (pending -> confirmed)
        s1, d1, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "confirmed"}
        )
        self.assertEqual(s1, 200, f"Failed at confirm: {d1}")
        self.assertEqual(d1.get("order", {}).get("status"), "confirmed")

        # 2. Chef cooks (confirmed -> cooking)
        s2, d2, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "cooking"}
        )
        self.assertEqual(s2, 200, f"Failed at cooking: {d2}")
        self.assertEqual(d2.get("order", {}).get("status"), "cooking")

        # 3. Chef marks ready (cooking -> ready)
        s3, d3, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "ready"}
        )
        self.assertEqual(s3, 200, f"Failed at ready: {d3}")
        self.assertEqual(d3.get("order", {}).get("status"), "ready")

        # 4. Courier delivers (ready -> delivering)
        s4, d4, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.courier['token']}"},
            data={"status": "delivering"}
        )
        self.assertEqual(s4, 200, f"Failed at delivering: {d4}")
        self.assertEqual(d4.get("order", {}).get("status"), "delivering")

        # 5. Courier completes (delivering -> completed)
        s5, d5, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.courier['token']}"},
            data={"status": "completed"}
        )
        self.assertEqual(s5, 200, f"Failed at completed: {d5}")
        self.assertEqual(d5.get("order", {}).get("status"), "completed")

    def test_courier_cannot_confirm_pending_order(self):
        """Test 3.4.2: Courier role cannot perform pending -> confirmed transition (HTTP 422)."""
        order_id = self._create_order()
        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.courier['token']}"},
            data={"status": "confirmed"}
        )
        self.assertEqual(status, 422, f"Expected 422 for courier confirming order, got {status}: {data}")

    def test_chef_cannot_jump_cooking_to_completed(self):
        """Test 3.4.3: Chef cannot skip directly from cooking to completed (HTTP 422)."""
        order_id = self._create_order()
        # Confirm and cook
        api_request(f"/api/admin/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.admin_token}"}, data={"status": "confirmed"})
        api_request(f"/api/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.chef['token']}"}, data={"status": "cooking"})

        # Chef attempts cooking -> completed
        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "completed"}
        )
        self.assertEqual(status, 422, f"Expected 422 for skipping to completed, got {status}: {data}")

    def test_client_cannot_change_staff_order_status(self):
        """Test 3.4.4: Client token cannot execute kitchen or courier status updates (HTTP 403)."""
        order_id = self._create_order()
        client = register_client()
        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {client['token']}"},
            data={"status": "cooking"}
        )
        self.assertEqual(status, 403, f"Expected 403 for client mutating status, got {status}: {data}")

    def test_manager_can_cancel_with_valid_reason_from_any_active_state(self):
        """Test 3.4.5: Manager/Admin can cancel confirmed order providing valid reason."""
        order_id = self._create_order()
        api_request(f"/api/admin/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.admin_token}"}, data={"status": "confirmed"})

        cancellation_reason = "Клиент передумал, оформил возврат"
        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "cancelled", "reason": cancellation_reason}
        )
        self.assertEqual(status, 200, f"Expected 200 for manager cancellation with reason, got {status}: {data}")
        self.assertEqual(data.get("order", {}).get("status"), "cancelled")


if __name__ == "__main__":
    unittest.main()
