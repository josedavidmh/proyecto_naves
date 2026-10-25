/**
 * ADAPTADOR UNIVERSAL DE PUBLICIDAD Y MONETIZACIÓN MULTIPLATAFORMA
 * Space Assault v2.0 - Tactical Aerial & Space Assault
 * 
 * Compatible con:
 * - Google AdSense (Display Banners)
 * - Monetag (Direct Web Interstitials / Vignette)
 * - CrazyGames SDK (Midgame & Rewarded Video)
 * - GameDistribution SDK (Azerion HTML5 Ads)
 * - AdinPlay (AIP Web Game Ads)
 */

export const ADS_CONFIG = {
  // Configuración Google AdSense
  ADSENSE_CLIENT_ID: "ca-pub-6261859133501243",
  ADSENSE_SLOT_PRE_MISSION: "1668600475",
  ADSENSE_SLOT_POST_MISSION: "0987654321",

  // Configuración Monetag (ID de zona directa al registrarse)
  MONETAG_ZONE_ID: "12121371",

  // Configuración GameDistribution (Game GUID asignado al crear el juego)
  GD_GAME_ID: "",

  // Configuración CrazyGames
  CRAZYGAMES_ENABLED: false,

  // Modo seguro de pruebas:
  TEST_MODE: true,

  // Timeout de seguridad en milisegundos (para que el jugador NUNCA quede congelado si falla un anuncio)
  AD_TIMEOUT_MS: 4000
};

// Aliases para retrocompatibilidad con código existente
export const CLIENT_ID = ADS_CONFIG.ADSENSE_CLIENT_ID;
export const SLOT_PRE_MISSION = ADS_CONFIG.ADSENSE_SLOT_PRE_MISSION;

class UniversalAdsManager {
  constructor() {
    this.currentPlatform = "STANDALONE";
    this.isInitialized = false;
    this.crazyGamesSDK = null;
    this.detectPlatform();
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
   * Muestra un anuncio Interstitial antes de despegar o al completar una misión.
   * Cuenta con protección de tiempo máximo (timeout) para nunca bloquear la partida.
   */
  showInterstitial(onComplete) {
    let finished = false;
    const safeComplete = () => {
      if (!finished) {
        finished = true;
        if (typeof onComplete === "function") onComplete();
      }
    };

    // Timeout de emergencia: si el anuncio tarda más de AD_TIMEOUT_MS, la partida continúa
    const timer = setTimeout(() => {
      console.log("[AdsManager] Timeout de anuncio alcanzado. Continuando juego...");
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

      // 3. Fallback Web Propia (Continúa inmediatamente y muestra banners)
      clearTimeout(timer);
      safeComplete();

    } catch (e) {
      console.warn("[AdsManager] Excepción al invocar anuncio:", e);
      clearTimeout(timer);
      safeComplete();
    }
  }

  /**
   * Muestra un anuncio con recompensa (Rewarded Video)
   * Útil para: "Revivir nave con escudo al 100%" o "+1 Bomba Táctica"
   */
  showRewardedAd(onRewarded, onDismissed) {
    let rewarded = false;

    try {
      // CrazyGames Rewarded Video
      if (this.currentPlatform === "CRAZYGAMES" && this.crazyGamesSDK) {
        this.crazyGamesSDK.ad.requestAd("rewarded", {
          adStarted: () => console.log("[CrazyGames] Video de recompensa iniciado"),
          adFinished: () => {
            rewarded = true;
            if (typeof onRewarded === "function") onRewarded();
          },
          adError: (error) => {
            console.warn("[CrazyGames] Error en video recompensado:", error);
            if (typeof onDismissed === "function") onDismissed();
          }
        });
        return;
      }

      // GameDistribution Rewarded Video
      if (this.currentPlatform === "GAMEDISTRIBUTION" && window.gdsdk && typeof window.gdsdk.showAd === "function") {
        window.gdsdk.showAd("rewarded")
          .then(() => {
            if (typeof onRewarded === "function") onRewarded();
          })
          .catch(() => {
            if (typeof onDismissed === "function") onDismissed();
          });
        return;
      }

      // Si no hay red de recompensa activa, otorgamos cortesía o cancelamos
      console.log("[AdsManager] Red de recompensa no disponible en este entorno.");
      if (typeof onDismissed === "function") onDismissed();

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
