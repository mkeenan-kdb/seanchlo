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
(function(){
  document.getElementById('inputText').addEventListener('keyup', processText);
  processText();
})()
