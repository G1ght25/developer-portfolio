"""
Tier 1: Feature Coverage - Courier Delivery Dispatch
Area: Courier Dispatch Terminal & Delivery FSM Operations
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


class TestCourierDispatch(unittest.TestCase):
    """Test suite for Courier Dispatch interface, address routing, and delivery status completion."""

    @classmethod
    def setUpClass(cls):
        cls.courier = register_staff_user(role="courier", name="Курьер Быстрый")
        cls.chef = register_staff_user(role="chef", name="Шеф Для Доставки")
        cls.admin_token = get_admin_token()

    def _create_ready_delivery_order(self):
        """Helper to create, confirm, cook, and mark order ready for courier pickup."""
        payload = {
            "userName": "Клиент Курьера",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {
                "street": "пр. Ленина",
                "house": "42",
                "apartment": "10",
                "entrance": "2",
                "floor": "4",
                "intercom": "10K",
            },
            "paymentMethod": "card_courier",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 2}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        order_id = data.get("order", {}).get("id")

        if order_id and self.admin_token:
            # Confirm
            api_request(
                f"/api/admin/orders/{order_id}/status",
                method="POST",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                data={"status": "confirmed"}
            )
            # Cook
            api_request(
                f"/api/orders/{order_id}/status",
                method="POST",
                headers={"Authorization": f"Bearer {self.chef['token']}"},
                data={"status": "cooking"}
            )
            # Ready
            api_request(
                f"/api/orders/{order_id}/status",
                method="POST",
                headers={"Authorization": f"Bearer {self.chef['token']}"},
                data={"status": "ready"}
            )
        return order_id

    def test_courier_orders_access(self):
        """Test 8.1: Authenticated courier can fetch dispatch queue."""
        token = self.courier["token"]
        self.assertIsNotNone(token, "Courier token required")
        status, data, _ = api_request("/api/courier/my-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200, f"Expected 200 for courier dispatch access, got {status}: {data}")
        self.assertTrue(data.get("success"))
        self.assertIn("orders", data)

    def test_unauthenticated_courier_access_rejected(self):
        """Test 8.2: Unauthenticated request to /api/courier/my-orders returns HTTP 401."""
        status, data, _ = api_request("/api/courier/my-orders")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated courier access, got {status}")

    def test_client_role_cannot_access_courier_queue(self):
        """Test 8.3: Client role cannot access courier dispatch endpoint (HTTP 403 Forbidden)."""
        client = register_client()
        token = client["token"]
        status, data, _ = api_request("/api/courier/my-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 403, f"Expected 403 for client accessing courier dispatch, got {status}")

    def test_courier_order_contains_address_metadata(self):
        """Test 8.4: Courier delivery orders retain street, house, and apartment metadata."""
        order_id = self._create_ready_delivery_order()
        token = self.courier["token"]
        status, data, _ = api_request("/api/courier/my-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200)
        orders = data.get("orders", [])
        target = next((o for o in orders if o.get("id") == order_id), None)
        if target:
            addr = target.get("address", {})
            self.assertEqual(addr.get("street"), "пр. Ленина")
            self.assertEqual(addr.get("house"), "42")

    def test_courier_transition_ready_to_delivering(self):
        """Test 8.5: Courier transitions order from 'ready' to 'delivering'."""
        order_id = self._create_ready_delivery_order()
        token = self.courier["token"]

        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {token}"},
            data={"status": "delivering"}
        )
        self.assertEqual(status, 200, f"Expected 200 for courier delivering transition, got {status}: {data}")
        self.assertEqual(data.get("order", {}).get("status"), "delivering")

    def test_courier_transition_delivering_to_completed(self):
        """Test 8.6: Courier transitions order from 'delivering' to 'completed'."""
        order_id = self._create_ready_delivery_order()
        token = self.courier["token"]

        # Step 1: delivering
        api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {token}"},
            data={"status": "delivering"}
        )
        # Step 2: completed
        status, data, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {token}"},
            data={"status": "completed"}
        )
        self.assertEqual(status, 200, f"Expected 200 for courier completion, got {status}: {data}")
        self.assertEqual(data.get("order", {}).get("status"), "completed")


if __name__ == "__main__":
    unittest.main()
