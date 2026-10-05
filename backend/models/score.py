from datetime import datetime, timezone
from backend.database import db

class GameScore(db.Model):
    __tablename__ = "game_scores"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    ship_id = db.Column(db.Integer, db.ForeignKey("ships.id"), nullable=False)
    
    stage_reached = db.Column(db.Integer, nullable=False, default=1)
    score = db.Column(db.Integer, nullable=False, default=0, index=True)
    enemies_destroyed = db.Column(db.Integer, nullable=False, default=0)
    bosses_defeated = db.Column(db.Integer, nullable=False, default=0)
    victory = db.Column(db.Boolean, nullable=False, default=False)
    
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = db.relationship("User", backref=db.backref("scores", lazy="dynamic"))
    ship = db.relationship("Ship", backref=db.backref("scores", lazy="dynamic"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "pilot": self.user.username if self.user else "Desconocido",
            "ship_name": self.ship.name if self.ship else "Desconocida",
            "ship_slug": self.ship.slug if self.ship else None,
            "stage_reached": self.stage_reached,
            "score": self.score,
            "enemies_destroyed": self.enemies_destroyed,
            "bosses_defeated": self.bosses_defeated,
            "victory": self.victory,
            "created_at": self.created_at.isoformat()
        }
