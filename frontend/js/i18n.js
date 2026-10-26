/**
 * SISTEMA INTERNACIONAL DE LOCALIZACIÓN (i18n)
 * Space Assault v2.0 - Tactical Aerial & Space Assault
 * 
 * Idioma por defecto en CrazyGames y entornos globales: INGLÉS (EN)
 * Idioma por defecto en navegadores en español propios: ESPAÑOL (ES)
 * Conmutador interactivo 🌐 EN / ES disponible en la cabecera.
 */

const DICTIONARY = {
  en: {
    // Header
    "brand_subtitle": "TACTICAL AERIAL & SPACE ASSAULT",
    "btn_fullscreen": "⛶ FULLSCREEN [F]",
    "sfx_on": "🔊 SFX: ON",
    "sfx_off": "🔇 SFX: OFF",
    "music_on": "🎵 MUSIC: ON",
    "music_off": "🔇 MUSIC: OFF",
    "btn_leaderboard": "🏆 RANKING",
    "btn_help": "📖 MANUAL",
    "btn_share": "📢 SHARE",
    "server_online": "ONLINE [READY]",

    // Auth
    "auth_badge": "ORBITAL TACTICAL SYSTEM",
    "auth_subtitle": "FIGHTER COMMAND // AUTHENTICATION PROTOCOL",
    "tab_login": "🔑 ACCESS HANGAR",
    "tab_register": "📝 NEW PILOT",
    "btn_guest": "⚡ PLAY AS GUEST (INSTANT DEPLOY)",
    "label_username": "PILOT CALLSIGN",
    "placeholder_username": "Enter your callsign...",
    "label_password": "ACCESS KEY",
    "placeholder_password": "••••••••",
    "btn_login": "LAUNCH SESSION ➔",
    "btn_register": "CONFIRM ENLISTMENT ➔",
    "guest_notice": "Guest mode: your tactical progress is saved locally during this run.",

    // Lobby / Hangar
    "lobby_title": "HANGAR COMMAND CENTER",
    "lobby_subtitle": "SELECT AN OPERATION OR CONFIGURE YOUR FLEET",
    "pilot_rank": "RANK: COMMANDER",
    "btn_deploy_mission": "🚀 DEPLOY TO COMBAT",
    "btn_view_ships": "🛸 STARFIGHTER CATALOG",
    "btn_logout": "✕ LOGOUT",
    "stat_missions": "MISSIONS PLAYED",
    "stat_high_score": "RECORD SCORE",
    "stat_enemies": "ENEMIES ABATED",
    "stat_bosses": "BOSSES DEFEATED",

    // Ship Select
    "ship_select_title": "TACTICAL STARFIGHTER SELECTION",
    "ship_select_subtitle": "CHOOSE YOUR ASSAULT SHIP BEFORE LAUNCH",
    "btn_back_to_lobby": "← RETURN TO HANGAR",
    "btn_deploy_ship": "DEPLOY THIS SHIP ➔",
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
    "btn_launch_briefing": "🚀 CONFIRM & LAUNCH",

    // Battle HUD
    "hud_hull": "HULL INTEGRITY",
    "hud_lives": "LIVES",
    "hud_score": "SCORE",
    "hud_bombs": "EMP BOMBS",
    "hud_weapon": "CANNON LEVEL",
    "hud_special_ready": "⚡ SPECIAL READY [E]",
    "hud_special_charging": "⚡ CHARGING...",
    "btn_hud_bomb": "💥 EMP BOMB [B]",
    "btn_exit_battle": "✕ ABORT [ESC]",

    // Mobile touch controls
    "touch_bomb": "💣 BOMB",
    "touch_special": "⚡ SPECIAL",
    "touch_pause": "⏸️ PAUSE",

    // Victory Modal
    "vic_title_area": "🎖️ AREA CLEARED!",
    "vic_title_campaign": "🏆 TOTAL VICTORY: CAMPAIGN CONQUERED!",
    "vic_score_label": "TOTAL OPERATION SCORE",
    "vic_enemies_label": "HOSTILE UNITS DESTROYED",
    "vic_bosses_label": "FLAGSHIPS ABATED",
    "vic_bonus_life": "+1 BONUS LIFE (EXTRA SHIELD)",
    "btn_next_stage": "🚀 DEPLOY TO NEXT STAGE ➔",
    "btn_hangar_vic": "MAP OF OPERATIONS",
    "btn_hangar_vic_honors": "🎖️ RETURN TO HANGAR WITH HONORS",

    // Game Over Modal
    "go_title": "STARFIGHTER DESTROYED",
    "go_subtitle": "TACTICAL EMERGENCY // VESSEL ABATED IN COMBAT",
    "go_score_label": "FINAL MISSION SCORE",
    "go_enemies_label": "ENEMIES DESTROYED",
    "btn_revive": "⚡ REVIVE SHIP WITH 100% SHIELD (+2 LIVES)",
    "btn_restart_go": "RESTART MISSION (STAGE 1)",
    "btn_hangar_go": "RETURN TO HANGAR",

    // Intro Cinema
    "intro_title": "EMERGENCY HOLOGRAPHIC INTERCEPTION",
    "intro_boss_name": "GENERAL VEKTOR",
    "intro_boss_role": "SUPREME WARLORD (FLAGSHIP COMMANDER)",
    "btn_intro_skip": "SKIP INTRO",
    "btn_intro_next": "CONTINUE ➔",

    // Dialogs & Messages
    "dialog_abort_title": "TACTICAL RETREAT // ALERT",
    "dialog_abort_msg": "Do you want to abort the combat mission and return to the hangar?",
    "dialog_abort_sub": "⚠️ The aerial incursion will be marked as failed and progress resets to Stage 1.",
    "dialog_abort_confirm": "✕ ABORT MISSION",
    "dialog_abort_cancel": "CONTINUE BATTLE"
  },
  es: {
    // Header
    "brand_subtitle": "COMBATE AÉREO Y ASALTO ESPACIAL TÁCTICO",
    "btn_fullscreen": "⛶ PANTALLA COMPLETA [F]",
    "sfx_on": "🔊 SFX: ON",
    "sfx_off": "🔇 SFX: OFF",
    "music_on": "🎵 MÚSICA: ON",
    "music_off": "🔇 MÚSICA: OFF",
    "btn_leaderboard": "🏆 RANKING",
    "btn_help": "📖 AYUDA",
    "btn_share": "📢 COMPARTIR",
    "server_online": "ONLINE [LISTO]",

    // Auth
    "auth_badge": "SISTEMA TÁCTICO ORBITAL",
    "auth_subtitle": "COMANDO DE CAZAS // PROTOCOLO DE AUTENTICACIÓN",
    "tab_login": "🔑 INGRESAR AL HANGAR",
    "tab_register": "📝 NUEVO PILOTO",
    "btn_guest": "⚡ JUGAR COMO INVITADO (DESPLIEGUE DIRECTO)",
    "label_username": "INDICATIVO DE PILOTO",
    "placeholder_username": "Ingresa tu callsign...",
    "label_password": "CLAVE DE ACCESO",
    "placeholder_password": "••••••••",
    "btn_login": "INICIAR SESIÓN ➔",
    "btn_register": "CONFIRMAR ALISTAMIENTO ➔",
    "guest_notice": "Modo invitado: tu progreso se conserva en esta sesión táctica.",

    // Lobby / Hangar
    "lobby_title": "CENTRO DE COMANDO & HANGAR",
    "lobby_subtitle": "SELECCIONA UNA OPERACIÓN O CONFIGURA TU ESCUADRA",
    "pilot_rank": "RANGO: COMANDANTE",
    "btn_deploy_mission": "🚀 DESPLEGAR A LA BATALLA",
    "btn_view_ships": "🛸 HANGAR DE NAVES",
    "btn_logout": "✕ CERRAR SESIÓN",
    "stat_missions": "MISIONES JUGADAS",
    "stat_high_score": "RÉCORD HISTÓRICO",
    "stat_enemies": "ENEMIGOS ABATIDOS",
    "stat_bosses": "JEFES DERROTADOS",

    // Ship Select
    "ship_select_title": "SELECCIÓN DE NAVE TÁCTICA",
    "ship_select_subtitle": "ESCOGE TU CAZA ESTELAR ANTES DEL DESPEGUE",
    "btn_back_to_lobby": "← VOLVER AL HANGAR",
    "btn_deploy_ship": "DESPLEGAR ESTA NAVE ➔",
    "ship_stat_health": "BLINDAJE DE CASCO",
    "ship_stat_speed": "VELOCIDAD DE IMPULSO",
    "ship_stat_firepower": "POTENCIA DE FUEGO",
    "ship_stat_special": "HABILIDAD DEFINITIVA",

    // Stage Select & Briefing
    "stage_select_title": "TEATRO DE OPERACIONES",
    "stage_select_subtitle": "5 SECTORES PROGRESIVOS HASTA EL GENERAL VEKTOR",
    "briefing_title": "BRIEFING DE OPERACIONES TÁCTICAS",
    "briefing_intel_badge": "INTELIGENCIA OPERACIONAL",
    "briefing_squadrons": "ESCUADRAS HOSTILES ACTIVAS",
    "btn_cancel_briefing": "VOLVER AL MAPA",
    "btn_launch_briefing": "🚀 CONFIRMAR Y DESPEGAR",

    // Battle HUD
    "hud_hull": "INTEGRIDAD DE CASCO",
    "hud_lives": "VIDAS",
    "hud_score": "PUNTOS",
    "hud_bombs": "BOMBAS EMP",
    "hud_weapon": "NIVEL DE CAÑÓN",
    "hud_special_ready": "⚡ ESPECIAL LISTO [E]",
    "hud_special_charging": "⚡ CARGANDO...",
    "btn_hud_bomb": "💥 BOMBA EMP [B]",
    "btn_exit_battle": "✕ ABORTAR [ESC]",

    // Mobile touch controls
    "touch_bomb": "💣 BOMBA",
    "touch_special": "⚡ ESPECIAL",
    "touch_pause": "⏸️ PAUSA",

    // Victory Modal
    "vic_title_area": "🎖️ ¡ÁREA SUPERADA!",
    "vic_title_campaign": "🏆 ¡VICTORIA TOTAL: CAMPAÑA CONQUISTADA!",
    "vic_score_label": "PUNTUACIÓN DE OPERACIÓN",
    "vic_enemies_label": "UNIDADES HOSTILES DESTRUIDAS",
    "vic_bosses_label": "JEFES INSIGNIA ABATIDOS",
    "vic_bonus_life": "+1 VIDA EXTRA (ESCUDO ADICIONAL)",
    "btn_next_stage": "🚀 DESPLEGAR A LA FASE SIGUIENTE ➔",
    "btn_hangar_vic": "MAPA DE OPERACIONES",
    "btn_hangar_vic_honors": "🎖️ REGRESAR AL HANGAR CON HONORES",

    // Game Over Modal
    "go_title": "NAVE DESTRUIDA",
    "go_subtitle": "EMERGENCIA TÁCTICA // NAVE ABATIDA EN COMBATE",
    "go_score_label": "PUNTUACIÓN FINAL",
    "go_enemies_label": "ENEMIGOS DESTRUIDOS",
    "btn_revive": "⚡ REVIVIR NAVE CON ESCUDO AL 100% (+2 VIDAS)",
    "btn_restart_go": "REINTENTAR MISIÓN (FASE 1)",
    "btn_hangar_go": "REGRESAR AL HANGAR",

    // Intro Cinema
    "intro_title": "INTERCEPCIÓN HOLOGRAMÁTICA DE EMERGENCIA",
    "intro_boss_name": "GENERAL VEKTOR",
    "intro_boss_role": "SUPREMO SEÑOR DE LA GUERRA",
    "btn_intro_skip": "SALTAR INTRO",
    "btn_intro_next": "CONTINUAR ➔",

    // Dialogs & Messages
    "dialog_abort_title": "RETIRADA TÁCTICA // ALERTA",
    "dialog_abort_msg": "¿Deseas abortar la misión de combate y regresar al hangar?",
    "dialog_abort_sub": "⚠️ La incursión se dará por fallida y el progreso se reiniciará a Fase 1.",
    "dialog_abort_confirm": "✕ ABORTAR MISIÓN",
    "dialog_abort_cancel": "CONTINUAR COMBATE"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = this._detectInitialLanguage();
  }

  _detectInitialLanguage() {
    if (typeof window === "undefined") return "en";

    // 1. Si el usuario guardó manualmente su preferencia
    try {
      const saved = localStorage.getItem("sa_lang");
      if (saved && (saved === "en" || saved === "es")) {
        return saved;
      }
    } catch (_) {}

    // 2. En CrazyGames, SIEMPRE el idioma por defecto es INGLÉS (requisito estricto de publicación)
    const isCrazyGames = window.location.hostname.includes("crazygames.com") || 
                         window.location.hostname.includes("crazygames.io") || 
                         window.location.search.includes("cg=1");
    if (isCrazyGames) {
      return "en";
    }

    // 3. En otros portales internacionales o por defecto
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
    } catch (_) {}
    this.applyTranslations();
  }

  toggleLanguage() {
    const nextLang = this.currentLang === "en" ? "es" : "en";
    this.setLanguage(nextLang);
    return nextLang;
  }

  t(key, fallback = "") {
    const table = DICTIONARY[this.currentLang] || DICTIONARY.en;
    if (table && table[key] !== undefined) {
      return table[key];
    }
    const enTable = DICTIONARY.en;
    if (enTable && enTable[key] !== undefined) {
      return enTable[key];
    }
    return fallback || key;
  }

  /**
   * Recorre el DOM y actualiza todos los elementos con atributo data-i18n
   */
  applyTranslations() {
    if (typeof document === "undefined") return;

    // Actualizar indicador en el botón de idioma
    const langBtnText = document.getElementById("current-lang-text");
    if (langBtnText) {
      langBtnText.textContent = this.currentLang.toUpperCase();
    }

    // Elementos con texto directo
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (translation) {
        el.textContent = translation;
      }
    });

    // Elementos con placeholders
    const placeholders = document.querySelectorAll("[data-i18n-ph]");
    placeholders.forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      const translation = this.t(key);
      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // Notificar al resto del juego mediante evento
    document.dispatchEvent(new CustomEvent("language_changed", { detail: { lang: this.currentLang } }));
  }
}

export const i18n = new I18nManager();
export const t = (key, fallback) => i18n.t(key, fallback);
if (typeof window !== "undefined") {
  window.i18n = i18n;
  window.t = t;
}
