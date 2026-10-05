import { ApiService } from "./api.js";
import { GameEngine } from "./engine.js";
import { ShipRenderer } from "./ship_renderer.js";
import { IntroCinema } from "./intro_cinema.js";
import { MissionLore } from "./mission_lore.js";
import { Sound } from "./sound_fx.js";
import { ADS_CONFIG, renderGoogleAd } from "./ads_config.js";

document.addEventListener("DOMContentLoaded", () => {
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

  // --- CONTROLES DE AUDIO (WEB AUDIO API) ---
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener("click", () => {
      const isMuted = Sound.toggleMute();
      btnAudioToggle.textContent = isMuted ? "🔇 SFX: OFF" : "🔊 SFX: ON";
      btnAudioToggle.style.color = isMuted ? "#94a3b8" : "#00f3ff";
    });
  }

  let musicActive = true;
  if (btnMusicToggle) {
    btnMusicToggle.addEventListener("click", () => {
      musicActive = !musicActive;
      Sound.setMusicEnabled(musicActive);
      btnMusicToggle.textContent = musicActive ? "🎵 MÚSICA: ON" : "🔇 MÚSICA: OFF";
      btnMusicToggle.style.color = musicActive ? "#00f3ff" : "#94a3b8";
    });
  }

  // --- CONTROL ROBUSTO DE PANTALLA COMPLETA HÍBRIDA ---
  function updateFullscreenButtons(isFs) {
    if (btnFullscreenHeader) {
      btnFullscreenHeader.textContent = isFs ? "🗗 SALIR PANTALLA [F]" : "⛶ PANTALLA COMPLETA [F]";
    }
    if (btnBattleFullscreen) {
      btnBattleFullscreen.textContent = isFs ? "🗗 SALIR [F]" : "⛶ PANTALLA COMPLETA [F]";
    }
    if (btnFloatingFullscreen) {
      // Remover cualquier botón flotante duplicado residual
      const extraFloating = document.querySelectorAll(".floating-fullscreen-btn, #btn-floating-fullscreen");
      if (extraFloating.length > 1) {
        for (let i = 1; i < extraFloating.length; i++) extraFloating[i].remove();
      }

      btnFloatingFullscreen.innerHTML = isFs ? "<span>🗗</span> SALIR PANTALLA [F]" : "<span>⛶</span> EXPANDIR JUEGO [F]";
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
  let availableShips = [];
  let selectedShip = null;
  let playerProgress = null;
  let selectedStage = 1;
  let engine = null;
  let currentUser = null;

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
    onGameOver: (stats) => {
      document.getElementById("go-score").textContent = stats.score.toLocaleString();
      document.getElementById("go-enemies").textContent = stats.enemies;
      document.getElementById("go-bosses").textContent = stats.bosses;
      gameOverModal.classList.remove("hidden");
      loadPilotStats();
    },
    onStageVictory: (stats) => {
      const isFinal = stats.isCampaignVictory || stats.stageCompleted === 5;
      const elTitle = document.getElementById("vic-title");
      const elUnlocked = document.getElementById("vic-unlocked-msg");
      const elEpilogue = document.getElementById("vic-epilogue-box");
      const nextStageNum = stats.stageCompleted + 1;
      selectedStage = stats.stageCompleted; // Registrar fase superada

      document.getElementById("vic-score").textContent = stats.score.toLocaleString();
      document.getElementById("vic-enemies").textContent = stats.enemies;
      document.getElementById("vic-bosses").textContent = stats.bosses;

      if (isFinal) {
        if (elTitle) elTitle.textContent = "🏆 ¡VICTORIA TOTAL: CAMPAÑA CONQUISTADA!";
        document.getElementById("vic-stage").textContent = "GENERAL VEKTOR DERROTADO · TODAS LAS ÁREAS SUPERADAS AL 100%";
        if (elUnlocked) elUnlocked.textContent = "✔ ¡Felicidades comandante! Campaña militar completada y guardada en SQLite.";
        if (elEpilogue) elEpilogue.classList.remove("hidden");
        btnNextStageVictory.style.display = "none";
        btnHangarVictory.textContent = "🎖️ REGRESAR AL HANGAR CON HONORES";
        btnHangarVictory.className = "btn-cyber-primary";
      } else {
        if (elTitle) elTitle.textContent = `🎖️ ¡ÁREA ${stats.stageCompleted} SUPERADA!`;
        document.getElementById("vic-stage").textContent = `¡JEFE PRINCIPAL ABATIDO! ÁREA ${stats.stageCompleted} DESPEJADA ➔ LISTO PARA FASE ${nextStageNum}`;
        if (elUnlocked) elUnlocked.textContent = `✔ Área ${stats.stageCompleted} superada con éxito. Fase ${nextStageNum} desbloqueada en SQLite.`;
        if (elEpilogue) elEpilogue.classList.add("hidden");
        btnNextStageVictory.style.display = "block";
        btnNextStageVictory.textContent = `🚀 DESPLEGAR A LA FASE ${nextStageNum} ➔`;
        btnHangarVictory.textContent = "MAPA DE OPERACIONES";
        btnHangarVictory.className = "btn-cyber-outline";
      }

      victoryModal.classList.remove("hidden");
      loadPilotStats();
    }
  });

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
  });

  btnBackToShips.addEventListener("click", () => {
    stageSelectContainer.classList.add("hidden");
    shipSelectContainer.classList.remove("hidden");
  });

  // Salir del combate y volver al hangar
  btnExitBattle.addEventListener("click", () => {
    if (confirm("¿Deseas abortar la misión de combate y regresar al hangar?")) {
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

  // Reintentar tras derrota
  btnRestartFromGameOver.addEventListener("click", () => {
    gameOverModal.classList.add("hidden");
    startMission(selectedShip, selectedStage);
  });

  btnHangarFromGameOver.addEventListener("click", () => {
    gameOverModal.classList.add("hidden");
    battleContainer.classList.add("hidden");
    lobbyContainer.classList.remove("hidden");
    loadPilotStats();
  });

  // Continuar y ubicar directamente en la siguiente fase tras victoria
  btnNextStageVictory.addEventListener("click", () => {
    victoryModal.classList.add("hidden");
    if (selectedStage < 5) {
      selectedStage++;
      startMission(selectedShip, selectedStage);
    } else {
      battleContainer.classList.add("hidden");
      stageSelectContainer.classList.remove("hidden");
      loadStages();
    }
  });

  btnHangarVictory.addEventListener("click", () => {
    victoryModal.classList.add("hidden");
    battleContainer.classList.add("hidden");
    stageSelectContainer.classList.remove("hidden");
    loadStages();
  });

  // Cargar las 5 naves desde SQLite mediante API
  async function loadShips() {
    const res = await ApiService.getShips();
    if (!res.ok || !res.data.success) {
      alert("Error al cargar naves desde la base de datos.");
      return;
    }

    availableShips = res.data.ships;
    const shipsGrid = document.getElementById("ships-grid");
    shipsGrid.innerHTML = "";

    availableShips.forEach((ship, idx) => {
      const card = document.createElement("div");
      card.className = "ship-card";

      // Renderizar mini canvas con la nave
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
      btn.addEventListener("click", async (e) => {
        const shipId = parseInt(e.currentTarget.getAttribute("data-ship-id"));
        selectedShip = availableShips.find((s) => s.id === shipId);
        shipSelectContainer.classList.add("hidden");
        stageSelectContainer.classList.remove("hidden");
        await loadStageSelector();
      });
    });
  }

  // Cargar selector de fases según el progreso real en SQLite
  async function loadStageSelector() {
    const res = await ApiService.getProgress();
    if (!res.ok || !res.data.success) {
      alert("Error al cargar progreso del piloto.");
      return;
    }

    playerProgress = res.data.progress;
    const stagesContainer = document.getElementById("stages-list");
    stagesContainer.innerHTML = "";

    const stagesInfo = [
      {
        num: 1,
        title: "Fase 1: Norteamérica a la Antártida",
        desc: "Sobrevuela el continente con mapa de radar dinámico inferior hasta alcanzar los glaciares polares.",
        unlocked: playerProgress.stages["1"].unlocked
      },
      {
        num: 2,
        title: "Fase 2: Cruce del Océano Pacífico a Australia",
        desc: "Travesía sobre archipiélagos e islas del Pacífico hasta alcanzar la costa australiana.",
        unlocked: playerProgress.stages["2"].unlocked
      },
      {
        num: 3,
        title: "Fase 3: Éxodo Orbital hacia Júpiter",
        desc: "Despegue gravitatorio desde la Tierra observando la aproximación dimensional al gigante gaseoso.",
        unlocked: playerProgress.stages["3"].unlocked
      },
      {
        num: 4,
        title: "Fase 4: Territorio Criogénico / Sector de Hielo",
        desc: "Tormenta de hielo polar con ventiscas y defensas congeladas de alta resistencia.",
        unlocked: playerProgress.stages["4"].unlocked
      },
      {
        num: 5,
        title: "Fase 5: Jungla Profunda / Fortaleza del Jefe Final",
        desc: "Zona selvática con vegetación destructible por bombardeo y confrontación con el Boss principal.",
        unlocked: playerProgress.stages["5"].unlocked
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

    // Modal de Briefing Táctico
    function openBriefing(stageNum) {
      selectedStage = stageNum;
      const lore = MissionLore[stageNum];
      if (!lore) return;

      document.getElementById("briefing-operation-title").textContent = lore.operation;
      document.getElementById("briefing-classification").textContent = lore.classification;
      document.getElementById("briefing-threat-level").textContent = lore.threatLevel;
      document.getElementById("briefing-lore-text").textContent = lore.lore;
      document.getElementById("briefing-objective").textContent = lore.objective;
      document.getElementById("briefing-subboss-intel").textContent = lore.intel.subBoss;
      document.getElementById("briefing-finalboss-intel").textContent = lore.intel.finalBoss;

      // Cargar y mostrar anuncio Google AdSense configurado
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

      briefingModal.classList.remove("hidden");
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
          startMission(selectedShip, selectedStage);
        });
      } else {
        startMission(selectedShip, selectedStage);
      }
    }

    if (btnBriefingLaunch) {
      btnBriefingLaunch.addEventListener("click", () => {
        if (isLaunching) {
          // Si el jugador hace clic de nuevo durante la cuenta regresiva, salta inmediatamente
          finalizeMissionLaunch();
          return;
        }

        const countdownSeconds = ADS_CONFIG.COUNTDOWN_SECONDS || 0;
        if (countdownSeconds <= 0) {
          finalizeMissionLaunch();
          return;
        }

        isLaunching = true;
        let secondsLeft = countdownSeconds;
        const countdownEl = document.getElementById("ad-launch-countdown");
        const secondsEl = document.getElementById("ad-seconds-left");

        if (countdownEl) countdownEl.style.display = "inline";
        if (secondsEl) secondsEl.textContent = secondsLeft;
        btnBriefingLaunch.textContent = `🚀 DESPEGANDO (${secondsLeft}s)... [SALTAR]`;
        btnBriefingLaunch.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";

        launchTimer = setInterval(() => {
          secondsLeft--;
          if (secondsEl) secondsEl.textContent = secondsLeft;
          if (secondsLeft > 0) {
            btnBriefingLaunch.textContent = `🚀 DESPEGANDO (${secondsLeft}s)... [SALTAR]`;
          } else {
            finalizeMissionLaunch();
          }
        }, 1000);
      });
    }
  }

  // Iniciar la misión de combate en el Canvas 60 FPS
  function startMission(ship, stageNumber) {
    battleContainer.classList.remove("hidden");
    hudShipName.textContent = ship.name.toUpperCase();
    const elStageBadge = document.getElementById("hud-stage-badge");
    if (elStageBadge) elStageBadge.textContent = `FASE ${stageNumber}`;
    engine.start(ship, stageNumber, currentUser ? currentUser.username : "PILOTO");

    // Centrar automáticamente la pantalla de combate para eliminar el desplazamiento incómodo
    requestAnimationFrame(() => {
      battleContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Leaderboard Modal
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
      tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs font-mono text-gray-400">Aún no hay puntuaciones registradas en SQLite. ¡Sé el primer piloto en el ranking!</td></tr>`;
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
});
