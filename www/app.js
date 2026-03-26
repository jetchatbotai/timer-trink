// ===============================
// CAPACITOR
// ===============================
const CapacitorLocalNotifications =
  window.Capacitor?.Plugins?.LocalNotifications || null;
const CapacitorApp =
  window.Capacitor?.Plugins?.App || null;

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

function hideAlarmOverlay() {
  // overlay artık kullanılmıyor
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
  language: "tr",
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
  mode: "timer" // timer | pomodoro
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
  pendingPomodoroAdvance: false
};

// ===============================
// LANG / TRANSLATIONS
// ===============================
const baseTranslations = {
  start: { tr: "Başlat", en: "Start", de: "Start", fr: "Démarrer", es: "Iniciar", ru: "Старт", ar: "ابدأ", it: "Avvia", pt: "Iniciar", zh: "开始" },
  pause: { tr: "Duraklat", en: "Pause", de: "Pause", fr: "Pause", es: "Pausar", ru: "Пауза", ar: "إيقاف مؤقت", it: "Pausa", pt: "Pausar", zh: "暂停" },
  reset: { tr: "Sıfırla", en: "Reset", de: "Zurücksetzen", fr: "Réinitialiser", es: "Restablecer", ru: "Сброс", ar: "إعادة تعيين", it: "Reimposta", pt: "Redefinir", zh: "重置" },
  ready: { tr: "Hazır", en: "Ready", de: "Bereit", fr: "Prêt", es: "Listo", ru: "Готово", ar: "جاهز", it: "Pronto", pt: "Pronto", zh: "就绪" },
  running: { tr: "Çalışıyor", en: "Running", de: "Läuft", fr: "En cours", es: "En marcha", ru: "Работает", ar: "قيد التشغيل", it: "In esecuzione", pt: "Em andamento", zh: "运行中" },
  paused: { tr: "Duraklatıldı", en: "Paused", de: "Pausiert", fr: "En pause", es: "Pausado", ru: "На паузе", ar: "متوقف مؤقتًا", it: "In pausa", pt: "Pausado", zh: "已暂停" },
  done: { tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!", ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！" },
  dismissAlarm: { tr: "Kapat", en: "Dismiss", de: "Schließen", fr: "Fermer", es: "Cerrar", ru: "Закрыть", ar: "إغلاق", it: "Chiudi", pt: "Fechar", zh: "关闭" },
  sounds: { tr: "ses", en: "sounds", de: "Töne", fr: "sons", es: "sonidos", ru: "звуков", ar: "أصوات", it: "suoni", pt: "sons", zh: "种声音" },
  hours: { tr: "Saat", en: "Hours", de: "Stunden", fr: "Heures", es: "Horas", ru: "Часы", ar: "الساعات", it: "Ore", pt: "Horas", zh: "小时" },
  minutes: { tr: "Dakika", en: "Minutes", de: "Minuten", fr: "Minutes", es: "Minutos", ru: "Минуты", ar: "الدقائق", it: "Minuti", pt: "Minutos", zh: "分钟" },
  seconds: { tr: "Saniye", en: "Seconds", de: "Sekunden", fr: "Secondes", es: "Segundos", ru: "Секунды", ar: "الثواني", it: "Secondi", pt: "Segundos", zh: "秒" },
  lap: { tr: "Tur", en: "Lap", de: "Runde", fr: "Tour", es: "Vuelta", ru: "Круг", ar: "لفة", it: "Giro", pt: "Volta", zh: "圈" },
  stopwatch: { tr: "Kronometre", en: "Stopwatch", de: "Stoppuhr", fr: "Chronomètre", es: "Cronómetro", ru: "Секундомер", ar: "ساعة إيقاف", it: "Cronometro", pt: "Cronômetro", zh: "秒表" },
  timer: { tr: "Zamanlayıcı", en: "Timer", de: "Timer", fr: "Minuteur", es: "Temporizador", ru: "Таймер", ar: "المؤقت", it: "Timer", pt: "Temporizador", zh: "计时器" },
  pomodoro: { tr: "Pomodoro", en: "Pomodoro", de: "Pomodoro", fr: "Pomodoro", es: "Pomodoro", ru: "Помодоро", ar: "بومودورو", it: "Pomodoro", pt: "Pomodoro", zh: "番茄钟" },
  soundOn: { tr: "Ses açık", en: "Sound on", de: "Ton an", fr: "Son activé", es: "Sonido activado", ru: "Звук açık", ar: "الصوت مفعل", it: "Suono attivo", pt: "Som ligado", zh: "声音开启" },
  vibrationOn: { tr: "Titreşim açık", en: "Vibration on", de: "Vibration an", fr: "Vibration activée", es: "Vibración activada", ru: "Вибрация включена", ar: "الاهتزاز مفعل", it: "Vibrazione attiva", pt: "Vibração ligada", zh: "振动开启" },
  notifTimerTitle: { tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!", ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！" },
  notifTimerBody: { tr: "Bildirime dokunarak alarmı kapat", en: "Tap the notification to stop the alarm", de: "Tippe auf die Benachrichtigung, um den Alarm zu stoppen", fr: "Touchez la notification pour arrêter l'alarme", es: "Toca la notificación para detener la alarma", ru: "Нажмите уведомление, чтобы остановить сигнал", ar: "اضغط على الإشعار لإيقاف المنبه", it: "Tocca la notifica per fermare l'allarme", pt: "Toque na notificação para parar o alarme", zh: "点击通知以停止闹铃" },
  work: { tr: "Çalışma", en: "Work", de: "Arbeit", fr: "Travail", es: "Trabajo", ru: "Работа", ar: "عمل", it: "Lavoro", pt: "Trabalho", zh: "工作" },
  break: { tr: "Mola", en: "Break", de: "Pause", fr: "Pause", es: "Descanso", ru: "Перерыв", ar: "استراحة", it: "Pausa", pt: "Pausa", zh: "休息" },
  cycle: { tr: "Döngü", en: "Cycle", de: "Zyklus", fr: "Cycle", es: "Ciclo", ru: "Цикл", ar: "دورة", it: "Ciclo", pt: "Ciclo", zh: "周期" },
  subtitle: { tr: "Odaklanma ve günlük kullanım için basit zamanlayıcı", en: "Simple timer for focus and daily use", de: "Einfacher Timer für Fokus und den Alltag", fr: "Minuteur simple pour la concentration et l'usage quotidien", es: "Temporizador simple para concentración y uso diario", ru: "Простой таймер для концентрации и повседневного использования", ar: "مؤقت بسيط للتركيز والاستخدام اليومي", it: "Timer semplice per concentrazione e uso quotidiano", pt: "Temporizador simples para foco e uso diário", zh: "适合专注和日常使用的简易计时器" },
  soundsTitle: { tr: "Alarm sesleri", en: "Alarm sounds", de: "Alarmtöne", fr: "Sons d'alarme", es: "Sonidos de alarma", ru: "Звуки будильника", ar: "أصوات المنبه", it: "Suoni della sveglia", pt: "Sons de alarme", zh: "闹铃声音" },
  soundsDesc: { tr: "Bir ses seç ve önizlemesini dinle.", en: "Select a sound and preview it.", de: "Wähle einen Ton und höre ihn an.", fr: "Sélectionnez un son et écoutez un aperçu.", es: "Selecciona un sonido y escúchalo.", ru: "Выберите звук и прослушайте его.", ar: "اختر صوتًا واستمع إلى المعاينة.", it: "Seleziona un suono e ascolta l'anteprima.", pt: "Selecione um som e ouça a prévia.", zh: "选择一个声音并试听。" },
  previewSound: { tr: "Sesi dinle", en: "Preview sound", de: "Ton anhören", fr: "Écouter le son", es: "Escuchar sonido", ru: "Прослушать звук", ar: "معاينة الصوت", it: "Ascolta il suono", pt: "Ouvir som", zh: "试听声音" },
  pomodoroDesc: { tr: "Bir odak süresi seç ve zamanlayıcıya uygula.", en: "Choose a focus preset and load it into timer.", de: "Wähle eine Fokus-Voreinstellung und lade sie in den Timer.", fr: "Choisissez un préréglage de concentration et appliquez-le au minuteur.", es: "Elige una configuración de enfoque y cárgala en el temporizador.", ru: "Выберите пресет для фокуса и загрузите его в таймер.", ar: "اختر إعداد تركيز وطبقه على المؤقت.", it: "Scegli una modalità di concentrazione e applicala al timer.", pt: "Escolha uma predefinição de foco e aplique ao temporizador.", zh: "选择一个专注预设并应用到计时器。" },
  applyPomodoro: { tr: "Pomodoro uygula", en: "Apply Pomodoro", de: "Pomodoro anwenden", fr: "Appliquer Pomodoro", es: "Aplicar Pomodoro", ru: "Применить Помодоро", ar: "تطبيق بومودورو", it: "Applica Pomodoro", pt: "Aplicar Pomodoro", zh: "应用番茄钟" },
  lapsTitle: { tr: "Turlar", en: "Laps", de: "Runden", fr: "Tours", es: "Vueltas", ru: "Круги", ar: "اللفات", it: "Giri", pt: "Voltas", zh: "圈数" },
  clearLaps: { tr: "Turları temizle", en: "Clear Laps", de: "Runden löschen", fr: "Effacer les tours", es: "Borrar vueltas", ru: "Очистить круги", ar: "مسح اللفات", it: "Cancella giri", pt: "Limpar voltas", zh: "清除圈数" },
  workLabel: { tr: "Çalışma", en: "Work", de: "Arbeit", fr: "Travail", es: "Trabajo", ru: "Работа", ar: "عمل", it: "Lavoro", pt: "Trabalho", zh: "工作" },
  breakLabel: { tr: "Mola", en: "Break", de: "Pause", fr: "Pause", es: "Descanso", ru: "Перерыв", ar: "استراحة", it: "Pausa", pt: "Pausa", zh: "休息" },
  resetPomodoro: { tr: "Pomodoroyu sıfırla", en: "Reset Pomodoro", de: "Pomodoro zurücksetzen", fr: "Réinitialiser Pomodoro", es: "Restablecer Pomodoro", ru: "Сбросить Помодоро", ar: "إعادة ضبط بومودورو", it: "Reimposta Pomodoro", pt: "Redefinir Pomodoro", zh: "重置番茄钟" },
  resetCycle: { tr: "Döngüyü sıfırla", en: "Reset Cycle", de: "Zyklus zurücksetzen", fr: "Réinitialiser le cycle", es: "Restablecer ciclo", ru: "Сбросить цикл", ar: "إعادة ضبط الدورة", it: "Reimposta ciclo", pt: "Redefinir ciclo", zh: "重置周期" }
};

function t(key) {
  const lang = $("language")?.value || appState.language || "tr";
  if (!baseTranslations[key]) return key;
  return baseTranslations[key][lang] || baseTranslations[key].en || key;
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
      en: `Sound ${n}`,
      de: `Ton ${n}`,
      fr: `Son ${n}`,
      es: `Sonido ${n}`,
      ru: `Звук ${n}`,
      ar: `صوت ${n}`,
      it: `Suono ${n}`,
      pt: `Som ${n}`,
      zh: `声音 ${n}`
    }
  };
});

let selectedSoundId = "s1";

function getSelectedSound() {
  return SOUND_LIBRARY.find((s) => s.id === selectedSoundId) || SOUND_LIBRARY[0];
}

// ===============================
// UI TEXT UPDATES
// ===============================
function updateTimerStartButton() {
  const btn = $("timerStartBtn");
  if (!btn) return;
  btn.textContent = timerState.running ? t("running") : t("start");
}

function updateStopwatchStartButton() {
  const btn = $("swStartBtn");
  if (!btn) return;
  btn.textContent = stopwatchState.running ? t("pause") : t("start");
}

function updateSoundCount() {
  const el = $("soundCountLabel");
  if (!el) return;
  el.textContent = `${SOUND_LIBRARY.length} ${t("sounds")}`;
}

function getSoundDisplayName(sound) {
  const lang = $("language")?.value || appState.language || "tr";
  return sound?.name?.[lang] || sound?.name?.en || sound?.rawName || "Sound";
}

function applyLanguage() {
  const lang = $("language")?.value || "tr";
  appState.language = lang;
  document.documentElement.lang = lang;

  setText("tabTimer", "timer");
  setText("tabPomodoro", "pomodoro");
  setText("tabStopwatch", "stopwatch");
  setText("tabSounds", "sounds");

  updateTimerStartButton();
  setText("timerPauseBtn", "pause");
  setText("timerResetBtn", "reset");

  updateStopwatchStartButton();
  setText("swLapBtn", "lap");
  setText("swResetBtn", "reset");
  setText("swClearLapsBtn", "clearLaps");

  setText("hoursLabel", "hours");
  setText("minutesLabel", "minutes");
  setText("secondsLabel", "seconds");
  setText("workLabel", "workLabel");
  setText("breakLabel", "breakLabel");
  setText("soundLabel", "soundOn");
  setText("vibrationLabel", "vibrationOn");
  setText("subtitle", "subtitle");
  setText("soundsTitle", "soundsTitle");
  setText("soundsDesc", "soundsDesc");
  setText("previewSoundBtn", "previewSound");
  setText("pomodoroDesc", "pomodoroDesc");
  setText("applyPomodoroBtn", "applyPomodoro");
  setText("lapsTitle", "lapsTitle");
  setText("pomodoroResetBtn", "resetPomodoro");
  setText("pomodoroCycleResetBtn", "resetCycle");

  if (timerState.running) setText("timerStatus", "running");
  else if (timerState.paused) setText("timerStatus", "paused");
  else setText("timerStatus", "ready");

  if (stopwatchState.running) setText("stopwatchStatus", "running");
  else if (stopwatchState.elapsedMs > 0) setText("stopwatchStatus", "paused");
  else setText("stopwatchStatus", "ready");

  updateSoundCount();
  renderSounds();
  updatePomodoroUI();
}

// ===============================
// FOREGROUND / BACKGROUND
// ===============================
function isAppForeground() {
  return visibilityState.isForeground;
}

function isTimerExpired() {
  return timerState.endAt > 0 && nowMs() >= timerState.endAt;
}

async function syncNotificationWithAppState() {
  if (!timerState.running || timerState.timeLeft <= 0) {
    await cancelTimerNotification();
    return;
  }

  if (!isAppForeground()) {
    await scheduleTimerNotification(timerState.timeLeft);
  } else {
    await cancelTimerNotification();
  }
}

async function finishTimerInForeground() {
  timerState.timeLeft = 0;
  timerState.running = false;
  timerState.paused = false;
  timerState.endAt = 0;

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  updateTimerDisplay();
  setText("timerStatus", "done");
  updateTimerStartButton();

  await onTimerFinished();
}

async function handleAppForeground() {
  visibilityState.isForeground = true;
  await cancelTimerNotification();

  if (timerState.running && isTimerExpired()) {
    await finishTimerInForeground();
  }
}

async function handleAppBackground() {
  visibilityState.isForeground = false;

  if (timerState.running && timerState.timeLeft > 0) {
    await scheduleTimerNotification(timerState.timeLeft);
  }
}

async function setupVisibilityListeners() {
  if (visibilityState.listenersReady) return;

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      await handleAppForeground();
    } else {
      await handleAppBackground();
    }
  });

  if (CapacitorApp?.addListener) {
    try {
      await CapacitorApp.addListener("appStateChange", async ({ isActive }) => {
        if (isActive) {
          await handleAppForeground();
        } else {
          await handleAppBackground();
        }
      });
    } catch {}
  }

  visibilityState.listenersReady = true;
}

// ===============================
// NOTIFICATION / ALARM SETTINGS
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
    console.warn("request notification permission failed:", e);
    return false;
  }
}

async function ensureExactAlarmPermission() {
  if (!CapacitorLocalNotifications?.checkExactNotificationSetting) {
    notificationState.exactAlarmGranted = true;
    return true;
  }

  try {
    const exact = await CapacitorLocalNotifications.checkExactNotificationSetting();
    const granted = exact?.value === true || exact?.exact_alarm === "granted";

    if (granted) {
      notificationState.exactAlarmGranted = true;
      return true;
    }

    notificationState.exactAlarmGranted = false;

    if (CapacitorLocalNotifications.changeExactNotificationSetting) {
      await CapacitorLocalNotifications.changeExactNotificationSetting();
    }

    return false;
  } catch (e) {
    console.warn("Exact alarm permission check failed:", e);
    return false;
  }
}

// ===============================
// PREVIEW SOUND
// ===============================
async function previewSound(sound) {
  if (!$("soundToggle")?.checked) return;

  try {
    const preview = new Audio(sound.assetPath);
    preview.currentTime = 0;
    preview.loop = false;
    preview.volume = 1;
    preview.preload = "auto";
    preview.playsInline = true;
    await preview.play();
  } catch (e) {
    console.warn("Preview sound failed:", e);
  }
}

// ===============================
// NOTIFICATION CHANNELS
// ===============================
function getSoundChannelId(soundId) {
  return `timer_alerts_v5_${soundId}`;
}

function getNotificationChannelForCurrentSound() {
  const sound = getSelectedSound();
  if (!sound?.rawName) return "timer_alerts_fallback_v5";
  return getSoundChannelId(sound.id);
}

async function ensureNotificationChannels() {
  if (!CapacitorLocalNotifications) return;

  try {
    const existing = CapacitorLocalNotifications.listChannels
      ? await CapacitorLocalNotifications.listChannels()
      : { channels: [] };

    const existingIds = new Set((existing?.channels || []).map((c) => c.id));

    for (const sound of SOUND_LIBRARY) {
      const channelId = getSoundChannelId(sound.id);
      if (!existingIds.has(channelId)) {
        try {
          await CapacitorLocalNotifications.createChannel({
            id: channelId,
            name: `Timer ${sound.rawName}`,
            description: `Timer alerts - ${sound.rawName}`,
            importance: 5,
            visibility: 1,
            vibration: true,
            sound: fileNameWithoutExt(sound.assetPath)
          });
        } catch (e) {
          console.warn("createChannel failed", channelId, e);
        }
      }
    }

    if (!existingIds.has("timer_alerts_fallback_v5")) {
      try {
        await CapacitorLocalNotifications.createChannel({
          id: "timer_alerts_fallback_v5",
          name: "Timer fallback",
          description: "Fallback timer alerts",
          importance: 5,
          visibility: 1,
          vibration: true,
          sound: "beep"
        });
      } catch (e) {
        console.warn("fallback channel failed", e);
      }
    }
  } catch (e) {
    console.warn("ensureNotificationChannels failed:", e);
  }
}

async function registerNotificationActions() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.registerActionTypes({
      types: [
        {
          id: "TIMER_DONE",
          actions: [
            {
              id: "dismiss_timer",
              title: "Kapat"
            }
          ]
        }
      ]
    });
  } catch {}
}

// ===============================
// NOTIFICATIONS
// ===============================
async function scheduleTimerNotification(secondsFromNow) {
  if (!CapacitorLocalNotifications) return;
  if (!secondsFromNow || secondsFromNow <= 0) return;

  try {
    await cancelTimerNotification();

    await CapacitorLocalNotifications.schedule({
      notifications: [
        {
          id: notificationState.scheduledTimerNotificationId,
          title: t("notifTimerTitle"),
          body: t("notifTimerBody"),
          channelId: getNotificationChannelForCurrentSound(),
          actionTypeId: "TIMER_DONE",
          extra: {
            source: "timer",
            autoResetTimer: true,
            mode: timerState.mode
          },
          schedule: {
            at: new Date(nowMs() + secondsFromNow * 1000),
            allowWhileIdle: true
          }
        }
      ]
    });
  } catch (e) {
    console.warn("Schedule notification error:", e);
  }
}

async function showImmediateFinishedNotification() {
  if (!CapacitorLocalNotifications) return;

  try {
    await cancelTimerNotification();

    await CapacitorLocalNotifications.schedule({
      notifications: [
        {
          id: notificationState.scheduledTimerNotificationId,
          title: t("notifTimerTitle"),
          body: t("notifTimerBody"),
          channelId: getNotificationChannelForCurrentSound(),
          actionTypeId: "TIMER_DONE",
          extra: {
            source: "timer",
            autoResetTimer: true,
            mode: timerState.mode
          },
          schedule: {
            at: new Date(nowMs() + 300),
            allowWhileIdle: true
          }
        }
      ]
    });
  } catch (e) {
    console.warn("Immediate notification error:", e);
  }
}

async function cancelTimerNotification() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.cancel({
      notifications: [{ id: notificationState.scheduledTimerNotificationId }]
    });
  } catch {}
}

function hardResetTimerState() {
  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.endAt = 0;
  timerState.mode = "timer";

  alarmState.pendingPomodoroAdvance = false;
  pomodoroState.enabled = false;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  setText("timerStatus", "ready");
  updateTimerStartButton();

  saveTimerState();
  savePomodoroState();
}

async function setupNotificationListeners() {
  if (!CapacitorLocalNotifications || notificationState.listenersReady) return;

  try {
    await CapacitorLocalNotifications.addListener(
      "localNotificationReceived",
      async (event) => {
        const id = event?.id ?? event?.notification?.id;
        if (id !== notificationState.scheduledTimerNotificationId) return;

        if (timerState.running || timerState.timeLeft > 0) {
          timerState.timeLeft = 0;
          timerState.running = false;
          timerState.paused = false;
          timerState.endAt = 0;

          clearInterval(timerState.timerId);
          timerState.timerId = null;

          updateTimerDisplay();
          setText("timerStatus", "done");
          updateTimerStartButton();
          saveTimerState();
        }
      }
    );

    await CapacitorLocalNotifications.addListener(
      "localNotificationActionPerformed",
      async (event) => {
        const notificationId = event?.notification?.id;
        const actionId = event?.actionId;

        if (notificationId !== notificationState.scheduledTimerNotificationId) return;

        if (actionId === "dismiss_timer" || !actionId) {
          try {
            if (notificationId) {
              await CapacitorLocalNotifications.removeDeliveredNotifications({
                notifications: [{ id: notificationId }]
              });
            }
          } catch {}

          await cancelTimerNotification();

          const shouldAdvancePomodoro =
            timerState.mode === "pomodoro" &&
            pomodoroState.enabled === true &&
            pomodoroState.autoAdvance === true &&
            alarmState.pendingPomodoroAdvance === true;

          alarmState.pendingPomodoroAdvance = false;

          if (shouldAdvancePomodoro) {
            handlePomodoroSwitch();
          } else {
            timerState.mode = "timer";
            saveTimerState();
            savePomodoroState();
          }
        }
      }
    );

    notificationState.listenersReady = true;
  } catch (e) {
    console.warn("Notification listeners failed:", e);
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
    ring.style.background = `conic-gradient(var(--ring-rest) 0deg 360deg)`;
    return;
  }

  const completed = timerState.totalTime - timerState.timeLeft;
  const progress = Math.max(0, Math.min(1, completed / timerState.totalTime));
  const deg = progress * 360;

  ring.style.background = `conic-gradient(
    var(--primary) 0deg,
    var(--secondary) ${deg}deg,
    var(--ring-rest) ${deg}deg 360deg
  )`;
}

function updateTimerDisplay() {
  const el = $("timerDisplay");
  if (el) el.textContent = formatTime(Math.max(0, timerState.timeLeft));
  updateTimerRing();
}

function timerTick() {
  if (!timerState.running) return;

  const now = nowMs();
  timerState.timeLeft = Math.max(0, Math.ceil((timerState.endAt - now) / 1000));

  if (timerState.timeLeft <= 0) {
    timerState.timeLeft = 0;
    timerState.running = false;
    timerState.paused = false;
    timerState.endAt = 0;

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

async function startTimer(fromPomodoro = false) {
  if (timerState.running) return;

  if (timerState.paused && timerState.timeLeft > 0) {
    await resumeTimer();
    return;
  }

  const h = safeNumber($("hours")?.value);
  const m = safeNumber($("minutes")?.value);
  const s = safeNumber($("seconds")?.value);
  const total = h * 3600 + m * 60 + s;

  if (total <= 0) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  if (fromPomodoro) {
    timerState.mode = "pomodoro";
  } else {
    timerState.mode = "timer";
    pomodoroState.enabled = false;
    alarmState.pendingPomodoroAdvance = false;
    savePomodoroState();
  }

  const notifGranted = await requestNotificationPermission();
  if (!notifGranted) return;

  const exactGranted = await ensureExactAlarmPermission();
  if (!exactGranted) return;

  timerState.totalTime = total;
  timerState.timeLeft = total;
  timerState.running = true;
  timerState.paused = false;
  timerState.endAt = nowMs() + total * 1000;

  updateTimerDisplay();
  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  saveTimerState();

  await syncNotificationWithAppState();
}

async function pauseTimer() {
  if (!timerState.running) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
  timerState.paused = true;
  timerState.endAt = 0;

  await cancelTimerNotification();
  setText("timerStatus", "paused");
  updateTimerStartButton();
  saveTimerState();
}

async function resumeTimer() {
  if (!timerState.paused && timerState.timeLeft <= 0) return;

  const exactGranted = await ensureExactAlarmPermission();
  if (!exactGranted) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = true;
  timerState.paused = false;
  timerState.endAt = nowMs() + timerState.timeLeft * 1000;
  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  updateTimerDisplay();

  await syncNotificationWithAppState();
  saveTimerState();
}

async function resetTimer() {
  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.endAt = 0;
  timerState.mode = "timer";

  pomodoroState.enabled = false;
  alarmState.pendingPomodoroAdvance = false;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  await cancelTimerNotification();

  setText("timerStatus", "ready");
  updateTimerStartButton();

  saveTimerState();
  savePomodoroState();
}

async function onTimerFinished() {
  alarmState.pendingPomodoroAdvance =
    timerState.mode === "pomodoro" &&
    pomodoroState.enabled === true &&
    pomodoroState.autoAdvance === true;

  await showImmediateFinishedNotification();

  updateTimerStartButton();
  saveTimerState();
}

// ===============================
// QUICK BUTTONS
// ===============================
function setupQuickButtons() {
  const buttons = $$(".quick-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      pomodoroState.enabled = false;
      alarmState.pendingPomodoroAdvance = false;
      timerState.mode = "timer";

      if ($("hours")) $("hours").value = btn.dataset.h || 0;
      if ($("minutes")) $("minutes").value = btn.dataset.m || 0;
      if ($("seconds")) $("seconds").value = btn.dataset.s || 0;

      savePomodoroState();
      saveTimerState();
      updatePomodoroUI();
    });
  });
}

// ===============================
// POMODORO ENGINE
// ===============================
function applyPomodoro() {
  const work = safeNumber($("pomodoroWork")?.value, 25);
  const brk = safeNumber($("pomodoroBreak")?.value, 5);

  if (work <= 0 || brk <= 0) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.endAt = 0;
  timerState.mode = "pomodoro";

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;
  alarmState.pendingPomodoroAdvance = false;

  loadPomodoroPhase();
  updatePomodoroUI();
  savePomodoroState();

  startTimer(true);
}

function loadPomodoroPhase() {
  const minutes = pomodoroState.phase === "work"
    ? pomodoroState.workMinutes
    : pomodoroState.breakMinutes;

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
  savePomodoroState();

  setTimeout(() => {
    if (pomodoroState.enabled) {
      startTimer(true);
    }
  }, 300);
}

async function resetPomodoro() {
  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.endAt = 0;
  timerState.mode = "timer";

  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = 25;
  pomodoroState.breakMinutes = 5;
  pomodoroState.cycleCount = 0;
  alarmState.pendingPomodoroAdvance = false;

  if ($("pomodoroWork")) $("pomodoroWork").value = 25;
  if ($("pomodoroBreak")) $("pomodoroBreak").value = 5;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  await cancelTimerNotification();

  setText("timerStatus", "ready");
  updateTimerStartButton();
  updatePomodoroUI();

  savePomodoroState();
  saveTimerState();
}

function resetPomodoroCycle() {
  pomodoroState.cycleCount = 0;
  setPomodoroStatus();
  savePomodoroState();
}

function updatePomodoroUI() {
  const title = $("pomodoroTitle");
  if (!title) return;

  title.textContent = `${t("pomodoro")} - ${pomodoroState.phase === "work" ? t("work") : t("break")}`;
  setPomodoroStatus();
}

function setPomodoroStatus() {
  const el = $("pomodoroStatus");
  if (!el) return;

  const cycle = pomodoroState.cycleCount || 0;

  if (!pomodoroState.enabled) {
    el.textContent = `${t("ready")} • ${t("cycle")}: ${cycle}`;
    return;
  }

  const phaseText = pomodoroState.phase === "work" ? t("work") : t("break");
  el.textContent = `${phaseText} • ${t("cycle")}: ${cycle}`;
}

// ===============================
// STOPWATCH
// ===============================
function formatStopwatch(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  return (
    hours.toString().padStart(2, "0") + ":" +
    minutes.toString().padStart(2, "0") + ":" +
    seconds.toString().padStart(2, "0") + "." +
    tenths
  );
}

function updateStopwatchDisplay() {
  const el = $("stopwatchDisplay");
  if (!el) return;

  const current = stopwatchState.running
    ? stopwatchState.elapsedMs + (nowMs() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;

  el.textContent = formatStopwatch(current);
}

function stopwatchTick() {
  if (!stopwatchState.running) return;
  updateStopwatchDisplay();
}

function toggleStopwatch() {
  if (!stopwatchState.running) {
    stopwatchState.running = true;
    stopwatchState.lastStart = nowMs();

    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = setInterval(stopwatchTick, 50);

    setText("stopwatchStatus", "running");
  } else {
    stopwatchState.running = false;

    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = null;

    stopwatchState.elapsedMs += nowMs() - stopwatchState.lastStart;
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

  const display = $("stopwatchDisplay");
  if (display) display.textContent = "00:00:00.0";

  setText("stopwatchStatus", "ready");
  updateStopwatchStartButton();
  saveStopwatchState();
}

function clearLaps() {
  stopwatchState.laps = [];
  renderLaps();
  saveStopwatchState();
}

function addLap() {
  const currentTime = stopwatchState.running
    ? stopwatchState.elapsedMs + (nowMs() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;

  stopwatchState.laps.unshift(currentTime);
  if (stopwatchState.laps.length > 100) {
    stopwatchState.laps = stopwatchState.laps.slice(0, 100);
  }
  renderLaps();
  saveStopwatchState();
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

// ===============================
// TABS
// ===============================
function switchTab(targetId) {
  const panels = $$(".panel");
  const tabs = $$(".tab-btn");

  panels.forEach((p) => p.classList.remove("active"));
  tabs.forEach((t) => t.classList.remove("active"));

  const targetPanel = $(targetId);
  if (targetPanel) targetPanel.classList.add("active");

  const targetTab = document.querySelector(`[data-tab="${targetId}"]`);
  if (targetTab) targetTab.classList.add("active");

  appState.lastTab = targetId;
  saveAppState();
}

function setupTabs() {
  const tabs = $$(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });
}

function ensureValidPanel() {
  const panels = $$(".panel");
  const found = [...panels].some((p) => p.classList.contains("active"));
  if (!found) switchTab("timerPanel");
}

// ===============================
// STORAGE
// ===============================
function saveAppState() {
  localStorage.setItem(STORAGE_KEYS.app, JSON.stringify({
    language: $("language")?.value || "tr",
    theme: "dark",
    lastTab: appState.lastTab
  }));
}

function loadAppState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.app));
  if (!data) return;

  if (data.language && $("language")) {
    $("language").value = data.language;
    appState.language = data.language;
  }

  if (data.lastTab) appState.lastTab = data.lastTab;
}

function saveTimerState() {
  localStorage.setItem(STORAGE_KEYS.timer, JSON.stringify({
    timeLeft: timerState.timeLeft,
    totalTime: timerState.totalTime,
    running: timerState.running,
    paused: timerState.paused,
    endAt: timerState.endAt,
    mode: timerState.mode
  }));
}

function loadTimerState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.timer));
  if (!data) return;

  timerState.totalTime = data.totalTime || 0;
  timerState.endAt = data.endAt || 0;
  timerState.mode = data.mode || "timer";

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  if (data.running && data.endAt) {
    const remaining = Math.max(0, Math.ceil((data.endAt - nowMs()) / 1000));
    timerState.timeLeft = remaining;

    if (remaining > 0) {
      timerState.running = true;
      timerState.paused = false;
      timerState.timerId = setInterval(timerTick, 250);
    } else {
      timerState.running = false;
      timerState.paused = false;
      timerState.endAt = 0;
    }
  } else {
    timerState.timeLeft = data.timeLeft || 0;
    timerState.running = false;
    timerState.paused = (data.timeLeft || 0) > 0;
  }

  updateTimerDisplay();
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
  if (saved && SOUND_LIBRARY.some((s) => s.id === saved)) {
    selectedSoundId = saved;
  }
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

  el.addEventListener(event, async (e) => {
    try {
      await handler(e);
    } catch (err) {
      console.error("Event error:", err);
    }
  });
}

function toggleTheme() {
  return;
}

function setupPomodoroPresets() {
  const presets = $$(".preset-btn");

  presets.forEach((btn) => {
    btn.addEventListener("click", () => {
      presets.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if ($("pomodoroWork")) $("pomodoroWork").value = btn.dataset.work || 25;
      if ($("pomodoroBreak")) $("pomodoroBreak").value = btn.dataset.break || 5;
    });
  });
}

function renderSounds() {
  const list = $("soundList");
  if (!list) return;

  list.innerHTML = "";
  const fragment = document.createDocumentFragment();

  SOUND_LIBRARY.forEach((sound) => {
    const item = document.createElement("label");
    item.className = "sound-item";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "alarmSound";
    radio.value = sound.id;
    radio.checked = sound.id === selectedSoundId;

    radio.addEventListener("change", async () => {
      selectedSoundId = sound.id;
      saveSoundState();

      if (!isAppForeground() && timerState.running && timerState.timeLeft > 0) {
        await scheduleTimerNotification(timerState.timeLeft);
      }
    });

    const name = document.createElement("span");
    name.textContent = getSoundDisplayName(sound);

    item.appendChild(radio);
    item.appendChild(name);
    fragment.appendChild(item);
  });

  list.appendChild(fragment);
  updateSoundCount();
}

function initEvents() {
  bind("timerStartBtn", "click", async () => {
    await startTimer(false);
  });

  bind("timerPauseBtn", "click", pauseTimer);
  bind("timerResetBtn", "click", resetTimer);

  bind("applyPomodoroBtn", "click", async () => {
    applyPomodoro();
  });

  bind("pomodoroResetBtn", "click", resetPomodoro);
  bind("pomodoroCycleResetBtn", "click", async () => resetPomodoroCycle());

  bind("swStartBtn", "click", async () => toggleStopwatch());
  bind("swLapBtn", "click", async () => addLap());
  bind("swResetBtn", "click", async () => resetStopwatch());
  bind("swClearLapsBtn", "click", async () => clearLaps());

  bind("previewSoundBtn", "click", async () => {
    await previewSound(getSelectedSound());
  });

  bind("language", "change", async () => {
    applyLanguage();
    saveAppState();
  });

  bind("themeToggle", "click", async () => toggleTheme());
}

// ===============================
// UI LOOP
// ===============================
function startUIRenderLoop() {
  function loop() {
    if (timerState.running) updateTimerDisplay();
    if (stopwatchState.running) updateStopwatchDisplay();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// ===============================
// INIT
// ===============================
async function detectAvailableSoundFiles() {
  const found = [];

  async function exists(path) {
    try {
      const res = await fetch(path, { method: "HEAD", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  }

  for (let i = 1; i <= 20; i++) {
    const wav = `sound${i}.wav`;
    const mp3 = `sound${i}.mp3`;

    if (await exists(wav)) found.push(wav);
    else if (await exists(mp3)) found.push(mp3);
  }

  if (await exists("beep.wav")) found.push("beep.wav");
  else if (await exists("beep.mp3")) found.push("beep.mp3");

  window.__availableSoundFiles = found;
}

async function initApp() {
  if (appState.initialized) return;

  try {
    await detectAvailableSoundFiles();

    restoreAllState();
    setupTabs();
    ensureValidPanel();
    initEvents();
    setupPomodoroPresets();
    setupQuickButtons();
    renderSounds();

    await ensureNotificationChannels();
    await registerNotificationActions();
    await setupNotificationListeners();
    await setupVisibilityListeners();
    await requestNotificationPermission();
    await ensureExactAlarmPermission();

    applyLanguage();
    updateTimerDisplay();
    updateStopwatchDisplay();
    updateTimerStartButton();
    updateStopwatchStartButton();
    updatePomodoroUI();

    switchTab(appState.lastTab || "timerPanel");
    startUIRenderLoop();
    await syncNotificationWithAppState();

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

function onReady(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

onReady(initApp);
console.log("🔥 APP FULLY READY");
