# 🛰️ Documentación de Arquitectura de Software · Space Assault v2.0

Este directorio reúne la suite completa de **13 Diagramas de Arquitectura de Software en formato SVG nativo**, diseñados bajo estándares internacionales de ingeniería de software (**Modelo C4** y especificaciones **UML 2.5**), junto con los flujos de navegación, arquitectura general y la ingeniería detallada del subsistema de **monetización multi-plataforma** (Monetag, GameDistribution, CrazyGames y Google AdSense).

---

## 📑 Índice de Diagramas Generados

Los diagramas son archivos vectoriales independientes de alta fidelidad con paleta Sci-Fi/Cyberpunk, legibles directamente en navegadores web, visores SVG o incrustados en wikis:

| N° | Diagrama | Estándar / Tipo | Archivo SVG | Descripción Técnica |
|---|---|---|---|---|
| **01** | Contexto del Sistema | **C4 Nivel 1** | [01_modelo_c4_nivel1_contexto.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/01_modelo_c4_nivel1_contexto.svg) | Interacción del sistema central con pilotos humanos, administradores y plataformas externas (GD, Monetag, Render, CrazyGames). |
| **02** | Contenedores | **C4 Nivel 2** | [02_modelo_c4_nivel2_contenedores.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/02_modelo_c4_nivel2_contenedores.svg) | Desglose en Single Page App (Canvas HTML5), Flask REST API (Python WSGI), Base de Datos SQLite/PostgreSQL y Redes Publicitarias. |
| **03** | Componentes Frontend | **C4 Nivel 3** | [03_modelo_c4_nivel3_componentes_frontend.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/03_modelo_c4_nivel3_componentes_frontend.svg) | Desglose modular de `GameEngine`, `ParticleSystem`, `UniversalAdsManager`, `AudioManager`, `ApiClient` y HUD en el navegador. |
| **04** | Componentes Backend | **C4 Nivel 3** | [04_modelo_c4_nivel3_componentes_backend.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/04_modelo_c4_nivel3_componentes_backend.svg) | Arquitectura interna de Flask: Blueprints de Auth, Scores, Health, Servicios JWT, validación Anti-Cheat y Capa ORM. |
| **05** | Casos de Uso | **UML Use Case** | [05_uml_casos_de_uso.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/05_uml_casos_de_uso.svg) | Actores (Piloto Registrado, Invitado, Admin, Ad Networks) y relaciones `<<include>>` / `<<extend>>` (Revive rewarded, combate, ranking). |
| **06** | Diagrama de Secuencia | **UML Sequence** | [06_uml_diagrama_secuencia.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/06_uml_diagrama_secuencia.svg) | Cronología asíncrona: Inicialización, combate a 60 FPS, colisión fatal, streaming del Rewarded Ad, escudo y persistencia de Score. |
| **07** | Diagrama de Paquetes | **UML Package** | [07_uml_diagrama_paquetes.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/07_uml_diagrama_paquetes.svg) | Estructura modular y relaciones `<<use>>`/`<<import>>` entre `space.game.core`, `space.ads.engine`, `backend.api` y almacenamiento. |
| **08** | Diagrama de Clases | **UML Class** | [08_uml_diagrama_clases.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/08_uml_diagrama_clases.svg) | Jerarquía estática de clases: `GameEngine`, `PlayerShip`, `WeaponSystem`, `UniversalAdsManager`, `Enemy` (y subclases Boss/Scout) y modelos ORM. |
| **09** | Máquina de Estados | **UML State Machine** | [09_uml_diagrama_estados.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/09_uml_diagrama_estados.svg) | Ciclo de vida y transiciones: `BOOT` ➔ `AUTH/GUEST` ➔ `HANGAR` ➔ `COMBAT_60FPS` ➔ `PAUSED` ➔ `REWARDED_OFFER` ➔ `GAME_OVER`. |
| **10** | Diagrama de Actividad | **UML Activity** | [10_uml_diagrama_actividad.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/10_uml_diagrama_actividad.svg) | Carriles (Swimlanes): Jugador, Engine, Ads Manager y Backend API con bifurcaciones de cooldown y decisión de revivir. |
| **11** | Flujo del Sistema | **System Flow** | [11_flujo_del_sistema.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/11_flujo_del_sistema.svg) | Recorrido punta a punta del usuario (User Journey): Detección de host, Hangar, oleadas 1 a 5, Boss fight, celebración y loop de rejugabilidad. |
| **12** | Arquitectura General | **High-Level Arch** | [12_arquitectura_general.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/12_arquitectura_general.svg) | Visión multi-capa: Capa de Clientes, Capa de Distribución WebGL, Edge CDN, Servidores Flask en la nube, Base de Datos y Ad Networks. |
| **13** | Arquitectura Detallada y Monetización | **Monetization Deep Dive** | [13_arquitectura_detallada_y_monetizacion.svg](file:///d:/Cowork/Proyecto%20naves/arquitectura/13_arquitectura_detallada_y_monetizacion.svg) | Ingeniería del Universal Ads Manager: Aislamiento por hostname, solución al Domain Lock, cooldown de 75s y compatibilidad cruzada sin conflictos. |

---

## 🛠️ Especificaciones Técnicas Clave

### 1. Modelo de Mediación Publicitaria Aislada (Zero-Conflict Ad Mediation)
Para evitar que las redes publicitarias se solapen o que los revisores de plataformas rechacen el juego:
- **Detección Dinámica de Host:** El juego inspecciona `window.location.hostname` y si está en un iframe externo (`window.parent !== window`).
- **Canal Render Directo:** Carga exclusivamente la Viñeta Banner de Monetag (Zona `12128966`) mediante inyección controlada (`vignette.min.js`), sin ventanas emergentes intrusivas ni redirecciones no deseadas.
- **Canal GameDistribution:** Se activa automáticamente en los portales afiliados mediante el SDK oficial (`d49c747be6564b50b1e93571d8b0ad58`), inhabilitando Monetag para cumplir con las políticas de distribución de GD.
- **Canal CrazyGames (Listo para publicación):** Se incorpora el adaptador `CrazyGamesAdapter` en [ads_manager.js](file:///d:/Cowork/Proyecto%20naves/frontend/js/ads_manager.js) con soporte de `gameplayStart()`, `gameplayStop()`, midgame ads y rewarded video.

### 2. Candado de Cooldown y Retención de Jugadores (Anti-Churn Policy)
- **75 Segundos de Enfriamiento:** Ningún anuncio intersticial o viñeta se muestra antes de transcurrir 75 segundos desde el último anuncio visto.
- **18 Segundos de Partida Mínima:** Si un jugador muere en menos de 18 segundos, no se dispara anuncio intersticial, protegiendo al usuario novato de la frustración.
- **Rewarded Revive Voluntario:** El anuncio de video para revivir es 100% por elección del jugador (mediante una ventana de decisión de 5 segundos). Al completarse, premia al jugador restaurando su barra de vida al 100% y otorgándole un escudo de invulnerabilidad temporal de 3 segundos.

### 3. Rendimiento en el Bucle de Juego (60-120 FPS)
- Renderizado nativo con **HTML5 Canvas 2D Context** sin librerías pesadas externas para garantizar tiempos de carga inferiores a 2 segundos en conexiones móviles y portales web.
- Limpieza estricta de proyectiles, partículas y entidades fuera de pantalla para prevenir fugas de memoria (*memory leaks*).
