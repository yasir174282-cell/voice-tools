// === Config & Elements ===
const INITIAL_PASSWORD = "y@sir1w66"; // not shown on UI
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

const menuBtn = document.getElementById("menu-btn");
const menuPanel = document.getElementById("menu-panel");

const sheetChange = document.getElementById("sheet-change-pass");
const sheetLyrics = document.getElementById("sheet-lyrics");
const sheetEmail = document.getElementById("sheet-email");

const currentPassInput = document.getElementById("current-password");
const newPassInput = document.getElementById("new-password");
const changePassBtn = document.getElementById("change-password-btn");
const passwordChangeMsg = document.getElementById("password-change-msg");

const textInput = document.getElementById("text-input");
const langSelect = document.getElementById("lang-select");
const voiceStyle = document.getElementById("voice-style");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const audioPlayer = document.getElementById("audio-player");

const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const exportHistoryBtn = document.getElementById("export-history");

const emailPassBtn = document.getElementById("email-pass-btn");
const emailHistoryBtn = document.getElementById("email-history-btn");
const mailtoPass = document.getElementById("mailto-pass");
const mailtoHistory = document.getElementById("mailto-history");

const emailToInput = document.getElementById("email-to");
const emailServiceInput = document.getElementById("emailjs-service");
const emailTemplateInput = document.getElementById("emailjs-template");
const emailKeyInput = document.getElementById("emailjs-key");

const autoTimingChk = document.getElementById("auto-timing");
const autoTuneChk = document.getElementById("auto-tune");
const tuneKeySel = document.getElementById("tune-key");
const tuneScaleSel = document.getElementById("tune-scale");

let currentPassword = localStorage.getItem("tts_password") || INITIAL_PASSWORD;

// === Menu handlers ===
menuBtn.addEventListener("click", () => {
  menuPanel.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
  if (!menuPanel.contains(e.target) && e.target !== menuBtn) {
    menuPanel.classList.add("hidden");
  }
});

document.getElementById("menu-change-pass").addEventListener("click", () => {
  openSheet(sheetChange);
});
document.getElementById("menu-lyrics-history").addEventListener("click", () => {
  openSheet(sheetLyrics);
  renderHistory();
});
document.getElementById("menu-export-history").addEventListener("click", () => {
  exportHistory();
});
document.getElementById("menu-email-backup").addEventListener("click", () => {
  openSheet(sheetEmail);
});
document.getElementById("menu-logout").addEventListener("click", () => {
  showLogin();
});

// Close any sheet
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const id = e.currentTarget.getAttribute("data-close");
    document.getElementById(id)?.classList.add("hidden");
  });
});
function openSheet(el){ el.classList.remove("hidden"); }

// === Auth ===
function showLogin() {
  loginScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
  passwordInput.value = "";
  loginError.textContent = "";
}
function showApp() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  renderHistory();
  initEmailJS();
  buildLanguages();
}
function checkPassword(pass) { return pass === currentPassword; }

loginBtn.addEventListener("click", () => {
  if (checkPassword(passwordInput.value.trim())) {
    showApp();
  } else {
    loginError.textContent = "غلط پاس ورڈ!";
  }
});

changePassBtn.addEventListener("click", () => {
  const curr = currentPassInput.value.trim();
  const next = newPassInput.value.trim();
  passwordChangeMsg.textContent = "";
  if (curr !== currentPassword) { passwordChangeMsg.textContent = "موجودہ پاس ورڈ درست نہیں"; return; }
  if (next.length < 4) { passwordChangeMsg.textContent = "نیا پاس ورڈ کم از کم 4 حرف کا ہونا چاہیے"; return; }
  currentPassword = next;
  localStorage.setItem("tts_password", next);
  passwordChangeMsg.textContent = "پاس ورڈ تبدیل ہوگیا ✅";
  currentPassInput.value = ""; newPassInput.value = "";
});

// === History ===
function getHistory() { return JSON.parse(localStorage.getItem("tts_history") || "[]"); }
function setHistory(arr) { localStorage.setItem("tts_history", JSON.stringify(arr)); }
function addToHistory(text) {
  let history = getHistory();
  if (!history.includes(text)) {
    history.unshift(text);
    if (history.length > 200) history.pop();
    setHistory(history);
  }
}
function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = "";
  history.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.addEventListener("click", () => (textInput.value = t));
    historyList.appendChild(li);
  });
}
function exportHistory() {
  const blob = new Blob([JSON.stringify(getHistory(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tts_history.json"; a.click();
  URL.revokeObjectURL(url);
}
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("tts_history"); renderHistory();
});

// === Email ===
function initEmailJS() {
  const pubKey = emailKeyInput?.value?.trim();
  if (pubKey && window.emailjs) { try { emailjs.init(pubKey); } catch(e) {} }
}
function sendEmail(subject, message) {
  const to = (emailToInput.value || "").trim();
  if (!to) { alert("ای میل ایڈریس درج کریں"); return; }
  const service = emailServiceInput.value.trim();
  const template = emailTemplateInput.value.trim();
  const pubKey = emailKeyInput.value.trim();
  if (service && template && pubKey && window.emailjs) {
    initEmailJS();
    return emailjs.send(service, template, { to_email: to, subject, message })
      .then(() => alert("ای میل بھیج دی گئی ✅"))
      .catch(() => alert("EmailJS فیل — MailTo استعمال کریں"));
  }
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  window.location.href = mailto;
}
document.getElementById("email-pass-btn").addEventListener("click", () => {
  sendEmail("Voice Studio Password Backup", `Current password: ${currentPassword}`);
});
document.getElementById("email-history-btn").addEventListener("click", () => {
  sendEmail("Voice Studio Lyrics History Backup", JSON.stringify(getHistory(), null, 2));
});
function refreshMailtoLinks() {
  const to = (emailToInput.value || "").trim();
  if (mailtoPass) mailtoPass.href = `mailto:${encodeURIComponent(to)}?subject=Password%20Backup&body=${encodeURIComponent("Password: " + currentPassword)}`;
  if (mailtoHistory) mailtoHistory.href = `mailto:${encodeURIComponent(to)}?subject=Lyrics%20History&body=${encodeURIComponent(JSON.stringify(getHistory(), null, 2))}`;
}
emailToInput?.addEventListener("input", refreshMailtoLinks);
refreshMailtoLinks();

// === Languages (broad set for Google Translate TTS) ===
const LANGS = {
  "af":"Afrikaans","ar":"Arabic","bn":"Bengali","bg":"Bulgarian","ca":"Catalan","cs":"Czech","da":"Danish",
  "de":"German","el":"Greek","en":"English","en-GB":"English (UK)","en-US":"English (US)","es":"Spanish",
  "es-419":"Spanish (LatAm)","et":"Estonian","fa":"Persian","fi":"Finnish","fil":"Filipino","fr":"French",
  "fr-CA":"French (Canada)","gu":"Gujarati","he":"Hebrew","hi":"Hindi","hr":"Croatian","hu":"Hungarian",
  "id":"Indonesian","it":"Italian","ja":"Japanese","jv":"Javanese","kn":"Kannada","ko":"Korean","lt":"Lithuanian",
  "lv":"Latvian","ml":"Malayalam","mr":"Marathi","ms":"Malay","my":"Myanmar","ne":"Nepali","nl":"Dutch",
  "no":"Norwegian","pa":"Punjabi","pl":"Polish","pt":"Portuguese","pt-BR":"Portuguese (BR)","pt-PT":"Portuguese (PT)",
  "ro":"Romanian","ru":"Russian","si":"Sinhala","sk":"Slovak","sl":"Slovenian","so":"Somali","sq":"Albanian",
  "sr":"Serbian","sv":"Swedish","sw":"Swahili","ta":"Tamil","te":"Telugu","th":"Thai","tr":"Turkish",
  "uk":"Ukrainian","ur":"Urdu","uz":"Uzbek","vi":"Vietnamese","zh-CN":"Chinese (Simplified)","zh-TW":"Chinese (Traditional)"
};
function buildLanguages() {
  langSelect.innerHTML = "";
  Object.entries(LANGS).forEach(([code, name]) => {
    const opt = document.createElement("option");
    opt.value = code; opt.textContent = `${name} (${code})`;
    langSelect.appendChild(opt);
  });
  langSelect.value = "ur";
}

// === TTS via Google Translate (unofficial) ===
function translateTTSUrl(text, lang) {
  const base = "https://translate.google.com/translate_tts";
  const params = new URLSearchParams({ ie:"UTF-8", q:text, tl:lang || "ur", client:"tw-ob" });
  return `${base}?${params.toString()}`;
}

// === WebAudio & Effects ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let srcNode=null, gainNode=null, delayNode=null, analyser=null;

function stopNodes() {
  try { srcNode&&srcNode.disconnect(); gainNode&&gainNode.disconnect(); delayNode&&delayNode.disconnect(); analyser&&analyser.disconnect(); } catch(e){}
  srcNode=gainNode=delayNode=analyser=null;
}

function applyEffects(mediaElement, style) {
  stopNodes();
  const track = audioCtx.createMediaElementSource(mediaElement);
  gainNode = audioCtx.createGain();
  delayNode = audioCtx.createDelay(5.0);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  mediaElement.playbackRate = 1.0;
  delayNode.delayTime.value = 0.0;
  gainNode.gain.value = 1.0;

  switch(style) {
    case "deep": mediaElement.playbackRate = 0.88; break;
    case "female": mediaElement.playbackRate = 1.05; break;
    case "tom": mediaElement.playbackRate = 1.25; break;
    case "chipmunk": mediaElement.playbackRate = 1.35; break;
    case "robot": delayNode.delayTime.value = 0.04; break;
    case "echo": delayNode.delayTime.value = 0.22; break;
    default: mediaElement.playbackRate = 1.0;
  }

  track.connect(analyser);
  analyser.connect(delayNode);
  delayNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
}

// === Auto-Tune (beta): pitch detect + playbackRate correction toward nearest scale ===
function detectPitchHz() {
  if (!analyser) return null;
  const buflen = analyser.fftSize;
  const buf = new Float32Array(buflen);
  analyser.getFloatTimeDomainData(buf);

  // Autocorrelation
  let bestOf = 0, bestIndex = -1;
  for (let lag=32; lag<buflen/2; lag++) {
    let sum=0;
    for (let i=0; i<buflen-lag; i++) sum += buf[i]*buf[i+lag];
    if (sum > bestOf) { bestOf = sum; bestIndex = lag; }
  }
  if (bestIndex === -1) return null;
  const sampleRate = audioCtx.sampleRate || 44100;
  const freq = sampleRate / bestIndex;
  if (!isFinite(freq) || freq<50 || freq>1000) return null;
  return freq;
}

function noteNumberFromHz(hz){ return 69 + 12 * Math.log2(hz/440); } // A4=440
function hzFromNoteNumber(n){ return 440 * Math.pow(2, (n-69)/12); }

const SCALE_STEPS = {
  major: [0,2,4,5,7,9,11],
  minor: [0,2,3,5,7,8,10]
};
const KEY_BASE = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};

function nearestScaleNote(nFloat, key="C", scale="major") {
  const base = KEY_BASE[key] ?? 0;
  const steps = SCALE_STEPS[scale] ?? SCALE_STEPS.major;
  const roundOct = Math.floor(nFloat/12)*12; // octave bucket
  // try nearby semitones in the scale across octaves
  let bestN = nFloat, bestDist = 99;
  for (let oct=-1; oct<=1; oct++) {
    for (const s of steps) {
      const candidate = roundOct + base + s + oct*12;
      const d = Math.abs(candidate - nFloat);
      if (d < bestDist) { bestDist = d; bestN = candidate; }
    }
  }
  return bestN;
}

function maybeAutoTune(mediaEl){
  if (!autoTuneChk.checked) return;
  const hz = detectPitchHz();
  if (!hz) return;
  const n = noteNumberFromHz(hz);
  const target = nearestScaleNote(n, tuneKeySel.value, tuneScaleSel.value);
  const targetHz = hzFromNoteNumber(target);
  const ratio = targetHz / hz;
  // Adjust playbackRate slightly toward target (smooth)
  const curr = mediaEl.playbackRate;
  mediaEl.playbackRate = Math.max(0.8, Math.min(1.4, curr * (0.95 + 0.05*ratio)));
}

// === Karaoke Auto-Timing ===
const karaokeBox = document.getElementById("karaoke-box");
let kLines = [];
function buildKaraoke(text) {
  karaokeBox.innerHTML = "";
  kLines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  kLines.forEach((line, i) => {
    const div = document.createElement("div");
    div.className = "kline"; div.id = "kline-"+i; div.textContent = line;
    karaokeBox.appendChild(div);
  });
}
function estDurForLine(line, rate=1.0){
  // approx: 12 chars/sec baseline, adjust for punctuation and playbackRate
  const base = Math.max(1.0, line.length / 12);
  const punct = /[،،,.!?؟]/g.test(line) ? 0.2 : 0;
  return (base + punct) / rate;
}
function driveKaraoke(mediaEl, rate=1.0){
  if (!autoTimingChk.checked || kLines.length===0) return;
  const lineDurations = kLines.map(l => estDurForLine(l, rate));
  let idx = 0, elapsed = 0;
  const activate = (i) => {
    [...karaokeBox.children].forEach(el => el.classList.remove("active"));
    const el = document.getElementById("kline-"+i);
    if (el) { el.classList.add("active"); el.scrollIntoView({block:"nearest"}); }
  };
  activate(0);
  const iv = setInterval(() => {
    if (mediaEl.paused || mediaEl.ended) return;
    elapsed += 0.2;
    if (elapsed >= lineDurations[idx]) {
      idx++; elapsed = 0;
      if (idx >= kLines.length) { clearInterval(iv); return; }
      activate(idx);
    }
    // optional auto-tune tick
    maybeAutoTune(mediaEl);
  }, 200);
}

// === Generate & Play ===
generateBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  if (!text) { alert("براہ کرم ٹیکسٹ لکھیں"); return; }
  const lang = langSelect.value || "ur";
  const url = translateTTSUrl(text, lang);

  buildKaraoke(text);
  audioPlayer.src = url;
  audioPlayer.classList.remove("hidden");
  applyEffects(audioPlayer, voiceStyle.value);

  try { await audioPlayer.play(); } catch(e) {}
  addToHistory(text);
  driveKaraoke(audioPlayer, audioPlayer.playbackRate);

  downloadBtn.disabled = false;
  downloadBtn.onclick = async () => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const a = document.createElement("a");
      const dlUrl = URL.createObjectURL(blob);
      a.href = dlUrl; a.download = "voice.mp3"; a.click();
      URL.revokeObjectURL(dlUrl);
    } catch(e) {
      window.open(url, "_blank");
    }
  };
});

// Start
showLogin();
