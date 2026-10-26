"""
SIMULADOR TÁCTICO MONTE CARLO - FASE 5 (GENERAL VEKTOR)
Space Assault - Evaluación de supervivencia y tasa de victoria de las 5 naves
"""

import random
import math

class ShipCombatSim:
    def __init__(self, name, slug, max_hp, speed, weapon_dmg, fire_rate_ms, weapon_type,
                 special_slug, special_dur, special_cd, projectiles_count=1):
        self.name = name
        self.slug = slug
        self.max_hp = max_hp
        self.speed = speed
        self.weapon_dmg = weapon_dmg
        self.fire_rate_sec = fire_rate_ms / 1000.0
        self.weapon_type = weapon_type
        self.projectiles_count = projectiles_count
        self.special_slug = special_slug
        self.special_dur = special_dur
        self.special_cd = special_cd

def run_single_simulation(ship: ShipCombatSim, starting_lives=5, starting_bombs=1, skill_level="normal"):
    """
    Simula una partida completa de la Fase 5:
    - Travesía inicial y oleadas hostiles (Daño acumulativo hasta el subjefe)
    - Enfrentamiento con Subjefe Jungle-Beast (850 HP)
    - Oleada de transición
    - Batalla Final con General Vektor (2400 HP, Enrage al 40% HP)
    """
    lives = starting_lives
    bombs = starting_bombs
    hp = ship.max_hp
    time = 0.0
    dt = 0.05  # 20 ticks por segundo

    # Estado del jugador
    special_timer = 0.0
    special_cd_timer = 0.0
    shot_timer = 0.0
    invulnerable_timer = 0.0

    # Probabilidad base de evasión por tick basada en la velocidad de la nave y tamaño
    # Phoenix (7.5x) tiene la mayor agilidad (~86% evasión de salvas individuales en manos de piloto competente)
    # Titan (5.0x) tiene menor agilidad (~65% evasión, compensa con 180 HP y EMP)
    base_dodge = 0.52 + (ship.speed / 10.0) * 0.38
    if skill_level == "expert":
        base_dodge = min(0.94, base_dodge + 0.06)
    elif skill_level == "casual":
        base_dodge = max(0.40, base_dodge - 0.08)

    # -------------------------------------------------------------
    # ETAPA 1: OLEADAS PRE-SUBJEFE (0% a 45% de la fase)
    # -------------------------------------------------------------
    travel_time_1 = 30.0  # ~30 segundos de avance
    t_stage1 = 0.0
    while t_stage1 < travel_time_1:
        t_stage1 += dt
        time += dt
        if special_timer > 0: special_timer -= dt
        if special_cd_timer > 0: special_cd_timer -= dt
        if invulnerable_timer > 0: invulnerable_timer -= dt

        # Daño ambiental de oleadas enemigas (cazas y drones)
        if random.random() < 0.12 * dt:  # Ocurrencia de fuego hostil concentrado
            if invulnerable_timer <= 0 and special_timer <= 0:
                if random.random() > base_dodge:
                    dmg = random.randint(12, 22)
                    hp -= dmg
                    if hp <= 0:
                        lives -= 1
                        if lives <= 0: return False, "Derrotado en Oleadas Selváticas", time
                        hp = ship.max_hp
                        invulnerable_timer = 3.0

    # -------------------------------------------------------------
    # ETAPA 2: SUBJEFE JUNGLE-BEAST (850 HP)
    # -------------------------------------------------------------
    sub_boss_hp = 850
    sub_shoot_cd = 0.78
    sub_shoot_timer = 0.0
    sub_cycle = 0

    while sub_boss_hp > 0:
        time += dt
        if special_timer > 0: special_timer -= dt
        if special_cd_timer > 0: special_cd_timer -= dt
        if invulnerable_timer > 0: invulnerable_timer -= dt
        shot_timer += dt
        sub_shoot_timer += dt

        # Disparo del jugador
        if shot_timer >= ship.fire_rate_sec:
            shot_timer = 0.0
            mult = 2.0 if (ship.special_slug == "overdrive_ghost" and special_timer > 0) else 1.0
            
            # Conexión de proyectiles
            hits = ship.projectiles_count
            if ship.weapon_type == "triple_spread":
                hits = 2.4  # La mayoría conecta por el gran tamaño del subjefe
            elif ship.weapon_type == "twin_laser":
                hits = 2.0
            
            sub_boss_hp -= (ship.weapon_dmg * hits * mult)

        # Activación de Habilidad Especial
        if special_cd_timer <= 0:
            special_timer = ship.special_dur
            special_cd_timer = ship.special_cd
            if ship.special_slug == "orbital_bombardment":
                sub_boss_hp -= 320
            elif ship.special_slug == "emp_blast":
                sub_boss_hp -= 70
                sub_shoot_timer = -1.5  # Aturdimiento
            elif ship.special_slug == "micromissile_swarm":
                sub_boss_hp -= 150

        # Ataque del Subjefe
        if sub_shoot_timer >= sub_shoot_cd:
            sub_shoot_timer = 0.0
            sub_cycle += 1
            # 2 ráfagas gatling + 3 racimos cada 3 ciclos
            attacks = 2 if (sub_cycle % 3 != 0) else 5
            for _ in range(attacks):
                if random.random() > base_dodge:
                    if invulnerable_timer <= 0:
                        # Si tiene escudo activo de Phoenix Vanguard, no recibe daño
                        if ship.special_slug == "shield_matrix" and special_timer > 0:
                            pass
                        else:
                            dmg = 14
                            hp -= dmg
                            if hp <= 0:
                                lives -= 1
                                if lives <= 0: return False, "Derrotado por Subjefe Jungle-Beast", time
                                hp = ship.max_hp
                                invulnerable_timer = 3.0

    # -------------------------------------------------------------
    # ETAPA 3: TRANSICIÓN PRE-BOSS FINAL (45% a 85% de la fase)
    # -------------------------------------------------------------
    t_stage2 = 0.0
    while t_stage2 < 20.0:
        t_stage2 += dt
        time += dt
        if special_timer > 0: special_timer -= dt
        if special_cd_timer > 0: special_cd_timer -= dt
        if invulnerable_timer > 0: invulnerable_timer -= dt

        if random.random() < 0.15 * dt:
            if invulnerable_timer <= 0 and special_timer <= 0:
                if random.random() > base_dodge:
                    hp -= random.randint(14, 25)
                    if hp <= 0:
                        lives -= 1
                        if lives <= 0: return False, "Derrotado en Trinchera Pre-Vektor", time
                        hp = ship.max_hp
                        invulnerable_timer = 3.0

    # -------------------------------------------------------------
    # ETAPA 4: DUELO FINAL CONTRA GENERAL VEKTOR (2400 HP)
    # -------------------------------------------------------------
    boss_hp = 2400
    boss_shoot_cd = 0.52
    boss_shoot_timer = 0.0
    boss_enraged = False

    while boss_hp > 0:
        time += dt
        if special_timer > 0: special_timer -= dt
        if special_cd_timer > 0: special_cd_timer -= dt
        if invulnerable_timer > 0: invulnerable_timer -= dt
        shot_timer += dt
        boss_shoot_timer += dt

        # Enrage del General Vektor al 40% HP (960 HP o menos)
        if not boss_enraged and boss_hp <= 960:
            boss_enraged = True
            boss_shoot_cd = 0.28  # Furia Imperial letal

        # Uso táctico de bomba en momento de crisis o Enrage
        if boss_enraged and bombs > 0 and hp < ship.max_hp * 0.45:
            bombs -= 1
            boss_hp -= 180
            invulnerable_timer = 1.5  # Despeje de pantalla

        # Disparo del jugador hacia Vektor
        if shot_timer >= ship.fire_rate_sec:
            shot_timer = 0.0
            mult = 2.0 if (ship.special_slug == "overdrive_ghost" and special_timer > 0) else 1.0
            
            hits = ship.projectiles_count
            if ship.weapon_type == "triple_spread":
                hits = 2.85  # Vektor mide 148px de ancho, absorbe casi todo el abanico
            elif ship.weapon_type == "twin_laser":
                hits = 2.0
            elif ship.weapon_type == "beam_laser":
                hits = 1.0
            
            boss_hp -= (ship.weapon_dmg * hits * mult)

        # Activación de Especial durante el boss
        if special_cd_timer <= 0:
            special_timer = ship.special_dur
            special_cd_timer = ship.special_cd
            if ship.special_slug == "orbital_bombardment":
                boss_hp -= 420
            elif ship.special_slug == "emp_blast":
                boss_hp -= 90
                boss_shoot_timer = -1.2  # Aturdimiento a Vektor
            elif ship.special_slug == "micromissile_swarm":
                boss_hp -= 210

        # Ataque de Vektor
        if boss_shoot_timer >= boss_shoot_cd:
            boss_shoot_timer = 0.0
            
            # En modo normal: 4 plasma + 2 certeros = 6 proyectiles
            # En Enrage: 4 imperial bolts + 3 plasma + 2 homing torpedos = 9 proyectiles
            salvo_count = 9 if boss_enraged else 6
            proj_dmg = 24 if boss_enraged else 20

            # Los torpedos en Enrage son guiados (reducen la evasión un 15%)
            effective_dodge = (base_dodge - 0.12) if boss_enraged else base_dodge

            for _ in range(salvo_count):
                if random.random() > effective_dodge:
                    if invulnerable_timer <= 0:
                        if ship.special_slug == "shield_matrix" and special_timer > 0:
                            # Phoenix Vanguard absorbe completamente el ataque
                            pass
                        else:
                            hp -= proj_dmg
                            if hp <= 0:
                                lives -= 1
                                if lives <= 0:
                                    phase = "Enrage (Fase Dorada)" if boss_enraged else "Fase Normal de Vektor"
                                    return False, f"Derrotado por General Vektor en {phase}", time
                                hp = ship.max_hp
                                invulnerable_timer = 3.0  # Respawn con onda de choque

    return True, "¡General Vektor derrotado!", time


def run_full_benchmark(iterations=10000):
    ships = [
        ShipCombatSim(
            name="Phoenix Vanguard",
            slug="phoenix-vanguard",
            max_hp=100,
            speed=7.5,
            weapon_dmg=18,
            fire_rate_ms=130,
            weapon_type="twin_laser",
            special_slug="shield_matrix",
            special_dur=5.0,
            special_cd=18.0,
            projectiles_count=2
        ),
        ShipCombatSim(
            name="Titan Colossus",
            slug="titan-colossus",
            max_hp=180,
            speed=5.0,
            weapon_dmg=42,
            fire_rate_ms=260,
            weapon_type="heavy_plasma",
            special_slug="emp_blast",
            special_dur=3.0,
            special_cd=24.0,
            projectiles_count=1
        ),
        ShipCombatSim(
            name="Valkyrie Specter",
            slug="valkyrie-specter",
            max_hp=110,
            speed=6.5,
            weapon_dmg=14,
            fire_rate_ms=160,
            weapon_type="triple_spread",
            special_slug="overdrive_ghost",
            special_dur=4.5,
            special_cd=20.0,
            projectiles_count=3
        ),
        ShipCombatSim(
            name="Vortex Tempest",
            slug="vortex-tempest",
            max_hp=120,
            speed=6.2,
            weapon_dmg=28,
            fire_rate_ms=210,
            weapon_type="wave_cannon",
            special_slug="micromissile_swarm",
            special_dur=5.5,
            special_cd=22.0,
            projectiles_count=1
        ),
        ShipCombatSim(
            name="Hyperion Apex",
            slug="hyperion-dreadnought",
            max_hp=140,
            speed=5.8,
            weapon_dmg=36,
            fire_rate_ms=180,
            weapon_type="beam_laser",
            special_slug="orbital_bombardment",
            special_dur=4.0,
            special_cd=28.0,
            projectiles_count=1
        )
    ]

    print("=" * 80)
    print(f"ANÁLISIS TÁCTICO MONTE CARLO: FASE 5 (GENERAL VEKTOR) - {iterations:,} SIMULACIONES")
    print("=" * 80)

    results = []

    for ship in ships:
        # Test 1: Con 5 vidas (campaña normal con sistema de vidas activado)
        wins_5_lives = 0
        total_time_5 = 0.0
        deaths_count = 0

        # Test 2: Con 1 sola vida (modo supervivencia pura / sin respawn)
        wins_1_life = 0

        for _ in range(iterations):
            # Corrida con 5 vidas
            w5, r5, dur5 = run_single_simulation(ship, starting_lives=5, starting_bombs=1, skill_level="normal")
            if w5:
                wins_5_lives += 1
                total_time_5 += dur5
            
            # Corrida con 1 vida pura
            w1, r1, dur1 = run_single_simulation(ship, starting_lives=1, starting_bombs=1, skill_level="normal")
            if w1:
                wins_1_life += 1

        win_rate_5 = (wins_5_lives / iterations) * 100.0
        win_rate_1 = (wins_1_life / iterations) * 100.0
        avg_time = (total_time_5 / wins_5_lives) if wins_5_lives > 0 else 0.0

        results.append({
            "name": ship.name,
            "win_rate_5": win_rate_5,
            "win_rate_1": win_rate_1,
            "avg_time": avg_time,
            "dps": (ship.weapon_dmg * ship.projectiles_count) / ship.fire_rate_sec,
            "hp": ship.max_hp,
            "speed": ship.speed,
            "special": ship.special_slug
        })

    # Ordenar por win_rate_1 (destreza pura) descendente
    results.sort(key=lambda x: x["win_rate_1"], reverse=True)

    print(f"{'NAVE':<20} | {'5 VIDAS':<9} | {'1 VIDA':<9} | {'TIEMPO':<8} | {'DPS BASE':<8} | {'VELOCIDAD'}")
    print("-" * 80)
    for r in results:
        print(f"{r['name']:<20} | {r['win_rate_5']:>6.2f}%   | {r['win_rate_1']:>6.2f}%   | {r['avg_time']:>5.1f}s   | {r['dps']:>6.1f}   | {r['speed']}x")

    print("=" * 80)

if __name__ == "__main__":
    run_full_benchmark(iterations=10000)
