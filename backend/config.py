import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde .env
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_change_in_production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_jwt_secret_key_change_in_production")
    
    # Soporte para PostgreSQL (ej. Render Database) o SQLite local
    raw_db_url = (
        os.getenv("DATABASE_URL") or 
        os.getenv("INTERNAL_DATABASE_URL") or 
        os.getenv("POSTGRES_URL") or 
        os.getenv("POSTGRESQL_URL") or 
        os.getenv("DB_URL") or 
        "sqlite:///game.db"
    ).strip().strip('"').strip("'")

    if raw_db_url.startswith("postgres://"):
        # Render provee URLs que inician con postgres://, SQLAlchemy 2.0 requiere postgresql://
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
        
    if raw_db_url.startswith("postgresql://") or raw_db_url.startswith("postgresql+psycopg2://"):
        SQLALCHEMY_DATABASE_URI = raw_db_url
    else:
        db_filename = raw_db_url.replace("sqlite:///", "")
        db_abs_path = (BASE_DIR / db_filename).resolve().as_posix()
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_abs_path}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Tiempo de expiración del token JWT (en horas)
    JWT_EXPIRATION_HOURS = 24
