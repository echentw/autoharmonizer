var musicBuffer = null;
var musicSourceNode = null;

var buttonElem = document.querySelector('.playMusicButton').childNodes[0];

var isPlayingMusic = false;


window.addEventListener('load', function() {
  loadMusic('./music/find_your_soul.mp3');
});

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
    buttonElem.textContent = "Play";
  } else {
    musicSourceNode = audioContext.createBufferSource();
    musicSourceNode.buffer = musicBuffer;
    musicSourceNode.loop = true;
    musicSourceNode.connect(audioContext.destination);
    musicSourceNode.start(0);
    buttonElem.textContent = "Stop";
  }
  isPlayingMusic = !isPlayingMusic;
}

