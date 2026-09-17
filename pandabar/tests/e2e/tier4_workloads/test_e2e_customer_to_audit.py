"""
Tier 4: Real-World Workload Scenarios - Customer to Audit
Scenario: Customer Ordering -> KDS Cooking -> Courier Delivery -> Z-Report Audit
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    register_client,
    register_staff_user,
    get_admin_token,
)


class TestE2ECustomerToAudit(unittest.TestCase):
    """End-to-end real-world user journey from online customer checkout to management financial audit."""

    @classmethod
    def setUpClass(cls):
        cls.chef = register_staff_user(role="chef", name="Шеф E2E Повар")
        cls.courier = register_staff_user(role="courier", name="Курьер E2E Доставка")
        cls.admin_token = get_admin_token()

    def test_complete_customer_delivery_to_audit_lifecycle(self):
        """Complete workflow: Client Register -> Catalog Browse -> Order -> Chef -> Courier -> Z-Report."""
        # 1. Customer Registration
        client = register_client(name="Екатерина Заказчица")
        self.assertEqual(client["status"], 200)
        client_token = client["token"]
        client_phone = client["phone"]

        # 2. Browse Menu
        status_menu, data_menu, _ = api_request("/api/menu")
        self.assertEqual(status_menu, 200)
        menu = data_menu.get("menu", [])
        self.assertGreater(len(menu), 0)

        # Select target items to reach >1000 RUB
        item_1 = menu[0]
        item_2 = menu[1] if len(menu) > 1 else menu[0]
        qty_1 = 2
        qty_2 = 1
        subtotal = (item_1["price"] * qty_1) + (item_2["price"] * qty_2)

        # 3. Customer Checkout with Delivery & Promo Code
        order_payload = {
            "userName": client["name"],
            "userPhone": client_phone,
            "type": "delivery",
            "address": {
                "street": "пр. Ленина",
                "house": "54",
                "apartment": "108",
                "entrance": "3",
                "floor": "7",
            },
            "paymentMethod": "card_courier",
            "items": [
                {"product": {"id": item_1["id"]}, "quantity": qty_1},
                {"product": {"id": item_2["id"]}, "quantity": qty_2},
            ],
            "promoCode": "PANDA10",
            "notes": "Пожалуйста, положите учебные палочки",
            "personsCount": 2,
            "chopsticksCount": 2,
        }
        status_order, data_order, _ = api_request(
            "/api/orders",
            method="POST",
            headers={"Authorization": f"Bearer {client_token}"},
            data=order_payload
        )
        self.assertEqual(status_order, 200, f"Order placement failed: {data_order}")
        created_order = data_order.get("order", {})
        order_id = created_order.get("id")
        self.assertIsNotNone(order_id)
        self.assertEqual(created_order.get("status"), "pending")

        expected_discount = round(subtotal * 0.10) if subtotal >= 1000 else 0
        self.assertEqual(created_order.get("discount"), expected_discount)
        self.assertEqual(created_order.get("deliveryFee"), 0 if subtotal >= 1000 else 150)

        # 4. Manager Confirms Order
        status_conf, data_conf, _ = api_request(
            f"/api/admin/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            data={"status": "confirmed"}
        )
        self.assertEqual(status_conf, 200)
        self.assertEqual(data_conf.get("order", {}).get("status"), "confirmed")

        # 5. Chef Views KDS & Cooks Order
        status_kds, data_kds, _ = api_request("/api/kitchen/kds-orders", headers={"Authorization": f"Bearer {self.chef['token']}"})
        self.assertEqual(status_kds, 200)

        status_cook, data_cook, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "cooking"}
        )
        self.assertEqual(status_cook, 200)
        self.assertEqual(data_cook.get("order", {}).get("status"), "cooking")

        # 6. Chef Marks Order Ready
        status_ready, data_ready, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.chef['token']}"},
            data={"status": "ready"}
        )
        self.assertEqual(status_ready, 200)
        self.assertEqual(data_ready.get("order", {}).get("status"), "ready")

        # 7. Courier Views Queue & Dispatches
        status_courier_q, data_courier_q, _ = api_request("/api/courier/my-orders", headers={"Authorization": f"Bearer {self.courier['token']}"})
        self.assertEqual(status_courier_q, 200)

        status_deliv, data_deliv, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.courier['token']}"},
            data={"status": "delivering"}
        )
        self.assertEqual(status_deliv, 200)
        self.assertEqual(data_deliv.get("order", {}).get("status"), "delivering")

        # 8. Courier Completes Delivery
        status_comp, data_comp, _ = api_request(
            f"/api/orders/{order_id}/status",
            method="POST",
            headers={"Authorization": f"Bearer {self.courier['token']}"},
            data={"status": "completed"}
        )
        self.assertEqual(status_comp, 200)
        self.assertEqual(data_comp.get("order", {}).get("status"), "completed")

        # 9. Manager Accounting & Z-Report Audit
        status_rep, data_rep, _ = api_request("/api/admin/daily-report", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status_rep, 200)
        report = data_rep.get("report", {})
        self.assertGreater(report.get("totalRevenue", 0), 0)
        self.assertGreater(report.get("completedOrdersCount", 0), 0)


if __name__ == "__main__":
    unittest.main()
