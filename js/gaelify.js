var lastFartIndex = -1;      // Tracks the last position where 'fart' was found
var lastPogIndex = -1;       // Tracks the last position where 'Póg mo thóin' was found
var lastSeanIndex = -1;       // Tracks the last position where 'seanfhocal' was found

// Define the mapping of letters to replacements
const replacements = {
  b: "\u1E03",
  B: "\u1E02",
  c: "\u010B",
  C: "\u010A",
  d: "\u1E0B",
  D: "\u1E0A",
  f: "\u1E1F",
  F: "\u1E1E",
  g: "\u0121",
  G: "\u0120",
  m: "\u1E41",
  M: "\u1E40",
  p: "\u1E57",
  P: "\u1E56",
  s: "\u1E9B",
  S: "\u1E60",
  t: "\u1E6B",
  T: "\u1E6A"
};

// Define the mapping of lenited letters to original letters with 'h'
const reverseReplacements = {
  "\u1E03": "bh",
  "\u1E02": "Bh",
  "\u010B": "ch",
  "\u010A": "Ch",
  "\u1E0B": "dh",
  "\u1E0A": "Dh",
  "\u1E1F": "fh",
  "\u1E1E": "Fh",
  "\u0121": "gh",
  "\u0120": "Gh",
  "\u1E41": "mh",
  "\u1E40": "Mh",
  "\u1E57": "ph",
  "\u1E56": "Ph",
  "\u1E9B": "sh",
  "\u1E60": "Sh",
  "\u1E6B": "th",
  "\u1E6A": "Th"
};

//(⁊\204A )
const insularChars = {
  D: "\uA779",
  d: "\uA77A",
  F: "\uA77B",
  f: "\uA77C",
  G: "\uA77D",
  g: "\uA77F",
  R: "\uA782",
  r: "\uA783",
  S: "\uA784",
  s: "\uA785",
  T: "\uA786",
  t: "\uA787"
}

function replaceWithOriginal(input) {
  // Regex to match any of the lenited characters
  const regex = new RegExp(Object.keys(reverseReplacements).join("|"), "g");

  // Replace matched lenited characters with their corresponding original form
  return input.replace(regex, (match) => reverseReplacements[match] || match);
}

function replaceWithLenition(input) {
  // Regex to match a valid pair of letters and h (case insensitive)
  const regex = /([BCDFGMPSTbcdfgmpst])(H|h)/g;

  // Replace matched patterns with their replacements
  return input.replace(regex, (match, letter, h) => {
    const replacement = replacements[letter];
    return replacement || match; // Use replacement if available, otherwise leave it unchanged
  });
}

function replaceWithInsular(input) {
  // Regex to match a valid pair of letters and h (case insensitive)
  const regex = /([BCDFGMPSTbcdfgmpst])/g;
  // Replace matched patterns with their replacements
  return input.replace(regex, (match, letter, h) => {
    const replacement = insularChars[letter];
    return replacement || match; // Use replacement if available, otherwise leave it unchanged
  });
}

function parseCopyText(e){
  const copyInsular = document.getElementById("copyInsular").checked;
  if(!copyInsular)return;

  const inputText = document.getSelection().toString();
  if(inputText == '')return;
  var processedText = replaceWithOriginal(inputText); //Convert processed text back to original
  //Replace 'agus'
  const regex = /\bagus\b/gi;;
  processedText = processedText.replace(regex, "\u204A");
  processedText = replaceWithInsular(processedText); //Replace insular chars
  processedText = replaceWithLenition(processedText); //Lenite all others
  e.clipboardData.setData("text/plain", processedText); //Push to user's clipboard
  e.preventDefault();
}

function processText() {
  adjustTextareaHeight(document.getElementById('inputText'));
  var rawText = document.getElementById('inputText').value;

  // Reset play states when input is cleared
  if (rawText === '') {
    play = true;
    lastFartIndex = -1;
    lastPogIndex = -1;
    lastSeanIndex = -1;
  }

  var lowerTxt = rawText.toLowerCase();
  // For the kids
  var fartIndex = lowerTxt.lastIndexOf('fart');
  if (fartIndex > -1 && (fartIndex !== lastFartIndex)) {
    playSound("flat.mp3");    // Play fart sound
    lastFartIndex = fartIndex; // Update last position
  }
  var pogIndex = lowerTxt.lastIndexOf('póg mo thóin');
  if (pogIndex > -1 && (pogIndex !== lastPogIndex)) {
    playSound("pog.mp3");     // Play 'Póg mo thóin' sound
    lastPogIndex = pogIndex;  // Update last position
  }

  var seanIndex = lowerTxt.lastIndexOf('seanfhocal');
  if (seanIndex > -1 && (seanIndex !== lastSeanIndex)){
    console.log("Displaying seanfhocal");
    displayRandomSeanfhocal();
    lastSeanIndex = seanIndex;  // Update last position
  }else{
    var processedText = replaceWithLenition(rawText);
    var displayText = document.getElementById('resultsText');
    displayText.innerText = processedText;
  }
}

function displayRandomSeanfhocal() {
  // Ensure seanfhocal data is loaded before attempting to access it
  if (!seanfhocal) {
    console.error('Seanfhocal data is not loaded yet.');
    return;
  }

  // Pick a random index between 0 and the length of the Irish array
  var randomIndex = Math.floor(Math.random() * seanfhocal.irish.length);

  // Get the corresponding Irish and English proverbs
  var irishProverb = seanfhocal.irish[randomIndex];
  var englishProverb = seanfhocal.english[randomIndex];

  // Display the Irish proverb and English translation
  var displayText = document.getElementById('resultsText');
  displayText.innerHTML = `${irishProverb}<br><br>"${englishProverb}"`;
}

function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto'; // Reset height to calculate correct scroll height
  textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
}

function changeIrishFont(fontStyle) {
  console.log(fontStyle)
  document.getElementById('resultsText').style.fontFamily = fontStyle;
}

function showLoader() {
  document.querySelector('.loader-box').style.display = 'flex';
}

function hideLoader() {
  document.querySelector('.loader-box').style.display = 'none';
}

function speakIrish(elem) {
  console.log(elem);
  var txt = document.getElementById("inputText").value;
  if ('' == txt) return;
  var voice = document.getElementById('voiceSelect').value;
  showLoader();
  console.log("Speaking: ", txt);
  fetch("https://api.abair.ie/v3/synthesis", {
    method: "POST",
    body: JSON.stringify({
      "synthinput": {
        "text": txt,
        "ssml": "string"
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
        "volumeGainDb": 1,
        "htsParams": "string",
        "sampleRateHertz": 0,
        "effectsProfileId": []
      },
      "outputType": "JSON"
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "accept": "application/json"
    }
  }).then((response) => {
    return response.json();
  }).then((json) => {
    var aud = json.audioContent;
    var snd = new Audio("data:audio/mp3;base64," + aud);
    snd.addEventListener("ended", (event) => {
      console.log("Audio finished playing!");
      hideLoader();
    });
    snd.play();
  });
}

function playSound(file) {
  var snd = new Audio('img/' + file);
  snd.play();
}

// Function to fetch and load JSON
function fetchJSON(filePath) {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Parse the JSON
    })
    .then(data => {
      console.log("Loaded JSON:", data); // Log to verify
      seanfhocal = data; // Store the JSON data globally
    })
    .catch(error => {
      console.error("Error loading JSON:", error);
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function showPopup() {
  console.log('Start');
  document.getElementById("popUp").style.opacity = 1;
  const timep = document.getElementById("popupTimer");
  const duration = 10000; // Total duration in milliseconds
  const interval = 1000; // Log interval in milliseconds
  const steps = duration / interval;
  for (let i = 1; i <= steps; i++) {
    timep.innerText = `Closing in: ${1+steps-i}`;
    await sleep(interval); // Wait for 0.1 seconds (100 ms) in each step
  }
  console.log('End');
  document.getElementById("popUp").style.opacity = 0;
}

(function() {
  fetchJSON("js/seanfhocal.json");
  //====Input events ====//
  const inputElement = document.getElementById('inputText');
  inputElement.addEventListener('input', processText);
  //====Output events ====//
  const targetElement = document.getElementById('resultsText');
  targetElement.addEventListener("copy", parseCopyText);
  processText();
  showPopup();
})()
