"""
Tier 3: Cross-Feature Combinations - POS Order Bypass Protection
Area: Defense Against Unauthenticated isPosOrder Parameter Injection (Spec: PROJECT.md #15)
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    generate_unique_phone,
)


class TestPosOrderBypassDefense(unittest.TestCase):
    """Test defense against unauthorized POS order parameter injection and discount abuse."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    def test_unauthenticated_pos_order_discount_injection_rejected(self):
        """Test 3.3.1: Unauthenticated request claiming isPosOrder: true must NOT receive arbitrary POS discounts (Spec: PROJECT.md #15)."""
        payload = {
            "userName": "Hacker POS",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Ленина, д. 42",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
            "isPosOrder": True,
            "discount": 100,  # Arbitrary discount claimed without promo code
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        # According to specification (PROJECT.md R15 & Interface Contract):
        # "Disallow unauthenticated clients from setting isPosOrder: true. Server recalculates prices, rejects unauthenticated isPosOrder."
        # If server accepted order, the discount MUST be 0 for unauthenticated client.
        if status == 200:
            order = data.get("order", {})
            self.assertEqual(
                order.get("discount", 0),
                0,
                f"Specification Violation: Unauthenticated client successfully injected isPosOrder: true with {order.get('discount')} RUB discount."
            )
        else:
            self.assertIn(status, (401, 403, 400), f"Expected rejection status, got {status}")

    def test_unauthenticated_pos_threshold_reduction_rejected(self):
        """Test 3.3.2: Unauthenticated isPosOrder cannot lower free delivery threshold to 600 RUB."""
        # Single item price 700 (< 1000, but > 600)
        payload = {
            "userName": "Hacker Threshold",
            "userPhone": generate_unique_phone(),
            "type": "delivery",
            "address": {"street": "ул. Советская", "house": "1"},
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
            "isPosOrder": True,  # Attacker attempts to get free delivery below 1000 RUB
        }
        status, data, _ = api_request("/api/orders", method="POST", data=payload)
        if status == 200:
            order = data.get("order", {})
            # If order subtotal < 1000, customer delivery fee MUST be 150
            if order.get("total", 0) < 1000:
                self.assertEqual(
                    order.get("deliveryFee"),
                    150,
                    "Specification Violation: Unauthenticated isPosOrder reduced free delivery threshold below 1000 RUB."
                )

    def test_authenticated_staff_pos_order_accepted(self):
        """Test 3.3.3: Authenticated admin/cashier can legitimately create POS orders."""
        payload = {
            "userName": "Кассир Зал",
            "userPhone": generate_unique_phone(),
            "type": "pickup",
            "pickupLocation": "ул. Балтийская, 16",
            "paymentMethod": "cash",
            "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
            "isPosOrder": True,
            "discount": 50,
        }
        status, data, _ = api_request(
            "/api/orders",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data=payload
        )
        self.assertEqual(status, 200, f"Expected 200 for authenticated staff POS order, got {status}: {data}")
        self.assertTrue(data.get("success"))

    def test_unauthenticated_pos_cannot_bypass_kitchen_pause(self):
        """Test 3.3.4: Unauthenticated client with isPosOrder: true cannot bypass emergency kitchen pause."""
        # Pause kitchen
        api_request(
            "/api/admin/kitchen-status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"isOpen": False, "pauseReason": "Тест защиты POS"}
        )
        try:
            payload = {
                "userName": "Attacker Kitchen Bypass",
                "userPhone": generate_unique_phone(),
                "type": "pickup",
                "pickupLocation": "ул. Балтийская, 16",
                "paymentMethod": "cash",
                "items": [{"product": {"id": "item-filadelfiya", "price": 590}, "quantity": 1}],
                "isPosOrder": True,  # Attacker attempts to bypass closed kitchen
            }
            status, data, _ = api_request("/api/orders", method="POST", data=payload)
            self.assertEqual(
                status,
                403,
                f"Specification Violation: Unauthenticated client bypassed kitchen pause via isPosOrder: true (status {status})"
            )
        finally:
            # Reopen kitchen
            api_request(
                "/api/admin/kitchen-status",
                method="POST",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                data={"isOpen": True, "pauseReason": ""}
            )


if __name__ == "__main__":
    unittest.main()
