window.AudioContext = window.AudioContext || window.webkitAudioContext;

var DB_THRESH = -20.0;
var FREQ_MIN = 60;
var FREQ_MAX = 800;

var audioContext = null;
var analyzerNode = null;
var buf = new Float32Array(1024);
var pitch = null;

var rawFreqElem = document.querySelector('.rawFreq').childNodes[0];
var frequencyElem = document.querySelector('.frequency').childNodes[0];
var noteElem = document.querySelector('.note').childNodes[0];

var refNote = 50;

var freqs = [];
for (var i = 0; i < 20; ++i) {
  freqs.push(0);
}


window.addEventListener('load', function() {
  audioContext = new AudioContext();
  pitch = new PitchAnalyzer(44100);
});

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
  noteElem.textContent = getNoteFromFreq(refNote, calibratedFreq, fundFreq);

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(getPitch);
}

function error() {
  alert('Stream generation failed.');
}

