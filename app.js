let timer;
let timeLeft = 0;
let running = false;

const translations = {
  tr: {
    start: "Başlat",
    pause: "Dur",
    reset: "Sıfırla",
    placeholder: "Dakika",
    done: "Süre doldu!"
  },
  en: {
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    placeholder: "Minutes",
    done: "Time is up!"
  }
};

function updateDisplay() {
  let min = Math.floor(timeLeft / 60);
  let sec = timeLeft % 60;
  document.getElementById("display").innerText =
    String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function startTimer() {
  if (running) return;

  if (timeLeft === 0) {
    let minutes = document.getElementById("minutes").value;
    if (!minutes) return alert("Dakika gir");
    timeLeft = minutes * 60;
  }

  running = true;

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timer);
      alert(getText("done"));
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = 0;
  updateDisplay();
}

function getText(key) {
  let lang = document.getElementById("language").value;
  return translations[lang][key];
}

document.getElementById("language").addEventListener("change", () => {
  let lang = document.getElementById("language").value;
  document.querySelectorAll("button")[0].innerText = translations[lang].start;
  document.querySelectorAll("button")[1].innerText = translations[lang].pause;
  document.querySelectorAll("button")[2].innerText = translations[lang].reset;
  document.getElementById("minutes").placeholder = translations[lang].placeholder;
});

updateDisplay();
