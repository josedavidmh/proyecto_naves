# 🚀 Space Assault v2.0 - Kit de Publicación para CrazyGames

Este directorio contiene todos los recursos gráficos y metadatos optimizados para publicar **Space Assault v2.0** en el portal de desarrolladores de **CrazyGames** ([https://developer.crazygames.com/](https://developer.crazygames.com/)).

---

## 📦 1. Archivo del Juego para Subir (HTML5 Zip)
* **Archivo ZIP:** `space-assault-crazygames.zip` (ubicado en la raíz del proyecto).
* **Estructura Interna:** Contiene `index.html` en la raíz con todo el motor gráfico, audio sintetizado, y el **SDK oficial CrazyGames v3** preinstalado.
* **Tamaño:** ~138 KB (ultraligero, carga en menos de 1 segundo en cualquier parte del mundo).

---

## 🖼️ 2. Recursos Gráficos Listos
* **Ícono de Juego (512×512):** [icon_512x512.png](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/icon_512x512.png) y [icon_512x512.jpg](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/icon_512x512.jpg)
* **Banner Principal / Portada (1280×720 - 16:9):** [banner_1280x720.png](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/banner_1280x720.png) y [banner_1280x720.jpg](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/banner_1280x720.jpg)
* **Banner Panorámico (1280×550):** [banner_1280x550.png](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/banner_1280x550.png) y [banner_1280x550.jpg](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/banner_1280x550.jpg)
* **Miniatura Cuadrada / 4:3 (512×384):** [thumb_512x384.png](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/thumb_512x384.png) y [thumb_512x384.jpg](file:///d:/Cowork/Proyecto%20naves/crazygames_assets/thumb_512x384.jpg)

---

## 📝 3. Ficha Técnica y Metadatos (Copiar y Pegar)

### 🏷️ Game Title (Título)
```text
Space Assault v2.0 - Tactical Aerial & Space Combat
```

### 🎯 Short Description (Descripción Corta)
```text
Pilot advanced starfighters across dynamic aerial and space warzones. Defeat alien squadrons, dodge bullet-hell barrages, unleash tactical EMP bombs, and topple massive flagship bosses!
```

### 📖 Full Description (Descripción Completa)
```text
Space Assault v2.0 is a fast-paced, high-octane vertical scrolling arcade shoot 'em up built on a high-performance 60 FPS HTML5 canvas engine. 

Take command of 5 distinct tactical starfighters, each equipped with customizable upgrade paths, primary laser arsenals, tactical EMP shockwave bombs, and signature ultimate abilities:
- Phoenix Vanguard: Heavy plasma cannons with full-spectrum particle shields.
- Shadow Phantom: High-mobility stealth interceptor with hyper-speed thrust.
- Titan Dreadnought: Armored flying fortress with crushing siege artillery.
- Solar Flare: Overcharged laser beam arrays with devastating pinpoint DPS.
- Chrono Striker: Spatial warp engines capable of temporal maneuvers.

Battle through 5 intense operations ranging from coastal archipelagos, neon orbital stations, and frozen asteroid valleys to the hostile alien jungle base where Supreme Warlord General Vektor awaits. Collect weapon upgrades, rescue energy capsules, and master the bullet-hell skies!
```

### 🕹️ Controls & Instructions (Controles e Instrucciones)
```text
Controls:
- Mouse / Touch: Drag to steer your starfighter with precise delta tracking (auto-fires continuously while maneuvering).
- Spacebar: Manual primary cannon firing.
- B / Bomb Icon: Detonate Tactical EMP Bomb (clears all incoming enemy projectiles and damages screen enemies).
- E / Special Button: Activate Ship Signature Ultimate Ability (Shield, Overclock, or Heavy Bombardment).
- P / Esc: Pause mission.
- F / Fullscreen Button: Toggle Immersive Theater / Fullscreen Mode.
```

### 🏷️ Categories & Tags (Categorías y Etiquetas)
* **Primary Category:** Action / Shooting
* **Secondary Category:** Arcade / Space
* **Tags:** `Space`, `Shooter`, `Bullet Hell`, `Arcade`, `Sci-Fi`, `Aircraft`, `Alien`, `Boss Battle`, `HTML5`, `Upgrade`

---

## ⚙️ 4. Compatibilidad Multi-Plataforma Automática
El juego detecta automáticamente si se está ejecutando dentro de:
1. **CrazyGames:** Activa el SDK v3 (`gameplayStart`, `gameplayStop`, `happytime`, anuncios Midgame y Rewarded).
2. **GameDistribution:** Activa `gdsdk`.
3. **Web Propia (Render):** Activa AdSense y Monetag.

¡Cero conflictos de librerías ni scripts incompatibles!
