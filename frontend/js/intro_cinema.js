/**
 * Cinemática Inicial Animada: Efecto Máquina de Escribir (Typewriter),
 * Holograma Reactivo con Glitch y Transmisión de Audio Táctico Sintetizado.
 */

export const IntroCinema = {
  dialogues: [
    {
      speaker: "ALERTA DE SISTEMA",
      role: "IA DE NAVEGACIÓN TÁCTICA",
      avatar: "📡",
      color: "#00f3ff",
      text: "¡ATENCIÓN! Frecuencia de emergencia interceptada. Transmisión holográfica forzada de ultra-alta prioridad desde el Cuartel General de la Jungla..."
    },
    {
      speaker: "GENERAL VEKTOR",
      role: "SUPREMO SEÑOR DE LA GUERRA (BOSS FINAL)",
      avatar: "👾",
      color: "#ff0055",
      text: "¿Así que estos son los 'heroicos' pilotos de la rebelión? ¡Patéticos! Mis satélites polares barren todo el continente y mis defensas son infranqueables. ¿De verdad creen que sus chatarras sobrevivirán?"
    },
    {
      speaker: "COMANDANTE DEL ESCUADRÓN",
      role: "PILOTO PROTAGONISTA",
      avatar: "👨‍🚀",
      color: "#38bdf8",
      text: "Vektor, tu tiranía termina hoy. Hemos rastreado la red que alimenta tu superarma. Destruiremos tus defensas desde el Ártico hasta la Antártida y llegaremos a tu fortaleza."
    },
    {
      speaker: "GENERAL VEKTOR",
      role: "SUPREMO SEÑOR DE LA GUERRA (BOSS FINAL)",
      avatar: "👾",
      color: "#ff0055",
      text: "¡JAJAJAJA! ¿Acaso sueñan con cruzar el Pacífico y la tempestad de hielo? Jamás llegarán a mi estación en Júpiter ni a mi base en la Selva. ¡Mis sublíderes y acorazados los pulverizarán antes de que vean la luz del sol!"
    },
    {
      speaker: "COMANDANTE DEL ESCUADRÓN",
      role: "PILOTO PROTAGONISTA",
      avatar: "👨‍🚀",
      color: "#38bdf8",
      text: "Prepara tus mejores armas, Vektor. Escuadrón de asalto: ¡Motores al máximo, activen armas de combate y despeguen a velocidad supersónica!"
    }
  ],

  currentIndex: 0,
  onCompleteCallback: null,
  typewriterTimeout: null,
  isTyping: false,
  fullText: "",

  show(onComplete) {
    this.currentIndex = 0;
    this.onCompleteCallback = onComplete;

    const modal = document.getElementById("intro-cinema-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    this.setupListeners();
    this.renderCurrentDialogue();
  },

  playTerminalBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(650 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio silencioso si no hay soporte
    }
  },

  renderCurrentDialogue() {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }

    const current = this.dialogues[this.currentIndex];
    if (!current) {
      this.close();
      return;
    }

    const speakerEl = document.getElementById("intro-speaker-name");
    const roleEl = document.getElementById("intro-speaker-role");
    const avatarEl = document.getElementById("intro-avatar");
    const textEl = document.getElementById("intro-dialogue-text");
    const counterEl = document.getElementById("intro-counter");

    if (speakerEl) {
      speakerEl.textContent = current.speaker;
      speakerEl.style.color = current.color;
    }
    if (roleEl) roleEl.textContent = current.role;
    if (counterEl) {
      counterEl.textContent = `${this.currentIndex + 1} / ${this.dialogues.length}`;
    }

    // Efecto holográfico animado en el avatar
    if (avatarEl) {
      avatarEl.textContent = current.avatar;
      avatarEl.style.animation = "none";
      void avatarEl.offsetWidth; // Forzar reflujo para reiniciar animación
      avatarEl.style.animation = "tactical-glitch 1.5s infinite alternate ease-in-out";
      avatarEl.style.borderColor = current.color;
    }

    // Animación de Máquina de Escribir (Typewriter)
    this.fullText = current.text;
    this.isTyping = true;
    let charIndex = 0;
    textEl.innerHTML = '<span class="typewriter-cursor">_</span>';

    const typeNextChar = () => {
      if (!this.isTyping) return;

      if (charIndex < this.fullText.length) {
        charIndex++;
        const currentSnippet = this.fullText.slice(0, charIndex);
        textEl.innerHTML = currentSnippet + '<span class="typewriter-cursor">_</span>';
        
        // Efecto de sonido de teletipo sutil cada 2 caracteres
        if (charIndex % 2 === 0) {
          this.playTerminalBeep();
        }

        const delay = this.fullText[charIndex - 1] === "." || this.fullText[charIndex - 1] === "?" ? 180 : 22;
        this.typewriterTimeout = setTimeout(typeNextChar, delay);
      } else {
        this.isTyping = false;
        textEl.innerHTML = this.fullText + '<span class="typewriter-cursor">_</span>';
      }
    };

    typeNextChar();
  },

  next() {
    // Si aún está escribiendo la animación, un clic completa el texto de inmediato
    if (this.isTyping) {
      if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
      this.isTyping = false;
      const textEl = document.getElementById("intro-dialogue-text");
      if (textEl) {
        textEl.innerHTML = this.fullText + '<span class="typewriter-cursor">_</span>';
      }
      return;
    }

    // Si ya completó de escribir, avanza al siguiente diálogo
    this.currentIndex++;
    if (this.currentIndex >= this.dialogues.length) {
      this.close();
    } else {
      this.renderCurrentDialogue();
    }
  },

  close() {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
    this.isTyping = false;

    const modal = document.getElementById("intro-cinema-modal");
    if (modal) modal.classList.add("hidden");

    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  },

  setupListeners() {
    const btnNext = document.getElementById("btn-intro-next");
    const btnSkip = document.getElementById("btn-intro-skip");

    if (btnNext) {
      btnNext.onclick = () => this.next();
    }
    if (btnSkip) {
      btnSkip.onclick = () => this.close();
    }
  }
};
