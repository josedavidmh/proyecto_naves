import unittest
import json
import os
from app import create_app
from backend.database import db
from backend.models.user import User

class TestPhase1AuthAndDatabase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
        })
        self.client = self.app.test_client()

        with self.app.app_context():
            db.drop_all()
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["database"], "SQLite (SQLAlchemy)")

    def test_02_register_and_login_flow(self):
        # 1. Registro exitoso
        reg_payload = {
            "username": "PilotoAlpha",
            "email": "alpha@naves.com",
            "password": "Password123!"
        }
        res_reg = self.client.post("/api/auth/register", json=reg_payload)
        self.assertIn(res_reg.status_code, [200, 201])
        data_reg = res_reg.get_json()
        self.assertTrue(data_reg["success"])
        self.assertIn("token", data_reg)
        token = data_reg["token"]

        # 2. Intento de registro duplicado (debe fallar con 409)
        res_dup = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res_dup.status_code, 409)
        data_dup = res_dup.get_json()
        self.assertFalse(data_dup["success"])

        # 3. Login con credenciales válidas
        login_payload = {
            "identifier": "alpha@naves.com",
            "password": "Password123!"
        }
        res_login = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(res_login.status_code, 200)
        data_login = res_login.get_json()
        self.assertTrue(data_login["success"])
        self.assertIn("token", data_login)

        # 4. Login con credenciales incorrectas (debe fallar con 401)
        res_bad_login = self.client.post("/api/auth/login", json={
            "identifier": "alpha@naves.com",
            "password": "WrongPassword"
        })
        self.assertEqual(res_bad_login.status_code, 401)

        # 5. Consulta de endpoint protegido /api/auth/me sin token (debe fallar con 401)
        res_me_no_token = self.client.get("/api/auth/me")
        self.assertEqual(res_me_no_token.status_code, 401)

        # 6. Consulta de endpoint protegido /api/auth/me con token válido (200 OK)
        res_me = self.client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(res_me.status_code, 200)
        data_me = res_me.get_json()
        self.assertTrue(data_me["success"])
        self.assertEqual(data_me["user"]["username"], "PilotoAlpha")
        self.assertEqual(data_me["user"]["email"], "alpha@naves.com")

    def test_03_change_password(self):
        # Registrar y obtener token
        reg_payload = {
            "username": "PilotoBeta",
            "email": "beta@naves.com",
            "password": "InitialPassword123!"
        }
        res_reg = self.client.post("/api/auth/register", json=reg_payload)
        token = res_reg.get_json()["token"]

        # Intento de cambio con contraseña actual incorrecta
        res_fail = self.client.post("/api/auth/change-password", headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "current_password": "WrongPassword!",
            "new_password": "NewSecretPassword456!"
        })
        self.assertEqual(res_fail.status_code, 401)

        # Cambio exitoso
        res_success = self.client.post("/api/auth/change-password", headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "current_password": "InitialPassword123!",
            "new_password": "NewSecretPassword456!"
        })
        self.assertEqual(res_success.status_code, 200)
        self.assertTrue(res_success.get_json()["success"])

        # Login con la nueva contraseña
        res_new_login = self.client.post("/api/auth/login", json={
            "identifier": "beta@naves.com",
            "password": "NewSecretPassword456!"
        })
        self.assertEqual(res_new_login.status_code, 200)
        self.assertTrue(res_new_login.get_json()["success"])

if __name__ == "__main__":
    unittest.main()
