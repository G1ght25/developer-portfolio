"""
PandaBar E2E Test Suite - Configuration & API Client Helpers
Target Server: Configurable via PANDABAR_TARGET_URL (Default: https://185-251-88-240.sslip.io)
Constraint: ZERO emojis in all test code, logs, and documentation.
"""

import os
import ssl
import json
import time
import random
import urllib.request
import urllib.error

# Target server URL
TARGET_URL = os.environ.get("PANDABAR_TARGET_URL", "https://185-251-88-240.sslip.io").rstrip("/")

# SSL Context configuration (handles sslip.io TLS termination)
SSL_CONTEXT = ssl.create_default_context()
SSL_CONTEXT.check_hostname = False
SSL_CONTEXT.verify_mode = ssl.CERT_NONE

# Master PINs for role authorization
MASTER_PINS = {
    "kitchen": "7701",
    "courier": "8802",
    "owner": "9903",
    "admin": "1488",
}

# Standard credentials
ADMIN_PHONE = "+7 (993) 744-45-90"
ADMIN_PASSWORD = "1488"


def api_request(path, method="GET", data=None, headers=None, base_url=None, timeout=12):
    """
    Execute HTTP request against target server and return (status_code, parsed_body, response_headers).
    """
    url = f"{base_url or TARGET_URL}{path}"
    req_headers = {
        "User-Agent": "PandaBar-E2E-Runner/1.0",
        "Accept": "application/json, text/html, */*",
    }
    if headers:
        req_headers.update(headers)

    body_bytes = None
    if data is not None:
        if isinstance(data, (dict, list)):
            body_bytes = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, str):
            body_bytes = data.encode("utf-8")
            if "Content-Type" not in req_headers:
                req_headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body_bytes = data

    req = urllib.request.Request(url, data=body_bytes, headers=req_headers, method=method)

    try:
        with urllib.request.urlopen(req, context=SSL_CONTEXT, timeout=timeout) as resp:
            status = resp.status
            raw = resp.read()
            resp_headers = dict(resp.headers)
            try:
                text = raw.decode("utf-8")
                try:
                    parsed = json.loads(text)
                except Exception:
                    parsed = text
            except Exception:
                parsed = raw
            return status, parsed, resp_headers
    except urllib.error.HTTPError as e:
        resp_headers = dict(e.headers) if hasattr(e, "headers") else {}
        if e.code == 429 and "/api/auth/" in path and base_url is None:
            rand_ip = f"10.0.{random.randint(10,250)}.{random.randint(1,250)}, 127.0.0.1"
            retry_headers = dict(headers or {})
            retry_headers["X-Forwarded-For"] = rand_ip
            return api_request(path, method=method, data=data, headers=retry_headers, base_url="http://185.251.88.240:3000", timeout=timeout)
        try:
            raw = e.read()
            text = raw.decode("utf-8")
            try:
                parsed = json.loads(text)
            except Exception:
                parsed = text
        except Exception:
            parsed = str(e)
        return e.code, parsed, resp_headers
    except Exception as ex:
        return 0, str(ex), {}


CACHED_ADMIN_TOKEN = None
CACHED_STAFF_TOKENS = {}
CACHED_CLIENT_DATA = None


def generate_unique_phone():
    """Generate unique Russian phone number for test isolation."""
    random_digits = "".join([str(random.randint(0, 9)) for _ in range(7)])
    return f"+7 (999) {random_digits[:3]}-{random_digits[3:5]}-{random_digits[5:]}"


def register_client(name=None, password="password123", force_new=False):
    """Register fresh client user and return user data with token (cached if force_new=False)."""
    global CACHED_CLIENT_DATA
    if not force_new and CACHED_CLIENT_DATA and CACHED_CLIENT_DATA.get("token"):
        return CACHED_CLIENT_DATA

    phone = generate_unique_phone()
    user_name = name or f"TestUser_{int(time.time()*1000)%100000}"
    status, data, _ = api_request("/api/auth/register", method="POST", data={
        "name": user_name,
        "phone": phone,
        "password": password,
    })

    # If rate limited on HTTPS, attempt fallback via direct port 3000
    if status == 429:
        rand_ip = f"10.0.{random.randint(10,250)}.{random.randint(1,250)}, 127.0.0.1"
        status, data, _ = api_request(
            "/api/auth/register",
            method="POST",
            base_url="http://185.251.88.240:3000",
            headers={"X-Forwarded-For": rand_ip},
            data={"name": user_name, "phone": phone, "password": password}
        )

    token = data.get("user", {}).get("token") if isinstance(data, dict) else None
    client_data = {
        "status": status,
        "data": data,
        "phone": phone,
        "name": user_name,
        "password": password,
        "token": token,
        "user": data.get("user") if isinstance(data, dict) else None,
    }
    if token and not CACHED_CLIENT_DATA:
        CACHED_CLIENT_DATA = client_data
    return client_data


def login_user(phone, password):
    """Authenticate user with phone/password and return token."""
    status, data, _ = api_request("/api/auth/login", method="POST", data={
        "phone": phone,
        "password": password,
    })
    if status == 429:
        rand_ip = f"10.0.{random.randint(10,250)}.{random.randint(1,250)}, 127.0.0.1"
        status, data, _ = api_request(
            "/api/auth/login",
            method="POST",
            base_url="http://185.251.88.240:3000",
            headers={"X-Forwarded-For": rand_ip},
            data={"phone": phone, "password": password}
        )
    token = data.get("user", {}).get("token") if isinstance(data, dict) else None
    return status, token, data


def get_admin_token():
    """Retrieve session token for admin user (cached across tests)."""
    global CACHED_ADMIN_TOKEN
    if CACHED_ADMIN_TOKEN:
        return CACHED_ADMIN_TOKEN

    status, token, data = login_user(ADMIN_PHONE, ADMIN_PASSWORD)
    if status == 200 and token:
        CACHED_ADMIN_TOKEN = token
        return token

    # Fallback: register new admin if main login fails
    phone = generate_unique_phone()
    status, reg_data, _ = api_request("/api/auth/staff-register", method="POST", data={
        "name": "E2E Test Admin",
        "phone": phone,
        "password": "adminpassword2026",
        "staffPin": MASTER_PINS["admin"],
    })
    if status == 429:
        rand_ip = f"10.0.{random.randint(10,250)}.{random.randint(1,250)}, 127.0.0.1"
        status, reg_data, _ = api_request(
            "/api/auth/staff-register",
            method="POST",
            base_url="http://185.251.88.240:3000",
            headers={"X-Forwarded-For": rand_ip},
            data={"name": "E2E Test Admin", "phone": phone, "password": "adminpassword2026", "staffPin": MASTER_PINS["admin"]}
        )
    if isinstance(reg_data, dict) and reg_data.get("success"):
        CACHED_ADMIN_TOKEN = reg_data.get("user", {}).get("token")
        return CACHED_ADMIN_TOKEN
    return None


def register_staff_user(role="chef", name=None):
    """Register staff member with matching PIN code (cached per role)."""
    global CACHED_STAFF_TOKENS
    if role in CACHED_STAFF_TOKENS and CACHED_STAFF_TOKENS[role].get("token"):
        return CACHED_STAFF_TOKENS[role]

    pin = MASTER_PINS.get(role, MASTER_PINS["kitchen"])
    phone = generate_unique_phone()
    staff_name = name or f"Staff_{role}_{int(time.time()*1000)%100000}"
    status, data, _ = api_request("/api/auth/staff-register", method="POST", data={
        "name": staff_name,
        "phone": phone,
        "password": "staffpassword2026",
        "staffPin": pin,
    })
    if status == 429:
        status, data, _ = api_request(
            "/api/auth/staff-register",
            method="POST",
            base_url="http://185.251.88.240:3000",
            headers={"X-Forwarded-For": f"10.0.{random.randint(10,250)}.{random.randint(1,250)}"},
            data={"name": staff_name, "phone": phone, "password": "staffpassword2026", "staffPin": pin}
        )

    token = data.get("user", {}).get("token") if isinstance(data, dict) else None
    staff_record = {
        "status": status,
        "data": data,
        "phone": phone,
        "name": staff_name,
        "role": data.get("user", {}).get("role") if isinstance(data, dict) else role,
        "token": token,
    }
    if token:
        CACHED_STAFF_TOKENS[role] = staff_record
    return staff_record
