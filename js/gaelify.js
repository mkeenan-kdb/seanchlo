var play = true;

function replaceWithLenition(input) {
  // Define the mapping of letters to replacements
  const replacements = {
    b: "\u1E03", B: "\u1E02",
    c: "\u010B", C: "\u010A",
    d: "\u1E0B", D: "\u1E0A",
    f: "\u1E1F", F: "\u1E1E",
    g: "\u0121", G: "\u0120",
    m: "\u1E41", M: "\u1E40",
    p: "\u1E57", P: "\u1E56",
    s: "\u1E9B", S: "\u1E60",
    t: "\u1E6B", T: "\u1E6A"
  };

  // Regex to match a valid pair of letters and h (case insensitive)
  const regex = /([BCDFGMPSTbcdfgmpst])(H|h)/g;

  // Replace matched patterns with their replacements
  return input.replace(regex, (match, letter, h) => {
    const replacement = replacements[letter];
    return replacement || match; // Use replacement if available, otherwise leave it unchanged
  });
}

function processText(){
  adjustTextareaHeight(document.getElementById('inputText'));
  var rawText = document.getElementById('inputText').value;
  //Children request start
  if(rawText=='')play=true;
  var s = rawText.toLocaleLowerCase().search('fart');
  if((s>-1)&&play)playSound("flat.mp3");
  //Children request end
  var processedText = replaceWithLenition(rawText);
  var displayText = document.getElementById('resultsText');
  resultsText.innerText = processedText;
}

function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto'; // Reset height to calculate correct scroll height
  textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
}

function changeIrishFont(fontStyle){
  console.log(fontStyle)
  document.getElementById('resultsText').style.fontFamily = fontStyle;
}

function showLoader(){
  document.querySelector('.loader-box').style.display = 'flex';
}

function hideLoader(){
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

function playSound(file){
  play = false;
  var snd = new Audio('img/'+file);
  snd.play();
}

(function(){
  document.getElementById('inputText').addEventListener('keyup', processText);
  processText();
})()
