import os
from flask import Flask, send_from_directory, request
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

    # Crear tablas, sembrar naves iniciales y restaurar usuarios persistentes
    with app.app_context():
        db.create_all()
        Ship.seed_default_ships()
        User.restore_backup_if_empty()

    # Rutas para servir la aplicación Frontend
    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:path>")
    def static_files(path):
        return send_from_directory(app.static_folder, path)

    @app.after_request
    def set_cache_headers(response):
        if request.path.endswith((".js", ".css", ".html")) or request.path == "/":
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response

    # Endpoint de chequeo de salud del sistema
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_engine_str = str(db.engine.url)
        is_postgres = "postgresql" in db_engine_str
        raw_db_env = (os.getenv("DATABASE_URL") or os.getenv("INTERNAL_DATABASE_URL") or "").strip().strip('"').strip("'")
        detected_keys = [k for k in os.environ.keys() if any(term in k.upper() for term in ["DATA", "POSTGRES", "DB", "SQL"])]
        
        # Diagnóstico seguro: solo muestra el prefijo y esquema sin credenciales
        scheme = raw_db_env.split("://")[0] if "://" in raw_db_env else ("vacio" if not raw_db_env else "sin_protocolo")
        prefix = raw_db_env[:14] if raw_db_env else "vacio"

        return {
            "success": True,
            "status": "online",
            "service": "Space Assault API - Arquitectura Pro",
            "database": "PostgreSQL (SQLAlchemy)" if is_postgres else "SQLite (SQLAlchemy)",
            "database_engine": "PostgreSQL" if is_postgres else "SQLite",
            "database_url_scheme": scheme,
            "database_url_prefix": prefix,
            "database_url_length": len(raw_db_env),
            "detected_env_db_keys": detected_keys,
            "auth": "JWT HS256"
        }, 200

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    print(f"[*] Iniciando Servidor de Producción/Dev en http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
