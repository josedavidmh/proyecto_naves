/**
 * Lore y Justificaciones Narrativas Coherentes para cada una de las 5 Misiones
 * Todas las operaciones conducen y justifican el asalto definitivo a la Fortaleza de Vektor en la Fase 5.
 */

export const MissionLore = {
  1: {
    operation: "OPERACIÓN VÓRTICE POLAR",
    stageName: "Fase 1: Norteamérica a la Antártida",
    classification: "ALTA PRIORIDAD - RUPTURA DE CERCO",
    lore: "El General Vektor ha instalado una red de satélites espía y torres de radar de alerta temprana que barren todo el hemisferio occidental, desde Alaska hasta los hielos antárticos. Si intentamos un asalto directo a su cuartel general en la selva, seremos detectados y desintegrados por fuego antiaéreo en minutos. Tu objetivo es sobrevolar este corredor continental a velocidad supersónica, derribar los puestos de enlace y destruir la fortaleza voladora Goliath Apex en el polo sur para cegar la vigilancia enemiga y abrir una brecha táctica limpia para la flota.",
    objective: "Cegar los radares continentales y asegurar el corredor de vuelo del hemisferio sur.",
    intel: {
      subBoss: "Aurora-9 — Bombardero estratosférico supersónico con ráfagas guiadas.",
      finalBoss: "Goliath Apex — Fortaleza polar equipada con torretas gemelas de asalto."
    },
    threatLevel: "AMENAZA: MEDIA"
  },

  2: {
    operation: "OPERACIÓN MAREA TORMENTOSA",
    stageName: "Fase 2: Cruce del Océano Pacífico a Australia",
    classification: "INFILTRACIÓN MARÍTIMA Y DEMOLICIÓN DE ESCUDOS",
    lore: "Al hackear la caja negra del Goliath en la Antártida, descubrimos el secreto de los escudos impenetrables de Vektor: se alimentan de una cadena de generadores geotérmicos submarinos ocultos entre los atolones e islas del Pacífico. El coloso Leviathan coordina el flujo de energía desde la costa de Australia. Si destruyes estas instalaciones oceánicas, el campo de fuerza del cuartel general de Vektor en la selva perderá el 60% de su blindaje y aseguraremos Oceanía como base avanzada para los cazas rebeldes.",
    objective: "Neutralizar los generadores insulares de energía y hundir al portanaves Leviathan.",
    intel: {
      subBoss: "Nautilus-X — Corbeta anfibia de alta velocidad con cañones en arco.",
      finalBoss: "Leviathan Colossus — Acorazado naval-aéreo pesado capaz de disparar salvas masivas."
    },
    threatLevel: "AMENAZA: ALTA"
  },

  3: {
    operation: "OPERACIÓN TRAVESÍA A SATURNO",
    stageName: "Fase 3: De la Tierra a Marte, Júpiter y Saturno",
    classification: "COMBATE EXTRA-ATMOSFÉRICO DE SUPREMACÍA INTERPLANETARIA",
    lore: "Los datos capturados en el Pacífico revelan una amenaza titánica: el General Vektor instaló una mega-estación de guerra orbital en los majestuosos anillos de Saturno, alimentada por plasma extraído de Júpiter. Despega de la Tierra, rebasa la órbita roja de Marte, navega a través del peligroso Cinturón de Asteroides y neutraliza a la sonda sublíder Jovian Core frente a Júpiter. Luego, acelera a máxima potencia hacia los anillos de Saturno para destruir la estación Ganymede Titan antes de que cargue su cañón de aniquilación.",
    objective: "Superar Marte y el cinturón de asteroides, abatir a Jovian Core en Júpiter y destruir al titán en los anillos de Saturno.",
    intel: {
      subBoss: "Jovian Core — Sonda orbital de plasma frente a Júpiter con vórtice espiral cuádruple.",
      finalBoss: "Ganymede Titan — Fortaleza imperial en los anillos de Saturno armada con corona solar y railgun hiperdenso."
    },
    threatLevel: "AMENAZA: CRÍTICA"
  },

  4: {
    operation: "OPERACIÓN CERO ABSOLUTO",
    stageName: "Fase 4: El Círculo Ártico: De Groenlandia al Polo Norte",
    classification: "INCURSIÓN POLAR A LA CIUDADELA SUBGLACIAL",
    lore: "El General Vektor ha instalado una base industrial secreta bajo el hielo eterno del Océano Ártico. Ingresando por el Círculo Polar Ártico a 66°33' N, tu nave deberá cruzar el Mar de Groenlandia entre Islandia y Svalbard, sobrevolar el colosal casquete de hielo continental (Inlandis) de Groenlandia —donde el sublíder Frost-Bite comanda un puesto avanzado de radar en Thule—, y abrirte paso a través de la banquisa polar fracturada hasta alcanzar el mismísimo Polo Norte Geográfico a 90°00' N. Allí, en una colosal ciudadela criogénica subglacial, el destructor Zero-Kelvin custodia los códigos de desencriptación para desbloquear el búnker central en la selva.",
    objective: "Cruzar el Círculo Ártico y Groenlandia, abatir a Frost-Bite en el Inlandis y destruir a Zero-Kelvin en el Polo Norte Geográfico (90°N).",
    intel: {
      subBoss: "Frost-Bite — Fortaleza bípeda ártica apostada en el puesto radar de Groenlandia con proyectiles criogénicos.",
      finalBoss: "Zero-Kelvin — Destructor glacial subglacial en el eje del Polo Norte armado con tormentas de esquirlas de permafrost."
    },
    threatLevel: "AMENAZA: EXTREMA"
  },

  5: {
    operation: "OPERACIÓN JUICIO DEL TITÁN",
    stageName: "Fase 5: Jungla Profunda / Fortaleza del General Vektor",
    classification: "ASALTO FINAL - ELIMINACIÓN DEL COMANDO SUPREMO",
    lore: "¡Ha llegado el momento decisivo! Sin radares polares, sin generadores en el Pacífico, sin el reactor orbital de Júpiter y sin el suministro criogénico, el General Vektor se encuentra acorralado en su búnker subterráneo en el corazón de la selva. La densa vegetación esconde defensas terrestres: utiliza tus bombas pesadas y armas especiales para talar árboles, abrir cráteres y desenterrar sus defensas. Enfréntate al mecha Jungle-Beast y destruye en duelo a muerte al mismísimo Dreadnought Supremo de Vektor para liberar el planeta de una vez por todas.",
    objective: "Bombardear la jungla, neutralizar las defensas terrestres y liquidar al General Vektor.",
    intel: {
      subBoss: "Jungle-Beast — Mecha de guerra terrestre con misiles de racimo.",
      finalBoss: "GENERAL VEKTOR (Dread Apex) — El tirano en persona con triple patrón de ataque devastador."
    },
    threatLevel: "AMENAZA: MÁXIMA - BOSS FINAL"
  }
};
