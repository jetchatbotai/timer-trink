// ===============================
// CAPACITOR
// ===============================
const CapacitorLocalNotifications =
  window.Capacitor?.Plugins?.LocalNotifications || null;

const notificationState = {
  permissionGranted: false,
  scheduledTimerNotificationId: 1001
};

// ===============================
// HELPERS
// ===============================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ===============================
// APP STATE
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
  phase: "work",
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
  lastPlay: 0
};

// ===============================
// LANGUAGES
// ===============================
const supportedLanguages = [
  "tr","en","de","ru","zh","fr","es","ar","it","pt","ja","ko","hi","fa"
];

// ===============================
// TRANSLATIONS (FIXED)
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
  alarmMsg: { tr:"Alarm çalıyor", en:"Alarm ringing" },
  notifTimerTitle: { tr:"Timer", en:"Timer" },
  notifTimerBody: { tr:"Süre doldu", en:"Time is up" },
  work: { tr:"Çalışma", en:"Work" },
  break: { tr:"Mola", en:"Break" },
  cycle: { tr:"Döngü", en:"Cycle" }
};

// ===============================
// TRANSLATION ENGINE
// ===============================
function t(key) {
  const lang = $("language")?.value || appState.language || "en";

  return baseTranslations[key]?.[lang]
    || baseTranslations[key]?.en
    || key;
}

// ===============================
function setText(id, key) {
  const el = $(id);
  if (el) el.textContent = t(key);
}

// ===============================
function applyLanguage() {
  const lang = $("language")?.value || "en";
  appState.language = lang;

  setText("tabTimer", "timer");
  setText("tabPomodoro", "pomodoro");
  setText("tabStopwatch", "stopwatch");
  setText("tabSounds", "sounds");

  setText("timerStartBtn", "start");
  setText("timerPauseBtn", "pause");
  setText("timerResetBtn", "reset");

  setText("swStartBtn", "start");
  setText("swLapBtn", "lap");
  setText("swResetBtn", "reset");

  setText("dismissAlarmBtn", "dismissAlarm");

  setText("hoursLabel", "hours");
  setText("minutesLabel", "minutes");
  setText("secondsLabel", "seconds");

  setText("timerStatus", "ready");
}
// ===============================
// SOUND SYSTEM
// ===============================
const sounds = [];
const SOUND_COUNT = 60;
let selectedSoundId = "s1";

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

function formatSoundName(name) {
  const lang = $("language")?.value || appState.language || "en";
  return lang === "tr" ? name.replace("Sound", "Ses") : name;
}

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  if (!alarmState.audioContext) {
    alarmState.audioContext = new Ctx();
  }

  if (alarmState.audioContext.state === "suspended") {
    alarmState.audioContext.resume();
  }

  return alarmState.audioContext;
}

function playSoundOnce(sound) {
  if (!sound) return;
  if (!$("soundToggle")?.checked) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const baseTime = ctx.currentTime;

  sound.seq.forEach((freq, index) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = sound.type;
      osc.frequency.setValueAtTime(freq, baseTime);

      gain.gain.setValueAtTime(sound.volume, baseTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startAt = baseTime + index * 0.18;
      osc.start(startAt);
      osc.stop(startAt + 0.15);
    } catch (e) {
      console.warn("Sound error:", e);
    }
  });
}

function previewSound(sound) {
  try {
    playSoundOnce(sound);
  } catch (e) {
    console.warn("Preview error:", e);
  }
}

function getSelectedSound() {
  return sounds.find(s => s.id === selectedSoundId) || sounds[0];
}

function startAlarmLoop() {
  stopAlarmLoop();
  alarmState.active = true;

  alarmState.intervalId = setInterval(() => {
    const now = Date.now();
    if (now - alarmState.lastPlay < 800) return;

    alarmState.lastPlay = now;
    playSoundOnce(getSelectedSound());

    if ($("vibrationToggle")?.checked && navigator.vibrate) {
      navigator.vibrate([250, 120, 250]);
    }
  }, 1100);
}

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

function dismissAlarm() {
  stopAlarmLoop();

  const overlay = $("alarmOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }

  unlockUI();
}

function updateSoundCount() {
  const el = $("soundCountLabel");
  if (!el) return;
  el.textContent = sounds.length + " " + t("sounds");
}

function renderSounds() {
  const list = $("soundList");
  if (!list) return;

  list.innerHTML = "";
  const fragment = document.createDocumentFragment();

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
      saveSoundState();
    });

    const name = document.createElement("span");
    name.textContent = formatSoundName(sound.name);

    const btn = document.createElement("button");
    btn.className = "mini-btn";
    btn.type = "button";
    btn.textContent = t("preview");

    btn.addEventListener("click", () => {
      selectedSoundId = sound.id;
      radio.checked = true;
      saveSoundState();
      previewSound(sound);
    });

    item.appendChild(radio);
    item.appendChild(name);
    item.appendChild(btn);

    fragment.appendChild(item);
  });

  list.appendChild(fragment);
  updateSoundCount();
}

function restoreSelectedSound() {
  const saved = localStorage.getItem("selectedSoundId");
  if (saved) {
    selectedSoundId = saved;
  }
}

function persistSelectedSound() {
  localStorage.setItem("selectedSoundId", selectedSoundId);
}

function watchSoundSelection() {
  // seçim anlık kaydediliyor
}

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

function initSoundSystem() {
  restoreSelectedSound();
  renderSounds();
  optimizeSoundListScroll();
  watchSoundSelection();
}

// ===============================
// NOTIFICATIONS
// ===============================
async function requestNotificationPermission() {
  if (!CapacitorLocalNotifications) return false;

  try {
    const check = await CapacitorLocalNotifications.checkPermissions();

    if (check.display === "granted") {
      notificationState.permissionGranted = true;
      return true;
    }

    const req = await CapacitorLocalNotifications.requestPermissions();
    notificationState.permissionGranted = req.display === "granted";
    return notificationState.permissionGranted;
  } catch (e) {
    console.warn("Notification permission error:", e);
    return false;
  }
}

async function scheduleTimerNotification(secondsFromNow) {
  if (!CapacitorLocalNotifications) return;
  if (!secondsFromNow || secondsFromNow <= 0) return;

  try {
    await CapacitorLocalNotifications.cancel({
      notifications: [{ id: notificationState.scheduledTimerNotificationId }]
    });

    await CapacitorLocalNotifications.schedule({
      notifications: [
        {
          id: notificationState.scheduledTimerNotificationId,
          title: t("notifTimerTitle"),
          body: t("notifTimerBody"),
          schedule: {
            at: new Date(Date.now() + secondsFromNow * 1000)
          }
        }
      ]
    });
  } catch (e) {
    console.warn("Schedule notification error:", e);
  }
}

async function cancelTimerNotification() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.cancel({
      notifications: [{ id: notificationState.scheduledTimerNotificationId }]
    });
  } catch (e) {
    console.warn("Cancel notification error:", e);
  }
}

async function fireFinishNotification() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.schedule({
      notifications: [
        {
          id: Date.now() % 2147483000,
          title: t("notifTimerTitle"),
          body: t("notifTimerBody"),
          schedule: { at: new Date(Date.now() + 300) }
        }
      ]
    });
  } catch (e) {
    console.warn("Immediate finish notification error:", e);
  }
}

// ===============================
// TIMER ENGINE
// ===============================
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

function updateTimerRing() {
  const ring = $("timerRing");
  if (!ring) return;

  if (!timerState.totalTime || timerState.totalTime <= 0) {
    ring.style.background = "";
    return;
  }

  const percent = 1 - (timerState.timeLeft / timerState.totalTime);
  const deg = Math.max(0, Math.min(360, percent * 360));

  ring.style.background =
    `conic-gradient(var(--primary) ${deg}deg, var(--secondary) ${deg}deg, var(--ring-rest) ${deg}deg)`;
}

function updateTimerDisplay() {
  const el = $("timerDisplay");
  if (el) {
    el.textContent = formatTime(Math.max(0, timerState.timeLeft));
  }

  updateTimerRing();
}

function updateTimerStartButton() {
  const btn = $("timerStartBtn");
  if (!btn) return;

  if (timerState.running) {
    btn.textContent = t("running");
  } else {
    btn.textContent = t("start");
  }
}

function timerTick() {
  if (!timerState.running) return;

  const now = Date.now();
  const delta = Math.floor((now - timerState.lastTick) / 1000);

  if (delta <= 0) return;

  timerState.lastTick = now;
  timerState.timeLeft -= delta;

  if (timerState.timeLeft <= 0) {
    timerState.timeLeft = 0;
    timerState.running = false;

    clearInterval(timerState.timerId);
    timerState.timerId = null;

    updateTimerDisplay();
    setText("timerStatus", "done");
    updateTimerStartButton();

    onTimerFinished();
    return;
  }

  updateTimerDisplay();
}

function startTimer() {
  if (timerState.running) return;

  if (timerState.paused && timerState.timeLeft > 0) {
    resumeTimer();
    return;
  }

  const h = +$("hours")?.value || 0;
  const m = +$("minutes")?.value || 0;
  const s = +$("seconds")?.value || 0;
  const total = h * 3600 + m * 60 + s;

  if (total <= 0) return;

  clearInterval(timerState.timerId);

  timerState.totalTime = total;
  timerState.timeLeft = total;
  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = Date.now();

  updateTimerDisplay();

  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();

  requestNotificationPermission().then(() => {
    scheduleTimerNotification(total);
  });
}

function pauseTimer() {
  if (!timerState.running) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
  timerState.paused = true;

  cancelTimerNotification();

  setText("timerStatus", "paused");
  updateTimerStartButton();
}

function resumeTimer() {
  if (!timerState.paused && timerState.timeLeft <= 0) return;

  clearInterval(timerState.timerId);

  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = Date.now();

  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  updateTimerDisplay();

  scheduleTimerNotification(timerState.timeLeft);
}

function resetTimer() {
  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.lastTick = 0;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  const display = $("timerDisplay");
  if (display) {
    display.textContent = "00:00:00";
  }

  updateTimerRing();
  cancelTimerNotification();

  setText("timerStatus", "ready");
  updateTimerStartButton();
}

function onTimerFinished() {
  cancelTimerNotification();
  fireFinishNotification();

  startAlarmLoop();

  const titleEl = $("alarmTitle");
  const msgEl = $("alarmMessage");
  const overlay = $("alarmOverlay");

  if (titleEl) titleEl.textContent = t("alarmTitle");
  if (msgEl) msgEl.textContent = t("alarmMsg");
  if (overlay) overlay.classList.remove("hidden");

  lockUIWhileAlarm();
  updateTimerStartButton();

  if (pomodoroState.enabled) {
    handlePomodoroSwitch();
  }
}

function setupQuickButtons() {
  const buttons = $$(".quick-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if ($("hours")) $("hours").value = btn.dataset.h || 0;
      if ($("minutes")) $("minutes").value = btn.dataset.m || 0;
      if ($("seconds")) $("seconds").value = btn.dataset.s || 0;
    });
  });
}
// ===============================
// POMODORO ENGINE
// ===============================
function applyPomodoro() {
  const work = +$("pomodoroWork")?.value || 25;
  const brk = +$("pomodoroBreak")?.value || 5;

  if (work <= 0 || brk <= 0) return;

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;
  pomodoroState.cycleCount = 0;

  loadPomodoroPhase();
  setPomodoroStatus();
}

function loadPomodoroPhase() {
  let minutes = 0;

  if (pomodoroState.phase === "work") {
    minutes = pomodoroState.workMinutes;
  } else {
    minutes = pomodoroState.breakMinutes;
  }

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = minutes;
  if ($("seconds")) $("seconds").value = 0;

  updatePomodoroUI();
}

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

  setTimeout(() => {
    startTimer();
  }, 600);
}

function updatePomodoroUI() {
  const title = $("pomodoroTitle");
  if (!title) return;

  if (pomodoroState.phase === "work") {
    title.textContent = "🍅 " + t("pomodoro") + " - " + t("work");
  } else {
    title.textContent = "☕ " + t("pomodoro") + " - " + t("break");
  }

  setPomodoroStatus();
}

function setPomodoroStatus() {
  const el = $("pomodoroStatus");
  if (!el) return;

  const phaseText = pomodoroState.phase === "work" ? t("work") : t("break");
  const cycle = pomodoroState.cycleCount;

  el.textContent = phaseText + " • " + t("cycle") + ": " + cycle;
}

function setupPomodoroPresets() {
  const presets = $$(".preset-btn");

  presets.forEach(btn => {
    btn.addEventListener("click", () => {
      if ($("pomodoroWork")) $("pomodoroWork").value = btn.dataset.work || 25;
      if ($("pomodoroBreak")) $("pomodoroBreak").value = btn.dataset.break || 5;
    });
  });
}

function disablePomodoro() {
  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  pomodoroState.cycleCount = 0;

  const el = $("pomodoroStatus");
  if (el) el.textContent = t("ready");

  updatePomodoroUI();
}

function onTimerResetPomodoro() {
  if (!pomodoroState.enabled) return;
  disablePomodoro();
}

function manualPomodoroSwitch() {
  if (!pomodoroState.enabled) return;
  handlePomodoroSwitch();
}

function ensurePomodoroConsistency() {
  if (!pomodoroState.enabled) return;
  if (timerState.running) return;
}

// ===============================
// STOPWATCH ENGINE
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

function updateStopwatchDisplay() {
  const el = $("stopwatchDisplay");
  if (!el) return;

  const current = stopwatchState.running
    ? stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;

  el.textContent = formatStopwatch(current);
}

function updateStopwatchStartButton() {
  const btn = $("swStartBtn");
  if (!btn) return;

  btn.textContent = stopwatchState.running ? t("pause") : t("start");
}

function stopwatchTick() {
  if (!stopwatchState.running) return;
  updateStopwatchDisplay();
}

function toggleStopwatch() {
  if (!stopwatchState.running) {
    stopwatchState.running = true;
    stopwatchState.lastStart = Date.now();

    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = setInterval(stopwatchTick, 50);

    setText("stopwatchStatus", "running");
  } else {
    stopwatchState.running = false;

    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = null;

    stopwatchState.elapsedMs += Date.now() - stopwatchState.lastStart;

    setText("stopwatchStatus", "paused");
  }

  updateStopwatchStartButton();
}

function resetStopwatch() {
  clearInterval(stopwatchState.intervalId);
  stopwatchState.intervalId = null;

  stopwatchState.running = false;
  stopwatchState.elapsedMs = 0;
  stopwatchState.lastStart = 0;
  stopwatchState.laps = [];

  const display = $("stopwatchDisplay");
  if (display) display.textContent = "00:00:00.0";

  renderLaps();

  setText("stopwatchStatus", "ready");
  updateStopwatchStartButton();
}

function addLap() {
  if (!stopwatchState.running) return;

  const currentTime =
    stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart);

  stopwatchState.laps.unshift(currentTime);
  limitLaps(100);
  renderLaps();
}

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

function limitLaps(max = 50) {
  if (stopwatchState.laps.length > max) {
    stopwatchState.laps = stopwatchState.laps.slice(0, max);
  }
}

function cleanupStopwatch() {
  if (!stopwatchState.running) return;
  limitLaps(100);
}

setInterval(() => {
  cleanupStopwatch();
}, 5000);

// ===============================
// TAB SYSTEM
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

function setupTabs() {
  const tabs = $$(".tab-btn");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

function restoreLastTab() {
  const saved = localStorage.getItem("lastTab");
  if (saved) {
    switchTab(saved);
  }
}

function persistAppState() {
  const data = {
    language: $("language")?.value || "en",
    theme: document.body.classList.contains("light") ? "light" : "dark",
    lastTab: appState.lastTab
  };

  localStorage.setItem("appState", JSON.stringify(data));
}

function restoreAppState() {
  try {
    const raw = localStorage.getItem("appState");
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.language && $("language")) {
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

function autoSaveState() {
  setInterval(() => {
    persistAppState();
  }, 3000);
}

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

function initTabs() {
  setupTabs();
  restoreLastTab();
  ensureValidPanel();
  autoSaveState();
}
// ===============================
// STORAGE SYSTEM
// ===============================
const STORAGE_KEYS = {
  app: "tt_app_state",
  timer: "tt_timer_state",
  stopwatch: "tt_stopwatch_state",
  pomodoro: "tt_pomodoro_state",
  sound: "tt_sound"
};

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// ===============================
// SAVE / LOAD
// ===============================
function saveAppState() {
  const data = {
    language: $("language")?.value || "en",
    theme: document.body.classList.contains("light") ? "light" : "dark",
    lastTab: appState.lastTab
  };

  localStorage.setItem(STORAGE_KEYS.app, JSON.stringify(data));
}

function loadAppState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.app));
  if (!data) return;

  if (data.language && $("language")) {
    $("language").value = data.language;
    appState.language = data.language;
  }

  if (data.theme === "light") {
    document.body.classList.add("light");
  }

  if (data.lastTab) {
    appState.lastTab = data.lastTab;
  }
}

function saveTimerState() {
  const data = {
    timeLeft: timerState.timeLeft,
    totalTime: timerState.totalTime,
    running: timerState.running,
    paused: timerState.paused
  };

  localStorage.setItem(STORAGE_KEYS.timer, JSON.stringify(data));
}

function loadTimerState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.timer));
  if (!data) return;

  timerState.timeLeft = data.timeLeft || 0;
  timerState.totalTime = data.totalTime || 0;
  timerState.running = false;
  timerState.paused = data.timeLeft > 0;

  updateTimerDisplay();

  if (timerState.timeLeft > 0) {
    setText("timerStatus", "paused");
  } else {
    setText("timerStatus", "ready");
  }
}

function saveStopwatchState() {
  localStorage.setItem(STORAGE_KEYS.stopwatch, JSON.stringify({
    elapsedMs: stopwatchState.elapsedMs,
    laps: stopwatchState.laps
  }));
}

function loadStopwatchState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.stopwatch));
  if (!data) return;

  stopwatchState.elapsedMs = data.elapsedMs || 0;
  stopwatchState.laps = data.laps || [];

  updateStopwatchDisplay();
  renderLaps();
}

function savePomodoroState() {
  localStorage.setItem(STORAGE_KEYS.pomodoro, JSON.stringify(pomodoroState));
}

function loadPomodoroState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.pomodoro));
  if (!data) return;

  Object.assign(pomodoroState, data);
}

function saveSoundState() {
  localStorage.setItem(STORAGE_KEYS.sound, selectedSoundId);
}

function loadSoundState() {
  const saved = localStorage.getItem(STORAGE_KEYS.sound);
  if (saved) selectedSoundId = saved;
}

function restoreAllState() {
  loadAppState();
  loadSoundState();
  loadPomodoroState();
  loadStopwatchState();
  loadTimerState();
}

// ===============================
// EVENTS
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

function initEvents() {
  bind("timerStartBtn", "click", startTimer);
  bind("timerPauseBtn", "click", pauseTimer);
  bind("timerResetBtn", "click", () => {
    resetTimer();
    onTimerResetPomodoro();
  });

  bind("applyPomodoroBtn", "click", applyPomodoro);

  bind("swStartBtn", "click", toggleStopwatch);
  bind("swLapBtn", "click", addLap);
  bind("swResetBtn", "click", resetStopwatch);

  bind("dismissAlarmBtn", "click", dismissAlarm);

  bind("language", "change", applyLanguage);

  bind("themeToggle", "click", toggleTheme);
}

// ===============================
// THEME
// ===============================
function toggleTheme() {
  document.body.classList.toggle("light");
  saveAppState();
}

// ===============================
// UI SYSTEM
// ===============================
function refreshUI() {
  applyLanguage();
  renderSounds();
  updateTimerDisplay();
  updateStopwatchDisplay();
}

function startUIRenderLoop() {
  function loop() {
    if (timerState.running) updateTimerDisplay();
    if (stopwatchState.running) updateStopwatchDisplay();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// ===============================
// FINAL INIT
// ===============================
function initApp() {
  if (appState.initialized) return;

  try {
    console.log("🚀 INIT");

    restoreAllState();

    initTabs();
    initEvents();
    initSoundSystem();

    setupPomodoroPresets();
    setupQuickButtons();

    applyLanguage();

    updateTimerDisplay();
    updateStopwatchDisplay();
    updateTimerStartButton();
    updateStopwatchStartButton();
    updatePomodoroUI();

    startUIRenderLoop();

    setInterval(() => {
      saveAppState();
      saveTimerState();
      saveStopwatchState();
      savePomodoroState();
      saveSoundState();
    }, 3000);

    appState.initialized = true;

    console.log("✅ READY");

  } catch (err) {
    console.error("INIT ERROR:", err);
  }
}

// ===============================
function onReady(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

onReady(initApp);

// ===============================
console.log("🔥 APP FULLY READY");
// ===============================
// ALARM UI LOCK
// ===============================
function lockUIWhileAlarm() {
  document.body.classList.add("alarm-active");
}

function unlockUI() {
  document.body.classList.remove("alarm-active");
}
