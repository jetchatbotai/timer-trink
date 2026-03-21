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
  lastPlay: 0,
  pendingPomodoroAdvance: false
};

// ===============================
// LANGUAGES
// ===============================
const supportedLanguages = [
  "tr", "en", "de", "fr", "es", "ru", "ar", "it", "pt", "zh"
];

// ===============================
// TRANSLATIONS
// ===============================
const baseTranslations = {
  start: {
    tr: "Başlat", en: "Start", de: "Start", fr: "Démarrer", es: "Iniciar",
    ru: "Старт", ar: "ابدأ", it: "Avvia", pt: "Iniciar", zh: "开始"
  },
  pause: {
    tr: "Duraklat", en: "Pause", de: "Pause", fr: "Pause", es: "Pausar",
    ru: "Пауза", ar: "إيقاف مؤقت", it: "Pausa", pt: "Pausar", zh: "暂停"
  },
  reset: {
    tr: "Sıfırla", en: "Reset", de: "Zurücksetzen", fr: "Réinitialiser", es: "Restablecer",
    ru: "Сброс", ar: "إعادة تعيين", it: "Reimposta", pt: "Redefinir", zh: "重置"
  },
  ready: {
    tr: "Hazır", en: "Ready", de: "Bereit", fr: "Prêt", es: "Listo",
    ru: "Готово", ar: "جاهز", it: "Pronto", pt: "Pronto", zh: "就绪"
  },
  running: {
    tr: "Çalışıyor", en: "Running", de: "Läuft", fr: "En cours", es: "En marcha",
    ru: "Работает", ar: "قيد التشغيل", it: "In esecuzione", pt: "Em andamento", zh: "运行中"
  },
  paused: {
    tr: "Duraklatıldı", en: "Paused", de: "Pausiert", fr: "En pause", es: "Pausado",
    ru: "На паузе", ar: "متوقف مؤقتًا", it: "In pausa", pt: "Pausado", zh: "已暂停"
  },
  done: {
    tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!",
    ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！"
  },
  preview: {
    tr: "Dinle", en: "Preview", de: "Anhören", fr: "Écouter", es: "Escuchar",
    ru: "Прослушать", ar: "معاينة", it: "Ascolta", pt: "Ouvir", zh: "试听"
  },
  dismissAlarm: {
    tr: "Kapat", en: "Dismiss", de: "Schließen", fr: "Fermer", es: "Cerrar",
    ru: "Закрыть", ar: "إغلاق", it: "Chiudi", pt: "Fechar", zh: "关闭"
  },
  sounds: {
    tr: "ses", en: "sounds", de: "Töne", fr: "sons", es: "sonidos",
    ru: "звуков", ar: "أصوات", it: "suoni", pt: "sons", zh: "种声音"
  },
  hours: {
    tr: "Saat", en: "Hours", de: "Stunden", fr: "Heures", es: "Horas",
    ru: "Часы", ar: "الساعات", it: "Ore", pt: "Horas", zh: "小时"
  },
  minutes: {
    tr: "Dakika", en: "Minutes", de: "Minuten", fr: "Minutes", es: "Minutos",
    ru: "Минуты", ar: "الدقائق", it: "Minuti", pt: "Minutos", zh: "分钟"
  },
  seconds: {
    tr: "Saniye", en: "Seconds", de: "Sekunden", fr: "Secondes", es: "Segundos",
    ru: "Секунды", ar: "الثواني", it: "Secondi", pt: "Segundos", zh: "秒"
  },
  lap: {
    tr: "Tur", en: "Lap", de: "Runde", fr: "Tour", es: "Vuelta",
    ru: "Круг", ar: "لفة", it: "Giro", pt: "Volta", zh: "圈"
  },
  stopwatch: {
    tr: "Kronometre", en: "Stopwatch", de: "Stoppuhr", fr: "Chronomètre", es: "Cronómetro",
    ru: "Секундомер", ar: "ساعة إيقاف", it: "Cronometro", pt: "Cronômetro", zh: "秒表"
  },
  timer: {
    tr: "Zamanlayıcı", en: "Timer", de: "Timer", fr: "Minuteur", es: "Temporizador",
    ru: "Таймер", ar: "المؤقت", it: "Timer", pt: "Temporizador", zh: "计时器"
  },
  pomodoro: {
    tr: "Pomodoro", en: "Pomodoro", de: "Pomodoro", fr: "Pomodoro", es: "Pomodoro",
    ru: "Помодоро", ar: "بومودورو", it: "Pomodoro", pt: "Pomodoro", zh: "番茄钟"
  },
  soundOn: {
    tr: "Ses açık", en: "Sound on", de: "Ton an", fr: "Son activé", es: "Sonido activado",
    ru: "Звук açık", ar: "الصوت مفعل", it: "Suono attivo", pt: "Som ligado", zh: "声音开启"
  },
  vibrationOn: {
    tr: "Titreşim açık", en: "Vibration on", de: "Vibration an", fr: "Vibration activée", es: "Vibración activada",
    ru: "Вибрация включена", ar: "الاهتزاز مفعل", it: "Vibrazione attiva", pt: "Vibração ligada", zh: "振动开启"
  },
  alarmTitle: {
    tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!",
    ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！"
  },
  alarmMsg: {
    tr: "Alarm çalıyor", en: "Alarm ringing", de: "Alarm klingelt", fr: "Alarme en cours", es: "La alarma está sonando",
    ru: "Будильник звонит", ar: "المنبه يرن", it: "La sveglia sta suonando", pt: "Alarme tocando", zh: "闹铃响起"
  },
  notifTimerTitle: {
    tr: "Timer Trink", en: "Timer Trink", de: "Timer Trink", fr: "Timer Trink", es: "Timer Trink",
    ru: "Timer Trink", ar: "Timer Trink", it: "Timer Trink", pt: "Timer Trink", zh: "Timer Trink"
  },
  notifTimerBody: {
    tr: "Süre doldu", en: "Time is up", de: "Zeit ist um", fr: "Le temps est écoulé", es: "Se acabó el tiempo",
    ru: "Время вышло", ar: "انتهى الوقت", it: "Tempo scaduto", pt: "O tempo acabou", zh: "时间到了"
  },
  work: {
    tr: "Çalışma", en: "Work", de: "Arbeit", fr: "Travail", es: "Trabajo",
    ru: "Работа", ar: "عمل", it: "Lavoro", pt: "Trabalho", zh: "工作"
  },
  break: {
    tr: "Mola", en: "Break", de: "Pause", fr: "Pause", es: "Descanso",
    ru: "Перерыв", ar: "استراحة", it: "Pausa", pt: "Pausa", zh: "休息"
  },
  cycle: {
    tr: "Döngü", en: "Cycle", de: "Zyklus", fr: "Cycle", es: "Ciclo",
    ru: "Цикл", ar: "دورة", it: "Ciclo", pt: "Ciclo", zh: "周期"
  },
  subtitle: {
    tr: "Odaklanma ve günlük kullanım için basit zamanlayıcı",
    en: "Simple timer for focus and daily use",
    de: "Einfacher Timer für Fokus und den Alltag",
    fr: "Minuteur simple pour la concentration et l'usage quotidien",
    es: "Temporizador simple para concentración y uso diario",
    ru: "Простой таймер для концентрации и повседневного использования",
    ar: "مؤقت بسيط للتركيز والاستخدام اليومي",
    it: "Timer semplice per concentrazione e uso quotidiano",
    pt: "Temporizador simples para foco e uso diário",
    zh: "适合专注和日常使用的简易计时器"
  },
  soundsTitle: {
    tr: "Alarm sesleri", en: "Alarm sounds", de: "Alarmtöne", fr: "Sons d'alarme", es: "Sonidos de alarma",
    ru: "Звуки будильника", ar: "أصوات المنبه", it: "Suoni della sveglia", pt: "Sons de alarme", zh: "闹铃声音"
  },
  soundsDesc: {
    tr: "Bir ses seç ve önizlemesini dinle.",
    en: "Select a sound and preview it.",
    de: "Wähle einen Ton und höre ihn an.",
    fr: "Sélectionnez un son et écoutez un aperçu.",
    es: "Selecciona un sonido y escúchalo.",
    ru: "Выберите звук и прослушайте его.",
    ar: "اختر صوتًا واستمع إلى المعاينة.",
    it: "Seleziona un suono e ascolta l'anteprima.",
    pt: "Selecione um som e ouça a prévia.",
    zh: "选择一个声音并试听。"
  },
  previewSound: {
    tr: "Sesi dinle", en: "Preview sound", de: "Ton anhören", fr: "Écouter le son", es: "Escuchar sonido",
    ru: "Прослушать звук", ar: "معاينة الصوت", it: "Ascolta il suono", pt: "Ouvir som", zh: "试听声音"
  },
  pomodoroDesc: {
    tr: "Bir odak süresi seç ve zamanlayıcıya uygula.",
    en: "Choose a focus preset and load it into timer.",
    de: "Wähle eine Fokus-Voreinstellung und lade sie in den Timer.",
    fr: "Choisissez un préréglage de concentration et appliquez-le au minuteur.",
    es: "Elige una configuración de enfoque y cárgala en el temporizador.",
    ru: "Выберите пресет для фокуса и загрузите его в таймер.",
    ar: "اختر إعداد تركيز وطبقه على المؤقت.",
    it: "Scegli una modalità di concentrazione e applicala al timer.",
    pt: "Escolha uma predefinição de foco e aplique ao temporizador.",
    zh: "选择一个专注预设并应用到计时器。"
  },
  applyPomodoro: {
    tr: "Pomodoro uygula", en: "Apply Pomodoro", de: "Pomodoro anwenden", fr: "Appliquer Pomodoro", es: "Aplicar Pomodoro",
    ru: "Применить Помодоро", ar: "تطبيق بومودورو", it: "Applica Pomodoro", pt: "Aplicar Pomodoro", zh: "应用番茄钟"
  },
  lapsTitle: {
    tr: "Turlar", en: "Laps", de: "Runden", fr: "Tours", es: "Vueltas",
    ru: "Круги", ar: "اللفات", it: "Giri", pt: "Voltas", zh: "圈数"
  },
  clearLaps: {
    tr: "Turları temizle", en: "Clear Laps", de: "Runden löschen", fr: "Effacer les tours", es: "Borrar vueltas",
    ru: "Очистить круги", ar: "مسح اللفات", it: "Cancella giri", pt: "Limpar voltas", zh: "清除圈数"
  },
  workLabel: {
    tr: "Çalışma", en: "Work", de: "Arbeit", fr: "Travail", es: "Trabajo",
    ru: "Работа", ar: "عمل", it: "Lavoro", pt: "Trabalho", zh: "工作"
  },
  breakLabel: {
    tr: "Mola", en: "Break", de: "Pause", fr: "Pause", es: "Descanso",
    ru: "Перерыв", ar: "استراحة", it: "Pausa", pt: "Pausa", zh: "休息"
  }
};

// ===============================
// TRANSLATION ENGINE
// ===============================
function t(key) {
  const lang = $("language")?.value || appState.language || "en";
  if (!baseTranslations[key]) return key;
  return baseTranslations[key][lang] || baseTranslations[key].en || key;
}

function setText(id, key) {
  const el = $(id);
  if (el) el.textContent = t(key);
}

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

function applyLanguage() {
  const lang = $("language")?.value || "en";
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

  setText("dismissAlarmBtn", "dismissAlarm");

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

  if (timerState.running) {
    setText("timerStatus", "running");
  } else if (timerState.paused) {
    setText("timerStatus", "paused");
  } else {
    setText("timerStatus", "ready");
  }

  if (stopwatchState.running) {
    setText("stopwatchStatus", "running");
  } else if (stopwatchState.elapsedMs > 0) {
    setText("stopwatchStatus", "paused");
  } else {
    setText("stopwatchStatus", "ready");
  }

  updateSoundCount();
  renderSounds();
  updatePomodoroUI();
}

// ===============================
// SOUND SYSTEM
// ===============================
const sounds = [];
const SOUND_COUNT = 60;
let selectedSoundId = "s1";

const soundFamilies = [
  {
    key: "crystal",
    type: "sine",
    makeSeq: (i) => [620 + i * 4, 880 + i * 2, 1180 + i]
  },
  {
    key: "bell",
    type: "triangle",
    makeSeq: (i) => [320 + i * 6, 480 + i * 5, 720 + i * 4]
  },
  {
    key: "pulse",
    type: "square",
    makeSeq: (i) => [240 + i * 9, 240 + i * 9, 510 + i * 6, 510 + i * 6]
  },
  {
    key: "wave",
    type: "sawtooth",
    makeSeq: (i) => [180 + i * 7, 360 + i * 5, 240 + i * 8, 520 + i * 4]
  },
  {
    key: "echo",
    type: "sine",
    makeSeq: (i) => [410 + i * 5, 300 + i * 2, 560 + i * 7, 420 + i * 3]
  },
  {
    key: "spark",
    type: "triangle",
    makeSeq: (i) => [900 + i * 3, 660 + i * 2, 1040 + i * 4]
  }
];

const soundDescriptors = [
  "soft", "deep", "bright", "calm", "swift",
  "clear", "warm", "silver", "night", "fresh"
];

for (let i = 1; i <= SOUND_COUNT; i++) {
  const family = soundFamilies[(i - 1) % soundFamilies.length];
  const duration = 0.08 + ((i - 1) % 4) * 0.035;
  const volume = 0.08 + ((i - 1) % 5) * 0.025;

  sounds.push({
    id: "s" + i,
    index: i,
    descriptor: soundDescriptors[Math.floor((i - 1) / soundFamilies.length) % soundDescriptors.length],
    family: family.key,
    type: family.type,
    volume,
    stepDuration: duration,
    seq: family.makeSeq(i)
  });
}

const soundNameTranslations = {
  tr: {
    soft: "Yumuşak",
    deep: "Derin",
    bright: "Parlak",
    calm: "Sakin",
    swift: "Hızlı",
    clear: "Berrak",
    warm: "Sıcak",
    silver: "Gümüş",
    night: "Gece",
    fresh: "Taze",
    crystal: "Kristal",
    bell: "Çan",
    pulse: "Nabız",
    wave: "Dalga",
    echo: "Yankı",
    spark: "Kıvılcım"
  },
  en: {
    soft: "Soft",
    deep: "Deep",
    bright: "Bright",
    calm: "Calm",
    swift: "Swift",
    clear: "Clear",
    warm: "Warm",
    silver: "Silver",
    night: "Night",
    fresh: "Fresh",
    crystal: "Crystal",
    bell: "Bell",
    pulse: "Pulse",
    wave: "Wave",
    echo: "Echo",
    spark: "Spark"
  }
};

function getLocalizedToken(token) {
  const lang = $("language")?.value || appState.language || "en";
  const dict = soundNameTranslations[lang] || soundNameTranslations.en;
  return dict[token] || token;
}

function formatSoundName(sound) {
  return `${getLocalizedToken(sound.descriptor)} ${getLocalizedToken(sound.family)}`;
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

  const now = ctx.currentTime;

  sound.seq.forEach((freq, index) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = sound.type;

      const startAt = now + index * sound.stepDuration;
      const endAt = startAt + sound.stepDuration * 0.86;

      osc.frequency.setValueAtTime(freq, startAt);

      if (sound.family === "echo") {
        osc.frequency.linearRampToValueAtTime(freq * 0.75, endAt);
      } else if (sound.family === "spark") {
        osc.frequency.linearRampToValueAtTime(freq * 1.18, endAt);
      } else if (sound.family === "wave") {
        osc.frequency.linearRampToValueAtTime(freq * 1.08, startAt + sound.stepDuration * 0.35);
        osc.frequency.linearRampToValueAtTime(freq * 0.82, endAt);
      }

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.linearRampToValueAtTime(sound.volume, startAt + 0.018);
      gain.gain.linearRampToValueAtTime(sound.volume * 0.45, startAt + sound.stepDuration * 0.45);
      gain.gain.linearRampToValueAtTime(0.0001, endAt);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(endAt + 0.02);
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
    if (now - alarmState.lastPlay < 650) return;

    alarmState.lastPlay = now;
    playSoundOnce(getSelectedSound());

    if ($("vibrationToggle")?.checked && navigator.vibrate) {
      navigator.vibrate([250, 100, 250, 100, 250]);
    }
  }, 1000);
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

function lockUIWhileAlarm() {
  document.body.classList.add("alarm-active");
}

function unlockUI() {
  document.body.classList.remove("alarm-active");
}

function dismissAlarm() {
  stopAlarmLoop();

  const overlay = $("alarmOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }

  unlockUI();

  if (alarmState.pendingPomodoroAdvance) {
    alarmState.pendingPomodoroAdvance = false;
    handlePomodoroSwitch();
  }
}

function updateSoundCount() {
  const el = $("soundCountLabel");
  if (!el) return;
  el.textContent = `${sounds.length} ${t("sounds")}`;
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
    name.textContent = formatSoundName(sound);

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
    timerState.paused = false;

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
    alarmState.pendingPomodoroAdvance = true;
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

  clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
  timerState.paused = false;
  alarmState.pendingPomodoroAdvance = false;

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;
  pomodoroState.cycleCount = 0;

  loadPomodoroPhase();
  setPomodoroStatus();

  startTimer();
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
  }, 350);
}

function updatePomodoroUI() {
  const title = $("pomodoroTitle");
  if (!title) return;

  if (pomodoroState.phase === "work") {
    title.textContent = `${t("pomodoro")} - ${t("work")}`;
  } else {
    title.textContent = `${t("pomodoro")} - ${t("break")}`;
  }

  setPomodoroStatus();
}

function setPomodoroStatus() {
  const el = $("pomodoroStatus");
  if (!el) return;

  const phaseText = pomodoroState.phase === "work" ? t("work") : t("break");
  const cycle = pomodoroState.cycleCount;

  el.textContent = `${phaseText} • ${t("cycle")}: ${cycle}`;
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
  alarmState.pendingPomodoroAdvance = false;

  const el = $("pomodoroStatus");
  if (el) el.textContent = t("ready");

  updatePomodoroUI();
}

function onTimerResetPomodoro() {
  if (!pomodoroState.enabled) return;
  disablePomodoro();
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

  const display = $("stopwatchDisplay");
  if (display) display.textContent = "00:00:00.0";

  setText("stopwatchStatus", "ready");
  updateStopwatchStartButton();
}

function clearLaps() {
  stopwatchState.laps = [];
  renderLaps();
}

function addLap() {
  const currentTime = stopwatchState.running
    ? stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;

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
  saveAppState();
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
  ensureValidPanel();
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

function toggleTheme() {
  document.body.classList.toggle("light");
  saveAppState();
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
  bind("swClearLapsBtn", "click", clearLaps);

  bind("dismissAlarmBtn", "click", dismissAlarm);

  bind("previewSoundBtn", "click", () => {
    previewSound(getSelectedSound());
  });

  bind("language", "change", () => {
    applyLanguage();
    saveAppState();
  });

  bind("themeToggle", "click", toggleTheme);
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
function initApp() {
  if (appState.initialized) return;

  try {
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

    switchTab(appState.lastTab || "timerPanel");
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

function onReady(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

onReady(initApp);

console.log("🔥 APP FULLY READY");
