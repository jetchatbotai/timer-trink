const $ = (id) => document.getElementById(id);

const timerState = {
  timerId: null,
  running: false,
  timeLeft: 0,
  totalTime: 0
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
  breakMinutes: 5
};

const alarmState = {
  intervalId: null,
  active: false,
  pendingAction: null,
  audioContext: null
};

const translations = {
  tr: {
    subtitle: "Odak ve günlük kullanım için basit zamanlayıcı",
    timer: "Zamanlayıcı",
    pomodoro: "Pomodoro",
    stopwatch: "Kronometre",
    sounds: "Sesler",
    start: "Başlat",
    pause: "Duraklat",
    reset: "Sıfırla",
    lap: "Tur",
    soundOn: "Ses açık",
    vibrationOn: "Titreşim açık",
    ready: "Hazır",
    paused: "Duraklatıldı",
    running: "Zamanlayıcı çalışıyor",
    stopwatchRunning: "Kronometre çalışıyor",
    reseted: "Sıfırlandı",
    invalid: "Lütfen geçerli bir süre gir.",
    done: "Süre doldu!",
    hours: "Saat",
    minutes: "Dakika",
    seconds: "Saniye",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Bir odak hazır ayarı seç ve zamanlayıcıya yükle.",
    work: "Çalışma",
    break: "Mola",
    applyPomodoro: "Pomodoro Uygula",
    pomodoroApplied: "Pomodoro zamanlayıcıya yüklendi",
    soundsTitle: "Alarm sesleri",
    soundsDesc: "Bir ses seç ve önizleme yap.",
    preview: "Sesi dinle",
    laps: "Turlar",
    soundCount: "20 ses",
    dismissAlarm: "Kapat",
    alarmPlaying: "Alarm çalıyor",
    focusFinished: "Odak süresi bitti",
    breakFinished: "Mola bitti",
    workStatus: "Odak süresi",
    breakStatus: "Mola süresi"
  },
  en: {
    subtitle: "Simple timer for focus and daily use",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stopwatch",
    sounds: "Sounds",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    lap: "Lap",
    soundOn: "Sound on",
    vibrationOn: "Vibration on",
    ready: "Ready",
    paused: "Paused",
    running: "Timer is running",
    stopwatchRunning: "Stopwatch is running",
    reseted: "Reset",
    invalid: "Please enter a valid time.",
    done: "Time is up!",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Choose a focus preset and load it into timer.",
    work: "Work",
    break: "Break",
    applyPomodoro: "Apply Pomodoro",
    pomodoroApplied: "Pomodoro loaded into timer",
    soundsTitle: "Alarm sounds",
    soundsDesc: "Select a sound and preview it.",
    preview: "Preview sound",
    laps: "Laps",
    soundCount: "20 sounds",
    dismissAlarm: "Dismiss",
    alarmPlaying: "Alarm is ringing",
    focusFinished: "Focus session finished",
    breakFinished: "Break finished",
    workStatus: "Focus period",
    breakStatus: "Break period"
  },
  de: {
    subtitle: "Einfacher Timer für Fokus und Alltag",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stoppuhr",
    sounds: "Töne",
    start: "Start",
    pause: "Pause",
    reset: "Zurücksetzen",
    lap: "Runde",
    soundOn: "Ton an",
    vibrationOn: "Vibration an",
    ready: "Bereit",
    paused: "Pausiert",
    running: "Timer läuft",
    stopwatchRunning: "Stoppuhr läuft",
    reseted: "Zurückgesetzt",
    invalid: "Bitte gültige Zeit eingeben.",
    done: "Zeit ist um!",
    hours: "Stunden",
    minutes: "Minuten",
    seconds: "Sekunden",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Wähle ein Fokus-Preset und lade es in den Timer.",
    work: "Arbeit",
    break: "Pause",
    applyPomodoro: "Pomodoro anwenden",
    pomodoroApplied: "Pomodoro in Timer geladen",
    soundsTitle: "Alarmtöne",
    soundsDesc: "Wähle einen Ton und höre ihn an.",
    preview: "Ton anhören",
    laps: "Runden",
    soundCount: "20 Töne",
    dismissAlarm: "Schließen",
    alarmPlaying: "Alarm läuft",
    focusFinished: "Fokuszeit beendet",
    breakFinished: "Pause beendet",
    workStatus: "Fokuszeit",
    breakStatus: "Pausenzeit"
  },
  ru: {
    subtitle: "Простой таймер для фокуса и повседневного использования",
    timer: "Таймер",
    pomodoro: "Помодоро",
    stopwatch: "Секундомер",
    sounds: "Звуки",
    start: "Старт",
    pause: "Пауза",
    reset: "Сброс",
    lap: "Круг",
    soundOn: "Звук включён",
    vibrationOn: "Вибрация включена",
    ready: "Готово",
    paused: "На паузе",
    running: "Таймер работает",
    stopwatchRunning: "Секундомер работает",
    reseted: "Сброшено",
    invalid: "Введите корректное время.",
    done: "Время вышло!",
    hours: "Часы",
    minutes: "Минуты",
    seconds: "Секунды",
    pomodoroTitle: "Помодоро",
    pomodoroDesc: "Выберите пресет и загрузите его в таймер.",
    work: "Работа",
    break: "Перерыв",
    applyPomodoro: "Применить Pomodoro",
    pomodoroApplied: "Pomodoro загружен в таймер",
    soundsTitle: "Звуки будильника",
    soundsDesc: "Выберите звук и прослушайте его.",
    preview: "Прослушать",
    laps: "Круги",
    soundCount: "20 звуков",
    dismissAlarm: "Закрыть",
    alarmPlaying: "Будильник звонит",
    focusFinished: "Сеанс фокуса завершён",
    breakFinished: "Перерыв завершён",
    workStatus: "Фокус",
    breakStatus: "Перерыв"
  },
  zh: {
    subtitle: "适合专注和日常使用的简洁计时器",
    timer: "计时器",
    pomodoro: "番茄钟",
    stopwatch: "秒表",
    sounds: "声音",
    start: "开始",
    pause: "暂停",
    reset: "重置",
    lap: "计圈",
    soundOn: "声音开启",
    vibrationOn: "震动开启",
    ready: "准备就绪",
    paused: "已暂停",
    running: "计时器运行中",
    stopwatchRunning: "秒表运行中",
    reseted: "已重置",
    invalid: "请输入有效时间。",
    done: "时间到！",
    hours: "小时",
    minutes: "分钟",
    seconds: "秒",
    pomodoroTitle: "番茄钟",
    pomodoroDesc: "选择一个预设并加载到计时器。",
    work: "工作",
    break: "休息",
    applyPomodoro: "应用番茄钟",
    pomodoroApplied: "番茄钟已加载到计时器",
    soundsTitle: "闹铃声音",
    soundsDesc: "选择一个声音并试听。",
    preview: "试听声音",
    laps: "计圈",
    soundCount: "20 种声音",
    dismissAlarm: "关闭",
    alarmPlaying: "闹铃正在响",
    focusFinished: "专注时间结束",
    breakFinished: "休息结束",
    workStatus: "专注时间",
    breakStatus: "休息时间"
  }
};
Object.assign(translations, {
  fr: {
    subtitle: "Minuteur simple pour la concentration et l’usage quotidien",
    timer: "Minuteur",
    pomodoro: "Pomodoro",
    stopwatch: "Chronomètre",
    sounds: "Sons",
    start: "Démarrer",
    pause: "Pause",
    reset: "Réinitialiser",
    lap: "Tour",
    soundOn: "Son activé",
    vibrationOn: "Vibration activée",
    ready: "Prêt",
    paused: "En pause",
    running: "Le minuteur fonctionne",
    stopwatchRunning: "Le chronomètre fonctionne",
    reseted: "Réinitialisé",
    invalid: "Veuillez saisir une durée valide.",
    done: "Temps écoulé !",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Choisissez un préréglage de concentration et chargez-le dans le minuteur.",
    work: "Travail",
    break: "Pause",
    applyPomodoro: "Appliquer Pomodoro",
    pomodoroApplied: "Pomodoro chargé dans le minuteur",
    soundsTitle: "Sons d’alarme",
    soundsDesc: "Choisissez un son et écoutez un aperçu.",
    preview: "Écouter",
    laps: "Tours",
    soundCount: "20 sons",
    dismissAlarm: "Fermer",
    alarmPlaying: "L’alarme sonne",
    focusFinished: "Session de concentration terminée",
    breakFinished: "Pause terminée",
    workStatus: "Période de concentration",
    breakStatus: "Période de pause"
  },

  es: {
    subtitle: "Temporizador simple para concentración y uso diario",
    timer: "Temporizador",
    pomodoro: "Pomodoro",
    stopwatch: "Cronómetro",
    sounds: "Sonidos",
    start: "Iniciar",
    pause: "Pausar",
    reset: "Restablecer",
    lap: "Vuelta",
    soundOn: "Sonido activado",
    vibrationOn: "Vibración activada",
    ready: "Listo",
    paused: "Pausado",
    running: "El temporizador está en marcha",
    stopwatchRunning: "El cronómetro está en marcha",
    reseted: "Restablecido",
    invalid: "Introduce un tiempo válido.",
    done: "¡Se acabó el tiempo!",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Elige un ajuste de enfoque y cárgalo en el temporizador.",
    work: "Trabajo",
    break: "Descanso",
    applyPomodoro: "Aplicar Pomodoro",
    pomodoroApplied: "Pomodoro cargado en el temporizador",
    soundsTitle: "Sonidos de alarma",
    soundsDesc: "Selecciona un sonido y escúchalo.",
    preview: "Escuchar",
    laps: "Vueltas",
    soundCount: "20 sonidos",
    dismissAlarm: "Cerrar",
    alarmPlaying: "La alarma está sonando",
    focusFinished: "La sesión de enfoque ha terminado",
    breakFinished: "El descanso ha terminado",
    workStatus: "Período de enfoque",
    breakStatus: "Período de descanso"
  },

  ar: {
    subtitle: "مؤقت بسيط للتركيز والاستخدام اليومي",
    timer: "المؤقت",
    pomodoro: "بومودورو",
    stopwatch: "ساعة إيقاف",
    sounds: "الأصوات",
    start: "ابدأ",
    pause: "إيقاف مؤقت",
    reset: "إعادة تعيين",
    lap: "لفة",
    soundOn: "الصوت مفعّل",
    vibrationOn: "الاهتزاز مفعّل",
    ready: "جاهز",
    paused: "متوقف مؤقتًا",
    running: "المؤقت يعمل",
    stopwatchRunning: "ساعة الإيقاف تعمل",
    reseted: "تمت إعادة التعيين",
    invalid: "الرجاء إدخال وقت صالح.",
    done: "انتهى الوقت!",
    hours: "الساعات",
    minutes: "الدقائق",
    seconds: "الثواني",
    pomodoroTitle: "بومودورو",
    pomodoroDesc: "اختر إعداد تركيز جاهز وقم بتحميله إلى المؤقت.",
    work: "العمل",
    break: "الاستراحة",
    applyPomodoro: "تطبيق بومودورو",
    pomodoroApplied: "تم تحميل بومودورو إلى المؤقت",
    soundsTitle: "أصوات التنبيه",
    soundsDesc: "اختر صوتًا واستمع إلى المعاينة.",
    preview: "استمع",
    laps: "اللفات",
    soundCount: "20 صوتًا",
    dismissAlarm: "إغلاق",
    alarmPlaying: "المنبّه يعمل",
    focusFinished: "انتهت جلسة التركيز",
    breakFinished: "انتهت الاستراحة",
    workStatus: "فترة التركيز",
    breakStatus: "فترة الاستراحة"
  },

  it: {
    subtitle: "Timer semplice per concentrazione e uso quotidiano",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Cronometro",
    sounds: "Suoni",
    start: "Avvia",
    pause: "Pausa",
    reset: "Reimposta",
    lap: "Giro",
    soundOn: "Suono attivo",
    vibrationOn: "Vibrazione attiva",
    ready: "Pronto",
    paused: "In pausa",
    running: "Il timer è in esecuzione",
    stopwatchRunning: "Il cronometro è in esecuzione",
    reseted: "Reimpostato",
    invalid: "Inserisci un tempo valido.",
    done: "Tempo scaduto!",
    hours: "Ore",
    minutes: "Minuti",
    seconds: "Secondi",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Scegli un preset di concentrazione e caricalo nel timer.",
    work: "Lavoro",
    break: "Pausa",
    applyPomodoro: "Applica Pomodoro",
    pomodoroApplied: "Pomodoro caricato nel timer",
    soundsTitle: "Suoni di allarme",
    soundsDesc: "Scegli un suono e ascolta l’anteprima.",
    preview: "Ascolta",
    laps: "Giri",
    soundCount: "20 suoni",
    dismissAlarm: "Chiudi",
    alarmPlaying: "L’allarme sta suonando",
    focusFinished: "Sessione di concentrazione terminata",
    breakFinished: "Pausa terminata",
    workStatus: "Periodo di concentrazione",
    breakStatus: "Periodo di pausa"
  },

  pt: {
    subtitle: "Temporizador simples para foco e uso diário",
    timer: "Temporizador",
    pomodoro: "Pomodoro",
    stopwatch: "Cronômetro",
    sounds: "Sons",
    start: "Iniciar",
    pause: "Pausar",
    reset: "Redefinir",
    lap: "Volta",
    soundOn: "Som ligado",
    vibrationOn: "Vibração ligada",
    ready: "Pronto",
    paused: "Pausado",
    running: "O temporizador está em execução",
    stopwatchRunning: "O cronômetro está em execução",
    reseted: "Redefinido",
    invalid: "Insira um tempo válido.",
    done: "O tempo acabou!",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Escolha uma predefinição de foco e carregue-a no temporizador.",
    work: "Trabalho",
    break: "Pausa",
    applyPomodoro: "Aplicar Pomodoro",
    pomodoroApplied: "Pomodoro carregado no temporizador",
    soundsTitle: "Sons de alarme",
    soundsDesc: "Escolha um som e ouça a prévia.",
    preview: "Ouvir",
    laps: "Voltas",
    soundCount: "20 sons",
    dismissAlarm: "Fechar",
    alarmPlaying: "O alarme está tocando",
    focusFinished: "Sessão de foco concluída",
    breakFinished: "Pausa concluída",
    workStatus: "Período de foco",
    breakStatus: "Período de pausa"
  },

  ja: {
    subtitle: "集中と日常利用のためのシンプルなタイマー",
    timer: "タイマー",
    pomodoro: "ポモドーロ",
    stopwatch: "ストップウォッチ",
    sounds: "サウンド",
    start: "開始",
    pause: "一時停止",
    reset: "リセット",
    lap: "ラップ",
    soundOn: "サウンドオン",
    vibrationOn: "バイブオン",
    ready: "準備完了",
    paused: "一時停止中",
    running: "タイマー作動中",
    stopwatchRunning: "ストップウォッチ作動中",
    reseted: "リセット済み",
    invalid: "有効な時間を入力してください。",
    done: "時間切れです！",
    hours: "時間",
    minutes: "分",
    seconds: "秒",
    pomodoroTitle: "ポモドーロ",
    pomodoroDesc: "集中プリセットを選んでタイマーに読み込みます。",
    work: "作業",
    break: "休憩",
    applyPomodoro: "ポモドーロを適用",
    pomodoroApplied: "ポモドーロをタイマーに読み込みました",
    soundsTitle: "アラーム音",
    soundsDesc: "音を選んで試聴します。",
    preview: "試聴",
    laps: "ラップ",
    soundCount: "20種類の音",
    dismissAlarm: "閉じる",
    alarmPlaying: "アラームが鳴っています",
    focusFinished: "集中時間が終了しました",
    breakFinished: "休憩時間が終了しました",
    workStatus: "集中時間",
    breakStatus: "休憩時間"
  },

  ko: {
    subtitle: "집중과 일상 사용을 위한 간단한 타이머",
    timer: "타이머",
    pomodoro: "포모도로",
    stopwatch: "스톱워치",
    sounds: "소리",
    start: "시작",
    pause: "일시정지",
    reset: "재설정",
    lap: "랩",
    soundOn: "소리 켜짐",
    vibrationOn: "진동 켜짐",
    ready: "준비됨",
    paused: "일시정지됨",
    running: "타이머가 실행 중입니다",
    stopwatchRunning: "스톱워치가 실행 중입니다",
    reseted: "재설정됨",
    invalid: "올바른 시간을 입력하세요.",
    done: "시간이 끝났습니다!",
    hours: "시간",
    minutes: "분",
    seconds: "초",
    pomodoroTitle: "포모도로",
    pomodoroDesc: "집중 프리셋을 선택해 타이머에 불러오세요.",
    work: "작업",
    break: "휴식",
    applyPomodoro: "포모도로 적용",
    pomodoroApplied: "포모도로가 타이머에 적용되었습니다",
    soundsTitle: "알람 소리",
    soundsDesc: "소리를 선택하고 미리 들어보세요.",
    preview: "미리 듣기",
    laps: "랩",
    soundCount: "20개 소리",
    dismissAlarm: "닫기",
    alarmPlaying: "알람이 울리고 있습니다",
    focusFinished: "집중 시간이 끝났습니다",
    breakFinished: "휴식 시간이 끝났습니다",
    workStatus: "집중 시간",
    breakStatus: "휴식 시간"
  },

  hi: {
    subtitle: "फोकस और दैनिक उपयोग के लिए सरल टाइमर",
    timer: "टाइमर",
    pomodoro: "पोमोडोरो",
    stopwatch: "स्टॉपवॉच",
    sounds: "ध्वनियाँ",
    start: "शुरू करें",
    pause: "रोकें",
    reset: "रीसेट",
    lap: "लैप",
    soundOn: "ध्वनि चालू",
    vibrationOn: "वाइब्रेशन चालू",
    ready: "तैयार",
    paused: "रुका हुआ",
    running: "टाइमर चल रहा है",
    stopwatchRunning: "स्टॉपवॉच चल रही है",
    reseted: "रीसेट किया गया",
    invalid: "कृपया मान्य समय दर्ज करें।",
    done: "समय समाप्त!",
    hours: "घंटे",
    minutes: "मिनट",
    seconds: "सेकंड",
    pomodoroTitle: "पोमोडोरो",
    pomodoroDesc: "एक फोकस प्रीसेट चुनें और उसे टाइमर में लोड करें।",
    work: "कार्य",
    break: "ब्रेक",
    applyPomodoro: "पोमोडोरो लागू करें",
    pomodoroApplied: "पोमोडोरो टाइमर में लोड किया गया",
    soundsTitle: "अलार्म ध्वनियाँ",
    soundsDesc: "एक ध्वनि चुनें और उसका पूर्वावलोकन करें।",
    preview: "सुनें",
    laps: "लैप्स",
    soundCount: "20 ध्वनियाँ",
    dismissAlarm: "बंद करें",
    alarmPlaying: "अलार्म बज रहा है",
    focusFinished: "फोकस सत्र समाप्त हुआ",
    breakFinished: "ब्रेक समाप्त हुआ",
    workStatus: "फोकस अवधि",
    breakStatus: "ब्रेक अवधि"
  },

  fa: {
    subtitle: "تایمر ساده برای تمرکز و استفاده روزانه",
    timer: "تایمر",
    pomodoro: "پومودورو",
    stopwatch: "کرنومتر",
    sounds: "صداها",
    start: "شروع",
    pause: "توقف موقت",
    reset: "بازنشانی",
    lap: "دور",
    soundOn: "صدا روشن",
    vibrationOn: "لرزش روشن",
    ready: "آماده",
    paused: "متوقف شده",
    running: "تایمر در حال اجراست",
    stopwatchRunning: "کرنومتر در حال اجراست",
    reseted: "بازنشانی شد",
    invalid: "لطفاً زمان معتبر وارد کنید.",
    done: "زمان تمام شد!",
    hours: "ساعت",
    minutes: "دقیقه",
    seconds: "ثانیه",
    pomodoroTitle: "پومودورو",
    pomodoroDesc: "یک تنظیم آماده تمرکز انتخاب کنید و آن را در تایمر بارگذاری کنید.",
    work: "کار",
    break: "استراحت",
    applyPomodoro: "اعمال پومودورو",
    pomodoroApplied: "پومودورو در تایمر بارگذاری شد",
    soundsTitle: "صداهای هشدار",
    soundsDesc: "یک صدا انتخاب کن و پیش‌نمایش آن را بشنو.",
    preview: "پخش",
    laps: "دورها",
    soundCount: "20 صدا",
    dismissAlarm: "بستن",
    alarmPlaying: "هشدار در حال پخش است",
    focusFinished: "جلسه تمرکز تمام شد",
    breakFinished: "استراحت تمام شد",
    workStatus: "دوره تمرکز",
    breakStatus: "دوره استراحت"
  },

  uk: {
    subtitle: "Простий таймер для концентрації та щоденного використання",
    timer: "Таймер",
    pomodoro: "Помодоро",
    stopwatch: "Секундомір",
    sounds: "Звуки",
    start: "Почати",
    pause: "Пауза",
    reset: "Скинути",
    lap: "Коло",
    soundOn: "Звук увімкнено",
    vibrationOn: "Вібрацію увімкнено",
    ready: "Готово",
    paused: "На паузі",
    running: "Таймер працює",
    stopwatchRunning: "Секундомір працює",
    reseted: "Скинуто",
    invalid: "Введіть коректний час.",
    done: "Час вийшов!",
    hours: "Години",
    minutes: "Хвилини",
    seconds: "Секунди",
    pomodoroTitle: "Помодоро",
    pomodoroDesc: "Оберіть пресет фокусу й завантажте його в таймер.",
    work: "Робота",
    break: "Перерва",
    applyPomodoro: "Застосувати Pomodoro",
    pomodoroApplied: "Pomodoro завантажено в таймер",
    soundsTitle: "Звуки будильника",
    soundsDesc: "Оберіть звук і прослухайте його.",
    preview: "Прослухати",
    laps: "Кола",
    soundCount: "20 звуків",
    dismissAlarm: "Закрити",
    alarmPlaying: "Сигнал лунає",
    focusFinished: "Сеанс фокусування завершено",
    breakFinished: "Перерву завершено",
    workStatus: "Період фокусування",
    breakStatus: "Період перерви"
  },

  pl: {
    subtitle: "Prosty timer do skupienia i codziennego użytku",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stoper",
    sounds: "Dźwięki",
    start: "Start",
    pause: "Pauza",
    reset: "Resetuj",
    lap: "Okrążenie",
    soundOn: "Dźwięk włączony",
    vibrationOn: "Wibracje włączone",
    ready: "Gotowe",
    paused: "Wstrzymano",
    running: "Timer działa",
    stopwatchRunning: "Stoper działa",
    reseted: "Zresetowano",
    invalid: "Wprowadź poprawny czas.",
    done: "Czas minął!",
    hours: "Godziny",
    minutes: "Minuty",
    seconds: "Sekundy",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Wybierz preset skupienia i załaduj go do timera.",
    work: "Praca",
    break: "Przerwa",
    applyPomodoro: "Zastosuj Pomodoro",
    pomodoroApplied: "Pomodoro załadowano do timera",
    soundsTitle: "Dźwięki alarmu",
    soundsDesc: "Wybierz dźwięk i odsłuchaj podgląd.",
    preview: "Odtwórz",
    laps: "Okrążenia",
    soundCount: "20 dźwięków",
    dismissAlarm: "Zamknij",
    alarmPlaying: "Alarm dzwoni",
    focusFinished: "Sesja skupienia zakończona",
    breakFinished: "Przerwa zakończona",
    workStatus: "Czas skupienia",
    breakStatus: "Czas przerwy"
  },

  nl: {
    subtitle: "Eenvoudige timer voor focus en dagelijks gebruik",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stopwatch",
    sounds: "Geluiden",
    start: "Start",
    pause: "Pauze",
    reset: "Reset",
    lap: "Ronde",
    soundOn: "Geluid aan",
    vibrationOn: "Trilling aan",
    ready: "Gereed",
    paused: "Gepauzeerd",
    running: "Timer loopt",
    stopwatchRunning: "Stopwatch loopt",
    reseted: "Gerest",
    invalid: "Voer een geldige tijd in.",
    done: "Tijd is om!",
    hours: "Uren",
    minutes: "Minuten",
    seconds: "Seconden",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Kies een focuspreset en laad deze in de timer.",
    work: "Werk",
    break: "Pauze",
    applyPomodoro: "Pomodoro toepassen",
    pomodoroApplied: "Pomodoro geladen in de timer",
    soundsTitle: "Alarmgeluiden",
    soundsDesc: "Kies een geluid en luister naar de preview.",
    preview: "Beluisteren",
    laps: "Rondes",
    soundCount: "20 geluiden",
    dismissAlarm: "Sluiten",
    alarmPlaying: "Alarm gaat af",
    focusFinished: "Focussessie voltooid",
    breakFinished: "Pauze voltooid",
    workStatus: "Focusperiode",
    breakStatus: "Pauzeperiode"
  },

  sv: {
    subtitle: "Enkel timer för fokus och daglig användning",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stoppur",
    sounds: "Ljud",
    start: "Starta",
    pause: "Paus",
    reset: "Återställ",
    lap: "Varv",
    soundOn: "Ljud på",
    vibrationOn: "Vibration på",
    ready: "Redo",
    paused: "Pausad",
    running: "Timern körs",
    stopwatchRunning: "Stoppuret körs",
    reseted: "Återställd",
    invalid: "Ange en giltig tid.",
    done: "Tiden är ute!",
    hours: "Timmar",
    minutes: "Minuter",
    seconds: "Sekunder",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Välj ett fokusförval och ladda det i timern.",
    work: "Arbete",
    break: "Paus",
    applyPomodoro: "Använd Pomodoro",
    pomodoroApplied: "Pomodoro laddad i timern",
    soundsTitle: "Larmljud",
    soundsDesc: "Välj ett ljud och lyssna på förhandsvisningen.",
    preview: "Lyssna",
    laps: "Varv",
    soundCount: "20 ljud",
    dismissAlarm: "Stäng",
    alarmPlaying: "Alarmet ljuder",
    focusFinished: "Fokussessionen är klar",
    breakFinished: "Pausen är klar",
    workStatus: "Fokusperiod",
    breakStatus: "Pausperiod"
  },

  id: {
    subtitle: "Timer sederhana untuk fokus dan penggunaan harian",
    timer: "Timer",
    pomodoro: "Pomodoro",
    stopwatch: "Stopwatch",
    sounds: "Suara",
    start: "Mulai",
    pause: "Jeda",
    reset: "Atur Ulang",
    lap: "Putaran",
    soundOn: "Suara aktif",
    vibrationOn: "Getaran aktif",
    ready: "Siap",
    paused: "Dijeda",
    running: "Timer sedang berjalan",
    stopwatchRunning: "Stopwatch sedang berjalan",
    reseted: "Diatur ulang",
    invalid: "Masukkan waktu yang valid.",
    done: "Waktu habis!",
    hours: "Jam",
    minutes: "Menit",
    seconds: "Detik",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Pilih preset fokus dan muat ke timer.",
    work: "Kerja",
    break: "Istirahat",
    applyPomodoro: "Terapkan Pomodoro",
    pomodoroApplied: "Pomodoro dimuat ke timer",
    soundsTitle: "Suara alarm",
    soundsDesc: "Pilih suara dan dengarkan pratinjau.",
    preview: "Dengarkan",
    laps: "Putaran",
    soundCount: "20 suara",
    dismissAlarm: "Tutup",
    alarmPlaying: "Alarm sedang berbunyi",
    focusFinished: "Sesi fokus selesai",
    breakFinished: "Istirahat selesai",
    workStatus: "Periode fokus",
    breakStatus: "Periode istirahat"
  },

  ms: {
    subtitle: "Pemasa ringkas untuk fokus dan kegunaan harian",
    timer: "Pemasa",
    pomodoro: "Pomodoro",
    stopwatch: "Jam randik",
    sounds: "Bunyi",
    start: "Mula",
    pause: "Jeda",
    reset: "Set semula",
    lap: "Pusingan",
    soundOn: "Bunyi hidup",
    vibrationOn: "Getaran hidup",
    ready: "Sedia",
    paused: "Dijeda",
    running: "Pemasa sedang berjalan",
    stopwatchRunning: "Jam randik sedang berjalan",
    reseted: "Telah diset semula",
    invalid: "Sila masukkan masa yang sah.",
    done: "Masa tamat!",
    hours: "Jam",
    minutes: "Minit",
    seconds: "Saat",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Pilih pratetap fokus dan muatkannya ke dalam pemasa.",
    work: "Kerja",
    break: "Rehat",
    applyPomodoro: "Gunakan Pomodoro",
    pomodoroApplied: "Pomodoro dimuatkan ke dalam pemasa",
    soundsTitle: "Bunyi penggera",
    soundsDesc: "Pilih bunyi dan dengar pratonton.",
    preview: "Dengar",
    laps: "Pusingan",
    soundCount: "20 bunyi",
    dismissAlarm: "Tutup",
    alarmPlaying: "Penggera sedang berbunyi",
    focusFinished: "Sesi fokus tamat",
    breakFinished: "Rehat tamat",
    workStatus: "Tempoh fokus",
    breakStatus: "Tempoh rehat"
  },

  vi: {
    subtitle: "Bộ đếm giờ đơn giản cho tập trung và sử dụng hằng ngày",
    timer: "Bộ đếm giờ",
    pomodoro: "Pomodoro",
    stopwatch: "Đồng hồ bấm giờ",
    sounds: "Âm thanh",
    start: "Bắt đầu",
    pause: "Tạm dừng",
    reset: "Đặt lại",
    lap: "Vòng",
    soundOn: "Bật âm thanh",
    vibrationOn: "Bật rung",
    ready: "Sẵn sàng",
    paused: "Đã tạm dừng",
    running: "Bộ đếm đang chạy",
    stopwatchRunning: "Đồng hồ bấm giờ đang chạy",
    reseted: "Đã đặt lại",
    invalid: "Vui lòng nhập thời gian hợp lệ.",
    done: "Hết giờ!",
    hours: "Giờ",
    minutes: "Phút",
    seconds: "Giây",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Chọn một thiết lập tập trung và nạp vào bộ đếm giờ.",
    work: "Làm việc",
    break: "Nghỉ",
    applyPomodoro: "Áp dụng Pomodoro",
    pomodoroApplied: "Pomodoro đã được nạp vào bộ đếm giờ",
    soundsTitle: "Âm thanh báo thức",
    soundsDesc: "Chọn âm thanh và nghe thử.",
    preview: "Nghe thử",
    laps: "Vòng",
    soundCount: "20 âm thanh",
    dismissAlarm: "Đóng",
    alarmPlaying: "Báo thức đang kêu",
    focusFinished: "Phiên tập trung đã kết thúc",
    breakFinished: "Thời gian nghỉ đã kết thúc",
    workStatus: "Thời gian tập trung",
    breakStatus: "Thời gian nghỉ"
  },

  el: {
    subtitle: "Απλός χρονοδιακόπτης για συγκέντρωση και καθημερινή χρήση",
    timer: "Χρονοδιακόπτης",
    pomodoro: "Pomodoro",
    stopwatch: "Χρονόμετρο",
    sounds: "Ήχοι",
    start: "Έναρξη",
    pause: "Παύση",
    reset: "Επαναφορά",
    lap: "Γύρος",
    soundOn: "Ήχος ενεργός",
    vibrationOn: "Δόνηση ενεργή",
    ready: "Έτοιμο",
    paused: "Σε παύση",
    running: "Ο χρονοδιακόπτης λειτουργεί",
    stopwatchRunning: "Το χρονόμετρο λειτουργεί",
    reseted: "Επαναφέρθηκε",
    invalid: "Εισάγετε έγκυρο χρόνο.",
    done: "Ο χρόνος τελείωσε!",
    hours: "Ώρες",
    minutes: "Λεπτά",
    seconds: "Δευτερόλεπτα",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Επιλέξτε μια προρύθμιση συγκέντρωσης και φορτώστε την στον χρονοδιακόπτη.",
    work: "Εργασία",
    break: "Διάλειμμα",
    applyPomodoro: "Εφαρμογή Pomodoro",
    pomodoroApplied: "Το Pomodoro φορτώθηκε στον χρονοδιακόπτη",
    soundsTitle: "Ήχοι ειδοποίησης",
    soundsDesc: "Επιλέξτε έναν ήχο και ακούστε προεπισκόπηση.",
    preview: "Ακρόαση",
    laps: "Γύροι",
    soundCount: "20 ήχοι",
    dismissAlarm: "Κλείσιμο",
    alarmPlaying: "Η ειδοποίηση χτυπά",
    focusFinished: "Η συνεδρία συγκέντρωσης ολοκληρώθηκε",
    breakFinished: "Το διάλειμμα ολοκληρώθηκε",
    workStatus: "Περίοδος συγκέντρωσης",
    breakStatus: "Περίοδος διαλείμματος"
  },

  cs: {
    subtitle: "Jednoduchý časovač pro soustředění a každodenní použití",
    timer: "Časovač",
    pomodoro: "Pomodoro",
    stopwatch: "Stopky",
    sounds: "Zvuky",
    start: "Spustit",
    pause: "Pauza",
    reset: "Resetovat",
    lap: "Kolo",
    soundOn: "Zvuk zapnutý",
    vibrationOn: "Vibrace zapnuté",
    ready: "Připraveno",
    paused: "Pozastaveno",
    running: "Časovač běží",
    stopwatchRunning: "Stopky běží",
    reseted: "Resetováno",
    invalid: "Zadejte platný čas.",
    done: "Čas vypršel!",
    hours: "Hodiny",
    minutes: "Minuty",
    seconds: "Sekundy",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Vyberte předvolbu soustředění a načtěte ji do časovače.",
    work: "Práce",
    break: "Přestávka",
    applyPomodoro: "Použít Pomodoro",
    pomodoroApplied: "Pomodoro načteno do časovače",
    soundsTitle: "Zvuky alarmu",
    soundsDesc: "Vyberte zvuk a přehrajte náhled.",
    preview: "Přehrát",
    laps: "Kola",
    soundCount: "20 zvuků",
    dismissAlarm: "Zavřít",
    alarmPlaying: "Alarm zvoní",
    focusFinished: "Soustředěná relace skončila",
    breakFinished: "Přestávka skončila",
    workStatus: "Doba soustředění",
    breakStatus: "Doba přestávky"
  },

  ro: {
    subtitle: "Cronometru simplu pentru concentrare și utilizare zilnică",
    timer: "Cronometru",
    pomodoro: "Pomodoro",
    stopwatch: "Cronometru precis",
    sounds: "Sunete",
    start: "Pornește",
    pause: "Pauză",
    reset: "Resetează",
    lap: "Tur",
    soundOn: "Sunet activ",
    vibrationOn: "Vibrație activă",
    ready: "Pregătit",
    paused: "Pauză",
    running: "Cronometrul rulează",
    stopwatchRunning: "Cronometrul precis rulează",
    reseted: "Resetat",
    invalid: "Introduceți un timp valid.",
    done: "Timpul a expirat!",
    hours: "Ore",
    minutes: "Minute",
    seconds: "Secunde",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Alegeți un preset de concentrare și încărcați-l în cronometru.",
    work: "Lucru",
    break: "Pauză",
    applyPomodoro: "Aplică Pomodoro",
    pomodoroApplied: "Pomodoro încărcat în cronometru",
    soundsTitle: "Sunete alarmă",
    soundsDesc: "Alegeți un sunet și ascultați previzualizarea.",
    preview: "Ascultă",
    laps: "Ture",
    soundCount: "20 sunete",
    dismissAlarm: "Închide",
    alarmPlaying: "Alarma sună",
    focusFinished: "Sesiunea de concentrare s-a încheiat",
    breakFinished: "Pauza s-a încheiat",
    workStatus: "Perioadă de concentrare",
    breakStatus: "Perioadă de pauză"
  },

  hu: {
    subtitle: "Egyszerű időzítő fókuszhoz és napi használatra",
    timer: "Időzítő",
    pomodoro: "Pomodoro",
    stopwatch: "Stopper",
    sounds: "Hangok",
    start: "Indítás",
    pause: "Szünet",
    reset: "Visszaállítás",
    lap: "Kör",
    soundOn: "Hang bekapcsolva",
    vibrationOn: "Rezgés bekapcsolva",
    ready: "Kész",
    paused: "Szüneteltetve",
    running: "Az időzítő fut",
    stopwatchRunning: "A stopper fut",
    reseted: "Visszaállítva",
    invalid: "Adj meg érvényes időt.",
    done: "Lejárt az idő!",
    hours: "Óra",
    minutes: "Perc",
    seconds: "Másodperc",
    pomodoroTitle: "Pomodoro",
    pomodoroDesc: "Válassz fókuszbeállítást, és töltsd be az időzítőbe.",
    work: "Munka",
    break: "Szünet",
    applyPomodoro: "Pomodoro alkalmazása",
    pomodoroApplied: "A Pomodoro betöltve az időzítőbe",
    soundsTitle: "Riasztási hangok",
    soundsDesc: "Válassz hangot, és hallgasd meg az előnézetet.",
    preview: "Lejátszás",
    laps: "Körök",
    soundCount: "20 hang",
    dismissAlarm: "Bezárás",
    alarmPlaying: "A riasztás szól",
    focusFinished: "A fókusz munkamenet befejeződött",
    breakFinished: "A szünet befejeződött",
    workStatus: "Fókusz időszak",
    breakStatus: "Szünet időszak"
  }
});
const fallbackCodes = [
  "fr","es","ar","it","pt","ja","ko","hi","fa","uk","pl","nl","sv","id","ms","vi","el","cs",
  "ro","hu","bg","sr","hr","sk","sl","da","fi","no","lt","lv","et","he","th","bn","ur","ta","te",
  "ml","mr","gu","pa","sw","am","az","kk"
];
for (const code of fallbackCodes) {
  translations[code] = { ...translations.en };
}

const sounds = [
  { id: "s1", name: "Classic Bell", type: "square", seq: [880, 660, 880] },
  { id: "s2", name: "Digital Beep", type: "square", seq: [900, 900, 800, 900] },
  { id: "s3", name: "Soft Tone", type: "sine", seq: [440, 554, 659] },
  { id: "s4", name: "Urgent Alarm", type: "square", seq: [1000, 850, 1000, 850] },
  { id: "s5", name: "Zen Chime", type: "sine", seq: [523, 659, 784] },
  { id: "s6", name: "Retro Clock", type: "triangle", seq: [660, 550, 440] },
  { id: "s7", name: "Crystal Pulse", type: "triangle", seq: [720, 840, 980] },
  { id: "s8", name: "Morning Ping", type: "sine", seq: [610, 760, 910] },
  { id: "s9", name: "Sharp Signal", type: "square", seq: [1100, 980, 1100] },
  { id: "s10", name: "Focus Bell", type: "triangle", seq: [700, 820, 700] },
  { id: "s11", name: "Forest Birds", type: "sine", seq: [1200, 1400, 1100, 1500] },
  { id: "s12", name: "Rain Drift", type: "triangle", seq: [420, 390, 430, 380] },
  { id: "s13", name: "Ocean Drop", type: "sine", seq: [310, 470, 350] },
  { id: "s14", name: "Wind Whisper", type: "triangle", seq: [500, 620, 540, 680] },
  { id: "s15", name: "Stream Echo", type: "sine", seq: [460, 520, 610, 530] },
  { id: "s16", name: "Night Crickets", type: "square", seq: [1800, 1600, 1750, 1550] },
  { id: "s17", name: "Temple Bowl", type: "sine", seq: [330, 440, 550] },
  { id: "s18", name: "Glass Ripple", type: "triangle", seq: [760, 920, 860] },
  { id: "s19", name: "Sunrise Bloom", type: "sine", seq: [500, 620, 780] },
  { id: "s20", name: "Silver Pulse", type: "square", seq: [950, 700, 950] }
];

const soundNameTranslations = {
  tr: {
    "Classic Bell": "Klasik Zil",
    "Digital Beep": "Dijital Bip",
    "Soft Tone": "Yumuşak Ton",
    "Urgent Alarm": "Acil Alarm",
    "Zen Chime": "Zen Çanı",
    "Retro Clock": "Retro Saat",
    "Crystal Pulse": "Kristal Darbe",
    "Morning Ping": "Sabah Sinyali",
    "Sharp Signal": "Keskin Sinyal",
    "Focus Bell": "Odak Zili",
    "Forest Birds": "Orman Kuşları",
    "Rain Drift": "Yağmur Esintisi",
    "Ocean Drop": "Okyanus Damlası",
    "Wind Whisper": "Rüzgar Fısıltısı",
    "Stream Echo": "Dere Yankısı",
    "Night Crickets": "Gece Cırcırları",
    "Temple Bowl": "Tapınak Kasesi",
    "Glass Ripple": "Cam Dalgası",
    "Sunrise Bloom": "Gün Doğumu",
    "Silver Pulse": "Gümüş Darbe"
  },
  en: {},
  de: {
    "Classic Bell": "Klassische Glocke",
    "Digital Beep": "Digitaler Piepton",
    "Soft Tone": "Sanfter Ton",
    "Urgent Alarm": "Dringender Alarm",
    "Zen Chime": "Zen-Klang",
    "Retro Clock": "Retro-Uhr",
    "Crystal Pulse": "Kristallimpuls",
    "Morning Ping": "Morgensignal",
    "Sharp Signal": "Scharfes Signal",
    "Focus Bell": "Fokus-Glocke",
    "Forest Birds": "Waldvögel",
    "Rain Drift": "Regenklang",
    "Ocean Drop": "Ozeantropfen",
    "Wind Whisper": "Windflüstern",
    "Stream Echo": "Bach-Echo",
    "Night Crickets": "Nachtgrillen",
    "Temple Bowl": "Tempelschale",
    "Glass Ripple": "Glaswelle",
    "Sunrise Bloom": "Sonnenaufgang",
    "Silver Pulse": "Silberimpuls"
  },
  ru: {
    "Classic Bell": "Классический звонок",
    "Digital Beep": "Цифровой сигнал",
    "Soft Tone": "Мягкий тон",
    "Urgent Alarm": "Срочная тревога",
    "Zen Chime": "Дзен-колокол",
    "Retro Clock": "Ретро-часы",
    "Crystal Pulse": "Кристальный импульс",
    "Morning Ping": "Утренний сигнал",
    "Sharp Signal": "Резкий сигнал",
    "Focus Bell": "Колокол фокуса",
    "Forest Birds": "Лесные птицы",
    "Rain Drift": "Шёпот дождя",
    "Ocean Drop": "Капля океана",
    "Wind Whisper": "Шёпот ветра",
    "Stream Echo": "Эхо ручья",
    "Night Crickets": "Ночные сверчки",
    "Temple Bowl": "Храмовая чаша",
    "Glass Ripple": "Стеклянная волна",
    "Sunrise Bloom": "Рассвет",
    "Silver Pulse": "Серебряный импульс"
  },
  zh: {
    "Classic Bell": "经典铃声",
    "Digital Beep": "数字蜂鸣",
    "Soft Tone": "柔和音",
    "Urgent Alarm": "紧急警报",
    "Zen Chime": "禅意钟声",
    "Retro Clock": "复古时钟",
    "Crystal Pulse": "水晶脉冲",
    "Morning Ping": "晨间提示",
    "Sharp Signal": "尖锐信号",
    "Focus Bell": "专注铃声",
    "Forest Birds": "森林鸟鸣",
    "Rain Drift": "细雨声",
    "Ocean Drop": "海洋水滴",
    "Wind Whisper": "风声低语",
    "Stream Echo": "溪流回响",
    "Night Crickets": "夜晚蟋蟀",
    "Temple Bowl": "寺庙钵音",
    "Glass Ripple": "玻璃涟漪",
    "Sunrise Bloom": "日出之声",
    "Silver Pulse": "银色脉冲"
  }
};

let selectedSoundId = sounds[0].id;

const languageSelect = $("language");
const themeToggle = $("themeToggle");
const timerDisplay = $("timerDisplay");
const timerRing = $("timerRing");
const timerStatus = $("timerStatus");
const pomodoroStatus = $("pomodoroStatus");
const stopwatchDisplay = $("stopwatchDisplay");
const stopwatchStatus = $("stopwatchStatus");
const soundList = $("soundList");
const toastEl = $("toast");
const alarmOverlay = $("alarmOverlay");
const alarmTitle = $("alarmTitle");
const alarmMessage = $("alarmMessage");
const dismissAlarmBtn = $("dismissAlarmBtn");
const lapsList = $("lapsList");

function t(key) {
  const lang = languageSelect?.value || "en";
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

function soundLabel(name) {
  const lang = languageSelect?.value || "en";
  const dict = soundNameTranslations[lang] || {};
  return dict[name] || name;
}

function showToast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(showToast._id);
  showToast._id = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function formatTimer(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatStopwatch(ms) {
  const tenths = Math.floor(ms / 100);
  const h = Math.floor(tenths / 36000);
  const m = Math.floor((tenths % 36000) / 600);
  const s = Math.floor((tenths % 600) / 10);
  const d = tenths % 10;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
}

function timerInputSeconds() {
  return (
    (parseInt($("hours")?.value || "0", 10) || 0) * 3600 +
    (parseInt($("minutes")?.value || "0", 10) || 0) * 60 +
    (parseInt($("seconds")?.value || "0", 10) || 0)
  );
}

function updateTimerRing() {
  if (!timerRing) return;
  if (timerState.totalTime <= 0) {
    timerRing.style.background = "conic-gradient(var(--primary) 0deg, var(--secondary) 180deg, var(--ring-rest) 180deg)";
    return;
  }
  const deg = Math.max(0, Math.min(360, (timerState.timeLeft / timerState.totalTime) * 360));
  timerRing.style.background = `conic-gradient(var(--primary) 0deg, var(--secondary) ${deg}deg, var(--ring-rest) ${deg}deg)`;
}

function updateTimerDisplay() {
  if (timerDisplay) timerDisplay.textContent = formatTimer(timerState.timeLeft);
  updateTimerRing();
}

function stopTimerInternal() {
  if (timerState.timerId) clearInterval(timerState.timerId);
  timerState.timerId = null;
  timerState.running = false;
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!alarmState.audioContext) alarmState.audioContext = new AudioContextClass();
  return alarmState.audioContext;
}

function playSoundOnce(sound) {
  if (!$("soundToggle")?.checked) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const startBase = ctx.currentTime + 0.01;
  sound.seq.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = startBase + i * 0.18;
    const end = start + 0.14;

    osc.type = sound.type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.01);
  });
}

function selectedSound() {
  return sounds.find(s => s.id === selectedSoundId) || sounds[0];
}

function stopAlarm() {
  if (alarmState.intervalId) clearInterval(alarmState.intervalId);
  alarmState.intervalId = null;
  alarmState.active = false;
  if (alarmOverlay) alarmOverlay.classList.add("hidden");
  if ("vibrate" in navigator) navigator.vibrate(0);
}

function startAlarm(title, message, onDismiss) {
  stopAlarm();
  alarmState.active = true;
  alarmState.pendingAction = onDismiss || null;

  if (alarmTitle) alarmTitle.textContent = title;
  if (alarmMessage) alarmMessage.textContent = message;
  if (dismissAlarmBtn) dismissAlarmBtn.textContent = t("dismissAlarm");
  if (alarmOverlay) alarmOverlay.classList.remove("hidden");

  const s = selectedSound();
  playSoundOnce(s);

  if ($("vibrationToggle")?.checked && "vibrate" in navigator) {
    navigator.vibrate([300, 150, 300, 150, 500]);
  }

  alarmState.intervalId = setInterval(() => {
    playSoundOnce(s);
    if ($("vibrationToggle")?.checked && "vibrate" in navigator) {
      navigator.vibrate([220, 120, 220, 120, 350]);
    }
  }, 1800);
}

function dismissAlarm() {
  const fn = alarmState.pendingAction;
  alarmState.pendingAction = null;
  stopAlarm();
  if (typeof fn === "function") fn();
}

function startTimerLoop() {
  stopTimerInternal();
  timerState.running = true;
  if (timerStatus) timerStatus.textContent = t("running");

  timerState.timerId = setInterval(() => {
    if (timerState.timeLeft > 0) {
      timerState.timeLeft -= 1;
      updateTimerDisplay();
      return;
    }

    stopTimerInternal();

    if (pomodoroState.enabled) {
      const wasWork = pomodoroState.phase === "work";
      startAlarm(
        wasWork ? t("focusFinished") : t("breakFinished"),
        t("alarmPlaying"),
        () => {
          if (wasWork) {
            pomodoroState.phase = "break";
            timerState.timeLeft = pomodoroState.breakMinutes * 60;
            timerState.totalTime = timerState.timeLeft;
            if (pomodoroStatus) {
              pomodoroStatus.textContent = `${t("breakStatus")} • ${pomodoroState.breakMinutes}m`;
            }
          } else {
            pomodoroState.phase = "work";
            timerState.timeLeft = pomodoroState.workMinutes * 60;
            timerState.totalTime = timerState.timeLeft;
            if (pomodoroStatus) {
              pomodoroStatus.textContent = `${t("workStatus")} • ${pomodoroState.workMinutes}m`;
            }
          }
          updateTimerDisplay();
          startTimerLoop();
        }
      );
      return;
    }

    if (timerStatus) timerStatus.textContent = t("done");
    startAlarm(t("done"), t("alarmPlaying"));
  }, 1000);
}

function startTimer() {
  if (timerState.running) return;

  if (timerState.timeLeft <= 0) {
    const total = timerInputSeconds();
    if (total <= 0) {
      showToast(t("invalid"));
      return;
    }
    pomodoroState.enabled = false;
    timerState.timeLeft = total;
    timerState.totalTime = total;
    updateTimerDisplay();
  }

  startTimerLoop();
}

function pauseTimer() {
  stopTimerInternal();
  if (timerStatus) timerStatus.textContent = t("paused");
}

function resetTimer() {
  stopTimerInternal();
  stopAlarm();
  pomodoroState.enabled = false;
  pomodoroState.phase = "work";
  timerState.timeLeft = 0;
  timerState.totalTime = 0;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = 0;
  if ($("seconds")) $("seconds").value = 0;

  updateTimerDisplay();

  if (timerStatus) timerStatus.textContent = t("ready");
  if (pomodoroStatus) pomodoroStatus.textContent = t("ready");
}

function applyPomodoro() {
  const work = parseInt($("pomodoroWork")?.value || "0", 10) || 0;
  const brk = parseInt($("pomodoroBreak")?.value || "0", 10) || 0;

  if (work <= 0 || brk <= 0) {
    showToast(t("invalid"));
    return;
  }

  stopTimerInternal();
  stopAlarm();

  pomodoroState.enabled = true;
  pomodoroState.phase = "work";
  pomodoroState.workMinutes = work;
  pomodoroState.breakMinutes = brk;

  if ($("hours")) $("hours").value = 0;
  if ($("minutes")) $("minutes").value = work;
  if ($("seconds")) $("seconds").value = 0;

  timerState.timeLeft = work * 60;
  timerState.totalTime = timerState.timeLeft;
  updateTimerDisplay();

  if (timerStatus) timerStatus.textContent = t("pomodoroApplied");
  if (pomodoroStatus) pomodoroStatus.textContent = `${t("workStatus")} • ${work}m`;

  showToast(t("pomodoroApplied"));
  switchTab("timerPanel");
}

function updateStopwatchDisplay() {
  if (!stopwatchDisplay) return;
  const current = stopwatchState.running
    ? stopwatchState.elapsedMs + (Date.now() - stopwatchState.lastStart)
    : stopwatchState.elapsedMs;
  stopwatchDisplay.textContent = formatStopwatch(current);
}

function toggleStopwatch() {
  if (!stopwatchState.running) {
    stopwatchState.running = true;
    stopwatchState.lastStart = Date.now();
    stopwatchState.intervalId = setInterval(updateStopwatchDisplay, 100);
    if (stopwatchStatus) stopwatchStatus.textContent = t("stopwatchRunning");
  } else {
    stopwatchState.elapsedMs += Date.now() - stopwatchState.lastStart;
    stopwatchState.running = false;
    clearInterval(stopwatchState.intervalId);
    stopwatchState.intervalId = null;
    if (stopwatchStatus) stopwatchStatus.textContent = t("paused");
  }

  if ($("swStartBtn")) {
    $("swStartBtn").textContent = stopwatchState.running ? t("pause") : t("start");
  }
}

function resetStopwatch() {
  if (stopwatchState.intervalId) clearInterval(stopwatchState.intervalId);
  stopwatchState.intervalId = null;
  stopwatchState.running = false;
  stopwatchState.elapsedMs = 0;
  stopwatchState.lastStart = 0;
  stopwatchState.laps = [];

  if (stopwatchDisplay) stopwatchDisplay.textContent = "00:00:00.0";
  if (stopwatchStatus) stopwatchStatus.textContent = t("ready");
  if ($("swStartBtn")) $("swStartBtn").textContent = t("start");

  renderLaps();
}

function addLap() {
  if (!stopwatchDisplay) return;
  stopwatchState.laps.unshift(stopwatchDisplay.textContent);
  renderLaps();
}

function renderLaps() {
  if (!lapsList) return;
  lapsList.innerHTML = "";
  stopwatchState.laps.forEach((lap, i) => {
    const row = document.createElement("div");
    row.className = "lap-row";
    row.innerHTML = `<span>#${stopwatchState.laps.length - i}</span><span>${lap}</span>`;
    lapsList.appendChild(row);
  });
}

function renderSounds() {
  if (!soundList) return;
  soundList.innerHTML = "";

  sounds.forEach((sound, index) => {
    const item = document.createElement("label");
    item.className = "sound-item";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "alarmSound";
    radio.value = sound.id;
    radio.checked = sound.id === selectedSoundId;
    radio.addEventListener("change", () => {
      selectedSoundId = sound.id;
    });

    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${soundLabel(sound.name)}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-btn";
    btn.textContent = "▶";
    btn.addEventListener("click", () => {
      selectedSoundId = sound.id;
      radio.checked = true;
      playSoundOnce(sound);
    });

    item.appendChild(radio);
    item.appendChild(name);
    item.appendChild(btn);
    soundList.appendChild(item);
  });
}

function applyLanguage() {
  const lang = languageSelect?.value || "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = ["ar", "fa", "ur", "he"].includes(lang) ? "rtl" : "ltr";

  const map = {
    subtitle: "subtitle",
    tabTimer: "timer",
    tabPomodoro: "pomodoro",
    tabStopwatch: "stopwatch",
    tabSounds: "sounds",
    hoursLabel: "hours",
    minutesLabel: "minutes",
    secondsLabel: "seconds",
    timerStartBtn: "start",
    timerPauseBtn: "pause",
    timerResetBtn: "reset",
    soundLabel: "soundOn",
    vibrationLabel: "vibrationOn",
    pomodoroTitle: "pomodoroTitle",
    pomodoroDesc: "pomodoroDesc",
    workLabel: "work",
    breakLabel: "break",
    applyPomodoroBtn: "applyPomodoro",
    swLapBtn: "lap",
    swResetBtn: "reset",
    soundsTitle: "soundsTitle",
    soundsDesc: "soundsDesc",
    previewSoundBtn: "preview",
    lapsTitle: "laps",
    soundCountLabel: "soundCount",
    dismissAlarmBtn: "dismissAlarm"
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = $(id);
    if (el) el.textContent = t(key);
  });

  if ($("swStartBtn")) {
    $("swStartBtn").textContent = stopwatchState.running ? t("pause") : t("start");
  }

  renderSounds();

  if (!timerState.running && timerState.timeLeft === 0 && timerStatus) {
    timerStatus.textContent = t("ready");
  }
  if (!stopwatchState.running && stopwatchState.elapsedMs === 0 && stopwatchStatus) {
    stopwatchStatus.textContent = t("ready");
  }
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function loadTheme() {
  const saved = localStorage.getItem("timerTrinkTheme");
  if (saved === "light") {
    document.body.classList.add("light");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  if (themeToggle) themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("timerTrinkTheme", isLight ? "light" : "dark");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    pomodoroState.enabled = false;
    stopTimerInternal();

    if ($("hours")) $("hours").value = btn.dataset.h;
    if ($("minutes")) $("minutes").value = btn.dataset.m;
    if ($("seconds")) $("seconds").value = btn.dataset.s;

    timerState.timeLeft = timerInputSeconds();
    timerState.totalTime = timerState.timeLeft;
    updateTimerDisplay();

    if (timerStatus) timerStatus.textContent = t("ready");
  });
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if ($("pomodoroWork")) $("pomodoroWork").value = btn.dataset.work;
    if ($("pomodoroBreak")) $("pomodoroBreak").value = btn.dataset.break;
  });
});

$("timerStartBtn")?.addEventListener("click", startTimer);
$("timerPauseBtn")?.addEventListener("click", pauseTimer);
$("timerResetBtn")?.addEventListener("click", resetTimer);
$("applyPomodoroBtn")?.addEventListener("click", applyPomodoro);
$("swStartBtn")?.addEventListener("click", toggleStopwatch);
$("swLapBtn")?.addEventListener("click", addLap);
$("swResetBtn")?.addEventListener("click", resetStopwatch);
$("previewSoundBtn")?.addEventListener("click", () => playSoundOnce(selectedSound()));
dismissAlarmBtn?.addEventListener("click", dismissAlarm);
themeToggle?.addEventListener("click", toggleTheme);
languageSelect?.addEventListener("change", applyLanguage);

loadTheme();
renderSounds();
applyLanguage();
updateTimerDisplay();

if (stopwatchDisplay) stopwatchDisplay.textContent = "00:00:00.0";
if (timerStatus) timerStatus.textContent = t("ready");
if (pomodoroStatus) pomodoroStatus.textContent = t("ready");
if (stopwatchStatus) stopwatchStatus.textContent = t("ready");
