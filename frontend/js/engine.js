import { ShipRenderer } from "./ship_renderer.js";
import { ScenarioRenderer } from "./scenario_renderer.js";
import { BossCatalog } from "./bosses.js";
import { EnemyCatalog } from "./enemies.js";
import { ApiService } from "./api.js";
import { Sound } from "./sound_fx.js";

export class GameEngine {
  constructor(canvas, hudElements) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hud = hudElements;

    this.ship = null;
    this.currentStage = 1;
    this.pilot = "PILOTO";

    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;

    // Renderizador de escenarios dinámicos y terreno destructible
    this.scenario = new ScenarioRenderer(this.canvas);

    // Estado del Jugador
    this.player = {
      x: canvas.width / 2,
      y: canvas.height - 80,
      width: 44,
      height: 48,
      health: 100,
      maxHealth: 100,
      speed: 6.0,
      isSpecialActive: false,
      specialTimer: 0,
      specialCooldownTimer: 0,
      lastShotTime: 0,
      weaponLevel: 1,
      upgradeHitsReceived: 0
    };

    // Munición de bombas tácticas y destello de detonación
    this.bombs = 1;
    this.bombFlash = 0;

    // Colecciones de Entidades
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.screenShake = 0;
    this.criticalAlarmTimer = 0;

    // Estadísticas y Progresión de la Fase
    this.score = 0;
    this.enemiesDestroyed = 0;
    this.bossesDefeated = 0;
    this.stageDistance = 0;
    this.stageTargetDistance = 1800;
    this.midBossSpawned = false;
    this.finalBossSpawned = false;
    this.mainBossDefeated = false;
    this.activeBoss = null;

    // Entradas
    this.keys = {};
    this.setupInputs();
  }

  setupInputs() {
    window.addEventListener("keydown", (e) => {
      // Bloquear scroll molesto del navegador mientras se pilota la nave
      if (this.isRunning) {
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
          e.preventDefault();
        }
        if (e.code === "KeyF") {
          e.preventDefault();
          this.toggleFullscreen();
        }
      }

      this.keys[e.code] = true;
      if (e.code === "KeyP") {
        this.togglePause();
      }
      if (e.code === "KeyE" || e.code === "ShiftLeft") {
        this.activateSpecialAbility();
      }
      if (e.code === "KeyB" || e.code === "KeyX") {
        this.triggerBomb();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isRunning || this.isPaused) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      this.player.x += (mouseX - this.player.x) * 0.18;
      this.player.y += (mouseY - this.player.y) * 0.18;
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.keys["Space"] = true;
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        this.keys["Space"] = false;
      }
    });

    // --- CONTROLES TÁCTILES ULTRA-FLUIDOS PARA MÓVILES Y TABLETS ---
    let isTouching = false;
    let lastTouchX = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e) => {
      if (!this.isRunning || this.isPaused) return;
      e.preventDefault();
      isTouching = true;

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      lastTouchX = (touch.clientX - rect.left) * scaleX;
      lastTouchY = (touch.clientY - rect.top) * scaleY;

      // Disparo automático continuo al tocar
      this.keys["Space"] = true;
    };

    const handleTouchMove = (e) => {
      if (!this.isRunning || this.isPaused || !isTouching) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const currentX = (touch.clientX - rect.left) * scaleX;
      const currentY = (touch.clientY - rect.top) * scaleY;

      // Movimiento delta relativo: permite maniobrar en cualquier parte de la pantalla
      // con máxima precisión sin que el dedo cubra la nave
      const deltaX = (currentX - lastTouchX) * 1.25;
      const deltaY = (currentY - lastTouchY) * 1.25;

      this.player.x += deltaX;
      this.player.y += deltaY;

      // Restricción dentro de los límites del canvas
      this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
      this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));

      lastTouchX = currentX;
      lastTouchY = currentY;
      this.keys["Space"] = true;
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        isTouching = false;
        this.keys["Space"] = false;
      }
    };

    this.canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    this.canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    this.canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    this.canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
  }

  toggleFullscreen() {
    const battle = document.getElementById("battle-container") || document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (battle.requestFullscreen) {
        battle.requestFullscreen().catch(err => {
          console.warn("[Pantalla Completa]", err);
        });
      } else if (battle.webkitRequestFullscreen) {
        battle.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  start(shipData, stageNumber = 1, pilotName = "PILOTO") {
    document.body.classList.add("battle-locked");
    this.ship = shipData;
    this.currentStage = stageNumber;
    this.pilot = pilotName;

    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 90;
    this.player.maxHealth = shipData.stats.max_health;
    this.player.health = shipData.stats.max_health;
    this.player.speed = shipData.stats.speed;
    this.player.isSpecialActive = false;
    this.player.specialTimer = 0;
    this.player.specialCooldownTimer = 0;
    this.player.lastShotTime = 0;
    this.player.weaponLevel = 1;
    this.player.upgradeHitsReceived = 0;

    this.bombs = 1;
    this.bombFlash = 0;

    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.screenShake = 0;
    this.criticalAlarmTimer = 0;
    this.score = 0;
    this.enemiesDestroyed = 0;
    this.bossesDefeated = 0;
    this.stageDistance = 0;
    this.midBossSpawned = false;
    this.finalBossSpawned = false;
    this.mainBossDefeated = false;
    this.activeBoss = null;
    this.stageBannerTimer = 3.5;
    this.updateHudWeaponAndBombs();

    // Reinicializar terreno para la fase correspondiente
    if (stageNumber === 5) {
      this.scenario.initJungle();
    } else if (stageNumber === 2) {
      this.scenario.initIslands();
    } else if (stageNumber === 4) {
      this.scenario.initSnow();
    }

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    Sound.startMusic();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.loop(performance.now());
  }

  stop() {
    this.isRunning = false;
    Sound.stopMusic();
    document.body.classList.remove("battle-locked");
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now();
      this.loop(performance.now());
    }
  }

  activateSpecialAbility() {
    if (!this.isRunning || this.isPaused || this.player.isSpecialActive) return;
    if (this.player.specialCooldownTimer > 0) return;

    this.player.isSpecialActive = true;
    this.player.specialTimer = this.ship.special.duration_seconds;
    this.player.specialCooldownTimer = this.ship.special.cooldown_seconds;

    Sound.playSpecialAbility();

    // Efectos tácticos y de destrucción ambiental en suelo selvático
    if (this.ship.special.slug === "emp_blast") {
      this.triggerEMPBlast();
      if (this.currentStage === 5) {
        for (let i = 0; i < 5; i++) {
          this.scenario.addGroundExplosion(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            50
          );
        }
      }
    } else if (this.ship.special.slug === "orbital_bombardment" && this.currentStage === 5) {
      for (let i = 0; i < 8; i++) {
        this.scenario.addGroundExplosion(
          this.player.x + (Math.random() * 140 - 70),
          Math.random() * this.canvas.height,
          60
        );
      }
    }

    this.createExplosionParticles(this.player.x, this.player.y, "#00f3ff", 28);
  }

  triggerEMPBlast() {
    this.enemyProjectiles = [];
    this.enemies.forEach((enemy) => {
      if (enemy.shield && enemy.shield > 0) {
        enemy.shield = 0;
        this.addFloatingText(enemy.x, enemy.y - 14, "¡ESCUDO ANULADO!", "#38bdf8");
      }
      enemy.health -= 70;
      this.createExplosionParticles(enemy.x, enemy.y, "#ff0055", 16);
    });
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    if (this.isPaused) {
      this.drawPauseOverlay();
      return;
    }

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const distanceRatio = Math.min(1.0, this.stageDistance / this.stageTargetDistance);

    // Reducción gradual de sacudida de pantalla
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 25 * dt);
    }

    // Alarma de salud crítica (< 28% HP)
    if (this.player.health > 0 && this.player.health / this.player.maxHealth < 0.28) {
      this.criticalAlarmTimer += dt;
      if (this.criticalAlarmTimer >= 0.8) {
        this.criticalAlarmTimer = 0;
        Sound.playCriticalAlarm();
      }
    } else {
      this.criticalAlarmTimer = 0;
    }

    this.scenario.update(dt, this.currentStage, distanceRatio);
    this.updatePlayer(dt);
    this.updateProjectiles(dt);
    this.updateEnemies(dt, distanceRatio);
    this.updatePowerups(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.updateShockwaves(dt);
    this.updateHUD(distanceRatio);

    if (this.stageBannerTimer > 0) {
      this.stageBannerTimer = Math.max(0, this.stageBannerTimer - dt);
    }

    // Condición de derrota
    if (this.player.health <= 0) {
      this.handleGameOver();
    }
    // Condición de victoria de respaldo si no se activó por el jefe
    else if (!this.mainBossDefeated && this.finalBossSpawned && this.enemies.filter(e => e.isBoss).length === 0 && distanceRatio >= 0.95) {
      this.handleStageVictory();
    }
  }

  updatePlayer(dt) {
    let speed = this.player.speed * (this.player.isSpecialActive && this.ship.special.slug === "overdrive_ghost" ? 1.6 : 1.0);
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) this.player.y -= speed;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) this.player.y += speed;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) this.player.x -= speed;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) this.player.x += speed;

    this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
    this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));

    // Estela de plasma de los propulsores
    if (Math.random() < 0.65) {
      this.particles.push({
        x: this.player.x + (Math.random() * 8 - 4),
        y: this.player.y + this.player.height / 2 - 4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 3 + 2.5,
        size: Math.random() * 2.5 + 1.2,
        color: this.player.isSpecialActive ? "#00f3ff" : "#f59e0b",
        life: 0.22,
        maxLife: 0.22
      });
    }

    if (this.player.isSpecialActive) {
      this.player.specialTimer -= dt;
      if (this.player.specialTimer <= 0) {
        this.player.isSpecialActive = false;
        this.player.specialTimer = 0;
      }
    } else if (this.player.specialCooldownTimer > 0) {
      this.player.specialCooldownTimer -= dt;
      if (this.player.specialCooldownTimer < 0) {
        this.player.specialCooldownTimer = 0;
      }
    }

    if (this.keys["Space"]) {
      this.fireWeapon();
    }

    if (this.player.isSpecialActive && this.ship.special.slug === "micromissile_swarm") {
      if (Math.random() < 0.3) {
        this.fireHomingMicroMissile();
      }
    }

    // El avance de distancia solo progresa en vuelo libre (se pausa durante el combate con Sublíder o Boss)
    const hasActiveBoss = this.enemies.some(e => e.isBoss);
    if (!hasActiveBoss && !this.mainBossDefeated) {
      this.stageDistance += 28 * dt;
    }
  }

  fireWeapon() {
    const now = performance.now();
    let fireRate = this.ship.weapon.fire_rate_ms;
    if (this.player.isSpecialActive && this.ship.special.slug === "overdrive_ghost") {
      fireRate *= 0.5;
    }
    const lvl = this.player.weaponLevel;
    if (lvl === 2) fireRate *= 0.85;
    if (lvl >= 3) fireRate *= 0.72;

    if (now - this.player.lastShotTime < fireRate) return;
    this.player.lastShotTime = now;

    const wType = this.ship.weapon.type;
    let dmg = this.ship.weapon.damage;
    if (lvl === 2) dmg = Math.round(dmg * 1.35);
    if (lvl >= 3) dmg = Math.round(dmg * 1.75);

    if (wType === "heavy_plasma" || wType === "wave_cannon") {
      Sound.playHeavyShot();
    } else if (wType === "beam_laser") {
      Sound.playBeam();
    } else {
      Sound.playLaser();
    }

    switch (wType) {
      case "twin_laser":
        this.projectiles.push({ x: this.player.x - 12, y: this.player.y - 20, vx: 0, vy: -14, height: 16, damage: dmg, weaponType: wType });
        this.projectiles.push({ x: this.player.x + 12, y: this.player.y - 20, vx: 0, vy: -14, height: 16, damage: dmg, weaponType: wType });
        if (lvl >= 2) {
          this.projectiles.push({ x: this.player.x - 22, y: this.player.y - 14, vx: -1.6, vy: -13.5, height: 14, damage: Math.round(dmg * 0.85), weaponType: wType });
          this.projectiles.push({ x: this.player.x + 22, y: this.player.y - 14, vx: 1.6, vy: -13.5, height: 14, damage: Math.round(dmg * 0.85), weaponType: wType });
        }
        if (lvl >= 3) {
          this.projectiles.push({ x: this.player.x - 30, y: this.player.y - 8, vx: -3.2, vy: -13, height: 14, damage: Math.round(dmg * 0.75), weaponType: wType });
          this.projectiles.push({ x: this.player.x + 30, y: this.player.y - 8, vx: 3.2, vy: -13, height: 14, damage: Math.round(dmg * 0.75), weaponType: wType });
        }
        break;

      case "heavy_plasma":
        if (lvl === 1) {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 24, vx: 0, vy: -10, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
        } else if (lvl === 2) {
          this.projectiles.push({ x: this.player.x - 14, y: this.player.y - 22, vx: -0.6, vy: -10.5, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x + 14, y: this.player.y - 22, vx: 0.6, vy: -10.5, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
        } else {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 26, vx: 0, vy: -11, height: 22, damage: Math.round(dmg * 1.2), weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x - 20, y: this.player.y - 20, vx: -1.2, vy: -10, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x + 20, y: this.player.y - 20, vx: 1.2, vy: -10, height: 18, damage: dmg, weaponType: wType, isHeavy: true });
        }
        break;

      case "triple_spread":
        if (lvl === 1) {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 20, vx: 0, vy: -12, height: 12, damage: dmg, weaponType: wType });
          this.projectiles.push({ x: this.player.x - 10, y: this.player.y - 18, vx: -3, vy: -11, height: 12, damage: dmg, weaponType: wType });
          this.projectiles.push({ x: this.player.x + 10, y: this.player.y - 18, vx: 3, vy: -11, height: 12, damage: dmg, weaponType: wType });
        } else if (lvl === 2) {
          [-4, -2, 0, 2, 4].forEach(vx => {
            this.projectiles.push({ x: this.player.x + vx * 4, y: this.player.y - 20, vx, vy: -12, height: 12, damage: Math.round(dmg * 0.9), weaponType: wType });
          });
        } else {
          [-6, -4, -2, 0, 2, 4, 6].forEach(vx => {
            this.projectiles.push({ x: this.player.x + vx * 3.5, y: this.player.y - 20, vx, vy: -12.5, height: 13, damage: Math.round(dmg * 0.85), weaponType: wType });
          });
        }
        break;

      case "wave_cannon":
        if (lvl === 1) {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 22, vx: 0, vy: -9, height: 12, damage: dmg, weaponType: wType, isHeavy: true });
        } else if (lvl === 2) {
          this.projectiles.push({ x: this.player.x - 12, y: this.player.y - 22, vx: -0.8, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x + 12, y: this.player.y - 22, vx: 0.8, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
        } else {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 24, vx: 0, vy: -10, height: 16, damage: Math.round(dmg * 1.15), weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x - 18, y: this.player.y - 20, vx: -1.5, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x + 18, y: this.player.y - 20, vx: 1.5, vy: -9.5, height: 14, damage: dmg, weaponType: wType, isHeavy: true });
        }
        break;

      case "beam_laser":
      default:
        if (lvl === 1) {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 28, vx: 0, vy: -18, height: 32, damage: dmg, weaponType: wType, isHeavy: true });
        } else if (lvl === 2) {
          this.projectiles.push({ x: this.player.x - 10, y: this.player.y - 28, vx: 0, vy: -18, height: 36, damage: dmg, weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x + 10, y: this.player.y - 28, vx: 0, vy: -18, height: 36, damage: dmg, weaponType: wType, isHeavy: true });
        } else {
          this.projectiles.push({ x: this.player.x, y: this.player.y - 30, vx: 0, vy: -19, height: 40, damage: Math.round(dmg * 1.25), weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x - 16, y: this.player.y - 26, vx: -0.6, vy: -18, height: 34, damage: dmg, weaponType: wType, isHeavy: true });
          this.projectiles.push({ x: this.player.x + 16, y: this.player.y - 26, vx: 0.6, vy: -18, height: 34, damage: dmg, weaponType: wType, isHeavy: true });
        }
        break;
    }
  }

  fireHomingMicroMissile() {
    Sound.playBeam();
    let target = this.enemies[0];
    let vx = (Math.random() - 0.5) * 4;
    let vy = -8;

    if (target) {
      const angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
      vx = Math.cos(angle) * 10;
      vy = Math.sin(angle) * 10;
    }

    this.projectiles.push({
      x: this.player.x + (Math.random() - 0.5) * 20,
      y: this.player.y - 15,
      vx,
      vy,
      height: 9,
      damage: 24,
      weaponType: "twin_laser",
      isHeavy: true
    });
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;

      // En la Fase 5, proyectiles pesados causan destrucción de árboles en tierra
      if (this.currentStage === 5 && p.isHeavy && Math.random() < 0.08) {
        this.scenario.addGroundExplosion(p.x, p.y, 35);
      }

      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (dist < (enemy.width / 2 + 10)) {
          hit = true;

          if (enemy.isBoss) {
            enemy.health -= p.damage;
            this.createHitSparks(p.x, p.y, "#00f3ff");
          } else {
            EnemyCatalog.handleDamage(enemy, p.damage, this, p.x, p.y);
          }

          // Destrucción de tierra donde impactó la explosión
          if (this.currentStage === 5) {
            this.scenario.addGroundExplosion(enemy.x, enemy.y, 40);
          }

          if (enemy.health <= 0) {
            this.handleEnemyDefeated(enemy, j);
          }
          break;
        }
      }

      if (hit || p.y < -30 || p.x < -30 || p.x > this.canvas.width + 30) {
        this.projectiles.splice(i, 1);
      }
    }

    // Proyectiles hostiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx;
      ep.y += ep.vy;

      // Homing Torpedo: corrección lateral buscando la coordenada X de la nave del jugador
      if (ep.isHoming && this.player && this.player.health > 0) {
        const dx = this.player.x - ep.x;
        ep.vx += Math.sign(dx) * 0.12;
        ep.vx = Math.max(-2.8, Math.min(2.8, ep.vx));
      }

      const hitRadius = (ep.radius || 4.5) + (this.player.width / 2) * 0.55;
      const dist = Math.hypot(ep.x - this.player.x, ep.y - this.player.y);
      if (dist < hitRadius) {
        if (!this.player.isSpecialActive || this.ship.special.slug !== "shield_matrix") {
          this.player.health -= ep.damage;
          Sound.playPlayerDamage();
          this.createHitSparks(this.player.x, this.player.y, ep.color || "#ef4444");
          this.onPlayerHit();
        } else {
          Sound.playBeam();
          this.createHitSparks(ep.x, ep.y, "#00f3ff");
        }
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (ep.y > this.canvas.height + 40 || ep.y < -50 || ep.x < -40 || ep.x > this.canvas.width + 40) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }

  updateEnemies(dt, distanceRatio) {
    const hasBoss = this.enemies.some(e => e.isBoss);

    // 1. Spawning de Sublíder al 40% (en cada una de las 5 fases)
    if (!this.midBossSpawned && distanceRatio >= 0.40 && !hasBoss) {
      this.spawnMidBoss();
    }

    // 2. Spawning de Boss Final de Área al 85%
    if (!this.finalBossSpawned && distanceRatio >= 0.85 && !hasBoss) {
      this.spawnFinalBoss();
    }

    // Generar cazas menores solo si no hay Boss ni Sublíder activo
    if (!hasBoss && Math.random() < 0.038 && this.enemies.length < 7) {
      this.spawnStandardEnemy();
    }

    // Actualizar IA de enemigos y jefes
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.isBoss) {
        this.activeBoss = enemy;
        // Movimiento de patrulla táctica del Jefe / Subjefe
        if (enemy.y < 125) {
          enemy.y += enemy.vy;
        } else {
          enemy.x = this.canvas.width / 2 + Math.sin(performance.now() * 0.0018) * (this.canvas.width * 0.35);
          enemy.y = 125 + Math.sin(performance.now() * 0.0024) * 14;
        }

        // Patrón de disparo del Jefe
        enemy.lastShotTime = (enemy.lastShotTime || 0) + dt;
        if (enemy.lastShotTime > enemy.shootInterval) {
          enemy.lastShotTime = 0;
          this.fireBossSalvo(enemy);
        }
      } else {
        // Cazas estándar y naves de asalto de escuadra táctica
        EnemyCatalog.updateEnemyAI(
          enemy,
          dt,
          this.player,
          this.enemyProjectiles,
          this
        );

        // Colisión de caza contra la nave del jugador
        const colDist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        if (colDist < (enemy.width / 2 + this.player.width / 2)) {
          if (!this.player.isSpecialActive || this.ship.special.slug !== "shield_matrix") {
            const crashDmg = enemy.isFormidable ? 30 : 20;
            this.player.health -= crashDmg;
            Sound.playPlayerDamage();
            this.createHitSparks(this.player.x, this.player.y, "#ef4444");
            this.onPlayerHit();
          }
          this.handleEnemyDefeated(enemy, i);
          continue;
        }

        if (enemy.y > this.canvas.height + 60) {
          this.enemies.splice(i, 1);
        }
      }
    }

    if (!hasBoss) {
      this.activeBoss = null;
    }
  }

  fireBossSalvo(boss) {
    BossCatalog.fireBossAttack(boss, this.player, this.enemyProjectiles, this);
  }

  spawnStandardEnemy() {
    const enemy = EnemyCatalog.createEnemy(this.currentStage, this.canvas.width);
    this.enemies.push(enemy);
  }

  spawnMidBoss() {
    this.midBossSpawned = true;
    Sound.playBossAlarm();
    this.screenShake = 18;
    const midBossData = BossCatalog.getMidBoss(this.currentStage);
    this.enemies.push({
      ...midBossData,
      isBoss: true,
      isSubBoss: true,
      isFinalBoss: false,
      x: this.canvas.width / 2,
      y: -75
    });

    // Anuncio visible en pantalla de intercepción de Sublíder
    this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 40, `⚠️ ¡ALERTA: SUBLÍDER DETECTADO!`, "#fbbf24");
    this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 10, midBossData.name, midBossData.color || "#38bdf8");
  }

  spawnFinalBoss() {
    this.finalBossSpawned = true;
    Sound.playBossAlarm();
    this.screenShake = 24;
    const bossData = BossCatalog.getStageBoss(this.currentStage);
    this.enemies.push({
      ...bossData,
      isBoss: true,
      isSubBoss: false,
      isFinalBoss: true,
      x: this.canvas.width / 2,
      y: -95
    });

    // Anuncio visible en pantalla de Jefe Final
    this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 40, `🚨 ¡ALERTA MÁXIMA: BOSS DE FASE!`, "#ff0055");
    this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 10, bossData.name, bossData.color || "#ff0055");
  }

  handleEnemyDefeated(enemy, index) {
    this.enemies.splice(index, 1);
    this.score += enemy.scoreValue;
    this.enemiesDestroyed++;

    if (enemy.isBoss) {
      this.bossesDefeated++;
      this.screenShake = 24;
      this.shockwaves.push({
        x: enemy.x,
        y: enemy.y,
        radius: 12,
        maxRadius: 280,
        color: enemy.color || "#00f3ff",
        alpha: 1.0
      });
      Sound.playBossExplosion();
      this.createExplosionParticles(enemy.x, enemy.y, enemy.color || "#ff0055", 55);
      if (this.currentStage === 5) {
        this.scenario.addGroundExplosion(enemy.x, enemy.y, 80);
      }

      // Soltar GRAN PREMIO DE JEFE (Mejora de armas + 2 Bombas tácticas)
      this.spawnBossGrandPrize(enemy.x, enemy.y);

      // Si es el Jefe Final del Área (no un subjefe intermedio)
      if (enemy.isFinalBoss) {
        this.mainBossDefeated = true;
        this.enemyProjectiles = []; // Proteger al jugador limpiando todos los proyectiles hostiles

        // Anuncio cinemático en pantalla
        this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 35, `🏆 ¡JEFE DE ÁREA DERROTADO!`, "#fbbf24");
        this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 + 5, `ÁREA ${this.currentStage} SUPERADA CON ÉXITO`, "#10b981");

        // Breve ventana de 1.8 segundos para recoger el Gran Premio antes de abrir la pantalla de victoria
        setTimeout(() => {
          if (this.isRunning) {
            this.handleStageVictory();
          }
        }, 1800);
      } else {
        // ¡Sublíder de fase derrotado!
        this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 - 35, `⚡ ¡SUBLÍDER ${enemy.name} DERROTADO!`, "#38bdf8");
        this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2 + 5, `🚀 AVANCE HACIA EL JEFE FINAL REANUDADO`, "#10b981");
        this.enemyProjectiles = []; // Despejar ráfagas del subjefe
      }
    } else {
      this.screenShake = Math.max(this.screenShake, enemy.isFormidable ? 7.0 : 3.5);
      Sound.playExplosion();
      this.createExplosionParticles(enemy.x, enemy.y, enemy.color || "#f97316", enemy.isFormidable ? 26 : 18);

      // Efectos pasivos de muerte y recompensas especiales por tipo de nave
      EnemyCatalog.handleDefeat(enemy, this);

      // Recompensa de distancia al derribar cazas para dinamismo de arcade
      if (!this.enemies.some(e => e.isBoss)) {
        this.stageDistance += 6;
      }

      // Probabilidad de soltar premios aleatorios en combate
      if (Math.random() < (enemy.isFormidable ? 0.42 : 0.28)) {
        this.spawnPowerup(enemy.x, enemy.y);
      }
    }
  }

  spawnBossGrandPrize(x, y) {
    this.powerups.push({
      x,
      y,
      type: "boss_grand_prize",
      vy: 1.1,
      size: 20,
      pulse: 0
    });
  }

  spawnPowerup(x, y) {
    const roll = Math.random();
    let type;
    if (roll < 0.22) {
      type = "weapon_upgrade"; // 🚀 Mejora de Armas
    } else if (roll < 0.42) {
      type = "bomb";           // 💣 +1 Bomba
    } else if (roll < 0.64) {
      type = "health";         // 🟢 +30 HP
    } else if (roll < 0.82) {
      type = "special";        // 🔵 Recarga Especial
    } else {
      type = "score";          // 🟡 +650 Puntos
    }

    this.powerups.push({
      x,
      y,
      type,
      vy: 1.8,
      size: 13,
      pulse: 0
    });
  }

  updatePowerups(dt) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += p.vy;
      p.pulse += dt * 5;

      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < this.player.width / 2 + p.size) {
        if (p.type === "boss_grand_prize") {
          this.player.weaponLevel = Math.min(3, this.player.weaponLevel + 1);
          this.player.upgradeHitsReceived = 0;
          this.bombs = Math.min(5, this.bombs + 2);
          const heal = Math.min(50, this.player.maxHealth - this.player.health);
          this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
          this.score += 2500;
          Sound.playGrandPrize();
          this.screenShake = 14;
          this.addFloatingText(p.x, p.y, "⭐ ¡GRAN PREMIO: ARMAS + 2 BOMBAS!", "#fbbf24");
          this.createExplosionParticles(p.x, p.y, "#fbbf24", 32);
          this.shockwaves.push({
            x: p.x,
            y: p.y,
            radius: 10,
            maxRadius: 220,
            color: "#fbbf24",
            alpha: 1.0
          });
        } else if (p.type === "weapon_upgrade") {
          this.player.weaponLevel = Math.min(3, this.player.weaponLevel + 1);
          this.player.upgradeHitsReceived = 0;
          Sound.playWeaponUpgrade();
          this.addFloatingText(p.x, p.y, `🚀 ¡POTENCIA DE ARMAS NV ${this.player.weaponLevel}!`, "#38bdf8");
          this.createExplosionParticles(p.x, p.y, "#38bdf8", 22);
        } else if (p.type === "bomb") {
          this.bombs = Math.min(5, this.bombs + 1);
          Sound.playBombPickup();
          this.addFloatingText(p.x, p.y, `💣 ¡+1 BOMBA TÁCTICA (${this.bombs})!`, "#f43f5e");
          this.createExplosionParticles(p.x, p.y, "#f43f5e", 22);
        } else if (p.type === "health") {
          const heal = Math.min(30, this.player.maxHealth - this.player.health);
          this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
          Sound.playPowerUpHealth();
          this.addFloatingText(p.x, p.y, `+${heal > 0 ? heal : 30} HP`, "#10b981");
          this.createExplosionParticles(p.x, p.y, "#10b981", 16);
        } else if (p.type === "special") {
          this.player.specialCooldownTimer = Math.max(0, this.player.specialCooldownTimer - 8);
          Sound.playPowerUpSpecial();
          this.addFloatingText(p.x, p.y, "ESPECIAL CARGADO", "#00f3ff");
          this.createExplosionParticles(p.x, p.y, "#00f3ff", 16);
        } else {
          this.score += 650;
          Sound.playPowerUpScore();
          this.addFloatingText(p.x, p.y, "+650 PTS", "#fbbf24");
          this.createExplosionParticles(p.x, p.y, "#fbbf24", 16);
        }

        this.updateHudWeaponAndBombs();
        this.powerups.splice(i, 1);
        continue;
      }

      if (p.y > this.canvas.height + 35) {
        this.powerups.splice(i, 1);
      }
    }
  }

  drawPowerup(p) {
    const ctx = this.ctx;
    const pulseScale = 1 + Math.sin(p.pulse) * 0.16;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(pulseScale, pulseScale);

    if (p.type === "boss_grand_prize") {
      // Corona brillante y halo dorado giratorio
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo dorado metálico
      const grad = ctx.createLinearGradient(-15, -15, 15, 15);
      grad.addColorStop(0, "#fde68a");
      grad.addColorStop(0.5, "#f59e0b");
      grad.addColorStop(1, "#b45309");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Orbitron, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👑", 0, 0);

      // Etiqueta flotante
      ctx.font = "bold 8px Orbitron";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("GRAN PREMIO", 0, -22);
    } else if (p.type === "weapon_upgrade") {
      ctx.fillStyle = "#0284c7";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚀", 0, 0);

      ctx.font = "bold 7px Orbitron";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("ARMAS", 0, -16);
    } else if (p.type === "bomb") {
      ctx.fillStyle = "#be123c";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💣", 0, 0);

      ctx.font = "bold 7px Orbitron";
      ctx.fillStyle = "#fda4af";
      ctx.fillText("BOMBA", 0, -16);
    } else if (p.type === "health") {
      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", 0, 0);
    } else if (p.type === "special") {
      ctx.fillStyle = "#00f3ff";
      ctx.shadowColor = "#00f3ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#030712";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", 0, 0);
    } else {
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#78350f";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★", 0, 0);
    }
    ctx.restore();
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      vy: -1.3,
      life: 0.9,
      maxLife: 0.9
    });
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  updateShockwaves(dt) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 260 * dt;
      sw.alpha = 1.0 - (sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  createHitSparks(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1,
        color,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  createExplosionParticles(x, y, color, count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color,
        life: 0.65,
        maxLife: 0.65
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateHUD(distanceRatio) {
    if (!this.hud) return;

    const healthPct = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
    if (this.hud.healthBar) {
      this.hud.healthBar.style.width = `${healthPct}%`;
      this.hud.healthBar.style.background = healthPct < 28 
        ? "linear-gradient(90deg, #ef4444, #f59e0b)" 
        : "linear-gradient(90deg, #10b981, #00f3ff)";
    }
    if (this.hud.healthText) this.hud.healthText.textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

    if (this.hud.specialStatus) {
      if (this.player.isSpecialActive) {
        this.hud.specialStatus.textContent = `ACTIVO (${this.player.specialTimer.toFixed(1)}s)`;
        this.hud.specialStatus.style.color = "#ec4899";
      } else if (this.player.specialCooldownTimer > 0) {
        this.hud.specialStatus.textContent = `RECARGA (${this.player.specialCooldownTimer.toFixed(1)}s)`;
        this.hud.specialStatus.style.color = "#f59e0b";
      } else {
        this.hud.specialStatus.textContent = "LISTO [E / SHIFT]";
        this.hud.specialStatus.style.color = "#34d399";
      }
    }

    // Actualizar botón e indicador táctil de habilidad especial
    const touchSpecialBadge = document.getElementById("touch-special-badge");
    const touchSpecialBtn = document.getElementById("btn-touch-special");
    if (touchSpecialBadge) {
      if (this.player.isSpecialActive) {
        touchSpecialBadge.textContent = `${this.player.specialTimer.toFixed(0)}s`;
        if (touchSpecialBtn) {
          touchSpecialBtn.classList.add("is-active");
          touchSpecialBtn.classList.remove("is-cooling");
        }
      } else if (this.player.specialCooldownTimer > 0) {
        touchSpecialBadge.textContent = `${this.player.specialCooldownTimer.toFixed(0)}s`;
        if (touchSpecialBtn) {
          touchSpecialBtn.classList.remove("is-active");
          touchSpecialBtn.classList.add("is-cooling");
        }
      } else {
        touchSpecialBadge.textContent = "LISTO";
        if (touchSpecialBtn) {
          touchSpecialBtn.classList.remove("is-active", "is-cooling");
        }
      }
    }

    if (this.hud.scoreText) this.hud.scoreText.textContent = this.score.toLocaleString();
    if (this.hud.stageProgress) {
      const pct = Math.min(100, Math.floor(distanceRatio * 100));
      this.hud.stageProgress.style.width = `${pct}%`;
      const pctEl = document.getElementById("hud-progress-pct");
      if (pctEl) {
        if (this.enemies.some(e => e.isFinalBoss)) {
          pctEl.innerHTML = "<span style='color: #ff0055;'>BOSS</span>";
        } else if (this.enemies.some(e => e.isSubBoss)) {
          pctEl.innerHTML = "<span style='color: #fbbf24;'>SUBLÍDER</span>";
        } else {
          pctEl.textContent = `${pct}%`;
        }
      }
    }

    this.updateHudWeaponAndBombs();
  }

  updateHudWeaponAndBombs() {
    if (!this.hud) return;

    // Actualizar badge táctil móvil de bombas
    const touchBombBadge = document.getElementById("touch-bomb-badge");
    if (touchBombBadge) {
      touchBombBadge.textContent = this.bombs;
    }

    if (this.hud.weaponLevelText) {
      const lvl = this.player.weaponLevel;
      if (lvl === 1) {
        this.hud.weaponLevelText.textContent = "NV 1 [ESTÁNDAR]";
        this.hud.weaponLevelText.style.color = "#38bdf8";
      } else if (lvl === 2) {
        const shieldText = this.player.upgradeHitsReceived === 1 ? "⚠️ [1/2 DAÑADO]" : "⭐ [2/2 ESCUDO]";
        this.hud.weaponLevelText.textContent = `NV 2 ${shieldText}`;
        this.hud.weaponLevelText.style.color = this.player.upgradeHitsReceived === 1 ? "#f59e0b" : "#34d399";
      } else {
        const shieldText = this.player.upgradeHitsReceived === 1 ? "⚠️ [1/2 DAÑADO]" : "⭐⭐ [2/2 ESCUDO]";
        this.hud.weaponLevelText.textContent = `NV 3 ${shieldText}`;
        this.hud.weaponLevelText.style.color = this.player.upgradeHitsReceived === 1 ? "#f59e0b" : "#e879f9";
      }
    }

    if (this.hud.bombsCountText) {
      this.hud.bombsCountText.textContent = this.bombs;
    }
  }

  onPlayerHit() {
    this.screenShake = Math.max(this.screenShake, 9);
    if (this.player.weaponLevel > 1) {
      this.player.upgradeHitsReceived++;
      if (this.player.upgradeHitsReceived === 1) {
        this.addFloatingText(this.player.x, this.player.y - 35, "⚠️ ¡ESCUDO DE ARMA DAÑADO (1/2 GOLPES)!", "#f59e0b");
      } else if (this.player.upgradeHitsReceived >= 2) {
        this.player.weaponLevel = Math.max(1, this.player.weaponLevel - 1);
        this.player.upgradeHitsReceived = 0;
        Sound.playWeaponDowngrade();
        this.addFloatingText(this.player.x, this.player.y - 35, "💥 ¡MEJORA DE ARMA PERDIDA TRAS 2 GOLPES!", "#ef4444");
      }
      this.updateHudWeaponAndBombs();
    }
  }

  triggerBomb() {
    if (!this.isRunning || this.isPaused || this.bombs <= 0) return;

    this.bombs--;
    Sound.playBombDetonation();

    this.screenShake = 32;
    this.bombFlash = 1.0;

    // Ondas de choque expansivas
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 20,
      maxRadius: 650,
      color: "#00f3ff",
      alpha: 1.0
    });
    this.shockwaves.push({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 15,
      maxRadius: 750,
      color: "#f43f5e",
      alpha: 1.0
    });

    // Desintegrar todos los proyectiles hostiles en pantalla
    for (const ep of this.enemyProjectiles) {
      this.createExplosionParticles(ep.x, ep.y, "#38bdf8", 5);
    }
    this.enemyProjectiles = [];

    // Daño masivo a todos los enemigos activos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isBoss) {
        enemy.health -= 380;
        this.createExplosionParticles(enemy.x, enemy.y, "#f43f5e", 35);
        this.addFloatingText(enemy.x, enemy.y, "-380 CRÍTICO BOMBA", "#f43f5e");
        if (enemy.health <= 0) {
          this.handleEnemyDefeated(enemy, i);
        }
      } else {
        this.createExplosionParticles(enemy.x, enemy.y, "#f43f5e", 22);
        this.handleEnemyDefeated(enemy, i);
      }
    }

    this.addFloatingText(this.player.x, this.player.y - 45, "💣 ¡DETONACIÓN TÁCTICA OMNIDIRECCIONAL!", "#f43f5e");
    this.updateHudWeaponAndBombs();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    const distanceRatio = Math.min(1.0, this.stageDistance / this.stageTargetDistance);

    // 1. Renderizado del Escenario Temático
    this.scenario.render(this.currentStage, distanceRatio);

    // 2. Ondas Expansivas (Shockwaves de Jefes)
    for (const sw of this.shockwaves) {
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = Math.max(1, 4 * sw.alpha);
      this.ctx.globalAlpha = Math.max(0, sw.alpha);
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1.0;

    // 3. Power-ups Tácticos en Pantalla
    for (const p of this.powerups) {
      this.drawPowerup(p);
    }

    // 4. Proyectiles de enemigos
    for (const ep of this.enemyProjectiles) {
      const col = ep.color || "#ef4444";
      const rad = ep.radius || 4.5;
      this.ctx.fillStyle = col;
      this.ctx.shadowColor = col;
      this.ctx.shadowBlur = rad * 2;

      if (ep.type === "frost_needle") {
        // Aguja de hielo en rombo aerodinámico
        this.ctx.save();
        this.ctx.translate(ep.x, ep.y);
        this.ctx.rotate(Math.atan2(ep.vy, ep.vx));
        this.ctx.beginPath();
        this.ctx.moveTo(rad * 2.2, 0);
        this.ctx.lineTo(0, rad * 0.7);
        this.ctx.lineTo(-rad * 2.2, 0);
        this.ctx.lineTo(0, -rad * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      } else if (ep.type === "torpedo") {
        // Torpedo teledirigido abisal con propulsión
        this.ctx.beginPath();
        this.ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2);
        this.ctx.fill();
        // Núcleo blanco
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(ep.x, ep.y - rad * 0.5, rad * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (ep.type === "plasma_orb") {
        // Orbe de plasma denso con corona radiante
        this.ctx.beginPath();
        this.ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2);
        this.ctx.fill();
        // Centro de incandescencia blanca
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(ep.x, ep.y, rad * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (ep.type === "imperial_bolt") {
        // Lanza de energía imperial alargada
        this.ctx.save();
        this.ctx.translate(ep.x, ep.y);
        this.ctx.rotate(Math.atan2(ep.vy, ep.vx));
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, rad * 2.2, rad * 0.65, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, rad * 1.2, rad * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else if (ep.type === "cluster_bomb") {
        // Micro-bomba de racimo triangular de fragmentación
        this.ctx.save();
        this.ctx.translate(ep.x, ep.y);
        this.ctx.rotate(performance.now() * 0.008);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -rad * 1.5);
        this.ctx.lineTo(rad * 1.3, rad);
        this.ctx.lineTo(-rad * 1.3, rad);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(ep.x, ep.y, rad, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.shadowBlur = 0;

    // 5. Enemigos y Jefes
    for (const enemy of this.enemies) {
      if (enemy.isBoss) {
        BossCatalog.drawBoss(this.ctx, enemy);
      } else {
        EnemyCatalog.drawEnemy(this.ctx, enemy);
      }
    }

    // 6. Proyectiles del jugador
    for (const p of this.projectiles) {
      ShipRenderer.drawProjectile(this.ctx, p);
    }

    // 7. Nave del jugador
    if (this.player.health > 0) {
      ShipRenderer.drawPlayerShip(
        this.ctx,
        this.ship,
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height,
        this.player.isSpecialActive
      );
    }

    // 8. Partículas
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // 9. Textos Flotantes de Puntos y Bonificaciones
    for (const ft of this.floatingTexts) {
      this.ctx.font = "bold 13px Orbitron, monospace";
      this.ctx.fillStyle = ft.color;
      this.ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      this.ctx.textAlign = "center";
      this.ctx.fillText(ft.text, ft.x, ft.y);
    }
    this.ctx.globalAlpha = 1.0;

    // 10. Banner y Barra de Vida Superior si hay un Jefe o Sublíder en combate
    if (this.activeBoss) {
      this.drawBossBattleBanner(this.activeBoss);
    }

    // 11. Viñeta roja crítica si vida < 28%
    if (this.player.health > 0 && this.player.health / this.player.maxHealth < 0.28) {
      const alphaPulse = 0.22 + Math.sin(performance.now() * 0.009) * 0.14;
      const grad = this.ctx.createRadialGradient(
        this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.25,
        this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.65
      );
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, `rgba(239, 68, 68, ${alphaPulse})`);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 12. Destello blanco de detonación de bomba táctica
    if (this.bombFlash > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.bombFlash * 0.45})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.bombFlash = Math.max(0, this.bombFlash - 0.04);
    }

    // 13. Banner Cinemático de Despliegue de Fase
    if (this.stageBannerTimer > 0) {
      this.drawStageIntroBanner();
    }

    // 14. Banner Cinemático de Jefe de Área Derrotado
    if (this.mainBossDefeated) {
      this.drawBossDefeatedCinematicBanner();
    }

    this.ctx.restore();
  }

  drawStageIntroBanner() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const progress = Math.min(1.0, this.stageBannerTimer / 3.5);
    const alpha = Math.min(1.0, progress * 1.8);

    ctx.save();
    ctx.globalAlpha = alpha;

    const boxW = Math.min(w * 0.92, 540);
    const boxH = 195;
    const boxX = (w - boxW) / 2;
    const boxY = h * 0.28;

    // Fondo translúcido de mando cibernético
    ctx.fillStyle = "rgba(4, 9, 24, 0.94)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00f3ff";
    ctx.shadowBlur = 14;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    // Encabezado
    ctx.textAlign = "center";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px Orbitron, monospace";
    ctx.shadowColor = "#00f3ff";
    ctx.shadowBlur = 10;
    ctx.fillText(`🚀 ÁREA ${this.currentStage} · DESPLIEGUE TÁCTICO`, w / 2, boxY + 26);
    ctx.shadowBlur = 0;

    const stageNames = {
      1: "Travesía Continental: Norteamérica a la Antártida",
      2: "Pacífico Oceánico: De Isla en Isla a Australia",
      3: "Excursión Orbital: Rumbo a Júpiter",
      4: "Sector Criogénico: Glaciares y Tempestad de Hielo",
      5: "Jungla Devastada: Asalto al Cuartel General"
    };
    ctx.font = "11px Orbitron, monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText(stageNames[this.currentStage] || "Misión de Incursión Táctica", w / 2, boxY + 46);

    // Obtener naves del Sublíder y Jefe Final de esta fase
    const midBossData = BossCatalog.getMidBoss(this.currentStage);
    const stageBossData = BossCatalog.getStageBoss(this.currentStage);

    const cardW = (boxW - 36) / 2;
    const cardH = 92;
    const cardY = boxY + 58;

    // --- Tarjeta 1: Sublíder (Izquierda) ---
    const card1X = boxX + 12;
    ctx.fillStyle = "rgba(8, 20, 38, 0.9)";
    ctx.fillRect(card1X, cardY, cardW, cardH);
    ctx.strokeStyle = midBossData.color || "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(card1X, cardY, cardW, cardH);

    ctx.font = "bold 9px Orbitron, monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText("⚠️ SUBLÍDER (40%)", card1X + cardW / 2, cardY + 15);

    ctx.font = "bold 8px Orbitron, monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(midBossData.name.replace(" (SUBLÍDER)", ""), card1X + cardW / 2, cardY + cardH - 8);

    // Dibujo vectorial de la nave del Sublíder
    const previewMid = {
      ...midBossData,
      x: card1X + cardW / 2,
      y: cardY + 45,
      width: midBossData.width * 0.52,
      height: midBossData.height * 0.52
    };
    this.drawMiniBossVector(ctx, previewMid);

    // --- Tarjeta 2: Jefe Final (Derecha) ---
    const card2X = boxX + boxW - cardW - 12;
    ctx.fillStyle = "rgba(38, 8, 20, 0.9)";
    ctx.fillRect(card2X, cardY, cardW, cardH);
    ctx.strokeStyle = stageBossData.color || "#ff0055";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(card2X, cardY, cardW, cardH);

    ctx.font = "bold 9px Orbitron, monospace";
    ctx.fillStyle = "#ff0055";
    ctx.textAlign = "center";
    ctx.fillText("👑 BOSS FINAL (85%)", card2X + cardW / 2, cardY + 15);

    ctx.font = "bold 8px Orbitron, monospace";
    ctx.fillStyle = "#ffffff";
    const shortFinalName = stageBossData.name.split("(")[0].trim();
    ctx.fillText(shortFinalName, card2X + cardW / 2, cardY + cardH - 8);

    // Dibujo vectorial de la nave del Jefe Final
    const previewFinal = {
      ...stageBossData,
      x: card2X + cardW / 2,
      y: cardY + 45,
      width: stageBossData.width * 0.48,
      height: stageBossData.height * 0.48
    };
    this.drawMiniBossVector(ctx, previewFinal);

    // Pie de banner
    ctx.font = "bold 9px Orbitron, monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText("⚡ AMENAZAS CONFIRMADAS · INICIANDO INCURSIÓN ⚡", w / 2, boxY + boxH - 12);

    ctx.restore();
  }

  drawMiniBossVector(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);
    const halfW = boss.width / 2;
    const halfH = boss.height / 2;
    BossCatalog.drawBossShip(ctx, boss, halfW, halfH);
    ctx.restore();
  }

  drawBossDefeatedCinematicBanner() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    const pulse = 0.85 + Math.sin(performance.now() * 0.008) * 0.15;
    ctx.globalAlpha = pulse;

    ctx.fillStyle = "rgba(5, 12, 8, 0.92)";
    ctx.fillRect(w * 0.08, h * 0.38, w * 0.84, 86);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.08, h * 0.38, w * 0.84, 86);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 24px Orbitron, monospace";
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 20;
    ctx.fillText(`🏆 ¡ÁREA ${this.currentStage} SUPERADA!`, w / 2, h * 0.38 + 38);

    ctx.font = "bold 13px Orbitron, monospace";
    ctx.fillStyle = "#34d399";
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 10;
    const nextSt = this.currentStage < 5 ? `DESBLOQUEADA FASE ${this.currentStage + 1} ➔` : "CAMPAÑA CONQUISTADA AL 100%";
    ctx.fillText(`JEFE PRINCIPAL ANIQUILADO · ${nextSt}`, w / 2, h * 0.38 + 66);

    ctx.restore();
  }

  drawBossBattleBanner(boss) {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.save();
    // Fondo del banner
    ctx.fillStyle = "rgba(7, 10, 22, 0.85)";
    ctx.fillRect(w * 0.15, 12, w * 0.7, 36);
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.15, 12, w * 0.7, 36);

    // Título y Nombre del Jefe
    ctx.fillStyle = boss.color;
    ctx.font = "9px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText(`⚔️ ${boss.name} — ${boss.title}`, w / 2, 24);

    // Barra de Vida
    const healthRatio = Math.max(0, boss.health / boss.maxHealth);
    const barW = w * 0.65;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(w * 0.175, 30, barW, 10);

    const grad = ctx.createLinearGradient(w * 0.175, 0, w * 0.175 + barW, 0);
    grad.addColorStop(0, "#f43f5e");
    grad.addColorStop(1, boss.color);
    ctx.fillStyle = grad;
    ctx.fillRect(w * 0.175, 30, barW * healthRatio, 10);
    ctx.restore();
  }

  drawPauseOverlay() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#00f3ff";
    this.ctx.font = "22px Orbitron";
    this.ctx.textAlign = "center";
    this.ctx.fillText("SISTEMA EN PAUSA", this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = "13px Rajdhani";
    this.ctx.fillText("Presione 'P' para continuar combate", this.canvas.width / 2, this.canvas.height / 2 + 30);
  }

  async handleGameOver() {
    this.stop();
    Sound.stopMusic();
    Sound.playGameOver();

    await ApiService.submitScore({
      ship_id: this.ship.id,
      stage_reached: this.currentStage,
      score: this.score,
      enemies_destroyed: this.enemiesDestroyed,
      bosses_defeated: this.bossesDefeated,
      victory: false
    });

    if (this.hud && this.hud.onGameOver) {
      this.hud.onGameOver({
        score: this.score,
        enemies: this.enemiesDestroyed,
        bosses: this.bossesDefeated,
        stage: this.currentStage
      });
    }
  }

  async handleStageVictory() {
    this.stop();
    Sound.stopMusic();
    Sound.playVictory();

    const isCampaignVictory = this.currentStage === 5;
    const bonusScore = isCampaignVictory ? 15000 : 5000;
    const finalScore = this.score + bonusScore;

    await ApiService.completeStage(this.currentStage);
    await ApiService.submitScore({
      ship_id: this.ship.id,
      stage_reached: this.currentStage,
      score: finalScore,
      enemies_destroyed: this.enemiesDestroyed,
      bosses_defeated: this.bossesDefeated,
      victory: isCampaignVictory
    });

    if (this.hud && this.hud.onStageVictory) {
      this.hud.onStageVictory({
        stageCompleted: this.currentStage,
        score: finalScore,
        enemies: this.enemiesDestroyed,
        bosses: this.bossesDefeated,
        isCampaignVictory
      });
    }
  }
}
