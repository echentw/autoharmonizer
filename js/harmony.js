var harmonySource = null;

var harmonyElem = document.querySelector('.harmony').childNodes[0];

var doHarmonize = false;

function toggleHarmonizePitch() {
  doHarmonize = !doHarmonize;
  if (doHarmonize) {
    harmonySource = audioContext.createOscillator();
    harmonySource.connect(audioContext.destination);
    harmonySource.frequency.value = 0;
    harmonySource.start(0);

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
    }, harmonizeGotStream);
  }
}

function harmonizeGotStream(stream) {
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);
  analyzerNode = audioContext.createAnalyser();
  mediaStreamSource.connect(analyzerNode);
  harmonizePitch();
}

function harmonizePitch() {
  if (!doHarmonize) {
    harmonySource.stop(0);
    rawFreqElem.textContent = 0;
    frequencyElem.textContent = 0;
    harmonyElem.textContent = 0;
    noteElem.textContent = "--";
    return;
  }
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

  var harmony = Math.round(adjustedFreq * Math.pow(a, 4));
  harmonyElem.textContent = harmony;
  harmonySource.frequency.value = harmony;

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(harmonizePitch);
}

