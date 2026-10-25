/**
 * SISTEMA TÁCTICO DE RECOMENDACIÓN Y DIFUSIÓN EN REDES SOCIALES
 * Space Assault v2.0 - Tactical Aerial & Space Combat
 * 
 * Soporte para:
 * - X (Twitter) [Intent API con hashtags y mención]
 * - WhatsApp [Direct Chat / Grupos con formato enriquecido]
 * - Facebook [Sharer Dialog oficial]
 * - Telegram [Instant Share Link]
 * - Instagram & Threads [Copia de ficha de combate para Historias/Reels/Stickers]
 * - Web Share API Nativa (Móvil / Android / iOS / Desktop compatible)
 * - Copia directa de enlace con retroalimentación háptica y sonora
 * - Gamificación: Bono táctico de +5 VIDAS cada 24 horas
 */

import { Sound } from "./sound_fx.js";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const STORAGE_KEY_LAST_CLAIM = "naves_last_share_reward_time";
const STORAGE_KEY_BONUS_LIVES = "naves_bonus_lives";

export class SocialShareManager {
  constructor() {
    this.modal = null;
    this.previewTextarea = null;
    this.currentContext = "lobby"; // "lobby" | "game_over" | "victory"
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
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
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
        return `💥 ¡He caído en combate en Space Assault con ${score} puntos y ${enemies} enemigos derribados al mando de la nave ${shipName}! 🚀 ¿Te atreves a superar mi récord de combate? Juega gratis ahora en: ${url} #SpaceAssault #RetroArcade #Gaming`;

      case "victory":
        return `🏆 ¡Victoria militar en Space Assault! Acabo de superar la ${stageName} con ${score} puntos de batalla pilotando la ${shipName}. ⚡ ¡Únete a la flota y defiende la Tierra de la invasión alienígena! Juega gratis aquí: ${url} #SpaceAssault #IndieGame #Gaming`;

      case "lobby":
      default:
        return `🚀 ¡Te desafío a jugar Space Assault! Acción arcade aeroespacial a 60 FPS con naves personalizables, jefes gigantescos y combate táctico puro. ¡Comprueba si eres el As de la Federación!: ${url} #SpaceAssault #RetroArcade #Gaming`;
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
        contextBadge.textContent = "💥 TRANSMISIÓN DE RÉCORD DE COMBATE";
        contextBadge.style.color = "#f87171";
        contextBadge.style.borderColor = "rgba(248, 113, 113, 0.4)";
        contextBadge.style.background = "rgba(239, 68, 68, 0.15)";
      } else if (context === "victory") {
        contextBadge.textContent = "🏆 TRANSMISIÓN DE VICTORIA MILITAR";
        contextBadge.style.color = "#34d399";
        contextBadge.style.borderColor = "rgba(52, 211, 153, 0.4)";
        contextBadge.style.background = "rgba(16, 185, 129, 0.15)";
      } else {
        contextBadge.textContent = "📡 RECLUTAMIENTO DE PILOTOS DE LA FEDERACIÓN";
        contextBadge.style.color = "#00f3ff";
        contextBadge.style.borderColor = "rgba(0, 243, 255, 0.4)";
        contextBadge.style.background = "rgba(0, 243, 255, 0.12)";
      }
    }

    this.updateModalRewardBanner();

    // Actualizador en vivo de cuenta regresiva mientras el modal está abierto
    if (this.cooldownTimerId) clearInterval(this.cooldownTimerId);
    this.cooldownTimerId = setInterval(() => {
      this.updateModalRewardBanner();
    }, 1000);

    // Comprobar soporte de Web Share API nativa
    const nativeBtn = document.getElementById("btn-share-native");
    if (nativeBtn) {
      nativeBtn.style.display = (typeof navigator !== "undefined" && navigator.share) ? "flex" : "none";
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
      bonusBanner.innerHTML = "🎁 <b>¡BONO DE RECLUTAMIENTO DISPONIBLE!</b> Comparte en cualquier red y recibe <b>+5 VIDAS</b> adicionales de inmediato.";
      bonusBanner.style.background = "rgba(16, 185, 129, 0.18)";
      bonusBanner.style.borderColor = "#10b981";
      bonusBanner.style.color = "#34d399";
      bonusBanner.classList.remove("hidden");
    } else {
      const timeStr = this.formatRemainingTime(remaining);
      bonusBanner.innerHTML = `⏳ <b>BONO DE +5 VIDAS EN RECARGA (24H):</b> Ya reclamado hoy. Próximo bono disponible en <span style="color: #fbbf24; font-weight: 800;">${timeStr}</span>.`;
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
      badgeEl.textContent = "🎁 +5 VIDAS DISPONIBLES";
      badgeEl.style.background = "rgba(16, 185, 129, 0.25)";
      badgeEl.style.borderColor = "#10b981";
      badgeEl.style.color = "#34d399";
    } else {
      badgeEl.textContent = `⏳ RECARGA: ${this.formatRemainingTime(remaining)}`;
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
      this.showToast(`⏳ Transmisión enviada. Bono de +5 vidas ya reclamado hoy. Disponible en ${timeStr}.`, "#fbbf24");
      this.updateModalRewardBanner();
      this.updateLobbyBannerRewardStatus();
      return;
    }

    // Registrar hora de reclamación actual
    localStorage.setItem(STORAGE_KEY_LAST_CLAIM, Date.now().toString());

    // Otorgar +5 vidas acumulables
    const currentBonus = parseInt(localStorage.getItem(STORAGE_KEY_BONUS_LIVES) || "0", 10);
    const newBonus = currentBonus + 5;
    localStorage.setItem(STORAGE_KEY_BONUS_LIVES, newBonus.toString());

    try {
      Sound.playSpecialAbility();
    } catch (_) {}

    this.showToast("🎉 ¡RECOMPENSA DE RECLUTAMIENTO! Se te han otorgado +5 VIDAS para combate. 🚀 Próximo bono en 24h.", "#34d399");
    this.updateModalRewardBanner();
    this.updateLobbyBannerRewardStatus();

    // Despachar evento para sincronizar HUD del juego y estadísticas del lobby
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
    const igText = `🚀 SPACE ASSAULT · ACCIÓN ARCADE 60 FPS 🚀\n\n${text}\n\n👉 Juega gratis tocando el sticker de enlace o en:\n${url}`;

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

      this.showToast("📋 ¡Ficha copiada! Pégala en tu historia o sticker de enlace en Instagram 📸", "#ec4899");
      this.processShareReward();

      setTimeout(() => {
        const openIg = confirm("¿Deseas abrir Instagram ahora para crear tu Historia o Reel?");
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
        text: text,
        url: url
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
        btn.innerHTML = "<span>✔️</span> ¡COPIADO!";
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

      this.showToast("🔗 ¡Enlace de Space Assault copiado al portapapeles!", "#00f3ff");
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
}

// Instancia singleton exportada
export const socialShare = new SocialShareManager();
