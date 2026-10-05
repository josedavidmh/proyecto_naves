/**
 * Catálogo, Inteligencia Artificial y Renderizado Vectorial de Enemigos Progresivos
 * 
 * En la Fase 1 operan los Cazas Interceptores clásicos.
 * A medida que la fase se incrementa (Fases 2, 3, 4 y 5), nuevos enemigos con habilidades únicas
 * se van sumando y complementando a la flota existente, creando formaciones tácticas ricas y desafiantes.
 */

import { Sound } from "./sound_fx.js";

export const EnemyCatalog = {
  // Definición de tipos de enemigos
  TYPES: {
    scout_interceptor: {
      type: "scout_interceptor",
      name: "Caza Interceptor Alfa",
      title: "Explorador Ligero de Vanguardia",
      introducedStage: 1,
      formidableLevel: 1,
      badge: "NIVEL 1 · BÁSICO",
      badgeColor: "#f97316",
      scoreValue: 180,
      width: 34,
      height: 34,
      color: "#f97316",
      accentColor: "#ef4444",
      abilityName: "Láser Cinético Recto",
      abilityDesc: "Ráfagas estándar lineales de velocidad constante. Carne de cañón básica.",
      tacticalAdvice: "Maniobrable pero frágil; destrúyelo con fuego rápido continuo.",
      shootInterval: 1.8,
      baseHealth: 38
    },

    torpedo_frigate: {
      type: "torpedo_frigate",
      name: "Torpedero Abisal Nautilus",
      title: "Corbeta Pesada de Asalto Oceánico",
      introducedStage: 2,
      formidableLevel: 2,
      badge: "NIVEL 2 · INTERMEDIO",
      badgeColor: "#06b6d4",
      scoreValue: 360,
      width: 44,
      height: 40,
      color: "#06b6d4",
      accentColor: "#14b8a6",
      abilityName: "Torpedo Teledirigido Homing",
      abilityDesc: "Dispara torpedos pesados de plasma acuático que corrigen su rumbo lateral buscando al jugador.",
      tacticalAdvice: "No te quedes quieto en el mismo carril horizontal; muévete en diagonal para evadir el torpedo.",
      shootInterval: 2.2,
      baseHealth: 85
    },

    shield_warden: {
      type: "shield_warden",
      name: "Baluarte de Escudo Joviano",
      title: "Crucero Blindado de Defensa Orbital",
      introducedStage: 3,
      formidableLevel: 3,
      badge: "NIVEL 3 · FORMIDABLE",
      badgeColor: "#a855f7",
      scoreValue: 650,
      width: 50,
      height: 44,
      color: "#a855f7",
      accentColor: "#f59e0b",
      abilityName: "Matriz de Escudo Deflector + Pulso Dual",
      abilityDesc: "Protegido por una barrera de energía de 80 HP que absorbe daño directo y dispara en ángulo de 30°.",
      tacticalAdvice: "Concentra disparos pesados o habilidades especiales para colapsar su escudo protector.",
      shootInterval: 2.4,
      baseHealth: 135,
      shieldCapacity: 80
    },

    frost_phantom: {
      type: "frost_phantom",
      name: "Espectro Glacial Criogénico",
      title: "Interceptor Furtivo de Salto Espectral",
      introducedStage: 4,
      formidableLevel: 4,
      badge: "NIVEL 4 · MUY FORMIDABLE",
      badgeColor: "#38bdf8",
      scoreValue: 950,
      width: 40,
      height: 38,
      color: "#38bdf8",
      accentColor: "#e0f2fe",
      abilityName: "Salto Evasivo Criogénico & Agujas de Hielo",
      abilityDesc: "Teletransporte táctico lateral al esquivar disparos y contraataque con abanico triple de agujas de hielo rápidas.",
      tacticalAdvice: "Atácalo con armas de dispersión amplia o proyectiles teledirigidos para atraparlo tras su salto.",
      shootInterval: 2.0,
      baseHealth: 120
    },

    siege_dreadnought: {
      type: "siege_dreadnought",
      name: "Acorazado de Asedio Titán Vektor",
      title: "Buque Insignia Dreadnought de Asedio",
      introducedStage: 5,
      formidableLevel: 5,
      badge: "NIVEL 5 · LETAL / SEMI-BOSS",
      badgeColor: "#e11d48",
      scoreValue: 1600,
      width: 64,
      height: 54,
      color: "#e11d48",
      accentColor: "#fbbf24",
      abilityName: "Salva Pesada Cuádruple & Metralla Reactiva",
      abilityDesc: "Salvas devastadoras de 4 proyectiles y detonación en racimo de metralla en cruz al morir.",
      tacticalAdvice: "Objetivo de máxima prioridad. Al destruirlo, aléjate inmediatamente para no ser alcanzado por su metralla.",
      shootInterval: 1.7,
      baseHealth: 260
    }
  },

  /**
   * Obtiene la lista de tipos de enemigos desbloqueados hasta la fase actual.
   * Fase 1: Solo Caza Alfa.
   * Fase 2: Caza Alfa + Torpedero.
   * Fase 3: Caza Alfa + Torpedero + Baluarte.
   * Fase 4: Caza Alfa + Torpedero + Baluarte + Espectro Glacial.
   * Fase 5: Flota completa combinada (los 5 tipos).
   */
  getAvailableTypes(stageNumber) {
    const stage = Math.max(1, Math.min(5, stageNumber || 1));
    const pool = ["scout_interceptor"];

    if (stage >= 2) pool.push("torpedo_frigate");
    if (stage >= 3) pool.push("shield_warden");
    if (stage >= 4) pool.push("frost_phantom");
    if (stage >= 5) pool.push("siege_dreadnought");

    return pool;
  },

  /**
   * Selección inteligente ponderada según la fase actual
   */
  getRandomType(stageNumber) {
    const stage = Math.max(1, Math.min(5, stageNumber || 1));
    const r = Math.random();

    switch (stage) {
      case 1:
        // En Fase 1: 100% Caza Interceptor Alfa clásico
        return "scout_interceptor";

      case 2:
        // Fase 2: 55% Caza Interceptor, 45% Torpedero Abisal
        return r < 0.55 ? "scout_interceptor" : "torpedo_frigate";

      case 3:
        // Fase 3: 40% Caza, 35% Torpedero, 25% Baluarte Joviano
        if (r < 0.40) return "scout_interceptor";
        if (r < 0.75) return "torpedo_frigate";
        return "shield_warden";

      case 4:
        // Fase 4: 30% Caza, 25% Torpedero, 25% Baluarte, 20% Espectro Glacial
        if (r < 0.30) return "scout_interceptor";
        if (r < 0.55) return "torpedo_frigate";
        if (r < 0.80) return "shield_warden";
        return "frost_phantom";

      case 5:
      default:
        // Fase 5: Todos en combate activo.
        // 24% Caza, 22% Torpedero, 20% Baluarte, 18% Espectro Glacial, 16% Acorazado Titán
        if (r < 0.24) return "scout_interceptor";
        if (r < 0.46) return "torpedo_frigate";
        if (r < 0.66) return "shield_warden";
        if (r < 0.84) return "frost_phantom";
        return "siege_dreadnought";
    }
  },

  /**
   * Crea una instancia de enemigo inicializada y equilibrada
   */
  createEnemy(stageNumber, canvasWidth) {
    const stage = Math.max(1, Math.min(5, stageNumber || 1));
    const typeKey = this.getRandomType(stage);
    const def = this.TYPES[typeKey];

    const margin = 40;
    const x = Math.random() * (canvasWidth - margin * 2) + margin;
    const y = -45;

    // Escalado equilibrado de salud según el área
    const stageScale = (stage - 1) * 8;
    const maxHp = def.baseHealth + stageScale;

    const enemy = {
      type: def.type,
      name: def.name,
      title: def.title,
      color: def.color,
      accentColor: def.accentColor,
      isBoss: false,
      scoreValue: def.scoreValue,
      formidableLevel: def.formidableLevel,
      isFormidable: def.formidableLevel >= 2,

      x,
      y,
      width: def.width,
      height: def.height,
      health: maxHp,
      maxHealth: maxHp,
      shootInterval: def.shootInterval + (Math.random() * 0.4 - 0.2),
      lastShotTime: Math.random() * 0.8,
      age: 0,

      // Atributos de movimiento
      vy: 2.2,
      vxAmp: 2.2,
      vx: 0,

      // Parámetros específicos de habilidades
      shield: def.shieldCapacity ? def.shieldCapacity : 0,
      maxShield: def.shieldCapacity ? def.shieldCapacity : 0,
      shieldGlow: 0,
      blinkTimer: 0,
      blinkGhost: null,
      isBlinking: false
    };

    // Ajustes tácticos de movimiento por tipo
    switch (enemy.type) {
      case "scout_interceptor":
        enemy.vy = 2.4 + Math.random() * 1.2;
        enemy.vxAmp = 2.5;
        break;

      case "torpedo_frigate":
        enemy.vy = 1.9 + Math.random() * 0.8;
        enemy.vxAmp = 1.8;
        break;

      case "shield_warden":
        enemy.vy = 1.4 + Math.random() * 0.5;
        enemy.vxAmp = 1.2;
        break;

      case "frost_phantom":
        enemy.vy = 2.6 + Math.random() * 1.0;
        enemy.vxAmp = 3.5;
        enemy.blinkTimer = 1.8 + Math.random() * 0.8;
        break;

      case "siege_dreadnought":
        enemy.vy = 1.1 + Math.random() * 0.4;
        enemy.vxAmp = 1.0;
        break;
    }

    return enemy;
  },

  /**
   * Actualiza la IA y activa las habilidades de cada enemigo
   */
  updateEnemyAI(enemy, dt, player, enemyProjectiles, engine) {
    enemy.age += dt;
    enemy.lastShotTime = (enemy.lastShotTime || 0) + dt;

    // Desvanecer estela fantasma de parpadeo (frost_phantom)
    if (enemy.blinkGhost) {
      enemy.blinkGhost.alpha -= dt * 2.5;
      if (enemy.blinkGhost.alpha <= 0) {
        enemy.blinkGhost = null;
      }
    }

    // 1. COMPORTAMIENTO DE MOVIMIENTO
    switch (enemy.type) {
      case "scout_interceptor":
        // Vuelo sinusoidal descendente clásico
        enemy.y += enemy.vy;
        enemy.x += Math.sin(enemy.y * 0.03) * enemy.vxAmp;
        break;

      case "torpedo_frigate":
        // Descenso táctico firme con oscilación suave
        enemy.y += enemy.vy;
        enemy.x += Math.sin(enemy.age * 2.0) * (enemy.vxAmp * 0.9);
        break;

      case "shield_warden":
        // Avance lento y pesado de tanque protector
        enemy.y += enemy.vy;
        enemy.x += Math.cos(enemy.age * 1.4) * enemy.vxAmp;
        // Regeneración gradual de escudo si no ha sido dañado en 4.5s
        if (enemy.shield < enemy.maxShield && enemy.age > 4.0) {
          enemy.shield = Math.min(enemy.maxShield, enemy.shield + dt * 6);
        }
        break;

      case "frost_phantom":
        // Movimiento en zigzag veloz con temporizador de parpadeo criogénico
        enemy.y += enemy.vy;
        enemy.x += Math.sin(enemy.age * 4.0) * enemy.vxAmp;

        enemy.blinkTimer -= dt;
        if (enemy.blinkTimer <= 0) {
          this.triggerCryoBlink(enemy, engine, enemyProjectiles);
          enemy.blinkTimer = 2.4 + Math.random() * 1.2;
        }
        break;

      case "siege_dreadnought":
        // Coloso blindado que avanza imponiéndose en el centro
        enemy.y += enemy.vy;
        enemy.x += Math.sin(enemy.age * 1.0) * (enemy.vxAmp * 0.8);
        break;
    }

    // 2. DISPAROS Y HABILIDADES ACTIVAS
    if (enemy.lastShotTime > enemy.shootInterval) {
      enemy.lastShotTime = 0;
      this.fireEnemyAbility(enemy, player, enemyProjectiles, engine);
    }
  },

  /**
   * Ejecuta el disparo o habilidad activa según el tipo de nave
   */
  fireEnemyAbility(enemy, player, enemyProjectiles, engine) {
    const midX = enemy.x;
    const midY = enemy.y + enemy.height * 0.5;

    switch (enemy.type) {
      case "scout_interceptor":
        // Habilidad 1: Láser recto estándar (clásico Fase 1)
        enemyProjectiles.push({
          x: midX,
          y: midY,
          vx: 0,
          vy: 5.5,
          damage: 12,
          color: "#f97316",
          radius: 4.5,
          type: "kinetic"
        });
        break;

      case "torpedo_frigate":
        // Habilidad 2: Torpedo Homing Abisal Teledirigido
        Sound.playHeavyShot();
        enemyProjectiles.push({
          x: midX,
          y: midY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 4.2,
          damage: 18,
          color: "#06b6d4",
          radius: 7.0,
          isHoming: true,
          type: "torpedo"
        });
        // Disparo de apoyo menor
        enemyProjectiles.push({
          x: midX - 14,
          y: midY - 6,
          vx: -1.2,
          vy: 5.0,
          damage: 10,
          color: "#14b8a6",
          radius: 3.5,
          type: "kinetic"
        });
        enemyProjectiles.push({
          x: midX + 14,
          y: midY - 6,
          vx: 1.2,
          vy: 5.0,
          damage: 10,
          color: "#14b8a6",
          radius: 3.5,
          type: "kinetic"
        });
        break;

      case "shield_warden":
        // Habilidad 3: Pulso de Dispersión Dual con carga electromagnética
        Sound.playBeam();
        enemyProjectiles.push({
          x: midX - 16,
          y: midY,
          vx: -1.8,
          vy: 4.8,
          damage: 16,
          color: "#a855f7",
          radius: 5.5,
          type: "plasma"
        });
        enemyProjectiles.push({
          x: midX + 16,
          y: midY,
          vx: 1.8,
          vy: 4.8,
          damage: 16,
          color: "#a855f7",
          radius: 5.5,
          type: "plasma"
        });
        break;

      case "frost_phantom":
        // Habilidad 4: Ráfaga Tridireccional de Agujas Criogénicas
        Sound.playLaser();
        [-2.4, 0, 2.4].forEach(vx => {
          enemyProjectiles.push({
            x: midX,
            y: midY,
            vx,
            vy: 6.8,
            damage: 14,
            color: "#38bdf8",
            radius: 4.0,
            isFrost: true,
            type: "frost_needle"
          });
        });
        break;

      case "siege_dreadnought":
        // Habilidad 5: Salva Devastadora Cuádruple de Asedio
        Sound.playHeavyShot();
        [-2.6, -0.9, 0.9, 2.6].forEach(vx => {
          enemyProjectiles.push({
            x: midX + vx * 6,
            y: midY,
            vx,
            vy: 5.6,
            damage: 22,
            color: "#e11d48",
            radius: 6.0,
            type: "heavy_plasma"
          });
        });
        break;
    }
  },

  /**
   * Habilidad Especial de Salto Espectral (Frost Phantom)
   */
  triggerCryoBlink(enemy, engine, enemyProjectiles) {
    if (enemy.isBoss) return;

    // Crear clon fantasma en la posición anterior
    enemy.blinkGhost = {
      x: enemy.x,
      y: enemy.y,
      alpha: 0.8
    };

    // Destello de partículas de escarcha
    if (engine && engine.createExplosionParticles) {
      engine.createExplosionParticles(enemy.x, enemy.y, "#38bdf8", 12);
    }

    // Salto lateral evasivo de 75-115px
    const dir = enemy.x > engine.canvas.width / 2 ? -1 : 1;
    const jumpDist = (75 + Math.random() * 40) * dir;
    enemy.x = Math.max(40, Math.min(engine.canvas.width - 40, enemy.x + jumpDist));

    Sound.playLaser();

    // Contraataque inmediato tras el salto
    if (enemyProjectiles) {
      [-2.2, 0, 2.2].forEach(vx => {
        enemyProjectiles.push({
          x: enemy.x,
          y: enemy.y + enemy.height / 2,
          vx,
          vy: 7.2,
          damage: 14,
          color: "#38bdf8",
          radius: 4.2,
          isFrost: true,
          type: "frost_needle"
        });
      });
    }

    if (engine && engine.addFloatingText) {
      engine.addFloatingText(enemy.x, enemy.y - 12, "¡SALTO CRIOGÉNICO!", "#38bdf8");
    }
  },

  /**
   * Procesa daño recibido por un enemigo (gestiona escudos y esquivas reactivas)
   */
  handleDamage(enemy, rawDamage, engine, hitX, hitY) {
    let effectiveDamage = rawDamage;

    // 1. Intercepción por escudo de energía (Shield Warden)
    if (enemy.shield && enemy.shield > 0) {
      enemy.shieldGlow = 1.0;
      if (enemy.shield >= effectiveDamage) {
        enemy.shield -= effectiveDamage;
        effectiveDamage = 0;
        if (engine && engine.createHitSparks) {
          engine.createHitSparks(hitX, hitY, "#a855f7");
        }
      } else {
        effectiveDamage -= enemy.shield;
        enemy.shield = 0;
        Sound.playExplosion();
        if (engine && engine.addFloatingText) {
          engine.addFloatingText(enemy.x, enemy.y - 16, "¡ESCUDO COLAPSADO!", "#a855f7");
        }
        if (engine && engine.createExplosionParticles) {
          engine.createExplosionParticles(enemy.x, enemy.y, "#a855f7", 14);
        }
      }
    }

    // 2. Evasión reactiva por parpadeo criogénico (Frost Phantom)
    if (enemy.type === "frost_phantom" && Math.random() < 0.40 && enemy.blinkTimer > 0.5) {
      this.triggerCryoBlink(enemy, engine, engine.enemyProjectiles);
      enemy.blinkTimer = 2.2;
    }

    // 3. Aplicar daño al casco
    if (effectiveDamage > 0) {
      enemy.health -= effectiveDamage;
      if (engine && engine.createHitSparks) {
        engine.createHitSparks(hitX, hitY, enemy.color || "#00f3ff");
      }
    }

    return effectiveDamage;
  },

  /**
   * Efectos especiales al destruir un enemigo según su tipo
   */
  handleDefeat(enemy, engine) {
    // 1. Detonación de Metralla Reactiva (Siege Dreadnought en Fase 5)
    if (enemy.type === "siege_dreadnought") {
      Sound.playBossExplosion();
      if (engine && engine.enemyProjectiles) {
        // Dispara 4 fragmentos de metralla diagonal
        [-2.8, 2.8].forEach(vx => {
          [-1.5, 3.5].forEach(vy => {
            engine.enemyProjectiles.push({
              x: enemy.x,
              y: enemy.y,
              vx,
              vy,
              damage: 10,
              radius: 4.5,
              color: "#fbbf24",
              type: "shrapnel"
            });
          });
        });
      }

      if (engine && engine.addFloatingText) {
        engine.addFloatingText(enemy.x, enemy.y - 20, "¡TITÁN ERRADICADO! +1600", "#fbbf24");
      }

      // Recompensa garantizada de Power-up en 50% de los casos
      if (Math.random() < 0.50 && engine && engine.spawnPowerup) {
        engine.spawnPowerup(enemy.x, enemy.y);
      }
    }

    // 2. Destello de escarcha al quebrar un Espectro Glacial
    if (enemy.type === "frost_phantom") {
      if (engine && engine.createExplosionParticles) {
        engine.createExplosionParticles(enemy.x, enemy.y, "#e0f2fe", 24);
        engine.createExplosionParticles(enemy.x, enemy.y, "#38bdf8", 16);
      }
      if (engine && engine.addFloatingText) {
        engine.addFloatingText(enemy.x, enemy.y, "CRYO-BURST", "#38bdf8");
      }
    }

    // 3. Onda de colapso de vacío para el Baluarte
    if (enemy.type === "shield_warden") {
      if (engine && engine.createExplosionParticles) {
        engine.createExplosionParticles(enemy.x, enemy.y, "#a855f7", 22);
      }
    }
  },

  /**
   * Renderizado Vectorial nítido de cada tipo de enemigo en Canvas 2D
   */
  drawEnemy(ctx, enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    const halfW = enemy.width / 2;
    const halfH = enemy.height / 2;

    // Dibuja fantasma traslúcido si acaba de hacer parpadeo (Frost Phantom)
    if (enemy.blinkGhost) {
      ctx.save();
      ctx.globalAlpha = enemy.blinkGhost.alpha * 0.45;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(0, halfH);
      ctx.lineTo(halfW, -halfH);
      ctx.lineTo(0, -halfH * 0.4);
      ctx.lineTo(-halfW, -halfH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    switch (enemy.type) {
      case "scout_interceptor":
      default:
        // Caza Interceptor Alfa clásico (Mantiene 100% la estética de la Fase 1)
        ctx.fillStyle = "#1c1917";
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.moveTo(0, halfH);
        ctx.lineTo(halfW, -halfH);
        ctx.lineTo(0, -halfH * 0.2);
        ctx.lineTo(-halfW, -halfH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ojo sensor carmesí
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "torpedo_frigate":
        // Torpedero Abisal Nautilus (Corbeta de asalto marítimo)
        ctx.fillStyle = "#082f49";
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 9;

        // Doble fuselaje hidrodinámico con aletas estabilizadoras
        ctx.beginPath();
        ctx.moveTo(0, halfH * 0.8);
        ctx.lineTo(halfW * 0.5, halfH * 0.3);
        ctx.lineTo(halfW, -halfH * 0.4);
        ctx.lineTo(halfW * 0.7, -halfH);
        ctx.lineTo(halfW * 0.2, -halfH * 0.6);
        ctx.lineTo(0, -halfH * 0.3);
        ctx.lineTo(-halfW * 0.2, -halfH * 0.6);
        ctx.lineTo(-halfW * 0.7, -halfH);
        ctx.lineTo(-halfW, -halfH * 0.4);
        ctx.lineTo(-halfW * 0.5, halfH * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tubos lanzadores de torpedos laterales
        ctx.fillStyle = "#14b8a6";
        ctx.fillRect(-halfW * 0.8, -halfH * 0.2, 4, 12);
        ctx.fillRect(halfW * 0.8 - 4, -halfH * 0.2, 4, 12);

        // Núcleo acuático palpitante
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "shield_warden":
        // Baluarte de Escudo Joviano (Chasis hexagonal acorazado)
        ctx.fillStyle = "#2e1065";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(0, halfH);
        ctx.lineTo(halfW, halfH * 0.3);
        ctx.lineTo(halfW * 0.85, -halfH * 0.7);
        ctx.lineTo(0, -halfH);
        ctx.lineTo(-halfW * 0.85, -halfH * 0.7);
        ctx.lineTo(-halfW, halfH * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bobina magnética central dorada
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Campo de fuerza visible si tiene escudo activo
        if (enemy.shield > 0) {
          const shieldAlpha = 0.25 + (enemy.shield / enemy.maxShield) * 0.35 + (enemy.shieldGlow || 0) * 0.4;
          ctx.strokeStyle = `rgba(168, 85, 247, ${Math.min(1.0, shieldAlpha + 0.3)})`;
          ctx.fillStyle = `rgba(168, 85, 247, ${shieldAlpha * 0.5})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 3]);
          ctx.beginPath();
          ctx.ellipse(0, 0, halfW + 9, halfH + 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);

          if (enemy.shieldGlow > 0) {
            enemy.shieldGlow = Math.max(0, enemy.shieldGlow - 0.05);
          }
        }
        break;

      case "frost_phantom":
        // Espectro Glacial Criogénico (Caza afilado de cristal de hielo)
        ctx.fillStyle = "#0c1b2e";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, halfH * 1.1); // Punta frontal afilada
        ctx.lineTo(halfW * 0.4, halfH * 0.2);
        ctx.lineTo(halfW, -halfH * 0.5);
        ctx.lineTo(halfW * 0.6, -halfH);
        ctx.lineTo(0, -halfH * 0.6);
        ctx.lineTo(-halfW * 0.6, -halfH);
        ctx.lineTo(-halfW, -halfH * 0.5);
        ctx.lineTo(-halfW * 0.4, halfH * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cristales de escarcha en las alas
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.moveTo(0, -halfH * 0.3);
        ctx.lineTo(halfW * 0.35, halfH * 0.1);
        ctx.lineTo(0, halfH * 0.6);
        ctx.lineTo(-halfW * 0.35, halfH * 0.1);
        ctx.closePath();
        ctx.fill();

        // Ojo glacial cian
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "siege_dreadnought":
        // Acorazado de Asedio Titán Vektor (Nave militar pesada)
        ctx.fillStyle = "#1c0a12";
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#e11d48";
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(-halfW * 0.3, halfH);
        ctx.lineTo(halfW * 0.3, halfH);
        ctx.lineTo(halfW * 0.6, halfH * 0.6);
        ctx.lineTo(halfW, halfH * 0.2);
        ctx.lineTo(halfW * 0.85, -halfH * 0.7);
        ctx.lineTo(halfW * 0.3, -halfH);
        ctx.lineTo(-halfW * 0.3, -halfH);
        ctx.lineTo(-halfW * 0.85, -halfH * 0.7);
        ctx.lineTo(-halfW, halfH * 0.2);
        ctx.lineTo(-halfW * 0.6, halfH * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Blindaje con detalles dorados de asedio militar
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-halfW * 0.45, -halfH * 0.5, halfW * 0.9, halfH * 0.8);

        // Cuatro cañones frontales
        ctx.fillStyle = "#e11d48";
        [-halfW * 0.4, -halfW * 0.15, halfW * 0.15, halfW * 0.4 - 4].forEach(px => {
          ctx.fillRect(px, halfH * 0.5, 4, 8);
        });

        // Núcleo de antimateria expuesto
        ctx.fillStyle = "#ff0055";
        ctx.beginPath();
        ctx.arc(0, -2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // Mini barra de salud para enemigos formidables (Nivel 2 o superior)
    if (enemy.isFormidable) {
      const barW = Math.max(enemy.width, 36);
      const barH = 4;
      const barX = -barW / 2;
      const barY = -halfH - 12;

      // Fondo de barra
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(barX, barY, barW, barH);

      // Barra de Vida
      const hpPct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = hpPct > 0.4 ? (enemy.color || "#10b981") : "#ef4444";
      ctx.fillRect(barX, barY, barW * hpPct, barH);

      // Barra de Escudo si corresponde
      if (enemy.maxShield > 0 && enemy.shield > 0) {
        const shieldPct = Math.max(0, enemy.shield / enemy.maxShield);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(barX, barY - 3, barW * shieldPct, 2);
      }
    }

    ctx.restore();
  },

  /**
   * Proporciona la información estructurada de inteligencia para el modal de briefing y manual
   */
  getIntelForStage(stageNumber) {
    const stage = Math.max(1, Math.min(5, stageNumber || 1));
    const availableTypes = this.getAvailableTypes(stage);
    const activeEnemies = availableTypes.map(key => this.TYPES[key]);
    
    // El nuevo enemigo incorporado específicamente en esta fase
    const newEnemyKey = Object.keys(this.TYPES).find(k => this.TYPES[k].introducedStage === stage);
    const newEnemy = newEnemyKey ? this.TYPES[newEnemyKey] : null;

    return {
      stage,
      activeEnemies,
      newEnemy,
      totalTypesCount: availableTypes.length
    };
  }
};
