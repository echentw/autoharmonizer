window.AudioContext = window.AudioContext || window.webkitAudioContext;

var DB_THRESH = -20.0;
var FREQ_MIN = 60;
var FREQ_MAX = 800;
var CALIBRATE_TIME = 300;

var audioContext = null;
var analyzerNode = null;
var buf = new Float32Array(1024);
var pitch = null;

var musicBuffer = null;
var musicSourceNode = null;
var isPlayingMusic = false;

var frequencyElem = document.querySelector('.frequency').childNodes[0];
var calibrateElem = document.querySelector('.calibrate').childNodes[0];
var noteElem = document.querySelector('.note').childNodes[0];

var calibrateFreqs = [];
var calibrate = false;
var calibrateCountdown = CALIBRATE_TIME;
var calibratedFreq = null;

var refNote = 50;


window.addEventListener('load', function() {
  audioContext = new AudioContext();
  pitch = new PitchAnalyzer(44100);
  loadMusic('./music/find_your_soul.mp3');
});

function toggleCalibrate() {
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
  }, gotCalibrateStream);
}

function gotCalibrateStream(stream) {
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);
  analyzerNode = audioContext.createAnalyser();
  mediaStreamSource.connect(analyzerNode);
  calibratePitch();
}

function calibratePitch() {
  calibrateCountdown--;
  calibrateElem.textContent = calibrateCountdown;
  if (calibrateCountdown < 0) {
    calibrateCountdown = CALIBRATE_TIME;
    calibratedFreq = extractDominantFrequency(calibrateFreqs);
    calibrateElem.textContent =
        "Calibrated frequency: " + Math.round(calibratedFreq) + " Hz";
    return;
  }
  analyzerNode.getFloatTimeDomainData(buf);
  pitch.input(buf);
  pitch.process();
  var tone = pitch.findTone();

  if (tone &&
      tone.db > DB_THRESH &&
      tone.freq > FREQ_MIN &&
      tone.freq < FREQ_MAX) {
    frequencyElem.textContent = Math.round(tone.freq);
    calibrateFreqs.push(tone.freq);
  } else {
    frequencyElem.textContent = 0;
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(calibratePitch);
}

function toggleLiveInput() {
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
  }, gotStream);
}

function getUserMedia(dictionary, callback) {
  try {
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia;
    navigator.getUserMedia(dictionary, callback, error);
  } catch(e) {
    alert('getUserMedia threw exception :' + e);
  }
}

function gotStream(stream) {
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);
  analyzerNode = audioContext.createAnalyser();
  mediaStreamSource.connect(analyzerNode);
  getPitch();
}

function getPitch() {
  analyzerNode.getFloatTimeDomainData(buf);
  pitch.input(buf);
  pitch.process();
  var tone = pitch.findTone();

  if (tone &&
      tone.db > DB_THRESH &&
      tone.freq > FREQ_MIN &&
      tone.freq < FREQ_MAX) {
    frequencyElem.textContent = Math.round(tone.freq);
    noteElem.textContent =
        "Your note: " + getNoteFromFreq(refNote, calibratedFreq, tone.freq);
  } else {
    frequencyElem.textContent = 0;
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(getPitch);
}

function error() {
  alert('Stream generation failed.');
}

function loadMusic(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      musicBuffer = buffer;
    });
  }
  request.send();
}

function togglePlayMusic() {
  if (isPlayingMusic) {
    musicSourceNode.stop(0);
  } else {
    musicSourceNode = audioContext.createBufferSource();
    musicSourceNode.buffer = musicBuffer;
    musicSourceNode.connect(audioContext.destination);
    musicSourceNode.start(0);
  }
  isPlayingMusic = !isPlayingMusic;
}
