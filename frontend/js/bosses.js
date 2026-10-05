/**
 * Definiciones, Atributos y Renderizado Vectorial de los 5 Sublíderes y 5 Jefes Finales
 */

export const BossCatalog = {
  getMidBoss(stageNumber) {
    switch (stageNumber) {
      case 1:
        return {
          name: "AURORA-9 (SUBLÍDER)",
          title: "Bombardero Estratosférico Ártico",
          health: 320,
          maxHealth: 320,
          width: 68,
          height: 52,
          vy: 0.9,
          vxAmp: 4.0,
          shootInterval: 1.1,
          color: "#38bdf8",
          isBoss: true,
          isFinalBoss: false,
          scoreValue: 1200
        };
      case 2:
        return {
          name: "NAUTILUS-X (SUBLÍDER)",
          title: "Corbeta de Asalto Oceánica",
          health: 450,
          maxHealth: 450,
          width: 72,
          height: 56,
          vy: 0.85,
          vxAmp: 4.5,
          shootInterval: 1.0,
          color: "#14b8a6",
          isBoss: true,
          isFinalBoss: false,
          scoreValue: 1600
        };
      case 3:
        return {
          name: "JOVIAN CORE (SUBLÍDER)",
          title: "Sonda de Repulsión Gravitatoria",
          health: 580,
          maxHealth: 580,
          width: 76,
          height: 60,
          vy: 0.8,
          vxAmp: 5.0,
          shootInterval: 0.9,
          color: "#f97316",
          isBoss: true,
          isFinalBoss: false,
          scoreValue: 2000
        };
      case 4:
        return {
          name: "FROST-BITE (SUBLÍDER)",
          title: "Caminante Glacial Criogénico",
          health: 720,
          maxHealth: 720,
          width: 80,
          height: 64,
          vy: 0.75,
          vxAmp: 4.2,
          shootInterval: 0.85,
          color: "#bae6fd",
          isBoss: true,
          isFinalBoss: false,
          scoreValue: 2400
        };
      case 5:
      default:
        return {
          name: "JUNGLE-BEAST (SUBLÍDER)",
          title: "Mecha Blindado de Asalto Selvático",
          health: 950,
          maxHealth: 950,
          width: 84,
          height: 68,
          vy: 0.7,
          vxAmp: 4.8,
          shootInterval: 0.8,
          color: "#84cc16",
          isBoss: true,
          isFinalBoss: false,
          scoreValue: 3000
        };
    }
  },

  getStageBoss(stageNumber) {
    switch (stageNumber) {
      case 1:
        return {
          name: "GOLIATH APEX (BOSS FASE 1)",
          title: "Fortaleza Aérea Polar de Asalto",
          health: 680,
          maxHealth: 680,
          width: 100,
          height: 80,
          vy: 0.5,
          vxAmp: 5.5,
          shootInterval: 0.75,
          color: "#0284c7",
          isBoss: true,
          isFinalBoss: true,
          scoreValue: 3500
        };
      case 2:
        return {
          name: "LEVIATHAN COLOSSUS (BOSS FASE 2)",
          title: "Acorazado Suborbital del Pacífico",
          health: 950,
          maxHealth: 950,
          width: 110,
          height: 86,
          vy: 0.45,
          vxAmp: 6.0,
          shootInterval: 0.7,
          color: "#0d9488",
          isBoss: true,
          isFinalBoss: true,
          scoreValue: 4500
        };
      case 3:
        return {
          name: "GANYMEDE TITAN (BOSS FASE 3)",
          title: "Estación de Batalla Orbital Joviana",
          health: 1250,
          maxHealth: 1250,
          width: 116,
          height: 90,
          vy: 0.4,
          vxAmp: 6.2,
          shootInterval: 0.65,
          color: "#ea580c",
          isBoss: true,
          isFinalBoss: true,
          scoreValue: 6000
        };
      case 4:
        return {
          name: "ZERO-KELVIN (BOSS FASE 4)",
          title: "Destructor Criogénico Absoluto",
          health: 1600,
          maxHealth: 1600,
          width: 124,
          height: 96,
          vy: 0.38,
          vxAmp: 6.5,
          shootInterval: 0.6,
          color: "#38bdf8",
          isBoss: true,
          isFinalBoss: true,
          scoreValue: 8000
        };
      case 5:
      default:
        return {
          name: "GENERAL VEKTOR (BOSS PRINCIPAL FINAL)",
          title: "Supremo Acorazado Dreadnought Apex",
          health: 2400,
          maxHealth: 2400,
          width: 140,
          height: 110,
          vy: 0.35,
          vxAmp: 7.0,
          shootInterval: 0.5,
          color: "#ff0055",
          isBoss: true,
          isFinalBoss: true,
          scoreValue: 15000
        };
    }
  },

  drawBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    const halfW = boss.width / 2;
    const halfH = boss.height / 2;

    if (boss.isFinalBoss) {
      // Dibujo imponente de Jefe Final
      ctx.fillStyle = "#1e1124";
      ctx.strokeStyle = boss.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = boss.color;
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(-halfW * 0.4, -halfH);
      ctx.lineTo(halfW * 0.4, -halfH);
      ctx.lineTo(halfW, -halfH * 0.3);
      ctx.lineTo(halfW * 0.85, halfH * 0.8);
      ctx.lineTo(0, halfH);
      ctx.lineTo(-halfW * 0.85, halfH * 0.8);
      ctx.lineTo(-halfW, -halfH * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cañones múltiples laterales
      ctx.fillStyle = boss.color;
      ctx.fillRect(-halfW * 0.9, -halfH * 0.1, 8, 20);
      ctx.fillRect(halfW * 0.9 - 8, -halfH * 0.1, 8, 20);

      // Núcleo de energía palpitante
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -halfH * 0.1, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Dibujo de Sublíder táctico
      ctx.fillStyle = "#18182b";
      ctx.strokeStyle = boss.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = boss.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(0, -halfH);
      ctx.lineTo(halfW, 0);
      ctx.lineTo(halfW * 0.6, halfH);
      ctx.lineTo(-halfW * 0.6, halfH);
      ctx.lineTo(-halfW, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cabina neón del sublíder
      ctx.fillStyle = boss.color;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};
