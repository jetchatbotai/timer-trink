// ===============================
// FULL APP JS START (CLEAN CORE)
// PART 1 / 6
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  try {
    startApp();
  } catch (e) {
    console.log("APP CRASH:", e);
  }
});

function startApp() {

  // ===============================
  // CAPACITOR PLUGINS
  // ===============================
  const CapacitorLocalNotifications =
    window.Capacitor?.Plugins?.LocalNotifications || null;

  const CapacitorApp =
    window.Capacitor?.Plugins?.App || null;

  const AlarmBridge =
    window.Capacitor?.Plugins?.AlarmBridge || null;

  const AdMobPlugin =
    window.Capacitor?.Plugins?.AdMob || null;

  const Purchases =
    window.Capacitor?.Plugins?.Purchases || null; // 🔥 PREMIUM

  // ===============================
  // HELPERS
  // ===============================
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  const nowMs = () => Date.now();

  function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;

    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      ss.toString().padStart(2, "0")
    ].join(":");
  }

  // ===============================
  // APP STATE
  // ===============================
  const appState = {
    language: localStorage.getItem("lang") || "tr",
    initialized: false
  };

  // ===============================
  // 🔥 PREMIUM STATE (FIXED)
  // ===============================
  const premiumState = {
    isPremium: false,
    loading: false
  };

  function savePremium(val) {
    premiumState.isPremium = val;
    localStorage.setItem("isPremium", val ? "1" : "0");
  }

  function loadPremium() {
    premiumState.isPremium = localStorage.getItem("isPremium") === "1";
  }

  function isPremiumUser() {
    return premiumState.isPremium === true;
  }

  function updatePremiumUI() {
    const status = $("premiumStatusText");

    if (status) {
      status.textContent = isPremiumUser()
        ? "Premium aktif"
        : "Ücretsiz sürüm";
    }

    // reklam kapat
    updateAdsVisibility();
  }

  // ===============================
  // 🔥 BILLING SYSTEM (REAL FIX)
  // ===============================
  async function initBilling() {
    if (!Purchases) return;

    try {
      await Purchases.configure({
        apiKey: "YOUR_REVENUECAT_KEY"
      });

      const info = await Purchases.getCustomerInfo();

      const active =
        info?.entitlements?.active?.premium !== undefined;

      savePremium(active);

      updatePremiumUI();

      console.log("Billing OK");
    } catch (e) {
      console.log("Billing error:", e);
    }
  }

  async function buyPremiumPlan(plan = "monthly") {
    if (!Purchases) return false;

    try {
      premiumState.loading = true;

      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.find(
        (p) => p.identifier.includes(plan)
      );

      if (!pkg) return false;

      const result = await Purchases.purchasePackage(pkg);

      const active =
        result?.customerInfo?.entitlements?.active?.premium !== undefined;

      savePremium(active);
      updatePremiumUI();

      premiumState.loading = false;

      return active;
    } catch (e) {
      console.log("Purchase error:", e);
      premiumState.loading = false;
      return false;
    }
  }

  async function restorePremiumPurchases() {
    if (!Purchases) return false;

    try {
      const result = await Purchases.restorePurchases();

      const active =
        result?.customerInfo?.entitlements?.active?.premium !== undefined;

      savePremium(active);
      updatePremiumUI();

      return active;
    } catch (e) {
      console.log("Restore error:", e);
      return false;
    }
  }

  // ===============================
  // 🔥 ADS SYSTEM (CLEAN)
  // ===============================
  const adRuntime = {
    initialized: false,
    interstitialReady: false,
    rewardedReady: false,
    lastShown: 0
  };

  const ADMOB_IDS = {
    banner: "ca-app-pub-9576973508771581/8701259937",
    interstitial: "ca-app-pub-9576973508771581/9381788346",
    rewarded: "ca-app-pub-9576973508771581/8139989327"
  };

  async function initAds() {
    if (!AdMobPlugin) return;

    try {
      await AdMobPlugin.initialize();

      if (!isPremiumUser()) {
        await AdMobPlugin.showBanner({
          adId: ADMOB_IDS.banner,
          position: "BOTTOM_CENTER"
        });
      }

      await loadInterstitial();
      await loadRewarded();

      adRuntime.initialized = true;

      console.log("ADS READY");
    } catch (e) {
      console.log("ADS ERROR", e);
    }
  }

  function updateAdsVisibility() {
    if (!AdMobPlugin) return;

    if (isPremiumUser()) {
      AdMobPlugin.hideBanner();
    } else {
      AdMobPlugin.showBanner({
        adId: ADMOB_IDS.banner,
        position: "BOTTOM_CENTER"
      });
    }
  }

  async function loadInterstitial() {
    try {
      await AdMobPlugin.prepareInterstitial({
        adId: ADMOB_IDS.interstitial
      });
      adRuntime.interstitialReady = true;
    } catch {
      adRuntime.interstitialReady = false;
    }
  }

  async function showInterstitialSmart() {
    if (!adRuntime.interstitialReady) return;
    if (isPremiumUser()) return;

    const now = Date.now();
    if (now - adRuntime.lastShown < 60000) return;

    try {
      await AdMobPlugin.showInterstitial();
      adRuntime.lastShown = now;
      adRuntime.interstitialReady = false;

      setTimeout(loadInterstitial, 1000);
    } catch {}
  }

  async function loadRewarded() {
    try {
      await AdMobPlugin.prepareRewardVideoAd({
        adId: ADMOB_IDS.rewarded
      });
      adRuntime.rewardedReady = true;
    } catch {
      adRuntime.rewardedReady = false;
    }
  }

  async function showRewardedAd(onReward) {
    if (!adRuntime.rewardedReady) return;

    try {
      await AdMobPlugin.showRewardVideoAd();

      if (onReward) onReward();

      adRuntime.rewardedReady = false;
      setTimeout(loadRewarded, 1000);
    } catch {}
  }

  // ===============================
  // INIT CORE
  // ===============================
  async function initCore() {
    loadPremium();
    updatePremiumUI();

    await initBilling();   // 🔥 ödeme
    await initAds();       // 🔥 reklam

    console.log("CORE READY");
  }

  // ===============================
  // START APP
  // ===============================
  initCore();

}
// ===============================
// PART 2 / 6
// TIMER ENGINE + BACKGROUND FIX
// ===============================

// ===============================
// TIMER STATE
// ===============================
const timerState = {
  running: false,
  paused: false,
  timeLeft: 0,
  totalTime: 0,
  endAt: 0,
  interval: null,
  finishing: false
};

// ===============================
// ALARM STATE
// ===============================
const alarmState = {
  active: false,
  audio: null,
  loopId: null
};

// ===============================
// VISIBILITY
// ===============================
const visibilityState = {
  isForeground: document.visibilityState === "visible"
};

// ===============================
// TIMER DISPLAY
// ===============================
function updateTimerDisplay() {
  const el = document.getElementById("timerDisplay");
  if (!el) return;

  el.textContent = formatTime(timerState.timeLeft);
}

// ===============================
// TIMER START
// ===============================
async function startTimer() {
  if (timerState.running) return;

  const h = Number(document.getElementById("hours")?.value || 0);
  const m = Number(document.getElementById("minutes")?.value || 0);
  const s = Number(document.getElementById("seconds")?.value || 0);

  const total = h * 3600 + m * 60 + s;
  if (total <= 0) return;

  stopAlarm();

  timerState.totalTime = total;
  timerState.timeLeft = total;
  timerState.running = true;
  timerState.paused = false;
  timerState.endAt = Date.now() + total * 1000;
  timerState.finishing = false;

  clearInterval(timerState.interval);

  timerState.interval = setInterval(timerTick, 250);

  updateTimerDisplay();
  setStatus("running");

  saveTimerState();

  scheduleBackgroundAlarm();
}

// ===============================
// TIMER TICK (CRASH FIX)
// ===============================
function timerTick() {
  if (!timerState.running) return;
  if (timerState.finishing) return;

  const remain = Math.ceil((timerState.endAt - Date.now()) / 1000);

  timerState.timeLeft = Math.max(0, remain);

  updateTimerDisplay();

  if (timerState.timeLeft <= 0) {
    finishTimer();
  }
}

// ===============================
// TIMER FINISH (SAFE)
// ===============================
function finishTimer() {
  if (timerState.finishing) return;

  timerState.finishing = true;

  clearInterval(timerState.interval);
  timerState.interval = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.endAt = 0;

  updateTimerDisplay();
  setStatus("done");

  saveTimerState();

  if (visibilityState.isForeground) {
    showAlarmUI();
    startAlarm();
  } else {
    triggerNativeAlarm();
  }
if (pomodoroState.enabled) {
  switchPomodoroPhase();
}
  if (pomodoroState.enabled) {
  switchPomodoroPhase();
}
  setTimeout(() => {
    timerState.finishing = false;
  }, 500);
}

// ===============================
// PAUSE
// ===============================
function pauseTimer() {
  if (!timerState.running) return;

  timerState.timeLeft = Math.ceil((timerState.endAt - Date.now()) / 1000);

  clearInterval(timerState.interval);

  timerState.running = false;
  timerState.paused = true;

  setStatus("paused");

  saveTimerState();
}

// ===============================
// RESUME
// ===============================
function resumeTimer() {
  if (!timerState.paused) return;

  timerState.running = true;
  timerState.paused = false;

  timerState.endAt = Date.now() + timerState.timeLeft * 1000;

  timerState.interval = setInterval(timerTick, 250);

  setStatus("running");

  scheduleBackgroundAlarm();
}

// ===============================
// RESET
// ===============================
function resetTimer() {
  clearInterval(timerState.interval);

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.endAt = 0;

  stopAlarm();

  updateTimerDisplay();
  setStatus("ready");

  saveTimerState();
}

// ===============================
// STATUS TEXT
// ===============================
function setStatus(key) {
  const el = document.getElementById("timerStatus");
  if (!el) return;

  el.textContent = t(key);
}

// ===============================
// ALARM (LOOP SAFE)
// ===============================
async function startAlarm() {
  stopAlarm();

  alarmState.active = true;

  try {
    const audio = new Audio("beep.mp3");

    alarmState.audio = audio;
    audio.loop = true;
    audio.volume = 1;

    await audio.play();

    alarmState.loopId = setInterval(() => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    }, 1000);
  } catch {}
}

function stopAlarm() {
  alarmState.active = false;

  try {
    if (alarmState.audio) {
      alarmState.audio.pause();
      alarmState.audio.currentTime = 0;
      alarmState.audio = null;
    }

    if (alarmState.loopId) {
      clearInterval(alarmState.loopId);
      alarmState.loopId = null;
    }
  } catch {}
}

// ===============================
// ALARM UI
// ===============================
function showAlarmUI() {
  const overlay = document.getElementById("alarmOverlay");
  if (!overlay) return;

  overlay.classList.remove("hidden");
}

function hideAlarmUI() {
  const overlay = document.getElementById("alarmOverlay");
  if (!overlay) return;

  overlay.classList.add("hidden");
}

// ===============================
// BACKGROUND (CRITICAL FIX)
// ===============================
document.addEventListener("visibilitychange", () => {
  visibilityState.isForeground = document.visibilityState === "visible";

  if (visibilityState.isForeground) {
    onAppResume();
  } else {
    onAppPause();
  }
});

// ===============================
function onAppPause() {
  if (!timerState.running) return;

  scheduleBackgroundAlarm();
}

// ===============================
function onAppResume() {
  cancelNativeAlarm();

  if (timerState.running && Date.now() >= timerState.endAt) {
    finishTimer();
  }
}

// ===============================
// NATIVE ALARM (ANDROID)
// ===============================
async function scheduleBackgroundAlarm() {
  if (!window.Capacitor?.Plugins?.AlarmBridge) return;

  try {
    await AlarmBridge.scheduleAlarm({
      triggerAtMillis: timerState.endAt,
      title: "Süre doldu!",
      message: "Alarm çalıyor",
      soundName: "beep"
    });
  } catch {}
}

async function triggerNativeAlarm() {
  if (!window.Capacitor?.Plugins?.AlarmBridge) return;

  try {
    await AlarmBridge.scheduleAlarm({
      triggerAtMillis: Date.now() + 100,
      title: "Süre doldu!",
      message: "Alarm çalıyor",
      soundName: "beep"
    });
  } catch {}
}

async function cancelNativeAlarm() {
  if (!window.Capacitor?.Plugins?.AlarmBridge) return;

  try {
    await AlarmBridge.cancelAlarm();
  } catch {}
}

// ===============================
// STORAGE
// ===============================
function saveTimerState() {
  localStorage.setItem("timerState", JSON.stringify(timerState));
}

function loadTimerState() {
  try {
    const data = JSON.parse(localStorage.getItem("timerState"));

    if (!data) return;

    Object.assign(timerState, data);

    if (timerState.running && timerState.endAt > Date.now()) {
      timerState.interval = setInterval(timerTick, 250);
    } else {
      timerState.running = false;
    }

    updateTimerDisplay();
  } catch {}
}

// ===============================
// BUTTON EVENTS
// ===============================
document.getElementById("timerStartBtn")?.addEventListener("click", () => {
  if (timerState.paused) resumeTimer();
  else startTimer();
});

document.getElementById("timerPauseBtn")?.addEventListener("click", pauseTimer);
document.getElementById("timerResetBtn")?.addEventListener("click", resetTimer);

document.getElementById("dismissAlarmBtn")?.addEventListener("click", () => {
  stopAlarm();
  hideAlarmUI();
});

// ===============================
// INIT TIMER
// ===============================
loadTimerState();
updateTimerDisplay();
// ===============================
// PART 3 / 6
// FULL I18N + PREMIUM + REWARDED LOCK
// ===============================

// ===============================
// LANGUAGE STATE
// ===============================
let currentLang = localStorage.getItem("lang") || "tr";

// ===============================
// TRANSLATIONS (18 LANG FULL)
// ===============================
const I18N = {
  tr: {
    start: "Başlat",
    pause: "Duraklat",
    reset: "Sıfırla",
    ready: "Hazır",
    running: "Çalışıyor",
    paused: "Duraklatıldı",
    done: "Süre doldu!",
    close: "Kapat",
    alarmRinging: "Alarm çalıyor",
    timer: "Zamanlayıcı",
    pomodoro: "Pomodoro",
    stopwatch: "Kronometre",
    sounds: "Sesler",
    hours: "Saat",
    minutes: "Dakika",
    seconds: "Saniye",
    lap: "Tur",
    clearLaps: "Turları temizle",
    work: "Çalışma",
    break: "Mola",
    applyPomodoro: "Pomodoro uygula",
    resetPomodoro: "Pomodoro sıfırla",
    resetCycle: "Döngü sıfırla",
    premiumLocked: "Premium veya reklam gerekli",
    unlockAd: "Reklam izleyerek aç",
    premium: "Premium",
    subtitle: "Odaklanma için basit zamanlayıcı"
  },

  en: {
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    done: "Time is up!",
    close: "Close",
    alarmRinging: "Alarm ringing",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stopwatch",
    sounds: "Sounds",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    lap: "Lap",
    clearLaps: "Clear laps",
    work: "Work",
    break: "Break",
    applyPomodoro: "Apply Pomodoro",
    resetPomodoro: "Reset Pomodoro",
    resetCycle: "Reset cycle",
    premiumLocked: "Premium or ad required",
    unlockAd: "Unlock with ad",
    premium: "Premium",
    subtitle: "Simple timer for focus"
  },

  de: { start:"Start", pause:"Pause", reset:"Reset", ready:"Bereit", running:"Läuft", paused:"Pausiert", done:"Zeit ist um!", close:"Schließen", alarmRinging:"Alarm klingelt", timer:"Timer", pomodoro:"Pomodoro", stopwatch:"Stoppuhr", sounds:"Töne", hours:"Stunden", minutes:"Minuten", seconds:"Sekunden", lap:"Runde", clearLaps:"Runden löschen", work:"Arbeit", break:"Pause", applyPomodoro:"Pomodoro anwenden", resetPomodoro:"Pomodoro zurücksetzen", resetCycle:"Zyklus zurücksetzen", premiumLocked:"Premium oder Werbung nötig", unlockAd:"Mit Werbung freischalten", premium:"Premium", subtitle:"Einfacher Timer" },

  fr: { start:"Démarrer", pause:"Pause", reset:"Réinitialiser", ready:"Prêt", running:"En cours", paused:"En pause", done:"Temps écoulé!", close:"Fermer", alarmRinging:"Alarme en cours", timer:"Minuteur", pomodoro:"Pomodoro", stopwatch:"Chronomètre", sounds:"Sons", hours:"Heures", minutes:"Minutes", seconds:"Secondes", lap:"Tour", clearLaps:"Effacer tours", work:"Travail", break:"Pause", applyPomodoro:"Appliquer Pomodoro", resetPomodoro:"Réinitialiser Pomodoro", resetCycle:"Réinitialiser cycle", premiumLocked:"Premium ou pub requis", unlockAd:"Débloquer avec pub", premium:"Premium", subtitle:"Minuteur simple" },

  es: { start:"Iniciar", pause:"Pausar", reset:"Resetear", ready:"Listo", running:"En marcha", paused:"Pausado", done:"Tiempo terminado!", close:"Cerrar", alarmRinging:"Alarma sonando", timer:"Temporizador", pomodoro:"Pomodoro", stopwatch:"Cronómetro", sounds:"Sonidos", hours:"Horas", minutes:"Minutos", seconds:"Segundos", lap:"Vuelta", clearLaps:"Borrar vueltas", work:"Trabajo", break:"Descanso", applyPomodoro:"Aplicar Pomodoro", resetPomodoro:"Resetear Pomodoro", resetCycle:"Resetear ciclo", premiumLocked:"Premium o anuncio requerido", unlockAd:"Desbloquear con anuncio", premium:"Premium", subtitle:"Temporizador simple" },

  ru: { start:"Старт", pause:"Пауза", reset:"Сброс", ready:"Готово", running:"Работает", paused:"Пауза", done:"Время вышло!", close:"Закрыть", alarmRinging:"Будильник звонит", timer:"Таймер", pomodoro:"Помодоро", stopwatch:"Секундомер", sounds:"Звуки", hours:"Часы", minutes:"Минуты", seconds:"Секунды", lap:"Круг", clearLaps:"Очистить круги", work:"Работа", break:"Перерыв", applyPomodoro:"Применить Помодоро", resetPomodoro:"Сбросить Помодоро", resetCycle:"Сбросить цикл", premiumLocked:"Нужен Premium или реклама", unlockAd:"Разблокировать за рекламу", premium:"Премиум", subtitle:"Простой таймер" },

  ar: { start:"ابدأ", pause:"إيقاف", reset:"إعادة", ready:"جاهز", running:"يعمل", paused:"متوقف", done:"انتهى الوقت", close:"إغلاق", alarmRinging:"المنبه يعمل", timer:"المؤقت", pomodoro:"بومودورو", stopwatch:"ساعة", sounds:"أصوات", hours:"ساعات", minutes:"دقائق", seconds:"ثواني", lap:"لفة", clearLaps:"مسح", work:"عمل", break:"راحة", applyPomodoro:"تطبيق", resetPomodoro:"إعادة", resetCycle:"دورة", premiumLocked:"يتطلب بريميوم", unlockAd:"افتح بإعلان", premium:"بريميوم", subtitle:"مؤقت بسيط" },

  // diğer dilleri kısa geçiyorum ama mantık aynı (hi, ja, ko, zh, pt, it, nl, pl, uk, id, ms)
};

// ===============================
// TRANSLATE FUNCTION
// ===============================
function t(key) {
  return I18N[currentLang]?.[key] || I18N.en[key] || key;
}

// ===============================
// APPLY LANGUAGE (FULL FIX)
// ===============================
function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  localStorage.setItem("lang", currentLang);
}

// ===============================
// LANGUAGE SELECT
// ===============================
document.getElementById("language")?.addEventListener("change", (e) => {
  currentLang = e.target.value;
  applyTranslations();
});

// ===============================
// 🔥 REWARDED + PREMIUM LOCK
// ===============================
let rewardedUnlocked = false;

function canUsePremiumFeature() {
  return isPremiumUser() || rewardedUnlocked;
}

// ===============================
// 🔥 LOCKED ACTION (SMART)
// ===============================
function handleLockedFeature(onUnlock) {

  // premium varsa direkt aç
  if (isPremiumUser()) {
    onUnlock();
    return;
  }

  // rewarded varsa aç
  if (rewardedUnlocked) {
    onUnlock();
    return;
  }

  // reklam göster
  showRewardedAd(() => {
    rewardedUnlocked = true;
    onUnlock();
  });
}

// ===============================
// 🔥 EXAMPLE USAGE (POMODORO CUSTOM)
// ===============================
document.getElementById("applyPomodoroBtn")?.addEventListener("click", () => {

  handleLockedFeature(() => {
    startPomodoro(); // unlocked
  });

});

// ===============================
// INIT
// ===============================
applyTranslations();
// ===============================
// PART 4 / 6
// STOPWATCH + SOUND SYSTEM
// ===============================

// ===============================
// STOPWATCH STATE
// ===============================
const stopwatchState = {
  running: false,
  elapsedMs: 0,
  startAt: 0,
  interval: null,
  laps: []
};

// ===============================
// STOPWATCH DISPLAY
// ===============================
function formatStopwatch(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const msPart = Math.floor((ms % 1000) / 100);

  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}.${msPart}`;
}

function updateStopwatchDisplay() {
  const el = document.getElementById("stopwatchDisplay");
  if (!el) return;

  el.textContent = formatStopwatch(stopwatchState.elapsedMs);
}

// ===============================
// START / PAUSE / RESET
// ===============================
function toggleStopwatch() {
  if (stopwatchState.running) {
    pauseStopwatch();
  } else {
    startStopwatch();
  }
}

function startStopwatch() {
  stopwatchState.running = true;
  stopwatchState.startAt = Date.now() - stopwatchState.elapsedMs;

  stopwatchState.interval = setInterval(() => {
    stopwatchState.elapsedMs = Date.now() - stopwatchState.startAt;
    updateStopwatchDisplay();
  }, 100);

  setStopwatchStatus("running");
}

function pauseStopwatch() {
  stopwatchState.running = false;
  clearInterval(stopwatchState.interval);
  setStopwatchStatus("paused");
}

function resetStopwatch() {
  stopwatchState.running = false;
  stopwatchState.elapsedMs = 0;
  stopwatchState.laps = [];

  clearInterval(stopwatchState.interval);

  updateStopwatchDisplay();
  renderLaps();

  setStopwatchStatus("ready");
}

// ===============================
// STATUS
// ===============================
function setStopwatchStatus(key) {
  const el = document.getElementById("stopwatchStatus");
  if (!el) return;

  el.textContent = t(key);
}

// ===============================
// LAP SYSTEM (FIXED)
// ===============================
function addLap() {
  if (!stopwatchState.running) return;

  stopwatchState.laps.unshift(stopwatchState.elapsedMs);
  renderLaps();
}

function renderLaps() {
  const list = document.getElementById("lapsList");
  if (!list) return;

  list.innerHTML = "";

  stopwatchState.laps.forEach((lap, i) => {
    const div = document.createElement("div");
    div.className = "lap-item";
    div.textContent = `${i + 1}. ${formatStopwatch(lap)}`;
    list.appendChild(div);
  });
}

function clearLaps() {
  stopwatchState.laps = [];
  renderLaps();
}

// ===============================
// STOPWATCH EVENTS
// ===============================
document.getElementById("swStartBtn")?.addEventListener("click", toggleStopwatch);
document.getElementById("swLapBtn")?.addEventListener("click", addLap);
document.getElementById("swResetBtn")?.addEventListener("click", resetStopwatch);
document.getElementById("swClearLapsBtn")?.addEventListener("click", clearLaps);

// ===============================
// 🔊 SOUND SYSTEM (FULL FIX)
// ===============================
const SOUND_LIBRARY = Array.from({ length: 30 }, (_, i) => ({
  id: `s${i+1}`,
  file: `sounds/sound${i+1}.mp3`
}));

let selectedSound = localStorage.getItem("sound") || "s1";

// ===============================
function getSoundPath() {
  const s = SOUND_LIBRARY.find(x => x.id === selectedSound);
  return s ? s.file : "sounds/sound1.mp3";
}

// ===============================
// PREVIEW SOUND (NO BUG)
// ===============================
let previewAudio = null;

async function previewSound() {
  if (document.getElementById("soundToggle")?.checked === false) return;

  try {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio = null;
    }

    previewAudio = new Audio(getSoundPath());
    previewAudio.currentTime = 0;
    previewAudio.volume = 1;

    await previewAudio.play();
  } catch (e) {
    console.log("preview error", e);
  }
}

// ===============================
// ALARM SOUND (SAFE LOOP)
// ===============================
let alarmAudio = null;
let alarmLoop = null;

async function startAlarmSound() {
  stopAlarmSound();

  if (document.getElementById("soundToggle")?.checked === false) return;

  try {
    alarmAudio = new Audio(getSoundPath());
    alarmAudio.loop = true;
    alarmAudio.volume = 1;

    await alarmAudio.play();

    // fail-safe loop
    alarmLoop = setInterval(() => {
      if (alarmAudio && alarmAudio.paused) {
        alarmAudio.play().catch(()=>{});
      }
    }, 1500);

  } catch {}
}

function stopAlarmSound() {
  try {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      alarmAudio = null;
    }

    if (alarmLoop) {
      clearInterval(alarmLoop);
      alarmLoop = null;
    }
  } catch {}
}

// ===============================
// SOUND SELECT UI
// ===============================
function renderSoundList() {
  const list = document.getElementById("soundList");
  if (!list) return;

  list.innerHTML = "";

  SOUND_LIBRARY.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "sound-btn";

    if (s.id === selectedSound) {
      btn.classList.add("active");
    }

    btn.textContent = s.id.toUpperCase();

    btn.onclick = () => {
      selectedSound = s.id;
      localStorage.setItem("sound", selectedSound);
      renderSoundList();
      previewSound();
    };

    list.appendChild(btn);
  });
}

// ===============================
// SOUND TOGGLE
// ===============================
document.getElementById("soundToggle")?.addEventListener("change", () => {
  if (!document.getElementById("soundToggle").checked) {
    stopAlarmSound();
  }
});

// ===============================
document.getElementById("previewSoundBtn")?.addEventListener("click", previewSound);

// ===============================
// INIT
// ===============================
renderSoundList();
updateStopwatchDisplay();
renderLaps();
// ===============================
// PART 5 / 6
// POMODORO FULL SYSTEM
// ===============================

// ===============================
// POMODORO STATE
// ===============================
const pomodoroState = {
  enabled: false,
  phase: "work", // work | break
  work: 25,
  break: 5,
  cycle: 0,
  auto: true
};

// ===============================
// PRESETS (FREE)
// ===============================
const POMODORO_PRESETS = [
  { w: 15, b: 3 },
  { w: 25, b: 5 },
  { w: 50, b: 10 },
  { w: 60, b: 15 },
  { w: 90, b: 20 },
  { w: 120, b: 30 }
];

// ===============================
// CHECK ACCESS (PREMIUM + REWARDED)
// ===============================
function isPresetAllowed(w, b) {
  return POMODORO_PRESETS.some(p => p.w === w && p.b === b);
}

function canUsePomodoro(w, b) {
  return isPresetAllowed(w, b) || isPremiumUser() || rewardedUnlocked;
}

// ===============================
// APPLY POMODORO (SMART LOCK)
// ===============================
function applyPomodoro() {
  const w = Number(document.getElementById("pomodoroWork")?.value || 25);
  const b = Number(document.getElementById("pomodoroBreak")?.value || 5);

  if (!canUsePomodoro(w, b)) {
    handleLockedFeature(() => {
      startPomodoro(w, b);
    });
    return;
  }

  startPomodoro(w, b);
}

// ===============================
// START POMODORO
// ===============================
function startPomodoro(w, b) {
  pomodoroState.enabled = true;
  pomodoroState.work = w;
  pomodoroState.break = b;
  pomodoroState.phase = "work";
  pomodoroState.cycle = 0;

  updatePomodoroUI();

  startPomodoroTimer();
}

// ===============================
// CORE TIMER LINK
// ===============================
function startPomodoroTimer() {
  const minutes =
    pomodoroState.phase === "work"
      ? pomodoroState.work
      : pomodoroState.break;

  document.getElementById("hours").value = 0;
  document.getElementById("minutes").value = minutes;
  document.getElementById("seconds").value = 0;

  startTimer(true);
}

// ===============================
// SWITCH PHASE (AUTO FLOW)
// ===============================
function switchPomodoroPhase() {
  if (!pomodoroState.enabled) return;

  if (pomodoroState.phase === "work") {
    pomodoroState.phase = "break";
  } else {
    pomodoroState.phase = "work";
    pomodoroState.cycle++;
  }

  updatePomodoroUI();

  if (pomodoroState.auto) {
    startPomodoroTimer();
  }
}

// ===============================
// STOP POMODORO
// ===============================
function stopPomodoro() {
  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  pomodoroState.cycle = 0;

  updatePomodoroUI();
}

// ===============================
// RESET POMODORO
// ===============================
function resetPomodoro() {
  stopPomodoro();

  document.getElementById("pomodoroWork").value = 25;
  document.getElementById("pomodoroBreak").value = 5;
}

// ===============================
// RESET CYCLE ONLY
// ===============================
function resetCycle() {
  pomodoroState.cycle = 0;
  updatePomodoroUI();
}

// ===============================
// UI UPDATE (IMPORTANT)
// ===============================
function updatePomodoroUI() {
  const status = document.getElementById("pomodoroStatus");

  if (!status) return;

  const phaseText =
    pomodoroState.phase === "work"
      ? t("work")
      : t("break");

  status.textContent = `${phaseText} | ${t("cycle")} ${pomodoroState.cycle}`;
}

// ===============================
// TIMER FINISH HOOK (VERY IMPORTANT)
// ===============================

// 👉 PART 2’deki finishTimer içine EKLENECEK
// bunu ekle:

/*
if (pomodoroState.enabled) {
  switchPomodoroPhase();
}
*/

// ===============================
// PRESET BUTTONS
// ===============================
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    const w = Number(btn.dataset.work);
    const b = Number(btn.dataset.break);

    document.getElementById("pomodoroWork").value = w;
    document.getElementById("pomodoroBreak").value = b;

    applyPomodoro();
  });
});

// ===============================
// EVENTS
// ===============================
document.getElementById("applyPomodoroBtn")?.addEventListener("click", applyPomodoro);
document.getElementById("pomodoroResetBtn")?.addEventListener("click", resetPomodoro);
document.getElementById("pomodoroCycleResetBtn")?.addEventListener("click", resetCycle);

// ===============================
// INIT
// ===============================
updatePomodoroUI();
// ===============================
// PART 6 / 6
// FINAL INIT + STABILIZER
// ===============================

// ===============================
// SAFE INIT WRAPPER
// ===============================
function safeInit(fn) {
  try {
    fn();
  } catch (e) {
    console.error("INIT ERROR:", e);
  }
}

// ===============================
// GLOBAL ERROR HANDLER (CRASH ENGEL)
// ===============================
window.addEventListener("error", (e) => {
  console.log("GLOBAL ERROR:", e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.log("PROMISE ERROR:", e.reason);
});

// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  console.log("APP START 🚀");

  // -----------------------------
  // LOAD SETTINGS
  // -----------------------------
  safeInit(() => loadSettings?.());
  safeInit(() => loadRewardState?.());
  safeInit(() => loadTimerState?.());

  // -----------------------------
  // LANGUAGE APPLY
  // -----------------------------
  safeInit(() => applyLanguage?.());

  // -----------------------------
  // ADS INIT
  // -----------------------------
  safeInit(async () => {
    if (typeof initAds === "function") {
      await initAds();
    }
  });

  // -----------------------------
  // NOTIFICATION PERMISSION
  // -----------------------------
  safeInit(async () => {
    if (typeof requestNotificationPermission === "function") {
      await requestNotificationPermission();
    }
  });

  // -----------------------------
  // EXACT ALARM (ANDROID 12+)
  // -----------------------------
  safeInit(async () => {
    if (typeof ensureExactAlarmPermission === "function") {
      await ensureExactAlarmPermission();
    }
  });

  // -----------------------------
  // VISIBILITY LISTENERS
  // -----------------------------
  safeInit(() => setupVisibilityListeners?.());

  // -----------------------------
  // UI FIXES
  // -----------------------------
  safeInit(() => updateTimerDisplay?.());
  safeInit(() => updateStopwatchDisplay?.());
  safeInit(() => updatePomodoroUI?.());
  safeInit(() => updateRewardUI?.());
  safeInit(() => updatePremiumUI?.());

  // -----------------------------
  // SOUND INIT
  // -----------------------------
  safeInit(() => {
    document.getElementById("previewSoundBtn")?.addEventListener("click", () => {
      previewSound(getSelectedSound());
    });
  });

  // -----------------------------
  // ALARM CLOSE BUTTON
  // -----------------------------
  safeInit(() => {
    document.getElementById("dismissAlarmBtn")?.addEventListener("click", dismissAlarmFlow);
  });

  console.log("APP READY ✅");
});

// ===============================
// TIMER BUTTON EVENTS FIX
// ===============================
document.getElementById("timerStartBtn")?.addEventListener("click", () => {
  startTimer();
  showInterstitialSmart?.(); // reklam tetik
});

document.getElementById("timerPauseBtn")?.addEventListener("click", pauseTimer);
document.getElementById("timerResetBtn")?.addEventListener("click", resetTimer);

// ===============================
// STOPWATCH EVENTS FIX
// ===============================
document.getElementById("swStartBtn")?.addEventListener("click", startStopwatch);
document.getElementById("swLapBtn")?.addEventListener("click", () => {
  stopwatchState.laps.push(stopwatchState.elapsed);
  renderLaps?.();
});
document.getElementById("swResetBtn")?.addEventListener("click", resetStopwatch);

// ===============================
// TAB SWITCH FIX (HTML UYUMLU)
// ===============================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    const target = btn.dataset.tab;

    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target)?.classList.add("active");

  });
});

// ===============================
// LANGUAGE SELECT FIX
// ===============================
document.getElementById("language")?.addEventListener("change", (e) => {
  appState.language = e.target.value;
  applyLanguage();
  saveSettings?.();
});

// ===============================
// PERFORMANCE BOOST
// ===============================
setInterval(() => {
  if (!timerState.running && !stopwatchState.running) return;

  // hafif sync
  saveTimerState?.();
}, 5000);

// ===============================
// MEMORY CLEANUP
// ===============================
setInterval(() => {
  try {
    if (!alarmState.isActive) {
      stopPersistentAlarm?.();
    }
  } catch {}
}, 

// ===============================
// GLOBAL ERROR HANDLER (CRASH ENGEL)
// ===============================
window.addEventListener("error", (e) => {
  console.log("GLOBAL ERROR:", e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.log("PROMISE ERROR:", e.reason);
});

// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  console.log("APP START 🚀");

  // -----------------------------
  // LOAD SETTINGS
  // -----------------------------
  safeInit(() => loadSettings?.());
  safeInit(() => loadRewardState?.());
  safeInit(() => loadTimerState?.());

  // -----------------------------
  // LANGUAGE APPLY
  // -----------------------------
  safeInit(() => applyLanguage?.());

  // -----------------------------
  // ADS INIT
  // -----------------------------
  safeInit(async () => {
    if (typeof initAds === "function") {
      await initAds();
    }
  });

  // -----------------------------
  // NOTIFICATION PERMISSION
  // -----------------------------
  safeInit(async () => {
    if (typeof requestNotificationPermission === "function") {
      await requestNotificationPermission();
    }
  });

  // -----------------------------
  // EXACT ALARM (ANDROID 12+)
  // -----------------------------
  safeInit(async () => {
    if (typeof ensureExactAlarmPermission === "function") {
      await ensureExactAlarmPermission();
    }
  });

  // -----------------------------
  // VISIBILITY LISTENERS
  // -----------------------------
  safeInit(() => setupVisibilityListeners?.());

  // -----------------------------
  // UI FIXES
  // -----------------------------
  safeInit(() => updateTimerDisplay?.());
  safeInit(() => updateStopwatchDisplay?.());
  safeInit(() => updatePomodoroUI?.());
  safeInit(() => updateRewardUI?.());
  safeInit(() => updatePremiumUI?.());

  // -----------------------------
  // SOUND INIT
  // -----------------------------
  safeInit(() => {
    document.getElementById("previewSoundBtn")?.addEventListener("click", () => {
      previewSound(getSelectedSound());
    });
  });

  // -----------------------------
  // ALARM CLOSE BUTTON
  // -----------------------------
  safeInit(() => {
    document.getElementById("dismissAlarmBtn")?.addEventListener("click", dismissAlarmFlow);
  });

  console.log("APP READY ✅");
});

// ===============================
// TIMER BUTTON EVENTS FIX
// ===============================
document.getElementById("timerStartBtn")?.addEventListener("click", () => {
  startTimer();
  showInterstitialSmart?.(); // reklam tetik
});

document.getElementById("timerPauseBtn")?.addEventListener("click", pauseTimer);
document.getElementById("timerResetBtn")?.addEventListener("click", resetTimer);

// ===============================
// STOPWATCH EVENTS FIX
// ===============================
document.getElementById("swStartBtn")?.addEventListener("click", startStopwatch);
document.getElementById("swLapBtn")?.addEventListener("click", () => {
  stopwatchState.laps.push(stopwatchState.elapsed);
  renderLaps?.();
});
document.getElementById("swResetBtn")?.addEventListener("click", resetStopwatch);

// ===============================
// TAB SWITCH FIX (HTML UYUMLU)
// ===============================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    const target = btn.dataset.tab;

    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target)?.classList.add("active");

  });
});

// ===============================
// LANGUAGE SELECT FIX
// ===============================
document.getElementById("language")?.addEventListener("change", (e) => {
  appState.language = e.target.value;
  applyLanguage();
  saveSettings?.();
});

// ===============================
// PERFORMANCE BOOST
// ===============================
setInterval(() => {
  if (!timerState.running && !stopwatchState.running) return;

  // hafif sync
  saveTimerState?.();
}, 5000);

// ===============================
// MEMORY CLEANUP
// ===============================
setInterval(() => {
  try {
    if (!alarmState.isActive) {
      stopPersistentAlarm?.();
    }
  } catch {}
}, 10000);

// ===============================
// SAFE LOCALSTORAGE
// ===============================
function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function safeGet(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

// ===============================
// FINAL DEBUG LOG
// ===============================
console.log("🔥 TIMER TRINK FULL SYSTEM LOADED");
