// ===============================
// CAPACITOR
// ===============================
const CapacitorLocalNotifications =
  window.Capacitor?.Plugins?.LocalNotifications || null;

// ===============================
// HELPERS
// ===============================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function resolveAssetPath(path) {
  if (!path) return "";
  try {
    return new URL(path, window.location.href).href;
  } catch {
    return path;
  }
}

// ===============================
// NOTIFICATION STATE
// ===============================
const notificationState = {
  permissionGranted: false,
  scheduledTimerNotificationId: 1001,
  channelId: "timer_alerts"
};

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
  lastTick: 0,
  endAt: 0
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
  pendingPomodoroAdvance: false,
  htmlAudio: null,
  previewAudio: null,
  htmlAudioUnlocked: false,
  currentPreviewSoundId: null
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
    ru: "Звук включен", ar: "الصوت مفعل", it: "Suono attivo", pt: "Som ligado", zh: "声音开启"
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
    tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!",
    ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！"
  },
  notifTimerBody: {
    tr: "Bildirime dokunarak zamanlayıcıyı kapat",
    en: "Tap the notification to clear the timer",
    de: "Tippe auf die Benachrichtigung, um den Timer zu beenden",
    fr: "Touchez la notification pour arrêter le minuteur",
    es: "Toca la notificación para cerrar el temporizador",
    ru: "Нажмите на уведомление, чтобы сбросить таймер",
    ar: "اضغط على الإشعار لإيقاف المؤقت",
    it: "Tocca la notifica per chiudere il timer",
    pt: "Toque na notificação para limpar o temporizador",
    zh: "点击通知以清除计时器"
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
  },
  resetPomodoro: {
    tr: "Pomodoroyu sıfırla", en: "Reset Pomodoro", de: "Pomodoro zurücksetzen", fr: "Réinitialiser Pomodoro", es: "Restablecer Pomodoro",
    ru: "Сбросить Помодоро", ar: "إعادة ضبط بومودورو", it: "Reimposta Pomodoro", pt: "Redefinir Pomodoro", zh: "重置番茄钟"
  },
  resetCycle: {
    tr: "Döngüyü sıfırla", en: "Reset Cycle", de: "Zyklus zurücksetzen", fr: "Réinitialiser le cycle", es: "Restablecer ciclo",
    ru: "Сбросить цикл", ar: "إعادة ضبط الدورة", it: "Reimposta ciclo", pt: "Redefinir ciclo", zh: "重置周期"
  }
};

// ===============================
// SOUND LABEL GENERATOR
// ===============================
const soundNameParts = {
  tr: {
    adjectives: ["Kristal", "Sıcak", "Derin", "Dijital", "Yumuşak", "Cam", "Yankılı", "Sakin", "Parlak", "Zen"],
    nouns: ["Çan", "Çınlama", "Gong", "Bip", "Marimba", "Tını", "Nabız", "Uyarı", "Alarm", "Kase"]
  },
  en: {
    adjectives: ["Crystal", "Warm", "Deep", "Digital", "Soft", "Glass", "Echo", "Calm", "Bright", "Zen"],
    nouns: ["Bell", "Chime", "Gong", "Beep", "Marimba", "Ping", "Pulse", "Alert", "Alarm", "Bowl"]
  },
  de: {
    adjectives: ["Kristall", "Warm", "Tief", "Digital", "Sanft", "Glas", "Echo", "Ruhig", "Hell", "Zen"],
    nouns: ["Glocke", "Klang", "Gong", "Piepton", "Marimba", "Ton", "Puls", "Alarm", "Signal", "Schale"]
  },
  fr: {
    adjectives: ["Cristal", "Chaud", "Profond", "Numérique", "Doux", "Verre", "Écho", "Calme", "Clair", "Zen"],
    nouns: ["Cloche", "Carillon", "Gong", "Bip", "Marimba", "Tonalité", "Pulse", "Alerte", "Alarme", "Bol"]
  },
  es: {
    adjectives: ["Cristal", "Cálido", "Profundo", "Digital", "Suave", "Vidrio", "Eco", "Calmo", "Brillante", "Zen"],
    nouns: ["Campana", "Campanada", "Gong", "Bip", "Marimba", "Tono", "Pulso", "Alerta", "Alarma", "Cuenco"]
  },
  ru: {
    adjectives: ["Хрустальный", "Теплый", "Глубокий", "Цифровой", "Мягкий", "Стеклянный", "Эхо", "Спокойный", "Яркий", "Дзен"],
    nouns: ["Колокол", "Звон", "Гонг", "Бип", "Маримба", "Тон", "Пульс", "Тревога", "Сигнал", "Чаша"]
  },
  ar: {
    adjectives: ["كريستالي", "دافئ", "عميق", "رقمي", "ناعم", "زجاجي", "صدى", "هادئ", "ساطع", "زن"],
    nouns: ["جرس", "رنين", "جونغ", "بيب", "ماريمبا", "نغمة", "نبض", "تنبيه", "إنذار", "وعاء"]
  },
  it: {
    adjectives: ["Cristallo", "Caldo", "Profondo", "Digitale", "Morbido", "Vetro", "Eco", "Calmo", "Luminoso", "Zen"],
    nouns: ["Campana", "Rintocco", "Gong", "Bip", "Marimba", "Tono", "Impulso", "Avviso", "Allarme", "Ciotola"]
  },
  pt: {
    adjectives: ["Cristal", "Quente", "Profundo", "Digital", "Suave", "Vidro", "Eco", "Calmo", "Brilhante", "Zen"],
    nouns: ["Sino", "Toque", "Gongo", "Bipe", "Marimba", "Tom", "Pulso", "Alerta", "Alarme", "Tigela"]
  },
  zh: {
    adjectives: ["水晶", "温暖", "深沉", "数字", "柔和", "玻璃", "回声", "安静", "明亮", "禅意"],
    nouns: ["铃声", "钟声", "铜锣", "提示音", "马林巴", "轻响", "脉冲", "提醒", "警报", "钵声"]
  }
};

function getLocalizedSoundName(index) {
  const lang = $("language")?.value || appState.language || "en";
  const dict = soundNameParts[lang] || soundNameParts.en;

  const adjIndex = Math.floor((index - 1) / 10);
  const nounIndex = (index - 1) % 10;

  const adj = dict.adjectives[adjIndex] || dict.adjectives[0];
  const noun = dict.nouns[nounIndex] || dict.nouns[0];

  return `${adj} ${noun}`;
}

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

// ===============================
// APPLY LANGUAGE
// ===============================
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
  setText("pomodoroResetBtn", "resetPomodoro");
  setText("pomodoroCycleResetBtn", "resetCycle");

  const skipBtn = $("pomodoroSkipBtn");
  if (skipBtn) skipBtn.style.display = "none";

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
const SOUND_COUNT = 50;
let selectedSoundId = "s1";

const soundBlueprints = [
  { kind: "crystal", type: "sine", base: 1040, overtone: 1560, tail: 2080, duration: 0.42, volume: 0.50 },
  { kind: "warm", type: "triangle", base: 540, overtone: 810, tail: 1080, duration: 0.55, volume: 0.52 },
  { kind: "gong", type: "sine", base: 220, overtone: 330, tail: 440, duration: 0.80, volume: 0.60 },
  { kind: "digital", type: "square", base: 880, overtone: 1320, tail: 1760, duration: 0.20, volume: 0.54 },
  { kind: "marimba", type: "triangle", base: 660, overtone: 990, tail: 1320, duration: 0.36, volume: 0.50 },
  { kind: "glass", type: "sine", base: 1280, overtone: 1920, tail: 2560, duration: 0.24, volume: 0.48 },
  { kind: "echo", type: "triangle", base: 480, overtone: 720, tail: 960, duration: 0.50, volume: 0.50 },
  { kind: "calm", type: "sine", base: 420, overtone: 630, tail: 840, duration: 0.48, volume: 0.48 },
  { kind: "bright", type: "sawtooth", base: 940, overtone: 1410, tail: 1880, duration: 0.22, volume: 0.56 },
  { kind: "zen", type: "sine", base: 320, overtone: 480, tail: 640, duration: 0.90, volume: 0.58 }
];

for (let i = 1; i <= SOUND_COUNT; i++) {
  const bp = soundBlueprints[(i - 1) % soundBlueprints.length];
  const groupIndex = Math.floor((i - 1) / 10);
  const detune = groupIndex * 12;
  const durationBoost = (groupIndex % 5) * 0.03;

  sounds.push({
    id: "s" + i,
    index: i,
    kind: bp.kind,
    type: bp.type,
    volume: Math.min(0.72, bp.volume + groupIndex * 0.015),
    duration: bp.duration + durationBoost,
    assetPath: `sound${i}.mp3`,
    audioAvailable: null,
    probeInFlight: false,
    seq: [
      bp.base + detune,
      bp.overtone + detune * 1.2,
      bp.tail + detune * 1.5
    ]
  });
}

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  if (!alarmState.audioContext) {
    alarmState.audioContext = new Ctx();
  }

  if (alarmState.audioContext.state === "suspended") {
    alarmState.audioContext.resume().catch(() => {});
  }

  return alarmState.audioContext;
}

async function ensureHtmlAudioUnlocked() {
  if (alarmState.htmlAudioUnlocked) return true;

  try {
    if (!alarmState.htmlAudio) {
      alarmState.htmlAudio = new Audio();
    }

    const silentDataUri =
      "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAGhgD///////////////////////////////////////////////8AAAA5TEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnj3l7bQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    alarmState.htmlAudio.src = silentDataUri;
    alarmState.htmlAudio.muted = true;
    await alarmState.htmlAudio.play();
    alarmState.htmlAudio.pause();
    alarmState.htmlAudio.currentTime = 0;
    alarmState.htmlAudio.muted = false;
    alarmState.htmlAudioUnlocked = true;
    return true;
  } catch {
    return false;
  }
}

function stopHtmlAudio() {
  if (!alarmState.htmlAudio) return;
  try {
    alarmState.htmlAudio.pause();
    alarmState.htmlAudio.currentTime = 0;
    alarmState.htmlAudio.loop = false;
    alarmState.htmlAudio.removeAttribute("src");
    alarmState.htmlAudio.load();
  } catch {}
}

function stopPreviewAudio() {
  if (!alarmState.previewAudio) return;
  try {
    alarmState.previewAudio.pause();
    alarmState.previewAudio.currentTime = 0;
    alarmState.previewAudio.removeAttribute("src");
    alarmState.previewAudio.load();
  } catch {}
  alarmState.previewAudio = null;
}

function probeSoundAsset(sound) {
  if (!sound || !sound.assetPath) {
    if (sound) sound.audioAvailable = false;
    return;
  }

  if (sound.audioAvailable === true || sound.probeInFlight) return;

  sound.probeInFlight = true;

  const audio = new Audio();
  audio.preload = "auto";
  audio.src = resolveAssetPath(sound.assetPath);

  let resolved = false;

  const success = () => {
    if (resolved) return;
    resolved = true;
    sound.audioAvailable = true;
    sound.probeInFlight = false;
    cleanup();
  };

  const fail = () => {
    if (resolved) return;
    resolved = true;
    sound.audioAvailable = false;
    sound.probeInFlight = false;
    cleanup();
  };

  const cleanup = () => {
    audio.removeEventListener("loadedmetadata", success);
    audio.removeEventListener("canplay", success);
    audio.removeEventListener("canplaythrough", success);
    audio.removeEventListener("error", fail);
    audio.removeEventListener("abort", fail);
    audio.removeEventListener("stalled", fail);
    audio.removeEventListener("suspend", fail);
  };

  audio.addEventListener("loadedmetadata", success, { once: true });
  audio.addEventListener("canplay", success, { once: true });
  audio.addEventListener("canplaythrough", success, { once: true });
  audio.addEventListener("error", fail, { once: true });
  audio.addEventListener("abort", fail, { once: true });
  audio.addEventListener("stalled", fail, { once: true });
  audio.addEventListener("suspend", fail, { once: true });

  try {
    audio.load();
    setTimeout(() => {
      if (!resolved) fail();
    }, 3000);
  } catch {
    sound.audioAvailable = false;
    sound.probeInFlight = false;
  }
}

async function playRealSoundOnce(sound, loop = false) {
  if (!sound) return false;
  if (!$("soundToggle")?.checked) return false;
  if (!sound.assetPath) return false;

  await ensureHtmlAudioUnlocked();

  const src = resolveAssetPath(sound.assetPath);

  try {
    if (loop) {
      stopHtmlAudio();

      if (!alarmState.htmlAudio) {
        alarmState.htmlAudio = new Audio();
      }

      const audio = alarmState.htmlAudio;
      audio.src = src;
      audio.loop = true;
      audio.currentTime = 0;
      audio.volume = 1;
      audio.preload = "auto";
      audio.playsInline = true;

      await audio.play();
      sound.audioAvailable = true;
      return true;
    }

    stopPreviewAudio();

    const audio = new Audio();
    alarmState.previewAudio = audio;

    audio.src = src;
    audio.loop = false;
    audio.currentTime = 0;
    audio.volume = 1;
    audio.preload = "auto";
    audio.playsInline = true;

    await audio.play();
    sound.audioAvailable = true;

    audio.addEventListener("ended", () => {
      if (alarmState.previewAudio === audio) {
        stopPreviewAudio();
      }
    }, { once: true });

    return true;
  } catch (e) {
    console.warn("Real sound play failed:", sound.assetPath, e);
    sound.audioAvailable = false;
    return false;
  }
}

function playSynthPattern(sound, mode = "preview") {
  if (!sound) return;
  if (!$("soundToggle")?.checked) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = mode === "preview" ? 1.9 : 1.7;
  master.connect(ctx.destination);

  const playTone = (freq, start, dur, type, gainValue, filterType, filterFreq, q) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, start);
    filter.Q.setValueAtTime(q, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(start);
    osc.stop(start + dur + 0.02);
  };

  const base = sound.seq[0];
  const over = sound.seq[1];
  const tail = sound.seq[2];

  if (sound.kind === "crystal") {
    playTone(base, now + 0.00, 0.45, "sine", 0.45, "highpass", 1200, 10);
    playTone(over, now + 0.16, 0.32, "sine", 0.22, "highpass", 1600, 12);
    playTone(tail, now + 0.40, 0.24, "sine", 0.16, "highpass", 1800, 12);
  } else if (sound.kind === "warm") {
    playTone(base, now + 0.00, 0.55, "triangle", 0.50, "lowpass", 1200, 3);
    playTone(over, now + 0.26, 0.40, "triangle", 0.20, "lowpass", 1000, 2);
  } else if (sound.kind === "gong") {
    playTone(base, now + 0.00, 0.90, "sine", 0.58, "lowpass", 900, 2);
    playTone(over, now + 0.10, 0.80, "sine", 0.24, "lowpass", 1100, 2);
    playTone(tail, now + 0.24, 0.60, "sine", 0.12, "bandpass", 800, 3);
  } else if (sound.kind === "digital") {
    playTone(base, now + 0.00, 0.12, "square", 0.46, "highpass", 900, 6);
    playTone(over, now + 0.18, 0.12, "square", 0.40, "highpass", 1000, 6);
    playTone(tail, now + 0.36, 0.12, "square", 0.34, "highpass", 1200, 6);
  } else if (sound.kind === "marimba") {
    playTone(base, now + 0.00, 0.30, "triangle", 0.46, "bandpass", 1400, 5);
    playTone(over, now + 0.20, 0.24, "triangle", 0.22, "bandpass", 1600, 5);
    playTone(tail, now + 0.42, 0.18, "triangle", 0.16, "bandpass", 1800, 5);
  } else if (sound.kind === "glass") {
    playTone(base, now + 0.00, 0.28, "sine", 0.44, "highpass", 1500, 12);
    playTone(over, now + 0.12, 0.20, "sine", 0.20, "highpass", 1800, 12);
    playTone(tail, now + 0.26, 0.14, "sine", 0.10, "highpass", 2200, 12);
  } else if (sound.kind === "echo") {
    playTone(base, now + 0.00, 0.38, "triangle", 0.42, "bandpass", 1400, 4);
    playTone(over, now + 0.34, 0.28, "triangle", 0.22, "bandpass", 1600, 4);
    playTone(tail, now + 0.64, 0.18, "triangle", 0.12, "bandpass", 1800, 4);
  } else if (sound.kind === "calm") {
    playTone(base, now + 0.00, 0.52, "sine", 0.40, "lowpass", 900, 2);
    playTone(over, now + 0.28, 0.34, "sine", 0.18, "lowpass", 1100, 2);
  } else if (sound.kind === "bright") {
    playTone(base, now + 0.00, 0.16, "sawtooth", 0.46, "bandpass", 2200, 8);
    playTone(over, now + 0.20, 0.16, "sawtooth", 0.40, "bandpass", 2400, 8);
    playTone(tail, now + 0.40, 0.16, "sawtooth", 0.34, "bandpass", 2600, 8);
  } else if (sound.kind === "zen") {
    playTone(base, now + 0.00, 1.00, "sine", 0.54, "lowpass", 700, 2);
    playTone(over, now + 0.18, 0.70, "sine", 0.18, "lowpass", 900, 2);
    playTone(tail, now + 0.42, 0.46, "sine", 0.10, "lowpass", 1100, 2);
  }
}

async function playSoundOnce(sound, mode = "preview") {
  if (!sound) return;
  if (!$("soundToggle")?.checked) return;

  try {
    if (sound.audioAvailable === null) {
      probeSoundAsset(sound);
    }

    if (sound.audioAvailable === true) {
      let ok = await playRealSoundOnce(sound, mode === "alarm");
      if (ok) return;

      await new Promise((resolve) => setTimeout(resolve, 120));
      ok = await playRealSoundOnce(sound, mode === "alarm");
      if (ok) return;
    }

    playSynthPattern(sound, mode);
  } catch (e) {
    console.warn("playSoundOnce fallback:", e);
    playSynthPattern(sound, mode);
  }
}

function previewSound(sound) {
  stopAlarmLoop();
  stopPreviewAudio();
  alarmState.currentPreviewSoundId = sound?.id || null;
  playSoundOnce(sound, "preview");
}

function getSelectedSound() {
  return sounds.find(s => s.id === selectedSoundId) || sounds[0];
}

function startAlarmLoop() {
  stopAlarmLoop();
  alarmState.active = true;

  const selected = getSelectedSound();
  if (selected.audioAvailable === null) {
    probeSoundAsset(selected);
  }

  if (selected.audioAvailable === true) {
    playRealSoundOnce(selected, true).then((ok) => {
      if (!ok && alarmState.active) {
        startSynthAlarmLoop();
      }
    });
    return;
  }

  startSynthAlarmLoop();
}

function startSynthAlarmLoop() {
  alarmState.intervalId = setInterval(() => {
    const now = Date.now();
    if (now - alarmState.lastPlay < 1200) return;
    alarmState.lastPlay = now;

    playSoundOnce(getSelectedSound(), "alarm");

    if ($("vibrationToggle")?.checked && navigator.vibrate) {
      navigator.vibrate([260, 90, 260, 90, 320]);
    }
  }, 1350);
}

function stopAlarmLoop() {
  if (alarmState.intervalId) {
    clearInterval(alarmState.intervalId);
    alarmState.intervalId = null;
  }

  stopHtmlAudio();
  stopPreviewAudio();
  alarmState.active = false;

  if (navigator.vibrate) navigator.vibrate(0);
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
  if (overlay) overlay.classList.add("hidden");

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
    name.textContent = getLocalizedSoundName(sound.index);

    item.appendChild(radio);
    item.appendChild(name);
    fragment.appendChild(item);
  });

  list.appendChild(fragment);
  updateSoundCount();
}

function restoreSelectedSound() {
  const saved = localStorage.getItem(STORAGE_KEYS.sound);
  if (saved) selectedSoundId = saved;
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
  sounds.forEach(probeSoundAsset);
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
  } catch {
    return false;
  }
}

async function createNotificationChannel() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.createChannel({
      id: notificationState.channelId,
      name: "Timer Alerts",
      description: "Timer finished alerts",
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: "beep.wav"
    });
  } catch {}
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
              id: "open_timer",
              title: "Open"
            }
          ]
        }
      ]
    });
  } catch {}
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
          largeBody: t("notifTimerBody"),
          channelId: notificationState.channelId,
          actionTypeId: "TIMER_DONE",
          extra: {
            source: "timer",
            autoResetTimer: true
          },
          schedule: {
            at: new Date(Date.now() + secondsFromNow * 1000),
            allowWhileIdle: true
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
  } catch {}
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
          channelId: notificationState.channelId,
          actionTypeId: "TIMER_DONE",
          extra: {
            source: "timer",
            autoResetTimer: true
          },
          schedule: { at: new Date(Date.now() + 300) }
        }
      ]
    });
  } catch {}
}

async function setupNotificationListeners() {
  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.addListener(
      "localNotificationActionPerformed",
      async (event) => {
        const notificationId = event?.notification?.id;

        clearInterval(timerState.timerId);
        timerState.timerId = null;

        timerState.running = false;
        timerState.paused = false;
        timerState.timeLeft = 0;
        timerState.totalTime = 0;
        timerState.lastTick = 0;
        timerState.endAt = 0;

        alarmState.pendingPomodoroAdvance = false;
        stopAlarmLoop();

        const overlay = $("alarmOverlay");
        if (overlay) overlay.classList.add("hidden");
        unlockUI();

        const display = $("timerDisplay");
        if (display) display.textContent = "00:00:00";

        if ($("hours")) $("hours").value = 0;
        if ($("minutes")) $("minutes").value = 0;
        if ($("seconds")) $("seconds").value = 0;

        updateTimerRing();
        setText("timerStatus", "ready");
        updateTimerStartButton();

        try {
          if (notificationId) {
            await CapacitorLocalNotifications.removeDeliveredNotifications({
              notifications: [{ id: notificationId }]
            });
          } else {
            await CapacitorLocalNotifications.removeAllDeliveredNotifications();
          }
        } catch {}

        await cancelTimerNotification();
        saveTimerState();
      }
    );
  } catch {}
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
  if (el) el.textContent = formatTime(Math.max(0, timerState.timeLeft));
  updateTimerRing();
}

function timerTick() {
  if (!timerState.running) return;

  const now = Date.now();

  if (timerState.endAt > 0) {
    timerState.timeLeft = Math.max(0, Math.ceil((timerState.endAt - now) / 1000));
  } else {
    const delta = Math.floor((now - timerState.lastTick) / 1000);
    if (delta <= 0) return;
    timerState.lastTick = now;
    timerState.timeLeft -= delta;
  }

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

function startTimer() {
  if (timerState.running) return;

  if (timerState.paused && timerState.timeLeft > 0) {
    resumeTimer();
    return;
  }

  const h = safeNumber($("hours")?.value);
  const m = safeNumber($("minutes")?.value);
  const s = safeNumber($("seconds")?.value);
  const total = h * 3600 + m * 60 + s;

  if (total <= 0) return;

  clearInterval(timerState.timerId);

  timerState.totalTime = total;
  timerState.timeLeft = total;
  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = Date.now();
  timerState.endAt = Date.now() + total * 1000;

  updateTimerDisplay();
  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  saveTimerState();

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
  timerState.endAt = 0;

  cancelTimerNotification();
  setText("timerStatus", "paused");
  updateTimerStartButton();
  saveTimerState();
}

function resumeTimer() {
  if (!timerState.paused && timerState.timeLeft <= 0) return;

  clearInterval(timerState.timerId);

  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = Date.now();
  timerState.endAt = Date.now() + timerState.timeLeft * 1000;
  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  updateTimerDisplay();

  scheduleTimerNotification(timerState.timeLeft);
  saveTimerState();
}

function resetTimer() {
  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.lastTick = 0;
  timerState.endAt = 0;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  const display = $("timerDisplay");
  if (display) display.textContent = "00:00:00";

  updateTimerRing();
  cancelTimerNotification();

  setText("timerStatus", "ready");
  updateTimerStartButton();
  saveTimerState();
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

  saveTimerState();
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
  const work = safeNumber($("pomodoroWork")?.value, 25);
  const brk = safeNumber($("pomodoroBreak")?.value, 5);
  if (work <= 0 || brk <= 0) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
  timerState.paused = false;
  timerState.endAt = 0;
  alarmState.pendingPomodoroAdvance = false;

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;

  loadPomodoroPhase();
  setPomodoroStatus();
  startTimer();
  savePomodoroState();
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
    startTimer();
  }, 350);
}

function resetPomodoro() {
  clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
  timerState.paused = false;
  timerState.timeLeft = 0;
  timerState.totalTime = 0;
  timerState.lastTick = 0;
  timerState.endAt = 0;

  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  alarmState.pendingPomodoroAdvance = false;

  if ($("pomodoroWork")) $("pomodoroWork").value = 25;
  if ($("pomodoroBreak")) $("pomodoroBreak").value = 5;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  const display = $("timerDisplay");
  if (display) display.textContent = "00:00:00";

  updateTimerRing();
  cancelTimerNotification();
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

  const cycle = pomodoroState.cycleCount || 0;

  if (!pomodoroState.enabled) {
    el.textContent = `${t("ready")} • ${t("cycle")}: ${cycle}`;
    return;
  }

  const phaseText = pomodoroState.phase === "work" ? t("work") : t("break");
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
  saveStopwatchState();
}

function clearLaps() {
  stopwatchState.laps = [];
  renderLaps();
  saveStopwatchState();
}

function addLap() {
  const currentTime = stopwatchState.running
    ? stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;

  stopwatchState.laps.unshift(currentTime);
  limitLaps(100);
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

function limitLaps(max = 50) {
  if (stopwatchState.laps.length > max) {
    stopwatchState.laps = stopwatchState.laps.slice(0, max);
  }
}

setInterval(() => {
  if (stopwatchState.running) limitLaps(100);
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
  if (targetPanel) targetPanel.classList.add("active");

  const targetTab = document.querySelector(`[data-tab="${targetId}"]`);
  if (targetTab) targetTab.classList.add("active");

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
    if (p.classList.contains("active")) found = true;
  });

  if (!found) switchTab("timerPanel");
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
  localStorage.setItem(STORAGE_KEYS.timer, JSON.stringify({
    timeLeft: timerState.timeLeft,
    totalTime: timerState.totalTime,
    running: timerState.running,
    paused: timerState.paused,
    endAt: timerState.endAt
  }));
}

function loadTimerState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.timer));
  if (!data) return;

  timerState.timeLeft = data.timeLeft || 0;
  timerState.totalTime = data.totalTime || 0;
  timerState.endAt = data.endAt || 0;

  if (data.running && data.endAt) {
    const remaining = Math.max(0, Math.ceil((data.endAt - Date.now()) / 1000));
    timerState.timeLeft = remaining;
    timerState.running = false;
    timerState.paused = remaining > 0;
  } else {
    timerState.running = false;
    timerState.paused = data.timeLeft > 0;
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
  bind("timerStartBtn", "click", async () => {
    await ensureHtmlAudioUnlocked();
    startTimer();
  });

  bind("timerPauseBtn", "click", pauseTimer);
  bind("timerResetBtn", "click", resetTimer);

  bind("applyPomodoroBtn", "click", async () => {
    await ensureHtmlAudioUnlocked();
    applyPomodoro();
  });

  bind("pomodoroResetBtn", "click", resetPomodoro);
  bind("pomodoroCycleResetBtn", "click", resetPomodoroCycle);

  bind("swStartBtn", "click", toggleStopwatch);
  bind("swLapBtn", "click", addLap);
  bind("swResetBtn", "click", resetStopwatch);
  bind("swClearLapsBtn", "click", clearLaps);

  bind("dismissAlarmBtn", "click", dismissAlarm);

  bind("previewSoundBtn", "click", async () => {
    await ensureHtmlAudioUnlocked();
    previewSound(getSelectedSound());
  });

  bind("language", "change", () => {
    applyLanguage();
    saveAppState();
  });

  bind("themeToggle", "click", toggleTheme);

  document.addEventListener("touchstart", () => {
    ensureHtmlAudioUnlocked();
  }, { once: true });

  document.addEventListener("click", () => {
    ensureHtmlAudioUnlocked();
  }, { once: true });
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
async function initApp() {
  if (appState.initialized) return;

  try {
    restoreAllState();

    initTabs();
    initEvents();
    initSoundSystem();
    setupPomodoroPresets();
    setupQuickButtons();

    await createNotificationChannel();
    await registerNotificationActions();
    await setupNotificationListeners();

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

onReady(() => {
  initApp();
});

console.log("🔥 APP FULLY READY");
