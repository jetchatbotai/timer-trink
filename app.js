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
  phase: "work", // work | break
  workMinutes: 25,
  breakMinutes: 5,
  pendingResume: false
};

const alarmState = {
  intervalId: null,
  audioContext: null,
  active: false,
  pendingAction: null
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

const soundToggle = $("soundToggle");
const vibrationToggle = $("vibrationToggle");

const alarmOverlay = $("alarmOverlay");
const alarmTitle = $("alarmTitle");
const alarmMessage = $("alarmMessage");
const dismissAlarmBtn = $("dismissAlarmBtn");

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
    soundCount: "50 unique sounds",
    dismissAlarm: "Dismiss",
    alarmPlaying: "Alarm is ringing",
    focusFinished: "Focus session finished",
    breakFinished: "Break finished",
    workStatus: "Focus period",
    breakStatus: "Break period"
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
    soundCount: "50 farklı ses",
    dismissAlarm: "Kapat",
    alarmPlaying: "Alarm çalıyor",
    focusFinished: "Odak süresi bitti",
    breakFinished: "Mola bitti",
    workStatus: "Odak süresi",
    breakStatus: "Mola süresi"
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
    soundCount: "50 разных звуков",
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
    soundCount: "50 种不同声音",
    dismissAlarm: "关闭",
    alarmPlaying: "闹铃正在响",
    focusFinished: "专注时间结束",
    breakFinished: "休息结束",
    workStatus: "专注时间",
    breakStatus: "休息时间"
  }
};

const fallbackLanguageCodes = [
  "de","fr","es","ar","it","pt","ja","ko","hi","fa","uk","pl","nl","sv","id","ms","vi","el","cs",
  "ro","hu","bg","sr","hr","sk","sl","da","fi","no","lt","lv","et","he","th","bn","ur","ta","te",
  "ml","mr","gu","pa","sw","am","az","kk"
];

for (const code of fallbackLanguageCodes) {
  if (!baseTranslations[code]) {
    baseTranslations[code] = { ...baseTranslations.en };
  }
}

const uniqueSoundNames = [
  "Classic Bell",
  "Digital Beep",
  "Soft Tone",
  "Urgent Alarm",
  "Zen Chime",
  "Retro Clock",
  "Crystal Pulse",
  "Morning Ping",
  "Sharp Signal",
  "Focus Bell",
  "Forest Birds",
  "Rain Drift",
  "Ocean Drop",
  "Wind Whisper",
  "Stream Echo",
  "Night Crickets",
  "Temple Bowl",
  "Glass Ripple",
  "Sunrise Bloom",
  "Silver Pulse",
  "Deep Wood",
  "Water Pebble",
  "Thunder Mist",
  "Sky Harp",
  "Bamboo Air",
  "Cloud Bell",
  "River Light",
  "Aurora Tone",
  "Meadow Bird",
  "Cave Drop",
  "Moon Echo",
  "Leaf Rustle",
  "Stone Bell",
  "Snow Chime",
  "Fire Spark",
  "Dawn Chorus",
  "Blue Lake",
  "Amber Clock",
  "Lotus Tone",
  "Arctic Wind",
  "Velvet Pulse",
  "Copper Bell",
  "Misty Garden",
  "Night River",
  "Golden Ping",
  "Willow Drop",
  "Echo Reed",
  "Calm Tide",
  "Bright Signal",
  "Silent Grove"
];

function makeSequence(index) {
  const base = 320 + (index % 10) * 35;
  const family = Math.floor(index / 10);

  switch (family) {
    case 0:
      return { type: "square", pattern: [base + 300, base + 120, base + 300, base + 180], noteMs: 180, gapMs: 80 };
    case 1:
      return { type: "sine", pattern: [base, base + 60, base + 110, base + 170], noteMs: 220, gapMs: 90 };
    case 2:
      return { type: "triangle", pattern: [base + 40, base + 95, base + 160, base + 220], noteMs: 170, gapMs: 70 };
    case 3:
      return { type: "sawtooth", pattern: [base + 200, base + 150, base + 90, base + 240], noteMs: 150, gapMs: 60 };
    default:
      return { type: "sine", pattern: [base, base + 30, base + 80, base + 140, base + 200], noteMs: 200, gapMs: 85 };
  }
}

const SOUND_PRESETS = uniqueSoundNames.map((name, index) => ({
  id: `sound_${index + 1}`,
  name: `${index + 1}. ${name}`,
  ...makeSequence(index)
}));

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

  if (pomodoroState.enabled) {
    const wasWork = pomodoroState.phase === "work";
    startPersistentAlarm({
      title: wasWork ? t("focusFinished") : t("breakFinished"),
      message: t("alarmPlaying"),
      onDismiss: () => {
        if (wasWork) {
          pomodoroState.phase = "break";
          timerState.timeLeft = pomodoroState.breakMinutes * 60;
          timerState.totalTime = timerState.timeLeft;
          updateTimerDisplay();
          pomodoroStatus.textContent = `${t("breakStatus")} • ${pomodoroState.breakMinutes}m`;
        } else {
          pomodoroState.phase = "work";
          timerState.timeLeft = pomodoroState.workMinutes * 60;
          timerState.totalTime = timerState.timeLeft;
          updateTimerDisplay();
          pomodoroStatus.textContent = `${t("workStatus")} • ${pomodoroState.workMinutes}m`;
        }
        startTimerFromExisting();
      }
    });
    return;
  }

  timerStatus.textContent = t("done");
  startPersistentAlarm({
    title: t("done"),
    message: t("alarmPlaying"),
    onDismiss: () => {
      timerStatus.textContent = t("done");
    }
  });
}

function startTimerFromExisting() {
  stopTimerInternal();
  timerState.running = true;
  timerStatus.textContent = t("running");
  timerState.timerId = setInterval(timerTick, 1000);
}

function startTimer() {
  if (timerState.running) return;

  if (timerState.timeLeft <= 0) {
    const total = getTimerInputSeconds();
    if (total <= 0) {
      showToast(t("invalid"));
      return;
    }
    pomodoroState.enabled = false;
    timerState.timeLeft = total;
    timerState.totalTime = total;
    updateTimerDisplay();
  }

  startTimerFromExisting();
}

function pauseTimer() {
  stopTimerInternal();
  timerStatus.textContent = t("paused");
  if (pomodoroState.enabled) {
    pomodoroStatus.textContent = t("paused");
  }
}

function resetTimer() {
  stopTimerInternal();
  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  hoursInput.value = 0;
  minutesInput.value = 0;
  secondsInput.value = 0;
  updateTimerDisplay();
  timerStatus.textContent = t("reseted");
  pomodoroStatus.textContent = t("ready");
  stopPersistentAlarm();
}

function setQuickTimer(h, m, s) {
  stopTimerInternal();
  pomodoroState.enabled = false;
  hoursInput.value = h;
  minutesInput.value = m;
  secondsInput.value = s;
  timerState.timeLeft = h * 3600 + m * 60 + s;
  timerState.totalTime = timerState.timeLeft;
  updateTimerDisplay();
  timerStatus.textContent = t("ready");
  pomodoroStatus.textContent = t("ready");
}

function applyPomodoro() {
  const work = clampNumber(pomodoroWork.value);
  const brk = clampNumber(pomodoroBreak.value);

  if (work <= 0 || brk <= 0) {
    showToast(t("invalid"));
    return;
  }

  stopTimerInternal();
  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;

  hoursInput.value = 0;
  minutesInput.value = work;
  secondsInput.value = 0;

  timerState.timeLeft = work * 60;
  timerState.totalTime = timerState.timeLeft;
  updateTimerDisplay();

  pomodoroStatus.textContent = `${t("workStatus")} • ${work}m`;
  timerStatus.textContent = t("pomodoroApplied");
  showToast(t("pomodoroApplied"));
  switchTab("timerPanel");
}

function updateStopwatchDisplay() {
  const now = stopwatchState.running ? Date.now() : stopwatchState.lastStart;
  const base = stopwatchState.running
    ? stopwatchState.elapsedMs + (now - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;
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

function toggleStopwatchStartPause() {
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

function ensureAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!alarmState.audioContext) {
    alarmState.audioContext = new AudioCtx();
  }
  return alarmState.audioContext;
}

function playPresetOnce(preset) {
  if (!soundToggle.checked) return;

  const ctx = ensureAudioContext();
  if (!ctx) return;

  const startAt = ctx.currentTime + 0.01;
  preset.pattern.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteStart = startAt + index * ((preset.noteMs + preset.gapMs) / 1000);
    const noteEnd = noteStart + preset.noteMs / 1000;

    osc.type = preset.type;
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteEnd + 0.02);
  });
}

function playSelectedSound() {
  const preset = SOUND_PRESETS.find((s) => s.id === selectedSoundId) || SOUND_PRESETS[0];
  playPresetOnce(preset);
}

function startPersistentAlarm({ title, message, onDismiss }) {
  stopPersistentAlarm();

  alarmState.active = true;
  alarmState.pendingAction = onDismiss || null;

  alarmTitle.textContent = title;
  alarmMessage.textContent = message;
  dismissAlarmBtn.textContent = t("dismissAlarm");
  alarmOverlay.classList.remove("hidden");

  if (vibrationToggle.checked && "vibrate" in navigator) {
    navigator.vibrate([300, 150, 300, 150, 300, 150, 500]);
  }

  const preset = SOUND_PRESETS.find((s) => s.id === selectedSoundId) || SOUND_PRESETS[0];
  playPresetOnce(preset);
  alarmState.intervalId = setInterval(() => {
    playPresetOnce(preset);
    if (vibrationToggle.checked && "vibrate" in navigator) {
      navigator.vibrate([200, 120, 200, 120, 350]);
    }
  }, 1800);
}

function stopPersistentAlarm() {
  if (alarmState.intervalId) {
    clearInterval(alarmState.intervalId);
    alarmState.intervalId =
