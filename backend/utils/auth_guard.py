from functools import wraps
from flask import request, jsonify, current_app
import jwt
from backend.database import db
from backend.models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]

        if not token:
            return jsonify({
                "success": False,
                "error": "Acceso denegado: Token de autorización ausente o inválido."
            }), 401

        try:
            payload = jwt.decode(
                token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"]
            )
            user_id = int(payload["sub"])
            current_user = db.session.get(User, user_id)
            if not current_user:
                return jsonify({
                    "success": False,
                    "error": "Usuario asociado al token no encontrado."
                }), 401
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "El token ha expirado. Por favor inicia sesión nuevamente."
            }), 401
        except (jwt.InvalidTokenError, Exception) as e:
            return jsonify({
                "success": False,
                "error": f"Token inválido o corrupto: {str(e)}"
            }), 401

        return f(current_user, *args, **kwargs)

    return decorated
