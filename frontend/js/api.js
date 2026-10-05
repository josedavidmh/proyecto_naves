/**
 * Capa de Comunicación con la API Real (Flask + SQLAlchemy)
 * CERO MOCKS: Todas las solicitudes viajan al backend y se validan contra SQLite.
 */

const API_BASE_URL = (window.location.protocol === "file:" || (window.location.port && window.location.port !== "5000"))
  ? "http://127.0.0.1:5000"
  : window.location.origin;

export const ApiService = {
  // Almacenamiento seguro del token JWT real emitido por el backend
  getToken() {
    return localStorage.getItem("naves_jwt_token");
  },

  setToken(token) {
    if (token) {
      localStorage.setItem("naves_jwt_token", token);
    } else {
      localStorage.removeItem("naves_jwt_token");
    }
  },

  clearToken() {
    localStorage.removeItem("naves_jwt_token");
  },

  /**
   * Helper para peticiones HTTP estandarizadas con manejo de cabeceras de autorización
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data
      };
    } catch (error) {
      console.error(`[Error de Conexión de Red] en ${endpoint}:`, error);
      return {
        ok: false,
        status: 0,
        data: {
          success: false,
          error: "No se pudo establecer conexión con el servidor de la nave. Verifique que Flask esté en ejecución."
        }
      };
    }
  },

  // Registro de nuevo piloto
  async register(username, email, password) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });
  },

  // Inicio de sesión
  async login(identifier, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    });
  },

  // Verificación de sesión activa y perfil del piloto (Ruta protegida JWT)
  async getProfile() {
    return this.request("/api/auth/me", {
      method: "GET"
    });
  },

  // Cambio de contraseña del piloto (Ruta protegida JWT)
  async changePassword(current_password, new_password) {
    return this.request("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password })
    });
  },

  // Chequeo de salud del backend
  async checkHealth() {
    return this.request("/api/health", {
      method: "GET"
    });
  },

  // Obtener catálogo de las 5 naves de combate
  async getShips() {
    return this.request("/api/game/ships", {
      method: "GET"
    });
  },

  // Obtener detalle de una nave
  async getShip(shipId) {
    return this.request(`/api/game/ships/${shipId}`, {
      method: "GET"
    });
  },

  // Obtener estado de avance en las 5 fases (Requiere JWT)
  async getProgress() {
    return this.request("/api/game/progress", {
      method: "GET"
    });
  },

  // Desbloquear siguiente fase tras victoria legal (Requiere JWT)
  async completeStage(stageNumber) {
    return this.request("/api/game/progress/complete-stage", {
      method: "POST",
      body: JSON.stringify({ stage_number: stageNumber })
    });
  },

  // Asentar puntuación en SQLite (Requiere JWT)
  async submitScore(scoreData) {
    return this.request("/api/game/scores", {
      method: "POST",
      body: JSON.stringify(scoreData)
    });
  },

  // Obtener el Top de la tabla de clasificación mundial
  async getLeaderboard(limit = 10) {
    return this.request(`/api/game/leaderboard?limit=${limit}`, {
      method: "GET"
    });
  },

  // Obtener historial de combate y estadísticas personales del piloto (Requiere JWT)
  async getMyStats() {
    return this.request("/api/game/stats/me", {
      method: "GET"
    });
  }
};
