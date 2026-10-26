import random
from simulate_phase5 import ShipCombatSim

ships = [
    ShipCombatSim("Phoenix Vanguard", "phoenix-vanguard", 100, 7.5, 18, 130, "twin_laser", "shield_matrix", 5.0, 18.0, 2),
    ShipCombatSim("Titan Colossus", "titan-colossus", 180, 5.0, 42, 260, "heavy_plasma", "emp_blast", 3.0, 24.0, 1),
    ShipCombatSim("Valkyrie Specter", "valkyrie-specter", 110, 6.5, 14, 160, "triple_spread", "overdrive_ghost", 4.5, 20.0, 3),
    ShipCombatSim("Vortex Tempest", "vortex-tempest", 120, 6.2, 28, 210, "wave_cannon", "micromissile_swarm", 5.5, 22.0, 1),
    ShipCombatSim("Hyperion Apex", "hyperion-dreadnought", 140, 5.8, 36, 180, "beam_laser", "orbital_bombardment", 4.0, 28.0, 1)
]

def analyze():
    print("=" * 85)
    print("INFORME DE SIMULACIÓN MONTE CARLO - FASE FINAL 5 (GENERAL VEKTOR)")
    print("Evaluación: 5,000 partidas completas por nave (25,000 combates simulados)")
    print("=" * 85)

    for ship in ships:
        total_runs = 5000
        wins = 0
        lives_remaining_list = []
        death_stages = {'Oleadas': 0, 'SubJungleBeast': 0, 'VektorNormal': 0, 'VektorEnrage': 0}
        durations = []

        for _ in range(total_runs):
            lives = 5
            bombs = 1
            hp = ship.max_hp
            time = 0.0
            dt = 0.05
            special_timer = 0.0
            special_cd_timer = 0.0
            shot_timer = 0.0
            invulnerable_timer = 0.0
            base_dodge = 0.52 + (ship.speed / 10.0) * 0.38

            # Fase 1: Oleadas
            t_stage1 = 0.0
            lost = False
            while t_stage1 < 30.0:
                t_stage1 += dt
                time += dt
                if special_timer > 0: special_timer -= dt
                if special_cd_timer > 0: special_cd_timer -= dt
                if invulnerable_timer > 0: invulnerable_timer -= dt
                if random.random() < 0.12 * dt:
                    if invulnerable_timer <= 0 and (ship.special_slug != 'shield_matrix' or special_timer <= 0):
                        if random.random() > base_dodge:
                            hp -= random.randint(12, 22)
                            if hp <= 0:
                                lives -= 1
                                if lives <= 0:
                                    death_stages['Oleadas'] += 1
                                    lost = True
                                    break
                                hp = ship.max_hp
                                invulnerable_timer = 3.0
            if lost: continue

            # Fase 2: Jungle Beast
            sub_hp = 850
            sub_timer = 0.0
            sub_cycle = 0
            while sub_hp > 0:
                time += dt
                if special_timer > 0: special_timer -= dt
                if special_cd_timer > 0: special_cd_timer -= dt
                if invulnerable_timer > 0: invulnerable_timer -= dt
                shot_timer += dt
                sub_timer += dt
                if shot_timer >= ship.fire_rate_sec:
                    shot_timer = 0.0
                    mult = 2.0 if (ship.special_slug == 'overdrive_ghost' and special_timer > 0) else 1.0
                    hits = 2.4 if ship.weapon_type == 'triple_spread' else (2.0 if ship.weapon_type == 'twin_laser' else 1.0)
                    sub_hp -= (ship.weapon_dmg * hits * mult)
                if special_cd_timer <= 0:
                    special_timer = ship.special_dur
                    special_cd_timer = ship.special_cd
                    if ship.special_slug == 'orbital_bombardment': sub_hp -= 320
                    elif ship.special_slug == 'emp_blast': sub_hp -= 70; sub_timer = -1.5
                    elif ship.special_slug == 'micromissile_swarm': sub_hp -= 150
                if sub_timer >= 0.78:
                    sub_timer = 0.0
                    sub_cycle += 1
                    attacks = 2 if (sub_cycle % 3 != 0) else 5
                    for _ in range(attacks):
                        if random.random() > base_dodge:
                            if invulnerable_timer <= 0 and (ship.special_slug != 'shield_matrix' or special_timer <= 0):
                                hp -= 14
                                if hp <= 0:
                                    lives -= 1
                                    if lives <= 0:
                                        death_stages['SubJungleBeast'] += 1
                                        lost = True
                                        break
                                    hp = ship.max_hp
                                    invulnerable_timer = 3.0
                    if lost: break
            if lost: continue

            # Fase 3: Transición
            t_trans = 0.0
            while t_trans < 20.0:
                t_trans += dt
                time += dt
                if special_timer > 0: special_timer -= dt
                if special_cd_timer > 0: special_cd_timer -= dt
                if invulnerable_timer > 0: invulnerable_timer -= dt
                if random.random() < 0.15 * dt:
                    if invulnerable_timer <= 0 and (ship.special_slug != 'shield_matrix' or special_timer <= 0):
                        if random.random() > base_dodge:
                            hp -= random.randint(14, 25)
                            if hp <= 0:
                                lives -= 1
                                if lives <= 0:
                                    death_stages['Oleadas'] += 1
                                    lost = True
                                    break
                                hp = ship.max_hp
                                invulnerable_timer = 3.0
            if lost: continue

            # Fase 4: Vektor
            boss_hp = 2400
            boss_timer = 0.0
            boss_enraged = False
            while boss_hp > 0:
                time += dt
                if special_timer > 0: special_timer -= dt
                if special_cd_timer > 0: special_cd_timer -= dt
                if invulnerable_timer > 0: invulnerable_timer -= dt
                shot_timer += dt
                boss_timer += dt
                if not boss_enraged and boss_hp <= 960:
                    boss_enraged = True
                if boss_enraged and bombs > 0 and hp < ship.max_hp * 0.45:
                    bombs -= 1
                    boss_hp -= 180
                    invulnerable_timer = 1.5
                if shot_timer >= ship.fire_rate_sec:
                    shot_timer = 0.0
                    mult = 2.0 if (ship.special_slug == 'overdrive_ghost' and special_timer > 0) else 1.0
                    hits = 2.85 if ship.weapon_type == 'triple_spread' else (2.0 if ship.weapon_type == 'twin_laser' else 1.0)
                    boss_hp -= (ship.weapon_dmg * hits * mult)
                if special_cd_timer <= 0:
                    special_timer = ship.special_dur
                    special_cd_timer = ship.special_cd
                    if ship.special_slug == 'orbital_bombardment': boss_hp -= 420
                    elif ship.special_slug == 'emp_blast': boss_hp -= 90; boss_timer = -1.2
                    elif ship.special_slug == 'micromissile_swarm': boss_hp -= 210
                shoot_cd = 0.28 if boss_enraged else 0.52
                if boss_timer >= shoot_cd:
                    boss_timer = 0.0
                    salvos = 9 if boss_enraged else 6
                    dmg = 24 if boss_enraged else 20
                    eff_dodge = (base_dodge - 0.12) if boss_enraged else base_dodge
                    for _ in range(salvos):
                        if random.random() > eff_dodge:
                            if invulnerable_timer <= 0 and (ship.special_slug != 'shield_matrix' or special_timer <= 0):
                                hp -= dmg
                                if hp <= 0:
                                    lives -= 1
                                    if lives <= 0:
                                        if boss_enraged: death_stages['VektorEnrage'] += 1
                                        else: death_stages['VektorNormal'] += 1
                                        lost = True
                                        break
                                    hp = ship.max_hp
                                    invulnerable_timer = 3.0
                    if lost: break
            if lost: continue

            wins += 1
            lives_remaining_list.append(lives)
            durations.append(time)

        win_rate = (wins / total_runs) * 100.0
        avg_lives = sum(lives_remaining_list) / len(lives_remaining_list) if lives_remaining_list else 0.0
        avg_time = sum(durations) / len(durations) if durations else 0.0
        print(f"NAVE: {ship.name.upper():<20}")
        print(f"  • Probabilidad de Victoria: {win_rate:>6.2f}%")
        print(f"  • Vidas Restantes Promedio: {avg_lives:.2f} de 5 vidas")
        print(f"  • Tiempo promedio de combate: {avg_time:.1f} segundos")
        if death_stages['VektorEnrage'] > 0 or death_stages['SubJungleBeast'] > 0 or death_stages['Oleadas'] > 0:
            print(f"  • Bajas registradas: Enrage={death_stages['VektorEnrage']} | VektorNormal={death_stages['VektorNormal']} | Subjefe={death_stages['SubJungleBeast']}")
        print("-" * 85)

if __name__ == "__main__":
    analyze()
