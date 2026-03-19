let timer = null;
let timeLeft = 0;
let totalTime = 0;
let running = false;

const display = document.getElementById("display");
const minutesInput = document.getElementById("minutes");
const languageSelect = document.getElementById("language");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const subtitle = document.getElementById("subtitle");
const statusEl = document.getElementById("status");
const soundToggle = document.getElementById("soundToggle");
const vibrationToggle = document.getElementById("vibrationToggle");
const soundLabel = document.getElementById("soundLabel");
const vibrationLabel = document.getElementById("vibrationLabel");
const themeToggle = document.getElementById("themeToggle");
const ring = document.querySelector(".ring");
const quickButtons = document.querySelectorAll(".quick-btn");

const translations = {
  tr: {
    subtitle: "Basit, hızlı ve çok dilli zamanlayıcı",
    start: "Başlat",
    pause: "Duraklat",
    reset: "Sıfırla",
    placeholder: "Dakika",
    done: "Süre doldu!",
    invalid: "Lütfen geçerli bir dakika gir.",
    soundOn: "Ses açık",
    vibrationOn: "Titreşim açık",
    ready: "Hazır",
    paused: "Duraklatıldı",
    running: "Zamanlayıcı çalışıyor",
    reseted: "Sıfırlandı"
  },
  en: {
    subtitle: "Simple, fast and multilingual timer",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    placeholder: "Minutes",
    done: "Time is up!",
    invalid: "Please enter a valid minute.",
    soundOn: "Sound on",
    vibrationOn: "Vibration on",
    ready: "Ready",
    paused: "Paused",
    running: "Timer is running",
    reseted: "Reset"
  },
  ar: {
    subtitle: "مؤقت بسيط وسريع ومتعدد اللغات",
    start: "ابدأ",
    pause: "إيقاف",
    reset: "إعادة ضبط",
    placeholder: "دقائق",
    done: "انتهى الوقت!",
    invalid: "يرجى إدخال عدد دقائق صحيح.",
    soundOn: "الصوت مفعل",
    vibrationOn: "الاهتزاز مفعل",
    ready: "جاهز",
    paused: "متوقف مؤقتًا",
    running: "المؤقت يعمل",
    reseted: "تمت إعادة الضبط"
  },
  de: {
    subtitle: "Einfacher, schneller und mehrsprachiger Timer",
    start: "Start",
    pause: "Pause",
    reset: "Zurücksetzen",
    placeholder: "Minuten",
    done: "Die Zeit ist um!",
    invalid: "Bitte gib eine gültige Minute ein.",
    soundOn: "Ton an",
    vibrationOn: "Vibration an",
    ready: "Bereit",
    paused: "Pausiert",
    running: "Timer läuft",
    reseted: "Zurückgesetzt"
  },
  fr: {
    subtitle: "Minuteur simple, rapide et multilingue",
    start: "Démarrer",
    pause: "Pause",
    reset: "Réinitialiser",
    placeholder: "Minutes",
    done: "Le temps est écoulé !",
    invalid: "Veuillez entrer une minute valide.",
    soundOn: "Son activé",
    vibrationOn: "Vibration activée",
    ready: "Prêt",
    paused: "En pause",
    running: "Le minuteur fonctionne",
    reseted: "Réinitialisé"
  },
  es: {
    subtitle: "Temporizador simple, rápido y multilingüe",
    start: "Iniciar",
    pause: "Pausar",
    reset: "Restablecer",
    placeholder: "Minutos",
    done: "¡Se acabó el tiempo!",
    invalid: "Introduce un minuto válido.",
    soundOn: "Sonido activado",
    vibrationOn: "Vibración activada",
    ready: "Listo",
    paused: "Pausado",
    running: "El temporizador está en marcha",
    reseted: "Restablecido"
  },
  ru: {
    subtitle: "Простой, быстрый и многоязычный таймер",
    start: "Старт",
    pause: "Пауза",
    reset: "Сброс",
    placeholder: "Минуты",
    done: "Время вышло!",
    invalid: "Введите корректное количество минут.",
    soundOn: "Звук включён",
    vibrationOn: "Вибрация включена",
    ready: "Готово",
    paused: "На паузе",
    running: "Таймер работает",
    reseted: "Сброшено"
  }
};

function getLang() {
  return languageSelect.value;
}

function getText(key) {
  return translations[getLang()][key];
}

function updateLanguage() {
  document.documentElement.lang = getLang();
  subtitle.textContent = getText("subtitle");
  startBtn.textContent = getText("start");
  pauseBtn.textContent = getText("pause");
  resetBtn.textContent = getText("reset");
  minutesInput.placeholder = getText("placeholder");
  soundLabel.textContent = getText("soundOn");
  vibrationLabel.textContent = getText("vibrationOn");

  if (!running && timeLeft === 0) {
    statusEl.textContent = getText("ready");
  }
}

function updateDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  display.textContent =
    String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");

  updateRing();
}

function updateRing() {
  if (totalTime <= 0) {
    ring.style.background =
      "conic-gradient(var(--accent) 0deg, var(--accent-2) 180deg, rgba(255,255,255,0.12) 180deg)";
    return;
  }

  const progress = timeLeft / totalTime;
  const degrees = Math.max(0, Math.min(360, progress * 360));

  ring.style.background = `conic-gradient(var(--accent) 0deg, var(--accent-2) ${degrees}deg, rgba(255,255,255,0.12) ${degrees}deg)`;
}

function beep() {
  if (!soundToggle.checked) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.6);
}

function vibrateDevice() {
  if (!vibrationToggle.checked) return;
  if ("vibrate" in navigator) {
    navigator.vibrate([250, 120, 250, 120, 400]);
  }
}

function flashUI() {
  document.querySelector(".card").classList.add("flash");
  setTimeout(() => {
    document.querySelector(".card").classList.remove("flash");
  }, 2500);
}

function finishTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = 0;
  updateDisplay();
  beep();
  vibrateDevice();
  flashUI();
  statusEl.textContent = getText("done");
  alert(getText("done"));
}

function startTimer() {
  if (running) return;

  if (timeLeft === 0) {
    const minutes = parseInt(minutesInput.value, 10);

    if (!minutes || minutes <= 0) {
      alert(getText("invalid"));
      return;
    }

    timeLeft = minutes * 60;
    totalTime = timeLeft;
    updateDisplay();
  }

  running = true;
  statusEl.textContent = getText("running");

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      finishTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
  statusEl.textContent = getText("paused");
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = 0;
  totalTime = 0;
  minutesInput.value = "";
  updateDisplay();
  statusEl.textContent = getText("reseted");
}

function setQuickMinutes(value) {
  clearInterval(timer);
  running = false;
  timeLeft = value * 60;
  totalTime = timeLeft;
  minutesInput.value = value;
  updateDisplay();
  statusEl.textContent = getText("ready");
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("timerTrinkTheme", isLight ? "light" : "dark");
}

function loadTheme() {
  const savedTheme = localStorage.getItem("timerTrinkTheme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
languageSelect.addEventListener("change", updateLanguage);
themeToggle.addEventListener("click", toggleTheme);

quickButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const minutes = parseInt(btn.dataset.minutes, 10);
    setQuickMinutes(minutes);
  });
});

loadTheme();
updateLanguage();
updateDisplay();
statusEl.textContent = getText("ready");
