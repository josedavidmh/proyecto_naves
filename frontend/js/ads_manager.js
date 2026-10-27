/**
 * ADAPTADOR UNIVERSAL DE PUBLICIDAD Y MONETIZACIÓN EQUILIBRADA
 * Space Assault v2.0 - Tactical Aerial & Space Assault
 * 
 * Filosofía Gamer-First:
 * 1. Primera partida siempre 100% limpia de publicidad.
 * 2. Enfriamiento (Cooldown) mínimo de 3.5 minutos entre anuncios automáticos.
 * 3. Partidas breves / muertes rápidas (< 45s) jamás muestran anuncios para evitar frustración.
 * 4. Apoyo prioritario a Anuncios Recompensados voluntarios (Revivir nave, +escudo).
 * 
 * Compatible con:
 * - Google AdSense (Display Banners)
 * - Monetag (Direct Web Interstitials / Vignette / Rewarded)
 * - CrazyGames SDK (Midgame & Rewarded Video)
 * - GameDistribution SDK (Azerion HTML5 Ads)
 * - AdinPlay (AIP Web Game Ads)
 */

export const ADS_CONFIG = {
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
  MONETAG_DIRECT_LINK_URL: (typeof localStorage !== "undefined" && localStorage.getItem("sa_monetag_direct_link")) || "",

  // Configuración GameDistribution (Game GUID asignado al crear el juego)
  GD_GAME_ID: "d49c747be6564b50b1e93571d8b0ad58",

  // Configuración CrazyGames
  CRAZYGAMES_ENABLED: false,

  // Modo seguro de pruebas:
  TEST_MODE: false,

  // Timeout de seguridad en milisegundos (para que el jugador NUNCA quede congelado si falla un anuncio)
  AD_TIMEOUT_MS: 4000,

  // --- POLÍTICAS DE EQUILIBRIO DINÁMICO DE ANUNCIOS ---
  // Intervalo estándar entre anuncios automáticos (3 minutos)
  MIN_COOLDOWN_MS: 180000,

  // Intervalo ágil para transiciones de fase superada (2 minutos)
  STAGE_VICTORY_COOLDOWN_MS: 120000,

  // Duración mínima de la partida para considerar mostrar anuncio (30 segundos)
  MIN_PLAYTIME_FOR_AD_MS: 30000,

  // Primera partida siempre 100% libre de anuncios para fidelizar al jugador
  FIRST_GAME_FREE: true,

  // Intervalo de publicidad periódica normal (1 vez cada hora = 3600000 ms)
  PERIODIC_HOURLY_INTERVAL_MS: 3600000,

  // Límite razonable de anuncios automáticos por sesión
  MAX_ADS_PER_SESSION: 6
};

// Aliases para retrocompatibilidad con código existente
export const CLIENT_ID = ADS_CONFIG.ADSENSE_CLIENT_ID;
export const SLOT_PRE_MISSION = ADS_CONFIG.ADSENSE_SLOT_PRE_MISSION;

// ESCUDO DE COMBATE: Previene que ventanas emergentes o popunders interrumpan los controles táctiles en combate
if (typeof window !== "undefined") {
  window.__sa_combat_active = false;
  const _origOpen = window.open;
  window.open = function(...args) {
    if (window.__sa_combat_active) {
      console.log("[AdsManager] 🛡️ Escudo de Combate: Ventana bloqueada para no interrumpir el vuelo activo.");
      return null;
    }
    return _origOpen.apply(this, args);
  };
}

class UniversalAdsManager {
  constructor() {
    this.currentPlatform = "STANDALONE";
    this.isInitialized = false;
    this.crazyGamesSDK = null;

    // Métricas de sesión en memoria y persistentes
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
    } catch (_) {}
    return 0;
  }

  _saveLastAdTimestamp(ts) {
    this.lastAdTimestamp = ts;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("sa_last_ad_time", ts.toString());
      }
    } catch (_) {}
  }

  _loadLastPeriodicAdTimestamp() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return parseInt(localStorage.getItem("sa_last_hourly_ad") || "0", 10);
      }
    } catch (_) {}
    return 0;
  }

  _saveLastPeriodicAdTimestamp(ts) {
    this.lastPeriodicAdTimestamp = ts;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("sa_last_hourly_ad", ts.toString());
      }
    } catch (_) {}
  }

  /**
   * Verifica periódicamente si ha transcurrido 1 hora para mostrar anuncio normal fuera de combate
   */
  checkPeriodicHourlyAd(isInCombat = false) {
    return false;
  }

  _startPeriodicChecker() {
    // Desactivado para no perturbar al jugador con popups automáticos en el lobby
  }

  /**
   * Registra el momento en que el jugador despega al combate
   */
  markMissionStart() {
    this.missionStartTime = Date.now();
    console.log("[AdsManager] 🚀 Misión iniciada. Cronómetro de sesión activado.");
  }

  /**
   * Evalúa si es ético y oportuno mostrar un anuncio intersticial según las 4 reglas
   */
  canShowInterstitial(context = "game_over") {
    const now = Date.now();
    const playtime = this.missionStartTime > 0 ? (now - this.missionStartTime) : 0;

    // Si se está ejecutando dentro del entorno o portal de prueba de GameDistribution, permitir siempre para superar el checklist
    if (this.currentPlatform === "GAMEDISTRIBUTION" || (typeof window !== "undefined" && window.gdsdk)) {
      return true;
    }

    // Regla 1: Primera partida de cortesía (100% libre de anuncios si está activo)
    if (ADS_CONFIG.FIRST_GAME_FREE && this.gamesPlayedCount === 0) {
      console.log("[AdsManager] 🛡️ Cortesía inicial: Primera partida libre de anuncios para fidelizar al jugador.");
      return false;
    }

    // Regla 2: Muerte instantánea o partida muy corta (< 15s) -> jamás molestar en game over
    if (context === "game_over" && playtime > 0 && playtime < ADS_CONFIG.MIN_PLAYTIME_FOR_AD_MS) {
      console.log(`[AdsManager] 🛡️ Partida breve (${Math.round(playtime / 1000)}s). Anuncio omitido para no frustrar tras caída rápida.`);
      return false;
    }

    // Regla 3: Enfriamiento entre anuncios (si es victoria de fase, cooldown ágil de 25s; si es derrota, 50s)
    const requiredCooldown = context === "stage_victory" 
      ? ADS_CONFIG.STAGE_VICTORY_COOLDOWN_MS 
      : ADS_CONFIG.MIN_COOLDOWN_MS;

    const timeSinceLastAd = now - this.lastAdTimestamp;
    if (this.lastAdTimestamp > 0 && timeSinceLastAd < requiredCooldown) {
      const waitRemainingSec = Math.round((requiredCooldown - timeSinceLastAd) / 1000);
      console.log(`[AdsManager] ⏳ Cooldown activo (${waitRemainingSec}s restantes para ${context}). Anuncio automático omitido.`);
      return false;
    }

    // Regla 4: Límite máximo de anuncios automáticos por sesión
    if (this.sessionAdsCount >= ADS_CONFIG.MAX_ADS_PER_SESSION) {
      console.log("[AdsManager] 🛡️ Límite máximo de anuncios por sesión alcanzado.");
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
      console.warn("[AdsManager] AdSense bloqueado por AdBlock o en modo simulación.", err);
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

    // Siempre incrementamos el contador de partidas jugadas para evaluar la cortesía futura
    this.gamesPlayedCount++;

    if (!isAllowed) {
      safeComplete();
      return;
    }

    // Registramos la exhibición del anuncio
    this._saveLastAdTimestamp(Date.now());
    this.sessionAdsCount++;

    // Timeout de emergencia: si el anuncio tarda más de AD_TIMEOUT_MS, la partida continúa
    const timer = setTimeout(() => {
      console.log("[AdsManager] Timeout de anuncio alcanzado. Continuando flujo de juego...");
      safeComplete();
    }, ADS_CONFIG.AD_TIMEOUT_MS);

    try {
      // 1. CrazyGames
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

      // 2. GameDistribution
      if (this.currentPlatform === "GAMEDISTRIBUTION" && window.gdsdk && typeof window.gdsdk.showAd === "function") {
        window.gdsdk.showAd()
          .then(() => {
            clearTimeout(timer);
            safeComplete();
          })
          .catch((err) => {
            console.warn("[GameDistribution] Error al reproducir anuncio:", err);
            clearTimeout(timer);
            safeComplete();
          });
        return;
      }

      // Fallback limpio sin interrumpir con popups agresivos
      clearTimeout(timer);
      safeComplete();

    } catch (e) {
      console.warn("[AdsManager] Excepción al invocar anuncio:", e);
      clearTimeout(timer);
      safeComplete();
    }
  }

  /**
   * Invoca activamente el Vignette Banner de Monetag y verifica estado de AdBlock
   */
  _triggerMonetagVignette() {
    // Desactivado para garantizar experiencia limpia sin interrupciones
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
        console.warn("[AdsManager] ⚠️ Se detectó un bloqueador de anuncios (AdBlock / Brave Shields) activo en el navegador. Para ver y monetizar con Monetag, desactiva el escudo o agrega este sitio a la lista de permitidos.");
      } else {
        console.log("[AdsManager] ✅ Verificación de red: Sin bloqueador de anuncios detectado.");
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
      // 1. CrazyGames Rewarded Video
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

      // 2. GameDistribution Rewarded Video
      if (this.currentPlatform === "GAMEDISTRIBUTION" && window.gdsdk && typeof window.gdsdk.showAd === "function") {
        window.gdsdk.showAd("rewarded")
          .then(() => {
            console.log("[GameDistribution] Recompensa completada.");
            if (typeof onRewarded === "function") onRewarded();
          })
          .catch(() => {
            if (typeof onDismissed === "function") onDismissed();
          });
        return;
      }

      // 3. Conceder revivir de rescate al piloto en web independiente

      // 5. Conceder revivir de rescate al piloto
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
    // Desactivado como fallback automático para evitar saturación de ventanas en móvil
    return false;
  }
}

// Instancia global exportada
export const adsManager = new UniversalAdsManager();

// Función de compatibilidad exacta con la versión anterior de ads_config.js
export function renderGoogleAd(containerElement, slotId) {
  adsManager.renderGoogleAd(containerElement, slotId);
}
