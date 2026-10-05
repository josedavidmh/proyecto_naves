from backend.database import db

class Ship(db.Model):
    __tablename__ = "ships"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    
    # Atributos de Disparo Característico
    primary_weapon_name = db.Column(db.String(100), nullable=False)
    primary_weapon_type = db.Column(db.String(50), nullable=False)
    primary_weapon_damage = db.Column(db.Integer, nullable=False, default=15)
    fire_rate_ms = db.Column(db.Integer, nullable=False, default=150)
    
    # Atributos de Habilidad Especial
    special_ability_name = db.Column(db.String(100), nullable=False)
    special_ability_slug = db.Column(db.String(50), nullable=False)
    special_duration_seconds = db.Column(db.Float, nullable=False, default=5.0)
    special_cooldown_seconds = db.Column(db.Float, nullable=False, default=20.0)
    
    # Estadísticas de Supervivencia y Movilidad
    max_health = db.Column(db.Integer, nullable=False, default=100)
    speed = db.Column(db.Float, nullable=False, default=6.0)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "description": self.description,
            "weapon": {
                "name": self.primary_weapon_name,
                "type": self.primary_weapon_type,
                "damage": self.primary_weapon_damage,
                "fire_rate_ms": self.fire_rate_ms
            },
            "special": {
                "name": self.special_ability_name,
                "slug": self.special_ability_slug,
                "duration_seconds": self.special_duration_seconds,
                "cooldown_seconds": self.special_cooldown_seconds
            },
            "stats": {
                "max_health": self.max_health,
                "speed": self.speed
            }
        }

    @classmethod
    def seed_default_ships(cls):
        """Siembra en SQLite las 5 naves únicas especificadas en el diseño del juego."""
        if cls.query.first():
            return

        default_ships = [
            cls(
                slug="phoenix-vanguard",
                name="Phoenix Vanguard",
                description="Caza interceptor de alta maniobrabilidad con disparo láser doble sincronizado.",
                primary_weapon_name="Doble Láser de Iones",
                primary_weapon_type="twin_laser",
                primary_weapon_damage=18,
                fire_rate_ms=130,
                special_ability_name="Escudo Cinético de Absorción",
                special_ability_slug="shield_matrix",
                special_duration_seconds=5.0,
                special_cooldown_seconds=18.0,
                max_health=100,
                speed=7.5
            ),
            cls(
                slug="titan-colossus",
                name="Titan Colossus",
                description="Nave pesada acorazada con cañón de plasma concentrado y tremenda resistencia.",
                primary_weapon_name="Cañón de Plasma Pesado",
                primary_weapon_type="heavy_plasma",
                primary_weapon_damage=42,
                fire_rate_ms=260,
                special_ability_name="Pulso Sísmico de Choque (EMP)",
                special_ability_slug="emp_blast",
                special_duration_seconds=3.0,
                special_cooldown_seconds=24.0,
                max_health=180,
                speed=5.0
            ),
            cls(
                slug="valkyrie-specter",
                name="Valkyrie Specter",
                description="Fragata de asalto táctico con ráfaga en cono triple para barrer oleadas de cazas.",
                primary_weapon_name="Tridente de Dispersión Cónica",
                primary_weapon_type="triple_spread",
                primary_weapon_damage=14,
                fire_rate_ms=160,
                special_ability_name="Modo Espectro y Sobrecarga Crítica",
                special_ability_slug="overdrive_ghost",
                special_duration_seconds=4.5,
                special_cooldown_seconds=20.0,
                max_health=110,
                speed=6.5
            ),
            cls(
                slug="vortex-tempest",
                name="Vortex Tempest",
                description="Prototipo experimental equipado con cañones de ondas sonoras que penetran blindajes.",
                primary_weapon_name="Emisor de Ondas Resonantes",
                primary_weapon_type="wave_cannon",
                primary_weapon_damage=28,
                fire_rate_ms=210,
                special_ability_name="Enjambre de Micro-Misiles Rastreadores",
                special_ability_slug="micromissile_swarm",
                special_duration_seconds=5.5,
                special_cooldown_seconds=22.0,
                max_health=120,
                speed=6.2
            ),
            cls(
                slug="hyperion-dreadnought",
                name="Hyperion Apex",
                description="Buque insignia de supremacía con haz de plasma focalizado continuo y devastador.",
                primary_weapon_name="Haz Focal de Fotones",
                primary_weapon_type="beam_laser",
                primary_weapon_damage=36,
                fire_rate_ms=180,
                special_ability_name="Bombardeo Suborbital Masivo",
                special_ability_slug="orbital_bombardment",
                special_duration_seconds=4.0,
                special_cooldown_seconds=28.0,
                max_health=140,
                speed=5.8
            )
        ]

        db.session.add_all(default_ships)
        db.session.commit()
