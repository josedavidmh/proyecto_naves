import unittest
from app import create_app
from backend.database import db
from backend.models.user import User
from backend.models.progress import PlayerProgress

class TestUserPersistenceAndAccountLifecycle(unittest.TestCase):
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

    def test_voluntary_delete_account_lifecycle(self):
        # 1. Registrar usuario
        reg_res = self.client.post("/api/auth/register", json={
            "username": "PilotoPrueba",
            "email": "prueba@naves.space",
            "password": "Password123!"
        })
        self.assertIn(reg_res.status_code, [200, 201])
        token = reg_res.get_json()["token"]

        # 2. Intentar borrado con clave errónea (debe ser rechazado con 401)
        del_bad = self.client.post(
            "/api/auth/delete-account",
            headers={"Authorization": f"Bearer {token}"},
            json={"password": "WrongPassword!"}
        )
        self.assertEqual(del_bad.status_code, 401)
        self.assertFalse(del_bad.get_json()["success"])

        # 3. Confirmar que el usuario sigue existiendo
        with self.app.app_context():
            u = User.query.filter_by(username="PilotoPrueba").first()
            self.assertIsNotNone(u)

        # 4. Darse de baja exitosamente con contraseña correcta
        del_ok = self.client.post(
            "/api/auth/delete-account",
            headers={"Authorization": f"Bearer {token}"},
            json={"password": "Password123!"}
        )
        self.assertEqual(del_ok.status_code, 200)
        self.assertTrue(del_ok.get_json()["success"])

        # 5. Confirmar que ya no existe en la base de datos
        with self.app.app_context():
            u_deleted = User.query.filter_by(username="PilotoPrueba").first()
            self.assertIsNone(u_deleted)

    def test_reset_password_flow(self):
        # 1. Registrar usuario
        reg_res = self.client.post("/api/auth/register", json={
            "username": "PilotoReset",
            "email": "reset@naves.space",
            "password": "OldPassword123!"
        })
        self.assertIn(reg_res.status_code, [200, 201])

        # 2. Intentar restablecer con datos erróneos (debe fallar con 404)
        bad_res = self.client.post("/api/auth/reset-password", json={
            "identifier": "PilotoReset",
            "email": "wrongemail@naves.space",
            "new_password": "NewSecretPassword!"
        })
        self.assertEqual(bad_res.status_code, 404)

        # 3. Restablecer con datos correctos
        ok_res = self.client.post("/api/auth/reset-password", json={
            "identifier": "PilotoReset",
            "email": "reset@naves.space",
            "new_password": "NewSecretPassword!"
        })
        self.assertEqual(ok_res.status_code, 200)
        self.assertTrue(ok_res.get_json()["success"])

        # 4. Probar login con la nueva contraseña
        login_res = self.client.post("/api/auth/login", json={
            "identifier": "PilotoReset",
            "password": "NewSecretPassword!"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertTrue(login_res.get_json()["success"])

if __name__ == "__main__":
    unittest.main()
