from flask import Blueprint, request, jsonify
from backend.database import db
from backend.models.user import User
from backend.models.ship import Ship
from backend.models.progress import PlayerProgress
from backend.models.score import GameScore
from backend.utils.auth_guard import token_required

game_bp = Blueprint("game", __name__, url_prefix="/api/game")

@game_bp.route("/ships", methods=["GET"])
def get_ships():
    """Devuelve el catálogo completo de las 5 naves del juego con especificaciones de combate."""
    Ship.seed_default_ships()
    ships = Ship.query.order_by(Ship.id.asc()).all()
    return jsonify({
        "success": True,
        "count": len(ships),
        "ships": [ship.to_dict() for ship in ships]
    }), 200

@game_bp.route("/ships/<int:ship_id>", methods=["GET"])
def get_ship_by_id(ship_id: int):
    """Devuelve los detalles de una nave específica."""
    ship = db.session.get(Ship, ship_id)
    if not ship:
        return jsonify({
            "success": False,
            "error": f"Nave de combate con id {ship_id} no encontrada."
        }), 404

    return jsonify({
        "success": True,
        "ship": ship.to_dict()
    }), 200

@game_bp.route("/progress", methods=["GET"])
@token_required
def get_progress(current_user: User):
    """Obtiene el estado de avance en las 5 fases para el piloto en sesión."""
    progress = PlayerProgress.query.filter_by(user_id=current_user.id).first()

    # Si es la primera vez que ingresa, inicializamos su registro con Fase 1 desbloqueada
    if not progress:
        progress = PlayerProgress(user_id=current_user.id)
        db.session.add(progress)
        db.session.commit()

    return jsonify({
        "success": True,
        "progress": progress.to_dict()
    }), 200

@game_bp.route("/progress/complete-stage", methods=["POST"])
@token_required
def complete_stage(current_user: User):
    """
    Registra la superación de una fase y desbloquea estrictamente la siguiente.
    Exige haber desbloqueado y jugado la fase correspondiente.
    """
    data = request.get_json()
    if not data or "stage_number" not in data:
        return jsonify({
            "success": False,
            "error": "Debe especificar el número de fase completada ('stage_number')."
        }), 400

    try:
        stage_number = int(data["stage_number"])
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "El parámetro 'stage_number' debe ser un número entero entre 1 y 5."
        }), 400

    if not (1 <= stage_number <= 5):
        return jsonify({
            "success": False,
            "error": "El número de fase debe estar comprendido entre 1 y 5."
        }), 400

    progress = PlayerProgress.query.filter_by(user_id=current_user.id).first()
    if not progress:
        progress = PlayerProgress(user_id=current_user.id)
        db.session.add(progress)
        db.session.commit()

    # Verificar que el usuario tenía la fase desbloqueada
    if not progress.is_stage_unlocked(stage_number):
        return jsonify({
            "success": False,
            "error": f"Operación denegada: No puedes completar la Fase {stage_number} porque aún no ha sido desbloqueada."
        }), 403

    unlocked = progress.complete_stage(stage_number)
    if not unlocked:
        return jsonify({
            "success": False,
            "error": "No se pudo registrar la fase completada."
        }), 400

    db.session.commit()
    User.save_backup()

    next_stage = stage_number + 1 if stage_number < 5 else None
    return jsonify({
        "success": True,
        "message": f"¡Fase {stage_number} superada con éxito!",
        "unlocked_next_stage": next_stage,
        "progress": progress.to_dict()
    }), 200

@game_bp.route("/scores", methods=["POST"])
@token_required
def submit_score(current_user: User):
    """Registra en SQLite la puntuación y estadísticas finales de una partida."""
    data = request.get_json()
    if not data:
        return jsonify({
            "success": False,
            "error": "Cuerpo de solicitud JSON requerido."
        }), 400

    ship_id = data.get("ship_id")
    stage_reached = data.get("stage_reached", 1)
    score = data.get("score")
    enemies_destroyed = data.get("enemies_destroyed", 0)
    bosses_defeated = data.get("bosses_defeated", 0)
    victory = bool(data.get("victory", False))

    if score is None or not isinstance(score, int) or score < 0:
        return jsonify({
            "success": False,
            "error": "La puntuación ('score') debe ser un entero positivo o cero."
        }), 400

    if not ship_id or not db.session.get(Ship, ship_id):
        return jsonify({
            "success": False,
            "error": "Debe especificar un 'ship_id' válido correspondiente a una nave de combate existente."
        }), 404

    try:
        stage_reached = int(stage_reached)
        if not (1 <= stage_reached <= 5):
            stage_reached = 1
    except (ValueError, TypeError):
        stage_reached = 1

    score_record = GameScore(
        user_id=current_user.id,
        ship_id=ship_id,
        stage_reached=stage_reached,
        score=score,
        enemies_destroyed=max(0, int(enemies_destroyed)),
        bosses_defeated=max(0, int(bosses_defeated)),
        victory=victory
    )

    db.session.add(score_record)
    db.session.commit()
    User.save_backup()

    return jsonify({
        "success": True,
        "message": "Puntuación de combate asentada en el registro central.",
        "record": score_record.to_dict()
    }), 201

@game_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    """Devuelve el Top 10 histórico global de pilotos con mayores puntuaciones."""
    limit = min(50, max(1, request.args.get("limit", default=10, type=int)))

    top_scores = GameScore.query.order_by(GameScore.score.desc()).limit(limit).all()

    return jsonify({
        "success": True,
        "total": len(top_scores),
        "leaderboard": [score.to_dict() for score in top_scores]
    }), 200

@game_bp.route("/stats/me", methods=["GET"])
@token_required
def get_my_stats(current_user: User):
    """Devuelve las estadísticas acumuladas de combate del piloto autenticado en SQLite."""
    scores = GameScore.query.filter_by(user_id=current_user.id).all()

    total_missions = len(scores)
    best_score = max([s.score for s in scores], default=0)
    total_enemies = sum([s.enemies_destroyed for s in scores])
    total_bosses = sum([s.bosses_defeated for s in scores])
    victories = sum([1 for s in scores if s.victory])
    max_stage = max([s.stage_reached for s in scores], default=1)

    return jsonify({
        "success": True,
        "stats": {
            "pilot": current_user.username,
            "total_missions": total_missions,
            "best_score": best_score,
            "total_enemies_destroyed": total_enemies,
            "total_bosses_defeated": total_bosses,
            "victories": victories,
            "max_stage_reached": max_stage
        }
    }), 200
