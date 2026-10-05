import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde .env
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_change_in_production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_jwt_secret_key_change_in_production")
    
    # Base de datos SQLite real persistida en archivo local con ruta canónica posix
    db_filename = os.getenv("DATABASE_URL", "sqlite:///game.db").replace("sqlite:///", "")
    db_abs_path = (BASE_DIR / db_filename).resolve().as_posix()
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_abs_path}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Tiempo de expiración del token JWT (en horas)
    JWT_EXPIRATION_HOURS = 24
