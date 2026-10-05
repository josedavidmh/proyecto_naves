/**
 * Renderizador Especializado para los 5 Escenarios Temáticos y Terreno Reactivo
 * 1. Norteamérica a la Antártida con radar de mapa continental
 * 2. Cruce del Pacífico con islas procedurales y costa de Australia
 * 3. Travesía interplanetaria: Tierra, Marte, Cinturón de Asteroides, Júpiter (Sublíder) y Saturno (Jefe Final)
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
    this.spaceStars = [];
    this.spaceAsteroids = [];
    this.arcticIcebergs = [];

    this.initIslands();
    this.initSnow();
    this.initArcticIcebergs();
    this.initJungle();
    this.initSpaceStars();
    this.initSpaceAsteroids();
  }

  initSpaceStars() {
    this.spaceStars = [];
    for (let i = 0; i < 95; i++) {
      const isTwinkle = Math.random() < 0.22; // Pocas estrellitas aleatorias que titilan (~20 de 95)
      this.spaceStars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.45 + 0.25,
        isTwinkle,
        twinkleSpeed: Math.random() * 0.003 + 0.002,
        twinkleOffset: Math.random() * Math.PI * 2,
        hasGlint: isTwinkle && Math.random() < 0.45,
        speedY: (Math.random() * 1.8 + 0.8) * 36 + 24, // 52 a 120 px/s para sensación de vuelo cósmico continuo
        color: Math.random() > 0.8 ? "#93c5fd" : (Math.random() > 0.6 ? "#fef08a" : "#ffffff")
      });
    }
  }

  initSpaceAsteroids() {
    this.spaceAsteroids = [];
    for (let i = 0; i < 28; i++) {
      const rad = Math.random() * 16 + 8; // 8 a 24px
      const numPts = 10;
      const pts = [];
      for (let p = 0; p < numPts; p++) {
        const ang = (p / numPts) * Math.PI * 2;
        const r = rad * (0.75 + Math.random() * 0.5);
        pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
      }
      this.spaceAsteroids.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height * 2.2 - 150,
        radius: rad,
        poly: pts,
        speedY: Math.random() * 26 + 32,
        speedX: (Math.random() - 0.5) * 12,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        color: Math.random() > 0.5 ? "#475569" : "#334155"
      });
    }
  }

  initIslands() {
    this.pacificIslands = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (this.canvas.width - 120) + 60;
      const y = (i / count) * this.canvas.height * 2.2 - 150;
      this.pacificIslands.push(this.createPacificIsland(x, y));
    }
  }

  createPacificIsland(x, y) {
    const types = ["volcanic", "atoll", "archipelago", "cay"];
    const type = types[Math.floor(Math.random() * types.length)];
    const baseRadius = Math.random() * 26 + 22; // 22 a 48px
    const roughness = type === "cay" ? 0.25 : 0.42;

    const generatePoly = (rad, rough, numPts = 16) => {
      const pts = [];
      const s1 = Math.random() * 6;
      const s2 = Math.random() * 6;
      for (let i = 0; i < numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const harmonic = Math.sin(ang * 2 + s1) * 0.22 + Math.cos(ang * 3 + s2) * 0.16;
        const r = rad * (1.0 + harmonic + (Math.random() - 0.5) * rough);
        pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
      }
      return pts;
    };

    const reefPoly = generatePoly(baseRadius * 1.58, roughness * 0.8, 16);
    const sandPoly = generatePoly(baseRadius * 1.15, roughness, 16);
    const junglePoly = generatePoly(baseRadius * 0.78, roughness * 1.1, 14);
    const corePoly = generatePoly(baseRadius * 0.42, roughness * 0.7, 12);

    const palms = [];
    const numPalms = Math.floor(Math.random() * 4) + 2;
    for (let p = 0; p < numPalms; p++) {
      const pAng = Math.random() * Math.PI * 2;
      const pDist = baseRadius * (0.82 + Math.random() * 0.22);
      palms.push({
        x: Math.cos(pAng) * pDist,
        y: Math.sin(pAng) * pDist,
        trunkAngle: (Math.random() - 0.5) * 0.65,
        size: Math.random() * 3 + 4.5
      });
    }

    const lagoonPoly = type === "atoll" ? generatePoly(baseRadius * 0.45, 0.25, 12) : null;

    const satellites = [];
    if (type === "archipelago") {
      const count = Math.random() > 0.4 ? 2 : 1;
      for (let s = 0; s < count; s++) {
        const sAng = s * Math.PI + (Math.random() - 0.5) * 0.8;
        const sDist = baseRadius * (1.75 + Math.random() * 0.45);
        const sRad = baseRadius * (0.32 + Math.random() * 0.22);
        satellites.push({
          x: Math.cos(sAng) * sDist,
          y: Math.sin(sAng) * sDist,
          reefPoly: generatePoly(sRad * 1.55, 0.3, 12),
          sandPoly: generatePoly(sRad * 1.15, 0.35, 12),
          junglePoly: generatePoly(sRad * 0.72, 0.4, 10),
          radius: sRad
        });
      }
    }

    return {
      x,
      y,
      type,
      radius: baseRadius,
      reefPoly,
      sandPoly,
      junglePoly,
      corePoly,
      palms,
      lagoonPoly,
      satellites,
      rotation: Math.random() * Math.PI * 2,
      surfPhase: Math.random() * Math.PI * 2
    };
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

  initArcticIcebergs() {
    this.arcticIcebergs = [];
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * (this.canvas.width - 60) + 30;
      const y = Math.random() * (this.canvas.height * 2.2) - 150;
      this.arcticIcebergs.push(this.createArcticIceberg(x, y));
    }
  }

  createArcticIceberg(x, y) {
    const radius = Math.random() * 22 + 12;
    const numPts = 8;
    const pts = [];
    for (let p = 0; p < numPts; p++) {
      const ang = (p / numPts) * Math.PI * 2;
      const r = radius * (0.75 + Math.random() * 0.5);
      pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    }
    return {
      x,
      y,
      radius,
      poly: pts,
      rotation: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 14 + 10,
      glowColor: Math.random() > 0.4 ? "rgba(56, 189, 248, 0.35)" : "rgba(34, 211, 238, 0.45)"
    };
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
      // Mover islas hacia abajo con velocidad orgánica y oleaje
      for (let i = 0; i < this.pacificIslands.length; i++) {
        const island = this.pacificIslands[i];
        island.y += scrollSpeed * 0.92;
        if (island.y > this.canvas.height + 120) {
          const newX = Math.random() * (this.canvas.width - 120) + 60;
          this.pacificIslands[i] = this.createPacificIsland(newX, -120);
        }
      }
    } else if (stageNumber === 3) {
      // 1. Desplazamiento estelar continuo cósmico (Parallax vertical 60 FPS)
      for (const star of this.spaceStars) {
        star.y += (star.speedY || 60) * dt;
        if (star.y > this.canvas.height + 6) {
          star.y = -6;
          star.x = Math.random() * this.canvas.width;
        }
      }

      // 2. Movimiento y rotación de asteroides del cinturón entre Marte y Júpiter
      for (const a of this.spaceAsteroids) {
        a.y += a.speedY * dt;
        a.x += a.speedX * dt;
        a.rotation += a.rotSpeed;
        if (a.y > this.canvas.height + 60) {
          a.y = -60;
          a.x = Math.random() * this.canvas.width;
        }
      }
    } else if (stageNumber === 4) {
      // 1. Ventisca de nieve polar con ráfagas horizontales dinámicas
      const wind = Math.sin(this.scrollY * 0.04) * 1.8;
      for (const flake of this.snowflakes) {
        flake.y += flake.speedY;
        flake.x += flake.speedX + wind;
        if (flake.y > this.canvas.height) {
          flake.y = 0;
          flake.x = Math.random() * this.canvas.width;
        }
        if (flake.x < 0) flake.x = this.canvas.width;
        else if (flake.x > this.canvas.width) flake.x = 0;
      }

      // 2. Deriva oceánica de témpanos de hielo (icebergs) hacia el sur
      for (const berg of this.arcticIcebergs) {
        berg.y += berg.driftSpeed * dt;
        if (berg.y > this.canvas.height + 60) {
          berg.y = -60;
          berg.x = Math.random() * this.canvas.width;
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
    // 1. Mar profundo del Pacífico con gradiente batimétrico
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, "#011627");
    oceanGrad.addColorStop(0.5, "#022c43");
    oceanGrad.addColorStop(1, "#033b5c");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // Ondas y corrientes marinas profundas
    ctx.strokeStyle = "rgba(14, 165, 233, 0.14)";
    ctx.lineWidth = 2.2;
    const waveOffset = (this.scrollY * 0.35) % 48;
    for (let wy = waveOffset; wy < h; wy += 48) {
      ctx.beginPath();
      ctx.moveTo(0, wy);
      ctx.bezierCurveTo(w * 0.25, wy + 12, w * 0.75, wy - 10, w, wy + 4);
      ctx.stroke();
    }

    // 2. Islas Orgánicas del Pacífico (visibles en la travesía oceánica inicial hasta entrar a Australia)
    const islandAlpha = distanceRatio > 0.36 ? Math.max(0, 1.0 - (distanceRatio - 0.36) / 0.08) : 1.0;
    if (islandAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = islandAlpha;
      for (const island of this.pacificIslands) {
        this.drawOrganicIsland(ctx, island);
      }
      ctx.restore();
    }

    // 3. Masa Continental de Australia: Gran isla-continente integrada al terreno y scrolleable
    if (distanceRatio >= 0.30) {
      this.drawAustraliaContinent(ctx, w, h, distanceRatio);
    }

    // 4. Cartela Táctica de Posición Geográfica
    this.renderPacificPositionBanner(ctx, w, h, distanceRatio);

    // 5. Radar Táctico de Aproximación Continental en la esquina inferior izquierda
    this.renderPacificAustraliaRadar(ctx, distanceRatio);
  }

  /**
   * Dibuja una isla orgánica con arrecifes, rompientes, playas de arena,
   * jungla en capas, lagunas coralinas y palmeras tropicales.
   */
  drawOrganicIsland(ctx, island) {
    ctx.save();
    ctx.translate(island.x, island.y);
    ctx.rotate(island.rotation);

    // A. Halo de aguas someras y arrecife de coral exterior
    ctx.fillStyle = "rgba(45, 212, 191, 0.26)"; // Turquesa translúcido
    ctx.beginPath();
    this.drawPathFromPoints(ctx, island.reefPoly);
    ctx.closePath();
    ctx.fill();

    // Rompientes de surf y espuma marina en el arrecife
    const surfPulse = 1.0 + Math.sin(performance.now() * 0.003 + island.surfPhase) * 0.06;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.scale(surfPulse, surfPulse);
    this.drawPathFromPoints(ctx, island.reefPoly);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.scale(1 / surfPulse, 1 / surfPulse);

    // B. Bajíos coralinos intermedios
    ctx.fillStyle = "rgba(20, 184, 166, 0.48)";
    ctx.beginPath();
    this.drawPathFromPoints(ctx, island.sandPoly, 1.12);
    ctx.closePath();
    ctx.fill();

    // C. Si es archipiélago, dibujar islotes satélites conectados
    if (island.type === "archipelago" && island.satellites) {
      for (const sat of island.satellites) {
        // Bajío de arena que conecta los islotes
        ctx.strokeStyle = "rgba(254, 240, 138, 0.35)";
        ctx.lineWidth = Math.max(3, sat.radius * 0.7);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sat.x, sat.y);
        ctx.stroke();

        // Arrecife satélite
        ctx.fillStyle = "rgba(45, 212, 191, 0.3)";
        ctx.beginPath();
        this.drawOffsetPath(ctx, sat.reefPoly, sat.x, sat.y);
        ctx.fill();

        // Playa satélite
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        this.drawOffsetPath(ctx, sat.sandPoly, sat.x, sat.y);
        ctx.fill();

        // Vegetación satélite
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        this.drawOffsetPath(ctx, sat.junglePoly, sat.x, sat.y);
        ctx.fill();
      }
    }

    // D. Playa de arena tropical dorada
    ctx.fillStyle = "#fef08a"; // Arena fina
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.drawPathFromPoints(ctx, island.sandPoly);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // E. Vegetación y geografía interior
    if (island.type === "atoll") {
      // Atolón: anillo de vegetación con laguna interior
      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      this.drawPathFromPoints(ctx, island.junglePoly);
      ctx.closePath();
      ctx.fill();

      // Laguna interior turquesa cristalina
      if (island.lagoonPoly) {
        ctx.fillStyle = "#2dd4bf"; // Agua de laguna
        ctx.beginPath();
        this.drawPathFromPoints(ctx, island.lagoonPoly);
        ctx.closePath();
        ctx.fill();

        // Pozo profundo central
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(0, 0, island.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Isla volcánica o cayo: dosel de selva en capas
      ctx.fillStyle = "#16a34a"; // Borde exterior
      ctx.beginPath();
      this.drawPathFromPoints(ctx, island.junglePoly);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#15803d"; // Selva densa
      ctx.beginPath();
      this.drawPathFromPoints(ctx, island.corePoly);
      ctx.closePath();
      ctx.fill();

      // Pico volcánico rocoso si es volcánica
      if (island.type === "volcanic") {
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(-island.radius * 0.22, island.radius * 0.15);
        ctx.lineTo(0, -island.radius * 0.35);
        ctx.lineTo(island.radius * 0.25, island.radius * 0.2);
        ctx.closePath();
        ctx.fill();

        // Faceta iluminada
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.moveTo(0, -island.radius * 0.35);
        ctx.lineTo(island.radius * 0.25, island.radius * 0.2);
        ctx.lineTo(island.radius * 0.05, 0);
        ctx.closePath();
        ctx.fill();
      }
    }

    // F. Palmeras tropicales realistas con frondas verdes
    for (const palm of island.palms) {
      this.drawPalmTree(ctx, palm.x, palm.y, palm.size, palm.trunkAngle);
    }

    ctx.restore();
  }

  drawPathFromPoints(ctx, points, scale = 1.0) {
    if (!points || points.length === 0) return;
    ctx.moveTo(points[0].x * scale, points[0].y * scale);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * scale, points[i].y * scale);
    }
  }

  drawOffsetPath(ctx, points, ox, oy, scale = 1.0) {
    if (!points || points.length === 0) return;
    ctx.moveTo(ox + points[0].x * scale, oy + points[0].y * scale);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(ox + points[i].x * scale, oy + points[i].y * scale);
    }
    ctx.closePath();
  }

  drawPalmTree(ctx, x, y, size, trunkAngle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(trunkAngle);

    // Tronco curvo marrón
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.5, size * 0.2, -size * 1.25);
    ctx.stroke();

    // Frondas verdes (corona de hojas)
    const topX = size * 0.2;
    const topY = -size * 1.25;
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1.2;
    for (let f = 0; f < 5; f++) {
      const fAng = (f / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(
        topX + Math.cos(fAng) * size * 0.65,
        topY + Math.sin(fAng) * size * 0.35,
        topX + Math.cos(fAng) * size * 1.05,
        topY + Math.sin(fAng) * size * 0.85
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renderiza la masa continental de Australia como una inmensa isla-continente
   * integrada orgánicamente al océano Pacífico y desplazable de manera continua.
   * Cuenta con la misma estética de las islas (arrecife turquesa, rompientes de surf,
   * playas doradas, palmeras y jungla costera), pero en una escala colosal (3400px de longitud)
   * que el avión recorre durante un extenso tramo de la misión (del 32% al 100%).
   */
  drawAustraliaContinent(ctx, w, h, distanceRatio) {
    const totalContinentHeight = 3400;
    // El avance del avión a través del continente inicia al 32% de la fase y se prolonga hasta el 100%
    const progress = Math.min(1.0, Math.max(0, (distanceRatio - 0.32) / (1.0 - 0.32)));
    const cameraY = progress * (totalContinentHeight - h);

    const baseW = Math.max(w * 1.55, 1080);
    const centerX = w * 0.5;

    ctx.save();
    ctx.translate(centerX, -cameraY);

    // Contorno vectorial a escala continental (Y: 60px Cabo York hasta 2700px Victoria / 3050px Tasmania)
    const australiaOutline = [
      // 1. Península de Cabo York y extremo norte
      { x: 0.14 * baseW, y: 70 },
      { x: 0.17 * baseW, y: 220 },
      { x: 0.20 * baseW, y: 380 },  // Cairns / Cooktown
      { x: 0.24 * baseW, y: 560 },
      { x: 0.28 * baseW, y: 740 },  // Townsville
      { x: 0.34 * baseW, y: 980 },  // Mackay
      { x: 0.39 * baseW, y: 1220 }, // Rockhampton / Hervey Bay
      { x: 0.44 * baseW, y: 1480 }, // Sunshine Coast / Brisbane
      { x: 0.47 * baseW, y: 1680 }, // Gold Coast / Byron Bay (Punto más oriental)
      { x: 0.45 * baseW, y: 1880 }, // Coffs Harbour
      { x: 0.41 * baseW, y: 2080 }, // Newcastle / Sydney / Wollongong
      { x: 0.35 * baseW, y: 2280 }, // Batemans Bay / Costa sur NSW
      { x: 0.27 * baseW, y: 2480 }, // Cabo Howe

      // 2. Costa Sur y Victoria
      { x: 0.17 * baseW, y: 2660 }, // Wilson's Promontory (Punta sur continental)
      { x: 0.06 * baseW, y: 2620 }, // Bahía Port Phillip / Melbourne
      { x: -0.05 * baseW, y: 2560 }, // Costa de los Doce Apóstoles / Apollo Bay
      { x: -0.15 * baseW, y: 2430 }, // Golfo de Spencer / Adelaida
      { x: -0.23 * baseW, y: 2340 }, // Península de Eyre
      { x: -0.34 * baseW, y: 2380 }, // Gran Bahía Australiana (Arco cóncavo hacia el norte)
      { x: -0.44 * baseW, y: 2400 }, // Costa de Nullarbor
      { x: -0.54 * baseW, y: 2360 }, // Esperance
      { x: -0.62 * baseW, y: 2260 }, // Albany / Costa suroeste
      { x: -0.67 * baseW, y: 2130 }, // Cabo Leeuwin (Esquina suroeste)

      // 3. Costa Oeste de Australia Occidental (WA)
      { x: -0.68 * baseW, y: 1880 }, // Perth / Fremantle / Rottnest Island
      { x: -0.70 * baseW, y: 1560 }, // Geraldton
      { x: -0.74 * baseW, y: 1260 }, // Bahía Shark / Steep Point (Punto más occidental)
      { x: -0.69 * baseW, y: 960 },  // Ningaloo Reef / Exmouth / Cabo Noroeste
      { x: -0.58 * baseW, y: 720 },  // Pilbara / Dampier / Port Hedland
      { x: -0.44 * baseW, y: 540 },  // Eighty Mile Beach / Broome

      // 4. Kimberleys, Costa Norte y Darwin
      { x: -0.32 * baseW, y: 410 },  // Región de Kimberley
      { x: -0.20 * baseW, y: 350 },  // Golfo Joseph Bonaparte
      { x: -0.12 * baseW, y: 250 },  // Darwin / Beagle Gulf
      { x: -0.04 * baseW, y: 210 },  // Península de Cobourg
      { x: 0.02 * baseW, y: 230 },   // Tierra de Arnhem (Extremo noreste de NT)

      // 5. Golfo de Carpentaria (Enorme bahía rectangular hacia el interior)
      { x: 0.03 * baseW, y: 340 },   // Entrada occidental del Golfo
      { x: 0.00 * baseW, y: 520 },   // Litoral oeste del Golfo
      { x: 0.06 * baseW, y: 720 },   // Fondo sur del Golfo (Karumba)
      { x: 0.12 * baseW, y: 520 },   // Litoral este del Golfo
      { x: 0.11 * baseW, y: 290 },   // Costa oeste de Cabo York
      { x: 0.14 * baseW, y: 70 }     // Cierre en la punta norte de Cabo York
    ];

    // Helper para escalar ligeramente el polígono desde su centroide
    const expandPolygon = (pts, expandRatio = 1.035) => {
      let cx = 0, cy = 0;
      pts.forEach(p => { cx += p.x; cy += p.y; });
      cx /= pts.length;
      cy /= pts.length;
      return pts.map(p => ({
        x: cx + (p.x - cx) * expandRatio,
        y: cy + (p.y - cy) * expandRatio
      }));
    };

    const shelfPoly = expandPolygon(australiaOutline, 1.038);

    // ========================================================
    // 1. PLATAFORMA DE ARRECIFE Y AGUAS SOMERAS (Estética de Islas)
    // ========================================================
    ctx.fillStyle = "rgba(45, 212, 191, 0.38)"; // Turquesa arrecifal resplandeciente
    ctx.beginPath();
    ctx.moveTo(shelfPoly[0].x, shelfPoly[0].y);
    for (let i = 1; i < shelfPoly.length; i++) {
      ctx.lineTo(shelfPoly[i].x, shelfPoly[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // ========================================================
    // 2. ROMPIENTES DE SURF Y ESPUMA COSTERA ANIMADA (Estética de Islas)
    // ========================================================
    const surfPulse = 1.0 + Math.sin(performance.now() * 0.0028) * 0.05;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 2.0;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(shelfPoly[0].x * surfPulse, shelfPoly[0].y);
    for (let i = 1; i < shelfPoly.length; i++) {
      ctx.lineTo(shelfPoly[i].x * surfPulse, shelfPoly[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // ========================================================
    // 3. PLAYA DE ARENA DORADA PERIMETRAL
    // ========================================================
    ctx.strokeStyle = "#fef08a"; // Arena dorada cálida
    ctx.lineWidth = 7.0;
    ctx.beginPath();
    ctx.moveTo(australiaOutline[0].x, australiaOutline[0].y);
    for (let i = 1; i < australiaOutline.length; i++) {
      ctx.lineTo(australiaOutline[i].x, australiaOutline[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // ========================================================
    // 4. MASA CONTINENTAL DE TIERRA CON BIOMAS RICOS Y GRADIENTES
    // ========================================================
    // Gradiente de Biomas: Costa Norte y Este tropicales -> Desierto Rojo central -> Costa Sur templada
    const continentGrad = ctx.createLinearGradient(0, 100, 0, 2700);
    continentGrad.addColorStop(0, "#15803d");    // Selva tropical de Daintree y Cabo York
    continentGrad.addColorStop(0.18, "#166534"); // Bosques de eucalipto de Queensland
    continentGrad.addColorStop(0.38, "#b45309"); // Sabana ocre y matorral
    continentGrad.addColorStop(0.55, "#9a3412"); // Gran Desierto Rojo / Territorio de Uluru
    continentGrad.addColorStop(0.75, "#b45309"); // Llanura semiárida de Nullarbor
    continentGrad.addColorStop(0.90, "#15803d"); // Colinas verdes y bosques de Victoria
    continentGrad.addColorStop(1, "#14532d");    // Selva fría templada del extremo sur

    ctx.fillStyle = continentGrad;
    ctx.beginPath();
    ctx.moveTo(australiaOutline[0].x, australiaOutline[0].y);
    for (let i = 1; i < australiaOutline.length; i++) {
      ctx.lineTo(australiaOutline[i].x, australiaOutline[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Textura y sombras del Outback en el corazón continental
    ctx.save();
    ctx.fillStyle = "rgba(120, 53, 15, 0.45)";
    ctx.beginPath();
    ctx.ellipse(-0.06 * baseW, 1450, baseW * 0.32, 480, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ========================================================
    // 5. GRAN CORDILLERA DIVISORIA (Relieve montañoso oriental)
    // ========================================================
    ctx.save();
    ctx.strokeStyle = "rgba(120, 53, 15, 0.65)";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0.18 * baseW, 350);
    ctx.quadraticCurveTo(0.28 * baseW, 1000, 0.38 * baseW, 1600);
    ctx.quadraticCurveTo(0.36 * baseW, 2100, 0.22 * baseW, 2550);
    ctx.stroke();

    // Crestas de roca y cumbres de las Blue Mountains y Snowy Mountains
    ctx.strokeStyle = "rgba(254, 243, 199, 0.45)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0.18 * baseW + 2, 380);
    ctx.quadraticCurveTo(0.28 * baseW + 4, 1050, 0.38 * baseW + 3, 1650);
    ctx.quadraticCurveTo(0.36 * baseW + 3, 2120, 0.22 * baseW + 2, 2580);
    ctx.stroke();
    ctx.restore();

    // ========================================================
    // 6. DETALLES GEOGRÁFICOS LEGENDARIOS
    // ========================================================
    // A. Monolito Sagrado Uluru (Ayers Rock) en el centro rojo
    const uluruX = -0.08 * baseW;
    const uluruY = 1450;
    ctx.save();
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(uluruX, uluruY, 22, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.ellipse(uluruX + 4, uluruY + 2, 16, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // B. Lago Eyre (Kati Thanda) - Depresión salina interior
    const eyreX = -0.05 * baseW;
    const eyreY = 1920;
    ctx.fillStyle = "rgba(254, 243, 199, 0.65)";
    ctx.beginPath();
    ctx.ellipse(eyreX, eyreY, 48, 28, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ========================================================
    // 7. LA GRAN BARRERA DE CORAL (Great Barrier Reef)
    // Cadena monumental de arrecifes turquesas bioluminiscentes a lo largo de Queensland
    // ========================================================
    ctx.save();
    ctx.strokeStyle = "rgba(45, 212, 191, 0.75)";
    ctx.lineWidth = 8.0;
    ctx.shadowColor = "#5eead4";
    ctx.shadowBlur = 16;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(0.22 * baseW, 120);
    ctx.quadraticCurveTo(0.27 * baseW, 600, 0.44 * baseW, 1380);
    ctx.stroke();
    ctx.setLineDash([]);

    // Atolones coralinos individuales con cayos de arena blanca
    const coralAtolls = [
      { x: 0.20 * baseW, y: 160, r: 16 },
      { x: 0.22 * baseW, y: 320, r: 22 },
      { x: 0.25 * baseW, y: 520, r: 26 },
      { x: 0.28 * baseW, y: 720, r: 24 },
      { x: 0.33 * baseW, y: 940, r: 28 },
      { x: 0.38 * baseW, y: 1180, r: 24 },
      { x: 0.44 * baseW, y: 1420, r: 20 }
    ];

    for (const atoll of coralAtolls) {
      // Halo turquesa somero
      ctx.fillStyle = "rgba(45, 212, 191, 0.55)";
      ctx.beginPath();
      ctx.arc(atoll.x, atoll.y, atoll.r, 0, Math.PI * 2);
      ctx.fill();

      // Laguna interior
      ctx.fillStyle = "rgba(2, 44, 67, 0.75)";
      ctx.beginPath();
      ctx.arc(atoll.x, atoll.y, atoll.r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Cayo de arena coralina blanca
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(atoll.x - 3, atoll.y - 2, atoll.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ========================================================
    // 8. ISLA DE TASMANIA (Al Sureste, en el Estrecho de Bass)
    // ========================================================
    const tasX = 0.20 * baseW;
    const tasY = 2920;
    const tasOutline = [
      { x: tasX - 25, y: tasY - 45 },
      { x: tasX + 35, y: tasY - 40 },
      { x: tasX + 48, y: tasY + 15 },
      { x: tasX + 15, y: tasY + 50 },
      { x: tasX - 35, y: tasY + 40 },
      { x: tasX - 45, y: tasY - 10 }
    ];

    // Arrecife de Tasmania
    ctx.fillStyle = "rgba(45, 212, 191, 0.4)";
    ctx.beginPath();
    ctx.arc(tasX, tasY, 68, 0, Math.PI * 2);
    ctx.fill();

    // Playa dorada de Tasmania
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tasOutline[0].x, tasOutline[0].y);
    for (let i = 1; i < tasOutline.length; i++) ctx.lineTo(tasOutline[i].x, tasOutline[i].y);
    ctx.closePath();
    ctx.stroke();

    // Tierra fértil y montañas de Tasmania
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.moveTo(tasOutline[0].x, tasOutline[0].y);
    for (let i = 1; i < tasOutline.length; i++) ctx.lineTo(tasOutline[i].x, tasOutline[i].y);
    ctx.closePath();
    ctx.fill();

    // ========================================================
    // 9. PALMERAS Y ARBOLEDAS COSTERAS (Estética de Islas)
    // ========================================================
    const coastalGroves = [
      { x: 0.17 * baseW, y: 280, count: 4 },  // Cooktown
      { x: 0.22 * baseW, y: 460, count: 5 },  // Cairns
      { x: 0.27 * baseW, y: 780, count: 4 },  // Townsville
      { x: 0.43 * baseW, y: 1540, count: 5 }, // Gold Coast
      { x: 0.39 * baseW, y: 2120, count: 4 }, // Sydney
      { x: -0.66 * baseW, y: 1920, count: 4 },// Perth
      { x: -0.10 * baseW, y: 270, count: 5 }  // Darwin
    ];

    for (const grove of coastalGroves) {
      for (let p = 0; p < grove.count; p++) {
        const px = grove.x + (p - grove.count / 2) * 12;
        const py = grove.y + ((p % 2) * 8);
        this.drawPalmTree(ctx, px, py, 5.5);
      }
    }

    // ========================================================
    // 10. BASES ESTRATÉGICAS Y PISTAS MILITARES DE ATERRIZAJE
    // ========================================================
    const militaryBases = [
      { name: "BASE AÉREA ESTRATÉGICA DARWIN", x: -0.10 * baseW, y: 260, color: "#38bdf8", isAirbase: true },
      { name: "PUESTO NAVAL DEL CORAL / CAIRNS", x: 0.17 * baseW, y: 440, color: "#fbbf24", isAirbase: true },
      { name: "ESTACIÓN TÁCTICA TOWNSVILLE", x: 0.25 * baseW, y: 760, color: "#34d399", isAirbase: false },
      { name: "RADAR PROFUNDO ALICE SPRINGS", x: -0.06 * baseW, y: 1380, color: "#f43f5e", isAirbase: true },
      { name: "COMANDO NAVAL BRISBANE", x: 0.41 * baseW, y: 1520, color: "#38bdf8", isAirbase: false },
      { name: "FORTALEZA MARÍTIMA SYDNEY", x: 0.38 * baseW, y: 2100, color: "#00f3ff", isAirbase: true },
      { name: "HANGAR MERIDIONAL MELBOURNE", x: 0.05 * baseW, y: 2620, color: "#a855f7", isAirbase: true },
      { name: "PUERTO DEFENSIVO PERTH", x: -0.64 * baseW, y: 1890, color: "#34d399", isAirbase: true }
    ];

    const radarAngle = performance.now() * 0.003;
    for (const base of militaryBases) {
      // Pistas de aterrizaje iluminadas
      if (base.isAirbase) {
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(base.x - 16, base.y - 5);
        ctx.lineTo(base.x + 16, base.y + 5);
        ctx.stroke();
      }

      // Baliza de radar de defensa
      ctx.fillStyle = base.color;
      ctx.beginPath();
      ctx.arc(base.x, base.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Ondas concéntricas de radar
      ctx.strokeStyle = base.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(base.x, base.y, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(base.x + Math.cos(radarAngle) * 16, base.y + Math.sin(radarAngle) * 16);
      ctx.stroke();

      // Rótulo táctico
      ctx.font = "bold 8.5px 'Orbitron', monospace";
      ctx.fillStyle = base.color;
      ctx.fillText(base.name, base.x + 20, base.y + 3);
    }

    // ========================================================
    // 11. RÓTULOS HOLOGRÁFICOS DE GEOGRAFÍA TÁCTICA
    // ========================================================
    ctx.font = "bold 10px 'Orbitron', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("📍 PENÍNSULA DE CABO YORK", 0.16 * baseW, 110);

    ctx.fillStyle = "#2dd4bf";
    ctx.fillText("📍 GOLFO DE CARPENTARIA", 0.01 * baseW, 460);

    ctx.fillStyle = "#5eead4";
    ctx.fillText("🛡️ GRAN BARRERA DE CORAL", 0.32 * baseW, 620);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText("📍 GRAN DESIERTO ROJO (OUTBACK & ULURU)", -0.16 * baseW, 1340);

    ctx.fillStyle = "#34d399";
    ctx.fillText("📍 GRAN BAHÍA AUSTRALIANA", -0.42 * baseW, 2320);

    ctx.fillStyle = "#a855f7";
    ctx.fillText("📍 ESTRECHO DE BASS & TASMANIA", 0.16 * baseW, 2820);

    ctx.restore();
  }

  /**
   * Cartela táctica inferior de región y avance continental
   */
  renderPacificPositionBanner(ctx, w, h, distanceRatio) {
    let regionText = "SOBREVOLANDO: OCÉANO PACÍFICO [ARCHIPIÉLAGOS & ATOLONES]";
    let subText = "Ruta marítima de alta velocidad - Neutralizando puestos flotantes";

    if (distanceRatio > 0.32 && distanceRatio <= 0.52) {
      regionText = "TIERRA A LA VISTA: CABO YORK & GRAN BARRERA DE CORAL";
      subText = "Incursión al continente australiano - Intercepción de Sublíder Nautilus-X";
    } else if (distanceRatio > 0.52 && distanceRatio <= 0.72) {
      regionText = "ESPACIO AÉREO AUSTRALIANO: QUEENSLAND & CORDILLERA DIVISORIA";
      subText = "Sobrevuelo sobre bosques de eucalipto, costas doradas y bases de defensa";
    } else if (distanceRatio > 0.72 && distanceRatio <= 0.86) {
      regionText = "CORAZÓN DEL CONTINENTE: EL GRAN DESIERTO ROJO (OUTBACK & ULURU)";
      subText = "Cielos carmesí del desierto central - Aproximación al área del Jefe Leviathan";
    } else if (distanceRatio > 0.86) {
      regionText = "¡ALERTA MÁXIMA! COSTA SUR AUSTRALIANA [BOSS LEVIATHAN COLOSSUS]";
      subText = "Acorazado Leviathan Colossus en combate decisivo sobre el litoral sur";
    }

    ctx.save();
    ctx.fillStyle = "rgba(7, 10, 24, 0.78)";
    ctx.fillRect(w / 2 - 220, h - 38, 440, 30);
    ctx.strokeStyle = distanceRatio > 0.86 ? "#ff0055" : "rgba(20, 184, 166, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 220, h - 38, 440, 30);

    ctx.font = "9px 'Orbitron', monospace";
    ctx.fillStyle = distanceRatio > 0.86 ? "#ff0055" : "#2dd4bf";
    ctx.textAlign = "center";
    ctx.fillText(regionText, w / 2, h - 22);

    ctx.font = "8px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(subText, w / 2, h - 11);
    ctx.restore();
  }

  /**
   * Radar táctico en la esquina inferior izquierda:
   * Muestra la silueta de Australia, la Gran Barrera de Coral y la posición del caza.
   */
  renderPacificAustraliaRadar(ctx, distanceRatio) {
    const rx = 15;
    const ry = this.canvas.height - 145;
    const rw = 100;
    const rh = 135;

    ctx.save();
    // Caja del radar
    ctx.fillStyle = "rgba(7, 12, 26, 0.88)";
    ctx.strokeStyle = "#14b8a6";
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    // Título
    ctx.fillStyle = "#2dd4bf";
    ctx.font = "bold 8px 'Orbitron', monospace";
    ctx.fillText("RADAR PACÍFICO", rx + 8, ry + 12);

    // Líneas de cuadrícula
    ctx.strokeStyle = "rgba(20, 184, 166, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + 5, ry + rh / 2);
    ctx.lineTo(rx + rw - 5, ry + rh / 2);
    ctx.moveTo(rx + rw / 2, ry + 18);
    ctx.lineTo(rx + rw / 2, ry + rh - 18);
    ctx.stroke();

    // Silueta vectorial esquemática de Australia en el radar
    const radarCenterY = ry + 82;
    const radarCenterX = rx + 50;
    const rScale = 52;

    ctx.strokeStyle = "rgba(52, 211, 153, 0.65)";
    ctx.fillStyle = "rgba(21, 128, 61, 0.25)";
    ctx.lineWidth = 1.3;

    ctx.beginPath();
    // Cabo York
    ctx.moveTo(radarCenterX + 0.16 * rScale, radarCenterY - 0.42 * rScale);
    ctx.lineTo(radarCenterX + 0.28 * rScale, radarCenterY + 0.02 * rScale); // Queensland
    ctx.lineTo(radarCenterX + 0.36 * rScale, radarCenterY + 0.30 * rScale); // Brisbane
    ctx.lineTo(radarCenterX + 0.25 * rScale, radarCenterY + 0.54 * rScale); // Sydney
    ctx.lineTo(radarCenterX + 0.10 * rScale, radarCenterY + 0.64 * rScale); // Victoria
    ctx.lineTo(radarCenterX - 0.16 * rScale, radarCenterY + 0.50 * rScale); // Gran Bahía
    ctx.lineTo(radarCenterX - 0.66 * rScale, radarCenterY + 0.46 * rScale); // Suroeste
    ctx.lineTo(radarCenterX - 0.74 * rScale, radarCenterY + 0.00 * rScale); // Shark Bay
    ctx.lineTo(radarCenterX - 0.44 * rScale, radarCenterY - 0.30 * rScale); // Broome
    ctx.lineTo(radarCenterX - 0.12 * rScale, radarCenterY - 0.36 * rScale); // Darwin
    ctx.lineTo(radarCenterX + 0.02 * rScale, radarCenterY - 0.32 * rScale); // Arnhem
    ctx.lineTo(radarCenterX + 0.03 * rScale, radarCenterY - 0.24 * rScale); // Golfo oeste
    ctx.lineTo(radarCenterX + 0.06 * rScale, radarCenterY - 0.06 * rScale); // Golfo sur
    ctx.lineTo(radarCenterX + 0.13 * rScale, radarCenterY - 0.26 * rScale); // Golfo este
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gran Barrera de Coral en el radar (Línea punteada cian)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(radarCenterX + 0.22 * rScale, radarCenterY - 0.38 * rScale);
    ctx.quadraticCurveTo(radarCenterX + 0.25 * rScale, radarCenterY - 0.16 * rScale, radarCenterX + 0.38 * rScale, radarCenterY + 0.04 * rScale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Línea de vector de vuelo continuo desde el Pacífico hasta el sur de Australia
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(rx + 82, ry + 22);
    ctx.lineTo(radarCenterX + 0.16 * rScale, radarCenterY - 0.42 * rScale);
    ctx.lineTo(radarCenterX + 0.10 * rScale, radarCenterY + 0.65 * rScale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Marcador de posición del jugador en el radar
    let planeX, planeY;
    if (distanceRatio < 0.32) {
      const oceanP = distanceRatio / 0.32;
      planeX = (rx + 82) + ((radarCenterX + 0.16 * rScale) - (rx + 82)) * oceanP;
      planeY = (ry + 22) + ((radarCenterY - 0.42 * rScale) - (ry + 22)) * oceanP;
    } else {
      const landP = (distanceRatio - 0.32) / (1.0 - 0.32);
      planeX = (radarCenterX + 0.16 * rScale) + ((radarCenterX + 0.10 * rScale) - (radarCenterX + 0.16 * rScale)) * landP;
      planeY = (radarCenterY - 0.42 * rScale) + ((radarCenterY + 0.65 * rScale) - (radarCenterY - 0.42 * rScale)) * landP;
    }

    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(planeX, planeY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(planeX, planeY, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Coordenadas tácticas en tiempo real
    ctx.font = "8px monospace";
    ctx.fillStyle = "#34d399";
    const lat = Math.floor(6 + distanceRatio * 24);
    const lon = Math.floor(168 - distanceRatio * 24);
    ctx.fillText(`LAT: ${lat}°S`, rx + 10, ry + rh - 13);
    ctx.fillText(`LON: ${lon}°E`, rx + 10, ry + rh - 3);

    ctx.restore();
  }

  // ==========================================
  // ESCENARIO 3: DE LA TIERRA A SATURNO (VÍA MARTE, ASTEROIDES Y JÚPITER)
  // ==========================================
  renderStage3_EarthToJupiter(ctx, w, h, distanceRatio) {
    const now = performance.now();

    // 1. Fondo de vacío cósmico profundo con sutiles nebulosas interestelares
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, h);
    spaceGrad.addColorStop(0, "#01030a");
    spaceGrad.addColorStop(0.5, "#030714");
    spaceGrad.addColorStop(1, "#02050e");
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // Velo nebular cósmico tenue (gases interestelares en violeta y cian)
    ctx.fillStyle = "rgba(99, 102, 241, 0.04)";
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.4, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(244, 63, 94, 0.035)";
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.65, 220, 0, Math.PI * 2);
    ctx.fill();

    // 2. Estrellas del cosmos y pocas estrellitas titilantes a lo lejos
    this.drawTwinklingStars(ctx, now);

    // 3. SECUENCIA PLANETARIA INTERPLANETARIA:

    // A. La Tierra alejándose por la parte inferior al inicio de la misión
    if (distanceRatio < 0.28) {
      this.drawLeavingEarth(ctx, w, h, distanceRatio);
    }

    // B. Paso cercano por Marte (se ve a un lado, ni muy cerca ni diminuto)
    if (distanceRatio >= 0.12 && distanceRatio <= 0.38) {
      this.drawPassingMars(ctx, w, h, distanceRatio);
    }

    // C. Cinturón de Asteroides entre Marte y Júpiter
    if (distanceRatio >= 0.26 && distanceRatio <= 0.50) {
      this.drawAsteroidBelt(ctx, w, h, distanceRatio);
    }

    // D. Júpiter visible a lo lejos con sus bandas y satélites (aquí aparece el Sublíder)
    if (distanceRatio >= 0.32 && distanceRatio <= 0.65) {
      this.drawDistantJupiter(ctx, w, h, distanceRatio);
    }

    // E. Llegada a Saturno con sus majestuosos anillos 3D (aquí aparece el Jefe Final)
    if (distanceRatio >= 0.60) {
      this.drawApproachingSaturn(ctx, w, h, distanceRatio);
    }

    // 4. Cartela Táctica Espacial de Posición
    this.renderSolarPositionBanner(ctx, w, h, distanceRatio);

    // 5. Radar Táctico del Sistema Solar en la esquina inferior izquierda
    this.renderSolarSystemRadar(ctx, distanceRatio);
  }

  /**
   * Dibuja el campo de estrellas cósmico con pocas estrellas que titilan
   * aleatoriamente con destellos ópticos de difracción.
   */
  drawTwinklingStars(ctx, now) {
    for (const star of this.spaceStars) {
      let alpha = star.baseAlpha;
      if (star.isTwinkle) {
        // Suave onda sinusoidal independiente para cada estrella
        alpha = 0.2 + 0.75 * (0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinkleOffset));
      }

      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      ctx.fillRect(star.x, star.y, star.size, star.size);

      // Destello de 4 puntas en las estrellas titilantes más brillantes
      if (star.hasGlint && alpha > 0.65) {
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 0.8;
        const glintLen = star.size * 2.8;
        ctx.beginPath();
        ctx.moveTo(star.x - glintLen, star.y + star.size / 2);
        ctx.lineTo(star.x + star.size + glintLen, star.y + star.size / 2);
        ctx.moveTo(star.x + star.size / 2, star.y - glintLen);
        ctx.lineTo(star.x + star.size / 2, star.y + star.size + glintLen);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * La Tierra alejándose hacia abajo durante el despegue orbital
   */
  drawLeavingEarth(ctx, w, h, distanceRatio) {
    const p = distanceRatio / 0.28;
    const earthRadius = (1.0 - p) * 220 + 70;
    const earthY = h + earthRadius * 0.75 + p * 120;
    const earthX = w / 2;

    // Resplandor de la atmósfera terrestre
    const earthGlow = ctx.createRadialGradient(earthX, earthY, earthRadius * 0.85, earthX, earthY, earthRadius * 1.18);
    earthGlow.addColorStop(0, "rgba(56, 189, 248, 0.45)");
    earthGlow.addColorStop(0.5, "rgba(14, 165, 233, 0.2)");
    earthGlow.addColorStop(1, "transparent");
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthRadius * 1.18, 0, Math.PI * 2);
    ctx.fill();

    // Globo de la Tierra
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
    ctx.clip();

    // Océanos profundos
    ctx.fillStyle = "#0369a1";
    ctx.fillRect(earthX - earthRadius, earthY - earthRadius, earthRadius * 2, earthRadius * 2);

    // Masas continentales verdes y ocres
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.ellipse(earthX - earthRadius * 0.3, earthY - earthRadius * 0.4, earthRadius * 0.5, earthRadius * 0.35, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#166534";
    ctx.beginPath();
    ctx.ellipse(earthX + earthRadius * 0.35, earthY - earthRadius * 0.2, earthRadius * 0.45, earthRadius * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Nubes atmosféricas blancas
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.beginPath();
    ctx.arc(earthX - earthRadius * 0.2, earthY - earthRadius * 0.35, earthRadius * 0.3, 0, Math.PI * 2);
    ctx.arc(earthX + earthRadius * 0.25, earthY - earthRadius * 0.15, earthRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Paso cercano por Marte: el planeta rojo se ve a un lado, ni muy cerca ni diminuto
   */
  drawPassingMars(ctx, w, h, distanceRatio) {
    const p = (distanceRatio - 0.12) / 0.26;
    const marsRadius = 38; // Escala perfecta para no estorbar el juego
    const marsX = w * 0.82 - p * 45;
    const marsY = -40 + p * (h + 100);

    ctx.save();

    // Halo atmosférico marciano tenue en rojo óxido
    const marsGlow = ctx.createRadialGradient(marsX, marsY, marsRadius * 0.8, marsX, marsY, marsRadius * 1.35);
    marsGlow.addColorStop(0, "rgba(239, 68, 68, 0.35)");
    marsGlow.addColorStop(0.7, "rgba(185, 28, 28, 0.12)");
    marsGlow.addColorStop(1, "transparent");
    ctx.fillStyle = marsGlow;
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsRadius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Esfera del Planeta Rojo
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsRadius, 0, Math.PI * 2);
    ctx.clip();

    // Superficie roja oxidada
    const marsGrad = ctx.createRadialGradient(marsX - marsRadius * 0.3, marsY - marsRadius * 0.3, marsRadius * 0.1, marsX, marsY, marsRadius);
    marsGrad.addColorStop(0, "#ea580c"); // Iluminación solar
    marsGrad.addColorStop(0.4, "#c2410c"); // Tierras altas de Tharsis
    marsGrad.addColorStop(0.85, "#991b1b"); // Basalto oxidado
    marsGrad.addColorStop(1, "#450a0a"); // Sombra nocturna
    ctx.fillStyle = marsGrad;
    ctx.fillRect(marsX - marsRadius, marsY - marsRadius, marsRadius * 2, marsRadius * 2);

    // Marcas oscuras de terreno (Syrtis Major y Valles Marineris)
    ctx.fillStyle = "rgba(69, 10, 10, 0.65)";
    ctx.beginPath();
    ctx.ellipse(marsX + marsRadius * 0.15, marsY + marsRadius * 0.1, marsRadius * 0.45, marsRadius * 0.2, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Fisura de Valles Marineris
    ctx.strokeStyle = "#450a0a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(marsX - marsRadius * 0.4, marsY + marsRadius * 0.05);
    ctx.lineTo(marsX + marsRadius * 0.2, marsY + marsRadius * 0.15);
    ctx.stroke();

    // Casquete polar de hielo de CO2 en el norte
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(marsX, marsY - marsRadius * 0.82, marsRadius * 0.35, marsRadius * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Pequeñas lunas Fobos y Deimos como puntos celestiales
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(marsX - marsRadius * 1.5, marsY - marsRadius * 0.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(marsX + marsRadius * 1.6, marsY + marsRadius * 0.8, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Rótulo táctico
    ctx.font = "bold 8px 'Orbitron', monospace";
    ctx.fillStyle = "#f87171";
    ctx.fillText("🔴 MARTE [1.5 UA]", marsX - 25, marsY + marsRadius + 14);
  }

  /**
   * Cinturón de Asteroides entre Marte y Júpiter:
   * Rocas espaciales con polígonos irregulares, rotación procedural y sombreado 3D.
   */
  drawAsteroidBelt(ctx, w, h, distanceRatio) {
    // Opacidad en campana que alcanza el máximo en el centro del cinturón
    const beltProgress = (distanceRatio - 0.26) / 0.24;
    const beltAlpha = Math.sin(beltProgress * Math.PI);
    if (beltAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = beltAlpha * 0.85;

    for (const a of this.spaceAsteroids) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);

      // Sombra proyectada del asteroide
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(a.poly[0].x + 2, a.poly[0].y + 2);
      for (let i = 1; i < a.poly.length; i++) {
        ctx.lineTo(a.poly[i].x + 2, a.poly[i].y + 2);
      }
      ctx.closePath();
      ctx.fill();

      // Cuerpo rocoso del asteroide
      ctx.fillStyle = a.color;
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.poly[0].x, a.poly[0].y);
      for (let i = 1; i < a.poly.length; i++) {
        ctx.lineTo(a.poly[i].x, a.poly[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cráteres de impacto en la superficie rocosa
      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.beginPath();
      ctx.arc(a.radius * 0.25, a.radius * 0.2, a.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Júpiter visible a lo lejos con sus bandas atmosféricas de gas y la Gran Mancha Roja.
   * Aquí en la órbita joviana (40% de fase) es donde intercepta el Sublíder JOVIAN CORE.
   */
  drawDistantJupiter(ctx, w, h, distanceRatio) {
    const p = (distanceRatio - 0.32) / 0.33;
    // Júpiter se ve a lo lejos (no colosal para dejar espacio a la aproximación de Saturno)
    const jupRadius = 48 + Math.sin(p * Math.PI) * 26; // Radio elegante de 48 a 74px
    const jupX = w * 0.38 + Math.sin(p * 2) * 20;
    const jupY = 85 + p * 130;

    ctx.save();

    // Resplandor de hidrógeno joviano
    const jupGlow = ctx.createRadialGradient(jupX, jupY, jupRadius * 0.75, jupX, jupY, jupRadius * 1.32);
    jupGlow.addColorStop(0, "rgba(249, 115, 22, 0.35)");
    jupGlow.addColorStop(0.65, "rgba(234, 88, 12, 0.1)");
    jupGlow.addColorStop(1, "transparent");
    ctx.fillStyle = jupGlow;
    ctx.beginPath();
    ctx.arc(jupX, jupY, jupRadius * 1.32, 0, Math.PI * 2);
    ctx.fill();

    // Esfera y franjas de nubes de Júpiter
    ctx.beginPath();
    ctx.arc(jupX, jupY, jupRadius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#c2410c";
    ctx.fillRect(jupX - jupRadius, jupY - jupRadius, jupRadius * 2, jupRadius * 2);

    // Franjas de nubes atmosféricas
    const bands = ["#ea580c", "#fed7aa", "#9a3412", "#fdba74", "#7c2d12", "#f97316", "#fed7aa", "#c2410c"];
    const bandHeight = (jupRadius * 2) / bands.length;
    bands.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(jupX - jupRadius, (jupY - jupRadius) + i * bandHeight, jupRadius * 2, bandHeight * 0.72);
    });

    // Gran Mancha Roja (torbellino ciclónico)
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.ellipse(jupX + jupRadius * 0.32, jupY + jupRadius * 0.22, jupRadius * 0.24, jupRadius * 0.14, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Lunas Galileanas (Ío, Europa, Ganímedes, Calisto)
    const moons = [
      { name: "Ío", dist: -1.45, yOff: -0.2, r: 2.2, color: "#fef08a" },
      { name: "Europa", dist: -1.9, yOff: 0.1, r: 1.8, color: "#e0f2fe" },
      { name: "Ganímedes", dist: 1.5, yOff: -0.15, r: 2.5, color: "#cbd5e1" },
      { name: "Calisto", dist: 2.05, yOff: 0.25, r: 2.3, color: "#94a3b8" }
    ];

    for (const m of moons) {
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(jupX + jupRadius * m.dist, jupY + jupRadius * m.yOff, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rótulo táctico
    ctx.font = "bold 8px 'Orbitron', monospace";
    ctx.fillStyle = "#fb923c";
    ctx.fillText("🟠 JÚPITER [5.2 UA] · ÓRBITA DE SUBLÍDER", jupX - 60, jupY + jupRadius + 14);

    ctx.restore();
  }

  /**
   * Saturno aproximándose con sus majestuosos anillos 3D inclinados,
   * división de Cassini, sombra proyectada del planeta y Titán.
   * Aquí en los anillos (85% de avance) es donde intercepta el Jefe Final.
   */
  drawApproachingSaturn(ctx, w, h, distanceRatio) {
    const p = Math.min(1.0, (distanceRatio - 0.60) / 0.40);
    // Saturno crece majestuosamente de 45px hasta 112px de radio
    const satRadius = 45 + p * 67;
    const satX = w * 0.52 + Math.sin(p * 1.5) * 20;
    const satY = 110 + p * 75;

    const ringTilt = 0.38; // Inclinación en perspectiva
    const ringAngle = -0.22; // Ángulo de rotación del plano orbital de los anillos

    ctx.save();
    ctx.translate(satX, satY);
    ctx.rotate(ringAngle);

    // Resplandor dorado de Saturno
    const satGlow = ctx.createRadialGradient(0, 0, satRadius * 0.8, 0, 0, satRadius * 2.2);
    satGlow.addColorStop(0, "rgba(253, 230, 138, 0.35)");
    satGlow.addColorStop(0.65, "rgba(245, 158, 11, 0.12)");
    satGlow.addColorStop(1, "transparent");
    ctx.fillStyle = satGlow;
    ctx.beginPath();
    ctx.arc(0, 0, satRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // ----------------------------------------------------
    // PASO 1: MITAD TRASERA DE LOS ANILLOS (DETRÁS DEL PLANETA)
    // ----------------------------------------------------
    this.drawSaturnRingArc(ctx, satRadius, ringTilt, Math.PI, Math.PI * 2);

    // Sombra del planeta proyectada sobre la mitad trasera del anillo (a la derecha)
    ctx.fillStyle = "rgba(1, 3, 10, 0.85)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(satRadius * 0.85, -satRadius * 2.2 * ringTilt);
    ctx.lineTo(satRadius * 2.1, -satRadius * 1.4 * ringTilt);
    ctx.lineTo(satRadius * 0.9, 0);
    ctx.closePath();
    ctx.fill();

    // ----------------------------------------------------
    // PASO 2: GLOBO PLANETARIO DE SATURNO
    // ----------------------------------------------------
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, satRadius, 0, Math.PI * 2);
    ctx.clip();

    // Base de gas ámbar dorado
    const satGrad = ctx.createRadialGradient(-satRadius * 0.25, -satRadius * 0.25, satRadius * 0.1, 0, 0, satRadius);
    satGrad.addColorStop(0, "#fef08a"); // Punto subsolar brillante
    satGrad.addColorStop(0.35, "#fde68a");
    satGrad.addColorStop(0.7, "#f59e0b");
    satGrad.addColorStop(0.95, "#b45309");
    satGrad.addColorStop(1, "#78350f"); // Limbo oscuro
    ctx.fillStyle = satGrad;
    ctx.fillRect(-satRadius, -satRadius, satRadius * 2, satRadius * 2);

    // Franjas de nubes de Saturno (sutiles y elegantes)
    const satBands = [
      { y: -0.6, h: 0.18, col: "rgba(253, 230, 138, 0.35)" },
      { y: -0.35, h: 0.14, col: "rgba(245, 158, 11, 0.25)" },
      { y: -0.1, h: 0.12, col: "rgba(217, 119, 6, 0.3)" },
      { y: 0.15, h: 0.16, col: "rgba(254, 240, 138, 0.3)" },
      { y: 0.45, h: 0.22, col: "rgba(180, 83, 9, 0.25)" }
    ];

    for (const b of satBands) {
      ctx.fillStyle = b.col;
      ctx.fillRect(-satRadius, b.y * satRadius, satRadius * 2, b.h * satRadius);
    }

    // Sombra oscura de los anillos proyectada sobre el ecuador de Saturno
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.beginPath();
    ctx.ellipse(0, 0, satRadius * 0.98, satRadius * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vórtice polar hexagonal de Saturno en el norte
    ctx.fillStyle = "rgba(163, 230, 53, 0.45)";
    ctx.beginPath();
    ctx.ellipse(0, -satRadius * 0.85, satRadius * 0.24, satRadius * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ----------------------------------------------------
    // PASO 3: MITAD DELANTERA DE LOS ANILLOS (DELANTE DEL PLANETA)
    // ----------------------------------------------------
    this.drawSaturnRingArc(ctx, satRadius, ringTilt, 0, Math.PI);

    // Luna Titán orbitando cerca de los anillos
    const titanX = satRadius * 2.45;
    const titanY = -satRadius * 0.6;
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(titanX, titanY, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rótulo táctico
    ctx.font = "bold 9px 'Orbitron', monospace";
    ctx.fillStyle = "#fde047";
    ctx.fillText("🪐 SATURNO [9.5 UA] · SECTOR JEFE FINAL", -90, satRadius + 32);

    ctx.restore();
  }

  /**
   * Traza los arcos concéntricos de los anillos de Saturno (con División de Cassini)
   */
  drawSaturnRingArc(ctx, satRadius, ringTilt, startAngle, endAngle) {
    const rxOuter = satRadius * 2.35;
    const ryOuter = rxOuter * ringTilt;

    const rxCassiniOut = satRadius * 1.95;
    const ryCassiniOut = rxCassiniOut * ringTilt;

    const rxCassiniIn = satRadius * 1.82;
    const ryCassiniIn = rxCassiniIn * ringTilt;

    const rxInner = satRadius * 1.35;
    const ryInner = rxInner * ringTilt;

    // 1. Anillo A (Exterior)
    ctx.fillStyle = "rgba(253, 230, 138, 0.72)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rxOuter, ryOuter, 0, startAngle, endAngle, false);
    ctx.ellipse(0, 0, rxCassiniOut, ryCassiniOut, 0, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    // 2. División de Cassini (Brecha oscura realista en los anillos)
    ctx.fillStyle = "rgba(2, 6, 18, 0.88)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rxCassiniOut, ryCassiniOut, 0, startAngle, endAngle, false);
    ctx.ellipse(0, 0, rxCassiniIn, ryCassiniIn, 0, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    // 3. Anillo B (Principal brillante)
    ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rxCassiniIn, ryCassiniIn, 0, startAngle, endAngle, false);
    ctx.ellipse(0, 0, rxInner, ryInner, 0, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    // 4. Anillo C (Velo semitranslúcido interior / Anillo Crepé)
    ctx.fillStyle = "rgba(217, 119, 6, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rxInner, ryInner, 0, startAngle, endAngle, false);
    ctx.ellipse(0, 0, satRadius * 1.08, satRadius * 1.08 * ringTilt, 0, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Cartela táctica inferior de avance por el sistema solar
   */
  renderSolarPositionBanner(ctx, w, h, distanceRatio) {
    let regionText = "DESPEGUE ORBITAL: DEJANDO LA TIERRA · RUMBO AL SISTEMA SOLAR EXTERIOR";
    let subText = "Aceleración de escape gravitatorio - Motores de iones al 100%";

    if (distanceRatio > 0.20 && distanceRatio <= 0.35) {
      regionText = "PASANDO ÓRBITA DE MARTE [1.5 UA] · APROXIMACIÓN A ZONA DE ASTEROIDES";
      subText = "Escaneando superficie marciana - Sin hostiles detectados en la órbita roja";
    } else if (distanceRatio > 0.35 && distanceRatio <= 0.52) {
      regionText = "CRUCE DEL CINTURÓN DE ASTEROIDES & JÚPITER A LO LEJOS · INTERCEPCIÓN SUBLÍDER";
      subText = "Navegando campo de rocas espaciales - Sublíder Jovian Core detectado";
    } else if (distanceRatio > 0.52 && distanceRatio <= 0.75) {
      regionText = "SUPERANDO JÚPITER · ACELERACIÓN SUBESPACIAL RUMBO A SATURNO";
      subText = "Trayectoria hiperbólica hacia los anillos del gigante gaseoso";
    } else if (distanceRatio > 0.75) {
      regionText = "LLEGADA A SATURNO [9.5 UA] · ANILLOS EN RANGO VISUAL · ALERTA DE JEFE FINAL";
      subText = "Estación Titán de Vektor interceptada en los anillos exteriores";
    }

    ctx.save();
    ctx.fillStyle = "rgba(7, 10, 24, 0.82)";
    ctx.fillRect(w / 2 - 215, h - 38, 430, 30);
    ctx.strokeStyle = distanceRatio > 0.75 ? "#f59e0b" : "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 215, h - 38, 430, 30);

    ctx.font = "9px 'Orbitron', monospace";
    ctx.fillStyle = distanceRatio > 0.75 ? "#fbbf24" : "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText(regionText, w / 2, h - 22);

    ctx.font = "8px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(subText, w / 2, h - 11);
    ctx.restore();
  }

  /**
   * Radar táctico del Sistema Solar en la esquina inferior izquierda:
   * Muestra las órbitas de Tierra, Marte, Cinturón, Júpiter y Saturno con telemetría en UA.
   */
  renderSolarSystemRadar(ctx, distanceRatio) {
    const rx = 15;
    const ry = this.canvas.height - 145;
    const rw = 100;
    const rh = 135;

    ctx.save();
    // Caja del radar
    ctx.fillStyle = "rgba(7, 12, 26, 0.88)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    // Título
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 8px 'Orbitron', monospace";
    ctx.fillText("RADAR SOLAR", rx + 8, ry + 12);

    // Cuadrícula y órbitas concéntricas (Tierra, Marte, Asteroides, Júpiter, Saturno)
    const centerX = rx + rw / 2;
    const sunY = ry + rh - 16; // El Sol en la parte inferior

    // Sol
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(centerX, sunY, 6, 0, Math.PI * 2);
    ctx.fill();

    const orbits = [
      { r: 24, col: "rgba(56, 189, 248, 0.35)", name: "Tierra" },
      { r: 42, col: "rgba(239, 68, 68, 0.35)", name: "Marte" },
      { r: 62, col: "rgba(148, 163, 184, 0.25)", isDash: true, name: "Cinturón" },
      { r: 84, col: "rgba(249, 115, 22, 0.35)", name: "Júpiter" },
      { r: 108, col: "rgba(253, 230, 138, 0.45)", name: "Saturno" }
    ];

    for (const orb of orbits) {
      ctx.strokeStyle = orb.col;
      ctx.lineWidth = 1;
      if (orb.isDash) ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.ellipse(centerX, sunY, orb.r, orb.r * 0.72, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      if (orb.isDash) ctx.setLineDash([]);
    }

    // Trayectoria del jugador hacia Saturno
    ctx.strokeStyle = "#38bdf8";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, sunY - 24); // Desde la Tierra
    ctx.lineTo(centerX, sunY - 108); // Hasta Saturno
    ctx.stroke();
    ctx.setLineDash([]);

    // Marcador dinámico del caza del jugador
    const currentDist = 24 + distanceRatio * (108 - 24);
    const shipY = sunY - currentDist;

    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(centerX, shipY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(centerX, shipY, 6.5, 0, Math.PI * 2);
    ctx.stroke();

    // Telemetría astronómica en Unidades Astronómicas (UA)
    ctx.font = "8px monospace";
    ctx.fillStyle = "#34d399";
    const au = (1.0 + distanceRatio * 8.5).toFixed(1);
    ctx.fillText(`DIST: ${au} UA`, rx + 10, ry + rh - 13);
    ctx.fillText(`DEST: SATURNO`, rx + 10, ry + rh - 3);

    ctx.restore();
  }

  // ==========================================
  // ESCENARIO 4: EL CÍRCULO ÁRTICO: DE GROENLANDIA AL POLO NORTE (MAPA GEOGRÁFICO REAL)
  // ==========================================
  renderStage4_IceZone(ctx, w, h, distanceRatio) {
    // 1. Fondo del Océano Glacial Ártico y Mar de Groenlandia
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, "#021326");
    oceanGrad.addColorStop(0.5, "#04223f");
    oceanGrad.addColorStop(1, "#02182e");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // Ondas y corrientes del agua ártica con brillo gélido
    ctx.strokeStyle = "rgba(56, 189, 248, 0.09)";
    ctx.lineWidth = 1.2;
    const waveOffset = (this.scrollY * 0.25) % 40;
    for (let wy = waveOffset; wy < h; wy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, wy);
      ctx.bezierCurveTo(w * 0.25, wy + 6, w * 0.75, wy - 6, w, wy);
      ctx.stroke();
    }

    // Altura total del recorrido ártico continuo (3600px)
    const totalMapHeight = 3600;
    const scrollMapY = distanceRatio * (totalMapHeight - h);

    ctx.save();
    ctx.translate(0, -scrollMapY);

    // --- A. MAPA CONTINENTAL ÁRTICO, GROENLANDIA Y POLO NORTE ---
    this.drawArcticContinents(ctx, w, h);

    // --- B. TÉMPANOS DE HIELO (ICEBERGS) DERIVANDO EN AGUAS ABIERTAS ---
    this.drawFloatingIcebergs(ctx, w);

    ctx.restore();

    // 2. Efecto atmosférico: Aurora Boreal ondeando en el cielo polar
    this.drawAuroraBorealis(ctx, w, h);

    // 3. Tempestad de nieve / Ventisca polar
    this.drawSnowBlizzard(ctx);

    // 4. Cartela de posición geográfica ártica inferior
    this.renderArcticPositionBanner(ctx, w, h, distanceRatio);

    // 5. Radar polar estereográfico en esquina inferior izquierda
    this.renderPolarStereographicRadar(ctx, distanceRatio);
  }

  /**
   * Traza la geografía real del Círculo Ártico, Groenlandia, Banquisa y Polo Norte
   */
  drawArcticContinents(ctx, w, h) {
    // ----------------------------------------------------
    // ZONA 1: CÍRCULO POLAR ÁRTICO & MARES BOREALES (Y: 0 a 820)
    // ----------------------------------------------------

    // 1.1 Línea del Paralelo 66°33'49" N (Círculo Polar Ártico)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(0, 130);
    ctx.lineTo(w, 130);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rótulos tácticos del paralelo polar
    ctx.font = "bold 9px 'Orbitron', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("🌐 CÍRCULO POLAR ÁRTICO · PARALELO 66°33'49\" N", 20, 122);
    ctx.textAlign = "right";
    ctx.fillText("TEMP AGUA: -1.8°C · INGRESO AL CASQUETE BOREAL", w - 20, 122);
    ctx.textAlign = "left";

    // 1.2 ISLANDIA (Southwest: Y: 180 a 540, X: w * 0.08 a w * 0.36)
    ctx.fillStyle = "#1e293b"; // Basalto volcánico oscuro
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Penínsulas y fiordos islandeses (Westfjords, Reykjanes, Snaefellsnes)
    ctx.moveTo(w * 0.12, 220);
    ctx.lineTo(w * 0.18, 190);
    ctx.lineTo(w * 0.28, 180);
    ctx.lineTo(w * 0.35, 230); // Costa este
    ctx.lineTo(w * 0.36, 340);
    ctx.lineTo(w * 0.31, 440); // Costa sureste
    ctx.lineTo(w * 0.22, 510); // Costa sur
    ctx.lineTo(w * 0.14, 460); // Reykjanes / Reykjavik
    ctx.lineTo(w * 0.08, 380);
    ctx.lineTo(w * 0.06, 280); // Vestfirðir (Fiordos del noroeste)
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Nieve y permafrost interior de Islandia
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(w * 0.14, 240);
    ctx.lineTo(w * 0.24, 220);
    ctx.lineTo(w * 0.32, 270);
    ctx.lineTo(w * 0.28, 420);
    ctx.lineTo(w * 0.16, 430);
    ctx.closePath();
    ctx.fill();

    // Glaciar Vatnajökull (El casquete de hielo más grande de Islandia)
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(w * 0.25, 360, 28, 20, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(14, 165, 233, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Manantial geotérmico / Laguna Azul (Cyan neón volcánico)
    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.ellipse(w * 0.13, 440, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Cartel táctico de Islandia
    ctx.font = "bold 9px 'Orbitron', monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("ISLANDIA [64°N - 66°N] · TIERRA DE HIELO Y VOLCANES", w * 0.10, 535);

    // 1.3 ARCHIPIÉLAGO DE SVALBARD (Northeast: Y: 280 a 720, X: w * 0.68 a w * 0.94)
    // Isla Principal: Spitsbergen
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.76, 320);
    ctx.lineTo(w * 0.84, 300);
    ctx.lineTo(w * 0.90, 360);
    ctx.lineTo(w * 0.88, 520);
    ctx.lineTo(w * 0.80, 580);
    ctx.lineTo(w * 0.74, 520);
    ctx.lineTo(w * 0.72, 410);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glaciares de Spitsbergen
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.ellipse(w * 0.81, 420, 22, 55, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Isla Nordaustlandet (Noreste de Svalbard)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.ellipse(w * 0.89, 360, 18, 28, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(w * 0.89, 360, 13, 20, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Isla Edgeøya (Sureste de Svalbard)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.ellipse(w * 0.86, 620, 14, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rótulo táctico de Svalbard
    ctx.font = "bold 9px 'Orbitron', monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("SVALBARD [78°N] · BÓVEDA GLOBAL DE SEMILLAS", w * 0.65, 710);

    // ----------------------------------------------------
    // ZONA 2: GROENLANDIA (KALAALLIT NUNAAT) & EL INLANDIS (Y: 820 a 2280)
    // ----------------------------------------------------
    // 2.1 Masa rocosa costera de Groenlandia (Acantilados basálticos y fiordos)
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    // Kap Farvel (Cabo Farewell) en el extremo sur
    ctx.moveTo(w * 0.48, 850);
    // Costa Oeste de Groenlandia subiendo hacia Nuuk y Bahía de Disko
    ctx.lineTo(w * 0.38, 930);
    ctx.lineTo(w * 0.26, 1060);
    ctx.lineTo(w * 0.18, 1220); // Nuuk / Maniitsoq
    ctx.lineTo(w * 0.12, 1360); // Bahía de Disko / Fiordo de Ilulissat
    ctx.lineTo(w * 0.16, 1480);
    ctx.lineTo(w * 0.11, 1620); // Bahía de Melville
    ctx.lineTo(w * 0.15, 1800); // Thule (Qaanaaq)
    ctx.lineTo(w * 0.19, 2020); // Tierra de Inglefield
    ctx.lineTo(w * 0.28, 2200); // Tierra de Washington
    // Costa Norte (Peary Land y Cabo Morris Jesup - tierra más septentrional)
    ctx.lineTo(w * 0.45, 2280);
    ctx.lineTo(w * 0.58, 2270); // Kap Morris Jesup [83°39' N]
    // Costa Este de Groenlandia bajando hacia el sur
    ctx.lineTo(w * 0.72, 2180); // Tierra de Kronprins Christian
    ctx.lineTo(w * 0.82, 1980); // Tierra del Rey Christian X
    ctx.lineTo(w * 0.88, 1720); // Tierra de Christian IX
    ctx.lineTo(w * 0.84, 1500);
    ctx.lineTo(w * 0.90, 1320); // Fiordo Scoresby Sund (Fiordo más grande del mundo)
    ctx.lineTo(w * 0.79, 1300); // Entrante profundo del fiordo
    ctx.lineTo(w * 0.86, 1220);
    ctx.lineTo(w * 0.78, 1080); // Costa de Blosseville
    ctx.lineTo(w * 0.65, 960);
    ctx.lineTo(w * 0.54, 880);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2.2 EL INLANDIS: Enorme casquete polar interior de Groenlandia (Capa de Hielo Continental)
    const inlandisGrad = ctx.createLinearGradient(0, 950, 0, 2200);
    inlandisGrad.addColorStop(0, "#e2e8f0");
    inlandisGrad.addColorStop(0.2, "#f8fafc");
    inlandisGrad.addColorStop(0.7, "#ffffff");
    inlandisGrad.addColorStop(1, "#e0f2fe");
    ctx.fillStyle = inlandisGrad;

    ctx.beginPath();
    ctx.moveTo(w * 0.48, 920);
    ctx.lineTo(w * 0.32, 1040);
    ctx.lineTo(w * 0.24, 1200);
    ctx.lineTo(w * 0.18, 1350);
    ctx.lineTo(w * 0.21, 1520);
    ctx.lineTo(w * 0.18, 1700);
    ctx.lineTo(w * 0.22, 1920);
    ctx.lineTo(w * 0.32, 2120);
    ctx.lineTo(w * 0.52, 2210); // Norte del Inlandis
    ctx.lineTo(w * 0.68, 2120);
    ctx.lineTo(w * 0.76, 1920);
    ctx.lineTo(w * 0.81, 1680);
    ctx.lineTo(w * 0.77, 1420);
    ctx.lineTo(w * 0.80, 1200);
    ctx.lineTo(w * 0.70, 1040);
    ctx.closePath();
    ctx.fill();

    // Borde brillante con resplandor criogénico del Inlandis
    ctx.strokeStyle = "rgba(186, 230, 253, 0.7)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2.3 Grietas y fallas glaciares profundas del Inlandis (Azul cyan profundo)
    ctx.strokeStyle = "rgba(14, 165, 233, 0.85)";
    ctx.lineWidth = 2;
    const crevasses = [
      { x1: w * 0.35, y1: 1080, x2: w * 0.52, y2: 1110, x3: w * 0.65, y3: 1090 },
      { x1: w * 0.28, y1: 1240, x2: w * 0.44, y2: 1270, x3: w * 0.58, y3: 1250 },
      { x1: w * 0.42, y1: 1390, x2: w * 0.59, y2: 1420, x3: w * 0.74, y3: 1390 },
      { x1: w * 0.30, y1: 1720, x2: w * 0.48, y2: 1750, x3: w * 0.66, y3: 1730 },
      { x1: w * 0.38, y1: 1910, x2: w * 0.55, y2: 1940, x3: w * 0.72, y3: 1900 },
      { x1: w * 0.45, y1: 2060, x2: w * 0.58, y2: 2090, x3: w * 0.68, y3: 2070 }
    ];
    for (const c of crevasses) {
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.lineTo(c.x3, c.y3);
      ctx.stroke();
    }

    // Lagos supraglaciares de agua de deshielo azul zafiro
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.ellipse(w * 0.38, 1160, 16, 9, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.62, 1340, 20, 11, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.46, 1820, 18, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Rótulos cartográficos de Groenlandia
    ctx.font = "bold 11px 'Orbitron', monospace";
    ctx.fillStyle = "#0369a1";
    ctx.fillText("GROENLANDIA (KALAALLIT NUNAAT)", w * 0.24, 1135);
    ctx.font = "9px 'Orbitron', monospace";
    ctx.fillStyle = "#0284c7";
    ctx.fillText("INLANDIS: CASQUETE DE HIELO CONTINENTAL [3,200m]", w * 0.22, 1150);

    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("FIORDO DE ILULISSAT [69°N] ➔", w * 0.04, 1370);
    ctx.fillText("SCORESBY SUND [70°N] ➔", w * 0.68, 1290);

    // 2.4 PUESTO AVANZADO DE RADAR THULE-VEKTOR (Y: ~1540 · SECTOR SUBLÍDER 40%)
    ctx.save();
    const radarBaseX = w * 0.5;
    const radarBaseY = 1540;

    // Plataforma hexagonal de hormigón polar
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const hx = radarBaseX + Math.cos(ang) * 48;
      const hy = radarBaseY + Math.sin(ang) * 48;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Conduits de refrigeración criogénica
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(radarBaseX - 48, radarBaseY);
    ctx.lineTo(radarBaseX - 85, radarBaseY);
    ctx.moveTo(radarBaseX + 48, radarBaseY);
    ctx.lineTo(radarBaseX + 85, radarBaseY);
    ctx.stroke();

    // Cúpula del radar con haz giratorio
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(radarBaseX, radarBaseY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();

    const sweepAngle = (this.scrollY * 0.05) % (Math.PI * 2);
    ctx.fillStyle = "rgba(0, 243, 255, 0.4)";
    ctx.beginPath();
    ctx.moveTo(radarBaseX, radarBaseY);
    ctx.arc(radarBaseX, radarBaseY, 44, sweepAngle, sweepAngle + 0.45);
    ctx.closePath();
    ctx.fill();

    // Alerta táctica del Sublíder Frost-Bite
    ctx.font = "bold 10px 'Orbitron', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.fillText("⚠️ PUESTO RADAR THULE · BASTIÓN SUBLÍDER", radarBaseX, radarBaseY + 68);
    ctx.font = "8px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("INTERCEPCIÓN CRIOGÉNICA: FROST-BITE DETECTADO", radarBaseX, radarBaseY + 80);
    ctx.textAlign = "left";
    ctx.restore();

    // ----------------------------------------------------
    // ZONA 3: ISLA ELLESMERE, ESTRECHO DE NARES & BANQUISA POLAR (Y: 2200 a 2980)
    // ----------------------------------------------------
    // 3.1 Isla Ellesmere (Canadá, 83°N - Cabo Columbia) al noroeste
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 2250);
    ctx.lineTo(w * 0.22, 2280);
    ctx.lineTo(w * 0.28, 2380);
    ctx.lineTo(w * 0.24, 2520);
    ctx.lineTo(w * 0.16, 2640);
    ctx.lineTo(0, 2680);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Nieve y glaciares de Ellesmere
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(0, 2300);
    ctx.lineTo(w * 0.18, 2330);
    ctx.lineTo(w * 0.20, 2460);
    ctx.lineTo(w * 0.12, 2560);
    ctx.lineTo(0, 2600);
    ctx.closePath();
    ctx.fill();

    ctx.font = "bold 9px 'Orbitron', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("ISLA ELLESMERE [CANADÁ · 83°N]", 15, 2480);
    ctx.fillText("ESTRECHO DE NARES ➔", w * 0.26, 2450);

    // 3.2 La Gran Banquisa Polar Fracturada (Sea Ice Pack)
    // Mosaico de inmensas placas de hielo marino con grietas abiertas (polinias)
    this.drawSeaIcePack(ctx, w, 2320, 2960);

    // Paralelo 85°00' N
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 2750);
    ctx.lineTo(w, 2750);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "bold 9px 'Orbitron', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("PARALELO 85°00'00\" N · OCÉANO GLACIAL CENTRAL (BANQUISA PERPETUA)", 20, 2742);

    // ----------------------------------------------------
    // ZONA 4: POLO NORTE GEOGRÁFICO [90°00'00" N] & CIUDADELA SUBGLACIAL (Y: 2950 a 3600)
    // ----------------------------------------------------
    // 4.1 Rejilla Polar Estereográfica: Todos los meridianos convergen al punto (w * 0.5, 3380)
    const poleX = w * 0.5;
    const poleY = 3380;

    // Casquete de hielo polar macizo perpetuo
    const poleGrad = ctx.createRadialGradient(poleX, poleY, 30, poleX, poleY, 340);
    poleGrad.addColorStop(0, "#ffffff");
    poleGrad.addColorStop(0.4, "#f0f9ff");
    poleGrad.addColorStop(0.8, "#e0f2fe");
    poleGrad.addColorStop(1, "rgba(224, 242, 254, 0.4)");
    ctx.fillStyle = poleGrad;
    ctx.beginPath();
    ctx.arc(poleX, poleY, 320, 0, Math.PI * 2);
    ctx.fill();

    // Círculos concéntricos de latitud extrema (88°N, 89°N, 89.5°N)
    ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(poleX, poleY, 240, 0, Math.PI * 2); // 88°N
    ctx.arc(poleX, poleY, 150, 0, Math.PI * 2); // 89°N
    ctx.arc(poleX, poleY, 80, 0, Math.PI * 2);  // 89.5°N
    ctx.stroke();
    ctx.setLineDash([]);

    // Meridianos convergentes (0°, 45°, 90°, 135°, 180°, etc.)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.2;
    for (let m = 0; m < 8; m++) {
      const ang = (m / 8) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(poleX - Math.cos(ang) * 280, poleY - Math.sin(ang) * 280);
      ctx.lineTo(poleX + Math.cos(ang) * 280, poleY + Math.sin(ang) * 280);
      ctx.stroke();
    }

    // Rosa de los Vientos Holográfica del Polo Norte
    ctx.save();
    ctx.translate(poleX, poleY);

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.stroke();

    // Cruz dorada del Polo Norte
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(0, 65);
    ctx.moveTo(-65, 0);
    ctx.lineTo(65, 0);
    ctx.stroke();

    // Indicadores: ¡Todas las direcciones desde el Polo Norte apuntan al Sur!
    ctx.font = "bold 10px 'Orbitron', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.fillText("S", 0, 80);
    ctx.fillText("S", 0, -72);
    ctx.fillText("S", 80, 4);
    ctx.fillText("S", -80, 4);
    ctx.restore();

    // 4.2 CIUDADELA SUBGLACIAL DE VEKTOR (BASE JEFE FINAL ZERO-KELVIN)
    ctx.save();
    ctx.translate(poleX, poleY);

    // Bastión octogonal exterior
    ctx.fillStyle = "rgba(10, 15, 30, 0.95)";
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const bx = Math.cos(ang) * 115;
      const by = Math.sin(ang) * 115;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reactor criogénico de nitrógeno líquido en el centro del eje polar
    const coreGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 48);
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(0.3, "#00f3ff");
    coreGrad.addColorStop(0.8, "#0284c7");
    coreGrad.addColorStop(1, "rgba(15, 23, 42, 0.9)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.fill();

    // Anillo giratorio superconductor del reactor
    const ringAngle = -(this.scrollY * 0.04);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, 36, ringAngle, ringAngle + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Luces rojas de alarma de combate
    const blink = Math.sin(this.scrollY * 0.1) > 0;
    ctx.fillStyle = blink ? "#ef4444" : "#7f1d1d";
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * 98, Math.sin(ang) * 98, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rótulos tácticos de la Ciudadela Polar
    ctx.font = "bold 12px 'Orbitron', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("★ POLO NORTE GEOGRÁFICO ★", 0, -135);
    ctx.font = "bold 10px 'Orbitron', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("LATITUD 90°00'00\" N · CONVERGENCIA TOTAL", 0, -120);

    ctx.font = "bold 10px 'Orbitron', monospace";
    ctx.fillStyle = "#ff0055";
    ctx.fillText("☠️ CIUDADELA SUBGLACIAL VEKTOR · JEFE: ZERO-KELVIN", 0, 142);
    ctx.font = "8px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("PROTOCOLO DE CONGELACIÓN ABSOLUTA ACTIVADO", 0, 155);

    ctx.restore();
  }

  /**
   * Genera el mosaico de la banquisa polar fracturada con placas flotantes y polinias
   */
  drawSeaIcePack(ctx, w, startY, endY) {
    const floeRows = 7;
    const floeCols = 5;
    const cellW = w / floeCols;
    const cellH = (endY - startY) / floeRows;

    ctx.fillStyle = "rgba(240, 249, 255, 0.88)";
    ctx.strokeStyle = "rgba(14, 165, 233, 0.55)";
    ctx.lineWidth = 2;

    for (let r = 0; r < floeRows; r++) {
      for (let c = 0; c < floeCols; c++) {
        const cx = c * cellW + cellW / 2;
        const cy = startY + r * cellH + cellH / 2;
        const radX = cellW * 0.42;
        const radY = cellH * 0.38;

        // Placa de hielo multianual con forma irregular
        ctx.beginPath();
        const pts = 6;
        for (let p = 0; p < pts; p++) {
          const ang = (p / pts) * Math.PI * 2;
          const px = cx + Math.cos(ang) * (radX + ((p % 2) * 6 - 3));
          const py = cy + Math.sin(ang) * (radY + (((p + 1) % 2) * 6 - 3));
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cresta de presión interna
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        ctx.moveTo(cx - radX * 0.4, cy);
        ctx.lineTo(cx + radX * 0.4, cy + 4);
        ctx.stroke();
      }
    }
  }

  /**
   * Dibuja los témpanos de hielo (icebergs) que flotan a la deriva
   */
  drawFloatingIcebergs(ctx, w) {
    for (const berg of this.arcticIcebergs) {
      ctx.save();
      ctx.translate(berg.x, berg.y);
      ctx.rotate(berg.rotation);

      // 1. Masa sumergida de hielo azul turquesa brillante (visible bajo el agua)
      ctx.fillStyle = berg.glowColor;
      ctx.beginPath();
      ctx.arc(0, 0, berg.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Superficie visible del iceberg (Hielo blanco polar anguloso)
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      for (let p = 0; p < berg.poly.length; p++) {
        const pt = berg.poly[p];
        if (p === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();

      // 3. Faceta de sombra del iceberg para volumen tridimensional
      ctx.fillStyle = "rgba(147, 197, 253, 0.45)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let p = 0; p < Math.floor(berg.poly.length / 2) + 1; p++) {
        const pt = berg.poly[p];
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();

      // 4. Borde nítido de hielo escarchado
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Cortinas ondeantes de Aurora Boreal en la alta atmósfera (Verde esmeralda y violeta)
   */
  drawAuroraBorealis(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const time = this.scrollY * 0.02;

    // Cortina 1: Esmeralda boreal ondeando
    const grad1 = ctx.createLinearGradient(0, 0, 0, h * 0.42);
    grad1.addColorStop(0, "rgba(16, 185, 129, 0.28)");
    grad1.addColorStop(0.5, "rgba(52, 211, 153, 0.16)");
    grad1.addColorStop(1, "rgba(16, 185, 129, 0)");

    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= w; x += 25) {
      const y = 35 + Math.sin(x * 0.008 + time) * 32 + Math.cos(x * 0.016 - time * 0.8) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();

    // Cortina 2: Cian y violeta etéreo
    const grad2 = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    grad2.addColorStop(0, "rgba(6, 182, 212, 0.24)");
    grad2.addColorStop(0.6, "rgba(168, 85, 247, 0.14)");
    grad2.addColorStop(1, "rgba(6, 182, 212, 0)");

    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= w; x += 30) {
      const y = 65 + Math.sin(x * 0.01 - time * 0.7) * 40 + Math.sin(x * 0.022 + time * 1.1) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Ventisca de nieve polar con copos brillantes
   */
  drawSnowBlizzard(ctx) {
    ctx.fillStyle = "rgba(240, 249, 255, 0.88)";
    for (const flake of this.snowflakes) {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Cartela táctica inferior de coordenadas y avance geográfico por el Ártico
   */
  renderArcticPositionBanner(ctx, w, h, distanceRatio) {
    let regionText = "CRUCE DEL CÍRCULO POLAR ÁRTICO [66°33' N] · MAR DE GROENLANDIA";
    let subText = "Sobrevolando aguas boreales entre Islandia y Svalbard · Rumbo al norte";

    if (distanceRatio > 0.22 && distanceRatio <= 0.55) {
      regionText = "ISLA DE GROENLANDIA (KALAALLIT NUNAAT) · INLANDIS GLACIAR [75°N]";
      subText = "Sobrevolando casquete de hielo continental · Puesto Thule de Vektor en rango";
    } else if (distanceRatio > 0.55 && distanceRatio <= 0.80) {
      regionText = "BANQUISA POLAR FRACTURADA [82°N - 87°N] · ESTRECHO DE NARES";
      subText = "Hielo marino perpetuo y polinias · Convergencia de meridianos polar";
    } else if (distanceRatio > 0.80) {
      regionText = "POLO NORTE GEOGRÁFICO [90°00' N] · CIUDADELA SUBGLACIAL DE VEKTOR";
      subText = "¡Alerta máxima! Destructor Zero-Kelvin detectado en el eje polar";
    }

    ctx.save();
    ctx.fillStyle = "rgba(7, 10, 24, 0.85)";
    ctx.fillRect(w / 2 - 220, h - 38, 440, 30);
    ctx.strokeStyle = distanceRatio > 0.80 ? "#ff0055" : "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(w / 2 - 220, h - 38, 440, 30);

    ctx.font = "9px 'Orbitron', monospace";
    ctx.fillStyle = distanceRatio > 0.80 ? "#fbbf24" : "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText(regionText, w / 2, h - 22);

    ctx.font = "8px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(subText, w / 2, h - 11);
    ctx.restore();
  }

  /**
   * Radar Polar Estereográfico en la esquina inferior izquierda:
   * Proyección polar circular que muestra la travesía desde 66°33'N (borde) hasta 90°00'N (centro).
   */
  renderPolarStereographicRadar(ctx, distanceRatio) {
    const rx = 15;
    const ry = this.canvas.height - 150;
    const rw = 105;
    const rh = 140;

    ctx.save();
    // 1. Caja del radar polar
    ctx.fillStyle = "rgba(7, 14, 30, 0.92)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    // 2. Encabezado
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 8px 'Orbitron', monospace";
    ctx.fillText("RADAR POLAR", rx + 8, ry + 12);

    // 3. Proyección estereográfica centrada en el Polo Norte (90°N)
    const centerX = rx + rw / 2;
    const centerY = ry + rh / 2 + 5;
    const maxRadius = 46; // Corresponde al Círculo Polar Ártico (66°33'N)

    // Círculos de latitud polar concéntricos
    // Exterior: 66°33' N
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 75°N
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // 85°N
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.30, 0, Math.PI * 2);
    ctx.stroke();

    // Cruz central del Polo Norte 90°N
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX + 5, centerY);
    ctx.moveTo(centerX, centerY - 5);
    ctx.lineTo(centerX, centerY + 5);
    ctx.stroke();

    // Mini silueta esquemática de Groenlandia en el radar
    ctx.fillStyle = "rgba(224, 242, 254, 0.3)";
    ctx.beginPath();
    ctx.moveTo(centerX - 4, centerY + maxRadius * 0.88);
    ctx.lineTo(centerX - 16, centerY + maxRadius * 0.65);
    ctx.lineTo(centerX - 12, centerY + maxRadius * 0.22);
    ctx.lineTo(centerX + 6, centerY + maxRadius * 0.26);
    ctx.lineTo(centerX + 12, centerY + maxRadius * 0.68);
    ctx.closePath();
    ctx.fill();

    // 4. Posición del avión avanzando hacia el Polo Norte (de la periferia al centro)
    const currentR = maxRadius * (1 - distanceRatio);
    // El caza avanza de sur a norte (de abajo hacia el centro)
    const shipX = centerX;
    const shipY = centerY + currentR;

    // Estela de trayectoria hacia el polo
    ctx.strokeStyle = "rgba(0, 243, 255, 0.6)";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + maxRadius);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Marcador del jugador
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(shipX, shipY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(shipX, shipY, 6.5, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Telemetría de latitud y destino
    ctx.font = "8px monospace";
    ctx.fillStyle = "#34d399";
    const currentLat = (66.56 + distanceRatio * (90.00 - 66.56)).toFixed(1);
    ctx.fillText(`LAT: ${currentLat}° N`, rx + 8, ry + rh - 13);
    ctx.fillText(distanceRatio > 0.8 ? "ZONA: POLO 90°N" : "OBJ: POLO NORTE", rx + 8, ry + rh - 3);

    ctx.restore();
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
