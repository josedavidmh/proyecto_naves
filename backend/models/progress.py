from datetime import datetime, timezone
from backend.database import db

class PlayerProgress(db.Model):
    __tablename__ = "player_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    
    # Desbloqueo progresivo y estricto de las 5 fases
    current_max_stage = db.Column(db.Integer, default=1, nullable=False)
    stage_1_unlocked = db.Column(db.Boolean, default=True, nullable=False)
    stage_2_unlocked = db.Column(db.Boolean, default=False, nullable=False)
    stage_3_unlocked = db.Column(db.Boolean, default=False, nullable=False)
    stage_4_unlocked = db.Column(db.Boolean, default=False, nullable=False)
    stage_5_unlocked = db.Column(db.Boolean, default=False, nullable=False)
    campaign_completed = db.Column(db.Boolean, default=False, nullable=False)
    
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = db.relationship("User", backref=db.backref("progress", uselist=False))

    def is_stage_unlocked(self, stage_number: int) -> bool:
        if stage_number == 1:
            return self.stage_1_unlocked
        elif stage_number == 2:
            return self.stage_2_unlocked
        elif stage_number == 3:
            return self.stage_3_unlocked
        elif stage_number == 4:
            return self.stage_4_unlocked
        elif stage_number == 5:
            return self.stage_5_unlocked
        return False

    def complete_stage(self, stage_number: int) -> bool:
        """
        Valida y desbloquea estrictamente la siguiente fase.
        Solo se puede completar una fase si ya estaba desbloqueada.
        """
        if not (1 <= stage_number <= 5):
            return False

        if not self.is_stage_unlocked(stage_number):
            return False

        if stage_number == 1:
            self.stage_2_unlocked = True
            self.current_max_stage = max(self.current_max_stage, 2)
        elif stage_number == 2:
            self.stage_3_unlocked = True
            self.current_max_stage = max(self.current_max_stage, 3)
        elif stage_number == 3:
            self.stage_4_unlocked = True
            self.current_max_stage = max(self.current_max_stage, 4)
        elif stage_number == 4:
            self.stage_5_unlocked = True
            self.current_max_stage = max(self.current_max_stage, 5)
        elif stage_number == 5:
            self.campaign_completed = True

        self.updated_at = datetime.now(timezone.utc)
        return True

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "current_max_stage": self.current_max_stage,
            "stages": {
                "1": {"name": "Travesía Continental: Norteamérica a la Antártida", "unlocked": self.stage_1_unlocked},
                "2": {"name": "Pacífico Oceánico: De Isla en Isla a Australia", "unlocked": self.stage_2_unlocked},
                "3": {"name": "Travesía a Saturno: Rumbo a los Anillos (Vía Marte y Júpiter)", "unlocked": self.stage_3_unlocked},
                "4": {"name": "Sector Criogénico: Glaciares y Tempestad de Hielo", "unlocked": self.stage_4_unlocked},
                "5": {"name": "Jungla Devastada: Asalto al Cuartel General del Boss", "unlocked": self.stage_5_unlocked}
            },
            "campaign_completed": self.campaign_completed,
            "updated_at": self.updated_at.isoformat()
        }
