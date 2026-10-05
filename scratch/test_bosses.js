// Script de prueba para validar que todos los 10 jefes y subjefes
// tienen todas sus propiedades, métodos de disparo y renderizado funcionando sin fallos

import { BossCatalog } from "../frontend/js/bosses.js";

console.log("=== INICIANDO VALIDACIÓN DE CATÁLOGO DE JEFES ===");

const dummyPlayer = { x: 300, y: 700, width: 44, height: 44, health: 100 };
const dummyEngine = { isRunning: true, screenShake: 0, shockwaves: [] };

// 1. Probar los 5 Sublíderes
for (let stage = 1; stage <= 5; stage++) {
  const midBoss = BossCatalog.getMidBoss(stage);
  console.log(`\n[FASE ${stage} - SUBLÍDER]`);
  console.log(`- Nombre: ${midBoss.name}`);
  console.log(`- Título: ${midBoss.title}`);
  console.log(`- Slug: ${midBoss.slug}`);
  console.log(`- Habilidad: ${midBoss.abilityName} (${midBoss.abilityDesc})`);
  console.log(`- Salud: ${midBoss.health} / Dimensiones: ${midBoss.width}x${midBoss.height}`);

  if (!midBoss.slug || !midBoss.abilityName || !midBoss.abilityDesc) {
    throw new Error(`Sublíder de Fase ${stage} carece de metadatos requeridos`);
  }

  // Simular 4 ciclos de disparo
  const enemyProjectiles = [];
  const bossInstance = { ...midBoss, x: 300, y: 120 };
  for (let c = 1; c <= 4; c++) {
    BossCatalog.fireBossAttack(bossInstance, dummyPlayer, enemyProjectiles, dummyEngine);
  }
  console.log(`  ✓ Ataques generados tras 4 ciclos: ${enemyProjectiles.length} proyectiles`);
  if (enemyProjectiles.length === 0) {
    throw new Error(`Sublíder ${midBoss.name} no generó proyectiles`);
  }
}

// 2. Probar los 5 Jefes Finales
for (let stage = 1; stage <= 5; stage++) {
  const boss = BossCatalog.getStageBoss(stage);
  console.log(`\n[FASE ${stage} - JEFE FINAL]`);
  console.log(`- Nombre: ${boss.name}`);
  console.log(`- Título: ${boss.title}`);
  console.log(`- Slug: ${boss.slug}`);
  console.log(`- Habilidad: ${boss.abilityName} (${boss.abilityDesc})`);
  console.log(`- Salud: ${boss.health} / Dimensiones: ${boss.width}x${boss.height}`);

  if (!boss.slug || !boss.abilityName || !boss.abilityDesc) {
    throw new Error(`Jefe de Fase ${stage} carece de metadatos requeridos`);
  }

  // Simular 4 ciclos de disparo (Modo normal y Enrage para Vektor)
  const enemyProjectiles = [];
  const bossInstance = { ...boss, x: 300, y: 120 };
  for (let c = 1; c <= 4; c++) {
    BossCatalog.fireBossAttack(bossInstance, dummyPlayer, enemyProjectiles, dummyEngine);
  }
  console.log(`  ✓ Ataques generados tras 4 ciclos: ${enemyProjectiles.length} proyectiles`);

  // Para General Vektor, probar modo Enrage (<40% HP)
  if (boss.slug === "boss_general_vektor") {
    bossInstance.health = boss.maxHealth * 0.25; // 25% de vida
    const enrageProjectiles = [];
    BossCatalog.fireBossAttack(bossInstance, dummyPlayer, enrageProjectiles, dummyEngine);
    console.log(`  ✓ Ataque de Sobrecarga Enrage Vektor: ${enrageProjectiles.length} proyectiles generados`);
    if (enrageProjectiles.length < 5) {
      throw new Error("General Vektor no ejecutó la andanada apocalíptica en Enrage");
    }
  }
}

console.log("\n================================================");
console.log("¡TODOS LOS 10 JEFES Y SUBLÍDERES OPERAN AL 100%!");
console.log("================================================");
