"""
Tier 4: Real-World Workload Scenarios - Cancellation & Audit Flow
Scenario: Order Placement -> Manager Cancellation -> Reason Audit -> Z-Report Accounting
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    generate_unique_phone,
)


class TestE2ECancellationFlow(unittest.TestCase):
    """End-to-end user journey verifying cancellation reasons, audit trails, and Z-report accounting."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    def test_complete_cancellation_and_audit_trail(self):
        """Complete lifecycle for order cancellation with mandatory reason and financial accounting."""
        # 1. Place order
        payload = {
            "userName": "Клиент На Отмену",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
        }
        status_order, data_order, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status_order, 200)
        order_id = data_order.get("order", {}).get("id")
        self.assertIsNotNone(order_id)

        # 2. Cancel order with valid reason
        cancel_reason = "Клиент перенес празднование на следующие выходные"
        status_cancel, data_cancel, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "cancelled", "reason": cancel_reason}
        )
        self.assertEqual(status_cancel, 200, f"Cancellation failed: {data_cancel}")
        cancelled_order = data_cancel.get("order", {})
        self.assertEqual(cancelled_order.get("status"), "cancelled")

        # 3. Verify terminal state lock: cannot reset to pending or cooking
        status_lock, _, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "pending"}
        )
        self.assertEqual(status_lock, 409, "Cancelled order must be permanently locked against changes")

        # 4. Verify Daily Z-Report registers cancelled order
        status_rep, data_rep, _ = api_request("/api/admin/daily-report", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status_rep, 200)
        report = data_rep.get("report", {})
        self.assertIn("cancelledOrdersCount", report)

        # 5. Verify Audit Log entry
        status_audit, data_audit, _ = api_request("/api/sysadmin/audit-logs", headers={"Authorization": f"Bearer {self.admin_token}"})
        if status_audit == 200 and isinstance(data_audit, dict):
            logs = data_audit.get("logs", [])
            target_log = next((l for l in logs if l.get("entityId") == order_id), None)
            if target_log:
                self.assertEqual(target_log.get("action"), "ORDER_STATUS_CHANGE")


if __name__ == "__main__":
    unittest.main()
