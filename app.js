const CapacitorLocalNotifications =
  window.Capacitor?.Plugins?.LocalNotifications || null;

async function notifyFinish() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.requestPermissions();

    await CapacitorLocalNotifications.schedule({
      notifications: [
        {
          title: "Timer Trink",
          body: "Time is up!",
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 500) }
        }
      ]
    });
  } catch (e) {
    console.log("notif error", e);
  }
}
// ===============================
// CORE HELPERS
// ===============================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ===============================
// GLOBAL APP STATE
// ===============================
const appState = {
  initialized: false,
  language: "en",
  theme: "dark",
  lastTab: "timerPanel"
};

// ===============================
// TIMER STATE
// ===============================
const timerState = {
  timerId: null,
  running: false,
  paused: false,
  timeLeft: 0,
  totalTime: 0,
  lastTick: 0
};

// ===============================
// STOPWATCH STATE
// ===============================
const stopwatchState = {
  intervalId: null,
  running: false,
  elapsedMs: 0,
  lastStart: 0,
  laps: []
};

// ===============================
// POMODORO STATE
// ===============================
const pomodoroState = {
  enabled: false,
  phase: "work", // work | break
  workMinutes: 25,
  breakMinutes: 5,
  cycleCount: 0
};

// ===============================
// ALARM STATE
// ===============================
const alarmState = {
  intervalId: null,
  active: false,
  audioContext: null,
  lastPlay: 0,
  pendingAction: null
};

// ===============================
// LANGUAGE SYSTEM (ADVANCED)
// ===============================
const supportedLanguages = [
  "tr","en","de","ru","zh","fr","es","ar","it","pt","ja","ko","hi","fa","uk","pl",
  "nl","sv","id","ms","vi","el","cs","ro","hu","bg","sr","hr","sk","sl","da","fi",
  "no","lt","lv","et","he","th","bn","ur","ta","te","ml","mr","gu","pa","sw","am","az","kk"
];

// ===============================
// BASE TRANSLATIONS (CORE KEYS)
// ===============================
const baseTranslations = {
  start: { tr:"Başlat", en:"Start" },
  pause: { tr:"Duraklat", en:"Pause" },
  reset: { tr:"Sıfırla", en:"Reset" },
  ready: { tr:"Hazır", en:"Ready" },
  running: { tr:"Çalışıyor", en:"Running" },
  paused: { tr:"Duraklatıldı", en:"Paused" },
  done: { tr:"Süre doldu!", en:"Time is up!" },
  preview: { tr:"Dinle", en:"Preview" },
  dismissAlarm: { tr:"Kapat", en:"Dismiss" },
  sounds: { tr:"ses", en:"sounds" },
  hours: { tr:"Saat", en:"Hours" },
  minutes: { tr:"Dakika", en:"Minutes" },
  seconds: { tr:"Saniye", en:"Seconds" },
  lap: { tr:"Tur", en:"Lap" },
  stopwatch: { tr:"Kronometre", en:"Stopwatch" },
  timer: { tr:"Zamanlayıcı", en:"Timer" },
  pomodoro: { tr:"Pomodoro", en:"Pomodoro" },
  soundOn: { tr:"Ses açık", en:"Sound on" },
  vibrationOn: { tr:"Titreşim açık", en:"Vibration on" },
  alarmTitle: { tr:"Süre doldu!", en:"Time is up!" },
  alarmMsg: { tr:"Alarm çalıyor", en:"Alarm ringing" }
};

// ===============================
// TRANSLATION CACHE
// ===============================
const translationCache = {};

// ===============================
// TRANSLATION ENGINE
// ===============================
function t(key) {
  const lang = $("language")?.value || appState.language || "en";

  if (!baseTranslations[key]) return key;

  if (translationCache[lang] && translationCache[lang][key]) {
    return translationCache[lang][key];
  }

  const val =
    baseTranslations[key][lang] ||
    baseTranslations[key]["en"] ||
    key;

  if (!translationCache[lang]) {
    translationCache[lang] = {};
  }

  translationCache[lang][key] = val;

  return val;
}

// ===============================
// SAFE DOM SETTER (CRASH FIX)
// ===============================
function setText(id, key) {
  const el = $(id);
  if (!el) return;
  el.textContent = t(key);
}

// ===============================
// LANGUAGE APPLY (FULL UPDATE)
// ===============================
function applyLanguage() {
  const lang = $("language")?.value || "en";
  appState.language = lang;

  document.documentElement.lang = lang;

  // tabs
  setText("tabTimer", "timer");
  setText("tabPomodoro", "pomodoro");
  setText("tabStopwatch", "stopwatch");
  setText("tabSounds", "sounds");

  // buttons
  setText("timerStartBtn", "start");
  setText("timerPauseBtn", "pause");
  setText("timerResetBtn", "reset");

  setText("swStartBtn", "start");
  setText("swLapBtn", "lap");
  setText("swResetBtn", "reset");

  setText("dismissAlarmBtn", "dismissAlarm");

  // labels
  setText("hoursLabel", "hours");
  setText("minutesLabel", "minutes");
  setText("secondsLabel", "seconds");

  setText("soundLabel", "soundOn");
  setText("vibrationLabel", "vibrationOn");

  // status
  setText("timerStatus", "ready");

  renderSounds();
}
// ===============================
// SOUND SYSTEM (ADVANCED ENGINE)
// ===============================

const sounds = [];
const SOUND_COUNT = 60;

// sesleri oluştur (dinamik)
for (let i = 1; i <= SOUND_COUNT; i++) {
  sounds.push({
    id: "s" + i,
    name: "Sound " + i,
    type: i % 3 === 0 ? "triangle" : i % 2 === 0 ? "square" : "sine",
    volume: 0.2,
    seq: [
      300 + i * 5,
      450 + i * 6,
      600 + i * 7
    ]
  });
}

// seçili ses
let selectedSoundId = "s1";

// ===============================
// AUDIO CONTEXT MANAGER
// ===============================
function getAudioContext() {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;

  if (!alarmState.audioContext) {
    alarmState.audioContext = new C();
  }

  // iOS / Android resume fix
  if (alarmState.audioContext.state === "suspended") {
    alarmState.audioContext.resume();
  }

  return alarmState.audioContext;
}

// ===============================
// SOUND PLAY ENGINE
// ===============================
function playSoundOnce(sound) {
  if (!sound) return;

  const soundEnabled = $("soundToggle")?.checked;
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime;

  sound.seq.forEach((freq, index) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = sound.type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(sound.volume, startTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = startTime + index * 0.18;

      osc.start(t);
      osc.stop(t + 0.15);

    } catch (e) {
      console.warn("Sound error:", e);
    }
  });
}

// ===============================
// SELECTED SOUND GETTER
// ===============================
function getSelectedSound() {
  return sounds.find(s => s.id === selectedSoundId) || sounds[0];
}

// ===============================
// ALARM LOOP ENGINE (STABLE)
// ===============================
function startAlarmLoop() {
  stopAlarmLoop();

  alarmState.active = true;

  const loopInterval = 1100;

  alarmState.intervalId = setInterval(() => {
    const now = Date.now();

    // overload koruma
    if (now - alarmState.lastPlay < 800) return;

    alarmState.lastPlay = now;

    playSoundOnce(getSelectedSound());

    // vibration
    if ($("vibrationToggle")?.checked && navigator.vibrate) {
      navigator.vibrate([250, 120, 250]);
    }

  }, loopInterval);
}

// ===============================
// STOP ALARM LOOP
// ===============================
function stopAlarmLoop() {
  if (alarmState.intervalId) {
    clearInterval(alarmState.intervalId);
    alarmState.intervalId = null;
  }

  alarmState.active = false;

  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
}

// ===============================
// SOUND PREVIEW (SAFE)
// ===============================
function previewSound(sound) {
  try {
    playSoundOnce(sound);
  } catch (e) {
    console.warn("Preview error:", e);
  }
}

// ===============================
// SOUND LABEL FORMATTER
// ===============================
function formatSoundName(name) {
  const lang = $("language")?.value || "en";

  if (lang === "tr") {
    return name.replace("Sound", "Ses");
  }

  return name;
}
// ===============================
// TIMER ENGINE (ADVANCED)
// ===============================

// zamanı formatla (HH:MM:SS)
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return [
    h.toString().padStart(2, "0"),
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0")
  ].join(":");
}

// ===============================
// DISPLAY UPDATE
// ===============================
function updateTimerDisplay() {
  const el = $("timerDisplay");
  if (!el) return;

  el.textContent = formatTime(timerState.timeLeft);

  updateTimerRing();
}

// ===============================
// RING UPDATE (PROGRESS)
// ===============================
function updateTimerRing() {
  const ring = $("timerRing");
  if (!ring) return;

  if (!timerState.totalTime) return;

  const percent =
    1 - (timerState.timeLeft / timerState.totalTime);

  const deg = percent * 360;

  ring.style.background =
    `conic-gradient(var(--primary) ${deg}deg, var(--secondary) ${deg}deg, var(--ring-rest) ${deg}deg)`;
}

// ===============================
// TIMER TICK (DRIFT FIX)
// ===============================
function timerTick() {
  if (!timerState.running) return;

  const now = Date.now();
  const delta = Math.floor((now - timerState.lastTick) / 1000);

  if (delta <= 0) return;

  timerState.lastTick = now;

  timerState.timeLeft -= delta;

  if (timerState.timeLeft <= 0) {
    timerState.timeLeft = 0;
    updateTimerDisplay();

    clearInterval(timerState.timerId);
    timerState.running = false;

    onTimerFinished();
    return;
  }

  updateTimerDisplay();
}

// ===============================
// TIMER START
// ===============================
function startTimer() {
  if (timerState.running) return;

  const h = +$("hours").value || 0;
  const m = +$("minutes").value || 0;
  const s = +$("seconds").value || 0;

  const total = h * 3600 + m * 60 + s;

  if (total <= 0) return;

  timerState.totalTime = total;
  timerState.timeLeft = total;

  timerState.running = true;
  timerState.paused = false;

  timerState.lastTick = Date.now();

  updateTimerDisplay();

  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
}

// ===============================
// TIMER PAUSE
// ===============================
function pauseTimer() {
  if (!timerState.running) return;

  clearInterval(timerState.timerId);
  timerState.running = false;
  timerState.paused = true;

  setText("timerStatus", "paused");
}

// ===============================
// TIMER RESUME
// ===============================
function resumeTimer() {
  if (!timerState.paused) return;

  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = Date.now();

  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
}

// ===============================
// TIMER RESET
// ===============================
function resetTimer() {
  clearInterval(timerState.timerId);

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;

  $("timerDisplay").textContent = "00:00:00";

  updateTimerRing();

  setText("timerStatus", "ready");
}

// ===============================
// TIMER FINISH HANDLER
// ===============================
function onTimerFinished() {
  startAlarmLoop();

  $("alarmTitle").textContent = t("alarmTitle");
  $("alarmMessage").textContent = t("alarmMsg");

  $("alarmOverlay").classList.remove("hidden");

  // Pomodoro otomatik geçiş
  if (pomodoroState.enabled) {
    handlePomodoroSwitch();
  }
}

// ===============================
// QUICK BUTTONS
// ===============================
function setupQuickButtons() {
  const buttons = $$(".quick-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      $("hours").value = btn.dataset.h;
      $("minutes").value = btn.dataset.m;
      $("seconds").value = btn.dataset.s;
    });
  });
}
// ===============================
// POMODORO ENGINE (FULL SYSTEM)
// ===============================

// ===============================
// APPLY POMODORO SETTINGS
// ===============================
function applyPomodoro() {
  const work = +$("pomodoroWork").value || 25;
  const brk = +$("pomodoroBreak").value || 5;

  if (work <= 0 || brk <= 0) return;

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;
  pomodoroState.cycleCount = 0;

  loadPomodoroPhase();

  setPomodoroStatus();
}

// ===============================
// LOAD CURRENT PHASE INTO TIMER
// ===============================
function loadPomodoroPhase() {
  let minutes = 0;

  if (pomodoroState.phase === "work") {
    minutes = pomodoroState.workMinutes;
  } else {
    minutes = pomodoroState.breakMinutes;
  }

  $("hours").value = 0;
  $("minutes").value = minutes;
  $("seconds").value = 0;

  updatePomodoroUI();
}

// ===============================
// SWITCH PHASE
// ===============================
function handlePomodoroSwitch() {
  if (!pomodoroState.enabled) return;

  if (pomodoroState.phase === "work") {
    pomodoroState.phase = "break";
  } else {
    pomodoroState.phase = "work";
    pomodoroState.cycleCount++;
  }

  loadPomodoroPhase();
  updatePomodoroUI();

  // otomatik başlatma
  setTimeout(() => {
    startTimer();
  }, 600);
}

// ===============================
// UPDATE UI (PHASE + TITLE)
// ===============================
function updatePomodoroUI() {
  const title = $("pomodoroTitle");

  if (!title) return;

  if (pomodoroState.phase === "work") {
    title.textContent = "🍅 " + t("pomodoro") + " - Work";
  } else {
    title.textContent = "☕ " + t("pomodoro") + " - Break";
  }
}

// ===============================
// STATUS TEXT
// ===============================
function setPomodoroStatus() {
  const el = $("pomodoroStatus");
  if (!el) return;

  const phase = pomodoroState.phase;
  const cycle = pomodoroState.cycleCount;

  el.textContent =
    (phase === "work" ? "Work" : "Break") +
    " • Cycle: " + cycle;
}

// ===============================
// PRESET BUTTONS
// ===============================
function setupPomodoroPresets() {
  const presets = $$(".preset-btn");

  presets.forEach(btn => {
    btn.addEventListener("click", () => {
      const w = btn.dataset.work;
      const b = btn.dataset.break;

      $("pomodoroWork").value = w;
      $("pomodoroBreak").value = b;
    });
  });
}

// ===============================
// DISABLE POMODORO
// ===============================
function disablePomodoro() {
  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  pomodoroState.cycleCount = 0;

  const el = $("pomodoroStatus");
  if (el) el.textContent = t("ready");
}

// ===============================
// AUTO STOP ON RESET
// ===============================
function onTimerResetPomodoro() {
  if (!pomodoroState.enabled) return;

  disablePomodoro();
}

// ===============================
// MANUAL SWITCH BUTTON (OPTIONAL)
// ===============================
function manualPomodoroSwitch() {
  if (!pomodoroState.enabled) return;

  handlePomodoroSwitch();
}

// ===============================
// GUARD: PREVENT CONFLICT
// ===============================
function ensurePomodoroConsistency() {
  if (!pomodoroState.enabled) return;

  if (timerState.running) return;

  // timer durduysa pomodoro da dursun
  disablePomodoro();
}
// ===============================
// STOPWATCH ENGINE (ADVANCED)
// ===============================

// ===============================
// FORMAT MS → HH:MM:SS.MS
// ===============================
function formatStopwatch(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const milliseconds = Math.floor((ms % 1000) / 100);

  return (
    hours.toString().padStart(2, "0") + ":" +
    minutes.toString().padStart(2, "0") + ":" +
    seconds.toString().padStart(2, "0") + "." +
    milliseconds
  );
}

// ===============================
// UPDATE DISPLAY
// ===============================
function updateStopwatchDisplay() {
  const el = $("stopwatchDisplay");
  if (!el) return;

  const current = stopwatchState.running
    ? stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;

  el.textContent = formatStopwatch(current);
}

// ===============================
// MAIN LOOP
// ===============================
function stopwatchTick() {
  if (!stopwatchState.running) return;
  updateStopwatchDisplay();
}

// ===============================
// START / PAUSE TOGGLE
// ===============================
function toggleStopwatch() {
  if (!stopwatchState.running) {
    // START
    stopwatchState.running = true;
    stopwatchState.lastStart = Date.now();

    stopwatchState.intervalId = setInterval(stopwatchTick, 50);

    setText("stopwatchStatus", "running");

  } else {
    // PAUSE
    stopwatchState.running = false;

    clearInterval(stopwatchState.intervalId);

    stopwatchState.elapsedMs += Date.now() - stopwatchState.lastStart;

    setText("stopwatchStatus", "paused");
  }
}

// ===============================
// RESET
// ===============================
function resetStopwatch() {
  clearInterval(stopwatchState.intervalId);

  stopwatchState.running = false;
  stopwatchState.elapsedMs = 0;
  stopwatchState.lastStart = 0;
  stopwatchState.laps = [];

  $("stopwatchDisplay").textContent = "00:00:00.0";

  renderLaps();

  setText("stopwatchStatus", "ready");
}

// ===============================
// ADD LAP
// ===============================
function addLap() {
  if (!stopwatchState.running) return;

  const currentTime = stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart);

  stopwatchState.laps.unshift(currentTime);

  renderLaps();
}

// ===============================
// RENDER LAPS (OPTIMIZED)
// ===============================
function renderLaps() {
  const list = $("lapsList");
  if (!list) return;

  list.innerHTML = "";

  stopwatchState.laps.forEach((lapTime, index) => {
    const row = document.createElement("div");
    row.className = "lap-row";

    const left = document.createElement("span");
    left.textContent = "#" + (index + 1);

    const right = document.createElement("span");
    right.textContent = formatStopwatch(lapTime);

    row.appendChild(left);
    row.appendChild(right);

    list.appendChild(row);
  });
}

// ===============================
// PERFORMANCE OPTIMIZATION
// ===============================
function limitLaps(max = 50) {
  if (stopwatchState.laps.length > max) {
    stopwatchState.laps = stopwatchState.laps.slice(0, max);
  }
}

// ===============================
// AUTO CLEANUP (MEMORY)
// ===============================
function cleanupStopwatch() {
  if (!stopwatchState.running) return;

  limitLaps(100);
}

// ===============================
// OPTIONAL: AUTO UPDATE LOOP
// ===============================
setInterval(() => {
  cleanupStopwatch();
}, 5000);
// ===============================
// SOUND LIST RENDER (ADVANCED UI)
// ===============================

function renderSounds() {
  const list = $("soundList");
  if (!list) return;

  list.innerHTML = "";

  const fragment = document.createDocumentFragment();

  sounds.forEach((sound, index) => {
    const item = document.createElement("label");
    item.className = "sound-item";

    // ===========================
    // RADIO
    // ===========================
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "alarmSound";
    radio.value = sound.id;

    radio.checked = sound.id === selectedSoundId;

    radio.addEventListener("change", () => {
      selectedSoundId = sound.id;
    });

    // ===========================
    // NAME
    // ===========================
    const name = document.createElement("span");
    name.textContent = formatSoundName(sound.name);

    // ===========================
    // PREVIEW BUTTON
    // ===========================
    const btn = document.createElement("button");
    btn.className = "mini-btn";
    btn.type = "button";
    btn.textContent = t("preview");

    btn.addEventListener("click", () => {
      selectedSoundId = sound.id;
      radio.checked = true;
      previewSound(sound);
    });

    // ===========================
    // APPEND
    // ===========================
    item.appendChild(radio);
    item.appendChild(name);
    item.appendChild(btn);

    fragment.appendChild(item);
  });

  list.appendChild(fragment);

  updateSoundCount();
}

// ===============================
// SOUND COUNT LABEL (DYNAMIC)
// ===============================
function updateSoundCount() {
  const el = $("soundCountLabel");
  if (!el) return;

  el.textContent = sounds.length + " " + t("sounds");
}

// ===============================
// SCROLL PERFORMANCE FIX
// ===============================
function optimizeSoundListScroll() {
  const list = $("soundList");
  if (!list) return;

  let ticking = false;

  list.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ===============================
// RESTORE SELECTED SOUND
// ===============================
function restoreSelectedSound() {
  const saved = localStorage.getItem("selectedSoundId");

  if (saved) {
    selectedSoundId = saved;
  }
}

// ===============================
// SAVE SELECTED SOUND
// ===============================
function persistSelectedSound() {
  localStorage.setItem("selectedSoundId", selectedSoundId);
}

// ===============================
// WATCH SELECTION CHANGE
// ===============================
function watchSoundSelection() {
  setInterval(() => {
    persistSelectedSound();
  }, 2000);
}

// ===============================
// SAFE INIT
// ===============================
function initSoundSystem() {
  restoreSelectedSound();
  renderSounds();
  optimizeSoundListScroll();
  watchSoundSelection();
}
// ===============================
// TAB SYSTEM (ADVANCED)
// ===============================

function switchTab(targetId) {
  const panels = $$(".panel");
  const tabs = $$(".tab-btn");

  panels.forEach(p => p.classList.remove("active"));
  tabs.forEach(t => t.classList.remove("active"));

  const targetPanel = $(targetId);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  const targetTab = document.querySelector(`[data-tab="${targetId}"]`);
  if (targetTab) {
    targetTab.classList.add("active");
  }

  appState.lastTab = targetId;
  persistAppState();
}

// ===============================
// TAB BUTTON EVENTS
// ===============================
function setupTabs() {
  const tabs = $$(".tab-btn");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

// ===============================
// RESTORE LAST TAB
// ===============================
function restoreLastTab() {
  const saved = localStorage.getItem("lastTab");

  if (saved) {
    switchTab(saved);
  }
}

// ===============================
// APP STATE SAVE
// ===============================
function persistAppState() {
  const data = {
    language: $("language")?.value || "en",
    theme: document.body.classList.contains("light") ? "light" : "dark",
    lastTab: appState.lastTab
  };

  localStorage.setItem("appState", JSON.stringify(data));
}

// ===============================
// APP STATE LOAD
// ===============================
function restoreAppState() {
  try {
    const raw = localStorage.getItem("appState");
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.language) {
      $("language").value = data.language;
      appState.language = data.language;
    }

    if (data.theme === "light") {
      document.body.classList.add("light");
    }

    if (data.lastTab) {
      appState.lastTab = data.lastTab;
    }

  } catch (e) {
    console.warn("State restore error:", e);
  }
}

// ===============================
// AUTO SAVE LOOP
// ===============================
function autoSaveState() {
  setInterval(() => {
    persistAppState();
  }, 3000);
}

// ===============================
// PANEL SAFE GUARD
// ===============================
function ensureValidPanel() {
  const panels = $$(".panel");
  let found = false;

  panels.forEach(p => {
    if (p.classList.contains("active")) {
      found = true;
    }
  });

  if (!found) {
    switchTab("timerPanel");
  }
}

// ===============================
// INIT TAB SYSTEM
// ===============================
function initTabs() {
  setupTabs();
  restoreLastTab();
  ensureValidPanel();
  autoSaveState();
}
// ===============================
// THEME SYSTEM (ADVANCED)
// ===============================

// mevcut tema al
function getCurrentTheme() {
  return document.body.classList.contains("light") ? "light" : "dark";
}

// tema uygula
function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }

  appState.theme = theme;
  persistAppState();
}

// tema toggle
function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === "light" ? "dark" : "light";

  applyTheme(next);
  updateThemeIcon();
}

// ikon güncelle
function updateThemeIcon() {
  const btn = $("themeToggle");
  if (!btn) return;

  const theme = getCurrentTheme();

  btn.textContent = theme === "light" ? "☀️" : "🌙";
}

// ===============================
// INIT THEME
// ===============================
function initTheme() {
  const saved = localStorage.getItem("appState");

  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.theme) {
        applyTheme(data.theme);
      }
    } catch (e) {
      console.warn("Theme load error:", e);
    }
  }

  updateThemeIcon();
}

// ===============================
// UI REFRESH (GLOBAL)
// ===============================
function refreshUI() {
  // dil yeniden uygula
  applyLanguage();

  // ses listesi yeniden çiz
  renderSounds();

  // stopwatch display güncelle
  updateStopwatchDisplay();

  // timer display güncelle
  updateTimerDisplay();
}

// ===============================
// RESIZE HANDLER (RESPONSIVE FIX)
// ===============================
function setupResizeHandler() {
  window.addEventListener("resize", () => {
    // ring redraw
    updateTimerRing();
  });
}

// ===============================
// VISIBILITY CHANGE (PERF FIX)
// ===============================
function setupVisibilityHandler() {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // geri gelince UI güncelle
      refreshUI();
    }
  });
}

// ===============================
// SAFE ANIMATION FRAME LOOP
// ===============================
function startUIRenderLoop() {
  function loop() {
    if (timerState.running) {
      updateTimerDisplay();
    }

    if (stopwatchState.running) {
      updateStopwatchDisplay();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// ===============================
// SAFE INIT UI SYSTEM
// ===============================
function initUISystem() {
  initTheme();
  setupResizeHandler();
  setupVisibilityHandler();
  startUIRenderLoop();
}
// ===============================
// SAFE EVENT BINDER
// ===============================
function bind(id, event, handler) {
  const el = $(id);
  if (!el) return;

  el.addEventListener(event, (e) => {
    try {
      handler(e);
    } catch (err) {
      console.error("Event error:", err);
    }
  });
}

// ===============================
// TIMER BUTTON EVENTS
// ===============================
function bindTimerControls() {
  bind("timerStartBtn", "click", () => {
    if (timerState.paused) {
      resumeTimer();
    } else {
      startTimer();
    }
  });

  bind("timerPauseBtn", "click", pauseTimer);
  bind("timerResetBtn", "click", () => {
    resetTimer();
    onTimerResetPomodoro();
  });
}

// ===============================
// POMODORO EVENTS
// ===============================
function bindPomodoroControls() {
  bind("applyPomodoroBtn", "click", applyPomodoro);
}

// ===============================
// STOPWATCH EVENTS
// ===============================
function bindStopwatchControls() {
  bind("swStartBtn", "click", toggleStopwatch);
  bind("swLapBtn", "click", addLap);
  bind("swResetBtn", "click", resetStopwatch);
}

// ===============================
// ALARM EVENTS
// ===============================
function bindAlarmControls() {
  bind("dismissAlarmBtn", "click", dismissAlarm);
}

// ===============================
// LANGUAGE EVENT
// ===============================
function bindLanguageControl() {
  bind("language", "change", () => {
    applyLanguage();
    persistAppState();
  });
}

// ===============================
// THEME EVENT
// ===============================
function bindThemeControl() {
  bind("themeToggle", "click", toggleTheme);
}

// ===============================
// INPUT VALIDATION
// ===============================
function bindInputsValidation() {
  ["hours", "minutes", "seconds"].forEach(id => {
    bind(id, "input", (e) => {
      const val = parseInt(e.target.value) || 0;

      if (val < 0) e.target.value = 0;
      if (val > 9999) e.target.value = 9999;
    });
  });
}

// ===============================
// GLOBAL CLICK GUARD
// ===============================
function setupGlobalGuards() {
  document.addEventListener("click", (e) => {
    try {
      // güvenlik için boş
    } catch (err) {
      console.warn("Global click error:", err);
    }
  });
}

// ===============================
// ERROR HANDLER (GLOBAL)
// ===============================
function setupErrorHandler() {
  window.addEventListener("error", (e) => {
    console.error("Global error:", e.message);
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.error("Promise error:", e.reason);
  });
}

// ===============================
// INIT EVENT SYSTEM
// ===============================
function initEvents() {
  bindTimerControls();
  bindPomodoroControls();
  bindStopwatchControls();
  bindAlarmControls();
  bindLanguageControl();
  bindThemeControl();
  bindInputsValidation();

  setupGlobalGuards();
  setupErrorHandler();
}
// ===============================
// STORAGE KEYS
// ===============================
const STORAGE_KEYS = {
  app: "tt_app_state",
  timer: "tt_timer_state",
  stopwatch: "tt_stopwatch_state",
  pomodoro: "tt_pomodoro_state",
  sound: "tt_sound"
};

// ===============================
// SAFE JSON PARSE
// ===============================
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// ===============================
// SAVE APP STATE
// ===============================
function saveAppState() {
  const data = {
    language: $("language")?.value || "en",
    theme: getCurrentTheme(),
    lastTab: appState.lastTab
  };

  localStorage.setItem(STORAGE_KEYS.app, JSON.stringify(data));
}

// ===============================
// LOAD APP STATE
// ===============================
function loadAppState() {
  const raw = localStorage.getItem(STORAGE_KEYS.app);
  const data = safeParse(raw);

  if (!data) return;

  if (data.language && $("language")) {
    $("language").value = data.language;
    appState.language = data.language;
  }

  if (data.theme) {
    applyTheme(data.theme);
  }

  if (data.lastTab) {
    appState.lastTab = data.lastTab;
  }
}

// ===============================
// SAVE TIMER
// ===============================
function saveTimerState() {
  const data = {
    timeLeft: timerState.timeLeft,
    totalTime: timerState.totalTime,
    running: timerState.running
  };

  localStorage.setItem(STORAGE_KEYS.timer, JSON.stringify(data));
}

// ===============================
// LOAD TIMER
// ===============================
function loadTimerState() {
  const raw = localStorage.getItem(STORAGE_KEYS.timer);
  const data = safeParse(raw);

  if (!data) return;

  timerState.timeLeft = data.timeLeft || 0;
  timerState.totalTime = data.totalTime || 0;

  if (data.running && timerState.timeLeft > 0) {
    startTimer();
  }

  updateTimerDisplay();
}

// ===============================
// SAVE STOPWATCH
// ===============================
function saveStopwatchState() {
  const data = {
    elapsedMs: stopwatchState.elapsedMs,
    laps: stopwatchState.laps
  };

  localStorage.setItem(STORAGE_KEYS.stopwatch, JSON.stringify(data));
}

// ===============================
// LOAD STOPWATCH
// ===============================
function loadStopwatchState() {
  const raw = localStorage.getItem(STORAGE_KEYS.stopwatch);
  const data = safeParse(raw);

  if (!data) return;

  stopwatchState.elapsedMs = data.elapsedMs || 0;
  stopwatchState.laps = data.laps || [];

  updateStopwatchDisplay();
  renderLaps();
}

// ===============================
// SAVE POMODORO
// ===============================
function savePomodoroState() {
  localStorage.setItem(STORAGE_KEYS.pomodoro, JSON.stringify(pomodoroState));
}

// ===============================
// LOAD POMODORO
// ===============================
function loadPomodoroState() {
  const raw = localStorage.getItem(STORAGE_KEYS.pomodoro);
  const data = safeParse(raw);

  if (!data) return;

  Object.assign(pomodoroState, data);
}

// ===============================
// SAVE SOUND
// ===============================
function saveSoundState() {
  localStorage.setItem(STORAGE_KEYS.sound, selectedSoundId);
}

// ===============================
// LOAD SOUND
// ===============================
function loadSoundState() {
  const saved = localStorage.getItem(STORAGE_KEYS.sound);
  if (saved) {
    selectedSoundId = saved;
  }
}

// ===============================
// AUTO SAVE LOOP
// ===============================
function startAutoSave() {
  setInterval(() => {
    saveAppState();
    saveTimerState();
    saveStopwatchState();
    savePomodoroState();
    saveSoundState();
  }, 3000);
}

// ===============================
// FULL RESTORE
// ===============================
function restoreAllState() {
  loadAppState();
  loadSoundState();
  loadPomodoroState();
  loadStopwatchState();
  loadTimerState();
}
// ===============================
// APP INITIALIZER (MASTER)
// ===============================

function initApp() {
  if (appState.initialized) return;

  try {
    console.log("🚀 App initializing...");

    // 1. STATE RESTORE
    restoreAllState();

    // 2. UI SYSTEM
    initUISystem();

    // 3. TAB SYSTEM
    initTabs();

    // 4. EVENT SYSTEM
    initEvents();

    // 5. SOUND SYSTEM
    initSoundSystem();

    // 6. POMODORO PRESETS
    setupPomodoroPresets();

    // 7. QUICK BUTTONS
    setupQuickButtons();

    // 8. LANGUAGE APPLY
    applyLanguage();

    // 9. TIMER DISPLAY FIX
    updateTimerDisplay();

    // 10. STOPWATCH DISPLAY FIX
    updateStopwatchDisplay();

    // 11. AUTO SAVE
    startAutoSave();

    // 12. SAFE GUARDS
    ensureValidPanel();

    appState.initialized = true;

    console.log("✅ App ready");

  } catch (err) {
    console.error("🔥 INIT ERROR:", err);
  }
}

// ===============================
// SAFE DOM READY
// ===============================
function onReady(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

// ===============================
// AUTO START
// ===============================
onReady(() => {
  initApp();
});

// ===============================
// FAILSAFE INIT (BACKUP)
// ===============================
setTimeout(() => {
  if (!appState.initialized) {
    console.warn("⚠️ Fallback init triggered");
    initApp();
  }
}, 1500);

// ===============================
// DEBUG HELPERS
// ===============================
function debugState() {
  console.log({
    appState,
    timerState,
    stopwatchState,
    pomodoroState,
    alarmState
  });
}

// ===============================
// MANUAL RESET (DEV TOOL)
// ===============================
function resetApp() {
  localStorage.clear();
  location.reload();
}

// ===============================
// SAFE INTERVAL CLEANUP
// ===============================
window.addEventListener("beforeunload", () => {
  clearInterval(timerState.timerId);
  clearInterval(stopwatchState.intervalId);
  clearInterval(alarmState.intervalId);
});

// ===============================
// MEMORY CLEANUP LOOP
// ===============================
setInterval(() => {
  if (!timerState.running && !stopwatchState.running) {
    // hafif temizlik
    if (alarmState.audioContext) {
      // gereksiz açık kalmasın
      if (alarmState.audioContext.state === "running") {
        alarmState.audioContext.suspend();
      }
    }
  }
}, 8000);
// ===============================
// EDGE CASE FIXES
// ===============================

// negatif zaman koruması
function sanitizeTimer() {
  if (timerState.timeLeft < 0) {
    timerState.timeLeft = 0;
  }
}

// input boşluk fix
function normalizeInputs() {
  ["hours","minutes","seconds"].forEach(id => {
    const el = $(id);
    if (!el) return;

    if (el.value === "" || isNaN(el.value)) {
      el.value = 0;
    }
  });
}

// ===============================
// PREVENT MULTIPLE INTERVALS
// ===============================
function safeSetInterval(fn, time, refKey) {
  if (refKey && refKey.current) {
    clearInterval(refKey.current);
  }

  const id = setInterval(fn, time);

  if (refKey) {
    refKey.current = id;
  }

  return id;
}

// ===============================
// SOUND FAILSAFE
// ===============================
function ensureAudioReady() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

// ===============================
// TOUCH FIX (MOBILE)
// ===============================
function setupTouchFix() {
  document.addEventListener("touchstart", () => {
    ensureAudioReady();
  }, { once: true });
}

// ===============================
// PERFORMANCE BOOST
// ===============================
function throttle(fn, limit = 100) {
  let last = 0;

  return function (...args) {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
}

// ===============================
// SAFE TIMER WRAP
// ===============================
function safeTimerStart() {
  normalizeInputs();
  sanitizeTimer();
  startTimer();
}

// ===============================
// SAFE STOPWATCH WRAP
// ===============================
function safeStopwatchStart() {
  try {
    toggleStopwatch();
  } catch (e) {
    console.warn("Stopwatch error:", e);
  }
}

// ===============================
// UI LOCK (ALARM ACTIVE)
// ===============================
function lockUIWhileAlarm() {
  if (!alarmState.active) return;

  document.body.classList.add("alarm-active");
}

// ===============================
// UNLOCK UI
// ===============================
function unlockUI() {
  document.body.classList.remove("alarm-active");
}

// ===============================
// ENHANCED DISMISS
// ===============================
function enhancedDismiss() {
  dismissAlarm();
  unlockUI();
}

// ===============================
// EXTRA EVENT PATCH
// ===============================
function patchEvents() {
  bind("timerStartBtn", "click", safeTimerStart);
  bind("swStartBtn", "click", safeStopwatchStart);
  bind("dismissAlarmBtn", "click", enhancedDismiss);
}

// ===============================
// AUTO RECOVERY LOOP
// ===============================
function startRecoveryLoop() {
  setInterval(() => {
    try {
      // alarm stuck fix
      if (alarmState.active && !alarmState.intervalId) {
        startAlarmLoop();
      }

      // timer stuck fix
      if (timerState.running && !timerState.timerId) {
        startTimer();
      }

    } catch (e) {
      console.warn("Recovery error:", e);
    }
  }, 5000);
}

// ===============================
// FINAL INIT PATCH
// ===============================
function finalizeApp() {
  setupTouchFix();
  patchEvents();
  startRecoveryLoop();
}

// ===============================
// FINAL CALL
// ===============================
setTimeout(() => {
  finalizeApp();
}, 1000);

// ===============================
// FINAL LOG
// ===============================
console.log("🔥 FULL PRO TIMER READY");
