"""Phase 14 — Modern QA Learning Labs: the k6/Gatling/Locust performance-
testing category, satisfied with a REAL, runnable Locust load test.

Unlike JMeter (Phase 10, blocked by a verified apt-package/XStream
incompatibility) and Selenium (Phase 10, blocked by a verified
chromedriver/Chromium version mismatch + network policy), Locust is pure
Python with no JVM/XStream dependency and no browser driver — it installs
cleanly via `pip install locust` (pypi.org is on this environment's
network allowlist) and runs for real against the real backend.

Real, simple weighted user behavior mirroring what a real user of this
app actually does: mostly browse products (read-heavy, matches this
demo's real traffic shape — no cart/checkout UI exists, see Phase 8
EXECUTION.md), occasionally log in and place an order.
"""

import random

from locust import HttpUser, task, between


class QADemoUser(HttpUser):
    wait_time = between(0.1, 0.5)

    def on_start(self):
        self.token = None

    @task(5)
    def health_check(self):
        self.client.get("/api/health", name="/api/health")

    @task(10)
    def list_products(self):
        self.client.get("/api/products", name="/api/products")

    @task(2)
    def login_and_view_notifications(self):
        email = random.choice(
            ["test.active01@example.com", "test.active02@example.com"]
        )
        with self.client.post(
            "/api/auth/login",
            json={"email": email, "password": "ValidPass123!"},
            name="/api/auth/login",
            catch_response=True,
        ) as res:
            if res.status_code != 200:
                res.failure(f"login failed with status {res.status_code}")
                return
            token = res.json().get("token")
            res.success()

        self.client.get(
            "/api/notifications",
            headers={"Authorization": f"Bearer {token}"},
            name="/api/notifications",
        )

    # Codex fix-campaign B8 (P2, Phase 15): this module's own docstring
    # claimed simulated users "occasionally... place an order", but no
    # task here ever called POST /api/orders — case-study-02's "order
    # load test" citation of this file was therefore unsupported by the
    # code actually run. Fixed with a real, low-weight task (orders are
    # genuinely rarer than browsing in this app's real traffic shape,
    # and this app's frontend has no checkout UI at all — see Phase 8
    # EXECUTION.md), always ordering the highest-stock seeded product
    # (id 1, 25 units) at quantity 1 with the deterministic approved
    # test token, so a short run's real order volume never exhausts it.
    @task(1)
    def place_order(self):
        email = random.choice(
            ["test.active01@example.com", "test.active02@example.com"]
        )
        with self.client.post(
            "/api/auth/login",
            json={"email": email, "password": "ValidPass123!"},
            name="/api/auth/login",
            catch_response=True,
        ) as res:
            if res.status_code != 200:
                res.failure(f"login failed with status {res.status_code}")
                return
            token = res.json().get("token")
            res.success()

        self.client.post(
            "/api/orders",
            json={"items": [{"product_id": 1, "quantity": 1}], "payment_token": "TEST-CARD-APPROVED"},
            headers={"Authorization": f"Bearer {token}"},
            name="/api/orders",
        )
