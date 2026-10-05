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
    operation: "OPERACIÓN ÉXODO JOVIANO",
    stageName: "Fase 3: De la Tierra hacia Júpiter",
    classification: "COMBATE EXTRA-ATMOSFÉRICO DE SUPREMACÍA",
    lore: "Los datos capturados en el Pacífico revelan una amenaza letal: Vektor construyó una estación de guerra orbital en la atmósfera de Júpiter. Esta mega-estructura extrae hidrógeno y plasma joviano para alimentar un cañón de aniquilación subespacial capaz de arrasar la Tierra desde el espacio profundo. No podemos atacar la selva terrestre mientras este cañón orbital apunte a nuestras espaldas. Despega de la Tierra, viaja al gigante gaseoso y destruye el núcleo Ganymede Titan antes de que cargue el rayo de juicio.",
    objective: "Viajar a Júpiter, destruir la estación extractora y desmantelar el cañón de aniquilación.",
    intel: {
      subBoss: "Jovian Core — Sonda orbital giratoria con pulsos de distorsión gravitatoria.",
      finalBoss: "Ganymede Titan — Estación de combate armada con haces de plasma giratorios."
    },
    threatLevel: "AMENAZA: CRÍTICA"
  },

  4: {
    operation: "OPERACIÓN CERO ABSOLUTO",
    stageName: "Fase 4: Sector Criogénico de Hielo",
    classification: "ASALTO A FÁBRICA DE BLINDAJE CRIOGÉNICO",
    lore: "Tras la explosión del reactor joviano, los restos del suministro energético de Vektor fueron trasladados a una base oculta en el sector criogénico de hielo. Allí, el acorazado Zero-Kelvin está utilizando el frío extremo para estabilizar ojivas de permafrost y reconstruir los blindajes térmicos de la nave de Vektor. Debemos purgar esta zona helada en medio de ventiscas letales y recuperar los códigos de desencriptación que desbloquean las compuertas blindadas de la fortaleza de la selva.",
    objective: "Destruir la fundición criogénica, abatir al Zero-Kelvin y robar los códigos de acceso a la selva.",
    intel: {
      subBoss: "Frost-Bite — Caminante blindado con proyectiles criogénicos en cono.",
      finalBoss: "Zero-Kelvin — Destructor glacial que desata tormentas de esquirlas congeladas."
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
