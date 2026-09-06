"""Smoke tests for the base FastAPI application."""

import unittest

from fastapi.testclient import TestClient

from app.main import app


class HealthRouteTests(unittest.TestCase):
    """Verify the public system endpoints."""

    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_root(self) -> None:
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "CallDine AI backend running"})

    def test_health(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_login_and_logout(self) -> None:
        with TestClient(app) as client:
            login = client.post("/api/v1/auth/login", json={"email": "admin@admin.com", "password": "password"})
            self.assertEqual(login.status_code, 200)
            self.assertEqual(login.json()["user"]["role"], "admin")

            token = login.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}
            self.assertEqual(client.get("/api/v1/auth/me", headers=headers).status_code, 200)
            dashboard = client.get("/api/v1/admin/dashboard", headers=headers)
            self.assertEqual(dashboard.status_code, 200)
            self.assertEqual(len(dashboard.json()["days"]), 7)
            self.assertEqual(client.get("/api/v1/admin/dashboard").status_code, 401)
            self.assertEqual(client.post("/api/v1/auth/logout", headers=headers).status_code, 204)
            self.assertEqual(client.get("/api/v1/auth/me", headers=headers).status_code, 401)
