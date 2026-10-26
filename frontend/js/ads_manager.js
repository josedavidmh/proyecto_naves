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

  // Configuración Monetag (Zona Vignette Banner Limpia)
  MONETAG_ZONE_ID: "12128966",

  // Configuración GameDistribution (Game GUID asignado al crear el juego)
  GD_GAME_ID: "d49c747be6564b50b1e93571d8b0ad58",

  // Configuración CrazyGames
  CRAZYGAMES_ENABLED: false,

  // Modo seguro de pruebas:
  TEST_MODE: false,

  // Timeout de seguridad en milisegundos (para que el jugador NUNCA quede congelado si falla un anuncio)
  AD_TIMEOUT_MS: 4000,

  // --- POLÍTICAS DE EQUILIBRIO Y ANTI-FRUSTRACIÓN ---
  // Intervalo mínimo entre anuncios automáticos (3.5 minutos = 210,000 ms)
  MIN_COOLDOWN_MS: 210000,

  // Duración mínima de la partida para considerar mostrar anuncio (45 segundos)
  MIN_PLAYTIME_FOR_AD_MS: 45000,

  // Cortesía inicial: La primera partida de cada sesión es 100% libre de anuncios
  FIRST_GAME_FREE: true,

  // Límite de anuncios intersticiales automáticos por sesión del jugador
  MAX_ADS_PER_SESSION: 5
};

// Aliases para retrocompatibilidad con código existente
export const CLIENT_ID = ADS_CONFIG.ADSENSE_CLIENT_ID;
export const SLOT_PRE_MISSION = ADS_CONFIG.ADSENSE_SLOT_PRE_MISSION;

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

    this.detectPlatform();
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

    // Regla 1: Primera partida de cortesía (100% libre de anuncios)
    if (ADS_CONFIG.FIRST_GAME_FREE && this.gamesPlayedCount === 0) {
      console.log("[AdsManager] 🛡️ Cortesía inicial: Primera partida libre de anuncios para fidelizar al jugador.");
      return false;
    }

    // Regla 2: Muerte instantánea o partida muy corta (< 45s) -> jamás molestar
    if (playtime > 0 && playtime < ADS_CONFIG.MIN_PLAYTIME_FOR_AD_MS) {
      console.log(`[AdsManager] 🛡️ Partida breve (${Math.round(playtime / 1000)}s). Anuncio omitido para no frustrar tras caída rápida.`);
      return false;
    }

    // Regla 3: Enfriamiento obligatorio entre anuncios (mínimo 3.5 minutos)
    const timeSinceLastAd = now - this.lastAdTimestamp;
    if (this.lastAdTimestamp > 0 && timeSinceLastAd < ADS_CONFIG.MIN_COOLDOWN_MS) {
      const waitRemainingSec = Math.round((ADS_CONFIG.MIN_COOLDOWN_MS - timeSinceLastAd) / 1000);
      console.log(`[AdsManager] ⏳ Cooldown activo (${waitRemainingSec}s restantes). Anuncio automático omitido.`);
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
      if (this.currentPlatform === "CRAZYGAMES" && this.crazyGamesSDK) {
        this.crazyGamesSDK.ad.requestAd("midgame", {
          adStarted: () => console.log("[CrazyGames] Anuncio iniciado"),
          adFinished: () => {
            clearTimeout(timer);
            safeComplete();
          },
          adError: (error) => {
            console.warn("[CrazyGames] Error en anuncio:", error);
            clearTimeout(timer);
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

      // 3. Monetag Programático (si se ha configurado función directa en la zona)
      if (typeof window.show_monetag_ad === "function") {
        window.show_monetag_ad()
          .then(() => {
            clearTimeout(timer);
            safeComplete();
          })
          .catch((err) => {
            console.warn("[Monetag] Error al reproducir anuncio:", err);
            clearTimeout(timer);
            safeComplete();
          });
        return;
      }

      // 4. Fallback Web Propia (Continúa inmediatamente y muestra banners)
      clearTimeout(timer);
      safeComplete();

    } catch (e) {
      console.warn("[AdsManager] Excepción al invocar anuncio:", e);
      clearTimeout(timer);
      safeComplete();
    }
  }

  /**
   * Muestra un anuncio con recompensa (Rewarded Video) VOLUNTARIO.
   * Utilizado para: "Revivir nave con escudo al 100% (+2 vidas de rescate)"
   */
  showRewardedAd(onRewarded, onDismissed) {
    try {
      // 1. CrazyGames Rewarded Video
      if (this.currentPlatform === "CRAZYGAMES" && this.crazyGamesSDK) {
        this.crazyGamesSDK.ad.requestAd("rewarded", {
          adStarted: () => console.log("[CrazyGames] Video de recompensa iniciado"),
          adFinished: () => {
            console.log("[CrazyGames] Recompensa completada.");
            if (typeof onRewarded === "function") onRewarded();
          },
          adError: (error) => {
            console.warn("[CrazyGames] Error o descarte en video recompensado:", error);
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

      // 3. Monetag Rewarded (si está disponible API programática)
      if (typeof window.show_monetag_rewarded === "function") {
        window.show_monetag_rewarded()
          .then(() => {
            if (typeof onRewarded === "function") onRewarded();
          })
          .catch(() => {
            if (typeof onDismissed === "function") onDismissed();
          });
        return;
      }

      // 4. Fallback Web Propia (Simulación generosa y cortesía táctica):
      console.log("[AdsManager] Entorno Web Propia: Concediendo revivir de rescate al piloto.");
      if (typeof onRewarded === "function") {
        setTimeout(onRewarded, 200);
      }

    } catch (e) {
      console.warn("[AdsManager] Fallo en anuncio recompensado:", e);
      if (typeof onDismissed === "function") onDismissed();
    }
  }
}

// Instancia global exportada
export const adsManager = new UniversalAdsManager();

// Función de compatibilidad exacta con la versión anterior de ads_config.js
export function renderGoogleAd(containerElement, slotId) {
  adsManager.renderGoogleAd(containerElement, slotId);
}
