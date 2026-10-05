from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def set_password(self, password: str) -> None:
        """Genera y almacena el hash criptográfico seguro de la contraseña."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verifica la contraseña ingresada contra el hash almacenado."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        """Serializa la información del usuario excluyendo credenciales sensibles."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def save_backup(cls):
        """Serializa de forma persistente todos los usuarios, progresos y marcas a backend/data/users_backup.json."""
        import json
        from pathlib import Path
        from flask import current_app, has_app_context
        from backend.models.progress import PlayerProgress
        from backend.models.score import GameScore

        if has_app_context() and current_app.config.get("TESTING"):
            return

        backup_file = Path(__file__).resolve().parent.parent / "data" / "users_backup.json"
        backup_file.parent.mkdir(parents=True, exist_ok=True)

        users_data = []
        for u in cls.query.order_by(cls.id.asc()).all():
            users_data.append({
                "username": u.username,
                "email": u.email,
                "password_hash": u.password_hash,
                "created_at": u.created_at.isoformat() if u.created_at else None
            })

        progress_data = []
        for p in PlayerProgress.query.all():
            if p.user:
                progress_data.append({
                    "username": p.user.username,
                    "current_max_stage": p.current_max_stage,
                    "stage_1_unlocked": p.stage_1_unlocked,
                    "stage_2_unlocked": p.stage_2_unlocked,
                    "stage_3_unlocked": p.stage_3_unlocked,
                    "stage_4_unlocked": p.stage_4_unlocked,
                    "stage_5_unlocked": p.stage_5_unlocked,
                    "campaign_completed": p.campaign_completed,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None
                })

        scores_data = []
        for s in GameScore.query.order_by(GameScore.id.asc()).all():
            if s.user and s.ship:
                scores_data.append({
                    "pilot": s.user.username,
                    "ship_slug": s.ship.slug,
                    "stage_reached": s.stage_reached,
                    "score": s.score,
                    "enemies_destroyed": s.enemies_destroyed,
                    "bosses_defeated": s.bosses_defeated,
                    "victory": s.victory,
                    "created_at": s.created_at.isoformat() if s.created_at else None
                })

        payload = {
            "users": users_data,
            "progress": progress_data,
            "scores": scores_data
        }

        try:
            with open(backup_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[!] Advertencia al guardar backup de usuarios: {e}")

    @classmethod
    def restore_backup_if_empty(cls):
        """Restaura usuarios, progresos y registros históricos si la base de datos está vacía o si faltan cuentas."""
        import json
        from pathlib import Path
        from flask import current_app, has_app_context
        from backend.models.progress import PlayerProgress
        from backend.models.score import GameScore
        from backend.models.ship import Ship

        if has_app_context() and current_app.config.get("TESTING"):
            return

        backup_file = Path(__file__).resolve().parent.parent / "data" / "users_backup.json"
        if not backup_file.exists():
            return

        try:
            with open(backup_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"[!] Error leyendo backup de usuarios: {e}")
            return

        users_list = data.get("users", [])
        if not users_list:
            return

        restored_users = 0
        for u_data in users_list:
            username = u_data.get("username")
            if not username:
                continue
            existing = cls.query.filter_by(username=username).first()
            if not existing:
                c_at = None
                if u_data.get("created_at"):
                    try:
                        c_at = datetime.fromisoformat(u_data["created_at"])
                    except Exception:
                        c_at = datetime.now(timezone.utc)

                new_user = cls(
                    username=username,
                    email=u_data.get("email", f"{username}@naves.space"),
                    password_hash=u_data.get("password_hash"),
                    created_at=c_at or datetime.now(timezone.utc)
                )
                db.session.add(new_user)
                restored_users += 1

        if restored_users > 0:
            db.session.commit()
            print(f"[*] {restored_users} usuario(s) restaurados con éxito desde el respaldo persistente.")

        # Restaurar progresos asociados
        for p_data in data.get("progress", []):
            username = p_data.get("username")
            if not username:
                continue
            user = cls.query.filter_by(username=username).first()
            if not user:
                continue

            prog = PlayerProgress.query.filter_by(user_id=user.id).first()
            s1 = p_data.get("stage_1_unlocked", True)
            s2 = p_data.get("stage_2_unlocked", False)
            s3 = p_data.get("stage_3_unlocked", False)
            s4 = p_data.get("stage_4_unlocked", False)
            s5 = p_data.get("stage_5_unlocked", False)
            if "stages" in p_data and isinstance(p_data["stages"], dict):
                s1 = p_data["stages"].get("1", {}).get("unlocked", s1)
                s2 = p_data["stages"].get("2", {}).get("unlocked", s2)
                s3 = p_data["stages"].get("3", {}).get("unlocked", s3)
                s4 = p_data["stages"].get("4", {}).get("unlocked", s4)
                s5 = p_data["stages"].get("5", {}).get("unlocked", s5)

            if not prog:
                prog = PlayerProgress(
                    user_id=user.id,
                    current_max_stage=p_data.get("current_max_stage", 1),
                    stage_1_unlocked=s1,
                    stage_2_unlocked=s2,
                    stage_3_unlocked=s3,
                    stage_4_unlocked=s4,
                    stage_5_unlocked=s5,
                    campaign_completed=p_data.get("campaign_completed", False)
                )
                db.session.add(prog)
            else:
                if p_data.get("current_max_stage", 1) > prog.current_max_stage:
                    prog.current_max_stage = p_data["current_max_stage"]
                    prog.stage_1_unlocked = s1
                    prog.stage_2_unlocked = s2
                    prog.stage_3_unlocked = s3
                    prog.stage_4_unlocked = s4
                    prog.stage_5_unlocked = s5

        db.session.commit()

        # Restaurar marcas y récords
        for s_data in data.get("scores", []):
            pilot = s_data.get("pilot")
            slug = s_data.get("ship_slug")
            user = cls.query.filter_by(username=pilot).first()
            ship = Ship.query.filter_by(slug=slug).first()
            if user and ship:
                score_val = s_data.get("score", 0)
                st_val = s_data.get("stage_reached", 1)
                existing_s = GameScore.query.filter_by(
                    user_id=user.id,
                    score=score_val,
                    stage_reached=st_val
                ).first()
                if not existing_s:
                    c_at = None
                    if s_data.get("created_at"):
                        try:
                            c_at = datetime.fromisoformat(s_data["created_at"])
                        except Exception:
                            c_at = datetime.now(timezone.utc)
                    new_s = GameScore(
                        user_id=user.id,
                        ship_id=ship.id,
                        stage_reached=st_val,
                        score=score_val,
                        enemies_destroyed=s_data.get("enemies_destroyed", 0),
                        bosses_defeated=s_data.get("bosses_defeated", 0),
                        victory=s_data.get("victory", False),
                        created_at=c_at or datetime.now(timezone.utc)
                    )
                    db.session.add(new_s)

        db.session.commit()
