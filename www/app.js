// ===============================
// CAPACITOR
// ===============================
const CapacitorLocalNotifications =
  window.Capacitor?.Plugins?.LocalNotifications || null;
const CapacitorApp =
  window.Capacitor?.Plugins?.App || null;
const AlarmBridge =
  window.Capacitor?.Plugins?.AlarmBridge || null;

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

function getSupportedInitialLanguage() {
  const supported = [
    "tr", "en", "de", "fr", "es", "ru", "ar", "it", "pt", "zh",
    "hi", "ja", "ko", "nl", "pl", "uk", "id", "ms"
  ];

  const raw = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  const short = raw.slice(0, 2);

  if (supported.includes(short)) return short;
  return "en";
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

function recentlyFinished() {
  return Date.now() - (timerState.lastFinishedAt || 0) < 2000;
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
  mode: "timer", // timer | pomodoro
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

// ===============================
// TRANSLATIONS
// ===============================
const baseTranslations = {
  start: {
    tr: "Başlat", en: "Start", de: "Start", fr: "Démarrer", es: "Iniciar", ru: "Старт", ar: "ابدأ", it: "Avvia", pt: "Iniciar", zh: "开始",
    hi: "शुरू करें", ja: "開始", ko: "시작", nl: "Start", pl: "Start", uk: "Почати", id: "Mulai", ms: "Mula"
  },
  pause: {
    tr: "Duraklat", en: "Pause", de: "Pause", fr: "Pause", es: "Pausar", ru: "Пауза", ar: "إيقاف مؤقت", it: "Pausa", pt: "Pausar", zh: "暂停",
    hi: "रोकें", ja: "一時停止", ko: "일시정지", nl: "Pauze", pl: "Pauza", uk: "Пауза", id: "Jeda", ms: "Jeda"
  },
  reset: {
    tr: "Sıfırla", en: "Reset", de: "Zurücksetzen", fr: "Réinitialiser", es: "Restablecer", ru: "Сброс", ar: "إعادة تعيين", it: "Reimposta", pt: "Redefinir", zh: "重置",
    hi: "रीसेट", ja: "リセット", ko: "재설정", nl: "Reset", pl: "Resetuj", uk: "Скинути", id: "Reset", ms: "Tetapkan semula"
  },
  ready: {
    tr: "Hazır", en: "Ready", de: "Bereit", fr: "Prêt", es: "Listo", ru: "Готово", ar: "جاهز", it: "Pronto", pt: "Pronto", zh: "就绪",
    hi: "तैयार", ja: "準備完了", ko: "준비됨", nl: "Klaar", pl: "Gotowe", uk: "Готово", id: "Siap", ms: "Sedia"
  },
  running: {
    tr: "Çalışıyor", en: "Running", de: "Läuft", fr: "En cours", es: "En marcha", ru: "Работает", ar: "قيد التشغيل", it: "In esecuzione", pt: "Em andamento", zh: "运行中",
    hi: "चल रहा है", ja: "実行中", ko: "실행 중", nl: "Bezig", pl: "Działa", uk: "Працює", id: "Berjalan", ms: "Sedang berjalan"
  },
  paused: {
    tr: "Duraklatıldı", en: "Paused", de: "Pausiert", fr: "En pause", es: "Pausado", ru: "На паузе", ar: "متوقف مؤقتًا", it: "In pausa", pt: "Pausado", zh: "已暂停",
    hi: "रुका हुआ", ja: "一時停止中", ko: "일시정지됨", nl: "Gepauzeerd", pl: "Wstrzymano", uk: "На паузі", id: "Dijeda", ms: "Dijeda"
  },
  done: {
    tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!", ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！",
    hi: "समय समाप्त!", ja: "時間切れ！", ko: "시간 종료!", nl: "Tijd is om!", pl: "Czas minął!", uk: "Час вийшов!", id: "Waktu habis!", ms: "Masa tamat!"
  },
  close: {
    tr: "Kapat", en: "Close", de: "Schließen", fr: "Fermer", es: "Cerrar", ru: "Закрыть", ar: "إغلاق", it: "Chiudi", pt: "Fechar", zh: "关闭",
    hi: "बंद करें", ja: "閉じる", ko: "닫기", nl: "Sluiten", pl: "Zamknij", uk: "Закрити", id: "Tutup", ms: "Tutup"
  },
  alarmRinging: {
    tr: "Alarm çalıyor", en: "Alarm is ringing", de: "Alarm klingelt", fr: "L’alarme sonne", es: "La alarma está sonando", ru: "Будильник звонит", ar: "المنبه يرن", it: "La sveglia sta suonando", pt: "O alarme está tocando", zh: "闹铃正在响",
    hi: "अलार्म बज रहा है", ja: "アラームが鳴っています", ko: "알람이 울리고 있습니다", nl: "Alarm gaat af", pl: "Alarm dzwoni", uk: "Будильник дзвонить", id: "Alarm berbunyi", ms: "Penggera sedang berbunyi"
  },
  sounds: {
    tr: "ses", en: "sounds", de: "Töne", fr: "sons", es: "sonidos", ru: "звуков", ar: "أصوات", it: "suoni", pt: "sons", zh: "种声音",
    hi: "ध्वनियाँ", ja: "サウンド", ko: "소리", nl: "geluiden", pl: "dźwięków", uk: "звуків", id: "suara", ms: "bunyi"
  },
  hours: {
    tr: "Saat", en: "Hours", de: "Stunden", fr: "Heures", es: "Horas", ru: "Часы", ar: "الساعات", it: "Ore", pt: "Horas", zh: "小时",
    hi: "घंटे", ja: "時間", ko: "시간", nl: "Uren", pl: "Godziny", uk: "Години", id: "Jam", ms: "Jam"
  },
  minutes: {
    tr: "Dakika", en: "Minutes", de: "Minuten", fr: "Minutes", es: "Minutos", ru: "Минуты", ar: "الدقائق", it: "Minuti", pt: "Minutos", zh: "分钟",
    hi: "मिनट", ja: "分", ko: "분", nl: "Minuten", pl: "Minuty", uk: "Хвилини", id: "Menit", ms: "Minit"
  },
  seconds: {
    tr: "Saniye", en: "Seconds", de: "Sekunden", fr: "Secondes", es: "Segundos", ru: "Секунды", ar: "الثواني", it: "Secondi", pt: "Segundos", zh: "秒",
    hi: "सेकंड", ja: "秒", ko: "초", nl: "Seconden", pl: "Sekundy", uk: "Секунди", id: "Detik", ms: "Saat"
  },
  lap: {
    tr: "Tur", en: "Lap", de: "Runde", fr: "Tour", es: "Vuelta", ru: "Круг", ar: "لفة", it: "Giro", pt: "Volta", zh: "圈",
    hi: "लैप", ja: "ラップ", ko: "랩", nl: "Ronde", pl: "Okrążenie", uk: "Коло", id: "Putaran", ms: "Pusingan"
  },
  stopwatch: {
    tr: "Kronometre", en: "Stopwatch", de: "Stoppuhr", fr: "Chronomètre", es: "Cronómetro", ru: "Секундомер", ar: "ساعة إيقاف", it: "Cronometro", pt: "Cronômetro", zh: "秒表",
    hi: "स्टॉपवॉच", ja: "ストップウォッチ", ko: "스톱워치", nl: "Stopwatch", pl: "Stoper", uk: "Секундомір", id: "Stopwatch", ms: "Jam randik"
  },
  timer: {
    tr: "Zamanlayıcı", en: "Timer", de: "Timer", fr: "Minuteur", es: "Temporizador", ru: "Таймер", ar: "المؤقت", it: "Timer", pt: "Temporizador", zh: "计时器",
    hi: "टाइमर", ja: "タイマー", ko: "타이머", nl: "Timer", pl: "Timer", uk: "Таймер", id: "Timer", ms: "Pemasa"
  },
  pomodoro: {
    tr: "Pomodoro", en: "Pomodoro", de: "Pomodoro", fr: "Pomodoro", es: "Pomodoro", ru: "Помодоро", ar: "بومودورو", it: "Pomodoro", pt: "Pomodoro", zh: "番茄钟",
    hi: "पोमोडोरो", ja: "ポモドーロ", ko: "포모도로", nl: "Pomodoro", pl: "Pomodoro", uk: "Помодоро", id: "Pomodoro", ms: "Pomodoro"
  },
  soundOn: {
    tr: "Ses açık", en: "Sound on", de: "Ton an", fr: "Son activé", es: "Sonido activado", ru: "Звук açık", ar: "الصوت مفعل", it: "Suono attivo", pt: "Som ligado", zh: "声音开启",
    hi: "ध्वनि चालू", ja: "サウンドオン", ko: "소리 켜짐", nl: "Geluid aan", pl: "Dźwięk włączony", uk: "Звук увімкнено", id: "Suara aktif", ms: "Bunyi aktif"
  },
  vibrationOn: {
    tr: "Titreşim açık", en: "Vibration on", de: "Vibration an", fr: "Vibration activée", es: "Vibración activada", ru: "Вибрация включена", ar: "الاهتزاز مفعل", it: "Vibrazione attiva", pt: "Vibração ligada", zh: "振动开启",
    hi: "वाइब्रेशन चालू", ja: "バイブレーションオン", ko: "진동 켜짐", nl: "Trillen aan", pl: "Wibracja włączona", uk: "Вібрацію увімкнено", id: "Getar aktif", ms: "Getaran aktif"
  },
  notifTimerTitle: {
    tr: "Süre doldu!", en: "Time is up!", de: "Zeit ist um!", fr: "Le temps est écoulé !", es: "¡Se acabó el tiempo!", ru: "Время вышло!", ar: "انتهى الوقت!", it: "Tempo scaduto!", pt: "O tempo acabou!", zh: "时间到了！",
    hi: "समय समाप्त!", ja: "時間切れ！", ko: "시간 종료!", nl: "Tijd is om!", pl: "Czas minął!", uk: "Час вийшов!", id: "Waktu habis!", ms: "Masa tamat!"
  },
  notifTimerBody: {
    tr: "Bildirime dokunarak alarmı kapat", en: "Tap the notification to stop the alarm", de: "Tippe auf die Benachrichtigung, um den Alarm zu stoppen", fr: "Touchez la notification pour arrêter l'alarme", es: "Toca la notificación para detener la alarma", ru: "Нажмите уведомление, чтобы остановить сигнал", ar: "اضغط على الإشعار لإيقاف المنبه", it: "Tocca la notifica per fermare l'alarme", pt: "Toque na notificação para parar o alarme", zh: "点击通知以停止闹铃",
    hi: "अलार्म बंद करने के लिए सूचना पर टैप करें", ja: "通知をタップしてアラームを停止", ko: "알람을 끄려면 알림을 누르세요", nl: "Tik op de melding om het alarm te stoppen", pl: "Dotknij powiadomienia, aby wyłączyć alarm", uk: "Натисніть сповіщення, щоб вимкнути сигнал", id: "Ketuk notifikasi untuk menghentikan alarm", ms: "Ketik pemberitahuan untuk menghentikan penggera"
  },
  work: {
    tr: "Çalışma", en: "Work", de: "Arbeit", fr: "Travail", es: "Trabajo", ru: "Работа", ar: "عمل", it: "Lavoro", pt: "Trabalho", zh: "工作",
    hi: "काम", ja: "作業", ko: "작업", nl: "Werk", pl: "Praca", uk: "Робота", id: "Kerja", ms: "Kerja"
  },
  break: {
    tr: "Mola", en: "Break", de: "Pause", fr: "Pause", es: "Descanso", ru: "Перерыв", ar: "استراحة", it: "Pausa", pt: "Pausa", zh: "休息",
    hi: "ब्रेक", ja: "休憩", ko: "휴식", nl: "Pauze", pl: "Przerwa", uk: "Перерва", id: "Istirahat", ms: "Rehat"
  },
  cycle: {
    tr: "Döngü", en: "Cycle", de: "Zyklus", fr: "Cycle", es: "Ciclo", ru: "Цикл", ar: "دورة", it: "Ciclo", pt: "Ciclo", zh: "周期",
    hi: "चक्र", ja: "サイクル", ko: "사이클", nl: "Cyclus", pl: "Cykl", uk: "Цикл", id: "Siklus", ms: "Kitaran"
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
    zh: "适合专注和日常使用的简易计时器",
    hi: "ध्यान और रोज़मर्रा उपयोग के लिए सरल टाइमर",
    ja: "集中と日常利用のためのシンプルなタイマー",
    ko: "집중과 일상 사용을 위한 간단한 타이머",
    nl: "Eenvoudige timer voor focus en dagelijks gebruik",
    pl: "Prosty timer do skupienia i codziennego użytku",
    uk: "Простий таймер для концентрації та щоденного використання",
    id: "Timer sederhana untuk fokus dan penggunaan sehari-hari",
    ms: "Pemasa ringkas untuk fokus dan kegunaan harian"
  },
  soundsTitle: {
    tr: "Alarm sesleri", en: "Alarm sounds", de: "Alarmtöne", fr: "Sons d'alarme", es: "Sonidos de alarma", ru: "Звуки будильника", ar: "أصوات المنبه", it: "Suoni della sveglia", pt: "Sons de alarme", zh: "闹铃声音",
    hi: "अलार्म ध्वनियाँ", ja: "アラーム音", ko: "알람 소리", nl: "Alarmgeluiden", pl: "Dźwięki alarmu", uk: "Звуки будильника", id: "Suara alarm", ms: "Bunyi penggera"
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
    zh: "选择一个声音并试听。",
    hi: "एक ध्वनि चुनें और उसका पूर्वावलोकन सुनें।",
    ja: "サウンドを選んで試聴してください。",
    ko: "소리를 선택하고 미리 들어보세요.",
    nl: "Kies een geluid en luister naar het voorbeeld.",
    pl: "Wybierz dźwięk i odsłuchaj podgląd.",
    uk: "Виберіть звук і прослухайте его.",
    id: "Pilih suara dan dengarkan pratinjaunya.",
    ms: "Pilih bunyi dan dengar pratontonnya."
  },
  previewSound: {
    tr: "Sesi dinle", en: "Preview sound", de: "Ton anhören", fr: "Écouter le son", es: "Escuchar sonido", ru: "Прослушать звук", ar: "معاينة الصوت", it: "Ascolta il suono", pt: "Ouvir som", zh: "试听声音",
    hi: "ध्वनि सुनें", ja: "音を試聴", ko: "소리 듣기", nl: "Geluid beluisteren", pl: "Odsłuchaj dźwięk", uk: "Прослухати звук", id: "Dengarkan suara", ms: "Dengar bunyi"
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
    zh: "选择一个专注预设并应用到计时器。",
    hi: "एक फोकस प्रीसेट चुनें और उसे टाइमर में लागू करें।",
    ja: "集中プリセットを選んでタイマーに適用します。",
    ko: "집중 프리셋을 선택해 타이머에 적용하세요.",
    nl: "Kies een focuspreset en laad deze in de timer.",
    pl: "Wybierz preset skupienia i załaduj go do timera.",
    uk: "Виберіть пресет фокусування та завантажте его в таймер.",
    id: "Pilih preset fokus dan terapkan ke timer.",
    ms: "Pilih pratetap fokus dan gunakan pada pemasa."
  },
  applyPomodoro: {
    tr: "Pomodoro uygula", en: "Apply Pomodoro", de: "Pomodoro anwenden", fr: "Appliquer Pomodoro", es: "Aplicar Pomodoro", ru: "Применить Помодоро", ar: "تطبيق بومودورو", it: "Applica Pomodoro", pt: "Aplicar Pomodoro", zh: "应用番茄钟",
    hi: "पोमोडोरो लागू करें", ja: "ポモドーロを適用", ko: "포모도로 적용", nl: "Pomodoro toepassen", pl: "Zastosuj Pomodoro", uk: "Застосувати Помодоро", id: "Terapkan Pomodoro", ms: "Guna Pomodoro"
  },
  lapsTitle: {
    tr: "Turlar", en: "Laps", de: "Runden", fr: "Tours", es: "Vueltas", ru: "Круги", ar: "اللفات", it: "Giri", pt: "Voltas", zh: "圈数",
    hi: "लैप्स", ja: "ラップ", ko: "랩", nl: "Rondes", pl: "Okrążenia", uk: "Кола", id: "Putaran", ms: "Pusingan"
  },
  clearLaps: {
    tr: "Turları temizle", en: "Clear Laps", de: "Runden löschen", fr: "Effacer les tours", es: "Borrar vueltas", ru: "Очистить круги", ar: "مسح اللفات", it: "Cancella giri", pt: "Limpar voltas", zh: "清除圈数",
    hi: "लैप साफ करें", ja: "ラップを消去", ko: "랩 지우기", nl: "Rondes wissen", pl: "Wyczyść okrążenia", uk: "Очистити кола", id: "Hapus putaran", ms: "Kosongkan pusingan"
  },
  workLabel: {
    tr: "Çalışma", en: "Work", de: "Arbeit", fr: "Travail", es: "Trabajo", ru: "Работа", ar: "عمل", it: "Lavoro", pt: "Trabalho", zh: "工作",
    hi: "काम", ja: "作業", ko: "작업", nl: "Werk", pl: "Praca", uk: "Робота", id: "Kerja", ms: "Kerja"
  },
  breakLabel: {
    tr: "Mola", en: "Break", de: "Pause", fr: "Pause", es: "Descanso", ru: "Перерыв", ar: "استراحة", it: "Pausa", pt: "Pausa", zh: "休息",
    hi: "ब्रेक", ja: "休憩", ko: "휴식", nl: "Pauze", pl: "Przerwa", uk: "Перерва", id: "Istirahat", ms: "Rehat"
  },
  resetPomodoro: {
    tr: "Pomodoroyu sıfırla", en: "Reset Pomodoro", de: "Pomodoro zurücksetzen", fr: "Réinitialiser Pomodoro", es: "Restablecer Pomodoro", ru: "Сбросить Помодоро", ar: "إعادة ضبط بومودورو", it: "Reimposta Pomodoro", pt: "Redefinir Pomodoro", zh: "重置番茄钟",
    hi: "पोमोडोरो रीसेट", ja: "ポモドーロをリセット", ko: "포모도로 재설정", nl: "Pomodoro resetten", pl: "Resetuj Pomodoro", uk: "Скинути Помодоро", id: "Reset Pomodoro", ms: "Tetapkan semula Pomodoro"
  },
  resetCycle: {
    tr: "Döngüyü sıfırla", en: "Reset Cycle", de: "Zyklus zurücksetzen", fr: "Réinitialiser le cycle", es: "Restablecer ciclo", ru: "Сбросить цикл", ar: "إعادة ضبط الدورة", it: "Reimposta ciclo", pt: "Redefinir ciclo", zh: "重置周期",
    hi: "चक्र रीसेट", ja: "サイクルをリセット", ko: "사이클 재설정", nl: "Cyclus resetten", pl: "Resetuj cykl", uk: "Скинути цикл", id: "Reset siklus", ms: "Tetapkan semula kitaran"
  }
};

function t(key) {
  const lang = $("language")?.value || appState.language || getSupportedInitialLanguage();
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
      zh: `声音 ${n}`,
      hi: `ध्वनि ${n}`,
      ja: `サウンド ${n}`,
      ko: `사운드 ${n}`,
      nl: `Geluid ${n}`,
      pl: `Dźwięk ${n}`,
      uk: `Звук ${n}`,
      id: `Suara ${n}`,
      ms: `Bunyi ${n}`
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

// ===============================
// AUDIO ALARM LOOP
// ===============================
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
  const lang = $("language")?.value || appState.language || getSupportedInitialLanguage();
  return sound?.name?.[lang] || sound?.name?.en || sound?.rawName || "Sound";
}

function applyLanguage() {
  const lang = $("language")?.value || appState.language || getSupportedInitialLanguage();
  appState.language = lang;
  document.documentElement.lang = lang;

  if ($("language")) {
    $("language").value = lang;
  }

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

  setText("dismissAlarmBtn", "close");
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
  else if (timerState.timeLeft <= 0 && timerState.totalTime > 0) setText("timerStatus", "done");
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

function shouldUseNativeAlarm() {
  return !isAppForeground();
}

function isTimerExpired() {
  return timerState.endAt > 0 && nowMs() >= timerState.endAt;
}

async function savePomodoroNativeState(enabledOverride = null, endAtOverride = null) {
  if (!AlarmBridge?.savePomodoroNativeState) return;

  try {
    const enabled = enabledOverride === null ? pomodoroState.enabled : enabledOverride;
    const endAt = endAtOverride === null ? timerState.endAt : endAtOverride;

    await AlarmBridge.savePomodoroNativeState({
      enabled,
      phase: pomodoroState.phase,
      work: pomodoroState.workMinutes,
      break: pomodoroState.breakMinutes,
      cycle: pomodoroState.cycleCount,
      autoAdvance: pomodoroState.autoAdvance,
      endAt
    });
  } catch (e) {
    console.error("savePomodoroNativeState error:", e);
  }
}

function advancePomodoroAfterAlarm() {
  const shouldAdvance =
    timerState.mode === "pomodoro" &&
    pomodoroState.enabled === true &&
    pomodoroState.autoAdvance === true;

  alarmState.pendingPomodoroAdvance = false;
  resetFinishLocks();

  if (!shouldAdvance) {
    timerState.mode = "timer";
    saveTimerState();
    savePomodoroState();
    savePomodoroNativeState(false, 0);
    return;
  }

  handlePomodoroSwitch();
}

async function syncPomodoroStateFromNative() {
  if (!AlarmBridge?.getPomodoroState) return false;

  try {
    const result = await AlarmBridge.getPomodoroState();
    const data = result || {};

    if (!data.enabled) return false;

    pomodoroState.enabled = !!data.enabled;
    pomodoroState.phase = data.phase || "work";
    pomodoroState.workMinutes = safeNumber(data.work, 25);
    pomodoroState.breakMinutes = safeNumber(data.break, 5);
    pomodoroState.cycleCount = safeNumber(data.cycle, 0);
    pomodoroState.autoAdvance = data.autoAdvance !== false;

    timerState.mode = "pomodoro";
    timerState.running = true;
    timerState.paused = false;
    timerState.endAt = safeNumber(data.endAt, 0);
    timerState.totalTime =
      (pomodoroState.phase === "work"
        ? pomodoroState.workMinutes
        : pomodoroState.breakMinutes) * 60;
    timerState.timeLeft = getRemainingSecondsFromEndAt(timerState.endAt);

    if (timerState.timeLeft <= 0 || timerState.endAt <= 0) {
      timerState.running = false;
      timerState.paused = false;
      timerState.timeLeft = 0;
    }

    if ($("hours")) $("hours").value = 0;
    if ($("minutes")) {
      $("minutes").value =
        pomodoroState.phase === "work"
          ? pomodoroState.workMinutes
          : pomodoroState.breakMinutes;
    }
    if ($("seconds")) $("seconds").value = 0;

    clearInterval(timerState.timerId);
    timerState.timerId = null;

    if (timerState.running) {
      timerState.timerId = setInterval(() => {
        timerTick();
      }, 250);
      setText("timerStatus", "running");
    } else {
      setText("timerStatus", "ready");
    }

    updateTimerDisplay();
    updatePomodoroUI();
    updateTimerStartButton();

    saveTimerState();
    savePomodoroState();

    return true;
  } catch (e) {
    console.error("syncPomodoroStateFromNative error:", e);
    return false;
  }
}

async function finalizeExpiredTimerFromBackgroundReturn() {
  if (isFinishLocked()) return;

  markFinishHandled();

  timerState.timeLeft = 0;
  timerState.running = false;
  timerState.paused = false;
  timerState.endAt = 0;

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  updateTimerDisplay();
  setText("timerStatus", "done");
  updateTimerStartButton();

  await cancelNativeAlarm();

  saveTimerState();
  savePomodoroState();

  advancePomodoroAfterAlarm();
}

async function finishTimerInForeground() {
  if (isFinishLocked() || recentlyFinished()) return;

  markFinishHandled();

  try {
    timerState.timeLeft = 0;
    timerState.running = false;
    timerState.paused = false;
    timerState.endAt = 0;

    clearInterval(timerState.timerId);
    timerState.timerId = null;

    updateTimerDisplay();
    setText("timerStatus", "done");
    updateTimerStartButton();

    alarmState.pendingPomodoroAdvance =
      timerState.mode === "pomodoro" &&
      pomodoroState.enabled === true &&
      pomodoroState.autoAdvance === true;

    await cancelNativeAlarm();

    alarmState.isActive = true;
    showAlarmOverlay();
    await startPersistentAlarm();

    saveTimerState();
    savePomodoroState();
  } catch (err) {
    console.error("finishTimerInForeground error:", err);
  } finally {
    setTimeout(() => {
      timerState.finishing = false;
    }, 400);
  }
}

async function handleAppForeground() {
  visibilityState.isForeground = true;

  await cancelNativeAlarm();

  let stoppedFromNotification = false;
  try {
    if (AlarmBridge?.consumeAlarmStoppedFromNotification) {
      const res = await AlarmBridge.consumeAlarmStoppedFromNotification();
      stoppedFromNotification = !!res?.stopped;
    }
  } catch (e) {
    console.error("consumeAlarmStoppedFromNotification error:", e);
  }

  if (stoppedFromNotification) {
    resetFinishLocks();
    stopPersistentAlarm();
    alarmState.isActive = false;
    hideAlarmOverlay();

    const synced = await syncPomodoroStateFromNative();
    if (synced) return;
  }

  if (
    timerState.running &&
    !isFinishLocked() &&
    isTimerExpired()
  ) {
    await finalizeExpiredTimerFromBackgroundReturn();
    return;
  }

  if (timerState.running && timerState.endAt > 0) {
    timerState.timeLeft = getRemainingSecondsFromEndAt(timerState.endAt);
    updateTimerDisplay();
  }

  if (alarmState.isActive) {
    try {
      showAlarmOverlay();
      await startPersistentAlarm();
    } catch (err) {
      console.error("resume alarm ui error:", err);
    }
  }
}

async function handleAppBackground() {
  visibilityState.isForeground = false;

  if (timerState.running && timerState.endAt > nowMs()) {
    await scheduleNativeAlarmAtEnd();
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

    try {
      await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (alarmState.isActive) return;

        if (canGoBack && window.history.length > 1) {
          window.history.back();
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
  if ($("soundToggle")?.checked === false) return;

  try {
    stopPreviewSound();
    await unlockAudioOnce();

    const preview = new Audio(sound.assetPath);
    alarmState.previewAudio = preview;
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
  return `timer_alerts_v13_${soundId}`;
}

function getNotificationChannelForCurrentSound() {
  const sound = getSelectedSound();
  if (!sound?.rawName) return "timer_alerts_fallback_v13";
  return getSoundChannelId(sound.id);
}

async function ensureNotificationChannels() {
  if (!CapacitorLocalNotifications) return;

  try {
    const existing = CapacitorLocalNotifications.listChannels
      ? await CapacitorLocalNotifications.listChannels()
      : { channels: [] };

    const existingIds = new Set((existing?.channels || []).map((c) => c.id));
    const vibrationEnabled = $("vibrationToggle")?.checked !== false;

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
            vibration: vibrationEnabled,
            sound: fileNameWithoutExt(sound.assetPath)
          });
        } catch (e) {
          console.warn("createChannel failed", channelId, e);
        }
      }
    }

    if (!existingIds.has("timer_alerts_fallback_v13")) {
      try {
        await CapacitorLocalNotifications.createChannel({
          id: "timer_alerts_fallback_v13",
          name: "Timer fallback",
          description: "Fallback timer alerts",
          importance: 5,
          visibility: 1,
          vibration: vibrationEnabled,
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
// NATIVE ALARM
// ===============================
async function scheduleNativeAlarmAtEnd() {
  if (!AlarmBridge) return false;
  if (!timerState.endAt || timerState.endAt <= nowMs()) return false;

  try {
    await AlarmBridge.scheduleAlarm({
      triggerAtMillis: timerState.endAt,
      title: "Süre doldu!",
      message: "Alarm çalıyor",
      soundName: getSelectedSoundRawName()
    });
    return true;
  } catch (e) {
    console.warn("Native alarm schedule failed:", e);
    return false;
  }
}

async function scheduleNativeAlarmAtEndNow() {
  if (!AlarmBridge) return false;

  try {
    await AlarmBridge.scheduleAlarm({
      triggerAtMillis: Date.now() + 100,
      title: "Süre doldu!",
      message: "Alarm çalıyor",
      soundName: getSelectedSoundRawName()
    });
    return true;
  } catch (e) {
    console.warn("Native immediate alarm failed:", e);
    return false;
  }
}

async function cancelNativeAlarm() {
  if (!AlarmBridge) return false;

  try {
    await AlarmBridge.cancelAlarm();
    return true;
  } catch (e) {
    console.warn("Native alarm cancel failed:", e);
    return false;
  }
}

// ===============================
// NOTIFICATIONS / ALARM FLOW
// ===============================
async function cancelAlarmNotification() {
  await cancelNativeAlarm();

  if (!CapacitorLocalNotifications) return;

  try {
    await CapacitorLocalNotifications.cancel({
      notifications: [{ id: notificationState.scheduledTimerNotificationId }]
    });
  } catch {}

  try {
    if (CapacitorLocalNotifications.removeAllDeliveredNotifications) {
      await CapacitorLocalNotifications.removeAllDeliveredNotifications();
    }
  } catch {}
}

async function scheduleEndAlarmNotification() {
  if (!timerState.endAt || timerState.endAt <= nowMs()) return;

  try {
    await cancelNativeAlarm();
  } catch {}

  if (!shouldUseNativeAlarm()) {
    return;
  }

  await scheduleNativeAlarmAtEnd();
}

async function showImmediateFinishedNotification() {
  if (isAppForeground()) {
    alarmState.isActive = true;
    showAlarmOverlay();
    await startPersistentAlarm();
  }
}

async function dismissAlarmFlow() {
  await cancelNativeAlarm();
  stopPersistentAlarm();
  alarmState.isActive = false;
  hideAlarmOverlay();

  try {
    await cancelAlarmNotification();
  } catch {}

  resetFinishLocks();
  advancePomodoroAfterAlarm();
}

async function setupNotificationListeners() {
  notificationState.listenersReady = true;
}

// ===============================
// TIMER ENGINE
// ===============================
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

async function timerTick() {
  if (!timerState.running) return;
  if (isFinishLocked()) return;

  try {
    const now = nowMs();
    timerState.timeLeft = Math.max(0, Math.ceil((timerState.endAt - now) / 1000));

    if (timerState.timeLeft <= 0) {
      markFinishHandled();

      timerState.timeLeft = 0;
      timerState.running = false;
      timerState.paused = false;
      timerState.endAt = 0;

      clearInterval(timerState.timerId);
      timerState.timerId = null;

      updateTimerDisplay();
      setText("timerStatus", "done");
      updateTimerStartButton();

      setTimeout(() => {
        onTimerFinished().catch((err) => {
          console.error("onTimerFinished deferred error:", err);
        });
      }, 0);

      return;
    }

    updateTimerDisplay();
  } catch (err) {
    console.error("timerTick error:", err);
    timerState.finishing = false;
  }
}

async function startTimer(fromPomodoro = false) {
  if (timerState.running) return;

  if (timerState.paused && timerState.timeLeft > 0) {
    await resumeTimer();
    return;
  }

  resetFinishLocks();
  await cancelNativeAlarm();

  stopPersistentAlarm();
  alarmState.isActive = false;
  hideAlarmOverlay();

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
    await savePomodoroNativeState(false, 0);
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

  if (timerState.mode === "pomodoro") {
    await savePomodoroNativeState(true, timerState.endAt);
  }

  updateTimerDisplay();
  timerState.timerId = setInterval(() => {
    timerTick();
  }, 250);

  setText("timerStatus", "running");
  updateTimerStartButton();
  saveTimerState();

  await scheduleEndAlarmNotification();
}

async function pauseTimer() {
  if (!timerState.running) return;

  timerState.timeLeft = getRemainingSecondsFromEndAt(timerState.endAt);

  clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
  timerState.paused = true;
  timerState.endAt = 0;

  await cancelAlarmNotification();

  if (timerState.mode === "pomodoro" && pomodoroState.enabled) {
    await savePomodoroNativeState(true, 0);
  }

  updateTimerDisplay();
  setText("timerStatus", "paused");
  updateTimerStartButton();
  saveTimerState();
}

async function resumeTimer() {
  if (!timerState.paused && timerState.timeLeft <= 0) return;

  resetFinishLocks();
  await cancelNativeAlarm();

  const exactGranted = await ensureExactAlarmPermission();
  if (!exactGranted) return;

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  timerState.running = true;
  timerState.paused = false;
  timerState.endAt = nowMs() + timerState.timeLeft * 1000;
  timerState.timerId = setInterval(() => {
    timerTick();
  }, 250);

  if (timerState.mode === "pomodoro" && pomodoroState.enabled) {
    await savePomodoroNativeState(true, timerState.endAt);
  }

  setText("timerStatus", "running");
  updateTimerStartButton();
  updateTimerDisplay();

  await scheduleEndAlarmNotification();
  saveTimerState();
}

async function resetTimer() {
  resetFinishLocks();

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

  stopPersistentAlarm();
  alarmState.isActive = false;
  hideAlarmOverlay();

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  await cancelAlarmNotification();
  await savePomodoroNativeState(false, 0);

  setText("timerStatus", "ready");
  updateTimerStartButton();

  saveTimerState();
  savePomodoroState();
}

async function onTimerFinished() {
  try {
    alarmState.pendingPomodoroAdvance =
      timerState.mode === "pomodoro" &&
      pomodoroState.enabled === true &&
      pomodoroState.autoAdvance === true;

    if (isAppForeground()) {
      await cancelNativeAlarm();

      alarmState.isActive = true;
      showAlarmOverlay();
      await startPersistentAlarm();
    } else {
      await scheduleNativeAlarmAtEndNow();
    }

    updateTimerStartButton();
    saveTimerState();
    savePomodoroState();
  } catch (err) {
    console.error("onTimerFinished error:", err);
  } finally {
    setTimeout(() => {
      timerState.finishing = false;
    }, 400);
  }
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
      savePomodoroNativeState(false, 0);
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

  setTimeout(async () => {
    if (pomodoroState.enabled) {
      await savePomodoroNativeState(true, 0);
      await startTimer(true);
    }
  }, 300);
}

async function resetPomodoro() {
  resetFinishLocks();

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

  stopPersistentAlarm();
  alarmState.isActive = false;
  hideAlarmOverlay();

  if ($("pomodoroWork")) $("pomodoroWork").value = 25;
  if ($("pomodoroBreak")) $("pomodoroBreak").value = 5;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();
  await cancelAlarmNotification();
  await savePomodoroNativeState(false, 0);

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
  savePomodoroNativeState(true, timerState.endAt || 0);
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
  saveStopwatchState();
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
    language: $("language")?.value || appState.language || getSupportedInitialLanguage(),
    theme: "dark",
    lastTab: appState.lastTab
  }));
}

function loadAppState() {
  const data = safeParse(localStorage.getItem(STORAGE_KEYS.app));
  if (!data) return;

  if (data.language) {
    appState.language = data.language;
    if ($("language")) {
      $("language").value = data.language;
    }
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
  resetFinishLocks();

  clearInterval(timerState.timerId);
  timerState.timerId = null;

  if (data.running && data.endAt) {
    const remaining = Math.max(0, Math.ceil((data.endAt - nowMs()) / 1000));
    timerState.timeLeft = remaining;

    if (remaining > 0) {
      timerState.running = true;
      timerState.paused = false;
      timerState.timerId = setInterval(() => {
        timerTick();
      }, 250);
    } else {
      timerState.running = false;
      timerState.paused = false;
      timerState.endAt = 0;
      timerState.timeLeft = 0;
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

      if (timerState.running && timerState.timeLeft > 0) {
        await scheduleEndAlarmNotification();
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
    await unlockAudioOnce();
    await startTimer(false);
  });

  bind("timerPauseBtn", "click", pauseTimer);
  bind("timerResetBtn", "click", resetTimer);

  bind("applyPomodoroBtn", "click", async () => {
    await unlockAudioOnce();
    applyPomodoro();
  });

  bind("pomodoroResetBtn", "click", resetPomodoro);
  bind("pomodoroCycleResetBtn", "click", async () => resetPomodoroCycle());

  bind("swStartBtn", "click", async () => toggleStopwatch());
  bind("swLapBtn", "click", async () => addLap());
  bind("swResetBtn", "click", async () => resetStopwatch());
  bind("swClearLapsBtn", "click", async () => clearLaps());

  bind("dismissAlarmBtn", "click", async () => {
    await dismissAlarmFlow();
  });

  bind("previewSoundBtn", "click", async () => {
    await unlockAudioOnce();
    await previewSound(getSelectedSound());
  });

  bind("language", "change", async () => {
    applyLanguage();
    saveAppState();
  });

  bind("themeToggle", "click", async () => toggleTheme());

  bind("soundToggle", "change", async () => {
    if ($("soundToggle")?.checked === false) {
      stopPersistentAlarm();
    }

    if (timerState.running && timerState.timeLeft > 0) {
      await scheduleEndAlarmNotification();
    }
  });

  bind("vibrationToggle", "change", async () => {
    if (timerState.running && timerState.timeLeft > 0) {
      await scheduleEndAlarmNotification();
    }
  });

  document.addEventListener("click", unlockAudioOnce, { once: true });
  document.addEventListener("touchstart", unlockAudioOnce, { once: true });
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

    await requestNotificationPermission();
    await ensureExactAlarmPermission();
    await registerNotificationActions();
    await setupNotificationListeners();
    await setupVisibilityListeners();

    // Native taraf bildirimden pomodoro devam etmişse senkronla
    await syncPomodoroStateFromNative();

    applyLanguage();
    updateTimerDisplay();
    updateStopwatchDisplay();
    updateTimerStartButton();
    updateStopwatchStartButton();
    updatePomodoroUI();
    hideAlarmOverlay();

    switchTab(appState.lastTab || "timerPanel");
    startUIRenderLoop();

    if (timerState.running && timerState.endAt > nowMs()) {
      await scheduleEndAlarmNotification();
    }

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
