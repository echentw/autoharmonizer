window.AudioContext = window.AudioContext || window.webkitAudioContext;

var DB_THRESH = -20.0;
var FREQ_MIN = 20;
var FREQ_MAX = 1000;

var audioContext = null;
var pitch = null;
var analyzerNode = null;
var buf = new Float32Array(1024);

var musicBuffer = null;

var frequencyElem = document.querySelector('.frequency').childNodes[0];


window.onload = function() {
  audioContext = new AudioContext();
  pitch = new PitchAnalyzer(44100);
  loadMusic('./music/find_your_soul.mp3');
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

  if (tone) {
    if (tone.db > DB_THRESH &&
        tone.freq > FREQ_MIN &&
        tone.freq < FREQ_MAX) {
      frequencyElem.textContent = Math.round(tone.freq);
    }
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
  var source = audioContext.createBufferSource();
  source.buffer = musicBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}

