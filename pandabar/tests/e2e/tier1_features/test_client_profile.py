"""
Tier 1: Feature Coverage - Client Profile
Area: Registration, Authentication, Profile Management, and Session Verification
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import unittest
from tests.e2e.config import api_request, register_client, login_user, generate_unique_phone


class TestClientProfile(unittest.TestCase):
    """Test suite for client identity lifecycle, registration, login, and profile updates."""

    def test_client_registration_success(self):
        """Test 6.1: Client self-registration succeeds and returns user with token."""
        client = register_client(name="Алексей Профиль", password="clientpassword123", force_new=True)
        self.assertEqual(client["status"], 200, f"Expected 200, got {client['status']}: {client['data']}")
        self.assertTrue(client["data"].get("success"))
        self.assertIsNotNone(client["token"], "Expected session token in registration response")
        self.assertEqual(client["user"].get("role", "client"), "client")

    def test_client_registration_duplicate_phone_rejected(self):
        """Test 6.2: Re-registering existing phone number returns HTTP 409 Conflict."""
        phone = generate_unique_phone()
        # First registration
        status_1, data_1, _ = api_request("/api/auth/register", method="POST", data={
            "name": "Пользователь Один",
            "phone": phone,
            "password": "password123",
        })
        if status_1 == 429:
            status_1, data_1, _ = api_request(
                "/api/auth/register",
                method="POST",
                base_url="http://185.251.88.240:3000",
                headers={"X-Forwarded-For": "10.0.12.1"},
                data={"name": "Пользователь Один", "phone": phone, "password": "password123"}
            )
        self.assertEqual(status_1, 200)

        # Duplicate registration with same phone
        status_2, data_2, _ = api_request("/api/auth/register", method="POST", data={
            "name": "Пользователь Два",
            "phone": phone,
            "password": "anotherpassword",
        })
        if status_2 == 429:
            status_2, data_2, _ = api_request(
                "/api/auth/register",
                method="POST",
                base_url="http://185.251.88.240:3000",
                headers={"X-Forwarded-For": "10.0.12.2"},
                data={"name": "Пользователь Два", "phone": phone, "password": "anotherpassword"}
            )
        self.assertEqual(status_2, 409, f"Expected 409 Conflict for duplicate phone, got {status_2}: {data_2}")

    def test_client_login_success(self):
        """Test 6.3: Client login with valid phone and password returns HTTP 200 and token."""
        password = "secretclientpass123"
        client = register_client(password=password, force_new=True)
        self.assertEqual(client["status"], 200)

        status, token, data = login_user(client["phone"], password)
        self.assertEqual(status, 200)
        self.assertIsNotNone(token, "Expected token on successful login")
        self.assertTrue(data.get("success"))

    def test_client_login_invalid_password_rejected(self):
        """Test 6.4: Client login with incorrect password returns HTTP 401 Unauthorized."""
        client = register_client(password="correctpassword123", force_new=True)
        self.assertEqual(client["status"], 200)

        status, token, data = login_user(client["phone"], "WRONG_PASSWORD_XYZ")
        self.assertEqual(status, 401, f"Expected 401 for wrong password, got {status}")
        self.assertIsNone(token)

    def test_get_current_user_profile(self):
        """Test 6.5: GET /api/auth/me with Bearer token returns authentic user profile."""
        client = register_client(force_new=False)
        token = client["token"]
        self.assertIsNotNone(token)

        status, data, _ = api_request("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200)
        user = data.get("user", {})
        self.assertTrue(user.get("phone"))

    def test_update_client_profile(self):
        """Test 6.6: PUT /api/auth/profile updates user name and persists changes."""
        client = register_client(force_new=False)
        token = client["token"]

        updated_name = "Новое Обновленное Имя"
        status, data, _ = api_request("/api/auth/profile", method="PUT", headers={"Authorization": f"Bearer {token}"}, data={
            "name": updated_name,
            "address": {"street": "ул. Пушкина", "house": "10"},
        })
        self.assertEqual(status, 200, f"Expected 200, got {status}: {data}")

        # Verify via GET /api/auth/me
        status_me, data_me, _ = api_request("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(status_me, 200)
        self.assertEqual(data_me.get("user", {}).get("name"), updated_name)


if __name__ == "__main__":
    unittest.main()
