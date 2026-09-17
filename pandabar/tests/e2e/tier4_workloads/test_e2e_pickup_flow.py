"""
Tier 4: Real-World Workload Scenarios - Complete Pickup Flow
Scenario: Branch Selection -> Pickup Checkout -> Kitchen KDS -> Counter Hand-Off
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    register_staff_user,
    get_admin_token,
    generate_unique_phone,
)


class TestE2EPickupFlow(unittest.TestCase):
    """End-to-end real-world user journey for customer pickup and counter collection."""

    @classmethod
    def setUpClass(cls):
        cls.chef = register_staff_user(role="chef", name="Шеф Самовывоз")
        cls.admin_token = get_admin_token()

    def test_complete_pickup_lifecycle(self):
        """Customer places pickup order, kitchen prepares, and staff completes at counter."""
        branch_location = "ул. Балтийская, 16"
        payload = {
            "userName": "Сергей Самовывозов",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": branch_location,
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
            "notes": "Буду через 25 минут",
        }
        # 1. Checkout
        status_order, data_order, _ = api_request("/api/orders", method="POST", data=payload)
        self.assertEqual(status_order, 200)
        order = data_order.get("order", {})
        order_id = order.get("id")
        self.assertIsNotNone(order_id)
        self.assertEqual(order.get("type"), "pickup")
        self.assertEqual(order.get("deliveryFee"), 0, "Pickup must have 0 delivery fee")
        self.assertEqual(order.get("pickupLocation"), branch_location)

        # 2. Kitchen confirms
        status_conf, _, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "confirmed"}
        )
        self.assertEqual(status_conf, 200)

        # 3. Kitchen cooks
        status_cook, _, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "cooking"}
        )
        self.assertEqual(status_cook, 200)

        # 4. Kitchen marks ready
        status_ready, data_ready, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "ready"}
        )
        self.assertEqual(status_ready, 200)
        self.assertEqual(data_ready.get("order", {}).get("status"), "ready")

        # 5. Counter hand-off (ready -> completed)
        status_comp, data_comp, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "completed"}
        )
        self.assertEqual(status_comp, 200)
        completed_order = data_comp.get("order", {})
        self.assertEqual(completed_order.get("status"), "completed")
        self.assertTrue(any(t.get("status") == "ready" for t in completed_order.get("statusTimeline", [])))


if __name__ == "__main__":
    unittest.main()
