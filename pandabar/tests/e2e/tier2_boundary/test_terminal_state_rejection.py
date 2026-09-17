"""
Tier 2: Boundary & Corner Cases - Terminal State Modification Rejection
Area: FSM Terminal State Immutability & Cancellation Reason Length
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    generate_unique_phone,
)


class TestTerminalStateRejection(unittest.TestCase):
    """Test FSM terminal state lock (completed/cancelled) and cancellation validation rules."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    def _create_order(self):
        payload = {
            "userName": "FSM Terminal Tester",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        _, data, _ = api_request("/api/orders", method="POST", data=payload)
        return data.get("order", {}).get("id")

    def _complete_order(self, order_id):
        # pending -> confirmed -> cooking -> ready -> completed
        api_request(f"/api/admin/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.admin_token}"}, data={"status": "confirmed"})
        api_request(f"/api/admin/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.admin_token}"}, data={"status": "cooking"})
        api_request(f"/api/admin/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.admin_token}"}, data={"status": "ready"})
        api_request(f"/api/admin/orders/{order_id}/status", method="POST", headers={"Authorization": f"Bearer {self.admin_token}"}, data={"status": "completed"})

    def _cancel_order(self, order_id, reason="Отмена администратором для тестов"):
        api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "cancelled", "reason": reason}
        )

    def test_completed_order_transition_to_pending_returns_409(self):
        """Test 2.7.1: Attempting to reset completed order back to 'pending' returns HTTP 409 Conflict."""
        order_id = self._create_order()
        self._complete_order(order_id)

        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "pending"}
        )
        self.assertEqual(status, 409, f"Expected 409 Conflict for completed->pending, got {status}: {data}")

    def test_completed_order_transition_to_cooking_returns_409(self):
        """Test 2.7.2: Attempting to transition completed order to 'cooking' returns HTTP 409 Conflict."""
        order_id = self._create_order()
        self._complete_order(order_id)

        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "cooking"}
        )
        self.assertEqual(status, 409, f"Expected 409 Conflict for completed->cooking, got {status}")

    def test_cancelled_order_transition_to_confirmed_returns_409(self):
        """Test 2.7.3: Attempting to reactivate cancelled order to 'confirmed' returns HTTP 409 Conflict."""
        order_id = self._create_order()
        self._cancel_order(order_id)

        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "confirmed"}
        )
        self.assertEqual(status, 409, f"Expected 409 Conflict for cancelled->confirmed, got {status}")

    def test_cancelled_order_transition_to_completed_returns_409(self):
        """Test 2.7.4: Attempting to transition cancelled order to 'completed' returns HTTP 409 Conflict."""
        order_id = self._create_order()
        self._cancel_order(order_id)

        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "completed"}
        )
        self.assertEqual(status, 409, f"Expected 409 Conflict for cancelled->completed, got {status}")

    def test_cancellation_without_reason_returns_422(self):
        """Test 2.7.5: Cancelling order without providing a reason returns HTTP 422 Unprocessable Entity."""
        order_id = self._create_order()
        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "cancelled"}  # No reason
        )
        self.assertEqual(status, 422, f"Expected 422 for cancellation without reason, got {status}: {data}")

    def test_cancellation_with_short_reason_returns_422(self):
        """Test 2.7.6: Cancelling order with reason shorter than 3 characters returns HTTP 422."""
        order_id = self._create_order()
        status, data, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "cancelled", "reason": "no"}  # Only 2 chars
        )
        self.assertEqual(status, 422, f"Expected 422 for reason shorter than 3 chars, got {status}: {data}")


if __name__ == "__main__":
    unittest.main()
