// FULL APP JS START
document.addEventListener("DOMContentLoaded", () => {
  try {
    startApp();
  } catch (e) {
    console.log("APP CRASH:", e);
  }
});

function startApp() {
  // ===============================
  // PART 1 / 3
  // ===============================

  // ===============================
  // CAPACITOR
  // ===============================
  const CapacitorLocalNotifications =
    window.Capacitor?.Plugins?.LocalNotifications || null;
  const CapacitorApp =
    window.Capacitor?.Plugins?.App || null;
  const AlarmBridge =
    window.Capacitor?.Plugins?.AlarmBridge || null;
  const AdMobPlugin =
    window.Capacitor?.Plugins?.AdMob || null;

  // ===============================
  // HELPERS
  // ===============================
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function safeParse(str) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  function nowMs() {
    return Date.now();
  }

  function getSupportedInitialLanguage() {
    const supported = [
      "tr", "en", "de", "fr", "es", "ru", "ar", "it", "pt", "zh",
      "hi", "ja", "ko", "nl", "pl", "uk", "id", "ms"
    ];

    const raw = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    const short = raw.slice(0, 2);

    return supported.includes(short) ? short : "en";
  }

  function fileNameWithoutExt(name) {
    return String(name || "").replace(/\.(wav|mp3)$/i, "");
  }

  function getExistingSoundExtension(baseName) {
    const wav = `${baseName}.wav`;
    const mp3 = `${baseName}.mp3`;
    const all = window.__availableSoundFiles || [];

    if (all.includes(wav)) return wav;
    if (all.includes(mp3)) return mp3;

    return mp3;
  }

  function formatTime(sec) {
    const safeSec = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(safeSec / 3600);
    const m = Math.floor((safeSec % 3600) / 60);
    const s = safeSec % 60;

    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0")
    ].join(":");
  }

  function getRemainingSecondsFromEndAt(endAt) {
    if (!endAt || endAt <= 0) return 0;
    return Math.max(0, Math.ceil((endAt - nowMs()) / 1000));
  }

  // ===============================
  // PREMIUM REMOVED
  // ===============================
  const premiumState = { isPremium: false };
  localStorage.removeItem("isPremium");

  function isPremiumUser() {
    return false;
  }

  function enablePremium() {
    premiumState.isPremium = false;
    localStorage.removeItem("isPremium");
    removePremiumUICompletely();
    updateAdsVisibility();
  }

  function disablePremium() {
    premiumState.isPremium = false;
    localStorage.removeItem("isPremium");
    removePremiumUICompletely();
    updateAdsVisibility();
  }

  function removePremiumUICompletely() {
    const premiumStatus = $("premiumStatusText");
    if (premiumStatus) premiumStatus.textContent = "Ücretsiz sürüm";

    const tabPremium = $("tabPremium");
    if (tabPremium) tabPremium.style.display = "none";

    const premiumPanel = $("premiumPanel");
    if (premiumPanel) premiumPanel.style.display = "none";

    document.querySelectorAll(".plan-buy-btn").forEach((btn) => {
      btn.style.display = "none";
    });

    document.querySelectorAll(".premium-plan-btn").forEach((btn) => {
      btn.style.display = "none";
    });
  }

  function updatePremiumUI() {
    removePremiumUICompletely();
  }

  async function initBilling() {
    premiumState.isPremium = false;
    localStorage.removeItem("isPremium");
    return false;
  }

  async function buyPremiumPlan() {
    return false;
  }

  async function restorePremiumPurchases() {
    return false;
  }

  // ===============================
  // REWARDED CUSTOM POMODORO STATE
  // ===============================
  let rewardedCustomPomodoroUnlocked =
    localStorage.getItem("tt_rewarded_custom_pomodoro") === "true";

  function saveRewardedCustomPomodoroState() {
    localStorage.setItem(
      "tt_rewarded_custom_pomodoro",
      rewardedCustomPomodoroUnlocked ? "true" : "false"
    );
  }

  function clearRewardedCustomPomodoroAccess() {
    rewardedCustomPomodoroUnlocked = false;
    saveRewardedCustomPomodoroState();
    updatePomodoroUI();
  }

  function unlockRewardedCustomPomodoroAccess() {
    rewardedCustomPomodoroUnlocked = true;
    saveRewardedCustomPomodoroState();
    updatePomodoroUI();
  }

  function isFreePomodoroPreset(work, brk) {
    const allowed = [
      { w: 15, b: 3 },
      { w: 25, b: 5 },
      { w: 50, b: 10 },
      { w: 60, b: 15 },
      { w: 90, b: 20 },
      { w: 120, b: 30 }
    ];

    return allowed.some((p) => p.w === work && p.b === brk);
  }

  function canUsePomodoroPair(work, brk) {
    return isFreePomodoroPreset(work, brk) || rewardedCustomPomodoroUnlocked;
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
  // STATE
  // ===============================
  const notificationState = {
    permissionGranted: false,
    exactAlarmGranted: false,
    listenersReady: false,
    scheduledTimerNotificationId: 1001
  };

  const visibilityState = {
    isForeground: document.visibilityState === "visible",
    listenersReady: false
  };

  const appState = {
    initialized: false,
    language: getSupportedInitialLanguage(),
    theme: "dark",
    lastTab: "timerPanel"
  };

  const timerState = {
    timerId: null,
    running: false,
    paused: false,
    timeLeft: 0,
    totalTime: 0,
    endAt: 0,
    mode: "timer",
    finishing: false,
    finishedHandled: false,
    lastFinishedAt: 0
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
    breakMinutes: 5,
    cycleCount: 0,
    autoAdvance: true
  };

  const alarmState = {
    pendingPomodoroAdvance: false,
    htmlAudio: null,
    previewAudio: null,
    repeatIntervalId: null,
    htmlAudioUnlocked: false,
    isActive: false
  };

  const adRuntime = {
    initialized: false,
    interstitialReady: false,
    rewardedReady: false,
    lastInterstitialAt: 0,
    interstitialCounter: 0,
    minInterstitialGapMs: 60000
  };

  const ADMOB_IDS = {
    banner: "ca-app-pub-9576973508771581/8701259937",
    interstitial: "ca-app-pub-9576973508771581/9381788346",
    rewarded: "ca-app-pub-9576973508771581/8139989327"
  };

  // ===============================
  // FINISH / ALARM HELPERS
  // ===============================
  function isFinishLocked() {
    return timerState.finishing || timerState.finishedHandled;
  }

  function resetFinishLocks() {
    timerState.finishing = false;
    timerState.finishedHandled = false;
  }

  function markFinishHandled() {
    timerState.finishing = true;
    timerState.finishedHandled = true;
    timerState.lastFinishedAt = Date.now();
  }

  function hideAlarmOverlay() {
    const overlay = $("alarmOverlay");
    if (overlay) overlay.classList.add("hidden");
    document.body.classList.remove("alarm-active");
  }

  function showAlarmOverlay() {
    const overlay = $("alarmOverlay");
    const title = $("alarmTitle");
    const msg = $("alarmMessage");
    const btn = $("dismissAlarmBtn");

    if (title) title.textContent = t("done");
    if (msg) msg.textContent = t("alarmRinging");
    if (btn) btn.textContent = t("close");

    if (overlay) overlay.classList.remove("hidden");
    document.body.classList.add("alarm-active");
  }

  // ===============================
  // TRANSLATIONS
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
      sounds: "Sesler",
      hours: "Saat",
      minutes: "Dakika",
      seconds: "Saniye",
      lap: "Tur",
      stopwatch: "Kronometre",
      timer: "Zamanlayıcı",
      pomodoro: "Pomodoro",
      premium: "Premium",
      buyPremium: "Satın Al",
      premiumActive: "Premium aktif",
      premiumDesc: "Reklamsız kullanım ve özel süreler",
      premiumLocked: "Bu özellik Premium içindir.",
      freePresetsInfo: "Hazır pomodoro süreleri ücretsizdir: 15/3 • 25/5 • 50/10 • 60/15 • 90/20 • 120/30",
      soundOn: "Ses açık",
      vibrationOn: "Titreşim açık",
      subtitle: "Odaklanma ve günlük kullanım için basit zamanlayıcı",
      soundsTitle: "Alarm sesleri",
      soundsDesc: "Bir ses seç ve önizlemesini dinle.",
      previewSound: "Sesi dinle",
      pomodoroDesc: "Bir odak süresi seç ve zamanlayıcıya uygula.",
      applyPomodoro: "Pomodoro uygula",
      lapsTitle: "Turlar",
      clearLaps: "Turları temizle",
      workLabel: "Çalışma",
      breakLabel: "Mola",
      resetPomodoro: "Pomodoroyu sıfırla",
      resetCycle: "Döngüyü sıfırla",
      cycle: "Döngü",
      presetClassic: "Klasik",
      presetQuick: "Derin Odak",
      presetShort: "Kısa",
      presetLong: "Uzun",
      presetUltra: "Ultra",
      presetBalanced: "Dengeli",
      customUnlocked: "Özel süre açık"
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
      alarmRinging: "Alarm is ringing",
      sounds: "Sounds",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      lap: "Lap",
      stopwatch: "Stopwatch",
      timer: "Timer",
      pomodoro: "Pomodoro",
      premium: "Premium",
      buyPremium: "Buy",
      premiumActive: "Premium active",
      premiumDesc: "Ad-free usage and custom durations",
      premiumLocked: "This feature is for Premium.",
      freePresetsInfo: "Preset pomodoro times are free: 15/3 • 25/5 • 50/10 • 60/15 • 90/20 • 120/30",
      soundOn: "Sound on",
      vibrationOn: "Vibration on",
      subtitle: "Simple timer for focus and daily use",
      soundsTitle: "Alarm sounds",
      soundsDesc: "Select a sound and preview it.",
      previewSound: "Preview sound",
      pomodoroDesc: "Choose a focus preset and load it into timer.",
      applyPomodoro: "Apply Pomodoro",
      lapsTitle: "Laps",
      clearLaps: "Clear laps",
      workLabel: "Work",
      breakLabel: "Break",
      resetPomodoro: "Reset Pomodoro",
      resetCycle: "Reset cycle",
      cycle: "Cycle",
      presetClassic: "Classic",
      presetQuick: "Deep Focus",
      presetShort: "Short",
      presetLong: "Long",
      presetUltra: "Ultra",
      presetBalanced: "Balanced",
      customUnlocked: "Custom unlocked"
    }
  };

  function t(key) {
    const lang = $("language")?.value || appState.language || "en";
    return I18N[lang]?.[key] || I18N.en[key] || key;
  }

  function setText(id, key) {
    const el = $(id);
    if (el) el.textContent = t(key);
  }

  // ===============================
  // SOUND LIBRARY
  // ===============================
  const SOUND_LIBRARY = Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    return {
      id: `s${n}`,
      rawName: `sound${n}`,
      assetPath: getExistingSoundExtension(`sound${n}`),
      name: {
        tr: `Ses ${n}`,
        en: `Sound ${n}`
      }
    };
  });

  let selectedSoundId = "s1";

  function getSelectedSound() {
    return SOUND_LIBRARY.find((s) => s.id === selectedSoundId) || SOUND_LIBRARY[0];
  }

  function getSelectedSoundRawName() {
    const selected = getSelectedSound();
    if (!selected) return "beep";
    return fileNameWithoutExt(selected.assetPath) || selected.rawName || "beep";
  }

  async function unlockAudioOnce() {
    if (alarmState.htmlAudioUnlocked) return true;

    try {
      const a = new Audio();
      a.src = getSelectedSound().assetPath;
      a.muted = true;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.muted = false;
      alarmState.htmlAudioUnlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  function stopPreviewSound() {
    try {
      if (alarmState.previewAudio) {
        alarmState.previewAudio.pause();
        alarmState.previewAudio.currentTime = 0;
        alarmState.previewAudio = null;
      }
    } catch {}
  }

  function stopPersistentAlarm() {
    alarmState.isActive = false;

    try {
      if (alarmState.repeatIntervalId) {
        clearInterval(alarmState.repeatIntervalId);
        alarmState.repeatIntervalId = null;
      }

      if (alarmState.htmlAudio) {
        alarmState.htmlAudio.pause();
        alarmState.htmlAudio.currentTime = 0;
        alarmState.htmlAudio.loop = false;
        alarmState.htmlAudio = null;
      }
    } catch {}
  }

  async function startPersistentAlarm() {
    stopPersistentAlarm();

    if ($("soundToggle")?.checked === false) return;

    alarmState.isActive = true;

    try {
      await unlockAudioOnce();

      const src = getSelectedSound().assetPath;

      if (!alarmState.htmlAudio) {
        alarmState.htmlAudio = new Audio(src);
      } else {
        alarmState.htmlAudio.pause();
        alarmState.htmlAudio.src = src;
      }

      alarmState.htmlAudio.loop = true;
      alarmState.htmlAudio.volume = 1;
      alarmState.htmlAudio.currentTime = 0;

      try {
        await alarmState.htmlAudio.play();
      } catch {}

      alarmState.repeatIntervalId = setInterval(async () => {
        if (!alarmState.isActive || !alarmState.htmlAudio) return;
        if (alarmState.htmlAudio.paused) {
          try {
            await alarmState.htmlAudio.play();
          } catch {}
        }
      }, 1200);
    } catch {}
  }
