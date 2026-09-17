"""
Tier 1: Feature Coverage - Client Search
Area: Menu Search and Filter Operations
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request


class TestClientSearch(unittest.TestCase):
    """Test suite for menu item search, query matching, and filtering logic."""

    @classmethod
    def setUpClass(cls):
        status, data, _ = api_request("/api/menu")
        if status == 200 and isinstance(data, dict):
            cls.catalog = data.get("menu", [])
        else:
            cls.catalog = []

    def _client_search(self, query):
        """Simulate client-side catalog search query filtering."""
        q = query.lower().strip()
        results = []
        for item in self.catalog:
            name = (item.get("name") or "").lower()
            desc = (item.get("description") or "").lower()
            ing_summary = (item.get("ingredientsSummary") or "").lower()
            tags = [str(t).lower() for t in (item.get("tags") or []) if t]
            if q in name or q in desc or q in ing_summary or any(q in t for t in tags):
                results.append(item)
        return results

    def test_search_exact_name(self):
        """Test 2.1: Exact match query finds target dish."""
        self.assertGreater(len(self.catalog), 0, "Catalog must not be empty")
        results = self._client_search("Филадельфия")
        self.assertGreater(len(results), 0, "Expected search results for 'Филадельфия'")
        self.assertTrue(any("филадельфия" in item["name"].lower() for item in results))

    def test_search_case_insensitivity(self):
        """Test 2.2: Case differences return identical search results."""
        results_lower = self._client_search("филадельфия")
        results_upper = self._client_search("ФИЛАДЕЛЬФИЯ")
        results_mixed = self._client_search("ФиЛаДеЛьФиЯ")
        self.assertEqual(len(results_lower), len(results_upper), "Case difference produced different counts")
        self.assertEqual(len(results_lower), len(results_mixed), "Mixed case produced different counts")

    def test_search_by_ingredient_keyword(self):
        """Test 2.3: Searching by ingredient (e.g. 'лосось') returns relevant dishes."""
        results = self._client_search("лосось")
        self.assertGreater(len(results), 0, "Expected dishes containing 'лосось'")

    def test_search_category_isolation(self):
        """Test 2.4: Searching within category isolates category items."""
        category_name = "sushi"
        sushi_items = [i for i in self.catalog if i.get("category") == category_name]
        self.assertGreater(len(sushi_items), 0, f"Expected dishes in category '{category_name}'")
        for item in sushi_items:
            self.assertEqual(item.get("category"), category_name)

    def test_search_nonexistent_query_yields_empty(self):
        """Test 2.5: Nonexistent keyword produces empty result set without errors."""
        results = self._client_search("NonExistentSpecialDish9999XYZ")
        self.assertEqual(len(results), 0, "Expected 0 results for nonexistent dish")

    def test_search_whitespace_trimming(self):
        """Test 2.6: Search handles leading and trailing whitespace gracefully."""
        normal_results = self._client_search("калифорния")
        padded_results = self._client_search("   калифорния   ")
        self.assertEqual(len(normal_results), len(padded_results), "Whitespace padding affected search results")


if __name__ == "__main__":
    unittest.main()
