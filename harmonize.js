window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var musicBuffer = null;

window.onload = function() {
  audioContext = new AudioContext();
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
  mediaStreamSource.connect(audioContext.destination);
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

