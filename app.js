let timer = null;
let timeLeft = 0;
let totalTime = 0;
let running = false;

const display = document.getElementById("display");
const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");

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
const previewSoundBtn = document.getElementById("previewSoundBtn");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const hoursLabel = document.getElementById("hoursLabel");
const minutesLabel = document.getElementById("minutesLabel");
const secondsLabel = document.getElementById("secondsLabel");

const translations = {
  tr: {
    subtitle: "Basit, hızlı ve çok dilli zamanlayıcı",
    start: "Başlat",
    pause: "Duraklat",
    reset: "Sıfırla",
    done: "Süre doldu!",
    invalid: "Lütfen geçerli bir süre gir.",
    soundOn: "Ses açık",
    vibrationOn: "Titreşim açık",
    ready: "Hazır",
    paused: "Duraklatıldı",
    running: "Zamanlayıcı çalışıyor",
    reseted: "Sıfırlandı",
    hours: "Saat",
    minutes: "Dakika",
    seconds: "Saniye",
    tabTimer: "Timer",
    tabSounds: "Sesler",
    tabSettings: "Ayarlar",
    soundsTitle: "Alarm Sesleri",
    soundsDesc: "Bir ses seç ve önizleme yap.",
    preview: "Sesi Dinle",
    settingsTitle: "Ayarlar",
    settingsDesc: "Genel uygulama seçenekleri",
    themeTitle: "Tema",
    themeDesc: "Koyu veya açık görünüm",
    langTitle: "Dil",
    langDesc: "Arayüz dilini değiştir",
    aboutTitle: "Hakkında",
    aboutDesc: "Timer Trink! çok dilli akıllı zamanlayıcıdır."
  },
  en: {
    subtitle: "Simple, fast and multilingual timer",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    done: "Time is up!",
    invalid: "Please enter a valid time.",
    soundOn: "Sound on",
    vibrationOn: "Vibration on",
    ready: "Ready",
    paused: "Paused",
    running: "Timer is running",
    reseted: "Reset",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    tabTimer: "Timer",
    tabSounds: "Sounds",
    tabSettings: "Settings",
    soundsTitle: "Alarm Sounds",
    soundsDesc: "Choose a sound and preview it.",
    preview: "Preview Sound",
    settingsTitle: "Settings",
    settingsDesc: "General application options",
    themeTitle: "Theme",
    themeDesc: "Dark or light appearance",
    langTitle: "Language",
    langDesc: "Change interface language",
    aboutTitle: "About",
    aboutDesc: "Timer Trink! is a multilingual smart timer."
  },
  de: {
    subtitle: "Einfacher, schneller und mehrsprachiger Timer",
    start: "Start",
    pause: "Pause",
    reset: "Zurücksetzen",
    done: "Die Zeit ist um!",
    invalid: "Bitte gib eine gültige Zeit ein.",
    soundOn: "Ton an",
    vibrationOn: "Vibration an",
    ready: "Bereit",
    paused: "Pausiert",
    running: "Timer läuft",
    reseted: "Zurückgesetzt",
    hours: "Stunden",
    minutes: "Minuten",
    seconds: "Sekunden",
    tabTimer: "Timer",
    tabSounds: "Töne",
    tabSettings: "Einstellungen",
    soundsTitle: "Alarmtöne",
    soundsDesc: "Wähle einen Ton und höre ihn an.",
    preview: "Ton anhören",
    settingsTitle: "Einstellungen",
    settingsDesc: "Allgemeine App-Optionen",
    themeTitle: "Thema",
    themeDesc: "Dunkle oder helle Ansicht",
    langTitle: "Sprache",
    langDesc: "Sprache der Oberfläche ändern",
    aboutTitle: "Info",
    aboutDesc: "Timer Trink! ist ein mehrsprachiger smarter Timer."
  },
  fr: {
    subtitle: "Minuteur simple, rapide et multilingue",
    start: "Démarrer",
    pause: "Pause",
    reset: "Réinitialiser",
    done: "Le temps est écoulé !",
    invalid: "Veuillez entrer une durée valide.",
    soundOn: "Son activé",
    vibrationOn: "Vibration activée",
    ready: "Prêt",
    paused: "En pause",
    running: "Le minuteur fonctionne",
    reseted: "Réinitialisé",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    tabTimer: "Timer",
    tabSounds: "Sons",
    tabSettings: "Réglages",
    soundsTitle: "Sons d’alarme",
    soundsDesc: "Choisissez un son et écoutez l’aperçu.",
    preview: "Écouter",
    settingsTitle: "Réglages",
    settingsDesc: "Options générales de l'application",
    themeTitle: "Thème",
    themeDesc: "Apparence sombre ou claire",
    langTitle: "Langue",
    langDesc: "Changer la langue de l’interface",
    aboutTitle: "À propos",
    aboutDesc: "Timer Trink! est un minuteur intelligent multilingue."
  },
  es: {
    subtitle: "Temporizador simple, rápido y multilingüe",
    start: "Iniciar",
    pause: "Pausar",
    reset: "Restablecer",
    done: "¡Se acabó el tiempo!",
    invalid: "Introduce un tiempo válido.",
    soundOn: "Sonido activado",
    vibrationOn: "Vibración activada",
    ready: "Listo",
    paused: "Pausado",
    running: "El temporizador está en marcha",
    reseted: "Restablecido",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    tabTimer: "Timer",
    tabSounds: "Sonidos",
    tabSettings: "Ajustes",
    soundsTitle: "Sonidos de alarma",
    soundsDesc: "Elige un sonido y escúchalo.",
    preview: "Escuchar sonido",
    settingsTitle: "Ajustes",
    settingsDesc: "Opciones generales de la aplicación",
    themeTitle: "Tema",
    themeDesc: "Modo oscuro o claro",
    langTitle: "Idioma",
    langDesc: "Cambiar idioma de la interfaz",
    aboutTitle: "Acerca de",
    aboutDesc: "Timer Trink! es un temporizador inteligente multilingüe."
  },
  ar: {
    subtitle: "مؤقت بسيط وسريع ومتعدد اللغات",
    start: "ابدأ",
    pause: "إيقاف",
    reset: "إعادة ضبط",
    done: "انتهى الوقت!",
    invalid: "يرجى إدخال وقت صحيح.",
    soundOn: "الصوت مفعل",
    vibrationOn: "الاهتزاز مفعل",
    ready: "جاهز",
    paused: "متوقف مؤقتًا",
    running: "المؤقت يعمل",
    reseted: "تمت إعادة الضبط",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثوانٍ",
    tabTimer: "المؤقت",
    tabSounds: "الأصوات",
    tabSettings: "الإعدادات",
    soundsTitle: "أصوات التنبيه",
    soundsDesc: "اختر صوتًا واستمع إليه.",
    preview: "تشغيل الصوت",
    settingsTitle: "الإعدادات",
    settingsDesc: "خيارات التطبيق العامة",
    themeTitle: "السمة",
    themeDesc: "مظهر داكن أو فاتح",
    langTitle: "اللغة",
    langDesc: "تغيير لغة الواجهة",
    aboutTitle: "حول",
    aboutDesc: "Timer Trink! مؤقت ذكي متعدد اللغات."
  },
  ru: {
    subtitle: "Простой, быстрый и многоязычный таймер",
    start: "Старт",
    pause: "Пауза",
    reset: "Сброс",
    done: "Время вышло!",
    invalid: "Введите корректное время.",
    soundOn: "Звук включён",
    vibrationOn: "Вибрация включена",
    ready: "Готово",
    paused: "На паузе",
    running: "Таймер работает",
    reseted: "Сброшено",
    hours: "Часы",
    minutes: "Минуты",
    seconds: "Секунды",
    tabTimer: "Таймер",
    tabSounds: "Звуки",
    tabSettings: "Настройки",
    soundsTitle: "Звуки будильника",
    soundsDesc: "Выберите звук и прослушайте его.",
    preview: "Прослушать",
    settingsTitle: "Настройки",
    settingsDesc: "Общие параметры приложения",
    themeTitle: "Тема",
    themeDesc: "Светлый или тёмный режим",
    langTitle: "Язык",
    langDesc: "Изменить язык интерфейса",
    aboutTitle: "О приложении",
    aboutDesc: "Timer Trink! — многоязычный умный таймер."
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
  document.documentElement.dir = getLang() === "ar" ? "rtl" : "ltr";

  subtitle.textContent = getText("subtitle");
  startBtn.textContent = getText("start");
  pauseBtn.textContent = getText("pause");
  resetBtn.textContent = getText("reset");
  soundLabel.textContent = getText("soundOn");
  vibrationLabel.textContent = getText("vibrationOn");
  hoursLabel.textContent = getText("hours");
  minutesLabel.textContent = getText("minutes");
  secondsLabel.textContent = getText("seconds");

  document.getElementById("tabTimer").textContent = getText("tabTimer");
  document.getElementById("tabSounds").textContent = getText("tabSounds");
  document.getElementById("tabSettings").textContent = getText("tabSettings");

  document.getElementById("soundsTitle").textContent = getText("soundsTitle");
  document.getElementById("soundsDesc").textContent = getText("soundsDesc");
  previewSoundBtn.textContent = getText("preview");

  document.getElementById("settingsTitle").textContent = getText("settingsTitle");
  document.getElementById("settingsDesc").textContent = getText("settingsDesc");
  document.getElementById("themeTitle").textContent = getText("themeTitle");
  document.getElementById("themeDesc").textContent = getText("themeDesc");
  document.getElementById("langTitle").textContent = getText("langTitle");
  document.getElementById("langDesc").textContent = getText("langDesc");
  document.getElementById("aboutTitle").textContent = getText("aboutTitle");
  document.getElementById("aboutDesc").textContent = getText("aboutDesc");

  if (!running && timeLeft === 0) {
    statusEl.textContent = getText("ready");
  }
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0")
  );
}

function updateDisplay() {
  display.textContent = formatTime(timeLeft);
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

  ring.style.background =
    `conic-gradient(var(--accent) 0deg, var(--accent-2) ${degrees}deg, rgba(255,255,255,0.12) ${degrees}deg)`;
}

function getSelectedSound() {
  const selected = document.querySelector('input[name="alarmSound"]:checked');
  return selected ? selected.value : "classic";
}

function playTone(type = "classic") {
  if (!soundToggle.checked) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();

  const tones = {
    classic: [880, 660, 880],
    digital: [900, 900, 900, 900],
    soft: [440, 554, 659],
    urgent: [1000, 800, 1000, 800, 1000]
  };

  const sequence = tones[type] || tones.classic;

  sequence.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type === "soft" ? "sine" : "square";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.25);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + index * 0.25 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.25 + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime + index * 0.25);
    oscillator.stop(ctx.currentTime + index * 0.25 + 0.22);
  });
}

function vibrateDevice() {
  if (!vibrationToggle.checked) return;
  if ("vibrate" in navigator) {
    navigator.vibrate([250, 120, 250, 120, 350]);
  }
}

function flashUI() {
  document.querySelector(".card").classList.add("flash");
  setTimeout(() => {
    document.querySelector(".card").classList.remove("flash");
  }, 2200);
}

function showToast(message) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function finishTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = 0;
  updateDisplay();
  playTone(getSelectedSound());
  vibrateDevice();
  flashUI();
  statusEl.textContent = getText("done");
  showToast(getText("done"));
}

function getInputSeconds() {
  const h = parseInt(hoursInput.value || "0", 10);
  const m = parseInt(minutesInput.value || "0", 10);
  const s = parseInt(secondsInput.value || "0", 10);

  return (Math.max(0, h) * 3600) + (Math.max(0, m) * 60) + Math.max(0, s);
}

function startTimer() {
  if (running) return;

  if (timeLeft === 0) {
    const total = getInputSeconds();

    if (!total || total <= 0) {
      showToast(getText("invalid"));
      return;
    }

    timeLeft = total;
    totalTime = total;
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
  hoursInput.value = 0;
  minutesInput.value = 0;
  secondsInput.value = 0;
  updateDisplay();
  statusEl.textContent = getText("reseted");
}

function setQuickTime(h, m, s) {
  clearInterval(timer);
  running = false;
  hoursInput.value = h;
  minutesInput.value = m;
  secondsInput.value = s;
  timeLeft = h * 3600 + m * 60 + s;
  totalTime = timeLeft;
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

function switchTab(tabId) {
  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabContents.forEach(tab => tab.classList.remove("active"));

  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
languageSelect.addEventListener("change", updateLanguage);
themeToggle.addEventListener("click", toggleTheme);
previewSoundBtn.addEventListener("click", () => playTone(getSelectedSound()));

quickButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const h = parseInt(btn.dataset.hours, 10);
    const m = parseInt(btn.dataset.minutes, 10);
    const s = parseInt(btn.dataset.seconds, 10);
    setQuickTime(h, m, s);
  });
});

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

loadTheme();
updateLanguage();
updateDisplay();
statusEl.textContent = getText("ready");
