window.AudioContext = window.AudioContext || window.webkitAudioContext;

var sourceNode = null;

function toggleMatchPitch() {
  sourceNode = audioContext.createOscillator();
  sourceNode.connect(audioContext.destination);
  sourceNode.start(0);
  getUserMedia({
    "audio": {
      "mandatory": {
        "googEchoCancellation": "false",
        "googAutoGainControl": "false",
        "googNoiseSuppression": "false",
        "googHighpassFilter": "false"
      },
      "optional": []
    },
  }, matchGotStream);
}

function matchGotStream(stream) {
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);
  analyzerNode = audioContext.createAnalyser();
  mediaStreamSource.connect(analyzerNode);
  matchPitch();
}

function matchPitch() {
  analyzerNode.getFloatTimeDomainData(buf);
  pitch.input(buf);
  pitch.process();
  var tone = pitch.findTone();

  var freq = 0;
  if (tone &&
      tone.db > DB_THRESH &&
      tone.freq > FREQ_MIN &&
      tone.freq < FREQ_MAX) {
    freq = Math.round(tone.freq);
  }
  rawFreqElem.textContent = freq;
  freqs.push(freq);
  freqs.shift();
  var fundFreq = extractFundamentalFrequency(freqs);
  frequencyElem.textContent = Math.round(fundFreq);

  var note = getNoteFromFreq(refNote, calibratedFreq, fundFreq);
  noteElem.textContent = note;

  var adjustedFreq = getFreqFromNote(refNote, calibratedFreq, note);
  if (!adjustedFreq) {
    adjustedFreq = 0;
  }
  
  sourceNode.frequency.value = adjustedFreq;

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(matchPitch);
}

