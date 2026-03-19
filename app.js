let timer = null;
let timeLeft = 0;
let totalTime = 0;
let running = false;
let pomodoroMode = false;
let pomodoroPhase = "work";
let pomodoroCurrentCycle = 1;

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
const pomodoroStatus = document.getElementById("pomodoroStatus");
const soundToggle = document.getElementById("soundToggle");
const vibrationToggle = document.getElementById("vibrationToggle");
const soundLabel = document.getElementById("soundLabel");
const vibrationLabel = document.getElementById("vibrationLabel");
const themeToggle = document.getElementById("themeToggle");
const ring = document.querySelector(".ring");
const quickButtons = document.querySelectorAll(".quick-btn");
const previewSoundBtn = document.getElementById("previewSoundBtn");
const presetButtons = document.querySelectorAll(".preset-btn");
const applyPomodoroBtn = document.getElementById("applyPomodoroBtn");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const hoursLabel = document.getElementById("hoursLabel");
const minutesLabel = document.getElementById("minutesLabel");
const secondsLabel = document.getElementById("secondsLabel");

const pomodoroWork = document.getElementById("pomodoroWork");
const pomodoroBreak = document.getElementById("pomodoroBreak");
const pomodoroLongBreak = document.getElementById("pomodoroLongBreak");
const pomodoroCycles = document.getElementById("pomodoroCycles");

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
    tabPomodoro: "Pomodoro",
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
    aboutDesc: "Timer Trink! çok dilli akıllı zamanlayıcıdır.",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Hazır odak döngülerinden birini seç.",
    work: "Çalışma",
    shortBreak: "Kısa Mola",
    longBreak: "Uzun Mola",
    cycles: "Tur",
    applyPomodoro: "Pomodoro Uygula",
    pomodoroApplied: "Pomodoro ayarları yüklendi",
    pomodoroWorkPhase: "Odak süresi",
    pomodoroBreakPhase: "Kısa mola",
    pomodoroLongBreakPhase: "Uzun mola"
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
    tabPomodoro: "Pomodoro",
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
    aboutDesc: "Timer Trink! is a multilingual smart timer.",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Choose one of the ready focus cycles.",
    work: "Work",
    shortBreak: "Short Break",
    longBreak: "Long Break",
    cycles: "Cycles",
    applyPomodoro: "Apply Pomodoro",
    pomodoroApplied: "Pomodoro settings loaded",
    pomodoroWorkPhase: "Focus time",
    pomodoroBreakPhase: "Short break",
    pomodoroLongBreakPhase: "Long break"
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
    tabPomodoro: "Помодоро",
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
    aboutDesc: "Timer Trink! — многоязычный умный таймер.",
    pomodoroTitle: "Помодоро",
    pomodoroDesc: "Выберите готовый цикл фокусировки.",
    work: "Работа",
    shortBreak: "Короткий перерыв",
    longBreak: "Длинный перерыв",
    cycles: "Циклы",
    applyPomodoro: "Применить Pomodoro",
    pomodoroApplied: "Настройки Pomodoro загружены",
    pomodoroWorkPhase: "Фокус",
    pomodoroBreakPhase: "Короткий перерыв",
    pomodoroLongBreakPhase: "Длинный перерыв"
  },
  zh: {
    subtitle: "简单、快速、多语言计时器",
    start: "开始",
    pause: "暂停",
    reset: "重置",
    done: "时间到！",
    invalid: "请输入有效时间。",
    soundOn: "声音开启",
    vibrationOn: "震动开启",
    ready: "准备就绪",
    paused: "已暂停",
    running: "计时器运行中",
    reseted: "已重置",
    hours: "小时",
    minutes: "分钟",
    seconds: "秒",
    tabTimer: "计时器",
    tabPomodoro: "番茄钟",
    tabSounds: "声音",
    tabSettings: "设置",
    soundsTitle: "闹铃声音",
    soundsDesc: "选择一个声音并试听。",
    preview: "试听声音",
    settingsTitle: "设置",
    settingsDesc: "应用常规选项",
    themeTitle: "主题",
    themeDesc: "深色或浅色外观",
    langTitle: "语言",
    langDesc: "更改界面语言",
    aboutTitle: "关于",
    aboutDesc: "Timer Trink! 是一款多语言智能计时器。",
    pomodoroTitle: "番茄钟",
    pomodoroDesc: "选择一个预设专注循环。",
    work: "工作",
    shortBreak: "短休息",
    longBreak: "长休息",
    cycles: "循环",
    applyPomodoro: "应用番茄钟",
    pomodoroApplied: "番茄钟设置已加载",
    pomodoroWorkPhase: "专注时间",
    pomodoroBreakPhase: "短休息",
    pomodoroLongBreakPhase: "长休息"
  }
};

const fallback = translations.en;
const extraLangs = {
  de: { ...fallback, subtitle: "Einfacher, schneller und mehrsprachiger Timer" },
  fr: { ...fallback, subtitle: "Minuteur simple, rapide et multilingue" },
  es: { ...fallback, subtitle: "Temporizador simple, rápido y multilingüe" },
  ar: { ...fallback, subtitle: "مؤقت بسيط وسريع ومتعدد اللغات" },
  it: { ...fallback, subtitle: "Timer semplice, veloce e multilingue" },
  pt: { ...fallback, subtitle: "Temporizador simples, rápido e multilíngue" },
  ja: { ...fallback, subtitle: "シンプルで高速な多言語タイマー" },
  ko: { ...fallback, subtitle: "간단하고 빠른 다국어 타이머" },
  hi: { ...fallback, subtitle: "सरल, तेज और बहुभाषी टाइमर" },
  fa: { ...fallback, subtitle: "تایمر ساده، سریع و چندزبانه" },
  uk: { ...fallback, subtitle: "Простий, швидкий і багатомовний таймер" },
  pl: { ...fallback, subtitle: "Prosty, szybki i wielojęzyczny timer" },
  nl: { ...fallback, subtitle: "Eenvoudige, snelle en meertalige timer" },
  sv: { ...fallback, subtitle: "Enkel, snabb och flerspråkig timer" },
  id: { ...fallback, subtitle: "Timer sederhana, cepat, dan multibahasa" },
  ms: { ...fallback, subtitle: "Pemasa ringkas, pantas dan pelbagai bahasa" },
  vi: { ...fallback, subtitle: "Bộ đếm giờ đơn giản, nhanh và đa ngôn ngữ" },
  el: { ...fallback, subtitle: "Απλός, γρήγορος και πολύγλωσσος χρονοδιακόπτης" }
};

Object.assign(translations, extraLangs);

function getLang() {
  return languageSelect.value;
}

function getText(key) {
  return (translations[getLang()] && translations[getLang()][key]) || fallback[key] || key;
}

function updateLanguage() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = ["ar", "fa"].includes(lang) ? "rtl" : "ltr";

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
  document.getElementById("tabPomodoro").textContent = getText("tabPomodoro");
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

  document.getElementById("pomodoroTitle").textContent = getText("pomodoroTitle");
  document.getElementById("pomodoroDesc").textContent = getText("pomodoroDesc");
  document.getElementById("workLabel").textContent = getText("work");
  document.getElementById("shortBreakLabel").textContent = getText("shortBreak");
  document.getElementById("longBreakLabel").textContent = getText("longBreak");
  document.getElementById("cyclesLabel").textContent = getText("cycles");
  applyPomodoroBtn.textContent = getText("applyPomodoro");

  if (!running && timeLeft === 0) {
    statusEl.textContent = getText("ready");
  }
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateDisplay() {
  display.textContent = formatTime(timeLeft);
  updateRing();
}

function updateRing() {
  if (totalTime <= 0) {
    ring.style.background =
      "conic-gradient(var(--primary) 0deg, var(--secondary) 180deg, var(--ring-rest) 180deg)";
    return;
  }
  const progress = timeLeft / totalTime;
  const degrees = Math.max(0, Math.min(360, progress * 360));
  ring.style.background =
    `conic-gradient(var(--primary) 0deg, var(--secondary) ${degrees}deg, var(--ring-rest) ${degrees}deg)`;
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
    urgent: [1000, 800, 1000, 800, 1000],
    zen: [523, 659, 784],
    retro: [660, 550, 440, 660]
  };

  const sequence = tones[type] || tones.classic;

  sequence.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = ["soft", "zen"].includes(type) ? "sine" : "square";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.24);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.24);
    gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + index * 0.24 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.24 + 0.19);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime + index * 0.24);
    oscillator.stop(ctx.currentTime + index * 0.24 + 0.2);
  });
}

function vibrateDevice() {
  if (!vibrationToggle.checked) return;
  if ("vibrate" in navigator) {
    navigator.vibrate([250, 120, 250, 120, 350]);
  }
}

function flashUI() {
  const activePanel = document.querySelector(".tab-content.active .hero, .tab-content.active .panel");
  if (!activePanel) return;
  activePanel.classList.add("flash");
  setTimeout(() => activePanel.classList.remove("flash"), 2200);
}

function showToast(message) {
  const toast = document.createElement("div");
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
  playTone(getSelectedSound());
  vibrateDevice();
  flashUI();
  showToast(getText("done"));

  if (pomodoroMode) {
    handlePomodoroTransition();
    return;
  }

  timeLeft = 0;
  updateDisplay();
  statusEl.textContent = getText("done");
}

function handlePomodoroTransition() {
  const workMin = parseInt(pomodoroWork.value, 10);
  const breakMin = parseInt(pomodoroBreak.value, 10);
  const longBreakMin = parseInt(pomodoroLongBreak.value, 10);
  const cycles = parseInt(pomodoroCycles.value, 10);

  if (pomodoroPhase === "work") {
    if (pomodoroCurrentCycle >= cycles) {
      pomodoroPhase = "longBreak";
      timeLeft = longBreakMin * 60;
      totalTime = timeLeft;
      pomodoroStatus.textContent = getText("pomodoroLongBreakPhase");
    } else {
      pomodoroPhase = "shortBreak";
      timeLeft = breakMin * 60;
      totalTime = timeLeft;
      pomodoroStatus.textContent = getText("pomodoroBreakPhase");
    }
  } else if (pomodoroPhase === "shortBreak") {
    pomodoroCurrentCycle++;
    pomodoroPhase = "work";
    timeLeft = workMin * 60;
    totalTime = timeLeft;
    pomodoroStatus.textContent = `${getText("pomodoroWorkPhase")} ${pomodoroCurrentCycle}/${cycles}`;
  } else {
    pomodoroMode = false;
    pomodoroPhase = "work";
    pomodoroCurrentCycle = 1;
    timeLeft = 0;
    totalTime = 0;
    pomodoroStatus.textContent = getText("ready");
    updateDisplay();
    return;
  }

  updateDisplay();
  running = true;
  timer = setInterval(tick, 1000);
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    finishTimer();
  }
}

function getInputSeconds() {
  const h = parseInt(hoursInput.value || "0", 10);
  const m = parseInt(minutesInput.value || "0", 10);
  const s = parseInt(secondsInput.value || "0", 10);
  return Math.max(0, h) * 3600 + Math.max(0, m) * 60 + Math.max(0, s);
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
    pomodoroMode = false;
    updateDisplay();
  }

  running = true;
  statusEl.textContent = getText("running");
  clearInterval(timer);
  timer = setInterval(tick, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
  statusEl.textContent = getText("paused");
  pomodoroStatus.textContent = getText("paused");
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  pomodoroMode = false;
  pomodoroPhase = "work";
  pomodoroCurrentCycle = 1;
  timeLeft = 0;
  totalTime = 0;
  hoursInput.value = 0;
  minutesInput.value = 0;
  secondsInput.value = 0;
  updateDisplay();
  statusEl.textContent = getText("reseted");
  pomodoroStatus.textContent = getText("reseted");
}

function setQuickTime(h, m, s) {
  clearInterval(timer);
  running = false;
  pomodoroMode = false;
  hoursInput.value = h;
  minutesInput.value = m;
  secondsInput.value = s;
  timeLeft = h * 3600 + m * 60 + s;
  totalTime = timeLeft;
  updateDisplay();
  statusEl.textContent = getText("ready");
}

function applyPomodoro() {
  clearInterval(timer);
  running = false;
  pomodoroMode = true;
  pomodoroPhase = "work";
  pomodoroCurrentCycle = 1;

  const workMin = parseInt(pomodoroWork.value, 10);
  timeLeft = workMin * 60;
  totalTime = timeLeft;
  updateDisplay();

  pomodoroStatus.textContent = `${getText("pomodoroWorkPhase")} 1/${parseInt(pomodoroCycles.value, 10)}`;
  statusEl.textContent = getText("pomodoroApplied");
  showToast(getText("pomodoroApplied"));
  switchTab("timerTab");
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
applyPomodoroBtn.addEventListener("click", applyPomodoro);

quickButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setQuickTime(
      parseInt(btn.dataset.hours, 10),
      parseInt(btn.dataset.minutes, 10),
      parseInt(btn.dataset.seconds, 10)
    );
  });
});

presetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    pomodoroWork.value = btn.dataset.work;
    pomodoroBreak.value = btn.dataset.break;
    pomodoroLongBreak.value = btn.dataset.longbreak;
    pomodoroCycles.value = btn.dataset.cycles;
    showToast(`${btn.dataset.work}/${btn.dataset.break} ${getText("pomodoroApplied")}`);
  });
});

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

loadTheme();
updateLanguage();
updateDisplay();
statusEl.textContent = getText("ready");
pomodoroStatus.textContent = getText("ready");
