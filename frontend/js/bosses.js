/**
 * Definiciones, Atributos, Renderizado Vectorial y Mecánicas de Combate
 * de los 5 Sublíderes y 5 Jefes Finales
 * 
 * Cada una de las 5 fases cuenta con su propio Sublíder táctico intermedio (40% de avance)
 * y su respectivo Jefe Supremo de Área (85% de avance).
 * 
 * CERO DEPENDENCIAS EXTERNAS: 100% Canvas 2D procedural a 60 FPS con estéticas visuales
 * únicas, siluetas distintivas y habilidades de combate exclusivas.
 */

import { Sound } from "./sound_fx.js";

export const BossCatalog = {
  // ==========================================
  // 1. ESPECIFICACIONES DE SUBLÍDERES (40% FASE)
  // ==========================================
  getMidBoss(stageNumber) {
    switch (stageNumber) {
      case 1:
        return {
          slug: "mid_aurora_9",
          name: "AURORA-9 (SUBLÍDER)",
          title: "Bombardero Furtivo Suborbital",
          abilityName: "Bombardeo Hipersónico en V",
          abilityDesc: "Ráfagas supersónicas en V y torpedo sónico pesado",
          health: 320,
          maxHealth: 320,
          width: 74,
          height: 56,
          vy: 1.2,
          vxAmp: 4.2,
          shootInterval: 1.05,
          color: "#38bdf8",
          accentColor: "#0284c7",
          isBoss: true,
          isSubBoss: true,
          isFinalBoss: false,
          scoreValue: 1200
        };

      case 2:
        return {
          slug: "mid_nautilus_x",
          name: "NAUTILUS-X (SUBLÍDER)",
          title: "Corbeta Sumergible Abisal",
          abilityName: "Torpedos de Cavitación Abisal",
          abilityDesc: "Doble torpedo teledirigido y cortina de plasma marino",
          health: 440,
          maxHealth: 440,
          width: 78,
          height: 60,
          vy: 1.1,
          vxAmp: 4.6,
          shootInterval: 0.98,
          color: "#14b8a6",
          accentColor: "#0d9488",
          isBoss: true,
          isSubBoss: true,
          isFinalBoss: false,
          scoreValue: 1600
        };

      case 3:
        return {
          slug: "mid_jovian_core",
          name: "JOVIAN CORE (SUBLÍDER)",
          title: "Sonda de Fusión Gravitatoria",
          abilityName: "Vórtice Solar Espiral",
          abilityDesc: "Cuarteto de plasma en rotación constante y pulso de repulsión",
          health: 560,
          maxHealth: 560,
          width: 80,
          height: 64,
          vy: 1.0,
          vxAmp: 5.0,
          shootInterval: 0.92,
          color: "#f97316",
          accentColor: "#ea580c",
          isBoss: true,
          isSubBoss: true,
          isFinalBoss: false,
          scoreValue: 2000
        };

      case 4:
        return {
          slug: "mid_frost_bite",
          name: "FROST-BITE (SUBLÍDER)",
          title: "Caminante Glacial Criogénico",
          abilityName: "Ventisca de Agujas de Hielo",
          abilityDesc: "Cono veloz de agujas penetrantes y orbes de escarcha",
          health: 680,
          maxHealth: 680,
          width: 84,
          height: 66,
          vy: 0.95,
          vxAmp: 4.5,
          shootInterval: 0.85,
          color: "#7dd3fc",
          accentColor: "#38bdf8",
          isBoss: true,
          isSubBoss: true,
          isFinalBoss: false,
          scoreValue: 2400
        };

      case 5:
      default:
        return {
          slug: "mid_jungle_beast",
          name: "JUNGLE-BEAST (SUBLÍDER)",
          title: "Meca Blindado de Asalto Selvático",
          abilityName: "Gatling de Asalto & Bombas Racimo",
          abilityDesc: "Ametrallamiento continuo en staccato y micro-bombas de fragmentación",
          health: 850,
          maxHealth: 850,
          width: 88,
          height: 70,
          vy: 0.9,
          vxAmp: 4.8,
          shootInterval: 0.78,
          color: "#84cc16",
          accentColor: "#65a30d",
          isBoss: true,
          isSubBoss: true,
          isFinalBoss: false,
          scoreValue: 3000
        };
    }
  },

  // ==========================================
  // 2. ESPECIFICACIONES DE JEFES FINALES (85% FASE)
  // ==========================================
  getStageBoss(stageNumber) {
    switch (stageNumber) {
      case 1:
        return {
          slug: "boss_goliath_apex",
          name: "GOLIATH APEX (BOSS FASE 1)",
          title: "Fortaleza Aérea Polar de Asalto",
          abilityName: "Tridente Polar & Cortina de Asedio",
          abilityDesc: "Tridente pesado frontal con cortina semicircular de 6 proyectiles",
          health: 680,
          maxHealth: 680,
          width: 108,
          height: 84,
          vy: 0.6,
          vxAmp: 5.5,
          shootInterval: 0.75,
          color: "#0284c7",
          accentColor: "#38bdf8",
          isBoss: true,
          isSubBoss: false,
          isFinalBoss: true,
          scoreValue: 3500
        };

      case 2:
        return {
          slug: "boss_leviathan_colossus",
          name: "LEVIATHAN COLOSSUS (BOSS FASE 2)",
          title: "Acorazado Suborbital del Pacífico",
          abilityName: "Pinza Kraken & Tsunami Hidromagnético",
          abilityDesc: "Torpedos pesados guiados flanqueantes y abanico de plasma de alta presión",
          health: 950,
          maxHealth: 950,
          width: 116,
          height: 88,
          vy: 0.55,
          vxAmp: 6.0,
          shootInterval: 0.7,
          color: "#0d9488",
          accentColor: "#14b8a6",
          isBoss: true,
          isSubBoss: false,
          isFinalBoss: true,
          scoreValue: 4500
        };

      case 3:
        return {
          slug: "boss_ganymede_titan",
          name: "GANYMEDE TITAN (BOSS FASE 3)",
          title: "Estación de Batalla Orbital Joviana",
          abilityName: "Corona Solar & Railgun Hiperdenso",
          abilityDesc: "Erupción radial de plasma solar en 360° y salva de railgun central",
          health: 1250,
          maxHealth: 1250,
          width: 122,
          height: 94,
          vy: 0.5,
          vxAmp: 6.2,
          shootInterval: 0.65,
          color: "#ea580c",
          accentColor: "#f97316",
          isBoss: true,
          isSubBoss: false,
          isFinalBoss: true,
          scoreValue: 6000
        };

      case 4:
        return {
          slug: "boss_zero_kelvin",
          name: "ZERO-KELVIN (BOSS FASE 4)",
          title: "Destructor Criogénico Absoluto",
          abilityName: "Nova Cero Absoluto & Lanzas Glaciales",
          abilityDesc: "Salva helicoidal de 7 agujas cristalinas y nova radial de 10 orbes de hielo",
          health: 1600,
          maxHealth: 1600,
          width: 130,
          height: 100,
          vy: 0.45,
          vxAmp: 6.5,
          shootInterval: 0.6,
          color: "#38bdf8",
          accentColor: "#bae6fd",
          isBoss: true,
          isSubBoss: false,
          isFinalBoss: true,
          scoreValue: 8000
        };

      case 5:
      default:
        return {
          slug: "boss_general_vektor",
          name: "GENERAL VEKTOR (BOSS PRINCIPAL FINAL)",
          title: "Supremo Acorazado Dreadnought Apex",
          abilityName: "Protocolo Juicio Imperial",
          abilityDesc: "Cuádruple plasma carmesí y Sobrecarga Dorada Apocalíptica al <40% HP",
          health: 2400,
          maxHealth: 2400,
          width: 148,
          height: 116,
          vy: 0.4,
          vxAmp: 7.0,
          shootInterval: 0.52,
          color: "#ff0055",
          accentColor: "#fbbf24",
          isBoss: true,
          isSubBoss: false,
          isFinalBoss: true,
          scoreValue: 15000
        };
    }
  },

  // ==========================================
  // 3. IA DE DISPARO Y HABILIDADES ÚNICAS
  // ==========================================
  fireBossAttack(boss, player, enemyProjectiles, engine) {
    boss.attackCycle = (boss.attackCycle || 0) + 1;
    const now = performance.now();

    switch (boss.slug) {
      // ----------------------------------------------------
      // SUBLÍDER 1: AURORA-9 (Bombardero Furtivo Suborbital)
      // ----------------------------------------------------
      case "mid_aurora_9": {
        if (boss.attackCycle % 2 === 1) {
          // Disparo en V cuádruple supersónico
          [-3.2, -1.2, 1.2, 3.2].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 6,
              y: boss.y + 26,
              vx,
              vy: 6.4,
              damage: 13,
              radius: 4.5,
              color: "#38bdf8"
            });
          });
          Sound.playLaser();
        } else {
          // Hiper-Proyectil sónico pesado central + cobertura lateral
          enemyProjectiles.push({
            x: boss.x,
            y: boss.y + 30,
            vx: 0,
            vy: 7.4,
            damage: 22,
            radius: 8.5,
            color: "#e0f2fe",
            type: "plasma_orb"
          });
          [-2.2, 2.2].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 12,
              y: boss.y + 24,
              vx,
              vy: 5.6,
              damage: 12,
              radius: 4.0,
              color: "#38bdf8"
            });
          });
          Sound.playHeavyShot();
        }
        break;
      }

      // ----------------------------------------------------
      // SUBLÍDER 2: NAUTILUS-X (Corbeta Sumergible Abisal)
      // ----------------------------------------------------
      case "mid_nautilus_x": {
        // Doble torpedo abisal teledirigido
        enemyProjectiles.push({
          x: boss.x - 26,
          y: boss.y + 24,
          vx: -1.8,
          vy: 3.6,
          isHoming: true,
          type: "torpedo",
          radius: 6.0,
          damage: 18,
          color: "#2dd4bf"
        });
        enemyProjectiles.push({
          x: boss.x + 26,
          y: boss.y + 24,
          vx: 1.8,
          vy: 3.6,
          isHoming: true,
          type: "torpedo",
          radius: 6.0,
          damage: 18,
          color: "#2dd4bf"
        });

        // Cortina de plasma marino cavitante
        [-1.4, 0, 1.4].forEach(vx => {
          enemyProjectiles.push({
            x: boss.x + vx * 12,
            y: boss.y + 28,
            vx,
            vy: 5.2,
            type: "plasma_orb",
            radius: 5.0,
            damage: 14,
            color: "#14b8a6"
          });
        });
        Sound.playHeavyShot();
        break;
      }

      // ----------------------------------------------------
      // SUBLÍDER 3: JOVIAN CORE (Sonda de Fusión Gravitatoria)
      // ----------------------------------------------------
      case "mid_jovian_core": {
        boss.spiralAngle = (boss.spiralAngle || 0) + 0.42;

        // Vórtice espiral en 4 brazos giratorios
        for (let a = 0; a < 4; a++) {
          const ang = boss.spiralAngle + a * (Math.PI / 2);
          const spd = 5.2;
          enemyProjectiles.push({
            x: boss.x + Math.cos(ang) * 16,
            y: boss.y + Math.sin(ang) * 16,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            type: "plasma_orb",
            radius: 6.0,
            damage: 15,
            color: "#f97316"
          });
        }

        // Cada 4 ciclos, pulso de repulsión gravitatoria visible
        if (boss.attackCycle % 4 === 0) {
          engine.shockwaves.push({
            x: boss.x,
            y: boss.y,
            radius: 10,
            maxRadius: 180,
            color: "#fb923c",
            alpha: 0.85
          });
          Sound.playBeam();
        } else {
          Sound.playLaser();
        }
        break;
      }

      // ----------------------------------------------------
      // SUBLÍDER 4: FROST-BITE (Caminante Glacial Criogénico)
      // ----------------------------------------------------
      case "mid_frost_bite": {
        if (boss.attackCycle % 2 === 1) {
          // Ventisca de 5 agujas glaciales veloces en abanico
          [-3.0, -1.5, 0, 1.5, 3.0].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 5,
              y: boss.y + 28,
              vx,
              vy: 6.8,
              type: "frost_needle",
              radius: 4.5,
              damage: 12,
              color: "#bae6fd"
            });
          });
          Sound.playLaser();
        } else {
          // Esferas criogénicas pesadas desde los cañones estabilizadores
          [-22, 22].forEach(ox => {
            enemyProjectiles.push({
              x: boss.x + ox,
              y: boss.y + 26,
              vx: ox > 0 ? 1.6 : -1.6,
              vy: 5.2,
              type: "plasma_orb",
              radius: 7.5,
              damage: 20,
              color: "#38bdf8"
            });
          });
          Sound.playHeavyShot();
        }
        break;
      }

      // ----------------------------------------------------
      // SUBLÍDER 5: JUNGLE-BEAST (Meca Blindado de Asalto)
      // ----------------------------------------------------
      case "mid_jungle_beast": {
        // Ametrallamiento continuo en staccato (pod izquierdo o derecho alternado)
        const podX = (boss.attackCycle % 2 === 0) ? -28 : 28;
        enemyProjectiles.push({
          x: boss.x + podX - 4,
          y: boss.y + 32,
          vx: podX > 0 ? 0.8 : -0.8,
          vy: 7.2,
          damage: 11,
          radius: 4.5,
          color: "#a3e635"
        });
        enemyProjectiles.push({
          x: boss.x + podX + 4,
          y: boss.y + 32,
          vx: podX > 0 ? 1.2 : -1.2,
          vy: 7.5,
          damage: 11,
          radius: 4.5,
          color: "#84cc16"
        });
        Sound.playLaser();

        // Cada 3 ciclos, suelta 3 micro-bombas de racimo de fragmentación
        if (boss.attackCycle % 3 === 0) {
          [-2.2, 0, 2.2].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 8,
              y: boss.y + 30,
              vx,
              vy: 4.4,
              type: "cluster_bomb",
              radius: 6.0,
              damage: 16,
              color: "#facc15"
            });
          });
          Sound.playExplosion();
        }
        break;
      }

      // ====================================================
      // JEFE FINAL 1: GOLIATH APEX (Fortaleza Aérea Polar)
      // ====================================================
      case "boss_goliath_apex": {
        if (boss.attackCycle % 2 === 1) {
          // Tridente polar pesado de asedio
          [-2.2, 0, 2.2].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 14,
              y: boss.y + 38,
              vx,
              vy: 6.2,
              type: "plasma_orb",
              radius: 8.0,
              damage: 22,
              color: "#38bdf8"
            });
          });
          Sound.playHeavyShot();
        } else {
          // Cortina de asedio semicircular de 6 proyectiles
          [-3.6, -2.1, -0.7, 0.7, 2.1, 3.6].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 8,
              y: boss.y + 36,
              vx,
              vy: 5.2,
              radius: 5.5,
              damage: 16,
              color: "#0284c7"
            });
          });
          Sound.playLaser();
        }

        // Furia bajo el 50% de salud: añade misiles supersónicos de cobertura en los flancos
        if (boss.health / boss.maxHealth < 0.5) {
          [-4.0, 4.0].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + Math.sign(vx) * 44,
              y: boss.y + 24,
              vx,
              vy: 6.0,
              radius: 5.0,
              damage: 15,
              color: "#e0f2fe"
            });
          });
        }
        break;
      }

      // ====================================================
      // JEFE FINAL 2: LEVIATHAN COLOSSUS (Acorazado del Pacífico)
      // ====================================================
      case "boss_leviathan_colossus": {
        // Pinza de Torpedos Kraken guiados desde los flancos
        enemyProjectiles.push({
          x: boss.x - 42,
          y: boss.y + 34,
          vx: -2.4,
          vy: 3.5,
          isHoming: true,
          type: "torpedo",
          radius: 7.5,
          damage: 24,
          color: "#2dd4bf"
        });
        enemyProjectiles.push({
          x: boss.x + 42,
          y: boss.y + 34,
          vx: 2.4,
          vy: 3.5,
          isHoming: true,
          type: "torpedo",
          radius: 7.5,
          damage: 24,
          color: "#2dd4bf"
        });

        // Tsunami hidromagnético: 5 orbes de plasma concentrado hacia el jugador
        const aimAngle = Math.atan2((player.y - boss.y), (player.x - boss.x));
        [-0.35, -0.18, 0, 0.18, 0.35].forEach(offset => {
          const ang = aimAngle + offset;
          const spd = 5.8;
          enemyProjectiles.push({
            x: boss.x,
            y: boss.y + 40,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            type: "plasma_orb",
            radius: 6.0,
            damage: 18,
            color: "#14b8a6"
          });
        });
        Sound.playHeavyShot();
        break;
      }

      // ====================================================
      // JEFE FINAL 3: GANYMEDE TITAN (Estación Orbital Joviana)
      // ====================================================
      case "boss_ganymede_titan": {
        if (boss.attackCycle % 2 === 1) {
          // Descarga de Corona Solar en 360 grados (8 orbes radiales)
          for (let a = 0; a < 8; a++) {
            const ang = (a * Math.PI) / 4 + (boss.attackCycle * 0.15);
            const spd = 5.0;
            enemyProjectiles.push({
              x: boss.x + Math.cos(ang) * 25,
              y: boss.y + Math.sin(ang) * 25,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              type: "plasma_orb",
              radius: 6.5,
              damage: 16,
              color: "#ea580c"
            });
          }
          Sound.playLaser();
        } else {
          // Ráfaga Railgun Orbital Hiperdenso hacia la nave del jugador
          const dx = player.x - boss.x;
          const dy = Math.max(80, player.y - boss.y);
          const dist = Math.hypot(dx, dy);
          const dirX = (dx / dist) * 8.2;
          const dirY = (dy / dist) * 8.2;

          for (let k = 0; k < 3; k++) {
            setTimeout(() => {
              if (engine.isRunning) {
                enemyProjectiles.push({
                  x: boss.x + (k - 1) * 6,
                  y: boss.y + 45,
                  vx: dirX,
                  vy: dirY,
                  type: "imperial_bolt",
                  radius: 8.0,
                  damage: 26,
                  color: "#fef08a"
                });
                Sound.playBeam();
              }
            }, k * 90);
          }
        }
        break;
      }

      // ====================================================
      // JEFE FINAL 4: ZERO-KELVIN (Destructor Criogénico)
      // ====================================================
      case "boss_zero_kelvin": {
        if (boss.attackCycle % 2 === 1) {
          // Lanzas Glaciales de Diamante (7 agujas cristalinas helicoidales)
          [-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 9,
              y: boss.y + 40,
              vx,
              vy: 7.2,
              type: "frost_needle",
              radius: 5.0,
              damage: 15,
              color: "#e0f2fe"
            });
          });
          Sound.playLaser();
        } else {
          // Nova Cero Absoluto (10 orbes de hielo puro en anillo expansivo)
          for (let a = 0; a < 10; a++) {
            const ang = (a * 2 * Math.PI) / 10;
            const spd = 4.8;
            enemyProjectiles.push({
              x: boss.x + Math.cos(ang) * 20,
              y: boss.y + Math.sin(ang) * 20,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              type: "plasma_orb",
              radius: 6.5,
              damage: 20,
              color: "#38bdf8"
            });
          }
          Sound.playBeam();
        }
        break;
      }

      // ====================================================
      // JEFE FINAL 5: GENERAL VEKTOR (Dreadnought Supremo)
      // ====================================================
      case "boss_general_vektor":
      default: {
        const isEnraged = (boss.health / boss.maxHealth) <= 0.40;

        if (isEnraged) {
          // ¡Fase de Enrage / Sobrecarga Dorada Imperial!
          boss.shootInterval = 0.28; // Cadencia duplicada al máximo
          engine.screenShake = Math.max(engine.screenShake, 7);

          // Salva Apocalíptica Combinada (9 proyectiles carmesíes y dorados)
          [-3.6, -1.2, 1.2, 3.6].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 12,
              y: boss.y + 50,
              vx,
              vy: 8.2,
              type: "imperial_bolt",
              radius: 8.5,
              damage: 26,
              color: "#fbbf24"
            });
          });

          [-1.8, 0, 1.8].forEach(vx => {
            enemyProjectiles.push({
              x: boss.x + vx * 14,
              y: boss.y + 46,
              vx,
              vy: 6.4,
              type: "plasma_orb",
              radius: 7.0,
              damage: 22,
              color: "#ff0055"
            });
          });

          // Torpedos teledirigidos de fragmentación
          enemyProjectiles.push({
            x: boss.x - 48,
            y: boss.y + 36,
            vx: -2.5,
            vy: 4.2,
            isHoming: true,
            type: "torpedo",
            radius: 6.5,
            damage: 20,
            color: "#fbbf24"
          });
          enemyProjectiles.push({
            x: boss.x + 48,
            y: boss.y + 36,
            vx: 2.5,
            vy: 4.2,
            isHoming: true,
            type: "torpedo",
            radius: 6.5,
            damage: 20,
            color: "#fbbf24"
          });

          Sound.playHeavyShot();
          Sound.playBeam();
        } else {
          // Fase Normal: Cuádruple plasma carmesí + 2 proyectiles directos al jugador
          [-32, -12, 12, 32].forEach(ox => {
            enemyProjectiles.push({
              x: boss.x + ox,
              y: boss.y + 42,
              vx: ox * 0.05,
              vy: 6.0,
              type: "plasma_orb",
              radius: 6.5,
              damage: 20,
              color: "#ff0055"
            });
          });

          const dx = player.x - boss.x;
          const dy = Math.max(60, player.y - boss.y);
          const dist = Math.hypot(dx, dy);
          [-0.2, 0.2].forEach(offsetAngle => {
            const baseAng = Math.atan2(dy, dx) + offsetAngle;
            enemyProjectiles.push({
              x: boss.x,
              y: boss.y + 45,
              vx: Math.cos(baseAng) * 7.0,
              vy: Math.sin(baseAng) * 7.0,
              type: "imperial_bolt",
              radius: 7.0,
              damage: 24,
              color: "#fbbf24"
            });
          });

          Sound.playHeavyShot();
        }
        break;
      }
    }
  },

  // ==========================================
  // 4. RENDERIZADO VECTORIAL EXCLUSIVO (10 NAVES)
  // ==========================================

  /**
   * Dibuja exclusivamente el modelo de la nave del Boss o Subboss
   * Permite reutilización exacta tanto en el campo de batalla como en
   * los hologramas del Briefing y los banners de inicio.
   */
  drawBossShip(ctx, boss, halfW, halfH) {
    const time = performance.now();
    const slug = boss.slug || (boss.isFinalBoss ? "boss_general_vektor" : "mid_aurora_9");

    switch (slug) {
      // ----------------------------------------------------
      // MODELO 1: AURORA-9 (Bombardero Furtivo Suborbital)
      // ----------------------------------------------------
      case "mid_aurora_9": {
        // Chasis ala delta facetada furtiva
        ctx.fillStyle = "#0c1524";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.9);
        ctx.lineTo(halfW * 0.28, halfH * 0.2);
        ctx.lineTo(halfW * 0.95, -halfH * 0.35);
        ctx.lineTo(halfW * 0.85, -halfH * 0.85);
        ctx.lineTo(halfW * 0.3, -halfH * 0.55);
        ctx.lineTo(0, -halfH * 0.95);
        ctx.lineTo(-halfW * 0.3, -halfH * 0.55);
        ctx.lineTo(-halfW * 0.85, -halfH * 0.85);
        ctx.lineTo(-halfW * 0.95, -halfH * 0.35);
        ctx.lineTo(-halfW * 0.28, halfH * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Paneles alares interiores en azul polar
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.6);
        ctx.lineTo(halfW * 0.7, -halfH * 0.25);
        ctx.lineTo(halfW * 0.25, -halfH * 0.45);
        ctx.lineTo(0, -halfH * 0.75);
        ctx.lineTo(-halfW * 0.25, -halfH * 0.45);
        ctx.lineTo(-halfW * 0.7, -halfH * 0.25);
        ctx.closePath();
        ctx.fill();

        // Toberas gemelas con resplandor criogénico
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(-halfW * 0.55, -halfH * 0.85, 6, 12);
        ctx.fillRect(halfW * 0.55 - 6, -halfH * 0.85, 6, 12);

        // Cabina HUD angular
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ----------------------------------------------------
      // MODELO 2: NAUTILUS-X (Corbeta Sumergible Catamarán)
      // ----------------------------------------------------
      case "mid_nautilus_x": {
        // Catamarán hidroala de doble casco
        ctx.fillStyle = "#042023";
        ctx.strokeStyle = "#14b8a6";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#14b8a6";
        ctx.shadowBlur = 12;

        // Casco Izquierdo
        ctx.beginPath();
        ctx.moveTo(-halfW * 0.85, halfH * 0.8);
        ctx.lineTo(-halfW * 0.45, halfH * 0.5);
        ctx.lineTo(-halfW * 0.4, -halfH * 0.85);
        ctx.lineTo(-halfW * 0.85, -halfH * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Casco Derecho
        ctx.beginPath();
        ctx.moveTo(halfW * 0.85, halfH * 0.8);
        ctx.lineTo(halfW * 0.45, halfH * 0.5);
        ctx.lineTo(halfW * 0.4, -halfH * 0.85);
        ctx.lineTo(halfW * 0.85, -halfH * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Puente central presurizado
        ctx.fillStyle = "#0d9488";
        ctx.fillRect(-halfW * 0.4, -halfH * 0.25, halfW * 0.8, halfH * 0.65);
        ctx.strokeStyle = "#5eead4";
        ctx.strokeRect(-halfW * 0.4, -halfH * 0.25, halfW * 0.8, halfH * 0.65);

        // Ojo de buey / domo de comando
        ctx.fillStyle = "#5eead4";
        ctx.beginPath();
        ctx.arc(0, halfH * 0.05, 7, 0, Math.PI * 2);
        ctx.fill();

        // Branquias de emisión bioluminiscente
        ctx.strokeStyle = "#2dd4bf";
        ctx.lineWidth = 1.5;
        [-halfW * 0.65, halfW * 0.65].forEach(x => {
          ctx.beginPath();
          ctx.moveTo(x, -halfH * 0.3);
          ctx.lineTo(x, halfH * 0.3);
          ctx.stroke();
        });
        break;
      }

      // ----------------------------------------------------
      // MODELO 3: JOVIAN CORE (Sonda de Fusión Gravitatoria)
      // ----------------------------------------------------
      case "mid_jovian_core": {
        const ringAngle = time * 0.0022;

        // Anillo giroscópico exterior (Giro en perspectiva 3D simulada)
        ctx.save();
        ctx.strokeStyle = "#ea580c";
        ctx.lineWidth = 2.8;
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW * 0.95, halfH * 0.45 * Math.cos(ringAngle), 0, 0, Math.PI * 2);
        ctx.stroke();

        // 4 nodos gravitatorios en los polos del anillo
        for (let i = 0; i < 4; i++) {
          const ang = ringAngle + (i * Math.PI) / 2;
          const nx = Math.cos(ang) * (halfW * 0.95);
          const ny = Math.sin(ang) * (halfH * 0.45 * Math.cos(ringAngle));
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Núcleo esférico de plasma solar incandescente
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.arc(0, 0, halfW * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(0, 0, halfW * 0.32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(0, 0, halfW * 0.18, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ----------------------------------------------------
      // MODELO 4: FROST-BITE (Caminante Glacial Criogénico)
      // ----------------------------------------------------
      case "mid_frost_bite": {
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#7dd3fc";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;

        // Garras estabilizadoras hidráulicas laterales
        [-halfW * 0.8, halfW * 0.8].forEach(gx => {
          ctx.beginPath();
          ctx.moveTo(gx * 0.4, -halfH * 0.5);
          ctx.lineTo(gx, -halfH * 0.1);
          ctx.lineTo(gx * 1.1, halfH * 0.7);
          ctx.lineTo(gx * 0.8, halfH * 0.85);
          ctx.lineTo(gx * 0.5, halfH * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });

        // Chasis central angular de meca
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.85);
        ctx.lineTo(halfW * 0.4, halfH * 0.2);
        ctx.lineTo(halfW * 0.45, -halfH * 0.7);
        ctx.lineTo(-halfW * 0.45, -halfH * 0.7);
        ctx.lineTo(-halfW * 0.4, halfH * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cañón criogénico frontal sobredimensionado
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(-4, halfH * 0.4, 8, halfH * 0.5);

        // Vórtice de nitrógeno líquido en el pecho
        ctx.fillStyle = "#bae6fd";
        ctx.beginPath();
        ctx.arc(0, -halfH * 0.15, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ----------------------------------------------------
      // MODELO 5: JUNGLE-BEAST (Meca Blindado Selvático)
      // ----------------------------------------------------
      case "mid_jungle_beast": {
        ctx.fillStyle = "#142409";
        ctx.strokeStyle = "#84cc16";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#84cc16";
        ctx.shadowBlur = 12;

        // Torretas Gatling en los hombros
        [-halfW * 0.75, halfW * 0.75 - 12].forEach(tx => {
          ctx.fillStyle = "#365314";
          ctx.fillRect(tx, -halfH * 0.75, 12, halfH * 0.7);
          ctx.fillStyle = "#84cc16";
          ctx.fillRect(tx + 2, halfH * -0.05, 8, halfH * 0.75); // Cañones dobles
        });

        // Torso blindado hexagonal
        ctx.fillStyle = "#1e3a0f";
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.85);
        ctx.lineTo(halfW * 0.5, halfH * 0.35);
        ctx.lineTo(halfW * 0.45, -halfH * 0.6);
        ctx.lineTo(0, -halfH * 0.85);
        ctx.lineTo(-halfW * 0.45, -halfH * 0.6);
        ctx.lineTo(-halfW * 0.5, halfH * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Visor óptico militar carmesí
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.fillRect(-halfW * 0.22, -halfH * 0.1, halfW * 0.44, 4);
        break;
      }

      // ====================================================
      // MODELO 6: GOLIATH APEX (Fortaleza Aérea Polar)
      // ====================================================
      case "boss_goliath_apex": {
        ctx.fillStyle = "#0c1a2e";
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 3.2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 16;

        // Ala volante de asedio con rompehielos angular
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.95);
        ctx.lineTo(halfW * 0.35, halfH * 0.5);
        ctx.lineTo(halfW * 0.95, -halfH * 0.2);
        ctx.lineTo(halfW * 0.85, -halfH * 0.85);
        ctx.lineTo(halfW * 0.45, -halfH * 0.7);
        ctx.lineTo(halfW * 0.2, -halfH * 0.95);
        ctx.lineTo(-halfW * 0.2, -halfH * 0.95);
        ctx.lineTo(-halfW * 0.45, -halfH * 0.7);
        ctx.lineTo(-halfW * 0.85, -halfH * 0.85);
        ctx.lineTo(-halfW * 0.95, -halfH * 0.2);
        ctx.lineTo(-halfW * 0.35, halfH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cuatro turbinas traseras pesadas
        ctx.fillStyle = "#38bdf8";
        [-halfW * 0.65, -halfW * 0.35, halfW * 0.35 - 8, halfW * 0.65 - 8].forEach(tx => {
          ctx.fillRect(tx, -halfH * 0.85, 8, 14);
        });

        // Baterías de asedio en las alas
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(-halfW * 0.88, -halfH * 0.1, 7, 24);
        ctx.fillRect(halfW * 0.88 - 7, -halfH * 0.1, 7, 24);

        // Puesto de mando blindado con reactor azul
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ====================================================
      // MODELO 7: LEVIATHAN COLOSSUS (Acorazado Suborbital)
      // ====================================================
      case "boss_leviathan_colossus": {
        ctx.fillStyle = "#052220";
        ctx.strokeStyle = "#0d9488";
        ctx.lineWidth = 3.2;
        ctx.shadowColor = "#14b8a6";
        ctx.shadowBlur = 16;

        // Casco blindado con espinas tipo dragón marino / kraken
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.95);
        ctx.lineTo(halfW * 0.45, halfH * 0.55);
        ctx.lineTo(halfW * 0.88, halfH * 0.15);
        ctx.lineTo(halfW * 0.75, -halfH * 0.45);
        ctx.lineTo(halfW * 0.92, -halfH * 0.75);
        ctx.lineTo(halfW * 0.3, -halfH * 0.85);
        ctx.lineTo(0, -halfH * 0.6);
        ctx.lineTo(-halfW * 0.3, -halfH * 0.85);
        ctx.lineTo(-halfW * 0.92, -halfH * 0.75);
        ctx.lineTo(-halfW * 0.75, -halfH * 0.45);
        ctx.lineTo(-halfW * 0.88, halfH * 0.15);
        ctx.lineTo(-halfW * 0.45, halfH * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Flancos bioluminiscentes verde esmeralda
        ctx.strokeStyle = "#2dd4bf";
        ctx.lineWidth = 2.0;
        [-halfW * 0.5, halfW * 0.5].forEach(fx => {
          ctx.beginPath();
          ctx.arc(fx, -halfH * 0.1, 14, 0, Math.PI);
          ctx.stroke();
        });

        // Triple tubo de torpedo hidromagnético ventral
        ctx.fillStyle = "#14b8a6";
        [-10, 0, 10].forEach(tx => {
          ctx.fillRect(tx - 3, halfH * 0.65, 6, 12);
        });

        // Reactor abisal
        ctx.fillStyle = "#99f6e4";
        ctx.beginPath();
        ctx.arc(0, -halfH * 0.05, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ====================================================
      // MODELO 8: GANYMEDE TITAN (Estación Orbital Joviana)
      // ====================================================
      case "boss_ganymede_titan": {
        ctx.fillStyle = "#291307";
        ctx.strokeStyle = "#ea580c";
        ctx.lineWidth = 3.2;
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 18;

        // Superestructura hexagonal acorazada
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.85);
        ctx.lineTo(halfW * 0.85, halfH * 0.4);
        ctx.lineTo(halfW * 0.95, -halfH * 0.4);
        ctx.lineTo(halfW * 0.5, -halfH * 0.9);
        ctx.lineTo(-halfW * 0.5, -halfH * 0.9);
        ctx.lineTo(-halfW * 0.95, -halfH * 0.4);
        ctx.lineTo(-halfW * 0.85, halfH * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Reactores de fusión gemelos a los costados
        [-halfW * 0.75, halfW * 0.75].forEach(rx => {
          ctx.fillStyle = "#c2410c";
          ctx.beginPath();
          ctx.arc(rx, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fb923c";
          ctx.beginPath();
          ctx.arc(rx, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(rx, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Acelerador magnético / Railgun central
        ctx.fillStyle = "#7c2d12";
        ctx.fillRect(-7, -halfH * 0.85, 14, halfH * 1.6);
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-7, -halfH * 0.85, 14, halfH * 1.6);
        break;
      }

      // ====================================================
      // MODELO 9: ZERO-KELVIN (Destructor Criogénico Absoluto)
      // ====================================================
      case "boss_zero_kelvin": {
        ctx.fillStyle = "#0c2033";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3.0;
        ctx.shadowColor = "#bae6fd";
        ctx.shadowBlur = 18;

        // Alas de cristal fractal en cruz geométrica
        ctx.beginPath();
        ctx.moveTo(0, halfH);
        ctx.lineTo(halfW * 0.35, halfH * 0.4);
        ctx.lineTo(halfW, halfH * 0.6);
        ctx.lineTo(halfW * 0.7, 0);
        ctx.lineTo(halfW * 0.95, -halfH * 0.7);
        ctx.lineTo(halfW * 0.35, -halfH * 0.4);
        ctx.lineTo(0, -halfH * 0.95);
        ctx.lineTo(-halfW * 0.35, -halfH * 0.4);
        ctx.lineTo(-halfW * 0.95, -halfH * 0.7);
        ctx.lineTo(-halfW * 0.7, 0);
        ctx.lineTo(-halfW, halfH * 0.6);
        ctx.lineTo(-halfW * 0.35, halfH * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Facetas internas de diamante de hielo
        ctx.strokeStyle = "rgba(224, 242, 254, 0.7)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.7);
        ctx.lineTo(halfW * 0.6, 0);
        ctx.lineTo(0, -halfH * 0.7);
        ctx.lineTo(-halfW * 0.6, 0);
        ctx.closePath();
        ctx.stroke();

        // Núcleo Bose-Einstein de Cero Absoluto
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ====================================================
      // MODELO 10: GENERAL VEKTOR (Supremo Dreadnought Apex)
      // ====================================================
      case "boss_general_vektor":
      default: {
        const isEnraged = (boss.health / boss.maxHealth) <= 0.40;

        // Aura de Sobrecarga Imperial cuando entra en Furia
        if (isEnraged) {
          ctx.save();
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 4.0;
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 28;
          ctx.beginPath();
          ctx.arc(0, 0, halfW * 1.05 + Math.sin(time * 0.01) * 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Casco de nanocarbono negro obsidiana con alas de águila imperial
        ctx.fillStyle = "#120a17";
        ctx.strokeStyle = isEnraged ? "#fbbf24" : "#ff0055";
        ctx.lineWidth = 3.6;
        ctx.shadowColor = isEnraged ? "#fbbf24" : "#ff0055";
        ctx.shadowBlur = isEnraged ? 24 : 18;

        ctx.beginPath();
        ctx.moveTo(0, halfH);
        ctx.lineTo(halfW * 0.35, halfH * 0.65);
        ctx.lineTo(halfW * 0.95, halfH * 0.2);
        ctx.lineTo(halfW * 0.85, -halfH * 0.45);
        ctx.lineTo(halfW, -halfH * 0.85);
        ctx.lineTo(halfW * 0.45, -halfH * 0.7);
        ctx.lineTo(0, -halfH * 0.95);
        ctx.lineTo(-halfW * 0.45, -halfH * 0.7);
        ctx.lineTo(-halfW, -halfH * 0.85);
        ctx.lineTo(-halfW * 0.85, -halfH * 0.45);
        ctx.lineTo(-halfW * 0.95, halfH * 0.2);
        ctx.lineTo(-halfW * 0.35, halfH * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Filamentos y alas doradas imperiales
        ctx.fillStyle = isEnraged ? "#fbbf24" : "#d97706";
        [-halfW * 0.75, halfW * 0.75 - 8].forEach(wx => {
          ctx.fillRect(wx, -halfH * 0.3, 8, halfH * 0.6);
        });

        // Baterías cuádruples de asalto pesado
        ctx.fillStyle = "#ff0055";
        [-halfW * 0.5, -halfW * 0.25, halfW * 0.25 - 6, halfW * 0.5 - 6].forEach(bx => {
          ctx.fillRect(bx, halfH * 0.45, 6, 16);
        });

        // Núcleo de Hipermateria de Vektor
        ctx.fillStyle = isEnraged ? "#ffffff" : "#ff0055";
        ctx.beginPath();
        ctx.arc(0, -halfH * 0.1, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isEnraged ? "#fbbf24" : "#ffffff";
        ctx.beginPath();
        ctx.arc(0, -halfH * 0.1, 7, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  },

  // ==========================================
  // 5. RENDERIZADO COMPLETO CON HUD SUPERIOR
  // ==========================================
  drawBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    const halfW = boss.width / 2;
    const halfH = boss.height / 2;

    // 1. Dibujar el modelo vectorial exclusivo del Jefe
    this.drawBossShip(ctx, boss, halfW, halfH);

    // 2. Barra de salud superior y placa de identificación
    const barWidth = Math.max(boss.width * 1.35, 95);
    const barHeight = boss.isFinalBoss ? 7 : 5.5;
    const barX = -barWidth / 2;
    const barY = -halfH - 18;

    const isEnraged = boss.isFinalBoss && (boss.health / boss.maxHealth <= 0.40);

    // Placa con Nombre y Rango
    ctx.font = boss.isFinalBoss ? "bold 10px 'Orbitron', monospace" : "bold 9px 'Orbitron', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = isEnraged ? "#fbbf24" : (boss.isFinalBoss ? "#ff0055" : (boss.color || "#38bdf8"));
    ctx.shadowBlur = 6;
    ctx.shadowColor = ctx.fillStyle;

    const bossDisplayName = isEnraged ? `⚡ ${boss.name} [SOBRECARGA] ⚡` : boss.name;
    ctx.fillText(bossDisplayName, 0, barY - 6);

    // Marco exterior de la barra
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.strokeStyle = isEnraged ? "rgba(251, 191, 36, 0.9)" : (boss.isFinalBoss ? "rgba(255, 0, 85, 0.6)" : "rgba(56, 189, 248, 0.5)");
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Relleno de vida proporcional
    const healthRatio = Math.max(0, boss.health / boss.maxHealth);
    ctx.fillStyle = isEnraged
      ? "#fbbf24"
      : (boss.isFinalBoss
        ? (healthRatio > 0.3 ? "#f43f5e" : "#ef4444")
        : (healthRatio > 0.3 ? (boss.color || "#38bdf8") : "#ef4444"));

    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.restore();
  }
};
