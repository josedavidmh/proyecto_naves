import { ApiService } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos de la interfaz
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const authContainer = document.getElementById("auth-container");
  const lobbyContainer = document.getElementById("lobby-container");
  const alertBox = document.getElementById("alert-box");
  const alertMessage = document.getElementById("alert-message");
  
  // Elementos de sesión en el lobby
  const pilotNameEl = document.getElementById("pilot-name");
  const pilotEmailEl = document.getElementById("pilot-email");
  const pilotJoinedEl = document.getElementById("pilot-joined");
  const btnLogout = document.getElementById("btn-logout");
  const btnVerifySession = document.getElementById("btn-verify-session");
  const verifyResultEl = document.getElementById("verify-result");
  const serverStatusBadge = document.getElementById("server-status-badge");

  // Función para mostrar alertas estilizadas
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

  // Cambio de pestañas
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

  // Enlaces rápidos para alternar entre formularios
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

  // Mostrar vista autenticada
  function showAuthenticatedUI(user) {
    authContainer.classList.add("hidden");
    lobbyContainer.classList.remove("hidden");

    pilotNameEl.textContent = user.username.toUpperCase();
    pilotEmailEl.textContent = user.email;
    
    // Formatear fecha
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

    // Notificar al controlador del juego sobre el usuario activo
    window.dispatchEvent(new CustomEvent("naves:user-logged-in", { detail: user }));
  }

  // Mostrar vista de formulario de acceso
  function showUnauthenticatedUI() {
    lobbyContainer.classList.add("hidden");
    authContainer.classList.remove("hidden");
    window.dispatchEvent(new CustomEvent("naves:user-logged-out"));
  }

  // Comprobar estado de sesión al cargar la página
  async function checkInitialSession() {
    // Chequeo de servidor
    const health = await ApiService.checkHealth();
    if (health.ok) {
      serverStatusBadge.textContent = "ONLINE [SQLITE LISTO]";
      serverStatusBadge.className = "badge-status";
    } else {
      serverStatusBadge.textContent = "OFFLINE [SIN CONEXIÓN]";
      serverStatusBadge.className = "badge-status";
      serverStatusBadge.style.borderColor = "#ef4444";
      serverStatusBadge.style.color = "#f87171";
    }

    const token = ApiService.getToken();
    if (!token) {
      showUnauthenticatedUI();
      return;
    }

    // Validar token contra el backend real
    const res = await ApiService.getProfile();
    if (res.ok && res.data.success) {
      showAuthenticatedUI(res.data.user);
    } else {
      ApiService.clearToken();
      showUnauthenticatedUI();
    }
  }

  // Formulario de Login
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const identifier = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = formLogin.querySelector("button[type='submit']");

    if (!identifier || !password) {
      showAlert("Por favor ingrese piloto y contraseña.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "ACCEDIENDO AL HANGAR...";

    const res = await ApiService.login(identifier, password);
    submitBtn.disabled = false;
    submitBtn.textContent = "INICIAR MISIÓN (LOGIN)";

    if (res.ok && res.data.success) {
      ApiService.setToken(res.data.token);
      showAuthenticatedUI(res.data.user);
      formLogin.reset();
    } else {
      if (res.status === 404) {
        // El piloto no existe en la BD
        showAlert(`El piloto '${identifier}' no está registrado en el hangar. Por favor haz clic en 'Alista tu nuevo piloto aquí' para crearlo.`);
        const regUserInput = document.getElementById("reg-username");
        if (regUserInput) regUserInput.value = identifier;
      } else {
        showAlert(res.data.error || "Error al autenticar piloto.");
      }
    }
  });

  // Formulario de Registro
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
      showAlert("La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      showAlert("Las contraseñas no coinciden.");
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

  // Botón de Cerrar Sesión
  btnLogout.addEventListener("click", () => {
    ApiService.clearToken();
    showUnauthenticatedUI();
    showAlert("Has cerrado sesión en el hangar de combate.", "success");
  });

  // Botón de Verificación de Sesión Activa con JWT
  btnVerifySession.addEventListener("click", async () => {
    verifyResultEl.textContent = "Comprobando token criptográfico en backend...";
    const res = await ApiService.getProfile();
    if (res.ok && res.data.success) {
      verifyResultEl.className = "text-xs font-mono text-emerald-400 mt-2 p-3 bg-black/60 rounded border border-emerald-500/50";
      verifyResultEl.textContent = `[VERIFICADO 200 OK] Token válido. Usuario BD id=${res.data.user.id}, Piloto="${res.data.user.username}".`;
    } else {
      verifyResultEl.className = "text-xs font-mono text-red-400 mt-2 p-3 bg-black/60 rounded border border-red-500/50";
      verifyResultEl.textContent = `[FALLÓ 401] ${res.data.error || "Token inválido"}`;
    }
  });

  // Modal y Formulario de Cambio de Contraseña
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
        changePwdAlert.textContent = "Error: La nueva contraseña y la confirmación no coinciden.";
        changePwdAlert.classList.remove("hidden");
        return;
      }

      if (newPwd.length < 6) {
        changePwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
        changePwdAlert.textContent = "Error: La nueva contraseña debe tener al menos 6 caracteres.";
        changePwdAlert.classList.remove("hidden");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "ACTUALIZANDO...";

      const res = await ApiService.changePassword(currPwd, newPwd);
      submitBtn.disabled = false;
      submitBtn.textContent = "ACTUALIZAR CLAVE ➔";

      if (res.ok && res.data.success) {
        changePwdAlert.className = "p-2 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500";
        changePwdAlert.textContent = "✔ ¡Contraseña actualizada con éxito en SQLite!";
        changePwdAlert.classList.remove("hidden");
        setTimeout(() => {
          closeChangePasswordModal();
          showAlert("Contraseña de piloto actualizada exitosamente.", "success");
        }, 1200);
      } else {
        changePwdAlert.className = "p-2 rounded text-xs font-mono bg-red-950/80 text-red-300 border border-red-500";
        changePwdAlert.textContent = res.data.error || "No se pudo actualizar la contraseña.";
        changePwdAlert.classList.remove("hidden");
      }
    });
  }

  // Modal y Formulario de Darse de Baja Voluntaria
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
        deleteAccAlert.textContent = "Error: Debes ingresar tu contraseña para confirmar.";
        deleteAccAlert.classList.remove("hidden");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "PROCESANDO BAJA...";

      const res = await ApiService.deleteAccount(password);
      submitBtn.disabled = false;
      submitBtn.textContent = "CONFIRMAR BAJA ✕";

      if (res.ok && res.data.success) {
        deleteAccAlert.className = "p-2 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500";
        deleteAccAlert.textContent = "✔ Cuenta eliminada satisfactoriamente.";
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

  // Inicializar
  checkInitialSession();
});
