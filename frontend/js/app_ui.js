import { ApiService } from "./api.js";
import { GameEngine } from "./engine.js";
import { ShipRenderer } from "./ship_renderer.js";
import { IntroCinema } from "./intro_cinema.js";
import { MissionLore } from "./mission_lore.js";
import { Sound } from "./sound_fx.js";
import { EnemyCatalog } from "./enemies.js";
import { BossCatalog } from "./bosses.js";
import { ADS_CONFIG, renderGoogleAd, adsManager } from "./ads_config.js";
import { GAME_VERSION } from "./version.js";
import { CyberDialog } from "./cyber_dialog.js";
import { socialShare } from "./social_share.js";
import { i18n, t } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
  // Sincronización automática de versión en badges y pestaña del navegador
  document.querySelectorAll(".game-version-badge").forEach(badge => {
    badge.textContent = `v${GAME_VERSION}`;
  });
  if (!document.title.includes(`v${GAME_VERSION}`)) {
    document.title = `Space Assault v${GAME_VERSION} - Tactical Aerial & Space Combat`;
  }
  // Contenedores principales de vistas
  const lobbyContainer = document.getElementById("lobby-container");
  const shipSelectContainer = document.getElementById("ship-select-container");
  const stageSelectContainer = document.getElementById("stage-select-container");
  const battleContainer = document.getElementById("battle-container");
  const leaderboardModal = document.getElementById("leaderboard-modal");
  const gameOverModal = document.getElementById("game-over-modal");
  const victoryModal = document.getElementById("victory-modal");
  const briefingModal = document.getElementById("briefing-modal");

  // Botones de navegación
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

  // Control estricto anti-duplicados: asegurar que exista únicamente 1 botón flotante en todo el DOM
  const allFloatingBtns = document.querySelectorAll(".floating-fullscreen-btn, #btn-floating-fullscreen");
  if (allFloatingBtns.length > 1) {
    for (let i = 1; i < allFloatingBtns.length; i++) {
      allFloatingBtns[i].remove();
    }
  }

  const btnAudioToggle = document.getElementById("btn-audio-toggle");
  const btnMusicToggle = document.getElementById("btn-music-toggle");
  const btnLangToggle = document.getElementById("btn-lang-toggle");

  // Canvas y HUD
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

  // --- CONTROLES DE AUDIO Y MULTI-IDIOMA ---
  if (btnLangToggle) {
    btnLangToggle.addEventListener("click", () => {
      i18n.toggleLanguage();
      updateFullscreenButtons(document.body.classList.contains("theater-mode-active") || !!document.fullscreenElement);
      if (btnAudioToggle) btnAudioToggle.textContent = Sound.isMuted ? t("sfx_off") : t("sfx_on");
      if (btnMusicToggle) btnMusicToggle.textContent = musicActive ? t("music_on") : t("music_off");
    });
  }

  // Aplicar traducciones iniciales
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

  // --- CONTROL ROBUSTO DE PANTALLA COMPLETA HÍBRIDA ---
  function updateFullscreenButtons(isFs) {
    const isEn = i18n.getLanguage() === "en";
    if (btnFullscreenHeader) {
      btnFullscreenHeader.textContent = isFs ? (isEn ? "🗗 EXIT FULLSCREEN [F]" : "🗗 SALIR PANTALLA [F]") : (isEn ? "⛶ FULLSCREEN [F]" : "⛶ PANTALLA COMPLETA [F]");
    }
    if (btnBattleFullscreen) {
      btnBattleFullscreen.textContent = isFs ? (isEn ? "🗗 EXIT [F]" : "🗗 SALIR [F]") : (isEn ? "⛶ FULLSCREEN [F]" : "⛶ PANTALLA COMPLETA [F]");
    }
    if (btnFloatingFullscreen) {
      // Remover cualquier botón flotante duplicado residual
      const extraFloating = document.querySelectorAll(".floating-fullscreen-btn, #btn-floating-fullscreen");
      if (extraFloating.length > 1) {
        for (let i = 1; i < extraFloating.length; i++) extraFloating[i].remove();
      }

      btnFloatingFullscreen.innerHTML = isFs 
        ? `<span>🗗</span> ${isEn ? "RESTORE [F]" : "SALIR PANTALLA [F]"}` 
        : `<span>⛶</span> ${isEn ? "EXPAND [F]" : "EXPANDIR JUEGO [F]"}`;
      if (isFs) {
        btnFloatingFullscreen.classList.add("is-active");
      } else {
        btnFloatingFullscreen.classList.remove("is-active");
      }
    }
  }

  function toggleFullscreen() {
    const isCurrentlyFs = !!(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.body.classList.contains("theater-mode-active")
    );

    if (!isCurrentlyFs) {
      // 1. Expansión visual inmediata mediante clase CSS (garantizada en cualquier navegador)
      document.body.classList.add("theater-mode-active");
      if (battleContainer) battleContainer.classList.add("is-fullscreen");

      // 2. Intentar API nativa Fullscreen en documentElement
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn("[Pantalla Completa Nativa Bloqueada - Modo Teatro Expandido Activo]", err);
        });
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }

      updateFullscreenButtons(true);
    } else {
      // Salir de pantalla completa y modo teatro
      document.body.classList.remove("theater-mode-active");
      if (battleContainer) battleContainer.classList.remove("is-fullscreen");

      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }

      updateFullscreenButtons(false);
    }
  }

  // Exponer a nivel global para que el motor y atajos de teclado siempre usen la misma lógica
  window.toggleFullscreen = toggleFullscreen;

  // Eventos de botones
  if (btnFullscreenHeader) btnFullscreenHeader.addEventListener("click", toggleFullscreen);
  if (btnBattleFullscreen) btnBattleFullscreen.addEventListener("click", toggleFullscreen);
  if (btnFloatingFullscreen) btnFloatingFullscreen.addEventListener("click", toggleFullscreen);

  // Escuchar cambio nativo de pantalla completa (ej. con tecla Escape)
  document.addEventListener("fullscreenchange", () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFs) {
      document.body.classList.remove("theater-mode-active");
      if (battleContainer) battleContainer.classList.remove("is-fullscreen");
    }
    updateFullscreenButtons(isFs);
  });

  // Atajo de Teclado Global: Tecla F en cualquier vista del juego
  window.addEventListener("keydown", (e) => {
    // Si el usuario escribe en un campo de texto (login/registro), permitir escribir 'f'
    if (e.target && e.target.matches("input, textarea, select")) {
      return;
    }
    if (e.code === "KeyF") {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  // Variables de Estado
  const DEFAULT_SHIPS = [
    {
      id: 1,
      slug: "phoenix-vanguard",
      name: "Phoenix Vanguard",
      description: "Caza interceptor de alta maniobrabilidad con disparo láser doble sincronizado.",
      weapon: { name: "Doble Láser de Iones", type: "twin_laser", damage: 18, fire_rate_ms: 130 },
      special: { name: "Escudo Cinético de Absorción", slug: "shield_matrix", duration_seconds: 5.0, cooldown_seconds: 18.0 },
      stats: { max_health: 100, speed: 7.5 }
    },
    {
      id: 2,
      slug: "titan-colossus",
      name: "Titan Colossus",
      description: "Nave pesada acorazada con cañón de plasma concentrado y tremenda resistencia.",
      weapon: { name: "Cañón de Plasma Pesado", type: "heavy_plasma", damage: 42, fire_rate_ms: 260 },
      special: { name: "Pulso Sísmico de Choque (EMP)", slug: "emp_blast", duration_seconds: 3.0, cooldown_seconds: 24.0 },
      stats: { max_health: 180, speed: 5.0 }
    },
    {
      id: 3,
      slug: "valkyrie-specter",
      name: "Valkyrie Specter",
      description: "Fragata de asalto táctico con ráfaga en cono triple para barrer oleadas de cazas.",
      weapon: { name: "Tridente de Dispersión Cónica", type: "triple_spread", damage: 14, fire_rate_ms: 160 },
      special: { name: "Modo Espectro y Sobrecarga Crítica", slug: "overdrive_ghost", duration_seconds: 4.5, cooldown_seconds: 20.0 },
      stats: { max_health: 110, speed: 6.5 }
    },
    {
      id: 4,
      slug: "vortex-tempest",
      name: "Vortex Tempest",
      description: "Prototipo experimental equipado con cañones de ondas sonoras que penetran blindajes.",
      weapon: { name: "Emisor de Ondas Resonantes", type: "wave_cannon", damage: 28, fire_rate_ms: 210 },
      special: { name: "Agujero Negro Vorticial", slug: "singularity_vortex", duration_seconds: 4.0, cooldown_seconds: 22.0 },
      stats: { max_health: 120, speed: 6.0 }
    },
    {
      id: 5,
      slug: "aura-eclipse",
      name: "Aura Eclipse",
      description: "Nave furtiva de operaciones encubiertas con láser quíntuple de barrido masivo.",
      weapon: { name: "Láser Quíntuple de Fase", type: "quint_laser", damage: 22, fire_rate_ms: 180 },
      special: { name: "Bombardeo Orbital Fotónico", slug: "orbital_bombardment", duration_seconds: 5.0, cooldown_seconds: 26.0 },
      stats: { max_health: 95, speed: 8.0 }
    },
    {
      id: 6,
      slug: "hyperion-dreadnought",
      name: "Hyperion Apex",
      description: "Buque insignia de supremacía con haz de plasma focalizado continuo y devastador.",
      weapon: { name: "Haz Focal de Fotones", type: "beam_laser", damage: 36, fire_rate_ms: 180 },
      special: { name: "Bombardeo Suborbital Masivo", slug: "orbital_bombardment", duration_seconds: 4.0, cooldown_seconds: 28.0 },
      stats: { max_health: 140, speed: 5.8 }
    }
  ];

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

      // Sincronizar contador de vidas disponibles (3 base + bonos)
      const elLives = document.getElementById("stat-lives");
      const bonus = (typeof localStorage !== "undefined") ? parseInt(localStorage.getItem("naves_bonus_lives") || "0", 10) : 0;
      if (elLives) elLives.textContent = 3 + bonus;
      socialShare.updateLobbyBannerRewardStatus();
    } catch (err) {
      console.warn("[Error al cargar estadísticas]", err);
    }
  }

  window.addEventListener("naves:user-logged-in", (e) => {
    currentUser = e.detail;
    loadPilotStats();
  });

  window.addEventListener("naves:user-logged-out", () => {
    currentUser = null;
  });

  // Inicializar motor de juego
  engine = new GameEngine(canvas, {
    healthBar,
    healthText,
    specialStatus,
    scoreText,
    stageProgress,
    weaponLevelText: hudWeaponLevel,
    bombsCountText: hudBombsCount,
    onGameOver: async (stats) => {
      // Al agotarse las vidas, se reinicia la partida desde el comienzo (Fase 1)
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
      // CUANDO SUPERA UN ÁREA SE LE OTORGA +1 VIDA EXTRA:
      const currentLives = engine ? engine.lives : 3;
      const rewardedLives = currentLives + 1;
      if (engine) {
        engine.lives = rewardedLives;
        engine.updateHudLives();
      }

      // Sincronizar progreso local para asegurar desbloqueo en modo invitado u offline
      try {
        const localProg = getLocalStageProgress();
        if (stats.stageCompleted < 5) {
          const nextKey = String(stats.stageCompleted + 1);
          if (localProg.stages[nextKey]) {
            localProg.stages[nextKey].unlocked = true;
          }
          localProg.current_max_stage = Math.max(localProg.current_max_stage || 1, stats.stageCompleted + 1);
          saveLocalStageProgress(localProg);
        }
      } catch (_) {}

      // PRESERVAR HISTORIAL MIENTRAS TENGA VIDAS VIGENTES:
      activeRunSession = {
        preserveHistory: true,
        score: stats.score,
        enemies: stats.enemies,
        bosses: stats.bosses,
        lives: rewardedLives,
        weaponLevel: engine && engine.player ? engine.player.weaponLevel : 1,
        upgradeHitsReceived: engine && engine.player ? engine.player.upgradeHitsReceived : 0,
        bombs: (engine && engine.bombs !== undefined) ? engine.bombs : 1
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
      selectedStage = stats.stageCompleted; // Registrar fase superada

      document.getElementById("vic-score").textContent = stats.score.toLocaleString();
      document.getElementById("vic-enemies").textContent = stats.enemies;
      document.getElementById("vic-bosses").textContent = stats.bosses;
      if (elRewardText) {
        elRewardText.textContent = `+1 VIDA EXTRA (Total: ${rewardedLives} ❤️)`;
      }

      const isEn = i18n.getLanguage() === "en";
      if (isFinal) {
        if (elTitle) elTitle.textContent = isEn ? "🏆 TOTAL VICTORY: CAMPAIGN CONQUERED!" : "🏆 ¡VICTORIA TOTAL: CAMPAÑA CONQUISTADA!";
        document.getElementById("vic-stage").textContent = isEn ? "GENERAL VEKTOR DEFEATED · ALL SECTORS 100% CLEARED" : "GENERAL VEKTOR DERROTADO · TODAS LAS ÁREAS SUPERADAS AL 100%";
        if (elUnlocked) elUnlocked.textContent = isEn ? "✔ Congratulations commander! Campaign completed and recorded." : "✔ ¡Felicidades comandante! Campaña militar completada y guardada.";
        if (elEpilogue) elEpilogue.classList.remove("hidden");
        btnNextStageVictory.style.display = "none";
        btnHangarVictory.textContent = isEn ? "🎖️ RETURN TO HANGAR WITH HONORS" : "🎖️ REGRESAR AL HANGAR CON HONORES";
        btnHangarVictory.className = "btn-cyber-primary";
      } else {
        if (elTitle) elTitle.textContent = isEn ? `🎖️ AREA ${stats.stageCompleted} CLEARED!` : `🎖️ ¡ÁREA ${stats.stageCompleted} SUPERADA!`;
        document.getElementById("vic-stage").textContent = isEn ? `FLAGSHIP DESTROYED! AREA ${stats.stageCompleted} SECURED ➔ READY FOR STAGE ${nextStageNum}` : `¡JEFE PRINCIPAL ABATIDO! ÁREA ${stats.stageCompleted} DESPEJADA ➔ LISTO PARA FASE ${nextStageNum}`;
        if (elUnlocked) elUnlocked.textContent = isEn ? `✔ Area ${stats.stageCompleted} secured. Stage ${nextStageNum} unlocked.` : `✔ Área ${stats.stageCompleted} superada con éxito. Fase ${nextStageNum} desbloqueada.`;
        if (elEpilogue) elEpilogue.classList.add("hidden");
        btnNextStageVictory.style.display = "block";
        btnNextStageVictory.textContent = isEn ? `🚀 DEPLOY TO STAGE ${nextStageNum} ➔` : `🚀 DESPLEGAR A LA FASE ${nextStageNum} ➔`;
        btnHangarVictory.textContent = isEn ? "MAP OF OPERATIONS" : "MAPA DE OPERACIONES";
        btnHangarVictory.className = "btn-cyber-outline";
      }

      // Si el navegador tenía fullscreen en un elemento inferior, normalizar a pantalla completa de documento
      if (document.fullscreenElement && document.fullscreenElement !== document.documentElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }

      victoryModal.classList.remove("hidden");
      loadPilotStats();
    }
  });

  // Vincular CyberDialog con el motor de juego para pausar/reanudar automáticamente
  CyberDialog.init(engine);

  // Navegación hacia Selector de Naves
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

  // Salir del combate y volver al hangar con Message Box Sci-Fi Táctico
  btnExitBattle.addEventListener("click", async () => {
    const isEn = i18n.getLanguage() === "en";
    const confirmed = await CyberDialog.confirm({
      title: isEn ? "TACTICAL RETREAT // ALERT" : "RETIRADA TÁCTICA // ALERTA",
      message: isEn ? "Do you want to abort the combat mission and return to the hangar?" : "¿Deseas abortar la misión de combate y regresar al hangar?",
      subtext: isEn ? "⚠️ The aerial incursion will be marked as failed and progress resets to Stage 1." : "⚠️ La incursión aérea se dará por fallida y el historial de la partida se reiniciará a Fase 1.",
      icon: "⚠️",
      badge: isEn ? "HIGH COMMAND // EVACUATION PROTOCOL" : "ALTO MANDO // PROTOCOLO DE EVACUACIÓN",
      confirmText: isEn ? "✕ ABORT MISSION" : "✕ ABORTAR MISIÓN",
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

  // Botón táctico de lanzar bomba desde HUD
  if (btnHudBomb) {
    btnHudBomb.addEventListener("click", () => {
      if (engine && engine.isRunning) {
        engine.triggerBomb();
      }
    });
  }

  // --- CONTROLES TÁCTILES MÓVILES (INSTANTÁNEOS SIN RETARDO) ---
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

  // Reintentar tras agotar vidas: reinicia desde el principio (Fase 1, vidas y puntuación reseteadas)
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

  // Botón voluntario de anuncio recompensado: Revivir nave en la fase actual
  if (btnReviveRewarded) {
    btnReviveRewarded.addEventListener("click", (e) => {
      if (e && e.preventDefault) e.preventDefault();
      adsManager.showRewardedAd(
        () => {
          hasRevivedInCurrentRun = true;
          if (btnReviveRewarded) btnReviveRewarded.classList.add("hidden");
          gameOverModal.classList.add("hidden");

          const shipToDeploy = selectedShip || (availableShips && availableShips.length > 0 ? availableShips[0] : null);
          const currentStage = (latestGameStats && latestGameStats.stage) ? latestGameStats.stage : (selectedStage || 1);
          const currentScore = (latestGameStats && latestGameStats.score) ? latestGameStats.score : 0;
          const currentEnemies = (latestGameStats && latestGameStats.enemies) ? latestGameStats.enemies : 0;
          const currentBosses = (latestGameStats && latestGameStats.bosses) ? latestGameStats.bosses : 0;

          activeRunSession = {
            preserveHistory: true,
            score: currentScore,
            enemies: currentEnemies,
            bosses: currentBosses,
            lives: 2, // 2 vidas de rescate
            weaponLevel: (activeRunSession && activeRunSession.weaponLevel) ? activeRunSession.weaponLevel : 2,
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

  // Continuar y ubicar directamente en la siguiente fase tras victoria conservando historial
  btnNextStageVictory.addEventListener("click", (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Disparar anuncio de transición de área con fuerza
    adsManager.showInterstitial(() => {
      victoryModal.classList.add("hidden");
      if (selectedStage < 5) {
        selectedStage++;
        const shipToDeploy = selectedShip || (availableShips && availableShips.length > 0 ? availableShips[0] : null);
        if (shipToDeploy) {
          startMission(shipToDeploy, selectedStage, activeRunSession);
        } else {
          // En caso de no tener nave en memoria, cargarla desde el catálogo
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

  // Cargar las 5 naves desde SQLite mediante API con respaldo resiliente
  async function loadShips() {
    let shipsList = null;
    try {
      const res = await ApiService.getShips();
      if (res && res.ok && res.data && res.data.success && Array.isArray(res.data.ships) && res.data.ships.length > 0) {
        shipsList = res.data.ships;
      }
    } catch (_) {}

    if (!shipsList || shipsList.length === 0) {
      shipsList = DEFAULT_SHIPS;
    }

    availableShips = shipsList;
    const shipsGrid = document.getElementById("ships-grid");
    if (!shipsGrid) return;
    shipsGrid.innerHTML = "";

    availableShips.forEach((ship, idx) => {
      const card = document.createElement("div");
      card.className = "ship-card";

      // Renderizar mini canvas con la nave
      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.7rem; font-family: monospace; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(0,243,255,0.15); color: #00f3ff; border: 1px solid rgba(0,243,255,0.4);">NAVE #0${idx + 1}</span>
            <span style="font-size: 0.75rem; font-family: monospace; color: #94a3b8;">VELOCIDAD: ${ship.stats ? ship.stats.speed : 7}x</span>
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

      // Dibujar miniatura en el mini canvas
      setTimeout(() => {
        const miniCanvas = document.getElementById(`preview-ship-${ship.id}`);
        if (miniCanvas) {
          const miniCtx = miniCanvas.getContext("2d");
          miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
          ShipRenderer.drawPlayerShip(miniCtx, ship, miniCanvas.width / 2, miniCanvas.height / 2, 40, 44, false);
        }
      }, 50);
    });

    // Eventos de selección de nave
    document.querySelectorAll(".btn-select-ship").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const shipId = parseInt(e.currentTarget.getAttribute("data-ship-id"));
        selectedShip = availableShips.find((s) => s.id === shipId) || availableShips[0];
        adsManager.showInterstitial(async () => {
          shipSelectContainer.classList.add("hidden");
          stageSelectContainer.classList.remove("hidden");
          await loadStageSelector();
        }, { force: true, context: "ship_selected" });
      });
    });
  }

  // Persistencia local de progreso de fases para modo invitado y resiliencia offline
  function getLocalStageProgress() {
    try {
      const saved = localStorage.getItem("naves_guest_progress");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      current_max_stage: 1,
      stages: {
        "1": { unlocked: true },
        "2": { unlocked: false },
        "3": { unlocked: false },
        "4": { unlocked: false },
        "5": { unlocked: false }
      }
    };
  }

  function saveLocalStageProgress(prog) {
    try {
      localStorage.setItem("naves_guest_progress", JSON.stringify(prog));
    } catch (_) {}
  }

  // Cargar selector de fases según el progreso real en SQLite o persistencia local
  async function loadStageSelector() {
    let progressData = null;
    try {
      const res = await ApiService.getProgress();
      if (res && res.ok && res.data && res.data.success && res.data.progress) {
        progressData = res.data.progress;
        saveLocalStageProgress(progressData);
      }
    } catch (_) {}

    if (!progressData) {
      progressData = getLocalStageProgress();
    }

    playerProgress = progressData;
    const stagesContainer = document.getElementById("stages-list");
    if (!stagesContainer) return;
    stagesContainer.innerHTML = "";

    const stagesInfo = [
      {
        num: 1,
        title: "Fase 1: Norteamérica a la Antártida",
        desc: "Sobrevuela el continente con mapa de radar dinámico inferior hasta alcanzar los glaciares polares.",
        unlocked: playerProgress && playerProgress.stages && playerProgress.stages["1"] ? playerProgress.stages["1"].unlocked : true
      },
      {
        num: 2,
        title: "Fase 2: Cruce del Océano Pacífico a Australia",
        desc: "Travesía sobre archipiélagos e islas del Pacífico hasta alcanzar la costa australiana.",
        unlocked: playerProgress && playerProgress.stages && playerProgress.stages["2"] ? playerProgress.stages["2"].unlocked : false
      },
      {
        num: 3,
        title: "Fase 3: Travesía a Saturno (Vía Marte y Júpiter)",
        desc: "Despega de la Tierra, rebasa Marte y asteroides, vence a Jovian Core en Júpiter y asalta los anillos de Saturno contra Ganymede Titan.",
        unlocked: playerProgress && playerProgress.stages && playerProgress.stages["3"] ? playerProgress.stages["3"].unlocked : false
      },
      {
        num: 4,
        title: "Fase 4: El Círculo Ártico: De Groenlandia al Polo Norte",
        desc: "Cruza el Círculo Polar a 66°N, el inmenso Inlandis de Groenlandia y la banquisa polar hasta la ciudadela subglacial del Polo Norte (90°N).",
        unlocked: playerProgress && playerProgress.stages && playerProgress.stages["4"] ? playerProgress.stages["4"].unlocked : false
      },
      {
        num: 5,
        title: "Fase 5: Jungla Profunda / Fortaleza del Jefe Final",
        desc: "Zona selvática con vegetación destructible por bombardeo y confrontación con el Boss principal.",
        unlocked: playerProgress && playerProgress.stages && playerProgress.stages["5"] ? playerProgress.stages["5"].unlocked : false
      }
    ];

    stagesInfo.forEach((stage) => {
      const stageCard = document.createElement("div");
      const isLocked = !stage.unlocked;
      const lore = MissionLore[stage.num];

      stageCard.style = isLocked 
        ? "background: rgba(0,0,0,0.3); border: 1px solid #1e293b; border-radius: 12px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; opacity: 0.55; cursor: not-allowed; flex-wrap: wrap; gap: 1rem;"
        : "background: #090e1d; border: 1px solid rgba(0,243,255,0.4); border-radius: 12px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";

      stageCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
          <div style="width: 52px; height: 52px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-weight: bold; font-size: 1.15rem; ${
            isLocked ? "background: #0f172a; color: #475569;" : "background: rgba(0,243,255,0.15); color: #00f3ff; border: 1px solid rgba(0,243,255,0.5);"
          }">
            ${isLocked ? "🔒" : `0${stage.num}`}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span style="font-size: 0.65rem; font-family: monospace; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                ${lore ? lore.operation : `FASE ${stage.num}`}
              </span>
              <span style="font-size: 0.65rem; font-family: monospace; color: ${stage.num === 5 ? '#ff0055' : '#f59e0b'};">
                ${lore ? lore.threatLevel : ''}
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
          ${
            isLocked
              ? `<span style="padding: 0.35rem 0.75rem; font-size: 0.72rem; font-family: monospace; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; border-radius: 6px;">BLOQUEADO</span>`
              : `<button class="btn-cyber-primary btn-launch-stage" style="width: auto; padding: 0.7rem 1.4rem; font-size: 0.78rem;" data-stage="${stage.num}">
                  BRIEFING TÁCTICO ➔
                </button>`
          }
        </div>
      `;

      stagesContainer.appendChild(stageCard);
    });

    let introWatched = false;

    if (btnPlayIntro) {
      btnPlayIntro.addEventListener("click", () => {
        IntroCinema.show(() => {});
      });
    }

    // Renderizado de Holograma Vectorial para Previsualización de Jefes en el Briefing
    function renderBossHologram(canvasId, bossData) {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);

      // Radar holográfico de fondo
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

      // Ajustar escala para centrar la nave
      const scale = Math.min((c.width * 0.68) / bossData.width, (c.height * 0.68) / bossData.height);
      const halfW = (bossData.width * scale) / 2;
      const halfH = (bossData.height * scale) / 2;

      ctx.save();
      ctx.translate(c.width / 2, c.height / 2 + (bossData.isFinalBoss ? 4 : 2));

      // Dibujar modelo vectorial exacto del Jefe / Subjefe de forma protegida
      try {
        BossCatalog.drawBossShip(ctx, bossData, halfW, halfH);
      } catch (err) {
        console.warn("Error renderizando holograma de jefe:", err);
      }

      ctx.restore();
    }

    // Modal de Briefing Táctico
    function openBriefing(stageNum) {
      selectedStage = stageNum;
      const lore = MissionLore[stageNum];
      if (!lore) return;

      // Obtener datos y renderizar hologramas de Sublíder y Jefe Final de la fase
      const midBossData = BossCatalog.getMidBoss(stageNum);
      const stageBossData = BossCatalog.getStageBoss(stageNum);

      document.getElementById("briefing-operation-title").textContent = lore.operation;
      document.getElementById("briefing-classification").textContent = lore.classification;
      document.getElementById("briefing-threat-level").textContent = lore.threatLevel;
      document.getElementById("briefing-lore-text").textContent = lore.lore;
      document.getElementById("briefing-objective").textContent = lore.objective;

      // Detalles específicos de Sublíder y Jefe con sus habilidades personalizadas
      const subBossNameEl = document.getElementById("briefing-subboss-name");
      if (subBossNameEl) subBossNameEl.textContent = midBossData.name;
      const subIntelEl = document.getElementById("briefing-subboss-intel");
      if (subIntelEl) {
        subIntelEl.innerHTML = `<b style="color: #38bdf8;">${midBossData.title}</b><br><span style="color: #94a3b8;">Habilidad:</span> <b style="color: #f1f5f9;">${midBossData.abilityName}</b> — ${midBossData.abilityDesc}`;
      }

      const finalBossNameEl = document.getElementById("briefing-finalboss-name");
      if (finalBossNameEl) finalBossNameEl.textContent = stageBossData.name;
      const finalIntelEl = document.getElementById("briefing-finalboss-intel");
      if (finalIntelEl) {
        finalIntelEl.innerHTML = `<b style="color: #ff0055;">${stageBossData.title}</b><br><span style="color: #94a3b8;">Habilidad:</span> <b style="color: #f1f5f9;">${stageBossData.abilityName}</b> — ${stageBossData.abilityDesc}`;
      }

      renderBossHologram("briefing-subboss-canvas", midBossData);
      renderBossHologram("briefing-finalboss-canvas", stageBossData);

      // Cargar Inteligencia sobre Escuadras Enemigas Progresivas
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
                ${isNewInThisStage ? "⭐ " : "• "}${enemyDef.name}
              </span>
              <div style="display: flex; gap: 0.35rem; align-items: center;">
                ${isNewInThisStage ? `<span style="font-size: 0.6rem; font-family: monospace; color: #38bdf8; background: rgba(56, 189, 248, 0.2); padding: 1px 5px; border-radius: 3px; font-weight: bold;">NUEVA AMENAZA</span>` : ""}
                <span style="font-size: 0.62rem; font-family: monospace; color: ${enemyDef.badgeColor}; background: rgba(0,0,0,0.5); padding: 1px 5px; border-radius: 3px;">
                  ${enemyDef.badge}
                </span>
              </div>
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1; font-family: 'Rajdhani', sans-serif;">
              <b style="color: #f1f5f9;">Habilidad:</b> ${enemyDef.abilityName} — <span style="color: #94a3b8;">${enemyDef.abilityDesc}</span>
            </div>
          `;
          listEl.appendChild(item);
        });
      }



      const scrollBody = briefingModal.querySelector(".modal-scrollable-body");
      if (scrollBody) {
        scrollBody.scrollTop = 0;
      }

      briefingModal.classList.remove("hidden");
    }

    // Permitir scrollear el contenido desde cualquier punto del modal de briefing sin trabas
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
        adsManager.showInterstitial(() => {
          openBriefing(stageNum);
        }, { force: true, context: "stage_selected" });
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
        btnBriefingLaunch.textContent = "🚀 CONFIRMAR Y DESPEGAR";
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
        // Despegue directo sin interrumpir con anuncios el inicio del combate
        finalizeMissionLaunch();
      });
    }
  }

  // Iniciar la misión de combate en el Canvas 60 FPS
  function startMission(ship, stageNumber, runState = null) {
    try {
      const shipToUse = ship || selectedShip || (availableShips && availableShips.length > 0 ? availableShips[0] : DEFAULT_SHIPS[0]);
      selectedShip = shipToUse;
      adsManager.markMissionStart();
      battleContainer.classList.remove("hidden");
      if (hudShipName) hudShipName.textContent = (shipToUse.name || "PHOENIX VANGUARD").toUpperCase();
      const elStageBadge = document.getElementById("hud-stage-badge");
      if (elStageBadge) elStageBadge.textContent = `FASE ${stageNumber}`;
      if (canvas) {
        if (!canvas.width || canvas.width === 0) canvas.width = 800;
        if (!canvas.height || canvas.height === 0) canvas.height = 600;
      }
      engine.start(shipToUse, stageNumber, currentUser ? currentUser.username : "PILOTO", runState);

      // Centrar automáticamente la pantalla de combate para eliminar el desplazamiento incómodo
      requestAnimationFrame(() => {
        battleContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (err) {
      console.error("[startMission Critical Error]", err);
      try {
        engine.start(DEFAULT_SHIPS[0], stageNumber || 1, "PILOTO", runState);
      } catch (_) {}
    }
  }

  // Leaderboard Modal
  btnOpenLeaderboard.addEventListener("click", async () => {
    leaderboardModal.classList.remove("hidden");
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-gray-500">Consultando registros del cuartel general...</td></tr>`;

    const res = await ApiService.getLeaderboard(15);
    if (!res.ok || !res.data.success) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-red-400">Error al cargar leaderboard.</td></tr>`;
      return;
    }

    if (res.data.leaderboard.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-gray-400">Aún no hay puntuaciones registradas en el ranking. ¡Sé el primer piloto en la clasificación!</td></tr>`;
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
        <td class="py-3 px-3 text-gray-400">Fase ${entry.stage_reached} ${entry.victory ? "🏆 (Victoria)" : ""}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  btnCloseLeaderboard.addEventListener("click", () => {
    leaderboardModal.classList.add("hidden");
  });

  // Modal de Ayuda & Manual Táctico Desplegable
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

  // --- SISTEMA DE RECOMENDACIÓN Y DIFUSIÓN EN REDES SOCIALES ---
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

  // Bono táctico de +5 VIDAS otorgado al compartir (con recarga de 24h)
  window.addEventListener("naves:lives-rewarded", (e) => {
    const added = e.detail ? e.detail.livesAdded : 5;
    if (engine && engine.isRunning) {
      engine.addLives(added);
    }
    if (activeRunSession) {
      activeRunSession.lives = (activeRunSession.lives || 3) + added;
    }
    const elLives = document.getElementById("stat-lives");
    const bonus = (typeof localStorage !== "undefined") ? parseInt(localStorage.getItem("naves_bonus_lives") || "0", 10) : 0;
    if (elLives) elLives.textContent = 3 + bonus;
    socialShare.updateLobbyBannerRewardStatus();
  });
});

