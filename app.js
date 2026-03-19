const $ = (id) => document.getElementById(id);

const state = {
  timerId: null,
  running: false,
  timeLeft: 0,
  totalTime: 0
};

const display = $("display");
const ring = $("ring");
const hoursInput = $("hours");
const minutesInput = $("minutes");
const secondsInput = $("seconds");
const languageSelect = $("language");
const themeToggle = $("themeToggle");
const statusEl = $("status");
const pomodoroStatus = $("pomodoroStatus");
const toastEl = $("toast");

const translations = {
  en: {
    subtitle: "Simple timer for focus and daily use",
    timer: "Timer",
    pomodoro: "Pomodoro",
    sounds: "Sounds",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    soundOn: "Sound on",
    vibrationOn: "Vibration on",
    ready: "Ready",
    paused: "Paused",
    running: "Timer is running",
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
    preview: "Preview sound"
  },
  tr: {
    subtitle: "Odak ve günlük kullanım için basit zamanlayıcı",
    timer: "Timer",
    pomodoro: "Pomodoro",
    sounds: "Sesler",
    start: "Başlat",
    pause: "Duraklat",
    reset: "Sıfırla",
    soundOn: "Ses açık",
    vibrationOn: "Titreşim açık",
    ready: "Hazır",
    paused: "Duraklatıldı",
    running: "Zamanlayıcı çalışıyor",
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
    preview: "Sesi dinle"
  },
  ru: {
    subtitle: "Простой таймер для фокуса и повседневного использования",
    timer: "Таймер",
    pomodoro: "Помодоро",
    sounds: "Звуки",
    start: "Старт",
    pause: "Пауза",
    reset: "Сброс",
    soundOn: "Звук включён",
    vibrationOn: "Вибрация включена",
    ready: "Готово",
    paused: "На паузе",
    running: "Таймер работает",
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
    preview: "Прослушать"
  },
  zh: {
    subtitle: "适合专注和日常使用的简洁计时器",
    timer: "计时器",
    pomodoro: "番茄钟",
    sounds: "声音",
    start: "开始",
    pause: "暂停",
    reset: "重置",
    soundOn: "声音开启",
    vibrationOn: "震动开启",
    ready: "准备就绪",
    paused: "已暂停",
    running: "计时器运行中",
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
    preview: "试听声音"
  }
};

const allLanguages = [
  "de","fr","es","ar","it","pt","ja","ko","hi","fa","uk","pl","nl","sv","id","ms","vi","el",
  "cs","ro","hu","bg","sr","hr","sk","sl","da","fi","no","lt","lv","et","he","th","bn","ur",
  "ta","te","ml","mr","gu","pa","sw","am","az","kk"
];

for (const code of allLanguages) {
  if (!translations[code]) translations[code] = { ...translations.en };
}

function t(key) {
  const lang = languageSelect.value || "en";
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2500);
}

function clampNumber(value) {
  const n = parseInt(value || "0", 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function getInputSeconds() {
  const h = clampNumber(hoursInput.value);
  const m = clampNumber(minutesInput.value);
  const s = clampNumber(secondsInput.value);
  return h * 3600 + m * 60 + s;
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateDisplay() {
  display.textContent = formatTime(state.timeLeft);
  updateRing();
}

function updateRing() {
  if (state.totalTime <= 0) {
    ring.style.background = "conic-gradient(var(--primary) 0deg, var(--secondary) 180deg, var(--ring-rest) 180deg)";
    return;
  }
  const progress = state.timeLeft / state.totalTime;
  const deg = Math.max(0, Math.min(360, progress * 360));
  ring.style.background = `conic-gradient(var(--primary) 0deg, var(--secondary) ${deg}deg, var(--ring-rest) ${deg}deg)`;
}

function stopTimerInternal() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  state.running = false;
}

function tick() {
  if (state.timeLeft > 0) {
    state.timeLeft -= 1;
    updateDisplay();
    return;
  }
  stopTimerInternal();
  playSelectedSound();
  vibratePhone();
  document.querySelector(".panel.active")?.classList.add("flash");
  setTimeout(() => document.querySelector(".panel.active")?.classList.remove("flash"), 1800);
  statusEl.textContent = t("done");
  showToast(t("done"));
}

function startTimer() {
  if (state.running) return;

  if (state.timeLeft <= 0) {
    const total = getInputSeconds();
    if (total <= 0) {
      showToast(t("invalid"));
      return;
    }
    state.timeLeft = total;
    state.totalTime = total;
    updateDisplay();
  }

  state.running = true;
  statusEl.textContent = t("running");
  stopTimerInternal();
  state.running = true;
  state.timerId = setInterval(tick, 1000);
}

function pauseTimer() {
  stopTimerInternal();
  statusEl.textContent = t("paused");
  pomodoroStatus.textContent = t("paused");
}

function resetTimer() {
  stopTimerInternal();
  state.timeLeft = 0;
  state.totalTime = 0;
  hoursInput.value = 0;
  minutesInput.value = 0;
  secondsInput.value = 0;
  updateDisplay();
  statusEl.textContent = t("reseted");
  pomodoroStatus.textContent = t("reseted");
}

function setQuickTime(h, m, s) {
  stopTimerInternal();
  hoursInput.value = h;
  minutesInput.value = m;
  secondsInput.value = s;
  state.timeLeft = h * 3600 + m * 60 + s;
  state.totalTime = state.timeLeft;
  updateDisplay();
  statusEl.textContent = t("ready");
}

function applyPomodoro() {
  const work = clampNumber($("pomodoroWork").value);
  const brk = clampNumber($("pomodoroBreak").value);

  if (work <= 0 || brk <= 0) {
    showToast(t("invalid"));
    return;
  }

  stopTimerInternal();
  hoursInput.value = 0;
  minutesInput.value = work;
  secondsInput.value = 0;
  state.timeLeft = work * 60;
  state.totalTime = state.timeLeft;
  updateDisplay();
  pomodoroStatus.textContent = `${t("work")}: ${work}m / ${t("break")}: ${brk}m`;
  statusEl.textContent = t("pomodoroApplied");
  showToast(t("pomodoroApplied"));
  switchTab("timerPanel");
}

function getSelectedSound() {
  const selected = document.querySelector('input[name="alarmSound"]:checked');
  return selected ? selected.value : "classic";
}

function playToneSequence(sequence, type) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();

  sequence.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.22);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.22);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + index * 0.22 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.22 + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.22);
    osc.stop(ctx.currentTime + index * 0.22 + 0.19);
  });
}

function playSelectedSound() {
  if (!$("soundToggle").checked) return;

  const sound = getSelectedSound();
  switch (sound) {
    case "digital":
      playToneSequence([900, 900, 900, 900], "square");
      break;
    case "soft":
      playToneSequence([440, 554, 659], "sine");
      break;
    case "urgent":
      playToneSequence([1000, 800, 1000, 800, 1000], "square");
      break;
    case "zen":
      playToneSequence([523, 659, 784], "sine");
      break;
    case "retro":
      playToneSequence([660, 550, 440, 660], "triangle");
      break;
    default:
      playToneSequence([880, 660, 880], "square");
  }
}

function vibratePhone() {
  if (!$("vibrationToggle").checked) return;
  if ("vibrate" in navigator) {
    navigator.vibrate([220, 100, 220, 100, 360]);
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

function applyLanguage() {
  document.documentElement.lang = languageSelect.value || "en";
  document.documentElement.dir = ["ar", "fa", "ur", "he"].includes(languageSelect.value) ? "rtl" : "ltr";

  $("subtitle").textContent = t("subtitle");
  $("tabTimer").textContent = t("timer");
  $("tabPomodoro").textContent = t("pomodoro");
  $("tabSounds").textContent = t("sounds");
  $("startBtn").textContent = t("start");
  $("pauseBtn").textContent = t("pause");
  $("resetBtn").textContent = t("reset");
  $("soundLabel").textContent = t("soundOn");
  $("vibrationLabel").textContent = t("vibrationOn");
  $("hoursLabel").textContent = t("hours");
  $("minutesLabel").textContent = t("minutes");
  $("secondsLabel").textContent = t("seconds");
  $("pomodoroTitle").textContent = t("pomodoroTitle");
  $("pomodoroDesc").textContent = t("pomodoroDesc");
  $("workLabel").textContent = t("work");
  $("breakLabel").textContent = t("break");
  $("applyPomodoroBtn").textContent = t("applyPomodoro");
  $("soundsTitle").textContent = t("soundsTitle");
  $("soundsDesc").textContent = t("soundsDesc");
  $("previewSoundBtn").textContent = t("preview");

  if (!state.running && state.timeLeft === 0) {
    statusEl.textContent = t("ready");
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

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll(".quick-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setQuickTime(
      clampNumber(btn.dataset.h),
      clampNumber(btn.dataset.m),
      clampNumber(btn.dataset.s)
    );
  });
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $("pomodoroWork").value = clampNumber(btn.dataset.work);
    $("pomodoroBreak").value = clampNumber(btn.dataset.break);
    showToast(`${btn.dataset.work}/${btn.dataset.break} Pomodoro`);
  });
});

$("startBtn").addEventListener("click", startTimer);
$("pauseBtn").addEventListener("click", pauseTimer);
$("resetBtn").addEventListener("click", resetTimer);
$("applyPomodoroBtn").addEventListener("click", applyPomodoro);
$("previewSoundBtn").addEventListener("click", playSelectedSound);
languageSelect.addEventListener("change", applyLanguage);
themeToggle.addEventListener("click", toggleTheme);

loadTheme();
applyLanguage();
updateDisplay();
statusEl.textContent = t("ready");
pomodoroStatus.textContent = t("ready");
