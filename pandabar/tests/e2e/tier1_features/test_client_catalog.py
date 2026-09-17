"""
Tier 1: Feature Coverage - Client Catalog
Area: Catalog Retrieval and Item Schema
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request


class TestClientCatalog(unittest.TestCase):
    """Test suite for client catalog retrieval and data integrity."""

    def test_catalog_endpoint_status(self):
        """Test 1.1: GET /api/menu returns HTTP 200 and success flag."""
        status, data, _ = api_request("/api/menu")
        self.assertEqual(status, 200, f"Expected 200 OK, got {status}")
        self.assertIsInstance(data, dict, "Expected JSON object response")
        self.assertTrue(data.get("success"), "Expected success: true in response")
        self.assertIn("menu", data, "Expected 'menu' key in response")

    def test_catalog_item_count_and_structure(self):
        """Test 1.2: Menu contains expected volume of items (>100 dishes)."""
        status, data, _ = api_request("/api/menu")
        self.assertEqual(status, 200)
        menu = data.get("menu", [])
        self.assertGreaterEqual(len(menu), 100, f"Expected at least 100 menu items, found {len(menu)}")

    def test_catalog_items_required_fields(self):
        """Test 1.3: Every item conforms to Product interface (id, name, price, category, image)."""
        status, data, _ = api_request("/api/menu")
        self.assertEqual(status, 200)
        menu = data.get("menu", [])
        required_keys = ["id", "name", "price", "category", "image"]
        for idx, item in enumerate(menu[:30]):
            for key in required_keys:
                self.assertIn(key, item, f"Item index {idx} ({item.get('name')}) missing required key '{key}'")
                self.assertIsNotNone(item[key], f"Item index {idx} '{key}' is None")

    def test_catalog_item_pricing_validity(self):
        """Test 1.4: All product prices are valid positive numbers."""
        status, data, _ = api_request("/api/menu")
        self.assertEqual(status, 200)
        menu = data.get("menu", [])
        for item in menu:
            price = item.get("price")
            self.assertIsInstance(price, (int, float), f"Item {item.get('id')} price is not numeric")
            self.assertGreater(price, 0, f"Item {item.get('id')} price must be greater than 0")

    def test_catalog_categories_coverage(self):
        """Test 1.5: Menu covers standard Japanese and Asian delivery categories."""
        status, data, _ = api_request("/api/menu")
        self.assertEqual(status, 200)
        menu = data.get("menu", [])
        categories = {item.get("category") for item in menu if item.get("category")}
        expected_categories = ["sushi", "sets", "classic-rolls", "pizza"]
        for cat in expected_categories:
            self.assertIn(
                cat,
                categories,
                f"Expected category '{cat}' to be represented in catalog, found {categories}"
            )

    def test_catalog_promo_codes_definition(self):
        """Test 1.6: Menu response includes valid promoCodes list."""
        status, data, _ = api_request("/api/menu")
        self.assertEqual(status, 200)
        promos = data.get("promoCodes", [])
        self.assertIsInstance(promos, list, "Expected promoCodes to be a list")
        self.assertGreater(len(promos), 0, "Expected at least one active promo code")
        codes = [p.get("code") for p in promos]
        self.assertIn("PANDA10", codes, "Expected PANDA10 promo code in catalog definitions")


if __name__ == "__main__":
    unittest.main()
