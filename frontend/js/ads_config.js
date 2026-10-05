/**
 * CONFIGURACIÓN CENTRALIZADA DE GOOGLE ADSENSE
 * Space Assault - Tactical Aerial & Space Assault
 * 
 * Instrucciones:
 * 1. Accede a tu consola de Google AdSense (https://adsense.google.com).
 * 2. En "Anuncios" -> "Por bloque de anuncios", crea un bloque de tipo "Anuncio de Display" (Horizontal o Responsivo).
 * 3. Copia tu 'Publisher ID' (ca-pub-XXXXXXXXXXXXXXXX) y tu 'Slot ID' (10 dígitos).
 * 4. Pégalos aquí abajo en CLIENT_ID y SLOT_PRE_MISSION.
 */

export const ADS_CONFIG = {
  // Tu identificador de editor en Google AdSense
  CLIENT_ID: "ca-pub-6261859133501243",


  // Identificador del bloque de anuncios que aparece al inicio de cada misión (Briefing)
  SLOT_PRE_MISSION: "1668600475",

  // Identificador opcional para anuncios en pantalla de victoria/derrota
  SLOT_POST_MISSION: "0987654321",

  // Modo de pruebas de Google AdSense:
  // true: activa 'data-adtest="on"' para no generar penalizaciones mientras pruebas localmente
  // false: anuncios reales para producción
  TEST_MODE: true,

  // Tiempo en segundos de cuenta regresiva táctica antes de que el jugador despegue (0 para inmediato)
  COUNTDOWN_SECONDS: 0
};

/**
 * Inicializador seguro de anuncios Google AdSense
 * Protege contra bloqueadores de anuncios (AdBlock) y errores de carga
 */
export function renderGoogleAd(containerElement, slotId = ADS_CONFIG.SLOT_PRE_MISSION) {
  if (!containerElement) return;

  try {
    const ins = containerElement.querySelector("ins.adsbygoogle");
    if (!ins) return;

    // Si ya fue procesado por Google AdSense, evitamos llamar push({}) duplicado
    if (ins.getAttribute("data-adsbygoogle-status")) {
      return;
    }

    // Si Google AdSense está disponible en la ventana
    if (window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      console.log("[AdSense] Solicitud de anuncio enviada para slot:", slotId);
    }
  } catch (err) {
    console.warn("[AdSense] Nota: Bloqueador de anuncios detectado o AdSense en modo simulación.", err);
  }
}
