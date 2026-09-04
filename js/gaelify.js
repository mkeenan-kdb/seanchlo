/**
 * Seanchló Typer / Gaelify
 * Core script for Irish orthography transformation, Abair.ie speech synthesis,
 * authentic Celtic font switching, and interactive manuscript features.
 */

// Application state
const AppState = {
  currentAudio: null,
  seanfhocalData: null,
  popupTimerInterval: null,
  lastFartIndex: -1,
  lastPooIndex: -1,
  lastPogIndex: -1,
  lastSeanIndex: -1,
  fartSounds: ['flat.mp3', 'flat2.mp3', 'flat3.mp3', 'flat4.mp3']
};

// Standard Lenition Mapping (Ponc Séimhithe)
const standardReplacements = {
  b: "\u1E03", B: "\u1E02",
  c: "\u010B", C: "\u010A",
  d: "\u1E0B", D: "\u1E0A",
  f: "\u1E1F", F: "\u1E1E",
  g: "\u0121", G: "\u0120",
  m: "\u1E41", M: "\u1E40",
  p: "\u1E57", P: "\u1E56",
  s: "\u1E61", S: "\u1E60", // \u1E61 = ṡ (standard modern s with dot)
  t: "\u1E6B", T: "\u1E6A"
};

// Insular Lenition Mapping (uses archaic long-s with dot: ẛ)
const insularReplacements = {
  ...standardReplacements,
  s: "\u1E9B", // ẛ (long-s with dot)
  S: "\u1E60"
};

// Reverse Replacements (Ponc Séimhithe -> standard Roman letters with 'h')
const reverseReplacements = {
  "\u1E03": "bh", "\u1E02": "Bh",
  "\u010B": "ch", "\u010A": "Ch",
  "\u1E0B": "dh", "\u1E0A": "Dh",
  "\u1E1F": "fh", "\u1E1E": "Fh",
  "\u0121": "gh", "\u0120": "Gh",
  "\u1E41": "mh", "\u1E40": "Mh",
  "\u1E57": "ph", "\u1E56": "Ph",
  "\u1E61": "sh", "\u1E9B": "sh", "\u1E60": "Sh",
  "\u1E6B": "th", "\u1E6A": "Th",
  "\u204A": "agus" // Tironian et ⁊
};

// Insular letter forms (Celtic calligraphy characters)
const insularChars = {
  D: "\uA779", d: "\uA77A", // Ꝺ, ꝺ
  F: "\uA77B", f: "\uA77C", // Ꝼ, ꝼ
  G: "\uA77D", g: "\u1D79", // Ᵹ, ᵹ
  R: "\uA782", r: "\uA783", // Ꞃ, ꞃ
  S: "\uA784", s: "\uA785", // Ꞅ, ꞅ
  T: "\uA786", t: "\uA787"  // Ꞇ, ꞇ
};

// Reverse mapping for Insular letters back to standard Latin
const reverseInsularChars = {
  "\uA779": "D", "\uA77A": "d",
  "\uA77B": "F", "\uA77C": "f",
  "\uA77D": "G", "\u1D79": "g",
  "\uA782": "R", "\uA783": "r",
  "\uA784": "S", "\uA785": "s",
  "\uA786": "T", "\uA787": "t"
};

/**
 * Lenite consonants followed by 'h' (e.g. bh -> ḃ).
 * Supports both standard modern ṡ and insular ẛ based on useInsularS.
 */
function applyLenition(text, useInsularS = false) {
  const map = useInsularS ? insularReplacements : standardReplacements;
  const regex = /([BCDFGMPSTbcdfgmpst])(h|H)/g;

  return text.replace(regex, (match, letter, h) => {
    return map[letter] || match;
  });
}

/**
 * Replace unlenited letters with their Insular Celtic forms.
 * ALWAYS run after applyLenition so pairs like 'dh' are already 'ḋ'
 * and do not get broken into unlenited insular 'ꝺh'.
 */
function applyInsularLetters(text) {
  const regex = /([DFGRSTdfgrst])/g;
  return text.replace(regex, (match, letter) => {
    return insularChars[letter] || match;
  });
}

/**
 * Replace conjunction 'agus' with Tironian sign ⁊ (\u204A).
 */
function applyTironianSign(text) {
  return text.replace(/\bagus\b/gi, "\u204A");
}

/**
 * Reverse transform: Seanchló -> Modern Roman orthography.
 */
function reverseToModern(text) {
  let result = text;
  // First convert insular characters back to basic Latin
  const insularRegex = new RegExp(Object.keys(reverseInsularChars).join("|"), "g");
  result = result.replace(insularRegex, (match) => reverseInsularChars[match] || match);

  // Then convert lenited characters and Tironian et back to 'h' form
  const lenitedRegex = new RegExp(Object.keys(reverseReplacements).join("|"), "g");
  result = result.replace(lenitedRegex, (match) => reverseReplacements[match] || match);

  return result;
}

/**
 * Main text processing triggered on input or option changes.
 */
function processText() {
  const inputEl = document.getElementById('inputText');
  const resultsEl = document.getElementById('resultsText');
  if (!inputEl || !resultsEl) return;

  adjustTextareaHeight(inputEl);
  const rawText = inputEl.value;

  // Reset state on empty text
  if (!rawText.trim()) {
    resultsEl.innerText = '';
    AppState.lastFartIndex = -1;
    AppState.lastPooIndex = -1;
    AppState.lastPogIndex = -1;
    AppState.lastSeanIndex = -1;
    return;
  }

  const isReverse = document.getElementById('reverseMode')?.checked;
  const useTironian = document.getElementById('tironianAgus')?.checked;
  const useInsular = document.getElementById('copyInsular')?.checked;

  // ss01 carries insular alternates the codepoints cannot express; never in reverse mode.
  resultsEl.classList.toggle('insular', !!useInsular && !isReverse);

  if (isReverse) {
    resultsEl.innerText = reverseToModern(rawText);
    return;
  }

  const lowerTxt = rawText.toLowerCase();

  // Easter Eggs (For the kids / humor)
  const fartIndex = lowerTxt.lastIndexOf('fart');
  if (fartIndex > -1 && fartIndex !== AppState.lastFartIndex) {
    const randomFart = AppState.fartSounds[Math.floor(Math.random() * AppState.fartSounds.length)];
    playSound(randomFart);
    AppState.lastFartIndex = fartIndex;
  }

  const pooIndex = lowerTxt.lastIndexOf('poo');
  if (pooIndex > -1 && pooIndex !== AppState.lastPooIndex) {
    const randomPoo = AppState.fartSounds[Math.floor(Math.random() * AppState.fartSounds.length)];
    playSound(randomPoo);
    AppState.lastPooIndex = pooIndex;
  }

  const pogIndex = lowerTxt.lastIndexOf('póg mo thóin');
  if (pogIndex > -1 && pogIndex !== AppState.lastPogIndex) {
    playSound("pog.mp3");
    AppState.lastPogIndex = pogIndex;
  }

  const seanIndex = lowerTxt.lastIndexOf('seanfhocal');
  if (seanIndex > -1 && seanIndex !== AppState.lastSeanIndex) {
    loadRandomSeanfhocal(); // waits for the JSON if it has not landed yet
    AppState.lastSeanIndex = seanIndex;
    return;
  }

  // Core transformation pipeline:
  // Step 1: Lenition (Ponc séimhithe)
  let processed = applyLenition(rawText, useInsular);

  // Step 2: Tironian sign ⁊ if enabled
  if (useTironian) {
    processed = applyTironianSign(processed);
  }

  // Step 3: Insular letter forms if enabled
  if (useInsular) {
    processed = applyInsularLetters(processed);
  }

  resultsEl.innerText = processed;
}

/**
 * Loads a random Seanfhocal directly into input & displays translation.
 */
function loadRandomSeanfhocal() {
  if (!AppState.seanfhocalData || !AppState.seanfhocalData.irish.length) {
    fetchJSON("js/seanfhocal.json").then(() => {
      displayRandomSeanfhocal();
    });
    return;
  }
  displayRandomSeanfhocal();
}

function displayRandomSeanfhocal() {
  if (!AppState.seanfhocalData) {
    showToast("Níorbh fhéidir na seanfhocail a luchtú.");
    return;
  }

  const irishArr = AppState.seanfhocalData.irish;
  const englishArr = AppState.seanfhocalData.english;
  const randomIndex = Math.floor(Math.random() * irishArr.length);

  const irishProverb = irishArr[randomIndex];
  const englishProverb = englishArr[randomIndex];

  const inputEl = document.getElementById('inputText');
  if (inputEl) {
    inputEl.value = irishProverb;
  }

  processText();

  // Append the English reading under the seanchló
  const resultsEl = document.getElementById('resultsText');
  if (resultsEl) {
    const gloss = document.createElement('span');
    gloss.className = 'result-gloss';
    gloss.lang = 'en';
    gloss.textContent = englishProverb;
    resultsEl.append(gloss);
  }

  showToast("Seanfhocal luchtaithe!");
}

/**
 * Automatically adjust textarea height to fit content.
 */
function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.max(textarea.scrollHeight, 95)}px`;
}

/**
 * Change the display font family.
 */
function changeIrishFont(fontStyle) {
  const resultsEl = document.getElementById('resultsText');
  if (resultsEl) {
    resultsEl.style.fontFamily = `${fontStyle}, serif`;
  }
}

/**
 * Theme. No stored choice means follow the OS, which is what the CSS does on
 * its own; the button pins a side and remembers it.
 */
function resolvedTheme() {
  return document.documentElement.dataset.theme
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function syncThemeButton() {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  const goingTo = resolvedTheme() === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${goingTo} mode`;
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

function toggleTheme() {
  const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('seanchlo_theme', next);
  } catch (e) {}
  syncThemeButton();
}

/**
 * Loader overlay helpers.
 */
function showLoader() {
  const loader = document.getElementById('loaderBox');
  if (loader) loader.hidden = false;
}

function hideLoader() {
  const loader = document.getElementById('loaderBox');
  if (loader) loader.hidden = true;
}

/**
 * Speak Irish using Abair.ie synthetic voices with robust error handling.
 */
function speakIrish() {
  const inputEl = document.getElementById("inputText");
  const txt = inputEl ? inputEl.value.trim() : "";
  if (!txt) {
    showToast("Cuir isteach téacs le heisteacht!");
    return;
  }

  // Stop any currently playing audio
  if (AppState.currentAudio) {
    AppState.currentAudio.pause();
    AppState.currentAudio = null;
  }

  const voiceSelect = document.getElementById('voiceSelect');
  const voice = voiceSelect ? voiceSelect.value : "ga_CO_snc_piper";
  const speakBtn = document.getElementById('speakBtn');

  showLoader();
  if (speakBtn) speakBtn.classList.add('is-playing');

  // Abair API call with 15s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  fetch("https://api.abair.ie/v3/synthesis", {
    method: "POST",
    signal: controller.signal,
    body: JSON.stringify({
      "synthinput": {
        "text": txt
      },
      "voiceparams": {
        "languageCode": "ga-IE",
        "name": voice,
        "ssmlGender": "UNSPECIFIED"
      },
      "audioconfig": {
        "audioEncoding": "LINEAR16",
        "speakingRate": 1,
        "pitch": 1,
        "volumeGainDb": 1
      },
      "outputType": "JSON"
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "accept": "application/json"
    }
  })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Abair API error: ${response.status}`);
      }
      return response.json();
    })
    .then((json) => {
      if (!json || !json.audioContent) {
        throw new Error("Níor aimsíodh fuaim ón API");
      }
      const snd = new Audio("data:audio/wav;base64," + json.audioContent);
      AppState.currentAudio = snd;

      snd.addEventListener("ended", () => {
        hideLoader();
        if (speakBtn) speakBtn.classList.remove('is-playing');
        AppState.currentAudio = null;
      });

      snd.addEventListener("error", () => {
        hideLoader();
        if (speakBtn) speakBtn.classList.remove('is-playing');
        showToast("Earráid le seinm na fuaime.");
      });

      snd.play().catch((e) => {
        console.error("Audio playback error:", e);
        hideLoader();
        if (speakBtn) speakBtn.classList.remove('is-playing');
      });
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.error("Speech synthesis failure:", error);
      hideLoader();
      if (speakBtn) speakBtn.classList.remove('is-playing');
      showToast("Níorbh fhéidir an fhuaim a sheinm faoi láthair.");
    });
}

/**
 * Play an audio sound effect from audio/.
 */
function playSound(file) {
  try {
    const snd = new Audio('audio/' + file);
    snd.play().catch(() => {});
  } catch (e) {
    console.error("Sound play failed", e);
  }
}

/**
 * 1-Click Clipboard Copy with fallback.
 */
function copyResults() {
  const resultsEl = document.getElementById('resultsText');
  const textToCopy = resultsEl ? resultsEl.innerText.trim() : '';

  if (!textToCopy) {
    showToast("Níl aon téacs le cóipeáil!");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("Cóipeáilte! / Copied to clipboard!");
      })
      .catch(() => {
        fallbackCopyText(textToCopy);
      });
  } else {
    fallbackCopyText(textToCopy);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast("Cóipeáilte! / Copied to clipboard!");
  } catch (err) {
    showToast("Níorbh fhéidir cóipeáil go huathoibríoch.");
  }
  document.body.removeChild(textarea);
}

/**
 * Download the converted Seanchló as an authentic Celtic parchment card.
 */
async function downloadAsCard() {
  const resultsEl = document.getElementById('resultsText');
  const text = resultsEl ? resultsEl.innerText.trim() : '';

  if (!text) {
    showToast("Níl aon téacs le híoslódáil!");
    return;
  }

  const selectedFont = document.getElementById('fontStyle')?.value || 'mionw';
  const fontSize = 42;

  // Canvas silently falls back to serif if the face is not loaded yet.
  try {
    await Promise.all([
      document.fonts.load(`${fontSize}px ${selectedFont}`),
      document.fonts.load('24px ardw')
    ]);
  } catch (e) {
    console.warn('Font preload for canvas failed, continuing:', e);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 1000;
  const padding = 60;
  const maxWidth = width - (padding * 2);

  // Measure and wrap text
  ctx.font = `${fontSize}px ${selectedFont}, serif`;

  const words = text.split('\n');
  const lines = [];

  words.forEach(paragraph => {
    const pWords = paragraph.split(' ');
    let currentLine = '';

    pWords.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
  });

  const lineHeight = fontSize * 1.5;
  const contentHeight = Math.max(lines.length * lineHeight + 220, 500);
  canvas.width = width;
  canvas.height = contentHeight;

  // Background Parchment
  const bgGrad = ctx.createLinearGradient(0, 0, width, contentHeight);
  bgGrad.addColorStop(0, '#fbf4e6');
  bgGrad.addColorStop(1, '#f5e8cf');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, contentHeight);

  // Outer Celtic borders
  ctx.strokeStyle = '#c68a2c'; // Gold
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, contentHeight - 40);

  ctx.strokeStyle = '#155e27'; // Celtic green
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, width - 52, contentHeight - 52);

  // Draw Header title
  ctx.font = '24px ardw, serif';
  ctx.fillStyle = '#155e27';
  ctx.textAlign = 'center';
  ctx.fillText('SEANCHLÓ TYPER', width / 2, 68);

  ctx.strokeStyle = '#d4be9f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 80);
  ctx.lineTo(width / 2 + 120, 80);
  ctx.stroke();

  // Render Seanchló text lines
  ctx.font = `${fontSize}px ${selectedFont}, serif`;
  ctx.fillStyle = '#3a2717';
  ctx.textAlign = 'center';

  const startY = 130 + (contentHeight - 200 - (lines.length * lineHeight)) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + (i * lineHeight));
  });

  // Footer / Watermark
  ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#8f7762';
  ctx.textAlign = 'center';
  ctx.fillText('mkeenan-kdb.github.io/seanchlo • IrishApps', width / 2, contentHeight - 38);

  // Trigger download
  const link = document.createElement('a');
  link.download = 'seanchlo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();

  showToast("Íomhá íosluchtaithe!");
}

/**
 * Toast Notification helper.
 */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/**
 * Dismiss the announcement popup and remember in localStorage.
 */
function closePopup() {
  const popup = document.getElementById("popUp");
  if (!popup) return;

  popup.classList.remove('is-open');
  if (AppState.popupTimerInterval) {
    clearInterval(AppState.popupTimerInterval);
    AppState.popupTimerInterval = null;
  }

  setTimeout(() => {
    popup.hidden = true;
  }, 400);

  try {
    localStorage.setItem('seanchlo_popup_closed', '1');
  } catch (e) {}
}

/**
 * Show announcement popup with auto-closing countdown.
 */
function initPopup() {
  try {
    if (localStorage.getItem('seanchlo_popup_closed')) {
      return; // Already seen and dismissed
    }
  } catch (e) {}

  const popup = document.getElementById("popUp");
  const timerEl = document.getElementById("popupTimer");
  if (!popup || !timerEl) return;

  popup.hidden = false;
  requestAnimationFrame(() => popup.classList.add('is-open'));

  let secondsLeft = 10;
  timerEl.innerText = `Closing in ${secondsLeft}`;

  AppState.popupTimerInterval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      closePopup();
    } else {
      timerEl.innerText = `Closing in ${secondsLeft}`;
    }
  }, 1000);
}

/**
 * Fetch and load seanfhocal JSON data.
 */
function fetchJSON(filePath) {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      AppState.seanfhocalData = data;
    })
    .catch(error => {
      console.error("Error loading seanfhocal:", error);
    });
}

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  fetchJSON("js/seanfhocal.json");

  const inputElement = document.getElementById('inputText');
  if (inputElement) {
    inputElement.addEventListener('input', processText);
  }

  // Initial transformation
  processText();

  // Show announcement popup if not dismissed
  initPopup();

  syncThemeButton();
  // Keep the label honest if the OS flips while no choice is pinned.
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', syncThemeButton);
});
