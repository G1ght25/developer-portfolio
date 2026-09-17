"""
Tier 2: Boundary & Corner Cases - Kitchen Closed Order Rejection
Area: Emergency Kitchen Stop & Customer Order Blocking
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    generate_unique_phone,
)


class TestKitchenClosedRejection(unittest.TestCase):
    """Test emergency kitchen stop controls and rejection of customer orders during shutdown."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    @classmethod
    def tearDownClass(cls):
        # Guarantee kitchen is reopened after tests
        if cls.admin_token:
            api_request(
                "/api/admin/kitchen-status",
                method="POST",
                headers={"Authorization": f"Bearer {cls.admin_token}"},
                data={"isOpen": True, "pauseReason": "", "pauseMinutes": 0}
            )

    def _set_kitchen_status(self, is_open, reason=""):
        return api_request(
            "/api/admin/kitchen-status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"isOpen": is_open, "pauseReason": reason, "pauseMinutes": 30}
        )

    def test_unauthenticated_kitchen_status_toggle_rejected(self):
        """Test 2.6.1: Toggling kitchen status without staff token returns HTTP 401."""
        status, data, _ = api_request(
            "/api/admin/kitchen-status",
            method="POST",
            data={"isOpen": False, "pauseReason": "Unauth Test"}
        )
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated toggle, got {status}")

    def test_delivery_order_rejected_when_kitchen_closed(self):
        """Test 2.6.2: Delivery order returns HTTP 403 when kitchen is stopped."""
        pause_reason = "Высокая нагрузка в пятничный вечер"
        self._set_kitchen_status(False, reason=pause_reason)

        payload = {
            "userName": "Клиент В Паузу",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Ленина", "house": "10"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 403, f"Expected 403 Forbidden when kitchen is closed, got {status}: {data}")
        self.assertFalse(data.get("success", True))

    def test_pickup_order_rejected_when_kitchen_closed(self):
        """Test 2.6.3: Pickup order returns HTTP 403 when kitchen is stopped."""
        payload = {
            "userName": "Самовывоз В Паузу",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 403, f"Expected 403 Forbidden for pickup when kitchen closed, got {status}: {data}")

    def test_rejection_response_contains_pause_reason(self):
        """Test 2.6.4: Rejection message contains informative explanation for the client."""
        pause_reason = "Технический перерыв 15 минут"
        self._set_kitchen_status(False, reason=pause_reason)

        payload = {
            "userName": "Клиент Сообщения",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 403)
        error_msg = data.get("error", "")
        self.assertTrue(
            "приостановлен" in error_msg.lower() or "причина" in error_msg.lower() or pause_reason in error_msg,
            f"Error message did not contain pause information: {error_msg}"
        )

    def test_reopening_kitchen_restores_order_placement(self):
        """Test 2.6.5: Reopening kitchen enables successful customer ordering again."""
        # Reopen
        s_open, d_open, _ = self._set_kitchen_status(True)
        self.assertEqual(s_open, 200)

        payload = {
            "userName": "Клиент После Открытия",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status, 200, f"Expected 200 after kitchen reopening, got {status}: {data}")
        self.assertTrue(data.get("success"))


if __name__ == "__main__":
    unittest.main()
