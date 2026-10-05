/**
 * Renderizador Especializado para los 5 Escenarios Temáticos y Terreno Reactivo
 * 1. Norteamérica a la Antártida con radar de mapa continental
 * 2. Cruce del Pacífico con islas procedurales y costa de Australia
 * 3. Éxodo orbital de la Tierra a Júpiter con aproximación y escalado planetario
 * 4. Sector Criogénico de Hielo con ventiscas polares
 * 5. Territorio Selvático con árboles destruibles y cráteres por armas pesadas
 */

export class ScenarioRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.scrollY = 0;
    this.snowflakes = [];
    this.pacificIslands = [];
    this.jungleTrees = [];
    this.groundCraters = [];

    this.initIslands();
    this.initSnow();
    this.initJungle();
  }

  initIslands() {
    this.pacificIslands = [];
    for (let i = 0; i < 14; i++) {
      this.pacificIslands.push({
        x: Math.random() * (this.canvas.width - 140) + 70,
        y: Math.random() * this.canvas.height * 2.5,
        radius: Math.random() * 35 + 25,
        reefs: Math.random() * 15 + 10,
        hasPalms: Math.random() > 0.3
      });
    }
  }

  initSnow() {
    this.snowflakes = [];
    for (let i = 0; i < 110; i++) {
      this.snowflakes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1
      });
    }
  }

  initJungle() {
    this.jungleTrees = [];
    this.groundCraters = [];
    // Cuadrícula de vegetación y árboles para la Fase 5
    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 16; col++) {
        this.jungleTrees.push({
          x: col * 52 + (row % 2) * 26 + (Math.random() * 12 - 6),
          y: row * 45 - 200,
          radius: Math.random() * 12 + 16,
          color: Math.random() > 0.5 ? "#15803d" : "#166534",
          isDestroyed: false
        });
      }
    }
  }

  /**
   * Registra impactos de bombas y armas especiales en el suelo de la jungla
   */
  addGroundExplosion(x, y, radius = 45) {
    this.groundCraters.push({
      x,
      y,
      radius,
      smoke: 1.0
    });

    // Destruye los árboles cercanos en la coordenada de impacto
    for (const tree of this.jungleTrees) {
      const dist = Math.hypot(tree.x - x, tree.y - y);
      if (dist < radius) {
        tree.isDestroyed = true;
      }
    }
  }

  update(dt, stageNumber, distanceRatio) {
    const scrollSpeed = 60 * dt;
    this.scrollY += scrollSpeed;

    if (stageNumber === 2) {
      // Mover islas hacia abajo
      for (const island of this.pacificIslands) {
        island.y += scrollSpeed * 0.9;
        if (island.y > this.canvas.height + 100) {
          island.y = -100;
          island.x = Math.random() * (this.canvas.width - 140) + 70;
        }
      }
    } else if (stageNumber === 4) {
      // Ventisca de nieve
      for (const flake of this.snowflakes) {
        flake.y += flake.speedY;
        flake.x += flake.speedX;
        if (flake.y > this.canvas.height) {
          flake.y = 0;
          flake.x = Math.random() * this.canvas.width;
        }
      }
    } else if (stageNumber === 5) {
      // Scroll del dosel selvático
      for (const tree of this.jungleTrees) {
        tree.y += scrollSpeed * 0.85;
        if (tree.y > this.canvas.height + 50) {
          tree.y = -40;
          tree.isDestroyed = false; // regeneración natural al rotar el mapa
        }
      }

      for (const crater of this.groundCraters) {
        crater.y += scrollSpeed * 0.85;
        crater.smoke = Math.max(0, crater.smoke - dt * 0.1);
      }
      this.groundCraters = this.groundCraters.filter(c => c.y < this.canvas.height + 80);
    }
  }

  render(stageNumber, distanceRatio) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    switch (stageNumber) {
      case 1:
        this.renderStage1_NorthAmericaToAntarctica(ctx, w, h, distanceRatio);
        break;
      case 2:
        this.renderStage2_PacificToAustralia(ctx, w, h, distanceRatio);
        break;
      case 3:
        this.renderStage3_EarthToJupiter(ctx, w, h, distanceRatio);
        break;
      case 4:
        this.renderStage4_IceZone(ctx, w, h, distanceRatio);
        break;
      case 5:
      default:
        this.renderStage5_DestructibleJungle(ctx, w, h, distanceRatio);
        break;
    }
  }

  // ==========================================
  // ESCENARIO 1: NORTEAMÉRICA A LA ANTÁRTIDA (MAPA CONTINENTAL COMPLETO)
  // ==========================================
  renderStage1_NorthAmericaToAntarctica(ctx, w, h, distanceRatio) {
    // Fondo de Océano Atlántico y Pacífico
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, "#031e38");
    oceanGrad.addColorStop(0.5, "#073256");
    oceanGrad.addColorStop(1, "#03233f");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // Ondas y corrientes marinas suaves
    ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
    ctx.lineWidth = 1.5;
    const waveOffset = (this.scrollY * 0.3) % 45;
    for (let wy = waveOffset; wy < h; wy += 45) {
      ctx.beginPath();
      ctx.moveTo(0, wy);
      ctx.bezierCurveTo(w * 0.3, wy + 8, w * 0.7, wy - 8, w, wy);
      ctx.stroke();
    }

    // Altura total del recorrido continental del continente americano
    const totalMapHeight = 3400;
    const scrollMapY = distanceRatio * (totalMapHeight - h);

    ctx.save();
    ctx.translate(0, -scrollMapY);

    // ----------------------------------------------------
    // 1. NORTEAMÉRICA (Y: 0 a 1100)
    // ----------------------------------------------------
    // Masa continental de Canadá y Estados Unidos
    ctx.fillStyle = "#1e3a1e";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    // Alaska y noroeste
    ctx.moveTo(w * 0.08, 60);
    ctx.lineTo(w * 0.22, 40);
    ctx.lineTo(w * 0.35, 80);
    // Bahía de Hudson (Bahía recortada)
    ctx.lineTo(w * 0.48, 120);
    ctx.lineTo(w * 0.52, 220);
    ctx.lineTo(w * 0.45, 260);
    ctx.lineTo(w * 0.58, 200);
    // Costa este (Nueva York, Carolina, Florida)
    ctx.lineTo(w * 0.78, 260);
    ctx.lineTo(w * 0.72, 420);
    ctx.lineTo(w * 0.78, 540); // Península de Florida
    ctx.lineTo(w * 0.72, 570);
    // Golfo de México
    ctx.lineTo(w * 0.58, 520);
    ctx.lineTo(w * 0.48, 560);
    ctx.lineTo(w * 0.52, 680); // Península de Yucatán
    ctx.lineTo(w * 0.46, 700);
    // Costa oeste del Pacífico (California, México, Baja California)
    ctx.lineTo(w * 0.38, 760);
    ctx.lineTo(w * 0.32, 660);
    ctx.lineTo(w * 0.28, 580); // Península de Baja California
    ctx.lineTo(w * 0.26, 460);
    ctx.lineTo(w * 0.18, 380); // California / Oregón
    ctx.lineTo(w * 0.14, 220); // Vancouver / Canadá
    ctx.lineTo(w * 0.08, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glaciares árticos y nieve en Canadá / Alaska
    ctx.fillStyle = "rgba(224, 242, 254, 0.35)";
    ctx.beginPath();
    ctx.moveTo(w * 0.1, 70);
    ctx.lineTo(w * 0.35, 80);
    ctx.lineTo(w * 0.45, 160);
    ctx.lineTo(w * 0.15, 140);
    ctx.closePath();
    ctx.fill();

    // Grandes Lagos (Lago Superior, Michigan, Hurón)
    ctx.fillStyle = "#073256";
    ctx.beginPath();
    ctx.ellipse(w * 0.52, 330, 24, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.56, 350, 18, 10, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Cordillera de las Rocosas (Montañas)
    ctx.strokeStyle = "rgba(120, 53, 15, 0.5)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.25, 150);
    ctx.lineTo(w * 0.29, 320);
    ctx.lineTo(w * 0.34, 520);
    ctx.stroke();

    // ----------------------------------------------------
    // 2. CENTROAMÉRICA Y EL CARIBE (Y: 760 a 1150)
    // ----------------------------------------------------
    // Istmo de Centroamérica
    ctx.fillStyle = "#15803d";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(w * 0.38, 760);
    ctx.lineTo(w * 0.44, 840);
    ctx.lineTo(w * 0.48, 920);
    ctx.lineTo(w * 0.54, 1020); // Istmo de Panamá
    ctx.lineTo(w * 0.51, 1035);
    ctx.lineTo(w * 0.44, 940);
    ctx.lineTo(w * 0.36, 850);
    ctx.lineTo(w * 0.33, 770);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Islas del Caribe (Cuba, La Española, Puerto Rico)
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.ellipse(w * 0.65, 730, 36, 8, -0.25, 0, Math.PI * 2); // Cuba
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(w * 0.76, 760, 20, 9, 0.1, 0, Math.PI * 2); // La Española
    ctx.fill();
    ctx.stroke();

    // ----------------------------------------------------
    // 3. SUDAMÉRICA (Y: 1040 a 2450)
    // ----------------------------------------------------
    // Masa continental de América del Sur
    ctx.fillStyle = "#14532d";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    // Colombia / Venezuela
    ctx.moveTo(w * 0.52, 1040);
    ctx.lineTo(w * 0.64, 1070);
    ctx.lineTo(w * 0.74, 1110);
    // Costa atlántica de Brasil (Gran saliente oriental)
    ctx.lineTo(w * 0.88, 1260); // Saliente de Recife/Nordeste
    ctx.lineTo(w * 0.84, 1420);
    ctx.lineTo(w * 0.78, 1620); // Río de Janeiro / Santos
    ctx.lineTo(w * 0.68, 1850); // Río de la Plata (Uruguay / Buenos Aires)
    ctx.lineTo(w * 0.58, 2080); // Costa Patagónica
    ctx.lineTo(w * 0.52, 2260); // Tierra del Fuego / Cabo de Hornos
    ctx.lineTo(w * 0.46, 2260);
    // Costa del Pacífico (Chile, Perú, Ecuador)
    ctx.lineTo(w * 0.45, 2050); // Chile sur / fiordos
    ctx.lineTo(w * 0.43, 1780); // Chile central
    ctx.lineTo(w * 0.41, 1480); // Costa de Perú
    ctx.lineTo(w * 0.39, 1320); // Golfo de Guayaquil (Ecuador)
    ctx.lineTo(w * 0.46, 1140); // Costa pacífica colombiana
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cuenca del Río Amazonas (Selva y afluentes)
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.82, 1180); // Desembocadura del Amazonas
    ctx.bezierCurveTo(w * 0.72, 1200, w * 0.55, 1220, w * 0.46, 1240);
    ctx.stroke();

    // Cordillera de los Andes (Eje montañoso occidental)
    ctx.strokeStyle = "rgba(180, 83, 9, 0.65)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.48, 1120);
    ctx.lineTo(w * 0.43, 1380);
    ctx.lineTo(w * 0.46, 1720);
    ctx.lineTo(w * 0.48, 2120);
    ctx.stroke();

    // Picos nevados de los Andes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.47, 1140);
    ctx.lineTo(w * 0.44, 1420);
    ctx.lineTo(w * 0.47, 1800);
    ctx.stroke();

    // Islas Malvinas (Falklands)
    ctx.fillStyle = "#1e3a1e";
    ctx.beginPath();
    ctx.ellipse(w * 0.64, 2180, 10, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // ----------------------------------------------------
    // 4. PASAJE DE DRAKE (OCÉANO AUSTRÁLICO) (Y: 2280 a 2650)
    // ----------------------------------------------------
    // Icebergs flotantes en el Pasaje de Drake
    ctx.fillStyle = "rgba(224, 242, 254, 0.8)";
    const icebergs = [
      { x: w * 0.35, y: 2360, r: 12 },
      { x: w * 0.55, y: 2420, r: 16 },
      { x: w * 0.42, y: 2510, r: 14 },
      { x: w * 0.68, y: 2480, r: 18 },
      { x: w * 0.28, y: 2560, r: 15 }
    ];
    for (const berg of icebergs) {
      ctx.beginPath();
      ctx.arc(berg.x, berg.y, berg.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.stroke();
    }

    // ----------------------------------------------------
    // 5. ANTÁRTIDA (Y: 2650 a 3400)
    // ----------------------------------------------------
    // Península Antártica y Masa polar de hielo
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;

    ctx.beginPath();
    // Península Antártica apuntando al norte hacia el Cabo de Hornos
    ctx.moveTo(w * 0.48, 2640);
    ctx.lineTo(w * 0.53, 2740);
    ctx.lineTo(w * 0.62, 2850);
    // Plataforma de hielo continental antártico (Enorme casquete polar)
    ctx.lineTo(w * 0.95, 2920);
    ctx.lineTo(w, 3350);
    ctx.lineTo(0, 3350);
    ctx.lineTo(0, 2920);
    ctx.lineTo(w * 0.32, 2880);
    ctx.lineTo(w * 0.43, 2760);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grietas y fallas glaciares de hielo azul
    ctx.strokeStyle = "rgba(14, 165, 233, 0.7)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, 3020);
    ctx.lineTo(w * 0.45, 3070);
    ctx.lineTo(w * 0.7, 3040);
    ctx.moveTo(w * 0.35, 3150);
    ctx.lineTo(w * 0.6, 3200);
    ctx.lineTo(w * 0.85, 3160);
    ctx.stroke();

    ctx.restore();

    // ----------------------------------------------------
    // HUD TÁCTICO INFERIOR: CARTELA DE POSICIÓN CONTINENTAL
    // ----------------------------------------------------
    this.renderAmericasPositionBanner(ctx, w, h, distanceRatio);
    this.renderAmericasRadar(ctx, distanceRatio);
  }

  renderAmericasPositionBanner(ctx, w, h, distanceRatio) {
    let regionText = "SOBREVOLANDO: NORTEAMÉRICA [CANADÁ / EE.UU.]";
    let subText = "Ruta transcontinental polar - Detectores de radar activos";

    if (distanceRatio > 0.22 && distanceRatio <= 0.45) {
      regionText = "SOBREVOLANDO: GOLFO DE MÉXICO Y CARIBE";
      subText = "Sector de enlace de comunicaciones y satélites espía";
    } else if (distanceRatio > 0.45 && distanceRatio <= 0.72) {
      regionText = "SOBREVOLANDO: SUDAMÉRICA [AMAZONAS Y CORDILLERA DE LOS ANDES]";
      subText = "Aproximación a la cordillera montañosa hacia el cono sur";
    } else if (distanceRatio > 0.72 && distanceRatio <= 0.88) {
      regionText = "SOBREVOLANDO: CABO DE HORNOS Y PASAJE DE DRAKE";
      subText = "Cruce de aguas australes - Detección de fortaleza polar";
    } else if (distanceRatio > 0.88) {
      regionText = "¡ALERTA! APROXIMACIÓN A LA ANTÁRTIDA [ZONA DE JEFE]";
      subText = "Fortaleza Goliath Apex detectada sobre los glaciares";
    }

    ctx.save();
    ctx.fillStyle = "rgba(7, 10, 24, 0.75)";
    ctx.fillRect(w / 2 - 200, h - 38, 400, 30);
    ctx.strokeStyle = distanceRatio > 0.88 ? "#ff0055" : "rgba(0, 243, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 200, h - 38, 400, 30);

    ctx.font = "9px Orbitron";
    ctx.fillStyle = distanceRatio > 0.88 ? "#ff0055" : "#00f3ff";
    ctx.textAlign = "center";
    ctx.fillText(regionText, w / 2, h - 22);

    ctx.font = "8px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(subText, w / 2, h - 11);
    ctx.restore();
  }

  renderAmericasRadar(ctx, distanceRatio) {
    const rx = 15;
    const ry = this.canvas.height - 145;
    const rw = 95;
    const rh = 135;

    ctx.save();
    // Caja del radar táctico
    ctx.fillStyle = "rgba(7, 12, 26, 0.88)";
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    // Título
    ctx.fillStyle = "#00f3ff";
    ctx.font = "8px Orbitron";
    ctx.fillText("RADAR AMÉRICA", rx + 8, ry + 12);

    // Silueta vectorial esquemática de las Américas en el radar
    ctx.strokeStyle = "rgba(0, 243, 255, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Norteamérica
    ctx.moveTo(rx + 20, ry + 22); // Alaska
    ctx.lineTo(rx + 50, ry + 24); // Canadá
    ctx.lineTo(rx + 72, ry + 36); // Costa este
    ctx.lineTo(rx + 62, ry + 52); // Florida
    ctx.lineTo(rx + 48, ry + 50); // Golfo
    ctx.lineTo(rx + 40, ry + 62); // México
    ctx.lineTo(rx + 46, ry + 74); // Centroamérica
    // Sudamérica
    ctx.lineTo(rx + 58, ry + 80); // Colombia/Venezuela
    ctx.lineTo(rx + 76, ry + 92); // Brasil oriental
    ctx.lineTo(rx + 62, ry + 112); // Argentina / Patagonia
    ctx.lineTo(rx + 52, ry + 122); // Cabo de Hornos
    ctx.lineTo(rx + 44, ry + 102); // Chile / Andes
    ctx.lineTo(rx + 40, ry + 82); // Pacífico
    ctx.lineTo(rx + 26, ry + 42); // Costa oeste
    ctx.closePath();
    ctx.stroke();

    // Antártida en la base del radar
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.strokeRect(rx + 15, ry + 125, rw - 30, 6);

    // Líneas de latitud (Ecuador, Trópicos)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(rx + 5, ry + 78);
    ctx.lineTo(rx + rw - 5, ry + 78); // Línea del Ecuador
    ctx.stroke();
    ctx.setLineDash([]);

    // Indicador dinámico de avance de la nave
    const markerY = ry + 22 + distanceRatio * 104;
    const markerX = rx + 36 + Math.sin(distanceRatio * Math.PI) * 18;

    // Halo y punto de posición
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
    ctx.stroke();

    // Coordenada táctica
    ctx.font = "8px monospace";
    ctx.fillStyle = "#34d399";
    const lat = Math.floor(70 - distanceRatio * 150);
    ctx.fillText(`LAT: ${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`, rx + 14, ry + rh - 2);
    ctx.restore();
  }

  // ==========================================
  // ESCENARIO 2: OCÉANO PACÍFICO A AUSTRALIA
  // ==========================================
  renderStage2_PacificToAustralia(ctx, w, h, distanceRatio) {
    // Mar profundo del Pacífico
    ctx.fillStyle = "#022c43";
    ctx.fillRect(0, 0, w, h);

    // Olas sutiles
    ctx.strokeStyle = "rgba(14, 165, 233, 0.15)";
    ctx.lineWidth = 2;
    for (let y = (this.scrollY * 0.3) % 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + 10);
      ctx.stroke();
    }

    // Archipiélagos e Islas Polinesias
    for (const island of this.pacificIslands) {
      // Arrecife turquesa
      ctx.fillStyle = "rgba(20, 184, 166, 0.35)";
      ctx.beginPath();
      ctx.arc(island.x, island.y, island.radius + island.reefs, 0, Math.PI * 2);
      ctx.fill();

      // Playa de arena
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(island.x, island.y, island.radius, 0, Math.PI * 2);
      ctx.fill();

      // Vegetación interior
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(island.x, island.y, island.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aparición de la masa continental de Australia hacia el final de la fase
    if (distanceRatio > 0.6) {
      const enterProgress = (distanceRatio - 0.6) / 0.4;
      const coastY = h - (enterProgress * h * 0.7);

      ctx.fillStyle = "#b45309"; // Tierra roja australiana
      ctx.beginPath();
      ctx.moveTo(0, coastY + 100);
      ctx.bezierCurveTo(w * 0.3, coastY, w * 0.7, coastY + 60, w, coastY);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Letrero táctico
      ctx.fillStyle = "#00f3ff";
      ctx.font = "10px Orbitron";
      ctx.fillText("AVISTANDO COSTA DE AUSTRALIA", w / 2 - 100, coastY + 30);
    }
  }

  // ==========================================
  // ESCENARIO 3: DE LA TIERRA HACIA JÚPITER
  // ==========================================
  renderStage3_EarthToJupiter(ctx, w, h, distanceRatio) {
    // Fondo de vacío cósmico
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    // Tierra alejándose abajo al inicio de la fase
    if (distanceRatio < 0.4) {
      const earthRadius = (1.0 - (distanceRatio / 0.4)) * 260 + 120;
      const earthY = h + earthRadius * 0.6;

      const earthGlow = ctx.createRadialGradient(w / 2, earthY, earthRadius * 0.8, w / 2, earthY, earthRadius);
      earthGlow.addColorStop(0, "#0284c7");
      earthGlow.addColorStop(0.8, "#0369a1");
      earthGlow.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(w / 2, earthY, earthRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Júpiter acercándose y aumentando dinámicamente de escala
    const jupiterScale = 25 + distanceRatio * 170; // Crece de 25px a casi 200px de radio
    const jupiterX = w / 2 + Math.sin(distanceRatio * 3) * 40;
    const jupiterY = 120 + distanceRatio * 60;

    // Resplandor de Júpiter
    const jupGlow = ctx.createRadialGradient(jupiterX, jupiterY, jupiterScale * 0.6, jupiterX, jupiterY, jupiterScale * 1.3);
    jupGlow.addColorStop(0, "rgba(249, 115, 22, 0.4)");
    jupGlow.addColorStop(1, "transparent");
    ctx.fillStyle = jupGlow;
    ctx.beginPath();
    ctx.arc(jupiterX, jupiterY, jupiterScale * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Esfera y franjas atmosféricas de Júpiter
    ctx.save();
    ctx.beginPath();
    ctx.arc(jupiterX, jupiterY, jupiterScale, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#c2410c";
    ctx.fillRect(jupiterX - jupiterScale, jupiterY - jupiterScale, jupiterScale * 2, jupiterScale * 2);

    // Franjas de nubes de gas
    const bands = ["#ea580c", "#fed7aa", "#9a3412", "#fdba74", "#7c2d12", "#f97316"];
    const bandHeight = (jupiterScale * 2) / bands.length;
    bands.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(jupiterX - jupiterScale, (jupiterY - jupiterScale) + i * bandHeight, jupiterScale * 2, bandHeight * 0.7);
    });

    // Gran Mancha Roja
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.ellipse(jupiterX + jupiterScale * 0.3, jupiterY + jupiterScale * 0.2, jupiterScale * 0.25, jupiterScale * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // ESCENARIO 4: SECTOR CRIOGÉNICO DE HIELO
  // ==========================================
  renderStage4_IceZone(ctx, w, h, distanceRatio) {
    // Fondo azul gélido
    const iceGrad = ctx.createLinearGradient(0, 0, 0, h);
    iceGrad.addColorStop(0, "#082f49");
    iceGrad.addColorStop(1, "#0c4a6e");
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 0, w, h);

    // Bloques de glaciares y grietas de hielo
    ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
    ctx.lineWidth = 3;
    const offset = (this.scrollY * 0.4) % 180;
    for (let y = -100 + offset; y < h + 100; y += 180) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w * 0.3, y + 40);
      ctx.lineTo(w * 0.5, y + 10);
      ctx.lineTo(w * 0.8, y + 70);
      ctx.lineTo(w, y + 30);
      ctx.stroke();
    }

    // Tempestad de nieve / ventisca
    ctx.fillStyle = "rgba(240, 249, 255, 0.85)";
    for (const flake of this.snowflakes) {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==========================================
  // ESCENARIO 5: JUNGLA CON DESTRUCCIÓN DE SUELO
  // ==========================================
  renderStage5_DestructibleJungle(ctx, w, h, distanceRatio) {
    // Suelo selvático profundo
    ctx.fillStyle = "#052e16";
    ctx.fillRect(0, 0, w, h);

    // Río que serpentea por la selva
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 0);
    ctx.bezierCurveTo(w * 0.6, h * 0.3, w * 0.2, h * 0.7, w * 0.5, h);
    ctx.lineTo(w * 0.56, h);
    ctx.bezierCurveTo(w * 0.26, h * 0.7, w * 0.66, h * 0.3, w * 0.46, 0);
    ctx.closePath();
    ctx.fill();

    // Cráteres de explosiones y bombas (Suelo destruido y quemado)
    for (const crater of this.groundCraters) {
      // Tierra chamuscada
      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.fill();

      // Borde quemado al rojo vivo
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Humo del cráter
      if (crater.smoke > 0.05) {
        ctx.fillStyle = `rgba(100, 116, 139, ${crater.smoke * 0.45})`;
        ctx.beginPath();
        ctx.arc(crater.x + (Math.random() * 8 - 4), crater.y - 10, crater.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dosel de árboles selváticos
    for (const tree of this.jungleTrees) {
      if (tree.isDestroyed) {
        // Árbol calcinado / caído
        ctx.fillStyle = "#27272a";
        ctx.beginPath();
        ctx.arc(tree.x, tree.y, tree.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tree.x - 6, tree.y);
        ctx.lineTo(tree.x + 6, tree.y);
        ctx.stroke();
      } else {
        // Árbol frondoso vivo
        ctx.fillStyle = tree.color;
        ctx.beginPath();
        ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
        ctx.fill();

        // Brillo superior de la copa
        ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
        ctx.beginPath();
        ctx.arc(tree.x - 3, tree.y - 3, tree.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
