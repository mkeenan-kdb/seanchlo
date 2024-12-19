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

function replaceWithLenition(input) {
  // Regex to match a valid pair of letters and h (case insensitive)
  const regex = /([BCDFGMPSTbcdfgmpst])(H|h)/g;

  // Replace matched patterns with their replacements
  return input.replace(regex, (match, letter, h) => {
    const replacement = replacements[letter];
    return replacement || match; // Use replacement if available, otherwise leave it unchanged
  });
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

(function() {
  fetchJSON("js/seanfhocal.json");
  const targetElement = document.getElementById('inputText');
  //Trigger 'processText' when someone is typing, or pasting
  targetElement.addEventListener('input', processText);
  processText();
})()
