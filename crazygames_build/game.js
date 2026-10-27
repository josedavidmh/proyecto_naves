(() => {
  // frontend/js/api.js
  var isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:");
  var API_BASE_URL = isLocalhost ? "http://127.0.0.1:5000" : "https://space-assault.onrender.com";
  var ApiService = {
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
        ...options.headers || {}
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
        console.error(`[Error de Conexi\xF3n de Red] en ${endpoint}:`, error);
        return {
          ok: false,
          status: 0,
          data: {
            success: false,
            error: "No se pudo establecer conexi\xF3n con el servidor de la nave. Verifique que Flask est\xE9 en ejecuci\xF3n."
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
    // Restablecer contraseña olvidada (indicativo + correo registrado)
    async resetPassword(identifier, email, new_password) {
      return this.request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ identifier, email, new_password })
      });
    },
    // Darse de baja voluntariamente de la flota (Ruta protegida JWT con confirmación)
    async deleteAccount(password) {
      return this.request("/api/auth/delete-account", {
        method: "POST",
        body: JSON.stringify({ password })
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
    // Reiniciar campaña a Fase 1 tras agotar todas las vidas
    async resetRun() {
      return this.request("/api/game/progress/reset-run", {
        method: "POST"
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

  // frontend/js/auth.js
  document.addEventListener("DOMContentLoaded", () => {
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authContainer = document.getElementById("auth-container");
    const lobbyContainer = document.getElementById("lobby-container");
    const alertBox = document.getElementById("alert-box");
    const alertMessage = document.getElementById("alert-message");
    const pilotNameEl = document.getElementById("pilot-name");
    const pilotEmailEl = document.getElementById("pilot-email");
    const pilotJoinedEl = document.getElementById("pilot-joined");
    const btnLogout = document.getElementById("btn-logout");
    const btnVerifySession = document.getElementById("btn-verify-session");
    const verifyResultEl = document.getElementById("verify-result");
    const serverStatusBadge = document.getElementById("server-status-badge");
    function showAlert(message, type = "error") {
      alertBox.classList.remove("hidden", "alert-error", "alert-success");
      if (type === "success") {
        alertBox.classList.add("alert-success");
      } else {
        alertBox.classList.add("alert-error");
      }
      alertMessage.textContent = message;
    }
    function hideAlert() {
      alertBox.classList.add("hidden");
    }
    function switchToLogin() {
      hideAlert();
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      formLogin.classList.remove("hidden");
      formRegister.classList.add("hidden");
    }
    function switchToRegister(prefillUsername = "") {
      hideAlert();
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      formRegister.classList.remove("hidden");
      formLogin.classList.add("hidden");
      if (prefillUsername) {
        const regUserInput = document.getElementById("reg-username");
        if (regUserInput) regUserInput.value = prefillUsername;
      }
    }
    tabLogin.addEventListener("click", switchToLogin);
    tabRegister.addEventListener("click", () => switchToRegister());
    const linkGotoRegister = document.getElementById("link-goto-register");
    if (linkGotoRegister) {
      linkGotoRegister.addEventListener("click", () => {
        const currentLoginIdent = document.getElementById("login-identifier").value.trim();
        switchToRegister(currentLoginIdent);
      });
    }
    const linkGotoLogin = document.getElementById("link-goto-login");
    if (linkGotoLogin) {
      linkGotoLogin.addEventListener("click", switchToLogin);
    }
    function showAuthenticatedUI(user) {
      authContainer.classList.add("hidden");
      lobbyContainer.classList.remove("hidden");
      pilotNameEl.textContent = user.username.toUpperCase();
      pilotEmailEl.textContent = user.email;
      try {
        const date = new Date(user.created_at);
        pilotJoinedEl.textContent = date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch {
        pilotJoinedEl.textContent = user.created_at;
      }
      window.dispatchEvent(new CustomEvent("naves:user-logged-in", { detail: user }));
    }
    function showUnauthenticatedUI() {
      lobbyContainer.classList.add("hidden");
      authContainer.classList.remove("hidden");
      window.dispatchEvent(new CustomEvent("naves:user-logged-out"));
    }
    async function checkInitialSession() {
      const health = await ApiService.checkHealth();
      if (health.ok) {
        serverStatusBadge.textContent = "ONLINE [SQLITE LISTO]";
        serverStatusBadge.className = "badge-status";
      } else {
        serverStatusBadge.textContent = "OFFLINE [SIN CONEXI\xD3N]";
        serverStatusBadge.className = "badge-status";
        serverStatusBadge.style.borderColor = "#ef4444";
        serverStatusBadge.style.color = "#f87171";
      }
      const isExternalPortal = window.location.hostname.includes("crazygames") || window.location.hostname.includes("gamedistribution") || window.location.search.includes("cg=1") || window.location.search.includes("gd=1");
      if (isExternalPortal) {
        showAuthenticatedUI({
          id: 999,
          username: "Commander",
          email: "pilot@crazygames.com",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (btnLogout) btnLogout.style.display = "none";
        return;
      }
      const token = ApiService.getToken();
      if (!token) {
        showUnauthenticatedUI();
        return;
      }
      const res = await ApiService.getProfile();
      if (res.ok && res.data.success) {
        showAuthenticatedUI(res.data.user);
      } else {
        ApiService.clearToken();
        showUnauthenticatedUI();
      }
    }
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const identifier = document.getElementById("login-identifier").value.trim();
      const password = document.getElementById("login-password").value;
      const submitBtn = formLogin.querySelector("button[type='submit']");
      if (!identifier || !password) {
        showAlert("Por favor ingrese piloto y contrase\xF1a.");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "ACCEDIENDO AL HANGAR...";
      const res = await ApiService.login(identifier, password);
      submitBtn.disabled = false;
      submitBtn.textContent = "INICIAR MISI\xD3N (LOGIN)";
      if (res.ok && res.data.success) {
        ApiService.setToken(res.data.token);
        showAuthenticatedUI(res.data.user);
        formLogin.reset();
      } else {
        if (res.status === 404) {
          showAlert(`El piloto '${identifier}' no est\xE1 registrado en el hangar. Por favor haz clic en 'Alista tu nuevo piloto aqu\xED' para crearlo.`);
          const regUserInput = document.getElementById("reg-username");
          if (regUserInput) regUserInput.value = identifier;
        } else {
          showAlert(res.data.error || "Error al autenticar piloto.");
        }
      }
    });
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const username = document.getElementById("reg-username").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const passwordConfirm = document.getElementById("reg-password-confirm").value;
      const submitBtn = formRegister.querySelector("button[type='submit']");
      if (username.length < 3) {
        showAlert("El nombre del piloto debe tener al menos 3 caracteres.");
        return;
      }
      if (password.length < 6) {
        showAlert("La contrase\xF1a debe tener un m\xEDnimo de 6 caracteres.");
        return;
      }
      if (password !== passwordConfirm) {
        showAlert("Las contrase\xF1as no coinciden.");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "REGISTRANDO EN LA FLOTA...";
      const res = await ApiService.register(username, email, password);
      submitBtn.disabled = false;
      submitBtn.textContent = "COMPLETAR ALISTAMIENTO (CREAR PILOTO)";
      if (res.ok && res.data.success) {
        ApiService.setToken(res.data.token);
        showAuthenticatedUI(res.data.user);
        formRegister.reset();
      } else {
        showAlert(res.data.error || "Error al dar de alta el piloto.");
      }
    });
    const btnGuestPlay = document.getElementById("btn-guest-play");
    if (btnGuestPlay) {
      btnGuestPlay.addEventListener("click", () => {
        const guestUser = {
          id: 9999,
          username: "Piloto Cadete",
          email: "cadete@federacion.com",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        showAuthenticatedUI(guestUser);
        showAlert("Acceso concedido como Piloto Invitado. \xA1Bienvenido al Hangar!", "success");
      });
    }
    btnLogout.addEventListener("click", () => {
      ApiService.clearToken();
      showUnauthenticatedUI();
      showAlert("Has cerrado sesi\xF3n en el hangar de combate.", "success");
    });
    btnVerifySession.addEventListener("click", async () => {
      verifyResultEl.textContent = "Comprobando token criptogr\xE1fico en backend...";
      const res = await ApiService.getProfile();
      if (res.ok && res.data.success) {
        verifyResultEl.className = "text-xs font-mono text-emerald-400 mt-2 p-3 bg-black/60 rounded border border-emerald-500/50";
        verifyResultEl.textContent = `[VERIFICADO 200 OK] Token v\xE1lido. Usuario BD id=${res.data.user.id}, Piloto="${res.data.user.username}".`;
      } else {
        verifyResultEl.className = "text-xs font-mono text-red-400 mt-2 p-3 bg-black/60 rounded border border-red-500/50";
        verifyResultEl.textContent = `[FALL\xD3 401] ${res.data.error || "Token inv\xE1lido"}`;
      }
    });
    const btnOpenChangePassword = document.getElementById("btn-open-change-password");
    const changePasswordModal = document.getElementById("change-password-modal");
    const btnCloseChangePwd = document.getElementById("btn-close-change-pwd");
    const btnCancelChangePwd = document.getElementById("btn-cancel-change-pwd");
    const formChangePassword = document.getElementById("form-change-password");
    const changePwdAlert = document.getElementById("change-pwd-alert");
    function openChangePasswordModal() {
      if (!changePasswordModal) return;
      if (changePwdAlert) changePwdAlert.classList.add("hidden");
      if (formChangePassword) formChangePassword.reset();
      changePasswordModal.classList.remove("hidden");
    }
    function closeChangePasswordModal() {
      if (!changePasswordModal) return;
      changePasswordModal.classList.add("hidden");
    }
    if (btnOpenChangePassword) {
      btnOpenChangePassword.addEventListener("click", openChangePasswordModal);
    }
    if (btnCloseChangePwd) {
      btnCloseChangePwd.addEventListener("click", closeChangePasswordModal);
    }
    if (btnCancelChangePwd) {
      btnCancelChangePwd.addEventListener("click", closeChangePasswordModal);
    }
    if (formChangePassword) {
      formChangePassword.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currPwd = document.getElementById("input-curr-pwd").value.trim();
        const newPwd = document.getElementById("input-new-pwd").value.trim();
        const confirmPwd = document.getElementById("input-confirm-pwd").value.trim();
        const submitBtn = document.getElementById("btn-submit-change-pwd");
        if (newPwd !== confirmPwd) {
          changePwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          changePwdAlert.textContent = "Error: La nueva contrase\xF1a y la confirmaci\xF3n no coinciden.";
          changePwdAlert.classList.remove("hidden");
          return;
        }
        if (newPwd.length < 6) {
          changePwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          changePwdAlert.textContent = "Error: La nueva contrase\xF1a debe tener al menos 6 caracteres.";
          changePwdAlert.classList.remove("hidden");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "ACTUALIZANDO...";
        const res = await ApiService.changePassword(currPwd, newPwd);
        submitBtn.disabled = false;
        submitBtn.textContent = "ACTUALIZAR CLAVE \u2794";
        if (res.ok && res.data.success) {
          changePwdAlert.className = "p-2 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500";
          changePwdAlert.textContent = "\u2714 \xA1Contrase\xF1a actualizada con \xE9xito en SQLite!";
          changePwdAlert.classList.remove("hidden");
          setTimeout(() => {
            closeChangePasswordModal();
            showAlert("Contrase\xF1a de piloto actualizada exitosamente.", "success");
          }, 1200);
        } else {
          changePwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          changePwdAlert.textContent = res.data.error || "No se pudo actualizar la contrase\xF1a.";
          changePwdAlert.classList.remove("hidden");
        }
      });
    }
    const btnOpenDeleteAcc = document.getElementById("btn-open-delete-account");
    const deleteAccountModal = document.getElementById("delete-account-modal");
    const btnCloseDeleteAcc = document.getElementById("btn-close-delete-acc");
    const btnCancelDeleteAcc = document.getElementById("btn-cancel-delete-acc");
    const formDeleteAccount = document.getElementById("form-delete-account");
    const deleteAccAlert = document.getElementById("delete-acc-alert");
    function openDeleteAccountModal() {
      if (!deleteAccountModal) return;
      if (deleteAccAlert) deleteAccAlert.classList.add("hidden");
      if (formDeleteAccount) formDeleteAccount.reset();
      deleteAccountModal.classList.remove("hidden");
    }
    function closeDeleteAccountModal() {
      if (!deleteAccountModal) return;
      deleteAccountModal.classList.add("hidden");
    }
    if (btnOpenDeleteAcc) {
      btnOpenDeleteAcc.addEventListener("click", openDeleteAccountModal);
    }
    if (btnCloseDeleteAcc) {
      btnCloseDeleteAcc.addEventListener("click", closeDeleteAccountModal);
    }
    if (btnCancelDeleteAcc) {
      btnCancelDeleteAcc.addEventListener("click", closeDeleteAccountModal);
    }
    if (formDeleteAccount) {
      formDeleteAccount.addEventListener("submit", async (e) => {
        e.preventDefault();
        const password = document.getElementById("input-del-acc-pwd").value.trim();
        const submitBtn = document.getElementById("btn-submit-delete-acc");
        if (!password) {
          deleteAccAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          deleteAccAlert.textContent = "Error: Debes ingresar tu contrase\xF1a para confirmar.";
          deleteAccAlert.classList.remove("hidden");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "PROCESANDO BAJA...";
        const res = await ApiService.deleteAccount(password);
        submitBtn.disabled = false;
        submitBtn.textContent = "CONFIRMAR BAJA \u2715";
        if (res.ok && res.data.success) {
          deleteAccAlert.className = "p-2 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500";
          deleteAccAlert.textContent = "\u2714 Cuenta eliminada satisfactoriamente.";
          deleteAccAlert.classList.remove("hidden");
          setTimeout(() => {
            closeDeleteAccountModal();
            ApiService.clearToken();
            showUnauthenticatedUI();
            showAlert("Tu cuenta de piloto ha sido dada de baja de la flota.", "info");
          }, 1200);
        } else {
          deleteAccAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          deleteAccAlert.textContent = res.data.error || "No se pudo procesar la baja de usuario.";
          deleteAccAlert.classList.remove("hidden");
        }
      });
    }
    const linkOpenForgotPwd = document.getElementById("link-open-forgot-pwd");
    const forgotPasswordModal = document.getElementById("forgot-password-modal");
    const btnCloseForgotPwd = document.getElementById("btn-close-forgot-pwd");
    const btnCancelForgotPwd = document.getElementById("btn-cancel-forgot-pwd");
    const formForgotPassword = document.getElementById("form-forgot-password");
    const forgotPwdAlert = document.getElementById("forgot-pwd-alert");
    function openForgotPasswordModal() {
      if (!forgotPasswordModal) return;
      if (forgotPwdAlert) forgotPwdAlert.classList.add("hidden");
      if (formForgotPassword) formForgotPassword.reset();
      const loginUser = document.getElementById("login-identifier").value.trim();
      if (loginUser && document.getElementById("input-forgot-user")) {
        document.getElementById("input-forgot-user").value = loginUser;
      }
      forgotPasswordModal.classList.remove("hidden");
    }
    function closeForgotPasswordModal() {
      if (!forgotPasswordModal) return;
      forgotPasswordModal.classList.add("hidden");
    }
    if (linkOpenForgotPwd) {
      linkOpenForgotPwd.addEventListener("click", openForgotPasswordModal);
    }
    if (btnCloseForgotPwd) {
      btnCloseForgotPwd.addEventListener("click", closeForgotPasswordModal);
    }
    if (btnCancelForgotPwd) {
      btnCancelForgotPwd.addEventListener("click", closeForgotPasswordModal);
    }
    if (formForgotPassword) {
      formForgotPassword.addEventListener("submit", async (e) => {
        e.preventDefault();
        const identifier = document.getElementById("input-forgot-user").value.trim();
        const email = document.getElementById("input-forgot-email").value.trim();
        const newPwd = document.getElementById("input-forgot-newpwd").value.trim();
        const submitBtn = document.getElementById("btn-submit-forgot-pwd");
        if (newPwd.length < 6) {
          forgotPwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          forgotPwdAlert.textContent = "Error: La contrase\xF1a debe tener al menos 6 caracteres.";
          forgotPwdAlert.classList.remove("hidden");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "ACTUALIZANDO...";
        const res = await ApiService.resetPassword(identifier, email, newPwd);
        submitBtn.disabled = false;
        submitBtn.textContent = "GUARDAR CLAVE \u2794";
        if (res.ok && res.data.success) {
          forgotPwdAlert.className = "p-2 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500";
          forgotPwdAlert.textContent = "\u2714 Contrase\xF1a restablecida con \xE9xito.";
          forgotPwdAlert.classList.remove("hidden");
          setTimeout(() => {
            closeForgotPasswordModal();
            document.getElementById("login-identifier").value = identifier;
            document.getElementById("login-password").value = newPwd;
            showAlert("Contrase\xF1a actualizada. Ya puedes iniciar sesi\xF3n con tu clave.", "success");
          }, 1200);
        } else {
          forgotPwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
          forgotPwdAlert.textContent = res.data.error || "No se pudo restablecer la contrase\xF1a.";
          forgotPwdAlert.classList.remove("hidden");
        }
      });
    }
    checkInitialSession();
  });

  // frontend/js/sound_fx.js
  var SoundSystem = class {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.sfxGain = null;
      this.musicGain = null;
      this.isMuted = false;
      this.isMusicEnabled = true;
      this.musicPlaying = false;
      this.musicInterval = null;
      this.currentMusicStep = 0;
      this.initOnInteraction = this.initOnInteraction.bind(this);
      if (typeof window !== "undefined") {
        window.addEventListener("click", this.initOnInteraction, { once: true });
        window.addEventListener("keydown", this.initOnInteraction, { once: true });
      }
    }
    init() {
      if (this.ctx) return;
      if (typeof window === "undefined") return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      } catch (e) {
        console.warn("[Web Audio API no soportado o bloqueado]", e);
      }
    }
    initOnInteraction() {
      this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }
    ensureContext() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }
    setMute(mute) {
      this.isMuted = mute;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(mute ? 0 : 0.7, this.ctx.currentTime);
      }
    }
    toggleMute() {
      this.setMute(!this.isMuted);
      return this.isMuted;
    }
    setMusicEnabled(enabled) {
      this.isMusicEnabled = enabled;
      if (!enabled) {
        this.stopMusic();
      } else {
        this.startMusic();
      }
    }
    // --- EFECTOS DE SONIDO (SFX) ---
    // Disparo Láser Ligero (Phoenix Vanguard)
    playLaser() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, t2);
      osc.frequency.exponentialRampToValueAtTime(110, t2 + 0.12);
      gain.gain.setValueAtTime(0.25, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.12);
    }
    // Disparo Plasma Pesado (Titan Fortress)
    playHeavyShot() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, t2);
      osc.frequency.exponentialRampToValueAtTime(50, t2 + 0.22);
      gain.gain.setValueAtTime(0.45, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.22);
    }
    // Rayo de Iones Continuo (Quantum Phantom / Nebula Sorceress)
    playBeam() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, t2);
      osc.frequency.linearRampToValueAtTime(1400, t2 + 0.08);
      gain.gain.setValueAtTime(0.18, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.09);
    }
    // Explosión Normal (Enemigos estándar)
    playExplosion() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, t2);
      filter.frequency.exponentialRampToValueAtTime(40, t2 + 0.35);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t2);
      noise.stop(t2 + 0.35);
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(120, t2);
      bass.frequency.exponentialRampToValueAtTime(25, t2 + 0.35);
      bassGain.gain.setValueAtTime(0.6, t2);
      bassGain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.35);
      bass.connect(bassGain);
      bassGain.connect(this.sfxGain);
      bass.start(t2);
      bass.stop(t2 + 0.35);
    }
    // Gran Explosión de Boss
    playBossExplosion() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => this.playExplosion(), i * 180);
      }
    }
    // Sirena de Alerta de Boss Entrante
    playBossAlarm() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const startT = t2 + i * 0.45;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, startT);
        osc.frequency.linearRampToValueAtTime(780, startT + 0.25);
        osc.frequency.linearRampToValueAtTime(440, startT + 0.4);
        gain.gain.setValueAtTime(0.35, startT);
        gain.gain.exponentialRampToValueAtTime(0.01, startT + 0.42);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startT);
        osc.stop(startT + 0.42);
      }
    }
    // Activación de Habilidad Especial
    playSpecialAbility() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, t2);
      osc.frequency.exponentialRampToValueAtTime(1320, t2 + 0.45);
      gain.gain.setValueAtTime(0.4, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.5);
    }
    // Daño Recibido por el Jugador
    playPlayerDamage() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(160, t2);
      osc.frequency.linearRampToValueAtTime(70, t2 + 0.18);
      gain.gain.setValueAtTime(0.4, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.18);
    }
    // Fanfarria de Victoria
    playVictory() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
      const t2 = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t2 + idx * 0.12;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.45);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    }
    // Derrota (Game Over)
    playGameOver() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const notes = [311.13, 293.66, 277.18, 246.94];
      const t2 = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t2 + idx * 0.28;
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.55);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.55);
      });
    }
    // Recoger Reparación de Casco
    playPowerUpHealth() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t2 + idx * 0.06;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    }
    // Recoger Recarga Especial
    playPowerUpSpecial() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(350, t2);
      osc.frequency.exponentialRampToValueAtTime(1400, t2 + 0.25);
      gain.gain.setValueAtTime(0.3, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.28);
    }
    // Recoger Cristal de Puntuación
    playPowerUpScore() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      [880, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t2 + idx * 0.05;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.15);
      });
    }
    // Alarma de Salud Crítica (< 25% HP)
    playCriticalAlarm() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(800, t2);
      osc.frequency.setValueAtTime(600, t2 + 0.08);
      gain.gain.setValueAtTime(0.18, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.16);
    }
    // Recoger Mejora de Armas (Weapon Upgrade)
    playWeaponUpgrade() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t2 + idx * 0.055;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    }
    // Pérdida de Mejora tras dos golpes
    playWeaponDowngrade() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(420, t2);
      osc.frequency.exponentialRampToValueAtTime(120, t2 + 0.35);
      gain.gain.setValueAtTime(0.35, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.35);
    }
    // Recoger Cápsula de Bomba
    playBombPickup() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, t2);
      osc.frequency.exponentialRampToValueAtTime(660, t2 + 0.22);
      gain.gain.setValueAtTime(0.35, t2);
      gain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t2);
      osc.stop(t2 + 0.25);
    }
    // Detonación de Bomba Táctica en Pantalla
    playBombDetonation() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sawtooth";
      subOsc.frequency.setValueAtTime(140, t2);
      subOsc.frequency.exponentialRampToValueAtTime(25, t2 + 0.85);
      subGain.gain.setValueAtTime(0.65, t2);
      subGain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.9);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(t2);
      subOsc.stop(t2 + 0.9);
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, t2);
      filter.frequency.linearRampToValueAtTime(80, t2 + 0.7);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, t2);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.7);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t2);
      noise.stop(t2 + 0.7);
    }
    // Gran Premio de Boss
    playGrandPrize() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t2 + idx * 0.07;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    }
    // --- MÚSICA PROCEDURAL RETRO SYNTHWAVE ---
    startMusic() {
      if (!this.isMusicEnabled || this.musicPlaying) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.musicPlaying = true;
      this.currentMusicStep = 0;
      const bassline = [73.42, 73.42, 87.31, 87.31, 98, 98, 110, 130.81];
      const arpeggio = [293.66, 349.23, 440, 523.25, 440, 349.23, 293.66, 392];
      this.musicInterval = setInterval(() => {
        if (!this.musicPlaying || this.isMuted || !this.ctx) return;
        const t2 = this.ctx.currentTime;
        const step = this.currentMusicStep % 8;
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = "sawtooth";
        bassOsc.frequency.setValueAtTime(bassline[step], t2);
        bassGain.gain.setValueAtTime(0.18, t2);
        bassGain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.16);
        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = "lowpass";
        bassFilter.frequency.setValueAtTime(450, t2);
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(t2);
        bassOsc.stop(t2 + 0.16);
        if (step % 2 === 0) {
          const arpOsc = this.ctx.createOscillator();
          const arpGain = this.ctx.createGain();
          arpOsc.type = "sine";
          arpOsc.frequency.setValueAtTime(arpeggio[step], t2);
          arpGain.gain.setValueAtTime(0.12, t2);
          arpGain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.22);
          arpOsc.connect(arpGain);
          arpGain.connect(this.musicGain);
          arpOsc.start(t2);
          arpOsc.stop(t2 + 0.22);
        }
        if (step === 0 || step === 4) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = "sine";
          kickOsc.frequency.setValueAtTime(140, t2);
          kickOsc.frequency.exponentialRampToValueAtTime(35, t2 + 0.1);
          kickGain.gain.setValueAtTime(0.3, t2);
          kickGain.gain.exponentialRampToValueAtTime(0.01, t2 + 0.1);
          kickOsc.connect(kickGain);
          kickGain.connect(this.musicGain);
          kickOsc.start(t2);
          kickOsc.stop(t2 + 0.1);
        }
        this.currentMusicStep++;
      }, 180);
    }
    stopMusic() {
      this.musicPlaying = false;
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
    }
  };
  var Sound = new SoundSystem();
  if (typeof window !== "undefined") window.Sound = Sound;

  // frontend/js/enemies.js
  var EnemyCatalog = {
    // Definición de tipos de enemigos
    TYPES: {
      scout_interceptor: {
        type: "scout_interceptor",
        name: "Caza Interceptor Alfa",
        title: "Explorador Ligero de Vanguardia",
        introducedStage: 1,
        formidableLevel: 1,
        badge: "NIVEL 1 \xB7 B\xC1SICO",
        badgeColor: "#f97316",
        scoreValue: 180,
        width: 34,
        height: 34,
        color: "#f97316",
        accentColor: "#ef4444",
        abilityName: "L\xE1ser Cin\xE9tico Recto",
        abilityDesc: "R\xE1fagas est\xE1ndar lineales de velocidad constante. Carne de ca\xF1\xF3n b\xE1sica.",
        tacticalAdvice: "Maniobrable pero fr\xE1gil; destr\xFAyelo con fuego r\xE1pido continuo.",
        shootInterval: 1.8,
        baseHealth: 38
      },
      torpedo_frigate: {
        type: "torpedo_frigate",
        name: "Torpedero Abisal Nautilus",
        title: "Corbeta Pesada de Asalto Oce\xE1nico",
        introducedStage: 2,
        formidableLevel: 2,
        badge: "NIVEL 2 \xB7 INTERMEDIO",
        badgeColor: "#06b6d4",
        scoreValue: 360,
        width: 44,
        height: 40,
        color: "#06b6d4",
        accentColor: "#14b8a6",
        abilityName: "Torpedo Teledirigido Homing",
        abilityDesc: "Dispara torpedos pesados de plasma acu\xE1tico que corrigen su rumbo lateral buscando al jugador.",
        tacticalAdvice: "No te quedes quieto en el mismo carril horizontal; mu\xE9vete en diagonal para evadir el torpedo.",
        shootInterval: 2.2,
        baseHealth: 85
      },
      shield_warden: {
        type: "shield_warden",
        name: "Baluarte de Escudo Joviano",
        title: "Crucero Blindado de Defensa Orbital",
        introducedStage: 3,
        formidableLevel: 3,
        badge: "NIVEL 3 \xB7 FORMIDABLE",
        badgeColor: "#a855f7",
        scoreValue: 650,
        width: 50,
        height: 44,
        color: "#a855f7",
        accentColor: "#f59e0b",
        abilityName: "Matriz de Escudo Deflector + Pulso Dual",
        abilityDesc: "Protegido por una barrera de energ\xEDa de 80 HP que absorbe da\xF1o directo y dispara en \xE1ngulo de 30\xB0.",
        tacticalAdvice: "Concentra disparos pesados o habilidades especiales para colapsar su escudo protector.",
        shootInterval: 2.4,
        baseHealth: 135,
        shieldCapacity: 80
      },
      frost_phantom: {
        type: "frost_phantom",
        name: "Espectro Glacial Criog\xE9nico",
        title: "Interceptor Furtivo de Salto Espectral",
        introducedStage: 4,
        formidableLevel: 4,
        badge: "NIVEL 4 \xB7 MUY FORMIDABLE",
        badgeColor: "#38bdf8",
        scoreValue: 950,
        width: 40,
        height: 38,
        color: "#38bdf8",
        accentColor: "#e0f2fe",
        abilityName: "Salto Evasivo Criog\xE9nico & Agujas de Hielo",
        abilityDesc: "Teletransporte t\xE1ctico lateral al esquivar disparos y contraataque con abanico triple de agujas de hielo r\xE1pidas.",
        tacticalAdvice: "At\xE1calo con armas de dispersi\xF3n amplia o proyectiles teledirigidos para atraparlo tras su salto.",
        shootInterval: 2,
        baseHealth: 120
      },
      siege_dreadnought: {
        type: "siege_dreadnought",
        name: "Acorazado de Asedio Tit\xE1n Vektor",
        title: "Buque Insignia Dreadnought de Asedio",
        introducedStage: 5,
        formidableLevel: 5,
        badge: "NIVEL 5 \xB7 LETAL / SEMI-BOSS",
        badgeColor: "#e11d48",
        scoreValue: 1600,
        width: 64,
        height: 54,
        color: "#e11d48",
        accentColor: "#fbbf24",
        abilityName: "Salva Pesada Cu\xE1druple & Metralla Reactiva",
        abilityDesc: "Salvas devastadoras de 4 proyectiles y detonaci\xF3n en racimo de metralla en cruz al morir.",
        tacticalAdvice: "Objetivo de m\xE1xima prioridad. Al destruirlo, al\xE9jate inmediatamente para no ser alcanzado por su metralla.",
        shootInterval: 1.7,
        baseHealth: 260
      }
    },
    /**
     * Obtiene la lista de tipos de enemigos desbloqueados hasta la fase actual.
     * Fase 1: Solo Caza Alfa.
     * Fase 2: Caza Alfa + Torpedero.
     * Fase 3: Caza Alfa + Torpedero + Baluarte.
     * Fase 4: Caza Alfa + Torpedero + Baluarte + Espectro Glacial.
     * Fase 5: Flota completa combinada (los 5 tipos).
     */
    getAvailableTypes(stageNumber) {
      const stage = Math.max(1, Math.min(5, stageNumber || 1));
      const pool = ["scout_interceptor"];
      if (stage >= 2) pool.push("torpedo_frigate");
      if (stage >= 3) pool.push("shield_warden");
      if (stage >= 4) pool.push("frost_phantom");
      if (stage >= 5) pool.push("siege_dreadnought");
      return pool;
    },
    /**
     * Selección inteligente ponderada según la fase actual
     */
    getRandomType(stageNumber) {
      const stage = Math.max(1, Math.min(5, stageNumber || 1));
      const r = Math.random();
      switch (stage) {
        case 1:
          return "scout_interceptor";
        case 2:
          return r < 0.55 ? "scout_interceptor" : "torpedo_frigate";
        case 3:
          if (r < 0.4) return "scout_interceptor";
          if (r < 0.75) return "torpedo_frigate";
          return "shield_warden";
        case 4:
          if (r < 0.3) return "scout_interceptor";
          if (r < 0.55) return "torpedo_frigate";
          if (r < 0.8) return "shield_warden";
          return "frost_phantom";
        case 5:
        default:
          if (r < 0.24) return "scout_interceptor";
          if (r < 0.46) return "torpedo_frigate";
          if (r < 0.66) return "shield_warden";
          if (r < 0.84) return "frost_phantom";
          return "siege_dreadnought";
      }
    },
    /**
     * Crea una instancia de enemigo inicializada y equilibrada
     */
    createEnemy(stageNumber, canvasWidth) {
      const stage = Math.max(1, Math.min(5, stageNumber || 1));
      const typeKey = this.getRandomType(stage);
      const def = this.TYPES[typeKey];
      const margin = 40;
      const x = Math.random() * (canvasWidth - margin * 2) + margin;
      const y = -45;
      const stageScale = (stage - 1) * 8;
      const maxHp = def.baseHealth + stageScale;
      const enemy = {
        type: def.type,
        name: def.name,
        title: def.title,
        color: def.color,
        accentColor: def.accentColor,
        isBoss: false,
        scoreValue: def.scoreValue,
        formidableLevel: def.formidableLevel,
        isFormidable: def.formidableLevel >= 2,
        x,
        y,
        width: def.width,
        height: def.height,
        health: maxHp,
        maxHealth: maxHp,
        shootInterval: def.shootInterval + (Math.random() * 0.4 - 0.2),
        lastShotTime: Math.random() * 0.8,
        age: 0,
        // Atributos de movimiento
        vy: 2.2,
        vxAmp: 2.2,
        vx: 0,
        // Parámetros específicos de habilidades
        shield: def.shieldCapacity ? def.shieldCapacity : 0,
        maxShield: def.shieldCapacity ? def.shieldCapacity : 0,
        shieldGlow: 0,
        blinkTimer: 0,
        blinkGhost: null,
        isBlinking: false
      };
      switch (enemy.type) {
        case "scout_interceptor":
          enemy.vy = 2.4 + Math.random() * 1.2;
          enemy.vxAmp = 2.5;
          break;
        case "torpedo_frigate":
          enemy.vy = 1.9 + Math.random() * 0.8;
          enemy.vxAmp = 1.8;
          break;
        case "shield_warden":
          enemy.vy = 1.4 + Math.random() * 0.5;
          enemy.vxAmp = 1.2;
          break;
        case "frost_phantom":
          enemy.vy = 2.6 + Math.random() * 1;
          enemy.vxAmp = 3.5;
          enemy.blinkTimer = 1.8 + Math.random() * 0.8;
          break;
        case "siege_dreadnought":
          enemy.vy = 1.1 + Math.random() * 0.4;
          enemy.vxAmp = 1;
          break;
      }
      return enemy;
    },
    /**
     * Actualiza la IA y activa las habilidades de cada enemigo
     */
    updateEnemyAI(enemy, dt, player, enemyProjectiles, engine) {
      enemy.age += dt;
      enemy.lastShotTime = (enemy.lastShotTime || 0) + dt;
      if (enemy.blinkGhost) {
        enemy.blinkGhost.alpha -= dt * 2.5;
        if (enemy.blinkGhost.alpha <= 0) {
          enemy.blinkGhost = null;
        }
      }
      switch (enemy.type) {
        case "scout_interceptor":
          enemy.y += enemy.vy;
          enemy.x += Math.sin(enemy.y * 0.03) * enemy.vxAmp;
          break;
        case "torpedo_frigate":
          enemy.y += enemy.vy;
          enemy.x += Math.sin(enemy.age * 2) * (enemy.vxAmp * 0.9);
          break;
        case "shield_warden":
          enemy.y += enemy.vy;
          enemy.x += Math.cos(enemy.age * 1.4) * enemy.vxAmp;
          if (enemy.shield < enemy.maxShield && enemy.age > 4) {
            enemy.shield = Math.min(enemy.maxShield, enemy.shield + dt * 6);
          }
          break;
        case "frost_phantom":
          enemy.y += enemy.vy;
          enemy.x += Math.sin(enemy.age * 4) * enemy.vxAmp;
          enemy.blinkTimer -= dt;
          if (enemy.blinkTimer <= 0) {
            this.triggerCryoBlink(enemy, engine, enemyProjectiles);
            enemy.blinkTimer = 2.4 + Math.random() * 1.2;
          }
          break;
        case "siege_dreadnought":
          enemy.y += enemy.vy;
          enemy.x += Math.sin(enemy.age * 1) * (enemy.vxAmp * 0.8);
          break;
      }
      if (enemy.lastShotTime > enemy.shootInterval) {
        enemy.lastShotTime = 0;
        this.fireEnemyAbility(enemy, player, enemyProjectiles, engine);
      }
    },
    /**
     * Ejecuta el disparo o habilidad activa según el tipo de nave
     */
    fireEnemyAbility(enemy, player, enemyProjectiles, engine) {
      const midX = enemy.x;
      const midY = enemy.y + enemy.height * 0.5;
      switch (enemy.type) {
        case "scout_interceptor":
          enemyProjectiles.push({
            x: midX,
            y: midY,
            vx: 0,
            vy: 5.5,
            damage: 12,
            color: "#f97316",
            radius: 4.5,
            type: "kinetic"
          });
          break;
        case "torpedo_frigate":
          Sound.playHeavyShot();
          enemyProjectiles.push({
            x: midX,
            y: midY,
            vx: (Math.random() - 0.5) * 1.2,
            vy: 4.2,
            damage: 18,
            color: "#06b6d4",
            radius: 7,
            isHoming: true,
            type: "torpedo"
          });
          enemyProjectiles.push({
            x: midX - 14,
            y: midY - 6,
            vx: -1.2,
            vy: 5,
            damage: 10,
            color: "#14b8a6",
            radius: 3.5,
            type: "kinetic"
          });
          enemyProjectiles.push({
            x: midX + 14,
            y: midY - 6,
            vx: 1.2,
            vy: 5,
            damage: 10,
            color: "#14b8a6",
            radius: 3.5,
            type: "kinetic"
          });
          break;
        case "shield_warden":
          Sound.playBeam();
          enemyProjectiles.push({
            x: midX - 16,
            y: midY,
            vx: -1.8,
            vy: 4.8,
            damage: 16,
            color: "#a855f7",
            radius: 5.5,
            type: "plasma"
          });
          enemyProjectiles.push({
            x: midX + 16,
            y: midY,
            vx: 1.8,
            vy: 4.8,
            damage: 16,
            color: "#a855f7",
            radius: 5.5,
            type: "plasma"
          });
          break;
        case "frost_phantom":
          Sound.playLaser();
          [-2.4, 0, 2.4].forEach((vx) => {
            enemyProjectiles.push({
              x: midX,
              y: midY,
              vx,
              vy: 6.8,
              damage: 14,
              color: "#38bdf8",
              radius: 4,
              isFrost: true,
              type: "frost_needle"
            });
          });
          break;
        case "siege_dreadnought":
          Sound.playHeavyShot();
          [-2.6, -0.9, 0.9, 2.6].forEach((vx) => {
            enemyProjectiles.push({
              x: midX + vx * 6,
              y: midY,
              vx,
              vy: 5.6,
              damage: 22,
              color: "#e11d48",
              radius: 6,
              type: "heavy_plasma"
            });
          });
          break;
      }
    },
    /**
     * Habilidad Especial de Salto Espectral (Frost Phantom)
     */
    triggerCryoBlink(enemy, engine, enemyProjectiles) {
      if (enemy.isBoss) return;
      enemy.blinkGhost = {
        x: enemy.x,
        y: enemy.y,
        alpha: 0.8
      };
      if (engine && engine.createExplosionParticles) {
        engine.createExplosionParticles(enemy.x, enemy.y, "#38bdf8", 12);
      }
      const dir = enemy.x > engine.canvas.width / 2 ? -1 : 1;
      const jumpDist = (75 + Math.random() * 40) * dir;
      enemy.x = Math.max(40, Math.min(engine.canvas.width - 40, enemy.x + jumpDist));
      Sound.playLaser();
      if (enemyProjectiles) {
        [-2.2, 0, 2.2].forEach((vx) => {
          enemyProjectiles.push({
            x: enemy.x,
            y: enemy.y + enemy.height / 2,
            vx,
            vy: 7.2,
            damage: 14,
            color: "#38bdf8",
            radius: 4.2,
            isFrost: true,
            type: "frost_needle"
          });
        });
      }
      if (engine && engine.addFloatingText) {
        engine.addFloatingText(enemy.x, enemy.y - 12, "\xA1SALTO CRIOG\xC9NICO!", "#38bdf8");
      }
    },
    /**
     * Procesa daño recibido por un enemigo (gestiona escudos y esquivas reactivas)
     */
    handleDamage(enemy, rawDamage, engine, hitX, hitY) {
      let effectiveDamage = rawDamage;
      if (enemy.shield && enemy.shield > 0) {
        enemy.shieldGlow = 1;
        if (enemy.shield >= effectiveDamage) {
          enemy.shield -= effectiveDamage;
          effectiveDamage = 0;
          if (engine && engine.createHitSparks) {
            engine.createHitSparks(hitX, hitY, "#a855f7");
          }
        } else {
          effectiveDamage -= enemy.shield;
          enemy.shield = 0;
          Sound.playExplosion();
          if (engine && engine.addFloatingText) {
            engine.addFloatingText(enemy.x, enemy.y - 16, "\xA1ESCUDO COLAPSADO!", "#a855f7");
          }
          if (engine && engine.createExplosionParticles) {
            engine.createExplosionParticles(enemy.x, enemy.y, "#a855f7", 14);
          }
        }
      }
      if (enemy.type === "frost_phantom" && Math.random() < 0.4 && enemy.blinkTimer > 0.5) {
        this.triggerCryoBlink(enemy, engine, engine.enemyProjectiles);
        enemy.blinkTimer = 2.2;
      }
      if (effectiveDamage > 0) {
        enemy.health -= effectiveDamage;
        if (engine && engine.createHitSparks) {
          engine.createHitSparks(hitX, hitY, enemy.color || "#00f3ff");
        }
      }
      return effectiveDamage;
    },
    /**
     * Efectos especiales al destruir un enemigo según su tipo
     */
    handleDefeat(enemy, engine) {
      if (enemy.type === "siege_dreadnought") {
        Sound.playBossExplosion();
        if (engine && engine.enemyProjectiles) {
          [-2.8, 2.8].forEach((vx) => {
            [-1.5, 3.5].forEach((vy) => {
              engine.enemyProjectiles.push({
                x: enemy.x,
                y: enemy.y,
                vx,
                vy,
                damage: 10,
                radius: 4.5,
                color: "#fbbf24",
                type: "shrapnel"
              });
            });
          });
        }
        if (engine && engine.addFloatingText) {
          engine.addFloatingText(enemy.x, enemy.y - 20, "\xA1TIT\xC1N ERRADICADO! +1600", "#fbbf24");
        }
        if (Math.random() < 0.5 && engine && engine.spawnPowerup) {
          engine.spawnPowerup(enemy.x, enemy.y);
        }
      }
      if (enemy.type === "frost_phantom") {
        if (engine && engine.createExplosionParticles) {
          engine.createExplosionParticles(enemy.x, enemy.y, "#e0f2fe", 24);
          engine.createExplosionParticles(enemy.x, enemy.y, "#38bdf8", 16);
        }
        if (engine && engine.addFloatingText) {
          engine.addFloatingText(enemy.x, enemy.y, "CRYO-BURST", "#38bdf8");
        }
      }
      if (enemy.type === "shield_warden") {
        if (engine && engine.createExplosionParticles) {
          engine.createExplosionParticles(enemy.x, enemy.y, "#a855f7", 22);
        }
      }
    },
    /**
     * Renderizado Vectorial nítido de cada tipo de enemigo en Canvas 2D
     */
    drawEnemy(ctx, enemy) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      const halfW = enemy.width / 2;
      const halfH = enemy.height / 2;
      if (enemy.blinkGhost) {
        ctx.save();
        ctx.globalAlpha = enemy.blinkGhost.alpha * 0.45;
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(0, halfH);
        ctx.lineTo(halfW, -halfH);
        ctx.lineTo(0, -halfH * 0.4);
        ctx.lineTo(-halfW, -halfH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      switch (enemy.type) {
        case "scout_interceptor":
        default:
          ctx.fillStyle = "#1c1917";
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(0, halfH);
          ctx.lineTo(halfW, -halfH);
          ctx.lineTo(0, -halfH * 0.2);
          ctx.lineTo(-halfW, -halfH);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "torpedo_frigate":
          ctx.fillStyle = "#082f49";
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 2.2;
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 9;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.8);
          ctx.lineTo(halfW * 0.5, halfH * 0.3);
          ctx.lineTo(halfW, -halfH * 0.4);
          ctx.lineTo(halfW * 0.7, -halfH);
          ctx.lineTo(halfW * 0.2, -halfH * 0.6);
          ctx.lineTo(0, -halfH * 0.3);
          ctx.lineTo(-halfW * 0.2, -halfH * 0.6);
          ctx.lineTo(-halfW * 0.7, -halfH);
          ctx.lineTo(-halfW, -halfH * 0.4);
          ctx.lineTo(-halfW * 0.5, halfH * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#14b8a6";
          ctx.fillRect(-halfW * 0.8, -halfH * 0.2, 4, 12);
          ctx.fillRect(halfW * 0.8 - 4, -halfH * 0.2, 4, 12);
          ctx.fillStyle = "#22d3ee";
          ctx.beginPath();
          ctx.arc(0, 2, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "shield_warden":
          ctx.fillStyle = "#2e1065";
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, halfH);
          ctx.lineTo(halfW, halfH * 0.3);
          ctx.lineTo(halfW * 0.85, -halfH * 0.7);
          ctx.lineTo(0, -halfH);
          ctx.lineTo(-halfW * 0.85, -halfH * 0.7);
          ctx.lineTo(-halfW, halfH * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
          if (enemy.shield > 0) {
            const shieldAlpha = 0.25 + enemy.shield / enemy.maxShield * 0.35 + (enemy.shieldGlow || 0) * 0.4;
            ctx.strokeStyle = `rgba(168, 85, 247, ${Math.min(1, shieldAlpha + 0.3)})`;
            ctx.fillStyle = `rgba(168, 85, 247, ${shieldAlpha * 0.5})`;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.ellipse(0, 0, halfW + 9, halfH + 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            if (enemy.shieldGlow > 0) {
              enemy.shieldGlow = Math.max(0, enemy.shieldGlow - 0.05);
            }
          }
          break;
        case "frost_phantom":
          ctx.fillStyle = "#0c1b2e";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.2;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 1.1);
          ctx.lineTo(halfW * 0.4, halfH * 0.2);
          ctx.lineTo(halfW, -halfH * 0.5);
          ctx.lineTo(halfW * 0.6, -halfH);
          ctx.lineTo(0, -halfH * 0.6);
          ctx.lineTo(-halfW * 0.6, -halfH);
          ctx.lineTo(-halfW, -halfH * 0.5);
          ctx.lineTo(-halfW * 0.4, halfH * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#e0f2fe";
          ctx.beginPath();
          ctx.moveTo(0, -halfH * 0.3);
          ctx.lineTo(halfW * 0.35, halfH * 0.1);
          ctx.lineTo(0, halfH * 0.6);
          ctx.lineTo(-halfW * 0.35, halfH * 0.1);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "siege_dreadnought":
          ctx.fillStyle = "#1c0a12";
          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#e11d48";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.3, halfH);
          ctx.lineTo(halfW * 0.3, halfH);
          ctx.lineTo(halfW * 0.6, halfH * 0.6);
          ctx.lineTo(halfW, halfH * 0.2);
          ctx.lineTo(halfW * 0.85, -halfH * 0.7);
          ctx.lineTo(halfW * 0.3, -halfH);
          ctx.lineTo(-halfW * 0.3, -halfH);
          ctx.lineTo(-halfW * 0.85, -halfH * 0.7);
          ctx.lineTo(-halfW, halfH * 0.2);
          ctx.lineTo(-halfW * 0.6, halfH * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-halfW * 0.45, -halfH * 0.5, halfW * 0.9, halfH * 0.8);
          ctx.fillStyle = "#e11d48";
          [-halfW * 0.4, -halfW * 0.15, halfW * 0.15, halfW * 0.4 - 4].forEach((px) => {
            ctx.fillRect(px, halfH * 0.5, 4, 8);
          });
          ctx.fillStyle = "#ff0055";
          ctx.beginPath();
          ctx.arc(0, -2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      if (enemy.isFormidable) {
        const barW = Math.max(enemy.width, 36);
        const barH = 4;
        const barX = -barW / 2;
        const barY = -halfH - 12;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(barX, barY, barW, barH);
        const hpPct = Math.max(0, enemy.health / enemy.maxHealth);
        ctx.fillStyle = hpPct > 0.4 ? enemy.color || "#10b981" : "#ef4444";
        ctx.fillRect(barX, barY, barW * hpPct, barH);
        if (enemy.maxShield > 0 && enemy.shield > 0) {
          const shieldPct = Math.max(0, enemy.shield / enemy.maxShield);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(barX, barY - 3, barW * shieldPct, 2);
        }
      }
      ctx.restore();
    },
    /**
     * Proporciona la información estructurada de inteligencia para el modal de briefing y manual
     */
    getIntelForStage(stageNumber) {
      const stage = Math.max(1, Math.min(5, stageNumber || 1));
      const availableTypes = this.getAvailableTypes(stage);
      const activeEnemies = availableTypes.map((key) => this.TYPES[key]);
      const newEnemyKey = Object.keys(this.TYPES).find((k) => this.TYPES[k].introducedStage === stage);
      const newEnemy = newEnemyKey ? this.TYPES[newEnemyKey] : null;
      return {
        stage,
        activeEnemies,
        newEnemy,
        totalTypesCount: availableTypes.length
      };
    }
  };

  // frontend/js/ship_renderer.js
  var ShipRenderer = {
    /**
     * Dibuja la nave del jugador según su modelo/slug
     */
    drawPlayerShip(ctx, ship, x, y, width, height, isSpecialActive = false) {
      ctx.save();
      ctx.translate(x, y);
      const halfW = width / 2;
      const halfH = height / 2;
      const thrustGlow = ctx.createRadialGradient(0, halfH, 2, 0, halfH + 15, 20);
      thrustGlow.addColorStop(0, isSpecialActive ? "#ff00ff" : "#00f3ff");
      thrustGlow.addColorStop(1, "transparent");
      ctx.fillStyle = thrustGlow;
      ctx.beginPath();
      ctx.arc(0, halfH + 6, 14, 0, Math.PI * 2);
      ctx.fill();
      switch (ship.slug) {
        case "phoenix-vanguard":
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = isSpecialActive ? "#00f3ff" : "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -halfH);
          ctx.lineTo(halfW, halfH * 0.7);
          ctx.lineTo(halfW * 0.4, halfH * 0.5);
          ctx.lineTo(halfW * 0.3, halfH);
          ctx.lineTo(0, halfH * 0.6);
          ctx.lineTo(-halfW * 0.3, halfH);
          ctx.lineTo(-halfW * 0.4, halfH * 0.5);
          ctx.lineTo(-halfW, halfH * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#00f3ff";
          ctx.beginPath();
          ctx.ellipse(0, -halfH * 0.1, 4, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "titan-colossus":
          ctx.fillStyle = "#1e1b4b";
          ctx.strokeStyle = isSpecialActive ? "#a855f7" : "#ec4899";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.4, -halfH);
          ctx.lineTo(halfW * 0.4, -halfH);
          ctx.lineTo(halfW, -halfH * 0.2);
          ctx.lineTo(halfW * 0.8, halfH * 0.8);
          ctx.lineTo(halfW * 0.4, halfH);
          ctx.lineTo(-halfW * 0.4, halfH);
          ctx.lineTo(-halfW * 0.8, halfH * 0.8);
          ctx.lineTo(-halfW, -halfH * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "valkyrie-specter":
          ctx.fillStyle = "#090d16";
          ctx.strokeStyle = isSpecialActive ? "#22c55e" : "#10b981";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -halfH);
          ctx.lineTo(halfW * 0.3, -halfH * 0.3);
          ctx.lineTo(halfW, halfH * 0.5);
          ctx.lineTo(halfW * 0.6, halfH * 0.7);
          ctx.lineTo(0, halfH * 0.4);
          ctx.lineTo(-halfW * 0.6, halfH * 0.7);
          ctx.lineTo(-halfW, halfH * 0.5);
          ctx.lineTo(-halfW * 0.3, -halfH * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#34d399";
          ctx.fillRect(-halfW * 0.9, halfH * 0.4, 4, 8);
          ctx.fillRect(halfW * 0.9 - 4, halfH * 0.4, 4, 8);
          ctx.fillRect(-2, -halfH - 4, 4, 8);
          break;
        case "vortex-tempest":
          ctx.fillStyle = "#180d2b";
          ctx.strokeStyle = isSpecialActive ? "#f59e0b" : "#fbbf24";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -halfH);
          ctx.lineTo(halfW * 0.7, -halfH * 0.5);
          ctx.lineTo(halfW, halfH * 0.3);
          ctx.lineTo(halfW * 0.3, halfH * 0.9);
          ctx.lineTo(0, halfH * 0.5);
          ctx.lineTo(-halfW * 0.3, halfH * 0.9);
          ctx.lineTo(-halfW, halfH * 0.3);
          ctx.lineTo(-halfW * 0.7, -halfH * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(0, 0, halfW * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "hyperion-dreadnought":
        default:
          ctx.fillStyle = "#0c1524";
          ctx.strokeStyle = isSpecialActive ? "#ff0055" : "#e11d48";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.25, -halfH);
          ctx.lineTo(-halfW * 0.1, -halfH * 0.4);
          ctx.lineTo(halfW * 0.1, -halfH * 0.4);
          ctx.lineTo(halfW * 0.25, -halfH);
          ctx.lineTo(halfW, halfH * 0.6);
          ctx.lineTo(halfW * 0.5, halfH);
          ctx.lineTo(0, halfH * 0.7);
          ctx.lineTo(-halfW * 0.5, halfH);
          ctx.lineTo(-halfW, halfH * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(-3, -halfH * 0.3, 6, 16);
          break;
      }
      if (isSpecialActive) {
        this.drawSpecialAura(ctx, ship.special.slug, width, height);
      }
      ctx.restore();
    },
    /**
     * Representación visual de la habilidad especial activa
     */
    drawSpecialAura(ctx, specialSlug, width, height) {
      const radius = Math.max(width, height) * 0.8;
      if (specialSlug === "shield_matrix") {
        ctx.strokeStyle = "rgba(0, 243, 255, 0.85)";
        ctx.fillStyle = "rgba(0, 243, 255, 0.18)";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (specialSlug === "emp_blast") {
        ctx.strokeStyle = "rgba(236, 72, 153, 0.9)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (specialSlug === "overdrive_ghost") {
        ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialSlug === "micromissile_swarm") {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
        ctx.stroke();
      } else if (specialSlug === "orbital_bombardment") {
        ctx.fillStyle = "rgba(225, 29, 72, 0.25)";
        ctx.fillRect(-width * 0.6, -100, width * 1.2, 200);
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 2;
        ctx.strokeRect(-width * 0.6, -100, width * 1.2, 200);
      }
    },
    /**
     * Dibuja los proyectiles característicos de cada nave
     */
    drawProjectile(ctx, projectile) {
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      switch (projectile.weaponType) {
        case "twin_laser":
          ctx.fillStyle = "#00f3ff";
          ctx.shadowColor = "#00f3ff";
          ctx.shadowBlur = 8;
          ctx.fillRect(-2, -projectile.height / 2, 4, projectile.height);
          break;
        case "heavy_plasma":
          ctx.fillStyle = "#f43f5e";
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "triple_spread":
          ctx.fillStyle = "#10b981";
          ctx.shadowColor = "#34d399";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(3, 6);
          ctx.lineTo(-3, 6);
          ctx.closePath();
          ctx.fill();
          break;
        case "wave_cannon":
          ctx.strokeStyle = "#fbbf24";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 8;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 10, -Math.PI * 0.7, -Math.PI * 0.3);
          ctx.stroke();
          break;
        case "beam_laser":
        default:
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ff0055";
          ctx.shadowBlur = 14;
          ctx.fillRect(-3, -projectile.height / 2, 6, projectile.height);
          ctx.strokeStyle = "#ff0055";
          ctx.lineWidth = 2;
          ctx.strokeRect(-4, -projectile.height / 2, 8, projectile.height);
          break;
      }
      ctx.restore();
    },
    /**
     * Dibuja drones/enemigos de práctica para el campo de pruebas y combate
     */
    drawEnemy(ctx, enemy) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      if (enemy.isBoss) {
        ctx.fillStyle = "#4c0519";
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(-enemy.width / 2, -enemy.height / 3);
        ctx.lineTo(0, -enemy.height / 2);
        ctx.lineTo(enemy.width / 2, -enemy.height / 3);
        ctx.lineTo(enemy.width / 2, enemy.height / 3);
        ctx.lineTo(0, enemy.height / 2);
        ctx.lineTo(-enemy.width / 2, enemy.height / 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const healthPct = Math.max(0, enemy.health / enemy.maxHealth);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 12, enemy.width, 6);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 12, enemy.width * healthPct, 6);
      } else {
        ctx.restore();
        EnemyCatalog.drawEnemy(ctx, enemy);
        return;
      }
      ctx.restore();
    }
  };

  // frontend/js/scenario_renderer.js
  var ScenarioRenderer = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.scrollY = 0;
      this.snowflakes = [];
      this.pacificIslands = [];
      this.jungleTrees = [];
      this.groundCraters = [];
      this.spaceStars = [];
      this.spaceAsteroids = [];
      this.arcticIcebergs = [];
      this.initIslands();
      this.initSnow();
      this.initArcticIcebergs();
      this.initJungle();
      this.initSpaceStars();
      this.initSpaceAsteroids();
    }
    initSpaceStars() {
      this.spaceStars = [];
      for (let i = 0; i < 95; i++) {
        const isTwinkle = Math.random() < 0.22;
        this.spaceStars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 1.8 + 0.8,
          baseAlpha: Math.random() * 0.45 + 0.25,
          isTwinkle,
          twinkleSpeed: Math.random() * 3e-3 + 2e-3,
          twinkleOffset: Math.random() * Math.PI * 2,
          hasGlint: isTwinkle && Math.random() < 0.45,
          speedY: (Math.random() * 1.8 + 0.8) * 36 + 24,
          // 52 a 120 px/s para sensación de vuelo cósmico continuo
          color: Math.random() > 0.8 ? "#93c5fd" : Math.random() > 0.6 ? "#fef08a" : "#ffffff"
        });
      }
    }
    initSpaceAsteroids() {
      this.spaceAsteroids = [];
      for (let i = 0; i < 28; i++) {
        const rad = Math.random() * 16 + 8;
        const numPts = 10;
        const pts = [];
        for (let p = 0; p < numPts; p++) {
          const ang = p / numPts * Math.PI * 2;
          const r = rad * (0.75 + Math.random() * 0.5);
          pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
        }
        this.spaceAsteroids.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 2.2 - 150,
          radius: rad,
          poly: pts,
          speedY: Math.random() * 26 + 32,
          speedX: (Math.random() - 0.5) * 12,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.025,
          color: Math.random() > 0.5 ? "#475569" : "#334155"
        });
      }
    }
    initIslands() {
      this.pacificIslands = [];
      const count = 16;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * (this.canvas.width - 120) + 60;
        const y = i / count * this.canvas.height * 2.2 - 150;
        this.pacificIslands.push(this.createPacificIsland(x, y));
      }
    }
    createPacificIsland(x, y) {
      const types = ["volcanic", "atoll", "archipelago", "cay"];
      const type = types[Math.floor(Math.random() * types.length)];
      const baseRadius = Math.random() * 26 + 22;
      const roughness = type === "cay" ? 0.25 : 0.42;
      const generatePoly = (rad, rough, numPts = 16) => {
        const pts = [];
        const s1 = Math.random() * 6;
        const s2 = Math.random() * 6;
        for (let i = 0; i < numPts; i++) {
          const ang = i / numPts * Math.PI * 2;
          const harmonic = Math.sin(ang * 2 + s1) * 0.22 + Math.cos(ang * 3 + s2) * 0.16;
          const r = rad * (1 + harmonic + (Math.random() - 0.5) * rough);
          pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
        }
        return pts;
      };
      const reefPoly = generatePoly(baseRadius * 1.58, roughness * 0.8, 16);
      const sandPoly = generatePoly(baseRadius * 1.15, roughness, 16);
      const junglePoly = generatePoly(baseRadius * 0.78, roughness * 1.1, 14);
      const corePoly = generatePoly(baseRadius * 0.42, roughness * 0.7, 12);
      const palms = [];
      const numPalms = Math.floor(Math.random() * 4) + 2;
      for (let p = 0; p < numPalms; p++) {
        const pAng = Math.random() * Math.PI * 2;
        const pDist = baseRadius * (0.82 + Math.random() * 0.22);
        palms.push({
          x: Math.cos(pAng) * pDist,
          y: Math.sin(pAng) * pDist,
          trunkAngle: (Math.random() - 0.5) * 0.65,
          size: Math.random() * 3 + 4.5
        });
      }
      const lagoonPoly = type === "atoll" ? generatePoly(baseRadius * 0.45, 0.25, 12) : null;
      const satellites = [];
      if (type === "archipelago") {
        const count = Math.random() > 0.4 ? 2 : 1;
        for (let s = 0; s < count; s++) {
          const sAng = s * Math.PI + (Math.random() - 0.5) * 0.8;
          const sDist = baseRadius * (1.75 + Math.random() * 0.45);
          const sRad = baseRadius * (0.32 + Math.random() * 0.22);
          satellites.push({
            x: Math.cos(sAng) * sDist,
            y: Math.sin(sAng) * sDist,
            reefPoly: generatePoly(sRad * 1.55, 0.3, 12),
            sandPoly: generatePoly(sRad * 1.15, 0.35, 12),
            junglePoly: generatePoly(sRad * 0.72, 0.4, 10),
            radius: sRad
          });
        }
      }
      return {
        x,
        y,
        type,
        radius: baseRadius,
        reefPoly,
        sandPoly,
        junglePoly,
        corePoly,
        palms,
        lagoonPoly,
        satellites,
        rotation: Math.random() * Math.PI * 2,
        surfPhase: Math.random() * Math.PI * 2
      };
    }
    initSnow() {
      this.snowflakes = [];
      for (let i = 0; i < 110; i++) {
        this.snowflakes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 3 + 1,
          speedY: Math.random() * 3 + 2,
          speedX: Math.random() * 2 - 1
        });
      }
    }
    initArcticIcebergs() {
      this.arcticIcebergs = [];
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const y = Math.random() * (this.canvas.height * 2.2) - 150;
        this.arcticIcebergs.push(this.createArcticIceberg(x, y));
      }
    }
    createArcticIceberg(x, y) {
      const radius = Math.random() * 22 + 12;
      const numPts = 8;
      const pts = [];
      for (let p = 0; p < numPts; p++) {
        const ang = p / numPts * Math.PI * 2;
        const r = radius * (0.75 + Math.random() * 0.5);
        pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
      }
      return {
        x,
        y,
        radius,
        poly: pts,
        rotation: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 14 + 10,
        glowColor: Math.random() > 0.4 ? "rgba(56, 189, 248, 0.35)" : "rgba(34, 211, 238, 0.45)"
      };
    }
    initJungle() {
      this.jungleTrees = [];
      this.groundCraters = [];
      for (let row = 0; row < 30; row++) {
        for (let col = 0; col < 16; col++) {
          this.jungleTrees.push({
            x: col * 52 + row % 2 * 26 + (Math.random() * 12 - 6),
            y: row * 45 - 200,
            radius: Math.random() * 12 + 16,
            color: Math.random() > 0.5 ? "#15803d" : "#166534",
            isDestroyed: false
          });
        }
      }
    }
    /**
     * Registra impactos de bombas y armas especiales en el suelo de la jungla
     */
    addGroundExplosion(x, y, radius = 45) {
      this.groundCraters.push({
        x,
        y,
        radius,
        smoke: 1
      });
      for (const tree of this.jungleTrees) {
        const dist = Math.hypot(tree.x - x, tree.y - y);
        if (dist < radius) {
          tree.isDestroyed = true;
        }
      }
    }
    update(dt, stageNumber, distanceRatio) {
      const scrollSpeed = 60 * dt;
      this.scrollY += scrollSpeed;
      if (stageNumber === 2) {
        for (let i = this.pacificIslands.length - 1; i >= 0; i--) {
          const island = this.pacificIslands[i];
          island.y += scrollSpeed * 0.92;
          if (island.y > this.canvas.height + 120) {
            if (distanceRatio < 0.26) {
              const newX = Math.random() * (this.canvas.width - 120) + 60;
              this.pacificIslands[i] = this.createPacificIsland(newX, -120);
            } else {
              this.pacificIslands.splice(i, 1);
            }
          }
        }
      } else if (stageNumber === 3) {
        for (const star of this.spaceStars) {
          star.y += (star.speedY || 60) * dt;
          if (star.y > this.canvas.height + 6) {
            star.y = -6;
            star.x = Math.random() * this.canvas.width;
          }
        }
        for (const a of this.spaceAsteroids) {
          a.y += a.speedY * dt;
          a.x += a.speedX * dt;
          a.rotation += a.rotSpeed;
          if (a.y > this.canvas.height + 60) {
            a.y = -60;
            a.x = Math.random() * this.canvas.width;
          }
        }
      } else if (stageNumber === 4) {
        const wind = Math.sin(this.scrollY * 0.04) * 1.8;
        for (const flake of this.snowflakes) {
          flake.y += flake.speedY;
          flake.x += flake.speedX + wind;
          if (flake.y > this.canvas.height) {
            flake.y = 0;
            flake.x = Math.random() * this.canvas.width;
          }
          if (flake.x < 0) flake.x = this.canvas.width;
          else if (flake.x > this.canvas.width) flake.x = 0;
        }
        for (const berg of this.arcticIcebergs) {
          berg.y += berg.driftSpeed * dt;
          if (berg.y > this.canvas.height + 60) {
            berg.y = -60;
            berg.x = Math.random() * this.canvas.width;
          }
        }
      } else if (stageNumber === 5) {
        for (const tree of this.jungleTrees) {
          tree.y += scrollSpeed * 0.85;
          if (tree.y > this.canvas.height + 50) {
            tree.y = -40;
            tree.isDestroyed = false;
          }
        }
        for (const crater of this.groundCraters) {
          crater.y += scrollSpeed * 0.85;
          crater.smoke = Math.max(0, crater.smoke - dt * 0.1);
        }
        this.groundCraters = this.groundCraters.filter((c) => c.y < this.canvas.height + 80);
      }
    }
    render(stageNumber, distanceRatio) {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      switch (stageNumber) {
        case 1:
          this.renderStage1_NorthAmericaToAntarctica(ctx, w, h, distanceRatio);
          break;
        case 2:
          this.renderStage2_PacificToAustralia(ctx, w, h, distanceRatio);
          break;
        case 3:
          this.renderStage3_EarthToJupiter(ctx, w, h, distanceRatio);
          break;
        case 4:
          this.renderStage4_IceZone(ctx, w, h, distanceRatio);
          break;
        case 5:
        default:
          this.renderStage5_DestructibleJungle(ctx, w, h, distanceRatio);
          break;
      }
    }
    // ==========================================
    // ESCENARIO 1: NORTEAMÉRICA A LA ANTÁRTIDA (MAPA CONTINENTAL COMPLETO)
    // ==========================================
    renderStage1_NorthAmericaToAntarctica(ctx, w, h, distanceRatio) {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      oceanGrad.addColorStop(0, "#031e38");
      oceanGrad.addColorStop(0.5, "#073256");
      oceanGrad.addColorStop(1, "#03233f");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
      ctx.lineWidth = 1.5;
      const waveOffset = this.scrollY * 0.3 % 45;
      for (let wy = waveOffset; wy < h; wy += 45) {
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.bezierCurveTo(w * 0.3, wy + 8, w * 0.7, wy - 8, w, wy);
        ctx.stroke();
      }
      const totalMapHeight = 3400;
      const scrollMapY = distanceRatio * (totalMapHeight - h);
      ctx.save();
      ctx.translate(0, -scrollMapY);
      ctx.fillStyle = "#1e3a1e";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, 60);
      ctx.lineTo(w * 0.22, 40);
      ctx.lineTo(w * 0.35, 80);
      ctx.lineTo(w * 0.48, 120);
      ctx.lineTo(w * 0.52, 220);
      ctx.lineTo(w * 0.45, 260);
      ctx.lineTo(w * 0.58, 200);
      ctx.lineTo(w * 0.78, 260);
      ctx.lineTo(w * 0.72, 420);
      ctx.lineTo(w * 0.78, 540);
      ctx.lineTo(w * 0.72, 570);
      ctx.lineTo(w * 0.58, 520);
      ctx.lineTo(w * 0.48, 560);
      ctx.lineTo(w * 0.52, 680);
      ctx.lineTo(w * 0.46, 700);
      ctx.lineTo(w * 0.38, 760);
      ctx.lineTo(w * 0.32, 660);
      ctx.lineTo(w * 0.28, 580);
      ctx.lineTo(w * 0.26, 460);
      ctx.lineTo(w * 0.18, 380);
      ctx.lineTo(w * 0.14, 220);
      ctx.lineTo(w * 0.08, 120);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(224, 242, 254, 0.35)";
      ctx.beginPath();
      ctx.moveTo(w * 0.1, 70);
      ctx.lineTo(w * 0.35, 80);
      ctx.lineTo(w * 0.45, 160);
      ctx.lineTo(w * 0.15, 140);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#073256";
      ctx.beginPath();
      ctx.ellipse(w * 0.52, 330, 24, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.56, 350, 18, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(120, 53, 15, 0.5)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 150);
      ctx.lineTo(w * 0.29, 320);
      ctx.lineTo(w * 0.34, 520);
      ctx.stroke();
      ctx.fillStyle = "#15803d";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.38, 760);
      ctx.lineTo(w * 0.44, 840);
      ctx.lineTo(w * 0.48, 920);
      ctx.lineTo(w * 0.54, 1020);
      ctx.lineTo(w * 0.51, 1035);
      ctx.lineTo(w * 0.44, 940);
      ctx.lineTo(w * 0.36, 850);
      ctx.lineTo(w * 0.33, 770);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.ellipse(w * 0.65, 730, 36, 8, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(w * 0.76, 760, 20, 9, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#14532d";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.52, 1040);
      ctx.lineTo(w * 0.64, 1070);
      ctx.lineTo(w * 0.74, 1110);
      ctx.lineTo(w * 0.88, 1260);
      ctx.lineTo(w * 0.84, 1420);
      ctx.lineTo(w * 0.78, 1620);
      ctx.lineTo(w * 0.68, 1850);
      ctx.lineTo(w * 0.58, 2080);
      ctx.lineTo(w * 0.52, 2260);
      ctx.lineTo(w * 0.46, 2260);
      ctx.lineTo(w * 0.45, 2050);
      ctx.lineTo(w * 0.43, 1780);
      ctx.lineTo(w * 0.41, 1480);
      ctx.lineTo(w * 0.39, 1320);
      ctx.lineTo(w * 0.46, 1140);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.82, 1180);
      ctx.bezierCurveTo(w * 0.72, 1200, w * 0.55, 1220, w * 0.46, 1240);
      ctx.stroke();
      ctx.strokeStyle = "rgba(180, 83, 9, 0.65)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w * 0.48, 1120);
      ctx.lineTo(w * 0.43, 1380);
      ctx.lineTo(w * 0.46, 1720);
      ctx.lineTo(w * 0.48, 2120);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.47, 1140);
      ctx.lineTo(w * 0.44, 1420);
      ctx.lineTo(w * 0.47, 1800);
      ctx.stroke();
      ctx.fillStyle = "#1e3a1e";
      ctx.beginPath();
      ctx.ellipse(w * 0.64, 2180, 10, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(224, 242, 254, 0.8)";
      const icebergs = [
        { x: w * 0.35, y: 2360, r: 12 },
        { x: w * 0.55, y: 2420, r: 16 },
        { x: w * 0.42, y: 2510, r: 14 },
        { x: w * 0.68, y: 2480, r: 18 },
        { x: w * 0.28, y: 2560, r: 15 }
      ];
      for (const berg of icebergs) {
        ctx.beginPath();
        ctx.arc(berg.x, berg.y, berg.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.stroke();
      }
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.48, 2640);
      ctx.lineTo(w * 0.53, 2740);
      ctx.lineTo(w * 0.62, 2850);
      ctx.lineTo(w * 0.95, 2920);
      ctx.lineTo(w, 3350);
      ctx.lineTo(0, 3350);
      ctx.lineTo(0, 2920);
      ctx.lineTo(w * 0.32, 2880);
      ctx.lineTo(w * 0.43, 2760);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, 3020);
      ctx.lineTo(w * 0.45, 3070);
      ctx.lineTo(w * 0.7, 3040);
      ctx.moveTo(w * 0.35, 3150);
      ctx.lineTo(w * 0.6, 3200);
      ctx.lineTo(w * 0.85, 3160);
      ctx.stroke();
      ctx.restore();
      this.renderAmericasPositionBanner(ctx, w, h, distanceRatio);
      this.renderAmericasRadar(ctx, distanceRatio);
    }
    renderAmericasPositionBanner(ctx, w, h, distanceRatio) {
      let regionText = "SOBREVOLANDO: NORTEAM\xC9RICA [CANAD\xC1 / EE.UU.]";
      let subText = "Ruta transcontinental polar - Detectores de radar activos";
      if (distanceRatio > 0.22 && distanceRatio <= 0.45) {
        regionText = "SOBREVOLANDO: GOLFO DE M\xC9XICO Y CARIBE";
        subText = "Sector de enlace de comunicaciones y sat\xE9lites esp\xEDa";
      } else if (distanceRatio > 0.45 && distanceRatio <= 0.72) {
        regionText = "SOBREVOLANDO: SUDAM\xC9RICA [AMAZONAS Y CORDILLERA DE LOS ANDES]";
        subText = "Aproximaci\xF3n a la cordillera monta\xF1osa hacia el cono sur";
      } else if (distanceRatio > 0.72 && distanceRatio <= 0.88) {
        regionText = "SOBREVOLANDO: CABO DE HORNOS Y PASAJE DE DRAKE";
        subText = "Cruce de aguas australes - Detecci\xF3n de fortaleza polar";
      } else if (distanceRatio > 0.88) {
        regionText = "\xA1ALERTA! APROXIMACI\xD3N A LA ANT\xC1RTIDA [ZONA DE JEFE]";
        subText = "Fortaleza Goliath Apex detectada sobre los glaciares";
      }
      ctx.save();
      ctx.fillStyle = "rgba(7, 10, 24, 0.75)";
      ctx.fillRect(w / 2 - 200, h - 38, 400, 30);
      ctx.strokeStyle = distanceRatio > 0.88 ? "#ff0055" : "rgba(0, 243, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 - 200, h - 38, 400, 30);
      ctx.font = "9px Orbitron";
      ctx.fillStyle = distanceRatio > 0.88 ? "#ff0055" : "#00f3ff";
      ctx.textAlign = "center";
      ctx.fillText(regionText, w / 2, h - 22);
      ctx.font = "8px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(subText, w / 2, h - 11);
      ctx.restore();
    }
    renderAmericasRadar(ctx, distanceRatio) {
      const rx = 15;
      const ry = this.canvas.height - 145;
      const rw = 95;
      const rh = 135;
      ctx.save();
      ctx.fillStyle = "rgba(7, 12, 26, 0.88)";
      ctx.strokeStyle = "#00f3ff";
      ctx.lineWidth = 1.5;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillStyle = "#00f3ff";
      ctx.font = "8px Orbitron";
      ctx.fillText("RADAR AM\xC9RICA", rx + 8, ry + 12);
      ctx.strokeStyle = "rgba(0, 243, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rx + 20, ry + 22);
      ctx.lineTo(rx + 50, ry + 24);
      ctx.lineTo(rx + 72, ry + 36);
      ctx.lineTo(rx + 62, ry + 52);
      ctx.lineTo(rx + 48, ry + 50);
      ctx.lineTo(rx + 40, ry + 62);
      ctx.lineTo(rx + 46, ry + 74);
      ctx.lineTo(rx + 58, ry + 80);
      ctx.lineTo(rx + 76, ry + 92);
      ctx.lineTo(rx + 62, ry + 112);
      ctx.lineTo(rx + 52, ry + 122);
      ctx.lineTo(rx + 44, ry + 102);
      ctx.lineTo(rx + 40, ry + 82);
      ctx.lineTo(rx + 26, ry + 42);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.strokeRect(rx + 15, ry + 125, rw - 30, 6);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(rx + 5, ry + 78);
      ctx.lineTo(rx + rw - 5, ry + 78);
      ctx.stroke();
      ctx.setLineDash([]);
      const markerY = ry + 22 + distanceRatio * 104;
      const markerX = rx + 36 + Math.sin(distanceRatio * Math.PI) * 18;
      ctx.fillStyle = "#ff0055";
      ctx.beginPath();
      ctx.arc(markerX, markerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "8px monospace";
      ctx.fillStyle = "#34d399";
      const lat = Math.floor(70 - distanceRatio * 150);
      ctx.fillText(`LAT: ${Math.abs(lat)}\xB0${lat >= 0 ? "N" : "S"}`, rx + 14, ry + rh - 2);
      ctx.restore();
    }
    // ==========================================
    // ESCENARIO 2: OCÉANO PACÍFICO A AUSTRALIA
    // ==========================================
    renderStage2_PacificToAustralia(ctx, w, h, distanceRatio) {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      oceanGrad.addColorStop(0, "#011627");
      oceanGrad.addColorStop(0.5, "#022c43");
      oceanGrad.addColorStop(1, "#033b5c");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(14, 165, 233, 0.14)";
      ctx.lineWidth = 2.2;
      const waveOffset = this.scrollY * 0.35 % 48;
      for (let wy = waveOffset; wy < h; wy += 48) {
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.bezierCurveTo(w * 0.25, wy + 12, w * 0.75, wy - 10, w, wy + 4);
        ctx.stroke();
      }
      if (this.pacificIslands.length > 0) {
        for (const island of this.pacificIslands) {
          this.drawOrganicIsland(ctx, island);
        }
      }
      if (distanceRatio >= 0.28 && distanceRatio <= 0.96) {
        this.drawAustraliaContinent(ctx, w, h, distanceRatio);
      }
    }
    /**
     * Dibuja una isla orgánica con arrecifes, rompientes, playas de arena,
     * jungla en capas, lagunas coralinas y palmeras tropicales.
     */
    drawOrganicIsland(ctx, island) {
      ctx.save();
      ctx.translate(island.x, island.y);
      ctx.rotate(island.rotation);
      ctx.fillStyle = "rgba(45, 212, 191, 0.26)";
      ctx.beginPath();
      this.drawPathFromPoints(ctx, island.reefPoly);
      ctx.closePath();
      ctx.fill();
      const surfPulse = 1 + Math.sin(performance.now() * 3e-3 + island.surfPhase) * 0.06;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.scale(surfPulse, surfPulse);
      this.drawPathFromPoints(ctx, island.reefPoly);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.scale(1 / surfPulse, 1 / surfPulse);
      ctx.fillStyle = "rgba(20, 184, 166, 0.48)";
      ctx.beginPath();
      this.drawPathFromPoints(ctx, island.sandPoly, 1.12);
      ctx.closePath();
      ctx.fill();
      if (island.type === "archipelago" && island.satellites) {
        for (const sat of island.satellites) {
          ctx.strokeStyle = "rgba(254, 240, 138, 0.35)";
          ctx.lineWidth = Math.max(3, sat.radius * 0.7);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(sat.x, sat.y);
          ctx.stroke();
          ctx.fillStyle = "rgba(45, 212, 191, 0.3)";
          ctx.beginPath();
          this.drawOffsetPath(ctx, sat.reefPoly, sat.x, sat.y);
          ctx.fill();
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          this.drawOffsetPath(ctx, sat.sandPoly, sat.x, sat.y);
          ctx.fill();
          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          this.drawOffsetPath(ctx, sat.junglePoly, sat.x, sat.y);
          ctx.fill();
        }
      }
      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1;
      ctx.beginPath();
      this.drawPathFromPoints(ctx, island.sandPoly);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (island.type === "atoll") {
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        this.drawPathFromPoints(ctx, island.junglePoly);
        ctx.closePath();
        ctx.fill();
        if (island.lagoonPoly) {
          ctx.fillStyle = "#2dd4bf";
          ctx.beginPath();
          this.drawPathFromPoints(ctx, island.lagoonPoly);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#0284c7";
          ctx.beginPath();
          ctx.arc(0, 0, island.radius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        this.drawPathFromPoints(ctx, island.junglePoly);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        this.drawPathFromPoints(ctx, island.corePoly);
        ctx.closePath();
        ctx.fill();
        if (island.type === "volcanic") {
          ctx.fillStyle = "#334155";
          ctx.beginPath();
          ctx.moveTo(-island.radius * 0.22, island.radius * 0.15);
          ctx.lineTo(0, -island.radius * 0.35);
          ctx.lineTo(island.radius * 0.25, island.radius * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#64748b";
          ctx.beginPath();
          ctx.moveTo(0, -island.radius * 0.35);
          ctx.lineTo(island.radius * 0.25, island.radius * 0.2);
          ctx.lineTo(island.radius * 0.05, 0);
          ctx.closePath();
          ctx.fill();
        }
      }
      for (const palm of island.palms) {
        this.drawPalmTree(ctx, palm.x, palm.y, palm.size, palm.trunkAngle);
      }
      ctx.restore();
    }
    drawPathFromPoints(ctx, points, scale = 1) {
      if (!points || points.length === 0) return;
      ctx.moveTo(points[0].x * scale, points[0].y * scale);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * scale, points[i].y * scale);
      }
    }
    drawOffsetPath(ctx, points, ox, oy, scale = 1) {
      if (!points || points.length === 0) return;
      ctx.moveTo(ox + points[0].x * scale, oy + points[0].y * scale);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(ox + points[i].x * scale, oy + points[i].y * scale);
      }
      ctx.closePath();
    }
    drawPalmTree(ctx, x, y, size, trunkAngle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(trunkAngle);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.35, -size * 0.5, size * 0.2, -size * 1.25);
      ctx.stroke();
      const topX = size * 0.2;
      const topY = -size * 1.25;
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.2;
      for (let f = 0; f < 5; f++) {
        const fAng = f / 5 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(
          topX + Math.cos(fAng) * size * 0.65,
          topY + Math.sin(fAng) * size * 0.35,
          topX + Math.cos(fAng) * size * 1.05,
          topY + Math.sin(fAng) * size * 0.85
        );
        ctx.stroke();
      }
      ctx.restore();
    }
    /**
     * Renderiza la masa continental de Australia como una inmensa isla-continente
     * integrada orgánicamente al océano Pacífico y desplazable de manera continua.
     * Cuenta con la misma estética de las islas (arrecife turquesa, rompientes de surf,
     * playas doradas, palmeras y jungla costera), pero en una escala colosal (3400px de longitud)
     * que el avión recorre durante un extenso tramo de la misión (del 32% al 100%).
     */
    drawAustraliaContinent(ctx, w, h, distanceRatio) {
      const totalContinentHeight = 3e3;
      const progress = Math.min(1, Math.max(0, (distanceRatio - 0.28) / (0.95 - 0.28)));
      const startOffsetY = -3050;
      const endOffsetY = h + 80;
      const offsetY = startOffsetY + progress * (endOffsetY - startOffsetY);
      const baseW = Math.max(w * 1.55, 1080);
      const centerX = w * 0.5;
      ctx.save();
      ctx.translate(centerX, offsetY);
      const australiaOutline = [
        // 1. Península de Cabo York y extremo norte
        { x: 0.14 * baseW, y: 70 },
        { x: 0.17 * baseW, y: 220 },
        { x: 0.2 * baseW, y: 380 },
        // Cairns / Cooktown
        { x: 0.24 * baseW, y: 560 },
        { x: 0.28 * baseW, y: 740 },
        // Townsville
        { x: 0.34 * baseW, y: 980 },
        // Mackay
        { x: 0.39 * baseW, y: 1220 },
        // Rockhampton / Hervey Bay
        { x: 0.44 * baseW, y: 1480 },
        // Sunshine Coast / Brisbane
        { x: 0.47 * baseW, y: 1680 },
        // Gold Coast / Byron Bay (Punto más oriental)
        { x: 0.45 * baseW, y: 1880 },
        // Coffs Harbour
        { x: 0.41 * baseW, y: 2080 },
        // Newcastle / Sydney / Wollongong
        { x: 0.35 * baseW, y: 2280 },
        // Batemans Bay / Costa sur NSW
        { x: 0.27 * baseW, y: 2480 },
        // Cabo Howe
        // 2. Costa Sur y Victoria
        { x: 0.17 * baseW, y: 2660 },
        // Wilson's Promontory (Punta sur continental)
        { x: 0.06 * baseW, y: 2620 },
        // Bahía Port Phillip / Melbourne
        { x: -0.05 * baseW, y: 2560 },
        // Costa de los Doce Apóstoles / Apollo Bay
        { x: -0.15 * baseW, y: 2430 },
        // Golfo de Spencer / Adelaida
        { x: -0.23 * baseW, y: 2340 },
        // Península de Eyre
        { x: -0.34 * baseW, y: 2380 },
        // Gran Bahía Australiana (Arco cóncavo hacia el norte)
        { x: -0.44 * baseW, y: 2400 },
        // Costa de Nullarbor
        { x: -0.54 * baseW, y: 2360 },
        // Esperance
        { x: -0.62 * baseW, y: 2260 },
        // Albany / Costa suroeste
        { x: -0.67 * baseW, y: 2130 },
        // Cabo Leeuwin (Esquina suroeste)
        // 3. Costa Oeste de Australia Occidental (WA)
        { x: -0.68 * baseW, y: 1880 },
        // Perth / Fremantle / Rottnest Island
        { x: -0.7 * baseW, y: 1560 },
        // Geraldton
        { x: -0.74 * baseW, y: 1260 },
        // Bahía Shark / Steep Point (Punto más occidental)
        { x: -0.69 * baseW, y: 960 },
        // Ningaloo Reef / Exmouth / Cabo Noroeste
        { x: -0.58 * baseW, y: 720 },
        // Pilbara / Dampier / Port Hedland
        { x: -0.44 * baseW, y: 540 },
        // Eighty Mile Beach / Broome
        // 4. Kimberleys, Costa Norte y Darwin
        { x: -0.32 * baseW, y: 410 },
        // Región de Kimberley
        { x: -0.2 * baseW, y: 350 },
        // Golfo Joseph Bonaparte
        { x: -0.12 * baseW, y: 250 },
        // Darwin / Beagle Gulf
        { x: -0.04 * baseW, y: 210 },
        // Península de Cobourg
        { x: 0.02 * baseW, y: 230 },
        // Tierra de Arnhem (Extremo noreste de NT)
        // 5. Golfo de Carpentaria (Enorme bahía rectangular hacia el interior)
        { x: 0.03 * baseW, y: 340 },
        // Entrada occidental del Golfo
        { x: 0 * baseW, y: 520 },
        // Litoral oeste del Golfo
        { x: 0.06 * baseW, y: 720 },
        // Fondo sur del Golfo (Karumba)
        { x: 0.12 * baseW, y: 520 },
        // Litoral este del Golfo
        { x: 0.11 * baseW, y: 290 },
        // Costa oeste de Cabo York
        { x: 0.14 * baseW, y: 70 }
        // Cierre en la punta norte de Cabo York
      ];
      const expandPolygon = (pts, expandRatio = 1.035) => {
        let cx = 0, cy = 0;
        pts.forEach((p) => {
          cx += p.x;
          cy += p.y;
        });
        cx /= pts.length;
        cy /= pts.length;
        return pts.map((p) => ({
          x: cx + (p.x - cx) * expandRatio,
          y: cy + (p.y - cy) * expandRatio
        }));
      };
      const shelfOuterPoly = expandPolygon(australiaOutline, 1.045);
      const shelfInnerPoly = expandPolygon(australiaOutline, 1.025);
      const sandPoly = expandPolygon(australiaOutline, 1.012);
      ctx.fillStyle = "rgba(45, 212, 191, 0.32)";
      ctx.beginPath();
      ctx.moveTo(shelfOuterPoly[0].x, shelfOuterPoly[0].y);
      for (let i = 1; i < shelfOuterPoly.length; i++) {
        ctx.lineTo(shelfOuterPoly[i].x, shelfOuterPoly[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(20, 184, 166, 0.45)";
      ctx.beginPath();
      ctx.moveTo(shelfInnerPoly[0].x, shelfInnerPoly[0].y);
      for (let i = 1; i < shelfInnerPoly.length; i++) {
        ctx.lineTo(shelfInnerPoly[i].x, shelfInnerPoly[i].y);
      }
      ctx.closePath();
      ctx.fill();
      const surfPulse = 1 + Math.sin(performance.now() * 3e-3) * 0.05;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.52)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(shelfInnerPoly[0].x * surfPulse, shelfInnerPoly[0].y);
      for (let i = 1; i < shelfInnerPoly.length; i++) {
        ctx.lineTo(shelfInnerPoly[i].x * surfPulse, shelfInnerPoly[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sandPoly[0].x, sandPoly[0].y);
      for (let i = 1; i < sandPoly.length; i++) {
        ctx.lineTo(sandPoly[i].x, sandPoly[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const continentGrad = ctx.createLinearGradient(0, 100, 0, 2700);
      continentGrad.addColorStop(0, "#15803d");
      continentGrad.addColorStop(0.18, "#166534");
      continentGrad.addColorStop(0.38, "#b45309");
      continentGrad.addColorStop(0.55, "#9a3412");
      continentGrad.addColorStop(0.75, "#b45309");
      continentGrad.addColorStop(0.9, "#15803d");
      continentGrad.addColorStop(1, "#14532d");
      ctx.fillStyle = continentGrad;
      ctx.beginPath();
      ctx.moveTo(australiaOutline[0].x, australiaOutline[0].y);
      for (let i = 1; i < australiaOutline.length; i++) {
        ctx.lineTo(australiaOutline[i].x, australiaOutline[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(australiaOutline[0].x, australiaOutline[0].y);
      for (let i = 1; i < australiaOutline.length; i++) {
        ctx.lineTo(australiaOutline[i].x, australiaOutline[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.save();
      ctx.fillStyle = "rgba(120, 53, 15, 0.40)";
      ctx.beginPath();
      ctx.ellipse(-0.06 * baseW, 1450, baseW * 0.32, 480, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(120, 53, 15, 0.55)";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0.18 * baseW, 350);
      ctx.quadraticCurveTo(0.28 * baseW, 1e3, 0.38 * baseW, 1600);
      ctx.quadraticCurveTo(0.36 * baseW, 2100, 0.22 * baseW, 2550);
      ctx.stroke();
      ctx.strokeStyle = "rgba(254, 243, 199, 0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0.18 * baseW + 2, 380);
      ctx.quadraticCurveTo(0.28 * baseW + 4, 1050, 0.38 * baseW + 3, 1650);
      ctx.quadraticCurveTo(0.36 * baseW + 3, 2120, 0.22 * baseW + 2, 2580);
      ctx.stroke();
      ctx.restore();
      const uluruX = -0.08 * baseW;
      const uluruY = 1450;
      ctx.save();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(uluruX, uluruY, 22, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.ellipse(uluruX + 4, uluruY + 2, 16, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      const eyreX = -0.05 * baseW;
      const eyreY = 1920;
      ctx.fillStyle = "rgba(254, 243, 199, 0.65)";
      ctx.beginPath();
      ctx.ellipse(eyreX, eyreY, 48, 28, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.strokeStyle = "rgba(45, 212, 191, 0.65)";
      ctx.lineWidth = 6;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(0.22 * baseW, 120);
      ctx.quadraticCurveTo(0.27 * baseW, 600, 0.44 * baseW, 1380);
      ctx.stroke();
      ctx.setLineDash([]);
      const coralAtolls = [
        { x: 0.2 * baseW, y: 160, r: 16 },
        { x: 0.22 * baseW, y: 320, r: 22 },
        { x: 0.25 * baseW, y: 520, r: 26 },
        { x: 0.28 * baseW, y: 720, r: 24 },
        { x: 0.33 * baseW, y: 940, r: 28 },
        { x: 0.38 * baseW, y: 1180, r: 24 },
        { x: 0.44 * baseW, y: 1420, r: 20 }
      ];
      for (const atoll of coralAtolls) {
        ctx.fillStyle = "rgba(45, 212, 191, 0.55)";
        ctx.beginPath();
        ctx.arc(atoll.x, atoll.y, atoll.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(2, 44, 67, 0.75)";
        ctx.beginPath();
        ctx.arc(atoll.x, atoll.y, atoll.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(atoll.x - 3, atoll.y - 2, atoll.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      const tasX = 0.2 * baseW;
      const tasY = 2920;
      const tasOutline = [
        { x: tasX - 25, y: tasY - 45 },
        { x: tasX + 35, y: tasY - 40 },
        { x: tasX + 48, y: tasY + 15 },
        { x: tasX + 15, y: tasY + 50 },
        { x: tasX - 35, y: tasY + 40 },
        { x: tasX - 45, y: tasY - 10 }
      ];
      ctx.fillStyle = "rgba(45, 212, 191, 0.35)";
      ctx.beginPath();
      ctx.arc(tasX, tasY, 68, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tasOutline[0].x, tasOutline[0].y);
      for (let i = 1; i < tasOutline.length; i++) ctx.lineTo(tasOutline[i].x, tasOutline[i].y);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.moveTo(tasOutline[0].x, tasOutline[0].y);
      for (let i = 1; i < tasOutline.length; i++) ctx.lineTo(tasOutline[i].x, tasOutline[i].y);
      ctx.closePath();
      ctx.fill();
      const coastalGroves = [
        { x: 0.17 * baseW, y: 280, count: 5 },
        { x: 0.22 * baseW, y: 460, count: 6 },
        { x: 0.27 * baseW, y: 780, count: 5 },
        { x: 0.43 * baseW, y: 1540, count: 6 },
        { x: 0.39 * baseW, y: 2120, count: 5 },
        { x: 0.15 * baseW, y: 2640, count: 4 },
        { x: -0.66 * baseW, y: 1920, count: 5 },
        { x: -0.4 * baseW, y: 600, count: 4 },
        { x: -0.1 * baseW, y: 270, count: 6 }
      ];
      for (const grove of coastalGroves) {
        for (let p = 0; p < grove.count; p++) {
          const px = grove.x + (p - grove.count / 2) * 12;
          const py = grove.y + p % 2 * 8;
          this.drawPalmTree(ctx, px, py, 5.5);
        }
      }
      ctx.restore();
    }
    // ==========================================
    // ESCENARIO 3: DE LA TIERRA A SATURNO (VÍA MARTE, ASTEROIDES Y JÚPITER)
    // ==========================================
    renderStage3_EarthToJupiter(ctx, w, h, distanceRatio) {
      const now = performance.now();
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, h);
      spaceGrad.addColorStop(0, "#01030a");
      spaceGrad.addColorStop(0.5, "#030714");
      spaceGrad.addColorStop(1, "#02050e");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(99, 102, 241, 0.04)";
      ctx.beginPath();
      ctx.arc(w * 0.3, h * 0.4, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(244, 63, 94, 0.035)";
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.65, 220, 0, Math.PI * 2);
      ctx.fill();
      this.drawTwinklingStars(ctx, now);
      if (distanceRatio < 0.28) {
        this.drawLeavingEarth(ctx, w, h, distanceRatio);
      }
      if (distanceRatio >= 0.12 && distanceRatio <= 0.38) {
        this.drawPassingMars(ctx, w, h, distanceRatio);
      }
      if (distanceRatio >= 0.24 && distanceRatio <= 0.46) {
        this.drawAsteroidBelt(ctx, w, h, distanceRatio);
      }
      if (distanceRatio >= 0.3 && distanceRatio <= 0.53) {
        this.drawDistantJupiter(ctx, w, h, distanceRatio);
      }
      if (distanceRatio >= 0.5 && distanceRatio <= 0.68) {
        this.drawSubspaceTransition(ctx, w, h, distanceRatio);
      }
      if (distanceRatio >= 0.66) {
        this.drawApproachingSaturn(ctx, w, h, distanceRatio);
      }
      this.renderSolarPositionBanner(ctx, w, h, distanceRatio);
      this.renderSolarSystemRadar(ctx, distanceRatio);
    }
    /**
     * Dibuja el campo de estrellas cósmico con pocas estrellas que titilan
     * aleatoriamente con destellos ópticos de difracción.
     */
    drawTwinklingStars(ctx, now) {
      for (const star of this.spaceStars) {
        let alpha = star.baseAlpha;
        if (star.isTwinkle) {
          alpha = 0.2 + 0.75 * (0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinkleOffset));
        }
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
        ctx.fillRect(star.x, star.y, star.size, star.size);
        if (star.hasGlint && alpha > 0.65) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.8;
          const glintLen = star.size * 2.8;
          ctx.beginPath();
          ctx.moveTo(star.x - glintLen, star.y + star.size / 2);
          ctx.lineTo(star.x + star.size + glintLen, star.y + star.size / 2);
          ctx.moveTo(star.x + star.size / 2, star.y - glintLen);
          ctx.lineTo(star.x + star.size / 2, star.y + star.size + glintLen);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    /**
     * La Tierra alejándose hacia abajo durante el despegue orbital
     */
    drawLeavingEarth(ctx, w, h, distanceRatio) {
      const p = distanceRatio / 0.28;
      const earthRadius = (1 - p) * 220 + 70;
      const earthY = h + earthRadius * 0.75 + p * 120;
      const earthX = w / 2;
      const earthGlow = ctx.createRadialGradient(earthX, earthY, earthRadius * 0.85, earthX, earthY, earthRadius * 1.18);
      earthGlow.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      earthGlow.addColorStop(0.5, "rgba(14, 165, 233, 0.2)");
      earthGlow.addColorStop(1, "transparent");
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius * 1.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#0369a1";
      ctx.fillRect(earthX - earthRadius, earthY - earthRadius, earthRadius * 2, earthRadius * 2);
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.ellipse(earthX - earthRadius * 0.3, earthY - earthRadius * 0.4, earthRadius * 0.5, earthRadius * 0.35, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.ellipse(earthX + earthRadius * 0.35, earthY - earthRadius * 0.2, earthRadius * 0.45, earthRadius * 0.3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.beginPath();
      ctx.arc(earthX - earthRadius * 0.2, earthY - earthRadius * 0.35, earthRadius * 0.3, 0, Math.PI * 2);
      ctx.arc(earthX + earthRadius * 0.25, earthY - earthRadius * 0.15, earthRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    /**
     * Paso cercano por Marte: el planeta rojo se ve a un lado, ni muy cerca ni diminuto
     */
    drawPassingMars(ctx, w, h, distanceRatio) {
      const p = (distanceRatio - 0.12) / 0.26;
      const marsRadius = 38;
      const marsX = w * 0.82 - p * 45;
      const marsY = -40 + p * (h + 100);
      ctx.save();
      const marsGlow = ctx.createRadialGradient(marsX, marsY, marsRadius * 0.8, marsX, marsY, marsRadius * 1.35);
      marsGlow.addColorStop(0, "rgba(239, 68, 68, 0.35)");
      marsGlow.addColorStop(0.7, "rgba(185, 28, 28, 0.12)");
      marsGlow.addColorStop(1, "transparent");
      ctx.fillStyle = marsGlow;
      ctx.beginPath();
      ctx.arc(marsX, marsY, marsRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(marsX, marsY, marsRadius, 0, Math.PI * 2);
      ctx.clip();
      const marsGrad = ctx.createRadialGradient(marsX - marsRadius * 0.3, marsY - marsRadius * 0.3, marsRadius * 0.1, marsX, marsY, marsRadius);
      marsGrad.addColorStop(0, "#ea580c");
      marsGrad.addColorStop(0.4, "#c2410c");
      marsGrad.addColorStop(0.85, "#991b1b");
      marsGrad.addColorStop(1, "#450a0a");
      ctx.fillStyle = marsGrad;
      ctx.fillRect(marsX - marsRadius, marsY - marsRadius, marsRadius * 2, marsRadius * 2);
      ctx.fillStyle = "rgba(69, 10, 10, 0.65)";
      ctx.beginPath();
      ctx.ellipse(marsX + marsRadius * 0.15, marsY + marsRadius * 0.1, marsRadius * 0.45, marsRadius * 0.2, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#450a0a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(marsX - marsRadius * 0.4, marsY + marsRadius * 0.05);
      ctx.lineTo(marsX + marsRadius * 0.2, marsY + marsRadius * 0.15);
      ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.ellipse(marsX, marsY - marsRadius * 0.82, marsRadius * 0.35, marsRadius * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(marsX - marsRadius * 1.5, marsY - marsRadius * 0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(marsX + marsRadius * 1.6, marsY + marsRadius * 0.8, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 8px 'Orbitron', monospace";
      ctx.fillStyle = "#f87171";
      ctx.fillText("\u{1F534} MARTE [1.5 UA]", marsX - 25, marsY + marsRadius + 14);
    }
    /**
     * Cinturón de Asteroides entre Marte y Júpiter:
     * Rocas espaciales con polígonos irregulares, rotación procedural y sombreado 3D.
     */
    drawAsteroidBelt(ctx, w, h, distanceRatio) {
      const beltProgress = (distanceRatio - 0.26) / 0.24;
      const beltAlpha = Math.sin(beltProgress * Math.PI);
      if (beltAlpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = beltAlpha * 0.85;
      for (const a of this.spaceAsteroids) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(a.poly[0].x + 2, a.poly[0].y + 2);
        for (let i = 1; i < a.poly.length; i++) {
          ctx.lineTo(a.poly[i].x + 2, a.poly[i].y + 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = a.color;
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.poly[0].x, a.poly[0].y);
        for (let i = 1; i < a.poly.length; i++) {
          ctx.lineTo(a.poly[i].x, a.poly[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.beginPath();
        ctx.arc(a.radius * 0.25, a.radius * 0.2, a.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    /**
     * Júpiter visible con sus bandas atmosféricas de gas y la Gran Mancha Roja.
     * Intercepta el Sublíder JOVIAN CORE al 40% y se aleja hacia abajo antes de Saturno.
     */
    drawDistantJupiter(ctx, w, h, distanceRatio) {
      const norm = (distanceRatio - 0.3) / 0.23;
      let alpha = 1;
      let yScrollOffset = 0;
      if (distanceRatio < 0.34) {
        alpha = Math.max(0, (distanceRatio - 0.3) / 0.04);
      } else if (distanceRatio > 0.44) {
        const exitP = (distanceRatio - 0.44) / 0.09;
        alpha = Math.max(0, 1 - exitP);
        yScrollOffset = exitP * exitP * 380;
      }
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      const jupRadius = 46 + Math.sin(Math.min(1, norm * 1.5) * Math.PI * 0.5) * 8;
      const jupX = w * 0.28;
      const jupY = 95 + norm * 35 + yScrollOffset;
      const jupGlow = ctx.createRadialGradient(jupX, jupY, jupRadius * 0.75, jupX, jupY, jupRadius * 1.32);
      jupGlow.addColorStop(0, "rgba(249, 115, 22, 0.35)");
      jupGlow.addColorStop(0.65, "rgba(234, 88, 12, 0.1)");
      jupGlow.addColorStop(1, "transparent");
      ctx.fillStyle = jupGlow;
      ctx.beginPath();
      ctx.arc(jupX, jupY, jupRadius * 1.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(jupX, jupY, jupRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#c2410c";
      ctx.fillRect(jupX - jupRadius, jupY - jupRadius, jupRadius * 2, jupRadius * 2);
      const bands = ["#ea580c", "#fed7aa", "#9a3412", "#fdba74", "#7c2d12", "#f97316", "#fed7aa", "#c2410c"];
      const bandHeight = jupRadius * 2 / bands.length;
      bands.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(jupX - jupRadius, jupY - jupRadius + i * bandHeight, jupRadius * 2, bandHeight * 0.72);
      });
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.ellipse(jupX + jupRadius * 0.32, jupY + jupRadius * 0.22, jupRadius * 0.24, jupRadius * 0.14, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha;
      const moons = [
        { name: "\xCDo", dist: -1.45, yOff: -0.2, r: 2.2, color: "#fef08a" },
        { name: "Europa", dist: -1.9, yOff: 0.1, r: 1.8, color: "#e0f2fe" },
        { name: "Gan\xEDmedes", dist: 1.5, yOff: -0.15, r: 2.5, color: "#cbd5e1" },
        { name: "Calisto", dist: 2.05, yOff: 0.25, r: 2.3, color: "#94a3b8" }
      ];
      for (const m of moons) {
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(jupX + jupRadius * m.dist, jupY + jupRadius * m.yOff, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = "bold 8px 'Orbitron', monospace";
      ctx.fillStyle = "#fb923c";
      ctx.fillText("\u{1F7E0} J\xDAPITER [5.2 UA] \xB7 \xD3RBITA DE SUBL\xCDDER", jupX - 60, jupY + jupRadius + 14);
      ctx.restore();
    }
    /**
     * Transición del vacío profundo y aceleración subespacial entre Júpiter (5.2 UA) y Saturno (9.5 UA)
     */
    drawSubspaceTransition(ctx, w, h, distanceRatio) {
      const p = (distanceRatio - 0.5) / 0.18;
      const alpha = Math.sin(p * Math.PI) * 0.75;
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.2;
      const time = this.scrollY * 0.8;
      for (let i = 0; i < 22; i++) {
        const sx = (i * 37 + 19) % w;
        const sy = (time * (1.2 + i % 5 * 0.3) + i * 45) % (h + 60) - 30;
        const sLen = 25 + i % 4 * 15;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + sLen);
        ctx.stroke();
      }
      ctx.restore();
    }
    /**
     * Saturno aproximándose con proporciones astronómicas perfectas,
     * anillos 3D esbeltos, división de Cassini, sombra planetaria y Titán.
     * Aparece a partir de 0.66 en el horizonte espacial, completamente separado de Júpiter.
     */
    drawApproachingSaturn(ctx, w, h, distanceRatio) {
      const p = Math.min(1, (distanceRatio - 0.66) / 0.24);
      let alpha = 1;
      if (distanceRatio < 0.7) {
        alpha = Math.max(0, (distanceRatio - 0.66) / 0.04);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      const satRadius = 26 + p * 30;
      const satX = w * 0.5;
      const satY = 72 + p * 36;
      const ringTilt = 0.28;
      const ringAngle = -0.22;
      ctx.translate(satX, satY);
      ctx.rotate(ringAngle);
      const satGlow = ctx.createRadialGradient(0, 0, satRadius * 0.8, 0, 0, satRadius * 2.1);
      satGlow.addColorStop(0, "rgba(253, 230, 138, 0.32)");
      satGlow.addColorStop(0.65, "rgba(245, 158, 11, 0.10)");
      satGlow.addColorStop(1, "transparent");
      ctx.fillStyle = satGlow;
      ctx.beginPath();
      ctx.arc(0, 0, satRadius * 2.1, 0, Math.PI * 2);
      ctx.fill();
      this.drawSaturnRingArc(ctx, satRadius, ringTilt, Math.PI, Math.PI * 2);
      ctx.fillStyle = "rgba(1, 3, 10, 0.88)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(satRadius * 0.85, -satRadius * 2.22 * ringTilt);
      ctx.lineTo(satRadius * 2.1, -satRadius * 1.4 * ringTilt);
      ctx.lineTo(satRadius * 0.9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, satRadius, 0, Math.PI * 2);
      ctx.clip();
      const satGrad = ctx.createRadialGradient(-satRadius * 0.25, -satRadius * 0.25, satRadius * 0.1, 0, 0, satRadius);
      satGrad.addColorStop(0, "#fef08a");
      satGrad.addColorStop(0.35, "#fde68a");
      satGrad.addColorStop(0.7, "#f59e0b");
      satGrad.addColorStop(0.95, "#b45309");
      satGrad.addColorStop(1, "#78350f");
      ctx.fillStyle = satGrad;
      ctx.fillRect(-satRadius, -satRadius, satRadius * 2, satRadius * 2);
      const satBands = [
        { y: -0.6, h: 0.18, col: "rgba(253, 230, 138, 0.35)" },
        { y: -0.35, h: 0.14, col: "rgba(245, 158, 11, 0.25)" },
        { y: -0.1, h: 0.12, col: "rgba(217, 119, 6, 0.3)" },
        { y: 0.15, h: 0.16, col: "rgba(254, 240, 138, 0.3)" },
        { y: 0.45, h: 0.22, col: "rgba(180, 83, 9, 0.25)" }
      ];
      for (const b of satBands) {
        ctx.fillStyle = b.col;
        ctx.fillRect(-satRadius, b.y * satRadius, satRadius * 2, b.h * satRadius);
      }
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.beginPath();
      ctx.ellipse(0, 0, satRadius * 0.98, satRadius * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(163, 230, 53, 0.45)";
      ctx.beginPath();
      ctx.ellipse(0, -satRadius * 0.85, satRadius * 0.24, satRadius * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      this.drawSaturnRingArc(ctx, satRadius, ringTilt, 0, Math.PI);
      const titanX = satRadius * 2.35;
      const titanY = -satRadius * 0.55;
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(titanX, titanY, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = "bold 9px 'Orbitron', monospace";
      ctx.fillStyle = "#fde047";
      ctx.fillText("\u{1FA90} SATURNO [9.5 UA] \xB7 ANILLOS EN RANGO", -90, satRadius + 24);
      ctx.restore();
    }
    /**
     * Traza los arcos concéntricos de los anillos de Saturno (con División de Cassini)
     */
    drawSaturnRingArc(ctx, satRadius, ringTilt, startAngle, endAngle) {
      const rxOuter = satRadius * 2.22;
      const ryOuter = rxOuter * ringTilt;
      const rxCassiniOut = satRadius * 1.88;
      const ryCassiniOut = rxCassiniOut * ringTilt;
      const rxCassiniIn = satRadius * 1.76;
      const ryCassiniIn = rxCassiniIn * ringTilt;
      const rxInner = satRadius * 1.35;
      const ryInner = rxInner * ringTilt;
      ctx.fillStyle = "rgba(253, 230, 138, 0.72)";
      ctx.beginPath();
      ctx.ellipse(0, 0, rxOuter, ryOuter, 0, startAngle, endAngle, false);
      ctx.ellipse(0, 0, rxCassiniOut, ryCassiniOut, 0, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(2, 6, 18, 0.90)";
      ctx.beginPath();
      ctx.ellipse(0, 0, rxCassiniOut, ryCassiniOut, 0, startAngle, endAngle, false);
      ctx.ellipse(0, 0, rxCassiniIn, ryCassiniIn, 0, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
      ctx.beginPath();
      ctx.ellipse(0, 0, rxCassiniIn, ryCassiniIn, 0, startAngle, endAngle, false);
      ctx.ellipse(0, 0, rxInner, ryInner, 0, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(217, 119, 6, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 0, rxInner, ryInner, 0, startAngle, endAngle, false);
      ctx.ellipse(0, 0, satRadius * 1.08, satRadius * 1.08 * ringTilt, 0, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
    }
    /**
     * Cartela táctica inferior de avance por el sistema solar
     */
    renderSolarPositionBanner(ctx, w, h, distanceRatio) {
      let regionText = "DESPEGUE ORBITAL: DEJANDO LA TIERRA \xB7 RUMBO AL SISTEMA SOLAR EXTERIOR";
      let subText = "Aceleraci\xF3n de escape gravitatorio - Motores de iones al 100%";
      if (distanceRatio > 0.2 && distanceRatio <= 0.35) {
        regionText = "PASANDO \xD3RBITA DE MARTE [1.5 UA] \xB7 APROXIMACI\xD3N A ZONA DE ASTEROIDES";
        subText = "Escaneando superficie marciana - Sin hostiles detectados en la \xF3rbita roja";
      } else if (distanceRatio > 0.35 && distanceRatio <= 0.5) {
        regionText = "CINTUR\xD3N DE ASTEROIDES & \xD3RBITA DE J\xDAPITER [5.2 UA] \xB7 INTERCEPCI\xD3N SUBL\xCDDER";
        subText = "Navegando campo de rocas espaciales - Subl\xEDder Jovian Core detectado";
      } else if (distanceRatio > 0.5 && distanceRatio <= 0.66) {
        regionText = "SUPERANDO J\xDAPITER \xB7 ACELERACI\xD3N SUBESPACIAL RUMBO A SATURNO [9.5 UA]";
        subText = "Salto hiperb\xF3lico de 4.3 UA a trav\xE9s del vac\xEDo del sistema solar exterior";
      } else if (distanceRatio > 0.66) {
        regionText = "LLEGADA A SATURNO [9.5 UA] \xB7 ANILLOS EN RANGO VISUAL \xB7 ALERTA DE JEFE FINAL";
        subText = "Estaci\xF3n Tit\xE1n de Vektor interceptada en los anillos exteriores";
      }
      ctx.save();
      ctx.fillStyle = "rgba(7, 10, 24, 0.82)";
      ctx.fillRect(w / 2 - 215, h - 38, 430, 30);
      ctx.strokeStyle = distanceRatio > 0.75 ? "#f59e0b" : "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 - 215, h - 38, 430, 30);
      ctx.font = "9px 'Orbitron', monospace";
      ctx.fillStyle = distanceRatio > 0.75 ? "#fbbf24" : "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText(regionText, w / 2, h - 22);
      ctx.font = "8px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(subText, w / 2, h - 11);
      ctx.restore();
    }
    /**
     * Radar táctico del Sistema Solar en la esquina inferior izquierda:
     * Muestra las órbitas de Tierra, Marte, Cinturón, Júpiter y Saturno con telemetría en UA.
     */
    renderSolarSystemRadar(ctx, distanceRatio) {
      const rx = 15;
      const ry = this.canvas.height - 145;
      const rw = 100;
      const rh = 135;
      ctx.save();
      ctx.fillStyle = "rgba(7, 12, 26, 0.88)";
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 8px 'Orbitron', monospace";
      ctx.fillText("RADAR SOLAR", rx + 8, ry + 12);
      const centerX = rx + rw / 2;
      const sunY = ry + rh - 16;
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(centerX, sunY, 6, 0, Math.PI * 2);
      ctx.fill();
      const orbits = [
        { r: 24, col: "rgba(56, 189, 248, 0.35)", name: "Tierra" },
        { r: 42, col: "rgba(239, 68, 68, 0.35)", name: "Marte" },
        { r: 62, col: "rgba(148, 163, 184, 0.25)", isDash: true, name: "Cintur\xF3n" },
        { r: 84, col: "rgba(249, 115, 22, 0.35)", name: "J\xFApiter" },
        { r: 108, col: "rgba(253, 230, 138, 0.45)", name: "Saturno" }
      ];
      for (const orb of orbits) {
        ctx.strokeStyle = orb.col;
        ctx.lineWidth = 1;
        if (orb.isDash) ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.ellipse(centerX, sunY, orb.r, orb.r * 0.72, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        if (orb.isDash) ctx.setLineDash([]);
      }
      ctx.strokeStyle = "#38bdf8";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, sunY - 24);
      ctx.lineTo(centerX, sunY - 108);
      ctx.stroke();
      ctx.setLineDash([]);
      const currentDist = 24 + distanceRatio * (108 - 24);
      const shipY = sunY - currentDist;
      ctx.fillStyle = "#ff0055";
      ctx.beginPath();
      ctx.arc(centerX, shipY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, shipY, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "8px monospace";
      ctx.fillStyle = "#34d399";
      const au = (1 + distanceRatio * 8.5).toFixed(1);
      ctx.fillText(`DIST: ${au} UA`, rx + 10, ry + rh - 13);
      ctx.fillText(`DEST: SATURNO`, rx + 10, ry + rh - 3);
      ctx.restore();
    }
    // ==========================================
    // ESCENARIO 4: EL CÍRCULO ÁRTICO: DE GROENLANDIA AL POLO NORTE (MAPA GEOGRÁFICO REAL)
    // ==========================================
    renderStage4_IceZone(ctx, w, h, distanceRatio) {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      oceanGrad.addColorStop(0, "#021326");
      oceanGrad.addColorStop(0.5, "#04223f");
      oceanGrad.addColorStop(1, "#02182e");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.09)";
      ctx.lineWidth = 1.2;
      const waveOffset = this.scrollY * 0.25 % 40;
      for (let wy = waveOffset; wy < h; wy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.bezierCurveTo(w * 0.25, wy + 6, w * 0.75, wy - 6, w, wy);
        ctx.stroke();
      }
      const totalMapHeight = 3600;
      const scrollMapY = distanceRatio * (totalMapHeight - h);
      ctx.save();
      ctx.translate(0, -scrollMapY);
      this.drawArcticContinents(ctx, w, h);
      this.drawFloatingIcebergs(ctx, w);
      ctx.restore();
      this.drawAuroraBorealis(ctx, w, h);
      this.drawSnowBlizzard(ctx);
      this.renderArcticPositionBanner(ctx, w, h, distanceRatio);
      this.renderPolarStereographicRadar(ctx, distanceRatio);
    }
    /**
     * Traza la geografía real del Círculo Ártico, Groenlandia, Banquisa y Polo Norte
     */
    drawArcticContinents(ctx, w, h) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(0, 130);
      ctx.lineTo(w, 130);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "bold 9px 'Orbitron', monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`\u{1F310} C\xCDRCULO POLAR \xC1RTICO \xB7 PARALELO 66\xB033'49" N`, 20, 122);
      ctx.textAlign = "right";
      ctx.fillText("TEMP AGUA: -1.8\xB0C \xB7 INGRESO AL CASQUETE BOREAL", w - 20, 122);
      ctx.textAlign = "left";
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.12, 220);
      ctx.lineTo(w * 0.18, 190);
      ctx.lineTo(w * 0.28, 180);
      ctx.lineTo(w * 0.35, 230);
      ctx.lineTo(w * 0.36, 340);
      ctx.lineTo(w * 0.31, 440);
      ctx.lineTo(w * 0.22, 510);
      ctx.lineTo(w * 0.14, 460);
      ctx.lineTo(w * 0.08, 380);
      ctx.lineTo(w * 0.06, 280);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(w * 0.14, 240);
      ctx.lineTo(w * 0.24, 220);
      ctx.lineTo(w * 0.32, 270);
      ctx.lineTo(w * 0.28, 420);
      ctx.lineTo(w * 0.16, 430);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.ellipse(w * 0.25, 360, 28, 20, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.ellipse(w * 0.13, 440, 8, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 9px 'Orbitron', monospace";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText("ISLANDIA [64\xB0N - 66\xB0N] \xB7 TIERRA DE HIELO Y VOLCANES", w * 0.1, 535);
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.76, 320);
      ctx.lineTo(w * 0.84, 300);
      ctx.lineTo(w * 0.9, 360);
      ctx.lineTo(w * 0.88, 520);
      ctx.lineTo(w * 0.8, 580);
      ctx.lineTo(w * 0.74, 520);
      ctx.lineTo(w * 0.72, 410);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.ellipse(w * 0.81, 420, 22, 55, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(w * 0.89, 360, 18, 28, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.ellipse(w * 0.89, 360, 13, 20, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(w * 0.86, 620, 14, 20, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = "bold 9px 'Orbitron', monospace";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText("SVALBARD [78\xB0N] \xB7 B\xD3VEDA GLOBAL DE SEMILLAS", w * 0.65, 710);
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.48, 850);
      ctx.lineTo(w * 0.38, 930);
      ctx.lineTo(w * 0.26, 1060);
      ctx.lineTo(w * 0.18, 1220);
      ctx.lineTo(w * 0.12, 1360);
      ctx.lineTo(w * 0.16, 1480);
      ctx.lineTo(w * 0.11, 1620);
      ctx.lineTo(w * 0.15, 1800);
      ctx.lineTo(w * 0.19, 2020);
      ctx.lineTo(w * 0.28, 2200);
      ctx.lineTo(w * 0.45, 2280);
      ctx.lineTo(w * 0.58, 2270);
      ctx.lineTo(w * 0.72, 2180);
      ctx.lineTo(w * 0.82, 1980);
      ctx.lineTo(w * 0.88, 1720);
      ctx.lineTo(w * 0.84, 1500);
      ctx.lineTo(w * 0.9, 1320);
      ctx.lineTo(w * 0.79, 1300);
      ctx.lineTo(w * 0.86, 1220);
      ctx.lineTo(w * 0.78, 1080);
      ctx.lineTo(w * 0.65, 960);
      ctx.lineTo(w * 0.54, 880);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const inlandisGrad = ctx.createLinearGradient(0, 950, 0, 2200);
      inlandisGrad.addColorStop(0, "#e2e8f0");
      inlandisGrad.addColorStop(0.2, "#f8fafc");
      inlandisGrad.addColorStop(0.7, "#ffffff");
      inlandisGrad.addColorStop(1, "#e0f2fe");
      ctx.fillStyle = inlandisGrad;
      ctx.beginPath();
      ctx.moveTo(w * 0.48, 920);
      ctx.lineTo(w * 0.32, 1040);
      ctx.lineTo(w * 0.24, 1200);
      ctx.lineTo(w * 0.18, 1350);
      ctx.lineTo(w * 0.21, 1520);
      ctx.lineTo(w * 0.18, 1700);
      ctx.lineTo(w * 0.22, 1920);
      ctx.lineTo(w * 0.32, 2120);
      ctx.lineTo(w * 0.52, 2210);
      ctx.lineTo(w * 0.68, 2120);
      ctx.lineTo(w * 0.76, 1920);
      ctx.lineTo(w * 0.81, 1680);
      ctx.lineTo(w * 0.77, 1420);
      ctx.lineTo(w * 0.8, 1200);
      ctx.lineTo(w * 0.7, 1040);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(186, 230, 253, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.85)";
      ctx.lineWidth = 2;
      const crevasses = [
        { x1: w * 0.35, y1: 1080, x2: w * 0.52, y2: 1110, x3: w * 0.65, y3: 1090 },
        { x1: w * 0.28, y1: 1240, x2: w * 0.44, y2: 1270, x3: w * 0.58, y3: 1250 },
        { x1: w * 0.42, y1: 1390, x2: w * 0.59, y2: 1420, x3: w * 0.74, y3: 1390 },
        { x1: w * 0.3, y1: 1720, x2: w * 0.48, y2: 1750, x3: w * 0.66, y3: 1730 },
        { x1: w * 0.38, y1: 1910, x2: w * 0.55, y2: 1940, x3: w * 0.72, y3: 1900 },
        { x1: w * 0.45, y1: 2060, x2: w * 0.58, y2: 2090, x3: w * 0.68, y3: 2070 }
      ];
      for (const c of crevasses) {
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.lineTo(c.x3, c.y3);
        ctx.stroke();
      }
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.ellipse(w * 0.38, 1160, 16, 9, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.62, 1340, 20, 11, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.46, 1820, 18, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 11px 'Orbitron', monospace";
      ctx.fillStyle = "#0369a1";
      ctx.fillText("GROENLANDIA (KALAALLIT NUNAAT)", w * 0.24, 1135);
      ctx.font = "9px 'Orbitron', monospace";
      ctx.fillStyle = "#0284c7";
      ctx.fillText("INLANDIS: CASQUETE DE HIELO CONTINENTAL [3,200m]", w * 0.22, 1150);
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("FIORDO DE ILULISSAT [69\xB0N] \u2794", w * 0.04, 1370);
      ctx.fillText("SCORESBY SUND [70\xB0N] \u2794", w * 0.68, 1290);
      ctx.save();
      const radarBaseX = w * 0.5;
      const radarBaseY = 1540;
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = i / 6 * Math.PI * 2;
        const hx = radarBaseX + Math.cos(ang) * 48;
        const hy = radarBaseY + Math.sin(ang) * 48;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#00f3ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(radarBaseX - 48, radarBaseY);
      ctx.lineTo(radarBaseX - 85, radarBaseY);
      ctx.moveTo(radarBaseX + 48, radarBaseY);
      ctx.lineTo(radarBaseX + 85, radarBaseY);
      ctx.stroke();
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(radarBaseX, radarBaseY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.stroke();
      const sweepAngle = this.scrollY * 0.05 % (Math.PI * 2);
      ctx.fillStyle = "rgba(0, 243, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(radarBaseX, radarBaseY);
      ctx.arc(radarBaseX, radarBaseY, 44, sweepAngle, sweepAngle + 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.font = "bold 10px 'Orbitron', monospace";
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "center";
      ctx.fillText("\u26A0\uFE0F PUESTO RADAR THULE \xB7 BASTI\xD3N SUBL\xCDDER", radarBaseX, radarBaseY + 68);
      ctx.font = "8px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("INTERCEPCI\xD3N CRIOG\xC9NICA: FROST-BITE DETECTADO", radarBaseX, radarBaseY + 80);
      ctx.textAlign = "left";
      ctx.restore();
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 2250);
      ctx.lineTo(w * 0.22, 2280);
      ctx.lineTo(w * 0.28, 2380);
      ctx.lineTo(w * 0.24, 2520);
      ctx.lineTo(w * 0.16, 2640);
      ctx.lineTo(0, 2680);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(0, 2300);
      ctx.lineTo(w * 0.18, 2330);
      ctx.lineTo(w * 0.2, 2460);
      ctx.lineTo(w * 0.12, 2560);
      ctx.lineTo(0, 2600);
      ctx.closePath();
      ctx.fill();
      ctx.font = "bold 9px 'Orbitron', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("ISLA ELLESMERE [CANAD\xC1 \xB7 83\xB0N]", 15, 2480);
      ctx.fillText("ESTRECHO DE NARES \u2794", w * 0.26, 2450);
      this.drawSeaIcePack(ctx, w, 2320, 2960);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 2750);
      ctx.lineTo(w, 2750);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "bold 9px 'Orbitron', monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`PARALELO 85\xB000'00" N \xB7 OC\xC9ANO GLACIAL CENTRAL (BANQUISA PERPETUA)`, 20, 2742);
      const poleX = w * 0.5;
      const poleY = 3380;
      const poleGrad = ctx.createRadialGradient(poleX, poleY, 30, poleX, poleY, 340);
      poleGrad.addColorStop(0, "#ffffff");
      poleGrad.addColorStop(0.4, "#f0f9ff");
      poleGrad.addColorStop(0.8, "#e0f2fe");
      poleGrad.addColorStop(1, "rgba(224, 242, 254, 0.4)");
      ctx.fillStyle = poleGrad;
      ctx.beginPath();
      ctx.arc(poleX, poleY, 320, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(poleX, poleY, 240, 0, Math.PI * 2);
      ctx.arc(poleX, poleY, 150, 0, Math.PI * 2);
      ctx.arc(poleX, poleY, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.2;
      for (let m = 0; m < 8; m++) {
        const ang = m / 8 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(poleX - Math.cos(ang) * 280, poleY - Math.sin(ang) * 280);
        ctx.lineTo(poleX + Math.cos(ang) * 280, poleY + Math.sin(ang) * 280);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(poleX, poleY);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -65);
      ctx.lineTo(0, 65);
      ctx.moveTo(-65, 0);
      ctx.lineTo(65, 0);
      ctx.stroke();
      ctx.font = "bold 10px 'Orbitron', monospace";
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "center";
      ctx.fillText("S", 0, 80);
      ctx.fillText("S", 0, -72);
      ctx.fillText("S", 80, 4);
      ctx.fillText("S", -80, 4);
      ctx.restore();
      ctx.save();
      ctx.translate(poleX, poleY);
      ctx.fillStyle = "rgba(10, 15, 30, 0.95)";
      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = i / 8 * Math.PI * 2;
        const bx = Math.cos(ang) * 115;
        const by = Math.sin(ang) * 115;
        if (i === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const coreGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 48);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.3, "#00f3ff");
      coreGrad.addColorStop(0.8, "#0284c7");
      coreGrad.addColorStop(1, "rgba(15, 23, 42, 0.9)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      const ringAngle = -(this.scrollY * 0.04);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 36, ringAngle, ringAngle + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const blink = Math.sin(this.scrollY * 0.1) > 0;
      ctx.fillStyle = blink ? "#ef4444" : "#7f1d1d";
      for (let i = 0; i < 8; i++) {
        const ang = i / 8 * Math.PI * 2 + Math.PI / 8;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 98, Math.sin(ang) * 98, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = "bold 12px 'Orbitron', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("\u2605 POLO NORTE GEOGR\xC1FICO \u2605", 0, -135);
      ctx.font = "bold 10px 'Orbitron', monospace";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`LATITUD 90\xB000'00" N \xB7 CONVERGENCIA TOTAL`, 0, -120);
      ctx.font = "bold 10px 'Orbitron', monospace";
      ctx.fillStyle = "#ff0055";
      ctx.fillText("\u2620\uFE0F CIUDADELA SUBGLACIAL VEKTOR \xB7 JEFE: ZERO-KELVIN", 0, 142);
      ctx.font = "8px monospace";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("PROTOCOLO DE CONGELACI\xD3N ABSOLUTA ACTIVADO", 0, 155);
      ctx.restore();
    }
    /**
     * Genera el mosaico de la banquisa polar fracturada con placas flotantes y polinias
     */
    drawSeaIcePack(ctx, w, startY, endY) {
      const floeRows = 7;
      const floeCols = 5;
      const cellW = w / floeCols;
      const cellH = (endY - startY) / floeRows;
      ctx.fillStyle = "rgba(240, 249, 255, 0.88)";
      ctx.strokeStyle = "rgba(14, 165, 233, 0.55)";
      ctx.lineWidth = 2;
      for (let r = 0; r < floeRows; r++) {
        for (let c = 0; c < floeCols; c++) {
          const cx = c * cellW + cellW / 2;
          const cy = startY + r * cellH + cellH / 2;
          const radX = cellW * 0.42;
          const radY = cellH * 0.38;
          ctx.beginPath();
          const pts = 6;
          for (let p = 0; p < pts; p++) {
            const ang = p / pts * Math.PI * 2;
            const px = cx + Math.cos(ang) * (radX + (p % 2 * 6 - 3));
            const py = cy + Math.sin(ang) * (radY + ((p + 1) % 2 * 6 - 3));
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.beginPath();
          ctx.moveTo(cx - radX * 0.4, cy);
          ctx.lineTo(cx + radX * 0.4, cy + 4);
          ctx.stroke();
        }
      }
    }
    /**
     * Dibuja los témpanos de hielo (icebergs) que flotan a la deriva
     */
    drawFloatingIcebergs(ctx, w) {
      for (const berg of this.arcticIcebergs) {
        ctx.save();
        ctx.translate(berg.x, berg.y);
        ctx.rotate(berg.rotation);
        ctx.fillStyle = berg.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, berg.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        for (let p = 0; p < berg.poly.length; p++) {
          const pt = berg.poly[p];
          if (p === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(147, 197, 253, 0.45)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let p = 0; p < Math.floor(berg.poly.length / 2) + 1; p++) {
          const pt = berg.poly[p];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    }
    /**
     * Cortinas ondeantes de Aurora Boreal en la alta atmósfera (Verde esmeralda y violeta)
     */
    drawAuroraBorealis(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const time = this.scrollY * 0.02;
      const grad1 = ctx.createLinearGradient(0, 0, 0, h * 0.42);
      grad1.addColorStop(0, "rgba(16, 185, 129, 0.28)");
      grad1.addColorStop(0.5, "rgba(52, 211, 153, 0.16)");
      grad1.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= w; x += 25) {
        const y = 35 + Math.sin(x * 8e-3 + time) * 32 + Math.cos(x * 0.016 - time * 0.8) * 18;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fill();
      const grad2 = ctx.createLinearGradient(0, 0, 0, h * 0.52);
      grad2.addColorStop(0, "rgba(6, 182, 212, 0.24)");
      grad2.addColorStop(0.6, "rgba(168, 85, 247, 0.14)");
      grad2.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= w; x += 30) {
        const y = 65 + Math.sin(x * 0.01 - time * 0.7) * 40 + Math.sin(x * 0.022 + time * 1.1) * 14;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    /**
     * Ventisca de nieve polar con copos brillantes
     */
    drawSnowBlizzard(ctx) {
      ctx.fillStyle = "rgba(240, 249, 255, 0.88)";
      for (const flake of this.snowflakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    /**
     * Cartela táctica inferior de coordenadas y avance geográfico por el Ártico
     */
    renderArcticPositionBanner(ctx, w, h, distanceRatio) {
      let regionText = "CRUCE DEL C\xCDRCULO POLAR \xC1RTICO [66\xB033' N] \xB7 MAR DE GROENLANDIA";
      let subText = "Sobrevolando aguas boreales entre Islandia y Svalbard \xB7 Rumbo al norte";
      if (distanceRatio > 0.22 && distanceRatio <= 0.55) {
        regionText = "ISLA DE GROENLANDIA (KALAALLIT NUNAAT) \xB7 INLANDIS GLACIAR [75\xB0N]";
        subText = "Sobrevolando casquete de hielo continental \xB7 Puesto Thule de Vektor en rango";
      } else if (distanceRatio > 0.55 && distanceRatio <= 0.8) {
        regionText = "BANQUISA POLAR FRACTURADA [82\xB0N - 87\xB0N] \xB7 ESTRECHO DE NARES";
        subText = "Hielo marino perpetuo y polinias \xB7 Convergencia de meridianos polar";
      } else if (distanceRatio > 0.8) {
        regionText = "POLO NORTE GEOGR\xC1FICO [90\xB000' N] \xB7 CIUDADELA SUBGLACIAL DE VEKTOR";
        subText = "\xA1Alerta m\xE1xima! Destructor Zero-Kelvin detectado en el eje polar";
      }
      ctx.save();
      ctx.fillStyle = "rgba(7, 10, 24, 0.85)";
      ctx.fillRect(w / 2 - 220, h - 38, 440, 30);
      ctx.strokeStyle = distanceRatio > 0.8 ? "#ff0055" : "rgba(56, 189, 248, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(w / 2 - 220, h - 38, 440, 30);
      ctx.font = "9px 'Orbitron', monospace";
      ctx.fillStyle = distanceRatio > 0.8 ? "#fbbf24" : "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText(regionText, w / 2, h - 22);
      ctx.font = "8px monospace";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(subText, w / 2, h - 11);
      ctx.restore();
    }
    /**
     * Radar Polar Estereográfico en la esquina inferior izquierda:
     * Proyección polar circular que muestra la travesía desde 66°33'N (borde) hasta 90°00'N (centro).
     */
    renderPolarStereographicRadar(ctx, distanceRatio) {
      const rx = 15;
      const ry = this.canvas.height - 150;
      const rw = 105;
      const rh = 140;
      ctx.save();
      ctx.fillStyle = "rgba(7, 14, 30, 0.92)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 8px 'Orbitron', monospace";
      ctx.fillText("RADAR POLAR", rx + 8, ry + 12);
      const centerX = rx + rw / 2;
      const centerY = ry + rh / 2 + 5;
      const maxRadius = 46;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 5, centerY);
      ctx.lineTo(centerX + 5, centerY);
      ctx.moveTo(centerX, centerY - 5);
      ctx.lineTo(centerX, centerY + 5);
      ctx.stroke();
      ctx.fillStyle = "rgba(224, 242, 254, 0.3)";
      ctx.beginPath();
      ctx.moveTo(centerX - 4, centerY + maxRadius * 0.88);
      ctx.lineTo(centerX - 16, centerY + maxRadius * 0.65);
      ctx.lineTo(centerX - 12, centerY + maxRadius * 0.22);
      ctx.lineTo(centerX + 6, centerY + maxRadius * 0.26);
      ctx.lineTo(centerX + 12, centerY + maxRadius * 0.68);
      ctx.closePath();
      ctx.fill();
      const currentR = maxRadius * (1 - distanceRatio);
      const shipX = centerX;
      const shipY = centerY + currentR;
      ctx.strokeStyle = "rgba(0, 243, 255, 0.6)";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + maxRadius);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff0055";
      ctx.beginPath();
      ctx.arc(shipX, shipY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(shipX, shipY, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "8px monospace";
      ctx.fillStyle = "#34d399";
      const currentLat = (66.56 + distanceRatio * (90 - 66.56)).toFixed(1);
      ctx.fillText(`LAT: ${currentLat}\xB0 N`, rx + 8, ry + rh - 13);
      ctx.fillText(distanceRatio > 0.8 ? "ZONA: POLO 90\xB0N" : "OBJ: POLO NORTE", rx + 8, ry + rh - 3);
      ctx.restore();
    }
    // ==========================================
    // ESCENARIO 5: JUNGLA CON DESTRUCCIÓN DE SUELO
    // ==========================================
    renderStage5_DestructibleJungle(ctx, w, h, distanceRatio) {
      ctx.fillStyle = "#052e16";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.moveTo(w * 0.4, 0);
      ctx.bezierCurveTo(w * 0.6, h * 0.3, w * 0.2, h * 0.7, w * 0.5, h);
      ctx.lineTo(w * 0.56, h);
      ctx.bezierCurveTo(w * 0.26, h * 0.7, w * 0.66, h * 0.3, w * 0.46, 0);
      ctx.closePath();
      ctx.fill();
      for (const crater of this.groundCraters) {
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        if (crater.smoke > 0.05) {
          ctx.fillStyle = `rgba(100, 116, 139, ${crater.smoke * 0.45})`;
          ctx.beginPath();
          ctx.arc(crater.x + (Math.random() * 8 - 4), crater.y - 10, crater.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (const tree of this.jungleTrees) {
        if (tree.isDestroyed) {
          ctx.fillStyle = "#27272a";
          ctx.beginPath();
          ctx.arc(tree.x, tree.y, tree.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#451a03";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tree.x - 6, tree.y);
          ctx.lineTo(tree.x + 6, tree.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = tree.color;
          ctx.beginPath();
          ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
          ctx.beginPath();
          ctx.arc(tree.x - 3, tree.y - 3, tree.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  // frontend/js/bosses.js
  var BossCatalog = {
    // ==========================================
    // 1. ESPECIFICACIONES DE SUBLÍDERES (40% FASE)
    // ==========================================
    getMidBoss(stageNumber) {
      switch (stageNumber) {
        case 1:
          return {
            slug: "mid_aurora_9",
            name: "AURORA-9 (SUBL\xCDDER)",
            title: "Bombardero Furtivo Suborbital",
            abilityName: "Bombardeo Hipers\xF3nico en V",
            abilityDesc: "R\xE1fagas supers\xF3nicas en V y torpedo s\xF3nico pesado",
            health: 320,
            maxHealth: 320,
            width: 74,
            height: 56,
            vy: 1.2,
            vxAmp: 4.2,
            shootInterval: 1.05,
            color: "#38bdf8",
            accentColor: "#0284c7",
            isBoss: true,
            isSubBoss: true,
            isFinalBoss: false,
            scoreValue: 1200
          };
        case 2:
          return {
            slug: "mid_nautilus_x",
            name: "NAUTILUS-X (SUBL\xCDDER)",
            title: "Corbeta Sumergible Abisal",
            abilityName: "Torpedos de Cavitaci\xF3n Abisal",
            abilityDesc: "Doble torpedo teledirigido y cortina de plasma marino",
            health: 440,
            maxHealth: 440,
            width: 78,
            height: 60,
            vy: 1.1,
            vxAmp: 4.6,
            shootInterval: 0.98,
            color: "#14b8a6",
            accentColor: "#0d9488",
            isBoss: true,
            isSubBoss: true,
            isFinalBoss: false,
            scoreValue: 1600
          };
        case 3:
          return {
            slug: "mid_jovian_core",
            name: "JOVIAN CORE (SUBL\xCDDER)",
            title: "Sonda de Fusi\xF3n Gravitatoria",
            abilityName: "V\xF3rtice Solar Espiral",
            abilityDesc: "Cuarteto de plasma en rotaci\xF3n constante y pulso de repulsi\xF3n",
            health: 560,
            maxHealth: 560,
            width: 80,
            height: 64,
            vy: 1,
            vxAmp: 5,
            shootInterval: 0.92,
            color: "#f97316",
            accentColor: "#ea580c",
            isBoss: true,
            isSubBoss: true,
            isFinalBoss: false,
            scoreValue: 2e3
          };
        case 4:
          return {
            slug: "mid_frost_bite",
            name: "FROST-BITE (SUBL\xCDDER)",
            title: "Caminante Glacial Criog\xE9nico",
            abilityName: "Ventisca de Agujas de Hielo",
            abilityDesc: "Cono veloz de agujas penetrantes y orbes de escarcha",
            health: 680,
            maxHealth: 680,
            width: 84,
            height: 66,
            vy: 0.95,
            vxAmp: 4.5,
            shootInterval: 0.85,
            color: "#7dd3fc",
            accentColor: "#38bdf8",
            isBoss: true,
            isSubBoss: true,
            isFinalBoss: false,
            scoreValue: 2400
          };
        case 5:
        default:
          return {
            slug: "mid_jungle_beast",
            name: "JUNGLE-BEAST (SUBL\xCDDER)",
            title: "Meca Blindado de Asalto Selv\xE1tico",
            abilityName: "Gatling de Asalto & Bombas Racimo",
            abilityDesc: "Ametrallamiento continuo en staccato y micro-bombas de fragmentaci\xF3n",
            health: 850,
            maxHealth: 850,
            width: 88,
            height: 70,
            vy: 0.9,
            vxAmp: 4.8,
            shootInterval: 0.78,
            color: "#84cc16",
            accentColor: "#65a30d",
            isBoss: true,
            isSubBoss: true,
            isFinalBoss: false,
            scoreValue: 3e3
          };
      }
    },
    // ==========================================
    // 2. ESPECIFICACIONES DE JEFES FINALES (85% FASE)
    // ==========================================
    getStageBoss(stageNumber) {
      switch (stageNumber) {
        case 1:
          return {
            slug: "boss_goliath_apex",
            name: "GOLIATH APEX (BOSS FASE 1)",
            title: "Fortaleza A\xE9rea Polar de Asalto",
            abilityName: "Tridente Polar & Cortina de Asedio",
            abilityDesc: "Tridente pesado frontal con cortina semicircular de 6 proyectiles",
            health: 680,
            maxHealth: 680,
            width: 108,
            height: 84,
            vy: 0.6,
            vxAmp: 5.5,
            shootInterval: 0.75,
            color: "#0284c7",
            accentColor: "#38bdf8",
            isBoss: true,
            isSubBoss: false,
            isFinalBoss: true,
            scoreValue: 3500
          };
        case 2:
          return {
            slug: "boss_leviathan_colossus",
            name: "LEVIATHAN COLOSSUS (BOSS FASE 2)",
            title: "Acorazado Suborbital del Pac\xEDfico",
            abilityName: "Pinza Kraken & Tsunami Hidromagn\xE9tico",
            abilityDesc: "Torpedos pesados guiados flanqueantes y abanico de plasma de alta presi\xF3n",
            health: 950,
            maxHealth: 950,
            width: 116,
            height: 88,
            vy: 0.55,
            vxAmp: 6,
            shootInterval: 0.7,
            color: "#0d9488",
            accentColor: "#14b8a6",
            isBoss: true,
            isSubBoss: false,
            isFinalBoss: true,
            scoreValue: 4500
          };
        case 3:
          return {
            slug: "boss_ganymede_titan",
            name: "GANYMEDE TITAN (BOSS FASE 3)",
            title: "Estaci\xF3n de Batalla de los Anillos de Saturno",
            abilityName: "Corona Solar & Railgun Hiperdenso",
            abilityDesc: "Erupci\xF3n radial de plasma solar en 360\xB0 y salva de railgun central",
            health: 1250,
            maxHealth: 1250,
            width: 122,
            height: 94,
            vy: 0.5,
            vxAmp: 6.2,
            shootInterval: 0.65,
            color: "#ea580c",
            accentColor: "#f97316",
            isBoss: true,
            isSubBoss: false,
            isFinalBoss: true,
            scoreValue: 6e3
          };
        case 4:
          return {
            slug: "boss_zero_kelvin",
            name: "ZERO-KELVIN (BOSS FASE 4)",
            title: "Destructor Criog\xE9nico Absoluto",
            abilityName: "Nova Cero Absoluto & Lanzas Glaciales",
            abilityDesc: "Salva helicoidal de 7 agujas cristalinas y nova radial de 10 orbes de hielo",
            health: 1600,
            maxHealth: 1600,
            width: 130,
            height: 100,
            vy: 0.45,
            vxAmp: 6.5,
            shootInterval: 0.6,
            color: "#38bdf8",
            accentColor: "#bae6fd",
            isBoss: true,
            isSubBoss: false,
            isFinalBoss: true,
            scoreValue: 8e3
          };
        case 5:
        default:
          return {
            slug: "boss_general_vektor",
            name: "GENERAL VEKTOR (BOSS PRINCIPAL FINAL)",
            title: "Supremo Acorazado Dreadnought Apex",
            abilityName: "Protocolo Juicio Imperial",
            abilityDesc: "Cu\xE1druple plasma carmes\xED y Sobrecarga Dorada Apocal\xEDptica al <40% HP",
            health: 2400,
            maxHealth: 2400,
            width: 148,
            height: 116,
            vy: 0.4,
            vxAmp: 7,
            shootInterval: 0.52,
            color: "#ff0055",
            accentColor: "#fbbf24",
            isBoss: true,
            isSubBoss: false,
            isFinalBoss: true,
            scoreValue: 15e3
          };
      }
    },
    // ==========================================
    // 3. IA DE DISPARO Y HABILIDADES ÚNICAS
    // ==========================================
    fireBossAttack(boss, player, enemyProjectiles, engine) {
      boss.attackCycle = (boss.attackCycle || 0) + 1;
      const now = performance.now();
      switch (boss.slug) {
        // ----------------------------------------------------
        // SUBLÍDER 1: AURORA-9 (Bombardero Furtivo Suborbital)
        // ----------------------------------------------------
        case "mid_aurora_9": {
          if (boss.attackCycle % 2 === 1) {
            [-3.2, -1.2, 1.2, 3.2].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 6,
                y: boss.y + 26,
                vx,
                vy: 6.4,
                damage: 13,
                radius: 4.5,
                color: "#38bdf8"
              });
            });
            Sound.playLaser();
          } else {
            enemyProjectiles.push({
              x: boss.x,
              y: boss.y + 30,
              vx: 0,
              vy: 7.4,
              damage: 22,
              radius: 8.5,
              color: "#e0f2fe",
              type: "plasma_orb"
            });
            [-2.2, 2.2].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 12,
                y: boss.y + 24,
                vx,
                vy: 5.6,
                damage: 12,
                radius: 4,
                color: "#38bdf8"
              });
            });
            Sound.playHeavyShot();
          }
          break;
        }
        // ----------------------------------------------------
        // SUBLÍDER 2: NAUTILUS-X (Corbeta Sumergible Abisal)
        // ----------------------------------------------------
        case "mid_nautilus_x": {
          enemyProjectiles.push({
            x: boss.x - 26,
            y: boss.y + 24,
            vx: -1.8,
            vy: 3.6,
            isHoming: true,
            type: "torpedo",
            radius: 6,
            damage: 18,
            color: "#2dd4bf"
          });
          enemyProjectiles.push({
            x: boss.x + 26,
            y: boss.y + 24,
            vx: 1.8,
            vy: 3.6,
            isHoming: true,
            type: "torpedo",
            radius: 6,
            damage: 18,
            color: "#2dd4bf"
          });
          [-1.4, 0, 1.4].forEach((vx) => {
            enemyProjectiles.push({
              x: boss.x + vx * 12,
              y: boss.y + 28,
              vx,
              vy: 5.2,
              type: "plasma_orb",
              radius: 5,
              damage: 14,
              color: "#14b8a6"
            });
          });
          Sound.playHeavyShot();
          break;
        }
        // ----------------------------------------------------
        // SUBLÍDER 3: JOVIAN CORE (Sonda de Fusión Gravitatoria)
        // ----------------------------------------------------
        case "mid_jovian_core": {
          boss.spiralAngle = (boss.spiralAngle || 0) + 0.42;
          for (let a = 0; a < 4; a++) {
            const ang = boss.spiralAngle + a * (Math.PI / 2);
            const spd = 5.2;
            enemyProjectiles.push({
              x: boss.x + Math.cos(ang) * 16,
              y: boss.y + Math.sin(ang) * 16,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              type: "plasma_orb",
              radius: 6,
              damage: 15,
              color: "#f97316"
            });
          }
          if (boss.attackCycle % 4 === 0) {
            engine.shockwaves.push({
              x: boss.x,
              y: boss.y,
              radius: 10,
              maxRadius: 180,
              color: "#fb923c",
              alpha: 0.85
            });
            Sound.playBeam();
          } else {
            Sound.playLaser();
          }
          break;
        }
        // ----------------------------------------------------
        // SUBLÍDER 4: FROST-BITE (Caminante Glacial Criogénico)
        // ----------------------------------------------------
        case "mid_frost_bite": {
          if (boss.attackCycle % 2 === 1) {
            [-3, -1.5, 0, 1.5, 3].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 5,
                y: boss.y + 28,
                vx,
                vy: 6.8,
                type: "frost_needle",
                radius: 4.5,
                damage: 12,
                color: "#bae6fd"
              });
            });
            Sound.playLaser();
          } else {
            [-22, 22].forEach((ox) => {
              enemyProjectiles.push({
                x: boss.x + ox,
                y: boss.y + 26,
                vx: ox > 0 ? 1.6 : -1.6,
                vy: 5.2,
                type: "plasma_orb",
                radius: 7.5,
                damage: 20,
                color: "#38bdf8"
              });
            });
            Sound.playHeavyShot();
          }
          break;
        }
        // ----------------------------------------------------
        // SUBLÍDER 5: JUNGLE-BEAST (Meca Blindado de Asalto)
        // ----------------------------------------------------
        case "mid_jungle_beast": {
          const podX = boss.attackCycle % 2 === 0 ? -28 : 28;
          enemyProjectiles.push({
            x: boss.x + podX - 4,
            y: boss.y + 32,
            vx: podX > 0 ? 0.8 : -0.8,
            vy: 7.2,
            damage: 11,
            radius: 4.5,
            color: "#a3e635"
          });
          enemyProjectiles.push({
            x: boss.x + podX + 4,
            y: boss.y + 32,
            vx: podX > 0 ? 1.2 : -1.2,
            vy: 7.5,
            damage: 11,
            radius: 4.5,
            color: "#84cc16"
          });
          Sound.playLaser();
          if (boss.attackCycle % 3 === 0) {
            [-2.2, 0, 2.2].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 8,
                y: boss.y + 30,
                vx,
                vy: 4.4,
                type: "cluster_bomb",
                radius: 6,
                damage: 16,
                color: "#facc15"
              });
            });
            Sound.playExplosion();
          }
          break;
        }
        // ====================================================
        // JEFE FINAL 1: GOLIATH APEX (Fortaleza Aérea Polar)
        // ====================================================
        case "boss_goliath_apex": {
          if (boss.attackCycle % 2 === 1) {
            [-2.2, 0, 2.2].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 14,
                y: boss.y + 38,
                vx,
                vy: 6.2,
                type: "plasma_orb",
                radius: 8,
                damage: 22,
                color: "#38bdf8"
              });
            });
            Sound.playHeavyShot();
          } else {
            [-3.6, -2.1, -0.7, 0.7, 2.1, 3.6].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 8,
                y: boss.y + 36,
                vx,
                vy: 5.2,
                radius: 5.5,
                damage: 16,
                color: "#0284c7"
              });
            });
            Sound.playLaser();
          }
          if (boss.health / boss.maxHealth < 0.5) {
            [-4, 4].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + Math.sign(vx) * 44,
                y: boss.y + 24,
                vx,
                vy: 6,
                radius: 5,
                damage: 15,
                color: "#e0f2fe"
              });
            });
          }
          break;
        }
        // ====================================================
        // JEFE FINAL 2: LEVIATHAN COLOSSUS (Acorazado del Pacífico)
        // ====================================================
        case "boss_leviathan_colossus": {
          enemyProjectiles.push({
            x: boss.x - 42,
            y: boss.y + 34,
            vx: -2.4,
            vy: 3.5,
            isHoming: true,
            type: "torpedo",
            radius: 7.5,
            damage: 24,
            color: "#2dd4bf"
          });
          enemyProjectiles.push({
            x: boss.x + 42,
            y: boss.y + 34,
            vx: 2.4,
            vy: 3.5,
            isHoming: true,
            type: "torpedo",
            radius: 7.5,
            damage: 24,
            color: "#2dd4bf"
          });
          const aimAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
          [-0.35, -0.18, 0, 0.18, 0.35].forEach((offset) => {
            const ang = aimAngle + offset;
            const spd = 5.8;
            enemyProjectiles.push({
              x: boss.x,
              y: boss.y + 40,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              type: "plasma_orb",
              radius: 6,
              damage: 18,
              color: "#14b8a6"
            });
          });
          Sound.playHeavyShot();
          break;
        }
        // ====================================================
        // JEFE FINAL 3: GANYMEDE TITAN (Estación Orbital Joviana)
        // ====================================================
        case "boss_ganymede_titan": {
          if (boss.attackCycle % 2 === 1) {
            for (let a = 0; a < 8; a++) {
              const ang = a * Math.PI / 4 + boss.attackCycle * 0.15;
              const spd = 5;
              enemyProjectiles.push({
                x: boss.x + Math.cos(ang) * 25,
                y: boss.y + Math.sin(ang) * 25,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                type: "plasma_orb",
                radius: 6.5,
                damage: 16,
                color: "#ea580c"
              });
            }
            Sound.playLaser();
          } else {
            const dx = player.x - boss.x;
            const dy = Math.max(80, player.y - boss.y);
            const dist = Math.hypot(dx, dy);
            const dirX = dx / dist * 8.2;
            const dirY = dy / dist * 8.2;
            for (let k = 0; k < 3; k++) {
              setTimeout(() => {
                if (engine.isRunning) {
                  enemyProjectiles.push({
                    x: boss.x + (k - 1) * 6,
                    y: boss.y + 45,
                    vx: dirX,
                    vy: dirY,
                    type: "imperial_bolt",
                    radius: 8,
                    damage: 26,
                    color: "#fef08a"
                  });
                  Sound.playBeam();
                }
              }, k * 90);
            }
          }
          break;
        }
        // ====================================================
        // JEFE FINAL 4: ZERO-KELVIN (Destructor Criogénico)
        // ====================================================
        case "boss_zero_kelvin": {
          if (boss.attackCycle % 2 === 1) {
            [-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 9,
                y: boss.y + 40,
                vx,
                vy: 7.2,
                type: "frost_needle",
                radius: 5,
                damage: 15,
                color: "#e0f2fe"
              });
            });
            Sound.playLaser();
          } else {
            for (let a = 0; a < 10; a++) {
              const ang = a * 2 * Math.PI / 10;
              const spd = 4.8;
              enemyProjectiles.push({
                x: boss.x + Math.cos(ang) * 20,
                y: boss.y + Math.sin(ang) * 20,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                type: "plasma_orb",
                radius: 6.5,
                damage: 20,
                color: "#38bdf8"
              });
            }
            Sound.playBeam();
          }
          break;
        }
        // ====================================================
        // JEFE FINAL 5: GENERAL VEKTOR (Dreadnought Supremo)
        // ====================================================
        case "boss_general_vektor":
        default: {
          const isEnraged = boss.health / boss.maxHealth <= 0.4;
          if (isEnraged) {
            boss.shootInterval = 0.28;
            engine.screenShake = Math.max(engine.screenShake, 7);
            [-3.6, -1.2, 1.2, 3.6].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 12,
                y: boss.y + 50,
                vx,
                vy: 8.2,
                type: "imperial_bolt",
                radius: 8.5,
                damage: 26,
                color: "#fbbf24"
              });
            });
            [-1.8, 0, 1.8].forEach((vx) => {
              enemyProjectiles.push({
                x: boss.x + vx * 14,
                y: boss.y + 46,
                vx,
                vy: 6.4,
                type: "plasma_orb",
                radius: 7,
                damage: 22,
                color: "#ff0055"
              });
            });
            enemyProjectiles.push({
              x: boss.x - 48,
              y: boss.y + 36,
              vx: -2.5,
              vy: 4.2,
              isHoming: true,
              type: "torpedo",
              radius: 6.5,
              damage: 20,
              color: "#fbbf24"
            });
            enemyProjectiles.push({
              x: boss.x + 48,
              y: boss.y + 36,
              vx: 2.5,
              vy: 4.2,
              isHoming: true,
              type: "torpedo",
              radius: 6.5,
              damage: 20,
              color: "#fbbf24"
            });
            Sound.playHeavyShot();
            Sound.playBeam();
          } else {
            [-32, -12, 12, 32].forEach((ox) => {
              enemyProjectiles.push({
                x: boss.x + ox,
                y: boss.y + 42,
                vx: ox * 0.05,
                vy: 6,
                type: "plasma_orb",
                radius: 6.5,
                damage: 20,
                color: "#ff0055"
              });
            });
            const dx = player.x - boss.x;
            const dy = Math.max(60, player.y - boss.y);
            const dist = Math.hypot(dx, dy);
            [-0.2, 0.2].forEach((offsetAngle) => {
              const baseAng = Math.atan2(dy, dx) + offsetAngle;
              enemyProjectiles.push({
                x: boss.x,
                y: boss.y + 45,
                vx: Math.cos(baseAng) * 7,
                vy: Math.sin(baseAng) * 7,
                type: "imperial_bolt",
                radius: 7,
                damage: 24,
                color: "#fbbf24"
              });
            });
            Sound.playHeavyShot();
          }
          break;
        }
      }
    },
    // ==========================================
    // 4. RENDERIZADO VECTORIAL EXCLUSIVO (10 NAVES)
    // ==========================================
    /**
     * Dibuja exclusivamente el modelo de la nave del Boss o Subboss
     * Permite reutilización exacta tanto en el campo de batalla como en
     * los hologramas del Briefing y los banners de inicio.
     */
    drawBossShip(ctx, boss, halfW, halfH) {
      const time = performance.now();
      const slug = boss.slug || (boss.isFinalBoss ? "boss_general_vektor" : "mid_aurora_9");
      switch (slug) {
        // ----------------------------------------------------
        // MODELO 1: AURORA-9 (Bombardero Furtivo Suborbital)
        // ----------------------------------------------------
        case "mid_aurora_9": {
          ctx.fillStyle = "#0c1524";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.4;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.9);
          ctx.lineTo(halfW * 0.28, halfH * 0.2);
          ctx.lineTo(halfW * 0.95, -halfH * 0.35);
          ctx.lineTo(halfW * 0.85, -halfH * 0.85);
          ctx.lineTo(halfW * 0.3, -halfH * 0.55);
          ctx.lineTo(0, -halfH * 0.95);
          ctx.lineTo(-halfW * 0.3, -halfH * 0.55);
          ctx.lineTo(-halfW * 0.85, -halfH * 0.85);
          ctx.lineTo(-halfW * 0.95, -halfH * 0.35);
          ctx.lineTo(-halfW * 0.28, halfH * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.6);
          ctx.lineTo(halfW * 0.7, -halfH * 0.25);
          ctx.lineTo(halfW * 0.25, -halfH * 0.45);
          ctx.lineTo(0, -halfH * 0.75);
          ctx.lineTo(-halfW * 0.25, -halfH * 0.45);
          ctx.lineTo(-halfW * 0.7, -halfH * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(-halfW * 0.55, -halfH * 0.85, 6, 12);
          ctx.fillRect(halfW * 0.55 - 6, -halfH * 0.85, 6, 12);
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        // ----------------------------------------------------
        // MODELO 2: NAUTILUS-X (Corbeta Sumergible Catamarán)
        // ----------------------------------------------------
        case "mid_nautilus_x": {
          ctx.fillStyle = "#042023";
          ctx.strokeStyle = "#14b8a6";
          ctx.lineWidth = 2.4;
          ctx.shadowColor = "#14b8a6";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.85, halfH * 0.8);
          ctx.lineTo(-halfW * 0.45, halfH * 0.5);
          ctx.lineTo(-halfW * 0.4, -halfH * 0.85);
          ctx.lineTo(-halfW * 0.85, -halfH * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(halfW * 0.85, halfH * 0.8);
          ctx.lineTo(halfW * 0.45, halfH * 0.5);
          ctx.lineTo(halfW * 0.4, -halfH * 0.85);
          ctx.lineTo(halfW * 0.85, -halfH * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#0d9488";
          ctx.fillRect(-halfW * 0.4, -halfH * 0.25, halfW * 0.8, halfH * 0.65);
          ctx.strokeStyle = "#5eead4";
          ctx.strokeRect(-halfW * 0.4, -halfH * 0.25, halfW * 0.8, halfH * 0.65);
          ctx.fillStyle = "#5eead4";
          ctx.beginPath();
          ctx.arc(0, halfH * 0.05, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#2dd4bf";
          ctx.lineWidth = 1.5;
          [-halfW * 0.65, halfW * 0.65].forEach((x) => {
            ctx.beginPath();
            ctx.moveTo(x, -halfH * 0.3);
            ctx.lineTo(x, halfH * 0.3);
            ctx.stroke();
          });
          break;
        }
        // ----------------------------------------------------
        // MODELO 3: JOVIAN CORE (Sonda de Fusión Gravitatoria)
        // ----------------------------------------------------
        case "mid_jovian_core": {
          const ringAngle = time * 24e-4;
          const pulse = 1 + Math.sin(time * 6e-3) * 0.08;
          const rY1 = Math.max(3, Math.abs(halfH * 0.52 * Math.cos(ringAngle)));
          ctx.save();
          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = Math.max(1.5, halfW * 0.04);
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(0, 0, halfW * 0.95, rY1, 0.15, 0, Math.PI * 2);
          ctx.stroke();
          const rY2 = Math.max(3, Math.abs(halfH * 0.44 * Math.sin(ringAngle * 0.85)));
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = Math.max(1.2, halfW * 0.03);
          ctx.beginPath();
          ctx.ellipse(0, 0, halfW * 0.78, rY2, -0.35, 0, Math.PI * 2);
          ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const ang = ringAngle + i * Math.PI / 2;
            const nx = Math.cos(ang) * (halfW * 0.95);
            const ny = Math.sin(ang) * rY1;
            ctx.fillStyle = "#fef08a";
            ctx.shadowColor = "#fb923c";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(nx, ny, Math.max(2, halfW * 0.065), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = "rgba(251, 146, 60, 0.65)";
          ctx.lineWidth = 1.5;
          const flareLen = halfW * 0.75 * pulse;
          ctx.beginPath();
          ctx.moveTo(-flareLen, 0);
          ctx.lineTo(flareLen, 0);
          ctx.moveTo(0, -flareLen * 0.65);
          ctx.lineTo(0, flareLen * 0.65);
          ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.shadowColor = "#ea580c";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#c2410c";
          ctx.beginPath();
          ctx.arc(0, 0, halfW * 0.46 * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(0, 0, halfW * 0.33, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(0, 0, halfW * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(2, halfW * 0.1), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        // ----------------------------------------------------
        // MODELO 4: FROST-BITE (Caminante Glacial Criogénico)
        // ----------------------------------------------------
        case "mid_frost_bite": {
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = "#7dd3fc";
          ctx.lineWidth = 2.4;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12;
          [-halfW * 0.8, halfW * 0.8].forEach((gx) => {
            ctx.beginPath();
            ctx.moveTo(gx * 0.4, -halfH * 0.5);
            ctx.lineTo(gx, -halfH * 0.1);
            ctx.lineTo(gx * 1.1, halfH * 0.7);
            ctx.lineTo(gx * 0.8, halfH * 0.85);
            ctx.lineTo(gx * 0.5, halfH * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.85);
          ctx.lineTo(halfW * 0.4, halfH * 0.2);
          ctx.lineTo(halfW * 0.45, -halfH * 0.7);
          ctx.lineTo(-halfW * 0.45, -halfH * 0.7);
          ctx.lineTo(-halfW * 0.4, halfH * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(-4, halfH * 0.4, 8, halfH * 0.5);
          ctx.fillStyle = "#bae6fd";
          ctx.beginPath();
          ctx.arc(0, -halfH * 0.15, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        // ----------------------------------------------------
        // MODELO 5: JUNGLE-BEAST (Meca Blindado Selvático)
        // ----------------------------------------------------
        case "mid_jungle_beast": {
          ctx.fillStyle = "#142409";
          ctx.strokeStyle = "#84cc16";
          ctx.lineWidth = 2.4;
          ctx.shadowColor = "#84cc16";
          ctx.shadowBlur = 12;
          [-halfW * 0.75, halfW * 0.75 - 12].forEach((tx) => {
            ctx.fillStyle = "#365314";
            ctx.fillRect(tx, -halfH * 0.75, 12, halfH * 0.7);
            ctx.fillStyle = "#84cc16";
            ctx.fillRect(tx + 2, halfH * -0.05, 8, halfH * 0.75);
          });
          ctx.fillStyle = "#1e3a0f";
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.85);
          ctx.lineTo(halfW * 0.5, halfH * 0.35);
          ctx.lineTo(halfW * 0.45, -halfH * 0.6);
          ctx.lineTo(0, -halfH * 0.85);
          ctx.lineTo(-halfW * 0.45, -halfH * 0.6);
          ctx.lineTo(-halfW * 0.5, halfH * 0.35);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ef4444";
          ctx.shadowColor = "#ef4444";
          ctx.fillRect(-halfW * 0.22, -halfH * 0.1, halfW * 0.44, 4);
          break;
        }
        // ====================================================
        // MODELO 6: GOLIATH APEX (Fortaleza Aérea Polar)
        // ====================================================
        case "boss_goliath_apex": {
          ctx.fillStyle = "#0c1a2e";
          ctx.strokeStyle = "#0284c7";
          ctx.lineWidth = 3.2;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.95);
          ctx.lineTo(halfW * 0.35, halfH * 0.5);
          ctx.lineTo(halfW * 0.95, -halfH * 0.2);
          ctx.lineTo(halfW * 0.85, -halfH * 0.85);
          ctx.lineTo(halfW * 0.45, -halfH * 0.7);
          ctx.lineTo(halfW * 0.2, -halfH * 0.95);
          ctx.lineTo(-halfW * 0.2, -halfH * 0.95);
          ctx.lineTo(-halfW * 0.45, -halfH * 0.7);
          ctx.lineTo(-halfW * 0.85, -halfH * 0.85);
          ctx.lineTo(-halfW * 0.95, -halfH * 0.2);
          ctx.lineTo(-halfW * 0.35, halfH * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#38bdf8";
          [-halfW * 0.65, -halfW * 0.35, halfW * 0.35 - 8, halfW * 0.65 - 8].forEach((tx) => {
            ctx.fillRect(tx, -halfH * 0.85, 8, 14);
          });
          ctx.fillStyle = "#0284c7";
          ctx.fillRect(-halfW * 0.88, -halfH * 0.1, 7, 24);
          ctx.fillRect(halfW * 0.88 - 7, -halfH * 0.1, 7, 24);
          ctx.fillStyle = "#e0f2fe";
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        // ====================================================
        // MODELO 7: LEVIATHAN COLOSSUS (Acorazado Suborbital)
        // ====================================================
        case "boss_leviathan_colossus": {
          ctx.fillStyle = "#052220";
          ctx.strokeStyle = "#0d9488";
          ctx.lineWidth = 3.2;
          ctx.shadowColor = "#14b8a6";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.95);
          ctx.lineTo(halfW * 0.45, halfH * 0.55);
          ctx.lineTo(halfW * 0.88, halfH * 0.15);
          ctx.lineTo(halfW * 0.75, -halfH * 0.45);
          ctx.lineTo(halfW * 0.92, -halfH * 0.75);
          ctx.lineTo(halfW * 0.3, -halfH * 0.85);
          ctx.lineTo(0, -halfH * 0.6);
          ctx.lineTo(-halfW * 0.3, -halfH * 0.85);
          ctx.lineTo(-halfW * 0.92, -halfH * 0.75);
          ctx.lineTo(-halfW * 0.75, -halfH * 0.45);
          ctx.lineTo(-halfW * 0.88, halfH * 0.15);
          ctx.lineTo(-halfW * 0.45, halfH * 0.55);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "#2dd4bf";
          ctx.lineWidth = 2;
          [-halfW * 0.5, halfW * 0.5].forEach((fx) => {
            ctx.beginPath();
            ctx.arc(fx, -halfH * 0.1, 14, 0, Math.PI);
            ctx.stroke();
          });
          ctx.fillStyle = "#14b8a6";
          [-10, 0, 10].forEach((tx) => {
            ctx.fillRect(tx - 3, halfH * 0.65, 6, 12);
          });
          ctx.fillStyle = "#99f6e4";
          ctx.beginPath();
          ctx.arc(0, -halfH * 0.05, 10, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        // ====================================================
        // MODELO 8: GANYMEDE TITAN (Estación Orbital Saturniana)
        // ====================================================
        case "boss_ganymede_titan": {
          const pulse = 1 + Math.sin(time * 5e-3) * 0.06;
          ctx.save();
          ctx.fillStyle = "#1e0e07";
          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = Math.max(2, halfW * 0.05);
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.92);
          ctx.lineTo(halfW * 0.45, halfH * 0.65);
          ctx.lineTo(halfW * 0.95, halfH * 0.25);
          ctx.lineTo(halfW * 0.88, -halfH * 0.55);
          ctx.lineTo(halfW * 0.55, -halfH * 0.92);
          ctx.lineTo(-halfW * 0.55, -halfH * 0.92);
          ctx.lineTo(-halfW * 0.88, -halfH * 0.55);
          ctx.lineTo(-halfW * 0.95, halfH * 0.25);
          ctx.lineTo(-halfW * 0.45, halfH * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "rgba(194, 65, 12, 0.35)";
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.65);
          ctx.lineTo(halfW * 0.7, halfH * 0.15);
          ctx.lineTo(halfW * 0.45, -halfH * 0.65);
          ctx.lineTo(-halfW * 0.45, -halfH * 0.65);
          ctx.lineTo(-halfW * 0.7, halfH * 0.15);
          ctx.closePath();
          ctx.fill();
          const reactorDistX = halfW * 0.72;
          const rOuter = Math.max(5, halfW * 0.22);
          const rMid = Math.max(3, halfW * 0.14);
          const rCore = Math.max(1.5, halfW * 0.07);
          [-reactorDistX, reactorDistX].forEach((rx) => {
            ctx.strokeStyle = "#fb923c";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(rx, 0, rOuter, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#c2410c";
            ctx.beginPath();
            ctx.arc(rx, 0, rOuter * 0.88, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.arc(rx, 0, rMid, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(rx, 0, rCore, 0, Math.PI * 2);
            ctx.fill();
          });
          const railHalfW = Math.max(3, halfW * 0.11);
          const railTop = -halfH * 0.88;
          const railHeight = halfH * 1.75;
          ctx.fillStyle = "#431407";
          ctx.fillRect(-railHalfW, railTop, railHalfW * 2, railHeight);
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-railHalfW, railTop, railHalfW * 2, railHeight);
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 1.5;
          const numRings = 4;
          for (let r = 1; r <= numRings; r++) {
            const ry = railTop + railHeight * r / (numRings + 1);
            ctx.beginPath();
            ctx.moveTo(-railHalfW - 2, ry);
            ctx.lineTo(railHalfW + 2, ry);
            ctx.stroke();
          }
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#fef08a";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, halfH * 0.88, Math.max(2, halfW * 0.08 * pulse), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(0, -halfH * 0.2, Math.max(3, halfW * 0.15), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(0, -halfH * 0.2, Math.max(1.5, halfW * 0.08), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        // ====================================================
        // MODELO 9: ZERO-KELVIN (Destructor Criogénico Absoluto)
        // ====================================================
        case "boss_zero_kelvin": {
          ctx.fillStyle = "#0c2033";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#bae6fd";
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(0, halfH);
          ctx.lineTo(halfW * 0.35, halfH * 0.4);
          ctx.lineTo(halfW, halfH * 0.6);
          ctx.lineTo(halfW * 0.7, 0);
          ctx.lineTo(halfW * 0.95, -halfH * 0.7);
          ctx.lineTo(halfW * 0.35, -halfH * 0.4);
          ctx.lineTo(0, -halfH * 0.95);
          ctx.lineTo(-halfW * 0.35, -halfH * 0.4);
          ctx.lineTo(-halfW * 0.95, -halfH * 0.7);
          ctx.lineTo(-halfW * 0.7, 0);
          ctx.lineTo(-halfW, halfH * 0.6);
          ctx.lineTo(-halfW * 0.35, halfH * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "rgba(224, 242, 254, 0.7)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(0, halfH * 0.7);
          ctx.lineTo(halfW * 0.6, 0);
          ctx.lineTo(0, -halfH * 0.7);
          ctx.lineTo(-halfW * 0.6, 0);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        // ====================================================
        // MODELO 10: GENERAL VEKTOR (Supremo Dreadnought Apex)
        // ====================================================
        case "boss_general_vektor":
        default: {
          const isEnraged = boss.health / boss.maxHealth <= 0.4;
          if (isEnraged) {
            ctx.save();
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 4;
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 28;
            ctx.beginPath();
            ctx.arc(0, 0, halfW * 1.05 + Math.sin(time * 0.01) * 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          ctx.fillStyle = "#120a17";
          ctx.strokeStyle = isEnraged ? "#fbbf24" : "#ff0055";
          ctx.lineWidth = 3.6;
          ctx.shadowColor = isEnraged ? "#fbbf24" : "#ff0055";
          ctx.shadowBlur = isEnraged ? 24 : 18;
          ctx.beginPath();
          ctx.moveTo(0, halfH);
          ctx.lineTo(halfW * 0.35, halfH * 0.65);
          ctx.lineTo(halfW * 0.95, halfH * 0.2);
          ctx.lineTo(halfW * 0.85, -halfH * 0.45);
          ctx.lineTo(halfW, -halfH * 0.85);
          ctx.lineTo(halfW * 0.45, -halfH * 0.7);
          ctx.lineTo(0, -halfH * 0.95);
          ctx.lineTo(-halfW * 0.45, -halfH * 0.7);
          ctx.lineTo(-halfW, -halfH * 0.85);
          ctx.lineTo(-halfW * 0.85, -halfH * 0.45);
          ctx.lineTo(-halfW * 0.95, halfH * 0.2);
          ctx.lineTo(-halfW * 0.35, halfH * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = isEnraged ? "#fbbf24" : "#d97706";
          [-halfW * 0.75, halfW * 0.75 - 8].forEach((wx) => {
            ctx.fillRect(wx, -halfH * 0.3, 8, halfH * 0.6);
          });
          ctx.fillStyle = "#ff0055";
          [-halfW * 0.5, -halfW * 0.25, halfW * 0.25 - 6, halfW * 0.5 - 6].forEach((bx) => {
            ctx.fillRect(bx, halfH * 0.45, 6, 16);
          });
          ctx.fillStyle = isEnraged ? "#ffffff" : "#ff0055";
          ctx.beginPath();
          ctx.arc(0, -halfH * 0.1, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isEnraged ? "#fbbf24" : "#ffffff";
          ctx.beginPath();
          ctx.arc(0, -halfH * 0.1, 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    },
    // ==========================================
    // 5. RENDERIZADO COMPLETO CON HUD SUPERIOR
    // ==========================================
    drawBoss(ctx, boss) {
      ctx.save();
      ctx.translate(boss.x, boss.y);
      const halfW = boss.width / 2;
      const halfH = boss.height / 2;
      this.drawBossShip(ctx, boss, halfW, halfH);
      const barWidth = Math.max(boss.width * 1.35, 95);
      const barHeight = boss.isFinalBoss ? 7 : 5.5;
      const barX = -barWidth / 2;
      const barY = -halfH - 18;
      const isEnraged = boss.isFinalBoss && boss.health / boss.maxHealth <= 0.4;
      ctx.font = boss.isFinalBoss ? "bold 10px 'Orbitron', monospace" : "bold 9px 'Orbitron', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = isEnraged ? "#fbbf24" : boss.isFinalBoss ? "#ff0055" : boss.color || "#38bdf8";
      ctx.shadowBlur = 6;
      ctx.shadowColor = ctx.fillStyle;
      const bossDisplayName = isEnraged ? `\u26A1 ${boss.name} [SOBRECARGA] \u26A1` : boss.name;
      ctx.fillText(bossDisplayName, 0, barY - 6);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
      ctx.strokeStyle = isEnraged ? "rgba(251, 191, 36, 0.9)" : boss.isFinalBoss ? "rgba(255, 0, 85, 0.6)" : "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
      const healthRatio = Math.max(0, boss.health / boss.maxHealth);
      ctx.fillStyle = isEnraged ? "#fbbf24" : boss.isFinalBoss ? healthRatio > 0.3 ? "#f43f5e" : "#ef4444" : healthRatio > 0.3 ? boss.color || "#38bdf8" : "#ef4444";
      ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
      ctx.restore();
    }
  };

  // frontend/js/engine.js
  var GameEngine = class {
    constructor(canvas, hudElements) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hud = hudElements;
      this.ship = null;
      this.currentStage = 1;
      this.pilot = "PILOTO";
      this.isRunning = false;
      this.isPaused = false;
      this.animationFrameId = null;
      this.scenario = new ScenarioRenderer(this.canvas);
      this.player = {
        x: canvas.width / 2,
        y: canvas.height - 80,
        width: 44,
        height: 48,
        health: 100,
        maxHealth: 100,
        speed: 6,
        isSpecialActive: false,
        specialTimer: 0,
        specialCooldownTimer: 0,
        lastShotTime: 0,
        weaponLevel: 1,
        upgradeHitsReceived: 0,
        invulnerableTimer: 0
      };
      this.initialLives = 3;
      this.lives = 3;
      this.bombs = 1;
      this.bombFlash = 0;
      this.projectiles = [];
      this.enemyProjectiles = [];
      this.enemies = [];
      this.particles = [];
      this.powerups = [];
      this.floatingTexts = [];
      this.shockwaves = [];
      this.screenShake = 0;
      this.criticalAlarmTimer = 0;
      this.score = 0;
      this.enemiesDestroyed = 0;
      this.bossesDefeated = 0;
      this.stageDistance = 0;
      this.stageTargetDistance = 1800;
      this.midBossSpawned = false;
      this.finalBossSpawned = false;
      this.mainBossDefeated = false;
      this.activeBoss = null;
      this.keys = {};
      this.setupInputs();
    }
    setupInputs() {
      window.addEventListener("keydown", (e) => {
        if (this.isRunning) {
          if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
            e.preventDefault();
          }
          if (e.code === "KeyF") {
            e.preventDefault();
            this.toggleFullscreen();
          }
        }
        this.keys[e.code] = true;
        if (e.code === "KeyP") {
          this.togglePause();
        }
        if (e.code === "KeyE" || e.code === "ShiftLeft") {
          this.activateSpecialAbility();
        }
        if (e.code === "KeyB" || e.code === "KeyX") {
          this.triggerBomb();
        }
      });
      window.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
      });
      this.canvas.addEventListener("mousemove", (e) => {
        if (!this.isRunning || this.isPaused) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        this.player.x += (mouseX - this.player.x) * 0.18;
        this.player.y += (mouseY - this.player.y) * 0.18;
      });
      this.canvas.addEventListener("mousedown", (e) => {
        if (this.isRunning) e.stopPropagation();
        if (e.button === 0) {
          this.keys["Space"] = true;
        }
      });
      this.canvas.addEventListener("mouseup", (e) => {
        if (this.isRunning) e.stopPropagation();
        if (e.button === 0) {
          this.keys["Space"] = false;
        }
      });
      this.canvas.addEventListener("click", (e) => {
        if (this.isRunning) e.stopPropagation();
      });
      let isTouching = false;
      let lastTouchX = 0;
      let lastTouchY = 0;
      const handleTouchStart = (e) => {
        if (!this.isRunning || this.isPaused) return;
        e.preventDefault();
        e.stopPropagation();
        isTouching = true;
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        lastTouchX = (touch.clientX - rect.left) * scaleX;
        lastTouchY = (touch.clientY - rect.top) * scaleY;
        this.keys["Space"] = true;
      };
      const handleTouchMove = (e) => {
        if (!this.isRunning || this.isPaused || !isTouching) return;
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const currentX = (touch.clientX - rect.left) * scaleX;
        const currentY = (touch.clientY - rect.top) * scaleY;
        const deltaX = (currentX - lastTouchX) * 1.25;
        const deltaY = (currentY - lastTouchY) * 1.25;
        this.player.x += deltaX;
        this.player.y += deltaY;
        this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
        this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
        lastTouchX = currentX;
        lastTouchY = currentY;
        this.keys["Space"] = true;
      };
      const handleTouchEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.touches.length === 0) {
          isTouching = false;
          this.keys["Space"] = false;
        }
      };
      this.canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
      this.canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      this.canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
      this.canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    }
    toggleFullscreen() {
      if (typeof window !== "undefined" && window.toggleFullscreen) {
        window.toggleFullscreen();
        return;
      }
      const root = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (root.requestFullscreen) {
          root.requestFullscreen().catch((err) => {
            console.warn("[Pantalla Completa]", err);
          });
        } else if (root.webkitRequestFullscreen) {
          root.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {
          });
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
    start(shipData, stageNumber = 1, pilotName = "PILOTO", runState = null) {
      if (typeof window !== "undefined") {
        window.__sa_combat_active = true;
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
          try {
            window.CrazyGames.SDK.game.gameplayStart();
          } catch (_) {
          }
        }
      }
      document.body.classList.add("battle-locked");
      const defaultFallback = {
        id: 1,
        slug: "phoenix-vanguard",
        name: "Phoenix Vanguard",
        weapon: { name: "Doble Láser de Iones", type: "twin_laser", damage: 18, fire_rate_ms: 130 },
        special: { name: "Escudo Cinético de Absorción", slug: "shield_matrix", duration_seconds: 5, cooldown_seconds: 18 },
        stats: { max_health: 100, speed: 7.5 }
      };
      const safeShip = (shipData && typeof shipData === "object") ? shipData : defaultFallback;
      this.ship = Object.assign({}, defaultFallback, safeShip);
      this.ship.stats = Object.assign({}, defaultFallback.stats, safeShip.stats || {});
      this.ship.weapon = Object.assign({}, defaultFallback.weapon, safeShip.weapon || {});
      this.ship.special = Object.assign({}, defaultFallback.special, safeShip.special || {});

      this.currentStage = stageNumber || 1;
      this.pilot = pilotName || "PILOTO";
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height - 90;
      this.player.maxHealth = this.ship.stats.max_health || 100;
      this.player.health = this.player.maxHealth;
      this.player.speed = this.ship.stats.speed || 6.5;
      this.player.isSpecialActive = false;
      this.player.specialTimer = 0;
      this.player.specialCooldownTimer = 0;
      this.player.lastShotTime = 0;
      if (runState && runState.preserveHistory) {
        this.player.weaponLevel = runState.weaponLevel || 1;
        this.player.upgradeHitsReceived = runState.upgradeHitsReceived || 0;
        this.lives = runState.lives !== void 0 && runState.lives > 0 ? runState.lives : 3;
        this.bombs = runState.bombs !== void 0 ? runState.bombs : 1;
        this.score = runState.score || 0;
        this.enemiesDestroyed = runState.enemies || 0;
        this.bossesDefeated = runState.bosses || 0;
        setTimeout(() => {
          this.addFloatingText(
            this.canvas.width / 2,
            this.canvas.height / 2 + 35,
            `\u{1F6E1}\uFE0F HISTORIAL PRESERVADO: ${this.lives} VIDAS \xB7 ${this.score.toLocaleString()} PTS`,
            "#34d399"
          );
        }, 500);
      } else {
        this.player.weaponLevel = 1;
        this.player.upgradeHitsReceived = 0;
        const bonusLives = typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("naves_bonus_lives") || "0", 10) : 0;
        this.lives = 3 + bonusLives;
        this.bombs = 1;
        this.score = 0;
        this.enemiesDestroyed = 0;
        this.bossesDefeated = 0;
      }
      this.player.invulnerableTimer = 0;
      this.bombFlash = 0;
      this.projectiles = [];
      this.enemyProjectiles = [];
      this.enemies = [];
      this.particles = [];
      this.powerups = [];
      this.floatingTexts = [];
      this.shockwaves = [];
      this.screenShake = 0;
      this.criticalAlarmTimer = 0;
      this.stageDistance = 0;
      this.midBossSpawned = false;
      this.finalBossSpawned = false;
      this.mainBossDefeated = false;
      this.activeBoss = null;
      this.stageBannerTimer = 3.5;
      this.updateHudWeaponAndBombs();
      this.updateHudLives();
      this.updateHUD(0);
      try {
        if (this.scenario) {
          if (this.currentStage === 5 && typeof this.scenario.initJungle === "function") {
            this.scenario.initJungle();
          } else if (this.currentStage === 2 && typeof this.scenario.initIslands === "function") {
            this.scenario.initIslands();
          } else if (this.currentStage === 4 && typeof this.scenario.initSnow === "function") {
            this.scenario.initSnow();
          }
        }
      } catch (err) {
        console.warn("[CrazyGames Engine] Fallo en escenario:", err);
      }
      this.isRunning = true;
      this.isPaused = false;
      this.lastTime = performance.now();
      try { Sound.startMusic(); } catch (_) {}
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.loop(performance.now());
    }
    stop() {
      this.isRunning = false;
      if (typeof window !== "undefined") {
        window.__sa_combat_active = false;
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
          try {
            window.CrazyGames.SDK.game.gameplayStop();
          } catch (_) {
          }
        }
      }
      Sound.stopMusic();
      document.body.classList.remove("battle-locked");
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
    togglePause() {
      if (!this.isRunning) return;
      this.isPaused = !this.isPaused;
      if (typeof window !== "undefined") {
        window.__sa_combat_active = !this.isPaused;
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
          try {
            if (this.isPaused) {
              window.CrazyGames.SDK.game.gameplayStop();
            } else {
              window.CrazyGames.SDK.game.gameplayStart();
            }
          } catch (_) {
          }
        }
      }
      if (!this.isPaused) {
        this.lastTime = performance.now();
        this.loop(performance.now());
      }
    }
    activateSpecialAbility() {
      if (!this.isRunning || this.isPaused || this.player.isSpecialActive) return;
      if (this.player.specialCooldownTimer > 0) return;
      this.player.isSpecialActive = true;
      this.player.specialTimer = this.ship.special.duration_seconds;
      this.player.specialCooldownTimer = this.ship.special.cooldown_seconds;
      Sound.playSpecialAbility();
      if (this.ship.special.slug === "emp_blast") {
        this.triggerEMPBlast();
        if (this.currentStage === 5) {
          for (let i = 0; i < 5; i++) {
            this.scenario.addGroundExplosion(
              Math.random() * this.canvas.width,
              Math.random() * this.canvas.height,
              50
            );
          }
        }
      } else if (this.ship.special.slug === "orbital_bombardment" && this.currentStage === 5) {
        for (let i = 0; i < 8; i++) {
          this.scenario.addGroundExplosion(
            this.player.x + (Math.random() * 140 - 70),
            Math.random() * this.canvas.height,
            60
          );
        }
      }
      this.createExplosionParticles(this.player.x, this.player.y, "#00f3ff", 28);
    }
    triggerEMPBlast() {
      this.enemyProjectiles = [];
      this.enemies.forEach((enemy) => {
        if (enemy.shield && enemy.shield > 0) {
          enemy.shield = 0;
          this.addFloatingText(enemy.x, enemy.y - 14, "\xA1ESCUDO ANULADO!", "#38bdf8");
        }
        enemy.health -= 70;
        this.createExplosionParticles(enemy.x, enemy.y, "#ff0055", 16);
      });
    }
    loop(currentTime) {
      if (!this.isRunning) return;
      if (this.isPaused) {
        this.drawPauseOverlay();
        return;
      }
      const dt = Math.min((currentTime - this.lastTime) / 1e3, 0.1);
      this.lastTime = currentTime;
      try { this.update(dt); } catch (e) { console.error("[CrazyGames Engine Update]", e); }
      try { this.render(); } catch (e) { console.error("[CrazyGames Engine Render]", e); }
      this.animationFrameId = requestAnimationFrame((t2) => this.loop(t2));
    }
    update(dt) {
      const distanceRatio = Math.min(1, this.stageDistance / this.stageTargetDistance);
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - 25 * dt);
      }
      if (this.player.health > 0 && this.player.health / this.player.maxHealth < 0.28) {
        this.criticalAlarmTimer += dt;
        if (this.criticalAlarmTimer >= 0.8) {
          this.criticalAlarmTimer = 0;
          Sound.playCriticalAlarm();
        }
      } else {
        this.criticalAlarmTimer = 0;
      }
      this.scenario.update(dt, this.currentStage, distanceRatio);
      this.updatePlayer(dt);
      this.updateProjectiles(dt);
      this.updateEnemies(dt, distanceRatio);
      this.updatePowerups(dt);
      this.updateParticles(dt);
      this.updateFloatingTexts(dt);
      this.updateShockwaves(dt);
      this.updateHUD(distanceRatio);
      if (this.stageBannerTimer > 0) {
        this.stageBannerTimer = Math.max(0, this.stageBannerTimer - dt);
      }
      if (this.player.invulnerableTimer > 0) {
        this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
      }
      if (this.player.health <= 0) {
        if (this.lives > 1) {
          this.respawnPlayer();
        } else {
          this.lives = 0;
          this.updateHudLives();
          this.handleGameOver();
        }
      } else if (!this.mainBossDefeated && this.finalBossSpawned && this.enemies.filter((e) => e.isBoss).length === 0 && distanceRatio >= 0.95) {
        this.handleStageVictory();
      }
    }
    updatePlayer(dt) {
      let speed = this.player.speed * (this.player.isSpecialActive && this.ship.special.slug === "overdrive_ghost" ? 1.6 : 1);
      if (this.keys["KeyW"] || this.keys["ArrowUp"]) this.player.y -= speed;
      if (this.keys["KeyS"] || this.keys["ArrowDown"]) this.player.y += speed;
      if (this.keys["KeyA"] || this.keys["ArrowLeft"]) this.player.x -= speed;
      if (this.keys["KeyD"] || this.keys["ArrowRight"]) this.player.x += speed;
      this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
      this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
      if (Math.random() < 0.65) {
        this.particles.push({
          x: this.player.x + (Math.random() * 8 - 4),
          y: this.player.y + this.player.height / 2 - 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 3 + 2.5,
          size: Math.random() * 2.5 + 1.2,
          color: this.player.isSpecialActive ? "#00f3ff" : "#f59e0b",
          life: 0.22,
          maxLife: 0.22
        });
      }
      if (this.player.isSpecialActive) {
        this.player.specialTimer -= dt;
        if (this.player.specialTimer <= 0) {
          this.player.isSpecialActive = false;
          this.player.specialTimer = 0;
        }
      } else if (this.player.specialCooldownTimer > 0) {
        this.player.specialCooldownTimer -= dt;
        if (this.player.specialCooldownTimer < 0) {
          this.player.specialCooldownTimer = 0;
        }
      }
      if (this.keys["Space"]) {
        this.fireWeapon();
      }
      if (this.player.isSpecialActive && this.ship.special.slug === "micromissile_swarm") {
        if (Math.random() < 0.3) {
          this.fireHomingMicroMissile();
        }
      }
      const hasActiveBoss = this.enemies.some((e) => e.isBoss);
      if (!hasActiveBoss && !this.mainBossDefeated) {
        this.stageDistance += 28 * dt;
      }
    }
    fireWeapon() {
      const now = performance.now();
      let fireRate = this.ship.weapon.fire_rate_ms;
      if (this.player.isSpecialActive && this.ship.special.slug === "overdrive_ghost") {
        fireRate *= 0.5;
      }
      const lvl = this.player.weaponLevel;
      if (lvl === 2) fireRate *= 0.85;
      if (lvl >= 3) fireRate *= 0.72;
      if (now - this.player.lastShotTime < fireRate) return;
      this.player.lastShotTime = now;
      const wType = this.ship.weapon.type;
      let dmg = this.ship.weapon.damage;
      if (lvl === 2) dmg = Math.round(dmg * 1.35);
      if (lvl >= 3) dmg = Math.round(dmg * 1.75);
      if (wType === "heavy_plasma" || wType === "wave_cannon") {
        Sound.playHeavyShot();
      } else if (wType === "beam_laser") {
        Sound.playBeam();
      } else {
        Sound.playLaser();
      }
      switch (wType) {
        case "twin_laser":
          this.projectiles.push({ x: this.player.x - 12, y: this.player.y - 20, vx: 0, vy: -14, height: 16, damage: dmg, weaponType: wType });
          this.projectiles.push({ x: this.player.x + 12, y: this.player.y - 20, vx: 0, vy: -14, height: 16, damage: dmg, weaponType: wType });
          if (lvl >= 2) {
            this.projectiles.push({ x: this.player.x - 22, y: this.player.y - 14, vx: -1.6, vy: -13.5, height: 14, damage: Math.round(dmg * 0.85), weaponType: wType });
            this.projectiles.push({ x: this.player.x + 22, y: this.player.y - 14, vx: 1.6, vy: -13.5, height: 14, damage: Math.round(dmg * 0.85), weaponType: wType });
          }
          if (lvl >= 3) {
            this.projectiles.push({ x: this.player.x - 30, y: this.player.y - 8, vx: -3.2, vy: -13, height: 14, damage: Math.round(dmg * 0.75), weaponType: wType });
            this.projectiles.push({ x: this.player.x + 30, y: this.player.y - 8, vx: 3.2, vy: -13, height: 14, damage: Math.round(dmg * 0.75), weaponType: wType });
          }
          break;
        case "heavy_plasma":
          if (lvl === 1) {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 24, vx: 0, vy: -10, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
          } else if (lvl === 2) {
            this.projectiles.push({ x: this.player.x - 14, y: this.player.y - 22, vx: -0.6, vy: -10.5, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x + 14, y: this.player.y - 22, vx: 0.6, vy: -10.5, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
          } else {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 26, vx: 0, vy: -11, height: 22, damage: Math.round(dmg * 1.2), weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x - 20, y: this.player.y - 20, vx: -1.2, vy: -10, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x + 20, y: this.player.y - 20, vx: 1.2, vy: -10, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
          }
          break;
        case "triple_spread":
          if (lvl === 1) {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 20, vx: 0, vy: -12, height: 12, damage: dmg, weaponType: wType });
            this.projectiles.push({ x: this.player.x - 10, y: this.player.y - 18, vx: -3, vy: -11, height: 12, damage: dmg, weaponType: wType });
            this.projectiles.push({ x: this.player.x + 10, y: this.player.y - 18, vx: 3, vy: -11, height: 12, damage: dmg, weaponType: wType });
          } else if (lvl === 2) {
            [-4, -2, 0, 2, 4].forEach((vx) => {
              this.projectiles.push({ x: this.player.x + vx * 4, y: this.player.y - 20, vx, vy: -12, height: 12, damage: Math.round(dmg * 0.9), weaponType: wType });
            });
          } else {
            [-6, -4, -2, 0, 2, 4, 6].forEach((vx) => {
              this.projectiles.push({ x: this.player.x + vx * 3.5, y: this.player.y - 20, vx, vy: -12.5, height: 13, damage: Math.round(dmg * 0.85), weaponType: wType });
            });
          }
          break;
        case "wave_cannon":
          if (lvl === 1) {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 22, vx: 0, vy: -9, height: 12, damage: dmg, weaponType: wType, isHeavy: true });
          } else if (lvl === 2) {
            this.projectiles.push({ x: this.player.x - 12, y: this.player.y - 22, vx: -0.8, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x + 12, y: this.player.y - 22, vx: 0.8, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
          } else {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 24, vx: 0, vy: -10, height: 16, damage: Math.round(dmg * 1.15), weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x - 18, y: this.player.y - 20, vx: -1.5, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x + 18, y: this.player.y - 20, vx: 1.5, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
          }
          break;
        case "beam_laser":
        default:
          if (lvl === 1) {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 28, vx: 0, vy: -18, height: 32, damage: dmg, weaponType: wType, isHeavy: true });
          } else if (lvl === 2) {
            this.projectiles.push({ x: this.player.x - 10, y: this.player.y - 28, vx: 0, vy: -18, height: 36, damage: dmg, weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x + 10, y: this.player.y - 28, vx: 0, vy: -18, height: 36, damage: dmg, weaponType: wType, isHeavy: true });
          } else {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 30, vx: 0, vy: -19, height: 40, damage: Math.round(dmg * 1.25), weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x - 16, y: this.player.y - 26, vx: -0.6, vy: -18, height: 34, damage: dmg, weaponType: wType, isHeavy: true });
            this.projectiles.push({ x: this.player.x + 16, y: this.player.y - 26, vx: 0.6, vy: -18, height: 34, damage: dmg, weaponType: wType, isHeavy: true });
          }
          break;
      }
    }
    fireHomingMicroMissile() {
      Sound.playBeam();
      let target = this.enemies[0];
      let vx = (Math.random() - 0.5) * 4;
      let vy = -8;
      if (target) {
        const angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
        vx = Math.cos(angle) * 10;
        vy = Math.sin(angle) * 10;
      }
      this.projectiles.push({
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y - 15,
        vx,
        vy,
        height: 9,
        damage: 24,
        weaponType: "twin_laser",
        isHeavy: true
      });
    }
    updateProjectiles(dt) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (this.currentStage === 5 && p.isHeavy && Math.random() < 0.08) {
          this.scenario.addGroundExplosion(p.x, p.y, 35);
        }
        let hit = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
          if (dist < enemy.width / 2 + 10) {
            hit = true;
            if (enemy.isBoss) {
              enemy.health -= p.damage;
              this.createHitSparks(p.x, p.y, "#00f3ff");
            } else {
              EnemyCatalog.handleDamage(enemy, p.damage, this, p.x, p.y);
            }
            if (this.currentStage === 5) {
              this.scenario.addGroundExplosion(enemy.x, enemy.y, 40);
            }
            if (enemy.health <= 0) {
              this.handleEnemyDefeated(enemy, j);
            }
            break;
          }
        }
        if (hit || p.y < -30 || p.x < -30 || p.x > this.canvas.width + 30) {
          this.projectiles.splice(i, 1);
        }
      }
      for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
        const ep = this.enemyProjectiles[i];
        ep.x += ep.vx;
        ep.y += ep.vy;
        if (ep.isHoming && this.player && this.player.health > 0) {
          const dx = this.player.x - ep.x;
          ep.vx += Math.sign(dx) * 0.12;
          ep.vx = Math.max(-2.8, Math.min(2.8, ep.vx));
        }
        const hitRadius = (ep.radius || 4.5) + this.player.width / 2 * 0.55;
        const dist = Math.hypot(ep.x - this.player.x, ep.y - this.player.y);
        if (dist < hitRadius) {
          if (!this.player.isSpecialActive || this.ship.special.slug !== "shield_matrix") {
            if (this.player.invulnerableTimer > 0) {
              Sound.playBeam();
              this.createHitSparks(ep.x, ep.y, "#00f3ff");
            } else {
              this.player.health -= ep.damage;
              Sound.playPlayerDamage();
              this.createHitSparks(this.player.x, this.player.y, ep.color || "#ef4444");
              this.onPlayerHit();
            }
          } else {
            Sound.playBeam();
            this.createHitSparks(ep.x, ep.y, "#00f3ff");
          }
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
        if (ep.y > this.canvas.height + 40 || ep.y < -50 || ep.x < -40 || ep.x > this.canvas.width + 40) {
          this.enemyProjectiles.splice(i, 1);
        }
      }
    }
    updateEnemies(dt, distanceRatio) {
      const hasBoss = this.enemies.some((e) => e.isBoss);
      if (!this.midBossSpawned && distanceRatio >= 0.4 && !hasBoss) {
        this.spawnMidBoss();
      }
      if (!this.finalBossSpawned && distanceRatio >= 0.85 && !hasBoss) {
        this.spawnFinalBoss();
      }
      if (!hasBoss && Math.random() < 0.038 && this.enemies.length < 7) {
        this.spawnStandardEnemy();
      }
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (enemy.isBoss) {
          this.activeBoss = enemy;
          if (enemy.y < 125) {
            enemy.y += enemy.vy;
          } else {
            enemy.x = this.canvas.width / 2 + Math.sin(performance.now() * 18e-4) * (this.canvas.width * 0.35);
            enemy.y = 125 + Math.sin(performance.now() * 24e-4) * 14;
          }
          enemy.lastShotTime = (enemy.lastShotTime || 0) + dt;
          if (enemy.lastShotTime > enemy.shootInterval) {
            enemy.lastShotTime = 0;
            this.fireBossSalvo(enemy);
          }
        } else {
          EnemyCatalog.updateEnemyAI(
            enemy,
            dt,
            this.player,
            this.enemyProjectiles,
            this
          );
          const colDist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
          if (colDist < enemy.width / 2 + this.player.width / 2) {
            if (!this.player.isSpecialActive || this.ship.special.slug !== "shield_matrix") {
              if (this.player.invulnerableTimer > 0) {
                Sound.playBeam();
                this.createHitSparks(this.player.x, this.player.y, "#00f3ff");
              } else {
                const crashDmg = enemy.isFormidable ? 30 : 20;
                this.player.health -= crashDmg;
                Sound.playPlayerDamage();
                this.createHitSparks(this.player.x, this.player.y, "#ef4444");
                this.onPlayerHit();
              }
            }
            this.handleEnemyDefeated(enemy, i);
            continue;
          }
          if (enemy.y > this.canvas.height + 60) {
            this.enemies.splice(i, 1);
          }
        }
      }
      if (!hasBoss) {
        this.activeBoss = null;
      }
    }
    fireBossSalvo(boss) {
      BossCatalog.fireBossAttack(boss, this.player, this.enemyProjectiles, this);
    }
    spawnStandardEnemy() {
      const enemy = EnemyCatalog.createEnemy(this.currentStage, this.canvas.width);
      this.enemies.push(enemy);
    }
    spawnMidBoss() {
      this.midBossSpawned = true;
      Sound.playBossAlarm();
      this.screenShake = 18;
      const midBossData = BossCatalog.getMidBoss(this.currentStage);
      this.enemies.push({
        ...midBossData,
        isBoss: true,
        isSubBoss: true,
        isFinalBoss: false,
        x: this.canvas.width / 2,
        y: -75
      });
      this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 40, `\u26A0\uFE0F \xA1ALERTA: SUBL\xCDDER DETECTADO!`, "#fbbf24");
      this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 10, midBossData.name, midBossData.color || "#38bdf8");
    }
    spawnFinalBoss() {
      this.finalBossSpawned = true;
      Sound.playBossAlarm();
      this.screenShake = 24;
      const bossData = BossCatalog.getStageBoss(this.currentStage);
      this.enemies.push({
        ...bossData,
        isBoss: true,
        isSubBoss: false,
        isFinalBoss: true,
        x: this.canvas.width / 2,
        y: -95
      });
      this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 40, `\u{1F6A8} \xA1ALERTA M\xC1XIMA: BOSS DE FASE!`, "#ff0055");
      this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 10, bossData.name, bossData.color || "#ff0055");
    }
    handleEnemyDefeated(enemy, index) {
      this.enemies.splice(index, 1);
      this.score += enemy.scoreValue;
      this.enemiesDestroyed++;
      if (enemy.isBoss) {
        this.bossesDefeated++;
        this.screenShake = 24;
        this.shockwaves.push({
          x: enemy.x,
          y: enemy.y,
          radius: 12,
          maxRadius: 280,
          color: enemy.color || "#00f3ff",
          alpha: 1
        });
        Sound.playBossExplosion();
        this.createExplosionParticles(enemy.x, enemy.y, enemy.color || "#ff0055", 55);
        if (this.currentStage === 5) {
          this.scenario.addGroundExplosion(enemy.x, enemy.y, 80);
        }
        this.spawnBossGrandPrize(enemy.x, enemy.y);
        if (enemy.isFinalBoss) {
          this.mainBossDefeated = true;
          this.enemyProjectiles = [];
          this.enemies = [];
          this.player.isInvulnerable = true;
          this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 35, `\u{1F3C6} \xA1JEFE DE \xC1REA DERROTADO!`, "#fbbf24");
          this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 + 5, `\xC1REA ${this.currentStage} SUPERADA CON \xC9XITO`, "#10b981");
          setTimeout(() => {
            this.handleStageVictory();
          }, 1100);
        } else {
          this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 35, `\u26A1 \xA1SUBL\xCDDER ${enemy.name} DERROTADO!`, "#38bdf8");
          this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 + 5, `\u{1F680} AVANCE HACIA EL JEFE FINAL REANUDADO`, "#10b981");
          this.enemyProjectiles = [];
        }
      } else {
        this.screenShake = Math.max(this.screenShake, enemy.isFormidable ? 7 : 3.5);
        Sound.playExplosion();
        this.createExplosionParticles(enemy.x, enemy.y, enemy.color || "#f97316", enemy.isFormidable ? 26 : 18);
        EnemyCatalog.handleDefeat(enemy, this);
        if (!this.enemies.some((e) => e.isBoss)) {
          this.stageDistance += 6;
        }
        if (Math.random() < (enemy.isFormidable ? 0.42 : 0.28)) {
          this.spawnPowerup(enemy.x, enemy.y);
        }
      }
    }
    spawnBossGrandPrize(x, y) {
      this.powerups.push({
        x,
        y,
        type: "boss_grand_prize",
        vy: 1.1,
        size: 20,
        pulse: 0
      });
    }
    spawnPowerup(x, y) {
      const roll = Math.random();
      let type;
      if (roll < 0.22) {
        type = "weapon_upgrade";
      } else if (roll < 0.42) {
        type = "bomb";
      } else if (roll < 0.64) {
        type = "health";
      } else if (roll < 0.82) {
        type = "special";
      } else {
        type = "score";
      }
      this.powerups.push({
        x,
        y,
        type,
        vy: 1.8,
        size: 13,
        pulse: 0
      });
    }
    updatePowerups(dt) {
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const p = this.powerups[i];
        p.y += p.vy;
        p.pulse += dt * 5;
        const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
        if (dist < this.player.width / 2 + p.size) {
          if (p.type === "boss_grand_prize") {
            this.player.weaponLevel = Math.min(3, this.player.weaponLevel + 1);
            this.player.upgradeHitsReceived = 0;
            this.bombs = Math.min(5, this.bombs + 2);
            const heal = Math.min(50, this.player.maxHealth - this.player.health);
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
            this.score += 2500;
            Sound.playGrandPrize();
            this.screenShake = 14;
            this.addFloatingText(p.x, p.y, "\u2B50 \xA1GRAN PREMIO: ARMAS + 2 BOMBAS!", "#fbbf24");
            this.createExplosionParticles(p.x, p.y, "#fbbf24", 32);
            this.shockwaves.push({
              x: p.x,
              y: p.y,
              radius: 10,
              maxRadius: 220,
              color: "#fbbf24",
              alpha: 1
            });
          } else if (p.type === "weapon_upgrade") {
            this.player.weaponLevel = Math.min(3, this.player.weaponLevel + 1);
            this.player.upgradeHitsReceived = 0;
            Sound.playWeaponUpgrade();
            this.addFloatingText(p.x, p.y, `\u{1F680} \xA1POTENCIA DE ARMAS NV ${this.player.weaponLevel}!`, "#38bdf8");
            this.createExplosionParticles(p.x, p.y, "#38bdf8", 22);
          } else if (p.type === "bomb") {
            this.bombs = Math.min(5, this.bombs + 1);
            Sound.playBombPickup();
            this.addFloatingText(p.x, p.y, `\u{1F4A3} \xA1+1 BOMBA T\xC1CTICA (${this.bombs})!`, "#f43f5e");
            this.createExplosionParticles(p.x, p.y, "#f43f5e", 22);
          } else if (p.type === "health") {
            const heal = Math.min(30, this.player.maxHealth - this.player.health);
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
            Sound.playPowerUpHealth();
            this.addFloatingText(p.x, p.y, `+${heal > 0 ? heal : 30} HP`, "#10b981");
            this.createExplosionParticles(p.x, p.y, "#10b981", 16);
          } else if (p.type === "special") {
            this.player.specialCooldownTimer = Math.max(0, this.player.specialCooldownTimer - 8);
            Sound.playPowerUpSpecial();
            this.addFloatingText(p.x, p.y, "ESPECIAL CARGADO", "#00f3ff");
            this.createExplosionParticles(p.x, p.y, "#00f3ff", 16);
          } else {
            this.score += 650;
            Sound.playPowerUpScore();
            this.addFloatingText(p.x, p.y, "+650 PTS", "#fbbf24");
            this.createExplosionParticles(p.x, p.y, "#fbbf24", 16);
          }
          this.updateHudWeaponAndBombs();
          this.powerups.splice(i, 1);
          continue;
        }
        if (p.y > this.canvas.height + 35) {
          this.powerups.splice(i, 1);
        }
      }
    }
    drawPowerup(p) {
      const ctx = this.ctx;
      const pulseScale = 1 + Math.sin(p.pulse) * 0.16;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(pulseScale, pulseScale);
      if (p.type === "boss_grand_prize") {
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 22;
        ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        const grad = ctx.createLinearGradient(-15, -15, 15, 15);
        grad.addColorStop(0, "#fde68a");
        grad.addColorStop(0.5, "#f59e0b");
        grad.addColorStop(1, "#b45309");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Orbitron, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F451}", 0, 0);
        ctx.font = "bold 8px Orbitron";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("GRAN PREMIO", 0, -22);
      } else if (p.type === "weapon_upgrade") {
        ctx.fillStyle = "#0284c7";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F680}", 0, 0);
        ctx.font = "bold 7px Orbitron";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("ARMAS", 0, -16);
      } else if (p.type === "bomb") {
        ctx.fillStyle = "#be123c";
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F4A3}", 0, 0);
        ctx.font = "bold 7px Orbitron";
        ctx.fillStyle = "#fda4af";
        ctx.fillText("BOMBA", 0, -16);
      } else if (p.type === "health") {
        ctx.fillStyle = "#10b981";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("+", 0, 0);
      } else if (p.type === "special") {
        ctx.fillStyle = "#00f3ff";
        ctx.shadowColor = "#00f3ff";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#030712";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u26A1", 0, 0);
      } else {
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#78350f";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u2605", 0, 0);
      }
      ctx.restore();
    }
    addFloatingText(x, y, text, color) {
      this.floatingTexts.push({
        x,
        y,
        text,
        color,
        vy: -1.3,
        life: 0.9,
        maxLife: 0.9
      });
    }
    updateFloatingTexts(dt) {
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= dt;
        if (ft.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }
    updateShockwaves(dt) {
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += 260 * dt;
        sw.alpha = 1 - sw.radius / sw.maxRadius;
        if (sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
    }
    createHitSparks(x, y, color) {
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          color,
          life: 0.25,
          maxLife: 0.25
        });
      }
    }
    createExplosionParticles(x, y, color, count = 25) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.5,
          color,
          life: 0.65,
          maxLife: 0.65
        });
      }
    }
    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
    updateHUD(distanceRatio) {
      if (!this.hud) return;
      const healthPct = Math.max(0, this.player.health / this.player.maxHealth * 100);
      if (this.hud.healthBar) {
        this.hud.healthBar.style.width = `${healthPct}%`;
        this.hud.healthBar.style.background = healthPct < 28 ? "linear-gradient(90deg, #ef4444, #f59e0b)" : "linear-gradient(90deg, #10b981, #00f3ff)";
      }
      if (this.hud.healthText) this.hud.healthText.textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;
      if (this.hud.specialStatus) {
        if (this.player.isSpecialActive) {
          this.hud.specialStatus.textContent = `ACTIVO (${this.player.specialTimer.toFixed(1)}s)`;
          this.hud.specialStatus.style.color = "#ec4899";
        } else if (this.player.specialCooldownTimer > 0) {
          this.hud.specialStatus.textContent = `RECARGA (${this.player.specialCooldownTimer.toFixed(1)}s)`;
          this.hud.specialStatus.style.color = "#f59e0b";
        } else {
          this.hud.specialStatus.textContent = "LISTO [E / SHIFT]";
          this.hud.specialStatus.style.color = "#34d399";
        }
      }
      const touchSpecialBadge = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById("touch-special-badge") : null;
      const touchSpecialBtn = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById("btn-touch-special") : null;
      if (touchSpecialBadge) {
        if (this.player.isSpecialActive) {
          touchSpecialBadge.textContent = `${this.player.specialTimer.toFixed(0)}s`;
          if (touchSpecialBtn) {
            touchSpecialBtn.classList.add("is-active");
            touchSpecialBtn.classList.remove("is-cooling");
          }
        } else if (this.player.specialCooldownTimer > 0) {
          touchSpecialBadge.textContent = `${this.player.specialCooldownTimer.toFixed(0)}s`;
          if (touchSpecialBtn) {
            touchSpecialBtn.classList.remove("is-active");
            touchSpecialBtn.classList.add("is-cooling");
          }
        } else {
          touchSpecialBadge.textContent = "LISTO";
          if (touchSpecialBtn) {
            touchSpecialBtn.classList.remove("is-active", "is-cooling");
          }
        }
      }
      if (this.hud.scoreText) this.hud.scoreText.textContent = this.score.toLocaleString();
      if (this.hud.stageProgress) {
        const pct = Math.min(100, Math.floor(distanceRatio * 100));
        this.hud.stageProgress.style.width = `${pct}%`;
        const pctEl = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById("hud-progress-pct") : null;
        if (pctEl) {
          if (this.enemies.some((e) => e.isFinalBoss)) {
            pctEl.innerHTML = "<span style='color: #ff0055;'>BOSS</span>";
          } else if (this.enemies.some((e) => e.isSubBoss)) {
            pctEl.innerHTML = "<span style='color: #fbbf24;'>SUBL\xCDDER</span>";
          } else {
            pctEl.textContent = `${pct}%`;
          }
        }
      }
      this.updateHudWeaponAndBombs();
    }
    updateHudWeaponAndBombs() {
      if (!this.hud) return;
      const touchBombBadge = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById("touch-bomb-badge") : null;
      if (touchBombBadge) {
        touchBombBadge.textContent = this.bombs;
      }
      if (this.hud.weaponLevelText) {
        const lvl = this.player.weaponLevel;
        if (lvl === 1) {
          this.hud.weaponLevelText.textContent = "NV 1 [EST\xC1NDAR]";
          this.hud.weaponLevelText.style.color = "#38bdf8";
        } else if (lvl === 2) {
          const shieldText = this.player.upgradeHitsReceived === 1 ? "\u26A0\uFE0F [1/2 DA\xD1ADO]" : "\u2B50 [2/2 ESCUDO]";
          this.hud.weaponLevelText.textContent = `NV 2 ${shieldText}`;
          this.hud.weaponLevelText.style.color = this.player.upgradeHitsReceived === 1 ? "#f59e0b" : "#34d399";
        } else {
          const shieldText = this.player.upgradeHitsReceived === 1 ? "\u26A0\uFE0F [1/2 DA\xD1ADO]" : "\u2B50\u2B50 [2/2 ESCUDO]";
          this.hud.weaponLevelText.textContent = `NV 3 ${shieldText}`;
          this.hud.weaponLevelText.style.color = this.player.upgradeHitsReceived === 1 ? "#f59e0b" : "#e879f9";
        }
      }
      if (this.hud.bombsCountText) {
        this.hud.bombsCountText.textContent = this.bombs;
      }
      this.updateHudLives();
    }
    updateHudLives() {
      if (this.hud && this.hud.livesText) {
        this.hud.livesText.textContent = this.lives;
      } else {
        const el = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById("hud-lives-count") : null;
        if (el) el.textContent = this.lives;
      }
    }
    respawnPlayer() {
      this.lives--;
      this.player.health = this.player.maxHealth;
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height - 90;
      this.player.invulnerableTimer = 3;
      this.player.weaponLevel = Math.max(1, this.player.weaponLevel - 1);
      this.player.upgradeHitsReceived = 0;
      this.enemyProjectiles = this.enemyProjectiles.filter((ep) => ep.y < this.canvas.height - 240);
      this.screenShake = 16;
      this.shockwaves.push({
        x: this.player.x,
        y: this.player.y,
        radius: 10,
        maxRadius: 320,
        color: "#f43f5e",
        alpha: 1
      });
      try {
        Sound.playSpecialAbility();
      } catch (_) {
      }
      this.addFloatingText(this.player.x, this.player.y - 45, `\u26A0\uFE0F \xA1VIDA PERDIDA! TE QUEDAN ${this.lives} VIDAS`, "#f43f5e");
      this.updateHudLives();
      this.updateHudWeaponAndBombs();
    }
    addLives(count = 5) {
      this.lives += count;
      this.updateHudLives();
      this.addFloatingText(this.player.x, this.player.y - 45, `\u{1F496} \xA1+${count} VIDAS OTORGADAS (${this.lives})!`, "#f43f5e");
      this.createExplosionParticles(this.player.x, this.player.y, "#f43f5e", 25);
    }
    onPlayerHit() {
      this.screenShake = Math.max(this.screenShake, 9);
      if (this.player.weaponLevel > 1) {
        this.player.upgradeHitsReceived++;
        if (this.player.upgradeHitsReceived === 1) {
          this.addFloatingText(this.player.x, this.player.y - 35, "\u26A0\uFE0F \xA1ESCUDO DE ARMA DA\xD1ADO (1/2 GOLPES)!", "#f59e0b");
        } else if (this.player.upgradeHitsReceived >= 2) {
          this.player.weaponLevel = Math.max(1, this.player.weaponLevel - 1);
          this.player.upgradeHitsReceived = 0;
          Sound.playWeaponDowngrade();
          this.addFloatingText(this.player.x, this.player.y - 35, "\u{1F4A5} \xA1MEJORA DE ARMA PERDIDA TRAS 2 GOLPES!", "#ef4444");
        }
        this.updateHudWeaponAndBombs();
      }
    }
    triggerBomb() {
      if (!this.isRunning || this.isPaused || this.bombs <= 0) return;
      this.bombs--;
      Sound.playBombDetonation();
      this.screenShake = 32;
      this.bombFlash = 1;
      this.shockwaves.push({
        x: this.player.x,
        y: this.player.y,
        radius: 20,
        maxRadius: 650,
        color: "#00f3ff",
        alpha: 1
      });
      this.shockwaves.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        radius: 15,
        maxRadius: 750,
        color: "#f43f5e",
        alpha: 1
      });
      for (const ep of this.enemyProjectiles) {
        this.createExplosionParticles(ep.x, ep.y, "#38bdf8", 5);
      }
      this.enemyProjectiles = [];
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (enemy.isBoss) {
          enemy.health -= 380;
          this.createExplosionParticles(enemy.x, enemy.y, "#f43f5e", 35);
          this.addFloatingText(enemy.x, enemy.y, "-380 CR\xCDTICO BOMBA", "#f43f5e");
          if (enemy.health <= 0) {
            this.handleEnemyDefeated(enemy, i);
          }
        } else {
          this.createExplosionParticles(enemy.x, enemy.y, "#f43f5e", 22);
          this.handleEnemyDefeated(enemy, i);
        }
      }
      this.addFloatingText(this.player.x, this.player.y - 45, "\u{1F4A3} \xA1DETONACI\xD3N T\xC1CTICA OMNIDIRECCIONAL!", "#f43f5e");
      this.updateHudWeaponAndBombs();
    }
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save();
      if (this.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * this.screenShake;
        const shakeY = (Math.random() - 0.5) * this.screenShake;
        this.ctx.translate(shakeX, shakeY);
      }
      const distanceRatio = Math.min(1, this.stageDistance / this.stageTargetDistance);
      this.scenario.render(this.currentStage, distanceRatio);
      for (const sw of this.shockwaves) {
        this.ctx.strokeStyle = sw.color;
        this.ctx.lineWidth = Math.max(1, 4 * sw.alpha);
        this.ctx.globalAlpha = Math.max(0, sw.alpha);
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1;
      for (const p of this.powerups) {
        this.drawPowerup(p);
      }
      for (const ep of this.enemyProjectiles) {
        const col = ep.color || "#ef4444";
        const rad = ep.radius || 4.5;
        this.ctx.fillStyle = col;
        this.ctx.shadowColor = col;
        this.ctx.shadowBlur = rad * 2;
        if (ep.type === "frost_needle") {
          this.ctx.save();
          this.ctx.translate(ep.x, ep.y);
          this.ctx.rotate(Math.atan2(ep.vy, ep.vx));
          this.ctx.beginPath();
          this.ctx.moveTo(rad * 2.2, 0);
          this.ctx.lineTo(0, rad * 0.7);
          this.ctx.lineTo(-rad * 2.2, 0);
          this.ctx.lineTo(0, -rad * 0.7);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.restore();
        } else if (ep.type === "torpedo") {
          this.ctx.beginPath();
          this.ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#ffffff";
          this.ctx.beginPath();
          this.ctx.arc(ep.x, ep.y - rad * 0.5, rad * 0.45, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (ep.type === "plasma_orb") {
          this.ctx.beginPath();
          this.ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#ffffff";
          this.ctx.beginPath();
          this.ctx.arc(ep.x, ep.y, rad * 0.45, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (ep.type === "imperial_bolt") {
          this.ctx.save();
          this.ctx.translate(ep.x, ep.y);
          this.ctx.rotate(Math.atan2(ep.vy, ep.vx));
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, rad * 2.2, rad * 0.65, 0, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#ffffff";
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, rad * 1.2, rad * 0.35, 0, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        } else if (ep.type === "cluster_bomb") {
          this.ctx.save();
          this.ctx.translate(ep.x, ep.y);
          this.ctx.rotate(performance.now() * 8e-3);
          this.ctx.beginPath();
          this.ctx.moveTo(0, -rad * 1.5);
          this.ctx.lineTo(rad * 1.3, rad);
          this.ctx.lineTo(-rad * 1.3, rad);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.fillStyle = "#ffffff";
          this.ctx.beginPath();
          this.ctx.arc(0, 0, rad * 0.4, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        } else {
          this.ctx.beginPath();
          this.ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.shadowBlur = 0;
      for (const enemy of this.enemies) {
        if (enemy.isBoss) {
          BossCatalog.drawBoss(this.ctx, enemy);
        } else {
          EnemyCatalog.drawEnemy(this.ctx, enemy);
        }
      }
      for (const p of this.projectiles) {
        ShipRenderer.drawProjectile(this.ctx, p);
      }
      if (this.player.health > 0) {
        const isInvul = this.player.invulnerableTimer > 0;
        const shouldDraw = !isInvul || Math.floor(this.player.invulnerableTimer * 12) % 2 === 0;
        if (shouldDraw) {
          ShipRenderer.drawPlayerShip(
            this.ctx,
            this.ship,
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height,
            this.player.isSpecialActive
          );
        }
        if (isInvul) {
          this.ctx.save();
          this.ctx.strokeStyle = "#00f3ff";
          this.ctx.lineWidth = 2.5;
          this.ctx.shadowColor = "#00f3ff";
          this.ctx.shadowBlur = 18;
          this.ctx.beginPath();
          this.ctx.arc(this.player.x, this.player.y, this.player.width * 0.78, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.fillStyle = "rgba(0, 243, 255, 0.15)";
          this.ctx.beginPath();
          this.ctx.arc(this.player.x, this.player.y, this.player.width * 0.78, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
      }
      for (const p of this.particles) {
        const alpha = p.life / p.maxLife;
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
      for (const ft of this.floatingTexts) {
        this.ctx.font = "bold 13px Orbitron, monospace";
        this.ctx.fillStyle = ft.color;
        this.ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        this.ctx.textAlign = "center";
        this.ctx.fillText(ft.text, ft.x, ft.y);
      }
      this.ctx.globalAlpha = 1;
      if (this.activeBoss) {
        this.drawBossBattleBanner(this.activeBoss);
      }
      if (this.player.health > 0 && this.player.health / this.player.maxHealth < 0.28) {
        const alphaPulse = 0.22 + Math.sin(performance.now() * 9e-3) * 0.14;
        const grad = this.ctx.createRadialGradient(
          this.canvas.width / 2,
          this.canvas.height / 2,
          this.canvas.width * 0.25,
          this.canvas.width / 2,
          this.canvas.height / 2,
          this.canvas.width * 0.65
        );
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `rgba(239, 68, 68, ${alphaPulse})`);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.bombFlash > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.bombFlash * 0.45})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.bombFlash = Math.max(0, this.bombFlash - 0.04);
      }
      if (this.stageBannerTimer > 0) {
        this.drawStageIntroBanner();
      }
      if (this.mainBossDefeated) {
        this.drawBossDefeatedCinematicBanner();
      }
      this.ctx.restore();
    }
    drawStageIntroBanner() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const progress = Math.min(1, this.stageBannerTimer / 3.5);
      const alpha = Math.min(1, progress * 1.8);
      ctx.save();
      ctx.globalAlpha = alpha;
      const boxW = Math.min(w * 0.92, 540);
      const boxH = 195;
      const boxX = (w - boxW) / 2;
      const boxY = h * 0.28;
      ctx.fillStyle = "rgba(4, 9, 24, 0.94)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = "#00f3ff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00f3ff";
      ctx.shadowBlur = 14;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.shadowBlur = 0;
      ctx.textAlign = "center";
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 18px Orbitron, monospace";
      ctx.shadowColor = "#00f3ff";
      ctx.shadowBlur = 10;
      ctx.fillText(`\u{1F680} \xC1REA ${this.currentStage} \xB7 DESPLIEGUE T\xC1CTICO`, w / 2, boxY + 26);
      ctx.shadowBlur = 0;
      const stageNames = {
        1: "Traves\xEDa Continental: Norteam\xE9rica a la Ant\xE1rtida",
        2: "Pac\xEDfico Oce\xE1nico: De Isla en Isla a Australia",
        3: "Traves\xEDa Interplanetaria: Tierra, Marte, J\xFApiter y Saturno",
        4: "El C\xEDrculo \xC1rtico: De Groenlandia al Polo Norte",
        5: "Jungla Devastada: Asalto al Cuartel General"
      };
      ctx.font = "11px Orbitron, monospace";
      ctx.fillStyle = "#34d399";
      ctx.fillText(stageNames[this.currentStage] || "Misi\xF3n de Incursi\xF3n T\xE1ctica", w / 2, boxY + 46);
      const midBossData = BossCatalog.getMidBoss(this.currentStage);
      const stageBossData = BossCatalog.getStageBoss(this.currentStage);
      const cardW = (boxW - 36) / 2;
      const cardH = 92;
      const cardY = boxY + 58;
      const card1X = boxX + 12;
      ctx.fillStyle = "rgba(8, 20, 38, 0.9)";
      ctx.fillRect(card1X, cardY, cardW, cardH);
      ctx.strokeStyle = midBossData.color || "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(card1X, cardY, cardW, cardH);
      ctx.font = "bold 9px Orbitron, monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText("\u26A0\uFE0F SUBL\xCDDER (40%)", card1X + cardW / 2, cardY + 15);
      ctx.font = "bold 8px Orbitron, monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(midBossData.name.replace(" (SUBL\xCDDER)", ""), card1X + cardW / 2, cardY + cardH - 8);
      const previewMid = {
        ...midBossData,
        x: card1X + cardW / 2,
        y: cardY + 45,
        width: midBossData.width * 0.52,
        height: midBossData.height * 0.52
      };
      this.drawMiniBossVector(ctx, previewMid);
      const card2X = boxX + boxW - cardW - 12;
      ctx.fillStyle = "rgba(38, 8, 20, 0.9)";
      ctx.fillRect(card2X, cardY, cardW, cardH);
      ctx.strokeStyle = stageBossData.color || "#ff0055";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(card2X, cardY, cardW, cardH);
      ctx.font = "bold 9px Orbitron, monospace";
      ctx.fillStyle = "#ff0055";
      ctx.textAlign = "center";
      ctx.fillText("\u{1F451} BOSS FINAL (85%)", card2X + cardW / 2, cardY + 15);
      ctx.font = "bold 8px Orbitron, monospace";
      ctx.fillStyle = "#ffffff";
      const shortFinalName = stageBossData.name.split("(")[0].trim();
      ctx.fillText(shortFinalName, card2X + cardW / 2, cardY + cardH - 8);
      const previewFinal = {
        ...stageBossData,
        x: card2X + cardW / 2,
        y: cardY + 45,
        width: stageBossData.width * 0.48,
        height: stageBossData.height * 0.48
      };
      this.drawMiniBossVector(ctx, previewFinal);
      ctx.font = "bold 9px Orbitron, monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText("\u26A1 AMENAZAS CONFIRMADAS \xB7 INICIANDO INCURSI\xD3N \u26A1", w / 2, boxY + boxH - 12);
      ctx.restore();
    }
    drawMiniBossVector(ctx, boss) {
      try {
        ctx.save();
        ctx.translate(boss.x, boss.y);
        const halfW = boss.width / 2;
        const halfH = boss.height / 2;
        BossCatalog.drawBossShip(ctx, boss, halfW, halfH);
        ctx.restore();
      } catch (err) {
        console.warn("Error drawing mini boss vector:", err);
        try {
          ctx.restore();
        } catch (e) {
        }
      }
    }
    drawBossDefeatedCinematicBanner() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.save();
      const pulse = 0.85 + Math.sin(performance.now() * 8e-3) * 0.15;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "rgba(5, 12, 8, 0.92)";
      ctx.fillRect(w * 0.08, h * 0.38, w * 0.84, 86);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.strokeRect(w * 0.08, h * 0.38, w * 0.84, 86);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 24px Orbitron, monospace";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 20;
      ctx.fillText(`\u{1F3C6} \xA1\xC1REA ${this.currentStage} SUPERADA!`, w / 2, h * 0.38 + 38);
      ctx.font = "bold 13px Orbitron, monospace";
      ctx.fillStyle = "#34d399";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 10;
      const nextSt = this.currentStage < 5 ? `DESBLOQUEADA FASE ${this.currentStage + 1} \u2794` : "CAMPA\xD1A CONQUISTADA AL 100%";
      ctx.fillText(`JEFE PRINCIPAL ANIQUILADO \xB7 ${nextSt}`, w / 2, h * 0.38 + 66);
      ctx.restore();
    }
    drawBossBattleBanner(boss) {
      const ctx = this.ctx;
      const w = this.canvas.width;
      ctx.save();
      ctx.fillStyle = "rgba(7, 10, 22, 0.85)";
      ctx.fillRect(w * 0.15, 12, w * 0.7, 36);
      ctx.strokeStyle = boss.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.15, 12, w * 0.7, 36);
      ctx.fillStyle = boss.color;
      ctx.font = "9px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(`\u2694\uFE0F ${boss.name} \u2014 ${boss.title}`, w / 2, 24);
      const healthRatio = Math.max(0, boss.health / boss.maxHealth);
      const barW = w * 0.65;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(w * 0.175, 30, barW, 10);
      const grad = ctx.createLinearGradient(w * 0.175, 0, w * 0.175 + barW, 0);
      grad.addColorStop(0, "#f43f5e");
      grad.addColorStop(1, boss.color);
      ctx.fillStyle = grad;
      ctx.fillRect(w * 0.175, 30, barW * healthRatio, 10);
      ctx.restore();
    }
    drawPauseOverlay() {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#00f3ff";
      this.ctx.font = "22px Orbitron";
      this.ctx.textAlign = "center";
      this.ctx.fillText("SISTEMA EN PAUSA", this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = "13px Rajdhani";
      this.ctx.fillText("Presione 'P' para continuar combate", this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    async handleGameOver() {
      this.stop();
      Sound.stopMusic();
      Sound.playGameOver();
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("naves_bonus_lives", "0");
      }
      await ApiService.submitScore({
        ship_id: this.ship.id,
        stage_reached: this.currentStage,
        score: this.score,
        enemies_destroyed: this.enemiesDestroyed,
        bosses_defeated: this.bossesDefeated,
        victory: false
      });
      if (this.hud && this.hud.onGameOver) {
        this.hud.onGameOver({
          score: this.score,
          enemies: this.enemiesDestroyed,
          bosses: this.bossesDefeated,
          stage: this.currentStage
        });
      }
    }
    async handleStageVictory() {
      this.stop();
      Sound.stopMusic();
      Sound.playVictory();
      if (typeof window !== "undefined" && window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
        try {
          window.CrazyGames.SDK.game.happytime();
        } catch (_) {
        }
      }
      const isCampaignVictory = this.currentStage === 5;
      const bonusScore = isCampaignVictory ? 15e3 : 5e3;
      const finalScore = this.score + bonusScore;
      if (document.fullscreenElement && document.fullscreenElement !== document.documentElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {
          });
        }
      }
      if (this.hud && this.hud.onStageVictory) {
        this.hud.onStageVictory({
          stageCompleted: this.currentStage,
          score: finalScore,
          enemies: this.enemiesDestroyed,
          bosses: this.bossesDefeated,
          isCampaignVictory
        });
      }
      try {
        await ApiService.completeStage(this.currentStage);
        await ApiService.submitScore({
          ship_id: this.ship.id,
          stage_reached: this.currentStage,
          score: finalScore,
          enemies_destroyed: this.enemiesDestroyed,
          bosses_defeated: this.bossesDefeated,
          victory: isCampaignVictory
        });
      } catch (err) {
        console.warn("[Progreso SQLite] Error en background sync tras victoria:", err);
      }
    }
  };

  // frontend/js/intro_cinema.js
  var IntroCinema = {
    dialogues: [
      {
        speaker: "ALERTA DE SISTEMA",
        role: "IA DE NAVEGACI\xD3N T\xC1CTICA",
        avatar: "\u{1F4E1}",
        color: "#00f3ff",
        text: "\xA1ATENCI\xD3N! Frecuencia de emergencia interceptada. Transmisi\xF3n hologr\xE1fica forzada de ultra-alta prioridad desde el Cuartel General de la Jungla..."
      },
      {
        speaker: "GENERAL VEKTOR",
        role: "SUPREMO SE\xD1OR DE LA GUERRA (BOSS FINAL)",
        avatar: "\u{1F47E}",
        color: "#ff0055",
        text: "\xBFAs\xED que estos son los 'heroicos' pilotos de la rebeli\xF3n? \xA1Pat\xE9ticos! Mis sat\xE9lites polares barren todo el continente y mis defensas son infranqueables. \xBFDe verdad creen que sus chatarras sobrevivir\xE1n?"
      },
      {
        speaker: "COMANDANTE DEL ESCUADR\xD3N",
        role: "PILOTO PROTAGONISTA",
        avatar: "\u{1F468}\u200D\u{1F680}",
        color: "#38bdf8",
        text: "Vektor, tu tiran\xEDa termina hoy. Hemos rastreado la red que alimenta tu superarma. Destruiremos tus defensas desde el \xC1rtico hasta la Ant\xE1rtida y llegaremos a tu fortaleza."
      },
      {
        speaker: "GENERAL VEKTOR",
        role: "SUPREMO SE\xD1OR DE LA GUERRA (BOSS FINAL)",
        avatar: "\u{1F47E}",
        color: "#ff0055",
        text: "\xA1JAJAJAJA! \xBFAcaso sue\xF1an con cruzar el Pac\xEDfico y la tempestad de hielo? Jam\xE1s llegar\xE1n a mi estaci\xF3n en Saturno ni a mi base en la Selva. \xA1Mis subl\xEDderes y acorazados los pulverizar\xE1n antes de que vean la luz del sol!"
      },
      {
        speaker: "COMANDANTE DEL ESCUADR\xD3N",
        role: "PILOTO PROTAGONISTA",
        avatar: "\u{1F468}\u200D\u{1F680}",
        color: "#38bdf8",
        text: "Prepara tus mejores armas, Vektor. Escuadr\xF3n de asalto: \xA1Motores al m\xE1ximo, activen armas de combate y despeguen a velocidad supers\xF3nica!"
      }
    ],
    currentIndex: 0,
    onCompleteCallback: null,
    typewriterTimeout: null,
    isTyping: false,
    fullText: "",
    show(onComplete) {
      this.currentIndex = 0;
      this.onCompleteCallback = onComplete;
      const modal = document.getElementById("intro-cinema-modal");
      if (!modal) return;
      modal.classList.remove("hidden");
      this.setupListeners();
      this.renderCurrentDialogue();
    },
    playTerminalBeep() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650 + Math.random() * 200, ctx.currentTime);
        gain.gain.setValueAtTime(0.025, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch {
      }
    },
    renderCurrentDialogue() {
      if (this.typewriterTimeout) {
        clearTimeout(this.typewriterTimeout);
      }
      const current = this.dialogues[this.currentIndex];
      if (!current) {
        this.close();
        return;
      }
      const speakerEl = document.getElementById("intro-speaker-name");
      const roleEl = document.getElementById("intro-speaker-role");
      const avatarEl = document.getElementById("intro-avatar");
      const textEl = document.getElementById("intro-dialogue-text");
      const counterEl = document.getElementById("intro-counter");
      if (speakerEl) {
        speakerEl.textContent = current.speaker;
        speakerEl.style.color = current.color;
      }
      if (roleEl) roleEl.textContent = current.role;
      if (counterEl) {
        counterEl.textContent = `${this.currentIndex + 1} / ${this.dialogues.length}`;
      }
      if (avatarEl) {
        avatarEl.textContent = current.avatar;
        avatarEl.style.animation = "none";
        void avatarEl.offsetWidth;
        avatarEl.style.animation = "tactical-glitch 1.5s infinite alternate ease-in-out";
        avatarEl.style.borderColor = current.color;
      }
      this.fullText = current.text;
      this.isTyping = true;
      let charIndex = 0;
      textEl.innerHTML = '<span class="typewriter-cursor">_</span>';
      const typeNextChar = () => {
        if (!this.isTyping) return;
        if (charIndex < this.fullText.length) {
          charIndex++;
          const currentSnippet = this.fullText.slice(0, charIndex);
          textEl.innerHTML = currentSnippet + '<span class="typewriter-cursor">_</span>';
          if (charIndex % 2 === 0) {
            this.playTerminalBeep();
          }
          const delay = this.fullText[charIndex - 1] === "." || this.fullText[charIndex - 1] === "?" ? 180 : 22;
          this.typewriterTimeout = setTimeout(typeNextChar, delay);
        } else {
          this.isTyping = false;
          textEl.innerHTML = this.fullText + '<span class="typewriter-cursor">_</span>';
        }
      };
      typeNextChar();
    },
    next() {
      if (this.isTyping) {
        if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
        this.isTyping = false;
        const textEl = document.getElementById("intro-dialogue-text");
        if (textEl) {
          textEl.innerHTML = this.fullText + '<span class="typewriter-cursor">_</span>';
        }
        return;
      }
      this.currentIndex++;
      if (this.currentIndex >= this.dialogues.length) {
        this.close();
      } else {
        this.renderCurrentDialogue();
      }
    },
    close() {
      if (this.typewriterTimeout) {
        clearTimeout(this.typewriterTimeout);
      }
      this.isTyping = false;
      const modal = document.getElementById("intro-cinema-modal");
      if (modal) modal.classList.add("hidden");
      if (this.onCompleteCallback) {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    },
    setupListeners() {
      const btnNext = document.getElementById("btn-intro-next");
      const btnSkip = document.getElementById("btn-intro-skip");
      if (btnNext) {
        btnNext.onclick = () => this.next();
      }
      if (btnSkip) {
        btnSkip.onclick = () => this.close();
      }
    }
  };

  // frontend/js/mission_lore.js
  var MissionLore = {
    1: {
      operation: "OPERACI\xD3N V\xD3RTICE POLAR",
      stageName: "Fase 1: Norteam\xE9rica a la Ant\xE1rtida",
      classification: "ALTA PRIORIDAD - RUPTURA DE CERCO",
      lore: "El General Vektor ha instalado una red de sat\xE9lites esp\xEDa y torres de radar de alerta temprana que barren todo el hemisferio occidental, desde Alaska hasta los hielos ant\xE1rticos. Si intentamos un asalto directo a su cuartel general en la selva, seremos detectados y desintegrados por fuego antia\xE9reo en minutos. Tu objetivo es sobrevolar este corredor continental a velocidad supers\xF3nica, derribar los puestos de enlace y destruir la fortaleza voladora Goliath Apex en el polo sur para cegar la vigilancia enemiga y abrir una brecha t\xE1ctica limpia para la flota.",
      objective: "Cegar los radares continentales y asegurar el corredor de vuelo del hemisferio sur.",
      intel: {
        subBoss: "Aurora-9 \u2014 Bombardero estratosf\xE9rico supers\xF3nico con r\xE1fagas guiadas.",
        finalBoss: "Goliath Apex \u2014 Fortaleza polar equipada con torretas gemelas de asalto."
      },
      threatLevel: "AMENAZA: MEDIA"
    },
    2: {
      operation: "OPERACI\xD3N MAREA TORMENTOSA",
      stageName: "Fase 2: Cruce del Oc\xE9ano Pac\xEDfico a Australia",
      classification: "INFILTRACI\xD3N MAR\xCDTIMA Y DEMOLICI\xD3N DE ESCUDOS",
      lore: "Al hackear la caja negra del Goliath en la Ant\xE1rtida, descubrimos el secreto de los escudos impenetrables de Vektor: se alimentan de una cadena de generadores geot\xE9rmicos submarinos ocultos entre los atolones e islas del Pac\xEDfico. El coloso Leviathan coordina el flujo de energ\xEDa desde la costa de Australia. Si destruyes estas instalaciones oce\xE1nicas, el campo de fuerza del cuartel general de Vektor en la selva perder\xE1 el 60% de su blindaje y aseguraremos Ocean\xEDa como base avanzada para los cazas rebeldes.",
      objective: "Neutralizar los generadores insulares de energ\xEDa y hundir al portanaves Leviathan.",
      intel: {
        subBoss: "Nautilus-X \u2014 Corbeta anfibia de alta velocidad con ca\xF1ones en arco.",
        finalBoss: "Leviathan Colossus \u2014 Acorazado naval-a\xE9reo pesado capaz de disparar salvas masivas."
      },
      threatLevel: "AMENAZA: ALTA"
    },
    3: {
      operation: "OPERACI\xD3N TRAVES\xCDA A SATURNO",
      stageName: "Fase 3: De la Tierra a Marte, J\xFApiter y Saturno",
      classification: "COMBATE EXTRA-ATMOSF\xC9RICO DE SUPREMAC\xCDA INTERPLANETARIA",
      lore: "Los datos capturados en el Pac\xEDfico revelan una amenaza tit\xE1nica: el General Vektor instal\xF3 una mega-estaci\xF3n de guerra orbital en los majestuosos anillos de Saturno, alimentada por plasma extra\xEDdo de J\xFApiter. Despega de la Tierra, rebasa la \xF3rbita roja de Marte, navega a trav\xE9s del peligroso Cintur\xF3n de Asteroides y neutraliza a la sonda subl\xEDder Jovian Core frente a J\xFApiter. Luego, acelera a m\xE1xima potencia hacia los anillos de Saturno para destruir la estaci\xF3n Ganymede Titan antes de que cargue su ca\xF1\xF3n de aniquilaci\xF3n.",
      objective: "Superar Marte y el cintur\xF3n de asteroides, abatir a Jovian Core en J\xFApiter y destruir al tit\xE1n en los anillos de Saturno.",
      intel: {
        subBoss: "Jovian Core \u2014 Sonda orbital de plasma frente a J\xFApiter con v\xF3rtice espiral cu\xE1druple.",
        finalBoss: "Ganymede Titan \u2014 Fortaleza imperial en los anillos de Saturno armada con corona solar y railgun hiperdenso."
      },
      threatLevel: "AMENAZA: CR\xCDTICA"
    },
    4: {
      operation: "OPERACI\xD3N CERO ABSOLUTO",
      stageName: "Fase 4: El C\xEDrculo \xC1rtico: De Groenlandia al Polo Norte",
      classification: "INCURSI\xD3N POLAR A LA CIUDADELA SUBGLACIAL",
      lore: "El General Vektor ha instalado una base industrial secreta bajo el hielo eterno del Oc\xE9ano \xC1rtico. Ingresando por el C\xEDrculo Polar \xC1rtico a 66\xB033' N, tu nave deber\xE1 cruzar el Mar de Groenlandia entre Islandia y Svalbard, sobrevolar el colosal casquete de hielo continental (Inlandis) de Groenlandia \u2014donde el subl\xEDder Frost-Bite comanda un puesto avanzado de radar en Thule\u2014, y abrirte paso a trav\xE9s de la banquisa polar fracturada hasta alcanzar el mism\xEDsimo Polo Norte Geogr\xE1fico a 90\xB000' N. All\xED, en una colosal ciudadela criog\xE9nica subglacial, el destructor Zero-Kelvin custodia los c\xF3digos de desencriptaci\xF3n para desbloquear el b\xFAnker central en la selva.",
      objective: "Cruzar el C\xEDrculo \xC1rtico y Groenlandia, abatir a Frost-Bite en el Inlandis y destruir a Zero-Kelvin en el Polo Norte Geogr\xE1fico (90\xB0N).",
      intel: {
        subBoss: "Frost-Bite \u2014 Fortaleza b\xEDpeda \xE1rtica apostada en el puesto radar de Groenlandia con proyectiles criog\xE9nicos.",
        finalBoss: "Zero-Kelvin \u2014 Destructor glacial subglacial en el eje del Polo Norte armado con tormentas de esquirlas de permafrost."
      },
      threatLevel: "AMENAZA: EXTREMA"
    },
    5: {
      operation: "OPERACI\xD3N JUICIO DEL TIT\xC1N",
      stageName: "Fase 5: Jungla Profunda / Fortaleza del General Vektor",
      classification: "ASALTO FINAL - ELIMINACI\xD3N DEL COMANDO SUPREMO",
      lore: "\xA1Ha llegado el momento decisivo! Sin radares polares, sin generadores en el Pac\xEDfico, sin el reactor orbital de J\xFApiter y sin el suministro criog\xE9nico, el General Vektor se encuentra acorralado en su b\xFAnker subterr\xE1neo en el coraz\xF3n de la selva. La densa vegetaci\xF3n esconde defensas terrestres: utiliza tus bombas pesadas y armas especiales para talar \xE1rboles, abrir cr\xE1teres y desenterrar sus defensas. Enfr\xE9ntate al mecha Jungle-Beast y destruye en duelo a muerte al mism\xEDsimo Dreadnought Supremo de Vektor para liberar el planeta de una vez por todas.",
      objective: "Bombardear la jungla, neutralizar las defensas terrestres y liquidar al General Vektor.",
      intel: {
        subBoss: "Jungle-Beast \u2014 Mecha de guerra terrestre con misiles de racimo.",
        finalBoss: "GENERAL VEKTOR (Dread Apex) \u2014 El tirano en persona con triple patr\xF3n de ataque devastador."
      },
      threatLevel: "AMENAZA: M\xC1XIMA - BOSS FINAL"
    }
  };

  // frontend/js/ads_manager.js
  var ADS_CONFIG = {
    // Configuración Google AdSense
    ADSENSE_CLIENT_ID: "ca-pub-6261859133501243",
    ADSENSE_SLOT_PRE_MISSION: "1668600475",
    ADSENSE_SLOT_POST_MISSION: "0987654321",
    CLIENT_ID: "ca-pub-6261859133501243",
    SLOT_PRE_MISSION: "1668600475",
    // Configuración Monetag (Zona Vignette Limpia + Zona MultiTag + Direct Link)
    MONETAG_ZONE_ID: "12128966",
    MONETAG_ZONE_VIGNETTE: "12128966",
    MONETAG_ZONE_MULTITAG: "302008",
    MONETAG_DIRECT_LINK_URL: typeof localStorage !== "undefined" && localStorage.getItem("sa_monetag_direct_link") || "",
    // Configuración GameDistribution (Game GUID asignado al crear el juego)
    GD_GAME_ID: "d49c747be6564b50b1e93571d8b0ad58",
    // Configuración CrazyGames
    CRAZYGAMES_ENABLED: false,
    // Modo seguro de pruebas:
    TEST_MODE: false,
    // Timeout de seguridad en milisegundos (para que el jugador NUNCA quede congelado si falla un anuncio)
    AD_TIMEOUT_MS: 4e3,
    // --- POLÍTICAS DE EQUILIBRIO DINÁMICO DE ANUNCIOS ---
    // Intervalo estándar entre anuncios automáticos (50 segundos)
    MIN_COOLDOWN_MS: 5e4,
    // Intervalo ágil para transiciones de fase superada (25 segundos)
    STAGE_VICTORY_COOLDOWN_MS: 25e3,
    // Duración mínima de la partida para considerar mostrar anuncio (15 segundos)
    MIN_PLAYTIME_FOR_AD_MS: 15e3,
    // Se evalúa desde la primera partida completada
    FIRST_GAME_FREE: false,
    // Intervalo de publicidad periódica normal (1 vez cada hora = 3600000 ms)
    PERIODIC_HOURLY_INTERVAL_MS: 36e5,
    // Límite ampliado de anuncios intersticiales por sesión
    MAX_ADS_PER_SESSION: 25
  };
  var CLIENT_ID = ADS_CONFIG.ADSENSE_CLIENT_ID;
  var SLOT_PRE_MISSION = ADS_CONFIG.ADSENSE_SLOT_PRE_MISSION;
  if (typeof window !== "undefined") {
    window.__sa_combat_active = false;
    const _origOpen = window.open;
    window.open = function(...args) {
      if (window.__sa_combat_active) {
        console.log("[AdsManager] \u{1F6E1}\uFE0F Escudo de Combate: Ventana bloqueada para no interrumpir el vuelo activo.");
        return null;
      }
      return _origOpen.apply(this, args);
    };
  }
  var UniversalAdsManager = class {
    constructor() {
      this.currentPlatform = "STANDALONE";
      this.isInitialized = false;
      this.crazyGamesSDK = null;
      this.missionStartTime = 0;
      this.sessionAdsCount = 0;
      this.gamesPlayedCount = 0;
      this.lastAdTimestamp = this._loadLastAdTimestamp();
      this.lastPeriodicAdTimestamp = this._loadLastPeriodicAdTimestamp();
      this.detectPlatform();
      this._startPeriodicChecker();
    }
    _loadLastAdTimestamp() {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          return parseInt(sessionStorage.getItem("sa_last_ad_time") || "0", 10);
        }
      } catch (_) {
      }
      return 0;
    }
    _saveLastAdTimestamp(ts) {
      this.lastAdTimestamp = ts;
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem("sa_last_ad_time", ts.toString());
        }
      } catch (_) {
      }
    }
    _loadLastPeriodicAdTimestamp() {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return parseInt(localStorage.getItem("sa_last_hourly_ad") || "0", 10);
        }
      } catch (_) {
      }
      return 0;
    }
    _saveLastPeriodicAdTimestamp(ts) {
      this.lastPeriodicAdTimestamp = ts;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("sa_last_hourly_ad", ts.toString());
        }
      } catch (_) {
      }
    }
    /**
     * Verifica periódicamente si ha transcurrido 1 hora para mostrar anuncio normal fuera de combate
     */
    checkPeriodicHourlyAd(isInCombat = false) {
      if (isInCombat) {
        return false;
      }
      const now = Date.now();
      const timeSinceLastHourly = now - this.lastPeriodicAdTimestamp;
      if (this.lastPeriodicAdTimestamp > 0 && timeSinceLastHourly >= ADS_CONFIG.PERIODIC_HOURLY_INTERVAL_MS) {
        console.log(`[AdsManager] \u23F1\uFE0F Intervalo horario cumplido (${Math.round(timeSinceLastHourly / 6e4)} min transcurridos). Mostrando anuncio de cortes\xEDa en el hangar.`);
        this._saveLastPeriodicAdTimestamp(now);
        this.showInterstitial(null, { force: true, context: "periodic_hourly" });
        return true;
      } else if (this.lastPeriodicAdTimestamp === 0) {
        this._saveLastPeriodicAdTimestamp(now);
      }
      return false;
    }
    /**
     * Monitor en segundo plano que evalúa el temporizador de 1 hora
     */
    _startPeriodicChecker() {
      if (typeof window === "undefined") return;
      setInterval(() => {
        const battleContainer = document.getElementById("battle-container");
        const isBattleActive = battleContainer && !battleContainer.classList.contains("hidden");
        this.checkPeriodicHourlyAd(isBattleActive);
      }, 12e4);
    }
    /**
     * Registra el momento en que el jugador despega al combate
     */
    markMissionStart() {
      this.missionStartTime = Date.now();
      console.log("[AdsManager] \u{1F680} Misi\xF3n iniciada. Cron\xF3metro de sesi\xF3n activado.");
    }
    /**
     * Evalúa si es ético y oportuno mostrar un anuncio intersticial según las 4 reglas
     */
    canShowInterstitial(context = "game_over") {
      const now = Date.now();
      const playtime = this.missionStartTime > 0 ? now - this.missionStartTime : 0;
      if (this.currentPlatform === "GAMEDISTRIBUTION" || typeof window !== "undefined" && window.gdsdk) {
        return true;
      }
      if (ADS_CONFIG.FIRST_GAME_FREE && this.gamesPlayedCount === 0) {
        console.log("[AdsManager] \u{1F6E1}\uFE0F Cortes\xEDa inicial: Primera partida libre de anuncios para fidelizar al jugador.");
        return false;
      }
      if (context === "game_over" && playtime > 0 && playtime < ADS_CONFIG.MIN_PLAYTIME_FOR_AD_MS) {
        console.log(`[AdsManager] \u{1F6E1}\uFE0F Partida breve (${Math.round(playtime / 1e3)}s). Anuncio omitido para no frustrar tras ca\xEDda r\xE1pida.`);
        return false;
      }
      const requiredCooldown = context === "stage_victory" ? ADS_CONFIG.STAGE_VICTORY_COOLDOWN_MS : ADS_CONFIG.MIN_COOLDOWN_MS;
      const timeSinceLastAd = now - this.lastAdTimestamp;
      if (this.lastAdTimestamp > 0 && timeSinceLastAd < requiredCooldown) {
        const waitRemainingSec = Math.round((requiredCooldown - timeSinceLastAd) / 1e3);
        console.log(`[AdsManager] \u23F3 Cooldown activo (${waitRemainingSec}s restantes para ${context}). Anuncio autom\xE1tico omitido.`);
        return false;
      }
      if (this.sessionAdsCount >= ADS_CONFIG.MAX_ADS_PER_SESSION) {
        console.log("[AdsManager] \u{1F6E1}\uFE0F L\xEDmite m\xE1ximo de anuncios por sesi\xF3n alcanzado.");
        return false;
      }
      return true;
    }
    /**
     * Detecta automáticamente en qué portal o entorno se está ejecutando el juego
     */
    detectPlatform() {
      if (typeof window === "undefined") return;
      if (window.CrazyGames && window.CrazyGames.SDK) {
        this.currentPlatform = "CRAZYGAMES";
        this.crazyGamesSDK = window.CrazyGames.SDK;
        console.log("[AdsManager] Entorno detectado: CrazyGames SDK");
      } else if (window.gdsdk) {
        this.currentPlatform = "GAMEDISTRIBUTION";
        console.log("[AdsManager] Entorno detectado: GameDistribution SDK");
      } else if (window.aiptag) {
        this.currentPlatform = "ADINPLAY";
        console.log("[AdsManager] Entorno detectado: AdinPlay");
      } else if (window.monetag || window.show_monetag_ad) {
        this.currentPlatform = "MONETAG";
        console.log("[AdsManager] Entorno detectado: Monetag");
      } else {
        this.currentPlatform = "STANDALONE_WEB";
        console.log("[AdsManager] Entorno detectado: Web Propia (AdSense / Monetag / Standalone)");
      }
    }
    /**
     * Renderiza el banner de Google AdSense en un contenedor específico (ej: Briefing de Misión)
     */
    renderGoogleAd(containerElement, slotId = ADS_CONFIG.ADSENSE_SLOT_PRE_MISSION) {
      if (!containerElement) return;
      try {
        const ins = containerElement.querySelector("ins.adsbygoogle");
        if (!ins) return;
        if (ins.getAttribute("data-adsbygoogle-status")) {
          return;
        }
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("[AdsManager] Solicitud AdSense procesada para slot:", slotId);
        }
      } catch (err) {
        console.warn("[AdsManager] AdSense bloqueado por AdBlock o en modo simulaci\xF3n.", err);
      }
    }
    /**
     * Muestra un anuncio Interstitial entre partidas respetando el balance de juego
     */
    showInterstitial(onComplete, options = {}) {
      let finished = false;
      const safeComplete = () => {
        if (!finished) {
          finished = true;
          if (typeof onComplete === "function") onComplete();
        }
      };
      const force = options.force === true;
      const isAllowed = force || this.canShowInterstitial(options.context || "game_over");
      this.gamesPlayedCount++;
      if (!isAllowed) {
        safeComplete();
        return;
      }
      this._saveLastAdTimestamp(Date.now());
      this.sessionAdsCount++;
      const timer = setTimeout(() => {
        console.log("[AdsManager] Timeout de anuncio alcanzado. Continuando flujo de juego...");
        safeComplete();
      }, ADS_CONFIG.AD_TIMEOUT_MS);
      try {
        if (this.currentPlatform === "CRAZYGAMES" && this.crazyGamesSDK && this.crazyGamesSDK.ad) {
          this.crazyGamesSDK.ad.requestAd("midgame", {
            adStarted: () => {
              console.log("[CrazyGames] Anuncio midgame iniciado");
              if (typeof window !== "undefined" && window.Sound && window.Sound.stopMusic) window.Sound.stopMusic();
            },
            adFinished: () => {
              clearTimeout(timer);
              if (typeof window !== "undefined" && window.Sound && window.Sound.startMusic) window.Sound.startMusic();
              safeComplete();
            },
            adError: (error) => {
              console.warn("[CrazyGames] Error en anuncio midgame:", error);
              clearTimeout(timer);
              if (typeof window !== "undefined" && window.Sound && window.Sound.startMusic) window.Sound.startMusic();
              safeComplete();
            }
          });
          return;
        }
        if (this.currentPlatform === "GAMEDISTRIBUTION" && window.gdsdk && typeof window.gdsdk.showAd === "function") {
          window.gdsdk.showAd().then(() => {
            clearTimeout(timer);
            safeComplete();
          }).catch((err) => {
            console.warn("[GameDistribution] Error al reproducir anuncio:", err);
            clearTimeout(timer);
            safeComplete();
          });
          return;
        }
        if (typeof window.show_12128966 === "function") {
          console.log("[AdsManager] \u{1F4FA} Invocando Intersticial Monetag show_12128966...");
          try {
            window.show_12128966({ type: "end" }).then(() => {
              clearTimeout(timer);
              safeComplete();
            }).catch((err) => {
              console.warn("[Monetag] Anuncio cerrado o no disponible:", err);
              this._fallbackDirectLink();
              clearTimeout(timer);
              safeComplete();
            });
            return;
          } catch (e) {
            console.warn("[Monetag] Excepci\xF3n al invocar show_12128966:", e);
          }
        } else if (typeof window.show_302008 === "function") {
          try {
            window.show_302008({ type: "end" }).then(() => {
              clearTimeout(timer);
              safeComplete();
            }).catch(() => {
              this._fallbackDirectLink();
              clearTimeout(timer);
              safeComplete();
            });
            return;
          } catch (_) {
          }
        }
        if (this._fallbackDirectLink()) {
          clearTimeout(timer);
          safeComplete();
          return;
        }
        this._triggerMonetagVignette();
        clearTimeout(timer);
        safeComplete();
      } catch (e) {
        console.warn("[AdsManager] Excepci\xF3n al invocar anuncio:", e);
        clearTimeout(timer);
        safeComplete();
      }
    }
    /**
     * Invoca activamente el Vignette Banner de Monetag y verifica estado de AdBlock
     */
    _triggerMonetagVignette() {
      if (typeof document === "undefined") return;
      try {
        console.log(`[AdsManager] \u{1F4FA} Invocando Vignette Banner de Monetag (Zona: ${ADS_CONFIG.MONETAG_ZONE_ID})...`);
        document.dispatchEvent(new CustomEvent("stage_completed", { detail: { timestamp: Date.now() } }));
        if (typeof window.show_12128966 === "function") window.show_12128966();
        if (typeof window.show_monetag_ad === "function") window.show_monetag_ad();
        this.checkAdBlocker();
      } catch (err) {
        console.warn("[AdsManager] Error al invocar Monetag:", err);
      }
    }
    /**
     * Comprueba si el navegador tiene extensiones de AdBlock o Brave Shields activas
     */
    checkAdBlocker() {
      try {
        const bait = document.createElement("div");
        bait.className = "pub_300x250 pub_728x90 text-ad textAd text_ad text-ads ad-server";
        bait.style.cssText = "width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important;";
        document.body.appendChild(bait);
        const isBlocked = bait.offsetHeight === 0 || bait.clientHeight === 0 || !bait.offsetParent;
        bait.remove();
        if (isBlocked) {
          console.warn("[AdsManager] \u26A0\uFE0F Se detect\xF3 un bloqueador de anuncios (AdBlock / Brave Shields) activo en el navegador. Para ver y monetizar con Monetag, desactiva el escudo o agrega este sitio a la lista de permitidos.");
        } else {
          console.log("[AdsManager] \u2705 Verificaci\xF3n de red: Sin bloqueador de anuncios detectado.");
        }
        return isBlocked;
      } catch (_) {
        return false;
      }
    }
    /**
     * Muestra un anuncio con recompensa (Rewarded Video) VOLUNTARIO.
     * Utilizado para: "Revivir nave con escudo al 100% (+2 vidas de rescate)"
     */
    showRewardedAd(onRewarded, onDismissed) {
      try {
        if (this.currentPlatform === "CRAZYGAMES" && this.crazyGamesSDK && this.crazyGamesSDK.ad) {
          this.crazyGamesSDK.ad.requestAd("rewarded", {
            adStarted: () => {
              console.log("[CrazyGames] Video de recompensa iniciado");
              if (typeof window !== "undefined" && window.Sound && window.Sound.stopMusic) window.Sound.stopMusic();
            },
            adFinished: () => {
              console.log("[CrazyGames] Recompensa completada.");
              if (typeof window !== "undefined" && window.Sound && window.Sound.startMusic) window.Sound.startMusic();
              if (typeof onRewarded === "function") onRewarded();
            },
            adError: (error) => {
              console.warn("[CrazyGames] Error o descarte en video recompensado:", error);
              if (typeof window !== "undefined" && window.Sound && window.Sound.startMusic) window.Sound.startMusic();
              if (typeof onDismissed === "function") onDismissed();
            }
          });
          return;
        }
        if (this.currentPlatform === "GAMEDISTRIBUTION" && window.gdsdk && typeof window.gdsdk.showAd === "function") {
          window.gdsdk.showAd("rewarded").then(() => {
            console.log("[GameDistribution] Recompensa completada.");
            if (typeof onRewarded === "function") onRewarded();
          }).catch(() => {
            if (typeof onDismissed === "function") onDismissed();
          });
          return;
        }
        if (typeof window.show_12128966 === "function") {
          console.log("[AdsManager] \u26A1 Invocando anuncio recompensado Monetag show_12128966...");
          try {
            window.show_12128966({ type: "inApp" }).then(() => {
              console.log("[AdsManager] Recompensa Monetag completada con \xE9xito.");
              if (typeof onRewarded === "function") onRewarded();
            }).catch((err) => {
              console.warn("[AdsManager] Recompensa Monetag cerrada o no disponible:", err);
              this._fallbackDirectLink();
              if (typeof onRewarded === "function") onRewarded();
            });
            return;
          } catch (err) {
            console.warn("[AdsManager] Error al ejecutar show_12128966:", err);
          }
        } else if (typeof window.show_302008 === "function") {
          try {
            window.show_302008({ type: "inApp" }).then(() => {
              if (typeof onRewarded === "function") onRewarded();
            }).catch(() => {
              this._fallbackDirectLink();
              if (typeof onRewarded === "function") onRewarded();
            });
            return;
          } catch (_) {
          }
        }
        this._fallbackDirectLink();
        console.log("[AdsManager] Recompensa concedida: Revivir de rescate + escudo 100%.");
        if (typeof onRewarded === "function") {
          setTimeout(onRewarded, 350);
        }
      } catch (e) {
        console.warn("[AdsManager] Fallo en anuncio recompensado:", e);
        if (typeof onDismissed === "function") onDismissed();
      }
    }
    /**
     * Intenta abrir el Direct Link de Monetag en pestaña patrocinada si está configurado
     */
    _fallbackDirectLink() {
      try {
        const url = ADS_CONFIG.MONETAG_DIRECT_LINK_URL || typeof localStorage !== "undefined" && localStorage.getItem("sa_monetag_direct_link");
        if (url && typeof window !== "undefined") {
          console.log("[AdsManager] \u{1F517} Abriendo enlace patrocinado Direct Link de Monetag:", url);
          window.open(url, "_blank");
          return true;
        }
      } catch (_) {
      }
      return false;
    }
  };
  var adsManager = new UniversalAdsManager();
  function renderGoogleAd(containerElement, slotId) {
    adsManager.renderGoogleAd(containerElement, slotId);
  }

  // frontend/js/version.js
  var GAME_VERSION = "2.0";

  // frontend/js/cyber_dialog.js
  var CyberDialog = class {
    static modalElement = null;
    static currentResolver = null;
    static activeEngine = null;
    static wasEngineRunningBefore = false;
    static init(engineInstance = null) {
      if (engineInstance) {
        this.activeEngine = engineInstance;
      }
      this.createDomIfNeeded();
    }
    static createDomIfNeeded() {
      if (document.getElementById("cyber-dialog-modal")) {
        this.modalElement = document.getElementById("cyber-dialog-modal");
        return;
      }
      const modal = document.createElement("div");
      modal.id = "cyber-dialog-modal";
      modal.className = "modal-overlay hidden cyber-dialog-overlay";
      modal.innerHTML = `
      <div class="cyber-dialog-box danger-theme" id="cyber-dialog-box" role="dialog" aria-modal="true">
        <!-- Barra de estado superior con acento luminoso -->
        <div class="cyber-dialog-header">
          <div class="cyber-dialog-title-wrap">
            <span class="cyber-dialog-icon" id="cyber-dialog-icon">\u26A0\uFE0F</span>
            <div>
              <h3 class="cyber-dialog-title" id="cyber-dialog-title">CONFIRMACI\xD3N T\xC1CTICA</h3>
              <span class="cyber-dialog-badge" id="cyber-dialog-badge">COMANDO CENTRAL // RETIRADA T\xC1CTICA</span>
            </div>
          </div>
          <button id="cyber-dialog-btn-close" class="cyber-dialog-close-btn" type="button" title="Cerrar [ESC]">\u2715</button>
        </div>

        <!-- Cuerpo del mensaje -->
        <div class="cyber-dialog-body">
          <p id="cyber-dialog-message" class="cyber-dialog-text">
            \xBFDeseas abortar la misi\xF3n de combate y regresar al hangar?
          </p>
          <div id="cyber-dialog-subtext" class="cyber-dialog-subtext"></div>
        </div>

        <!-- Acciones interactivas -->
        <div class="cyber-dialog-actions" id="cyber-dialog-actions">
          <button id="cyber-dialog-btn-cancel" class="btn-cyber-outline cyber-dialog-btn-cancel" type="button">
            CONTINUAR COMBATE
          </button>
          <button id="cyber-dialog-btn-confirm" class="btn-cyber-danger cyber-dialog-btn-confirm" type="button">
            \u2715 ABORTAR MISI\xD3N
          </button>
        </div>
      </div>
    `;
      document.body.appendChild(modal);
      this.modalElement = modal;
      const btnClose = modal.querySelector("#cyber-dialog-btn-close");
      const btnCancel = modal.querySelector("#cyber-dialog-btn-cancel");
      const btnConfirm = modal.querySelector("#cyber-dialog-btn-confirm");
      btnClose.addEventListener("click", () => this.resolve(false));
      btnCancel.addEventListener("click", () => this.resolve(false));
      btnConfirm.addEventListener("click", () => this.resolve(true));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.resolve(false);
        }
      });
      window.addEventListener("keydown", (e) => {
        if (!this.modalElement || this.modalElement.classList.contains("hidden")) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.resolve(false);
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.resolve(true);
        }
      });
    }
    /**
     * Muestra un cuadro de confirmación táctico (Promise<boolean>)
     */
    static confirm(options = {}) {
      this.createDomIfNeeded();
      const title = options.title || "CONFIRMACI\xD3N T\xC1CTICA";
      const message = typeof options === "string" ? options : options.message || "\xBFConfirmas la operaci\xF3n?";
      const subtext = options.subtext !== void 0 ? options.subtext : "El progreso de vuelo no registrado en esta fase se reiniciar\xE1.";
      const icon = options.icon || "\u26A0\uFE0F";
      const badge = options.badge || "COMANDO CENTRAL // PROTOCOLO DE COMBATE";
      const confirmText = options.confirmText || "\u2715 ABORTAR MISI\xD3N";
      const cancelText = options.cancelText || "CONTINUAR COMBATE";
      const isDanger = options.isDanger !== false;
      if (this.activeEngine && this.activeEngine.isRunning && !this.activeEngine.isPaused) {
        this.wasEngineRunningBefore = true;
        this.activeEngine.isPaused = true;
      } else {
        this.wasEngineRunningBefore = false;
      }
      const box = document.getElementById("cyber-dialog-box");
      const titleEl = document.getElementById("cyber-dialog-title");
      const msgEl = document.getElementById("cyber-dialog-message");
      const subEl = document.getElementById("cyber-dialog-subtext");
      const iconEl = document.getElementById("cyber-dialog-icon");
      const badgeEl = document.getElementById("cyber-dialog-badge");
      const btnCancel = document.getElementById("cyber-dialog-btn-cancel");
      const btnConfirm = document.getElementById("cyber-dialog-btn-confirm");
      titleEl.textContent = title;
      msgEl.textContent = message;
      iconEl.textContent = icon;
      badgeEl.textContent = badge;
      if (subtext) {
        subEl.textContent = subtext;
        subEl.style.display = "block";
      } else {
        subEl.style.display = "none";
      }
      btnCancel.textContent = cancelText;
      btnCancel.style.display = "inline-flex";
      btnConfirm.textContent = confirmText;
      btnConfirm.className = isDanger ? "btn-cyber-danger cyber-dialog-btn-confirm" : "btn-cyber-primary cyber-dialog-btn-confirm";
      if (isDanger) {
        box.classList.add("danger-theme");
      } else {
        box.classList.remove("danger-theme");
      }
      try {
        Sound.playLaser(320, 160, 0.12);
      } catch (_) {
      }
      this.modalElement.classList.remove("hidden");
      return new Promise((resolve) => {
        this.currentResolver = resolve;
      });
    }
    /**
     * Muestra un cuadro de alerta táctico informativo (Promise<void>)
     */
    static alert(options = {}) {
      this.createDomIfNeeded();
      const title = options.title || "TRANSMISI\xD3N T\xC1CTICA";
      const message = typeof options === "string" ? options : options.message || "Aviso del sistema.";
      const subtext = options.subtext || "";
      const icon = options.icon || "\u2139\uFE0F";
      const badge = options.badge || "SISTEMA T\xC1CTICO // COMUNICADO";
      const okText = options.okText || "ENTENDIDO [ENTER]";
      const isDanger = options.isDanger === true;
      const box = document.getElementById("cyber-dialog-box");
      const titleEl = document.getElementById("cyber-dialog-title");
      const msgEl = document.getElementById("cyber-dialog-message");
      const subEl = document.getElementById("cyber-dialog-subtext");
      const iconEl = document.getElementById("cyber-dialog-icon");
      const badgeEl = document.getElementById("cyber-dialog-badge");
      const btnCancel = document.getElementById("cyber-dialog-btn-cancel");
      const btnConfirm = document.getElementById("cyber-dialog-btn-confirm");
      titleEl.textContent = title;
      msgEl.textContent = message;
      iconEl.textContent = icon;
      badgeEl.textContent = badge;
      if (subtext) {
        subEl.textContent = subtext;
        subEl.style.display = "block";
      } else {
        subEl.style.display = "none";
      }
      btnCancel.style.display = "none";
      btnConfirm.textContent = okText;
      btnConfirm.className = isDanger ? "btn-cyber-danger cyber-dialog-btn-confirm" : "btn-cyber-primary cyber-dialog-btn-confirm";
      if (isDanger) {
        box.classList.add("danger-theme");
      } else {
        box.classList.remove("danger-theme");
      }
      try {
        Sound.playLaser(440, 280, 0.1);
      } catch (_) {
      }
      this.modalElement.classList.remove("hidden");
      return new Promise((resolve) => {
        this.currentResolver = () => resolve();
      });
    }
    static resolve(val) {
      if (this.modalElement) {
        this.modalElement.classList.add("hidden");
      }
      if (this.wasEngineRunningBefore && this.activeEngine) {
        if (!val) {
          this.activeEngine.isPaused = false;
        }
      }
      try {
        Sound.playLaser(600, 300, 0.05);
      } catch (_) {
      }
      if (this.currentResolver) {
        const fn = this.currentResolver;
        this.currentResolver = null;
        fn(val);
      }
    }
  };
  window.CyberDialog = CyberDialog;
  window.cyberConfirm = (msg, opts) => CyberDialog.confirm(typeof msg === "string" ? { message: msg, ...opts } : msg);
  window.cyberAlert = (msg, opts) => CyberDialog.alert(typeof msg === "string" ? { message: msg, ...opts } : msg);

  // frontend/js/social_share.js
  var COOLDOWN_MS = 24 * 60 * 60 * 1e3;
  var STORAGE_KEY_LAST_CLAIM = "naves_last_share_reward_time";
  var STORAGE_KEY_BONUS_LIVES = "naves_bonus_lives";
  var SocialShareManager = class {
    constructor() {
      this.modal = null;
      this.previewTextarea = null;
      this.currentContext = "lobby";
      this.currentData = {};
      this.cooldownTimerId = null;
      this.init();
    }
    init() {
      if (typeof document === "undefined") return;
      this.modal = document.getElementById("share-modal");
      this.previewTextarea = document.getElementById("share-custom-text");
      if (!this.modal) return;
      this.bindEvents();
      this.updateLobbyBannerRewardStatus();
    }
    /**
     * Obtiene la URL canónica y limpia para compartir
     */
    getShareUrl() {
      if (typeof window === "undefined") return "https://space-assault.onrender.com";
      return window.location.origin;
    }
    /**
     * Comprueba si han pasado 24 horas desde la última reclamación
     */
    getRemainingCooldownMs() {
      if (typeof localStorage === "undefined") return 0;
      const lastClaim = parseInt(localStorage.getItem(STORAGE_KEY_LAST_CLAIM) || "0", 10);
      if (!lastClaim) return 0;
      const elapsed = Date.now() - lastClaim;
      return Math.max(0, COOLDOWN_MS - elapsed);
    }
    canClaimReward() {
      return this.getRemainingCooldownMs() <= 0;
    }
    formatRemainingTime(ms) {
      const totalSecs = Math.floor(ms / 1e3);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor(totalSecs % 3600 / 60);
      const secs = totalSecs % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      if (mins > 0) {
        return `${mins}m ${secs}s`;
      }
      return `${secs}s`;
    }
    /**
     * Genera el texto dinámico según el contexto del jugador
     */
    generateShareMessage(context = "lobby", data = {}) {
      const url = this.getShareUrl();
      const shipName = data.shipName || "Phoenix Vanguard";
      const score = data.score ? Number(data.score).toLocaleString() : "0";
      const stageName = data.stageName || (data.stage ? `Fase ${data.stage}` : "Fase 1");
      const enemies = data.enemies || 0;
      switch (context) {
        case "game_over":
          return `\u{1F4A5} \xA1He ca\xEDdo en combate en Space Assault con ${score} puntos y ${enemies} enemigos derribados al mando de la nave ${shipName}! \u{1F680} \xBFTe atreves a superar mi r\xE9cord de combate? Juega gratis ahora en: ${url} #SpaceAssault #RetroArcade #Gaming`;
        case "victory":
          return `\u{1F3C6} \xA1Victoria militar en Space Assault! Acabo de superar la ${stageName} con ${score} puntos de batalla pilotando la ${shipName}. \u26A1 \xA1\xDAnete a la flota y defiende la Tierra de la invasi\xF3n alien\xEDgena! Juega gratis aqu\xED: ${url} #SpaceAssault #IndieGame #Gaming`;
        case "lobby":
        default:
          return `\u{1F680} \xA1Te desaf\xEDo a jugar Space Assault! Acci\xF3n arcade aeroespacial a 60 FPS con naves personalizables, jefes gigantescos y combate t\xE1ctico puro. \xA1Comprueba si eres el As de la Federaci\xF3n!: ${url} #SpaceAssault #RetroArcade #Gaming`;
      }
    }
    /**
     * Abre el modal de recomendación configurado con el contexto deseado
     */
    open(context = "lobby", data = {}) {
      this.currentContext = context;
      this.currentData = data;
      this.modal = this.modal || document.getElementById("share-modal");
      if (!this.modal) return;
      const message = this.generateShareMessage(context, data);
      const textarea = document.getElementById("share-custom-text");
      const urlInput = document.getElementById("share-url-input");
      const contextBadge = document.getElementById("share-context-badge");
      if (textarea) textarea.value = message;
      if (urlInput) urlInput.value = this.getShareUrl();
      if (contextBadge) {
        if (context === "game_over") {
          contextBadge.textContent = "\u{1F4A5} TRANSMISI\xD3N DE R\xC9CORD DE COMBATE";
          contextBadge.style.color = "#f87171";
          contextBadge.style.borderColor = "rgba(248, 113, 113, 0.4)";
          contextBadge.style.background = "rgba(239, 68, 68, 0.15)";
        } else if (context === "victory") {
          contextBadge.textContent = "\u{1F3C6} TRANSMISI\xD3N DE VICTORIA MILITAR";
          contextBadge.style.color = "#34d399";
          contextBadge.style.borderColor = "rgba(52, 211, 153, 0.4)";
          contextBadge.style.background = "rgba(16, 185, 129, 0.15)";
        } else {
          contextBadge.textContent = "\u{1F4E1} RECLUTAMIENTO DE PILOTOS DE LA FEDERACI\xD3N";
          contextBadge.style.color = "#00f3ff";
          contextBadge.style.borderColor = "rgba(0, 243, 255, 0.4)";
          contextBadge.style.background = "rgba(0, 243, 255, 0.12)";
        }
      }
      this.updateModalRewardBanner();
      if (this.cooldownTimerId) clearInterval(this.cooldownTimerId);
      this.cooldownTimerId = setInterval(() => {
        this.updateModalRewardBanner();
      }, 1e3);
      const nativeBtn = document.getElementById("btn-share-native");
      if (nativeBtn) {
        nativeBtn.style.display = typeof navigator !== "undefined" && navigator.share ? "flex" : "none";
      }
      this.modal.classList.remove("hidden");
    }
    close() {
      if (this.modal) {
        this.modal.classList.add("hidden");
      }
      if (this.cooldownTimerId) {
        clearInterval(this.cooldownTimerId);
        this.cooldownTimerId = null;
      }
    }
    updateModalRewardBanner() {
      const bonusBanner = document.getElementById("share-bonus-alert");
      if (!bonusBanner) return;
      const remaining = this.getRemainingCooldownMs();
      if (remaining <= 0) {
        bonusBanner.innerHTML = "\u{1F381} <b>\xA1BONO DE RECLUTAMIENTO DISPONIBLE!</b> Comparte en cualquier red y recibe <b>+5 VIDAS</b> adicionales de inmediato.";
        bonusBanner.style.background = "rgba(16, 185, 129, 0.18)";
        bonusBanner.style.borderColor = "#10b981";
        bonusBanner.style.color = "#34d399";
        bonusBanner.classList.remove("hidden");
      } else {
        const timeStr = this.formatRemainingTime(remaining);
        bonusBanner.innerHTML = `\u23F3 <b>BONO DE +5 VIDAS EN RECARGA (24H):</b> Ya reclamado hoy. Pr\xF3ximo bono disponible en <span style="color: #fbbf24; font-weight: 800;">${timeStr}</span>.`;
        bonusBanner.style.background = "rgba(245, 158, 11, 0.12)";
        bonusBanner.style.borderColor = "rgba(245, 158, 11, 0.4)";
        bonusBanner.style.color = "#fde68a";
        bonusBanner.classList.remove("hidden");
      }
    }
    updateLobbyBannerRewardStatus() {
      const badgeEl = document.getElementById("lobby-share-badge");
      if (!badgeEl) return;
      const remaining = this.getRemainingCooldownMs();
      if (remaining <= 0) {
        badgeEl.textContent = "\u{1F381} +5 VIDAS DISPONIBLES";
        badgeEl.style.background = "rgba(16, 185, 129, 0.25)";
        badgeEl.style.borderColor = "#10b981";
        badgeEl.style.color = "#34d399";
      } else {
        badgeEl.textContent = `\u23F3 RECARGA: ${this.formatRemainingTime(remaining)}`;
        badgeEl.style.background = "rgba(245, 158, 11, 0.2)";
        badgeEl.style.borderColor = "rgba(245, 158, 11, 0.4)";
        badgeEl.style.color = "#fbbf24";
      }
    }
    getTextToShare() {
      const textarea = document.getElementById("share-custom-text");
      return textarea ? textarea.value.trim() : this.generateShareMessage(this.currentContext, this.currentData);
    }
    /**
     * Gestiona el otorgamiento de +5 VIDAS con control estricto de 24 horas
     */
    processShareReward() {
      const remaining = this.getRemainingCooldownMs();
      if (remaining > 0) {
        const timeStr = this.formatRemainingTime(remaining);
        this.showToast(`\u23F3 Transmisi\xF3n enviada. Bono de +5 vidas ya reclamado hoy. Disponible en ${timeStr}.`, "#fbbf24");
        this.updateModalRewardBanner();
        this.updateLobbyBannerRewardStatus();
        return;
      }
      localStorage.setItem(STORAGE_KEY_LAST_CLAIM, Date.now().toString());
      const currentBonus = parseInt(localStorage.getItem(STORAGE_KEY_BONUS_LIVES) || "0", 10);
      const newBonus = currentBonus + 5;
      localStorage.setItem(STORAGE_KEY_BONUS_LIVES, newBonus.toString());
      try {
        Sound.playSpecialAbility();
      } catch (_) {
      }
      this.showToast("\u{1F389} \xA1RECOMPENSA DE RECLUTAMIENTO! Se te han otorgado +5 VIDAS para combate. \u{1F680} Pr\xF3ximo bono en 24h.", "#34d399");
      this.updateModalRewardBanner();
      this.updateLobbyBannerRewardStatus();
      window.dispatchEvent(new CustomEvent("naves:lives-rewarded", {
        detail: { livesAdded: 5, totalBonus: newBonus }
      }));
    }
    /**
     * Compartir en X / Twitter
     */
    shareToX() {
      const text = this.getTextToShare();
      const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(xUrl, "_blank", "width=600,height=450,noopener,noreferrer");
      this.processShareReward();
    }
    /**
     * Compartir en WhatsApp
     */
    shareToWhatsApp() {
      const text = this.getTextToShare();
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      this.processShareReward();
    }
    /**
     * Compartir en Facebook
     */
    shareToFacebook() {
      const url = this.getShareUrl();
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(fbUrl, "_blank", "width=620,height=520,noopener,noreferrer");
      this.processShareReward();
    }
    /**
     * Compartir en Telegram
     */
    shareToTelegram() {
      const text = this.getTextToShare();
      const url = this.getShareUrl();
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.open(tgUrl, "_blank", "width=620,height=520,noopener,noreferrer");
      this.processShareReward();
    }
    /**
     * Copiar ficha para Historias de Instagram / Threads / TikTok
     */
    async shareToInstagramStories() {
      const text = this.getTextToShare();
      const url = this.getShareUrl();
      const igText = `\u{1F680} SPACE ASSAULT \xB7 ACCI\xD3N ARCADE 60 FPS \u{1F680}

${text}

\u{1F449} Juega gratis tocando el sticker de enlace o en:
${url}`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(igText);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = igText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        this.showToast("\u{1F4CB} \xA1Ficha copiada! P\xE9gala en tu historia o sticker de enlace en Instagram \u{1F4F8}", "#ec4899");
        this.processShareReward();
        setTimeout(() => {
          const openIg = confirm("\xBFDeseas abrir Instagram ahora para crear tu Historia o Reel?");
          if (openIg) {
            window.open("https://www.instagram.com/", "_blank");
          }
        }, 400);
      } catch (e) {
        console.warn("[Error al copiar texto]", e);
        this.showToast("Copia el texto manualmente desde la caja de mensaje.", "#f87171");
      }
    }
    /**
     * API Nativa Web Share (Móvil / Android / iOS)
     */
    async shareNative() {
      if (!navigator.share) {
        this.shareToWhatsApp();
        return;
      }
      const text = this.getTextToShare();
      const url = this.getShareUrl();
      try {
        await navigator.share({
          title: "Space Assault v2.0 - Arcade Sci-Fi",
          text,
          url
        });
        this.processShareReward();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("[Error Web Share]", err);
        }
      }
    }
    /**
     * Copia el enlace directo al portapapeles con retroalimentación visual
     */
    async copyDirectLink() {
      const url = this.getShareUrl();
      const btn = document.getElementById("btn-copy-share-url");
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const input = document.getElementById("share-url-input");
          if (input) {
            input.select();
            document.execCommand("copy");
          }
        }
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = "<span>\u2714\uFE0F</span> \xA1COPIADO!";
          btn.style.borderColor = "#10b981";
          btn.style.color = "#34d399";
          btn.style.background = "rgba(16, 185, 129, 0.2)";
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = "";
            btn.style.color = "";
            btn.style.background = "";
          }, 2200);
        }
        this.showToast("\u{1F517} \xA1Enlace de Space Assault copiado al portapapeles!", "#00f3ff");
        this.processShareReward();
      } catch (err) {
        console.warn("[Error al copiar enlace]", err);
      }
    }
    showToast(message, color = "#00f3ff") {
      let toast = document.getElementById("cyber-share-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "cyber-share-toast";
        toast.className = "cyber-toast-notification";
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.borderColor = color;
      toast.style.boxShadow = `0 0 25px ${color}66`;
      toast.classList.add("visible");
      setTimeout(() => {
        toast.classList.remove("visible");
      }, 3500);
    }
    bindEvents() {
      const btnClose = document.getElementById("btn-close-share");
      if (btnClose) btnClose.addEventListener("click", () => this.close());
      const btnX = document.getElementById("btn-share-x");
      if (btnX) btnX.addEventListener("click", () => this.shareToX());
      const btnWa = document.getElementById("btn-share-whatsapp");
      if (btnWa) btnWa.addEventListener("click", () => this.shareToWhatsApp());
      const btnFb = document.getElementById("btn-share-facebook");
      if (btnFb) btnFb.addEventListener("click", () => this.shareToFacebook());
      const btnTg = document.getElementById("btn-share-telegram");
      if (btnTg) btnTg.addEventListener("click", () => this.shareToTelegram());
      const btnIg = document.getElementById("btn-share-instagram");
      if (btnIg) btnIg.addEventListener("click", () => this.shareToInstagramStories());
      const btnNative = document.getElementById("btn-share-native");
      if (btnNative) btnNative.addEventListener("click", () => this.shareNative());
      const btnCopy = document.getElementById("btn-copy-share-url");
      if (btnCopy) btnCopy.addEventListener("click", () => this.copyDirectLink());
    }
  };
  var socialShare = new SocialShareManager();

  // frontend/js/i18n.js
  var DICTIONARY = {
    en: {
      // Header
      "brand_subtitle": "TACTICAL AERIAL & SPACE ASSAULT",
      "btn_fullscreen": "\u26F6 FULLSCREEN [F]",
      "sfx_on": "\u{1F50A} SFX: ON",
      "sfx_off": "\u{1F507} SFX: OFF",
      "music_on": "\u{1F3B5} MUSIC: ON",
      "music_off": "\u{1F507} MUSIC: OFF",
      "btn_leaderboard": "\u{1F3C6} RANKING",
      "btn_help": "\u{1F4D6} MANUAL",
      "btn_share": "\u{1F4E2} SHARE",
      "server_online": "ONLINE [READY]",
      // Auth
      "auth_badge": "ORBITAL TACTICAL SYSTEM",
      "auth_subtitle": "FIGHTER COMMAND // AUTHENTICATION PROTOCOL",
      "tab_login": "\u{1F511} ACCESS HANGAR",
      "tab_register": "\u{1F4DD} NEW PILOT",
      "btn_guest": "\u26A1 PLAY AS GUEST (INSTANT DEPLOY)",
      "label_username": "PILOT CALLSIGN",
      "placeholder_username": "Enter your callsign...",
      "label_password": "ACCESS KEY",
      "placeholder_password": "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      "btn_login": "LAUNCH SESSION \u2794",
      "btn_register": "CONFIRM ENLISTMENT \u2794",
      "guest_notice": "Guest mode: your tactical progress is saved locally during this run.",
      // Lobby / Hangar
      "lobby_title": "HANGAR COMMAND CENTER",
      "lobby_subtitle": "SELECT AN OPERATION OR CONFIGURE YOUR FLEET",
      "pilot_rank": "RANK: COMMANDER",
      "btn_deploy_mission": "\u{1F680} DEPLOY TO COMBAT",
      "btn_view_ships": "\u{1F6F8} STARFIGHTER CATALOG",
      "btn_logout": "\u2715 LOGOUT",
      "stat_missions": "MISSIONS PLAYED",
      "stat_high_score": "RECORD SCORE",
      "stat_enemies": "ENEMIES ABATED",
      "stat_bosses": "BOSSES DEFEATED",
      // Ship Select
      "ship_select_title": "TACTICAL STARFIGHTER SELECTION",
      "ship_select_subtitle": "CHOOSE YOUR ASSAULT SHIP BEFORE LAUNCH",
      "btn_back_to_lobby": "\u2190 RETURN TO HANGAR",
      "btn_deploy_ship": "DEPLOY THIS SHIP \u2794",
      "ship_stat_health": "HULL INTEGRITY",
      "ship_stat_speed": "THRUSTER SPEED",
      "ship_stat_firepower": "MAIN CANNON DPS",
      "ship_stat_special": "ULTIMATE ABILITY",
      // Stage Select & Briefing
      "stage_select_title": "THEATER OF OPERATIONS",
      "stage_select_subtitle": "5 ESCALATING SECTORS TOWARDS GENERAL VEKTOR",
      "briefing_title": "TACTICAL OPERATION BRIEFING",
      "briefing_intel_badge": "OPERATIONAL INTEL",
      "briefing_squadrons": "HOSTILE SQUADRONS ACTIVE",
      "btn_cancel_briefing": "BACK TO MAP",
      "btn_launch_briefing": "\u{1F680} CONFIRM & LAUNCH",
      // Battle HUD
      "hud_hull": "HULL INTEGRITY",
      "hud_lives": "LIVES",
      "hud_score": "SCORE",
      "hud_bombs": "EMP BOMBS",
      "hud_weapon": "CANNON LEVEL",
      "hud_special_ready": "\u26A1 SPECIAL READY [E]",
      "hud_special_charging": "\u26A1 CHARGING...",
      "btn_hud_bomb": "\u{1F4A5} EMP BOMB [B]",
      "btn_exit_battle": "\u2715 ABORT [ESC]",
      // Mobile touch controls
      "touch_bomb": "\u{1F4A3} BOMB",
      "touch_special": "\u26A1 SPECIAL",
      "touch_pause": "\u23F8\uFE0F PAUSE",
      // Victory Modal
      "vic_title_area": "\u{1F396}\uFE0F AREA CLEARED!",
      "vic_title_campaign": "\u{1F3C6} TOTAL VICTORY: CAMPAIGN CONQUERED!",
      "vic_score_label": "TOTAL OPERATION SCORE",
      "vic_enemies_label": "HOSTILE UNITS DESTROYED",
      "vic_bosses_label": "FLAGSHIPS ABATED",
      "vic_bonus_life": "+1 BONUS LIFE (EXTRA SHIELD)",
      "btn_next_stage": "\u{1F680} DEPLOY TO NEXT STAGE \u2794",
      "btn_hangar_vic": "MAP OF OPERATIONS",
      "btn_hangar_vic_honors": "\u{1F396}\uFE0F RETURN TO HANGAR WITH HONORS",
      // Game Over Modal
      "go_title": "STARFIGHTER DESTROYED",
      "go_subtitle": "TACTICAL EMERGENCY // VESSEL ABATED IN COMBAT",
      "go_score_label": "FINAL MISSION SCORE",
      "go_enemies_label": "ENEMIES DESTROYED",
      "btn_revive": "\u26A1 REVIVE SHIP WITH 100% SHIELD (+2 LIVES)",
      "btn_restart_go": "RESTART MISSION (STAGE 1)",
      "btn_hangar_go": "RETURN TO HANGAR",
      // Intro Cinema
      "intro_title": "EMERGENCY HOLOGRAPHIC INTERCEPTION",
      "intro_boss_name": "GENERAL VEKTOR",
      "intro_boss_role": "SUPREME WARLORD (FLAGSHIP COMMANDER)",
      "btn_intro_skip": "SKIP INTRO",
      "btn_intro_next": "CONTINUE \u2794",
      // Dialogs & Messages
      "dialog_abort_title": "TACTICAL RETREAT // ALERT",
      "dialog_abort_msg": "Do you want to abort the combat mission and return to the hangar?",
      "dialog_abort_sub": "\u26A0\uFE0F The aerial incursion will be marked as failed and progress resets to Stage 1.",
      "dialog_abort_confirm": "\u2715 ABORT MISSION",
      "dialog_abort_cancel": "CONTINUE BATTLE"
    },
    es: {
      // Header
      "brand_subtitle": "COMBATE A\xC9REO Y ASALTO ESPACIAL T\xC1CTICO",
      "btn_fullscreen": "\u26F6 PANTALLA COMPLETA [F]",
      "sfx_on": "\u{1F50A} SFX: ON",
      "sfx_off": "\u{1F507} SFX: OFF",
      "music_on": "\u{1F3B5} M\xDASICA: ON",
      "music_off": "\u{1F507} M\xDASICA: OFF",
      "btn_leaderboard": "\u{1F3C6} RANKING",
      "btn_help": "\u{1F4D6} AYUDA",
      "btn_share": "\u{1F4E2} COMPARTIR",
      "server_online": "ONLINE [LISTO]",
      // Auth
      "auth_badge": "SISTEMA T\xC1CTICO ORBITAL",
      "auth_subtitle": "COMANDO DE CAZAS // PROTOCOLO DE AUTENTICACI\xD3N",
      "tab_login": "\u{1F511} INGRESAR AL HANGAR",
      "tab_register": "\u{1F4DD} NUEVO PILOTO",
      "btn_guest": "\u26A1 JUGAR COMO INVITADO (DESPLIEGUE DIRECTO)",
      "label_username": "INDICATIVO DE PILOTO",
      "placeholder_username": "Ingresa tu callsign...",
      "label_password": "CLAVE DE ACCESO",
      "placeholder_password": "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      "btn_login": "INICIAR SESI\xD3N \u2794",
      "btn_register": "CONFIRMAR ALISTAMIENTO \u2794",
      "guest_notice": "Modo invitado: tu progreso se conserva en esta sesi\xF3n t\xE1ctica.",
      // Lobby / Hangar
      "lobby_title": "CENTRO DE COMANDO & HANGAR",
      "lobby_subtitle": "SELECCIONA UNA OPERACI\xD3N O CONFIGURA TU ESCUADRA",
      "pilot_rank": "RANGO: COMANDANTE",
      "btn_deploy_mission": "\u{1F680} DESPLEGAR A LA BATALLA",
      "btn_view_ships": "\u{1F6F8} HANGAR DE NAVES",
      "btn_logout": "\u2715 CERRAR SESI\xD3N",
      "stat_missions": "MISIONES JUGADAS",
      "stat_high_score": "R\xC9CORD HIST\xD3RICO",
      "stat_enemies": "ENEMIGOS ABATIDOS",
      "stat_bosses": "JEFES DERROTADOS",
      // Ship Select
      "ship_select_title": "SELECCI\xD3N DE NAVE T\xC1CTICA",
      "ship_select_subtitle": "ESCOGE TU CAZA ESTELAR ANTES DEL DESPEGUE",
      "btn_back_to_lobby": "\u2190 VOLVER AL HANGAR",
      "btn_deploy_ship": "DESPLEGAR ESTA NAVE \u2794",
      "ship_stat_health": "BLINDAJE DE CASCO",
      "ship_stat_speed": "VELOCIDAD DE IMPULSO",
      "ship_stat_firepower": "POTENCIA DE FUEGO",
      "ship_stat_special": "HABILIDAD DEFINITIVA",
      // Stage Select & Briefing
      "stage_select_title": "TEATRO DE OPERACIONES",
      "stage_select_subtitle": "5 SECTORES PROGRESIVOS HASTA EL GENERAL VEKTOR",
      "briefing_title": "BRIEFING DE OPERACIONES T\xC1CTICAS",
      "briefing_intel_badge": "INTELIGENCIA OPERACIONAL",
      "briefing_squadrons": "ESCUADRAS HOSTILES ACTIVAS",
      "btn_cancel_briefing": "VOLVER AL MAPA",
      "btn_launch_briefing": "\u{1F680} CONFIRMAR Y DESPEGAR",
      // Battle HUD
      "hud_hull": "INTEGRIDAD DE CASCO",
      "hud_lives": "VIDAS",
      "hud_score": "PUNTOS",
      "hud_bombs": "BOMBAS EMP",
      "hud_weapon": "NIVEL DE CA\xD1\xD3N",
      "hud_special_ready": "\u26A1 ESPECIAL LISTO [E]",
      "hud_special_charging": "\u26A1 CARGANDO...",
      "btn_hud_bomb": "\u{1F4A5} BOMBA EMP [B]",
      "btn_exit_battle": "\u2715 ABORTAR [ESC]",
      // Mobile touch controls
      "touch_bomb": "\u{1F4A3} BOMBA",
      "touch_special": "\u26A1 ESPECIAL",
      "touch_pause": "\u23F8\uFE0F PAUSA",
      // Victory Modal
      "vic_title_area": "\u{1F396}\uFE0F \xA1\xC1REA SUPERADA!",
      "vic_title_campaign": "\u{1F3C6} \xA1VICTORIA TOTAL: CAMPA\xD1A CONQUISTADA!",
      "vic_score_label": "PUNTUACI\xD3N DE OPERACI\xD3N",
      "vic_enemies_label": "UNIDADES HOSTILES DESTRUIDAS",
      "vic_bosses_label": "JEFES INSIGNIA ABATIDOS",
      "vic_bonus_life": "+1 VIDA EXTRA (ESCUDO ADICIONAL)",
      "btn_next_stage": "\u{1F680} DESPLEGAR A LA FASE SIGUIENTE \u2794",
      "btn_hangar_vic": "MAPA DE OPERACIONES",
      "btn_hangar_vic_honors": "\u{1F396}\uFE0F REGRESAR AL HANGAR CON HONORES",
      // Game Over Modal
      "go_title": "NAVE DESTRUIDA",
      "go_subtitle": "EMERGENCIA T\xC1CTICA // NAVE ABATIDA EN COMBATE",
      "go_score_label": "PUNTUACI\xD3N FINAL",
      "go_enemies_label": "ENEMIGOS DESTRUIDOS",
      "btn_revive": "\u26A1 REVIVIR NAVE CON ESCUDO AL 100% (+2 VIDAS)",
      "btn_restart_go": "REINTENTAR MISI\xD3N (FASE 1)",
      "btn_hangar_go": "REGRESAR AL HANGAR",
      // Intro Cinema
      "intro_title": "INTERCEPCI\xD3N HOLOGRAM\xC1TICA DE EMERGENCIA",
      "intro_boss_name": "GENERAL VEKTOR",
      "intro_boss_role": "SUPREMO SE\xD1OR DE LA GUERRA",
      "btn_intro_skip": "SALTAR INTRO",
      "btn_intro_next": "CONTINUAR \u2794",
      // Dialogs & Messages
      "dialog_abort_title": "RETIRADA T\xC1CTICA // ALERTA",
      "dialog_abort_msg": "\xBFDeseas abortar la misi\xF3n de combate y regresar al hangar?",
      "dialog_abort_sub": "\u26A0\uFE0F La incursi\xF3n se dar\xE1 por fallida y el progreso se reiniciar\xE1 a Fase 1.",
      "dialog_abort_confirm": "\u2715 ABORTAR MISI\xD3N",
      "dialog_abort_cancel": "CONTINUAR COMBATE"
    }
  };
  var I18nManager = class {
    constructor() {
      this.currentLang = this._detectInitialLanguage();
    }
    _detectInitialLanguage() {
      if (typeof window === "undefined") return "en";
      try {
        const saved = localStorage.getItem("sa_lang");
        if (saved && (saved === "en" || saved === "es")) {
          return saved;
        }
      } catch (_) {
      }
      const isCrazyGames = window.location.hostname.includes("crazygames.com") || window.location.hostname.includes("crazygames.io") || window.location.search.includes("cg=1");
      if (isCrazyGames) {
        return "en";
      }
      const browserLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
      if (browserLang.startsWith("es")) {
        return "es";
      }
      return "en";
    }
    getLanguage() {
      return this.currentLang;
    }
    setLanguage(lang) {
      if (lang !== "en" && lang !== "es") return;
      this.currentLang = lang;
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("sa_lang", lang);
        }
      } catch (_) {
      }
      this.applyTranslations();
    }
    toggleLanguage() {
      const nextLang = this.currentLang === "en" ? "es" : "en";
      this.setLanguage(nextLang);
      return nextLang;
    }
    t(key, fallback = "") {
      const table = DICTIONARY[this.currentLang] || DICTIONARY.en;
      if (table && table[key] !== void 0) {
        return table[key];
      }
      const enTable = DICTIONARY.en;
      if (enTable && enTable[key] !== void 0) {
        return enTable[key];
      }
      return fallback || key;
    }
    /**
     * Recorre el DOM y actualiza todos los elementos con atributo data-i18n
     */
    applyTranslations() {
      if (typeof document === "undefined") return;
      const langBtnText = document.getElementById("current-lang-text");
      if (langBtnText) {
        langBtnText.textContent = this.currentLang.toUpperCase();
      }
      const elements = document.querySelectorAll("[data-i18n]");
      elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const translation = this.t(key);
        if (translation) {
          el.textContent = translation;
        }
      });
      const placeholders = document.querySelectorAll("[data-i18n-ph]");
      placeholders.forEach((el) => {
        const key = el.getAttribute("data-i18n-ph");
        const translation = this.t(key);
        if (translation) {
          el.setAttribute("placeholder", translation);
        }
      });
      document.dispatchEvent(new CustomEvent("language_changed", { detail: { lang: this.currentLang } }));
    }
  };
  var i18n = new I18nManager();
  var t = (key, fallback) => i18n.t(key, fallback);
  if (typeof window !== "undefined") {
    window.i18n = i18n;
    window.t = t;
  }

  // frontend/js/app_ui.js
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".game-version-badge").forEach((badge) => {
      badge.textContent = `v${GAME_VERSION}`;
    });
    if (!document.title.includes(`v${GAME_VERSION}`)) {
      document.title = `Space Assault v${GAME_VERSION} - Tactical Aerial & Space Combat`;
    }
    const lobbyContainer = document.getElementById("lobby-container");
    const shipSelectContainer = document.getElementById("ship-select-container");
    const stageSelectContainer = document.getElementById("stage-select-container");
    const battleContainer = document.getElementById("battle-container");
    const leaderboardModal = document.getElementById("leaderboard-modal");
    const gameOverModal = document.getElementById("game-over-modal");
    const victoryModal = document.getElementById("victory-modal");
    const briefingModal = document.getElementById("briefing-modal");
    const btnGoToShips = document.getElementById("btn-go-to-ships");
    const btnBackToLobby = document.getElementById("btn-back-to-lobby");
    const btnBackToShips = document.getElementById("btn-back-to-ships");
    const btnOpenLeaderboard = document.getElementById("btn-open-leaderboard");
    const btnCloseLeaderboard = document.getElementById("btn-close-leaderboard");
    const btnExitBattle = document.getElementById("btn-exit-battle");
    const btnRestartFromGameOver = document.getElementById("btn-restart-gameover");
    const btnHangarFromGameOver = document.getElementById("btn-hangar-gameover");
    const btnNextStageVictory = document.getElementById("btn-next-victory");
    const btnHangarVictory = document.getElementById("btn-hangar-victory");
    const btnPlayIntro = document.getElementById("btn-play-intro");
    const btnBriefingLaunch = document.getElementById("btn-briefing-launch");
    const btnBriefingCancel = document.getElementById("btn-briefing-cancel");
    const btnReviveRewarded = document.getElementById("btn-revive-rewarded");
    let hasRevivedInCurrentRun = false;
    const btnFullscreenHeader = document.getElementById("btn-fullscreen-header");
    const btnBattleFullscreen = document.getElementById("btn-battle-fullscreen");
    const btnFloatingFullscreen = document.getElementById("btn-floating-fullscreen");
    const allFloatingBtns = document.querySelectorAll(".floating-fullscreen-btn, #btn-floating-fullscreen");
    if (allFloatingBtns.length > 1) {
      for (let i = 1; i < allFloatingBtns.length; i++) {
        allFloatingBtns[i].remove();
      }
    }
    const btnAudioToggle = document.getElementById("btn-audio-toggle");
    const btnMusicToggle = document.getElementById("btn-music-toggle");
    const btnLangToggle = document.getElementById("btn-lang-toggle");
    const canvas = document.getElementById("game-canvas");
    const healthBar = document.getElementById("hud-health-bar");
    const healthText = document.getElementById("hud-health-text");
    const specialStatus = document.getElementById("hud-special-status");
    const scoreText = document.getElementById("hud-score-text");
    const stageProgress = document.getElementById("hud-stage-progress");
    const hudShipName = document.getElementById("hud-ship-name");
    const hudWeaponLevel = document.getElementById("hud-weapon-level");
    const hudBombsCount = document.getElementById("hud-bombs-count");
    const btnHudBomb = document.getElementById("btn-hud-bomb");
    if (btnLangToggle) {
      btnLangToggle.addEventListener("click", () => {
        i18n.toggleLanguage();
        updateFullscreenButtons(document.body.classList.contains("theater-mode-active") || !!document.fullscreenElement);
        if (btnAudioToggle) btnAudioToggle.textContent = Sound.isMuted ? t("sfx_off") : t("sfx_on");
        if (btnMusicToggle) btnMusicToggle.textContent = musicActive ? t("music_on") : t("music_off");
      });
    }
    i18n.applyTranslations();
    if (btnAudioToggle) {
      btnAudioToggle.addEventListener("click", () => {
        const isMuted = Sound.toggleMute();
        btnAudioToggle.textContent = isMuted ? t("sfx_off") : t("sfx_on");
        btnAudioToggle.style.color = isMuted ? "#94a3b8" : "#00f3ff";
      });
    }
    let musicActive = true;
    if (btnMusicToggle) {
      btnMusicToggle.addEventListener("click", () => {
        musicActive = !musicActive;
        Sound.setMusicEnabled(musicActive);
        btnMusicToggle.textContent = musicActive ? t("music_on") : t("music_off");
        btnMusicToggle.style.color = musicActive ? "#00f3ff" : "#94a3b8";
      });
    }
    function updateFullscreenButtons(isFs) {
      const isEn = i18n.getLanguage() === "en";
      if (btnFullscreenHeader) {
        btnFullscreenHeader.textContent = isFs ? isEn ? "\u{1F5D7} EXIT FULLSCREEN [F]" : "\u{1F5D7} SALIR PANTALLA [F]" : isEn ? "\u26F6 FULLSCREEN [F]" : "\u26F6 PANTALLA COMPLETA [F]";
      }
      if (btnBattleFullscreen) {
        btnBattleFullscreen.textContent = isFs ? isEn ? "\u{1F5D7} EXIT [F]" : "\u{1F5D7} SALIR [F]" : isEn ? "\u26F6 FULLSCREEN [F]" : "\u26F6 PANTALLA COMPLETA [F]";
      }
      if (btnFloatingFullscreen) {
        const extraFloating = document.querySelectorAll(".floating-fullscreen-btn, #btn-floating-fullscreen");
        if (extraFloating.length > 1) {
          for (let i = 1; i < extraFloating.length; i++) extraFloating[i].remove();
        }
        btnFloatingFullscreen.innerHTML = isFs ? `<span>\u{1F5D7}</span> ${isEn ? "RESTORE [F]" : "SALIR PANTALLA [F]"}` : `<span>\u26F6</span> ${isEn ? "EXPAND [F]" : "EXPANDIR JUEGO [F]"}`;
        if (isFs) {
          btnFloatingFullscreen.classList.add("is-active");
        } else {
          btnFloatingFullscreen.classList.remove("is-active");
        }
      }
    }
    function toggleFullscreen() {
      const isCurrentlyFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.body.classList.contains("theater-mode-active"));
      if (!isCurrentlyFs) {
        document.body.classList.add("theater-mode-active");
        if (battleContainer) battleContainer.classList.add("is-fullscreen");
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.warn("[Pantalla Completa Nativa Bloqueada - Modo Teatro Expandido Activo]", err);
          });
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
        updateFullscreenButtons(true);
      } else {
        document.body.classList.remove("theater-mode-active");
        if (battleContainer) battleContainer.classList.remove("is-fullscreen");
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {
            });
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
        updateFullscreenButtons(false);
      }
    }
    window.toggleFullscreen = toggleFullscreen;
    if (btnFullscreenHeader) btnFullscreenHeader.addEventListener("click", toggleFullscreen);
    if (btnBattleFullscreen) btnBattleFullscreen.addEventListener("click", toggleFullscreen);
    if (btnFloatingFullscreen) btnFloatingFullscreen.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs) {
        document.body.classList.remove("theater-mode-active");
        if (battleContainer) battleContainer.classList.remove("is-fullscreen");
      }
      updateFullscreenButtons(isFs);
    });
    window.addEventListener("keydown", (e) => {
      if (e.target && e.target.matches("input, textarea, select")) {
        return;
      }
      if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }
    });
    let availableShips = [];
    let selectedShip = null;
    let playerProgress = null;
    let selectedStage = 1;
    let engine = null;
    let currentUser = null;
    let latestGameStats = null;
    let activeRunSession = null;
    async function loadPilotStats() {
      try {
        const res = await ApiService.getMyStats();
        if (res.ok && res.data.success) {
          const s = res.data.stats;
          const elMissions = document.getElementById("stat-missions");
          const elBest = document.getElementById("stat-best-score");
          const elEnemies = document.getElementById("stat-enemies");
          const elBosses = document.getElementById("stat-bosses");
          const elVictories = document.getElementById("stat-victories");
          if (elMissions) elMissions.textContent = s.total_missions;
          if (elBest) elBest.textContent = s.best_score.toLocaleString();
          if (elEnemies) elEnemies.textContent = s.total_enemies_destroyed;
          if (elBosses) elBosses.textContent = s.total_bosses_defeated;
          if (elVictories) elVictories.textContent = s.victories;
        }
        const elLives = document.getElementById("stat-lives");
        const bonus = typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("naves_bonus_lives") || "0", 10) : 0;
        if (elLives) elLives.textContent = 3 + bonus;
        socialShare.updateLobbyBannerRewardStatus();
      } catch (err) {
        console.warn("[Error al cargar estad\xEDsticas]", err);
      }
    }
    window.addEventListener("naves:user-logged-in", (e) => {
      currentUser = e.detail;
      loadPilotStats();
    });
    window.addEventListener("naves:user-logged-out", () => {
      currentUser = null;
    });
    engine = new GameEngine(canvas, {
      healthBar,
      healthText,
      specialStatus,
      scoreText,
      stageProgress,
      weaponLevelText: hudWeaponLevel,
      bombsCountText: hudBombsCount,
      onGameOver: async (stats) => {
        activeRunSession = null;
        selectedStage = 1;
        try {
          await ApiService.resetRun();
        } catch (err) {
          console.warn("[ResetRun error]", err);
        }
        latestGameStats = {
          score: stats.score,
          enemies: stats.enemies,
          bosses: stats.bosses,
          shipName: selectedShip ? selectedShip.name : "Phoenix Vanguard",
          stage: stats.stage || 1,
          stageName: `Fase ${stats.stage || 1}`,
          isVictory: false
        };
        document.getElementById("go-score").textContent = stats.score.toLocaleString();
        document.getElementById("go-enemies").textContent = stats.enemies;
        if (btnReviveRewarded) {
          if (hasRevivedInCurrentRun) {
            btnReviveRewarded.classList.add("hidden");
          } else {
            btnReviveRewarded.classList.remove("hidden");
          }
        }
        gameOverModal.classList.remove("hidden");
        loadPilotStats();
      },
      onStageVictory: (stats) => {
        const currentLives = engine ? engine.lives : 3;
        const rewardedLives = currentLives + 1;
        if (engine) {
          engine.lives = rewardedLives;
          engine.updateHudLives();
        }
        activeRunSession = {
          preserveHistory: true,
          score: stats.score,
          enemies: stats.enemies,
          bosses: stats.bosses,
          lives: rewardedLives,
          weaponLevel: engine && engine.player ? engine.player.weaponLevel : 1,
          upgradeHitsReceived: engine && engine.player ? engine.player.upgradeHitsReceived : 0,
          bombs: engine && engine.bombs !== void 0 ? engine.bombs : 1
        };
        latestGameStats = {
          score: stats.score,
          enemies: stats.enemies,
          bosses: stats.bosses,
          shipName: selectedShip ? selectedShip.name : "Phoenix Vanguard",
          stage: stats.stageCompleted,
          stageName: `Fase ${stats.stageCompleted}`,
          isVictory: true
        };
        const isFinal = stats.isCampaignVictory || stats.stageCompleted === 5;
        const elTitle = document.getElementById("vic-title");
        const elUnlocked = document.getElementById("vic-unlocked-msg");
        const elEpilogue = document.getElementById("vic-epilogue-box");
        const elRewardText = document.getElementById("vic-lives-reward-text");
        const nextStageNum = stats.stageCompleted + 1;
        selectedStage = stats.stageCompleted;
        document.getElementById("vic-score").textContent = stats.score.toLocaleString();
        document.getElementById("vic-enemies").textContent = stats.enemies;
        document.getElementById("vic-bosses").textContent = stats.bosses;
        if (elRewardText) {
          elRewardText.textContent = `+1 VIDA EXTRA (Total: ${rewardedLives} \u2764\uFE0F)`;
        }
        const isEn = i18n.getLanguage() === "en";
        if (isFinal) {
          if (elTitle) elTitle.textContent = isEn ? "\u{1F3C6} TOTAL VICTORY: CAMPAIGN CONQUERED!" : "\u{1F3C6} \xA1VICTORIA TOTAL: CAMPA\xD1A CONQUISTADA!";
          document.getElementById("vic-stage").textContent = isEn ? "GENERAL VEKTOR DEFEATED \xB7 ALL SECTORS 100% CLEARED" : "GENERAL VEKTOR DERROTADO \xB7 TODAS LAS \xC1REAS SUPERADAS AL 100%";
          if (elUnlocked) elUnlocked.textContent = isEn ? "\u2714 Congratulations commander! Campaign completed and recorded." : "\u2714 \xA1Felicidades comandante! Campa\xF1a militar completada y guardada en SQLite.";
          if (elEpilogue) elEpilogue.classList.remove("hidden");
          btnNextStageVictory.style.display = "none";
          btnHangarVictory.textContent = isEn ? "\u{1F396}\uFE0F RETURN TO HANGAR WITH HONORS" : "\u{1F396}\uFE0F REGRESAR AL HANGAR CON HONORES";
          btnHangarVictory.className = "btn-cyber-primary";
        } else {
          if (elTitle) elTitle.textContent = isEn ? `\u{1F396}\uFE0F AREA ${stats.stageCompleted} CLEARED!` : `\u{1F396}\uFE0F \xA1\xC1REA ${stats.stageCompleted} SUPERADA!`;
          document.getElementById("vic-stage").textContent = isEn ? `FLAGSHIP DESTROYED! AREA ${stats.stageCompleted} SECURED \u2794 READY FOR STAGE ${nextStageNum}` : `\xA1JEFE PRINCIPAL ABATIDO! \xC1REA ${stats.stageCompleted} DESPEJADA \u2794 LISTO PARA FASE ${nextStageNum}`;
          if (elUnlocked) elUnlocked.textContent = isEn ? `\u2714 Area ${stats.stageCompleted} secured. Stage ${nextStageNum} unlocked.` : `\u2714 \xC1rea ${stats.stageCompleted} superada con \xE9xito. Fase ${nextStageNum} desbloqueada en SQLite.`;
          if (elEpilogue) elEpilogue.classList.add("hidden");
          btnNextStageVictory.style.display = "block";
          btnNextStageVictory.textContent = isEn ? `\u{1F680} DEPLOY TO STAGE ${nextStageNum} \u2794` : `\u{1F680} DESPLEGAR A LA FASE ${nextStageNum} \u2794`;
          btnHangarVictory.textContent = isEn ? "MAP OF OPERATIONS" : "MAPA DE OPERACIONES";
          btnHangarVictory.className = "btn-cyber-outline";
        }
        if (document.fullscreenElement && document.fullscreenElement !== document.documentElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {
            });
          }
        }
        victoryModal.classList.remove("hidden");
        loadPilotStats();
      }
    });
    CyberDialog.init(engine);
    btnGoToShips.addEventListener("click", async () => {
      lobbyContainer.classList.add("hidden");
      shipSelectContainer.classList.remove("hidden");
      await loadShips();
    });
    btnBackToLobby.addEventListener("click", () => {
      shipSelectContainer.classList.add("hidden");
      lobbyContainer.classList.remove("hidden");
      loadPilotStats();
      adsManager.checkPeriodicHourlyAd(false);
    });
    btnBackToShips.addEventListener("click", () => {
      stageSelectContainer.classList.add("hidden");
      shipSelectContainer.classList.remove("hidden");
    });
    btnExitBattle.addEventListener("click", async () => {
      const isEn = i18n.getLanguage() === "en";
      const confirmed = await CyberDialog.confirm({
        title: isEn ? "TACTICAL RETREAT // ALERT" : "RETIRADA T\xC1CTICA // ALERTA",
        message: isEn ? "Do you want to abort the combat mission and return to the hangar?" : "\xBFDeseas abortar la misi\xF3n de combate y regresar al hangar?",
        subtext: isEn ? "\u26A0\uFE0F The aerial incursion will be marked as failed and progress resets to Stage 1." : "\u26A0\uFE0F La incursi\xF3n a\xE9rea se dar\xE1 por fallida y el historial de la partida se reiniciar\xE1 a Fase 1.",
        icon: "\u26A0\uFE0F",
        badge: isEn ? "HIGH COMMAND // EVACUATION PROTOCOL" : "ALTO MANDO // PROTOCOLO DE EVACUACI\xD3N",
        confirmText: isEn ? "\u2715 ABORT MISSION" : "\u2715 ABORTAR MISI\xD3N",
        cancelText: isEn ? "CONTINUE BATTLE" : "CONTINUAR COMBATE",
        isDanger: true
      });
      if (confirmed) {
        activeRunSession = null;
        selectedStage = 1;
        engine.stop();
        battleContainer.classList.add("hidden");
        lobbyContainer.classList.remove("hidden");
        loadPilotStats();
      }
    });
    if (btnHudBomb) {
      btnHudBomb.addEventListener("click", () => {
        if (engine && engine.isRunning) {
          engine.triggerBomb();
        }
      });
    }
    const btnTouchBomb = document.getElementById("btn-touch-bomb");
    const btnTouchSpecial = document.getElementById("btn-touch-special");
    const btnTouchPause = document.getElementById("btn-touch-pause");
    if (btnTouchBomb) {
      btnTouchBomb.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (engine && engine.isRunning) engine.triggerBomb();
      });
    }
    if (btnTouchSpecial) {
      btnTouchSpecial.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (engine && engine.isRunning) engine.activateSpecialAbility();
      });
    }
    if (btnTouchPause) {
      btnTouchPause.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (engine && engine.isRunning) engine.togglePause();
      });
    }
    btnRestartFromGameOver.addEventListener("click", () => {
      hasRevivedInCurrentRun = false;
      gameOverModal.classList.add("hidden");
      activeRunSession = null;
      selectedStage = 1;
      const shipToDeploy = selectedShip || (availableShips && availableShips.length > 0 ? availableShips[0] : null);
      if (shipToDeploy) {
        startMission(shipToDeploy, 1, null);
      } else {
        loadShips().then(() => {
          const fallback = availableShips && availableShips.length > 0 ? availableShips[0] : null;
          if (fallback) startMission(fallback, 1, null);
        });
      }
    });
    btnHangarFromGameOver.addEventListener("click", () => {
      hasRevivedInCurrentRun = false;
      gameOverModal.classList.add("hidden");
      battleContainer.classList.add("hidden");
      lobbyContainer.classList.remove("hidden");
      activeRunSession = null;
      selectedStage = 1;
      loadPilotStats();
      adsManager.checkPeriodicHourlyAd(false);
    });
    if (btnReviveRewarded) {
      btnReviveRewarded.addEventListener("click", (e) => {
        if (e && e.preventDefault) e.preventDefault();
        adsManager.showRewardedAd(
          () => {
            hasRevivedInCurrentRun = true;
            if (btnReviveRewarded) btnReviveRewarded.classList.add("hidden");
            gameOverModal.classList.add("hidden");
            const shipToDeploy = selectedShip || (availableShips && availableShips.length > 0 ? availableShips[0] : null);
            const currentStage = latestGameStats && latestGameStats.stage ? latestGameStats.stage : selectedStage || 1;
            const currentScore = latestGameStats && latestGameStats.score ? latestGameStats.score : 0;
            const currentEnemies = latestGameStats && latestGameStats.enemies ? latestGameStats.enemies : 0;
            const currentBosses = latestGameStats && latestGameStats.bosses ? latestGameStats.bosses : 0;
            activeRunSession = {
              preserveHistory: true,
              score: currentScore,
              enemies: currentEnemies,
              bosses: currentBosses,
              lives: 2,
              // 2 vidas de rescate
              weaponLevel: activeRunSession && activeRunSession.weaponLevel ? activeRunSession.weaponLevel : 2,
              upgradeHitsReceived: 0,
              bombs: 1
            };
            if (shipToDeploy) {
              startMission(shipToDeploy, currentStage, activeRunSession);
            }
          },
          () => {
            console.log("[AdsManager] Video de recompensa cerrado o cancelado.");
          }
        );
      });
    }
    btnNextStageVictory.addEventListener("click", (e) => {
      if (e && e.preventDefault) e.preventDefault();
      adsManager.showInterstitial(() => {
        victoryModal.classList.add("hidden");
        if (selectedStage < 5) {
          selectedStage++;
          const shipToDeploy = selectedShip || (availableShips && availableShips.length > 0 ? availableShips[0] : null);
          if (shipToDeploy) {
            startMission(shipToDeploy, selectedStage, activeRunSession);
          } else {
            loadShips().then(() => {
              const fallback = availableShips && availableShips.length > 0 ? availableShips[0] : null;
              if (fallback) startMission(fallback, selectedStage, activeRunSession);
            });
          }
        } else {
          activeRunSession = null;
          battleContainer.classList.add("hidden");
          stageSelectContainer.classList.remove("hidden");
          loadStageSelector();
        }
      }, { force: true, context: "stage_victory" });
    });
    btnHangarVictory.addEventListener("click", () => {
      victoryModal.classList.add("hidden");
      battleContainer.classList.add("hidden");
      stageSelectContainer.classList.remove("hidden");
      loadStageSelector();
      adsManager.checkPeriodicHourlyAd(false);
    });
    async function loadShips() {
      const res = await ApiService.getShips();
      if (!res.ok || !res.data.success) {
        CyberDialog.alert({
          title: "ERROR DE BASE DE DATOS",
          message: "Error al cargar las naves de combate desde SQLite.",
          icon: "\u26A0\uFE0F",
          isDanger: true
        });
        return;
      }
      availableShips = res.data.ships;
      const shipsGrid = document.getElementById("ships-grid");
      shipsGrid.innerHTML = "";
      availableShips.forEach((ship, idx) => {
        const card = document.createElement("div");
        card.className = "ship-card";
        card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.7rem; font-family: monospace; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(0,243,255,0.15); color: #00f3ff; border: 1px solid rgba(0,243,255,0.4);">NAVE #0${idx + 1}</span>
            <span style="font-size: 0.75rem; font-family: monospace; color: #94a3b8;">VELOCIDAD: ${ship.stats.speed}x</span>
          </div>

          <div style="height: 110px; background: rgba(0,0,0,0.5); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; border: 1px solid #1e293b; position: relative;">
            <canvas id="preview-ship-${ship.id}" width="160" height="100"></canvas>
          </div>

          <h3 style="font-family: 'Orbitron', monospace; font-weight: bold; color: #ffffff; font-size: 1.1rem; letter-spacing: 1px;">${ship.name}</h3>
          <p style="font-size: 0.8rem; color: #94a3b8; margin: 0.5rem 0 1rem; line-height: 1.4;">${ship.description}</p>

          <div style="font-size: 0.75rem; font-family: monospace; border-top: 1px solid #1e293b; padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div>
              <span style="color: #38bdf8; font-weight: bold;">DISPARO:</span>
              <p style="color: #cbd5e1; font-family: sans-serif; font-size: 0.78rem;">${ship.weapon.name} (${ship.weapon.damage} DMG | ${ship.weapon.fire_rate_ms}ms)</p>
            </div>
            <div>
              <span style="color: #ec4899; font-weight: bold;">HABILIDAD ESPECIAL:</span>
              <p style="color: #cbd5e1; font-family: sans-serif; font-size: 0.78rem;">${ship.special.name} (${ship.special.duration_seconds}s dur. | ${ship.special.cooldown_seconds}s CD)</p>
            </div>
          </div>
        </div>

        <button 
          class="btn-cyber-primary btn-select-ship" 
          style="margin-top: 1.25rem; font-size: 0.8rem; padding: 0.75rem;"
          data-ship-id="${ship.id}"
        >
          SELECCIONAR NAVE
        </button>
      `;
        shipsGrid.appendChild(card);
        setTimeout(() => {
          const miniCanvas = document.getElementById(`preview-ship-${ship.id}`);
          if (miniCanvas) {
            const miniCtx = miniCanvas.getContext("2d");
            miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
            ShipRenderer.drawPlayerShip(miniCtx, ship, miniCanvas.width / 2, miniCanvas.height / 2, 40, 44, false);
          }
        }, 50);
      });
      document.querySelectorAll(".btn-select-ship").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const shipId = parseInt(e.currentTarget.getAttribute("data-ship-id"));
          selectedShip = availableShips.find((s) => s.id === shipId);
          shipSelectContainer.classList.add("hidden");
          stageSelectContainer.classList.remove("hidden");
          await loadStageSelector();
        });
      });
    }
    async function loadStageSelector() {
      let progressData = null;
      try {
        const res = await ApiService.getProgress();
        if (res && res.ok && res.data && res.data.success && res.data.progress) {
          progressData = res.data.progress;
        }
      } catch (_) {}
      if (!progressData) {
        progressData = {
          current_max_stage: 1,
          stages: { "1": { unlocked: true }, "2": { unlocked: false }, "3": { unlocked: false }, "4": { unlocked: false }, "5": { unlocked: false } }
        };
      }
      playerProgress = progressData;
      const stagesContainer = document.getElementById("stages-list");
      stagesContainer.innerHTML = "";
      const stagesInfo = [
        {
          num: 1,
          title: "Fase 1: Norteam\xE9rica a la Ant\xE1rtida",
          desc: "Sobrevuela el continente con mapa de radar din\xE1mico inferior hasta alcanzar los glaciares polares.",
          unlocked: playerProgress.stages["1"].unlocked
        },
        {
          num: 2,
          title: "Fase 2: Cruce del Oc\xE9ano Pac\xEDfico a Australia",
          desc: "Traves\xEDa sobre archipi\xE9lagos e islas del Pac\xEDfico hasta alcanzar la costa australiana.",
          unlocked: playerProgress.stages["2"].unlocked
        },
        {
          num: 3,
          title: "Fase 3: Traves\xEDa a Saturno (V\xEDa Marte y J\xFApiter)",
          desc: "Despega de la Tierra, rebasa Marte y asteroides, vence a Jovian Core en J\xFApiter y asalta los anillos de Saturno contra Ganymede Titan.",
          unlocked: playerProgress.stages["3"].unlocked
        },
        {
          num: 4,
          title: "Fase 4: El C\xEDrculo \xC1rtico: De Groenlandia al Polo Norte",
          desc: "Cruza el C\xEDrculo Polar a 66\xB0N, el inmenso Inlandis de Groenlandia y la banquisa polar hasta la ciudadela subglacial del Polo Norte (90\xB0N).",
          unlocked: playerProgress.stages["4"].unlocked
        },
        {
          num: 5,
          title: "Fase 5: Jungla Profunda / Fortaleza del Jefe Final",
          desc: "Zona selv\xE1tica con vegetaci\xF3n destructible por bombardeo y confrontaci\xF3n con el Boss principal.",
          unlocked: playerProgress.stages["5"].unlocked
        }
      ];
      stagesInfo.forEach((stage) => {
        const stageCard = document.createElement("div");
        const isLocked = !stage.unlocked;
        const lore = MissionLore[stage.num];
        stageCard.style = isLocked ? "background: rgba(0,0,0,0.3); border: 1px solid #1e293b; border-radius: 12px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; opacity: 0.55; cursor: not-allowed; flex-wrap: wrap; gap: 1rem;" : "background: #090e1d; border: 1px solid rgba(0,243,255,0.4); border-radius: 12px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
        stageCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
          <div style="width: 52px; height: 52px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-weight: bold; font-size: 1.15rem; ${isLocked ? "background: #0f172a; color: #475569;" : "background: rgba(0,243,255,0.15); color: #00f3ff; border: 1px solid rgba(0,243,255,0.5);"}">
            ${isLocked ? "\u{1F512}" : `0${stage.num}`}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span style="font-size: 0.65rem; font-family: monospace; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                ${lore ? lore.operation : `FASE ${stage.num}`}
              </span>
              <span style="font-size: 0.65rem; font-family: monospace; color: ${stage.num === 5 ? "#ff0055" : "#f59e0b"};">
                ${lore ? lore.threatLevel : ""}
              </span>
            </div>
            <h4 style="font-family: 'Orbitron', monospace; font-weight: bold; font-size: 0.95rem; color: ${isLocked ? "#64748b" : "#ffffff"};">
              ${stage.title}
            </h4>
            <p style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.25rem; line-height: 1.4;">
              ${lore ? lore.objective : stage.desc}
            </p>
          </div>
        </div>

        <div>
          ${isLocked ? `<span style="padding: 0.35rem 0.75rem; font-size: 0.72rem; font-family: monospace; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; border-radius: 6px;">BLOQUEADO</span>` : `<button class="btn-cyber-primary btn-launch-stage" style="width: auto; padding: 0.7rem 1.4rem; font-size: 0.78rem;" data-stage="${stage.num}">
                  BRIEFING T\xC1CTICO \u2794
                </button>`}
        </div>
      `;
        stagesContainer.appendChild(stageCard);
      });
      let introWatched = false;
      if (btnPlayIntro) {
        btnPlayIntro.addEventListener("click", () => {
          IntroCinema.show(() => {
          });
        });
      }
      function renderBossHologram(canvasId, bossData) {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.save();
        ctx.strokeStyle = bossData.isFinalBoss ? "rgba(255, 0, 85, 0.28)" : "rgba(56, 189, 248, 0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.width / 2, c.height / 2, c.height * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(c.width * 0.15, c.height / 2);
        ctx.lineTo(c.width * 0.85, c.height / 2);
        ctx.moveTo(c.width / 2, c.height * 0.1);
        ctx.lineTo(c.width / 2, c.height * 0.9);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        const scale = Math.min(c.width * 0.68 / bossData.width, c.height * 0.68 / bossData.height);
        const halfW = bossData.width * scale / 2;
        const halfH = bossData.height * scale / 2;
        ctx.save();
        ctx.translate(c.width / 2, c.height / 2 + (bossData.isFinalBoss ? 4 : 2));
        try {
          BossCatalog.drawBossShip(ctx, bossData, halfW, halfH);
        } catch (err) {
          console.warn("Error renderizando holograma de jefe:", err);
        }
        ctx.restore();
      }
      function openBriefing(stageNum) {
        selectedStage = stageNum;
        const lore = MissionLore[stageNum];
        if (!lore) return;
        const midBossData = BossCatalog.getMidBoss(stageNum);
        const stageBossData = BossCatalog.getStageBoss(stageNum);
        document.getElementById("briefing-operation-title").textContent = lore.operation;
        document.getElementById("briefing-classification").textContent = lore.classification;
        document.getElementById("briefing-threat-level").textContent = lore.threatLevel;
        document.getElementById("briefing-lore-text").textContent = lore.lore;
        document.getElementById("briefing-objective").textContent = lore.objective;
        const subBossNameEl = document.getElementById("briefing-subboss-name");
        if (subBossNameEl) subBossNameEl.textContent = midBossData.name;
        const subIntelEl = document.getElementById("briefing-subboss-intel");
        if (subIntelEl) {
          subIntelEl.innerHTML = `<b style="color: #38bdf8;">${midBossData.title}</b><br><span style="color: #94a3b8;">Habilidad:</span> <b style="color: #f1f5f9;">${midBossData.abilityName}</b> \u2014 ${midBossData.abilityDesc}`;
        }
        const finalBossNameEl = document.getElementById("briefing-finalboss-name");
        if (finalBossNameEl) finalBossNameEl.textContent = stageBossData.name;
        const finalIntelEl = document.getElementById("briefing-finalboss-intel");
        if (finalIntelEl) {
          finalIntelEl.innerHTML = `<b style="color: #ff0055;">${stageBossData.title}</b><br><span style="color: #94a3b8;">Habilidad:</span> <b style="color: #f1f5f9;">${stageBossData.abilityName}</b> \u2014 ${stageBossData.abilityDesc}`;
        }
        renderBossHologram("briefing-subboss-canvas", midBossData);
        renderBossHologram("briefing-finalboss-canvas", stageBossData);
        const squadronIntel = EnemyCatalog.getIntelForStage(stageNum);
        const countEl = document.getElementById("briefing-squadron-count");
        const listEl = document.getElementById("briefing-squadron-list");
        if (countEl) countEl.textContent = squadronIntel.totalTypesCount;
        if (listEl) {
          listEl.innerHTML = "";
          squadronIntel.activeEnemies.forEach((enemyDef) => {
            const isNewInThisStage = enemyDef.introducedStage === stageNum;
            const item = document.createElement("div");
            item.style.cssText = `
            background: ${isNewInThisStage ? "rgba(56, 189, 248, 0.12)" : "rgba(0, 0, 0, 0.35)"};
            border: 1px solid ${isNewInThisStage ? enemyDef.color : "rgba(148, 163, 184, 0.2)"};
            border-left: 3px solid ${enemyDef.color};
            border-radius: 6px;
            padding: 0.5rem 0.65rem;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          `;
            item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: 'Orbitron', monospace; font-size: 0.72rem; font-weight: bold; color: ${enemyDef.color};">
                ${isNewInThisStage ? "\u2B50 " : "\u2022 "}${enemyDef.name}
              </span>
              <div style="display: flex; gap: 0.35rem; align-items: center;">
                ${isNewInThisStage ? `<span style="font-size: 0.6rem; font-family: monospace; color: #38bdf8; background: rgba(56, 189, 248, 0.2); padding: 1px 5px; border-radius: 3px; font-weight: bold;">NUEVA AMENAZA</span>` : ""}
                <span style="font-size: 0.62rem; font-family: monospace; color: ${enemyDef.badgeColor}; background: rgba(0,0,0,0.5); padding: 1px 5px; border-radius: 3px;">
                  ${enemyDef.badge}
                </span>
              </div>
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1; font-family: 'Rajdhani', sans-serif;">
              <b style="color: #f1f5f9;">Habilidad:</b> ${enemyDef.abilityName} \u2014 <span style="color: #94a3b8;">${enemyDef.abilityDesc}</span>
            </div>
          `;
            listEl.appendChild(item);
          });
        }
        const adSlotBox = document.getElementById("ad-briefing-slot");
        if (adSlotBox) {
          const ins = adSlotBox.querySelector("ins.adsbygoogle");
          const preview = adSlotBox.querySelector(".ad-preview-banner");
          if (ins && ADS_CONFIG.CLIENT_ID && ADS_CONFIG.CLIENT_ID !== "ca-pub-XXXXXXXXXXXXXXXX") {
            ins.setAttribute("data-ad-client", ADS_CONFIG.CLIENT_ID);
            ins.setAttribute("data-ad-slot", ADS_CONFIG.SLOT_PRE_MISSION);
            if (ADS_CONFIG.TEST_MODE) {
              ins.setAttribute("data-adtest", "on");
            }
            if (preview) preview.style.display = "none";
          }
          renderGoogleAd(adSlotBox, ADS_CONFIG.SLOT_PRE_MISSION);
        }
        const scrollBody = briefingModal.querySelector(".modal-scrollable-body");
        if (scrollBody) {
          scrollBody.scrollTop = 0;
        }
        briefingModal.classList.remove("hidden");
      }
      const briefingScrollBody = briefingModal.querySelector(".modal-scrollable-body");
      if (briefingModal && briefingScrollBody) {
        briefingModal.addEventListener("wheel", (e) => {
          if (!e.target.closest(".modal-scrollable-body")) {
            briefingScrollBody.scrollTop += e.deltaY;
          }
        }, { passive: true });
      }
      document.querySelectorAll(".btn-launch-stage").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const stageNum = parseInt(e.currentTarget.getAttribute("data-stage"));
          openBriefing(stageNum);
        });
      });
      if (btnBriefingCancel) {
        btnBriefingCancel.addEventListener("click", () => {
          if (launchTimer) clearInterval(launchTimer);
          isLaunching = false;
          resetLaunchButton();
          briefingModal.classList.add("hidden");
        });
      }
      let launchTimer = null;
      let isLaunching = false;
      function resetLaunchButton() {
        const countdownEl = document.getElementById("ad-launch-countdown");
        if (countdownEl) countdownEl.style.display = "none";
        if (btnBriefingLaunch) {
          btnBriefingLaunch.textContent = "\u{1F680} CONFIRMAR Y DESPEGAR";
          btnBriefingLaunch.style.background = "";
        }
      }
      function finalizeMissionLaunch() {
        if (launchTimer) {
          clearInterval(launchTimer);
          launchTimer = null;
        }
        isLaunching = false;
        resetLaunchButton();
        briefingModal.classList.add("hidden");
        stageSelectContainer.classList.add("hidden");
        if (selectedStage === 1 && !introWatched) {
          introWatched = true;
          IntroCinema.show(() => {
            startMission(selectedShip, selectedStage, activeRunSession);
          });
        } else {
          startMission(selectedShip, selectedStage, activeRunSession);
        }
      }
      if (btnBriefingLaunch) {
        btnBriefingLaunch.addEventListener("click", () => {
          finalizeMissionLaunch();
        });
      }
    }
    function startMission(ship, stageNumber, runState = null) {
      adsManager.markMissionStart();
      battleContainer.classList.remove("hidden");
      hudShipName.textContent = ship.name.toUpperCase();
      const elStageBadge = document.getElementById("hud-stage-badge");
      if (elStageBadge) elStageBadge.textContent = `FASE ${stageNumber}`;
      engine.start(ship, stageNumber, currentUser ? currentUser.username : "PILOTO", runState);
      requestAnimationFrame(() => {
        battleContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    btnOpenLeaderboard.addEventListener("click", async () => {
      leaderboardModal.classList.remove("hidden");
      const tbody = document.getElementById("leaderboard-body");
      tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-gray-500">Consultando registros en SQLite...</td></tr>`;
      const res = await ApiService.getLeaderboard(15);
      if (!res.ok || !res.data.success) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-red-400">Error al cargar leaderboard.</td></tr>`;
        return;
      }
      if (res.data.leaderboard.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-gray-400">A\xFAn no hay puntuaciones registradas en SQLite. \xA1S\xE9 el primer piloto en el ranking!</td></tr>`;
        return;
      }
      tbody.innerHTML = "";
      res.data.leaderboard.forEach((entry, idx) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-800/60 hover:bg-cyan-950/20 font-mono text-xs";
        tr.innerHTML = `
        <td class="py-3 px-3 text-cyan-400 font-bold">#${idx + 1}</td>
        <td class="py-3 px-3 text-white font-orbitron font-semibold">${entry.pilot}</td>
        <td class="py-3 px-3 text-gray-300">${entry.ship_name}</td>
        <td class="py-3 px-3 text-emerald-400 font-bold text-sm">${entry.score.toLocaleString()}</td>
        <td class="py-3 px-3 text-gray-400">Fase ${entry.stage_reached} ${entry.victory ? "\u{1F3C6} (Victoria)" : ""}</td>
      `;
        tbody.appendChild(tr);
      });
    });
    btnCloseLeaderboard.addEventListener("click", () => {
      leaderboardModal.classList.add("hidden");
    });
    const btnOpenHelp = document.getElementById("btn-open-help");
    const btnCloseHelp = document.getElementById("btn-close-help");
    const helpModal = document.getElementById("help-modal");
    if (btnOpenHelp && helpModal) {
      btnOpenHelp.addEventListener("click", () => {
        helpModal.classList.remove("hidden");
      });
    }
    if (btnCloseHelp && helpModal) {
      btnCloseHelp.addEventListener("click", () => {
        helpModal.classList.add("hidden");
      });
    }
    const btnOpenShareHeader = document.getElementById("btn-open-share");
    const btnLobbyOpenShare = document.getElementById("btn-lobby-open-share");
    const btnShareGameOver = document.getElementById("btn-share-gameover");
    const btnShareVictory = document.getElementById("btn-share-victory");
    if (btnOpenShareHeader) {
      btnOpenShareHeader.addEventListener("click", () => {
        socialShare.open("lobby");
      });
    }
    if (btnLobbyOpenShare) {
      btnLobbyOpenShare.addEventListener("click", () => {
        socialShare.open("lobby");
      });
    }
    if (btnShareGameOver) {
      btnShareGameOver.addEventListener("click", () => {
        socialShare.open("game_over", latestGameStats || {});
      });
    }
    if (btnShareVictory) {
      btnShareVictory.addEventListener("click", () => {
        socialShare.open("victory", latestGameStats || {});
      });
    }
    window.addEventListener("naves:lives-rewarded", (e) => {
      const added = e.detail ? e.detail.livesAdded : 5;
      if (engine && engine.isRunning) {
        engine.addLives(added);
      }
      if (activeRunSession) {
        activeRunSession.lives = (activeRunSession.lives || 3) + added;
      }
      const elLives = document.getElementById("stat-lives");
      const bonus = typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("naves_bonus_lives") || "0", 10) : 0;
      if (elLives) elLives.textContent = 3 + bonus;
      socialShare.updateLobbyBannerRewardStatus();
    });
  });
})();
