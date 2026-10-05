import { Sound } from "./sound_fx.js";

/**
 * CyberDialog: Sistema Táctico de Cuadros de Diálogo y Mensajes Sci-Fi Arcade
 * Reemplaza los popups nativos y antiestéticos del navegador (confirm, alert)
 * por modales inmersivos con estética cyber, retro-futurista y sonido sintetizado.
 */
export class CyberDialog {
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
            <span class="cyber-dialog-icon" id="cyber-dialog-icon">⚠️</span>
            <div>
              <h3 class="cyber-dialog-title" id="cyber-dialog-title">CONFIRMACIÓN TÁCTICA</h3>
              <span class="cyber-dialog-badge" id="cyber-dialog-badge">COMANDO CENTRAL // RETIRADA TÁCTICA</span>
            </div>
          </div>
          <button id="cyber-dialog-btn-close" class="cyber-dialog-close-btn" type="button" title="Cerrar [ESC]">✕</button>
        </div>

        <!-- Cuerpo del mensaje -->
        <div class="cyber-dialog-body">
          <p id="cyber-dialog-message" class="cyber-dialog-text">
            ¿Deseas abortar la misión de combate y regresar al hangar?
          </p>
          <div id="cyber-dialog-subtext" class="cyber-dialog-subtext"></div>
        </div>

        <!-- Acciones interactivas -->
        <div class="cyber-dialog-actions" id="cyber-dialog-actions">
          <button id="cyber-dialog-btn-cancel" class="btn-cyber-outline cyber-dialog-btn-cancel" type="button">
            CONTINUAR COMBATE
          </button>
          <button id="cyber-dialog-btn-confirm" class="btn-cyber-danger cyber-dialog-btn-confirm" type="button">
            ✕ ABORTAR MISIÓN
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;

    // Listeners
    const btnClose = modal.querySelector("#cyber-dialog-btn-close");
    const btnCancel = modal.querySelector("#cyber-dialog-btn-cancel");
    const btnConfirm = modal.querySelector("#cyber-dialog-btn-confirm");

    btnClose.addEventListener("click", () => this.resolve(false));
    btnCancel.addEventListener("click", () => this.resolve(false));
    btnConfirm.addEventListener("click", () => this.resolve(true));

    // Cerrar al hacer clic en el backdrop exterior
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.resolve(false);
      }
    });

    // Accesibilidad con teclado: ESC para cancelar, Enter para confirmar
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

    const title = options.title || "CONFIRMACIÓN TÁCTICA";
    const message = typeof options === "string" ? options : (options.message || "¿Confirmas la operación?");
    const subtext = options.subtext !== undefined ? options.subtext : "El progreso de vuelo no registrado en esta fase se reiniciará.";
    const icon = options.icon || "⚠️";
    const badge = options.badge || "COMANDO CENTRAL // PROTOCOLO DE COMBATE";
    const confirmText = options.confirmText || "✕ ABORTAR MISIÓN";
    const cancelText = options.cancelText || "CONTINUAR COMBATE";
    const isDanger = options.isDanger !== false;

    // Pausar el juego si está en combate activo
    if (this.activeEngine && this.activeEngine.isRunning && !this.activeEngine.isPaused) {
      this.wasEngineRunningBefore = true;
      this.activeEngine.isPaused = true;
    } else {
      this.wasEngineRunningBefore = false;
    }

    // Actualizar contenido
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
    btnConfirm.className = isDanger 
      ? "btn-cyber-danger cyber-dialog-btn-confirm" 
      : "btn-cyber-primary cyber-dialog-btn-confirm";

    if (isDanger) {
      box.classList.add("danger-theme");
    } else {
      box.classList.remove("danger-theme");
    }

    // Sonido táctico de alerta
    try {
      Sound.playLaser(320, 160, 0.12);
    } catch (_) {}

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

    const title = options.title || "TRANSMISIÓN TÁCTICA";
    const message = typeof options === "string" ? options : (options.message || "Aviso del sistema.");
    const subtext = options.subtext || "";
    const icon = options.icon || "ℹ️";
    const badge = options.badge || "SISTEMA TÁCTICO // COMUNICADO";
    const okText = options.okText || "ENTENDIDO [ENTER]";
    const isDanger = options.isDanger === true;

    // Actualizar contenido
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
    btnConfirm.className = isDanger 
      ? "btn-cyber-danger cyber-dialog-btn-confirm" 
      : "btn-cyber-primary cyber-dialog-btn-confirm";

    if (isDanger) {
      box.classList.add("danger-theme");
    } else {
      box.classList.remove("danger-theme");
    }

    try {
      Sound.playLaser(440, 280, 0.1);
    } catch (_) {}

    this.modalElement.classList.remove("hidden");

    return new Promise((resolve) => {
      this.currentResolver = () => resolve();
    });
  }

  static resolve(val) {
    if (this.modalElement) {
      this.modalElement.classList.add("hidden");
    }

    // Reanudar el juego si fue pausado por el diálogo y se canceló la salida
    if (this.wasEngineRunningBefore && this.activeEngine) {
      if (!val) {
        this.activeEngine.isPaused = false;
      }
    }

    try {
      Sound.playLaser(600, 300, 0.05);
    } catch (_) {}

    if (this.currentResolver) {
      const fn = this.currentResolver;
      this.currentResolver = null;
      fn(val);
    }
  }
}

// Vinculación global para uso transparente en cualquier punto del cliente
window.CyberDialog = CyberDialog;
window.cyberConfirm = (msg, opts) => CyberDialog.confirm(typeof msg === "string" ? { message: msg, ...opts } : msg);
window.cyberAlert = (msg, opts) => CyberDialog.alert(typeof msg === "string" ? { message: msg, ...opts } : msg);
