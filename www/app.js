// ===============================
// CAPACITOR
// ===============================
const AlarmBridge = window.Capacitor?.Plugins?.AlarmBridge || null;

// ===============================
// HELPERS
// ===============================
const $ = (id) => document.getElementById(id);

function now() {
  return Date.now();
}

function format(sec) {
  sec = Math.max(0, Math.floor(sec || 0));

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
// STATE
// ===============================
let timer = {
  running: false,
  endAt: 0,
  interval: null
};

let alarmAudio = null;
let alarmActive = false;

// ===============================
// AUDIO (APP AÇIKKEN)
// ===============================
async function playAlarm() {
  stopAlarm();

  try {
    alarmAudio = new Audio("beep.mp3");
    alarmAudio.loop = true;
    alarmAudio.volume = 1;
    await alarmAudio.play();
    alarmActive = true;
  } catch {}
}

function stopAlarm() {
  alarmActive = false;

  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    alarmAudio = null;
  }
}

// ===============================
// OVERLAY
// ===============================
function showOverlay() {
  $("alarmOverlay")?.classList.remove("hidden");
}

function hideOverlay() {
  $("alarmOverlay")?.classList.add("hidden");
}

// ===============================
// NATIVE ALARM
// ===============================
async function setNativeAlarm(endAt) {
  if (!AlarmBridge) return;

  try {
    await AlarmBridge.scheduleAlarm({
      triggerAtMillis: endAt,
      title: "Süre doldu!",
      message: "Alarm çalıyor"
    });
  } catch (e) {
    console.log("Native alarm error", e);
  }
}

async function cancelNativeAlarm() {
  if (!AlarmBridge) return;

  try {
    await AlarmBridge.cancelAlarm();
  } catch {}
}

// ===============================
// TIMER CORE
// ===============================
function updateUI() {
  if (!timer.running) return;

  const left = Math.max(0, Math.ceil((timer.endAt - now()) / 1000));
  $("timerDisplay").textContent = format(left);

  if (left <= 0) {
    finishTimer();
  }
}

function startTimer() {
  if (timer.running) return;

  const h = Number($("hours").value);
  const m = Number($("minutes").value);
  const s = Number($("seconds").value);

  const total = h * 3600 + m * 60 + s;
  if (total <= 0) return;

  timer.endAt = now() + total * 1000;
  timer.running = true;

  $("timerDisplay").textContent = format(total);

  timer.interval = setInterval(updateUI, 500);

  setNativeAlarm(timer.endAt);
}

function finishTimer() {
  clearInterval(timer.interval);
  timer.interval = null;
  timer.running = false;

  $("timerDisplay").textContent = "00:00:00";

  // APP AÇIKSA SES ÇAL
  playAlarm();
  showOverlay();
}

function pauseTimer() {
  clearInterval(timer.interval);
  timer.running = false;

  cancelNativeAlarm();
}

function resetTimer() {
  clearInterval(timer.interval);

  timer.running = false;
  timer.endAt = 0;

  $("timerDisplay").textContent = "00:00:00";

  cancelNativeAlarm();
  stopAlarm();
  hideOverlay();
}

// ===============================
// EVENTS
// ===============================
function initEvents() {
  $("timerStartBtn").onclick = startTimer;
  $("timerPauseBtn").onclick = pauseTimer;
  $("timerResetBtn").onclick = resetTimer;

  $("dismissAlarmBtn").onclick = () => {
    stopAlarm();
    cancelNativeAlarm();
    hideOverlay();
  };
}

// ===============================
// FOREGROUND CHECK
// ===============================
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (!timer.running && timer.endAt > 0) {
      if (now() >= timer.endAt) {
        finishTimer();
      }
    }
  }
});

// ===============================
// INIT
// ===============================
function init() {
  $("timerDisplay").textContent = "00:00:00";
  initEvents();
}

document.addEventListener("DOMContentLoaded", init);
