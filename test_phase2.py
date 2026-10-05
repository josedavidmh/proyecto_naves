import unittest
from app import create_app
from backend.database import db
from backend.models.user import User
from backend.models.ship import Ship
from backend.models.progress import PlayerProgress
from backend.models.score import GameScore

class TestPhase2CoreEntitiesAndEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
        })
        self.client = self.app.test_client()

        with self.app.app_context():
            db.drop_all()
            db.create_all()
            Ship.seed_default_ships()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def _get_auth_token(self, username="PilotoTest", email="test@naves.com"):
        res = self.client.post("/api/auth/register", json={
            "username": username,
            "email": email,
            "password": "Password123!"
        })
        return res.get_json()["token"]

    def test_01_get_ships_catalog(self):
        """Verifica que el catálogo devuelva exactamente las 5 naves con sus atributos completos."""
        res = self.client.get("/api/game/ships")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["count"], 5)
        self.assertEqual(len(data["ships"]), 5)

        expected_slugs = {
            "phoenix-vanguard",
            "titan-colossus",
            "valkyrie-specter",
            "vortex-tempest",
            "hyperion-dreadnought"
        }
        actual_slugs = {ship["slug"] for ship in data["ships"]}
        self.assertEqual(expected_slugs, actual_slugs)

        # Verificar que cada nave tenga arma característica y habilidad especial con cooldown
        for ship in data["ships"]:
            self.assertIn("weapon", ship)
            self.assertIn("type", ship["weapon"])
            self.assertGreater(ship["weapon"]["damage"], 0)
            self.assertGreater(ship["weapon"]["fire_rate_ms"], 0)

            self.assertIn("special", ship)
            self.assertIn("slug", ship["special"])
            self.assertGreater(ship["special"]["duration_seconds"], 0)
            self.assertGreater(ship["special"]["cooldown_seconds"], 0)

            self.assertIn("stats", ship)
            self.assertGreater(ship["stats"]["max_health"], 0)
            self.assertGreater(ship["stats"]["speed"], 0)

    def test_02_get_ship_by_id_and_not_found(self):
        """Verifica la consulta individual por ID y el manejo de 404."""
        res_ok = self.client.get("/api/game/ships/1")
        self.assertEqual(res_ok.status_code, 200)
        self.assertTrue(res_ok.get_json()["success"])
        self.assertEqual(res_ok.get_json()["ship"]["id"], 1)

        res_not_found = self.client.get("/api/game/ships/999")
        self.assertEqual(res_not_found.status_code, 404)
        self.assertFalse(res_not_found.get_json()["success"])
        self.assertIn("error", res_not_found.get_json())

    def test_03_player_progress_and_sequential_unlock(self):
        """Verifica la regla estricta de progresión: solo se desbloquea la siguiente fase tras vencer la actual."""
        token = self._get_auth_token("CommanderRex", "rex@naves.com")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Obtener progreso inicial: Fase 1 activa, Fases 2 a 5 bloqueadas
        res_prog = self.client.get("/api/game/progress", headers=headers)
        self.assertEqual(res_prog.status_code, 200)
        prog = res_prog.get_json()["progress"]
        self.assertEqual(prog["current_max_stage"], 1)
        self.assertTrue(prog["stages"]["1"]["unlocked"])
        self.assertFalse(prog["stages"]["2"]["unlocked"])
        self.assertFalse(prog["stages"]["3"]["unlocked"])
        self.assertFalse(prog["stages"]["4"]["unlocked"])
        self.assertFalse(prog["stages"]["5"]["unlocked"])
        self.assertFalse(prog["campaign_completed"])

        # 2. Intento de trampa/salto a la Fase 3 sin haber completado la 1 y 2 (Debe devolver 403 Forbidden)
        res_cheat = self.client.post("/api/game/progress/complete-stage", json={"stage_number": 3}, headers=headers)
        self.assertEqual(res_cheat.status_code, 403)
        self.assertFalse(res_cheat.get_json()["success"])

        # 3. Completar legalmente la Fase 1 -> Debe desbloquear la Fase 2
        res_s1 = self.client.post("/api/game/progress/complete-stage", json={"stage_number": 1}, headers=headers)
        self.assertEqual(res_s1.status_code, 200)
        data_s1 = res_s1.get_json()
        self.assertEqual(data_s1["unlocked_next_stage"], 2)
        self.assertTrue(data_s1["progress"]["stages"]["2"]["unlocked"])

        # 4. Completar Fase 2 -> Desbloquea Fase 3
        res_s2 = self.client.post("/api/game/progress/complete-stage", json={"stage_number": 2}, headers=headers)
        self.assertEqual(res_s2.status_code, 200)
        self.assertTrue(res_s2.get_json()["progress"]["stages"]["3"]["unlocked"])

        # 5. Completar Fase 3 -> Desbloquea Fase 4
        res_s3 = self.client.post("/api/game/progress/complete-stage", json={"stage_number": 3}, headers=headers)
        self.assertEqual(res_s3.status_code, 200)
        self.assertTrue(res_s3.get_json()["progress"]["stages"]["4"]["unlocked"])

        # 6. Completar Fase 4 -> Desbloquea Fase 5
        res_s4 = self.client.post("/api/game/progress/complete-stage", json={"stage_number": 4}, headers=headers)
        self.assertEqual(res_s4.status_code, 200)
        self.assertTrue(res_s4.get_json()["progress"]["stages"]["5"]["unlocked"])

        # 7. Completar Fase 5 -> Campaña superada (Victoria Total)
        res_s5 = self.client.post("/api/game/progress/complete-stage", json={"stage_number": 5}, headers=headers)
        self.assertEqual(res_s5.status_code, 200)
        self.assertTrue(res_s5.get_json()["progress"]["campaign_completed"])

    def test_04_scores_and_leaderboard(self):
        """Verifica el registro de puntuaciones y el ranking global ordenado descendentemente."""
        token_a = self._get_auth_token("AcePilot", "ace@naves.com")
        token_b = self._get_auth_token("TopGun", "topgun@naves.com")

        # 1. Error de validación: puntuación negativa (400 Bad Request)
        res_err = self.client.post("/api/game/scores", json={"ship_id": 1, "score": -100}, headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(res_err.status_code, 400)

        # 2. Error de validación: nave inexistente (404 Not Found)
        res_err_ship = self.client.post("/api/game/scores", json={"ship_id": 9999, "score": 5000}, headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(res_err_ship.status_code, 404)

        # 3. Registro de partidas válidas
        self.client.post("/api/game/scores", json={
            "ship_id": 1,
            "stage_reached": 3,
            "score": 15400,
            "enemies_destroyed": 45,
            "bosses_defeated": 2,
            "victory": False
        }, headers={"Authorization": f"Bearer {token_a}"})

        self.client.post("/api/game/scores", json={
            "ship_id": 2,
            "stage_reached": 5,
            "score": 48200,
            "enemies_destroyed": 120,
            "bosses_defeated": 5,
            "victory": True
        }, headers={"Authorization": f"Bearer {token_b}"})

        # 4. Consulta del Leaderboard
        res_lb = self.client.get("/api/game/leaderboard")
        self.assertEqual(res_lb.status_code, 200)
        lb_data = res_lb.get_json()
        self.assertTrue(lb_data["success"])
        self.assertEqual(len(lb_data["leaderboard"]), 2)

        # Debe estar ordenado de mayor a menor puntuación
        self.assertEqual(lb_data["leaderboard"][0]["score"], 48200)
        self.assertEqual(lb_data["leaderboard"][0]["pilot"], "TopGun")
        self.assertTrue(lb_data["leaderboard"][0]["victory"])

        self.assertEqual(lb_data["leaderboard"][1]["score"], 15400)
        self.assertEqual(lb_data["leaderboard"][1]["pilot"], "AcePilot")

if __name__ == "__main__":
    unittest.main()
