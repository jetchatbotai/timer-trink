const $ = (id) => document.getElementById(id);

const timerState = {
  timerId: null,
  running: false,
  timeLeft: 0,
  totalTime: 0
};

const stopwatchState = {
  intervalId: null,
  running: false,
  elapsedMs: 0,
  lastStart: 0,
  laps: []
};

const languageSelect = $("language");
const themeToggle = $("themeToggle");
const toastEl = $("toast");

const timerDisplay = $("timerDisplay");
const timerRing = $("timerRing");
const timerStatus = $("timerStatus");
const pomodoroStatus = $("pomodoroStatus");
const stopwatchDisplay = $("stopwatchDisplay");
const stopwatchStatus = $("stopwatchStatus");
const lapsList = $("lapsList");
const soundList = $("soundList");

const hoursInput = $("hours");
const minutesInput = $("minutes");
const secondsInput = $("seconds");
const pomodoroWork = $("pomodoroWork");
const pomodoroBreak = $("pomodoroBreak");

const baseTranslations = {
  en: {
    subtitle: "Simple timer for focus and daily use",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stopwatch",
    sounds: "Sounds",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    lap: "Lap",
    soundOn: "Sound on",
    vibrationOn: "Vibration on",
    ready: "Ready",
    paused: "Paused",
    running: "Timer is running",
    stopwatchRunning: "Stopwatch is running",
    reseted: "Reset",
    invalid: "Please enter a valid time.",
    done: "Time is up!",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Choose a focus preset and load it into timer.",
    work: "Work",
    break: "Break",
    applyPomodoro: "Apply Pomodoro",
    pomodoroApplied: "Pomodoro loaded into timer",
    soundsTitle: "Alarm sounds",
    soundsDesc: "Select a sound and preview it.",
    preview: "Preview sound",
    laps: "Laps",
    soundCount: "50 sounds"
  },
  tr: {
    subtitle: "Odak ve günlük kullanım için basit zamanlayıcı",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Kronometre",
    sounds: "Sesler",
    start: "Başlat",
    pause: "Duraklat",
    reset: "Sıfırla",
    lap: "Tur",
    soundOn: "Ses açık",
    vibrationOn: "Titreşim açık",
    ready: "Hazır",
    paused: "Duraklatıldı",
    running: "Zamanlayıcı çalışıyor",
    stopwatchRunning: "Kronometre çalışıyor",
    reseted: "Sıfırlandı",
    invalid: "Lütfen geçerli bir süre gir.",
    done: "Süre doldu!",
    hours: "Saat",
    minutes: "Dakika",
    seconds: "Saniye",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Bir odak hazır ayarı seç ve zamanlayıcıya yükle.",
    work: "Çalışma",
    break: "Mola",
    applyPomodoro: "Pomodoro Uygula",
    pomodoroApplied: "Pomodoro zamanlayıcıya yüklendi",
    soundsTitle: "Alarm sesleri",
    soundsDesc: "Bir ses seç ve önizleme yap.",
    preview: "Sesi dinle",
    laps: "Turlar",
    soundCount: "50 ses"
  },
  ru: {
    subtitle: "Простой таймер для фокуса и повседневного использования",
    timer: "Таймер",
    pomodoro: "Помодоро",
    stopwatch: "Секундомер",
    sounds: "Звуки",
    start: "Старт",
    pause: "Пауза",
    reset: "Сброс",
    lap: "Круг",
    soundOn: "Звук включён",
    vibrationOn: "Вибрация включена",
    ready: "Готово",
    paused: "На паузе",
    running: "Таймер работает",
    stopwatchRunning: "Секундомер работает",
    reseted: "Сброшено",
    invalid: "Введите корректное время.",
    done: "Время вышло!",
    hours: "Часы",
    minutes: "Минуты",
    seconds: "Секунды",
    pomodoroTitle: "Помодоро",
    pomodoroDesc: "Выберите пресет и загрузите его в таймер.",
    work: "Работа",
    break: "Перерыв",
    applyPomodoro: "Применить Pomodoro",
    pomodoroApplied: "Pomodoro загружен в таймер",
    soundsTitle: "Звуки будильника",
    soundsDesc: "Выберите звук и прослушайте его.",
    preview: "Прослушать",
    laps: "Круги",
    soundCount: "50 звуков"
  },
  zh: {
    subtitle: "适合专注和日常使用的简洁计时器",
    timer: "计时器",
    pomodoro: "番茄钟",
    stopwatch: "秒表",
    sounds: "声音",
    start: "开始",
    pause: "暂停",
    reset: "重置",
    lap: "计圈",
    soundOn: "声音开启",
    vibrationOn: "震动开启",
    ready: "准备就绪",
    paused: "已暂停",
    running: "计时器运行中",
    stopwatchRunning: "秒表运行中",
    reseted: "已重置",
    invalid: "请输入有效时间。",
    done: "时间到！",
    hours: "小时",
    minutes: "分钟",
    seconds: "秒",
    pomodoroTitle: "番茄钟",
    pomodoroDesc: "选择一个预设并加载到计时器。",
    work: "工作",
    break: "休息",
    applyPomodoro: "应用番茄钟",
    pomodoroApplied: "番茄钟已加载到计时器",
    soundsTitle: "闹铃声音",
    soundsDesc: "选择一个声音并试听。",
    preview: "试听声音",
    laps: "计圈",
    soundCount: "50 个声音"
  },
  de: {
    subtitle: "Einfacher Timer für Fokus und Alltag",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stoppuhr",
    sounds: "Töne",
    start: "Start",
    pause: "Pause",
    reset: "Zurücksetzen",
    lap: "Runde",
    soundOn: "Ton an",
    vibrationOn: "Vibration an",
    ready: "Bereit",
    paused: "Pausiert",
    running: "Timer läuft",
    stopwatchRunning: "Stoppuhr läuft",
    reseted: "Zurückgesetzt",
    invalid: "Bitte gültige Zeit eingeben.",
    done: "Zeit ist um!",
    hours: "Stunden",
    minutes: "Minuten",
    seconds: "Sekunden",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Wähle ein Fokus-Preset und lade es in den Timer.",
    work: "Arbeit",
    break: "Pause",
    applyPomodoro: "Pomodoro anwenden",
    pomodoroApplied: "Pomodoro in Timer geladen",
    soundsTitle: "Alarmtöne",
    soundsDesc: "Wähle einen Ton und höre ihn an.",
    preview: "Ton anhören",
    laps: "Runden",
    soundCount: "50 Töne"
  },
  fr: {
    subtitle: "Minuteur simple pour la concentration et l’usage quotidien",
    timer: "Minuteur",
    pomodoro: "Pomodoro",
    stopwatch: "Chronomètre",
    sounds: "Sons",
    start: "Démarrer",
    pause: "Pause",
    reset: "Réinitialiser",
    lap: "Tour",
    soundOn: "Son activé",
    vibrationOn: "Vibration activée",
    ready: "Prêt",
    paused: "En pause",
    running: "Le minuteur fonctionne",
    stopwatchRunning: "Le chronomètre fonctionne",
    reseted: "Réinitialisé",
    invalid: "Veuillez saisir une durée valide.",
    done: "Le temps est écoulé !",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Choisissez un preset de concentration et chargez-le dans le minuteur.",
    work: "Travail",
    break: "Pause",
    applyPomodoro: "Appliquer Pomodoro",
    pomodoroApplied: "Pomodoro chargé dans le minuteur",
    soundsTitle: "Sons d’alarme",
    soundsDesc: "Choisissez un son et écoutez l’aperçu.",
    preview: "Écouter",
    laps: "Tours",
    soundCount: "50 sons"
  },
  es: {
    subtitle: "Temporizador simple para enfoque y uso diario",
    timer: "Temporizador",
    pomodoro: "Pomodoro",
    stopwatch: "Cronómetro",
    sounds: "Sonidos",
    start: "Iniciar",
    pause: "Pausar",
    reset: "Restablecer",
    lap: "Vuelta",
    soundOn: "Sonido activado",
    vibrationOn: "Vibración activada",
    ready: "Listo",
    paused: "Pausado",
    running: "El temporizador está en marcha",
    stopwatchRunning: "El cronómetro está en marcha",
    reseted: "Restablecido",
    invalid: "Introduce un tiempo válido.",
    done: "¡Se acabó el tiempo!",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Elige un preset de enfoque y cárgalo en el temporizador.",
    work: "Trabajo",
    break: "Descanso",
    applyPomodoro: "Aplicar Pomodoro",
    pomodoroApplied: "Pomodoro cargado en el temporizador",
    soundsTitle: "Sonidos de alarma",
    soundsDesc: "Elige un sonido y escúchalo.",
    preview: "Escuchar sonido",
    laps: "Vueltas",
    soundCount: "50 sonidos"
  },
  ar: {
    subtitle: "مؤقت بسيط للتركيز والاستخدام اليومي",
    timer: "المؤقت",
    pomodoro: "بومودورو",
    stopwatch: "ساعة إيقاف",
    sounds: "الأصوات",
    start: "ابدأ",
    pause: "إيقاف",
    reset: "إعادة ضبط",
    lap: "لفة",
    soundOn: "الصوت مفعل",
    vibrationOn: "الاهتزاز مفعل",
    ready: "جاهز",
    paused: "متوقف مؤقتًا",
    running: "المؤقت يعمل",
    stopwatchRunning: "ساعة الإيقاف تعمل",
    reseted: "تمت إعادة الضبط",
    invalid: "يرجى إدخال وقت صحيح.",
    done: "انتهى الوقت!",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثوانٍ",
    pomodoroTitle: "بومودورو",
    pomodoroDesc: "اختر إعداد تركيز جاهز وحمّله في المؤقت.",
    work: "العمل",
    break: "الاستراحة",
    applyPomodoro: "تطبيق بومودورو",
    pomodoroApplied: "تم تحميل بومودورو إلى المؤقت",
    soundsTitle: "أصوات التنبيه",
    soundsDesc: "اختر صوتًا واستمع إليه.",
    preview: "تشغيل الصوت",
    laps: "اللفات",
    soundCount: "50 صوتًا"
  }
};

const fallbackLanguageCodes = [
  "it","pt","ja","ko","hi","fa","uk","pl","nl","sv","id","ms","vi","el","cs","ro","hu","bg","sr",
  "hr","sk","sl","da","fi","no","lt","lv","et","he","th","bn","ur","ta","te","ml","mr","gu","pa",
  "sw","am","az","kk"
];

for (const code of fallbackLanguageCodes) {
  if (!baseTranslations[code]) {
    baseTranslations[code] = { ...baseTranslations.en };
  }
}

const SOUND_PRESETS = Array.from({ length: 50 }, (_, i) => {
  const bank = [
    { name: "Classic Bell", freqs: [880, 660, 880], type: "square" },
    { name: "Digital Beep", freqs: [900, 900, 900, 900], type: "square" },
    { name: "Soft Tone", freqs: [440, 554, 659], type: "sine" },
    { name: "Urgent Alarm", freqs: [1000, 800, 1000, 800, 1000], type: "square" },
    { name: "Zen Chime", freqs: [523, 659, 784], type: "sine" },
    { name: "Retro Clock", freqs: [660, 550, 440, 660], type: "triangle" },
    { name: "Crystal Pulse", freqs: [720, 860, 1020], type: "triangle" },
    { name: "Morning Ping", freqs: [600, 750, 900], type: "sine" },
    { name: "Sharp Signal", freqs: [1100, 1100, 900], type: "square" },
    { name: "Focus Bell", freqs: [700, 840, 700], type: "triangle" }
  ];
  const base = bank[i % bank.length];
  const octave = Math.floor(i / bank.length) * 20;
  return {
    id: `sound_${i + 1}`,
    name: `${i + 1}. ${base.name}`,
    type: base.type,
    freqs: base.freqs.map(f => f + octave)
  };
});

let selectedSoundId = SOUND_PRESETS[0].id;

function t(key) {
  const lang = languageSelect.value || "en";
  return (baseTranslations[lang] && baseTranslations[lang][key]) || baseTranslations.en[key] || key;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

function clampNumber(value) {
  const n = parseInt(value || "0", 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function formatHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatStopwatch(ms) {
  const totalTenths = Math.floor(ms / 100);
  const hours = Math.floor(totalTenths / 36000);
  const minutes = Math.floor((totalTenths % 36000) / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function getTimerInputSeconds() {
  return clampNumber(hoursInput.value) * 3600 +
    clampNumber(minutesInput.value) * 60 +
    clampNumber(secondsInput.value);
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatHMS(timerState.timeLeft);
  updateTimerRing();
}

function updateTimerRing() {
  if (timerState.totalTime <= 0) {
    timerRing.style.background =
      "conic-gradient(var(--primary) 0deg, var(--secondary) 180deg, var(--ring-rest) 180deg)";
    return;
  }
  const progress = timerState.timeLeft / timerState.totalTime;
  const deg = Math.max(0, Math.min(360, progress * 360));
  timerRing.style.background =
    `conic-gradient(var(--primary) 0deg, var(--secondary) ${deg}deg, var(--ring-rest) ${deg}deg)`;
}

function stopTimerInternal() {
  if (timerState.timerId) {
    clearInterval(timerState.timerId);
    timerState.timerId = null;
  }
  timerState.running = false;
}

function timerTick() {
  if (timerState.timeLeft > 0) {
    timerState.timeLeft -= 1;
    updateTimerDisplay();
    return;
  }
  stopTimerInternal();
  timerStatus.textContent = t("done");
  playSelectedSound();
  vibratePhone();
  document.querySelector(".panel.active")?.classList.add("flash");
  setTimeout(() => document.querySelector(".panel.active")?.classList.remove("flash"), 1800);
  showToast(t("done"));
}

function startTimer() {
  if (timerState.running) return;

  if (timerState.timeLeft <= 0) {
    const total = getTimerInputSeconds();
    if (total <= 0) {
      showToast(t("invalid"));
      return;
    }
    timerState.timeLeft = total;
    timerState.totalTime = total;
    updateTimerDisplay();
  }

  stopTimerInternal();
  timerState.running = true;
  timerStatus.textContent = t("running");
  timerState.timerId = setInterval(timerTick, 1000);
}

function pauseTimer() {
  stopTimerInternal();
  timerStatus.textContent = t("paused");
}

function resetTimer() {
  stopTimerInternal();
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  hoursInput.value = 0;
  minutesInput.value = 0;
  secondsInput.value = 0;
  updateTimerDisplay();
  timerStatus.textContent = t("reseted");
}

function setQuickTimer(h, m, s) {
  stopTimerInternal();
  hoursInput.value = h;
  minutesInput.value = m;
  secondsInput.value = s;
  timerState.timeLeft = h * 3600 + m * 60 + s;
  timerState.totalTime = timerState.timeLeft;
  updateTimerDisplay();
  timerStatus.textContent = t("ready");
}

function applyPomodoro() {
  const work = clampNumber(pomodoroWork.value);
  const brk = clampNumber(pomodoroBreak.value);

  if (work <= 0 || brk <= 0) {
    showToast(t("invalid"));
    return;
  }

  stopTimerInternal();
  hoursInput.value = 0;
  minutesInput.value = work;
  secondsInput.value = 0;
  timerState.timeLeft = work * 60;
  timerState.totalTime = timerState.timeLeft;
  updateTimerDisplay();
  pomodoroStatus.textContent = `${t("work")}: ${work}m / ${t("break")}: ${brk}m`;
  timerStatus.textContent = t("pomodoroApplied");
  showToast(t("pomodoroApplied"));
  switchTab("timerPanel");
}

function updateStopwatchDisplay() {
  const now = stopwatchState.running ? Date.now() : stopwatchState.lastStart;
  const base = stopwatchState.running ? stopwatchState.elapsedMs + (now - stopwatchState.lastStart) : stopwatchState.elapsedMs;
  stopwatchDisplay.textContent = formatStopwatch(base);
}

function startStopwatch() {
  if (stopwatchState.running) return;
  stopwatchState.running = true;
  stopwatchState.lastStart = Date.now();
  stopwatchStatus.textContent = t("stopwatchRunning");
  stopwatchState.intervalId = setInterval(updateStopwatchDisplay, 100);
}

function lapStopwatch() {
  const current = stopwatchDisplay.textContent;
  stopwatchState.laps.unshift(current);
  renderLaps();
}

function resetStopwatch() {
  if (stopwatchState.intervalId) {
    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = null;
  }
  stopwatchState.running = false;
  stopwatchState.elapsedMs = 0;
  stopwatchState.lastStart = 0;
  stopwatchState.laps = [];
  stopwatchDisplay.textContent = "00:00:00.0";
  stopwatchStatus.textContent = t("reseted");
  renderLaps();
}

function pauseOrHoldStopwatchStartButton() {
  if (!stopwatchState.running) {
    startStopwatch();
    return;
  }
  stopwatchState.elapsedMs += Date.now() - stopwatchState.lastStart;
  stopwatchState.running = false;
  clearInterval(stopwatchState.intervalId);
  stopwatchState.intervalId = null;
  stopwatchStatus.textContent = t("paused");
}

function renderLaps() {
  lapsList.innerHTML = "";
  stopwatchState.laps.forEach((lap, index) => {
    const row = document.createElement("div");
    row.className = "lap-row";
    row.innerHTML = `<span>#${stopwatchState.laps.length - index}</span><span>${lap}</span>`;
    lapsList.appendChild(row);
  });
}

function playToneSequence(sequence, type) {
  if (!$("soundToggle").checked) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  sequence.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.18);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + index * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.18 + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + index * 0.18);
    osc.stop(ctx.currentTime + index * 0.18 + 0.15);
  });
}

function playSelectedSound() {
  const preset = SOUND_PRESETS.find(s => s.id === selectedSoundId) || SOUND_PRESETS[0];
  playToneSequence(preset.freqs, preset.type);
}

function vibratePhone() {
  if (!$("vibrationToggle").checked) return;
  if ("vibrate" in navigator) {
    navigator.vibrate([220, 100, 220, 100, 320]);
  }
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function renderSounds() {
  soundList.innerHTML = "";
  SOUND_PRESETS.forEach((preset) => {
    const label = document.createElement("label");
    label.className = "sound-item";
    label.innerHTML = `
      <input type="radio" name="alarmSound" value="${preset.id}" ${preset.id === selectedSoundId ? "checked" : ""}>
      <span>${preset.name}</span>
      <button type="button" class="chip mini-preview-btn" data-sound-id="${preset.id}">▶</button>
    `;
    soundList.appendChild(label);
  });

  soundList.querySelectorAll('input[name="alarmSound"]').forEach((input) => {
    input.addEventListener("change", () => {
      selectedSoundId = input.value;
    });
  });

  soundList.querySelectorAll(".mini-preview-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSoundId = btn.dataset.soundId;
      const radio = soundList.querySelector(`input[value="${selectedSoundId}"]`);
      if (radio) radio.checked = true;
      playSelectedSound();
    });
  });
}

function applyLanguage() {
  const lang = languageSelect.value || "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = ["ar", "fa", "ur", "he"].includes(lang) ? "rtl" : "ltr";

  $("subtitle").textContent = t("subtitle");
  $("tabTimer").textContent = t("timer");
  $("tabPomodoro").textContent = t("pomodoro");
  $("tabStopwatch").textContent = t("stopwatch");
  $("tabSounds").textContent = t("sounds");

  $("hoursLabel").textContent = t("hours");
  $("minutesLabel").textContent = t("minutes");
  $("secondsLabel").textContent = t("seconds");

  $("timerStartBtn").textContent = t("start");
  $("timerPauseBtn").textContent = t("pause");
  $("timerResetBtn").textContent = t("reset");

  $("soundLabel").textContent = t("soundOn");
  $("vibrationLabel").textContent = t("vibrationOn");

  $("pomodoroTitle").textContent = t("pomodoroTitle");
  $("pomodoroDesc").textContent = t("pomodoroDesc");
  $("workLabel").textContent = t("work");
  $("breakLabel").textContent = t("break");
  $("applyPomodoroBtn").textContent = t("applyPomodoro");

  $("swStartBtn").textContent = stopwatchState.running ? t("pause") : t("start");
  $("swLapBtn").textContent = t("lap");
  $("swResetBtn").textContent = t("reset");

  $("soundsTitle").textContent = t("soundsTitle");
  $("soundsDesc").textContent = t("soundsDesc");
  $("previewSoundBtn").textContent = t("preview");
  $("soundCountLabel").textContent = t("soundCount");
  $("lapsTitle").textContent = t("laps");

  if (!timerState.running && timerState.timeLeft === 0) {
    timerStatus.textContent = t("ready");
  }
  if (!stopwatchState.running && stopwatchState.elapsedMs === 0) {
    stopwatchStatus.textContent = t("ready");
  }
  if (!pomodoroStatus.textContent.trim()) {
    pomodoroStatus.textContent = t("ready");
  }
}

function loadTheme() {
  const saved = localStorage.getItem("timerTrinkTheme");
  if (saved === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("timerTrinkTheme", isLight ? "light" : "dark");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll(".timer-quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setQuickTimer(
      clampNumber(btn.dataset.h),
      clampNumber(btn.dataset.m),
      clampNumber(btn.dataset.s)
    );
  });
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    pomodoroWork.value = clampNumber(btn.dataset.work);
    pomodoroBreak.value = clampNumber(btn.dataset.break);
    showToast(`${btn.dataset.work}/${btn.dataset.break} Pomodoro`);
  });
});

$("timerStartBtn").addEventListener("click", startTimer);
$("timerPauseBtn").addEventListener("click", pauseTimer);
$("timerResetBtn").addEventListener("click", resetTimer);

$("applyPomodoroBtn").addEventListener("click", applyPomodoro);

$("swStartBtn").addEventListener("click", () => {
  pauseOrHoldStopwatchStartButton();
  $("swStartBtn").textContent = stopwatchState.running ? t("pause") : t("start");
});
$("swLapBtn").addEventListener("click", lapStopwatch);
$("swResetBtn").addEventListener("click", () => {
  resetStopwatch();
  $("swStartBtn").textContent = t("start");
});

$("previewSoundBtn").addEventListener("click", playSelectedSound);

languageSelect.addEventListener("change", applyLanguage);
themeToggle.addEventListener("click", toggleTheme);

loadTheme();
renderSounds();
applyLanguage();
updateTimerDisplay();
stopwatchDisplay.textContent = "00:00:00.0";
timerStatus.textContent = t("ready");
pomodoroStatus.textContent = t("ready");
stopwatchStatus.textContent = t("ready");
