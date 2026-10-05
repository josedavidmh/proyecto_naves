import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.database import db
from backend.routes.auth_routes import auth_bp
from backend.routes.game_routes import game_bp
from backend.models.user import User
from backend.models.ship import Ship
from backend.models.progress import PlayerProgress
from backend.models.score import GameScore

def create_app(config_override: dict = None) -> Flask:
    # Definir carpetas de frontend estático
    project_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_dir, "frontend")

    app = Flask(__name__, static_folder=frontend_dir, static_url_path="")
    app.config.from_object(Config)

    # Permitir sobreescribir configuración (ej. pruebas unitarias en memoria)
    if config_override:
        app.config.update(config_override)

    # Configuración de CORS para permitir consumo seguro de APIs
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar Base de Datos SQLite con SQLAlchemy
    db.init_app(app)

    # Registrar Rutas de la API
    app.register_blueprint(auth_bp)
    app.register_blueprint(game_bp)

    # Crear tablas y sembrar naves iniciales en SQLite
    with app.app_context():
        db.create_all()
        Ship.seed_default_ships()

    # Rutas para servir la aplicación Frontend
    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:path>")
    def static_files(path):
        return send_from_directory(app.static_folder, path)

    # Endpoint de chequeo de salud del sistema
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {
            "success": True,
            "status": "online",
            "service": "Space Assault API - Arquitectura Pro",
            "database": "SQLite (SQLAlchemy)",
            "auth": "JWT HS256"
        }, 200

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    print(f"[*] Iniciando Servidor de Producción/Dev en http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
