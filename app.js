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

const pomodoroState = {
  enabled: false,
  phase: "work",
  workMinutes: 25,
  breakMinutes: 5
};

const alarmState = {
  intervalId: null,
  active: false,
  pendingAction: null,
  audioContext: null
};

const translations = {
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
    soundCount: "20 ses",
    dismissAlarm: "Kapat",
    alarmPlaying: "Alarm çalıyor",
    focusFinished: "Odak süresi bitti",
    breakFinished: "Mola bitti",
    workStatus: "Odak süresi",
    breakStatus: "Mola süresi"
  },
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
    soundCount: "20 sounds",
    dismissAlarm: "Dismiss",
    alarmPlaying: "Alarm is ringing",
    focusFinished: "Focus session finished",
    breakFinished: "Break finished",
    workStatus: "Focus period",
    breakStatus: "Break period"
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
    soundCount: "20 Töne",
    dismissAlarm: "Schließen",
    alarmPlaying: "Alarm läuft",
    focusFinished: "Fokuszeit beendet",
    breakFinished: "Pause beendet",
    workStatus: "Fokuszeit",
    breakStatus: "Pausenzeit"
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
    soundCount: "20 звуков",
    dismissAlarm: "Закрыть",
    alarmPlaying: "Будильник звонит",
    focusFinished: "Сеанс фокуса завершён",
    breakFinished: "Перерыв завершён",
    workStatus: "Фокус",
    breakStatus: "Перерыв"
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
    soundCount: "20 种声音",
    dismissAlarm: "关闭",
    alarmPlaying: "闹铃正在响",
    focusFinished: "专注时间结束",
    breakFinished: "休息结束",
    workStatus: "专注时间",
    breakStatus: "休息时间"
  }
};

const fallbackCodes = [
  "fr","es","ar","it","pt","ja","ko","hi","fa","uk","pl","nl","sv","id","ms","vi","el","cs",
  "ro","hu","bg","sr","hr","sk","sl","da","fi","no","lt","lv","et","he","th","bn","ur","ta","te",
  "ml","mr","gu","pa","sw","am","az","kk"
];
for (const code of fallbackCodes) {
  translations[code] = { ...translations.en };
}

const sounds = [
  { id: "s1", name: "Classic Bell", type: "square", seq: [880, 660, 880] },
  { id: "s2", name: "Digital Beep", type: "square", seq: [900, 900, 800, 900] },
  { id: "s3", name: "Soft Tone", type: "sine", seq: [440, 554, 659] },
  { id: "s4", name: "Urgent Alarm", type: "square", seq: [1000, 850, 1000, 850] },
  { id: "s5", name: "Zen Chime", type: "sine", seq: [523, 659, 784] },
  { id: "s6", name: "Retro Clock", type: "triangle", seq: [660, 550, 440] },
  { id: "s7", name: "Crystal Pulse", type: "triangle", seq: [720, 840, 980] },
  { id: "s8", name: "Morning Ping", type: "sine", seq: [610, 760, 910] },
  { id: "s9", name: "Sharp Signal", type: "square", seq: [1100, 980, 1100] },
  { id: "s10", name: "Focus Bell", type: "triangle", seq: [700, 820, 700] },
  { id: "s11", name: "Forest Birds", type: "sine", seq: [1200, 1400, 1100, 1500] },
  { id: "s12", name: "Rain Drift", type: "triangle", seq: [420, 390, 430, 380] },
  { id: "s13", name: "Ocean Drop", type: "sine", seq: [310, 470, 350] },
  { id: "s14", name: "Wind Whisper", type: "triangle", seq: [500, 620, 540, 680] },
  { id: "s15", name: "Stream Echo", type: "sine", seq: [460, 520, 610, 530] },
  { id: "s16", name: "Night Crickets", type: "square", seq: [1800, 1600, 1750, 1550] },
  { id: "s17", name: "Temple Bowl", type: "sine", seq: [330, 440, 550] },
  { id: "s18", name: "Glass Ripple", type: "triangle", seq: [760, 920, 860] },
  { id: "s19", name: "Sunrise Bloom", type: "sine", seq: [500, 620, 780] },
  { id: "s20", name: "Silver Pulse", type: "square", seq: [950, 700, 950] }
];

let selectedSoundId = sounds[0].id;

const languageSelect = $("language");
const themeToggle = $("themeToggle");
const timerDisplay = $("timerDisplay");
const timerRing = $("timerRing");
const timerStatus = $("timerStatus");
const pomodoroStatus = $("pomodoroStatus");
const stopwatchDisplay = $("stopwatchDisplay");
const stopwatchStatus = $("stopwatchStatus");
const soundList = $("soundList");
const toastEl = $("toast");
const alarmOverlay = $("alarmOverlay");
const alarmTitle = $("alarmTitle");
const alarmMessage = $("alarmMessage");
const dismissAlarmBtn = $("dismissAlarmBtn");
const lapsList = $("lapsList");

function t(key) {
  const lang = languageSelect?.value || "en";
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

function showToast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(showToast._id);
  showToast._id = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function formatTimer(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatStopwatch(ms) {
  const tenths = Math.floor(ms / 100);
  const h = Math.floor(tenths / 36000);
  const m = Math.floor((tenths % 36000) / 600);
  const s = Math.floor((tenths % 600) / 10);
  const d = tenths % 10;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
}

function timerInputSeconds() {
  return (
    (parseInt($("hours")?.value || "0", 10) || 0) * 3600 +
    (parseInt($("minutes")?.value || "0", 10) || 0) * 60 +
    (parseInt($("seconds")?.value || "0", 10) || 0)
  );
}

function updateTimerRing() {
  if (!timerRing) return;
  if (timerState.totalTime <= 0) {
    timerRing.style.background = "conic-gradient(var(--primary) 0deg, var(--secondary) 180deg, var(--ring-rest) 180deg)";
    return;
  }
  const deg = Math.max(0, Math.min(360, (timerState.timeLeft / timerState.totalTime) * 360));
  timerRing.style.background = `conic-gradient(var(--primary) 0deg, var(--secondary) ${deg}deg, var(--ring-rest) ${deg}deg)`;
}

function updateTimerDisplay() {
  if (timerDisplay) timerDisplay.textContent = formatTimer(timerState.timeLeft);
  updateTimerRing();
}

function stopTimerInternal() {
  if (timerState.timerId) clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!alarmState.audioContext) alarmState.audioContext = new AudioContextClass();
  return alarmState.audioContext;
}

function playSoundOnce(sound) {
  if (!$("soundToggle")?.checked) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const startBase = ctx.currentTime + 0.01;
  sound.seq.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = startBase + i * 0.18;
    const end = start + 0.14;

    osc.type = sound.type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.01);
  });
}

function selectedSound() {
  return sounds.find(s => s.id === selectedSoundId) || sounds[0];
}

function stopAlarm() {
  if (alarmState.intervalId) clearInterval(alarmState.intervalId);
  alarmState.intervalId = null;
  alarmState.active = false;
  if (alarmOverlay) alarmOverlay.classList.add("hidden");
  if ("vibrate" in navigator) navigator.vibrate(0);
}

function startAlarm(title, message, onDismiss) {
  stopAlarm();
  alarmState.active = true;
  alarmState.pendingAction = onDismiss || null;

  if (alarmTitle) alarmTitle.textContent = title;
  if (alarmMessage) alarmMessage.textContent = message;
  if (dismissAlarmBtn) dismissAlarmBtn.textContent = t("dismissAlarm");
  if (alarmOverlay) alarmOverlay.classList.remove("hidden");

  const s = selectedSound();
  playSoundOnce(s);
  if ($("vibrationToggle")?.checked && "vibrate" in navigator) {
    navigator.vibrate([300, 150, 300, 150, 500]);
  }

  alarmState.intervalId = setInterval(() => {
    playSoundOnce(s);
    if ($("vibrationToggle")?.checked && "vibrate" in navigator) {
      navigator.vibrate([220, 120, 220, 120, 350]);
    }
  }, 1800);
}

function dismissAlarm() {
  const fn = alarmState.pendingAction;
  alarmState.pendingAction = null;
  stopAlarm();
  if (typeof fn === "function") fn();
}

function startTimerLoop() {
  stopTimerInternal();
  timerState.running = true;
  if (timerStatus) timerStatus.textContent = t("running");
  timerState.timerId = setInterval(() => {
    if (timerState.timeLeft > 0) {
      timerState.timeLeft -= 1;
      updateTimerDisplay();
      return;
    }

    stopTimerInternal();

    if (pomodoroState.enabled) {
      const wasWork = pomodoroState.phase === "work";
      startAlarm(
        wasWork ? t("focusFinished") : t("breakFinished"),
        t("alarmPlaying"),
        () => {
          if (wasWork) {
            pomodoroState.phase = "break";
            timerState.timeLeft = pomodoroState.breakMinutes * 60;
            timerState.totalTime = timerState.timeLeft;
            if (pomodoroStatus) pomodoroStatus.textContent = `${t("breakStatus")} • ${pomodoroState.breakMinutes}m`;
          } else {
            pomodoroState.phase = "work";
            timerState.timeLeft = pomodoroState.workMinutes * 60;
            timerState.totalTime = timerState.timeLeft;
            if (pomodoroStatus) pomodoroStatus.textContent = `${t("workStatus")} • ${pomodoroState.workMinutes}m`;
          }
          updateTimerDisplay();
          startTimerLoop();
        }
      );
      return;
    }

    if (timerStatus) timerStatus.textContent = t("done");
    startAlarm(t("done"), t("alarmPlaying"));
  }, 1000);
}

function startTimer() {
  if (timerState.running) return;

  if (timerState.timeLeft <= 0) {
    const total = timerInputSeconds();
    if (total <= 0) {
      showToast(t("invalid"));
      return;
    }
    pomodoroState.enabled = false;
    timerState.timeLeft = total;
    timerState.totalTime = total;
    updateTimerDisplay();
  }

  startTimerLoop();
}

function pauseTimer() {
  stopTimerInternal();
  if (timerStatus) timerStatus.textContent = t("paused");
}

function resetTimer() {
  stopTimerInternal();
  stopAlarm();
  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;
  updateTimerDisplay();
  if (timerStatus) timerStatus.textContent = t("ready");
  if (pomodoroStatus) pomodoroStatus.textContent = t("ready");
}

function applyPomodoro() {
  const work = parseInt($("pomodoroWork")?.value || "0", 10) || 0;
  const brk = parseInt($("pomodoroBreak")?.value || "0", 10) || 0;

  if (work <= 0 || brk <= 0) {
    showToast(t("invalid"));
    return;
  }

  stopTimerInternal();
  stopAlarm();

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = work;
  if ($("seconds")) $("seconds").value = 0;

  timerState.timeLeft = work * 60;
  timerState.totalTime = timerState.timeLeft;
  updateTimerDisplay();

  if (timerStatus) timerStatus.textContent = t("pomodoroApplied");
  if (pomodoroStatus) pomodoroStatus.textContent = `${t("workStatus")} • ${work}m`;
  showToast(t("pomodoroApplied"));
  switchTab("timerPanel");
}

function updateStopwatchDisplay() {
  if (!stopwatchDisplay) return;
  const current = stopwatchState.running
    ? stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;
  stopwatchDisplay.textContent = formatStopwatch(current);
}

function toggleStopwatch() {
  if (!stopwatchState.running) {
    stopwatchState.running = true;
    stopwatchState.lastStart = Date.now();
    stopwatchState.intervalId = setInterval(updateStopwatchDisplay, 100);
    if (stopwatchStatus) stopwatchStatus.textContent = t("stopwatchRunning");
  } else {
    stopwatchState.elapsedMs += Date.now() - stopwatchState.lastStart;
    stopwatchState.running = false;
    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = null;
    if (stopwatchStatus) stopwatchStatus.textContent = t("paused");
  }
  if ($("swStartBtn")) $("swStartBtn").textContent = stopwatchState.running ? t("pause") : t("start");
}

function resetStopwatch() {
  if (stopwatchState.intervalId) clearInterval(stopwatchState.intervalId);
  stopwatchState.intervalId = null;
  stopwatchState.running = false;
  stopwatchState.elapsedMs = 0;
  stopwatchState.lastStart = 0;
  stopwatchState.laps = [];
  if (stopwatchDisplay) stopwatchDisplay.textContent = "00:00:00.0";
  if (stopwatchStatus) stopwatchStatus.textContent = t("ready");
  if ($("swStartBtn")) $("swStartBtn").textContent = t("start");
  renderLaps();
}

function addLap() {
  if (!stopwatchDisplay) return;
  stopwatchState.laps.unshift(stopwatchDisplay.textContent);
  renderLaps();
}

function renderLaps() {
  if (!lapsList) return;
  lapsList.innerHTML = "";
  stopwatchState.laps.forEach((lap, i) => {
    const row = document.createElement("div");
    row.className = "lap-row";
    row.innerHTML = `<span>#${stopwatchState.laps.length - i}</span><span>${lap}</span>`;
    lapsList.appendChild(row);
  });
}

function renderSounds() {
  if (!soundList) return;
  soundList.innerHTML = "";

  sounds.forEach((sound) => {
    const item = document.createElement("label");
    item.className = "sound-item";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "alarmSound";
    radio.value = sound.id;
    radio.checked = sound.id === selectedSoundId;
    radio.addEventListener("change", () => {
      selectedSoundId = sound.id;
    });

    const name = document.createElement("span");
    name.textContent = sound.name;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-btn";
    btn.textContent = "▶";
    btn.addEventListener("click", () => {
      selectedSoundId = sound.id;
      radio.checked = true;
      playSoundOnce(sound);
    });

    item.appendChild(radio);
    item.appendChild(name);
    item.appendChild(btn);

    soundList.appendChild(item);
  });
}

function applyLanguage() {
  const lang = languageSelect?.value || "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = ["ar", "fa", "ur", "he"].includes(lang) ? "rtl" : "ltr";

  const map = {
    subtitle: "subtitle",
    tabTimer: "timer",
    tabPomodoro: "pomodoro",
    tabStopwatch: "stopwatch",
    tabSounds: "sounds",
    hoursLabel: "hours",
    minutesLabel: "minutes",
    secondsLabel: "seconds",
    timerStartBtn: "start",
    timerPauseBtn: "pause",
    timerResetBtn: "reset",
    soundLabel: "soundOn",
    vibrationLabel: "vibrationOn",
    pomodoroTitle: "pomodoroTitle",
    pomodoroDesc: "pomodoroDesc",
    workLabel: "work",
    breakLabel: "break",
    applyPomodoroBtn: "applyPomodoro",
    swLapBtn: "lap",
    swResetBtn: "reset",
    soundsTitle: "soundsTitle",
    soundsDesc: "soundsDesc",
    previewSoundBtn: "preview",
    lapsTitle: "laps",
    soundCountLabel: "soundCount",
    dismissAlarmBtn: "dismissAlarm"
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = $(id);
    if (el) el.textContent = t(key);
  });

  if ($("swStartBtn")) $("swStartBtn").textContent = stopwatchState.running ? t("pause") : t("start");

  if (!timerState.running && timerState.timeLeft === 0 && timerStatus) timerStatus.textContent = t("ready");
  if (!stopwatchState.running && stopwatchState.elapsedMs === 0 && stopwatchStatus) stopwatchStatus.textContent = t("ready");
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function loadTheme() {
  const saved = localStorage.getItem("timerTrinkTheme");
  if (saved === "light") {
    document.body.classList.add("light");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  if (themeToggle) themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("timerTrinkTheme", isLight ? "light" : "dark");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    pomodoroState.enabled = false;
    stopTimerInternal();
    if ($("hours")) $("hours").value = btn.dataset.h;
    if ($("minutes")) $("minutes").value = btn.dataset.m;
    if ($("seconds")) $("seconds").value = btn.dataset.s;
    timerState.timeLeft = timerInputSeconds();
    timerState.totalTime = timerState.timeLeft;
    updateTimerDisplay();
    if (timerStatus) timerStatus.textContent = t("ready");
  });
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if ($("pomodoroWork")) $("pomodoroWork").value = btn.dataset.work;
    if ($("pomodoroBreak")) $("pomodoroBreak").value = btn.dataset.break;
  });
});

$("timerStartBtn")?.addEventListener("click", startTimer);
$("timerPauseBtn")?.addEventListener("click", pauseTimer);
$("timerResetBtn")?.addEventListener("click", resetTimer);
$("applyPomodoroBtn")?.addEventListener("click", applyPomodoro);
$("swStartBtn")?.addEventListener("click", toggleStopwatch);
$("swLapBtn")?.addEventListener("click", addLap);
$("swResetBtn")?.addEventListener("click", resetStopwatch);
$("previewSoundBtn")?.addEventListener("click", () => playSoundOnce(selectedSound()));
dismissAlarmBtn?.addEventListener("click", dismissAlarm);
themeToggle?.addEventListener("click", toggleTheme);
languageSelect?.addEventListener("change", applyLanguage);

loadTheme();
renderSounds();
applyLanguage();
updateTimerDisplay();
if (stopwatchDisplay) stopwatchDisplay.textContent = "00:00:00.0";
if (timerStatus) timerStatus.textContent = t("ready");
if (pomodoroStatus) pomodoroStatus.textContent = t("ready");
if (stopwatchStatus) stopwatchStatus.textContent = t("ready");
