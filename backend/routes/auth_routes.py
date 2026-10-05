from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, current_app
import jwt
import re
from sqlalchemy import func
from backend.database import db
from backend.models.user import User
from backend.utils.auth_guard import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

def generate_jwt_token(user_id: int) -> str:
    """Genera un token JWT firmado válido por las horas configuradas."""
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(hours=current_app.config["JWT_EXPIRATION_HOURS"])
    payload = {
        "sub": str(user_id),
        "exp": expiration,
        "iat": now
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Cuerpo de solicitud JSON requerido."}), 400

    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    # Validaciones rigurosas de piloto y clave
    if not username or len(username) < 3:
        return jsonify({"success": False, "error": "El nombre de piloto debe tener al menos 3 caracteres."}), 400

    # Si no ingresó correo, generar frecuencia de radio táctica por defecto
    if not email:
        clean_user = re.sub(r"[^a-zA-Z0-9_]", "", username).lower() or "piloto"
        email = f"{clean_user}@naves.space"
    elif not re.match(EMAIL_REGEX, email):
        return jsonify({"success": False, "error": "Debe proporcionar un correo electrónico válido."}), 400

    if not password or len(password) < 6:
        return jsonify({"success": False, "error": "La contraseña debe tener un mínimo de 6 caracteres."}), 400

    # Comprobar unicidad en SQLite (insensible a mayúsculas/minúsculas)
    if User.query.filter(func.lower(User.username) == username.lower()).first():
        return jsonify({"success": False, "error": f"El nombre de piloto '{username}' ya está en uso."}), 409

    if User.query.filter(func.lower(User.email) == email.lower()).first():
        return jsonify({"success": False, "error": f"El correo '{email}' ya está registrado."}), 409

    try:
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # Asignar progreso inicial al piloto
        from backend.models.progress import PlayerProgress
        if not PlayerProgress.query.filter_by(user_id=new_user.id).first():
            prog = PlayerProgress(user_id=new_user.id)
            db.session.add(prog)
            db.session.commit()

        # Guardar en archivo JSON de respaldo para persistencia ante reinicios
        User.save_backup()

        token = generate_jwt_token(new_user.id)

        return jsonify({
            "success": True,
            "message": f"Piloto '{username}' registrado exitosamente en el hangar.",
            "token": token,
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Error interno al registrar usuario: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Cuerpo de solicitud JSON requerido."}), 400

    identifier = str(data.get("identifier", "")).strip()
    password = str(data.get("password", "")).strip()

    if not identifier or not password:
        return jsonify({"success": False, "error": "Debe ingresar piloto/correo y contraseña."}), 400

    try:
        # Permitir inicio de sesión insensible a mayúsculas con username o correo
        user = User.query.filter(
            (func.lower(User.username) == identifier.lower()) | 
            (func.lower(User.email) == identifier.lower())
        ).first()

        # Distinción precisa: si no existe vs contraseña errónea
        if not user:
            return jsonify({
                "success": False,
                "error": f"El piloto '{identifier}' no existe en la base de datos de la flota. Ve a la pestaña 'Alistamiento de Piloto' para darte de alta."
            }), 404

        if not user.check_password(password):
            return jsonify({
                "success": False,
                "error": f"Contraseña incorrecta para el piloto '{user.username}'. Verifique su clave de acceso."
            }), 401

        token = generate_jwt_token(user.id)

        return jsonify({
            "success": True,
            "message": f"Autenticación concedida. Bienvenido al Hangar, Piloto {user.username}.",
            "token": token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Error interno en autenticación: {str(e)}"}), 500

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """
    Permite restablecer la contraseña validando la combinación de indicativo
    de piloto y correo registrado.
    """
    data = request.get_json() or {}
    identifier = str(data.get("identifier", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    new_password = str(data.get("new_password", "")).strip()

    if not identifier or not email or not new_password:
        return jsonify({
            "success": False,
            "error": "Debe proporcionar indicativo de piloto, correo registrado y la nueva contraseña."
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "success": False,
            "error": "La nueva contraseña debe tener al menos 6 caracteres."
        }), 400

    user = User.query.filter(
        (func.lower(User.username) == identifier.lower()) &
        (func.lower(User.email) == email.lower())
    ).first()

    if not user:
        return jsonify({
            "success": False,
            "error": "Los datos no coinciden: Verifique su indicativo de piloto y correo registrado."
        }), 404

    try:
        user.set_password(new_password)
        db.session.commit()
        User.save_backup()

        return jsonify({
            "success": True,
            "message": f"Contraseña actualizada exitosamente para '{user.username}'. Ya puedes iniciar sesión con tu nueva clave."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Error al restablecer la contraseña: {str(e)}"}), 500

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user: User):
    """Devuelve el perfil del usuario autenticado a través del token JWT."""
    return jsonify({
        "success": True,
        "user": current_user.to_dict()
    }), 200

@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password(current_user: User):
    """Permite al usuario autenticado cambiar su contraseña."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Cuerpo de solicitud JSON requerido."}), 400

    current_password = data.get("current_password", "").strip()
    new_password = data.get("new_password", "").strip()

    if not current_password or not new_password:
        return jsonify({
            "success": False,
            "error": "Debe proporcionar la 'contraseña actual' y la 'nueva contraseña'."
        }), 400

    if not current_user.check_password(current_password):
        return jsonify({
            "success": False,
            "error": "La contraseña actual introducida no es correcta."
        }), 401

    if len(new_password) < 6:
        return jsonify({
            "success": False,
            "error": "La nueva contraseña debe tener al menos 6 caracteres."
        }), 400

    if current_password == new_password:
        return jsonify({
            "success": False,
            "error": "La nueva contraseña no puede ser idéntica a la anterior."
        }), 400

    current_user.set_password(new_password)
    db.session.commit()
    User.save_backup()

    return jsonify({
        "success": True,
        "message": "Contraseña de acceso actualizada con éxito."
    }), 200

@auth_bp.route("/delete-account", methods=["POST", "DELETE"])
@token_required
def delete_account(current_user: User):
    """
    Permite al usuario autenticado darse de baja voluntariamente.
    Elimina su cuenta, progresos y marcas solo previa confirmación de contraseña.
    """
    data = request.get_json() or {}
    password = data.get("password", "").strip()
    if not password:
        return jsonify({
            "success": False,
            "error": "Debe ingresar su contraseña para confirmar la baja voluntaria de su cuenta."
        }), 400

    if not current_user.check_password(password):
        return jsonify({
            "success": False,
            "error": "Contraseña incorrecta. Operación de baja cancelada por seguridad."
        }), 401

    try:
        username = current_user.username
        from backend.models.score import GameScore
        from backend.models.progress import PlayerProgress

        GameScore.query.filter_by(user_id=current_user.id).delete()
        PlayerProgress.query.filter_by(user_id=current_user.id).delete()
        db.session.delete(current_user)
        db.session.commit()

        User.save_backup()

        return jsonify({
            "success": True,
            "message": f"La cuenta del piloto '{username}' ha sido dada de baja satisfactoriamente de la flota."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Error al procesar la baja de usuario: {str(e)}"}), 500

