/**
 * Renderizador Vectorial de Naves, Proyectiles y Efectos para Canvas 2D
 * Cero dependencias externas: gráficos nítidos, estilizados y escalables a 60 FPS.
 */

export const ShipRenderer = {
  /**
   * Dibuja la nave del jugador según su modelo/slug
   */
  drawPlayerShip(ctx, ship, x, y, width, height, isSpecialActive = false) {
    ctx.save();
    ctx.translate(x, y);

    const halfW = width / 2;
    const halfH = height / 2;

    // Efecto de brillo de propulsor trasero
    const thrustGlow = ctx.createRadialGradient(0, halfH, 2, 0, halfH + 15, 20);
    thrustGlow.addColorStop(0, isSpecialActive ? "#ff00ff" : "#00f3ff");
    thrustGlow.addColorStop(1, "transparent");
    ctx.fillStyle = thrustGlow;
    ctx.beginPath();
    ctx.arc(0, halfH + 6, 14, 0, Math.PI * 2);
    ctx.fill();

    // Dibuja el chasis según el slug de la nave
    switch (ship.slug) {
      case "phoenix-vanguard":
        // Caza interceptor aerodinámico y afilado
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = isSpecialActive ? "#00f3ff" : "#38bdf8";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -halfH); // Nariz
        ctx.lineTo(halfW, halfH * 0.7); // Ala derecha
        ctx.lineTo(halfW * 0.4, halfH * 0.5);
        ctx.lineTo(halfW * 0.3, halfH); // Alerón derecho
        ctx.lineTo(0, halfH * 0.6); // Centro propulsor
        ctx.lineTo(-halfW * 0.3, halfH); // Alerón izquierdo
        ctx.lineTo(-halfW * 0.4, halfH * 0.5);
        ctx.lineTo(-halfW, halfH * 0.7); // Ala izquierda
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cabina neón cian
        ctx.fillStyle = "#00f3ff";
        ctx.beginPath();
        ctx.ellipse(0, -halfH * 0.1, 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "titan-colossus":
        // Acorazado pesado de plasma, amplio y blindado
        ctx.fillStyle = "#1e1b4b";
        ctx.strokeStyle = isSpecialActive ? "#a855f7" : "#ec4899";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-halfW * 0.4, -halfH);
        ctx.lineTo(halfW * 0.4, -halfH);
        ctx.lineTo(halfW, -halfH * 0.2);
        ctx.lineTo(halfW * 0.8, halfH * 0.8);
        ctx.lineTo(halfW * 0.4, halfH);
        ctx.lineTo(-halfW * 0.4, halfH);
        ctx.lineTo(-halfW * 0.8, halfH * 0.8);
        ctx.lineTo(-halfW, -halfH * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Núcleo pesado
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "valkyrie-specter":
        // Fragata de asalto con alas en diedro negativo
        ctx.fillStyle = "#090d16";
        ctx.strokeStyle = isSpecialActive ? "#22c55e" : "#10b981";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -halfH);
        ctx.lineTo(halfW * 0.3, -halfH * 0.3);
        ctx.lineTo(halfW, halfH * 0.5);
        ctx.lineTo(halfW * 0.6, halfH * 0.7);
        ctx.lineTo(0, halfH * 0.4);
        ctx.lineTo(-halfW * 0.6, halfH * 0.7);
        ctx.lineTo(-halfW, halfH * 0.5);
        ctx.lineTo(-halfW * 0.3, -halfH * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cañones de las alas (tres puntos de fuego)
        ctx.fillStyle = "#34d399";
        ctx.fillRect(-halfW * 0.9, halfH * 0.4, 4, 8);
        ctx.fillRect(halfW * 0.9 - 4, halfH * 0.4, 4, 8);
        ctx.fillRect(-2, -halfH - 4, 4, 8);
        break;

      case "vortex-tempest":
        // Nave experimental en forma de anillo/alas de flecha inversa
        ctx.fillStyle = "#180d2b";
        ctx.strokeStyle = isSpecialActive ? "#f59e0b" : "#fbbf24";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -halfH);
        ctx.lineTo(halfW * 0.7, -halfH * 0.5);
        ctx.lineTo(halfW, halfH * 0.3);
        ctx.lineTo(halfW * 0.3, halfH * 0.9);
        ctx.lineTo(0, halfH * 0.5);
        ctx.lineTo(-halfW * 0.3, halfH * 0.9);
        ctx.lineTo(-halfW, halfH * 0.3);
        ctx.lineTo(-halfW * 0.7, -halfH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Anillo resonador
        ctx.strokeStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(0, 0, halfW * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "hyperion-dreadnought":
      default:
        // Buque insignia con doble cañón frontal y alas masivas
        ctx.fillStyle = "#0c1524";
        ctx.strokeStyle = isSpecialActive ? "#ff0055" : "#e11d48";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-halfW * 0.25, -halfH);
        ctx.lineTo(-halfW * 0.1, -halfH * 0.4);
        ctx.lineTo(halfW * 0.1, -halfH * 0.4);
        ctx.lineTo(halfW * 0.25, -halfH);
        ctx.lineTo(halfW, halfH * 0.6);
        ctx.lineTo(halfW * 0.5, halfH);
        ctx.lineTo(0, halfH * 0.7);
        ctx.lineTo(-halfW * 0.5, halfH);
        ctx.lineTo(-halfW, halfH * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Haz central
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(-3, -halfH * 0.3, 6, 16);
        break;
    }

    // Si la habilidad especial está activa, dibuja el aura/escudo correspondiente
    if (isSpecialActive) {
      this.drawSpecialAura(ctx, ship.special.slug, width, height);
    }

    ctx.restore();
  },

  /**
   * Representación visual de la habilidad especial activa
   */
  drawSpecialAura(ctx, specialSlug, width, height) {
    const radius = Math.max(width, height) * 0.8;

    if (specialSlug === "shield_matrix") {
      // Escudo esférico con pulso hexagonal
      ctx.strokeStyle = "rgba(0, 243, 255, 0.85)";
      ctx.fillStyle = "rgba(0, 243, 255, 0.18)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (specialSlug === "emp_blast") {
      // Onda expansiva electromagnética
      ctx.strokeStyle = "rgba(236, 72, 153, 0.9)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (specialSlug === "overdrive_ghost") {
      // Aura verde espectral parpadeante
      ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    } else if (specialSlug === "micromissile_swarm") {
      // Anillo dorado de satélites/misiles
      ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
      ctx.stroke();
    } else if (specialSlug === "orbital_bombardment") {
      // Rayo balístico carmesí
      ctx.fillStyle = "rgba(225, 29, 72, 0.25)";
      ctx.fillRect(-width * 0.6, -100, width * 1.2, 200);
      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 2;
      ctx.strokeRect(-width * 0.6, -100, width * 1.2, 200);
    }
  },

  /**
   * Dibuja los proyectiles característicos de cada nave
   */
  drawProjectile(ctx, projectile) {
    ctx.save();
    ctx.translate(projectile.x, projectile.y);

    switch (projectile.weaponType) {
      case "twin_laser":
        // Rayo láser cian afilado
        ctx.fillStyle = "#00f3ff";
        ctx.shadowColor = "#00f3ff";
        ctx.shadowBlur = 8;
        ctx.fillRect(-2, -projectile.height / 2, 4, projectile.height);
        break;

      case "heavy_plasma":
        // Bola de plasma esférica brillante magenta
        ctx.fillStyle = "#f43f5e";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "triple_spread":
        // Dardos de energía esmeralda en ángulo
        ctx.fillStyle = "#10b981";
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(3, 6);
        ctx.lineTo(-3, 6);
        ctx.closePath();
        ctx.fill();
        break;

      case "wave_cannon":
        // Arcos de onda sónica dorada
        ctx.strokeStyle = "#fbbf24";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 10, -Math.PI * 0.7, -Math.PI * 0.3);
        ctx.stroke();
        break;

      case "beam_laser":
      default:
        // Haz continuo brillante con núcleo blanco
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 14;
        ctx.fillRect(-3, -projectile.height / 2, 6, projectile.height);
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 2;
        ctx.strokeRect(-4, -projectile.height / 2, 8, projectile.height);
        break;
    }

    ctx.restore();
  },

  /**
   * Dibuja drones/enemigos de práctica para el campo de pruebas y combate
   */
  drawEnemy(ctx, enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.isBoss) {
      // Dibujo de Jefe / Sublíder
      ctx.fillStyle = "#4c0519";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(-enemy.width / 2, -enemy.height / 3);
      ctx.lineTo(0, -enemy.height / 2);
      ctx.lineTo(enemy.width / 2, -enemy.height / 3);
      ctx.lineTo(enemy.width / 2, enemy.height / 3);
      ctx.lineTo(0, enemy.height / 2);
      ctx.lineTo(-enemy.width / 2, enemy.height / 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Barra de vida del Boss
      const healthPct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 12, enemy.width, 6);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 12, enemy.width * healthPct, 6);
    } else {
      // Caza enemigo común
      ctx.fillStyle = "#1c1917";
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(0, enemy.height / 2);
      ctx.lineTo(enemy.width / 2, -enemy.height / 2);
      ctx.lineTo(0, -enemy.height * 0.2);
      ctx.lineTo(-enemy.width / 2, -enemy.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ojo rojo enemigo
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};
