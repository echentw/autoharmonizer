window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var musicBuffer = null;

window.onload = function() {
  audioContext = new AudioContext();

  loadMusic('./music/find_your_soul.mp3');
}

function toggleLiveInput() {
  // TODO: implement me!
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

