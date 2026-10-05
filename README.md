# PROYECTO NAVES: Tactical Aerial & Space Assault `v1.7`

Juego de combate aeroespacial y táctico 2D en tiempo real con 5 naves de combate únicas, 5 fases progresivas con desbloqueo secuencial persistente, sublíderes y jefes de fase, mapa continental de América en alta resolución y backend SQLite con autenticación JWT sin mocks.

> **Política de Versiones:** A partir de la versión inicial **v1.0**, cada mejora o actualización del juego incrementará la versión, la cual se despliega en tamaño reducido junto al título del juego en toda la interfaz (`frontend/js/version.js`).

---

## 🚀 Arquitectura del Sistema

- **Backend:** Python 3.12 + Flask 3.1 con arquitectura modular de Blueprints (`auth_bp`, `game_bp`).
- **Base de Datos:** SQLite real persistida mediante SQLAlchemy 2.0 ORM (`game.db`).
- **Seguridad y Criptografía:** Hashing de contraseñas con Werkzeug (`generate_password_hash`, `check_password_hash`) y tokens de sesión firmados criptográficamente con `PyJWT` (HS256).
- **Motor Gráfico Frontend:** Vanilla JavaScript y Canvas 2D a 60 FPS estables con interpolación, renderizado procedural de partículas, terreno selvático destructible por bombardeo orbital y HUD táctico en tiempo real.
- **Motor de Audio Procedural:** Web Audio API (`sound_fx.js`) 100% sintetizado en tiempo real (cero archivos de audio externos, cero errores 404, latencia nula) con banda sonora synthwave retro, sirenas de alerta de jefes, disparos diferenciados por arma y fanfarrias.
- **Diseño Visual:** Interfaz Arcade Sci-Fi propia con soporte nativo de **Pantalla Completa Híbrida (Fullscreen API + Modo Teatro 100vw × 100vh)**.

---

## 🎮 Controles de Combate

| Acción | Controles Disponibles |
|---|---|
| **Maniobra / Movimiento** | Teclas `W`, `A`, `S`, `D` / `Flechas de Dirección` / Cursor del Ratón |
| **Disparo Principal** | Barra `Espaciadora` / Clic Izquierdo del Ratón |
| **Habilidad Especial** | Tecla `E` / Tecla `Shift` izquierdo |
| **Bomba Táctica Masiva** | Tecla **`B`** / Tecla **`X`** / Botón HUD **`💣 BOMBAS [B]`** (Limpia proyectiles y daña a toda la pantalla) |
| **Mejora de Armas** | Ítems **`🚀 ARMAS`** (NV 1 -> NV 2 -> NV 3). **Se pierde tras recibir 2 golpes enemigos** |
| **Gran Premio de Jefe** | Ítem **`👑 GRAN PREMIO`** al abatir jefes: Mejora de armas + 2 Bombas + 50 HP + 2500 PTS |
| **Pausa Táctica** | Tecla `P` |
| **Pantalla Completa / Expandir** | Tecla **`F`** / Tecla **`F11`** / Botón Flotante **`⛶ EXPANDIR JUEGO [F]`** |
| **Silenciar SFX / Música** | Botones `🔊 SFX` y `🎵 MÚSICA` en la cabecera superior |

---

## 🛸 Catálogo de las 5 Naves de Combate

1. **Phoenix Vanguard**
   - *Arma:* Láser Gemelo de Iones (15 DMG, 130 ms).
   - *Habilidad Especial:* `Escudo de Sobrecarga` (Invulnerabilidad temporal de 5s, CD: 20s).
   - *Estadísticas:* 100 HP, 6.2x Velocidad.

2. **Titan Fortress**
   - *Arma:* Cañón de Plasma Pesado (38 DMG, 260 ms, rompe terreno selvático).
   - *Habilidad Especial:* `Matriz de Blindaje Reflectante` (Refleja fuego hostil de 6s, CD: 25s).
   - *Estadísticas:* 180 HP, 4.4x Velocidad.

3. **Quantum Phantom**
   - *Arma:* Emisor Dispersor Triple (14 DMG × 3 proyectiles, 175 ms).
   - *Habilidad Especial:* `Overdrive Fantasma` (Acelera maniobra 1.6x y duplica cadencia de fuego por 5s, CD: 18s).
   - *Estadísticas:* 85 HP, 7.8x Velocidad.

4. **Valkyrie Interceptor**
   - *Arma:* Cañón de Ondas Perforantes (28 DMG, 190 ms).
   - *Habilidad Especial:* `Enjambre de Micro-Misiles` (Ráfaga guiada automática por 4.5s, CD: 22s).
   - *Estadísticas:* 110 HP, 6.0x Velocidad.

5. **Nebula Sorceress**
   - *Arma:* Haz de Partículas Continuo (45 DMG, 320 ms).
   - *Habilidad Especial:* `Pulso Electromagnético Táctico (EMP)` (Detona todos los proyectiles hostiles y daña a todos los enemigos en pantalla, CD: 30s).
   - *Estadísticas:* 95 HP, 5.8x Velocidad.

---

## 🗺️ Mapa de Operaciones (5 Fases Progresivas)

- **Fase 1: Asalto Continental sobre América (Operación Cóndor Aéreo):**
  - Fondo continental geográfico con relieve satelital de Norteamérica, Caribe, Cordillera de los Andes, Cuenca Amazónica, Patagonia y Cabo de Hornos.
  - Sublíder al 50%: *Zephyr Cruiser*.
  - Jefe al 90%: *Vanguard Dreadnought*.
- **Fase 2: Espacio Aéreo Pacífico & Archipiélagos:**
  - Océano profundo con atolones e islas reflectantes.
  - Sublíder: *Hydra Frigate*.
  - Jefe: *Leviathan Carrier*.
- **Fase 3: Travesía Interplanetaria a Saturno (Vía Marte y Júpiter):**
  - Despegue desde la Tierra con el planeta alejándose, sobrevuelo orbital de Marte, navegación por el Cinturón de Asteroides en 3D, aproximación a Júpiter y asalto final a la mega-estación en los majestuosos anillos de Saturno.
  - Sublíder al 40% (en Júpiter): *Jovian Core (Sonda de Fusión Gravitatoria)*.
  - Jefe Final al 85% (en Saturno): *Ganymede Titan (Estación de Batalla de Saturno)*.
- **Fase 4: Territorio Criogénico / Sector de Hielo:**
  - Vórtices de ventisca polar y partículas de nieve en tiempo real.
  - Sublíder: *Glacier Sentinel*.
  - Jefe: *Frost Titan*.
- **Fase 5: Jungla Profunda & Fortaleza Central:**
  - Capa de jungla con copas de árboles y terreno destructible por impactos de bombardeo orbital con cráteres permanentes y humo.
  - Sublíder al 50%: *Shadow Assassin Gunship*.
  - Jefe Final Supremo al 90%: *General Vektor - Apex Conqueror*.

---

## ⚙️ Instalación y Ejecución Local

1. Activar el entorno virtual de Python:
   ```powershell
   python app.py
   ```
2. Abrir en el navegador:
   ```
   http://localhost:5000
   ```
3. Ejecutar suite de pruebas unitarias automatizadas:
   ```powershell
   python -m unittest discover -p "test_*.py"
   ```
