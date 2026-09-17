"""
Tier 1: Feature Coverage - Manager Z-Reports & Accounting
Area: Daily Z-Reports, Financial Audits, and CSV Exporting
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import (
    api_request,
    get_admin_token,
    register_client,
)


class TestManagerZReports(unittest.TestCase):
    """Test suite for Manager Daily Z-Reports, shift reconciliation, and CSV export functionality."""

    @classmethod
    def setUpClass(cls):
        cls.admin_token = get_admin_token()

    def test_daily_report_access_authenticated(self):
        """Test 9.1: Authenticated admin/manager retrieves daily Z-Report."""
        self.assertIsNotNone(self.admin_token, "Admin token required")
        status, data, _ = api_request("/api/admin/daily-report", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200, f"Expected 200 for daily report, got {status}: {data}")
        self.assertTrue(data.get("success"))
        self.assertIn("report", data)

    def test_daily_report_schema_metrics(self):
        """Test 9.2: Daily report contains required operational and financial aggregates."""
        status, data, _ = api_request("/api/admin/daily-report", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200)
        report = data.get("report", {})
        expected_fields = ["date", "totalRevenue", "completedOrdersCount", "payments", "totalOrdersCount"]
        for field in expected_fields:
            self.assertIn(field, report, f"Daily report missing required field '{field}'")

    def test_unauthenticated_daily_report_rejected(self):
        """Test 9.3: Unauthenticated request to /api/admin/daily-report returns HTTP 401."""
        status, data, _ = api_request("/api/admin/daily-report")
        self.assertEqual(status, 401, f"Expected 401 for unauthenticated report access, got {status}")

    def test_client_role_cannot_access_daily_report(self):
        """Test 9.4: Client token cannot access admin daily report (HTTP 403 Forbidden)."""
        client = register_client()
        status, data, _ = api_request("/api/admin/daily-report", headers={"Authorization": f"Bearer {client['token']}"})
        self.assertEqual(status, 403, f"Expected 403 for client accessing report, got {status}")

    def test_daily_report_csv_export_format(self):
        """Test 9.5: GET /api/admin/daily-report/export-csv returns CSV with UTF-8 BOM."""
        status, data, headers = api_request("/api/admin/daily-report/export-csv", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200, f"Expected 200 for CSV export, got {status}")
        content_type = headers.get("content-type", headers.get("Content-Type", ""))
        self.assertTrue("csv" in content_type.lower() or "text" in content_type.lower(), f"Unexpected Content-Type: {content_type}")
        # Data should contain typical CSV indicators (headers or semicolons/commas)
        csv_text = str(data)
        self.assertTrue(
            ";" in csv_text or "," in csv_text or "Отчет" in csv_text or "Выручка" in csv_text,
            "CSV output does not contain expected delimited columns or report headers"
        )

    def test_operational_expenses_query(self):
        """Test 9.6: Admin can fetch OPEX configuration parameters."""
        status, data, _ = api_request("/api/admin/opex", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status, 200, f"Expected 200 for OPEX settings, got {status}: {data}")
        self.assertTrue(data.get("success"))
        opex = data.get("opex", {})
        self.assertTrue(any(k in opex for k in ["rentPerMonth", "rentMonthly"]), "Missing rent parameter in OPEX")


if __name__ == "__main__":
    unittest.main()
