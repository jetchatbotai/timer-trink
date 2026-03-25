// ===============================
// CAPACITOR
// ===============================
const CapacitorLocalNotifications =
  window.Capacitor?.Plugins?.LocalNotifications || null;
const CapacitorApp =
  window.Capacitor?.Plugins?.App || null;
const CapacitorHaptics =
  window.Capacitor?.Plugins?.Haptics || null;

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

function resolveAssetPath(path) {
  if (!path) return "";
  try {
    return new URL(path, window.location.href).href;
  } catch {
    return path;
  }
}

function nowMs() {
  return Date.now();
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
// NOTIFICATION STATE
// ===============================
const notificationState = {
  permissionGranted: false,
  scheduledTimerNotificationId: 1001,
  listenersReady: false
};

// ===============================
// VISIBILITY STATE
// ===============================
const visibilityState = {
  isForeground: document.visibilityState === "visible",
  listenersReady: false
};

// ===============================
// APP STATE
// ===============================
const appState = {
  initialized: false,
  language: "tr",
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
  endAt: 0,
  mode: "timer" // "timer" | "pomodoro"
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
  cycleCount: 0,
  autoAdvance: true
};

// ===============================
// ALARM STATE
// ===============================
const alarmState = {
  soundIntervalId: null,
  vibrationIntervalId: null,
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
    tr: "Bildirime dokunarak alarmı kapat",
    en: "Tap the notification to stop the alarm",
    de: "Tippe auf die Benachrichtigung, um den Alarm zu stoppen",
    fr: "Touchez la notification pour arrêter l'alarme",
    es: "Toca la notificación para detener la alarma",
    ru: "Нажмите уведомление, чтобы остановить сигнал",
    ar: "اضغط على الإشعار لإيقاف المنبه",
    it: "Tocca la notifica per fermare l'allarme",
    pt: "Toque na notificação para parar o alarme",
    zh: "点击通知以停止闹铃"
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
    ru: "Сбросить Помодоро", ar: "إعادة ضبط بومодورو", it: "Reimposta Pomodoro", pt: "Redefinir Pomodoro", zh: "重置番茄钟"
  },
  resetCycle: {
    tr: "Döngüyü sıfırla", en: "Reset Cycle", de: "Zyklus zurücksetzen", fr: "Réinitialiser le cycle", es: "Restablecer ciclo",
    ru: "Сбросить цикл", ar: "إعادة ضبط الدورة", it: "Reimposta ciclo", pt: "Redefinir ciclo", zh: "重置周期"
  }
};

// ===============================
// 20 UNIQUE SOUNDS
// ===============================
const SOUND_LIBRARY = [
  { id: "s1", rawName: "sound1", assetPath: "sound1.mp3", kind: "crystal", seq: [1040, 1560, 2080], name: { tr: "Kristal Çan", en: "Crystal Bell", de: "Kristallglocke", fr: "Cloche Cristal", es: "Campana Cristal", ru: "Хрустальный колокол", ar: "جرس كريستالي", it: "Campana di Cristallo", pt: "Sino de Cristal", zh: "水晶铃声" } },
  { id: "s2", rawName: "sound2", assetPath: "sound2.mp3", kind: "glass", seq: [1260, 1820, 2440], name: { tr: "Gece Zili", en: "Night Bell", de: "Nachtglocke", fr: "Cloche Nocturne", es: "Campana Nocturna", ru: "Ночной колокол", ar: "جرس ليلي", it: "Campana Notturna", pt: "Sino Noturno", zh: "夜铃" } },
  { id: "s3", rawName: "sound3", assetPath: "sound3.mp3", kind: "gong", seq: [220, 330, 440], name: { tr: "Derin Gong", en: "Deep Gong", de: "Tiefer Gong", fr: "Gong Profond", es: "Gong Profundo", ru: "Глубокий гонг", ar: "غونغ عميق", it: "Gong Profondo", pt: "Gongo Profundo", zh: "深沉铜锣" } },
  { id: "s4", rawName: "sound4", assetPath: "sound4.mp3", kind: "digital", seq: [880, 1320, 1760], name: { tr: "Dijital Bip", en: "Digital Beep", de: "Digitaler Piepton", fr: "Bip Numérique", es: "Bip Digital", ru: "Цифровой сигнал", ar: "بيب رقمي", it: "Bip Digitale", pt: "Bipe Digital", zh: "数字提示音" } },
  { id: "s5", rawName: "sound5", assetPath: "sound5.mp3", kind: "marimba", seq: [660, 990, 1320], name: { tr: "Marimba Işık", en: "Marimba Light", de: "Marimba Licht", fr: "Marimba Lumière", es: "Marimba Luz", ru: "Светлая маримба", ar: "ماريمبا مضيئة", it: "Marimba Luce", pt: "Marimba Luz", zh: "马林巴轻音" } },
  { id: "s6", rawName: "sound6", assetPath: "sound6.mp3", kind: "echo", seq: [480, 720, 960], name: { tr: "Yankı Uyarı", en: "Echo Alert", de: "Echo Alarm", fr: "Alerte Écho", es: "Alerta Eco", ru: "Эхо-сигнал", ar: "تنبيه صدى", it: "Avviso Eco", pt: "Alerta Eco", zh: "回声提醒" } },
  { id: "s7", rawName: "sound7", assetPath: "sound7.mp3", kind: "calm", seq: [420, 630, 840], name: { tr: "Sakin Tını", en: "Calm Tone", de: "Ruhiger Ton", fr: "Ton Calme", es: "Tono Calmo", ru: "Спокойный тон", ar: "نغمة هادئة", it: "Tono Calmo", pt: "Tom Calmo", zh: "安静音色" } },
  { id: "s8", rawName: "sound8", assetPath: "sound8.mp3", kind: "bright", seq: [940, 1410, 1880], name: { tr: "Parlak Alarm", en: "Bright Alarm", de: "Heller Alarm", fr: "Alarme Brillante", es: "Alarma Brillante", ru: "Яркий сигнал", ar: "إنذار ساطع", it: "Allarme Brillante", pt: "Alarme Brilhante", zh: "明亮警报" } },
  { id: "s9", rawName: "sound9", assetPath: "sound9.mp3", kind: "zen", seq: [320, 480, 640], name: { tr: "Zen Kase", en: "Zen Bowl", de: "Zen-Schale", fr: "Bol Zen", es: "Cuenco Zen", ru: "Дзен-чаша", ar: "وعاء زن", it: "Ciotola Zen", pt: "Tigela Zen", zh: "禅意钵声" } },
  { id: "s10", rawName: "sound10", assetPath: "sound10.mp3", kind: "warm", seq: [540, 810, 1080], name: { tr: "Sıcak Çınlama", en: "Warm Chime", de: "Warmer Klang", fr: "Carillon Chaleureux", es: "Campanilla Cálida", ru: "Тёплый звон", ar: "رنين دافئ", it: "Rintocco Caldo", pt: "Toque Quente", zh: "温暖钟声" } },
  { id: "s11", rawName: "sound11", assetPath: "sound11.mp3", kind: "glass", seq: [1330, 1880, 2550], name: { tr: "Buz Camı", en: "Ice Glass", de: "Eisglas", fr: "Verre de Glace", es: "Cristal Helado", ru: "Ледяное стекло", ar: "زجاج جليدي", it: "Vetro Ghiaccio", pt: "Vidro de Gelo", zh: "冰晶玻璃" } },
  { id: "s12", rawName: "sound12", assetPath: "sound12.mp3", kind: "gong", seq: [260, 390, 520], name: { tr: "Ay Gongu", en: "Moon Gong", de: "Mondgong", fr: "Gong Lunaire", es: "Gong Lunar", ru: "Лунный гонг", ar: "غونغ القمر", it: "Gong Lunare", pt: "Gongo Lunar", zh: "月光铜锣" } },
  { id: "s13", rawName: "sound13", assetPath: "sound13.mp3", kind: "digital", seq: [990, 1485, 1980], name: { tr: "Kısa Bip", en: "Short Beep", de: "Kurzer Piepton", fr: "Bip Court", es: "Bip Corto", ru: "Короткий сигнал", ar: "بيب قصير", it: "Bip Breve", pt: "Bipe Curto", zh: "短促提示音" } },
  { id: "s14", rawName: "sound14", assetPath: "sound14.mp3", kind: "marimba", seq: [610, 915, 1220], name: { tr: "Ahşap Marimba", en: "Wood Marimba", de: "Holz-Marimba", fr: "Marimba Bois", es: "Marimba de Madera", ru: "Деревянная маримба", ar: "ماريمبا خشبية", it: "Marimba in Legno", pt: "Marimba de Madeira", zh: "木质马林巴" } },
  { id: "s15", rawName: "sound15", assetPath: "sound15.mp3", kind: "echo", seq: [450, 675, 900], name: { tr: "Uzun Yankı", en: "Long Echo", de: "Langes Echo", fr: "Long Écho", es: "Eco Largo", ru: "Долгое эхо", ar: "صدى طويل", it: "Eco Lungo", pt: "Eco Longo", zh: "长回声" } },
  { id: "s16", rawName: "sound16", assetPath: "sound16.mp3", kind: "calm", seq: [360, 540, 720], name: { tr: "Sakin Nabız", en: "Calm Pulse", de: "Ruhiger Puls", fr: "Pouls Calme", es: "Pulso Calmado", ru: "Спокойный пульс", ar: "نبض هادئ", it: "Impulso Calmo", pt: "Pulso Calmo", zh: "平静脉冲" } },
  { id: "s17", rawName: "sound17", assetPath: "sound17.mp3", kind: "bright", seq: [1020, 1530, 2040], name: { tr: "Mavi Işık", en: "Blue Light", de: "Blaues Licht", fr: "Lumière Bleue", es: "Luz Azul", ru: "Синий свет", ar: "ضوء أزرق", it: "Luce Blu", pt: "Luz Azul", zh: "蓝色光芒" } },
  { id: "s18", rawName: "sound18", assetPath: "sound18.mp3", kind: "zen", seq: [280, 420, 560], name: { tr: "Zen Derin", en: "Zen Deep", de: "Zen Tief", fr: "Zen Profond", es: "Zen Profundo", ru: "Глубокий дзен", ar: "زن عميق", it: "Zen Profondo", pt: "Zen Profundo", zh: "深沉禅音" } },
  { id: "s19", rawName: "sound19", assetPath: "sound19.mp3", kind: "crystal", seq: [1180, 1680, 2240], name: { tr: "Kristal Şafak", en: "Crystal Dawn", de: "Kristalldämmerung", fr: "Aube Cristal", es: "Amanecer Cristal", ru: "Хрустальный рассвет", ar: "فجر كريستالي", it: "Alba di Cristallo", pt: "Amanhecer de Cristal", zh: "水晶晨曦" } },
  { id: "s20", rawName: "sound20", assetPath: "sound20.mp3", kind: "warm", seq: [500, 760, 1020], name: { tr: "Sıcak Uyarı", en: "Warm Alert", de: "Warme Warnung", fr: "Alerte Chaude", es: "Alerta Cálida", ru: "Тёплое предупреждение", ar: "تنبيه دافئ", it: "Avviso Caldo", pt: "Alerta Quente", zh: "温暖提醒" } }
];

const sounds = SOUND_LIBRARY.map((s) => ({
  ...s,
  audioAvailable: null,
  probeInFlight: false
}));

let selectedSoundId = "s1";

// ===============================
// TRANSLATION ENGINE
// ===============================
function t(key) {
  const lang = $("language")?.value || appState.language || "tr";
  if (!baseTranslations[key]) return key;
  return baseTranslations[key][lang] || baseTranslations[key].en || key;
}

function setText(id, key) {
  const el = $(id);
  if (el) el.textContent = t(key);
}

function getSoundDisplayName(sound) {
  const lang = $("language")?.value || appState.language || "tr";
  return sound?.name?.[lang] || sound?.name?.en || sound?.id || "Sound";
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
// VISIBILITY / FOREGROUND
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

  if (isAppForeground()) {
    await cancelTimerNotification();
  } else {
    await scheduleTimerNotification(timerState.timeLeft);
  }
}

async function handleAppForeground() {
  visibilityState.isForeground = true;
  await cancelTimerNotification();

  if (timerState.running && isTimerExpired()) {
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
// SOUND SYSTEM
// ===============================
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
  };

  audio.addEventListener("loadedmetadata", success, { once: true });
  audio.addEventListener("canplay", success, { once: true });
  audio.addEventListener("canplaythrough", success, { once: true });
  audio.addEventListener("error", fail, { once: true });
  audio.addEventListener("abort", fail, { once: true });
  audio.addEventListener("stalled", fail, { once: true });

  try {
    audio.load();
    setTimeout(() => {
      if (!resolved) fail();
    }, 2500);
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
  } catch {
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
  master.gain.value = mode === "preview" ? 1.8 : 1.6;
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

  const [base, over, tail] = sound.seq;

  switch (sound.kind) {
    case "crystal":
      playTone(base, now + 0.00, 0.45, "sine", 0.45, "highpass", 1200, 10);
      playTone(over, now + 0.16, 0.32, "sine", 0.22, "highpass", 1600, 12);
      playTone(tail, now + 0.40, 0.24, "sine", 0.16, "highpass", 1800, 12);
      break;
    case "glass":
      playTone(base, now + 0.00, 0.28, "sine", 0.44, "highpass", 1500, 12);
      playTone(over, now + 0.12, 0.20, "sine", 0.20, "highpass", 1800, 12);
      playTone(tail, now + 0.26, 0.14, "sine", 0.10, "highpass", 2200, 12);
      break;
    case "gong":
      playTone(base, now + 0.00, 0.90, "sine", 0.58, "lowpass", 900, 2);
      playTone(over, now + 0.10, 0.80, "sine", 0.24, "lowpass", 1100, 2);
      playTone(tail, now + 0.24, 0.60, "sine", 0.12, "bandpass", 800, 3);
      break;
    case "digital":
      playTone(base, now + 0.00, 0.12, "square", 0.46, "highpass", 900, 6);
      playTone(over, now + 0.18, 0.12, "square", 0.40, "highpass", 1000, 6);
      playTone(tail, now + 0.36, 0.12, "square", 0.34, "highpass", 1200, 6);
      break;
    case "marimba":
      playTone(base, now + 0.00, 0.30, "triangle", 0.46, "bandpass", 1400, 5);
      playTone(over, now + 0.20, 0.24, "triangle", 0.22, "bandpass", 1600, 5);
      playTone(tail, now + 0.42, 0.18, "triangle", 0.16, "bandpass", 1800, 5);
      break;
    case "echo":
      playTone(base, now + 0.00, 0.38, "triangle", 0.42, "bandpass", 1400, 4);
      playTone(over, now + 0.34, 0.28, "triangle", 0.22, "bandpass", 1600, 4);
      playTone(tail, now + 0.64, 0.18, "triangle", 0.12, "bandpass", 1800, 4);
      break;
    case "calm":
      playTone(base, now + 0.00, 0.52, "sine", 0.40, "lowpass", 900, 2);
      playTone(over, now + 0.28, 0.34, "sine", 0.18, "lowpass", 1100, 2);
      break;
    case "bright":
      playTone(base, now + 0.00, 0.16, "sawtooth", 0.46, "bandpass", 2200, 8);
      playTone(over, now + 0.20, 0.16, "sawtooth", 0.40, "bandpass", 2400, 8);
      playTone(tail, now + 0.40, 0.16, "sawtooth", 0.34, "bandpass", 2600, 8);
      break;
    case "zen":
      playTone(base, now + 0.00, 1.00, "sine", 0.54, "lowpass", 700, 2);
      playTone(over, now + 0.18, 0.70, "sine", 0.18, "lowpass", 900, 2);
      playTone(tail, now + 0.42, 0.46, "sine", 0.10, "lowpass", 1100, 2);
      break;
    case "warm":
    default:
      playTone(base, now + 0.00, 0.55, "triangle", 0.50, "lowpass", 1200, 3);
      playTone(over, now + 0.26, 0.40, "triangle", 0.20, "lowpass", 1000, 2);
      break;
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
      const ok = await playRealSoundOnce(sound, mode === "alarm");
      if (ok) return;
    }

    playSynthPattern(sound, mode);
  } catch {
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
  return sounds.find((s) => s.id === selectedSoundId) || sounds[0];
}

async function triggerVibrationPulse() {
  if (!$("vibrationToggle")?.checked) return;

  try {
    if (navigator.vibrate) {
      navigator.vibrate([350, 120, 350, 120, 500]);
    }
  } catch {}

  try {
    if (CapacitorHaptics?.vibrate) {
      await CapacitorHaptics.vibrate();
    }
  } catch {}
}

function stopAllVibration() {
  try {
    if (navigator.vibrate) navigator.vibrate(0);
  } catch {}
}

async function startAlarmLoop() {
  stopAlarmLoop();
  alarmState.active = true;
  alarmState.lastPlay = 0;

  const selected = getSelectedSound();
  if (selected.audioAvailable === null) {
    probeSoundAsset(selected);
  }

  const playCurrentAlarmSound = async () => {
    if (!alarmState.active) return;
    const now = nowMs();
    if (now - alarmState.lastPlay < 1100) return;
    alarmState.lastPlay = now;
    await playSoundOnce(getSelectedSound(), "alarm");
  };

  const realLoopStarted =
    selected.audioAvailable === true
      ? await playRealSoundOnce(selected, true)
      : false;

  if (!realLoopStarted) {
    await playCurrentAlarmSound();
    alarmState.soundIntervalId = setInterval(playCurrentAlarmSound, 1400);
  }

  await triggerVibrationPulse();
  alarmState.vibrationIntervalId = setInterval(triggerVibrationPulse, 1800);
}

function stopAlarmLoop() {
  if (alarmState.soundIntervalId) {
    clearInterval(alarmState.soundIntervalId);
    alarmState.soundIntervalId = null;
  }

  if (alarmState.vibrationIntervalId) {
    clearInterval(alarmState.vibrationIntervalId);
    alarmState.vibrationIntervalId = null;
  }

  stopHtmlAudio();
  stopPreviewAudio();
  alarmState.active = false;
  stopAllVibration();
}

function lockUIWhileAlarm() {
  document.body.classList.add("alarm-active");
}

function unlockUI() {
  document.body.classList.remove("alarm-active");
}

function showAlarmOverlay() {
  const titleEl = $("alarmTitle");
  const msgEl = $("alarmMessage");
  const overlay = $("alarmOverlay");

  if (titleEl) titleEl.textContent = t("alarmTitle");
  if (msgEl) msgEl.textContent = t("alarmMsg");
  if (overlay) overlay.classList.remove("hidden");

  lockUIWhileAlarm();
}

async function dismissAlarm() {
  stopAlarmLoop();
  await cancelTimerNotification();

  const overlay = $("alarmOverlay");
  if (overlay) overlay.classList.add("hidden");

  unlockUI();

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
  }

  saveTimerState();
  savePomodoroState();
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

function restoreSelectedSound() {
  const saved = localStorage.getItem(STORAGE_KEYS.sound);
  if (saved && sounds.some((s) => s.id === saved)) {
    selectedSoundId = saved;
  }
}

function initSoundSystem() {
  restoreSelectedSound();
  sounds.forEach(probeSoundAsset);
  renderSounds();
}

// ===============================
// NOTIFICATION CHANNEL HELPERS
// ===============================
function getSoundChannelId(soundId) {
  return `timer_alerts_${soundId}`;
}

async function ensureNotificationChannels() {
  if (!CapacitorLocalNotifications) return;

  try {
    const createAllChannels = async () => {
      for (const sound of sounds) {
        try {
          await CapacitorLocalNotifications.createChannel({
            id: getSoundChannelId(sound.id),
            name: `Timer ${sound.rawName}`,
            description: `Timer alerts - ${sound.rawName}`,
            importance: 5,
            visibility: 1,
            vibration: true,
            sound: sound.rawName
          });
        } catch {}
      }

      try {
        await CapacitorLocalNotifications.createChannel({
          id: "timer_alerts_fallback",
          name: "Timer fallback",
          description: "Fallback timer alerts",
          importance: 5,
          visibility: 1,
          vibration: true,
          sound: "beep"
        });
      } catch {}
    };

    if (CapacitorLocalNotifications.listChannels) {
      const res = await CapacitorLocalNotifications.listChannels();
      const existingIds = new Set((res?.channels || []).map((c) => c.id));

      for (const sound of sounds) {
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
              sound: sound.rawName
            });
          } catch {}
        }
      }

      if (!existingIds.has("timer_alerts_fallback")) {
        try {
          await CapacitorLocalNotifications.createChannel({
            id: "timer_alerts_fallback",
            name: "Timer fallback",
            description: "Fallback timer alerts",
            importance: 5,
            visibility: 1,
            vibration: true,
            sound: "beep"
          });
        } catch {}
      }
    } else {
      await createAllChannels();
    }
  } catch {}
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

function getNotificationChannelForCurrentSound() {
  const sound = getSelectedSound();
  if (!sound?.rawName) return "timer_alerts_fallback";
  return getSoundChannelId(sound.id);
}

async function scheduleTimerNotification(secondsFromNow) {
  if (!CapacitorLocalNotifications) return;
  if (!secondsFromNow || secondsFromNow <= 0) return;
  if (isAppForeground()) return;

  try {
    await cancelTimerNotification();

    await CapacitorLocalNotifications.schedule({
      notifications: [
        {
          id: notificationState.scheduledTimerNotificationId,
          title: t("notifTimerTitle"),
          body: t("notifTimerBody"),
          largeBody: t("notifTimerBody"),
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
  timerState.lastTick = 0;
  timerState.endAt = 0;
  timerState.mode = "timer";

  alarmState.pendingPomodoroAdvance = false;
  pomodoroState.enabled = false;

  stopAlarmLoop();

  const overlay = $("alarmOverlay");
  if (overlay) overlay.classList.add("hidden");
  unlockUI();

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
      "localNotificationActionPerformed",
      async (event) => {
        const notificationId = event?.notification?.id;

        hardResetTimerState();

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
      }
    );

    notificationState.listenersReady = true;
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

  timerState.totalTime = total;
  timerState.timeLeft = total;
  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = nowMs();
  timerState.endAt = nowMs() + total * 1000;

  updateTimerDisplay();
  timerState.timerId = setInterval(timerTick, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  saveTimerState();

  await requestNotificationPermission();
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

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = true;
  timerState.paused = false;
  timerState.lastTick = nowMs();
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
  timerState.lastTick = 0;
  timerState.endAt = 0;
  timerState.mode = "timer";

  pomodoroState.enabled = false;
  alarmState.pendingPomodoroAdvance = false;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  await cancelTimerNotification();
  stopAlarmLoop();

  const overlay = $("alarmOverlay");
  if (overlay) overlay.classList.add("hidden");
  unlockUI();

  setText("timerStatus", "ready");
  updateTimerStartButton();

  saveTimerState();
  savePomodoroState();
}

async function onTimerFinished() {
  await cancelTimerNotification();

  alarmState.pendingPomodoroAdvance =
    timerState.mode === "pomodoro" &&
    pomodoroState.enabled === true &&
    pomodoroState.autoAdvance === true;

  if (isAppForeground()) {
    showAlarmOverlay();
    await startAlarmLoop();
  }

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
  timerState.lastTick = 0;
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
  timerState.lastTick = 0;
  timerState.endAt = 0;
  timerState.mode = "timer";

  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = 25;
  pomodoroState.breakMinutes = 5;
  alarmState.pendingPomodoroAdvance = false;

  if ($("pomodoroWork")) $("pomodoroWork").value = 25;
  if ($("pomodoroBreak")) $("pomodoroBreak").value = 5;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  await cancelTimerNotification();
  stopAlarmLoop();

  const overlay = $("alarmOverlay");
  if (overlay) overlay.classList.add("hidden");
  unlockUI();

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

// ===============================
// STOPWATCH ENGINE
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

function limitLaps(max = 100) {
  if (stopwatchState.laps.length > max) {
    stopwatchState.laps = stopwatchState.laps.slice(0, max);
  }
}

// ===============================
// TAB SYSTEM
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
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

function ensureValidPanel() {
  const panels = $$(".panel");
  let found = false;

  panels.forEach((p) => {
    if (p.classList.contains("active")) found = true;
  });

  if (!found) switchTab("timerPanel");
}

function initTabs() {
  setupTabs();
  ensureValidPanel();
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

  if (data.running && data.endAt) {
    const remaining = Math.max(0, Math.ceil((data.endAt - nowMs()) / 1000));
    timerState.timeLeft = remaining;
    timerState.running = remaining > 0;
    timerState.paused = false;

    if (remaining > 0) {
      timerState.timerId = setInterval(timerTick, 250);
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
  if (saved && sounds.some((s) => s.id === saved)) {
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

  el.addEventListener(event, (e) => {
    try {
      handler(e);
    } catch (err) {
      console.error("Event error:", err);
    }
  });
}

function toggleTheme() {
  return;
}

function initEvents() {
  bind("timerStartBtn", "click", async () => {
    await ensureHtmlAudioUnlocked();
    await startTimer(false);
  });

  bind("timerPauseBtn", "click", async () => {
    await pauseTimer();
  });

  bind("timerResetBtn", "click", async () => {
    await resetTimer();
  });

  bind("applyPomodoroBtn", "click", async () => {
    await ensureHtmlAudioUnlocked();
    applyPomodoro();
  });

  bind("pomodoroResetBtn", "click", async () => {
    await resetPomodoro();
  });

  bind("pomodoroCycleResetBtn", "click", resetPomodoroCycle);

  bind("swStartBtn", "click", toggleStopwatch);
  bind("swLapBtn", "click", addLap);
  bind("swResetBtn", "click", resetStopwatch);
  bind("swClearLapsBtn", "click", clearLaps);

  bind("dismissAlarmBtn", "click", async () => {
    await dismissAlarm();
  });

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

    await ensureNotificationChannels();
    await registerNotificationActions();
    await setupNotificationListeners();
    await setupVisibilityListeners();
    await requestNotificationPermission();

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
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

onReady(initApp);
console.log("🔥 APP FULLY READY");
