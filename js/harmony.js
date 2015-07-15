var harmonySource = null;

var harmonyElem = document.querySelector('.harmony').childNodes[0];

var doHarmonize = false;

notes = [];
for (var i = 0; i < 14; ++i) {
  notes.push(0);
}

function toggleHarmonizePitch() {
  doHarmonize = !doHarmonize;
  if (doHarmonize) {
    initializeNotes();

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

  var harmony = Math.round(getHarmonyFrequency(fundFreq));
  harmonyElem.textContent = harmony;
  harmonySource.frequency.value = harmony;

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(harmonizePitch);
}

function initializeNotes() {
  notes[0] = calibratedFreq;
  notes[1] = notes[0] * Math.pow(a, 2);
  notes[2] = notes[0] * Math.pow(a, 4);
  notes[3] = notes[0] * Math.pow(a, 5);
  notes[4] = notes[0] * Math.pow(a, 7);
  notes[5] = notes[0] * Math.pow(a, 9);
  notes[6] = notes[0] * Math.pow(a, 11);
  notes[7] = notes[0] * 2;
  notes[8] = notes[7] * Math.pow(a, 2);
  notes[9] = notes[7] * Math.pow(a, 4);
  notes[10] = notes[7] * Math.pow(a, 5);
  notes[11] = notes[7] * Math.pow(a, 7);
  notes[12] = notes[7] * Math.pow(a, 9);
  notes[13] = notes[7] * Math.pow(a, 11);
}

function getHarmonyFrequency(frequency) {
  // find which range the frequency is
  var factor = 1.0;
  while (frequency * factor < notes[0] * 0.99) {
    factor *= 2;
  }
  while (frequency * factor > notes[12] * 1.01) {
    factor /= 2;
  }
  var scaledFreq = frequency * factor;

  // put scaled Freq into a white note class
  var lowId = -1;
  for (var i = 0; i < 14; ++i) {
    if (scaledFreq > notes[i] && scaledFreq < notes[i + 1]) {
      lowId = i;
      break;
    }
  }
  var whiteNoteClass = 0;
  if (lowId != -1) {
    var geoMean = Math.sqrt(notes[lowId] * notes[lowId+1]);
    if (scaledFreq / notes[lowId] < notes[lowId + 1] / scaledFreq) {
      whiteNoteClass = lowId;
    } else {
      whiteNoteClass = lowId + 1;
    }
  }

  // convert back to frequency
  var harmonyFreq = notes[whiteNoteClass] / factor;
  console.log(harmonyFreq);
  if (whiteNoteClass % 7 == 0 ||
      whiteNoteClass % 7 == 3) {
    harmonyFreq *= Math.pow(a, 4);
  } else if (whiteNoteClass % 7 == 1 ||
             whiteNoteClass % 7 == 2 ||
             whiteNoteClass % 7 == 5 ||
             whiteNoteClass % 7 == 6) {
    harmonyFreq *= Math.pow(a, 3);
  } else {
    harmonyFreq *= Math.pow(a, 5);
  }
  return harmonyFreq;
}

