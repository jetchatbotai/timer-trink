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
  pendingPomodoroAdvance: false,
  htmlAudio: null,
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
    ru: "Выберите пресет для фокуса и загрузите его в тайmer.",
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
// SOUND LABELS
// ===============================
const soundLabels = {
  tr: [
    "Kristal Şafak", "Amber Çanı", "Gece Camı", "Derin Alarm", "Mavi Yankı",
    "Yumuşak Uyarı", "Ay Zili", "Sabah Tınısı", "İnce Rezonans", "Gümüş Sinyal",
    "Buz Kristali", "Kısa Darbe", "Uzay Tonu", "Sıcak Çınlama", "Parlak Dalga",
    "Kutup Alarmı", "Cam Damlaları", "Altın Çınlama", "Derin Nabız", "Şafak Sesi",
    "Yumuşak Metal", "Kıvrak Bell", "Narin Tiz", "Serin Vuruş", "Gece Alarmı",
    "Sabit Uyarı", "Kalın Taban", "Parlak Zil", "Titrek Cam", "Kısa Echo",
    "Luna Pulse", "Akşam Tonu", "Derin Bell", "Serbest Rezonans", "Yüksek Tını",
    "Nazik Alarm", "İpeksi Zil", "Duru Ses", "Mistik Nabız", "Metal Işık",
    "Yoğun Çan", "Pürüzsüz Dalga", "Dijital Uyarı", "Kristal Nabız", "Gece Vuruşu",
    "Yankılı Bell", "Keskin Tiz", "Sakin Çınlama", "Final Uyarısı", "Parıltı Alarmı"
  ],
  en: [
    "Crystal Dawn", "Amber Bell", "Night Glass", "Deep Alert", "Blue Echo",
    "Soft Signal", "Moon Bell", "Morning Tone", "Fine Resonance", "Silver Ping",
    "Ice Crystal", "Short Strike", "Space Tone", "Warm Chime", "Bright Wave",
    "Polar Alert", "Glass Drops", "Golden Chime", "Deep Pulse", "Dawn Signal",
    "Soft Metal", "Quick Bell", "Light Treble", "Cool Hit", "Night Alert",
    "Steady Signal", "Solid Base", "Bright Bell", "Shimmer Glass", "Short Echo",
    "Luna Pulse", "Evening Tone", "Deep Bell", "Free Resonance", "High Tone",
    "Gentle Alert", "Silk Bell", "Clear Tone", "Mystic Pulse", "Metal Glow",
    "Dense Chime", "Smooth Wave", "Digital Alert", "Crystal Pulse", "Night Hit",
    "Echo Bell", "Sharp Treble", "Calm Chime", "Final Alert", "Spark Alarm"
  ],
  de: Array(50).fill(0).map((_, i) => `Ton ${i + 1}`),
  fr: Array(50).fill(0).map((_, i) => `Son ${i + 1}`),
  es: Array(50).fill(0).map((_, i) => `Sonido ${i + 1}`),
  ru: Array(50).fill(0).map((_, i) => `Звук ${i + 1}`),
  ar: Array(50).fill(0).map((_, i) => `صوت ${i + 1}`),
  it: Array(50).fill(0).map((_, i) => `Suono ${i + 1}`),
  pt: Array(50).fill(0).map((_, i) => `Som ${i + 1}`),
  zh: Array(50).fill(0).map((_, i) => `声音 ${i + 1}`)
};

function getLocalizedSoundName(index) {
  const lang = $("language")?.value || appState.language || "en";
  const list = soundLabels[lang] || soundLabels.en;
  return list[index - 1] || `Sound ${index}`;
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
  { kind: "bell", type: "sine", base: 880, overtone: 1760, tail: 1320, duration: 0.34, volume: 0.42 },
  { kind: "softBell", type: "triangle", base: 660, overtone: 1320, tail: 990, duration: 0.30, volume: 0.40 },
  { kind: "digital", type: "square", base: 520, overtone: 1040, tail: 780, duration: 0.22, volume: 0.45 },
  { kind: "alert", type: "sawtooth", base: 740, overtone: 1110, tail: 1480, duration: 0.18, volume: 0.46 },
  { kind: "warm", type: "triangle", base: 440, overtone: 880, tail: 660, duration: 0.38, volume: 0.43 },
  { kind: "deep", type: "sine", base: 280, overtone: 560, tail: 420, duration: 0.42, volume: 0.48 },
  { kind: "glass", type: "sine", base: 1240, overtone: 1860, tail: 2480, duration: 0.18, volume: 0.41 },
  { kind: "pulse", type: "square", base: 460, overtone: 690, tail: 920, duration: 0.16, volume: 0.47 },
  { kind: "echo", type: "triangle", base: 600, overtone: 900, tail: 1200, duration: 0.30, volume: 0.40 },
  { kind: "sparkle", type: "sine", base: 980, overtone: 1470, tail: 1960, duration: 0.15, volume: 0.44 }
];

for (let i = 1; i <= SOUND_COUNT; i++) {
  const bp = soundBlueprints[(i - 1) % soundBlueprints.length];
  const detune = ((i - 1) % 10) * 11;
  const tailShift = ((i - 1) % 7) * 9;

  sounds.push({
    id: "s" + i,
    index: i,
    kind: bp.kind,
    type: bp.type,
    volume: bp.volume + ((i - 1) % 3) * 0.03,
    duration: bp.duration + ((i - 1) % 4) * 0.02,
    assetPath: `sound${i}.mp3`,
    audioAvailable: false,
    seq: [
      bp.base + detune,
      bp.overtone + detune * 0.8,
      bp.tail + tailShift
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
  } catch {}
}

function playSynthSoundOnce(sound) {
  if (!sound) return;
  if (!$("soundToggle")?.checked) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 2.2;
  master.connect(ctx.destination);

  sound.seq.forEach((freq, index) => {
    const startAt = now + index * (sound.duration * 0.55);
    const endAt = startAt + sound.duration;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = sound.type;
      osc.frequency.setValueAtTime(freq, startAt);

      if (sound.kind === "bell") {
        osc.frequency.linearRampToValueAtTime(freq * 0.985, endAt);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2600, startAt);
        filter.Q.setValueAtTime(8, startAt);
      } else if (sound.kind === "softBell") {
        osc.frequency.linearRampToValueAtTime(freq * 0.97, endAt);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1800, startAt);
        filter.Q.setValueAtTime(4, startAt);
      } else if (sound.kind === "digital") {
        osc.frequency.linearRampToValueAtTime(freq * 1.04, endAt);
        filter.type = "highpass";
        filter.frequency.setValueAtTime(700, startAt);
        filter.Q.setValueAtTime(5, startAt);
      } else if (sound.kind === "alert") {
        osc.frequency.linearRampToValueAtTime(freq * 1.08, startAt + sound.duration * 0.25);
        osc.frequency.linearRampToValueAtTime(freq * 0.92, endAt);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2200, startAt);
        filter.Q.setValueAtTime(10, startAt);
      } else if (sound.kind === "warm") {
        osc.frequency.linearRampToValueAtTime(freq * 0.95, endAt);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, startAt);
        filter.Q.setValueAtTime(3, startAt);
      } else if (sound.kind === "deep") {
        osc.frequency.linearRampToValueAtTime(freq * 0.90, endAt);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, startAt);
        filter.Q.setValueAtTime(2, startAt);
      } else if (sound.kind === "glass") {
        osc.frequency.linearRampToValueAtTime(freq * 1.02, endAt);
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1200, startAt);
        filter.Q.setValueAtTime(9, startAt);
      } else if (sound.kind === "pulse") {
        osc.frequency.linearRampToValueAtTime(freq * 1.12, endAt);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1600, startAt);
        filter.Q.setValueAtTime(6, startAt);
      } else if (sound.kind === "echo") {
        osc.frequency.linearRampToValueAtTime(freq * 0.94, endAt);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1900, startAt);
        filter.Q.setValueAtTime(5, startAt);
      } else if (sound.kind === "sparkle") {
        osc.frequency.linearRampToValueAtTime(freq * 1.06, endAt);
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1500, startAt);
        filter.Q.setValueAtTime(12, startAt);
      } else {
        osc.frequency.linearRampToValueAtTime(freq * 0.95, endAt);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2000, startAt);
        filter.Q.setValueAtTime(4, startAt);
      }

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.linearRampToValueAtTime(sound.volume, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(sound.volume * 0.65, 0.04),
        startAt + sound.duration * 0.35
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(startAt);
      osc.stop(endAt + 0.03);

      // Extra harmonics for realism
      if (index === 0 && (sound.kind === "bell" || sound.kind === "glass" || sound.kind === "sparkle")) {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(freq * 2.01, startAt);
        gain2.gain.setValueAtTime(0.0001, startAt);
        gain2.gain.linearRampToValueAtTime(sound.volume * 0.25, startAt + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.0001, endAt);
        osc2.connect(gain2);
        gain2.connect(master);
        osc2.start(startAt);
        osc2.stop(endAt + 0.02);
      }
    } catch (e) {
      console.warn("Synth sound error:", e);
    }
  });
}

function probeSoundAsset(sound) {
  if (!sound) return;
  sound.audioAvailable = false;
}

async function playRealSoundOnce() {
  return false;
}

async function playSoundOnce(sound) {
  if (!sound) return;
  if (!$("soundToggle")?.checked) return;
  stopHtmlAudio();
  playSynthSoundOnce(sound);
}

function previewSound(sound) {
  stopAlarmLoop();
  alarmState.currentPreviewSoundId = sound?.id || null;
  playSoundOnce(sound);
}

function getSelectedSound() {
  return sounds.find(s => s.id === selectedSoundId) || sounds[0];
}

function startAlarmLoop() {
  stopAlarmLoop();
  alarmState.active = true;
  startSynthAlarmLoop();
}

function startSynthAlarmLoop() {
  alarmState.intervalId = setInterval(() => {
    const now = Date.now();
    if (now - alarmState.lastPlay < 800) return;

    alarmState.lastPlay = now;
    playSynthSoundOnce(getSelectedSound());

    if ($("vibrationToggle")?.checked && navigator.vibrate) {
      navigator.vibrate([260, 90, 260, 90, 320]);
    }
  }, 1050);
}

function stopAlarmLoop() {
  if (alarmState.intervalId) {
    clearInterval(alarmState.intervalId);
    alarmState.intervalId = null;
  }

  stopHtmlAudio();
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

    const name = document.createElement("span");
    name.textContent = getLocalizedSoundName(sound.index);

    item.addEventListener("click", async () => {
      selectedSoundId = sound.id;
      radio.checked = true;
      saveSoundState();
      await ensureHtmlAudioUnlocked();
      previewSound(sound);
    });

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
  sounds.forEach(sound => { sound.audioAvailable = false; });
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
          schedule: { at: new Date(Date.now() + secondsFromNow * 1000) }
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
  if (el) el.textContent = formatTime(Math.max(0, timerState.timeLeft));
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
  if (display) display.textContent = "00:00:00";

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

  loadPomodoroPhase();
  setPomodoroStatus();
  startTimer();
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
}

function resetPomodoroCycle() {
  pomodoroState.cycleCount = 0;
  setPomodoroStatus();
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
    paused: timerState.paused
  }));
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
